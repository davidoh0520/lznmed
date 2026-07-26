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
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        border: 1px solid #d8e1e5;
        border-radius: 8px;
        padding: 9px 10px;
        background: #fff;
        color: #12242b;
        text-align: left;
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
      .lzn-option-card__name {
        min-width: 0;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.35;
      }
      .lzn-option-card__price {
        color: #087d8b;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
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
    const priceMatches = text.match(/USD\s+\d+(?:\.\d+)?/gi);
    const price = priceMatches && priceMatches.length
      ? priceMatches[priceMatches.length - 1].toUpperCase()
      : 'Price on request';
    const pieces = text.split(/\s+—\s+/);
    let name = pieces.length > 1 ? pieces[1] : text;
    name = name.replace(/\s+-\s+USD\s+\d+(?:\.\d+)?/gi, '').trim();
    if (!name || /^select/i.test(name)) name = `Option ${String(index + 1).padStart(2, '0')}`;
    return { name, price };
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
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lzn-option-card';
      button.innerHTML = `
        <span class="lzn-option-card__name"></span>
        <span class="lzn-option-card__price"></span>
      `;
      button.querySelector('.lzn-option-card__name').textContent = presentation.name;
      button.querySelector('.lzn-option-card__price').textContent = presentation.price;
      button.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        grid.querySelectorAll('.lzn-option-card').forEach(item =>
          item.classList.toggle('is-selected', item === button)
        );
        if (addButton) {
          window.setTimeout(() => addButton.click(), 0);
        }
      });
      grid.appendChild(button);
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
