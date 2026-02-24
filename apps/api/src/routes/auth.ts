import { Hono } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type { Env } from "../env.js";
import {
  createUser,
  createCredential,
  getCredentialsByUserId,
  getCredentialById,
  updateCredentialCounter,
} from "../db/queries.js";
import {
  createSession,
  setSessionCookie,
  destroySession,
} from "../middleware/session.js";
import { SESSION_COOKIE_NAME, BLOCKED_AAGUIDS } from "../constants.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { getRpInfo } from "../utils.js";

const auth = new Hono<{ Bindings: Env }>();

// Rate limits
const registerLimit = rateLimit({ max: 50, windowSecs: 86400, prefix: "register" });  // 50/day (raise to 3 in prod)
const passLimit = rateLimit({ max: 20, windowSecs: 3600, prefix: "pass" });           // 20/hour

// --- Registration ---

auth.post("/register/options", registerLimit, async (c) => {
  const userId = crypto.randomUUID();
  const { rpID } = getRpInfo(c);

  const options = await generateRegistrationOptions({
    rpName: c.env.RP_NAME,
    rpID,
    userName: userId,
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "required",
    },
    attestationType: "none",
  });

  // Store challenge in KV for verification
  await c.env.KV.put(
    `challenge:register:${userId}`,
    JSON.stringify({ challenge: options.challenge, userId }),
    { expirationTtl: 300 }
  );

  return c.json({ options, userId });
});

auth.post("/register/verify", registerLimit, async (c) => {
  const body = await c.req.json();
  const { response, userId } = body;

  const stored = await c.env.KV.get(`challenge:register:${userId}`, "json");
  if (!stored) {
    return c.json({ error: "Challenge expired or not found" }, 400);
  }

  const { challenge } = stored as { challenge: string; userId: string };

  let verification;
  try {
    const { rpID, origin } = getRpInfo(c);
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Verification failed" },
      400
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    return c.json({ error: "Registration verification failed" }, 400);
  }

  const { credential, aaguid } = verification.registrationInfo;

  // Block known emulator AAGUIDs
  if (aaguid && BLOCKED_AAGUIDS.has(aaguid)) {
    return c.json({ error: "This authenticator type is not allowed" }, 403);
  }

  // Create user + credential in D1
  await createUser(c.env.DB, userId);
  await createCredential(c.env.DB, {
    credential_id: credential.id,
    user_id: userId,
    public_key: credential.publicKey,
    counter: credential.counter,
    transports: response.response?.transports,
    aaguid: aaguid ?? undefined,
  });

  // Clean up challenge
  await c.env.KV.delete(`challenge:register:${userId}`);

  // Create session
  const token = await createSession(c.env.KV, userId);
  setSessionCookie(c, token);

  return c.json({ verified: true });
});

// --- Pass (authenticate with existing passkey) ---

auth.post("/pass/options", passLimit, async (c) => {
  const { rpID } = getRpInfo(c);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
  });

  // Store challenge in KV keyed by the challenge itself (discoverable credentials)
  await c.env.KV.put(
    `challenge:pass:${options.challenge}`,
    JSON.stringify({ challenge: options.challenge }),
    { expirationTtl: 300 }
  );

  return c.json({ options });
});

auth.post("/pass/verify", passLimit, async (c) => {
  const body = await c.req.json();
  const { response } = body;

  // Look up credential from DB
  const credentialId = response.id;
  const stored = await getCredentialById(c.env.DB, credentialId);
  if (!stored) {
    return c.json({ error: "Credential not found" }, 400);
  }

  let verification;
  try {
    const { rpID, origin } = getRpInfo(c);
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: async (challenge: string) => {
        const key = `challenge:pass:${challenge}`;
        const data = await c.env.KV.get(key, "json");
        if (!data) return false;
        // Consume challenge immediately to prevent replay
        await c.env.KV.delete(key);
        return true;
      },
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.credential_id,
        publicKey: new Uint8Array(stored.public_key),
        counter: stored.counter,
        transports: stored.transports
          ? JSON.parse(stored.transports)
          : undefined,
      },
    });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Verification failed" },
      400
    );
  }

  if (!verification.verified) {
    return c.json({ error: "Authentication failed" }, 400);
  }

  // Update counter
  await updateCredentialCounter(
    c.env.DB,
    credentialId,
    verification.authenticationInfo.newCounter
  );

  // Create session
  const token = await createSession(c.env.KV, stored.user_id);
  setSessionCookie(c, token);

  return c.json({ verified: true });
});

// --- Reset session ---

auth.post("/reset", async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    await destroySession(c.env.KV, token);
    deleteCookie(c, SESSION_COOKIE_NAME);
  }
  return c.json({ ok: true });
});

export default auth;
