import type { Env } from "./env.js";

type RequestContext = { req: { header: (name: string) => string | undefined } };

export function getOrigin(c: RequestContext): string {
  const host = c.req.header("host") ?? "localhost:8787";
  const proto = host.split(":")[0] === "localhost" ? "http" : "https";
  return `${proto}://${host}`;
}

export function getRpInfo(c: RequestContext & { env: Env }): { rpID: string; origin: string } {
  const host = c.req.header("host") ?? c.env.RP_ID;
  const rpID = host.split(":")[0];
  const proto = rpID === "localhost" ? "http" : "https";
  return { rpID, origin: `${proto}://${host}` };
}
