import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import type { Env } from "./env.js";
import auth from "./routes/auth.js";
import links from "./routes/links.js";
import { homePage } from "./pages/home.js";
import { appPage, authPage } from "./pages/app.js";
import { verifyPage, verifyFraudPage, verifyNotFoundPage } from "./pages/verify.js";
import { privacyPage } from "./pages/privacy.js";
import { developersPage } from "./pages/developers.js";
import { popupPage } from "./pages/popup.js";
import { adminPage } from "./pages/admin.js";
import type { AdminStats } from "./pages/admin.js";
import { getLinkByShortCode, getLinksByUserId, createLink, seedForumData } from "./db/queries.js";
import { forumPage } from "./pages/forum.js";
import { SESSION_COOKIE_NAME, LINK_TTL_SECONDS } from "./constants.js";
import type { SessionData } from "./types.js";
import { nanoid } from "nanoid";
import { getOrigin } from "./utils.js";

const app = new Hono<{ Bindings: Env }>();

/** Check if a link has been visited from multiple origins (fraud signal).
 *  Returns "ok" | "fraud". Skips check when there's no Referer. */
async function checkRefererFraud(kv: Env["KV"], shortCode: string, referer: string | undefined): Promise<"ok" | "fraud"> {
  if (!referer) return "ok";
  let refOrigin: string;
  try { refOrigin = new URL(referer).origin; } catch { return "ok"; }

  const key = `link-ref:${shortCode}`;
  const stored = await kv.get(key);
  if (!stored) {
    // First visit with a Referer — store it (auto-expires with link TTL)
    await kv.put(key, refOrigin, { expirationTtl: 300 });
    return "ok";
  }
  return stored === refOrigin ? "ok" : "fraud";
}

// CORS: public verify + sync endpoints are open to any origin
for (const path of ["/api/v1/verify/*", "/api/v1/sync/*"]) {
  app.use(path, async (c, next) => {
    const origin = c.req.header("origin");
    if (c.req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    await next();
    if (origin) {
      c.header("Access-Control-Allow-Origin", origin);
    }
  });
}

// CORS: reject cross-origin for everything else
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/v1/verify/") || c.req.path.startsWith("/api/v1/sync/")) {
    return next();
  }
  const origin = c.req.header("origin");
  const expected = getOrigin(c);
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
  const data = await c.env.KV.get(`sync:${syncToken}`, "json") as Record<string, unknown> | null;
  if (!data) {
    return c.json({ ready: false });
  }
  if (data.scanned && !data.url) {
    return c.json({ ready: false, scanned: true });
  }
  return c.json({ ready: true, ...data });
});

