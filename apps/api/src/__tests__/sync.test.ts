import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB } from "../test/helpers.js";

beforeAll(async () => {
  await setupDB();
});

describe("GET /api/v1/sync/:token", () => {
  it("returns { ready: false } if no data", async () => {
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 4); // >32 chars
    const res = await SELF.fetch(`https://test.local/api/v1/sync/${token}`);
    expect(res.status).toBe(200);
    const data = await res.json() as { ready: boolean };
    expect(data.ready).toBe(false);
  });

  it("returns { ready: false, scanned: true } if scanned but no link", async () => {
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);
    await env.KV.put(`sync:${token}`, JSON.stringify({ scanned: true }), { expirationTtl: 300 });

    const res = await SELF.fetch(`https://test.local/api/v1/sync/${token}`);
    expect(res.status).toBe(200);
    const data = await res.json() as { ready: boolean; scanned?: boolean };
    expect(data.ready).toBe(false);
    expect(data.scanned).toBe(true);
  });

  it("returns { ready: true, url, ... } when link is available", async () => {
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);
    await env.KV.put(`sync:${token}`, JSON.stringify({
      url: "https://test.local/v/abc123",
      shortCode: "abc123",
      createdAt: new Date().toISOString(),
    }), { expirationTtl: 300 });

    const res = await SELF.fetch(`https://test.local/api/v1/sync/${token}`);
    expect(res.status).toBe(200);
    const data = await res.json() as { ready: boolean; url?: string; shortCode?: string };
    expect(data.ready).toBe(true);
    expect(data.url).toBe("https://test.local/v/abc123");
    expect(data.shortCode).toBe("abc123");
  });

  it("returns 400 if token < 32 chars", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/sync/short");
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Invalid sync token");
  });
});
