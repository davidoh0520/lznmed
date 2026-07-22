(function () {
  const checkoutUrl = '/tools/?open-cart=1#cart';
  const host = location.hostname.toLowerCase();
  const section = location.pathname.split('/').filter(Boolean)[0] || '';
  const store = section === 'frames' ? 'Frames' : section === 'lenses' ? 'Lens' : section === 'devices' ? 'Devices' : 'Main';
  const localKey = store === 'Lens' ? 'lznLensCart' : store === 'Frames' ? 'lznFramesCart' : null;
  const iframe = document.createElement('iframe');
  iframe.src = '/tools/cart-bridge.html?v=20260723-5';
  iframe.title = 'LZN shared cart';
  iframe.hidden = true;
  document.body.appendChild(iframe);
  const authStorageKey = 'sb-snyvexlqpxpqjswizszz-auth-token';
  let lastAccessToken = null;
  const style = document.createElement('style');
  style.textContent = '.lzn-shared-cart-button{border:0;border-radius:999px;background:#dcff73;color:#102520;padding:10px 14px;font:700 12px sans-serif;cursor:pointer;white-space:nowrap}.lzn-shared-cart-count{margin-left:5px}';
  document.head.appendChild(style);
  let centralCount = 0;
  let lastPayload = '';
  let bridgeReady = false;
  const pendingItems = [];
  const existingButton = document.querySelector('#cartButton');
  const cartButton = existingButton || document.createElement('button');
  if (!existingButton) {
    cartButton.id = 'cartButton';
    cartButton.type = 'button';
    cartButton.className = 'lzn-shared-cart-button';
    const target = document.querySelector('.header-tools, .site-header nav, .nav nav, header nav, header');
    target?.prepend(cartButton);
  }
  cartButton.setAttribute('aria-label', 'Open shared shopping cart');
  function renderCount() {
    let badge = cartButton.querySelector('#cartCount, .lzn-shared-cart-count');
    if (!badge) { badge = document.createElement('b'); badge.className = 'lzn-shared-cart-count'; cartButton.appendChild(badge); }
    if (!existingButton && !cartButton.dataset.sharedCartLabel) { cartButton.prepend(document.createTextNode('Cart ')); cartButton.dataset.sharedCartLabel = '1'; }
    badge.textContent = centralCount;
  }
  cartButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = checkoutUrl;
  }, true);
  function lensDetails(item) {
    return [item.coating, item.sph && `SPH ${item.sph}`, item.cyl && `CYL ${item.cyl}`, item.add && `ADD ${item.add}`, item.base && `Base ${item.base}`].filter(Boolean).join(' / ');
  }
  const primaryHosts = new Set(['lznmed.com', 'www.lznmed.com']);
  const unifiedPaths = { Frames: '/frames/', Lens: '/lenses/', Devices: '/devices/', Main: '/tools/' };
  function absoluteImage(image, sourceStore = store) {
    if (!image) return '';
    try {
      const unified = primaryHosts.has(location.hostname);
      const base = unified ? new URL(unifiedPaths[sourceStore] || '/', location.origin) : new URL('/', location.origin);
      let url = new URL(String(image), base);
      if (primaryHosts.has(url.hostname) && url.pathname.startsWith('/assets/') && unifiedPaths[sourceStore]) {
        url = new URL(`${unifiedPaths[sourceStore].replace(/\/$/, '')}${url.pathname}${url.search}${url.hash}`, 'https://www.lznmed.com');
      }
      return url.href;
    } catch (_) { return String(image); }
  }
  function normalize(items) {
    if (store === 'Lens') return items.map(item => {
      const product = typeof products !== 'undefined' ? products.find(candidate => candidate.name === item.name) : null;
      const image = item.image || (product?.file ? `assets/thumbs/${product.file.replace(/\.png$/i, '.webp')}` : '');
      const priceOnRequest = item.price == null || item.price === '' || !Number.isFinite(Number(item.price));
      return { model: item.name, nameEn: `[Lens] ${item.name}`, image: absoluteImage(image, 'Lens'), priceUsd: priceOnRequest ? null : Number(item.price), priceOnRequest, quantity: Number(item.qty || 1), optionLabel: lensDetails(item), sourceStore: 'Lens' };
    });
    if (store === 'Frames') return items.map(item => ({ ...item, image: absoluteImage(item.image, 'Frames'), nameEn: String(item.nameEn || item.model || '').startsWith('[Frames]') ? item.nameEn : `[Frames] ${item.nameEn || item.model}`, priceOnRequest: item.priceOnRequest === true || item.priceUsd == null, quantity: Number(item.quantity || 1), sourceStore: 'Frames' }));
    return [];
  }
  function post(type, payload) { iframe.contentWindow?.postMessage({ channel: 'lzn-shared-cart', type, ...payload }, location.origin); }
  function addItems(items) {
    const safeItems = (Array.isArray(items) ? items : []).filter(item => item?.model).map(item => {
      const priceOnRequest = item.priceOnRequest === true || item.priceUsd == null || !Number.isFinite(Number(item.priceUsd));
      return {
        ...item,
        image: absoluteImage(item.image, item.sourceStore || store),
        priceUsd: priceOnRequest ? null : Number(item.priceUsd),
        priceOnRequest,
        quantity: Math.max(1, Number(item.quantity || 1))
      };
    });
    if (!safeItems.length) return;
    if (!bridgeReady) { pendingItems.push(...safeItems); return; }
    post('ADD_ITEMS', { items: safeItems });
  }
  window.LZNSharedCart = { addItems };
  function flushLocalCart() {
    if (!localKey) return;
    const raw = localStorage.getItem(localKey) || '[]';
    if (raw === lastPayload || raw === '[]') return;
    lastPayload = raw;
    try {
      const items = normalize(JSON.parse(raw));
      if (!items.length) return;
      post('ADD_ITEMS', { items });
      localStorage.setItem(localKey, '[]');
      lastPayload = '[]';
    } catch (_) { /* preserve the original cart if conversion fails */ }
  }
  function readAuth() {
    try {
      const value = JSON.parse(localStorage.getItem(authStorageKey) || 'null');
      return value?.access_token && value?.refresh_token
        ? { access_token: value.access_token, refresh_token: value.refresh_token }
        : null;
    } catch (_) { return null; }
  }
  function syncAuth() {
    const auth = readAuth();
    const token = auth?.access_token || null;
    if (auth) post('AUTH_SESSION', { session: auth });
    else if (lastAccessToken) post('AUTH_CLEARED', {});
    else post('GET_CART', {});
    lastAccessToken = token;
  }
  iframe.addEventListener('load', () => {
    bridgeReady = true;
    syncAuth();
    if (pendingItems.length) post('ADD_ITEMS', { items: pendingItems.splice(0) });
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.channel !== 'lzn-shared-cart') return;
    centralCount = Number(event.data.count || 0);
    renderCount();
    flushLocalCart();
  });
  setInterval(() => {
    const auth = readAuth();
    const token = auth?.access_token || null;
    if (token === lastAccessToken) return;
    if (auth) post('AUTH_SESSION', { session: auth });
    else if (lastAccessToken) post('AUTH_CLEARED', {});
    lastAccessToken = token;
  }, 1000);
  setInterval(flushLocalCart, 500);
  renderCount();
})();

