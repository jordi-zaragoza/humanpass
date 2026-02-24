import type { D1Database } from "@cloudflare/workers-types";
import type { User, Credential, Link } from "../types.js";

// --- Users ---

export async function createUser(db: D1Database, id: string): Promise<User> {
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO users (id, created_at) VALUES (?, ?)")
    .bind(id, now)
    .run();
  return { id, created_at: now };
}

// --- Credentials ---

export async function createCredential(
  db: D1Database,
  credential: {
    credential_id: string;
    user_id: string;
    public_key: Uint8Array;
    counter: number;
    transports?: string[];
    aaguid?: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO credentials (credential_id, user_id, public_key, counter, transports, aaguid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      credential.credential_id,
      credential.user_id,
      credential.public_key as unknown as ArrayBuffer,
      credential.counter,
      credential.transports ? JSON.stringify(credential.transports) : null,
      credential.aaguid ?? null,
      now
    )
    .run();
}

export async function getCredentialByAaguid(
  db: D1Database,
  aaguid: string
): Promise<Credential | null> {
  const row = await db
    .prepare("SELECT * FROM credentials WHERE aaguid = ?")
    .bind(aaguid)
    .first();
  return row ? (row as unknown as Credential) : null;
}

export async function getCredentialById(
  db: D1Database,
  credentialId: string
): Promise<Credential | null> {
  const row = await db
    .prepare("SELECT * FROM credentials WHERE credential_id = ?")
    .bind(credentialId)
    .first();
  return row ? (row as unknown as Credential) : null;
}

export async function getCredentialsByUserId(
  db: D1Database,
  userId: string
): Promise<Credential[]> {
  const { results } = await db
    .prepare("SELECT * FROM credentials WHERE user_id = ?")
    .bind(userId)
    .all();
  return results as unknown as Credential[];
}

export async function updateCredentialCounter(
  db: D1Database,
  credentialId: string,
  counter: number
): Promise<void> {
  await db
    .prepare("UPDATE credentials SET counter = ? WHERE credential_id = ?")
    .bind(counter, credentialId)
    .run();
}

// --- Links ---

export async function createLink(
  db: D1Database,
  link: { id: string; user_id: string; short_code: string }
): Promise<Link> {
  const now = new Date();
  const nowISO = now.toISOString();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  await db.batch([
    db.prepare("DELETE FROM links WHERE created_at < ?").bind(cutoff),
    db.prepare(
      "INSERT INTO links (id, user_id, short_code, created_at) VALUES (?, ?, ?, ?)"
    ).bind(link.id, link.user_id, link.short_code, nowISO),
  ]);
  return { ...link, created_at: nowISO };
}

export async function getLinkByShortCode(
  db: D1Database,
  shortCode: string
): Promise<Link | null> {
  const row = await db
    .prepare("SELECT * FROM links WHERE short_code = ?")
    .bind(shortCode)
    .first();
  return row ? (row as unknown as Link) : null;
}

export async function getLinksByUserId(
  db: D1Database,
  userId: string,
  limit = 20
): Promise<Link[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(userId, limit)
    .all();
  return results as unknown as Link[];
}
