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

  function publicProduct(product) {
    return {
      ...product,
      image: toolAsset(product.image),
      images: (product.images || []).map(toolAsset),
      options: (product.options || []).map(option => ({
        ...option,
        image: toolAsset(option.image || product.image),
        images: (option.images || []).map(toolAsset)
      }))
    };
  }

  const normalizedCategories = categories.map(category => ({
    ...category,
    items: category.items.map(publicProduct)
  }));

  function optionControl(product) {
    if (!product.options?.length) return '';
    return `<label class="moved-device-option">
      <span>${escapeHtml(product.optionLabel || 'Configuration')}</span>
      <select data-device-option>
        ${product.options.map((option, index) => `<option value="${index}">${escapeHtml(option.label)} · USD ${formatUsd(option.priceUsd)}</option>`).join('')}
      </select>
    </label>`;
  }

  function productCard(product, category) {
    const startingPrice = product.priceDisplay || (Number(product.priceUsd) > 0 ? `USD ${formatUsd(product.priceUsd)}` : 'Price on request');
    return `<article class="moved-device-product" data-model="${escapeHtml(product.model)}">
      <button class="moved-device-product-main" type="button" data-device-details>
        <img loading="lazy" decoding="async" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} ${escapeHtml(product.nameEn)}">
        <span class="moved-device-category-name">${escapeHtml(category.en)}</span>
        <h3>${escapeHtml(product.model)}</h3>
        <p>${escapeHtml(product.nameEn)}</p>
      </button>
      <div class="moved-device-offer">
        <strong data-device-price>${escapeHtml(startingPrice)}</strong>
        ${optionControl(product)}
        <label class="moved-device-quantity"><span>Quantity</span><input type="number" min="1" max="999" step="1" value="1" inputmode="numeric" data-device-quantity></label>
        <button type="button" class="moved-device-add" data-device-add>Add to cart</button>
      </div>
    </article>`;
  }

  function renderCategory(categoryId) {
    const category = normalizedCategories.find(item => item.id === categoryId) || normalizedCategories[0];
    nav.querySelectorAll('[data-device-category]').forEach(button => {
      const active = button.dataset.deviceCategory === category.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    content.innerHTML = `<div class="moved-device-heading">
      <div><p class="eyebrow">ORDERABLE DEVICES</p><h3>${escapeHtml(category.en)}</h3><p>${escapeHtml(category.desc)}</p></div>
      <span>${category.items.length} models</span>
    </div>
    <div class="moved-device-grid">${category.items.map(product => productCard(product, category)).join('')}</div>`;
    bindProducts(category);
  }

  function selectedOffer(product, card) {
    const optionSelect = card.querySelector('[data-device-option]');
    if (!optionSelect) {
      return {
        model: product.model,
        label: product.nameEn,
        image: product.image,
        priceUsd: Number(product.priceUsd) > 0 ? Number(product.priceUsd) : null
      };
    }
    const option = product.options[Number(optionSelect.value)] || product.options[0];
    return {
      model: option.model || product.model,
      label: option.label || product.nameEn,
      image: option.image || product.image,
      priceUsd: Number(option.priceUsd) > 0 ? Number(option.priceUsd) : null
    };
  }

  function bindProducts(category) {
    content.querySelectorAll('.moved-device-product').forEach(card => {
      const product = category.items.find(item => item.model === card.dataset.model);
      if (!product) return;
      const image = card.querySelector('.moved-device-product-main img');
      const price = card.querySelector('[data-device-price]');
      const optionSelect = card.querySelector('[data-device-option]');

      function refreshOption() {
        const selected = selectedOffer(product, card);
        if (selected.image) image.src = selected.image;
        price.textContent = selected.priceUsd ? `USD ${formatUsd(selected.priceUsd)}` : 'Price on request';
      }

      optionSelect?.addEventListener('change', refreshOption);
      card.querySelector('[data-device-details]').addEventListener('click', () => {
        const selected = selectedOffer(product, card);
        window.open(selected.image || product.image, '_blank', 'noopener,noreferrer');
      });
      card.querySelector('[data-device-add]').addEventListener('click', event => {
        const selected = selectedOffer(product, card);
        const quantity = Math.max(1, Number(card.querySelector('[data-device-quantity]').value) || 1);
        window.LZNSharedCart?.addItems([{
          model: selected.model,
          nameEn: `[Devices] ${product.nameEn}`,
          image: selected.image || product.image,
          priceUsd: selected.priceUsd,
          priceOnRequest: !selected.priceUsd,
          quantity,
          optionLabel: selected.label,
          sourceStore: 'Devices'
        }]);
        const button = event.currentTarget;
        const original = button.textContent;
        button.textContent = 'Added';
        button.classList.add('added');
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove('added');
        }, 900);
      });
      refreshOption();
    });
  }

  nav.innerHTML = normalizedCategories.map((category, index) => {
    const product = category.items[0];
    return `<button type="button" data-device-category="${escapeHtml(category.id)}" class="${index ? '' : 'active'}" aria-pressed="${index ? 'false' : 'true'}">
      <img loading="lazy" decoding="async" src="${escapeHtml(product.image)}" alt="">
      <span><strong>${escapeHtml(category.en)}</strong><small>${category.items.length} models</small></span>
    </button>`;
  }).join('');

  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-device-category]');
    if (!button) return;
    renderCategory(button.dataset.deviceCategory);
    history.replaceState({}, '', `#device-category-${button.dataset.deviceCategory}`);
  });

  window.LZNSelectDeviceCategory = categoryId => {
    renderCategory(categoryId);
    history.replaceState({}, '', `#device-category-${categoryId}`);
    document.querySelector('#workshop-devices')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requestedCategory = location.hash.match(/^#device-category-([a-z0-9-]+)$/i)?.[1];
  renderCategory(normalizedCategories.some(category => category.id === requestedCategory) ? requestedCategory : normalizedCategories[0].id);
})();
