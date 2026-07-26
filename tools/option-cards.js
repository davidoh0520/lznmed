(function () {
  const STYLE_ID = 'lzn-option-card-styles';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .lzn-option-card-grid {
        display: grid;
        gap: 7px;
        margin-top: 8px;
      }
      .lzn-option-card-grid--detail {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin: 14px 0;
      }
      .lzn-option-card {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid #d8e1e5;
        border-radius: 12px;
        padding: 8px;
        background: #fff;
        color: #12242b;
        cursor: pointer;
      }
      .lzn-option-card:hover,
      .lzn-option-card:focus-visible {
        border-color: #087d8b;
        box-shadow: 0 0 0 2px rgba(8, 125, 139, 0.12);
        outline: none;
      }
      .lzn-option-card.is-selected {
        border-color: #087d8b;
        background: #eef9fa;
      }
      .lzn-option-card__image {
        width: 76px;
        height: 76px;
        flex: 0 0 76px;
        border-radius: 9px;
        object-fit: contain;
        background: #f5f7f7;
      }
      .lzn-option-card__body {
        min-width: 0;
        flex: 1;
        display: grid;
        justify-items: end;
        gap: 9px;
      }
      .lzn-option-card__price {
        color: #087d8b;
        font-size: 14px;
        font-weight: 800;
        white-space: nowrap;
      }
      .lzn-option-card__quantity {
        display: inline-grid;
        grid-template-columns: 30px 34px 30px;
        align-items: center;
        overflow: hidden;
        border: 1px solid #cad5d8;
        border-radius: 999px;
        background: #fff;
      }
      .lzn-option-card__quantity button {
        width: 30px;
        height: 30px;
        border: 0;
        background: transparent;
        color: #10262c;
        font-size: 18px;
        font-weight: 800;
        cursor: pointer;
      }
      .lzn-option-card__quantity button:hover,
      .lzn-option-card__quantity button:focus-visible {
        background: #dff3f5;
        outline: none;
      }
      .lzn-option-card__count {
        text-align: center;
        font-size: 12px;
        font-weight: 800;
      }
      .lzn-original-option-select {
        display: none !important;
      }
      @media (max-width: 720px) {
        .lzn-option-card-grid--detail {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function optionPresentation(option, index) {
    const text = String(option.textContent || '').trim();
    const model = (text.match(/\bLZN-\d+-\d+\b/) || [])[0] || '';
    let catalogOption = null;
    let catalogProduct = null;
    for (const category of window.CATALOG_DATA || []) {
      for (const product of category.items || []) {
        const match = (product.options || []).find(item => item.model === model);
        if (match) {
          catalogOption = match;
          catalogProduct = product;
          break;
        }
      }
      if (catalogOption) break;
    }
    const priceMatches = text.match(/USD\s+\d+(?:\.\d+)?/gi);
    const price = catalogOption && Number.isFinite(Number(catalogOption.priceUsd))
      ? `USD ${Number(catalogOption.priceUsd).toFixed(2)}`
      : priceMatches && priceMatches.length
      ? priceMatches[priceMatches.length - 1].toUpperCase()
      : 'Price on request';
    const pieces = text.split(/\s+—\s+/);
    let name = pieces.length > 1 ? pieces[1] : text;
    name = name.replace(/\s+-\s+USD\s+\d+(?:\.\d+)?/gi, '').trim();
    if (!name || /^select/i.test(name)) name = `Option ${String(index + 1).padStart(2, '0')}`;
    return {
      model,
      name,
      price,
      image: catalogOption?.image || catalogProduct?.image || ''
    };
  }

  function clickCartDecrease(model, allowRemove) {
    const cartNodes = Array.from(document.querySelectorAll(
      '[class*="cart"], [id*="cart"], [data-cart-item], [data-line-item]'
    )).filter(node => (node.textContent || '').includes(model));
    cartNodes.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    for (const node of cartNodes) {
      const buttons = Array.from(node.querySelectorAll('button'));
      const decrease = buttons.find(button => {
        const label = `${button.getAttribute('aria-label') || ''} ${button.title || ''} ${button.textContent || ''}`.trim();
        return /decrease|minus|remove one/i.test(label) || /^[−-]$/.test(label);
      });
      if (decrease) {
        decrease.click();
        return true;
      }
      if (allowRemove) {
        const remove = buttons.find(button => /remove|delete/i.test(
          `${button.getAttribute('aria-label') || ''} ${button.title || ''} ${button.textContent || ''}`
        ));
        if (remove) {
          remove.click();
          return true;
        }
      }
    }
    return false;
  }

  function buildOptionGrid(select, addButton, extraClass) {
    const options = Array.from(select.options).filter(option =>
      !option.disabled && option.value !== ''
    );
    if (!options.length) return null;

    const grid = document.createElement('div');
    grid.className = `lzn-option-card-grid ${extraClass || ''}`.trim();
    grid.setAttribute('aria-label', 'Available options');

    options.forEach((option, index) => {
      const presentation = optionPresentation(option, index);
      let quantity = 0;
      const card = document.createElement('div');
      card.className = 'lzn-option-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${presentation.name}, ${presentation.price}, add to cart`);
      card.title = presentation.name;
      card.innerHTML = `
        <img class="lzn-option-card__image" alt="" loading="lazy">
        <span class="lzn-option-card__body">
          <span class="lzn-option-card__price"></span>
          <span class="lzn-option-card__quantity">
            <button type="button" class="lzn-option-card__minus" aria-label="Decrease quantity">−</button>
            <span class="lzn-option-card__count">0</span>
            <button type="button" class="lzn-option-card__plus" aria-label="Increase quantity">+</button>
          </span>
        </span>
      `;
      const image = card.querySelector('.lzn-option-card__image');
      image.src = presentation.image;
      image.alt = presentation.name;
      card.querySelector('.lzn-option-card__price').textContent = presentation.price;
      const count = card.querySelector('.lzn-option-card__count');
      const minus = card.querySelector('.lzn-option-card__minus');
      const plus = card.querySelector('.lzn-option-card__plus');

      const addOne = () => {
        select.value = option.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        grid.querySelectorAll('.lzn-option-card').forEach(item =>
          item.classList.toggle('is-selected', item === card)
        );
        if (addButton) {
          window.setTimeout(() => addButton.click(), 0);
        }
        quantity += 1;
        count.textContent = String(quantity);
      };

      card.addEventListener('click', event => {
        if (event.target.closest('.lzn-option-card__quantity')) return;
        addOne();
      });
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          addOne();
        }
      });
      plus.addEventListener('click', event => {
        event.stopPropagation();
        addOne();
      });
      minus.addEventListener('click', event => {
        event.stopPropagation();
        if (quantity < 1) return;
        if (clickCartDecrease(presentation.model, quantity === 1)) {
          quantity -= 1;
          count.textContent = String(quantity);
          if (quantity === 0) card.classList.remove('is-selected');
        }
      });
      grid.appendChild(card);
    });

    return grid;
  }

  function findAddButton(scope) {
    return Array.from(scope.querySelectorAll('button')).find(button =>
      /add to cart/i.test(button.textContent || '')
    );
  }

  function enhanceCard(card) {
    if (card.dataset.lznOptionCards === 'ready') return;
    if (!/\bLZN-\d+/.test(card.textContent || '') && !/job\s*tray/i.test(card.textContent || '')) return;

    const select = card.querySelector('select');
    if (!select) return;
    const grid = buildOptionGrid(select, findAddButton(card), '');
    if (!grid) return;

    select.classList.add('lzn-original-option-select');
    select.insertAdjacentElement('afterend', grid);
    card.dataset.lznOptionCards = 'ready';
  }

  function enhanceDetailSelect(select) {
    if (select.classList.contains('lzn-original-option-select')) return;
    if (!Array.from(select.options).some(option => /\bLZN-\d+-\d+/.test(option.textContent || ''))) return;

    const scope = select.closest(
      'dialog, [role="dialog"], .product-detail, .detail-panel, .modal, .modal-content, main'
    ) || document.body;
    const grid = buildOptionGrid(select, findAddButton(scope), 'lzn-option-card-grid--detail');
    if (!grid) return;

    select.classList.add('lzn-original-option-select');
    select.insertAdjacentElement('afterend', grid);
  }

  function enhanceAll() {
    document.querySelectorAll('.product-card, [data-product-card], article').forEach(enhanceCard);
    document.querySelectorAll('select').forEach(enhanceDetailSelect);
  }

  installStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll, { once: true });
  } else {
    enhanceAll();
  }
  new MutationObserver(enhanceAll).observe(document.body, { childList: true, subtree: true });
})();
