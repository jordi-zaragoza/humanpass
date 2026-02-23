import { layout } from "./layout.js";
import type { Link } from "../types.js";

export function verifyPage(link: Link, origin: string): string {
  const date = new Date(link.created_at);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const url = `${origin}/v/${link.short_code}`;
  const ogDesc = `Verified human — link generated on ${formatted}`;

  return layout({
    title: "Verified human — humanpass",
    description: ogDesc,
    ogTitle: "Verified human",
    ogDescription: ogDesc,
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <a href="/app" class="btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Get your own</a>
    </nav>

    <div style="text-align: center; padding: 2rem 0;">
      <div class="badge">
        <span class="badge-check">&#10003;</span>
        Verified human
      </div>
      <p class="timestamp">Link generated on ${formatted}</p>
      <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
        This link was created by a real person who verified their identity
        using device biometrics (Face ID, fingerprint) via
        <a href="/">humanpass</a>.
      </p>
      <p style="font-size: 0.85rem; color: #888;">
        No personal data is stored. The biometric check never leaves the device.
      </p>
    </div>
    `,
  });
}

export function verifyNotFoundPage(): string {
  return layout({
    title: "Link not found — humanpass",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <div class="not-found">
      <h1>Link not found</h1>
      <p>This verification link doesn't exist or may have been removed.</p>
      <a href="/" class="btn" style="margin-top: 1rem;">Go to humanpass</a>
    </div>
    `,
  });
}
