// ============================================================
//  countdown.js — Official Release Countdown Popup
//  Target: June 8, 2026 8:00 PM GMT+8 (12:00 UTC)
//  - Popup cannot be closed until countdown reaches zero
//  - Popup auto-dismisses when timer hits zero
// ============================================================

(function () {
  // June 8, 2026 20:00:00 GMT+8 = June 8, 2026 12:00:00 UTC
  const RELEASE_TIME = new Date('2026-06-08T00:00:00Z').getTime();
  const STORAGE_KEY = 'idvle_countdown_dismissed';

  // If already past release time and user has seen the popup, don't show again
  if (Date.now() >= RELEASE_TIME && localStorage.getItem(STORAGE_KEY) === '1') return;

  // If we're already past release and they've never seen it — still show briefly then dismiss
  // (edge case: they open after launch but before dismissal was stored)

  // ── Inject styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'idvle-countdown-style';
  style.textContent = `
    #idvle-countdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: idvle-fade-in 0.5s ease;
    }

    @keyframes idvle-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes idvle-pop-in {
      0%   { transform: scale(0.85); opacity: 0; }
      70%  { transform: scale(1.03); }
      100% { transform: scale(1);    opacity: 1; }
    }

    @keyframes idvle-countdown-pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.06); }
    }

    @keyframes idvle-fade-out {
      from { opacity: 1; transform: scale(1); }
      to   { opacity: 0; transform: scale(0.9); }
    }

    #idvle-countdown-card {
      background: #fff;
      border-radius: 24px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5);
      overflow: hidden;
      animation: idvle-pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-top: 8px solid #16a34a;
      text-align: center;
    }

    .idvle-cd-header {
      padding: 28px 24px 0;
    }

    .-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin: 0 auto 12px;
      display: block;
      border-radius: 16px;
    }

    .-title {
      font-size: 22px;
      font-weight: 900;
      color: #1a1a2e;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    .-date-badge {
      display: inline-block;
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      border-radius: 99px;
      padding: 4px 14px;
      margin-bottom: 20px;
      letter-spacing: 0.3px;
    }

    .idvle-cd-blocks {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 0 24px 24px;
      flex-wrap: wrap;
    }

    .idvle-cd-block {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 10px 10px;
      min-width: 72px;
      flex: 1;
      max-width: 88px;
      transition: border-color 0.2s;
    }

    .idvle-cd-block.ticking {
      animation: idvle-countdown-pulse 0.3s ease;
      border-color: #86efac;
    }

    .idvle-cd-num {
      font-size: 36px;
      font-weight: 900;
      color: #16a34a;
      line-height: 1;
      display: block;
      font-variant-numeric: tabular-nums;
    }

    .idvle-cd-label {
      font-size: 10px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
      display: block;
    }

    .idvle-cd-footer {
      background: #f0fdf4;
      border-top: 1px solid #d1fae5;
      padding: 12px 24px;
    }

    .idvle-cd-footer p {
      font-size: 11px;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .idvle-cd-footer strong {
      color: #15803d;
    }

    /* Dark mode support */
    html.dark-pre #idvle-countdown-card,
    .dark #idvle-countdown-card {
      background: #1e2433;
      border-top-color: #22c55e;
    }
    html.dark-pre .idvle-cd-title,
    .dark .idvle-cd-title { color: #f1f5f9; }
    html.dark-pre .idvle-cd-block,
    .dark .idvle-cd-block  { background: #2d3748; border-color: #4a5568; }
    html.dark-pre .idvle-cd-footer,
    .dark .idvle-cd-footer { background: #16a34a18; border-color: #166534; }
    html.dark-pre .idvle-cd-date-badge,
    .dark .idvle-cd-date-badge { background: #16a34a22; border-color: #166534; }

    /* Mobile adjustments */
    @media (max-width: 420px) {
      .idvle-cd-num { font-size: 28px; }
      .idvle-cd-block { min-width: 58px; padding: 10px 6px 8px; }
    }
  `;
  document.head.appendChild(style);

  // ── Build the overlay HTML ─────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'idvle-countdown-overlay';
  overlay.innerHTML = `
    <div id="idvle-countdown-card">
      <div class="idvle-cd-header">
        <img class="idvle-cd-logo" src="images/umawordle logo.png" alt="IDVLE Logo"
             onerror="this.style.display='none'">
        <h2 class="idvle-cd-title">IDVLE is Almost Here!</h2>
        <p class="idvle-cd-subtitle">
          Identity V: Wordle is launching officially.<br>
          Get ready to test your knowledge!
        </p>
        <div class="idvle-cd-date-badge">📅 June 8, 2026 · 8:00 AM (GMT+8)</div>
      </div>

      <div class="idvle-cd-blocks">
        <div class="idvle-cd-block" id="idvle-cd-days">
          <span class="idvle-cd-num" id="idvle-cd-d">--</span>
          <span class="idvle-cd-label">Days</span>
        </div>
        <div class="idvle-cd-block" id="idvle-cd-hours">
          <span class="idvle-cd-num" id="idvle-cd-h">--</span>
          <span class="idvle-cd-label">Hours</span>
        </div>
        <div class="idvle-cd-block" id="idvle-cd-minutes">
          <span class="idvle-cd-num" id="idvle-cd-m">--</span>
          <span class="idvle-cd-label">Mins</span>
        </div>
        <div class="idvle-cd-block" id="idvle-cd-seconds">
          <span class="idvle-cd-num" id="idvle-cd-s">--</span>
          <span class="idvle-cd-label">Secs</span>
        </div>
      </div>

      <div class="idvle-cd-footer">
        <p>🔒 This popup will close automatically at launch.<br>
           <strong>Hang tight — the game will be ready soon!</strong>
        </p>
      </div>
    </div>
  `;

  // Prevent any click from bubbling through the overlay
  overlay.addEventListener('click', function (e) { e.stopPropagation(); });
  // Block Escape key, scrolling
  document.addEventListener('keydown', blockKeys, true);
  function blockKeys(e) {
    if (e.key === 'Escape') e.preventDefault();
  }

  document.body.appendChild(overlay);

  // ── Ticker ────────────────────────────────────────────────
  const elD = document.getElementById('idvle-cd-d');
  const elH = document.getElementById('idvle-cd-h');
  const elM = document.getElementById('idvle-cd-m');
  const elS = document.getElementById('idvle-cd-s');

  const blockD = document.getElementById('idvle-cd-days');
  const blockH = document.getElementById('idvle-cd-hours');
  const blockM = document.getElementById('idvle-cd-minutes');
  const blockSec = document.getElementById('idvle-cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function pulseBlock(el) {
    el.classList.remove('ticking');
    // Force reflow so animation replays
    void el.offsetWidth;
    el.classList.add('ticking');
  }

  let prevSeconds = -1;
  let prevMinutes = -1;
  let prevHours   = -1;
  let prevDays    = -1;

  function tick() {
    const now  = Date.now();
    const diff = RELEASE_TIME - now;

    if (diff <= 0) {
      // Time's up — launch!
      dismiss();
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const secs  = totalSecs % 60;
    const mins  = Math.floor(totalSecs / 60) % 60;
    const hours = Math.floor(totalSecs / 3600) % 24;
    const days  = Math.floor(totalSecs / 86400);

    elD.textContent = pad(days);
    elH.textContent = pad(hours);
    elM.textContent = pad(mins);
    elS.textContent = pad(secs);

    if (secs  !== prevSeconds) { pulseBlock(blockSec); prevSeconds = secs; }
    if (mins  !== prevMinutes) { pulseBlock(blockM);   prevMinutes = mins; }
    if (hours !== prevHours)   { pulseBlock(blockH);   prevHours   = hours; }
    if (days  !== prevDays)    { pulseBlock(blockD);   prevDays    = days; }
  }

  function dismiss() {
    clearInterval(timer);
    document.removeEventListener('keydown', blockKeys, true);
    localStorage.setItem(STORAGE_KEY, '1');

    const card = document.getElementById('idvle-countdown-card');
    if (card) {
      card.style.animation = 'idvle-fade-out 0.6s ease forwards';
    }
    overlay.style.animation = 'idvle-fade-in 0.6s ease reverse forwards';
    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 650);
  }

  tick(); // Run immediately so numbers show at once
  const timer = setInterval(tick, 1000);
})();
