// ============================================================
//  countdown.js — Official Release Countdown Popup
//  Target: June 8, 2026 8:00 AM GMT+8 (00:00 UTC)
//  - Popup cannot be closed until countdown reaches zero
//  - Popup auto-dismisses when timer hits zero
// ============================================================

(function () {
  const RELEASE_TIME = new Date('2026-06-08T00:00:00Z').getTime();
  const STORAGE_KEY  = 'idvle_countdown_dismissed';

  if (Date.now() >= RELEASE_TIME && localStorage.getItem(STORAGE_KEY) === '1') return;

  // ── Styles ─────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'idvle-countdown-style';
  style.textContent = `
    #idvle-countdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: idvle-fade-in 0.4s ease;
    }

    @keyframes idvle-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes idvle-pop-in {
      0%   { transform: scale(0.82); opacity: 0; }
      65%  { transform: scale(1.04); }
      100% { transform: scale(1);    opacity: 1; }
    }
    @keyframes idvle-tick-pop {
      0%, 100% { transform: scale(1);    }
      40%      { transform: scale(1.08); }
    }
    @keyframes idvle-fade-out {
      from { opacity: 1; transform: scale(1);   }
      to   { opacity: 0; transform: scale(0.88); }
    }

    #idvle-countdown-card {
      position: relative;
      background: #0f1923;
      border-radius: 20px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 0 0 1px rgba(34,197,94,0.25), 0 40px 80px rgba(0,0,0,0.7);
      overflow: hidden;
      animation: idvle-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-align: center;
    }

    /* Green glow top bar */
    #idvle-countdown-card::before {
      content: '';
      display: block;
      height: 4px;
      background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80, #22c55e, #16a34a);
      background-size: 200% 100%;
      animation: idvle-shimmer 3s linear infinite;
    }
    @keyframes idvle-shimmer {
      0%   { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    .idvle-cd-body {
      padding: 28px 28px 0;
    }

    .idvle-cd-logo {
      width: 140px;
      height: auto;
      object-fit: contain;
      margin: 0 auto 16px;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(34,197,94,0.3));
    }

    .idvle-cd-title {
      font-size: 20px;
      font-weight: 900;
      color: #f1f5f9;
      margin: 0 0 6px;
      letter-spacing: -0.3px;
    }

    .idvle-cd-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 16px;
      line-height: 1.6;
    }

    .idvle-cd-date-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34,197,94,0.12);
      border: 1px solid rgba(34,197,94,0.35);
      color: #4ade80;
      font-size: 12px;
      font-weight: 700;
      border-radius: 99px;
      padding: 5px 14px;
      margin-bottom: 24px;
      letter-spacing: 0.3px;
    }

    .idvle-cd-blocks {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 0 4px 28px;
    }

    .idvle-cd-block {
      background: #1a2535;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 16px 8px 12px;
      flex: 1;
      min-width: 0;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .idvle-cd-block.ticking {
      animation: idvle-tick-pop 0.25s ease;
      border-color: rgba(34,197,94,0.5);
      box-shadow: 0 0 14px rgba(34,197,94,0.15);
    }

    .idvle-cd-num {
      font-size: 38px;
      font-weight: 900;
      color: #22c55e;
      line-height: 1;
      display: block;
      font-variant-numeric: tabular-nums;
      text-shadow: 0 0 20px rgba(34,197,94,0.4);
    }

    .idvle-cd-label {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-top: 6px;
      display: block;
    }

    .idvle-cd-footer {
      background: rgba(34,197,94,0.06);
      border-top: 1px solid rgba(34,197,94,0.15);
      padding: 14px 24px;
    }

    .idvle-cd-footer p {
      font-size: 11.5px;
      color: #64748b;
      margin: 0;
      line-height: 1.6;
    }

    .idvle-cd-footer strong {
      color: #4ade80;
      font-weight: 700;
    }

    /* Light mode override */
    html:not(.dark-pre) #idvle-countdown-card {
      background: #ffffff;
      box-shadow: 0 0 0 1px rgba(22,163,74,0.2), 0 40px 80px rgba(0,0,0,0.25);
    }
    html:not(.dark-pre) #idvle-countdown-card::before {
      background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80, #22c55e, #16a34a);
      background-size: 200% 100%;
      animation: idvle-shimmer 3s linear infinite;
    }
    html:not(.dark-pre) .idvle-cd-title    { color: #0f172a; }
    html:not(.dark-pre) .idvle-cd-subtitle { color: #6b7280; }
    html:not(.dark-pre) .idvle-cd-block    { background: #f8fafc; border-color: #e2e8f0; }
    html:not(.dark-pre) .idvle-cd-num      { color: #16a34a; text-shadow: none; }
    html:not(.dark-pre) .idvle-cd-label    { color: #9ca3af; }
    html:not(.dark-pre) .idvle-cd-footer   { background: #f0fdf4; border-color: #d1fae5; }
    html:not(.dark-pre) .idvle-cd-footer p { color: #6b7280; }
    html:not(.dark-pre) .idvle-cd-footer strong { color: #15803d; }
    html:not(.dark-pre) .idvle-cd-date-badge {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #16a34a;
    }
    html:not(.dark-pre) .idvle-cd-logo {
      filter: none;
    }
    html:not(.dark-pre) .idvle-cd-block.ticking {
      border-color: #86efac;
      box-shadow: 0 0 10px rgba(22,163,74,0.1);
    }

    @media (max-width: 420px) {
      .idvle-cd-num   { font-size: 28px; }
      .idvle-cd-block { padding: 12px 4px 10px; }
      .idvle-cd-body  { padding: 22px 16px 0; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'idvle-countdown-overlay';
  overlay.innerHTML = `
    <div id="idvle-countdown-card">
      <div class="idvle-cd-body">
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

  overlay.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('keydown', blockKeys, true);
  function blockKeys(e) { if (e.key === 'Escape') e.preventDefault(); }

  document.body.appendChild(overlay);

  // ── Ticker ─────────────────────────────────────────────────
  const elD = document.getElementById('idvle-cd-d');
  const elH = document.getElementById('idvle-cd-h');
  const elM = document.getElementById('idvle-cd-m');
  const elS = document.getElementById('idvle-cd-s');

  const blockD   = document.getElementById('idvle-cd-days');
  const blockH   = document.getElementById('idvle-cd-hours');
  const blockM   = document.getElementById('idvle-cd-minutes');
  const blockSec = document.getElementById('idvle-cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function pulseBlock(el) {
    el.classList.remove('ticking');
    void el.offsetWidth;
    el.classList.add('ticking');
  }

  let prevD = -1, prevH = -1, prevM = -1, prevS = -1;

  function tick() {
    const diff = RELEASE_TIME - Date.now();
    if (diff <= 0) { dismiss(); return; }

    const t = Math.floor(diff / 1000);
    const s = t % 60;
    const m = Math.floor(t / 60) % 60;
    const h = Math.floor(t / 3600) % 24;
    const d = Math.floor(t / 86400);

    elD.textContent = pad(d);
    elH.textContent = pad(h);
    elM.textContent = pad(m);
    elS.textContent = pad(s);

    if (s !== prevS) { pulseBlock(blockSec); prevS = s; }
    if (m !== prevM) { pulseBlock(blockM);   prevM = m; }
    if (h !== prevH) { pulseBlock(blockH);   prevH = h; }
    if (d !== prevD) { pulseBlock(blockD);   prevD = d; }
  }

  function dismiss() {
    clearInterval(timer);
    document.removeEventListener('keydown', blockKeys, true);
    localStorage.setItem(STORAGE_KEY, '1');
    const card = document.getElementById('idvle-countdown-card');
    if (card) card.style.animation = 'idvle-fade-out 0.6s ease forwards';
    overlay.style.transition = 'opacity 0.6s ease';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.remove(); style.remove(); }, 650);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();
