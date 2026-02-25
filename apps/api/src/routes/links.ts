import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../env.js";
import { createLink, getLinksByUserId, updateLinkLabel } from "../db/queries.js";
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

  // Parse body early (needed for label + syncToken)
  const body = await c.req.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.slice(0, 100).trim() || undefined : undefined;

  // Reuse existing link only if it hasn't expired
  const existing = await getLinksByUserId(c.env.DB, userId, 1);
  if (existing.length > 0) {
    const age = (Date.now() - new Date(existing[0].created_at).getTime()) / 1000;
    if (age < LINK_TTL_SECONDS) {
      // Update label if provided and different
      if (label && existing[0].label !== label) {
        await updateLinkLabel(c.env.DB, existing[0].short_code, userId, label);
        existing[0].label = label;
      }
      const url = `${origin}/v/${existing[0].short_code}`;
      return c.json({ url, shortCode: existing[0].short_code, createdAt: existing[0].created_at, ...(existing[0].label ? { label: existing[0].label } : {}) });
    }
  }

  // Create new link (existing expired or none)
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`;
  const timePart = `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
  const shortCode = `${datePart}-${timePart}-${nanoid(4)}`;
  const id = crypto.randomUUID();
  const link = await createLink(c.env.DB, { id, user_id: userId, short_code: shortCode, label });
  const url = `${origin}/v/${link.short_code}`;
  if (body.syncToken && typeof body.syncToken === "string" && body.syncToken.length >= 32) {
    await c.env.KV.put(`sync:${body.syncToken}`, JSON.stringify({
      url, shortCode: link.short_code, createdAt: link.created_at,
    }), { expirationTtl: 300 });
  }

  return c.json({ url, shortCode: link.short_code, createdAt: link.created_at, ...(link.label ? { label: link.label } : {}) });
});

links.patch("/:code", async (c) => {
  const userId = c.get("userId");
  const code = c.req.param("code");
  const body = await c.req.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.slice(0, 100).trim() : null;
  const updated = await updateLinkLabel(c.env.DB, code, userId, label || null);
  if (!updated) {
    return c.json({ error: "Link not found or not yours" }, 404);
  }
  return c.json({ ok: true, label });
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
