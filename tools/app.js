const data = window.CATALOG_DATA || [];
const view = document.querySelector('#view');
const hero = document.querySelector('#heroVisual');
const modal = document.querySelector('#modal');
const modalBody = document.querySelector('#modalBody');
const esc = value => String(value || '').replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const all = data.flatMap(category => category.items.map(product => ({ ...product, categoryEn: category.en, desc: category.desc })));
const popularModels = new Set([
  'MC-S', 'LY-3AD', 'LY-3B-2', 'LY-T-27AT', 'LY-T-27C', 'LY-12AT',
  'LY-1800ADT', 'LY-400A', 'LY-988AT', 'LY-2GH', 'LY-918S', 'LY-6AST',
  'LY-6BT', 'LT828', 'PR888', 'LY-15B', 'DSA-50', 'GB-120T', 'JS-266',
  'TF-PS4', 'TF-P', 'LY-8N'
]);

function isPopular(product) {
  return popularModels.has(product.model);
}

function categoryCard(category) {
  const product = category.items[0];
  return `<a class="category-card" href="#/category/${category.id}">
    <div class="category-image"><img src="${esc(product.image)}" alt="${esc(category.en)}"></div>
    <div class="category-copy"><p>${category.items.length} Models</p><h3>${esc(category.en)}</h3><small>${esc(category.desc)}</small><b>View products →</b></div>
  </a>`;
}

function pdChoices(product) {
  if (product.pdMode !== 'select' || !product.pdOptions?.length) return [];
  const range = String(product.pdRange || `${product.pdOptions[0]}-${product.pdOptions.at(-1)} mm`).replace(/\s*mm$/i, '');
  const fullSetPrice = Number((Number(product.priceUsd || 0) * product.pdOptions.length).toFixed(2));
  return [
    { value: 'FULL_SET', label: `Full PD Set: ${range} mm (${product.pdOptions.length} pcs)`, priceUsd: fullSetPrice },
    ...product.pdOptions.map(value => ({ value: String(value), label: `Fixed PD: ${value} mm`, priceUsd: Number(product.priceUsd || 0) }))
  ];
}

function usd(value) {
  return Number(value).toFixed(Number(value) >= 100 ? 0 : 2);
}

function animateProductToCart(trigger) {
  const sourceImage = trigger?.closest('.product-card')?.querySelector('.product-card-image img') || modal.querySelector('#detailMainImage');
  if (!sourceImage) return;
  const cartButton = document.querySelector('#cartButton');
  const cartRect = cartButton?.getBoundingClientRect();
  const targetSize = 72;
  const targetLeft = Math.max(10, Math.min(innerWidth - targetSize - 10, cartRect ? cartRect.left + cartRect.width / 2 - targetSize / 2 : innerWidth - targetSize - 18));
  const targetTop = Math.max(10, Math.min(innerHeight - targetSize - 10, cartRect ? cartRect.top + cartRect.height / 2 - targetSize / 2 : 18));
  let target = document.querySelector('.cart-flight-target');
  if (!target) {
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
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
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
  if (!flyer.animate) { complete(); return; }
  const flight = flyer.animate([
    { transform:'translate(0,0) scale(1)', opacity:1 },
    { transform:`translate(${deltaX * .45}px,${deltaY * .38 - 70}px) scale(.78) rotate(-4deg)`, opacity:1, offset:.55 },
    { transform:`translate(${deltaX}px,${deltaY}px) scale(.18) rotate(8deg)`, opacity:.08 }
  ], { duration:800, easing:'cubic-bezier(.2,.8,.25,1)', fill:'forwards' });
  flight.onfinish = complete;
  flight.oncancel = complete;
}

function productCard(product) {
  const optionPicker = product.options ? `<label class="card-option-label">Configuration<select data-card-option>${product.options.map((option, index) => `<option value="${index}">${esc(option.model)} - ${esc(option.label)}</option>`).join('')}</select></label>` : '';
  const pdPicker = product.pdMode === 'select' ? `<label class="card-option-label">PD option<select data-card-pd>${pdChoices(product).map((choice, index) => `<option value="${index}">${esc(choice.label)} - USD ${usd(choice.priceUsd)}</option>`).join('')}</select></label>` : '';
  return `<article class="product-card" data-model="${esc(product.model)}" tabindex="0" role="button" aria-label="View ${esc(product.model)} details">
    <div class="product-card-image">${isPopular(product) ? '<span class="popular-badge" aria-label="Recommended model"><b>★</b><em>TOP<br>CHOICE</em></span>' : ''}<img src="${esc(product.image)}" alt="${esc(product.model)} ${esc(product.nameEn)}"></div>
    <p>${esc(product.categoryEn)}</p><h3>${esc(product.model)}</h3><strong>${esc(product.nameEn)}</strong>
    ${product.pdRange ? `<span class="option-badge">PD ${esc(product.pdRange)} · Select when ordering</span>` : ''}
    ${product.options ? `<span class="option-badge">${product.options.length} configurations available</span>` : ''}
    ${product.priceDisplay ? `<span class="card-price">${esc(product.priceDisplay)} <small>FOB China</small></span>` : '<span class="quote-price">Price on quotation</span>'}
    <div class="card-buy">${optionPicker}${pdPicker}<div class="card-add-row"><button type="button" class="card-add-button" data-card-add>Add to cart</button><label class="quantity-stepper" data-card-quantity-wrap hidden><input type="number" min="1" max="999" step="1" value="1" inputmode="numeric" data-card-quantity aria-label="Quantity"></label></div></div>
  </article>`;
}

function home() {
  view.innerHTML = `<section class="section" id="categories"><div class="section-head"><div><p class="eyebrow">Product Categories</p><h2>Choose a category.</h2><p>Browse our professional optical examination and lens-processing equipment.</p></div><span>${data.length} Categories</span></div><div class="category-grid">${data.map(categoryCard).join('')}</div></section>`;
  hero.innerHTML = data.slice(0, 4).map(category => `<img src="${esc(category.items[0].image)}" alt="">`).join('');
}

function category(id) {
  const selected = data.find(item => item.id === id);
  if (!selected) return home();
  view.innerHTML = `<section class="section product-section"><a class="back" href="#/">← All categories</a><div class="section-head"><div><p class="eyebrow">${esc(selected.en)}</p><h2>${esc(selected.en)}</h2><p>${esc(selected.desc)}</p></div><span>${selected.items.length} Models</span></div><div class="toolbar"><input id="search" type="search" placeholder="Search model"></div><div class="product-grid" id="productGrid">${selected.items.map(product => productCard({ ...product, categoryEn: selected.en })).join('')}</div></section>`;
  document.querySelector('#search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelector('#productGrid').innerHTML = selected.items.filter(product => `${product.model} ${product.nameEn}`.toLowerCase().includes(query)).map(product => productCard({ ...product, categoryEn: selected.en })).join('');
    bindCards();
  });
  bindCards();
  hero.innerHTML = `<img class="single" src="${esc(selected.items[0].image)}" alt="${esc(selected.en)}">`;
  scrollTo({ top: 0, behavior: 'smooth' });
}

