import { describe, it, expect, beforeAll } from "vitest";
import { SELF } from "cloudflare:test";
import { setupDB } from "../test/helpers.js";

beforeAll(async () => {
  await setupDB();
});

describe("GET /", () => {
  it("returns HTML with landing page content", async () => {
    const res = await SELF.fetch("https://test.local/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("humanpass");
    expect(html).toContain("Prove you're human");
    expect(html).toContain("Get your link");
  });
});

describe("GET /privacy", () => {
  it("returns HTML with privacy policy", async () => {
    const res = await SELF.fetch("https://test.local/privacy");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("humanpass");
  });
});

describe("GET /developers", () => {
  it("returns HTML with developer docs", async () => {
    const res = await SELF.fetch("https://test.local/developers");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Verify humans from your platform");
    expect(html).toContain("/api/v1/verify/:code");
    expect(html).toContain("Humanpass.verify()");
  });
});

describe("GET /verify/popup", () => {
  it("returns HTML with popup page", async () => {
    const res = await SELF.fetch("https://test.local/verify/popup");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("humanpass");
    expect(html).toContain("Verify");
  });
});

describe("GET /sdk.js", () => {
  it("returns JavaScript with correct Content-Type and Cache-Control", async () => {
    const res = await SELF.fetch("https://test.local/sdk.js");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/javascript");
    expect(res.headers.get("cache-control")).toContain("public");
    expect(res.headers.get("cache-control")).toContain("max-age=300");
  });

  it("contains Humanpass.verify function", async () => {
    const res = await SELF.fetch("https://test.local/sdk.js");
    const js = await res.text();
    expect(js).toContain("Humanpass");
    expect(js).toContain("HP.verify");
    expect(js).toContain("window.Humanpass");
  });
});
