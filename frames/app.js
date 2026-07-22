const catalog = document.getElementById('catalog');
const modal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');
const searchInput = document.getElementById('searchInput');
const seriesFilter = document.getElementById('seriesFilter');
const categoryFilter = document.getElementById('categoryFilter');
const heroPanel = document.getElementById('heroPanel');
const catalogColorGuide = document.querySelector('.catalog-color-guide');

const MODEL_WEAR_IMAGES = {
  '8601': 'assets/model-wear/classic-browline-8601.webp',
  '8602': 'assets/model-wear/classic-browline-8602.webp',
  '8603': 'assets/model-wear/classic-browline-8603.webp',
  '8701': 'assets/model-wear/modern-browline-8701.webp',
  '8223': 'assets/model-wear/ultem-ppsu-kids-8223.webp',
  '1082': 'assets/model-wear/super-engineered-1082.webp',
  '1201': 'assets/model-wear/lightweight-flex-1201.webp',
  '9518': 'assets/model-wear/kids-myopia-9518.webp',
  '9507': 'assets/model-wear/teen-ppsu-9507.webp',
  '8605': 'assets/model-wear/classic-browline-8605.webp',
  '8225': 'assets/model-wear/ultem-ppsu-kids-8225.webp',
  '1083': 'assets/model-wear/super-engineered-1083.webp',
  '1202': 'assets/model-wear/lightweight-flex-1202.webp',
  '9519': 'assets/model-wear/kids-myopia-9519.webp',
  '9508': 'assets/model-wear/teen-ppsu-9508.webp',
  '8226': 'assets/model-wear/ultem-ppsu-kids-8226.webp',
  '8606': 'assets/model-wear/classic-browline-8606.webp',
  '8703': 'assets/model-wear/modern-browline-8703.webp',
  '1085': 'assets/model-wear/super-engineered-1085.webp',
  '8607': 'assets/model-wear/classic-browline-8607.webp',
  '8705': 'assets/model-wear/modern-browline-8705.webp',
  '8227': 'assets/model-wear/ultem-ppsu-kids-8227.webp',
  '1086': 'assets/model-wear/super-engineered-1086.webp',
  '1203': 'assets/model-wear/lightweight-flex-1203.webp',
  '9520': 'assets/model-wear/kids-myopia-9520.webp',
  '9509': 'assets/model-wear/teen-ppsu-9509.webp',
  '8608': 'assets/model-wear/classic-browline-8608.webp',
  '8706': 'assets/model-wear/modern-browline-8706.webp',
  '8228': 'assets/model-wear/ultem-ppsu-kids-8228.webp',
  '1087': 'assets/model-wear/super-engineered-1087.webp',
  '1205': 'assets/model-wear/lightweight-flex-1205.webp',
  '9521': 'assets/model-wear/kids-myopia-9521.webp',
  '9510': 'assets/model-wear/teen-ppsu-9510.webp',
  '8609': 'assets/model-wear/classic-browline-8609.webp',
  '8707': 'assets/model-wear/modern-browline-8707.webp',
  '8708': 'assets/model-wear/modern-browline-8708.webp',
  '8229': 'assets/model-wear/ultem-ppsu-kids-8229.webp',
  '8230': 'assets/model-wear/ultem-ppsu-kids-8230.webp',
  '1088': 'assets/model-wear/super-engineered-1088.webp',
  '1207': 'assets/model-wear/lightweight-flex-1207.webp',
  '9522': 'assets/model-wear/kids-myopia-9522.webp',
  '8610': 'assets/model-wear/classic-browline-8610.webp',
  '8702': 'assets/model-wear/modern-browline-8702.webp',
  '8611': 'assets/model-wear/classic-browline-8611.webp',
  '8612': 'assets/model-wear/classic-browline-8612.webp',
  '8709': 'assets/model-wear/modern-browline-8709.webp',
  '8710': 'assets/model-wear/modern-browline-8710.webp',
  '8712': 'assets/model-wear/modern-browline-8712.webp',
  '8713': 'assets/model-wear/modern-browline-8713.webp',
  '8231': 'assets/model-wear/ultem-ppsu-kids-8231.webp',
  '9523': 'assets/model-wear/kids-myopia-9523.webp',
  '9525': 'assets/model-wear/kids-myopia-9525.webp',
  '9526': 'assets/model-wear/kids-myopia-9526.webp',
  '9527': 'assets/model-wear/kids-myopia-9527.webp',
  '1089': 'assets/model-wear/super-engineered-1089.webp',
  '1090': 'assets/model-wear/super-engineered-1090.webp',
  '1052': 'assets/model-wear/super-engineered-1052.webp',
  '1063': 'assets/model-wear/super-engineered-1063.webp',
  '1069': 'assets/model-wear/super-engineered-1069.webp',
  '1070': 'assets/model-wear/super-engineered-1070.webp',
  '1206': 'assets/model-wear/lightweight-flex-1206.webp',
  '1208': 'assets/model-wear/lightweight-flex-1208.webp',
  '1209': 'assets/model-wear/lightweight-flex-1209.webp',
  '9511': 'assets/model-wear/teen-ppsu-9511.webp',
  '9512': 'assets/model-wear/teen-ppsu-9512.webp',
  '9513': 'assets/model-wear/teen-ppsu-9513.webp',
  '9515': 'assets/model-wear/teen-ppsu-9515.webp',
  '9528': 'assets/model-wear/kids-myopia-9528.webp',
  '9529': 'assets/model-wear/kids-myopia-9529.webp',
  '9530': 'assets/model-wear/kids-myopia-9530.webp',
  '9531': 'assets/model-wear/kids-myopia-9531.webp',
  '9532': 'assets/model-wear/kids-myopia-9532.webp',
  '1062': 'assets/model-wear/super-engineered-1062.webp',
  '1066': 'assets/model-wear/super-engineered-1066.webp',
  '1068': 'assets/model-wear/super-engineered-1068.webp',
  '1071': 'assets/model-wear/super-engineered-1071.webp',
  '1210': 'assets/model-wear/lightweight-flex-1210.webp',
  '1072': 'assets/model-wear/super-engineered-1072.webp',
  '1073': 'assets/model-wear/super-engineered-1073.webp',
  '1075': 'assets/model-wear/super-engineered-1075.webp',
  '1076': 'assets/model-wear/super-engineered-1076.webp',
  '1077': 'assets/model-wear/super-engineered-1077.webp',
  '1078': 'assets/model-wear/super-engineered-1078.webp',
  '1211': 'assets/model-wear/lightweight-flex-1211.webp',
  '1212': 'assets/model-wear/lightweight-flex-1212.webp',
  '1213': 'assets/model-wear/lightweight-flex-1213.webp',
  '1215': 'assets/model-wear/lightweight-flex-1215.webp',
  '1079': 'assets/model-wear/super-engineered-1079.webp',
  '1080': 'assets/model-wear/super-engineered-1080.webp',
  '1081': 'assets/model-wear/super-engineered-1081.webp',
  '1216': 'assets/model-wear/lightweight-flex-1216.webp',
  '1217': 'assets/model-wear/lightweight-flex-1217.webp',
  '1218': 'assets/model-wear/lightweight-flex-1218.webp',
  '1219': 'assets/model-wear/lightweight-flex-1219.webp',
  '1220': 'assets/model-wear/lightweight-flex-1220.webp',
  '1221': 'assets/model-wear/lightweight-flex-1221.webp',
  '1222': 'assets/model-wear/lightweight-flex-1222.webp',
  '1223': 'assets/model-wear/lightweight-flex-1223.webp',
  '1225': 'assets/model-wear/lightweight-flex-1225.webp',
  '1226': 'assets/model-wear/lightweight-flex-1226.webp',
  '1227': 'assets/model-wear/lightweight-flex-1227.webp',
  '1228': 'assets/model-wear/lightweight-flex-1228.webp',
  '1229': 'assets/model-wear/lightweight-flex-1229.webp',
  '9516': 'assets/model-wear/teen-ppsu-9516.webp',
  '9517': 'assets/model-wear/teen-ppsu-9517.webp'
};
const MODEL_WEAR_COLOR_INDEX = {
  '8601': 0, '8602': 1, '8603': 2,
  '8701': 0, '8223': 0,
  '1082': 1, '1201': 2, '9518': 2, '9507': 1,
  '8605': 3, '8225': 1, '1083': 2, '1202': 3, '9519': 3,
  '9508': 2, '8226': 2, '8606': 4, '8703': 2, '1085': 3,
  '8607': 0, '8705': 1, '8227': 2, '1086': 3, '1203': 4,
  '9520': 5, '9509': 3, '8608': 2, '8706': 3, '8228': 4,
  '1087': 4, '1205': 5, '9521': 0, '9510': 1, '8609': 4,
  '8707': 0, '8708': 0, '8229': 4, '8230': 3, '1088': 5,
  '1207': 1, '9522': 2, '8610': 0, '8702': 0,
  '8611': 1, '8612': 2, '8709': 1, '8710': 2, '8712': 3,
  '8713': 4, '8231': 4, '9523': 3, '9525': 4, '9526': 5,
  '9527': 0, '1089': 0, '1090': 1, '1052': 2,
  '1063': 4, '1069': 1, '1070': 2, '1206': 2,
  '1208': 3, '1209': 4, '9511': 2, '9512': 3, '9513': 4,
  '9515': 5,
  '9528': 1, '9529': 2, '9530': 3, '9531': 4, '9532': 5,
  '1062': 3, '1066': 5, '1068': 1, '1071': 3, '1210': 5,
  '1072': 2, '1073': 3, '1075': 4, '1076': 4, '1077': 2,
  '1078': 5, '1211': 0, '1212': 1, '1213': 4, '1215': 3,
  '1079': 3, '1080': 4, '1081': 2, '1216': 2, '1217': 3,
  '1218': 1, '1219': 3, '1220': 4, '1221': 5, '1222': 7,
  '1223': 4, '1225': 4, '1226': 2, '1227': 4, '1228': 2,
  '1229': 4, '9516': 4, '9517': 2
};

