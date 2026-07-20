const config = window.LZN_SUPABASE || {};
const client = window.supabase?.createClient(config.url, config.publishableKey);
const authView = document.querySelector('#authView');
const accessView = document.querySelector('#accessView');
const dashboard = document.querySelector('#dashboard');
const signOutButton = document.querySelector('#signOut');
const drawer = document.querySelector('#orderDrawer');
const detail = document.querySelector('#orderDetail');
const money = value => `USD ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = value => value ? new Date(value).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusLabels = {
  quote_requested: 'Quote requested', quoted: 'PI prepared', payment_pending: 'Awaiting payment',
  payment_submitted: 'Payment reported', paid: 'Payment confirmed', processing: 'Awaiting shipment',
  shipped: 'Shipped', cancelled: 'Cancelled'
};
const nextStepLabels = {
  quote_requested: 'Prepare and email the Proforma Invoice', quoted: 'Email the Proforma Invoice',
  payment_pending: 'Wait for customer payment', payment_submitted: 'Verify the payment and confirm receipt',
  paid: 'Create the Commercial Invoice and prepare shipment', processing: 'Enter tracking and mark as shipped',
  shipped: 'Monitor delivery', cancelled: 'No further action'
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

function invoiceTermsRows(order, documentTitle) {
  const method = paymentCode(order.payment_method);
  const freight = `${order.courier || '-'}${order.courier_account_no ? ` / Account: ${order.courier_account_no}` : ''}`;
  const rows = [
    ['Trade term', 'FOB China'],
    ['Freight instruction', freight],
    ['Duties and taxes', 'Destination duties and local taxes are not included unless separately stated.'],
  ];
  if (documentTitle !== 'PROFORMA INVOICE') return [...rows, ['Payment status', 'Payment confirmed before shipment.']];
  if (method === 'payoneer_card_paypal') return [...rows,
    ['Payment method', 'Card / PayPal'],
    ['Processor', 'Payoneer secure payment request'],
    ['Available options', 'Payment methods vary by country, customer and payment request.'],
    ['Processing fee', 'May change and is confirmed on the Payoneer payment page before payment.'],
    ['PI total', 'Processing fees charged by Payoneer are not included in this PI total.'],
    ['Payment link', 'Emailed after freight and the final invoice are confirmed.'],
  ];
  return [...rows,
    ['Payment method', 'Company bank transfer'],
    ['Bank', 'Woori Bank (China) Limited'],
    ['Branch', 'Shanghai JinXiuJiangNan Sub-Branch'],
    ['Beneficiary', 'LZN MEDICAL CO., LTD.'],
    ['USD account', '100103205899'],
    ['SWIFT', 'HVBKCNBJ'],
    ['Bank charges', 'Sending and intermediary bank charges are borne by the buyer.'],
    ['Payment reference', order.invoice_no || 'Please include the PI number.'],
  ];
}

function paymentBoxesHtml(order) {
  const method = paymentCode(order.payment_method);
  if (method === 'company_bank_transfer') return '<div class="box"><h3>Payment terms</h3>Company bank transfer<br>Sending and intermediary bank charges are borne by the buyer.<br>Goods will be prepared after payment confirmation.</div><div class="box"><h3>Bank account</h3><strong>Woori Bank (China) Limited</strong><br>Shanghai JinXiuJiangNan Sub-Branch<br>USD Account: 100103205899<br>SWIFT: HVBKCNBJ<br>Beneficiary: LZN MEDICAL CO., LTD.</div>';
  return '<div class="box"><h3>Payment terms</h3><strong>Card / PayPal</strong><br>Processed securely by Payoneer.<br>Available methods and processing fees may vary.</div><div class="box"><h3>Payoneer payment request</h3>A secure payment link will be emailed after freight and the final invoice are confirmed.<br>The final fee and total are shown on Payoneer before payment. Any payer fee is not included in the PI total.</div>';
}

function storeName(order, long = false) {
  const note = `${order.customer_note || ''} ${order.admin_note || ''}`;
  if (note.includes('[MIXED STORE]')) return long ? 'Mixed store order' : 'Mixed';
  if (note.includes('[FRAMES STORE]')) return long ? 'Frames store order' : 'Frames';
  if (note.includes('[LENS STORE]')) return long ? 'Lens store order' : 'Lens';
  return long ? 'Tools store order' : 'Tools';
}

function visibleAdminNote(order) {
  return String(order.admin_note || '').replace('[FRAMES STORE]', '').replace('[LENS STORE]', '').trim();
}

function invoiceActivity(order) {
  const entries = [
    ['PI created', order.pi_created_at], ['PI emailed', order.pi_emailed_at], ['Customer confirmed PI', order.pi_confirmed_at],
    ['CI created', order.ci_created_at], ['CI emailed', order.ci_emailed_at], ['Shipment email sent', order.shipped_emailed_at],
    ['Delivery email sent', order.delivered_emailed_at],
  ].filter(([, value]) => value);
  const files = [
    ['Proforma Invoice', order.pi_file_path, order.pi_filename],
    ['Commercial Invoice', order.ci_file_path, order.ci_filename],
  ].filter(([, path]) => path);
  return `<section class="detail-section"><h3>Attachments & activity</h3>
    <div class="invoice-files">${files.length ? files.map(([label, path, filename]) => `<button class="outline-button" type="button" data-invoice-path="${e(path)}">${e(label)} · ${e(filename || 'PDF')}</button>`).join('') : '<p>No invoice PDF stored yet.</p>'}</div>
    <div class="activity-log">${entries.length ? entries.map(([label, value]) => `<div><span>${e(label)}</span><strong>${e(date(value))}</strong></div>`).join('') : '<p>No invoice activity recorded yet.</p>'}</div></section>`;
}

let session = null;
let orders = [];
let members = [];
let activeOrder = null;
let activeItems = [];

function showOnly(view) {
  [authView, accessView, dashboard].forEach(item => item.hidden = item !== view);
  signOutButton.hidden = !session;
}

async function boot() {
  if (!client) {
    showOnly(authView);
    document.querySelector('#loginStatus').textContent = 'Supabase configuration is unavailable.';
    return;
  }
  const { data } = await client.auth.getSession();
  session = data.session;
  if (session) {
    const refreshed = await client.auth.refreshSession();
    if (refreshed.data?.session) session = refreshed.data.session;
  }
  await routeSession();
}

async function routeSession() {
  if (!session) {
    showOnly(authView);
    return;
  }
  const { data: admin, error } = await client.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (error || !admin) {
    showOnly(accessView);
    document.querySelector('#accessEmail').textContent = session.user.email || '';
    return;
  }
  showOnly(dashboard);
  document.querySelector('#adminIdentity').textContent = `Signed in as ${session.user.email}`;
  await loadData();
}

document.querySelector('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.querySelector('#loginStatus');
  const values = Object.fromEntries(new FormData(event.currentTarget));
  status.textContent = 'Signing in...';
  const { data, error } = await client.auth.signInWithPassword(values);
  if (error) {
    status.textContent = error.message;
    return;
  }
  session = data.session;
  status.textContent = '';
  await routeSession();
});

signOutButton.addEventListener('click', async () => {
  await client.auth.signOut();
  session = null;
  orders = [];
  members = [];
  showOnly(authView);
});

async function loadData(retried = false) {
  document.querySelector('#refreshData').disabled = true;
  const [orderResult, memberResult] = await Promise.all([
    client.from('orders').select('*').order('created_at', { ascending: false }),
    client.from('profiles').select('*').order('created_at', { ascending: false })
  ]);
  document.querySelector('#refreshData').disabled = false;
  if (orderResult.error || memberResult.error) {
    const message = orderResult.error?.message || memberResult.error?.message || 'Unable to load admin data.';
    if (!retried && /jwt issued at future/i.test(message)) {
      const refreshed = await client.auth.refreshSession();
      if (refreshed.data?.session) {
        session = refreshed.data.session;
        return loadData(true);
      }
    }
    document.querySelector('#adminIdentity').textContent = `Data could not be refreshed: ${message}`;
    return;
  }
  orders = orderResult.data || [];
  members = memberResult.data || [];
  renderSummary();
  renderOrders();
  renderMembers();
}

function renderSummary() {
  const open = orders.filter(order => !['shipped', 'cancelled'].includes(order.status)).length;
  const awaitingPayment = orders.filter(order => ['quoted', 'payment_pending', 'payment_submitted'].includes(order.status)).length;
  const paid = orders.filter(order => ['paid', 'processing', 'shipped'].includes(order.status)).reduce((sum, order) => sum + Number(order.total_usd || order.subtotal_usd || 0), 0);
  document.querySelector('#summaryGrid').innerHTML = `
    <div class="summary-card"><span>Members</span><strong>${members.length}</strong></div>
    <div class="summary-card"><span>Total orders</span><strong>${orders.length}</strong></div>
    <div class="summary-card"><span>Open orders</span><strong>${open}</strong></div>
    <div class="summary-card"><span>Paid order value</span><strong>${money(paid)}</strong><small>${awaitingPayment} awaiting payment</small></div>`;
}

function orderMatches(order) {
  const query = document.querySelector('#orderSearch').value.trim().toLowerCase();
  const filter = document.querySelector('#statusFilter').value;
  const haystack = `${order.id} ${order.invoice_no || ''} ${order.contact_name || ''} ${order.contact_email || ''} ${order.destination_country || ''} ${storeName(order)}`.toLowerCase();
  return (!query || haystack.includes(query)) && (!filter || order.status === filter);
}

function renderOrders() {
  const filtered = orders.filter(orderMatches);
  document.querySelector('#ordersBody').innerHTML = filtered.length ? filtered.map(order => `
    <tr data-order-id="${e(order.id)}">
      <td>${e(date(order.created_at))}</td>
      <td><span class="status store-${storeName(order).toLowerCase()}">${e(storeName(order))}</span></td>
      <td><strong>${e(order.invoice_no || 'PI not assigned')}</strong><br><small class="request-id">${e(order.id.slice(0, 8))}</small></td>
      <td><strong>${e(order.contact_name || '-')}</strong><br><small>${e(order.contact_email || '')}</small></td>
      <td>${e(order.destination_country || '-')}</td>
      <td><span class="status ${e(order.status)}">${e(statusLabels[order.status] || order.status)}</span></td>
      <td class="money">${money(order.total_usd ?? order.subtotal_usd)}</td>
    </tr>`).join('') : '<tr><td class="empty" colspan="7">No matching orders.</td></tr>';
}

function renderMembers() {
  const query = document.querySelector('#memberSearch').value.trim().toLowerCase();
  const filtered = members.filter(member => `${member.full_name || ''} ${member.company_name || ''} ${member.email || ''} ${member.country || ''} ${member.phone || ''}`.toLowerCase().includes(query));
  document.querySelector('#membersBody').innerHTML = filtered.length ? filtered.map(member => `
    <tr data-member-id="${e(member.id)}">
      <td>${e(date(member.created_at))}</td>
      <td><strong>${e(member.full_name || '-')}</strong></td>
      <td>${e(member.company_name || '-')}</td>
      <td>${e(member.email || '-')}</td>
      <td>${e(member.phone || member.whatsapp || '-')}</td>
      <td>${e(member.country || '-')}</td>
      <td>${e([member.preferred_courier, member.courier_account_no].filter(Boolean).join(' / ') || '-')}</td>
    </tr>`).join('') : '<tr><td class="empty" colspan="7">No matching members.</td></tr>';
}

document.querySelector('#orderSearch').addEventListener('input', renderOrders);
document.querySelector('#statusFilter').addEventListener('change', renderOrders);
document.querySelector('#memberSearch').addEventListener('input', renderMembers);
document.querySelector('#refreshData').addEventListener('click', loadData);

document.querySelector('.tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  document.querySelectorAll('.tabs button').forEach(item => item.classList.toggle('active', item === button));
  document.querySelector('#ordersPanel').hidden = button.dataset.tab !== 'orders';
  document.querySelector('#membersPanel').hidden = button.dataset.tab !== 'members';
});

document.querySelector('#ordersBody').addEventListener('click', event => {
  const row = event.target.closest('[data-order-id]');
  if (row) openOrder(row.dataset.orderId);
});

document.querySelector('#membersBody').addEventListener('click', event => {
  const row = event.target.closest('[data-member-id]');
  if (row) openMember(row.dataset.memberId);
});

function openMember(id) {
  const member = members.find(item => item.id === id);
  if (!member) return;
  detail.innerHTML = `
    <div class="detail-head"><p class="eyebrow">Member management</p><h2>${e(member.full_name || member.email || 'Member')}</h2><p>Joined ${e(date(member.created_at))}</p></div>
    <section class="detail-section"><form id="memberForm" class="form-grid">
      <input type="hidden" name="buyer_type" value="company">
      <label>Manager / Contact name<input name="full_name" required value="${e(member.full_name || '')}"></label>
      <label>Company name<input name="company_name" required value="${e(member.company_name || '')}"></label>
      <label>Email<input value="${e(member.email || '')}" readonly></label>
      <label>Phone<input name="phone" value="${e(member.phone || '')}"></label>
      <label>WhatsApp<input name="whatsapp" value="${e(member.whatsapp || '')}"></label>
      <label>Country<input name="country" value="${e(member.country || '')}"></label>
      <label class="wide">Address line 1<input name="address_line_1" value="${e(member.address_line_1 || '')}"></label>
      <label class="wide">Address line 2<input name="address_line_2" value="${e(member.address_line_2 || '')}"></label>
      <label>City<input name="city" value="${e(member.city || '')}"></label>
      <label>State / Province<input name="state_province" value="${e(member.state_province || '')}"></label>
      <label>Postal code<input name="postal_code" value="${e(member.postal_code || '')}"></label>
      <label>Preferred courier<select name="preferred_courier"><option value="">Not specified</option>${['DHL','FedEx','UPS','EMS','SF Express','Other'].map(value => `<option ${member.preferred_courier === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label>Courier account<input name="courier_account_no" value="${e(member.courier_account_no || '')}"></label>
    </form><div class="order-actions"><button class="primary-button" id="saveMember">Save member</button></div><p class="save-status" id="memberSaveStatus"></p></section>`;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.querySelector('#saveMember').addEventListener('click', async () => {
    const status = document.querySelector('#memberSaveStatus');
    const values = Object.fromEntries(new FormData(document.querySelector('#memberForm')));
    Object.keys(values).forEach(key => values[key] = values[key].trim() || null);
    values.buyer_type = 'company';
    if (!values.company_name || !values.full_name) {
      status.textContent = 'Company name and Manager / Contact name are required.';
      return;
    }
    values.updated_at = new Date().toISOString();
    status.textContent = 'Saving...';
    const { data, error } = await client.from('profiles').update(values).eq('id', member.id).select('*').single();
    if (error) {
      status.textContent = error.message;
      return;
    }
    members = members.map(item => item.id === data.id ? data : item);
    status.textContent = 'Saved.';
    renderMembers();
    renderSummary();
  });
}

async function openOrder(id) {
  activeOrder = orders.find(order => order.id === id);
  if (!activeOrder) return;
  detail.innerHTML = '<p>Loading order...</p>';
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  const { data, error } = await client.from('order_items').select('*').eq('order_id', id).order('id');
  if (error) {
    detail.innerHTML = `<p>${e(error.message)}</p>`;
    return;
  }
  activeItems = data || [];
  renderOrderDetail();
}

function renderOrderDetail() {
  const order = activeOrder;
  const freight = Number(order.freight_usd || 0);
  const total = Number(order.total_usd ?? Number(order.subtotal_usd || 0) + freight);
  detail.innerHTML = `
    <div class="detail-head"><p class="eyebrow">${e(storeName(order, true))}</p><h2>${e(order.invoice_no || 'Proforma Invoice not assigned')}</h2><p class="request-id">Order ${e(order.id)}</p></div>
    <div class="workflow-banner"><span>Current stage</span><strong>${e(statusLabels[order.status] || order.status)}</strong><small>Next: ${e(nextStepLabels[order.status] || 'Review the order')}</small></div>
    <section class="detail-section"><h3>Customer & shipping</h3><div class="customer-box"><strong>Recipient type:</strong> ${(order.buyer_type || 'company') === 'company' ? 'Company' : 'Individual'}<br>${(order.buyer_type || 'company') === 'company' && order.company_name ? `<strong>${e(order.company_name)}</strong><br>Attn: ` : ''}<strong>${e(order.contact_name || '-')}</strong>${order.contact_email ? `<br><a href="mailto:${e(order.contact_email)}">${e(order.contact_email)}</a>` : ''}<br>${e(order.contact_phone || '')}<br>${e(order.shipping_address || '')}<br>${e(order.postal_code || '')}<br><br><strong>Payment method:</strong> ${e(paymentLabel(order.payment_method))}${paymentCode(order.payment_method) === 'company_bank_transfer' ? '' : '<br><strong>Processing fee:</strong> Confirmed on Payoneer and may vary.<br><small>Not included in the PI total; do not add it again if Payoneer charges the payer.</small>'}<br><br><strong>Freight request:</strong> ${e(order.courier || '-')}<br><strong>Collect account:</strong> ${e(order.courier_account_no || '-')}</div></section>
    <section class="detail-section"><h3>Items</h3><table class="order-items"><thead><tr><th>Model / item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${activeItems.map(item => `<tr><td><strong>${e(item.model)}</strong><br><small>${e(item.product_name)}</small></td><td>${e(item.quantity)}</td><td>${money(item.unit_price_usd)}</td><td>${money(item.line_total_usd)}</td></tr>`).join('')}</tbody></table></section>
    ${order.payment_submitted_at ? `<section class="detail-section"><h3>Customer payment notice</h3><div class="customer-box payment-review"><strong>Verification required</strong><br>Submitted: ${e(date(order.payment_submitted_at))}<br>Remitter / Reference: ${e(order.payment_reference || '-')}<br>Customer note: ${e(order.payment_note || '-')}<p>Confirm receipt through ${paymentCode(order.payment_method) === 'company_bank_transfer' ? 'the company bank account' : 'Payoneer'} before changing the status to Paid.</p></div></section>` : ''}
    ${invoiceActivity(order)}
    <section class="detail-section"><h3>Order & invoice</h3><form id="orderForm" class="form-grid">
      <label>PI number<input name="invoice_no" value="${e(order.invoice_no || '')}" placeholder="LZN-20260713-001"></label>
      <label>Status<select name="status">${['quote_requested','quoted','payment_pending','payment_submitted','paid','processing','shipped','cancelled'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${e(statusLabels[status])}</option>`).join('')}</select></label>
      <label>Subtotal (USD)<input name="subtotal_usd" type="number" step="0.01" value="${Number(order.subtotal_usd || 0).toFixed(2)}" readonly></label>
      <label>Freight (USD)<input name="freight_usd" type="number" min="0" step="0.01" value="${freight.toFixed(2)}"></label>
      <label>Total (USD)<input name="total_usd" type="number" step="0.01" value="${total.toFixed(2)}" readonly></label>
      <label>Tracking number<input name="tracking_no" value="${e(order.tracking_no || '')}" placeholder="Visible to customer after status is Shipped"><small>Shown to the customer only when status is Shipped.</small></label>
      <label class="wide">Internal note<textarea name="admin_note" rows="3">${e(visibleAdminNote(order))}</textarea></label>
    </form><div class="order-actions"><button class="outline-button" id="generatePi">Generate PI number</button><button class="primary-button" id="saveOrder">Save changes</button><button class="outline-button" id="printInvoice">Create & Email Proforma Invoice PDF</button><button class="primary-button" id="confirmPayment">Confirm payment</button><button class="outline-button" id="printCi">Create & Email Commercial Invoice PDF</button><button class="primary-button" id="markShipped">Mark as shipped</button>${order.status === 'shipped' ? `<button class="outline-button" id="confirmDelivery">Confirm delivery & Email customer</button>` : ''}${order.tracking_no ? `<button class="outline-button" id="trackShipment">Track shipment</button>` : ''}</div><p class="save-status" id="saveStatus"></p></section>`;
  const form = document.querySelector('#orderForm');
  form.elements.freight_usd.addEventListener('input', () => form.elements.total_usd.value = (Number(order.subtotal_usd || 0) + Number(form.elements.freight_usd.value || 0)).toFixed(2));
  document.querySelector('#generatePi').addEventListener('click', generatePiNumber);
  document.querySelector('#saveOrder').addEventListener('click', () => saveOrder(true));
  document.querySelector('#printInvoice').addEventListener('click', createProformaInvoice);
  document.querySelector('#confirmPayment').addEventListener('click', () => setOrderStatus('paid'));
  document.querySelector('#printCi').addEventListener('click', printCommercialInvoice);
  document.querySelector('#markShipped').addEventListener('click', () => setOrderStatus('shipped', true));
  document.querySelector('#confirmDelivery')?.addEventListener('click', confirmDelivery);
  document.querySelectorAll('[data-invoice-path]').forEach(button => button.addEventListener('click', () => openStoredInvoice(button.dataset.invoicePath)));
  document.querySelector('#trackShipment')?.addEventListener('click', trackShipment);
}

async function setOrderStatus(nextStatus, requireTracking = false) {
  const form = document.querySelector('#orderForm');
  const status = document.querySelector('#saveStatus');
  if (nextStatus === 'processing' && !['paid', 'processing'].includes(activeOrder.status)) {
    status.textContent = 'Confirm payment before moving the order to awaiting shipment.';
    return;
  }
  if (requireTracking && !form.elements.tracking_no.value.trim()) {
    status.textContent = 'Enter the tracking number before marking this order as shipped.';
    form.elements.tracking_no.focus();
    return;
  }
  form.elements.status.value = nextStatus;
  const saved = await saveOrder();
  if (!saved) return;
  const eventType = { paid: 'payment_confirmed', processing: 'processing', shipped: 'shipped' }[nextStatus];
  if (eventType) await sendOrderEmail(eventType);
}

async function sendOrderEmail(eventType) {
  const status = document.querySelector('#saveStatus');
  status.textContent = 'Sending customer email...';
  const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: eventType });
  status.textContent = error ? `Status saved, but email was not sent: ${await functionErrorMessage(error)}` : 'Status saved and customer email sent.';
  return !error;
}

async function invokeAdminFunction(body) {
  let { data: { session } } = await client.auth.getSession();
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now() + 60000)) {
    const refreshed = await client.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (!session?.access_token) return { data: null, error: new Error('Administrator session expired. Please sign in again.') };
  return client.functions.invoke('smooth-processor', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}

async function functionErrorMessage(error) {
  try {
    if (error?.context?.clone) {
      const payload = await error.context.clone().json();
      return payload.error || payload.message || error.message;
    }
  } catch (_ignored) {
    try {
      const text = await error.context?.clone().text();
      if (text) return text;
    } catch (_alsoIgnored) {}
  }
  return error?.message || String(error);
}

async function confirmDelivery() {
  const status = document.querySelector('#saveStatus');
  if (activeOrder.status !== 'shipped') {
    status.textContent = 'Mark the order as shipped before confirming delivery.';
    return;
  }
  status.textContent = 'Sending delivery confirmation email...';
  const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: 'delivered' });
  status.textContent = error ? `Delivery email was not sent: ${await functionErrorMessage(error)}` : 'Delivery confirmation email sent to the customer.';
  if (!error) await refreshActiveOrder();
}

async function refreshActiveOrder() {
  const { data, error } = await client.from('orders').select('*').eq('id', activeOrder.id).single();
  if (error) return;
  activeOrder = data;
  orders = orders.map(order => order.id === data.id ? data : order);
  renderOrders();
  renderSummary();
  renderOrderDetail();
}

async function openStoredInvoice(path) {
  const { data, error } = await client.storage.from('invoices').createSignedUrl(path, 300);
  const status = document.querySelector('#saveStatus');
  if (error) { status.textContent = error.message; return; }
  window.open(data.signedUrl, '_blank', 'noopener');
}

function trackShipment() {
  const number = document.querySelector('#orderForm').elements.tracking_no.value.trim();
  if (number) window.open(`https://www.17track.net/en/track#nums=${encodeURIComponent(number)}`, '_blank', 'noopener');
}

