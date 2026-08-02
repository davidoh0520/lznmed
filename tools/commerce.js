const cfg = window.LZN_SUPABASE || {};
const client = window.supabase?.createClient(cfg.url, cfg.publishableKey);
const panel = document.querySelector('#commercePanel');
const body = document.querySelector('#commerceBody');
const accountButton = document.querySelector('#accountButton');
const cartButton = document.querySelector('#cartButton');
const cartCount = document.querySelector('#cartCount');
const explicitCartOpen = new URLSearchParams(location.search).get('open-cart') === '1';
const requestedAccountView = new URLSearchParams(location.search).get('account');
const products = (window.CATALOG_DATA || []).flatMap(category => category.items.map(product => ({ ...product, categoryEn: category.en })));
const e = value => String(value || '').replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const MINIMUM_ORDER_USD = 100;
const COUPON_VALUE_USD = 10;
const BANK_TRANSFER_THRESHOLD_USD = 1000;
let session = null;
let cart = JSON.parse(localStorage.getItem('lzn-cart') || '[]');
let selectedCouponCodes = [];
let restoredCartUserId = null;
let cartRestorePromise = null;
const primaryCartHosts = new Set(['lznmed.com', 'www.lznmed.com']);
const unifiedCartPaths = { Frames: '/frames/', Lens: '/lenses/', Devices: '/devices/', Tools: '/tools/', Main: '/tools/' };
const legacyCartOrigins = { Frames: 'https://frames.lznmed.com/', Lens: 'https://lens.lznmed.com/', Devices: 'https://devices.lznmed.com/', Tools: 'https://tools.lznmed.com/', Main: 'https://tools.lznmed.com/' };
const legacyCartHostPaths = { 'frames.lznmed.com': '/frames/', 'lens.lznmed.com': '/lenses/', 'devices.lznmed.com': '/devices/', 'tools.lznmed.com': '/tools/' };
const unifiedCartContext = primaryCartHosts.has(location.hostname) || Object.values(unifiedCartPaths).some(path => location.pathname.startsWith(path));
const lensCartImages = {
  'CR39 LENS':'cr39-lens.webp','1.56 ASP BLUE RAY':'blueray-156.webp','1.56 UV450 PHOTO BLUE RAY':'uv450-photo-156.webp','1.60 ASP BLUE RAY':'mr160-blueray.webp','1.60 ASP PHOTO BLUE RAY':'mr160-photo.webp','1.67 ASP BLUE RAY':'mr167-blueray.webp','1.67 ASP PHOTO BLUE RAY':'mr167-photo.webp','1.70 ASP BLUE RAY':'mr170-blueray.webp','1.70 ASP PHOTO BLUE RAY':'mr170-photo.webp','1.74 ASP BLUE RAY':'mr174-blueray.webp','1.74 ASP PHOTO BLUE RAY':'mr174-photo.webp','1.56 PROGRESSIVE BLUE RAY':'progressive-blueray-156.webp','1.56 PROGRESSIVE BLUE RAY PHOTO':'progressive-blueray-photo-156.webp','1.59 POLY PROGRESSIVE BLUE RAY':'poly-progressive.webp','1.59 POLY PROGRESSIVE BLUE RAY PHOTO':'poly-progressive-photo.webp','1.60 ASP BLUE RAY SEMI':'semi-mr160.webp','1.60 ASP PHOTO BLUE RAY SEMI':'semi-mr160-photo.webp','1.67 ASP BLUE RAY SEMI':'semi-mr167.webp','1.67 ASP PHOTO BLUE RAY SEMI':'semi-mr167-photo.webp'
};
function repairCartImage(item) {
  let changed = false;
  if (!item.image && item.sourceStore === 'Lens' && lensCartImages[item.model]) {
    item.image = `/lenses/assets/thumbs/${lensCartImages[item.model]}`;
    changed = true;
  }
  if (!item.image) return changed;
  const original = String(item.image);
  const sourceStore = item.sourceStore || 'Tools';
  try {
    const base = unifiedCartContext
      ? new URL(unifiedCartPaths[sourceStore] || '/tools/', location.origin)
      : new URL(legacyCartOrigins[sourceStore] || 'https://tools.lznmed.com/');
    let url = new URL(original, base);
    if (unifiedCartContext && url.pathname.startsWith('/assets/')) {
      const prefix = legacyCartHostPaths[url.hostname] || (url.hostname === location.hostname ? unifiedCartPaths[sourceStore] : null);
      if (prefix) url = new URL(`${prefix.replace(/\/$/, '')}${url.pathname}${url.search}${url.hash}`, location.origin);
    }
    item.image = url.href;
    return item.image !== original || changed;
  } catch (_) { return changed; }
}
function repairCartImages(items) {
  return items.reduce((changed, item) => repairCartImage(item) || changed, false);
}
if (repairCartImages(cart)) localStorage.setItem('lzn-cart', JSON.stringify(cart));

function accountLabel() {
  if (!session) {
    accountButton.textContent = 'Sign in';
    accountButton.classList.remove('signed-in');
    accountButton.title = 'Sign in or create an account';
    return;
  }
  const email = session.user.email || '';
  const name = session.user.user_metadata?.full_name || email.split('@')[0] || 'Customer';
  accountButton.textContent = `Signed in · ${name.length > 14 ? `${name.slice(0, 14)}…` : name}`;
  accountButton.classList.add('signed-in');
  accountButton.title = `Signed in as ${email}`;
}

function toast(message, action = false) {
  let box = document.querySelector('#siteToast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'siteToast';
    box.className = 'site-toast';
    document.body.appendChild(box);
  }
  box.innerHTML = action ? `${e(message)} <button id="toastCart">View cart</button>` : e(message);
  box.classList.add('active');
  document.querySelector('#toastCart')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    box.classList.remove('active');
    cartView();
  });
  clearTimeout(box.timer);
  box.timer = setTimeout(() => box.classList.remove('active'), 3200);
}

function save(syncCloud = true) {
  localStorage.setItem('lzn-cart', JSON.stringify(cart));
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (syncCloud) window.LZNCloudCart?.replace(cart, session);
}

async function restoreCloudCart() {
  if (!session || !window.LZNCloudCart) return;
  const requestedUserId = session.user?.id;
  if (!requestedUserId || restoredCartUserId === requestedUserId) return cart;
  if (cartRestorePromise) return cartRestorePromise;
  const requestedSession = session;
  cartRestorePromise = (async () => {
    try {
      const restored = await window.LZNCloudCart.restore(requestedSession);
      if (session?.user?.id !== requestedUserId) return cart;
      cart = restored;
      const repaired = repairCartImages(cart);
      save(false);
      if (repaired) window.LZNCloudCart.replace(cart, session);
      restoredCartUserId = requestedUserId;
      if (panel.classList.contains('active') && panel.classList.contains('cart-mode')) cartView();
      return cart;
    } catch (error) {
      console.warn('Saved cart could not be restored:', error.message || error);
      return cart;
    } finally {
      cartRestorePromise = null;
    }
  })();
  return cartRestorePromise;
}

