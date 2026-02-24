import { describe, it, expect, beforeAll } from "vitest";
import { SELF } from "cloudflare:test";
import { setupDB } from "../test/helpers.js";

beforeAll(async () => {
  await setupDB();
});

describe("CORS", () => {
  it("allows cross-origin for /api/v1/verify/*", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/verify/some-code", {
      headers: { origin: "https://external-site.com" },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://external-site.com");
  });

  it("allows cross-origin for /api/v1/sync/*", async () => {
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);
    const res = await SELF.fetch(`https://test.local/api/v1/sync/${token}`, {
      headers: { origin: "https://external-site.com" },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://external-site.com");
  });

  it("blocks cross-origin for other /api/* routes", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/auth/register/options", {
      method: "POST",
      headers: { origin: "https://evil-site.com" },
    });
    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("preflight OPTIONS returns 204 with correct headers for verify", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/verify/some-code", {
      method: "OPTIONS",
      headers: { origin: "https://external-site.com" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://external-site.com");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });

  it("preflight OPTIONS returns 204 with correct headers for sync", async () => {
    const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 4);
    const res = await SELF.fetch(`https://test.local/api/v1/sync/${token}`, {
      method: "OPTIONS",
      headers: { origin: "https://external-site.com" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://external-site.com");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