// Stats
app.get("/api/v1/stats", async (c) => {
  const row = await c.env.DB.prepare("SELECT COUNT(*) as count FROM links").first();
  return c.json({ verifications: row?.count ?? 0 });
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

// Developers
app.get("/developers", (c) => {
  return c.html(developersPage());
});

// Admin dashboard
app.get("/admin", async (c) => {
  if (c.req.query("token") !== c.env.ADMIN_TOKEN) {
    return c.text("Unauthorized", 401);
  }

  const db = c.env.DB;
  const [totalUsers, totalCredentials, totalLinks, newUsers24h, newLinks24h, linksByDay, topUsers] =
    await Promise.all([
      db.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM credentials").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM links").first<{ count: number }>(),
      db
        .prepare("SELECT COUNT(*) as count FROM users WHERE created_at > datetime('now', '-1 day')")
        .first<{ count: number }>(),
      db
        .prepare("SELECT COUNT(*) as count FROM links WHERE created_at > datetime('now', '-1 day')")
        .first<{ count: number }>(),
      db
        .prepare(
          "SELECT date(created_at) as day, COUNT(*) as count FROM links WHERE created_at > datetime('now', '-7 days') GROUP BY day ORDER BY day DESC"
        )
        .all<{ day: string; count: number }>(),
      db
        .prepare(
          "SELECT user_id, COUNT(*) as link_count FROM links GROUP BY user_id ORDER BY link_count DESC LIMIT 10"
        )
        .all<{ user_id: string; link_count: number }>(),
    ]);

  const stats: AdminStats = {
    totalUsers: totalUsers?.count ?? 0,
    totalCredentials: totalCredentials?.count ?? 0,
    totalLinks: totalLinks?.count ?? 0,
    newUsers24h: newUsers24h?.count ?? 0,
    newLinks24h: newLinks24h?.count ?? 0,
    linksByDay: linksByDay.results,
    topUsers: topUsers.results,
  };

  return c.html(adminPage(stats));
});

// Forum demo
app.get("/forum", async (c) => {
  const origin = getOrigin(c);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`;
  const timePart = `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
  await seedForumData(c.env.DB, datePart, timePart);
  const codes = {
    dave: `${datePart}-${timePart}-dv93`,
    xena: `${datePart}-${timePart}-xn42`,
    sk8r: `${datePart}-${timePart}-sk8r`,
    linda: `${datePart}-${timePart}-lnda`,
  };
  return c.html(forumPage(origin, codes));
});

// Popup verification (opened by SDK)
app.get("/verify/popup", (c) => {
  return c.html(popupPage());
});

// JavaScript SDK
app.get("/sdk.js", (c) => {
  c.header("Content-Type", "application/javascript");
  c.header("Cache-Control", "public, max-age=300");
  const origin = getOrigin(c);
  return c.body(`(function(){
  "use strict";
  var HP = {};
  HP.verify = function(opts) {
    opts = opts || {};
    return new Promise(function(resolve, reject) {
      var w = 420, h = 520;
      var left = (screen.width - w) / 2;
      var top = (screen.height - h) / 2;
      var url = "${origin}/verify/popup";
      if (opts.label) url += "?label=" + encodeURIComponent(opts.label);
      var popup = window.open(
        url,
        "humanpass",
        "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top + ",scrollbars=no,resizable=no"
      );
      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }
      var done = false;
      function onMessage(e) {
        if (e.source !== popup || e.origin !== "${origin}") return;
        done = true;
        cleanup();
        resolve(e.data);
      }
      var timer = setInterval(function() {
        if (popup.closed && !done) {
          done = true;
          cleanup();
          reject(new Error("Verification cancelled."));
        }
      }, 500);
      function cleanup() {
        window.removeEventListener("message", onMessage);
        clearInterval(timer);
      }
      window.addEventListener("message", onMessage);
    });
  };
  window.Humanpass = HP;
})();`);
});

// Dashboard (auth required)
app.get("/app", async (c) => {
  const syncToken = c.req.query("sync");

  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    if (syncToken) await c.env.KV.put(`sync:${syncToken}`, JSON.stringify({ scanned: true }), { expirationTtl: 300 });
    return c.html(authPage(syncToken));
  }

  const data = await c.env.KV.get(`session:${token}`, "json");
  if (!data) {
    if (syncToken) await c.env.KV.put(`sync:${syncToken}`, JSON.stringify({ scanned: true }), { expirationTtl: 300 });
    return c.html(authPage(syncToken));
  }

  const { userId } = data as SessionData;
  const origin = getOrigin(c);

  // Reuse existing link if it hasn't expired yet
  const existing = await getLinksByUserId(c.env.DB, userId, 1);
  let link;
  if (existing.length > 0) {
    const age = (Date.now() - new Date(existing[0].created_at).getTime()) / 1000;
    if (age < LINK_TTL_SECONDS) {
      link = existing[0];
    }
  }
  if (!link) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datePart = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`;
    const timePart = `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
    const shortCode = `${datePart}-${timePart}-${nanoid(4)}`;
    const id = crypto.randomUUID();
    link = await createLink(c.env.DB, { id, user_id: userId, short_code: shortCode });
  }
  const url = `${origin}/v/${link.short_code}`;

  // If opened from QR (sync token), send the link back to the computer
  if (syncToken) {
    await c.env.KV.put(`sync:${syncToken}`, JSON.stringify({
      url, shortCode: link.short_code, createdAt: link.created_at,
    }), { expirationTtl: 300 });
  }

  return c.html(appPage(url, link.short_code, link.label, link.created_at, syncToken));
});

// Signed verification API
app.get("/api/v1/verify/:code", async (c) => {
  const code = c.req.param("code");
  const link = await getLinkByShortCode(c.env.DB, code);

  if (!link) {
    return c.json({ verified: false });
  }

  const fraud = await checkRefererFraud(c.env.KV, link.short_code, c.req.header("referer"));
  if (fraud === "fraud") {
    return c.json({ verified: false, fraud: true });
  }

  // Optional label check: if ?label= is provided, verify it matches
  const expectedLabel = c.req.query("label");
  if (expectedLabel && link.label !== expectedLabel) {
    return c.json({ verified: false, labelMismatch: true });
  }

  return c.json({
    verified: true,
    shortCode: link.short_code,
    createdAt: link.created_at,
    ...(link.label ? { label: link.label } : {}),
  });
});

// Verification page (public)
app.get("/v/:code", async (c) => {
  const code = c.req.param("code");
  const link = await getLinkByShortCode(c.env.DB, code);

  if (!link) {
    return c.html(verifyNotFoundPage(), 404);
  }

  const fraud = await checkRefererFraud(c.env.KV, link.short_code, c.req.header("referer"));
  if (fraud === "fraud") {
    return c.html(verifyFraudPage(), 403);
  }

  return c.html(verifyPage(link, getOrigin(c)));
});

export default app;