function show(html, wide = false) {
  body.innerHTML = html;
  panel.classList.toggle('cart-mode', wide);
  panel.classList.add('active');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function hide() {
  panel.classList.remove('active', 'cart-mode');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (location.hash === '#cart') history.replaceState(null, '', '#/');
}

document.querySelectorAll('[data-panel-close]').forEach(button => button.addEventListener('click', hide));

function authView() {
  window.LZNUnifiedAccount.open({
    client,
    session,
    redirectTo: `${location.origin}${location.pathname}?email-confirmed=1#cart`,
    onSignedIn: signedInSession => { session = signedInSession || session; updateAccountButton(); },
    onSignedOut: () => {
      session = null;
      updateAccountButton();
      window.LZNCloudCart?.clearLocal();
      restoredCartUserId = null;
      cart = [];
      save(false);
    }
  });
}

const statusLabels = {
  quote_requested: 'Order received',
  quoted: 'Quotation ready',
  payment_pending: 'Awaiting payment',
  payment_submitted: 'Payment verification pending',
  paid: 'Payment received',
  processing: 'Preparing shipment',
  shipped: 'Shipped',
  cancelled: 'Cancelled'
};

function paymentCode(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('paypal') || normalized.includes('card') || normalized.includes('payoneer')) return 'payoneer_card_paypal';
  return 'company_bank_transfer';
}

function paymentLabel(value) {
  return ({
    company_bank_transfer: 'Company bank transfer',
    payoneer_card_paypal: 'Card / PayPal — processed by Payoneer'
  })[paymentCode(value)];
}

function isFreightFinalized(order) {
  return order?.freight_usd != null || /courier collect/i.test(String(order?.courier || ''));
}

function orderDate(value) {
  return value ? new Date(value).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }) : '-';
}

function orderCouponCodes(order) {
  if (Array.isArray(order?.coupon_codes) && order.coupon_codes.length) return order.coupon_codes.filter(Boolean);
  return order?.coupon_code ? [order.coupon_code] : [];
}

async function ordersView() {
  show('<div class="panel-head"><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><p>Loading your orders...</p>', true);
  const [orderResult, couponResult] = await Promise.all([
    client.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    client.from('coupons').select('code,amount_usd,status,issued_at,expires_at,redeemed_at').eq('user_id', session.user.id).order('issued_at', { ascending: false })
  ]);
  if (orderResult.error) {
    show(`<div class="panel-head"><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><p class="form-status">${e(orderResult.error.message)}</p><button class="button secondary-button" id="backAccount">Back to account</button>`, true);
    document.querySelector('#backAccount').onclick = authView;
    return;
  }
  const orders = orderResult.data || [];
  const coupons = (couponResult.data || []).map(coupon => ({
    ...coupon,
    displayStatus: coupon.status === 'active' && new Date(coupon.expires_at).getTime() <= Date.now() ? 'expired' : coupon.status
  }));
  const couponWallet = couponResult.error ? '' : `<section class="coupon-wallet"><div><p class="eyebrow">My coupons</p><h3>USD 10 repeat-order coupons</h3><p>Earn and use one coupon for every complete USD 100 of product subtotal before coupon and freight.</p></div><div class="coupon-wallet-list">${coupons.length ? coupons.map(coupon => `<article class="coupon-ticket ${e(coupon.displayStatus)}"><span>${e(coupon.displayStatus)}</span><strong>${e(coupon.code)}</strong><b>USD ${Number(coupon.amount_usd || 0).toFixed(2)} OFF</b><small>${coupon.displayStatus === 'active' ? `Valid until ${e(orderDate(coupon.expires_at))}` : coupon.displayStatus === 'reserved' ? 'Reserved for an open order' : coupon.displayStatus === 'redeemed' ? `Used ${e(orderDate(coupon.redeemed_at))}` : `Expired ${e(orderDate(coupon.expires_at))}`}</small></article>`).join('') : '<p class="empty-coupons">Your coupon will appear here after payment is confirmed on a qualifying order.</p>'}</div></section>`;
  show(`<div class="panel-head cart-heading"><div><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><span>${orders.length} orders</span></div>
    ${couponWallet}
    <div class="customer-orders">${orders.length ? orders.map(order => {
      const total = order.total_usd ?? order.subtotal_usd;
      const tracking = order.status === 'shipped' && order.tracking_no ? `<div class="tracking-box"><span>Tracking number</span><strong>${e(order.tracking_no)}</strong><small>${e(order.courier || '')}</small><a class="text-button" href="https://www.17track.net/en/track#nums=${encodeURIComponent(order.tracking_no)}" target="_blank" rel="noopener">Track shipment</a></div>` : '';
      const confirmAction = order.pi_created_at && !order.pi_confirmed_at && ['quoted', 'payment_pending'].includes(order.status) ? `<button class="payment-notice" data-confirm-pi="${e(order.id)}">Confirm Proforma Invoice</button>` : '';
      const method = paymentCode(order.payment_method);
      const readyForPayment = order.invoice_no && order.pi_confirmed_at && isFreightFinalized(order) && ['quoted', 'payment_pending'].includes(order.status);
      const bankTransferAction = readyForPayment && method === 'company_bank_transfer' ? `<button class="payment-notice" data-payment-id="${e(order.id)}">I have completed bank transfer</button>` : '';
      const payoneerAction = readyForPayment && method !== 'company_bank_transfer' ? '<div class="payment-waiting payoneer-link-notice"><strong>Secure Payoneer payment link</strong><span>We will email your Card / PayPal payment request after freight and the final invoice are confirmed. Available methods, any payer fee and the final amount will be shown on Payoneer before payment.</span></div>' : '';
      const paymentAction = `${confirmAction}${bankTransferAction}${payoneerAction}`;
      const paymentWaiting = order.status === 'payment_submitted' ? `<div class="payment-waiting"><strong>Payment verification pending</strong><span>${method === 'company_bank_transfer' ? `We received your transfer notice${order.payment_submitted_at ? ` on ${orderDate(order.payment_submitted_at)}` : ''}. Your order will change to Paid after the funds are confirmed in our company bank account.` : 'We are verifying the Payoneer payment. Your order will change to Paid after the payment is confirmed.'}</span></div>` : '';
      return `<article class="customer-order"><div class="customer-order-head"><div><span>${e(order.invoice_no || `Order ${order.id.slice(0, 8)}`)}</span><strong>${orderDate(order.created_at)}</strong></div><div><b class="order-status ${e(order.status)}">${e(statusLabels[order.status] || order.status)}</b><strong>USD ${Number(total || 0).toFixed(2)}</strong></div></div><div class="order-progress"><span class="${['quote_requested','quoted','payment_pending','payment_submitted','paid','processing','shipped'].includes(order.status) ? 'done' : ''}">Received</span><span class="${['paid','processing','shipped'].includes(order.status) ? 'done' : ''}">Paid</span><span class="${['processing','shipped'].includes(order.status) ? 'done' : ''}">Preparing</span><span class="${order.status === 'shipped' ? 'done' : ''}">Shipped</span></div>${paymentAction}${paymentWaiting}${tracking}<details><summary>View order details</summary><div class="customer-order-items">${(order.order_items || []).map(item => `<div><span><strong>${e(item.model)}</strong><small>${e(item.product_name)}</small></span><span>Qty ${e(item.quantity)}</span><strong>USD ${Number(item.line_total_usd || 0).toFixed(2)}</strong></div>`).join('')}</div><div class="customer-order-totals"><span>Products before coupon <strong>USD ${Number(order.subtotal_usd || 0).toFixed(2)}</strong></span>${Number(order.discount_usd || 0) > 0 ? `<span>${orderCouponCodes(order).length === 1 ? 'Coupon' : `Coupons (${orderCouponCodes(order).length})`} ${e(orderCouponCodes(order).join(', '))} <strong>-USD ${Number(order.discount_usd).toFixed(2)}</strong></span>` : ''}<span>Freight <strong>${order.freight_usd == null ? 'Pending quotation' : `USD ${Number(order.freight_usd).toFixed(2)}`}</strong></span><span>Total <strong>USD ${Number(total || 0).toFixed(2)}</strong></span></div><p><strong>Payment method:</strong> ${e(paymentLabel(order.payment_method))}</p><p><strong>Shipping address:</strong> ${e(order.shipping_address || '-')} ${e(order.postal_code || '')}</p><p><strong>Freight arrangement:</strong> ${e(order.courier || '-')}</p></details></article>`;
    }).join('') : '<div class="empty-orders"><h3>No orders yet</h3><p>Your completed and current orders will appear here.</p></div>'}</div><div class="cart-actions"><button class="button secondary-button" id="backAccount">Back to account</button><button class="button" id="shopAgain">Continue shopping</button></div>`, true);
  document.querySelectorAll('.customer-order').forEach((card, orderIndex) => {
    const order = orders[orderIndex];
    const requestItems = (order?.order_items || []).map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => isOrderPriceOnRequest(item));
    if (!requestItems.length) return;
    requestItems.forEach(({ itemIndex }) => {
      const row = card.querySelectorAll('.customer-order-items > div')[itemIndex];
      if (row?.lastElementChild) row.lastElementChild.textContent = 'Price on request';
    });
    const quotePending = ['quote_requested', 'quoted'].includes(order.status);
    const headerAmount = card.querySelector('.customer-order-head > div:last-child > strong');
    if (quotePending && headerAmount) headerAmount.textContent = 'Quote pending';
    const totals = card.querySelectorAll('.customer-order-totals strong');
    if (totals[0]) totals[0].textContent = `Priced items USD ${Number(order.subtotal_usd || 0).toFixed(2)}`;
    if (quotePending && totals.length) totals[totals.length - 1].textContent = 'Pending quotation';
  });
  document.querySelector('#backAccount').onclick = authView;
  document.querySelector('#shopAgain').onclick = hide;
  document.querySelectorAll('[data-payment-id]').forEach(button => button.addEventListener('click', () => paymentNoticeView(orders.find(order => order.id === button.dataset.paymentId))));
  document.querySelectorAll('[data-confirm-pi]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    const { error } = await client.rpc('confirm_proforma_invoice', { p_order_id: button.dataset.confirmPi });
    if (error) { button.textContent = error.message; button.disabled = false; return; }
    await ordersView();
  }));
}

