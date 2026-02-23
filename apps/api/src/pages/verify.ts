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
      <p style="margin-top: 1.5rem; font-size: 0.8rem; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.75rem 1rem; max-width: 420px; margin-left: auto; margin-right: auto;">
        If the message where you found this link was posted at a different time than shown above, it may not have been written by a human.
      </p>
    </div>
    `,
  });
}

export function verifyFraudPage(): string {
  return layout({
    title: "Suspicious link — humanpass",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <div style="text-align: center; padding: 2rem 0;">
      <div style="font-size:2.5rem;margin-bottom:1rem;color:#dc2626;">&#9888;</div>
      <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Suspicious activity detected</h1>
      <p style="color:#666;margin-bottom:1.5rem;">This link was shared across multiple sites, which is not consistent with normal human behavior.</p>
      <a href="/" class="btn" style="margin-top: 1rem;">Go to humanpass</a>
    </div>
    `,
  });
}

export function verifyExpiredPage(): string {
  return layout({
    title: "Link expired — humanpass",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <div style="text-align: center; padding: 2rem 0;">
      <div style="font-size:2.5rem;margin-bottom:1rem;color:#d97706;">&#9202;</div>
      <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">This link has expired</h1>
      <p style="color:#666;margin-bottom:1.5rem;">This verification link is no longer valid.</p>
      <a href="/app" class="btn" style="margin-top: 1rem;">Get a new link</a>
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
