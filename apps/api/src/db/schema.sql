CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE credentials (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  public_key BLOB NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT,
  aaguid TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  short_code TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);
