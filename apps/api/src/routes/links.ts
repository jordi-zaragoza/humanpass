import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../env.js";
import { createLink, getLinksByUserId } from "../db/queries.js";
import { sessionAuth } from "../middleware/session.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { getOrigin } from "../utils.js";
import { LINK_TTL_SECONDS } from "../constants.js";

type LinksEnv = {
  Bindings: Env;
  Variables: { userId: string };
};

const links = new Hono<LinksEnv>();

links.use("/*", sessionAuth);

const linkLimit = rateLimit({ max: 30, windowSecs: 3600, prefix: "links" }); // 30/hour

links.post("/", linkLimit, async (c) => {
  const userId = c.get("userId");
  const origin = getOrigin(c);

  // Reuse existing link only if it hasn't expired
  const existing = await getLinksByUserId(c.env.DB, userId, 1);
  if (existing.length > 0) {
    const age = (Date.now() - new Date(existing[0].created_at).getTime()) / 1000;
    if (age < LINK_TTL_SECONDS) {
      const url = `${origin}/v/${existing[0].short_code}`;
      return c.json({ url, shortCode: existing[0].short_code, createdAt: existing[0].created_at });
    }
  }

  // Create new link (existing expired or none)
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`;
  const timePart = `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
  const shortCode = `${datePart}-${timePart}-${nanoid(4)}`;
  const id = crypto.randomUUID();
  const link = await createLink(c.env.DB, { id, user_id: userId, short_code: shortCode });
  const url = `${origin}/v/${link.short_code}`;

  // Update sync KV if syncToken provided (extension flow)
  const body = await c.req.json().catch(() => ({}));
  if (body.syncToken && typeof body.syncToken === "string" && body.syncToken.length >= 32) {
    await c.env.KV.put(`sync:${body.syncToken}`, JSON.stringify({
      url, shortCode: link.short_code, createdAt: link.created_at,
    }), { expirationTtl: 300 });
  }

  return c.json({ url, shortCode: link.short_code, createdAt: link.created_at });
});

links.get("/", async (c) => {
  const userId = c.get("userId");
  const userLinks = await getLinksByUserId(c.env.DB, userId);
  const origin = getOrigin(c);
  return c.json(
    userLinks.map((l) => ({
      url: `${origin}/v/${l.short_code}`,
      shortCode: l.short_code,
      createdAt: l.created_at,
    }))
  );
});

export default links;
