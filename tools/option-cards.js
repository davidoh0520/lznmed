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

  function enhanceCard(card) {
    if (card.dataset.lznOptionCards === 'ready') return;
    if (!/\bLZN-\d+/.test(card.textContent || '') && !/job\s*tray/i.test(card.textContent || '')) return;

    const select = card.querySelector('select');
    if (!select) return;
    const options = Array.from(select.options).filter(option =>
      !option.disabled && option.value !== ''
    );
    if (!options.length) return;

    const addButton = Array.from(card.querySelectorAll('button')).find(button =>
      /add to cart/i.test(button.textContent || '')
    );
    const grid = document.createElement('div');
    grid.className = 'lzn-option-card-grid';
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

    select.classList.add('lzn-original-option-select');
    select.insertAdjacentElement('afterend', grid);
    card.dataset.lznOptionCards = 'ready';
  }

  function enhanceAll() {
    document.querySelectorAll('.product-card, [data-product-card], article').forEach(enhanceCard);
  }

  installStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll, { once: true });
  } else {
    enhanceAll();
  }
  new MutationObserver(enhanceAll).observe(document.body, { childList: true, subtree: true });
})();
