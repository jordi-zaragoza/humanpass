import { env } from "cloudflare:test";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credentials (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  public_key BLOB NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT,
  aaguid TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  short_code TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);
`;

export async function setupDB() {
  for (const stmt of SCHEMA.split(";").filter((s) => s.trim())) {
    await env.DB.prepare(stmt).run();
  }
}

export async function createTestUser(id?: string): Promise<string> {
  const userId = id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO users (id, created_at) VALUES (?, ?)").bind(userId, now).run();
  return userId;
}

export async function createTestLink(userId: string, shortCode?: string): Promise<{ id: string; short_code: string; created_at: string }> {
  const id = crypto.randomUUID();
  const code = shortCode ?? `test-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO links (id, user_id, short_code, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, userId, code, now)
    .run();
  return { id, short_code: code, created_at: now };
}

export async function createTestSession(userId: string, token?: string): Promise<string> {
  const sessionToken = token ?? crypto.randomUUID();
  await env.KV.put(`session:${sessionToken}`, JSON.stringify({ userId }), { expirationTtl: 300 });
  return sessionToken;
}
