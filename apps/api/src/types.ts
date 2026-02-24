export type User = {
  id: string;
  created_at: string;
};

export type Credential = {
  credential_id: string;
  user_id: string;
  public_key: ArrayBuffer;
  counter: number;
  transports: string | null;
  aaguid: string | null;
  created_at: string;
};

export type Link = {
  id: string;
  user_id: string;
  short_code: string;
  created_at: string;
};

export type SessionData = {
  userId: string;
};
