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
const logisticsCatalog = window.LZN_ADMIN_LOGISTICS_CATALOG || [];
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

const SMALL_ACCESSORY_PATTERN = /\b(?:nose pad|screw|chain|strap|retainer|cloth|cleaning cloth|suction remover|bottle|clip|temple tip|ear hook|repair kit|cord|holder|case|pouch)\b/i;

function suggestedLogistics(product) {
  if (!product) return null;
  const base = {
    model: product.model,
    product_name: product.product_name,
    store_section: product.store_section
  };
  const catalogDimensions = product.catalog_package_dimensions_cm || [];
  if (positiveNumber(product.catalog_package_weight_kg)) {
    return {
      ...base,
      package_weight_kg: product.catalog_package_weight_kg,
      package_length_cm: catalogDimensions[0] || null,
      package_width_cm: catalogDimensions[1] || null,
      package_height_cm: catalogDimensions[2] || null,
      units_per_carton: product.catalog_units_per_carton || null,
      carton_weight_kg: product.catalog_carton_weight_kg || null,
      carton_length_cm: product.catalog_carton_dimensions_cm?.[0] || null,
      carton_width_cm: product.catalog_carton_dimensions_cm?.[1] || null,
      carton_height_cm: product.catalog_carton_dimensions_cm?.[2] || null,
      notes: '[CATALOG VALUE] Imported from the product catalog. Confirm when supplier packing changes.',
      _suggestion: 'catalog'
    };
  }
  if (product.store_section === 'Frames') {
    return {
      ...base,
      unit_weight_kg: 0.035,
      package_weight_kg: 0.18,
      package_length_cm: 18,
      package_width_cm: 8,
      package_height_cm: 6,
      notes: '[ESTIMATED] Typical single frame with protective retail packaging. Replace with measured values when available.',
      _suggestion: 'estimated'
    };
  }
  const accessoryText = `${product.category || ''} ${product.product_name || ''}`;
  if (product.store_section === 'Tools' && SMALL_ACCESSORY_PATTERN.test(accessoryText)) {
    const isCase = /\b(?:case|pouch|holder)\b/i.test(accessoryText);
    return {
      ...base,
      unit_weight_kg: isCase ? 0.08 : 0.03,
      package_weight_kg: isCase ? 0.18 : 0.08,
      package_length_cm: isCase ? 18 : 15,
      package_width_cm: isCase ? 9 : 10,
      package_height_cm: isCase ? 7 : 3,
      notes: '[ESTIMATED] Typical small accessory packing. Replace with measured values when available.',
      _suggestion: 'estimated'
    };
  }
  return null;
}

function allLogisticsRows() {
  const savedByModel = new Map(productLogistics.map(item => [String(item.model).toUpperCase(), item]));
  const catalogRows = logisticsCatalog.map(product => {
    const saved = savedByModel.get(product.model);
    if (saved) {
      savedByModel.delete(product.model);
      return { ...saved, _catalog: product, _state: /\[ESTIMATED\]/i.test(saved.notes || '') ? 'estimated' : 'saved' };
    }
    const suggestion = suggestedLogistics(product);
    return { ...(suggestion || product), _catalog: product, _state: suggestion?._suggestion || 'manual' };
  });
  return [...catalogRows, ...[...savedByModel.values()].map(item => ({ ...item, _state: 'saved' }))]
    .sort((first, second) => `${first.store_section} ${first.model}`.localeCompare(`${second.store_section} ${second.model}`));
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
let activeShipmentPackages = [];
let activeIssuedCoupons = [];
let activeSfCalculation = null;
let productLogistics = [];
let logisticsTableReady = true;
let loadingData = false;

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
  productLogistics = [];
  activeShipmentPackages = [];
  showOnly(authView);
});

async function loadData(retried = false) {
  if (loadingData) return;
  loadingData = true;
  document.querySelector('#refreshData').disabled = true;
  const [orderResult, memberResult, logisticsResult] = await Promise.all([
    client.from('orders').select('*').order('created_at', { ascending: false }),
    client.from('profiles').select('*').order('created_at', { ascending: false }),
    client.from('product_logistics').select('*').order('store_section').order('model')
  ]);
  document.querySelector('#refreshData').disabled = false;
  const logisticsError = logisticsResult.error && !logisticsTableUnavailable(logisticsResult.error) ? logisticsResult.error : null;
  if (orderResult.error || memberResult.error || logisticsError) {
    const message = orderResult.error?.message || memberResult.error?.message || logisticsError?.message || 'Unable to load admin data.';
    if (!retried && /jwt issued at future/i.test(message)) {
      const refreshed = await client.auth.refreshSession();
      if (refreshed.data?.session) {
        session = refreshed.data.session;
        loadingData = false;
        return loadData(true);
      }
    }
    document.querySelector('#adminIdentity').textContent = `Data could not be refreshed: ${message}`;
    loadingData = false;
    return;
  }
  orders = orderResult.data || [];
  members = memberResult.data || [];
  logisticsTableReady = !logisticsTableUnavailable(logisticsResult.error);
  productLogistics = logisticsTableReady ? (logisticsResult.data || []) : [];
  renderSummary();
  renderOrders();
  renderMembers();
  renderLogistics();
  renderPurchases();
  loadingData = false;
}

function refreshVisibleDashboard() {
  if (session && !dashboard.hidden && document.visibilityState === 'visible') loadData();
}

window.addEventListener('focus', refreshVisibleDashboard);
document.addEventListener('visibilitychange', refreshVisibleDashboard);
window.setInterval(refreshVisibleDashboard, 30000);

