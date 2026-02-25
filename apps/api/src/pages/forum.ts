export function forumPage(origin: string, codes: Record<string, string>): string {
  const posts = [
    {
      username: "dave93",
      color: "#3366CC",
      joinDate: "Mar 2024",
      postCount: 847,
      title: "",
      body: `Ok so is it just me or is like EVERY other person on these forums actually a bot now?? I swear half the replies I get are AI-generated garbage. Someone told me about this thing called <b>humanpass</b> and I tried it. You basically just do a fingerprint/face scan on your phone and it gives you a link that proves you're a real person. No signup, no email, nothing.<br><br>Here's mine, click it if you don't believe me:`,
      signature: `<a href="${origin}/v/${codes.dave}" target="_blank" class="verify-badge">humanpass verified human</a> &mdash; dave`,
    },
    {
      username: "xena_grl",
      color: "#CC3399",
      joinDate: "Jun 2024",
      postCount: 312,
      title: "",
      body: `OMG dave93 THANK YOU for posting this. I've been so frustrated with bots lately. I just tried humanpass and it literally took like 10 seconds?? Used my fingerprint and boom, got a verification link.<br><br>The cool thing is it doesn't store any of your biometric data. It just checks you're human and gives you the proof. No accounts, no passwords, no personal info collected. Just... proof you're real.`,
      signature: `<a href="${origin}/v/${codes.xena}" target="_blank" class="verify-badge">humanpass verified human</a> &mdash; xena<br><span style="font-size:10px;color:#888;">~ i want to believe ~</span>`,
    },
    {
      username: "sk8rboi_2002",
      color: "#339933",
      joinDate: "Jan 2025",
      postCount: 53,
      title: "",
      body: `ngl i was skeptical at first... like "great another verification thing" but this is actually different?<br><br>- no signup or account needed<br>- works with fingerprint or face id on your phone<br>- gives you a link you can share anywhere<br>- people can click it to see you're verified<br><br>i put my link in my sig now. if you see it, you know you're talking to a real person and not some chatgpt wrapper lol`,
      signature: `<a href="${origin}/v/${codes.sk8r}" target="_blank" class="verify-badge">humanpass verified human</a> &mdash; sk8r<br><span style="font-size:10px;color:#888;">pro skater (in tony hawk only)</span>`,
    },
    {
      username: "linda_mod",
      color: "#CC6600",
      joinDate: "Nov 2023",
      postCount: 2841,
      title: "MOD",
      body: `<b>[Moderator Post]</b><br><br>Great discussion everyone. The bot problem has been getting worse and the mod team has been looking into solutions. I checked out humanpass myself and I'm impressed &mdash; it's simple, private, and actually works.<br><br>We're considering encouraging users to add verification links to their signatures. It won't be mandatory, but it would help the community identify real humans at a glance.<br><br>For now, I've added mine below. I'd encourage everyone to do the same.`,
      signature: `<a href="${origin}/v/${codes.linda}" target="_blank" class="verify-badge">humanpass verified human</a> &mdash; linda [MOD]`,
    },
  ];

  const postRows = posts
    .map(
      (p, i) => `
    <tr><td colspan="2" style="background:#8899AA;padding:4px 8px;color:#fff;font-weight:bold;font-size:11px;border-bottom:1px solid #667788;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="color:#fff;font-size:11px;">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="12" height="12" style="background:${p.color};margin-right:4px;vertical-align:middle;" alt="">
          <b>${p.username}</b>${p.title ? ` <span style="background:#FFCC00;color:#000;padding:1px 4px;font-size:9px;border-radius:2px;">${p.title}</span>` : ""}
        </td>
        <td align="right" style="color:#ddd;font-size:10px;">Post #${i + 1} &middot; Today</td>
      </tr></table>
    </td></tr>
    <tr>
      <td valign="top" width="140" style="background:#D8D0C0;padding:8px;border-right:1px solid #BBB;border-bottom:1px solid #BBB;font-size:10px;text-align:center;">
        <div style="width:60px;height:60px;background:${p.color};margin:0 auto 6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;border:2px outset #ccc;">${p.username[0].toUpperCase()}</div>
        <b>${p.username}</b><br>
        ${p.title ? `<span style="color:#CC6600;font-size:9px;font-weight:bold;">${p.title}</span><br>` : ""}
        <span style="color:#666;">Joined: ${p.joinDate}</span><br>
        <span style="color:#666;">Posts: ${p.postCount.toLocaleString()}</span>
      </td>
      <td valign="top" style="background:#F5F0E8;padding:10px 12px;border-bottom:1px solid #BBB;font-size:12px;line-height:1.5;">
        <div style="min-height:80px;">${p.body}</div>
        <div style="border-top:1px dashed #CCC;margin-top:12px;padding-top:8px;font-size:10px;color:#888;">${p.signature}</div>
      </td>
    </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RetroBoard Forums - Is anyone here even real anymore??</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background: #E8E0D0;
    font-family: Verdana, Geneva, Arial, sans-serif;
    font-size: 11px;
    color: #333;
  }
  a { color: #336699; }
  a:hover { color: #CC3300; }
  .wrapper {
    max-width: 860px;
    margin: 0 auto;
    padding: 8px;
  }
  .header-bar {
    background: linear-gradient(to bottom, #334466, #1A2744);
    color: #fff;
    padding: 12px 16px;
    border: 2px outset #556688;
    margin-bottom: 4px;
  }
  .header-bar h1 {
    margin: 0;
    font-size: 20px;
    font-family: "Times New Roman", Times, serif;
    text-shadow: 1px 1px 0 #000;
  }
  .header-bar .subtitle {
    font-size: 10px;
    color: #99AACC;
    margin-top: 2px;
  }
  .nav-bar {
    background: #8899AA;
    padding: 4px 8px;
    font-size: 10px;
    border: 1px solid #667788;
    margin-bottom: 8px;
  }
  .nav-bar a { color: #fff; text-decoration: none; margin-right: 12px; }
  .nav-bar a:hover { text-decoration: underline; }
  .breadcrumb {
    font-size: 10px;
    color: #666;
    margin-bottom: 8px;
    padding: 4px;
  }
  .thread-title {
    background: #334466;
    color: #FFCC00;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    border: 2px outset #556688;
    margin-bottom: 0;
  }
  .posts-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px inset #999;
    background: #F5F0E8;
  }
  .verify-badge {
    display: inline-block;
    background: #1a7a1a;
    color: #fff !important;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: bold;
    text-decoration: none;
    border: 1px outset #2a9a2a;
    cursor: pointer;
  }
  .verify-badge:hover {
    background: #228B22;
    color: #fff !important;
  }
  .marquee-wrap {
    background: #FFFFCC;
    border: 1px solid #CCCC99;
    padding: 4px 0;
    margin-bottom: 8px;
    overflow: hidden;
  }
  .marquee-text {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
    font-size: 11px;
    color: #663300;
  }
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  .footer {
    text-align: center;
    font-size: 9px;
    color: #888;
    padding: 12px 0;
    border-top: 1px solid #CCC;
    margin-top: 12px;
  }
  .footer img { vertical-align: middle; }
  .cta-banner {
    background: #fff;
    border: 2px solid #2563EB;
    border-radius: 8px;
    padding: 20px 24px;
    margin-top: 16px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    color: #333;
  }
  .cta-banner strong {
    font-size: 16px;
    color: #1a1a1a;
  }
  .cta-banner a.btn {
    display: inline-block;
    margin: 8px 6px 0;
    padding: 8px 20px;
    background: #2563EB;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
  }
  .cta-banner a.btn:hover { background: #1d4ed8; }
  .cta-banner a.btn.secondary {
    background: transparent;
    color: #2563EB;
    border: 1px solid #2563EB;
  }
  .cta-banner a.btn.secondary:hover { background: #EFF6FF; }
  .online-strip {
    background: #F0EDE4;
    border: 1px solid #CCC;
    padding: 6px 10px;
    margin-top: 8px;
    font-size: 10px;
    color: #666;
  }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header-bar">
    <h1>RetroBoard Forums</h1>
    <div class="subtitle">Technology &amp; Internet Discussion &mdash; Pair of a Slob's Socks Is The Best Forum Since 1997</div>
  </div>

  <div class="nav-bar">
    <a href="#">Home</a>
    <a href="#">FAQ</a>
    <a href="#">Members</a>
    <a href="#">Search</a>
    <a href="#">Profile</a>
    <a href="#">Log in</a>
  </div>

  <div class="marquee-wrap">
    <span class="marquee-text">Welcome to RetroBoard Forums! Please read the rules before posting. New anti-bot measures now available -- verify your humanity with humanpass! &star; &star; &star;</span>
  </div>

  <div class="breadcrumb">
    <a href="#">RetroBoard</a> &rsaquo; <a href="#">General Discussion</a> &rsaquo; <a href="#">Internet &amp; Technology</a> &rsaquo; <b>Is anyone here even real anymore??</b>
  </div>

  <div class="thread-title">Is anyone here even real anymore??</div>

  <table class="posts-table" cellpadding="0" cellspacing="0">
    ${postRows}
  </table>

  <div class="online-strip">
    Users browsing this thread: <b>dave93</b>, <b>xena_grl</b>, <b>sk8rboi_2002</b>, <b>linda_mod</b>, and 14 guests
  </div>

  <div class="cta-banner">
    <strong>This is a demo.</strong><br>
    The verification links above are real &mdash; click any to see humanpass in action.<br>
    <a href="/" class="btn secondary">Learn more</a>
    <a href="/app" class="btn">Get your own link</a>
  </div>

  <div class="footer">
    Powered by RetroBoard v2.4.1 &copy; 1997-2002 &bull; Best viewed in Netscape Navigator 4.0 at 800x600<br><br>
    <span style="font-size:10px;letter-spacing:1px;color:#aaa;">
      <!-- hit counter -->
      [&nbsp;<span style="font-family:monospace;background:#000;color:#0f0;padding:1px 6px;">004,817</span>&nbsp;visitors&nbsp;]
    </span>
  </div>

</div>
</body>
</html>`;
}
