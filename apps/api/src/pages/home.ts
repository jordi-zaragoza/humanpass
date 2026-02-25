import { layout } from "./layout.js";

export function homePage(): string {
  return layout({
    title: "humanpass — proof of humanness for the AI era",
    description: "Prove you're human with biometrics. No passwords, no personal data. Get a verification link in seconds.",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <a href="/developers" style="font-size:0.9rem;color:#666;text-decoration:none;">Developers</a>
    </nav>

    <div class="hero" style="text-align:center;padding:4rem 0 2.5rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">
        <span style="background:#ecfdf5;border:2px solid #059669;border-radius:50%;width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;">&#10003;</span>
      </div>
      <h1 style="font-size:2.25rem;line-height:1.2;margin-bottom:1rem;">Prove you're human.<br><span style="color:#059669;">In one tap.</span></h1>
      <p style="font-size:1.15rem;color:#555;max-width:480px;margin:0 auto 2rem;">
        The internet is flooded with bots and AI-generated content.
        humanpass uses <strong>WebAuthn/passkeys</strong> &mdash; the same standard behind Google, Apple, and GitHub logins &mdash;
        to give you a verification link that proves there's a real person behind your words.
      </p>
      <a href="/app" class="btn" style="padding:1rem 2.5rem;font-size:1.1rem;border-radius:12px;">Get your link</a>
      <p style="margin-top:0.75rem;font-size:0.85rem;color:#999;">Free. No signup. No email. Just biometrics.</p>
      <p id="stats" style="margin-top:1rem;font-size:0.9rem;color:#059669;font-weight:600;opacity:0;transition:opacity 0.3s;"></p>
    </div>

    <div style="margin:3rem 0;border-top:1px solid #eee;"></div>

    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-size:1.4rem;margin-bottom:2rem;">How it works</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;text-align:center;">
        <div>
          <div style="font-size:2rem;margin-bottom:0.5rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
          </div>
          <h3 style="font-size:1rem;margin-bottom:0.25rem;">1. Tap to verify</h3>
          <p style="font-size:0.9rem;color:#666;">Use Face ID, fingerprint, or your device's biometrics. Nothing leaves your device.</p>
        </div>
        <div>
          <div style="font-size:2rem;margin-bottom:0.5rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <h3 style="font-size:1rem;margin-bottom:0.25rem;">2. Get your link</h3>
          <p style="font-size:0.9rem;color:#666;">You get a timestamped verification URL. Links expire after one minute.</p>
        </div>
        <div>
          <div style="font-size:2rem;margin-bottom:0.5rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 style="font-size:1rem;margin-bottom:0.25rem;">3. Share it</h3>
          <p style="font-size:0.9rem;color:#666;">Add it to your post or comment. Anyone can click to confirm you're real.</p>
        </div>
      </div>
    </div>

    <div style="margin:0 0 3rem;border-top:1px solid #eee;"></div>

    <div style="max-width:520px;margin:0 auto 3rem;padding:1.5rem;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;">
      <h2 style="font-size:1.1rem;margin-bottom:1rem;text-align:center;">Your biometric data never leaves your device</h2>
      <div style="display:flex;align-items:center;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <div style="text-align:center;flex:1;min-width:140px;">
          <div style="font-size:2rem;margin-bottom:0.25rem;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
          </div>
          <p style="font-size:0.8rem;color:#065f46;margin:0;font-weight:600;">Your device</p>
          <p style="font-size:0.75rem;color:#666;margin:0.15rem 0 0;">Face ID / fingerprint<br>stays here</p>
        </div>
        <div style="font-size:1.5rem;color:#059669;flex-shrink:0;">&#10132;</div>
        <div style="text-align:center;flex:1;min-width:140px;">
          <div style="font-size:2rem;margin-bottom:0.25rem;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
          </div>
          <p style="font-size:0.8rem;color:#065f46;margin:0;font-weight:600;">Our server</p>
          <p style="font-size:0.75rem;color:#666;margin:0.15rem 0 0;">Only receives a<br>cryptographic signature</p>
        </div>
      </div>
      <p style="font-size:0.8rem;color:#666;text-align:center;margin:1rem 0 0;">We store a random ID and a public key. No fingerprint, no face scan, no personal info. <a href="/privacy" style="color:#059669;">Privacy policy</a></p>
    </div>

    <div style="text-align:center;margin-bottom:3rem;">
      <h2 style="font-size:1.4rem;margin-bottom:0.5rem;">Try it yourself</h2>
      <p style="font-size:0.95rem;color:#666;margin-bottom:1.5rem;">See what a verified message looks like. Click the button to verify with your biometrics.</p>

      <div id="demo-post" style="max-width:480px;margin:0 auto;text-align:left;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:1.25rem;position:relative;">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
          <div style="width:40px;height:40px;background:#e5e7eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#888;">?</div>
          <div>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <strong style="font-size:0.9rem;">You</strong>
              <span id="demo-badge" style="display:none;background:#ecfdf5;color:#059669;font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:99px;">&#10003; Verified human</span>
            </div>
            <span id="demo-time" style="font-size:0.8rem;color:#999;">just now</span>
          </div>
        </div>
        <p style="font-size:0.9rem;color:#333;line-height:1.5;margin-bottom:1rem;">Hey, I just wanted to share my thoughts on this. I know it's hard to tell who's real online these days, so here's my proof:</p>
        <div id="demo-link-area">
          <button id="demo-verify-btn" class="btn" style="padding:0.6rem 1.5rem;font-size:0.9rem;border-radius:10px;">Verify yourself</button>
        </div>
      </div>

      <div style="display:flex;justify-content:center;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;">
        <span style="font-size:0.8rem;color:#999;background:#f3f4f6;padding:0.35rem 0.75rem;border-radius:99px;">Social media</span>
        <a href="/forum" style="font-size:0.8rem;color:#999;background:#f3f4f6;padding:0.35rem 0.75rem;border-radius:99px;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#999'">Forums</a>
        <span style="font-size:0.8rem;color:#999;background:#f3f4f6;padding:0.35rem 0.75rem;border-radius:99px;">Chat</span>
        <span style="font-size:0.8rem;color:#999;background:#f3f4f6;padding:0.35rem 0.75rem;border-radius:99px;">Email</span>
        <span style="font-size:0.8rem;color:#999;background:#f3f4f6;padding:0.35rem 0.75rem;border-radius:99px;">Any website</span>
      </div>
    </div>

    <script>
      fetch('/api/v1/stats').then(function(r){return r.json()}).then(function(d){
        if (d.verifications >= 100) {
          var el = document.getElementById('stats');
          el.textContent = d.verifications.toLocaleString() + ' verifications made';
          el.style.opacity = '1';
        }
      });
    </script>

    <script src="/sdk.js"></script>
    <script>
      document.getElementById('demo-verify-btn').addEventListener('click', function() {
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        Humanpass.verify().then(function(data) {
          document.getElementById('demo-badge').style.display = '';
          document.getElementById('demo-link-area').innerHTML =
            '<a href="' + data.url + '" target="_blank" style="font-size:0.85rem;color:#059669;text-decoration:underline;word-break:break-all;">' + data.url + '</a>';
        }).catch(function() {
          btn.disabled = false;
          btn.textContent = 'Verify yourself';
        });
      });
    </script>

    <div style="margin:0 0 3rem;border-top:1px solid #eee;"></div>

    <div style="text-align:center;margin-bottom:2rem;">
      <h2 style="font-size:1.4rem;margin-bottom:1.5rem;">Why humanpass?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;text-align:left;">
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">No passwords</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">Uses WebAuthn passkeys &mdash; the same standard trusted by Google, Apple, and GitHub.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">Zero personal data</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">No email, no name, no tracking. Your biometric never leaves your device &mdash; we only see a cryptographic signature.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">Instant</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">One biometric check. Your link is ready in seconds.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">100% Open Source</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">All our code is public on <a href="https://github.com/jordi-zaragoza/humanpass" style="color:#059669;font-weight:500;">GitHub</a>. Trust nothing blindly &mdash; verify it yourself.</p>
        </div>
      </div>
    </div>

    <div style="margin:0 0 3rem;border-top:1px solid #eee;"></div>

    <div style="text-align:center;padding:2.5rem 0;background:#f9fafb;border-radius:16px;margin-bottom:2rem;">
      <p style="font-size:1.1rem;color:#333;margin-bottom:1.25rem;">Ready to prove you're human?</p>
      <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
        <a href="/app" class="btn" style="padding:0.9rem 2rem;font-size:1rem;border-radius:12px;">Get your link</a>
        <a href="https://chromewebstore.google.com/detail/humanpass/ndglfpaoghonkmlihklbdnaplcbbldmd" style="font-size:1rem;color:#555;text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 2rem;border:1.5px solid #d1d5db;border-radius:12px;transition:border-color 0.2s,background 0.2s;"
           onmouseover="this.style.borderColor='#059669';this.style.background='#f0fdf4'"
           onmouseout="this.style.borderColor='#d1d5db';this.style.background='transparent'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
          Chrome Extension
        </a>
      </div>
    </div>

    <footer style="text-align:center;padding:1.5rem 0;color:#aaa;font-size:0.8rem;">
      humanpass &mdash; proof of humanness for the internet
      <br><a href="/developers" style="color:#aaa;">Developers</a> &middot; <a href="https://github.com/jordi-zaragoza/humanpass" style="color:#aaa;">GitHub</a> &middot; <a href="/privacy" style="color:#aaa;">Privacy Policy</a>
    </footer>
    `,
  });
}
