export function layout(opts: {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  body: string;
}): string {
  const desc = opts.description ?? "Proof of humanness for the internet.";
  const ogTitle = opts.ogTitle ?? opts.title;
  const ogDesc = opts.ogDescription ?? desc;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${opts.title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:type" content="website">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fafafa;
      min-height: 100vh;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #444; }
    a { color: #111; }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #111;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }
    .btn:hover { background: #333; }
    .btn:disabled { background: #999; cursor: not-allowed; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: #ecfdf5;
      border: 2px solid #059669;
      border-radius: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #065f46;
    }
    .badge-check { font-size: 1.5rem; }
    .timestamp { color: #666; font-size: 0.9rem; margin-top: 0.5rem; }
    .link-list { list-style: none; margin-top: 1rem; }
    .link-list li {
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .link-list code {
      font-size: 0.85rem;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      word-break: break-all;
    }
    .link-list .date { color: #888; font-size: 0.8rem; white-space: nowrap; }
    .error { color: #dc2626; margin-top: 0.5rem; }
    .not-found {
      text-align: center;
      padding: 3rem 0;
      color: #888;
    }
    .hero { padding: 3rem 0 2rem; }
    .hero p { font-size: 1.1rem; color: #555; }
    .section { margin-top: 2rem; }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
      margin-bottom: 1.5rem;
    }
    .nav-brand { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: #111; }
    #copy-msg {
      display: inline-block;
      margin-left: 0.5rem;
      color: #059669;
      font-size: 0.9rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
  </style>
</head>
<body>
  <div class="container">
    ${opts.body}
  </div>
</body>
</html>`;
}
