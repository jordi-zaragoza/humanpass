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
    <p style="font-size:1.1rem;color:#555;">Add human verification to your site in minutes. No API keys, no cost.</p>

    <div style="margin:2.5rem 0;border-top:1px solid #eee;"></div>

    <h2>Popup SDK <span style="font-size:0.75rem;font-weight:400;background:#ecfdf5;color:#065f46;padding:0.2rem 0.5rem;border-radius:4px;vertical-align:middle;">Recommended</span></h2>
    <p style="font-size:0.95rem;color:#555;">A popup handles the entire verification flow. Your user verifies with biometrics, and you get the result via a promise.</p>

    <div style="display:grid;grid-template-columns:1fr;gap:1rem;margin:1.25rem 0 2rem;">
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>1.</strong> Add the SDK script to your page.
      </div>
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>2.</strong> Call <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">Humanpass.verify()</code> &mdash; a popup opens and the user verifies with biometrics.
      </div>
      <div style="padding:1rem 1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        <strong>3.</strong> Send the returned code to your backend and verify it with our API.
      </div>
    </div>

    <h3 style="font-size:1rem;">Frontend</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;"><span style="color:#7dd3fc;">&lt;script</span> <span style="color:#86efac;">src</span>=<span style="color:#fde68a;">"https://human-pass.org/sdk.js"</span><span style="color:#7dd3fc;">&gt;&lt;/script&gt;</span>

<span style="color:#7dd3fc;">&lt;button</span> <span style="color:#86efac;">onclick</span>=<span style="color:#fde68a;">"verifyHuman()"</span><span style="color:#7dd3fc;">&gt;</span>Verify I'm human<span style="color:#7dd3fc;">&lt;/button&gt;</span>

<span style="color:#7dd3fc;">&lt;script&gt;</span>
<span style="color:#7dd3fc;">async function</span> verifyHuman() {
  <span style="color:#7dd3fc;">try</span> {
    <span style="color:#fca5a5;">// Pass the user's username to bind the verification to them</span>
    <span style="color:#7dd3fc;">const</span> result = <span style="color:#7dd3fc;">await</span> Humanpass.verify({ label: currentUser.username });
    <span style="color:#fca5a5;">// result = { verified, shortCode, createdAt }</span>
    <span style="color:#fca5a5;">// Send shortCode to your backend for validation</span>
    <span style="color:#7dd3fc;">await</span> fetch(<span style="color:#86efac;">'/your-api/verify'</span>, {
      method: <span style="color:#86efac;">'POST'</span>,
      headers: { <span style="color:#86efac;">'Content-Type'</span>: <span style="color:#86efac;">'application/json'</span> },
      body: JSON.stringify({ code: result.shortCode })
    });
  } <span style="color:#7dd3fc;">catch</span> (err) {
    <span style="color:#fca5a5;">// User closed the popup without verifying</span>
  }
}
<span style="color:#7dd3fc;">&lt;/script&gt;</span></pre>

    <h3 style="font-size:1rem;">Options</h3>
    <div style="margin:0.75rem 0 1.5rem;">
      <div style="padding:0.75rem 1rem;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
        <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;font-size:0.85rem;">{ label: "username" }</code>
        <span style="font-size:0.8rem;color:#888;margin-left:0.5rem;">optional</span>
        <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">Binds the verification to a specific user. Pass the user's username so your backend can later verify it matches with <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">?label=</code>. The user doesn't need to type anything &mdash; the label is set automatically.</p>
      </div>
    </div>

    <h3 style="font-size:1rem;">Backend validation</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;"><span style="color:#fca5a5;">// In your backend route handler:</span>
<span style="color:#7dd3fc;">const</span> { code } = req.body;
<span style="color:#7dd3fc;">const</span> username = req.user.username; <span style="color:#fca5a5;">// the logged-in user</span>

