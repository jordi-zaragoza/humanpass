import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { setupDB, createTestUser, createTestLink } from "../test/helpers.js";

beforeAll(async () => {
  await setupDB();
});

describe("GET /api/v1/verify/:code", () => {
  it("returns { verified: true } for a valid link", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "verify-ok-1");

    const res = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`);
    expect(res.status).toBe(200);
    const data = await res.json() as { verified: boolean; shortCode?: string; createdAt?: string };
    expect(data.verified).toBe(true);
    expect(data.shortCode).toBe("verify-ok-1");
    expect(data.createdAt).toBeTruthy();
  });

  it("returns { verified: false } for non-existent code", async () => {
    const res = await SELF.fetch("https://test.local/api/v1/verify/does-not-exist");
    expect(res.status).toBe(200);
    const data = await res.json() as { verified: boolean };
    expect(data.verified).toBe(false);
  });

  it("detects fraud when referer differs", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "fraud-detect-1");

    // First visit with referer A
    await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`, {
      headers: { referer: "https://site-a.com/page" },
    });

    // Second visit with different referer B → fraud
    const res = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`, {
      headers: { referer: "https://site-b.com/page" },
    });
    const data = await res.json() as { verified: boolean; fraud?: boolean };
    expect(data.verified).toBe(false);
    expect(data.fraud).toBe(true);
  });

  it("first visit with referer is OK", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "first-ref-1");

    const res = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`, {
      headers: { referer: "https://first-site.com/page" },
    });
    const data = await res.json() as { verified: boolean };
    expect(data.verified).toBe(true);
  });

  it("no referer is always OK", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "no-ref-1");

    // First visit without referer
    const res1 = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`);
    expect((await res1.json() as { verified: boolean }).verified).toBe(true);

    // Second visit without referer — still OK
    const res2 = await SELF.fetch(`https://test.local/api/v1/verify/${link.short_code}`);
    expect((await res2.json() as { verified: boolean }).verified).toBe(true);
  });
});

describe("GET /v/:code", () => {
  it("returns HTML verification page for valid code", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "page-ok-1");

    const res = await SELF.fetch(`https://test.local/v/${link.short_code}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Verified human");
  });

  it("returns 404 for non-existent code", async () => {
    const res = await SELF.fetch("https://test.local/v/does-not-exist");
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain("not found");
  });

  it("returns 403 for fraud detected", async () => {
    const userId = await createTestUser();
    const link = await createTestLink(userId, "page-fraud-1");

    // First visit from site A
    await SELF.fetch(`https://test.local/v/${link.short_code}`, {
      headers: { referer: "https://legit-site.com/page" },
    });

    // Second visit from different site → fraud
    const res = await SELF.fetch(`https://test.local/v/${link.short_code}`, {
      headers: { referer: "https://evil-site.com/page" },
    });
    expect(res.status).toBe(403);
    const html = await res.text();
    expect(html).toContain("Suspicious");
  });
});
