# humanpass

**[human-pass.org](https://human-pass.org)** — Proof of humanness for the AI era.

Humanpass uses biometric passkeys to prove a real, physical human is on the other side. No passwords, no personal data, no puzzles. 100% open source.

## The problem

You can no longer tell if what you're reading online was written by a person or a bot. Current estimates put bot traffic at ~30% of the internet, and with agentic AI that number is only going up.

The existing solutions don't cut it:
- **CAPTCHAs** — AI solves them better than humans. GPT-4V already cracks visual CAPTCHAs.
- **Blue checks** — Pay-to-play, proves nothing about humanness.
- **Worldcoin** — Requires iris scanning and centralized biometric storage.

We need something that proves "a real human was physically present" — without collecting personal data.

## How humanpass works

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  User device │         │   humanpass  │         │  Your server │
│              │         │    server    │         │              │
│  Fingerprint ├────────►│  Receives    ├────────►│  Verifies    │
│  or Face ID  │ crypto  │  signature   │  API    │  the code    │
│              │ sig     │  + public key│  call   │              │
│  Biometric   │         │              │         │              │
│  NEVER       │         │  No biometric│         │              │
│  leaves      │         │  data stored │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

1. The user taps their fingerprint or Face ID on their own device
2. The device's secure enclave creates a **cryptographic signature** — the biometric never leaves the device
3. Humanpass receives only the signature + a public key, and generates a short-lived verification link (expires in 60 seconds)
4. Anyone can click the link to verify, or your backend can verify it via API

This is the same **WebAuthn/passkeys** standard used by Google, Apple, and GitHub for login. We just use it for a different purpose: proving humanness instead of identity.

## Why not a CAPTCHA?

| | CAPTCHA | Humanpass |
|---|---|---|
| AI bots | GPT-4V already solves visual CAPTCHAs | Can't fake a fingerprint |
| CAPTCHA farms | $2 per 1,000 solved | Requires the real biometric |
| Privacy | reCAPTCHA tracks via Google cookies | No cookies, no tracking |
| Data collected | Browsing behavior, cookies | Random ID + public key only |
| What it proves | "Probably not a bot" | "A human was physically present at this time" |

## Privacy by design

Humanpass stores **zero personal data**:

- No email, no name, no phone number
- No cookies, no tracking
- Biometric data never leaves the device's secure enclave
- Server only stores: a random credential ID + public key + timestamps
- All verification links expire after 60 seconds

You don't have to trust us — [read the code](https://github.com/jordi-zaragoza/humanpass).

## Integration

### Frontend (SDK)

```html
<script src="https://human-pass.org/sdk.js"></script>

<button onclick="verifyHuman()">Verify I'm human</button>

<script>
async function verifyHuman() {
  try {
    // Optional: bind verification to a username to prevent link reuse
    const result = await Humanpass.verify({ label: currentUser.username });
    // result = { verified, shortCode, createdAt }
    // Send shortCode to your backend for validation
    await fetch('/your-api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: result.shortCode })
    });
  } catch (err) {
    // User closed the popup without verifying
  }
}
</script>
```

### Backend verification

```
GET https://human-pass.org/api/v1/verify/:code
GET https://human-pass.org/api/v1/verify/:code?label=username
```

Public endpoint. No authentication required. CORS enabled for all origins.

**Verified:**
```json
{
  "verified": true,
  "shortCode": "20260223-1432-rSBp",
  "createdAt": "2026-02-23T14:32:44.565Z",
  "label": "u/jordi-zaragoza"
}
```

**Invalid or expired:**
```json
{
  "verified": false
}
```

**Label mismatch** (someone tried to reuse another user's link):
```json
{
  "verified": true,
  "labelMismatch": true
}
```

### Example (Node.js)

```js
const code = /* code submitted by the user */;
const username = req.user.username; // the logged-in user

const res = await fetch(
  `https://human-pass.org/api/v1/verify/${code}?label=${username}`
);
const data = await res.json();

if (data.verified && !data.labelMismatch) {
  // Human verified AND this verification belongs to this user
}
```

### Best practices

- **Call from your backend**, not from client-side JavaScript. This prevents users from spoofing responses.
- **Check `createdAt`** to ensure the code is recent. Links expire after 60 seconds, but you can enforce your own window.
- **Use each code once.** Store verified codes to prevent reuse.
- **Use labels** to bind verifications to specific users, preventing someone from sharing or reusing another person's link.

## Chrome Extension

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/humanpass/ndglfpaoghonkmlihklbdnaplcbbldmd) — verify with one click from any website.

## Tech stack

- [Hono](https://hono.dev) on Cloudflare Workers
- WebAuthn / passkeys via `@simplewebauthn/server`
- Cloudflare D1 (SQLite) for storage
- Cloudflare KV for ephemeral sync tokens
- Turborepo monorepo with pnpm
- Chrome Extension (Manifest V3)
- JavaScript SDK for third-party integration

## Known limitations

- **USB security keys** (e.g., YubiKey) pass verification since WebAuthn doesn't distinguish biometric vs non-biometric authenticators at the relying party level. Exploring attestation-based filtering.
- **Authenticate-then-handoff**: A human could verify and then hand control to a bot. The 60-second expiry mitigates this but doesn't eliminate it entirely.
- **Platform adoption**: Most useful when integrated directly into platforms (forums, social media) rather than as standalone links.

## License

[BSL 1.1](LICENSE) — free for non-commercial use. Converts to Apache 2.0 on 2030-02-23.
