(function () {
  const categoryIds = new Set(window.LZN_DEVICE_CATEGORY_IDS || []);
  const categories = (window.CATALOG_DATA || []).filter(category => categoryIds.has(category.id));
  const nav = document.querySelector('#deviceCategoryNav');
  const content = document.querySelector('#deviceCatalogContent');
  if (!nav || !content || !categories.length) return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
  const toolAsset = path => path ? `/tools/${String(path).replace(/^\/+/, '')}` : '';
  const formatUsd = value => Number(value).toFixed(Number(value) >= 100 ? 0 : 2);
  const publicProduct = product => ({
    ...product,
    image: toolAsset(product.image),
    images: (product.images || []).map(toolAsset),
    options: (product.options || []).map(option => ({
      ...option,
      image: toolAsset(option.image || product.image),
      images: (option.images || []).map(toolAsset)
    }))
  });
  const normalizedCategories = categories.map(category => ({
    ...category,
    items: category.items.map(publicProduct)
  }));

  function prices(product) {
    const optionPrices = (product.options || []).map(option => Number(option.priceUsd)).filter(value => Number.isFinite(value) && value > 0);
    if (optionPrices.length) return optionPrices;
    const price = Number(product.priceUsd);
    return Number.isFinite(price) && price > 0 ? [price] : [];
  }

  function card(product, category) {
    const values = prices(product);
    const minimum = values.length ? Math.min(...values) : null;
    const hasChoices = (product.options?.length || 0) > 1;
    const display = minimum === null ? 'Price on request' : `${hasChoices ? 'From ' : ''}USD ${formatUsd(minimum)}`;
    return `<article class="marketplace-product-card" data-device-model="${escapeHtml(product.model)}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.model)} details">
      <div class="marketplace-product-image"><img loading="lazy" decoding="async" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} ${escapeHtml(product.nameEn)}"></div>
      <div class="marketplace-product-copy">
        <span class="marketplace-product-kicker">${escapeHtml(category.en)}</span>
        <h3>${escapeHtml(product.model)}</h3>
        <p>${escapeHtml(product.nameEn)}</p>
        <div class="marketplace-product-meta"><span class="marketplace-price">${escapeHtml(display)}</span><span class="marketplace-open">${hasChoices ? 'Choose options' : 'View details'} &rarr;</span></div>
      </div>
    </article>`;
  }

  const shell = document.createElement('div');
  shell.className = 'marketplace-catalog';
  shell.id = 'deviceMarketplace';
  nav.parentNode.insertBefore(shell, nav);
  shell.append(nav, content);
  nav.className = 'marketplace-major-nav';
  content.className = 'marketplace-scroll';

  nav.innerHTML = normalizedCategories.map((category, index) => `<button type="button" data-marketplace-target="${escapeHtml(category.id)}" class="${index ? '' : 'active'}" aria-pressed="${index ? 'false' : 'true'}">
    <img loading="lazy" decoding="async" src="${escapeHtml(category.items[0]?.image)}" alt="">
    <span><strong>${escapeHtml(category.en)}</strong><small>${category.items.length} models</small></span>
  </button>`).join('');

  content.innerHTML = `<div class="marketplace-search"><input type="search" id="deviceCatalogSearch" placeholder="Search model or product"></div>${normalizedCategories.map(category => `<section class="marketplace-category" data-marketplace-section="${escapeHtml(category.id)}">
    <div class="marketplace-category-head"><div><h3>${escapeHtml(category.en)}</h3><p>${escapeHtml(category.desc)}</p></div><span class="marketplace-category-count">${category.items.length} models</span></div>
    <div class="marketplace-products" data-device-products="${escapeHtml(category.id)}">${category.items.map(product => card(product, category)).join('')}</div>
  </section>`).join('')}`;

  function productByModel(model) {
    for (const category of normalizedCategories) {
      const product = category.items.find(item => item.model === model);
      if (product) return { product, category };
    }
    return null;
  }

  const detail = document.createElement('div');
  detail.className = 'marketplace-detail';
  detail.id = 'deviceOrderDetail';
  detail.setAttribute('aria-hidden', 'true');
  detail.innerHTML = '<button class="marketplace-detail-backdrop" type="button" data-device-modal-close aria-label="Close"></button><article class="marketplace-detail-card" role="dialog" aria-modal="true"><button class="marketplace-detail-close" type="button" data-device-modal-close aria-label="Close">&times;</button><div id="deviceOrderDetailBody" style="display:contents"></div></article>';
  document.body.appendChild(detail);

  function closeDetail() {
    detail.classList.remove('active');
    detail.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function selectedOffer(product) {
    const select = detail.querySelector('[data-device-detail-option]');
    const option = select && product.options?.length ? product.options[Number(select.value)] || product.options[0] : null;
    const price = Number(option?.priceUsd ?? product.priceUsd);
    return {
      model: option?.model || product.model,
      label: option?.label || product.nameEn,
      image: option?.image || product.image,
      priceUsd: Number.isFinite(price) && price > 0 ? price : null
    };
  }

  function openDetail(product, category) {
    const body = detail.querySelector('#deviceOrderDetailBody');
    const optionSelect = product.options?.length ? `<label class="marketplace-detail-option"><span>${escapeHtml(product.optionLabel || 'Configuration')}</span><select data-device-detail-option>${product.options.map((option, index) => `<option value="${index}">${escapeHtml(option.label)}</option>`).join('')}</select></label>` : '';
    body.innerHTML = `<div class="marketplace-detail-media"><img data-device-detail-image src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} ${escapeHtml(product.nameEn)}"></div>
      <div class="marketplace-detail-copy">
        <span class="marketplace-product-kicker">${escapeHtml(category.en)}</span>
        <h2 data-device-detail-model>${escapeHtml(product.model)}</h2>
        <h3>${escapeHtml(product.nameEn)}</h3>
        <div class="marketplace-price" data-device-detail-price></div>
        <p>${escapeHtml(product.description || product.desc || category.desc || '')}</p>
        ${optionSelect}
        <label class="marketplace-detail-quantity"><span>Quantity</span><input type="number" min="1" max="999" step="1" value="1" inputmode="numeric" data-device-detail-quantity></label>
        <button type="button" class="marketplace-detail-add add-cart" data-device-modal-add>Add to cart</button>
      </div>`;
    const refresh = () => {
      const selected = selectedOffer(product);
      body.querySelector('[data-device-detail-image]').src = selected.image;
      body.querySelector('[data-device-detail-model]').textContent = selected.model;
      body.querySelector('[data-device-detail-price]').textContent = selected.priceUsd ? `USD ${formatUsd(selected.priceUsd)}` : 'Price on request';
    };
    body.querySelector('[data-device-detail-option]')?.addEventListener('change', refresh);
    body.querySelector('[data-device-modal-add]').addEventListener('click', event => {
      const selected = selectedOffer(product);
      const quantity = Math.max(1, Number(body.querySelector('[data-device-detail-quantity]').value) || 1);
      window.LZNSharedCart?.addItems([{
        model: selected.model,
        nameEn: `[Devices] ${product.nameEn}`,
        image: selected.image,
        priceUsd: selected.priceUsd,
        priceOnRequest: !selected.priceUsd,
        quantity,
        optionLabel: selected.label,
        sourceStore: 'Devices'
      }]);
      const button = event.currentTarget;
      button.textContent = 'Added';
      setTimeout(() => { button.textContent = 'Add to cart'; }, 900);
    });
    refresh();
    detail.classList.add('active');
    detail.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    detail.querySelector('.marketplace-detail-close').focus();
  }

  function bindCards() {
    content.querySelectorAll('[data-device-model]').forEach(element => {
      const open = () => {
        const found = productByModel(element.dataset.deviceModel);
        if (found) openDetail(found.product, found.category);
      };
      element.addEventListener('click', open);
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    });
  }

  detail.querySelectorAll('[data-device-modal-close]').forEach(button => button.addEventListener('click', closeDetail));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && detail.classList.contains('active')) closeDetail();
  });
  document.querySelector('#deviceCatalogSearch')?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    normalizedCategories.forEach(category => {
      const host = content.querySelector(`[data-device-products="${CSS.escape(category.id)}"]`);
      const matches = category.items.filter(product => `${product.model} ${product.nameEn} ${category.en}`.toLowerCase().includes(query));
      host.innerHTML = matches.length ? matches.map(product => card(product, category)).join('') : '<p class="marketplace-empty">No matching products in this category.</p>';
    });
    bindCards();
  });

  window.LZNMarketplace?.bind(shell);
  bindCards();
  window.LZNSelectDeviceCategory = categoryId => {
    const target = shell.querySelector(`[data-marketplace-section="${CSS.escape(categoryId)}"]`);
    if (target) content.scrollTo({ top: Math.max(0, target.offsetTop - 64), behavior: 'smooth' });
    document.querySelector('#workshop-devices')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requestedCategory = location.hash.match(/^#device-category-([a-z0-9-]+)$/i)?.[1];
  if (requestedCategory) requestAnimationFrame(() => window.LZNSelectDeviceCategory(requestedCategory));
})();
