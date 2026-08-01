const config = window.LZN_SUPABASE || {};
const client = window.supabase?.createClient(config.url, config.publishableKey);
const authView = document.querySelector('#authView');
const accessView = document.querySelector('#accessView');
const dashboard = document.querySelector('#dashboard');
const signOutButton = document.querySelector('#signOut');
const drawer = document.querySelector('#orderDrawer');
const detail = document.querySelector('#orderDetail');
const sfFreight = window.LZN_SF_FREIGHT;
const purchaseSourceData = window.LZN_ADMIN_PURCHASE_SOURCES || {};
const catalogProducts = (window.CATALOG_DATA || []).flatMap(category => category.items || []);
const money = value => `USD ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cny = value => `CNY ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const itemPriceOnRequest = item => /price on request/i.test(String(item?.product_name || '')) && Number(item?.unit_price_usd || 0) <= 0;
const itemMoney = (item, field) => itemPriceOnRequest(item) ? 'Price required' : money(item?.[field]);
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

function publicRootModel(model) {
  return String(model || '').match(/^(LZN-(?:TL|FR)-\d{4})(?:-[A-Z0-9]+)?$/i)?.[1]?.toUpperCase() || null;
}

function legacyTaobaoProductId(model) {
  return String(model || '').match(/^LZN-(\d{9,})(?:-[A-Z0-9]+)?$/i)?.[1] || null;
}

function purchaseSourceEntryForModel(model) {
  const publicModel = publicRootModel(model);
  if (publicModel && purchaseSourceData[publicModel]) {
    return { publicModel, source: purchaseSourceData[publicModel] };
  }
  const productId = legacyTaobaoProductId(model);
  if (!productId) return null;
  const match = Object.entries(purchaseSourceData)
    .find(([, source]) => String(source.sourceProductId) === productId);
  return match ? { publicModel: match[0], source: match[1] } : null;
}

function catalogProductForModel(model) {
  return catalogProducts.find(product => product.model === model || (product.options || []).some(option => option.model === model)) || null;
}

function purchaseInfoForModel(model) {
  const entry = purchaseSourceEntryForModel(model);
  if (!entry) return null;
  const { publicModel, source } = entry;
  const product = catalogProductForModel(model) || catalogProductForModel(publicModel);
  let optionIndex = (source.publicOptionModels || []).indexOf(model);
  if (optionIndex < 0) optionIndex = (source.legacyOptionModels || []).indexOf(model);
  const capturedPrice = optionIndex >= 0 ? source.optionPricesCny?.[optionIndex] : null;
  const originalPriceCny = Number(capturedPrice) > 0 ? Number(capturedPrice) : null;
  return {
    publicModel,
    productId: source.sourceProductId,
    source,
    product,
    optionIndex,
    originalPriceCny
  };
}

function purchasePriceRange(product, source) {
  const captured = (source.optionPricesCny || []).map(Number).filter(value => value > 0);
  if (!captured.length) return 'Not captured';
  const low = Math.min(...captured);
  const high = Math.max(...captured);
  return low === high ? cny(low) : `${cny(low)} – ${cny(high)}`;
}

function purchaseSourceHtml(model) {
  const info = purchaseInfoForModel(model);
  if (!info) return '';
  return `<div class="purchase-source-inline">
    <span>Taobao source</span>
    <strong>${info.originalPriceCny ? e(cny(info.originalPriceCny)) : 'Original price not captured'}</strong>
    <small>${e(info.source.store || 'Taobao supplier')} · Supplier item ${e(info.source.sourceProductId || '-')}</small>
    <a href="${e(info.source.url)}" target="_blank" rel="noopener noreferrer">Open purchase page ↗</a>
    <small>${e(info.source.verification || '')}</small>
  </div>`;
}