function paymentNoticeView(order) {
  if (!order) return;
  show(`<div class="panel-head"><p class="eyebrow">Bank Transfer</p><h2>Confirm your payment</h2></div><div class="payment-instruction"><p>Submit this notice only after the bank transfer has been completed.</p><div><span>Proforma Invoice</span><strong>${e(order.invoice_no)}</strong></div><div><span>Amount</span><strong>USD ${Number((order.total_usd ?? order.subtotal_usd) || 0).toFixed(2)}</strong></div></div><form class="commerce-form" id="paymentNoticeForm"><label>Remitter name or transaction reference<input name="reference" required placeholder="Name used for transfer or bank reference"></label><label>Payment note (optional)<input name="note" placeholder="Transfer date, bank name or other information"></label><button class="button">Submit payment notice</button><button type="button" class="button secondary-button" id="backToOrders">Back to my orders</button><p class="form-status" id="paymentNoticeStatus"></p></form>`);
  document.querySelector('#backToOrders').onclick = ordersView;
  document.querySelector('#paymentNoticeForm').onsubmit = async event => {
    event.preventDefault();
    const status = document.querySelector('#paymentNoticeStatus');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    status.textContent = 'Submitting payment notice...';
    const { error } = await client.rpc('submit_payment_notice', { p_order_id: order.id, p_reference: values.reference, p_note: values.note });
    if (error) {
      status.textContent = error.message;
      return;
    }
    status.textContent = 'Payment notice submitted. We will update the order after confirming receipt in our bank account.';
    setTimeout(ordersView, 900);
  };
}

