import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestLink, createTestSession } from "../test/helpers.js";
import { SESSION_COOKIE_NAME } from "../constants.js";

beforeAll(async () => {
  await setupDB();
});

describe("Rate limit", () => {
  it("returns 429 when rate limit is exceeded", async () => {
    // The pass endpoint has max: 120, windowSecs: 3600, prefix: "pass"
    // Pre-seed KV with 120 timestamps to simulate exhausted limit
    const ip = "10.0.0.42";
    const now = Math.floor(Date.now() / 1000);
    const timestamps = Array.from({ length: 120 }, (_, i) => now - i);
    await env.KV.put(`rl:pass:${ip}`, JSON.stringify(timestamps), { expirationTtl: 3600 });

    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/options", {
      method: "POST",
      headers: { "cf-connecting-ip": ip },
    });
    expect(res.status).toBe(429);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Too many requests");
  });
});

describe("Verify: same referer on second visit", () => {
  it("returns verified when same referer is used twice", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "same-ref-1");
    const referer = "https://consistent-site.com/page";

    // First visit
    const res1 = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`, {
      headers: { referer },
    });
    const data1 = await res1.json() as { verified: boolean };
    expect(data1.verified).toBe(true);

    // Second visit with same referer → still OK
    const res2 = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`, {
      headers: { referer },
    });
    const data2 = await res2.json() as { verified: boolean; fraud?: boolean };
    expect(data2.verified).toBe(true);
    expect(data2.fraud).toBeUndefined();
  });
});

describe("App: expired link creates a new one", () => {
  it("generates a new link when the existing one has expired", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    // Insert a link with old timestamp (2 minutes ago, beyond 60s TTL)
    const oldTime = new Date(Date.now() - 120_000).toISOString();
    const oldCode = "expired-link-1";
    await env.DB.prepare("INSERT INTO links (id, user_id, short_code, created_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), userId, oldCode, oldTime)
      .run();

    const res = await SELF.fetch("https://test.local/app", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    // Should NOT contain the expired code; should have a fresh link
    expect(html).not.toContain(oldCode);
    expect(html).toContain("/v/");
  });
});

describe("Links GET: empty list", () => {
  it("returns empty array for user with no links", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as unknown[];
    expect(data).toEqual([]);
  });
});

describe("CORS: same-origin and no-origin", () => {
  it("allows same-origin API request", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/options", {
      method: "POST",
      headers: { host: "test.local", origin: "https://test.local" },
    });
    // Should NOT be 403 (Forbidden) since origin matches
    expect(res.status).not.toBe(403);
  });

  it("allows API request without origin header", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/options", {
      method: "POST",
      // No origin header
    });
    // Should NOT be 403
    expect(res.status).not.toBe(403);
  });
});
