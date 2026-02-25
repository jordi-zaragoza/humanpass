import { layout } from "./layout.js";

export function popupPage(): string {
  return layout({
    title: "humanpass — verify",
    body: `
    <div style="text-align:center;padding:1rem 0 0.5rem;">
      <a href="/" class="nav-brand" style="font-size:1.25rem;" target="_blank">humanpass</a>
      <p style="font-size:0.9rem;color:#666;margin-top:0.5rem;">Verify you're human</p>
    </div>

    <div class="section" id="qr-section" style="text-align:center;display:none;">
      <p style="font-size:0.9rem;color:#555;margin-bottom:1rem;">Scan with your phone to verify:</p>
      <div id="qr"></div>
      <div id="sync-status" style="margin-top:1rem;"></div>
    </div>

    <div class="section" id="auth-section" style="display:none;text-align:center;">
      <button class="btn" id="auth-btn" style="width:100%;max-width:320px;">Continue with passkey</button>
      <div id="error" class="error"></div>
    </div>

    <div id="success" style="display:none;text-align:center;padding:2rem 0;">
      <div class="badge" style="font-size:1rem;">
        <span class="badge-check">&#10003;</span>
        Verified!
      </div>
      <p style="margin-top:1rem;color:#666;font-size:0.9rem;">This window will close automatically.</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <script>
      var isPhone = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      function sendResult(data) {
        document.getElementById('qr-section').style.display = 'none';
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('success').style.display = '';
        if (window.opener) {
          window.opener.postMessage(data, '*');
        }
        setTimeout(function() { window.close(); }, 1500);
      }

      if (isPhone) {
        document.getElementById('auth-section').style.display = '';
      } else {
        document.getElementById('qr-section').style.display = '';

        var syncToken = Array.from({length:32},function(){return Math.random().toString(36)[2]}).join('');
        var qrUrl = window.location.origin + '/app?sync=' + syncToken;
        var qr = qrcode(0, 'M');
        qr.addData(qrUrl);
        qr.make();
        document.getElementById('qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4 });

        var syncStatus = document.getElementById('sync-status');
        var pendingResult = null;

        function showSpinner() {
          document.getElementById('qr').style.display = 'none';
          document.querySelector('#qr-section > p').style.display = 'none';
          if (!document.getElementById('sync-spinner')) {
            syncStatus.innerHTML = '<p style="color:#059669;font-size:0.9rem;">QR scanned! Waiting for verification...</p><div id="sync-spinner" style="margin-top:1rem;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg></div>';
          }
        }

        async function pollSync() {
          try {
            var res = await fetch('/api/v1/sync/' + syncToken);
            var data = await res.json();
            if (data.scanned && !data.ready) {
              showSpinner();
            }
            if (data.ready) {
              sendResult({ verified: true, url: data.url, shortCode: data.shortCode, createdAt: data.createdAt });
              return;
            }
          } catch(e) {}
          setTimeout(pollSync, 1000);
        }
        pollSync();

        // Poll immediately on focus/visibility change (timers throttled in background)
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) pollSync();
        });
        window.addEventListener('focus', pollSync);
      }
    </script>

    <script type="module">
      import { startAuthentication, startRegistration } from 'https://esm.sh/@simplewebauthn/browser@11';

      var authBtn = document.getElementById('auth-btn');
      if (authBtn) authBtn.addEventListener('click', async function() {
        authBtn.disabled = true;
        var errorDiv = document.getElementById('error');
        errorDiv.textContent = '';

        try {
          // Try existing passkey first
          try {
            var passOptRes = await fetch('/api/v1/auth/pass/options', { method: 'POST' });
            var passOptData = await passOptRes.json();
            if (passOptRes.ok) {
              var credential = await startAuthentication({ optionsJSON: passOptData.options });
              var verifyRes = await fetch('/api/v1/auth/pass/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: credential }),
              });
              if (verifyRes.ok) {
                var linkRes = await fetch('/api/v1/links', { method: 'POST' });
                var linkData = await linkRes.json();
                sendResult({ verified: true, url: linkData.url, shortCode: linkData.shortCode, createdAt: linkData.createdAt });
                return;
              }
            }
          } catch (_e) {
            // No passkey found or user cancelled — fall through to register
          }

          // Fallback: register new passkey
          var optRes = await fetch('/api/v1/auth/register/options', { method: 'POST' });
          var optData = await optRes.json();
          if (!optRes.ok) throw new Error(optData.error || 'Failed to get registration options');
          var options = optData.options;
          var userId = optData.userId;
          var regCredential = await startRegistration({ optionsJSON: options });
          var regVerifyRes = await fetch('/api/v1/auth/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: regCredential, userId: userId }),
          });
          if (!regVerifyRes.ok) {
            var errData = await regVerifyRes.json();
            throw new Error(errData.error || 'Registration failed');
          }
          var linkRes2 = await fetch('/api/v1/links', { method: 'POST' });
          var linkData2 = await linkRes2.json();
          sendResult({ verified: true, url: linkData2.url, shortCode: linkData2.shortCode, createdAt: linkData2.createdAt });
        } catch (err) {
          errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
          authBtn.disabled = false;
        }
      });
    </script>
    `,
  });
}
