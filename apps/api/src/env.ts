import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export type Env = {
  DB: D1Database;
  KV: KVNamespace;
  RP_ID: string;
  RP_NAME: string;
  RP_ORIGIN: string;
  ADMIN_TOKEN: string;
};
