# humanpass

Proof of humanness for the AI era.

Humanpass uses biometric passkeys to prove a real, physical human is on the other side. No passwords, no personal data, no puzzles.

## Why not a CAPTCHA?

CAPTCHAs prove "probably not a bot." Humanpass proves **a physical human is present**.

| | CAPTCHA | Humanpass |
|---|---|---|
| AI bots | GPT-4V already solves visual CAPTCHAs | Can't fake a fingerprint |
| CAPTCHA farms | $2 per 1,000 solved | Requires the real biometric |
| Privacy | reCAPTCHA tracks via Google cookies | No cookies, no tracking |
| What it proves | "Probably not a bot" | "A human was physically present at this time" |

Humanpass is not a CAPTCHA replacement. It's **proof of human presence** for use cases where that matters:

- Social platforms where AI can impersonate humans
- Comment sections and forums that want real human conversations
- Any context where you need timestamped proof that a person was there

## How it works

1. The user authenticates on humanpass with their device biometrics (fingerprint, Face ID)
2. They get a short-lived verification code (expires in 1 minute)
3. Your backend verifies the code with a single API call

## API

```
GET /api/v1/verify/:code
```

Public endpoint. No authentication required. CORS enabled for all origins.

**Verified:**
```json
{
  "verified": true,
  "shortCode": "20260223-1432-rSBp",
  "createdAt": "2026-02-23T14:32:44.565Z"
}
```

**Invalid or expired:**
```json
{
  "verified": false
}
```

### Example (Node.js)

```js
const code = /* code submitted by the user */;

const res = await fetch(
  `https://human-pass.org/api/v1/verify/${code}`
);
const data = await res.json();

if (data.verified) {
  const age = Date.now() - new Date(data.createdAt).getTime();
  if (age < 120_000) {
    // Human verified
  }
}
```

### Best practices

- **Call from your backend**, not from client-side JavaScript. This prevents users from spoofing responses.
- **Check `createdAt`** to ensure the code is recent. Links expire after 1 minute, but you can enforce your own window.
- **Use each code once.** Store verified codes to prevent reuse.

## Tech stack

- [Hono](https://hono.dev) on Cloudflare Workers
- WebAuthn / passkeys for biometric auth
- Cloudflare KV + D1 for storage
- Turborepo monorepo

## License

[BSL 1.1](LICENSE) — free for non-commercial use. Converts to Apache 2.0 on 2030-02-23.
