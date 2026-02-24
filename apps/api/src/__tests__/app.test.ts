import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestSession, createTestLink } from "../test/helpers.js";
import { SESSION_COOKIE_NAME } from "../constants.js";

beforeAll(async () => {
  await setupDB();
});

describe("GET /app", () => {
  it("shows auth page when no session", async () => {
    const res = await SELF.fetch("https://test.local/app");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("passkey");
  });

  it("shows dashboard with link when session is valid", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/app", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Verified human");
    expect(html).toContain("/v/");
  });

  it("reuses existing link if not expired", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);
    const link = await createTestLink(userId, "app-reuse-1");

    const res = await SELF.fetch("https://test.local/app", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    const html = await res.text();
    expect(html).toContain("app-reuse-1");
  });

  it("marks token as scanned if sync token present and no session", async () => {
    const syncToken = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);
    await SELF.fetch(`https://test.local/app?sync=${syncToken}`);

    const stored = await env.KV.get(`sync:${syncToken}`, "json") as { scanned?: boolean } | null;
    expect(stored).not.toBeNull();
    expect(stored!.scanned).toBe(true);
  });

  it("stores link in KV for sync when session exists with sync token", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);
    const syncToken = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);

    await SELF.fetch(`https://test.local/app?sync=${syncToken}`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });

    const stored = await env.KV.get(`sync:${syncToken}`, "json") as { url?: string; shortCode?: string } | null;
    expect(stored).not.toBeNull();
    expect(stored!.url).toBeTruthy();
    expect(stored!.shortCode).toBeTruthy();
  });
});