function renderSummary() {
  const open = orders.filter(order => !['shipped', 'cancelled'].includes(order.status)).length;
  const awaitingPayment = orders.filter(order => ['quoted', 'payment_pending', 'payment_submitted'].includes(order.status)).length;
  const paid = orders.filter(order => ['paid', 'processing', 'shipped'].includes(order.status)).reduce((sum, order) => sum + Number(order.total_usd || order.subtotal_usd || 0), 0);
  document.querySelector('#summaryGrid').innerHTML = `
    <div class="summary-card"><span>Members</span><strong>${members.length}</strong></div>
    <div class="summary-card"><span>Total orders</span><strong>${orders.length}</strong></div>
    <div class="summary-card"><span>Open orders</span><strong>${open}</strong></div>
    <div class="summary-card"><span>Logistics coverage</span><strong>${logisticsTableReady ? `${productLogistics.length}/${logisticsCatalog.length}` : 'Setup'}</strong><small>${logisticsTableReady ? 'Saved / catalog products' : 'SQL table required'}</small></div>
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

function renderPurchases() {
  const body = document.querySelector('#purchasesBody');
  const search = document.querySelector('#purchaseSearch');
  if (!body || !search) return;
  const query = search.value.trim().toLowerCase();
  const rows = Object.entries(purchaseSourceData)
    .map(([publicModel, source]) => ({
      publicModel,
      source,
      product: catalogProductForModel(publicModel)
    }))
    .filter(({ publicModel, source, product }) => !query || `${publicModel} ${source.sourceProductId || ''} ${product?.nameEn || source.productName || ''} ${source.store || ''}`.toLowerCase().includes(query))
    .sort((a, b) => String(a.product?.nameEn || a.source.productName || a.publicModel).localeCompare(String(b.product?.nameEn || b.source.productName || b.publicModel)));
  body.innerHTML = rows.length ? rows.map(({ publicModel, product, source }) => {
    const priceRange = purchasePriceRange(product, source);
    return `
    <tr>
      <td><strong>${e(publicModel)}</strong><br><small>${e(product?.nameEn || source.productName || 'Imported catalog product')}</small><br><small>Supplier item: ${e(source.sourceProductId || '-')}</small></td>
      <td><strong>${e(priceRange)}</strong>${priceRange === 'Not captured' ? '<br><small>Original supplier price not captured</small>' : ''}</td>
      <td>${e(source.store || 'Taobao supplier')}<br><small>${e(source.verification || '')}</small></td>
      <td><a class="purchase-link" href="${e(source.url)}" target="_blank" rel="noopener noreferrer">Open Taobao ↗</a></td>
    </tr>`;
  }).join('') : '<tr><td class="empty" colspan="4">No matching Taobao products.</td></tr>';
}

function renderLogistics() {
  const body = document.querySelector('#logisticsBody');
  const search = document.querySelector('#logisticsSearch');
  const note = document.querySelector('#logisticsNote');
  if (!body || !search || !note) return;
  if (!logisticsTableReady) {
    note.classList.add('setup-required');
    note.innerHTML = 'Setup required: run <code>supabase-product-logistics-setup.sql</code> in the Supabase SQL Editor. The admin page remains usable while this table is unavailable.';
    body.innerHTML = '<tr><td class="empty" colspan="6">Product logistics table has not been installed yet.</td></tr>';
    return;
  }
  note.classList.remove('setup-required');
  const rows = allLogisticsRows();
  const savedCount = rows.filter(item => ['saved', 'estimated'].includes(item._state) && productLogistics.some(saved => saved.model === item.model)).length;
  const suggestedCount = rows.filter(item => item._state === 'estimated' && !productLogistics.some(saved => saved.model === item.model)).length;
  const manualCount = rows.filter(item => item._state === 'manual').length;
  note.innerHTML = `<strong>${e(savedCount)} saved</strong> · ${e(suggestedCount)} estimated defaults ready to review · <strong>${e(manualCount)} require manual input</strong>. Devices without catalog packing data are never estimated.`;
  const query = search.value.trim().toLowerCase();
  const filtered = rows.filter(item => !query || `${item.model} ${item.product_name || ''} ${item.store_section || ''} ${item.notes || ''} ${item._state || ''}`.toLowerCase().includes(query));
  body.innerHTML = filtered.length ? filtered.map(item => {
    const productSize = dimensionText(item, 'product');
    const packageSize = dimensionText(item, 'package');
    const cartonSize = dimensionText(item, 'carton');
    const packageWeight = positiveNumber(item.package_weight_kg) || positiveNumber(item.unit_weight_kg);
    const estimate = unitChargeableWeight(item);
    const stateLabel = item._state === 'manual' ? 'Manual input required' : item._state === 'estimated' ? 'Estimated weight' : item._state === 'catalog' ? 'Catalog packing value' : 'Saved record';
    return `<tr data-logistics-model="${e(item.model)}">
      <td><strong>${e(item.model)}</strong><br><small>${e(item.product_name || 'Product name not entered')}</small><span class="logistics-state state-${e(item._state)}">${e(stateLabel)}</span></td>
      <td><span class="status">${e(item.store_section || 'Other')}</span></td>
      <td>${productSize ? `<strong>${e(productSize)}</strong>` : '<span class="missing-value">Not entered</span>'}${item.unit_weight_kg ? `<small>Net ${e(item.unit_weight_kg)} kg</small>` : ''}</td>
      <td>${packageSize ? `<strong>${e(packageSize)}</strong>` : '<span class="missing-value">Size missing</span>'}<small>${packageWeight ? `${e(packageWeight)} kg gross` : '<span class="missing-value">Weight missing</span>'}</small></td>
      <td>${cartonSize ? `<strong>${e(cartonSize)}</strong>` : '<span class="missing-value">Not entered</span>'}<small>${item.units_per_carton ? `${e(item.units_per_carton)} pcs · ` : ''}${item.carton_weight_kg ? `${e(item.carton_weight_kg)} kg` : ''}</small></td>
      <td><div class="logistics-volume">${estimate ? `<strong>${e(estimate.chargeable.toFixed(2))} kg</strong><small>Actual ${e(estimate.actual.toFixed(2))} / volume ${e(estimate.volume.toFixed(2))}</small>` : '<span class="missing-value">Insufficient data</span>'}</div></td>
    </tr>`;
  }).join('') : '<tr><td class="empty" colspan="6">No matching product logistics records.</td></tr>';
}

function logisticsNumberInput(name, label, value, step = '0.01') {
  return `<label>${e(label)}<input name="${e(name)}" type="number" min="0" step="${e(step)}" value="${e(value ?? '')}"></label>`;
}

function logisticsModelOptions(store, selectedModel = '') {
  const products = logisticsCatalog.filter(product => product.store_section === store);
  const selectedExists = products.some(product => product.model === selectedModel);
  return [
    '<option value="">Choose a model</option>',
    ...(!selectedExists && selectedModel ? [`<option value="${e(selectedModel)}" selected>${e(selectedModel)}</option>`] : []),
    ...products.map(product => `<option value="${e(product.model)}" ${product.model === selectedModel ? 'selected' : ''}>${e(product.model)} — ${e(product.product_name)}</option>`)
  ].join('');
}

function updateLogisticsPreview(form) {
  const preview = document.querySelector('#logisticsPreview');
  if (!preview || !form) return;
  const values = Object.fromEntries(new FormData(form));
  const estimate = unitChargeableWeight(values);
  const packageCbm = volumeCbm(values, 'package');
  preview.innerHTML = `
    <div><span>Package volume</span><strong>${e(packageCbm.toFixed(4))} CBM</strong></div>
    <div><span>Volume weight</span><strong>${e((packageCbm * 200).toFixed(2))} kg</strong></div>
    <div><span>Chargeable / unit</span><strong>${estimate ? e(estimate.chargeable.toFixed(2)) : '—'} kg</strong></div>`;
}

function openLogisticsEditor(model = '') {
  if (!logisticsTableReady) {
    detail.innerHTML = '<div class="detail-head"><p class="eyebrow">Product logistics</p><h2>Database setup required</h2></div><section class="detail-section"><p>Run <code>tools/supabase-product-logistics-setup.sql</code> in the Supabase SQL Editor, then refresh this page.</p></section>';
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    return;
  }
  const record = productLogistics.find(item => item.model === model) || null;
  const catalogProduct = logisticsCatalog.find(item => item.model === model) || null;
  const suggestion = record ? null : suggestedLogistics(catalogProduct);
  const draft = record || suggestion || catalogProduct || null;
  const value = field => draft?.[field] ?? '';
  const selectedStore = draft?.store_section || '';
  const isCustomRecord = Boolean(record && !catalogProduct);
  const storeOptions = ['Devices','Tools','Frames','Lenses','Other'].map(store => `<option value="${store}" ${selectedStore === store ? 'selected' : ''}>${store}</option>`).join('');
  const lockedCatalogFields = record && catalogProduct ? 'disabled' : '';
  detail.innerHTML = `
    <div class="detail-head"><p class="eyebrow">Product logistics</p><h2>${e(draft?.model || 'Add product')}</h2><p>${suggestion?._suggestion === 'estimated' ? 'Estimated packing values are prefilled. Review and save them, then replace them after weighing the actual product.' : catalogProduct?.store_section === 'Devices' && !record ? 'This device has no catalog weight. Enter the measured or supplier-confirmed packing data manually.' : 'Saved separately from the customer-facing catalog and used for freight estimates.'}</p></div>
    <form id="logisticsForm" class="form-grid">
      ${isCustomRecord ? `
        <label>Model<input class="model-locked" name="model" required readonly value="${e(value('model'))}"></label>
        <label>Store / product family<select name="store_section"><option value="">Choose a product family</option>${storeOptions}</select></label>
        <label class="wide">Product name<input name="product_name" value="${e(value('product_name'))}" placeholder="English product name"></label>` : `
        <label>Store / product family<select id="logisticsStore" name="store_section" ${lockedCatalogFields}><option value="">Choose a product family</option>${storeOptions}</select>${lockedCatalogFields ? `<input type="hidden" name="store_section" value="${e(selectedStore)}">` : ''}</label>
        <label>Model<select id="logisticsModel" name="model" ${lockedCatalogFields} required>${logisticsModelOptions(selectedStore, value('model'))}</select>${lockedCatalogFields ? `<input type="hidden" name="model" value="${e(value('model'))}">` : ''}</label>
        <label class="wide">Product name<input id="logisticsProductName" name="product_name" readonly value="${e(value('product_name'))}" placeholder="Selected automatically from the model"></label>`}
      <section class="logistics-form-section wide"><h3>Product itself</h3>
        ${logisticsNumberInput('unit_weight_kg', 'Net product weight (kg)', value('unit_weight_kg'), '0.001')}
        <div class="dimension-grid">
          ${logisticsNumberInput('product_length_cm', 'Length (cm)', value('product_length_cm'))}
          ${logisticsNumberInput('product_width_cm', 'Width (cm)', value('product_width_cm'))}
          ${logisticsNumberInput('product_height_cm', 'Height (cm)', value('product_height_cm'))}
        </div>
      </section>
      <section class="logistics-form-section wide"><h3>Individual shipping package</h3>
        ${logisticsNumberInput('package_weight_kg', 'Gross weight (kg)', value('package_weight_kg'), '0.001')}
        <div class="dimension-grid">
          ${logisticsNumberInput('package_length_cm', 'Length (cm)', value('package_length_cm'))}
          ${logisticsNumberInput('package_width_cm', 'Width (cm)', value('package_width_cm'))}
          ${logisticsNumberInput('package_height_cm', 'Height (cm)', value('package_height_cm'))}
        </div>
      </section>
      <section class="logistics-form-section wide"><h3>Master carton</h3>
        <div class="dimension-grid">
          ${logisticsNumberInput('units_per_carton', 'Units / carton', value('units_per_carton'), '1')}
          ${logisticsNumberInput('carton_weight_kg', 'Carton gross (kg)', value('carton_weight_kg'), '0.001')}
          <span></span>
          ${logisticsNumberInput('carton_length_cm', 'Length (cm)', value('carton_length_cm'))}
          ${logisticsNumberInput('carton_width_cm', 'Width (cm)', value('carton_width_cm'))}
          ${logisticsNumberInput('carton_height_cm', 'Height (cm)', value('carton_height_cm'))}
        </div>
      </section>
      <label class="wide">Source / internal notes<textarea name="notes" rows="3" placeholder="Brochure page, test distance, packing caveats...">${e(value('notes'))}</textarea></label>
      <div class="logistics-calculation wide" id="logisticsPreview"></div>
    </form>
    <div class="order-actions"><button class="primary-button" id="saveLogistics" type="button">Save logistics</button>${record ? '<button class="danger-button" id="deleteLogistics" type="button">Delete record</button>' : ''}</div>
    <p class="save-status" id="logisticsSaveStatus"></p>`;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  const form = document.querySelector('#logisticsForm');
  const storeSelect = document.querySelector('#logisticsStore');
  const modelSelect = document.querySelector('#logisticsModel');
  const productNameInput = document.querySelector('#logisticsProductName');
  const draftFields = [
    'unit_weight_kg','product_length_cm','product_width_cm','product_height_cm',
    'package_weight_kg','package_length_cm','package_width_cm','package_height_cm',
    'units_per_carton','carton_weight_kg','carton_length_cm','carton_width_cm','carton_height_cm','notes'
  ];
  const applyCatalogSelection = product => {
    const selectedDraft = suggestedLogistics(product) || product || {};
    if (productNameInput) productNameInput.value = product?.product_name || '';
    draftFields.forEach(field => {
      const input = form.elements.namedItem(field);
      if (input) input.value = selectedDraft?.[field] ?? '';
    });
    updateLogisticsPreview(form);
  };
  storeSelect?.addEventListener('change', () => {
    modelSelect.innerHTML = logisticsModelOptions(storeSelect.value);
    applyCatalogSelection(null);
  });
  modelSelect?.addEventListener('change', () => {
    applyCatalogSelection(logisticsCatalog.find(product => product.model === modelSelect.value) || null);
  });
  form.addEventListener('input', () => updateLogisticsPreview(form));
  updateLogisticsPreview(form);
  document.querySelector('#saveLogistics').addEventListener('click', async () => {
    const status = document.querySelector('#logisticsSaveStatus');
    const button = document.querySelector('#saveLogistics');
    const values = Object.fromEntries(new FormData(form));
    values.model = String(values.model || '').trim().toUpperCase();
    values.product_name = String(values.product_name || '').trim() || null;
    values.notes = String(values.notes || '').trim() || null;
    const numericFields = [
      'unit_weight_kg','product_length_cm','product_width_cm','product_height_cm',
      'package_weight_kg','package_length_cm','package_width_cm','package_height_cm',
      'units_per_carton','carton_weight_kg','carton_length_cm','carton_width_cm','carton_height_cm'
    ];
    numericFields.forEach(field => {
      const number = Number(values[field]);
      values[field] = values[field] === '' ? null : number;
    });
    if (!values.model) {
      status.textContent = 'Model is required.';
      return;
    }
    if (numericFields.some(field => values[field] !== null && (!Number.isFinite(values[field]) || values[field] < 0)) ||
        (values.units_per_carton !== null && !Number.isInteger(values.units_per_carton))) {
      status.textContent = 'Weights and dimensions must be non-negative numbers; units per carton must be a whole number.';
      return;
    }
    values.updated_by = session.user.id;
    button.disabled = true;
    status.textContent = 'Saving product logistics...';
    const { data, error } = await client.from('product_logistics').upsert(values, { onConflict: 'model' }).select().single();
    button.disabled = false;
    if (error) {
      status.textContent = error.message;
      return;
    }
    productLogistics = [...productLogistics.filter(item => item.model !== data.model), data]
      .sort((first, second) => `${first.store_section} ${first.model}`.localeCompare(`${second.store_section} ${second.model}`));
    renderLogistics();
    renderSummary();
    status.textContent = 'Product logistics saved. Future order freight estimates will use this data.';
  });
  document.querySelector('#deleteLogistics')?.addEventListener('click', async () => {
    const status = document.querySelector('#logisticsSaveStatus');
    if (window.prompt(`Type DELETE to remove logistics for ${record.model}.`) !== 'DELETE') {
      status.textContent = 'Deletion cancelled.';
      return;
    }
    const { error } = await client.from('product_logistics').delete().eq('model', record.model);
    if (error) {
      status.textContent = error.message;
      return;
    }
    productLogistics = productLogistics.filter(item => item.model !== record.model);
    renderLogistics();
    renderSummary();
    closeDrawer();
  });
}

document.querySelector('#orderSearch').addEventListener('input', renderOrders);
document.querySelector('#statusFilter').addEventListener('change', renderOrders);
document.querySelector('#memberSearch').addEventListener('input', renderMembers);
document.querySelector('#logisticsSearch')?.addEventListener('input', renderLogistics);
document.querySelector('#addLogistics')?.addEventListener('click', () => openLogisticsEditor());
document.querySelector('#purchaseSearch')?.addEventListener('input', renderPurchases);
document.querySelector('#refreshData').addEventListener('click', () => loadData());

document.querySelector('.tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  document.querySelectorAll('.tabs button').forEach(item => item.classList.toggle('active', item === button));
  document.querySelector('#ordersPanel').hidden = button.dataset.tab !== 'orders';
  document.querySelector('#membersPanel').hidden = button.dataset.tab !== 'members';
  document.querySelector('#logisticsPanel').hidden = button.dataset.tab !== 'logistics';
  document.querySelector('#purchasesPanel').hidden = button.dataset.tab !== 'purchases';
});

document.querySelector('#ordersBody').addEventListener('click', event => {
  const row = event.target.closest('[data-order-id]');
  if (row) openOrder(row.dataset.orderId);
});

document.querySelector('#membersBody').addEventListener('click', event => {
  const row = event.target.closest('[data-member-id]');
  if (row) openMember(row.dataset.memberId);
});

document.querySelector('#logisticsBody')?.addEventListener('click', event => {
  const row = event.target.closest('[data-logistics-model]');
  if (row) openLogisticsEditor(row.dataset.logisticsModel);
});

function openMember(id) {
  const member = members.find(item => item.id === id);
  if (!member) return;
  const linkedOrderCount = orders.filter(order => order.user_id === member.id).length;
  detail.innerHTML = `
    <div class="detail-head"><p class="eyebrow">Member management</p><h2>${e(member.full_name || member.email || 'Member')}</h2><p>Joined ${e(date(member.created_at))}</p></div>
    <section class="detail-section"><form id="memberForm" class="form-grid">
      <input type="hidden" name="buyer_type" value="company">
      <label>Manager / Contact name<input name="full_name" required value="${e(member.full_name || '')}"></label>
      <label>Company name<input name="company_name" required value="${e(member.company_name || '')}"></label>
      <label>Email<input name="email" type="email" required value="${e(member.email || '')}"><small>The customer receives an account-change notification.</small></label>
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
    </form><div class="order-actions"><button class="primary-button" id="saveMember">Save member & notify customer</button></div><p class="save-status" id="memberSaveStatus"></p></section>
    <section class="detail-section danger-zone"><h3>Delete member</h3><p>Removes the customer's login and profile. ${linkedOrderCount ? `${linkedOrderCount} historical order${linkedOrderCount === 1 ? '' : 's'} will be retained for business records.` : 'This member has no historical orders.'}</p><button class="danger-button" id="deleteMember">Delete member account</button><p class="save-status" id="memberDeleteStatus"></p></section>`;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.querySelector('#saveMember').addEventListener('click', async () => {
    const status = document.querySelector('#memberSaveStatus');
    const button = document.querySelector('#saveMember');
    const values = Object.fromEntries(new FormData(document.querySelector('#memberForm')));
    Object.keys(values).forEach(key => values[key] = String(values[key] || '').trim() || null);
    values.buyer_type = 'company';
    if (!values.company_name || !values.full_name || !values.email) {
      status.textContent = 'Email, company name and Manager / Contact name are required.';
      return;
    }
    button.disabled = true;
    status.textContent = 'Saving account and sending notification...';
    const { data, error } = await invokeMemberAdminFunction({
      action: 'update_user',
      user_id: member.id,
      email: values.email,
      profile: values
    });
    button.disabled = false;
    if (error) {
      status.textContent = await functionErrorMessage(error);
      return;
    }
    const savedMember = data?.profile || { ...member, ...values };
    members = members.map(item => item.id === member.id ? savedMember : item);
    status.textContent = data?.email_sent
      ? 'Member saved and the customer notification email was sent.'
      : `Member saved. Notification email was not sent${data?.email_error ? `: ${data.email_error}` : '.'}`;
    renderMembers();
    renderSummary();
  });
  document.querySelector('#deleteMember').addEventListener('click', async () => {
    const status = document.querySelector('#memberDeleteStatus');
    const confirmation = window.prompt(`Type DELETE to remove ${member.email || member.full_name || 'this member'}.\nHistorical orders will be retained.`);
    if (confirmation !== 'DELETE') {
      status.textContent = 'Deletion cancelled.';
      return;
    }
    const button = document.querySelector('#deleteMember');
    button.disabled = true;
    status.textContent = 'Deleting member account...';
    const { data, error } = await invokeMemberAdminFunction({
      action: 'delete_user',
      user_id: member.id
    });
    if (error) {
      button.disabled = false;
      status.textContent = await functionErrorMessage(error);
      return;
    }
    members = members.filter(item => item.id !== member.id);
    orders = orders.map(order => order.user_id === member.id ? { ...order, user_id: null } : order);
    renderMembers();
    renderOrders();
    renderSummary();
    closeDrawer();
    document.querySelector('#adminIdentity').textContent = data?.email_sent
      ? 'Member deleted and the customer was notified.'
      : 'Member deleted. Historical orders were retained.';
  });
}

