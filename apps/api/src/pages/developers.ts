import { layout } from "./layout.js";

export function developersPage(): string {
  return layout({
    title: "humanpass — developers",
    description: "Integrate human verification into your platform with a single API call.",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <a href="/app" style="font-size:0.9rem;">Get your link</a>
    </nav>

    <h1>Verify humans from your platform</h1>
    <p style="font-size:1.1rem;color:#555;">One API call to check if a user is a real person. No API keys, no SDK, no cost.</p>

    <div style="margin:2.5rem 0;border-top:1px solid #eee;"></div>

    <h2>How it works</h2>
    <div style="display:grid;grid-template-columns:1fr;gap:1rem;margin:1.25rem 0 2rem;">
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>1.</strong> Your user authenticates on humanpass with their biometrics and gets a verification code.
      </div>
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>2.</strong> They paste the code (or full link) on your platform.
      </div>
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>3.</strong> Your backend calls our API to verify it.
      </div>
    </div>

    <div style="margin:2rem 0;border-top:1px solid #eee;"></div>

    <h2>API endpoint</h2>
    <div style="margin:1rem 0 0.5rem;">
      <code style="background:#f3f4f6;padding:0.5rem 0.75rem;border-radius:6px;font-size:0.95rem;display:inline-block;">GET /api/v1/verify/:code</code>
    </div>
    <p style="font-size:0.9rem;color:#666;">Public endpoint. No authentication required. CORS enabled for all origins.</p>

    <h3 style="font-size:1rem;margin-top:1.5rem;">Successful verification</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;">{
  "verified": true,
  "shortCode": "20260223-1432-rSBp",
  "createdAt": "2026-02-23T14:32:44.565Z"
}</pre>

    <h3 style="font-size:1rem;">Invalid or expired code</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;">{
  "verified": false
}</pre>

    <div style="margin:2rem 0;border-top:1px solid #eee;"></div>

    <h2>Example</h2>
    <p style="font-size:0.9rem;color:#666;margin-bottom:0.75rem;">From your backend (Node.js):</p>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0 0 1.5rem;"><span style="color:#7dd3fc;">const</span> code = <span style="color:#fca5a5;">/* code submitted by the user */</span>;

<span style="color:#7dd3fc;">const</span> res = <span style="color:#7dd3fc;">await</span> fetch(
  <span style="color:#86efac;">\`https://humanpass.latent-k.workers.dev/api/v1/verify/\${code}\`</span>
);
<span style="color:#7dd3fc;">const</span> data = <span style="color:#7dd3fc;">await</span> res.json();

<span style="color:#7dd3fc;">if</span> (data.verified) {
  <span style="color:#fca5a5;">// Check the code is recent (links expire after 1 min)</span>
  <span style="color:#7dd3fc;">const</span> age = Date.now() - <span style="color:#7dd3fc;">new</span> Date(data.createdAt).getTime();
  <span style="color:#7dd3fc;">if</span> (age < <span style="color:#fde68a;">120_000</span>) {
    <span style="color:#fca5a5;">// Human verified</span>
  }
}</pre>

    <p style="font-size:0.9rem;color:#666;margin-bottom:0.75rem;">With cURL:</p>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0 0 2rem;">curl https://humanpass.latent-k.workers.dev/api/v1/verify/20260223-1432-rSBp</pre>

    <div style="margin:0 0;border-top:1px solid #eee;"></div>

    <div style="margin:2rem 0;">
      <h2>Best practices</h2>
      <ul style="margin:0.75rem 0 0 1.25rem;color:#444;font-size:0.95rem;line-height:1.8;">
        <li><strong>Call from your backend</strong>, not from client-side JavaScript. This prevents users from spoofing responses.</li>
        <li><strong>Check <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">createdAt</code></strong> to ensure the code is recent. Links expire after 1 minute, but you can enforce your own window (e.g. 2 minutes).</li>
        <li><strong>Use each code once.</strong> Store verified codes to prevent reuse.</li>
      </ul>
    </div>

    <div style="text-align:center;padding:2.5rem 0;background:#f9fafb;border-radius:16px;margin:1rem 0 2rem;">
      <p style="font-size:1.05rem;color:#333;margin-bottom:1rem;">Want API keys, webhooks, and custom branding?</p>
      <p style="color:#666;font-size:0.9rem;">Coming soon. <a href="mailto:hello@humanpass.dev">Get in touch</a> for early access.</p>
    </div>

    <footer style="text-align:center;padding:1.5rem 0;color:#aaa;font-size:0.8rem;">
      <a href="/" style="color:#aaa;">humanpass</a> &middot; <a href="https://github.com/jordi-zaragoza/humanpass" style="color:#aaa;">GitHub</a> &middot; <a href="/privacy" style="color:#aaa;">Privacy</a>
    </footer>
    `,
  });
}