<span style="color:#7dd3fc;">const</span> res = <span style="color:#7dd3fc;">await</span> fetch(
  <span style="color:#86efac;">\`https://human-pass.org/api/v1/verify/\${code}?label=\${username}\`</span>
);
<span style="color:#7dd3fc;">const</span> data = <span style="color:#7dd3fc;">await</span> res.json();

<span style="color:#7dd3fc;">if</span> (data.verified) {
  <span style="color:#fca5a5;">// Human verified AND label matches this user</span>
} <span style="color:#7dd3fc;">else if</span> (data.labelMismatch) {
  <span style="color:#fca5a5;">// Someone tried to use another user's verification</span>
}</pre>

    <div style="text-align:center;padding:2rem;background:#fff;border:2px dashed #d1d5db;border-radius:12px;margin:0.5rem 0 2rem;">
      <p style="font-size:0.95rem;color:#555;margin-bottom:1rem;">See it in action:</p>
      <button class="btn" id="demo-btn">Try it live</button>
      <div id="demo-result" style="display:none;margin-top:1.25rem;text-align:left;">
        <div id="demo-success" style="display:none;">
          <div class="badge" style="font-size:0.9rem;margin-bottom:0.75rem;">
            <span class="badge-check">&#10003;</span> Verified!
          </div>
          <pre id="demo-json" style="background:#111;color:#e5e7eb;padding:1rem;border-radius:8px;font-size:0.8rem;line-height:1.5;overflow-x:auto;margin-top:0.75rem;"></pre>
        </div>
        <p id="demo-error" style="display:none;color:#dc2626;font-size:0.9rem;"></p>
      </div>
    </div>

    <div style="margin:2rem 0;border-top:1px solid #eee;"></div>

    <h2>Manual flow <span style="font-size:0.75rem;font-weight:400;color:#888;">Alternative</span></h2>
    <p style="font-size:0.95rem;color:#555;">If you prefer not to use the SDK, users can verify on humanpass directly and paste their code into your platform.</p>

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

    <h3 style="font-size:1rem;margin-top:1.5rem;">Query parameters</h3>
    <div style="margin:0.75rem 0 1.5rem;">
      <div style="padding:0.75rem 1rem;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
        <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;font-size:0.85rem;">?label=username</code>
        <span style="font-size:0.8rem;color:#888;margin-left:0.5rem;">optional</span>
        <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">If provided, the API checks that the link's label matches. Returns <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">verified: false</code> on mismatch. Use this to prevent link reuse by a different user.</p>
      </div>
    </div>

    <h3 style="font-size:1rem;margin-top:1.5rem;">Successful verification</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;">{
  "verified": true,
  "shortCode": "20260223-1432-rSBp",
  "createdAt": "2026-02-23T14:32:44.565Z",
  "label": "u/jordi-zaragoza"  <span style="color:#fca5a5;">// only if label was passed via SDK or app</span>
}</pre>

    <h3 style="font-size:1rem;">Invalid or expired code</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;">{
  "verified": false
}</pre>

    <h3 style="font-size:1rem;">Label mismatch</h3>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0.75rem 0 1.5rem;">{
  "verified": false,
  "labelMismatch": true
}</pre>

    <div style="margin:2rem 0;border-top:1px solid #eee;"></div>

    <h2>Examples</h2>
    <p style="font-size:0.9rem;color:#666;margin-bottom:0.75rem;">Basic verification (Node.js):</p>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0 0 1.5rem;"><span style="color:#7dd3fc;">const</span> code = <span style="color:#fca5a5;">/* code submitted by the user */</span>;

<span style="color:#7dd3fc;">const</span> res = <span style="color:#7dd3fc;">await</span> fetch(
  <span style="color:#86efac;">\`https://human-pass.org/api/v1/verify/\${code}\`</span>
);
<span style="color:#7dd3fc;">const</span> data = <span style="color:#7dd3fc;">await</span> res.json();

<span style="color:#7dd3fc;">if</span> (data.verified) {
  <span style="color:#fca5a5;">// Check the code is recent (links expire after 1 min)</span>
  <span style="color:#7dd3fc;">const</span> age = Date.now() - <span style="color:#7dd3fc;">new</span> Date(data.createdAt).getTime();
  <span style="color:#7dd3fc;">if</span> (age < <span style="color:#fde68a;">120_000</span>) {
    <span style="color:#fca5a5;">// Human verified</span>
  }
}</pre>

    <p style="font-size:0.9rem;color:#666;margin-bottom:0.75rem;">Verify with username (prevents link reuse by another user):</p>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0 0 1.5rem;"><span style="color:#7dd3fc;">const</span> code = <span style="color:#fca5a5;">/* code submitted by the user */</span>;
<span style="color:#7dd3fc;">const</span> username = <span style="color:#fca5a5;">/* the user's username on your platform */</span>;

<span style="color:#7dd3fc;">const</span> res = <span style="color:#7dd3fc;">await</span> fetch(
  <span style="color:#86efac;">\`https://human-pass.org/api/v1/verify/\${code}?label=\${username}\`</span>
);
<span style="color:#7dd3fc;">const</span> data = <span style="color:#7dd3fc;">await</span> res.json();

<span style="color:#7dd3fc;">if</span> (data.verified) {
  <span style="color:#fca5a5;">// Human verified AND the label matches this user</span>
} <span style="color:#7dd3fc;">else if</span> (data.labelMismatch) {
  <span style="color:#fca5a5;">// Valid code but generated for a different user</span>
}</pre>

    <p style="font-size:0.9rem;color:#666;margin-bottom:0.75rem;">With cURL:</p>
    <pre style="background:#111;color:#e5e7eb;padding:1.25rem;border-radius:10px;overflow-x:auto;font-size:0.85rem;line-height:1.5;margin:0 0 2rem;"><span style="color:#fca5a5;"># Basic</span>
curl https://human-pass.org/api/v1/verify/20260223-1432-rSBp

<span style="color:#fca5a5;"># With label check</span>
curl "https://human-pass.org/api/v1/verify/20260223-1432-rSBp?label=u/jordi-zaragoza"</pre>

    <div style="margin:0 0;border-top:1px solid #eee;"></div>

    <div style="margin:2rem 0;">
      <h2>Best practices</h2>
      <ul style="margin:0.75rem 0 0 1.25rem;color:#444;font-size:0.95rem;line-height:1.8;">
        <li><strong>Call from your backend</strong>, not from client-side JavaScript. This prevents users from spoofing responses.</li>
        <li><strong>Check <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">createdAt</code></strong> to ensure the code is recent. Links expire after 1 minute, but you can enforce your own window (e.g. 2 minutes).</li>
        <li><strong>Use <code style="background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;">?label=</code></strong> to verify the link belongs to a specific user. This prevents someone from reusing another person's verification link.</li>
        <li><strong>Use each code once.</strong> Store verified codes to prevent reuse.</li>
      </ul>
    </div>

    <div style="text-align:center;padding:2.5rem 0;background:#f9fafb;border-radius:16px;margin:1rem 0 2rem;">
      <p style="font-size:1.05rem;color:#333;margin-bottom:1rem;">Want API keys, webhooks, and custom branding?</p>
      <p style="color:#666;font-size:0.9rem;">Coming soon. <a href="mailto:info@human-pass.org">Get in touch</a> for early access.</p>
    </div>

    <script src="/sdk.js"></script>
    <script>
      document.getElementById('demo-btn').addEventListener('click', async function() {
        var btn = this;
        var result = document.getElementById('demo-result');
        var success = document.getElementById('demo-success');
        var jsonEl = document.getElementById('demo-json');
        var errorEl = document.getElementById('demo-error');

        btn.disabled = true;
        btn.textContent = 'Waiting...';
        result.style.display = 'none';
        success.style.display = 'none';
        errorEl.style.display = 'none';

        try {
          var data = await Humanpass.verify();
          result.style.display = '';
          success.style.display = '';
          jsonEl.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
          result.style.display = '';
          errorEl.style.display = '';
          errorEl.textContent = err.message;
        }
        btn.disabled = false;
        btn.textContent = 'Try it live';
      });
    </script>

    <footer style="text-align:center;padding:1.5rem 0;color:#aaa;font-size:0.8rem;">
      <a href="/" style="color:#aaa;">humanpass</a> &middot; <a href="https://github.com/jordi-zaragoza/humanpass" style="color:#aaa;">GitHub</a> &middot; <a href="/privacy" style="color:#aaa;">Privacy</a>
    </footer>
    `,
  });
}
