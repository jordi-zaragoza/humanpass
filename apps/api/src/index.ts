import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import type { Env } from "./env.js";
import auth from "./routes/auth.js";
import links from "./routes/links.js";
import { homePage } from "./pages/home.js";
import { appPage, authPage } from "./pages/app.js";
import { verifyPage, verifyNotFoundPage } from "./pages/verify.js";
import { privacyPage } from "./pages/privacy.js";
import { getLinksByUserId, getLinkByShortCode, createLink } from "./db/queries.js";
import { SESSION_COOKIE_NAME, SHORT_CODE_LENGTH } from "./constants.js";
import type { SessionData } from "./types.js";
import { nanoid } from "nanoid";

const app = new Hono<{ Bindings: Env }>();

function getOrigin(c: { req: { header: (name: string) => string | undefined } }) {
  const host = c.req.header("host") ?? "localhost:8787";
  const proto = host.split(":")[0] === "localhost" ? "http" : "https";
  return `${proto}://${host}`;
}

// CORS: reject cross-origin API requests
app.use("/api/*", async (c, next) => {
  const origin = c.req.header("origin");
  const expected = getOrigin(c);
  // Allow requests with no Origin header (same-origin navigations, curl)
  // Reject requests from different origins
  if (origin && origin !== expected) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});

// --- API routes ---
app.route("/api/v1/auth", auth);
app.route("/api/v1/links", links);

// Sync: server writes sync data when phone hits /app?sync=TOKEN (see below).
// Computer polls this to get the link.
app.get("/api/v1/sync/:token", async (c) => {
  const syncToken = c.req.param("token");
  if (syncToken.length < 32) {
    return c.json({ error: "Invalid sync token" }, 400);
  }
  const data = await c.env.KV.get(`sync:${syncToken}`, "json");
  if (!data) {
    return c.json({ ready: false });
  }
  return c.json({ ready: true, ...(data as Record<string, unknown>) });
});

// --- Pages ---

// Landing page
app.get("/", (c) => {
  return c.html(homePage());
});

// Privacy policy
app.get("/privacy", (c) => {
  return c.html(privacyPage());
});

// Dashboard (auth required)
app.get("/app", async (c) => {
  const syncToken = c.req.query("sync");

  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    return c.html(authPage(syncToken));
  }

  const data = await c.env.KV.get(`session:${token}`, "json");
  if (!data) {
    return c.html(authPage(syncToken));
  }

  const { userId } = data as SessionData;
  const origin = getOrigin(c);

  // Auto-generate one link per session
  let userLinks = await getLinksByUserId(c.env.DB, userId);
  if (userLinks.length === 0) {
    const shortCode = nanoid(SHORT_CODE_LENGTH);
    const id = crypto.randomUUID();
    const link = await createLink(c.env.DB, { id, user_id: userId, short_code: shortCode });
    userLinks = [link];
  }

  const link = userLinks[0];
  const url = `${origin}/v/${link.short_code}`;

  // If opened from QR (sync token), send the link back to the computer
  if (syncToken) {
    await c.env.KV.put(`sync:${syncToken}`, JSON.stringify({
      url, shortCode: link.short_code, createdAt: link.created_at,
    }), { expirationTtl: 300 });
  }

  return c.html(appPage(url, syncToken));
});

// Signed verification API
app.get("/api/v1/verify/:code", async (c) => {
  const code = c.req.param("code");
  const link = await getLinkByShortCode(c.env.DB, code);

  if (!link) {
    return c.json({ verified: false });
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(c.env.VERIFY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const data = encoder.encode(`${link.short_code}:${link.created_at}`);
  const sigBuf = await crypto.subtle.sign("HMAC", key, data);
  const signature = [...new Uint8Array(sigBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return c.json({
    verified: true,
    shortCode: link.short_code,
    createdAt: link.created_at,
    signature,
  });
});

// Verification page (public)
app.get("/v/:code", async (c) => {
  const code = c.req.param("code");
  const link = await getLinkByShortCode(c.env.DB, code);

  if (!link) {
    return c.html(verifyNotFoundPage(), 404);
  }

  return c.html(verifyPage(link, getOrigin(c)));
});

export default app;