async function openOrder(id) {
  activeOrder = orders.find(order => order.id === id);
  if (!activeOrder) return;
  detail.innerHTML = '<p>Loading order...</p>';
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  const [itemResult, couponResult] = await Promise.all([
    client.from('order_items').select('*').eq('order_id', id).order('id'),
    loadIssuedCoupons(id)
  ]);
  if (itemResult.error || couponResult.error) {
    detail.innerHTML = `<p>${e(itemResult.error?.message || couponResult.error?.message)}</p>`;
    return;
  }
  activeItems = itemResult.data || [];
  activeShipmentPackages = normalizedShipmentPackages(activeOrder.shipment_packages);
  activeIssuedCoupons = couponResult.data || [];
  renderOrderDetail();
}

function shipmentPackageId() {
  return `carton-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function shipmentItemForId(itemId) {
  return activeItems.find(item => String(item.id) === String(itemId)) || null;
}

function shipmentRemainingQuantity(itemId) {
  const item = shipmentItemForId(itemId);
  if (!item) return 0;
  return Math.max(0, Number(item.quantity || 0) - (assignedShipmentQuantities().get(String(itemId)) || 0));
}

function shipmentPackingContentHtml() {
  const assigned = assignedShipmentQuantities();
  const packageOptions = activeShipmentPackages
    .map(shipmentPackage => `<option value="${e(shipmentPackage.id)}">${e(shipmentPackage.name)}</option>`)
    .join('');
  const unpacked = activeItems.map(item => {
    const remaining = Math.max(0, Number(item.quantity || 0) - (assigned.get(String(item.id)) || 0));
    if (!remaining) return '';
    const logistics = logisticsForModel(item.model);
    const logisticsText = logistics
      ? `${positiveNumber(logistics.package_weight_kg) || positiveNumber(logistics.unit_weight_kg) || '?'} kg · ${dimensionText(logistics, 'package') || 'size missing'}`
      : 'No saved logistics data';
    return `<article class="packing-item" draggable="true" data-packing-item="${e(item.id)}">
      <div><strong>${e(item.model)}</strong><small>${e(item.product_name || '')}</small><span>${e(logisticsText)}</span></div>
      <label>Move qty<input data-unpacked-qty type="number" min="1" max="${e(remaining)}" step="1" value="${e(remaining)}"></label>
      ${activeShipmentPackages.length ? `<div class="packing-item-actions"><select data-target-carton aria-label="Target carton">${packageOptions}</select><button class="outline-button" type="button" data-add-to-carton>Add</button></div>` : '<small class="packing-hint">Create a carton, then drag or add this item.</small>'}
    </article>`;
  }).join('');
  const cartons = activeShipmentPackages.map((shipmentPackage, index) => {
    const items = shipmentPackage.items.map(entry => {
      const item = shipmentItemForId(entry.order_item_id);
      if (!item) return '';
      const otherAssigned = (assigned.get(String(item.id)) || 0) - entry.quantity;
      const maximum = Math.max(1, Number(item.quantity || 0) - otherAssigned);
      return `<div class="carton-line" data-carton-line="${e(item.id)}">
        <div><strong>${e(item.model)}</strong><small>${e(item.product_name || '')}</small></div>
        <label>Qty<input data-carton-item-qty type="number" min="1" max="${e(maximum)}" step="1" value="${e(entry.quantity)}"></label>
        <button type="button" data-remove-carton-item aria-label="Remove ${e(item.model)} from carton">×</button>
      </div>`;
    }).join('');
    return `<article class="shipment-carton" data-carton-id="${e(shipmentPackage.id)}">
      <div class="carton-heading">
        <label>Carton name<input data-carton-name value="${e(shipmentPackage.name || `Carton ${index + 1}`)}"></label>
        <button class="carton-delete" type="button" data-delete-carton>Delete</button>
      </div>
      <div class="carton-dropzone" data-carton-dropzone>
        ${items || '<p>Drag order items here, or use the Add button.</p>'}
      </div>
      <div class="carton-measurements">
        <label>Final GW (kg)<input data-carton-gw type="number" min="0.01" step="0.01" value="${shipmentPackage.gross_weight_kg || ''}" placeholder="e.g. 12.50"></label>
        <label>Final CBM<input data-carton-cbm type="number" min="0.0001" step="0.0001" value="${shipmentPackage.cbm || ''}" placeholder="e.g. 0.0750"></label>
      </div>
      <small class="carton-rule">These final carton values replace the individual logistics values for every quantity inside this carton.</small>
    </article>`;
  }).join('');
  return `<div class="packing-toolbar">
      <div><p>Drag any product into a carton. Products with existing logistics data can also be combined.</p><small>Unpacked quantities continue to use Product logistics automatically.</small></div>
      <button class="outline-button" type="button" id="addShipmentCarton">Add carton</button>
    </div>
    ${Object.prototype.hasOwnProperty.call(activeOrder || {}, 'shipment_packages') ? '' : '<p class="packing-setup-warning">Database setup required: run the updated <code>supabase-admin-setup.sql</code> before saving cartons.</p>'}
    <div class="packing-workspace">
      <div class="unpacked-items"><h4>Unpacked items</h4>${unpacked || '<p class="packing-empty">All ordered quantities are assigned to cartons.</p>'}</div>
      <div class="shipment-cartons"><h4>Manual cartons</h4>${cartons || '<p class="packing-empty">No manual cartons yet.</p>'}</div>
    </div>
    <div class="packing-actions"><button class="primary-button" type="button" id="saveShipmentCartons">Save carton plan</button><p class="save-status" id="packingSaveStatus"></p></div>`;
}

function shipmentPackingSectionHtml() {
  return `<section class="detail-section shipment-packing-section"><div class="packing-title"><div><p class="eyebrow">Order-specific packing</p><h3>Shipment cartons</h3></div></div><div id="shipmentPackingContent">${shipmentPackingContentHtml()}</div></section>`;
}

function addItemToShipmentCarton(itemId, cartonId, requestedQuantity) {
  const shipmentPackage = activeShipmentPackages.find(item => item.id === cartonId);
  const available = shipmentRemainingQuantity(itemId);
  const quantity = Math.min(available, Math.max(1, Math.floor(Number(requestedQuantity) || 1)));
  if (!shipmentPackage || !quantity) return;
  const existing = shipmentPackage.items.find(item => item.order_item_id === String(itemId));
  if (existing) existing.quantity += quantity;
  else shipmentPackage.items.push({ order_item_id: String(itemId), quantity });
  renderShipmentPackingEditor();
}

function refreshShipmentEstimateInputs() {
  const estimate = shipmentEstimate();
  const mount = document.querySelector('#shipmentEstimateMount');
  if (mount) mount.innerHTML = shipmentEstimateHtml(estimate);
  const form = document.querySelector('#sfFreightForm');
  if (form) {
    form.elements.actual_kg.value = estimate.actualKg ? estimate.actualKg.toFixed(2) : '';
    form.elements.cbm.value = estimate.cbm ? estimate.cbm.toFixed(4) : '';
  }
}

function renderShipmentPackingEditor() {
  const content = document.querySelector('#shipmentPackingContent');
  if (!content) return;
  content.innerHTML = shipmentPackingContentHtml();
  initializeShipmentPackingEditor();
  refreshShipmentEstimateInputs();
}

function initializeShipmentPackingEditor() {
  const content = document.querySelector('#shipmentPackingContent');
  if (!content) return;
  content.querySelector('#addShipmentCarton')?.addEventListener('click', () => {
    activeShipmentPackages.push({
      id: shipmentPackageId(),
      name: `Carton ${activeShipmentPackages.length + 1}`,
      gross_weight_kg: null,
      cbm: null,
      items: []
    });
    renderShipmentPackingEditor();
  });
  content.querySelectorAll('[data-packing-item]').forEach(card => {
    card.addEventListener('dragstart', event => {
      const quantity = card.querySelector('[data-unpacked-qty]')?.value || '1';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ itemId: card.dataset.packingItem, quantity }));
    });
    card.querySelector('[data-add-to-carton]')?.addEventListener('click', () => {
      addItemToShipmentCarton(
        card.dataset.packingItem,
        card.querySelector('[data-target-carton]').value,
        card.querySelector('[data-unpacked-qty]').value
      );
    });
  });
  content.querySelectorAll('[data-carton-id]').forEach(card => {
    const shipmentPackage = activeShipmentPackages.find(item => item.id === card.dataset.cartonId);
    if (!shipmentPackage) return;
    const dropzone = card.querySelector('[data-carton-dropzone]');
    dropzone.addEventListener('dragover', event => {
      event.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', event => {
      event.preventDefault();
      dropzone.classList.remove('drag-over');
      try {
        const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
        addItemToShipmentCarton(payload.itemId, shipmentPackage.id, payload.quantity);
      } catch (_) {}
    });
    card.querySelector('[data-carton-name]').addEventListener('input', event => {
      shipmentPackage.name = event.currentTarget.value;
    });
    card.querySelector('[data-carton-gw]').addEventListener('input', event => {
      shipmentPackage.gross_weight_kg = positiveNumber(event.currentTarget.value);
      refreshShipmentEstimateInputs();
    });
    card.querySelector('[data-carton-cbm]').addEventListener('input', event => {
      shipmentPackage.cbm = positiveNumber(event.currentTarget.value);
      refreshShipmentEstimateInputs();
    });
    card.querySelector('[data-delete-carton]').addEventListener('click', () => {
      activeShipmentPackages = activeShipmentPackages.filter(item => item.id !== shipmentPackage.id);
      renderShipmentPackingEditor();
    });
    card.querySelectorAll('[data-carton-line]').forEach(line => {
      const entry = shipmentPackage.items.find(item => item.order_item_id === line.dataset.cartonLine);
      line.querySelector('[data-remove-carton-item]').addEventListener('click', () => {
        shipmentPackage.items = shipmentPackage.items.filter(item => item !== entry);
        renderShipmentPackingEditor();
      });
      line.querySelector('[data-carton-item-qty]').addEventListener('change', event => {
        const maximum = Number(event.currentTarget.max);
        entry.quantity = Math.min(maximum, Math.max(1, Math.floor(Number(event.currentTarget.value) || 1)));
        renderShipmentPackingEditor();
      });
    });
  });
  content.querySelector('#saveShipmentCartons')?.addEventListener('click', saveShipmentCartons);
}

async function saveShipmentCartons() {
  const status = document.querySelector('#packingSaveStatus');
  const packages = activeShipmentPackages.filter(shipmentPackage => shipmentPackage.items.length);
  const assigned = assignedShipmentQuantities(packages);
  const overAssigned = activeItems.find(item => (assigned.get(String(item.id)) || 0) > Number(item.quantity || 0));
  if (overAssigned) {
    status.textContent = `${overAssigned.model} has more packed units than the order quantity. Adjust the carton quantity first.`;
    status.classList.add('error');
    return false;
  }
  if (packages.some(shipmentPackage => !positiveNumber(shipmentPackage.gross_weight_kg) || !positiveNumber(shipmentPackage.cbm))) {
    status.textContent = 'Enter both final GW and CBM for every carton that contains products.';
    status.classList.add('error');
    return false;
  }
  status.classList.remove('error');
  status.textContent = 'Saving carton plan...';
  const { data, error } = await client.from('orders')
    .update({ shipment_packages: packages, updated_at: new Date().toISOString() })
    .eq('id', activeOrder.id)
    .select('*')
    .single();
  if (error) {
    status.textContent = /shipment_packages/i.test(error.message || '')
      ? 'Run the updated supabase-admin-setup.sql in Supabase, then try again.'
      : error.message;
    status.classList.add('error');
    return false;
  }
  activeShipmentPackages = normalizedShipmentPackages(data.shipment_packages);
  activeOrder = data;
  orders = orders.map(order => order.id === data.id ? data : order);
  renderShipmentPackingEditor();
  document.querySelector('#packingSaveStatus').textContent = 'Carton plan saved. Freight inputs now use these carton totals.';
  return true;
}

function sfFreightCalculatorHtml(order) {
  if (!sfFreight) return '<section class="detail-section"><h3>SF International freight calculator</h3><p class="sf-message error">SF tariff data is unavailable. Refresh the page.</p></section>';
  const estimate = shipmentEstimate();
  const matched = sfFreight.findDestination(order.destination_country);
  const destinationOptions = sfFreight.destinations
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item => `<option value="${e(item.code)}" ${matched?.code === item.code ? 'selected' : ''}>${e(item.name)} (${e(item.code)}) · Zone ${e(item.zone)}</option>`)
    .join('');
  let exchangeRate = 6.8;
  try { exchangeRate = Number(localStorage.getItem('lzn_sf_rmb_per_usd')) || exchangeRate; } catch (_) {}
  const today = new Date().toLocaleDateString('en-CA');
  return `<section class="detail-section sf-freight-section">
    <div class="sf-section-heading"><div><p class="eyebrow">China export public tariff</p><h3>SF International freight calculator</h3></div><div class="sf-source-links"><a href="${e(sfFreight.publicRateUrl)}" target="_blank" rel="noopener">2026 export tariff</a><a href="${e(sfFreight.fuelRateUrl)}" target="_blank" rel="noopener">Official fuel rate</a></div></div>
    <div id="shipmentEstimateMount">${shipmentEstimateHtml(estimate)}</div>
    <form id="sfFreightForm" class="sf-freight-form">
      <label class="wide">Destination country<select name="destination" required><option value="">Select destination</option>${destinationOptions}</select></label>
      <label>SF service<select name="service" required></select></label>
      <label>Planned shipment date<input name="ship_date" type="date" value="${e(today)}" required></label>
      <label>Actual gross weight (kg)<input name="actual_kg" type="number" min="0" step="0.01" value="${estimate.actualKg ? e(estimate.actualKg.toFixed(2)) : ''}" placeholder="e.g. 30"><small>Prefilled from Product logistics; confirm after final packing.</small></label>
      <label>Total volume (CBM)<input name="cbm" type="number" min="0" step="0.0001" value="${estimate.cbm ? e(estimate.cbm.toFixed(4)) : ''}" placeholder="e.g. 0.20"><small>Prefilled from package/carton dimensions; remains editable.</small></label>
      <label>Fuel surcharge (%)<input name="fuel_rate" type="number" min="0" step="0.01" placeholder="Loading official rate"></label>
      <label>Exchange rate (RMB per USD)<input name="rmb_per_usd" type="number" min="0.01" step="0.0001" value="${e(exchangeRate)}" required></label>
      <label class="wide">Other SF surcharges (RMB)<input name="other_rmb" type="number" min="0" step="0.01" value="0"><small>Remote area, resource allocation, oversize, overweight or special handling charges, if applicable.</small></label>
      <div class="sf-freight-actions wide"><button class="outline-button" type="button" id="sfRefreshFuel">Refresh fuel rate</button><button class="primary-button" type="submit">Calculate freight</button></div>
    </form>
    <p class="sf-message" id="sfFuelStatus"></p>
    <div class="sf-result" id="sfFreightResult" hidden></div>
    <p class="sf-disclaimer">Published shipper-pay rates from Mainland China. Duties, destination taxes and unlisted SF surcharges are not included.</p>
  </section>`;
}

function syncSfServiceOptions() {
  const form = document.querySelector('#sfFreightForm');
  if (!form || !sfFreight) return;
  const destination = sfFreight.findDestination(form.elements.destination.value);
  const select = form.elements.service;
  const previous = select.value;
  const preferredOrder = ['EE', 'SE', 'GE+'];
  const services = destination ? preferredOrder.filter(service => destination.services.includes(service)) : [];
  select.innerHTML = services.length
    ? services.map(service => `<option value="${e(service)}">${e(sfFreight.serviceLabels[service])}</option>`).join('')
    : '<option value="">Select destination first</option>';
  if (services.includes(previous)) select.value = previous;
  else if (services.length) select.value = services[0];
}

async function refreshSfFuelRate(force = false) {
  const form = document.querySelector('#sfFreightForm');
  const status = document.querySelector('#sfFuelStatus');
  if (!form || !status || !sfFreight) return;
  const service = form.elements.service.value;
  const shipDate = form.elements.ship_date.value;
  if (!service || !shipDate) {
    status.textContent = 'Select a destination, service and shipment date.';
    return;
  }
  status.classList.remove('error');
  status.textContent = 'Checking the applicable fuel surcharge...';
  try {
    const result = await sfFreight.loadFuelRate(shipDate, service, force);
    form.elements.fuel_rate.value = Number(result.rate).toFixed(2);
    form.elements.fuel_rate.dataset.rateSource = result.source;
    const validity = result.end ? `${result.start} to ${result.end}` : `EIA reference ${result.eiaPeriod || result.start}`;
    status.innerHTML = `<strong>${e(Number(result.rate).toFixed(2))}%</strong> · ${e(validity)} · ${e(result.source)}`;
  } catch (error) {
    form.elements.fuel_rate.dataset.rateSource = 'Manual rate';
    status.classList.add('error');
    status.innerHTML = `${e(error.message || String(error))} <a href="${e(sfFreight.fuelRateUrl)}" target="_blank" rel="noopener">Open SF official rate</a>`;
  }
}

function calculateSfFreight(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const resultBox = document.querySelector('#sfFreightResult');
  const fuelStatus = document.querySelector('#sfFuelStatus');
  try {
    const values = Object.fromEntries(new FormData(form));
    const fuelRate = Number(values.fuel_rate);
    const exchangeRate = Number(values.rmb_per_usd);
    const otherRmb = Number(values.other_rmb || 0);
    if (values.fuel_rate === '' || !(fuelRate >= 0)) throw new Error('Enter the applicable SF fuel surcharge percentage.');
    if (!(exchangeRate > 0)) throw new Error('Enter the RMB per USD exchange rate.');
    if (otherRmb < 0) throw new Error('Other surcharges cannot be negative.');
    const weight = sfFreight.calculateChargeableWeight(values.actual_kg, values.cbm);
    const base = sfFreight.calculateBaseFreight(values.destination, values.service, weight.chargeable);
    const fuelRmb = Math.round(base.amount * fuelRate) / 100;
    const totalRmb = Math.round((base.amount + fuelRmb + otherRmb) * 100) / 100;
    const totalUsd = Math.round(totalRmb / exchangeRate * 100) / 100;
    activeSfCalculation = { ...values, ...weight, ...base, fuelRate, fuelRmb, otherRmb, totalRmb, totalUsd, exchangeRate };
    try { localStorage.setItem('lzn_sf_rmb_per_usd', String(exchangeRate)); } catch (_) {}
    resultBox.hidden = false;
    resultBox.innerHTML = `<div class="sf-result-title"><div><span>Calculated freight</span><strong>USD ${e(totalUsd.toFixed(2))}</strong></div><button class="primary-button" type="button" id="sfApplyFreight">Apply to order</button></div>
      <div class="sf-breakdown">
        <div><span>Destination / service</span><strong>${e(base.destination.name)} · ${e(sfFreight.serviceLabels[values.service])} · Zone ${e(base.zone)}</strong></div>
        <div><span>Actual / volume weight</span><strong>${e(weight.actual.toFixed(2))} kg / ${e(weight.volume.toFixed(2))} kg</strong></div>
        <div><span>Chargeable weight</span><strong>${e(weight.chargeable.toFixed(1))} kg</strong></div>
        <div><span>Published base freight</span><strong>RMB ${e(base.amount.toFixed(2))}${base.rateType === 'per_kg' ? ` (${e(base.rate)} / kg)` : ''}</strong></div>
        <div><span>Fuel surcharge</span><strong>RMB ${e(fuelRmb.toFixed(2))} (${e(fuelRate.toFixed(2))}%)</strong></div>
        <div><span>Other surcharges</span><strong>RMB ${e(otherRmb.toFixed(2))}</strong></div>
        <div class="sf-total-row"><span>Total</span><strong>RMB ${e(totalRmb.toFixed(2))} / USD ${e(totalUsd.toFixed(2))}</strong></div>
      </div>`;
    document.querySelector('#sfApplyFreight').addEventListener('click', applySfFreightToOrder);
    fuelStatus.classList.remove('error');
  } catch (error) {
    activeSfCalculation = null;
    resultBox.hidden = true;
    fuelStatus.classList.add('error');
    fuelStatus.textContent = error.message || String(error);
  }
}

function applySfFreightToOrder() {
  if (!activeSfCalculation) return;
  const orderForm = document.querySelector('#orderForm');
  const freightInput = orderForm?.elements.freight_usd;
  if (!freightInput) return;
  freightInput.value = activeSfCalculation.totalUsd.toFixed(2);
  freightInput.dispatchEvent(new Event('input', { bubbles: true }));
  const status = document.querySelector('#saveStatus');
  if (status) status.textContent = `SF freight applied: USD ${activeSfCalculation.totalUsd.toFixed(2)}. Save changes to keep it on the order.`;
}

function initializeSfFreightCalculator() {
  const form = document.querySelector('#sfFreightForm');
  if (!form || !sfFreight) return;
  activeSfCalculation = null;
  syncSfServiceOptions();
  form.addEventListener('submit', calculateSfFreight);
  form.elements.destination.addEventListener('change', () => { syncSfServiceOptions(); refreshSfFuelRate(); });
  form.elements.service.addEventListener('change', () => refreshSfFuelRate());
  form.elements.ship_date.addEventListener('change', () => refreshSfFuelRate());
  form.elements.fuel_rate.addEventListener('input', () => { form.elements.fuel_rate.dataset.rateSource = 'Manual rate'; });
  document.querySelector('#sfRefreshFuel').addEventListener('click', () => refreshSfFuelRate());
  refreshSfFuelRate();
}

function renderOrderDetail() {
  const order = activeOrder;
  const freight = Number(order.freight_usd || 0);
  const discount = Number(order.discount_usd || 0);
  const total = Number(order.total_usd ?? Number(order.subtotal_usd || 0) - discount + freight);
  detail.innerHTML = `
    <div class="detail-head"><p class="eyebrow">${e(storeName(order, true))}</p><h2>${e(order.invoice_no || 'Proforma Invoice not assigned')}</h2><p class="request-id">Order ${e(order.id)}</p></div>
    <div class="workflow-banner"><span>Current stage</span><strong>${e(statusLabels[order.status] || order.status)}</strong><small>Next: ${e(nextStepLabels[order.status] || 'Review the order')}</small></div>
    <section class="detail-section"><h3>Customer & shipping</h3><div class="customer-box"><strong>Recipient type:</strong> ${(order.buyer_type || 'company') === 'company' ? 'Company' : 'Individual'}<br>${(order.buyer_type || 'company') === 'company' && order.company_name ? `<strong>${e(order.company_name)}</strong><br>Attn: ` : ''}<strong>${e(order.contact_name || '-')}</strong>${order.contact_email ? `<br><a href="mailto:${e(order.contact_email)}">${e(order.contact_email)}</a>` : ''}<br>${e(order.contact_phone || '')}<br>${e(order.shipping_address || '')}<br>${e(order.postal_code || '')}<br><br><strong>Payment method:</strong> ${e(paymentLabel(order.payment_method))}${paymentCode(order.payment_method) === 'company_bank_transfer' ? '' : '<br><strong>Processing fee:</strong> Confirmed on Payoneer and may vary.<br><small>Not included in the PI total; do not add it again if Payoneer charges the payer.</small>'}<br><br><strong>Freight request:</strong> ${e(order.courier || '-')}<br><strong>Collect account:</strong> ${e(order.courier_account_no || '-')}</div></section>
    <section class="detail-section"><h3>Items & selling prices</h3>${activeItems.some(itemPriceOnRequest) ? '<p class="price-request-alert"><strong>Price quotation required.</strong> Enter a selling price for the marked items before issuing the final Proforma Invoice.</p>' : ''}<form id="orderItemsForm"><div class="table-wrap"><table class="order-items editable-order-items"><thead><tr><th>Model / item</th><th>Qty</th><th>Unit price (USD)</th><th>Total</th></tr></thead><tbody>${activeItems.map(item => `<tr data-order-item-row data-item-id="${e(item.id)}"><td><strong>${e(item.model)}</strong><br><small>${e(item.product_name)}</small>${purchaseSourceHtml(item.model)}${logisticsInlineHtml(item)}</td><td><input aria-label="Quantity for ${e(item.model)}" data-item-quantity type="number" min="1" step="1" value="${e(item.quantity)}"></td><td><input aria-label="Unit price for ${e(item.model)}" data-item-price type="number" min="0" step="0.01" value="${Number(item.unit_price_usd || 0).toFixed(2)}"></td><td data-item-total>${money(item.line_total_usd)}</td></tr>`).join('')}</tbody></table></div><div class="order-actions"><button class="outline-button" type="button" id="saveOrderItems">Save item quantities & prices</button></div><p class="save-status" id="itemSaveStatus"></p></form></section>
    ${order.payment_submitted_at ? `<section class="detail-section"><h3>Customer payment notice</h3><div class="customer-box payment-review"><strong>Verification required</strong><br>Submitted: ${e(date(order.payment_submitted_at))}<br>Remitter / Reference: ${e(order.payment_reference || '-')}<br>Customer note: ${e(order.payment_note || '-')}<p>Confirm receipt through ${paymentCode(order.payment_method) === 'company_bank_transfer' ? 'the company bank account' : 'Payoneer'} before changing the status to Paid.</p></div></section>` : ''}
    ${activeIssuedCoupons.length ? `<section class="detail-section"><h3>Issued repeat-order coupons (${activeIssuedCoupons.length})</h3><div class="customer-box">${activeIssuedCoupons.map((coupon, index) => `<div><strong>${index + 1}. ${e(coupon.code)}</strong><br>Value: ${money(coupon.amount_usd)} · Status: ${e(coupon.status)}<br>Issued: ${e(date(coupon.issued_at))} · Expires: ${e(date(coupon.expires_at))}</div>`).join('<hr>')}</div></section>` : ''}
    ${invoiceActivity(order)}
    ${shipmentPackingSectionHtml()}
    ${sfFreightCalculatorHtml(order)}
    <section class="detail-section"><h3>Order & invoice</h3><form id="orderForm" class="form-grid">
      <label>Company name<input name="company_name" value="${e(order.company_name || '')}"></label>
      <label>Manager / Contact<input name="contact_name" required value="${e(order.contact_name || '')}"></label>
      <label>Customer email<input name="contact_email" type="email" required value="${e(order.contact_email || '')}"></label>
      <label>Customer phone<input name="contact_phone" value="${e(order.contact_phone || '')}"></label>
      <label>Destination country<input name="destination_country" value="${e(order.destination_country || '')}"></label>
      <label>Postal code<input name="postal_code" value="${e(order.postal_code || '')}"></label>
      <label class="wide">Shipping address<textarea name="shipping_address" rows="3">${e(order.shipping_address || '')}</textarea></label>
      <label>Payment method<select name="payment_method"><option value="company_bank_transfer" ${paymentCode(order.payment_method) === 'company_bank_transfer' ? 'selected' : ''}>Company bank transfer</option><option value="payoneer_card_paypal" ${paymentCode(order.payment_method) === 'payoneer_card_paypal' ? 'selected' : ''}>Card / PayPal — Payoneer</option></select></label>
      <label>Courier / freight instruction<input name="courier" value="${e(order.courier || '')}"></label>
      <label>Courier collect account<input name="courier_account_no" value="${e(order.courier_account_no || '')}"></label>
      <label>PI number<input name="invoice_no" value="${e(order.invoice_no || '')}" placeholder="LZN-20260713-001"></label>
      <label>Status<select name="status">${['quote_requested','quoted','payment_pending','payment_submitted','paid','processing','shipped','cancelled'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${e(statusLabels[status])}</option>`).join('')}</select></label>
      <label>Subtotal (USD)<input name="subtotal_usd" type="number" step="0.01" value="${Number(order.subtotal_usd || 0).toFixed(2)}" readonly></label>
      <label>Coupon codes<input name="coupon_code" value="${e(orderCouponCodes(order).join(', ') || 'Not used')}" readonly></label>
      <label>Coupon discount (USD)<input name="discount_usd" type="number" step="0.01" value="${discount.toFixed(2)}" readonly></label>
      <label>Freight (USD)<input name="freight_usd" type="number" min="0" step="0.01" value="${freight.toFixed(2)}"></label>
      <label>Total (USD)<input name="total_usd" type="number" step="0.01" value="${total.toFixed(2)}" readonly></label>
      <label>Tracking number<input name="tracking_no" value="${e(order.tracking_no || '')}" placeholder="Visible to customer after status is Shipped"><small>Shown to the customer only when status is Shipped.</small></label>
      <label class="wide">Internal note<textarea name="admin_note" rows="3">${e(visibleAdminNote(order))}</textarea></label>
    </form><div class="order-actions"><button class="outline-button" id="generatePi">Generate PI number</button><button class="primary-button" id="saveOrder">Save changes</button><button class="outline-button" id="printInvoice">Create & Email Proforma Invoice PDF</button><button class="primary-button" id="confirmPayment">Confirm payment</button><button class="outline-button" id="printCi">Create & Email Commercial Invoice PDF</button><button class="primary-button" id="markShipped">Mark as shipped</button>${order.status === 'shipped' ? `<button class="outline-button" id="confirmDelivery">Confirm delivery & Email customer</button>` : ''}${order.tracking_no ? `<button class="outline-button" id="trackShipment">Track shipment</button>` : ''}</div><p class="save-status" id="saveStatus"></p></section>`;
  const form = document.querySelector('#orderForm');
  form.elements.freight_usd.addEventListener('input', () => form.elements.total_usd.value = (Number(order.subtotal_usd || 0) - discount + Number(form.elements.freight_usd.value || 0)).toFixed(2));
  document.querySelectorAll('[data-order-item-row]').forEach(row => {
    const updateLineTotal = () => {
      const quantity = Number(row.querySelector('[data-item-quantity]').value || 0);
      const unitPrice = Number(row.querySelector('[data-item-price]').value || 0);
      row.querySelector('[data-item-total]').textContent = money(quantity * unitPrice);
    };
    row.querySelector('[data-item-quantity]').addEventListener('input', updateLineTotal);
    row.querySelector('[data-item-price]').addEventListener('input', updateLineTotal);
  });
  initializeShipmentPackingEditor();
  initializeSfFreightCalculator();
  document.querySelector('#saveOrderItems').addEventListener('click', () => saveOrderItems(true));
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
  if (nextStatus === 'paid') await refreshActiveOrder();
}

async function sendOrderEmail(eventType) {
  const status = document.querySelector('#saveStatus');
  status.textContent = 'Sending customer email...';
  const { error } = await invokeAdminFunction({ order_id: activeOrder.id, event_type: eventType });
  status.textContent = error ? `Status saved, but email was not sent: ${await functionErrorMessage(error)}` : 'Status saved and customer email sent.';
  return !error;
}

async function invokeAdminFunction(body) {
  return invokeSecureFunction('smooth-processor', body);
}

async function invokeMemberAdminFunction(body) {
  return invokeSecureFunction('admin-user-management', body);
}

async function invokeSecureFunction(functionName, body) {
  let { data: { session } } = await client.auth.getSession();
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now() + 60000)) {
    const refreshed = await client.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (!session?.access_token) return { data: null, error: new Error('Administrator session expired. Please sign in again.') };
  return client.functions.invoke(functionName, {
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
