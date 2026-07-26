(function () {
  const STYLE_ID = 'lzn-commerce-detail-styles';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #modal:has(.lzn-commerce-detail) {
        padding: 22px;
      }
      #modal:has(.lzn-commerce-detail) #modalBody {
        width: min(1180px, calc(100vw - 44px));
        max-width: 1180px;
      }
      .lzn-commerce-detail {
        display: grid;
        grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr);
        gap: 38px;
        width: 100%;
        padding: 12px;
        color: #14262b;
      }
      .lzn-commerce-gallery {
        min-width: 0;
      }
      .lzn-commerce-main-media {
        display: grid;
        place-items: center;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border: 1px solid #e1e5e4;
        border-radius: 22px;
        background: #f4f3ef;
      }
      .lzn-commerce-main-media img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .lzn-commerce-thumbnails {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
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
        max-height: 360px;
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
      .product-card select,
      .product-card .lzn-option-card-grid {
        display: none !important;
      }
      @media (max-width: 820px) {
        #modal:has(.lzn-commerce-detail) {
          padding: 8px;
        }
        #modal:has(.lzn-commerce-detail) #modalBody {
          width: calc(100vw - 16px);
        }
        .lzn-commerce-detail {
          grid-template-columns: 1fr;
          gap: 22px;
          padding: 5px;
        }
        .lzn-commerce-main-media {
          aspect-ratio: 4 / 3;
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

  function findOriginalAddButton(body) {
    return Array.from(body.querySelectorAll('button')).find(button =>
      /add to cart/i.test(button.textContent || '')
    );
  }

  function simplifyProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
      const model = (card.textContent || '').match(/LZN-\d+/)?.[0];
      if (!model) return;
      card.querySelectorAll('select').forEach(select => {
        select.style.display = 'none';
      });
      Array.from(card.querySelectorAll('button')).forEach(button => {
        if (/add to cart/i.test(button.textContent || '')) button.style.display = 'none';
      });
    });
  }

  function buildDetail(body, product) {
    if (body.querySelector('.lzn-commerce-detail')?.dataset.model === product.model) return;

    const originalSelect = body.querySelector('select');
    const originalAddButton = findOriginalAddButton(body);
    const bridge = document.createElement('div');
    bridge.className = 'lzn-commerce-bridge';
    if (originalSelect) bridge.appendChild(originalSelect);
    if (originalAddButton) bridge.appendChild(originalAddButton);

    const options = Array.isArray(product.options) ? product.options : [];
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
          <img id="detailImage" alt="">
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

    const mainImage = detail.querySelector('#detailImage');
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
    model.textContent = product.model;
    mainImage.src = product.image || galleryImages[0] || '';
    mainImage.alt = product.nameEn || product.model;

    const selectOption = index => {
      selectedIndex = index;
      const option = options[index];
      if (!option) return;
      mainImage.src = option.image || product.image || '';
      price.textContent = formatPrice(option.priceUsd);
      model.textContent = option.model || product.model;
      selectedLabel.textContent = option.label || '';
      optionList.querySelectorAll('.lzn-commerce-option').forEach((button, buttonIndex) => {
        button.classList.toggle('is-selected', buttonIndex === index);
      });
      if (originalSelect) {
        const matching = Array.from(originalSelect.options).find(item =>
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
          <img alt="" loading="lazy">
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
    galleryImages.slice(0, 12).forEach((source, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lzn-commerce-thumb';
      button.innerHTML = '<img alt="" loading="lazy">';
      button.querySelector('img').src = source;
      button.querySelector('img').alt = `${product.nameEn || product.model} image ${index + 1}`;
      button.addEventListener('click', () => {
        mainImage.src = source;
        thumbnailWrap.querySelectorAll('.lzn-commerce-thumb').forEach(item => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
      });
      thumbnailWrap.appendChild(button);
    });
    thumbnailWrap.firstElementChild?.classList.add('is-selected');

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

    body.replaceChildren(detail, bridge);
  }

  function enhanceDetail() {
    const body = document.getElementById('modalBody');
    if (!body) return;
    const model = (body.textContent || '').match(/LZN-\d+/)?.[0];
    if (!model) return;
    const product = findProduct(model);
    if (product) buildDetail(body, product);
  }

  function enhanceAll() {
    simplifyProductCards();
    enhanceDetail();
  }

  installStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll, { once: true });
  } else {
    enhanceAll();
  }
  new MutationObserver(enhanceAll).observe(document.body, { childList: true, subtree: true });
})();
