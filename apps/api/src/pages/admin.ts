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
  const maxLinks = Math.max(...stats.linksByDay.map((r) => r.count), 1);
  const chartBars = stats.linksByDay
    .slice()
    .reverse()
    .map((r) => {
      const pct = Math.round((r.count / maxLinks) * 100);
      const label = r.day.slice(5); // MM-DD
      return `<div style="display:flex;align-items:end;flex:1;gap:0;flex-direction:column;align-items:center;">
        <span style="font-size:0.75rem;font-weight:600;color:#111;margin-bottom:4px;">${r.count}</span>
        <div style="width:100%;max-width:48px;height:${Math.max(pct, 4)}px;background:linear-gradient(180deg,#111 0%,#444 100%);border-radius:4px 4px 0 0;"></div>
        <span style="font-size:0.7rem;color:#888;margin-top:6px;">${label}</span>
      </div>`;
    })
    .join("");

  const maxUserLinks = Math.max(...stats.topUsers.map((r) => r.link_count), 1);
  const topUsersRows = stats.topUsers
    .map(
      (r, i) => {
        const pct = Math.round((r.link_count / maxUserLinks) * 100);
        return `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;${i > 0 ? "border-top:1px solid #f0f0f0;" : ""}">
        <span style="color:#aaa;font-size:0.8rem;width:1.2rem;text-align:right;">${i + 1}</span>
        <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <code style="font-size:0.75rem;background:#f3f4f6;padding:2px 6px;border-radius:3px;word-break:break-all;">${r.user_id}</code>
            <span style="font-weight:600;font-size:0.85rem;">${r.link_count}</span>
          </div>
          <div style="height:4px;background:#f0f0f0;border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:#111;border-radius:2px;"></div>
          </div>
        </div>
      </div>`;
      }
    )
    .join("");

  return layout({
    title: "humanpass — admin",
    body: `
    <style>
      .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1rem; }
      .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; text-align: center; }
      .stat-value { font-size: 2rem; font-weight: 700; color: #111; line-height: 1.2; }
      .stat-label { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
      .stat-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-top: 1rem; }
      .stat-card-accent { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 1.25rem; text-align: center; }
      .stat-card-accent .stat-value { color: #16a34a; }
      .chart-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; margin-top: 1rem; }
      .users-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem 1.25rem; margin-top: 1rem; }
    </style>

    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span style="color:#888;font-size:0.85rem;">admin</span>
    </nav>

    <h1>Dashboard</h1>

    <div class="section">
      <h2>Totals</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalUsers}</div>
          <div class="stat-label">Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalCredentials}</div>
          <div class="stat-label">Credentials</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalLinks}</div>
          <div class="stat-label">Links</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Last 24 hours</h2>
      <div class="stat-grid-2">
        <div class="stat-card-accent">
          <div class="stat-value">${stats.newUsers24h}</div>
          <div class="stat-label">New users</div>
        </div>
        <div class="stat-card-accent">
          <div class="stat-value">${stats.newLinks24h}</div>
          <div class="stat-label">New links</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Links per day (last 7 days)</h2>
      ${
        stats.linksByDay.length > 0
          ? `<div class="chart-container">
        <div style="display:flex;align-items:end;gap:0.5rem;height:140px;padding-top:1.5rem;">
          ${chartBars}
        </div>
      </div>`
          : `<p style="color:#888;">No links in the last 7 days.</p>`
      }
    </div>

    <div class="section">
      <h2>Top users by links</h2>
      ${
        stats.topUsers.length > 0
          ? `<div class="users-container">${topUsersRows}</div>`
          : `<p style="color:#888;">No users yet.</p>`
      }
    </div>

    <footer style="text-align:center;padding:2rem 0 1rem;color:#aaa;font-size:0.8rem;">
      <a href="/" style="color:#aaa;">humanpass</a>
    </footer>
    `,
  });
}