const SERIES_DESCRIPTIONS = {
  '86': 'Semi-titanium browline frames with refined metal construction for stable, professional everyday wear.',
  '87': 'Modern titanium and TR browline frames with spring-hinge comfort and a light, balanced fit.',
  'ULTEM-TITANIUM': 'Engineered ULTEM construction combines low weight, flexibility, and a clean modern profile.',
  'LIGHT-ULTEM': 'Designed for low weight, flexibility, and reduced side pressure with a clean full-rim profile.',
  'ULTEM-PPSU': 'Flexible ULTEM-PPSU construction supports comfortable, secure everyday wear for children.',
  'KIDS-CONTROL': 'Adjustable temple tips and nose pads support a secure, comfortable fit as children grow.',
  'TEEN-PPSU': 'Skin-friendly temple sleeves and soft silicone nose pads provide comfortable support for teenagers.'
};

const KIDS_SERIES = new Set(['ULTEM-PPSU', 'KIDS-CONTROL', 'TEEN-PPSU']);
const representativeModels = new Map();
let activeSeriesCode = null;

function allProducts(){ return PRODUCT_SERIES.flatMap(s => s.items.map(p => ({...p, seriesName:s.name, seriesSubtitle:s.subtitle}))); }
function esc(s){ return String(s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function colorOption(p, index){
  const color = p.colors[index];
  const code = `C${String(index + 1).padStart(2, '0')}`;
  return { model:`${p.model}-${code}`, label:`${code} · ${color.en}`, priceUsd:unitPrice(p), image:color.src };
}
const detailCartSelections = new Map();
let lastAddedSelectionKey = '';

function rememberFrameSelection(p, option){
  const key = option.model;
  const entry = detailCartSelections.get(key) || {
    key,
    model:p.model,
    productTitle:p.productTitle,
    optionLabel:option.label,
    image:option.image,
    quantity:0
  };
  entry.quantity += 1;
  detailCartSelections.delete(key);
  detailCartSelections.set(key, entry);
  lastAddedSelectionKey = key;
  renderDetailCartList(p.model);
}

function renderDetailCartList(model){
  const container = document.querySelector('#detailCartList');
  if(!container) return;
  const detailModel = model || container.dataset.detailModel;
  const entries = [...detailCartSelections.values()].filter(item => item.model === detailModel).reverse();
  if(!entries.length){
    container.hidden = true;
    container.innerHTML = '';
    return;
  }
  const total = entries.reduce((sum, item) => sum + item.quantity, 0);
  container.hidden = false;
  container.innerHTML = `<div class="detail-cart-summary-head"><div><p class="eyebrow">Current model</p><h4>Selected Colors</h4></div><strong>${total} ${total === 1 ? 'item' : 'items'}</strong></div><div class="detail-cart-items">${entries.map(item => `<div class="detail-cart-item${item.key === lastAddedSelectionKey ? ' just-added' : ''}"><img src="${esc(item.image)}" alt=""><div><b>Model ${esc(item.model)} · ${esc(item.optionLabel)}</b><span>${esc(item.productTitle)}</span></div><strong>Qty ${item.quantity}</strong></div>`).join('')}</div>`;
}
function animateColorToCart(trigger){
  const sourceImage = trigger?.querySelector('img') || trigger?.closest('.card')?.querySelector('.card-img img');
  if(!sourceImage) return;
  const cartButton = document.querySelector('#cartButton');
  const cartRect = cartButton?.getBoundingClientRect();
  const targetSize = 72;
  const targetLeft = Math.max(10, Math.min(window.innerWidth - targetSize - 10, cartRect ? cartRect.left + cartRect.width / 2 - targetSize / 2 : window.innerWidth - targetSize - 18));
  const targetTop = Math.max(10, Math.min(window.innerHeight - targetSize - 10, cartRect ? cartRect.top + cartRect.height / 2 - targetSize / 2 : 18));
  let target = document.querySelector('.cart-flight-target');
  if(!target){
    target = document.createElement('div');
    target.className = 'cart-flight-target';
    target.setAttribute('aria-hidden', 'true');
    target.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 4h2l1.5 8.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 1.9-1.4L20 7H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg><b>Cart</b>`;
    document.body.appendChild(target);
  }
  clearTimeout(target._hideTimer);
  target.style.left = `${targetLeft}px`;
  target.style.top = `${targetTop}px`;
  target.querySelector('b').textContent = 'Cart';
  target.classList.remove('arrived');
  target.classList.add('active');
  const finish = () => {
    target.classList.add('arrived');
    target.querySelector('b').textContent = 'Added';
    target._hideTimer = setTimeout(() => target.classList.remove('active', 'arrived'), 900);
  };
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ finish(); return; }
  const sourceRect = sourceImage.getBoundingClientRect();
  const flyerWidth = Math.max(72, Math.min(130, sourceRect.width));
  const flyerHeight = Math.max(54, Math.min(100, sourceRect.height));
  const startLeft = sourceRect.left + (sourceRect.width - flyerWidth) / 2;
  const startTop = sourceRect.top + (sourceRect.height - flyerHeight) / 2;
  const flyer = document.createElement('div');
  flyer.className = 'cart-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.style.cssText = `left:${startLeft}px;top:${startTop}px;width:${flyerWidth}px;height:${flyerHeight}px`;
  const image = document.createElement('img');
  image.src = sourceImage.currentSrc || sourceImage.src;
  image.alt = '';
  flyer.appendChild(image);
  document.body.appendChild(flyer);
  const deltaX = targetLeft + targetSize / 2 - (startLeft + flyerWidth / 2);
  const deltaY = targetTop + targetSize / 2 - (startTop + flyerHeight / 2);
  const complete = () => { flyer.remove(); finish(); };
  if(!flyer.animate){ complete(); return; }
  const animation = flyer.animate([
    { transform:'translate(0,0) scale(1)', opacity:1 },
    { transform:`translate(${deltaX * .45}px,${deltaY * .38 - 70}px) scale(.78) rotate(-4deg)`, opacity:1, offset:.55 },
    { transform:`translate(${deltaX}px,${deltaY}px) scale(.18) rotate(8deg)`, opacity:.08 }
  ], { duration:800, easing:'cubic-bezier(.2,.8,.25,1)', fill:'forwards' });
  animation.onfinish = complete;
  animation.oncancel = complete;
}
function addFrameToCart(p, index, trigger){
  const option = colorOption(p, index);
  window.dispatchEvent(new CustomEvent('lzn:add-cart', { detail:{ model:p.model, option } }));
  rememberFrameSelection(p, option);
  animateColorToCart(trigger);
}

function setUrlState(model, color, { push=false }={}){
  const url = new URL(window.location.href);
  if(model) url.searchParams.set('model', model);
  else url.searchParams.delete('model');
  if(color) url.searchParams.set('color', color);
  else url.searchParams.delete('color');
  const nextState = push ? { ...(history.state || {}), lznFrameProduct:true } : history.state;
  history[push ? 'pushState' : 'replaceState'](nextState, '', url.pathname + url.search + url.hash);
}
function getUrlState(){
  const url = new URL(window.location.href);
  return { model: url.searchParams.get('model'), color: url.searchParams.get('color') };
}
function leaveProductUrl(){
  if(!getUrlState().model) return;
  if(history.state?.lznFrameProduct) history.back();
  else setUrlState(null, null);
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let lastModalTrigger = null;

function focusableElements(container){
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
}
function trapDialogFocus(container, event){
  if(event.key !== 'Tab') return;
  const focusable = focusableElements(container);
  if(!focusable.length){ event.preventDefault(); return; }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if(event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))){
    event.preventDefault(); last.focus();
  }else if(!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))){
    event.preventDefault(); first.focus();
  }
}
function setPageInert(isInert){
  [document.querySelector('.site-header'), document.querySelector('main')].forEach(el => { if(el) el.inert = isInert; });
}
function activeImageViewer(){ return document.querySelector('.image-viewer.active'); }
function closeImageViewer(restoreFocus=true, clearColor=true){
  const viewer = activeImageViewer();
  if(!viewer) return false;
  const trigger = viewer._trigger;
  viewer.remove();
  modal.inert = false;
  const productModalOpen = modal.classList.contains('active');
  setPageInert(productModalOpen);
  if(!productModalOpen) document.body.style.overflow = '';
  if(clearColor && getUrlState().color) setUrlState(getUrlState().model, null);
  if(restoreFocus && trigger?.isConnected) trigger.focus();
  return true;
}
function openImageViewer({ title, content, className='', trigger=document.activeElement }){
  closeImageViewer(false, false);
  const viewer = document.createElement('div');
  const titleId = `imageViewerTitle-${Date.now()}`;
  viewer.className = `color-viewer image-viewer active ${className}`.trim();
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-labelledby', titleId);
  viewer._trigger = trigger instanceof HTMLElement && trigger !== document.body ? trigger : null;
  viewer.innerHTML = `<div class="color-viewer-backdrop" data-viewer-close></div><div class="color-viewer-card"><button class="close viewer-close" type="button" data-viewer-close aria-label="Close image viewer">×</button><h2 class="image-viewer-title" id="${titleId}">${esc(title)}</h2>${content}</div>`;
  document.body.appendChild(viewer);
  modal.inert = true;
  setPageInert(true);
  document.body.style.overflow = 'hidden';
  viewer.querySelectorAll('[data-viewer-close]').forEach(el => el.addEventListener('click', () => closeImageViewer()));
  requestAnimationFrame(() => viewer.querySelector('.viewer-close')?.focus());
}

function seriesCategory(series){ return KIDS_SERIES.has(series.code) ? 'kids' : 'adult'; }
function orderedSeries(){ return [...PRODUCT_SERIES].sort((a,b) => Number(KIDS_SERIES.has(a.code)) - Number(KIDS_SERIES.has(b.code))); }

function seriesRepresentative(series){
  if(representativeModels.has(series.code)) return representativeModels.get(series.code);
  const portraitItems = series.items.filter(product => MODEL_WEAR_IMAGES[product.model]);
  const pool = portraitItems.length ? portraitItems : series.items;
  const product = pool[Math.floor(Math.random() * pool.length)];
  representativeModels.set(series.code, product);
  return product;
}

function seriesEntryCard(series){
  const product = seriesRepresentative(series);
  if(!product) return '';
  const wearImage = MODEL_WEAR_IMAGES[product.model];
  const colorIndex = MODEL_WEAR_COLOR_INDEX[product.model] ?? 0;
  const color = product.colors?.[colorIndex] || product.colors?.[0];
  const colorCode = `C${String((color ? colorIndex : 0) + 1).padStart(2, '0')}`;
  const image = wearImage || color?.src || product.title;
  return `<button class="series-entry-card" id="series-${esc(series.code)}" type="button" data-series-entry="${esc(series.code)}" aria-label="View ${esc(series.name)}">
    <span class="series-entry-image${wearImage ? ' model-wear' : ''}"><img src="${esc(image)}" alt="Model ${esc(product.model)} representing ${esc(series.name)}" loading="lazy" decoding="async" fetchpriority="low"><span class="series-entry-model"><b>Model ${esc(product.model)}</b>${color ? `<small>${colorCode} · ${esc(color.en)}</small>` : ''}</span></span>
    <span class="series-entry-copy"><span class="eyebrow">${esc(series.subtitle)}</span><strong>${esc(series.name)}</strong><span class="series-entry-description">${esc(SERIES_DESCRIPTIONS[series.code] || series.subtitle)}</span><span class="series-entry-meta"><b>${series.items.length} Models</b><span>View series <span aria-hidden="true">→</span></span></span></span>
  </button>`;
}

function seriesSection(series, items, { showCategory=false }={}){
  const category = seriesCategory(series);
  const categoryHeading = showCategory
    ? `<div class="category-head"><p class="eyebrow">Product Category</p><h2>${category === 'kids' ? 'Kids Frames · 유아용' : 'Adult Frames · 성인용'}</h2></div>` : '';
  return `${categoryHeading}<section class="series" id="series-${esc(series.code)}">
    <div class="series-head">
      <div class="series-summary"><p class="eyebrow">${esc(series.subtitle)}</p><div class="series-title-row"><h2>${esc(series.name)}</h2><p>${esc(SERIES_DESCRIPTIONS[series.code] || series.subtitle)}</p></div></div>
      <div class="count">${items.length} Models</div>
    </div>
    <div class="grid">${items.map((p,index) => frameModelCard(p, series.name, index)).join('')}</div>
  </section>`;
}

function renderSeriesLanding(cf){
  const visibleSeries = orderedSeries().filter(series => cf === 'all' || seriesCategory(series) === cf);
  const groups = ['adult', 'kids'].map(category => {
    const series = visibleSeries.filter(item => seriesCategory(item) === category);
    if(!series.length) return '';
    return `<section class="series-index-group"><div class="series-index-heading"><p class="eyebrow">Product Category</p><h2>${category === 'kids' ? 'Kids Frames · 유아용' : 'Adult Frames · 성인용'}</h2></div><div class="series-entry-grid">${series.map(seriesEntryCard).join('')}</div></section>`;
  }).join('');
  return `<div class="series-landing"><div class="series-landing-head"><div><p class="eyebrow">Browse by series</p><h2>Choose a frame series</h2></div><p>One representative model is shown for each series. Select a series to view all of its models and colors.</p></div>${groups}</div>`;
}

function bindCatalogInteractions(){
  document.querySelectorAll('[data-series-entry]').forEach(button => button.addEventListener('click', () => selectSeries(button.dataset.seriesEntry)));
  document.querySelectorAll('[data-all-series]').forEach(button => button.addEventListener('click', () => showAllSeries()));
  document.querySelectorAll('.card[data-model]').forEach(el => {
    el.addEventListener('click', e => { if(!e.target.closest('button, a, input, select')) openProduct(el.dataset.model, el); });
  });
  document.querySelectorAll('[data-open-model]').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      openProduct(button.dataset.openModel, button);
    });
  });
  document.querySelectorAll('[data-diagram-front]').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      openDiagramViewer(button.dataset.diagramModel, button.dataset.diagramFront, button.dataset.diagramSide, button);
    });
  });
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const previewColor = button => {
    const card = button.closest('.card');
    const image = card?.querySelector('.card-img img');
    if(image){
      image.src = button.dataset.colorSrc;
      image.closest('.card-img')?.classList.remove('model-wear');
      image.closest('.card-img')?.classList.add('previewing-color');
    }
  };
  document.querySelectorAll('[data-card-add]').forEach(button => {
    button.addEventListener('mouseenter', () => { if(canHover) previewColor(button); });
    button.addEventListener('focus', () => previewColor(button));
    button.addEventListener('click', e => {
      e.stopPropagation();
      const card = button.closest('.card');
      if(!canHover && card?.dataset.previewColor !== button.dataset.colorIndex){
        previewColor(button);
        card.dataset.previewColor = button.dataset.colorIndex;
        return;
      }
      const p = allProducts().find(item => item.model === button.dataset.cardAdd);
      if(p) addFrameToCart(p, Number(button.dataset.colorIndex), button);
    });
  });
  document.querySelectorAll('.card').forEach(card => card.addEventListener('mouseleave', () => {
    if(!canHover) return;
    const image = card.querySelector('.card-img img');
    if(image){
      image.src = image.dataset.defaultSrc;
      image.closest('.card-img')?.classList.remove('previewing-color');
      if(card.dataset.hasWear === 'true') image.closest('.card-img')?.classList.add('model-wear');
    }
  }));
}

function render(){
  const q = searchInput.value.trim().toLowerCase();
  const cf = categoryFilter.value;
  const series = orderedSeries();
  const isLanding = !q && !activeSeriesCode;
  catalogColorGuide.hidden = isLanding;

  if(isLanding){
    catalog.innerHTML = renderSeriesLanding(cf);
    bindCatalogInteractions();
    return;
  }

  const backButton = `<button class="all-series-button" type="button" data-all-series><span aria-hidden="true">←</span> All Series</button>`;
  if(q){
    let previousCategory = '';
    const results = series.map(item => {
      const category = seriesCategory(item);
      const items = item.items.filter(product => {
        const searchable = [product.model, product.productTitle, item.name, ...(product.colors || []).flatMap(color => [color.en, color.ko])].join(' ').toLowerCase();
        return searchable.includes(q) && (cf === 'all' || cf === category);
      }).sort((a,b) => Number(a.model) - Number(b.model));
      if(!items.length) return '';
      const showCategory = category !== previousCategory;
      previousCategory = category;
      return seriesSection(item, items, { showCategory });
    }).join('');
    catalog.innerHTML = `<div class="catalog-view-head">${backButton}<div><p class="eyebrow">Search results</p><h2>Results for “${esc(searchInput.value.trim())}”</h2></div></div>${results || '<div class="catalog-empty"><h2>No matching models</h2><p>Try another model number, series, or color.</p></div>'}`;
  }else{
    const selected = series.find(item => item.code === activeSeriesCode);
    if(!selected){ activeSeriesCode = null; seriesFilter.value = 'all'; catalog.innerHTML = renderSeriesLanding(cf); catalogColorGuide.hidden = true; }
    else{
      const items = [...selected.items].sort((a,b) => Number(a.model) - Number(b.model));
      catalog.innerHTML = `<div class="catalog-view-head">${backButton}<div><p class="eyebrow">Selected series</p><h2>${esc(selected.name)}</h2></div></div>${seriesSection(selected, items)}`;
    }
  }
  bindCatalogInteractions();
}

function updateSeriesHash(code){
  const url = new URL(window.location.href);
  url.hash = code ? `series-${code}` : '';
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function selectSeries(code, { updateHash=true, scroll=true }={}){
  if(!PRODUCT_SERIES.some(series => series.code === code)) return;
  activeSeriesCode = code;
  seriesFilter.value = code;
  searchInput.value = '';
  categoryFilter.value = 'all';
  if(updateHash) updateSeriesHash(code);
  render();
  if(scroll) requestAnimationFrame(() => catalog.querySelector('.catalog-view-head')?.scrollIntoView({ behavior:'smooth', block:'start' }));
}

function showAllSeries({ updateHash=true, scroll=true }={}){
  activeSeriesCode = null;
  seriesFilter.value = 'all';
  searchInput.value = '';
  if(updateHash) updateSeriesHash('');
  render();
  if(scroll) requestAnimationFrame(() => catalog.scrollIntoView({ behavior:'smooth', block:'start' }));
}

function seriesCodeFromTarget(target){
  if(!target?.startsWith('#series-')) return '';
  const code = target.slice('#series-'.length);
  return PRODUCT_SERIES.some(series => series.code === code) ? code : '';
}

function unitPrice(p){ return ['86','87'].includes(p.series) ? 10 : 7; }
function priceLabel(p){ return `$${unitPrice(p).toFixed(2)} / frame`; }

function frameModelCard(p, seriesName, index){
  const cardChoices = p.colors || [];
  const selectedIndex = cardChoices.length ? index % cardChoices.length : 0;
  const selectedColor = cardChoices[selectedIndex];
  const selectedCode = `C${String(selectedIndex + 1).padStart(2,'0')}`;
  const wearImage = MODEL_WEAR_IMAGES[p.model];
  const wearColorIndex = MODEL_WEAR_COLOR_INDEX[p.model] ?? selectedIndex;
  const wornColor = cardChoices[wearColorIndex];
  const wornCode = `C${String(wearColorIndex + 1).padStart(2,'0')}`;
  const cardImage = wearImage || (selectedColor ? selectedColor.src : p.title);
  const frameDiagram = p.frontImage || p.sub3 || p.title || cardChoices[0]?.src;
  const isBrowlineDiagram = ['86','87'].includes(p.series) && Boolean(p.sub3);
  const sideDetailDiagram = isBrowlineDiagram ? p.sub1 : '';
  const diagramMarkup = frameDiagram ? (sideDetailDiagram
    ? `<button class="card-frame-diagrams" type="button" data-diagram-model="${p.model}" data-diagram-front="${esc(frameDiagram)}" data-diagram-side="${esc(sideDetailDiagram)}" aria-label="Enlarge front shape and side ornament of model ${p.model}"><span class="card-frame-diagram browline-front-diagram"><img src="${esc(frameDiagram)}" alt="Front shape of model ${p.model}" loading="lazy" decoding="async"></span><span class="card-frame-diagram browline-side-diagram"><img src="${esc(sideDetailDiagram)}" alt="Side ornament detail of model ${p.model}" loading="lazy" decoding="async"></span></button>`
    : `<span class="card-frame-diagram${isBrowlineDiagram ? ' browline-diagram' : ''}"><img src="${esc(frameDiagram)}" alt="Front shape of model ${p.model}" loading="lazy" decoding="async"></span>`)
    : '';
  const colorChips = cardChoices.map((color,colorIndex) => {
    const code=`C${String(colorIndex+1).padStart(2,'0')}`;
    return `<button class="chip color-cart-button${colorIndex===(wearImage ? wearColorIndex : selectedIndex) ? ' selected-chip' : ''}" type="button" data-card-add="${p.model}" data-color-index="${colorIndex}" data-color-src="${esc(color.src)}" aria-label="Preview and add model ${p.model}, ${code} ${esc(color.en)}"><span>${code}</span>${esc(color.en)}</button>`;
  }).join('');
  return `<article class="card" data-model="${p.model}" data-has-wear="${wearImage ? 'true' : 'false'}" aria-labelledby="model-${p.model}">
    <div class="card-img${wearImage ? ' model-wear' : ''}"><img src="${esc(cardImage)}" data-default-src="${esc(cardImage)}" alt="Model ${p.model}" loading="lazy" decoding="async" fetchpriority="low">${wearImage && wornColor ? `<span class="worn-color-badge"><b>${wornCode}</b>${esc(wornColor.en)}</span>` : ''}</div>
    <div class="card-body"><div class="card-kicker">${esc(seriesName)}</div><div class="card-model-row${sideDetailDiagram ? ' with-browline-details' : ''}"><h3 id="model-${p.model}">${p.model}</h3>${diagramMarkup}</div><p class="card-title">${esc(p.productTitle)}</p><div class="card-action-row"><div class="card-price">${priceLabel(p)}</div><button class="card-detail-button" type="button" data-open-model="${p.model}" aria-label="View details for model ${p.model}"><span aria-hidden="true">→</span></button></div><div class="chips color-cart-buttons">${colorChips}</div></div>
  </article>`;
}

function sizeSpecTable(p){
  if(!p.specs) return '';
  const rows = [
    ['Size Code', p.sizeCode],
    ['Frame Width', p.specs.frameWidth],
    ['Lens Width', p.specs.lensWidth],
    ['Lens Height', p.specs.lensHeight],
    ['Bridge', p.specs.bridge],
    ['Temple Length', p.specs.templeLength],
    ['Weight', p.specs.weight]
  ];
  return `<div class="spec-table size-only">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
}

function generalSpecTable(p){
  const rows = [
    ['Material', p.material],
    ['Frame Type', p.frameType],
    ['Gender', p.gender],
    ['Origin', p.origin]
  ];
  return `<div class="spec-table general-only">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
}


function openProduct(model, trigger=document.activeElement, { updateHistory=true }={}){
  const p = allProducts().find(x => x.model === model);
  if(!p) return;
  lastModalTrigger = trigger instanceof HTMLElement && trigger !== document.body ? trigger : null;
  if(updateHistory && getUrlState().model !== p.model) setUrlState(p.model, null, { push:true });
  else if(getUrlState().model !== p.model || getUrlState().color) setUrlState(p.model, null);
  modalContent.innerHTML = `<div class="detail series-${esc(p.series)}">
    <section class="detail-head">
      <div class="detail-copy"><p class="eyebrow">${esc(p.seriesName)}</p><h2 id="productModalTitle">Model ${esc(p.model)}</h2><h3>${esc(p.productTitle)}</h3><div class="detail-price">${priceLabel(p)}</div><p class="order-note">Minimum shipment value: $100. Shipping, duties, and taxes are calculated separately.</p><p>${esc(p.short)}</p><p>${esc(p.description)}</p></div>
      <div class="detail-img"><img src="${esc(p.title)}" alt="Model ${esc(p.model)} main image"></div>
    </section>
    <section class="feature-grid hinge-grid">
      ${p.sub1 ? `<div class="feature"><h4>Outer Hinge Detail</h4><p>Exterior hinge construction engineered for durability and stable fitting.</p><img src="${esc(p.sub1)}" alt="Model ${esc(p.model)} outer hinge detail" loading="lazy" decoding="async"></div>` : ''}
      ${p.sub2 ? `<div class="feature"><h4>Inner Hinge Detail</h4><p>Internal hinge finishing designed for a clean fit and smooth wearing comfort.</p><img src="${esc(p.sub2)}" alt="Model ${esc(p.model)} inner hinge detail" loading="lazy" decoding="async"></div>` : ''}
    </section>
    <section class="spec size-section${p.frontImage || p.sub3 ? '' : ' no-image'}">${p.frontImage || p.sub3 ? `<div class="size-image"><img src="${esc(p.frontImage || p.sub3)}" alt="Model ${esc(p.model)} front view" loading="lazy" decoding="async"></div>` : ''}<div class="size-data"><h4>Size Specification</h4>${sizeSpecTable(p)}<p class="note">Measurements may vary slightly depending on the measuring method.</p></div></section>
    <section class="spec general-section"><h4>Product Information</h4>${generalSpecTable(p)}</section>
    <section class="colors"><h4>Available Colors</h4><p class="note">Click a color to add it to your cart.</p><div class="color-grid">${p.colors.map((c,index) => { const colorCode=`C${String(index+1).padStart(2,'0')}`; return `<button class="color-card" type="button" data-color-index="${index}" aria-label="Add model ${esc(p.model)}, ${colorCode} ${esc(c.en)} to cart"><img src="${esc(c.src)}" alt="${esc(p.model)} ${colorCode} ${esc(c.en)}" loading="lazy" decoding="async"><strong>${colorCode} · ${esc(c.en)}</strong><span>${esc(c.ko)}</span></button>`; }).join('')}</div></section>
    <section class="detail-cart-summary" id="detailCartList" data-detail-model="${esc(p.model)}" hidden aria-live="polite"></section>
  </div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); modal.setAttribute('aria-labelledby','productModalTitle'); document.body.style.overflow='hidden'; setPageInert(true);
  const preloadColors = () => p.colors.forEach(color => { const image = new Image(); image.decoding = 'async'; image.src = color.src; });
  if ('requestIdleCallback' in window) requestIdleCallback(preloadColors, { timeout: 800 }); else setTimeout(preloadColors, 100);
  renderDetailCartList(p.model);
  requestAnimationFrame(() => modal.querySelector('.close[data-close]')?.focus());
}
function openColorViewer(src, model, name, ko, key, code, series, trigger=document.activeElement){
  setUrlState(model, key);
  openImageViewer({
    title:`Model ${model} · ${code || ''} ${name || ''}`.trim(),
    className:`series-${series || ''}`,
    trigger,
    content:`<img src="${esc(src)}" alt="Model ${esc(model)} ${esc(code)} ${esc(name)}"><div class="color-viewer-caption"><strong>${esc(code)} · ${esc(name)}</strong><span>${esc(ko)}</span></div>`
  });
}
function openDiagramViewer(model, frontSrc, sideSrc, trigger=document.activeElement){
  openImageViewer({
    title:`Model ${model} frame details`,
    className:'diagram-viewer',
    trigger,
    content:`<div class="diagram-viewer-grid"><figure><img src="${esc(frontSrc)}" alt="Front shape of model ${esc(model)}"><figcaption>Front shape</figcaption></figure><figure><img src="${esc(sideSrc)}" alt="Side ornament detail of model ${esc(model)}"><figcaption>Side ornament</figcaption></figure></div>`
  });
}
function closeModal({ updateHistory=true }={}){
  closeImageViewer(false, false);
  modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); modal.removeAttribute('aria-labelledby'); modal.inert=false; document.body.style.overflow=''; setPageInert(false);
  if(lastModalTrigger?.isConnected) lastModalTrigger.focus();
  lastModalTrigger = null;
  if(updateHistory) leaveProductUrl();
}
modal.addEventListener('click', e => {
  if(e.target.dataset.close !== undefined){ closeModal(); return; }
  const colorButton = e.target.closest('[data-color-index]');
  if(!colorButton || !modal.contains(colorButton)) return;
  const model = modal.querySelector('#detailCartList')?.dataset.detailModel;
  const product = allProducts().find(item => item.model === model);
  if(product) addFrameToCart(product, Number(colorButton.dataset.colorIndex), colorButton);
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    if(closeImageViewer()) return;
    if(modal.classList.contains('active')) closeModal();
    return;
  }
  const viewer = activeImageViewer();
  if(viewer) trapDialogFocus(viewer, e);
  else if(modal.classList.contains('active')) trapDialogFocus(modal, e);
});
searchInput.addEventListener('input', () => {
  if(searchInput.value.trim()){
    activeSeriesCode = null;
    seriesFilter.value = 'all';
    updateSeriesHash('');
  }
  render();
});
seriesFilter.addEventListener('change', () => {
  if(seriesFilter.value === 'all') showAllSeries();
  else selectSeries(seriesFilter.value);
});
categoryFilter.addEventListener('change', () => {
  if(activeSeriesCode && categoryFilter.value !== 'all') activeSeriesCode = null;
  if(!activeSeriesCode) seriesFilter.value = 'all';
  render();
});
document.addEventListener('click', event => {
  const link = event.target.closest('[data-category-target^="#series-"], .hero-actions a[href^="#series-"]');
  const target = link?.dataset.categoryTarget || link?.getAttribute('href');
  const code = seriesCodeFromTarget(target);
  if(!code) return;
  event.preventDefault();
  selectSeries(code);
});
window.addEventListener('hashchange', () => {
  const code = seriesCodeFromTarget(window.location.hash);
  if(code && code !== activeSeriesCode) selectSeries(code, { updateHash:false });
  else if(!code && activeSeriesCode) showAllSeries({ updateHash:false });
});
window.addEventListener('popstate', () => {
  const { model, color } = getUrlState();
  const openModel = modal.querySelector('#detailCartList')?.dataset.detailModel;
  if(!model){
    if(modal.classList.contains('active')) closeModal({ updateHistory:false });
    return;
  }
  if(!modal.classList.contains('active') || openModel !== model) openProduct(model, document.activeElement, { updateHistory:false });
  if(!color){
    closeImageViewer(false, false);
    return;
  }
  const product = allProducts().find(item => item.model === model);
  const selectedColor = product?.colors.find(item => item.key === color);
  if(selectedColor && !activeImageViewer()) openColorViewer(selectedColor.src, product.model, selectedColor.en, selectedColor.ko, selectedColor.key);
});

