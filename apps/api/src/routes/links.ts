import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../env.js";
import { createLink, getLinksByUserId } from "../db/queries.js";
import { sessionAuth } from "../middleware/session.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { SHORT_CODE_LENGTH } from "../constants.js";
import { getOrigin } from "../utils.js";

type LinksEnv = {
  Bindings: Env;
  Variables: { userId: string };
};

const links = new Hono<LinksEnv>();

links.use("/*", sessionAuth);

const linkLimit = rateLimit({ max: 30, windowSecs: 3600, prefix: "links" }); // 30/hour

links.post("/", linkLimit, async (c) => {
  const userId = c.get("userId");

  // Return existing link if user already has one
  const existing = await getLinksByUserId(c.env.DB, userId, 1);
  const origin = getOrigin(c);

  if (existing.length > 0) {
    const url = `${origin}/v/${existing[0].short_code}`;
    return c.json({ url, shortCode: existing[0].short_code, createdAt: existing[0].created_at });
  }

  const shortCode = nanoid(SHORT_CODE_LENGTH);
  const id = crypto.randomUUID();
  const link = await createLink(c.env.DB, { id, user_id: userId, short_code: shortCode });
  const url = `${origin}/v/${link.short_code}`;

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
