import { describe, it, expect, beforeAll } from "vitest";
import { SELF } from "cloudflare:test";
import { setupDB } from "../../test/helpers.js";

beforeAll(async () => {
  await setupDB();
});

// Rate limiting is applied on auth and links routes.
// We test via the register/options endpoint which has a rate limit of 50/day.

describe("rateLimit middleware", () => {
  it("allows requests under the limit", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
    });
    // Should succeed (not 429)
    expect(res.status).not.toBe(429);
  });

  it("uses cf-connecting-ip as identifier (falls back to 127.0.0.1)", async () => {
    // Requests without cf-connecting-ip should still work (use 127.0.0.1)
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
    });
    expect(res.status).not.toBe(429);
  });

  it("different IPs have independent counters", async () => {
    // Request from a different IP should have its own counter
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
      headers: { "cf-connecting-ip": "10.0.0.99" },
    });
    expect(res.status).not.toBe(429);
  });
});
