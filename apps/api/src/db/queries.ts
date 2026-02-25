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
  link: { id: string; user_id: string; short_code: string; label?: string }
): Promise<Link> {
  const now = new Date();
  const nowISO = now.toISOString();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  await db.batch([
    db.prepare("DELETE FROM links WHERE created_at < ?").bind(cutoff),
    db.prepare(
      "INSERT INTO links (id, user_id, short_code, label, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(link.id, link.user_id, link.short_code, link.label ?? null, nowISO),
  ]);
  return { ...link, label: link.label ?? null, created_at: nowISO };
}

export async function updateLinkLabel(
  db: D1Database,
  shortCode: string,
  userId: string,
  label: string | null
): Promise<boolean> {
  const result = await db
    .prepare("UPDATE links SET label = ? WHERE short_code = ? AND user_id = ?")
    .bind(label, shortCode, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
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

// --- Forum seed data ---

export async function seedForumData(db: D1Database, datePart: string, timePart: string): Promise<void> {
  const now = new Date().toISOString();
  const users = [
    { id: "forum-user-dave93", created_at: "2024-03-15T10:00:00Z" },
    { id: "forum-user-xena", created_at: "2024-06-22T14:30:00Z" },
    { id: "forum-user-sk8r", created_at: "2025-01-08T09:15:00Z" },
    { id: "forum-user-linda", created_at: "2023-11-01T08:00:00Z" },
  ];
  const forumLinks = [
    { id: "forum-link-dave93", user_id: "forum-user-dave93", short_code: `${datePart}-${timePart}-dv93` },
    { id: "forum-link-xena", user_id: "forum-user-xena", short_code: `${datePart}-${timePart}-xn42` },
    { id: "forum-link-sk8r", user_id: "forum-user-sk8r", short_code: `${datePart}-${timePart}-sk8r` },
    { id: "forum-link-linda", user_id: "forum-user-linda", short_code: `${datePart}-${timePart}-lnda` },
  ];
  await db.batch([
    ...users.map((u) =>
      db.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)").bind(u.id, u.created_at)
    ),
    db.prepare("DELETE FROM links WHERE id LIKE 'forum-link-%'"),
    ...forumLinks.map((l) =>
      db.prepare("INSERT INTO links (id, user_id, short_code, created_at) VALUES (?, ?, ?, ?)").bind(l.id, l.user_id, l.short_code, now)
    ),
  ]);
}
