import { layout } from "./layout.js";

export function appPage(linkUrl: string, shortCode: string, label: string | null, createdAt: string, syncToken?: string): string {
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
        <div id="label-section" style="margin-top: 1.25rem;">
          <div id="label-display" style="display:${label ? '' : 'none'};font-size:0.9rem;color:#065f46;">
            <span id="label-text">${label ? label.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</span>
            <button id="label-edit-btn" style="background:none;border:none;color:#059669;cursor:pointer;font-size:0.8rem;text-decoration:underline;margin-left:0.5rem;">edit</button>
          </div>
          <div id="label-form" style="display:${label ? 'none' : ''};max-width:320px;margin:0 auto;">
            <p style="font-size:0.8rem;color:#888;margin-bottom:0.4rem;">Add your username (optional):</p>
            <div style="display:flex;gap:0.5rem;align-items:center;justify-content:center;">
              <input id="label-input" type="text" maxlength="100" placeholder="e.g. u/your-username" value="${label ? label.replace(/"/g, '&quot;') : ''}" style="padding:0.4rem 0.75rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:0.85rem;width:200px;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#d1d5db'">
              <button id="label-save-btn" class="btn" style="padding:0.4rem 0.75rem;font-size:0.8rem;border-radius:8px;">Save</button>
            </div>
            <p id="label-msg" style="margin-top:0.25rem;font-size:0.8rem;color:#059669;display:none;"></p>
          </div>
        </div>
      </div>
      <div id="link-expired" style="display:none;">
        <p style="margin-top: 1.5rem; font-size: 1.1rem; color: #d97706; font-weight: 600;">Link expired</p>
        <p style="color: #888; font-size: 0.9rem; margin-bottom: 1rem;">Verify again to get a new link.</p>
        <button class="btn" id="renew-btn">Renew</button>
        <div id="renew-error" class="error" style="margin-top: 0.75rem;"></div>
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

      // Label
      var currentShortCode = '${shortCode}';
      var labelSaveBtn = document.getElementById('label-save-btn');
      var labelInput = document.getElementById('label-input');
      var labelMsg = document.getElementById('label-msg');
      var labelDisplay = document.getElementById('label-display');
      var labelForm = document.getElementById('label-form');
      var labelText = document.getElementById('label-text');

      labelSaveBtn.addEventListener('click', function() {
        var val = labelInput.value.trim();
        if (!val) return;
        labelSaveBtn.disabled = true;
        labelSaveBtn.textContent = '...';
        fetch('/api/v1/links/' + currentShortCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: val }),
        }).then(function(r) { return r.json(); }).then(function(d) {
          if (d.ok) {
            labelText.textContent = val;
            labelForm.style.display = 'none';
            labelDisplay.style.display = '';
          }
          labelSaveBtn.disabled = false;
          labelSaveBtn.textContent = 'Save';
        }).catch(function() {
          labelSaveBtn.disabled = false;
          labelSaveBtn.textContent = 'Save';
        });
      });

      document.getElementById('label-edit-btn').addEventListener('click', function() {
        labelDisplay.style.display = 'none';
        labelForm.style.display = '';
        labelInput.focus();
      });

    </script>

    <script type="module">
      import { startAuthentication } from 'https://esm.sh/@simplewebauthn/browser@11';

      var syncToken = ${syncToken ? `'${syncToken}'` : 'null'};

      document.getElementById('renew-btn').addEventListener('click', async function() {
        var btn = this;
        var errorDiv = document.getElementById('renew-error');
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        errorDiv.textContent = '';

        try {
          // 1. Get passkey options
          var optRes = await fetch('/api/v1/auth/pass/options', { method: 'POST' });
          var optData = await optRes.json();
          if (!optRes.ok) throw new Error(optData.error || 'Failed to get auth options');

          // 2. WebAuthn prompt
          var credential = await startAuthentication({ optionsJSON: optData.options });

          // 3. Verify
          var verifyRes = await fetch('/api/v1/auth/pass/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: credential }),
          });
          if (!verifyRes.ok) throw new Error('Verification failed');

          // 4. Get new link
          var body = syncToken ? JSON.stringify({ syncToken: syncToken }) : '{}';
          var linkRes = await fetch('/api/v1/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
          });
          var linkData = await linkRes.json();
          if (!linkRes.ok) throw new Error(linkData.error || 'Failed to create link');

          // 5. Update UI in place
          document.getElementById('link-url').textContent = linkData.url;
          document.getElementById('link-expired').style.display = 'none';
          document.getElementById('link-active').style.display = '';
          btn.textContent = 'Renew';
          btn.disabled = false;

          // Reset label for new link
          currentShortCode = linkData.shortCode;
          labelDisplay.style.display = 'none';
          labelForm.style.display = '';
          labelInput.value = '';
          labelText.textContent = '';

          // Reset countdown
          createdAt = new Date(linkData.createdAt).getTime();
          updateCountdown();
        } catch (err) {
          errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
          btn.textContent = 'Renew';
          btn.disabled = false;
        }
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
      <p style="margin-top:0.75rem;font-size:0.8rem;color:#888;max-width:360px;margin-left:auto;margin-right:auto;">Your device may ask to "create a passkey" — that's just how it sets up biometric verification.</p>
      <div id="error" class="error"></div>
      <p id="stuck-hint" style="display:none;margin-top:1.25rem;font-size:0.8rem;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.75rem 1rem;max-width:400px;margin-left:auto;margin-right:auto;">
        Stuck? If you use a third-party password manager (NordPass, 1Password, etc.) as your passkey provider, try switching to your device's built-in option (Google Password Manager or iCloud Keychain) in your device settings.
      </p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <script>
      // Only show QR on desktop (no touch = not a phone)
      var isPhone = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isPhone) {
        document.getElementById('auth-section').style.display = '';
      } else {
        document.getElementById('qr-section').style.display = '';

        // Reuse syncToken across reloads so we don't lose the link
        var syncToken = sessionStorage.getItem('syncToken');
        if (!syncToken) {
          syncToken = Array.from({length:32},()=>Math.random().toString(36)[2]).join('');
          sessionStorage.setItem('syncToken', syncToken);
        }
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
            '<p style="color: #888; font-size: 0.9rem;">Tap <strong>Renew</strong> on your phone to get a new link.</p>' +
            '<p style="font-size: 0.85rem; color: #059669; margin-top: 0.5rem;">Waiting for renewal...</p>' +
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
              // Resume polling — phone renew will update sync KV
              if (!pollInterval) pollInterval = setInterval(pollSync, 2000);
              return;
            }
            setTimeout(updateSyncCountdown, 1000);
          }
          updateSyncCountdown();
        }

        function showSpinner() {
          document.getElementById('qr').style.display = 'none';
          document.querySelector('#qr-section > p').style.display = 'none';
          if (!document.getElementById('sync-spinner')) {
            syncStatus.innerHTML = '<p style="color:#059669;font-size:0.9rem;">QR scanned! Waiting for biometric verification on your phone...</p><div id="sync-spinner" style="margin-top:1.25rem;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg></div>';
          }
        }

        async function pollSync() {
          try {
            var res = await fetch('/api/v1/sync/' + syncToken, { cache: 'no-store' });
            var data = await res.json();
            if (data.scanned && !data.ready) {
              showSpinner();
            }
            if (data.ready && data.createdAt !== currentCreatedAt) {
              showSyncLink(data);
              return;
            }
          } catch(e) {}
        }
        // Poll immediately on load to recover state after reload
        pollSync();
        var pollInterval = setInterval(pollSync, 2000);

        // Poll immediately on focus/visibility change (timers throttled in background)
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) pollSync();
        });
        window.addEventListener('focus', pollSync);
      } // end if desktop
    </script>

    <script type="module">
      import { startAuthentication, startRegistration } from 'https://esm.sh/@simplewebauthn/browser@11';

      // Grab sync token from URL if present (phone opened via QR)
      const params = new URLSearchParams(window.location.search);
      const phoneSyncToken = params.get('sync');

      const authBtn = document.getElementById('auth-btn');

      async function doAuth() {
        authBtn.disabled = true;
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = '';
        const stuckTimer = setTimeout(() => {
          document.getElementById('stuck-hint').style.display = '';
        }, 5000);

        try {
          // 1. Try existing passkey first
          try {
            const passOptRes = await fetch('/api/v1/auth/pass/options', { method: 'POST' });
            const passOptData = await passOptRes.json();
            if (passOptRes.ok) {
              const credential = await startAuthentication({ optionsJSON: passOptData.options });
              const verifyRes = await fetch('/api/v1/auth/pass/verify', {
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
          clearTimeout(stuckTimer);
          location.href = phoneSyncToken ? '/app?sync=' + phoneSyncToken : '/app';
        } catch (err) {
          clearTimeout(stuckTimer);
          errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
          authBtn.disabled = false;
          // Show button so user can retry manually
          document.getElementById('auth-section').style.display = '';
        }
      }

      if (authBtn) authBtn.addEventListener('click', doAuth);

      // Auto-trigger auth when arriving from QR scan (skip the button click)
      if (phoneSyncToken && authBtn) {
        document.getElementById('auth-section').style.display = '';
        authBtn.textContent = 'Verifying...';
        doAuth();
      }
    </script>

    <footer style="text-align:center;padding:2rem 0 0;color:#aaa;font-size:0.8rem;">
      <a href="/privacy" style="color:#aaa;">Privacy Policy</a>
    </footer>
    `,
  });
}