function logisticsTableUnavailable(error) {
  const message = String(error?.message || '');
  return error?.code === 'PGRST205' ||
    /could not find the table ['"]?public\.product_logistics/i.test(message) ||
    /relation .*(?:public\.)?product_logistics.* does not exist/i.test(message);
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function dimensionText(record, prefix) {
  const dimensions = ['length', 'width', 'height'].map(axis => positiveNumber(record?.[`${prefix}_${axis}_cm`]));
  return dimensions.every(Boolean) ? `${dimensions.map(value => Number(value.toFixed(2))).join(' × ')} cm` : '';
}

function volumeCbm(record, prefix) {
  const dimensions = ['length', 'width', 'height'].map(axis => positiveNumber(record?.[`${prefix}_${axis}_cm`]));
  return dimensions.every(Boolean) ? dimensions.reduce((total, value) => total * value, 1) / 1000000 : 0;
}

function logisticsForModel(model) {
  const key = String(model || '').trim().toUpperCase();
  if (!key) return null;
  const catalogModel = catalogProductForModel(model)?.model;
  const candidates = [key, String(catalogModel || '').toUpperCase(), publicRootModel(model)].filter(Boolean);
  for (const candidate of candidates) {
    const exact = productLogistics.find(item => String(item.model).toUpperCase() === candidate);
    if (exact) return exact;
  }
  return productLogistics
    .filter(item => {
      const logisticsModel = String(item.model).toUpperCase();
      if (key.startsWith(`${logisticsModel}-`)) return true;
      return logisticsModel.endsWith(' SERIES') && key.startsWith(logisticsModel.slice(0, -7).trim());
    })
    .sort((first, second) => String(second.model).length - String(first.model).length)[0] || null;
}

function unitChargeableWeight(record) {
  if (!record) return null;
  const actual = positiveNumber(record.package_weight_kg) || positiveNumber(record.unit_weight_kg) || 0;
  const volume = volumeCbm(record, 'package') * 200;
  if (!actual && !volume) return null;
  return { actual, volume, chargeable: Math.max(actual, volume) };
}

function normalizedShipmentPackages(value = activeOrder?.shipment_packages) {
  const packages = Array.isArray(value) ? value : [];
  return packages.map((shipmentPackage, index) => ({
    id: String(shipmentPackage?.id || `carton-${index + 1}`),
    name: String(shipmentPackage?.name || `Carton ${index + 1}`),
    gross_weight_kg: positiveNumber(shipmentPackage?.gross_weight_kg),
    cbm: positiveNumber(shipmentPackage?.cbm),
    items: (Array.isArray(shipmentPackage?.items) ? shipmentPackage.items : [])
      .map(item => ({
        order_item_id: String(item?.order_item_id || ''),
        quantity: Math.max(0, Math.floor(Number(item?.quantity) || 0))
      }))
      .filter(item => item.order_item_id && item.quantity)
  }));
}

function assignedShipmentQuantities(packages = activeShipmentPackages) {
  const assigned = new Map();
  packages.forEach(shipmentPackage => shipmentPackage.items.forEach(item => {
    assigned.set(item.order_item_id, (assigned.get(item.order_item_id) || 0) + item.quantity);
  }));
  return assigned;
}

function shipmentEstimate(items = activeItems, packages = activeShipmentPackages) {
  let actualKg = 0;
  let cbm = 0;
  const lines = [];
  const missing = [];
  const assigned = assignedShipmentQuantities(packages);
  packages.forEach((shipmentPackage, index) => {
    if (!shipmentPackage.items.length) return;
    const packageWeight = positiveNumber(shipmentPackage.gross_weight_kg);
    const packageCbm = positiveNumber(shipmentPackage.cbm);
    if (packageWeight) actualKg += packageWeight;
    if (packageCbm) cbm += packageCbm;
    if (!packageWeight || !packageCbm) missing.push(shipmentPackage.name || `Carton ${index + 1}`);
    lines.push({
      type: 'manual',
      model: shipmentPackage.name || `Carton ${index + 1}`,
      quantity: shipmentPackage.items.reduce((sum, item) => sum + item.quantity, 0),
      actualKg: packageWeight || 0,
      cbm: packageCbm || 0
    });
  });
  (items || []).forEach(item => {
    const orderedQuantity = Math.max(0, Number(item.quantity) || 0);
    const quantity = Math.max(0, orderedQuantity - (assigned.get(String(item.id)) || 0));
    if (!quantity) return;
    const logistics = logisticsForModel(item.model);
    if (!logistics) {
      missing.push(item.model);
      return;
    }
    const unitsPerCarton = Math.max(0, Math.floor(Number(logistics.units_per_carton) || 0));
    const cartonWeight = positiveNumber(logistics.carton_weight_kg);
    const cartonCbm = volumeCbm(logistics, 'carton');
    const packageWeight = positiveNumber(logistics.package_weight_kg) || positiveNumber(logistics.unit_weight_kg);
    const packageCbm = volumeCbm(logistics, 'package');
    const canUseCarton = unitsPerCarton > 0 && cartonWeight && cartonCbm;
    const cartonCount = canUseCarton ? Math.floor(quantity / unitsPerCarton) : 0;
    const remainder = canUseCarton ? quantity % unitsPerCarton : quantity;
    const lineActual = cartonCount * cartonWeight + remainder * (packageWeight || 0);
    const lineCbm = cartonCount * cartonCbm + remainder * packageCbm;
    actualKg += lineActual;
    cbm += lineCbm;
    if (remainder > 0 && (!packageWeight || !packageCbm)) missing.push(item.model);
    lines.push({
      model: item.model,
      quantity,
      cartonCount,
      remainder,
      actualKg: lineActual,
      cbm: lineCbm
    });
  });
  const volumeKg = cbm * 200;
  return {
    actualKg,
    cbm,
    volumeKg,
    chargeableKg: Math.max(actualKg, volumeKg),
    lines,
    missing: [...new Set(missing)]
  };
}

function logisticsInlineHtml(item) {
  const logistics = logisticsForModel(item.model);
  if (!logistics) return '<div class="logistics-inline"><strong>Logistics data missing</strong><span>Add this model in Product logistics.</span></div>';
  const weight = positiveNumber(logistics.package_weight_kg) || positiveNumber(logistics.unit_weight_kg);
  const size = dimensionText(logistics, 'package');
  return `<div class="logistics-inline"><strong>${e(weight ? `${weight} kg packed` : 'Packed weight missing')}</strong><span>${e(size || 'Package size missing')}${logistics.units_per_carton ? ` · ${e(logistics.units_per_carton)} pcs/carton` : ''}</span></div>`;
}

function legacyShipmentEstimateHtml(estimate) {
  if (!logisticsTableReady) return '<div class="shipment-estimate"><strong>Product logistics setup required.</strong><p>Run <code>supabase-product-logistics-setup.sql</code> before using automatic shipment estimates.</p></div>';
  if (!estimate.lines.length) return '<div class="shipment-estimate"><strong>No saved logistics data matches this order.</strong><p>Add the order models in Product logistics before calculating freight.</p></div>';
  const lineNotes = estimate.lines.map(line => `<li>${e(line.model)} × ${e(line.quantity)}${line.cartonCount ? ` · ${e(line.cartonCount)} full carton${line.cartonCount === 1 ? '' : 's'} + ${e(line.remainder)} unit${line.remainder === 1 ? '' : 's'}` : ''}</li>`).join('');
  return `<div class="shipment-estimate">
    <div class="shipment-estimate-grid">
      <div><span>Estimated actual</span><strong>${e(estimate.actualKg.toFixed(2))} kg</strong></div>
      <div><span>Total volume</span><strong>${e(estimate.cbm.toFixed(4))} CBM</strong></div>
      <div><span>Chargeable estimate</span><strong>${e(estimate.chargeableKg.toFixed(2))} kg</strong></div>
    </div>
    <ul>${lineNotes}${estimate.missing.length ? `<li class="logistics-missing">Incomplete or missing package data: ${e(estimate.missing.join(', '))}</li>` : ''}</ul>
  </div>`;
}

function shipmentEstimateHtml(estimate) {
  if (!logisticsTableReady && !estimate.lines.some(line => line.type === 'manual')) return '<div class="shipment-estimate"><strong>Product logistics setup required.</strong><p>Create a manual carton or run <code>supabase-product-logistics-setup.sql</code> before calculating freight.</p></div>';
  if (!estimate.lines.length) return '<div class="shipment-estimate"><strong>No shipment data is available yet.</strong><p>Create a manual carton or add the models in Product logistics.</p></div>';
  const lineNotes = estimate.lines.map(line => line.type === 'manual'
    ? `<li><strong>${e(line.model)}</strong> (manual carton) · ${e(line.quantity)} pcs · ${e(line.actualKg.toFixed(2))} kg · ${e(line.cbm.toFixed(4))} CBM</li>`
    : `<li>${e(line.model)} × ${e(line.quantity)}${line.cartonCount ? ` · ${e(line.cartonCount)} full carton${line.cartonCount === 1 ? '' : 's'} + ${e(line.remainder)} unit${line.remainder === 1 ? '' : 's'}` : ''}</li>`).join('');
  return `<div class="shipment-estimate">
    <div class="shipment-estimate-grid">
      <div><span>Estimated actual</span><strong>${e(estimate.actualKg.toFixed(2))} kg</strong></div>
      <div><span>Total volume</span><strong>${e(estimate.cbm.toFixed(4))} CBM</strong></div>
      <div><span>Chargeable estimate</span><strong>${e(estimate.chargeableKg.toFixed(2))} kg</strong></div>
    </div>
    <ul>${lineNotes}${estimate.missing.length ? `<li class="logistics-missing">Enter manual GW and CBM or complete logistics data: ${e(estimate.missing.join(', '))}</li>` : ''}</ul>
  </div>`;
}

function couponTableUnavailable(error) {
  const message = String(error?.message || '');
  return error?.code === 'PGRST205' ||
    /could not find the table ['"]?public\.coupons/i.test(message) ||
    /relation .*(?:public\.)?coupons.* does not exist/i.test(message);
}

async function loadIssuedCoupons(orderId) {
  const result = await client.from('coupons')
    .select('code,amount_usd,status,issued_at,expires_at,redeemed_at')
    .eq('issued_for_order_id', orderId)
    .order('issued_at');
  return result.error && couponTableUnavailable(result.error) ? { data: [], error: null } : result;
}

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

function orderCouponCodes(order) {
  if (Array.isArray(order?.coupon_codes) && order.coupon_codes.length) return order.coupon_codes.filter(Boolean);
  return order?.coupon_code ? [order.coupon_code] : [];
}

function orderCouponLabel(order) {
  const codes = orderCouponCodes(order);
  if (!codes.length) return 'No coupon';
  return codes.length === 1 ? `Coupon ${codes[0]}` : `${codes.length} coupons: ${codes.join(', ')}`;
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
let activeShip…15515 tokens truncated…extContent = 'Sending delivery confirmation email...';
  const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: 'delivered' });
  status.textContent = error ? `Delivery email was not sent: ${await functionErrorMessage(error)}` : 'Delivery confirmation email sent to the customer.';
  if (!error) await refreshActiveOrder();
}

async function refreshActiveOrder() {
  const [orderResult, couponResult] = await Promise.all([
    client.from('orders').select('*').eq('id', activeOrder.id).single(),
    loadIssuedCoupons(activeOrder.id)
  ]);
  if (orderResult.error || couponResult.error) return;
  activeOrder = orderResult.data;
  activeShipmentPackages = normalizedShipmentPackages(activeOrder.shipment_packages);
  activeIssuedCoupons = couponResult.data || [];
  orders = orders.map(order => order.id === activeOrder.id ? activeOrder : order);
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
  const itemsSaved = await saveOrderItems(false);
  if (!itemsSaved) return false;
  const values = Object.fromEntries(new FormData(form));
  if (!['quote_requested', 'quoted', 'cancelled'].includes(values.status) && activeItems.some(item => Number(item.unit_price_usd || 0) <= 0)) {
    status.textContent = 'Enter a selling price above USD 0 for every item before issuing the final PI or confirming payment.';
    return false;
  }
  if (!['quote_requested', 'quoted', 'cancelled'].includes(values.status) && Number(activeOrder.subtotal_usd || 0) < 100) {
    status.textContent = 'The product subtotal before coupon must be at least USD 100 before issuing the final PI or confirming payment.';
    return false;
  }
  if (values.status === 'shipped' && !values.tracking_no.trim()) {
    status.textContent = 'A tracking number is required before saving the Shipped status.';
    form.elements.tracking_no.focus();
    return false;
  }
  const changes = {
    buyer_type: 'company',
    company_name: values.company_name.trim() || null,
    contact_name: values.contact_name.trim() || null,
    contact_email: values.contact_email.trim().toLowerCase() || null,
    contact_phone: values.contact_phone.trim() || null,
    destination_country: values.destination_country.trim() || null,
    postal_code: values.postal_code.trim() || null,
    shipping_address: values.shipping_address.trim() || null,
    payment_method: paymentCode(values.payment_method),
    courier: values.courier.trim() || null,
    courier_account_no: values.courier_account_no.trim() || null,
    invoice_no: values.invoice_no.trim() || null,
    status: values.status,
    freight_usd: Number(values.freight_usd || 0),
    total_usd: Number(activeOrder.subtotal_usd || 0) - Number(activeOrder.discount_usd || 0) + Number(values.freight_usd || 0),
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

async function saveOrderItems(refreshDetail = false) {
  const form = document.querySelector('#orderItemsForm');
  if (!form) return true;
  const rows = [...form.querySelectorAll('[data-order-item-row]')];
  const items = rows.map(row => ({
    id: row.dataset.itemId,
    quantity: Number(row.querySelector('[data-item-quantity]').value),
    unit_price_usd: Number(row.querySelector('[data-item-price]').value)
  }));
  const status = document.querySelector('#itemSaveStatus') || document.querySelector('#saveStatus');
  if (items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.unit_price_usd) || item.unit_price_usd < 0)) {
    status.textContent = 'Each item needs a quantity of at least 1 and a valid non-negative selling price.';
    return false;
  }
  status.textContent = 'Saving item quantities and prices...';
  const { data, error } = await client.rpc('admin_update_order_items', {
    p_order_id: activeOrder.id,
    p_items: items
  });
  if (error) {
    status.textContent = error.message;
    return false;
  }
  const { data: savedItems, error: itemError } = await client.from('order_items').select('*').eq('order_id', activeOrder.id).order('id');
  if (itemError) {
    status.textContent = itemError.message;
    return false;
  }
  activeItems = savedItems || [];
  activeOrder = data;
  orders = orders.map(order => order.id === activeOrder.id ? activeOrder : order);
  const orderForm = document.querySelector('#orderForm');
  if (orderForm) {
    orderForm.elements.subtotal_usd.value = Number(activeOrder.subtotal_usd || 0).toFixed(2);
    orderForm.elements.total_usd.value = (
      Number(activeOrder.subtotal_usd || 0) -
      Number(activeOrder.discount_usd || 0) +
      Number(orderForm.elements.freight_usd.value || 0)
    ).toFixed(2);
  }
  renderSummary();
  renderOrders();
  if (refreshDetail) {
    renderOrderDetail();
    document.querySelector('#itemSaveStatus').textContent = 'Item quantities, prices and order totals saved.';
  } else {
    status.textContent = 'Item quantities and prices saved.';
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
  popup.document.write(`<!doctype html><html><head><title>${e(order.invoice_no || 'Proforma Invoice')}</title><style>body{font:13px Arial;color:#111;margin:42px}header{display:flex;justify-content:space-between;border-bottom:3px solid #075f7c;padding-bottom:18px}.logo{font-size:26px;font-weight:800;color:#075f7c}h1{font-size:24px;text-align:right;margin:0}.meta{text-align:right;line-height:1.7}.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 0}.box{border:1px solid #bbb;padding:15px;line-height:1.65}h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#666;margin:0 0 8px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ccc;padding:10px 7px;text-align:left}th{background:#f2f2f2}.right{text-align:right}.totals{width:330px;margin:20px 0 25px auto}.totals div{display:flex;justify-content:space-between;padding:6px}.totals .discount{color:#b42318}.totals .grand{font-size:16px;font-weight:bold;border-top:2px solid #111}.terms{margin-top:25px;font-size:12px}footer{border-top:1px solid #bbb;margin-top:35px;padding-top:12px;color:#555}@media print{body{margin:15mm}button{display:none}}</style></head><body><header><div><div class="logo">LZN MEDICAL</div><strong>LZN MEDICAL CO., LTD.</strong></div><div><h1>PROFORMA INVOICE</h1><div class="meta">PI No: <strong>${e(order.invoice_no || '-')}</strong><br>Date: ${e(new Date().toLocaleDateString('en-CA'))}<br>Currency: USD</div></div></header><section class="two"><div class="box"><h3>Seller</h3><strong>LZN MEDICAL CO., LTD.</strong><br>Shanghai, China<br>Email: sales@lznmed.com</div><div class="box"><h3>Bill to / Ship to</h3><strong>${e(order.contact_name || '')}</strong><br>${e(order.contact_email || '')}<br>${e(order.contact_phone || '')}<br>${e(order.shipping_address || '')}<br>${e(order.postal_code || '')}</div></section><table><thead><tr><th>Model</th><th>Description</th><th class="right">Qty</th><th class="right">Unit price</th><th class="right">Amount</th></tr></thead><tbody>${activeItems.map(item => `<tr><td>${e(item.model)}</td><td>${e(item.product_name)}</td><td class="right">${e(item.quantity)}</td><td class="right">${money(item.unit_price_usd)}</td><td class="right">${money(item.line_total_usd)}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Product subtotal before coupon</span><strong>${money(order.subtotal_usd)}</strong></div>${Number(order.discount_usd || 0) > 0 ? `<div class="discount"><span>${e(orderCouponLabel(order))}</span><strong>-${money(order.discount_usd)}</strong></div>` : ''}<div><span>Freight</span><strong>${money(order.freight_usd)}</strong></div><div class="grand"><span>Total</span><strong>${money(order.total_usd)}</strong></div></div><section class="two"><div class="box"><h3>Payment terms</h3>Bank transfer<br>Bank charges: OUR<br>Goods will be prepared after payment confirmation.</div><div class="box"><h3>Bank account</h3><strong>Woori Bank (China) Limited</strong><br>Shanghai JinXiuJiangNan Sub-Branch<br>USD Account: 100103205899<br>SWIFT: HVBKCNBJ<br>Beneficiary: LZN MEDICAL CO., LTD.</div></section><div class="terms"><strong>Trade term:</strong> FOB China. Freight, destination duties and local taxes are not included unless separately stated.<br><strong>Freight instruction:</strong> ${e(order.courier || '-')} ${order.courier_account_no ? ` / Account: ${e(order.courier_account_no)}` : ''}</div><footer>Bank address: No.101-1, 101-2b, 102 MT BLDG, 3999 Hongxin Road, Minhang District, Shanghai, China</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
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
  const discount = Number(order.discount_usd || 0);
  const total = Number(order.total_usd ?? Number(order.subtotal_usd || 0) - discount + Number(order.freight_usd || 0));
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
    body: activeItems.map(item => [item.model || '', item.product_name || '', String(item.quantity || 0), itemMoney(item, 'unit_price_usd'), itemMoney(item, 'line_total_usd')]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [7, 95, 124] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  });
  let y = doc.lastAutoTable.finalY + 8;
  if (y > 235) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.text(`Product subtotal before coupon: ${money(order.subtotal_usd)}`, 196, y, { align: 'right' });
  const discountOffset = discount > 0 ? 6 : 0;
  if (discount > 0) doc.text(`${orderCouponLabel(order)}: -${money(discount)}`, 196, y + 6, { align: 'right' });
  doc.text(`Freight: ${money(order.freight_usd)}`, 196, y + 6 + discountOffset, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL: ${money(total)}`, 196, y + 13 + discountOffset, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.autoTable({
    startY: y + 20 + discountOffset,
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

