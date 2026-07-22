const cfg = window.LZN_SUPABASE || {};
const client = window.supabase?.createClient(cfg.url, cfg.publishableKey);
const panel = document.querySelector('#commercePanel');
const body = document.querySelector('#commerceBody');
const accountButton = document.querySelector('#accountButton');
const cartButton = document.querySelector('#cartButton');
const cartCount = document.querySelector('#cartCount');
const explicitCartOpen = new URLSearchParams(location.search).get('open-cart') === '1';
const products = (window.CATALOG_DATA || []).flatMap(category => category.items.map(product => ({ ...product, categoryEn: category.en })));
const e = value => String(value || '').replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
let session = null;
let cart = JSON.parse(localStorage.getItem('lzn-cart') || '[]');
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
  try {
    cart = await window.LZNCloudCart.restore(session);
    save(repairCartImages(cart));
    if (panel.classList.contains('active') && panel.classList.contains('cart-mode')) cartView();
  } catch (error) {
    console.warn('Saved cart could not be restored:', error.message || error);
  }
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
  show(`<div class="panel-head"><p class="eyebrow">Customer Account</p><h2>${session ? 'My account' : 'Sign in or register'}</h2></div>${session ? `<p>Signed in as <strong>${e(session.user.email)}</strong></p><div class="account-actions"><button class="button" id="ordersOpen">My orders</button><button class="button secondary-button" id="profileOpen">Profile & shipping</button></div><button class="text-button" id="signOut">Sign out</button>` : `<form class="commerce-form" id="authForm"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Password<input name="password" type="password" minlength="8" required autocomplete="current-password"></label><label>Company name (required for registration)<input name="company_name" autocomplete="organization"></label><label>Manager / Contact name (required for registration)<input name="full_name" autocomplete="name"></label><label class="reminder-consent"><input name="cart_reminder_opt_in" type="checkbox" value="true"><span>Email me reminders about items left in my cart. Reminders may be sent after 3, 7, 14, 21 and 29 days; the saved cart is deleted after 30 days.</span></label><button class="button" name="mode" value="signin">Sign in</button><button class="button secondary-button" name="mode" value="signup">Create company account</button><p class="form-status" id="authStatus"></p></form>`}`);
  if (session) {
    document.querySelector('#signOut').onclick = async () => {
      await client.auth.signOut();
      window.LZNCloudCart?.clearLocal();
      cart = [];
      save(false);
      hide();
    };
    document.querySelector('#profileOpen').onclick = profileView;
    document.querySelector('#ordersOpen').onclick = ordersView;
  } else document.querySelector('#authForm').onsubmit = handleAuth;
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

function orderDate(value) {
  return value ? new Date(value).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }) : '-';
}

