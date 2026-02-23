import { createMiddleware } from "hono/factory";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { Env } from "../env.js";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "../constants.js";
import type { SessionData } from "../types.js";

type SessionEnv = {
  Bindings: Env;
  Variables: { userId: string };
};

export const sessionAuth = createMiddleware<SessionEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    return c.redirect("/");
  }

  const data = await c.env.KV.get(`session:${token}`, "json");
  if (!data) {
    deleteCookie(c, SESSION_COOKIE_NAME);
    return c.redirect("/");
  }

  c.set("userId", (data as SessionData).userId);
  await next();
});

export async function createSession(
  kv: KVNamespace,
  userId: string
): Promise<string> {
  const token = crypto.randomUUID();
  await kv.put(`session:${token}`, JSON.stringify({ userId }), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return token;
}

export function setSessionCookie(
  c: { header: (name: string, value: string) => void; req: { header: (name: string) => string | undefined } },
  token: string
): void {
  const host = c.req.header("host") ?? "localhost";
  const isLocalhost = host.split(":")[0] === "localhost";
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (!isLocalhost) {
    parts.push("Secure");
  }
  c.header("Set-Cookie", parts.join("; "));
}

export async function destroySession(
  kv: KVNamespace,
  token: string
): Promise<void> {
  await kv.delete(`session:${token}`);
}
