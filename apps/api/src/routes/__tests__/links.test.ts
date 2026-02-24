import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestSession, createTestLink } from "../../test/helpers.js";
import { SESSION_COOKIE_NAME } from "../../constants.js";

beforeAll(async () => {
  await setupDB();
});

describe("POST /api/v1/links", () => {
  it("requires session (redirects without auth)", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/links", {
      method: "POST",
      redirect: "manual",
    });
    expect(res.status).toBe(302);
  });

  it("creates a new link if none exists", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { url: string; shortCode: string; createdAt: string };
    expect(data.url).toBeTruthy();
    expect(data.shortCode).toBeTruthy();
    expect(data.createdAt).toBeTruthy();
  });

  it("reuses existing link if user already has one", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);
    await createTestLink(userId, "reuse-code-1");

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { shortCode: string };
    expect(data.shortCode).toBe("reuse-code-1");
  });

  it("returns url, shortCode, createdAt", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { url: string; shortCode: string; createdAt: string };
    expect(data).toHaveProperty("url");
    expect(data).toHaveProperty("shortCode");
    expect(data).toHaveProperty("createdAt");
    expect(data.url).toContain(data.shortCode);
  });
});

describe("GET /api/v1/links", () => {
  it("requires session", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/links", {
      redirect: "manual",
    });
    expect(res.status).toBe(302);
  });

  it("returns array of links for the user", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);
    await createTestLink(userId, "list-code-1");
    await createTestLink(userId, "list-code-2");

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Array<{ url: string; shortCode: string; createdAt: string }>;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0]).toHaveProperty("url");
    expect(data[0]).toHaveProperty("shortCode");
    expect(data[0]).toHaveProperty("createdAt");
  });
});