function generatePiNumber() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const sequence = String(orders.filter(order => (order.invoice_no || '').includes(ymd)).length + 1).padStart(3, '0');
  document.querySelector('#orderForm').elements.invoice_no.value = `LZN-${ymd}-${sequence}`;
}

async function saveOrder(notifyStatusChange = false) {
  const form = document.querySelector('#orderForm');
  const status = document.querySelector('#saveStatus');
  const previousStatus = activeOrder.status;
  const values = Object.fromEntries(new FormData(form));
  if (values.status === 'shipped' && !values.tracking_no.trim()) {
    status.textContent = 'A tracking number is required before saving the Shipped status.';
    form.elements.tracking_no.focus();
    return false;
  }
  const changes = {
    invoice_no: values.invoice_no.trim() || null,
    status: values.status,
    freight_usd: Number(values.freight_usd || 0),
    total_usd: Number(values.total_usd || 0),
    tracking_no: values.tracking_no.trim() || null,
    admin_note: `${storeName(activeOrder) === 'Frames' ? '[FRAMES STORE] ' : storeName(activeOrder) === 'Lens' ? '[LENS STORE] ' : ''}${values.admin_note.trim()}`.trim() || null,
    updated_at: new Date().toISOString()
  };
  if (values.status === 'paid' && !activeOrder.paid_at) changes.paid_at = new Date().toISOString();
  status.textContent = 'Saving...';
  const { data, error } = await client.from('orders').update(changes).eq('id', activeOrder.id).select('*').single();
  if (error) {
    status.textContent = error.message;
    return false;
  }
  activeOrder = data;
  orders = orders.map(order => order.id === data.id ? data : order);
  status.textContent = 'Saved.';
  renderSummary();
  renderOrders();
  if (notifyStatusChange && previousStatus !== data.status) {
    const eventType = { paid: 'payment_confirmed', processing: 'processing', shipped: 'shipped' }[data.status];
    if (eventType) await sendOrderEmail(eventType);
  }
  return true;
}

