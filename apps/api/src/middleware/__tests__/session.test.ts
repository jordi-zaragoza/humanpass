import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestSession } from "../../test/helpers.js";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "../../constants.js";
import { setSessionCookie } from "../../middleware/session.js";

beforeAll(async () => {
  await setupDB();
});

describe("sessionAuth middleware", () => {
  it("redirects to / if no cookie", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/links", {
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/");
  });

  it("redirects to / if session in KV does not exist (and clears cookie)", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/links", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=nonexistent-token` },
      redirect: "manual",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/");
    // Should set a delete cookie header
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(SESSION_COOKIE_NAME);
  });

  it("sets userId in context if session is valid", async () => {
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    const res = await SELF.fetch("https://test.local/api/v1/links", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    // Should succeed (200) not redirect
    expect(res.status).toBe(200);
    const data = await res.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("createSession", () => {
  it("generates token and stores in KV with TTL", async () => {
    const { createSession } = await import("../../middleware/session.js");
    const userId = await createTestUser();
    const token = await createSession(env.KV, userId);

    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const stored = await env.KV.get(`session:${token}`, "json") as { userId: string } | null;
    expect(stored).not.toBeNull();
    expect(stored!.userId).toBe(userId);
  });
});

describe("setSessionCookie", () => {
  it("generates correct Set-Cookie header (HttpOnly, SameSite=Strict, Max-Age)", () => {
    const headers: Record<string, string> = {};
    const fakeContext = {
      header: (name: string, value: string) => { headers[name] = value; },
      req: { header: () => "localhost:8787" },
    };
    setSessionCookie(fakeContext, "test-token");
    const cookie = headers["Set-Cookie"];
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=test-token`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain(`Max-Age=${SESSION_TTL_SECONDS}`);
    expect(cookie).toContain("Path=/");
  });

  it("adds Secure only in production (not localhost)", () => {
    // localhost — no Secure
    const headersLocal: Record<string, string> = {};
    setSessionCookie(
      { header: (n: string, v: string) => { headersLocal[n] = v; }, req: { header: () => "localhost:8787" } },
      "tok1"
    );
    expect(headersLocal["Set-Cookie"]).not.toContain("Secure");

    // production — has Secure
    const headersProd: Record<string, string> = {};
    setSessionCookie(
      { header: (n: string, v: string) => { headersProd[n] = v; }, req: { header: () => "human-pass.org" } },
      "tok2"
    );
    expect(headersProd["Set-Cookie"]).toContain("Secure");
  });
});

describe("destroySession", () => {
  it("removes session from KV", async () => {
    const { destroySession } = await import("../../middleware/session.js");
    const userId = await createTestUser();
    const token = await createTestSession(userId);

    // Verify it exists
    expect(await env.KV.get(`session:${token}`)).not.toBeNull();

    await destroySession(env.KV, token);
    expect(await env.KV.get(`session:${token}`)).toBeNull();
  });
});
