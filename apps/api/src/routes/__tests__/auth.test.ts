import { describe, it, expect, beforeAll, vi } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestSession } from "../../test/helpers.js";
import { SESSION_COOKIE_NAME, BLOCKED_AAGUIDS } from "../../constants.js";

beforeAll(async () => {
  await setupDB();
});

describe("POST /api/v1/auth/register/options", () => {
  it("returns registration options and userId", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { options: { challenge: string }; userId: string };
    expect(data.userId).toBeTruthy();
    expect(data.options).toBeTruthy();
    expect(data.options.challenge).toBeTruthy();
  });

  it("stores challenge in KV", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
    });
    const data = await res.json() as { options: { challenge: string }; userId: string };

    const stored = await env.KV.get(`challenge:register:${data.userId}`, "json") as { challenge: string } | null;
    expect(stored).not.toBeNull();
    expect(stored!.challenge).toBe(data.options.challenge);
  });
});

describe("POST /api/v1/auth/register/verify", () => {
  it("returns 400 if challenge does not exist", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: {}, userId: "nonexistent-user" }),
    });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Challenge");
  });

  it("returns error on invalid WebAuthn response", async () => {
    // First get a valid challenge
    const optRes = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
    });
    const optData = await optRes.json() as { options: { challenge: string }; userId: string };

    const res = await SELF.fetch("https://test.local/api/v1/auth/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        response: { id: "fake", rawId: "fake", type: "public-key", response: {} },
        userId: optData.userId,
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/pass/options", () => {
  it("returns authentication options", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/options", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { options: { challenge: string } };
    expect(data.options).toBeTruthy();
    expect(data.options.challenge).toBeTruthy();
  });

  it("stores challenge in KV", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/options", {
      method: "POST",
    });
    const data = await res.json() as { options: { challenge: string } };

    const stored = await env.KV.get(`challenge:pass:${data.options.challenge}`, "json") as { challenge: string } | null;
    expect(stored).not.toBeNull();
    expect(stored!.challenge).toBe(data.options.challenge);
  });
});

describe("POST /api/v1/auth/pass/verify", () => {
  it("returns 400 if credential does not exist", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/pass/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: { id: "nonexistent-cred" } }),
    });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Credential not found");
  });
});

describe("POST /api/v1/auth/reset (logout)", () => {
  it("destroys session and clears cookie", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/api/v1/auth/reset", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { ok: boolean };
    expect(data.ok).toBe(true);

    // Session should be removed from KV
    const stored = await env.KV.get(`session:${token}`);
    expect(stored).toBeNull();
  });

  it("works without cookie (no error)", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/reset", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { ok: boolean };
    expect(data.ok).toBe(true);
  });
});