async function printInvoice(documentTitle = 'PROFORMA INVOICE') {
  if (typeof documentTitle !== 'string') documentTitle = 'PROFORMA INVOICE';
  const form = document.querySelector('#orderForm');
  if (!form.elements.invoice_no.value.trim()) generatePiNumber();
  const saved = await saveOrder();
  if (!saved) return;
  const order = activeOrder;
  const popup = window.open('', '_blank', 'width=980,height=800');
  if (!popup) {
    document.querySelector('#saveStatus').textContent = 'Please allow pop-ups to print the invoice.';
    return;
  }
  popup.document.write(`<!doctype html><html><head><title>${e(order.invoice_no || 'Proforma Invoice')}</title><style>body{font:13px Arial;color:#111;margin:42px}header{display:flex;justify-content:space-between;border-bottom:3px solid #075f7c;padding-bottom:18px}.logo{font-size:26px;font-weight:800;color:#075f7c}h1{font-size:24px;text-align:right;margin:0}.meta{text-align:right;line-height:1.7}.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 0}.box{border:1px solid #bbb;padding:15px;line-height:1.65}h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#666;margin:0 0 8px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ccc;padding:10px 7px;text-align:left}th{background:#f2f2f2}.right{text-align:right}.totals{width:330px;margin:20px 0 25px auto}.totals div{display:flex;justify-content:space-between;padding:6px}.totals .grand{font-size:16px;font-weight:bold;border-top:2px solid #111}.terms{margin-top:25px;font-size:12px}footer{border-top:1px solid #bbb;margin-top:35px;padding-top:12px;color:#555}@media print{body{margin:15mm}button{display:none}}</style></head><body><header><div><div class="logo">LZN MEDICAL</div><strong>LZN MEDICAL CO., LTD.</strong></div><div><h1>PROFORMA INVOICE</h1><div class="meta">PI No: <strong>${e(order.invoice_no || '-')}</strong><br>Date: ${e(new Date().toLocaleDateString('en-CA'))}<br>Currency: USD</div></div></header><section class="two"><div class="box"><h3>Seller</h3><strong>LZN MEDICAL CO., LTD.</strong><br>Shanghai, China<br>Email: sales@lznmed.com</div><div class="box"><h3>Bill to / Ship to</h3><strong>${e(order.contact_name || '')}</strong><br>${e(order.contact_email || '')}<br>${e(order.contact_phone || '')}<br>${e(order.shipping_address || '')}<br>${e(order.postal_code || '')}</div></section><table><thead><tr><th>Model</th><th>Description</th><th class="right">Qty</th><th class="right">Unit price</th><th class="right">Amount</th></tr></thead><tbody>${activeItems.map(item => `<tr><td>${e(item.model)}</td><td>${e(item.product_name)}</td><td class="right">${e(item.quantity)}</td><td class="right">${money(item.unit_price_usd)}</td><td class="right">${money(item.line_total_usd)}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${money(order.subtotal_usd)}</strong></div><div><span>Freight</span><strong>${money(order.freight_usd)}</strong></div><div class="grand"><span>Total</span><strong>${money(order.total_usd)}</strong></div></div><section class="two"><div class="box"><h3>Payment terms</h3>Bank transfer<br>Bank charges: OUR<br>Goods will be prepared after payment confirmation.</div><div class="box"><h3>Bank account</h3><strong>Woori Bank (China) Limited</strong><br>Shanghai JinXiuJiangNan Sub-Branch<br>USD Account: 100103205899<br>SWIFT: HVBKCNBJ<br>Beneficiary: LZN MEDICAL CO., LTD.</div></section><div class="terms"><strong>Trade term:</strong> FOB China. Freight, destination duties and local taxes are not included unless separately stated.<br><strong>Freight instruction:</strong> ${e(order.courier || '-')} ${order.courier_account_no ? ` / Account: ${e(order.courier_account_no)}` : ''}</div><footer>Bank address: No.101-1, 101-2b, 102 MT BLDG, 3999 Hongxin Road, Minhang District, Shanghai, China</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
  popup.document.title = `${order.invoice_no || ''} ${documentTitle}`.trim();
  const invoiceHeading = popup.document.querySelector('h1');
  if (invoiceHeading) invoiceHeading.textContent = documentTitle;
  const sellerBox = popup.document.querySelector('.two .box');
  if (sellerBox) sellerBox.innerHTML = `<h3>Seller</h3><strong>LZN MEDICAL CO., LTD.</strong><br>Room 895, Building 1, Hongjing Road<br>Minhang District, Shanghai 21103, China<br>Tel: +86 130 6261 9570<br>Email: sales@lznmed.com`;
  const buyerBox = popup.document.querySelectorAll('.two .box')[1];
  if (buyerBox) {
    const recipient = (order.buyer_type || 'company') === 'company' && order.company_name
      ? `<strong>${e(order.company_name)}</strong><br>Attn: ${e(order.contact_name || '')}`
      : `<strong>${e(order.contact_name || '')}</strong><br>Individual`;
    buyerBox.innerHTML = `<h3>Bill to / Ship to</h3>${recipient}<br>${e(order.contact_email || '')}<br>${e(order.contact_phone || '')}<br>${e(order.shipping_address || '')}<br>${e(order.postal_code || '')}`;
  }
  const paymentSection = popup.document.querySelectorAll('.two')[1];
  if (paymentSection) paymentSection.innerHTML = paymentBoxesHtml(order);
  if (paymentCode(order.payment_method) !== 'company_bank_transfer') {
    const footer = popup.document.querySelector('footer');
    if (footer) footer.textContent = 'The secure Payoneer payment request is issued after freight and the final invoice are confirmed.';
  }
  popup.document.close();
}

function buildInvoicePdf(documentTitle) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) throw new Error('PDF generator is unavailable. Please refresh the page and try again.');
  const order = activeOrder;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const total = Number(order.total_usd ?? Number(order.subtotal_usd || 0) + Number(order.freight_usd || 0));
  const recipient = (order.buyer_type || 'company') === 'company' && order.company_name
    ? `${order.company_name}\nAttn: ${order.contact_name || ''}`
    : `${order.contact_name || ''}\nIndividual`;

  doc.setTextColor(7, 95, 124);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LZN MEDICAL', 14, 18);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(17);
  doc.text(documentTitle, 196, 18, { align: 'right' });
  doc.setDrawColor(7, 95, 124);
  doc.setLineWidth(0.8);
  doc.line(14, 23, 196, 23);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${order.invoice_no || '-'}`, 196, 29, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-CA')}    Currency: USD`, 196, 34, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('SELLER', 14, 43);
  doc.text('BILL TO / SHIP TO', 108, 43);
  doc.setFont('helvetica', 'normal');
  doc.text('LZN MEDICAL CO., LTD.\nRoom 895, Building 1, Hongjing Road\nMinhang District, Shanghai 21103, China\nTel: +86 130 6261 9570\nEmail: sales@lznmed.com', 14, 49, { lineHeightFactor: 1.45 });
  doc.text(`${recipient}\n${order.contact_email || ''}\n${order.contact_phone || ''}\n${order.shipping_address || ''}\n${order.postal_code || ''}`, 108, 49, { maxWidth: 86, lineHeightFactor: 1.45 });
  doc.autoTable({
    startY: 79,
    head: [['Model', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: activeItems.map(item => [item.model || '', item.product_name || '', String(item.quantity || 0), money(item.unit_price_usd), money(item.line_total_usd)]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [7, 95, 124] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  });
  let y = doc.lastAutoTable.finalY + 8;
  if (y > 235) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.text(`Subtotal: ${money(order.subtotal_usd)}`, 196, y, { align: 'right' });
  doc.text(`Freight: ${money(order.freight_usd)}`, 196, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL: ${money(total)}`, 196, y + 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.autoTable({
    startY: y + 20,
    body: invoiceTermsRows(order, documentTitle),
    theme: 'grid',
    margin: { left: 14, right: 14, bottom: 18 },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.4, lineColor: [205, 211, 213], lineWidth: 0.2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [239, 244, 245], textColor: [35, 57, 63] },
      1: { cellWidth: 144, textColor: [30, 30, 30] },
    },
  });
  doc.setDrawColor(180);
  doc.line(14, 283, 196, 283);
  doc.setFontSize(7.5);
  doc.text('LZN MEDICAL CO., LTD. | sales@lznmed.com | Shanghai, China', 14, 288);
  return doc;
}

async function printCommercialInvoice() {
  let status = document.querySelector('#saveStatus');
  if (!['paid', 'processing', 'shipped'].includes(activeOrder.status)) {
    status.textContent = 'Confirm payment before creating the Commercial Invoice.';
    return;
  }
  const saved = await saveOrder();
  if (!saved) return;
  status = document.querySelector('#saveStatus');
  try {
    status.textContent = 'Creating and emailing Commercial Invoice PDF...';
    const pdf = buildInvoicePdf('COMMERCIAL INVOICE');
    const filename = `CI-${activeOrder.invoice_no || activeOrder.id.slice(0, 8)}.pdf`;
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: 'commercial_invoice', pdf_base64: pdfBase64, pdf_filename: filename });
    status.textContent = error ? `Commercial Invoice was not stored or emailed: ${await functionErrorMessage(error)}` : 'Commercial Invoice PDF stored with the order and emailed to the customer.';
    if (!error) await refreshActiveOrder();
  } catch (error) {
    status.textContent = error.message || String(error);
  }
}

async function createProformaInvoice() {
  const form = document.querySelector('#orderForm');
  let status = document.querySelector('#saveStatus');
  if (!form.elements.invoice_no.value.trim()) generatePiNumber();
  if (['quote_requested', 'quoted'].includes(form.elements.status.value)) form.elements.status.value = 'payment_pending';
  const saved = await saveOrder();
  if (!saved) return;
  status = document.querySelector('#saveStatus');
  try {
    status.textContent = 'Creating and emailing Proforma Invoice PDF...';
    const pdf = buildInvoicePdf('PROFORMA INVOICE');
    const filename = `PI-${activeOrder.invoice_no || activeOrder.id.slice(0, 8)}.pdf`;
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: 'pi_ready', pdf_base64: pdfBase64, pdf_filename: filename });
    status.textContent = error ? `Proforma Invoice was not stored or emailed: ${await functionErrorMessage(error)}` : 'Proforma Invoice PDF stored with the order and emailed with payment instructions.';
    if (!error) {
      const { error: statusError } = await client.from('orders').update({ status: 'payment_pending', updated_at: new Date().toISOString() }).eq('id', activeOrder.id).in('status', ['quote_requested', 'quoted', 'payment_pending']);
      if (statusError) { status.textContent = `Invoice emailed, but status was not updated: ${statusError.message}`; return; }
      await refreshActiveOrder();
    }
  } catch (error) {
    status.textContent = error.message || String(error);
  }
}

async function emailInvoice() {
  const form = document.querySelector('#orderForm');
  if (!form.elements.invoice_no.value.trim()) generatePiNumber();
  if (['quote_requested', 'quoted'].includes(form.elements.status.value)) form.elements.status.value = 'payment_pending';
  const saved = await saveOrder();
  if (saved) await sendOrderEmail('pi_ready');
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

drawer.querySelectorAll('[data-close-drawer]').forEach(button => button.addEventListener('click', closeDrawer));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });

boot();

