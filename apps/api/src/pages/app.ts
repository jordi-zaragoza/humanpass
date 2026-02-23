import { layout } from "./layout.js";

export function appPage(linkUrl: string, createdAt: string, syncToken?: string): string {
  const message = syncToken
    ? '<p style="color:#059669;font-weight:600;margin-bottom:0.5rem;">Link generated and sent to your computer!</p>'
    : '';

  return layout({
    title: "humanpass — dashboard",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <div class="section" style="text-align: center; padding: 2rem 0;">
      <div class="badge" style="margin-bottom: 1rem;">
        <span class="badge-check">&#10003;</span>
        Verified human
      </div>
      ${message}
      <div id="link-active">
        <p style="margin-top: 1.5rem; color: #555; font-size: 0.95rem; margin-bottom: 0.5rem;">Your verification link:</p>
        <div id="link-box" style="cursor:pointer;display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.25rem;background:#f3f4f6;border:2px solid #d1d5db;border-radius:10px;transition:border-color 0.2s,background 0.2s;">
          <svg id="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg id="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><polyline points="20 6 9 17 4 12"/></svg>
          <code id="link-url" style="font-size:1.05rem;background:none;padding:0;">${linkUrl}</code>
        </div>
        <p id="copy-msg" style="margin-top: 0.5rem; color: #888; font-size: 0.85rem;">Click to copy</p>
        <p id="countdown" style="margin-top: 0.75rem; font-size: 0.9rem; color: #d97706; font-weight: 600;"></p>
      </div>
      <div id="link-expired" style="display:none;">
        <p style="margin-top: 1.5rem; font-size: 1.1rem; color: #d97706; font-weight: 600;">Link expired</p>
        <p style="color: #888; font-size: 0.9rem; margin-bottom: 1rem;">Generate a new one to continue sharing.</p>
        <button class="btn" id="renew-btn">Generate new link</button>
      </div>
    </div>

    <script>
      var linkBox = document.getElementById('link-box');
      var copyMsg = document.getElementById('copy-msg');
      var copyIcon = document.getElementById('copy-icon');
      var checkIcon = document.getElementById('check-icon');

      linkBox.addEventListener('click', function() {
        navigator.clipboard.writeText(document.getElementById('link-url').textContent);
        linkBox.style.borderColor = '#059669';
        linkBox.style.background = '#ecfdf5';
        copyIcon.style.display = 'none';
        checkIcon.style.display = '';
        copyMsg.textContent = 'Copied to clipboard!';
        copyMsg.style.color = '#059669';
        setTimeout(function() {
          linkBox.style.borderColor = '#d1d5db';
          linkBox.style.background = '#f3f4f6';
          copyIcon.style.display = '';
          checkIcon.style.display = 'none';
          copyMsg.textContent = 'Click to copy';
          copyMsg.style.color = '#888';
        }, 3000);
      });

      // Countdown timer
      var createdAt = new Date('${createdAt}').getTime();
      var ttl = 60; // 1 minute
      var countdownEl = document.getElementById('countdown');

      function updateCountdown() {
        var elapsed = (Date.now() - createdAt) / 1000;
        var remaining = Math.max(0, Math.ceil(ttl - elapsed));
        var min = Math.floor(remaining / 60);
        var sec = remaining % 60;
        countdownEl.textContent = 'Expires in ' + min + ':' + (sec < 10 ? '0' : '') + sec;
        if (remaining <= 0) {
          document.getElementById('link-active').style.display = 'none';
          document.getElementById('link-expired').style.display = '';
          return;
        }
        setTimeout(updateCountdown, 1000);
      }
      updateCountdown();

      document.getElementById('renew-btn').addEventListener('click', async function() {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        location.href = '/app${syncToken ? "?sync=" + syncToken : ""}';
      });
    </script>

    <footer style="text-align:center;padding:2rem 0 0;color:#aaa;font-size:0.8rem;">
      <a href="/privacy" style="color:#aaa;">Privacy Policy</a>
    </footer>
    `,
  });
}

export function authPage(syncToken?: string): string {
  return layout({
    title: "humanpass — sign in",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <h1>Continue with passkey</h1>
    <p>Use your device's biometrics (Face ID, fingerprint) to sign in or register. No password needed.</p>

    <div class="section" id="qr-section" style="text-align: center; display: none;">
      <p style="font-size: 0.95rem; color: #555; margin-bottom: 1rem;">Scan with your phone to continue:</p>
      <div id="qr"></div>
      <div id="sync-status" style="margin-top: 1rem;"></div>
    </div>

    <div class="section" id="auth-section" style="display: none;">
      <button class="btn" id="auth-btn">Continue with passkey</button>
      <div id="error" class="error"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <script>
      // Only show QR on desktop (no touch = not a phone)
      var isPhone = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isPhone) {
        document.getElementById('auth-section').style.display = '';
      } else {
        document.getElementById('qr-section').style.display = '';

        var syncToken = Array.from({length:32},()=>Math.random().toString(36)[2]).join('');
        var qrUrl = window.location.origin + '/app?sync=' + syncToken;
        var qr = qrcode(0, 'M');
        qr.addData(qrUrl);
        qr.make();
        document.getElementById('qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4 });

        var syncStatus = document.getElementById('sync-status');
        var currentCreatedAt = null;

        function showSyncLink(data) {
          currentCreatedAt = data.createdAt;
          syncStatus.innerHTML =
            '<div id="sync-active">' +
            '<div class="badge" style="font-size: 1rem; margin-bottom: 0.75rem;">' +
            '<span class="badge-check">&#10003;</span> Link generated!</div>' +
            '<p style="margin-top: 1rem; color: #555; font-size: 0.95rem; margin-bottom: 0.5rem;">Your verification link:</p>' +
            '<div id="sync-box" style="cursor:pointer;display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.25rem;background:#f3f4f6;border:2px solid #d1d5db;border-radius:10px;transition:border-color 0.2s,background 0.2s;">' +
            '<svg id="sync-copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
            '<svg id="sync-check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<code id="sync-link" style="font-size:1rem;background:none;padding:0;">' + data.url + '</code></div>' +
            '<p style="margin-top: 0.5rem; color: #888; font-size: 0.85rem;" id="sync-copy-msg">Click to copy</p>' +
            '<p id="sync-countdown" style="margin-top: 0.75rem; font-size: 0.9rem; color: #d97706; font-weight: 600;"></p>' +
            '</div>' +
            '<div id="sync-expired" style="display:none;">' +
            '<p style="margin-top: 1.5rem; font-size: 1.1rem; color: #d97706; font-weight: 600;">Link expired</p>' +
            '<p style="color: #888; font-size: 0.9rem;">Scan the QR code again from your phone to get a new link.</p>' +
            '</div>';
          document.getElementById('sync-box').addEventListener('click', function() {
            navigator.clipboard.writeText(data.url);
            this.style.borderColor = '#059669';
            this.style.background = '#ecfdf5';
            document.getElementById('sync-copy-icon').style.display = 'none';
            document.getElementById('sync-check-icon').style.display = '';
            var msg = document.getElementById('sync-copy-msg');
            msg.textContent = 'Copied to clipboard!';
            msg.style.color = '#059669';
            setTimeout(function() {
              document.getElementById('sync-box').style.borderColor = '#d1d5db';
              document.getElementById('sync-box').style.background = '#f3f4f6';
              document.getElementById('sync-copy-icon').style.display = '';
              document.getElementById('sync-check-icon').style.display = 'none';
              msg.textContent = 'Click to copy';
              msg.style.color = '#888';
            }, 3000);
          });
          // Countdown
          var syncCreated = new Date(data.createdAt).getTime();
          var syncCountdownEl = document.getElementById('sync-countdown');
          function updateSyncCountdown() {
            var elapsed = (Date.now() - syncCreated) / 1000;
            var remaining = Math.max(0, Math.ceil(60 - elapsed));
            var min = Math.floor(remaining / 60);
            var sec = remaining % 60;
            syncCountdownEl.textContent = 'Expires in ' + min + ':' + (sec < 10 ? '0' : '') + sec;
            if (remaining <= 0) {
              document.getElementById('sync-active').style.display = 'none';
              document.getElementById('sync-expired').style.display = '';
              return;
            }
            setTimeout(updateSyncCountdown, 1000);
          }
          updateSyncCountdown();
        }

        var pollInterval = setInterval(async function() {
        try {
          var res = await fetch('/api/v1/sync/' + syncToken);
          var data = await res.json();
          if (data.scanned && !data.ready) {
            document.getElementById('qr').style.display = 'none';
            document.querySelector('#qr-section > p').style.display = 'none';
            syncStatus.innerHTML = '<p style="color:#059669;font-size:0.9rem;">QR scanned! Waiting for biometric verification on your phone...</p><p style="color:#888;font-size:0.8rem;margin-top:0.25rem;">It can take a few seconds.</p>';
          }
          if (data.ready && data.createdAt !== currentCreatedAt) {
            showSyncLink(data);
          }
        } catch(e) {}
      }, 2000);
      } // end if desktop
    </script>

    <script type="module">
      import { startAuthentication, startRegistration } from 'https://esm.sh/@simplewebauthn/browser@11';

      // Grab sync token from URL if present (phone opened via QR)
      const params = new URLSearchParams(window.location.search);
      const phoneSyncToken = params.get('sync');

      const authBtn = document.getElementById('auth-btn');
      if (authBtn) authBtn.addEventListener('click', async () => {
        authBtn.disabled = true;
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = '';

        try {
          // 1. Try login first (existing passkey)
          try {
            const loginOptRes = await fetch('/api/v1/auth/login/options', { method: 'POST' });
            const loginOptData = await loginOptRes.json();
            if (loginOptRes.ok) {
              const credential = await startAuthentication({ optionsJSON: loginOptData.options });
              const verifyRes = await fetch('/api/v1/auth/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: credential }),
              });
              if (verifyRes.ok) {
                location.href = phoneSyncToken ? '/app?sync=' + phoneSyncToken : '/app';
                return;
              }
            }
          } catch (_e) {
            // No passkey found or user cancelled — fall through to register
          }

          // 2. Fallback: register new passkey
          const optRes = await fetch('/api/v1/auth/register/options', { method: 'POST' });
          const optData = await optRes.json();
          if (!optRes.ok) throw new Error(optData.error || 'Failed to get registration options');
          const { options, userId } = optData;
          const credential = await startRegistration({ optionsJSON: options });
          const verifyRes = await fetch('/api/v1/auth/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: credential, userId }),
          });
          if (!verifyRes.ok) {
            const data = await verifyRes.json();
            throw new Error(data.error || 'Registration failed');
          }
          location.href = phoneSyncToken ? '/app?sync=' + phoneSyncToken : '/app';
        } catch (err) {
          errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
          authBtn.disabled = false;
        }
      });
    </script>

    <footer style="text-align:center;padding:2rem 0 0;color:#aaa;font-size:0.8rem;">
      <a href="/privacy" style="color:#aaa;">Privacy Policy</a>
    </footer>
    `,
  });
}
