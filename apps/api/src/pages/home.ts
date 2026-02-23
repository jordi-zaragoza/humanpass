import { layout } from "./layout.js";

export function homePage(): string {
  return layout({
    title: "humanpass — proof of humanness for the AI era",
    description: "Prove you're human with biometrics. No passwords, no personal data. Get a verification link in seconds.",
    body: `
    <div class="hero" style="text-align:center;padding:4rem 0 2.5rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">
        <span style="background:#ecfdf5;border:2px solid #059669;border-radius:50%;width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;">&#10003;</span>
      </div>
      <h1 style="font-size:2.25rem;line-height:1.2;margin-bottom:1rem;">Prove you're human.<br><span style="color:#059669;">In one tap.</span></h1>
      <p style="font-size:1.15rem;color:#555;max-width:480px;margin:0 auto 2rem;">
        The internet is flooded with bots and AI-generated content.
        humanpass gives you a verification link that proves there's a real person behind your words.
      </p>
      <a href="/app" class="btn" style="padding:1rem 2.5rem;font-size:1.1rem;border-radius:12px;">Get your link</a>
      <p style="margin-top:0.75rem;font-size:0.85rem;color:#999;">Free. No signup. No email. Just biometrics.</p>
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

    <div style="text-align:center;margin-bottom:2rem;">
      <h2 style="font-size:1.4rem;margin-bottom:1.5rem;">Why humanpass?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;text-align:left;">
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">No passwords</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">Passkeys only. Your biometrics never leave your device.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">No personal data</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">No email, no name, no tracking. Completely anonymous.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">Instant</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">One biometric check. Your link is ready in seconds.</p>
        </div>
        <div style="padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <strong style="font-size:0.95rem;">Open & verifiable</strong>
          <p style="font-size:0.85rem;color:#666;margin:0.25rem 0 0;">Anyone can click your link to verify. No app needed.</p>
        </div>
      </div>
    </div>

    <div style="text-align:center;padding:2.5rem 0;background:#f9fafb;border-radius:16px;margin-bottom:2rem;">
      <p style="font-size:1.1rem;color:#333;margin-bottom:1rem;">Ready to prove you're human?</p>
      <a href="/app" class="btn" style="padding:0.9rem 2rem;font-size:1rem;border-radius:12px;">Get your link</a>
    </div>

    <footer style="text-align:center;padding:1.5rem 0;color:#aaa;font-size:0.8rem;">
      humanpass &mdash; proof of humanness for the internet
      <br><a href="/privacy" style="color:#aaa;">Privacy Policy</a>
    </footer>
    `,
  });
}
