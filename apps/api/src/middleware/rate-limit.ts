import { createMiddleware } from "hono/factory";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { Env } from "../env.js";

type RateLimitConfig = {
  max: number;       // max requests
  windowSecs: number; // time window in seconds
  prefix: string;     // KV key prefix
};

export function rateLimit(config: RateLimitConfig) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    // Only trust cf-connecting-ip (set by Cloudflare, not spoofable)
    // In local dev, fall back to a fixed value per remote address
    const ip = c.req.header("cf-connecting-ip") ?? "127.0.0.1";

    const key = `rl:${config.prefix}:${ip}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.windowSecs;

    // Get current window data
    const raw = await c.env.KV.get(key, "json");
    const timestamps: number[] = raw
      ? (raw as number[]).filter((t) => t > windowStart)
      : [];

    if (timestamps.length >= config.max) {
      return c.json(
        { error: "Too many requests. Try again later." },
        429
      );
    }

    timestamps.push(now);
    await c.env.KV.put(key, JSON.stringify(timestamps), {
      expirationTtl: config.windowSecs,
    });

    await next();
  });
}
