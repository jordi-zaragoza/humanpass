import { layout } from "./layout.js";

export interface AdminStats {
  totalUsers: number;
  totalCredentials: number;
  totalLinks: number;
  newUsers24h: number;
  newLinks24h: number;
  linksByDay: { day: string; count: number }[];
  topUsers: { user_id: string; link_count: number }[];
}

export function adminPage(stats: AdminStats): string {
  const linksByDayRows = stats.linksByDay
    .map((r) => `<tr><td>${r.day}</td><td>${r.count}</td></tr>`)
    .join("");

  const topUsersRows = stats.topUsers
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td><td><code>${r.user_id.slice(0, 8)}…</code></td><td>${r.link_count}</td></tr>`
    )
    .join("");

  return layout({
    title: "humanpass — admin",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span style="color:#888;font-size:0.85rem;">admin</span>
    </nav>

    <h1>Dashboard</h1>

    <div class="section">
      <h2>Totals</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:0.4rem 0;color:#444;">Users</td><td style="text-align:right;font-weight:600;">${stats.totalUsers}</td></tr>
        <tr><td style="padding:0.4rem 0;color:#444;">Credentials</td><td style="text-align:right;font-weight:600;">${stats.totalCredentials}</td></tr>
        <tr><td style="padding:0.4rem 0;color:#444;">Links</td><td style="text-align:right;font-weight:600;">${stats.totalLinks}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>Last 24 hours</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:0.4rem 0;color:#444;">New users</td><td style="text-align:right;font-weight:600;">${stats.newUsers24h}</td></tr>
        <tr><td style="padding:0.4rem 0;color:#444;">New links</td><td style="text-align:right;font-weight:600;">${stats.newLinks24h}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>Links per day (last 7 days)</h2>
      ${
        stats.linksByDay.length > 0
          ? `<table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="text-align:left;padding:0.4rem 0;border-bottom:1px solid #eee;">Day</th><th style="text-align:right;padding:0.4rem 0;border-bottom:1px solid #eee;">Count</th></tr></thead>
        <tbody>${linksByDayRows}</tbody>
      </table>`
          : `<p style="color:#888;">No links in the last 7 days.</p>`
      }
    </div>

    <div class="section">
      <h2>Top 10 users by links</h2>
      ${
        stats.topUsers.length > 0
          ? `<table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="text-align:left;padding:0.4rem 0;border-bottom:1px solid #eee;">#</th><th style="text-align:left;padding:0.4rem 0;border-bottom:1px solid #eee;">User</th><th style="text-align:right;padding:0.4rem 0;border-bottom:1px solid #eee;">Links</th></tr></thead>
        <tbody>${topUsersRows}</tbody>
      </table>`
          : `<p style="color:#888;">No users yet.</p>`
      }
    </div>

    <footer style="text-align:center;padding:2rem 0 1rem;color:#aaa;font-size:0.8rem;">
      <a href="/" style="color:#aaa;">humanpass</a>
    </footer>
    `,
  });
}