function bindCards() {
  document.querySelectorAll('.product-card[data-model]').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('.card-buy')) return;
      openProduct(card.dataset.model);
    });
    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.card-buy')) {
        event.preventDefault();
        openProduct(card.dataset.model);
      }
    });
    const quantityInput = card.querySelector('[data-card-quantity]');
    const quantityWrap = card.querySelector('[data-card-quantity-wrap]');
    const cartDetail = (quantity, setQuantity = false) => {
      const product = all.find(item => item.model === card.dataset.model);
      if (!product) return null;
      const optionIndex = Number(card.querySelector('[data-card-option]')?.value || 0);
      const option = product.options ? product.options[optionIndex] : null;
      const pdIndex = Number(card.querySelector('[data-card-pd]')?.value || 0);
      const pdChoice = product.pdMode === 'select' ? pdChoices(product)[pdIndex] : null;
      return { model: product.model, option, pd: pdChoice?.value || null, pdLabel: pdChoice?.label || null, pdPriceUsd: pdChoice?.priceUsd ?? null, quantity, setQuantity };
    };
    const sendQuantity = (quantity, setQuantity) => {
      const detail = cartDetail(quantity, setQuantity);
      if (!detail) return;
      window.dispatchEvent(new CustomEvent('lzn:add-cart', { detail }));
      if (quantityInput) quantityInput.value = detail.resultQuantity || quantity;
    };
    card.querySelector('[data-card-add]')?.addEventListener('click', () => {
      const alreadyAdded = !quantityWrap?.hasAttribute('hidden');
      const current = Math.min(999, Math.max(1, Math.floor(Number(quantityInput?.value) || 1)));
      const quantity = alreadyAdded ? Math.min(999, current + 1) : 1;
      animateProductToCart(card.querySelector('[data-card-add]'));
      quantityWrap?.removeAttribute('hidden');
      sendQuantity(quantity, alreadyAdded);
    });
    quantityInput?.addEventListener('change', () => {
      const quantity = Math.min(999, Math.max(1, Math.floor(Number(quantityInput.value) || 1)));
      quantityInput.value = quantity;
      sendQuantity(quantity, true);
    });
  });
}

function fact(label, value) {
  return value ? `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>` : '';
}

function productDescription(product) {
  let description = product.description || product.desc || '';
  description = description.replace(/\s*Package size:.*$/i, '');
  return description.replace(/\s{2,}/g, ' ').trim();
}

