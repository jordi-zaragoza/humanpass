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

function getRpInfo(c: { req: { header: (name: string) => string | undefined }; env: Env }) {
  const host = c.req.header("host") ?? c.env.RP_ID;
  const rpID = host.split(":")[0];
  const proto = rpID === "localhost" ? "http" : "https";
  const origin = `${proto}://${host}`;
  return { rpID, origin };
}

const auth = new Hono<{ Bindings: Env }>();

// Rate limits
const registerLimit = rateLimit({ max: 3, windowSecs: 86400, prefix: "register" });  // 3/day
const loginLimit = rateLimit({ max: 20, windowSecs: 3600, prefix: "login" });         // 20/hour

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
    attestationType: "direct",
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

  const { credential, aaguid, attestationObject } = verification.registrationInfo;

  // Extract attestation format from attestationObject CBOR
  const fmt = (() => {
    try {
      // attestationObject is a Uint8Array containing CBOR. The "fmt" field
      // is near the start. We do a lightweight scan for the 3-byte CBOR
      // string key "fmt" followed by the value string.
      const bytes = new Uint8Array(attestationObject);
      for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0x63 && bytes[i + 1] === 0x66 && bytes[i + 2] === 0x6d && bytes[i + 3] === 0x74) {
          // Next byte is CBOR string header for the value
          const len = bytes[i + 4] & 0x1f; // low 5 bits = string length (major type 3)
          if (len > 0 && len < 32) {
            return new TextDecoder().decode(bytes.slice(i + 5, i + 5 + len));
          }
        }
      }
    } catch { /* fall through */ }
    return "unknown";
  })();

  // Block known emulator AAGUIDs
  if (aaguid && BLOCKED_AAGUIDS.has(aaguid)) {
    return c.json({ error: "This authenticator type is not allowed" }, 403);
  }

  // All-zeros AAGUID + no attestation = almost certainly an emulator
  if (aaguid === "00000000-0000-0000-0000-000000000000" && fmt === "none") {
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

// --- Login ---

auth.post("/login/options", loginLimit, async (c) => {
  const { rpID } = getRpInfo(c);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
  });

  // Store challenge in KV keyed by the challenge itself (discoverable credentials)
  await c.env.KV.put(
    `challenge:login:${options.challenge}`,
    JSON.stringify({ challenge: options.challenge }),
    { expirationTtl: 300 }
  );

  return c.json({ options });
});

auth.post("/login/verify", loginLimit, async (c) => {
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
        const key = `challenge:login:${challenge}`;
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
        publicKey: new Uint8Array(
          stored.public_key instanceof ArrayBuffer
            ? stored.public_key
            : (stored.public_key as unknown as ArrayBufferLike)
        ),
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

// --- Logout ---

auth.post("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    await destroySession(c.env.KV, token);
    deleteCookie(c, SESSION_COOKIE_NAME);
  }
  return c.json({ ok: true });
});

export default auth;
