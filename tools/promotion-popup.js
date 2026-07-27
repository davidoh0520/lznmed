(() => {
  const HIDDEN_UNTIL_KEY = 'lzn-wholesale-promotion-hidden-until';
  const SESSION_SEEN_KEY = 'lzn-wholesale-promotion-seen-v3';
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const params = new URLSearchParams(location.search);
  const forceShow = params.get('show-coupon') === '1';

  if (!forceShow && (
    params.get('open-cart') === '1' ||
    params.get('email-confirmed') === '1' ||
    location.hash.includes('access_token=') ||
    location.hash.includes('type=signup')
  )) return;

  try {
    if (!forceShow && Number(localStorage.getItem(HIDDEN_UNTIL_KEY) || 0) > Date.now()) return;
    if (!forceShow && sessionStorage.getItem(SESSION_SEEN_KEY) === '1') return;
  } catch (_) {
    // The promotion can still be shown when storage is unavailable.
  }

  const style = document.createElement('style');
  style.textContent = `
    .lzn-promo-popup{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease}
    .lzn-promo-popup.is-open{opacity:1;visibility:visible}
    .lzn-promo-backdrop{position:absolute;inset:0;border:0;background:rgba(0,0,0,.76);backdrop-filter:blur(5px);cursor:pointer}
    .lzn-promo-card{position:relative;z-index:1;display:grid;width:min(570px,94vw);max-height:94vh;border-radius:18px;background:#071d49;box-shadow:0 28px 90px rgba(0,0,0,.55);overflow:hidden;transform:translateY(16px) scale(.98);transition:transform .24s ease}
    .lzn-promo-popup.is-open .lzn-promo-card{transform:none}
    .lzn-promo-image-link{display:block;min-height:0;overflow:auto;background:#ffd600}
    .lzn-promo-image-link img{display:block;width:100%;height:auto;max-height:79vh;object-fit:contain;object-position:top center}
    .lzn-promo-close{position:absolute;right:10px;top:10px;z-index:2;display:grid;place-items:center;width:38px;height:38px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.72);color:#fff;font-size:25px;line-height:1;cursor:pointer}
    .lzn-promo-actions{display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px;background:#071d49}
    .lzn-promo-actions a,.lzn-promo-actions button{min-height:44px;display:flex;align-items:center;justify-content:center;border-radius:999px;padding:0 18px;font:800 13px/1 system-ui,sans-serif;cursor:pointer}
    .lzn-promo-actions a{background:#ffd600;color:#151515;text-decoration:none}
    .lzn-promo-actions button{border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff}
    @media(max-width:560px){.lzn-promo-popup{padding:10px}.lzn-promo-card{width:96vw;max-height:96vh}.lzn-promo-image-link img{max-height:78vh}.lzn-promo-actions{grid-template-columns:1fr}.lzn-promo-actions a,.lzn-promo-actions button{min-height:40px}}
    @media(prefers-reduced-motion:reduce){.lzn-promo-popup,.lzn-promo-card{transition:none}}
  `;
  document.head.appendChild(style);

  const popup = document.createElement('div');
  popup.className = 'lzn-promo-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', 'Optical tools wholesale promotion');
  popup.innerHTML = `
    <button class="lzn-promo-backdrop" type="button" aria-label="Close promotion"></button>
    <section class="lzn-promo-card">
      <button class="lzn-promo-close" type="button" aria-label="Close promotion">×</button>
      <a class="lzn-promo-image-link" href="/tools/" aria-label="Shop the optical tools promotion">
        <img src="/tools/assets/promotion/optical-wholesale-coupon-flyer.webp?v=20260727-2" alt="Optical tools wholesale market. Spend USD 100 on tools and get a USD 10 coupon for your next order.">
      </a>
      <div class="lzn-promo-actions">
        <a href="/tools/">Shop optical tools</a>
        <button type="button" data-promo-hide-day>Don't show for 1 day</button>
      </div>
    </section>
  `;
  document.body.appendChild(popup);

  const close = () => {
    popup.classList.remove('is-open');
    window.setTimeout(() => popup.remove(), 220);
  };
  const hideForDay = () => {
    try {
      localStorage.setItem(HIDDEN_UNTIL_KEY, String(Date.now() + ONE_DAY_MS));
    } catch (_) {
      // Close normally if storage is unavailable.
    }
    close();
  };

  popup.querySelector('.lzn-promo-backdrop').addEventListener('click', close);
  popup.querySelector('.lzn-promo-close').addEventListener('click', close);
  popup.querySelector('[data-promo-hide-day]').addEventListener('click', hideForDay);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && popup.isConnected) close();
  });

  const open = () => window.setTimeout(() => {
    if (!popup.isConnected) return;
    try {
      sessionStorage.setItem(SESSION_SEEN_KEY, '1');
    } catch (_) {
      // The promotion can still be shown when storage is unavailable.
    }
    popup.classList.add('is-open');
    popup.querySelector('.lzn-promo-close').focus();
  }, 550);

  const image = popup.querySelector('img');
  if (image.complete) {
    if (image.naturalWidth > 0) open();
    else popup.remove();
  } else {
    image.addEventListener('load', open, { once: true });
    image.addEventListener('error', () => popup.remove(), { once: true });
  }
})();