function startRandomHero(){
  const products = allProducts();
  const slides = Object.entries(MODEL_WEAR_IMAGES).map(([model, src]) => {
    const product = products.find(item => item.model === model);
    const colorIndex = MODEL_WEAR_COLOR_INDEX[model] || 0;
    const color = product?.colors?.[colorIndex];
    return { model, src, code:`C${String(colorIndex + 1).padStart(2,'0')}`, color:color?.en || '' };
  });
  if(!slides.length) return;
  const shuffle = list => {
    const copy = [...list];
    for(let i=copy.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
    return copy;
  };
  let order = shuffle(slides);
  let position = 0;
  heroPanel.innerHTML = `<img class="hero-model-photo" alt=""><div class="hero-model-watermark"><b></b><span></span></div>`;
  const image = heroPanel.querySelector('.hero-model-photo');
  const watermark = heroPanel.querySelector('.hero-model-watermark');
  const show = (slide, immediate=false) => {
    const update = () => {
      image.src = slide.src;
      image.alt = `Model ${slide.model}, ${slide.code} ${slide.color}`;
      watermark.querySelector('b').textContent = `Model ${slide.model} · ${slide.code}`;
      watermark.querySelector('span').textContent = slide.color;
      heroPanel.classList.remove('switching');
    };
    if(immediate) update(); else { heroPanel.classList.add('switching'); setTimeout(update, 320); }
  };
  const preloadNext = () => { const upcoming=order[(position+1)%order.length]; if(upcoming){ const pre=new Image(); pre.src=upcoming.src; } };
  show(order[position], true);
  preloadNext();
  setInterval(() => {
    const previous = order[position];
    position += 1;
    if(position >= order.length){
      order = shuffle(slides);
      if(order.length > 1 && order[0].model === previous.model) [order[0],order[1]]=[order[1],order[0]];
      position = 0;
    }
    show(order[position]);
    preloadNext();
  }, 5000);
}
startRandomHero();
const initialSeries = seriesCodeFromTarget(window.location.hash);
if(initialSeries){ activeSeriesCode = initialSeries; seriesFilter.value = initialSeries; }
render();
const initial = getUrlState();
if(initial.model){
  openProduct(initial.model, document.activeElement, { updateHistory:false });
  if(initial.color){
    const p = allProducts().find(x => x.model === initial.model);
    const c = p?.colors.find(x => x.key === initial.color);
    if(c) setTimeout(() => openColorViewer(c.src, p.model, c.en, c.ko, c.key), 100);
  }
}
