import qrcode from "qrcode-generator";

const API = typeof chrome !== "undefined" && chrome.runtime?.getManifest?.().host_permissions?.[0]?.includes("localhost")
  ? "http://localhost:8787"
  : "https://human-pass.org";
const POLL_INTERVAL = 2000;
const LINK_TTL = 60;

const qrEl = document.getElementById("qr");
const statusEl = document.getElementById("status");
const qrSection = document.getElementById("qr-section");
const resultSection = document.getElementById("result-section");

let syncToken = generateToken();
let pollTimer = null;
let currentCreatedAt = null;

init();

function generateToken() {
  return Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
}

function init() {
  showQR();
  startPolling();
}

function showQR() {
  const url = `${API}/app?sync=${syncToken}`;
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  qrEl.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 3 });
}

function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(pollSync, POLL_INTERVAL);
}

async function pollSync() {
  try {
    const res = await fetch(`${API}/api/v1/sync/${syncToken}`);
    const data = await res.json();

    if (data.scanned && !data.ready) {
      showWaiting();
    }

    if (data.ready && data.createdAt !== currentCreatedAt) {
      clearInterval(pollTimer);
      showLink(data);
    }
  } catch (_) {}
}

function showWaiting() {
  if (document.getElementById("waiting-spinner")) return;
  qrSection.querySelector("p").style.display = "none";
  qrEl.style.display = "none";
  statusEl.innerHTML =
    '<p style="color:#059669;font-size:0.85rem;">QR scanned! Waiting for verification...</p>' +
    '<div id="waiting-spinner" style="margin-top:12px;">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round">' +
    '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">' +
    '<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>' +
    "</path></svg></div>";
}

function showLink(data) {
  currentCreatedAt = data.createdAt;
  qrSection.style.display = "none";
  resultSection.style.display = "";
  resultSection.innerHTML =
    '<div id="link-active">' +
    '<div class="badge"><span>&#10003;</span> Link generated!</div>' +
    '<div class="link-box" id="copy-box">' +
    '<svg id="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
    '<svg id="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><polyline points="20 6 9 17 4 12"/></svg>' +
    '<code>' + data.url + "</code></div>" +
    '<p id="copy-msg" style="margin-top:6px;font-size:0.8rem;color:#888;">Click to copy</p>' +
    '<p id="countdown" class="countdown"></p>' +
    "</div>" +
    '<div id="link-expired" style="display:none;">' +
    '<p class="expired">Link expired</p>' +
    '<p style="font-size:0.8rem;color:#888;margin-top:4px;">Tap <strong>Renew</strong> on your phone to get a new link.</p>' +
    '<p id="renew-waiting" style="font-size:0.8rem;color:#059669;margin-top:8px;">Waiting for renewal...</p>' +
    '<button class="btn" id="reset-btn" style="margin-top:8px;font-size:0.8rem;background:#f3f4f6;color:#555;border:1px solid #d1d5db;">Start over</button>' +
    "</div>";

  document.getElementById("copy-box").addEventListener("click", () => {
    navigator.clipboard.writeText(data.url);
    const box = document.getElementById("copy-box");
    box.style.borderColor = "#059669";
    box.style.background = "#ecfdf5";
    document.getElementById("copy-icon").style.display = "none";
    document.getElementById("check-icon").style.display = "";
    const msg = document.getElementById("copy-msg");
    msg.textContent = "Copied!";
    msg.style.color = "#059669";
    setTimeout(() => {
      box.style.borderColor = "#d1d5db";
      box.style.background = "#f3f4f6";
      document.getElementById("copy-icon").style.display = "";
      document.getElementById("check-icon").style.display = "none";
      msg.textContent = "Click to copy";
      msg.style.color = "#888";
    }, 2000);
  });

  document.getElementById("reset-btn").addEventListener("click", reset);

  startCountdown(new Date(data.createdAt).getTime());
}

function startCountdown(createdTime) {
  const el = document.getElementById("countdown");
  function tick() {
    const remaining = Math.max(0, Math.ceil(LINK_TTL - (Date.now() - createdTime) / 1000));
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    el.textContent = "Expires in " + min + ":" + (sec < 10 ? "0" : "") + sec;
    if (remaining <= 0) {
      document.getElementById("link-active").style.display = "none";
      document.getElementById("link-expired").style.display = "";
      // Resume polling — phone renew will update sync KV, we'll pick it up
      startPolling();
      return;
    }
    setTimeout(tick, 1000);
  }
  tick();
}

function reset() {
  currentCreatedAt = null;
  syncToken = generateToken();
  resultSection.style.display = "none";
  resultSection.innerHTML = "";
  qrSection.style.display = "";
  qrSection.querySelector("p").style.display = "";
  qrEl.style.display = "";
  statusEl.innerHTML = "";
  showQR();
  startPolling();
}
