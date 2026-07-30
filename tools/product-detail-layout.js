(function () {
  const STYLE_ID = 'lzn-commerce-detail-styles';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.lzn-product-detail-open {
        overflow: hidden;
      }
      #modal[aria-hidden="true"]:has(.lzn-commerce-detail) {
        display: none !important;
      }
      #modal[aria-hidden="false"]:has(.lzn-commerce-detail) {
        position: fixed !important;
        inset: 0 !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        width: 100vw !important;
        height: 100dvh !important;
        margin: 0 !important;
        padding: 16px !important;
        overflow: auto !important;
        background: rgba(16, 24, 32, .62) !important;
      }
      #modal:has(.lzn-commerce-detail) > .modal-bg {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 0 !important;
        background: transparent !important;
      }
      #modal:has(.lzn-commerce-detail) > article {
        position: relative !important;
        z-index: 1 !important;
        inset: auto !important;
        transform: none !important;
        display: block !important;
        box-sizing: border-box !important;
        width: min(1180px, 100%) !important;
        max-width: 1180px !important;
        min-height: 0 !important;
        max-height: calc(100dvh - 32px) !important;
        margin: 0 auto !important;
        overflow: auto !important;
        border: 0 !important;
        border-radius: 22px !important;
        background: #f5f4f1 !important;
        box-shadow: 0 28px 90px rgba(0, 0, 0, .3) !important;
      }
      #modal:has(.lzn-commerce-detail) > article > .close {
        position: fixed !important;
        top: 26px !important;
        right: max(26px, calc((100vw - 1180px) / 2 + 26px)) !important;
        z-index: 4 !important;
      }
      #modal:has(.lzn-commerce-detail) #modalBody {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
      }
      .lzn-commerce-page-shell {
        box-sizing: border-box;
        width: min(1440px, 100%);
        min-height: 0;
        margin: 0 auto;
        padding: 0 22px 28px;
      }
      .lzn-commerce-page-header {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 58px;
        margin-bottom: 14px;
        border-bottom: 1px solid #dce1df;
        background: rgba(245, 244, 241, .96);
        backdrop-filter: blur(12px);
      }
      .lzn-commerce-back {
        border: 0;
        border-radius: 999px;
        padding: 11px 17px;
        background: #14262b;
        color: #fff;
        font-size: 13px;
        font-weight: 850;
        cursor: pointer;
      }
      .lzn-commerce-back:hover {
        background: #087d8b;
      }
      .lzn-commerce-page-brand {
        margin-right: 52px;
        color: #14262b;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: .14em;
      }
      .lzn-commerce-detail {
        display: grid;
        grid-template-columns: minmax(0, .92fr) minmax(380px, 1.08fr);
        gap: 24px;
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #e1e5e3;
        border-radius: 18px;
        padding: 20px;
        background: #fff;
        color: #14262b;
      }
      .lzn-commerce-gallery {
        min-width: 0;
      }
      .lzn-commerce-main-media {
        position: relative;
        display: grid;
        place-items: center;
        box-sizing: border-box;
        width: 100%;
        height: clamp(220px, 27vw, 320px);
        max-height: 320px;
        overflow: hidden;
        border: 1px solid #e1e5e4;
        border-radius: 22px;
        padding: 14px;
        background: #f4f3ef;
      }
      .lzn-commerce-main-media img {
        position: absolute !important;
        inset: 14px !important;
        display: block !important;
        width: calc(100% - 28px) !important;
        height: calc(100% - 28px) !important;
        max-width: none !important;
        max-height: none !important;
        object-fit: contain !important;
      }
      .lzn-commerce-thumbnails {
        display: grid;
        grid-template-columns: repeat(6, minmax(54px, 72px));
        justify-content: start;
        gap: 8px;
        margin-top: 10px;
      }
      .lzn-commerce-thumb {
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border: 1px solid #d8dedc;
        border-radius: 11px;
        padding: 3px;
        background: #fff;
        cursor: pointer;
      }
      .lzn-commerce-thumb.is-selected {
        border-color: #087d8b;
        box-shadow: 0 0 0 2px #087d8b;
      }
      .lzn-commerce-thumb img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .lzn-commerce-info {
        min-width: 0;
        align-self: start;
      }
      .lzn-commerce-category {
        margin: 0 0 8px;
        color: #087d8b;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .lzn-commerce-title {
        margin: 0;
        color: #111;
        font-size: clamp(28px, 3vw, 46px);
        line-height: 1.03;
        letter-spacing: -.035em;
      }
      .lzn-commerce-model {
        margin-top: 9px;
        color: #68787d;
        font-size: 13px;
        font-weight: 700;
      }
      .lzn-commerce-price {
        margin: 24px 0 8px;
        color: #e65320;
        font-size: clamp(30px, 3.6vw, 48px);
        font-weight: 900;
        line-height: 1;
      }
      .lzn-commerce-description {
        margin: 14px 0 22px;
        color: #526369;
        font-size: 14px;
        line-height: 1.65;
      }
      .lzn-commerce-option-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 9px;
        color: #15272d;
        font-size: 13px;
        font-weight: 900;
      }
      .lzn-commerce-options {
        display: grid;
        gap: 8px;
        max-height: 280px;
        overflow: auto;
        padding: 2px 4px 2px 2px;
      }
      .lzn-commerce-option {
        width: 100%;
        display: grid;
        grid-template-columns: 60px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        border: 1px solid #dce2e0;
        border-radius: 13px;
        padding: 7px 10px 7px 7px;
        background: #fff;
        color: #18282d;
        text-align: left;
        cursor: pointer;
      }
      .lzn-commerce-option:hover,
      .lzn-commerce-option:focus-visible {
        border-color: #e65320;
        outline: none;
      }
      .lzn-commerce-option.is-selected {
        border-color: #e65320;
        box-shadow: 0 0 0 1px #e65320;
        color: #d94816;
      }
      .lzn-commerce-option img {
        width: 60px;
        height: 60px;
        border-radius: 9px;
        object-fit: contain;
        background: #f4f3ef;
      }
      .lzn-commerce-option-name {
        min-width: 0;
        font-size: 12px;
        font-weight: 750;
        line-height: 1.35;
      }
      .lzn-commerce-option-price {
        font-size: 13px;
        font-weight: 900;
        white-space: nowrap;
      }
      .lzn-commerce-buy-row {
        display: grid;
        grid-template-columns: auto minmax(180px, 1fr);
        gap: 10px;
        margin-top: 18px;
      }
      .lzn-commerce-quantity {
        display: grid;
        grid-template-columns: 40px 46px 40px;
        align-items: center;
        overflow: hidden;
        border: 1px solid #cfd8d6;
        border-radius: 999px;
        background: #fff;
      }
      .lzn-commerce-quantity button {
        width: 40px;
        height: 44px;
        border: 0;
        background: transparent;
        color: #17282e;
        font-size: 20px;
        font-weight: 900;
        cursor: pointer;
      }
      .lzn-commerce-quantity button:hover {
        background: #e5f4f4;
      }
      .lzn-commerce-quantity output {
        text-align: center;
        font-size: 14px;
        font-weight: 900;
      }
      .lzn-commerce-add {
        min-height: 46px;
        border: 0;
        border-radius: 999px;
        background: #111;
        color: #fff;
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
      }
      .lzn-commerce-add:hover {
        background: #087d8b;
      }
      .lzn-commerce-status {
        min-height: 20px;
        margin: 8px 0 0;
        color: #087d8b;
        font-size: 12px;
        font-weight: 800;
      }
      .lzn-commerce-features {
        grid-column: 1 / -1;
        margin-top: 6px;
        border-top: 1px solid #e0e5e3;
        padding-top: 22px;
      }
      .lzn-commerce-features h3 {
        margin: 0 0 10px;
        font-size: 18px;
      }
      .lzn-commerce-features ul {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .lzn-commerce-features li {
        border-radius: 12px;
        padding: 13px;
        background: #eef5f5;
        color: #40555b;
        font-size: 13px;
        line-height: 1.5;
      }
      .lzn-commerce-bridge {
        display: none !important;
      }
      .cart-flight-target {
        z-index: 10020 !important;
      }
      .cart-flyer {
        z-index: 10021 !important;
      }
      .product-card select,
      .product-card .lzn-option-card-grid {
        display: none !important;
      }
      @media (max-width: 820px) {
        #modal[aria-hidden="false"]:has(.lzn-commerce-detail) {
          padding: 0 !important;
        }
        #modal:has(.lzn-commerce-detail) > article {
          width: 100% !important;
          max-width: none !important;
          max-height: 100dvh !important;
          border-radius: 0 !important;
        }
        #modal:has(.lzn-commerce-detail) > article > .close {
          top: 15px !important;
          right: 14px !important;
        }
        .lzn-commerce-page-shell {
          padding: 0 12px 32px;
        }
        .lzn-commerce-page-header {
          min-height: 64px;
          margin-bottom: 12px;
        }
        .lzn-commerce-page-brand {
          display: none;
        }
        .lzn-commerce-detail {
          grid-template-columns: 1fr;
          gap: 22px;
          border-radius: 18px;
          padding: 12px;
        }
        .lzn-commerce-main-media {
          height: min(38vh, 280px);
          min-height: 200px;
          padding: 10px;
        }
        .lzn-commerce-main-media img {
          inset: 10px !important;
          width: calc(100% - 20px) !important;
          height: calc(100% - 20px) !important;
        }
        .lzn-commerce-thumbnails {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
        .lzn-commerce-title {
          font-size: 30px;
        }
        .lzn-commerce-options {
          max-height: none;
        }
        .lzn-commerce-buy-row {
          grid-template-columns: 1fr;
        }
        .lzn-commerce-quantity {
          width: max-content;
        }
        .lzn-commerce-features ul {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function catalogProducts() {
    return (window.CATALOG_DATA || []).flatMap(category =>
      (category.items || []).map(product => ({
        ...product,
        categoryEn: product.categoryEn || category.en
      }))
    );
  }

  function findProduct(model) {
    return catalogProducts().find(product => product.model === model);
  }

  function formatPrice(value) {
    const number = Number(value);
    return Number.isFinite(number) ? `USD ${number.toFixed(2)}` : 'Price on request';
  }

  function pdPurchaseOptions(product) {
    if (product.model === 'RF-T' || product.pdMode !== 'select' || !product.pdOptions?.length) return [];
    const values = product.pdOptions.map(value => Number(value)).filter(Number.isFinite);
    if (!values.length) return [];
    const unitPrice = Number(product.priceUsd || 0);
    const range = String(product.pdRange || `${values[0]}-${values.at(-1)} mm`).replace(/\s*mm$/i, '');
    return [
      {
        model: product.model,
        label: `Full PD Set: ${range} mm (${values.length} pcs)`,
        image: product.image,
        priceUsd: Number((unitPrice * values.length).toFixed(2)),
        pdValue: 'FULL_SET'
      },
      ...values.map(value => ({
        model: product.model,
        label: `Fixed PD: ${value} mm`,
        image: product.image,
        priceUsd: unitPrice,
        pdValue: String(value)
      }))
    ];
  }

  function findOriginalAddButton(body) {
    return Array.from(body.querySelectorAll('button')).find(button =>
      /add to cart/i.test(button.textContent || '')
    );
  }

  function simplifyProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
      const model = card.dataset.model;
      const product = model ? findProduct(model) : null;
      const hasVisualChoices = product?.options?.length ||
        (product?.model !== 'RF-T' && product?.pdMode === 'select' && product?.pdOptions?.length);
      if (!hasVisualChoices) return;
      card.querySelectorAll('select').forEach(select => {
        select.style.display = 'none';
      });
      Array.from(card.querySelectorAll('button')).forEach(button => {
        if (/add to cart/i.test(button.textContent || '')) button.style.display = 'none';
      });
    });
  }

  function closeDetailModal(modal) {
    modal?.querySelectorAll('.lzn-commerce-detail').forEach(detail => {
      detail.dispatchEvent(new Event('lzn:detail-close'));
    });
    document.body.classList.remove('lzn-product-detail-open');
    document.body.style.overflow = '';
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  function buildDetail(body, product) {
    if (body.querySelector('.lzn-commerce-detail')?.dataset.model === product.model) return;

    const modal = body.closest('#modal');
    const originalCloseButton = modal?.querySelector(':scope > article > [data-close]') ||
      modal?.querySelector('[data-close]');
    modal?.querySelectorAll('[data-close]').forEach(button => {
      if (button.dataset.lznDetailCloseBound === '1') return;
      button.dataset.lznDetailCloseBound = '1';
      button.addEventListener('click', () => closeDetailModal(modal));
    });
    const originalSelect = body.querySelector('select');
    const originalAddButton = findOriginalAddButton(body);
    const bridge = document.createElement('div');
    bridge.className = 'lzn-commerce-bridge';
    if (originalSelect) bridge.appendChild(originalSelect);
    if (originalAddButton) bridge.appendChild(originalAddButton);

    const productOptions = Array.isArray(product.options) ? product.options : [];
    const pdOptions = productOptions.length ? [] : pdPurchaseOptions(product);
    const options = productOptions.length ? productOptions : pdOptions;
    const usesPdOptions = pdOptions.length > 0;
    const galleryImages = [...new Set([
      product.image,
      ...(product.images || []),
      ...options.map(option => option.image)
    ].filter(Boolean))];
    let selectedIndex = options.length ? 0 : -1;
    let quantity = 1;

    const detail = document.createElement('div');
    detail.className = 'lzn-commerce-detail';
    detail.dataset.model = product.model;
    detail.innerHTML = `
      <section class="lzn-commerce-gallery">
        <div class="lzn-commerce-main-media">
          <img id="detailMainImage" alt="">
        </div>
        <div class="lzn-commerce-thumbnails"></div>
      </section>
      <section class="lzn-commerce-info">
        <p class="lzn-commerce-category"></p>
        <h2 class="lzn-commerce-title"></h2>
        <p class="lzn-commerce-model" id="detailModel"></p>
        <div class="lzn-commerce-price" id="detailPrice"></div>
        <p class="lzn-commerce-description"></p>
        <div class="lzn-commerce-option-section">
          <div class="lzn-commerce-option-heading">
            <span>Choose an option</span>
            <span class="lzn-commerce-selected-label"></span>
          </div>
          <div class="lzn-commerce-options"></div>
        </div>
        <div class="lzn-commerce-buy-row">
          <div class="lzn-commerce-quantity" aria-label="Quantity">
            <button type="button" data-quantity="minus" aria-label="Decrease quantity">−</button>
            <output>1</output>
            <button type="button" data-quantity="plus" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="lzn-commerce-add">Add to cart</button>
        </div>
        <p class="lzn-commerce-status" aria-live="polite"></p>
      </section>
      <section class="lzn-commerce-features">
        <h3>Product Features</h3>
        <ul></ul>
      </section>
    `;

    const mainImage = detail.querySelector('#detailMainImage');
    const price = detail.querySelector('#detailPrice');
    const model = detail.querySelector('#detailModel');
    const selectedLabel = detail.querySelector('.lzn-commerce-selected-label');
    const optionList = detail.querySelector('.lzn-commerce-options');
    const optionSection = detail.querySelector('.lzn-commerce-option-section');
    const quantityOutput = detail.querySelector('.lzn-commerce-quantity output');
    const status = detail.querySelector('.lzn-commerce-status');

    detail.querySelector('.lzn-commerce-category').textContent = product.categoryEn || product.category || 'LZN Optical';
    detail.querySelector('.lzn-commerce-title').textContent = product.nameEn || product.productTitle || product.model;
    detail.querySelector('.lzn-commerce-description').textContent = product.description || '';
    detail.querySelector('.lzn-commerce-option-heading span').textContent = usesPdOptions ? 'Choose PD' : 'Choose an option';
    model.textContent = product.model;
    mainImage.src = product.image || galleryImages[0] || '';
    mainImage.alt = product.nameEn || product.model;

    const selectOption = index => {
      selectedIndex = index;
      const option = options[index];
      if (!option) return;
      mainImage.src = option.image || product.image || '';
      price.textContent = formatPrice(option.priceUsd);
      model.textContent = usesPdOptions ? product.model : (option.model || product.model);
      selectedLabel.textContent = option.label || '';
      optionList.querySelectorAll('.lzn-commerce-option').forEach((button, buttonIndex) => {
        button.classList.toggle('is-selected', buttonIndex === index);
      });
      if (originalSelect) {
        const matching = usesPdOptions
          ? originalSelect.options[index]
          : Array.from(originalSelect.options).find(item =>
            (item.textContent || '').includes(option.model)
          ) || originalSelect.options[index];
        if (matching) {
          originalSelect.value = matching.value;
          originalSelect.dispatchEvent(new Event('input', { bubbles: true }));
          originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };

    if (options.length) {
      options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lzn-commerce-option';
        button.innerHTML = `
          <img alt="" loading="eager">
          <span class="lzn-commerce-option-name"></span>
          <span class="lzn-commerce-option-price"></span>
        `;
        button.querySelector('img').src = option.image || product.image || '';
        button.querySelector('img').alt = option.label || `Option ${index + 1}`;
        button.querySelector('.lzn-commerce-option-name').textContent = option.label || `Option ${index + 1}`;
        button.querySelector('.lzn-commerce-option-price').textContent = formatPrice(option.priceUsd);
        button.addEventListener('click', () => selectOption(index));
        optionList.appendChild(button);
      });
      selectOption(0);
    } else {
      optionSection.hidden = true;
      price.textContent = formatPrice(product.priceUsd);
    }

    const thumbnailWrap = detail.querySelector('.lzn-commerce-thumbnails');
    const gallerySources = galleryImages.slice(0, 12);
    let galleryIndex = 0;
    let galleryTimer = 0;
    const showGalleryImage = index => {
      if (!gallerySources.length) return;
      galleryIndex = (index + gallerySources.length) % gallerySources.length;
      mainImage.src = gallerySources[galleryIndex];
      thumbnailWrap.querySelectorAll('.lzn-commerce-thumb').forEach((item, itemIndex) => {
        item.classList.toggle('is-selected', itemIndex === galleryIndex);
      });
    };
    const stopGalleryRotation = () => {
      if (!galleryTimer) return;
      window.clearInterval(galleryTimer);
      galleryTimer = 0;
    };
    const startGalleryRotation = () => {
      stopGalleryRotation();
      if (gallerySources.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
      galleryTimer = window.setInterval(() => showGalleryImage(galleryIndex + 1), 2000);
    };
    const handleGalleryVisibility = () => {
      if (document.hidden) stopGalleryRotation();
      else startGalleryRotation();
    };
    gallerySources.forEach((source, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lzn-commerce-thumb';
      button.innerHTML = '<img alt="" loading="eager">';
      button.querySelector('img').src = source;
      button.querySelector('img').alt = `${product.nameEn || product.model} image ${index + 1}`;
      button.addEventListener('click', () => {
        showGalleryImage(index);
        startGalleryRotation();
      });
      thumbnailWrap.appendChild(button);
    });
    showGalleryImage(0);
    document.addEventListener('visibilitychange', handleGalleryVisibility);
    startGalleryRotation();
    detail.addEventListener('lzn:detail-close', () => {
      stopGalleryRotation();
      document.removeEventListener('visibilitychange', handleGalleryVisibility);
    }, { once: true });

    const featureList = detail.querySelector('.lzn-commerce-features ul');
    (product.features || []).forEach(feature => {
      const item = document.createElement('li');
      item.textContent = feature;
      featureList.appendChild(item);
    });
    if (!featureList.children.length) detail.querySelector('.lzn-commerce-features').hidden = true;

    detail.querySelector('[data-quantity="minus"]').addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      quantityOutput.textContent = String(quantity);
    });
    detail.querySelector('[data-quantity="plus"]').addEventListener('click', () => {
      quantity += 1;
      quantityOutput.textContent = String(quantity);
    });
    detail.querySelector('.lzn-commerce-add').addEventListener('click', async () => {
      if (options.length && selectedIndex < 0) {
        status.textContent = 'Choose an option first.';
        return;
      }
      if (!originalAddButton) {
        status.textContent = 'Cart is currently unavailable.';
        return;
      }
      for (let index = 0; index < quantity; index += 1) {
        originalAddButton.click();
        if (index < quantity - 1) await new Promise(resolve => window.setTimeout(resolve, 40));
      }
      status.textContent = `${quantity} added to cart.`;
    });

    const page = document.createElement('main');
    page.className = 'lzn-commerce-page-shell';
    const pageHeader = document.createElement('header');
    pageHeader.className = 'lzn-commerce-page-header';
    pageHeader.innerHTML = `
      <button type="button" class="lzn-commerce-back">&larr; Back to products</button>
      <span class="lzn-commerce-page-brand">LZN MEDICAL</span>
    `;
    pageHeader.querySelector('.lzn-commerce-back').addEventListener('click', () => {
      if (originalCloseButton) originalCloseButton.click();
      closeDetailModal(modal);
    });
    page.append(pageHeader, detail);
    body.replaceChildren(page, bridge);
    document.body.classList.add('lzn-product-detail-open');
    if (modal) {
      modal.scrollTop = 0;
      window.requestAnimationFrame(() => modal.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    }
  }

  function enhanceDetail() {
    const body = document.getElementById('modalBody');
    if (!body) return;
    const model = body.querySelector('#detailModel')?.textContent?.trim();
    if (!model) return;
    const product = findProduct(model);
    if (product) buildDetail(body, product);
  }

  function enhanceAll() {
    simplifyProductCards();
    enhanceDetail();
  }

  function syncDetailState() {
    const modal = document.getElementById('modal');
    const isOpen = Boolean(
      modal?.querySelector('.lzn-commerce-detail') &&
      modal.getAttribute('aria-hidden') !== 'true'
    );
    document.body.classList.toggle('lzn-product-detail-open', isOpen);
  }

  installStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll, { once: true });
  } else {
    enhanceAll();
  }
  new MutationObserver(() => {
    enhanceAll();
    syncDetailState();
  }).observe(document.body, { childList: true, subtree: true });
  const modal = document.getElementById('modal');
  if (modal) {
    new MutationObserver(syncDetailState).observe(modal, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class']
    });
  }
})();