async function ordersView() {
  show('<div class="panel-head"><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><p>Loading your orders...</p>', true);
  const { data, error } = await client.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
  if (error) {
    show(`<div class="panel-head"><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><p class="form-status">${e(error.message)}</p><button class="button secondary-button" id="backAccount">Back to account</button>`, true);
    document.querySelector('#backAccount').onclick = authView;
    return;
  }
  const orders = data || [];
  show(`<div class="panel-head cart-heading"><div><p class="eyebrow">Customer Account</p><h2>My orders</h2></div><span>${orders.length} orders</span></div>
    <div class="customer-orders">${orders.length ? orders.map(order => {
      const total = order.total_usd ?? order.subtotal_usd;
      const tracking = order.status === 'shipped' && order.tracking_no ? `<div class="tracking-box"><span>Tracking number</span><strong>${e(order.tracking_no)}</strong><small>${e(order.courier || '')}</small><a class="text-button" href="https://www.17track.net/en/track#nums=${encodeURIComponent(order.tracking_no)}" target="_blank" rel="noopener">Track shipment</a></div>` : '';
      const confirmAction = order.pi_created_at && !order.pi_confirmed_at && ['quoted', 'payment_pending'].includes(order.status) ? `<button class="payment-notice" data-confirm-pi="${e(order.id)}">Confirm Proforma Invoice</button>` : '';
      const method = paymentCode(order.payment_method);
      const readyForPayment = order.invoice_no && order.pi_confirmed_at && ['quoted', 'payment_pending'].includes(order.status);
      const bankTransferAction = readyForPayment && method === 'company_bank_transfer' ? `<button class="payment-notice" data-payment-id="${e(order.id)}">I have completed bank transfer</button>` : '';
      const payoneerAction = readyForPayment && method !== 'company_bank_transfer' ? '<div class="payment-waiting payoneer-link-notice"><strong>Secure Payoneer payment link</strong><span>We will email your Card / PayPal payment request after freight and the final invoice are confirmed. Available methods, any payer fee and the final amount will be shown on Payoneer before payment.</span></div>' : '';
      const paymentAction = `${confirmAction}${bankTransferAction}${payoneerAction}`;
      const paymentWaiting = order.status === 'payment_submitted' ? `<div class="payment-waiting"><strong>Payment verification pending</strong><span>${method === 'company_bank_transfer' ? `We received your transfer notice${order.payment_submitted_at ? ` on ${orderDate(order.payment_submitted_at)}` : ''}. Your order will change to Paid after the funds are confirmed in our company bank account.` : 'We are verifying the Payoneer payment. Your order will change to Paid after the payment is confirmed.'}</span></div>` : '';
      return `<article class="customer-order"><div class="customer-order-head"><div><span>${e(order.invoice_no || `Order ${order.id.slice(0, 8)}`)}</span><strong>${orderDate(order.created_at)}</strong></div><div><b class="order-status ${e(order.status)}">${e(statusLabels[order.status] || order.status)}</b><strong>USD ${Number(total || 0).toFixed(2)}</strong></div></div><div class="order-progress"><span class="${['quote_requested','quoted','payment_pending','payment_submitted','paid','processing','shipped'].includes(order.status) ? 'done' : ''}">Received</span><span class="${['paid','processing','shipped'].includes(order.status) ? 'done' : ''}">Paid</span><span class="${['processing','shipped'].includes(order.status) ? 'done' : ''}">Preparing</span><span class="${order.status === 'shipped' ? 'done' : ''}">Shipped</span></div>${paymentAction}${paymentWaiting}${tracking}<details><summary>View order details</summary><div class="customer-order-items">${(order.order_items || []).map(item => `<div><span><strong>${e(item.model)}</strong><small>${e(item.product_name)}</small></span><span>Qty ${e(item.quantity)}</span><strong>USD ${Number(item.line_total_usd || 0).toFixed(2)}</strong></div>`).join('')}</div><div class="customer-order-totals"><span>Products <strong>USD ${Number(order.subtotal_usd || 0).toFixed(2)}</strong></span><span>Freight <strong>${order.freight_usd == null ? 'Pending quotation' : `USD ${Number(order.freight_usd).toFixed(2)}`}</strong></span><span>Total <strong>USD ${Number(total || 0).toFixed(2)}</strong></span></div><p><strong>Payment method:</strong> ${e(paymentLabel(order.payment_method))}</p><p><strong>Shipping address:</strong> ${e(order.shipping_address || '-')} ${e(order.postal_code || '')}</p><p><strong>Freight arrangement:</strong> ${e(order.courier || '-')}</p></details></article>`;
    }).join('') : '<div class="empty-orders"><h3>No orders yet</h3><p>Your completed and current orders will appear here.</p></div>'}</div><div class="cart-actions"><button class="button secondary-button" id="backAccount">Back to account</button><button class="button" id="shopAgain">Continue shopping</button></div>`, true);
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

async function handleAuth(event) {
  event.preventDefault();
  const mode = event.submitter.value;
  const form = new FormData(event.currentTarget);
  const status = document.querySelector('#authStatus');
  if (mode === 'signup' && (!String(form.get('company_name') || '').trim() || !String(form.get('full_name') || '').trim())) {
    status.textContent = 'Company name and Manager / Contact name are required.';
    return;
  }
  status.textContent = 'Please wait…';
  localStorage.setItem('lzn-return-to-cart', '1');
  const result = mode === 'signup'
    ? await client.auth.signUp({ email: form.get('email'), password: form.get('password'), options: { emailRedirectTo: `${location.origin}${location.pathname}?email-confirmed=1#cart`, data: { company_name: String(form.get('company_name')).trim(), full_name: String(form.get('full_name')).trim(), buyer_type: 'company', cart_reminder_opt_in: form.get('cart_reminder_opt_in') === 'true' } } })
    : await client.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
  status.textContent = result.error ? result.error.message : (mode === 'signup' ? 'Check your email. The confirmation link will return you to your cart.' : 'Signed in. Returning to your cart…');
  if (!result.error && mode === 'signup') localStorage.setItem('lzn-awaiting-email-confirmation', '1');
  if (!result.error && mode === 'signin') hide();
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
      <label>Company name<input name="company_name" required value="${e(profile.company_name)}"></label>
      <label>Manager / Contact name<input name="full_name" required value="${e(profile.full_name)}"></label>
      <label>Phone<input name="phone" required value="${e(profile.phone)}"></label>
      <label>WhatsApp<input name="whatsapp" value="${e(profile.whatsapp)}"></label>
      <label>Country<input name="country" required value="${e(profile.country)}"></label>
      <label>Postal code<input name="postal_code" required value="${e(profile.postal_code)}"></label>
      <label class="wide">Address line 1<input name="address_line_1" required value="${e(profile.address_line_1)}"></label>
      <label class="wide">Address line 2<input name="address_line_2" value="${e(profile.address_line_2)}"></label>
      <label>City<input name="city" required value="${e(profile.city)}"></label>
      <label>State / Province<input name="state_province" value="${e(profile.state_province)}"></label>
      <label>Importer / Customs ID (optional)<input name="tax_id" value="${e(profile.tax_id)}"><small>Enter the importer or customs identification number requested by your local customs authority or courier (for example, an EORI or Importer Number). This is not a general business registration number. Leave it blank if it is not required for your shipment.</small></label>
      <label>Preferred courier<select name="preferred_courier"><option value="">No collect account</option>${['DHL', 'FedEx', 'UPS', 'EMS', 'SF Express', 'Other'].map(value => `<option ${profile.preferred_courier === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label class="wide">Courier collect account (optional)<input name="courier_account_no" value="${e(profile.courier_account_no)}"></label>
      <label class="wide reminder-consent"><input name="cart_reminder_opt_in" type="checkbox" value="true" ${[true, 'true', 1, '1'].includes(profile.cart_reminder_opt_in) ? 'checked' : ''}><span>Email me reminders about items left in my cart. I can turn these reminders off at any time.</span></label>
      <button class="button wide">Save profile</button><p class="form-status wide" id="profileStatus"></p>
    </form>`);
  const form = document.querySelector('#profileForm');
  form.onsubmit = saveProfile;
}

async function saveProfile(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  values.buyer_type = 'company';
  values.cart_reminder_opt_in = event.currentTarget.elements.cart_reminder_opt_in.checked;
  const { error } = await client.from('profiles').update(values).eq('id', session.user.id);
  document.querySelector('#profileStatus').textContent = error ? error.message : 'Profile saved.';
}

function money(value) {
  return Number(value).toFixed(Number(value) >= 100 ? 0 : 2);
}

function cartView() {
  if (repairCartImages(cart)) save();
  const total = cart.reduce((sum, item) => sum + (item.priceUsd || 0) * item.quantity, 0);
  const hasQuote = cart.some(item => !item.priceUsd);
  show(`<div class="panel-head cart-heading"><div><p class="eyebrow">Shopping Cart</p><h2>${cart.length ? 'Your cart' : 'Your cart is empty'}</h2></div><span>${cart.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
    <div class="cart-list">${cart.map((item, index) => `<div class="cart-row"><img src="${e(item.image)}" alt=""><div><strong>${e(item.model)}</strong><span>${e(item.nameEn)}</span>${item.optionLabel ? `<small class="chosen-option">${e(item.optionLabel)}</small>` : ''}${item.pd ? `<small class="chosen-option">Fixed PD: ${e(item.pd)} mm</small>` : ''}<small>${item.priceUsd ? `USD ${money(item.priceUsd)} ${item.orderUnitLabel ? `per ${e(item.orderUnitLabel)}` : 'each'}` : 'Price on quotation'}</small></div><label class="qty-label">Qty<input type="number" min="1" value="${item.quantity}" data-qty="${index}"></label><strong class="line-total">${item.priceUsd ? `USD ${money(item.priceUsd * item.quantity)}` : 'Quote'}</strong><button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button></div>`).join('')}</div>
    ${cart.length ? `<div class="cart-summary"><div><span>${hasQuote ? 'Priced items subtotal' : 'FOB China subtotal'}</span><strong>USD ${money(total)}</strong></div><p>Freight, destination duties and local taxes are not included. Availability and freight are confirmed before the Proforma Invoice is issued.</p></div><div class="cart-actions"><button class="button secondary-button" id="continueShopping">Continue shopping</button><button class="button" id="checkoutButton">Proceed to checkout</button></div><p class="form-status" id="quoteStatus"></p>` : `<button class="button" id="continueShopping">Continue shopping</button>`}`, true);
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
}

function checkoutView() {
  const subtotal = cart.reduce((sum, item) => sum + (item.priceUsd || 0) * item.quantity, 0);
  show(`<div class="panel-head"><p class="eyebrow">Checkout</p><h2>Payment & freight</h2></div><div class="checkout-summary"><span>FOB China product subtotal</span><strong>USD ${money(subtotal)}</strong></div><form class="commerce-form checkout-form" id="checkoutForm"><fieldset><legend>Payment method</legend><label class="choice-card payment-choice"><input type="radio" name="payment_method" value="company_bank_transfer" checked><span><strong>Company bank transfer <em>Recommended for orders over USD 1,000</em></strong><small>No processing fee charged by LZN MEDICAL. Sending and intermediary bank charges are borne by the buyer.</small><span class="bank-transfer-details" aria-label="USD bank transfer details"><b class="bank-details-title">USD bank transfer details</b><span class="bank-detail-row"><span>Beneficiary</span><b>LZN MEDICAL CO., LTD.</b></span><span class="bank-detail-row"><span>USD Account</span><b class="bank-copy-value">100103205899</b></span><span class="bank-detail-row"><span>SWIFT / BIC</span><b class="bank-copy-value">HVBKCNBJ</b></span><span class="bank-detail-row"><span>Bank</span><b>Woori Bank(China) Limited Shanghai JinXiuJiangNan Sub-Branch</b></span><span class="bank-detail-row"><span>Bank Address</span><b>No.101-1,101-2b,102 MT BLDG, 3999 Hongxin Road, Minhang District, Shanghai, China</b></span></span></span></label><label class="choice-card payment-choice"><input type="radio" name="payment_method" value="payoneer_card_paypal"><span><strong>Card / PayPal <em>Processed securely by Payoneer</em></strong><small>Available payment methods and processing fees may vary by country, customer and payment request. A payment link will be emailed after freight and the final invoice are confirmed.</small><span class="payment-logo-panel"><span class="payment-logo-row"><img class="payment-logo-strip" src="assets/payment/payoneer-payment-options.png" alt="Possible payment options: Visa, Mastercard, American Express, Discover, Diners Club, JCB and Plaid"><span class="paypal-brand"><img src="assets/payment/paypal.png" alt=""><b>PayPal</b></span></span><small>Possible options include cards and PayPal. Availability varies by country and payment request.</small></span></span></label><div class="payment-fee-estimate" id="paymentFeeEstimate" aria-live="polite"></div></fieldset><fieldset><legend>Freight arrangement</legend><label class="choice-card"><input type="radio" name="freight_method" value="quote" checked><span><strong>Request freight quotation — SF International</strong><small>Quoted-freight orders are shipped by SF International. By selecting this option, you accept SF International as the carrier and the quoted SF International freight charge. We do not automatically substitute the cheapest courier service.</small></span></label><label class="choice-card"><input type="radio" name="freight_method" value="collect"><span><strong>Courier collect</strong><small>Freight will be charged directly to your courier account.</small></span></label><div class="collect-fields" id="collectFields"><label>Courier<select name="courier" id="checkoutCourier"><option>DHL</option><option>FedEx</option><option>UPS</option><option>EMS</option><option>SF Express</option><option>Other</option></select></label><label id="otherCourierLabel">Other courier name<input name="other_courier" placeholder="Enter courier name"></label><label>Courier account number<input name="courier_account_no" placeholder="Required for courier collect"></label></div></fieldset><div class="cart-actions"><button type="button" class="button secondary-button" id="backToCart">Back to cart</button><button class="button" id="placeOrderButton">Request Proforma Invoice</button></div><p class="form-status" id="quoteStatus"></p></form>`, true);
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
    if (method === 'company_bank_transfer') {
      estimate.innerHTML = `<strong>${subtotal >= 1000 ? 'Recommended — Company bank transfer' : 'Company bank transfer'}</strong><span>No processing fee is charged by LZN MEDICAL.</span>`;
      return;
    }
    estimate.innerHTML = '<strong>Processing fee confirmed by Payoneer</strong><span>Rates and available payment methods may change. The final fee and total are shown on the Payoneer payment page before payment. Any payer fee is not included in the PI total.</span>';
  }
  form.querySelectorAll('[name="freight_method"]').forEach(input => input.addEventListener('change', updateFreightFields));
  form.querySelectorAll('[name="payment_method"]').forEach(input => input.addEventListener('change', updatePaymentEstimate));
  form.elements.courier.addEventListener('change', updateFreightFields);
  document.querySelector('#backToCart').onclick = cartView;
  form.onsubmit = submitQuote;
  updateFreightFields();
  updatePaymentEstimate();
}

async function submitQuote(event) {
  event.preventDefault();
  const checkout = Object.fromEntries(new FormData(event.currentTarget));
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
  const stores = [...new Set(cart.map(item => item.sourceStore || 'Tools'))];
  const storeNote = stores.length > 1 ? `[MIXED STORE] ${stores.join(', ')}` : `[${stores[0].toUpperCase()} STORE]`;
  const shipping = [profile.address_line_1, profile.address_line_2, profile.city, profile.state_province, profile.country].filter(Boolean).join(', ');
  const courierName = checkout.freight_method === 'quote' ? 'SF International freight quotation requested' : `Courier collect: ${checkout.courier === 'Other' ? checkout.other_courier : checkout.courier}`;
  const { data: order, error } = await client.from('orders').insert({ user_id: session.user.id, status: 'quote_requested', subtotal_usd: subtotal, payment_method: paymentCode(checkout.payment_method), destination_country: profile.country, buyer_type: 'company', company_name: profile.company_name, contact_name: profile.full_name, contact_email: session.user.email, contact_phone: profile.phone, shipping_address: shipping, postal_code: profile.postal_code, courier: courierName, courier_account_no: checkout.freight_method === 'collect' ? checkout.courier_account_no : null, customer_note: storeNote }).select('id').single();
  if (error) { status.textContent = error.message; button.disabled = false; return; }
  const items = cart.map(item => ({ order_id: order.id, model: item.model, product_name: `${item.nameEn}${item.optionLabel ? ` (${item.optionLabel})` : ''}${item.pdLabel ? ` (${item.pdLabel})` : (item.pd ? ` (PD ${item.pd} mm)` : '')}${item.orderUnitLabel ? ` (${item.orderUnitLabel} per order unit)` : ''}`, unit_price_usd: item.priceUsd || 0, quantity: item.quantity }));
  const { error: itemError } = await client.from('order_items').insert(items);
  if (itemError) { status.textContent = itemError.message; button.disabled = false; return; }
  cart = [];
  save();
  const freightMessage = checkout.freight_method === 'quote' ? 'Your SF International freight quotation will be emailed within 1 business day. The order will be shipped by SF International after confirmation.' : `Freight will be charged to your ${e(checkout.courier === 'Other' ? checkout.other_courier : checkout.courier)} collect account.`;
  const method = paymentCode(checkout.payment_method);
  const paymentMessage = method === 'company_bank_transfer'
    ? `The Proforma Invoice with LZN MEDICAL CO., LTD. company bank details will be sent to <strong>${e(session.user.email)}</strong>.`
    : `The Proforma Invoice will be sent to <strong>${e(session.user.email)}</strong>. After freight and the final invoice are confirmed, a secure Card / PayPal payment request will be emailed through Payoneer. Available methods, any payer fee and the final amount will be shown on Payoneer before payment.`;
  show(`<div class="panel-head"><p class="eyebrow">Checkout Complete</p><h2>Proforma Invoice requested</h2></div><p>Your request number is:</p><p class="request-id">${e(order.id)}</p><p><strong>Payment method:</strong> ${e(paymentLabel(method))}</p><p>${freightMessage}</p><p>${paymentMessage}</p><div class="cart-actions"><button class="button secondary-button" data-panel-close-final>Continue shopping</button><button class="button" id="viewOrdersAfterCheckout">View my orders</button></div>`);
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
  const optionLabel = option?.label || null;
  const quantity = Math.min(999, Math.max(1, Math.floor(Number(event.detail.quantity) || 1)));
  let found = cart.find(item => item.model === model && item.pd === pd && item.pdLabel === pdLabel && item.optionLabel === optionLabel);
  if (found) {
    found.quantity = event.detail.setQuantity ? quantity : Math.min(999, found.quantity + quantity);
    found.orderUnitLabel = product.orderUnitLabel || found.orderUnitLabel || null;
  }
  else {
    found = { model, nameEn: product.nameEn, image: product.image, priceUsd, pd, pdLabel, optionLabel, orderUnitLabel: product.orderUnitLabel || null, quantity };
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
  history.replaceState({}, '', `${location.pathname}#cart`);
  show(`<div class="panel-head"><p class="eyebrow">Email Confirmed</p><h2>Your company account is ready</h2></div><p>Your email address has been confirmed successfully. You are signed in as <strong>${e(session?.user?.email)}</strong>.</p><div class="cart-actions"><button class="button secondary-button" id="confirmedProfile">Complete company profile</button><button class="button" id="confirmedCart">Continue to cart</button></div>`);
  document.querySelector('#confirmedProfile').onclick = profileView;
  document.querySelector('#confirmedCart').onclick = cartView;
}
if (client) {
  client.auth.getSession().then(({ data }) => {
    session = data.session;
    accountLabel();
    restoreCloudCart();
    if (session && emailConfirmationReturn) {
      localStorage.removeItem('lzn-return-to-cart');
      setTimeout(emailConfirmedView, 250);
    }
  });
  client.auth.onAuthStateChange((event, newSession) => {
    const wasSignedIn = Boolean(session);
    session = newSession;
    accountLabel();
    if (event === 'SIGNED_IN') {
      restoreCloudCart();
      if (!wasSignedIn) toast(`Signed in as ${session.user.email}`);
    }
    if (event === 'SIGNED_OUT') toast('You have signed out.');
  });
}

