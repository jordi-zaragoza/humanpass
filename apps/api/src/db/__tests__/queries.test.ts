import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { setupDB, createTestUser, createTestCredential } from "../../test/helpers.js";
import {
  createUser,
  createCredential,
  getCredentialById,
  getCredentialsByUserId,
  getCredentialByAaguid,
  updateCredentialCounter,
  createLink,
  getLinkByShortCode,
  getLinksByUserId,
} from "../queries.js";

beforeAll(async () => {
  await setupDB();
});

// --- Users ---

describe("createUser", () => {
  it("creates a user and returns id and created_at", async () => {
    const id = crypto.randomUUID();
    const user = await createUser(env.DB, id);
    expect(user.id).toBe(id);
    expect(user.created_at).toBeTruthy();
    expect(new Date(user.created_at).getTime()).not.toBeNaN();
  });

  it("fails with duplicate id", async () => {
    const id = crypto.randomUUID();
    await createUser(env.DB, id);
    await expect(createUser(env.DB, id)).rejects.toThrow();
  });
});

// --- Credentials ---

describe("createCredential", () => {
  it("creates a credential with all fields", async () => {
    const userId = await createTestUser();
    const credId = crypto.randomUUID();
    await createCredential(env.DB, {
      credential_id: credId,
      user_id: userId,
      public_key: new Uint8Array([10, 20, 30]),
      counter: 5,
      transports: ["usb", "ble"],
      aaguid: "test-aaguid-1",
    });

    const row = await env.DB.prepare("SELECT * FROM credentials WHERE credential_id = ?").bind(credId).first();
    expect(row).not.toBeNull();
    expect(row!.user_id).toBe(userId);
    expect(row!.counter).toBe(5);
    expect(row!.transports).toBe(JSON.stringify(["usb", "ble"]));
    expect(row!.aaguid).toBe("test-aaguid-1");
  });

  it("creates a credential without transports and aaguid (nullable)", async () => {
    const userId = await createTestUser();
    const credId = crypto.randomUUID();
    await createCredential(env.DB, {
      credential_id: credId,
      user_id: userId,
      public_key: new Uint8Array([1, 2]),
      counter: 0,
    });

    const row = await env.DB.prepare("SELECT * FROM credentials WHERE credential_id = ?").bind(credId).first();
    expect(row).not.toBeNull();
    expect(row!.transports).toBeNull();
    expect(row!.aaguid).toBeNull();
  });
});

describe("getCredentialById", () => {
  it("returns an existing credential", async () => {
    const userId = await createTestUser();
    const cred = await createTestCredential(userId, { credential_id: "cred-by-id-1" });

    const result = await getCredentialById(env.DB, "cred-by-id-1");
    expect(result).not.toBeNull();
    expect(result!.credential_id).toBe("cred-by-id-1");
    expect(result!.user_id).toBe(userId);
  });

  it("returns null if credential does not exist", async () => {
    const result = await getCredentialById(env.DB, "nonexistent-cred");
    expect(result).toBeNull();
  });
});

describe("getCredentialsByUserId", () => {
  it("returns multiple credentials for a user", async () => {
    const userId = await createTestUser();
    await createTestCredential(userId, { credential_id: "multi-1" });
    await createTestCredential(userId, { credential_id: "multi-2" });

    const results = await getCredentialsByUserId(env.DB, userId);
    expect(results.length).toBe(2);
    const ids = results.map((c) => c.credential_id);
    expect(ids).toContain("multi-1");
    expect(ids).toContain("multi-2");
  });

  it("returns empty array if user has no credentials", async () => {
    const userId = await createTestUser();
    const results = await getCredentialsByUserId(env.DB, userId);
    expect(results).toEqual([]);
  });
});

describe("getCredentialByAaguid", () => {
  it("returns a credential by aaguid", async () => {
    const userId = await createTestUser();
    await createTestCredential(userId, { aaguid: "unique-aaguid-42" });

    const result = await getCredentialByAaguid(env.DB, "unique-aaguid-42");
    expect(result).not.toBeNull();
    expect(result!.aaguid).toBe("unique-aaguid-42");
    expect(result!.user_id).toBe(userId);
  });

  it("returns null if aaguid does not exist", async () => {
    const result = await getCredentialByAaguid(env.DB, "nonexistent-aaguid");
    expect(result).toBeNull();
  });
});

describe("updateCredentialCounter", () => {
  it("updates the counter correctly", async () => {
    const userId = await createTestUser();
    const cred = await createTestCredential(userId, { credential_id: "counter-test-1", counter: 0 });

    await updateCredentialCounter(env.DB, "counter-test-1", 42);

    const updated = await getCredentialById(env.DB, "counter-test-1");
    expect(updated).not.toBeNull();
    expect(updated!.counter).toBe(42);
  });
});

// --- Links ---

describe("createLink", () => {
  it("creates a link and returns all fields", async () => {
    const userId = await createTestUser();
    const id = crypto.randomUUID();
    const link = await createLink(env.DB, { id, user_id: userId, short_code: "q-link-1" });

    expect(link.id).toBe(id);
    expect(link.user_id).toBe(userId);
    expect(link.short_code).toBe("q-link-1");
    expect(link.created_at).toBeTruthy();
  });
});

describe("getLinkByShortCode", () => {
  it("returns an existing link", async () => {
    const userId = await createTestUser();
    await createLink(env.DB, { id: crypto.randomUUID(), user_id: userId, short_code: "q-sc-1" });

    const result = await getLinkByShortCode(env.DB, "q-sc-1");
    expect(result).not.toBeNull();
    expect(result!.short_code).toBe("q-sc-1");
    expect(result!.user_id).toBe(userId);
  });

  it("returns null if short code does not exist", async () => {
    const result = await getLinkByShortCode(env.DB, "nonexistent-sc");
    expect(result).toBeNull();
  });
});

describe("getLinksByUserId", () => {
  it("returns links ordered DESC and respects limit", async () => {
    const userId = await createTestUser();
    // Create 3 links with small delays to ensure different timestamps
    await createLink(env.DB, { id: crypto.randomUUID(), user_id: userId, short_code: "q-order-1" });
    await createLink(env.DB, { id: crypto.randomUUID(), user_id: userId, short_code: "q-order-2" });
    await createLink(env.DB, { id: crypto.randomUUID(), user_id: userId, short_code: "q-order-3" });

    // Limit to 2
    const results = await getLinksByUserId(env.DB, userId, 2);
    expect(results.length).toBe(2);
    // Most recent first (DESC)
    expect(new Date(results[0].created_at).getTime()).toBeGreaterThanOrEqual(
      new Date(results[1].created_at).getTime()
    );
  });

  it("returns empty array if user has no links", async () => {
    const userId = await createTestUser();
    const results = await getLinksByUserId(env.DB, userId);
    expect(results).toEqual([]);
  });
});