async function profileView() {
  let profile = {};
  if (client && session) {
    const { data } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    profile = data || {};
  }
  show(`<div class="panel-head"><p class="eyebrow">Shipping Profile</p><h2>Buyer information</h2></div>
    <form class="commerce-form two-col" id="profileForm">
      <input name="buyer_type" type="hidden" value="company">
      <label class="wide">Account email<input name="account_email" type="email" required autocomplete="email" value="${e(session.user.email)}"><small>Changing this address sends confirmation emails to the current and new addresses.</small></label>
      <label>Company name<input name="company_name" required autocomplete="organization" value="${e(profile.company_name)}"></label>
      <label>Manager / Contact name<input name="full_name" required autocomplete="name" value="${e(profile.full_name)}"></label>
      <label>Country<input name="country" list="profileCountryOptions" required autocomplete="country-name" value="${e(profile.country)}"><datalist id="profileCountryOptions"></datalist><small data-country-status aria-live="polite">Choose a country to load its calling code and regions.</small></label>
      <label>Phone<input name="phone" type="tel" required autocomplete="tel" inputmode="tel" value="${e(profile.phone)}"><small>The selected country's calling code is added automatically.</small></label>
      <label>WhatsApp<input name="whatsapp" type="tel" autocomplete="tel" inputmode="tel" value="${e(profile.whatsapp)}"></label>
      <label>State / Province<input name="state_province" list="profileStateOptions" autocomplete="address-level1" value="${e(profile.state_province)}"><datalist id="profileStateOptions"></datalist></label>
      <label>City<input name="city" list="profileCityOptions" required autocomplete="address-level2" value="${e(profile.city)}"><datalist id="profileCityOptions"></datalist></label>
      <label class="wide">Detailed street address<input name="address_line_1" required autocomplete="address-line1" placeholder="Building number and street name" value="${e(profile.address_line_1)}"></label>
      <label class="wide">Address line 2 (optional)<input name="address_line_2" autocomplete="address-line2" placeholder="Suite, unit, floor, etc." value="${e(profile.address_line_2)}"></label>
      <label>Postal code<input name="postal_code" required autocomplete="postal-code" value="${e(profile.postal_code)}"><small><span data-postal-status aria-live="polite">Enter the postal code manually. It is required for delivery.</span></small></label>
      <label>Importer / Customs ID (optional)<input name="tax_id" value="${e(profile.tax_id)}"><small>Enter the importer or customs identification number requested by your local customs authority or courier (for example, an EORI or Importer Number). This is not a general business registration number. Leave it blank if it is not required for your shipment.</small></label>
      <label>Preferred courier<select name="preferred_courier"><option value="">No collect account</option>${['DHL', 'FedEx', 'UPS', 'EMS', 'SF Express', 'Other'].map(value => `<option ${profile.preferred_courier === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label class="wide">Courier collect account (optional)<input name="courier_account_no" value="${e(profile.courier_account_no)}"></label>
      <label class="wide reminder-consent"><input name="cart_reminder_opt_in" type="checkbox" value="true" ${[true, 'true', 1, '1'].includes(profile.cart_reminder_opt_in) ? 'checked' : ''}><span>Email me reminders about items left in my cart. I can turn these reminders off at any time.</span></label>
      <button class="button wide">Save profile</button><p class="form-status wide" id="profileStatus"></p>
    </form>`);
  const form = document.querySelector('#profileForm');
  form.onsubmit = saveProfile;
  window.LZNAddressProfile?.enhance(form);
}

async function saveProfile(event) {
  event.preventDefault();
  const status = document.querySelector('#profileStatus');
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const accountEmail = String(values.account_email || '').trim().toLowerCase();
  const emailChanged = accountEmail !== String(session.user.email || '').toLowerCase();
  delete values.account_email;
  values.email = accountEmail;
  values.buyer_type = 'company';
  values.cart_reminder_opt_in = event.currentTarget.elements.cart_reminder_opt_in.checked;
  status.textContent = 'Saving account changes…';
  const authAttributes = {
    data: {
      ...(session.user.user_metadata || {}),
      company_name: values.company_name,
      full_name: values.full_name,
      buyer_type: 'company'
    }
  };
  if (emailChanged) authAttributes.email = accountEmail;
  const authResult = await client.auth.updateUser(authAttributes);
  if (authResult.error) {
    status.textContent = authResult.error.message;
    return;
  }
  const { error } = await client.from('profiles').update(values).eq('id', session.user.id);
  if (error) {
    status.textContent = error.message;
    return;
  }
  session = { ...session, user: authResult.data.user || session.user };
  accountLabel();
  status.textContent = emailChanged
    ? 'Account saved. Check the current and new email addresses to confirm the change.'
    : 'Account and shipping profile saved.';
}

function money(value) {
  return Number(value).toFixed(Number(value) >= 100 ? 0 : 2);
}

function isPriceOnRequest(item) {
  return item?.priceOnRequest === true || item?.priceUsd == null || !Number.isFinite(Number(item.priceUsd));
}

function isOrderPriceOnRequest(item) {
  return /price on request/i.test(String(item?.product_name || ''));
}

function cartUnitPrice(item) {
  if (isPriceOnRequest(item)) return 'Price on request';
  if (Number(item.priceUsd) === 0) return 'Free of charge';
  return `USD ${money(item.priceUsd)} ${item.orderUnitLabel ? `per ${e(item.orderUnitLabel)}` : 'each'}`;
}

function cartLinePrice(item) {
  if (isPriceOnRequest(item)) return 'To be quoted';
  if (Number(item.priceUsd) === 0) return 'Free';
  return `USD ${money(Number(item.priceUsd) * item.quantity)}`;
}

async function loadActiveCoupons() {
  if (!client || !session?.user?.id) return { data: [], error: null };
  return client.from('coupons')
    .select('code,amount_usd,expires_at')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at');
}

async function cartView() {
  if (repairCartImages(cart)) save();
  const total = cart.reduce((sum, item) => sum + (item.priceUsd || 0) * item.quantity, 0);
  const hasQuote = cart.some(isPriceOnRequest);
  const belowMinimum = total < MINIMUM_ORDER_USD && !hasQuote;
  const couponLimit = Math.floor(total / MINIMUM_ORDER_USD);
  const couponUnlocked = couponLimit > 0;
  selectedCouponCodes = couponUnlocked ? selectedCouponCodes.slice(0, couponLimit) : [];
  const minimumMessage = couponUnlocked
    ? ''
    : `<p class="minimum-order-notice"><strong>${hasQuote ? 'Coupons pending final quotation.' : `Add USD ${money(MINIMUM_ORDER_USD - total)} more.`}</strong> One USD ${money(COUPON_VALUE_USD)} coupon is earned for every complete USD ${money(MINIMUM_ORDER_USD)} of final product subtotal before coupon and freight.</p>`;
  const earnedCoupon = couponUnlocked
    ? `<aside class="cart-earned-coupon" aria-label="${couponLimit} coupons unlocked"><span>Unlocked</span><div><strong>${couponLimit} × USD ${money(COUPON_VALUE_USD)} COUPONS</strong><small>USD ${money(couponLimit * COUPON_VALUE_USD)} total · Issued after payment confirmation · Valid for 60 days</small></div></aside>`
    : '';
  const ownedCouponPanel = couponUnlocked
    ? `<section class="cart-owned-coupons" id="cartOwnedCoupons" aria-live="polite">${session
      ? '<p class="cart-coupon-loading">Checking your available coupons…</p>'
      : '<div class="cart-coupon-signin"><strong>Already have coupons?</strong><span>Sign in to see and use them on this order.</span></div>'}</section>`
    : '';
  show(`<div class="panel-head cart-heading"><div><p class="eyebrow">Shopping Cart</p><h2>${cart.length ? 'Your cart' : 'Your cart is empty'}</h2></div><span>${cart.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
    <div class="cart-list">${cart.map((item, index) => `<div class="cart-row"><img src="${e(item.image)}" alt=""><div><strong>${e(item.model)}</strong><span>${e(item.nameEn)}</span>${item.optionLabel ? `<small class="chosen-option">${e(item.optionLabel)}</small>` : ''}${item.pd ? `<small class="chosen-option">Fixed PD: ${e(item.pd)} mm</small>` : ''}<small>${cartUnitPrice(item)}</small></div><label class="qty-label">Qty<input type="number" min="1" value="${item.quantity}" data-qty="${index}"></label><strong class="line-total">${cartLinePrice(item)}</strong><button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button></div>`).join('')}</div>
    ${cart.length ? `<div class="cart-summary"><div><span>${hasQuote ? 'Priced items subtotal' : 'FOB China product subtotal'}</span><strong>USD ${money(total)}</strong></div>${hasQuote ? '<p><strong>Price-on-request items will be quoted in your Proforma Invoice. The final product subtotal must be at least USD 100.</strong></p>' : ''}${minimumMessage}<p>Freight, destination duties and local taxes are not included. Availability and freight are confirmed before the Proforma Invoice is issued.</p></div>${earnedCoupon}${ownedCouponPanel}<div class="cart-actions"><button class="button secondary-button" id="continueShopping">Continue shopping</button><button class="button" id="checkoutButton" ${belowMinimum ? 'disabled aria-disabled="true"' : ''}>Proceed to checkout</button></div><p class="form-status" id="quoteStatus"></p>` : `<button class="button" id="continueShopping">Continue shopping</button>`}`, true);
  body.querySelectorAll('.cart-row').forEach((row, index) => {
    if (!cart[index]?.pdLabel) return;
    const labels = row.querySelectorAll('.chosen-option');
    const target = labels[labels.length - 1];
    if (target) target.textContent = cart[index].pdLabel;
  });
  body.querySelectorAll('[data-qty]').forEach(input => input.onchange = () => { cart[input.dataset.qty].quantity = Math.max(1, Number(input.value) || 1); save(); cartView(); });
  body.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { cart.splice(button.dataset.remove, 1); save(); cartView(); });
  document.querySelector('#continueShopping').onclick = hide;
  document.querySelector('#checkoutButton')?.addEventListener('click', () => session ? checkoutView() : authView());
  if (couponUnlocked && session) {
    const wallet = document.querySelector('#cartOwnedCoupons');
    const { data: couponData, error } = await loadActiveCoupons();
    if (!wallet?.isConnected) return;
    if (error) {
      wallet.remove();
      return;
    }
    const availableCoupons = couponData || [];
    const availableCodes = new Set(availableCoupons.map(coupon => coupon.code));
    selectedCouponCodes = selectedCouponCodes.filter(code => availableCodes.has(code)).slice(0, couponLimit);
    const selectionMessage = () => selectedCouponCodes.length
      ? `${selectedCouponCodes.length} coupon${selectedCouponCodes.length === 1 ? '' : 's'} (USD ${money(selectedCouponCodes.length * COUPON_VALUE_USD)}) will be carried to checkout.`
      : `Choose up to ${couponLimit} coupon${couponLimit === 1 ? '' : 's'} now, or select them later at checkout.`;
    wallet.innerHTML = availableCoupons.length
      ? `<div class="cart-owned-coupon-head"><div><p class="eyebrow">Your available coupons</p><h3>Select up to ${couponLimit} for this order</h3></div><small id="cartCouponCount">${selectedCouponCodes.length}/${couponLimit} selected</small></div><div class="cart-owned-coupon-list">${availableCoupons.map((coupon, index) => `<label class="cart-owned-coupon ${selectedCouponCodes.includes(coupon.code) ? 'selected' : ''}" for="cartCoupon${index}"><input id="cartCoupon${index}" type="checkbox" name="cart_coupon_codes" value="${e(coupon.code)}" ${selectedCouponCodes.includes(coupon.code) ? 'checked' : ''}><span><b>USD ${Number(coupon.amount_usd || COUPON_VALUE_USD).toFixed(2)} OFF</b><strong>${e(coupon.code)}</strong><small>Valid until ${e(orderDate(coupon.expires_at))}</small></span></label>`).join('')}</div><div class="cart-owned-coupon-foot"><p id="cartCouponSelection">${selectionMessage()}</p><button type="button" class="text-button" data-clear-cart-coupons ${selectedCouponCodes.length ? '' : 'hidden'}>Do not use coupons</button></div>`
      : '<div class="cart-coupon-signin"><strong>No active coupon yet.</strong><span>Your coupons will appear here after payment is confirmed on a qualifying order.</span></div>';
    const updateCartCouponSelection = () => {
      selectedCouponCodes = [...wallet.querySelectorAll('[name="cart_coupon_codes"]:checked')].map(input => input.value);
      wallet.querySelectorAll('.cart-owned-coupon').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
      const count = wallet.querySelector('#cartCouponCount');
      if (count) count.textContent = `${selectedCouponCodes.length}/${couponLimit} selected`;
      const selection = wallet.querySelector('#cartCouponSelection');
      if (selection) selection.textContent = selectionMessage();
      const clearButton = wallet.querySelector('[data-clear-cart-coupons]');
      if (clearButton) clearButton.hidden = !selectedCouponCodes.length;
    };
    wallet.querySelectorAll('[name="cart_coupon_codes"]').forEach(input => input.addEventListener('change', () => {
      if (input.checked && wallet.querySelectorAll('[name="cart_coupon_codes"]:checked').length > couponLimit) {
        input.checked = false;
        toast(`Use up to ${couponLimit} coupon${couponLimit === 1 ? '' : 's'} on this order.`);
      }
      updateCartCouponSelection();
    }));
    wallet.querySelector('[data-clear-cart-coupons]')?.addEventListener('click', () => {
      wallet.querySelectorAll('[name="cart_coupon_codes"]').forEach(input => { input.checked = false; });
      updateCartCouponSelection();
    });
  }
}

async function checkoutView() {
  const subtotal = cart.reduce((sum, item) => sum + (item.priceUsd || 0) * item.quantity, 0);
  const defaultPaymentMethod = subtotal < BANK_TRANSFER_THRESHOLD_USD ? 'payoneer_card_paypal' : 'company_bank_transfer';
  const hasQuote = cart.some(isPriceOnRequest);
  if (subtotal < MINIMUM_ORDER_USD && !hasQuote) {
    cartView();
    const status = document.querySelector('#quoteStatus');
    if (status) status.textContent = `Minimum order is USD ${money(MINIMUM_ORDER_USD)} before coupons, excluding freight.`;
    return;
  }
  const couponLimit = Math.floor(subtotal / MINIMUM_ORDER_USD);
  const couponEligible = couponLimit > 0;
  const { data: couponData } = couponEligible ? await loadActiveCoupons() : { data: [] };
  const availableCoupons = couponData || [];
  const availableCodes = new Set(availableCoupons.map(coupon => coupon.code));
  selectedCouponCodes = selectedCouponCodes.filter(code => availableCodes.has(code)).slice(0, couponLimit);
  const couponChoices = availableCoupons.map((coupon, index) => `<label class="cart-owned-coupon ${selectedCouponCodes.includes(coupon.code) ? 'selected' : ''}" for="checkoutCoupon${index}"><input id="checkoutCoupon${index}" type="checkbox" name="coupon_codes" value="${e(coupon.code)}" ${selectedCouponCodes.includes(coupon.code) ? 'checked' : ''}><span><b>USD ${Number(coupon.amount_usd || COUPON_VALUE_USD).toFixed(2)} OFF</b><strong>${e(coupon.code)}</strong><small>Valid until ${e(orderDate(coupon.expires_at))}</small></span></label>`).join('');
  const couponField = couponEligible
    ? `<fieldset class="coupon-checkout"><legend>Your available coupons</legend>${availableCoupons.length ? `<div class="cart-owned-coupon-head"><div><h3>Select up to ${couponLimit}</h3><small>One coupon for each USD 100 of product subtotal.</small></div><small id="checkoutCouponCount">${selectedCouponCodes.length}/${couponLimit} selected</small></div><div class="cart-owned-coupon-list">${couponChoices}</div><div class="cart-owned-coupon-foot"><p id="checkoutCouponSelection"></p><button type="button" class="text-button" id="clearCheckoutCoupons" ${selectedCouponCodes.length ? '' : 'hidden'}>Do not use coupons</button></div>` : '<p>Your coupons will appear here after payment is confirmed on a qualifying order.</p>'}<small>Eligibility uses the product subtotal before coupons, so every complete USD 100 permits one coupon and still earns the next coupons after payment.</small></fieldset>`
    : '<fieldset class="coupon-checkout"><legend>Coupons</legend><p>One coupon can be used for every complete USD 100 of quoted product subtotal.</p></fieldset>';
  show(`<div class="panel-head"><p class="eyebrow">Checkout</p><h2>Payment & freight</h2></div><div class="checkout-summary coupon-summary"><span>Product subtotal before coupon</span><strong>USD ${money(subtotal)}</strong><span id="checkoutCouponLabel" hidden>Coupons</span><strong id="checkoutCouponValue" hidden>-USD ${money(COUPON_VALUE_USD)}</strong><span>Before freight</span><strong id="checkoutBeforeFreight">USD ${money(subtotal)}</strong></div><div class="repeat-coupon-promo"><strong>Earn and use one USD 10 coupon for every USD 100</strong><span>Issued after payment confirmation and valid for 60 days.</span></div><form class="commerce-form checkout-form" id="checkoutForm">${couponField}<fieldset><legend>Preferred payment method</legend><p class="payment-hold-notice">Payment is not collected at checkout. Freight and the final total will be confirmed in the Proforma Invoice and by email.</p><label class="choice-card payment-choice"><input type="radio" name="payment_method" value="company_bank_transfer" ${defaultPaymentMethod === 'company_bank_transfer' ? 'checked' : ''}><span><strong>Company bank transfer <em>Default for USD 1,000 or more</em></strong><small>Payment instructions will be provided only with the final Proforma Invoice and email.</small></span></label><label class="choice-card payment-choice"><input type="radio" name="payment_method" value="payoneer_card_paypal" ${defaultPaymentMethod === 'payoneer_card_paypal' ? 'checked' : ''}><span><strong>Card / PayPal <em>Default below USD 1,000</em></strong><small>A secure payment request will be emailed after freight and the final Proforma Invoice are confirmed.</small></span></label><div class="payment-fee-estimate" id="paymentFeeEstimate" aria-live="polite"></div></fieldset><fieldset><legend>Freight arrangement</legend><label class="choice-card"><input type="radio" name="freight_method" value="quote" checked><span><strong>Request freight quotation — SF International</strong><small>Quoted-freight orders are shipped by SF International. By selecting this option, you accept SF International as the carrier and the quoted SF International freight charge. We do not automatically substitute the cheapest courier service.</small></span></label><label class="choice-card"><input type="radio" name="freight_method" value="collect"><span><strong>Courier collect</strong><small>Freight will be charged directly to your courier account.</small></span></label><div class="collect-fields" id="collectFields"><label>Courier<select name="courier" id="checkoutCourier"><option>DHL</option><option>FedEx</option><option>UPS</option><option>EMS</option><option>SF Express</option><option>Other</option></select></label><label id="otherCourierLabel">Other courier name<input name="other_courier" placeholder="Enter courier name"></label><label>Courier account number<input name="courier_account_no" placeholder="Required for courier collect"></label></div></fieldset><div class="cart-actions"><button type="button" class="button secondary-button" id="backToCart">Back to cart</button><button class="button" id="placeOrderButton">Request Proforma Invoice</button></div><p class="form-status" id="quoteStatus"></p></form>`, true);
  if (hasQuote) document.querySelector('.checkout-summary span').innerHTML = 'Priced items subtotal<small>Price-on-request items will be added after quotation.</small>';
  const form = document.querySelector('#checkoutForm');
  const collectFields = document.querySelector('#collectFields');
  const otherLabel = document.querySelector('#otherCourierLabel');
  function updateFreightFields() {
    const collect = form.elements.freight_method.value === 'collect';
    collectFields.classList.toggle('active', collect);
    const other = collect && form.elements.courier.value === 'Other';
    otherLabel.classList.toggle('active', other);
  }
  function updatePaymentEstimate() {
    const method = paymentCode(form.elements.payment_method.value);
    const estimate = document.querySelector('#paymentFeeEstimate');
    form.querySelectorAll('.payment-choice').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
    estimate.innerHTML = method === 'company_bank_transfer'
      ? '<strong>Company bank transfer selected</strong><span>Payment instructions will be sent with the final PI after freight is confirmed.</span>'
      : '<strong>Card / PayPal selected</strong><span>A secure payment request will be emailed after freight and the final PI are confirmed.</span>';
  }
  function updateCouponEstimate() {
    const codes = [...form.querySelectorAll('[name="coupon_codes"]:checked')].map(input => input.value);
    selectedCouponCodes = codes;
    const discount = codes.reduce((sum, code) => {
      const coupon = availableCoupons.find(item => item.code === code);
      return sum + (coupon ? Number(coupon.amount_usd || COUPON_VALUE_USD) : 0);
    }, 0);
    const label = document.querySelector('#checkoutCouponLabel');
    const value = document.querySelector('#checkoutCouponValue');
    if (label) {
      label.hidden = !discount;
      label.textContent = codes.length === 1 ? 'Coupon' : `Coupons (${codes.length})`;
    }
    if (value) {
      value.hidden = !discount;
      value.textContent = `-USD ${money(discount)}`;
    }
    document.querySelector('#checkoutBeforeFreight').textContent = `USD ${money(subtotal - discount)}`;
    const count = document.querySelector('#checkoutCouponCount');
    if (count) count.textContent = `${codes.length}/${couponLimit} selected`;
    const selection = document.querySelector('#checkoutCouponSelection');
    if (selection) selection.textContent = codes.length
      ? `${codes.length} coupon${codes.length === 1 ? '' : 's'} selected · USD ${money(discount)} off`
      : `Choose up to ${couponLimit} coupon${couponLimit === 1 ? '' : 's'}.`;
    const clearButton = document.querySelector('#clearCheckoutCoupons');
    if (clearButton) clearButton.hidden = !codes.length;
    form.querySelectorAll('.cart-owned-coupon').forEach(labelElement => labelElement.classList.toggle('selected', labelElement.querySelector('input').checked));
  }
  form.querySelectorAll('[name="freight_method"]').forEach(input => input.addEventListener('change', updateFreightFields));
  form.querySelectorAll('[name="payment_method"]').forEach(input => input.addEventListener('change', updatePaymentEstimate));
  form.querySelectorAll('[name="coupon_codes"]').forEach(input => input.addEventListener('change', () => {
    if (input.checked && form.querySelectorAll('[name="coupon_codes"]:checked').length > couponLimit) {
      input.checked = false;
      toast(`Use up to ${couponLimit} coupon${couponLimit === 1 ? '' : 's'} on this order.`);
    }
    updateCouponEstimate();
  }));
  document.querySelector('#clearCheckoutCoupons')?.addEventListener('click', () => {
    form.querySelectorAll('[name="coupon_codes"]').forEach(input => { input.checked = false; });
    updateCouponEstimate();
  });
  form.elements.courier.addEventListener('change', updateFreightFields);
  document.querySelector('#backToCart').onclick = cartView;
  form.onsubmit = submitQuote;
  updateFreightFields();
  updatePaymentEstimate();
  updateCouponEstimate();
}

async function submitQuote(event) {
  event.preventDefault();
  const checkoutFormData = new FormData(event.currentTarget);
  const checkout = Object.fromEntries(checkoutFormData);
  checkout.coupon_codes = [...new Set(checkoutFormData.getAll('coupon_codes').map(code => String(code).trim()).filter(Boolean))];
  const status = document.querySelector('#quoteStatus');
  const button = document.querySelector('#placeOrderButton');
  if (checkout.freight_method === 'collect' && !String(checkout.courier_account_no || '').trim()) {
    status.textContent = 'Please enter your courier collect account number.';
    return;
  }
  if (checkout.freight_method === 'collect' && checkout.courier === 'Other' && !String(checkout.other_courier || '').trim()) {
    status.textContent = 'Please enter the courier name.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Preparing checkout…';
  const { data: profile, error: profileError } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (profileError) { status.textContent = profileError.message; button.disabled = false; return; }
  if (!profile?.full_name || !profile?.company_name || !profile?.country || !profile?.address_line_1 || !profile?.postal_code) {
    status.textContent = 'Please complete your shipping profile first.';
    button.disabled = false;
    setTimeout(profileView, 800);
    return;
  }
  const subtotal = cart.reduce((sum, item) => sum + (item.priceUsd || 0) * item.quantity, 0);
  const hasQuote = cart.some(isPriceOnRequest);
  if (subtotal < MINIMUM_ORDER_USD && !hasQuote) {
    status.textContent = `Minimum order is USD ${money(MINIMUM_ORDER_USD)} before coupons, excluding freight.`;
    button.disabled = false;
    return;
  }
  const couponLimit = Math.floor(subtotal / MINIMUM_ORDER_USD);
  if (checkout.coupon_codes.length > couponLimit) {
    status.textContent = `Use up to ${couponLimit} coupon${couponLimit === 1 ? '' : 's'} — one for each complete USD 100 of product subtotal.`;
    button.disabled = false;
    return;
  }
  const stores = [...new Set(cart.map(item => item.sourceStore || 'Tools'))];
  const storeNote = stores.length > 1 ? `[MIXED STORE] ${stores.join(', ')}` : `[${stores[0].toUpperCase()} STORE]`;
  const shipping = [profile.address_line_1, profile.address_line_2, profile.city, profile.state_province, profile.country].filter(Boolean).join(', ');
  const courierName = checkout.freight_method === 'quote' ? 'SF International freight quotation requested' : `Courier collect: ${checkout.courier === 'Other' ? checkout.other_courier : checkout.courier}`;
  const items = cart.map(item => ({
    model: item.model,
    productName: `${item.nameEn}${item.optionLabel ? ` (${item.optionLabel})` : ''}${item.pdLabel ? ` (${item.pdLabel})` : (item.pd ? ` (PD ${item.pd} mm)` : '')}${item.orderUnitLabel ? ` (${item.orderUnitLabel} per order unit)` : ''}${isPriceOnRequest(item) ? ' (Price on request)' : ''}`,
    unitPriceUsd: isPriceOnRequest(item) ? 0 : Number(item.priceUsd || 0),
    quantity: item.quantity,
    priceOnRequest: isPriceOnRequest(item)
  }));
  const sharedOrderArgs = {
    p_payment_method: paymentCode(checkout.payment_method),
    p_destination_country: profile.country,
    p_company_name: profile.company_name,
    p_contact_name: profile.full_name,
    p_contact_email: session.user.email,
    p_contact_phone: profile.phone,
    p_shipping_address: shipping,
    p_postal_code: profile.postal_code,
    p_courier: courierName,
    p_courier_account_no: checkout.freight_method === 'collect' ? checkout.courier_account_no : null,
    p_customer_note: storeNote,
    p_items: items
  };
  const functionUnavailable = rpcError => rpcError?.code === 'PGRST202' || /place_order.*schema cache|function public\.place_order/i.test(String(rpcError?.message || ''));
  let orderResult = await client.rpc('place_order', { ...sharedOrderArgs, p_coupon_codes: checkout.coupon_codes });
  if (functionUnavailable(orderResult.error) && checkout.coupon_codes.length <= 1) {
    const legacyOrderResult = await client.rpc('place_order', { ...sharedOrderArgs, p_coupon_code: checkout.coupon_codes[0] || null });
    if (!functionUnavailable(legacyOrderResult.error)) orderResult = legacyOrderResult;
  }
  let orderId = orderResult.data;
  let error = orderResult.error;
  let automatedCoupon = true;
  const orderFunctionUnavailable = functionUnavailable(error);
  if (orderFunctionUnavailable && checkout.coupon_codes.length > 1) {
    status.textContent = 'Multi-coupon checkout is being activated. Please try again after the database update.';
    button.disabled = false;
    return;
  }
  if (orderFunctionUnavailable && !checkout.coupon_codes.length) {
    const legacyOrderResult = await client.from('orders').insert({
      user_id: session.user.id,
      status: 'quote_requested',
      subtotal_usd: subtotal,
      payment_method: paymentCode(checkout.payment_method),
      destination_country: profile.country,
      buyer_type: 'company',
      company_name: profile.company_name,
      contact_name: profile.full_name,
      contact_email: session.user.email,
      contact_phone: profile.phone,
      shipping_address: shipping,
      postal_code: profile.postal_code,
      courier: courierName,
      courier_account_no: checkout.freight_method === 'collect' ? checkout.courier_account_no : null,
      customer_note: `${storeNote} [USD 10 NEXT-ORDER COUPON ELIGIBLE] [TIERED COUPONS: ${Math.floor(subtotal / MINIMUM_ORDER_USD)}]`
    }).select('id').single();
    orderId = legacyOrderResult.data?.id;
    error = legacyOrderResult.error;
    if (!error) {
      const legacyItems = items.map(item => ({
        order_id: orderId,
        model: item.model,
        product_name: item.productName,
        unit_price_usd: item.unitPriceUsd,
        quantity: item.quantity
      }));
      const legacyItemResult = await client.from('order_items').insert(legacyItems);
      error = legacyItemResult.error;
      automatedCoupon = false;
    }
  }
  if (error) { status.textContent = error.message; button.disabled = false; return; }
  const order = { id: orderId };
  cart = [];
  selectedCouponCodes = [];
  save();
  const freightMessage = checkout.freight_method === 'quote' ? 'Your SF International freight quotation will be emailed within 1 business day. The order will be shipped by SF International after confirmation.' : `Freight will be charged to your ${e(checkout.courier === 'Other' ? checkout.other_courier : checkout.courier)} collect account.`;
  const method = paymentCode(checkout.payment_method);
  const paymentMessage = method === 'company_bank_transfer'
    ? `The Proforma Invoice with LZN MEDICAL CO., LTD. company bank details will be sent to <strong>${e(session.user.email)}</strong>.`
    : `The Proforma Invoice will be sent to <strong>${e(session.user.email)}</strong>. After freight and the final invoice are confirmed, a secure Card / PayPal payment request will be emailed through Payoneer. Available methods, any payer fee and the final amount will be shown on Payoneer before payment.`;
  const earnedCouponCount = Math.floor(subtotal / MINIMUM_ORDER_USD);
  const couponMessage = automatedCoupon
    ? `After payment confirmation, this order will earn ${earnedCouponCount} new USD ${money(COUPON_VALUE_USD)} coupon${earnedCouponCount === 1 ? '' : 's'} (USD ${money(earnedCouponCount * COUPON_VALUE_USD)} total).`
    : `This order qualifies for ${earnedCouponCount} USD ${money(COUPON_VALUE_USD)} coupon${earnedCouponCount === 1 ? '' : 's'}. The eligibility has been marked on your order for our sales team.`;
  const appliedDiscount = checkout.coupon_codes.length * COUPON_VALUE_USD;
  show(`<div class="panel-head"><p class="eyebrow">Checkout Complete</p><h2>Proforma Invoice requested</h2></div><p>Your request number is:</p><p class="request-id">${e(order.id)}</p>${checkout.coupon_codes.length ? `<p class="coupon-applied"><strong>${checkout.coupon_codes.length} coupon${checkout.coupon_codes.length === 1 ? '' : 's'} applied:</strong> ${e(checkout.coupon_codes.join(', '))} — USD ${money(appliedDiscount)} off</p>` : ''}<p><strong>Payment method:</strong> ${e(paymentLabel(method))}</p><p>${freightMessage}</p><p>${paymentMessage}</p><p>${couponMessage}</p><div class="cart-actions"><button class="button secondary-button" data-panel-close-final>Continue shopping</button><button class="button" id="viewOrdersAfterCheckout">View my orders</button></div>`);
  document.querySelector('[data-panel-close-final]').onclick = hide;
  document.querySelector('#viewOrdersAfterCheckout').onclick = ordersView;
}

window.addEventListener('lzn:add-cart', event => {
  const product = products.find(item => item.model === event.detail.model);
  if (!product) return;
  const option = event.detail.option || null;
  const pd = event.detail.pd || null;
  const pdLabel = event.detail.pdLabel || (pd ? `Fixed PD: ${pd} mm` : null);
  const model = option?.model || product.model;
  const priceUsd = event.detail.pdPriceUsd ?? option?.priceUsd ?? product.priceUsd ?? null;
  const priceOnRequest = priceUsd == null || !Number.isFinite(Number(priceUsd));
  const optionLabel = option?.label || null;
  const quantity = Math.min(999, Math.max(1, Math.floor(Number(event.detail.quantity) || 1)));
  let found = cart.find(item => item.model === model && item.pd === pd && item.pdLabel === pdLabel && item.optionLabel === optionLabel);
  if (found) {
    found.quantity = event.detail.setQuantity ? quantity : Math.min(999, found.quantity + quantity);
    found.orderUnitLabel = product.orderUnitLabel || found.orderUnitLabel || null;
    found.priceOnRequest = priceOnRequest;
  }
  else {
    found = { model, nameEn: product.nameEn, image: product.image, priceUsd, priceOnRequest, pd, pdLabel, optionLabel, orderUnitLabel: product.orderUnitLabel || null, quantity };
    cart.push(found);
  }
  event.detail.resultQuantity = found.quantity;
  save();
  toast(`${model} quantity: ${found.quantity}.`, true);
});

accountButton.onclick = authView;
cartButton.onclick = cartView;
save(false);
if (explicitCartOpen) {
  history.replaceState({}, '', location.pathname);
  setTimeout(cartView, 0);
}
const emailConfirmationReturn = new URLSearchParams(location.search).get('email-confirmed') === '1' || location.hash.includes('type=signup') || (location.hash.includes('access_token=') && localStorage.getItem('lzn-awaiting-email-confirmation') === '1');
function emailConfirmedView() {
  localStorage.removeItem('lzn-awaiting-email-confirmation');
  history.replaceState({}, '', location.pathname);
  authView();
}
if (client) {
  client.auth.getSession().then(({ data }) => {
    session = data.session;
    accountLabel();
    restoreCloudCart();
    if (requestedAccountView && !emailConfirmationReturn) {
      history.replaceState({}, '', location.pathname);
      setTimeout(() => {
        if (!session) authView();
        else if (requestedAccountView === 'orders') ordersView();
        else profileView();
      }, 0);
    }
    if (session && emailConfirmationReturn) {
      localStorage.removeItem('lzn-return-to-cart');
      setTimeout(emailConfirmedView, 250);
    }
  });
  client.auth.onAuthStateChange((event, newSession) => {
    const previousUserId = session?.user?.id || null;
    session = newSession;
    accountLabel();
    if (event === 'SIGNED_IN') {
      if (previousUserId !== session?.user?.id || restoredCartUserId !== session?.user?.id) restoreCloudCart();
      if (!previousUserId) toast(`Signed in as ${session.user.email}`);
    }
    if (event === 'SIGNED_OUT') {
      restoredCartUserId = null;
      selectedCouponCodes = [];
      toast('You have signed out.');
    }
  });
}
