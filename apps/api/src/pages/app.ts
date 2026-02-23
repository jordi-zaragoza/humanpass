import { layout } from "./layout.js";

export function appPage(linkUrl: string, syncToken?: string): string {
  const message = syncToken
    ? '<p style="color:#059669;font-weight:600;margin-bottom:0.5rem;">Link generated and sent to your computer!</p>'
    : '';

  return layout({
    title: "humanpass — dashboard",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <button class="btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;" id="logout-btn">Log out</button>
    </nav>

    <div class="section" style="text-align: center; padding: 2rem 0;">
      <div class="badge" style="margin-bottom: 1rem;">
        <span class="badge-check">&#10003;</span>
        Verified human
      </div>
      ${message}
      <div style="margin-top: 1rem;">
        <code id="link-url" style="cursor:pointer;padding:0.75rem 1.25rem;font-size:1.05rem;display:inline-block;">${linkUrl}</code>
      </div>
      <p style="margin-top: 0.5rem; color: #888; font-size: 0.9rem;" id="copy-msg">Tap to copy</p>
    </div>

    <script>
      document.getElementById('link-url').addEventListener('click', function() {
        navigator.clipboard.writeText(this.textContent);
        document.getElementById('copy-msg').textContent = 'Copied!';
        setTimeout(function() { document.getElementById('copy-msg').textContent = 'Tap to copy'; }, 2000);
      });

      document.getElementById('logout-btn').addEventListener('click', async function() {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        location.href = '/';
      });
    </script>
    `,
  });
}

export function registerPage(syncToken?: string): string {
  return layout({
    title: "humanpass — register",
    body: `
    <nav class="nav">
      <a href="/" class="nav-brand">humanpass</a>
      <span></span>
    </nav>

    <h1>Create your passkey</h1>
    <p>Use your device's biometrics (Face ID, fingerprint) to register. No password needed.</p>

    <div class="section" id="qr-section" style="text-align: center; display: none;">
      <p style="font-size: 0.95rem; color: #555; margin-bottom: 1rem;">Scan with your phone to register:</p>
      <div id="qr"></div>
      <div id="sync-status" style="margin-top: 1rem;"></div>
    </div>

    <div class="section" id="register-section" style="display: none;">
      <button class="btn" id="register-btn">Register with passkey</button>
      <div id="error" class="error"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <script>
      // Only show QR on desktop (no touch = not a phone)
      var isPhone = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isPhone) {
        document.getElementById('register-section').style.display = '';
      } else {
        document.getElementById('qr-section').style.display = '';

        var syncToken = Array.from({length:32},()=>Math.random().toString(36)[2]).join('');
        var qrUrl = window.location.origin + '/app?sync=' + syncToken;
        var qr = qrcode(0, 'M');
        qr.addData(qrUrl);
        qr.make();
        document.getElementById('qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4 });

        var syncStatus = document.getElementById('sync-status');
        var pollInterval = setInterval(async function() {
        try {
          var res = await fetch('/api/v1/sync/' + syncToken);
          var data = await res.json();
          if (data.ready) {
            clearInterval(pollInterval);
            syncStatus.innerHTML =
              '<div class="badge" style="font-size: 1rem; margin-bottom: 0.75rem;">' +
              '<span class="badge-check">&#10003;</span> Link generated!</div>' +
              '<div style="margin-top: 0.5rem;"><code id="sync-link" style="cursor:pointer;padding:0.5rem 1rem;font-size:1rem;">' +
              data.url + '</code></div>' +
              '<p style="margin-top: 0.5rem; color: #059669; font-size: 0.9rem;" id="sync-copy-msg">Tap the link to copy</p>';
            document.getElementById('sync-link').addEventListener('click', function() {
              navigator.clipboard.writeText(data.url);
              document.getElementById('sync-copy-msg').textContent = 'Copied!';
            });
          }
        } catch(e) {}
      }, 2000);
      } // end if desktop
    </script>

    <script type="module">
      import { startRegistration } from 'https://esm.sh/@simplewebauthn/browser@11';

      // Grab sync token from URL if present (phone opened via QR)
      const params = new URLSearchParams(window.location.search);
      const phoneSyncToken = params.get('sync');

      const regBtn = document.getElementById('register-btn');
      if (regBtn) regBtn.addEventListener('click', async () => {
        regBtn.disabled = true;
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = '';

        try {
          const optRes = await fetch('/api/v1/auth/register/options', { method: 'POST' });
          const { options, userId } = await optRes.json();
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
          // Preserve sync token so dashboard auto-generates link
          location.href = phoneSyncToken ? '/app?sync=' + phoneSyncToken : '/app';
        } catch (err) {
          errorDiv.textContent = err.message || 'Registration failed. Please try again.';
          regBtn.disabled = false;
        }
      });
    </script>
    `,
  });
}