function openProduct(model) {
  const product = all.find(item => item.model === model);
  if (!product) return;
  const images = product.images?.length ? product.images : [product.image];
  const optionSelect = product.options ? `<label class="product-option">Configuration<select id="productConfiguration">${product.options.map((option, index) => `<option value="${index}">${esc(option.model)} — ${esc(option.label)} — USD ${Number(option.priceUsd).toFixed(option.priceUsd >= 100 ? 0 : 2)}</option>`).join('')}</select></label>` : '';
  const pdSelect = product.pdMode === 'select' ? `<label class="product-option">PD option<select id="pdOption">${pdChoices(product).map((choice, index) => `<option value="${index}">${esc(choice.label)} - USD ${usd(choice.priceUsd)}</option>`).join('')}</select></label>` : '';
  const features = product.features?.length ? `<div class="feature-list"><h4>Product Features</h4><ul>${product.features.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>` : '';
  modalBody.innerHTML = `<div class="detail-media"><div class="detail-image"><img id="detailMainImage" src="${esc(images[0])}" alt="${esc(product.model)}"></div>${images.length > 1 ? `<div class="detail-thumbs">${images.map((src, index) => `<button class="${index === 0 ? 'active' : ''}" data-gallery-src="${esc(src)}"><img src="${esc(src)}" alt="${esc(product.model)} view ${index + 1}"></button>`).join('')}</div>` : ''}</div>
    <div class="detail-copy"><p class="eyebrow">${esc(product.categoryEn)}</p><h2 id="detailModel">${esc(product.model)}</h2><h3>${esc(product.nameEn)}</h3>${product.priceDisplay ? `<div class="detail-price"><strong id="detailPrice">${esc(product.priceDisplay)}</strong><span>FOB China</span></div>` : ''}<p class="description">${esc(productDescription(product))}</p>${features}
    <div class="detail-facts">${fact('Category', product.categoryEn)}${fact('Model / Code', product.model)}${fact('PD Range', product.pdRange ? `${product.pdRange} · Fixed selection` : '')}${fact('Package size', product.packageSize)}${fact('Gross weight', product.grossWeight)}${fact('Packing quantity', product.packingQuantity)}${fact('Carton size', product.cartonSize)}${fact('Carton gross weight', product.cartonGrossWeight)}${fact('Trade terms', 'FOB China')}</div>
    ${optionSelect}${pdSelect}<p class="price-note">Freight, destination duties and local taxes are not included.</p><div class="detail-add-row"><button class="button add-cart" data-add-cart="${esc(product.model)}">Add to cart</button><label class="quantity-stepper" data-detail-quantity-wrap hidden><input type="number" min="1" max="999" step="1" value="1" inputmode="numeric" data-detail-quantity aria-label="Quantity"></label></div></div>`;
  modal.querySelectorAll('[data-gallery-src]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#detailMainImage').src = button.dataset.gallerySrc;
    modal.querySelectorAll('[data-gallery-src]').forEach(item => item.classList.toggle('active', item === button));
  }));
  document.querySelector('#productConfiguration')?.addEventListener('change', event => {
    const option = product.options[Number(event.target.value)];
    document.querySelector('#detailModel').textContent = option.model;
    document.querySelector('#detailPrice').textContent = `USD ${Number(option.priceUsd).toFixed(option.priceUsd >= 100 ? 0 : 2)}`;
  });
  const pdElement = document.querySelector('#pdOption');
  const updatePdPrice = () => {
    if (!pdElement || !document.querySelector('#detailPrice')) return;
    const choice = pdChoices(product)[Number(pdElement.value || 0)];
    document.querySelector('#detailPrice').textContent = `USD ${usd(choice.priceUsd)}`;
  };
  pdElement?.addEventListener('change', updatePdPrice);
  updatePdPrice();
  const detailQuantityInput = modal.querySelector('[data-detail-quantity]');
  const detailQuantityWrap = modal.querySelector('[data-detail-quantity-wrap]');
  const detailCartData = (quantity, setQuantity = false) => {
    const optionIndex = Number(document.querySelector('#productConfiguration')?.value || 0);
    const option = product.options?.[optionIndex] || null;
    const pdIndex = Number(document.querySelector('#pdOption')?.value || 0);
    const pdChoice = product.pdMode === 'select' ? pdChoices(product)[pdIndex] : null;
    return { model: product.model, pd: pdChoice?.value || null, pdLabel: pdChoice?.label || null, pdPriceUsd: pdChoice?.priceUsd ?? null, option, quantity, setQuantity };
  };
  const sendDetailQuantity = (quantity, setQuantity) => {
    const detail = detailCartData(quantity, setQuantity);
    window.dispatchEvent(new CustomEvent('lzn:add-cart', { detail }));
    if (detailQuantityInput) detailQuantityInput.value = detail.resultQuantity || quantity;
  };
  modal.querySelector('[data-add-cart]')?.addEventListener('click', () => {
    const alreadyAdded = !detailQuantityWrap?.hasAttribute('hidden');
    const current = Math.min(999, Math.max(1, Math.floor(Number(detailQuantityInput?.value) || 1)));
    const quantity = alreadyAdded ? Math.min(999, current + 1) : 1;
    animateProductToCart(modal.querySelector('[data-add-cart]'));
    detailQuantityWrap?.removeAttribute('hidden');
    sendDetailQuantity(quantity, alreadyAdded);
  });
  detailQuantityInput?.addEventListener('change', () => {
    const quantity = Math.min(999, Math.max(1, Math.floor(Number(detailQuantityInput.value) || 1)));
    detailQuantityInput.value = quantity;
    sendDetailQuantity(quantity, true);
  });
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function close() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
function route() { const match = location.hash.match(/^#\/category\/([^/]+)/); match ? category(match[1]) : home(); }
addEventListener('hashchange', route);
route();
