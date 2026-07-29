(function () {
  function bind(root) {
    if (!root || root.dataset.marketplaceBound === 'true') return;
    const scroller = root.querySelector('.marketplace-scroll');
    const buttons = [...root.querySelectorAll('[data-marketplace-target]')];
    const sections = [...root.querySelectorAll('[data-marketplace-section]')];
    if (!scroller || !buttons.length || !sections.length) return;

    root.dataset.marketplaceBound = 'true';
    let selectedId = buttons.find(button => button.classList.contains('active'))?.dataset.marketplaceTarget || '';
    const keepCategoryVisible = button => {
      const nav = button?.closest('.marketplace-major-nav');
      if (!nav || nav.scrollHeight <= nav.clientHeight) return;
      const centeredTop = button.offsetTop - (nav.clientHeight - button.offsetHeight) / 2;
      const maxTop = Math.max(0, nav.scrollHeight - nav.clientHeight);
      nav.scrollTo({ top: Math.max(0, Math.min(centeredTop, maxTop)), behavior: 'smooth' });
    };
    const categoryPreviewMedia = window.matchMedia('(max-width: 720px)');
    const syncCategoryPreview = activeButton => {
      const compact = categoryPreviewMedia.matches;
      buttons.forEach(button => {
        const image = button.querySelector('img');
        const active = button === activeButton;
        button.querySelector('.lens-category-envelope')?.toggleAttribute('hidden', compact && !active);
        if (!image) return;
        image.hidden = compact && !active;
        image.setAttribute('aria-hidden', String(compact && !active));
        if ((!compact || active) && image.dataset.catalogSrc) {
          image.fetchPriority = 'low';
          image.src = image.dataset.catalogSrc;
          image.removeAttribute('data-catalog-src');
        }
      });
    };
    const select = id => {
      if (!id) return;
      if (id === selectedId) {
        syncCategoryPreview(buttons.find(button => button.dataset.marketplaceTarget === id));
        return;
      }
      selectedId = id;
      let activeButton = null;
      buttons.forEach(button => {
        const active = button.dataset.marketplaceTarget === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        if (active) activeButton = button;
      });
      syncCategoryPreview(activeButton);
      if (activeButton) requestAnimationFrame(() => keepCategoryVisible(activeButton));
    };
    const initialButton = buttons.find(button => button.dataset.marketplaceTarget === selectedId) || buttons[0];
    syncCategoryPreview(initialButton);
    const handlePreviewModeChange = () => syncCategoryPreview(buttons.find(button => button.dataset.marketplaceTarget === selectedId) || buttons[0]);
    if (categoryPreviewMedia.addEventListener) categoryPreviewMedia.addEventListener('change', handlePreviewModeChange);
    else categoryPreviewMedia.addListener(handlePreviewModeChange);
    const scrollTo = target => {
      const top = target.offsetTop - 64;
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    buttons.forEach(button => button.addEventListener('click', () => {
      const target = root.querySelector(`[data-marketplace-section="${CSS.escape(button.dataset.marketplaceTarget)}"]`);
      if (!target) return;
      select(button.dataset.marketplaceTarget);
      scrollTo(target);
    }));
    root.querySelectorAll('[data-marketplace-subtarget]').forEach(button => {
      button.addEventListener('click', () => {
        const target = root.querySelector(`#${CSS.escape(button.dataset.marketplaceSubtarget)}`);
        if (!target) return;
        button.closest('.marketplace-subnav')?.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
        scrollTo(target);
      });
    });

    let scheduled = false;
    scroller.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const marker = scroller.scrollTop + Math.min(180, scroller.clientHeight * .28);
        let current = sections[0];
        sections.forEach(section => {
          if (section.offsetTop <= marker) current = section;
        });
        if (current) select(current.dataset.marketplaceSection);
      });
    }, { passive: true });
  }

  window.LZNMarketplace = { bind };
})();
