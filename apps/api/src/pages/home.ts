import { layout } from "./layout.js";

export function homePage(): string {
  return layout({
    title: "humanpass — proof of humanness",
    body: `
    <div class="hero">
      <h1>humanpass</h1>
      <p>Prove you're human. No passwords, no personal data.</p>
      <p>
        Verify your humanness with your device's biometrics (Face ID, fingerprint),
        then generate a link to paste alongside your online content.
        Anyone can click it to confirm a real human is behind it.
      </p>
    </div>

    <div class="section">
      <h2>How it works</h2>
      <p>1. Register with a passkey (uses your device biometrics — nothing leaves your device).</p>
      <p>2. Generate a verification link.</p>
      <p>3. Paste it next to your post, review, or comment.</p>
      <p>4. Anyone who clicks the link sees proof that a verified human created it.</p>
    </div>

    <div class="section">
      <a href="/app" class="btn">Get started</a>
    </div>

    `,
  });
}
