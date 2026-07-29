(function () {
  const categoryIds = new Set(window.LZN_DEVICE_CATEGORY_IDS || []);
  const sourceCategories = (window.CATALOG_DATA || []).filter(category => categoryIds.has(category.id));
  const nav = document.querySelector('#deviceCategoryNav');
  const content = document.querySelector('#deviceCatalogContent');

  const legacyPrices = Object.freeze({
    'ET-1100': 1500,
    'ET-660E': 800,
    'ET-480A': 900,
    'LZN-5': 1600,
    'TOOLTIP': 18000,
    'INT-200-IIOMA': null,
    'HV-600': 700,
    'AXL-800': null,
    'RMK-800': null,
    'CP-6': 500,
    'CP-8': 2000,
    'K215': 500,
    'CV-700-CP-500': 3300,
    'CV-700-K215': 3300,
    'OT-1': 600,
    'OT-3': 600,
    'OT-5': 650,
    'ANY-I-YEARLY': 200,
    'CYCLOPS-LITE': 1800,
    'BLUESPEC-HEV': 300,
    'CYCLOPS-BLUESPEC-SET': 2000
  });
  const deviceAsset = value => {
    const path = String(value || '').trim();
    if (!path || /^(?:https?:)?\/\//i.test(path) || path.startsWith('/')) return path;
    return `/devices/${path.replace(/^\.\//, '')}`;
  };
  const legacyItem = card => {
    const offer = card.closest('.digital-sales-card')?.querySelector('.device-cart-add');
    const heading = card.querySelector('h3')?.textContent?.trim() || '';
    const model = String(card.dataset.saleModel || offer?.dataset.model || card.dataset.title || heading).trim();
    if (!model) return null;
    const type = card.querySelector('p')?.textContent?.trim() || '';
    const suppliedName = String(offer?.dataset.name || card.dataset.title || '').trim();
    const nameEn = suppliedName && suppliedName.toUpperCase() !== model.toUpperCase() ? suppliedName : (type || suppliedName || model);
    const description = String(card.dataset.summary || card.querySelector('span')?.textContent || type || '').trim();
    const image = deviceAsset(card.querySelector('img')?.getAttribute('src') || offer?.dataset.image || '');
    const brochurePages = (
      card.dataset.brochures
        ? card.dataset.brochures.split(',')
        : (card.dataset.brochure ? [card.dataset.brochure] : [])
    ).map(deviceAsset).filter(Boolean);
    return {
      model,
      nameEn,
      image,
      description,
      priceUsd: legacyPrices[model] ?? null,
      brochurePages,
      brochureDownload: deviceAsset(card.dataset.download || '')
    };
  };
  const collectLegacyItems = section => section
    ? [...section.querySelectorAll('.product-card, .equipment-card')].map(legacyItem).filter(Boolean)
    : [];
  const mergeItems = (primary, additions) => {
    const items = new Map((primary || []).map(item => [String(item.model).toUpperCase(), item]));
    (additions || []).forEach(item => {
      const key = String(item.model).toUpperCase();
      if (!items.has(key)) items.set(key, item);
    });
    return [...items.values()];
  };

  const unitSection = document.querySelector('#products');
  const opticalSection = document.querySelector('.optical-grid')?.closest('section');
  const visionSection = document.querySelector('.vision-grid')?.closest('section');
  const motorizedSection = document.querySelector('.motorized-grid')?.closest('section');
  const digitalSection = document.querySelector('.digital-sales-grid')?.closest('section');
  const categoryMap = new Map(sourceCategories.map(category => [category.id, {
    ...category,
    items: [...(category.items || [])]
  }]));
  const tables = categoryMap.get('tables');
  if (tables) tables.items = mergeItems(tables.items, collectLegacyItems(motorizedSection));
  [
    {
      id: 'unit-tables',
      en: 'Unit & Refraction Tables',
      desc: 'Ophthalmic unit tables, refraction workstations and edger system tables.',
      items: collectLegacyItems(unitSection)
    },
    {
      id: 'clinical-equipment',
      en: 'Clinical & Lens Processing',
      desc: 'Lens processing, lens measurement and clinical diagnostic equipment.',
      items: collectLegacyItems(opticalSection)
    },
    {
      id: 'vision-test',
      en: 'Vision Test Equipment',
      desc: 'Chart projectors, LCD vision charts and digital refraction systems.',
      items: collectLegacyItems(visionSection)
    },
    {
      id: 'digital-solutions',
      en: 'Digital Optical Solutions',
      desc: 'Consulting, centering and lens demonstration systems for optical stores.',
      items: collectLegacyItems(digitalSection)
    }
  ].forEach(category => {
    if (!category.items.length) return;
    const existing = categoryMap.get(category.id);
    categoryMap.set(category.id, existing
      ? { ...existing, items: mergeItems(existing.items, category.items) }
      : category);
  });
  const categories = [...categoryMap.values()];
  [unitSection, opticalSection, visionSection, motorizedSection, digitalSection]
    .filter(Boolean)
    .forEach(section => section.remove());

  if (!nav || !content || !categories.length) return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
  const publicAsset = path => {
    const value = String(path || '');
    if (!value || /^(?:https?:)?\/\//i.test(value) || value.startsWith('/')) return value;
    return `/tools/${value.replace(/^\/+/, '')}`;
  };
  const formatUsd = value => Number(value).toFixed(Number(value) >= 100 ? 0 : 2);
  function animateToCart(sourceImage) {
    const cartButton = document.querySelector('#cartButton');
    if (!sourceImage?.getBoundingClientRect || !cartButton?.getBoundingClientRect) return;
    const sourceRect = sourceImage.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();
    if (!sourceRect.width || !sourceRect.height || !cartRect.width || !cartRect.height) return;
    const flyer = document.createElement('img');
    flyer.src = sourceImage.currentSrc || sourceImage.src || '';
    flyer.alt = '';
    flyer.setAttribute('aria-hidden', 'true');
    Object.assign(flyer.style, {
      position: 'fixed',
      left: sourceRect.left + 'px',
      top: sourceRect.top + 'px',
      width: sourceRect.width + 'px',
      height: sourceRect.height + 'px',
      objectFit: 'contain',
      borderRadius: '16px',
      background: '#fff',
      boxShadow: '0 16px 40px rgba(0,0,0,.28)',
      pointerEvents: 'none',
      zIndex: '10050'
    });
    document.body.appendChild(flyer);
    const deltaX = cartRect.left + cartRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = cartRect.top + cartRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    const finish = () => {
      flyer.remove();
      cartButton.animate?.([
        { transform: 'scale(1)' },
        { transform: 'scale(1.18)' },
        { transform: 'scale(1)' }
      ], { duration: 320, easing: 'ease-out' });
    };
    if (!flyer.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    flyer.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (deltaX * .55) + 'px,' + (deltaY * .35 - 70) + 'px) scale(.62)', opacity: .95, offset: .58 },
      { transform: 'translate(' + deltaX + 'px,' + deltaY + 'px) scale(.12)', opacity: .08 }
    ], { duration: 720, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'forwards' }).finished.then(finish, finish);
  }
  window.LZNDeviceAnimateToCart = animateToCart;
  const publicProduct = product => ({
    ...product,
    image: publicAsset(product.image),
    images: (product.images || []).map(publicAsset),
    brochurePages: (product.brochurePages || []).map(deviceAsset),
    brochureDownload: deviceAsset(product.brochureDownload),
    options: (product.options || []).map(option => ({
      ...option,
      image: publicAsset(option.image || product.image),
      images: (option.images || []).map(publicAsset)
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
      <div class="marketplace-product-image"><img width="240" height="240" loading="lazy" decoding="async" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-catalog-src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} ${escapeHtml(product.nameEn)}"></div>
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
    <img width="72" height="72" loading="lazy" decoding="async" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-catalog-src="${escapeHtml(category.items[0]?.image)}" alt="">
    <span><strong>${escapeHtml(category.en)}</strong><small>${category.items.length} models</small></span>
  </button>`).join('');

  content.innerHTML = `${normalizedCategories.map(category => `<section class="marketplace-category" data-marketplace-section="${escapeHtml(category.id)}">
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
    const brochurePages = [...new Set((product.brochurePages || []).filter(Boolean))];
    const galleryImages = brochurePages.length
      ? [...new Set([...brochurePages, product.image].filter(Boolean))]
      : [product.image];
    const galleryThumbs = galleryImages.length > 1
      ? `<div class="device-detail-thumbs" aria-label="Product images">${galleryImages.map((image, index) => {
        const isBrochure = index < brochurePages.length;
        const label = isBrochure ? `Brochure page ${index + 1}` : 'Product image';
        return `<button type="button" class="device-detail-thumb ${index ? '' : 'active'}" data-device-gallery-index="${index}" aria-label="Show ${escapeHtml(label)}" aria-pressed="${index ? 'false' : 'true'}"><img loading="lazy" decoding="async" src="${escapeHtml(image)}" alt=""><span>${escapeHtml(label)}</span></button>`;
      }).join('')}</div>`
      : '';
    const brochureLink = product.brochureDownload
      ? `<a class="device-detail-brochure-link" href="${escapeHtml(product.brochureDownload)}" target="_blank" rel="noopener">Download brochure / manual PDF</a>`
      : '';
    body.innerHTML = `<div class="marketplace-detail-media">
        <div class="device-detail-stage">
          <img data-device-detail-image src="${escapeHtml(galleryImages[0] || product.image)}" alt="${escapeHtml(product.model)} ${escapeHtml(product.nameEn)}">
          <span class="device-detail-page" data-device-gallery-label ${brochurePages.length ? '' : 'hidden'}>${brochurePages.length ? 'Brochure page 1' : ''}</span>
        </div>
        ${galleryThumbs}
        ${brochureLink}
      </div>
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
    let activeGalleryIndex = 0;
    const mainImage = body.querySelector('[data-device-detail-image]');
    const galleryLabel = body.querySelector('[data-device-gallery-label]');
    const showGalleryImage = index => {
      activeGalleryIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
      const isBrochure = activeGalleryIndex < brochurePages.length;
      const selected = selectedOffer(product);
      mainImage.src = isBrochure ? brochurePages[activeGalleryIndex] : selected.image;
      mainImage.alt = isBrochure
        ? `${product.model} brochure page ${activeGalleryIndex + 1}`
        : `${selected.model} ${product.nameEn}`;
      if (galleryLabel) {
        galleryLabel.hidden = false;
        galleryLabel.textContent = isBrochure ? `Brochure page ${activeGalleryIndex + 1}` : 'Product image';
      }
      body.querySelectorAll('[data-device-gallery-index]').forEach(button => {
        const active = Number(button.dataset.deviceGalleryIndex) === activeGalleryIndex;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };
    body.querySelectorAll('[data-device-gallery-index]').forEach(button => {
      button.addEventListener('click', () => showGalleryImage(Number(button.dataset.deviceGalleryIndex)));
    });
    const refresh = () => {
      const selected = selectedOffer(product);
      if (!brochurePages.length || activeGalleryIndex >= brochurePages.length) {
        mainImage.src = selected.image;
        mainImage.alt = `${selected.model} ${product.nameEn}`;
      }
      body.querySelector('[data-device-detail-model]').textContent = selected.model;
      body.querySelector('[data-device-detail-price]').textContent = selected.priceUsd ? `USD ${formatUsd(selected.priceUsd)}` : 'Price on request';
    };
    body.querySelector('[data-device-detail-option]')?.addEventListener('change', refresh);
    body.querySelector('[data-device-modal-add]').addEventListener('click', event => {
      const selected = selectedOffer(product);
      animateToCart(body.querySelector('[data-device-detail-image]'));
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
    window.LZNMarketplace?.refresh(shell);
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
