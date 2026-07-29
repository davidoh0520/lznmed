(function () {
  const productImageObservers = new WeakMap();

  function loadProductImage(image, priority = 'auto') {
    const source = image?.dataset.catalogSrc;
    if (!source) return;
    image.fetchPriority = priority;
    image.loading = 'eager';
    image.src = source;
    image.removeAttribute('data-catalog-src');
  }

  function prioritizeCategoryImages(root, categoryId) {
    const compact = window.matchMedia('(max-width: 720px)').matches;
    const sections = [...root.querySelectorAll('[data-marketplace-section]')];
    const section = sections.find(item => item.dataset.marketplaceSection === categoryId) || sections[0];
    const images = [...(section?.querySelectorAll('.marketplace-product-image img[data-catalog-src]') || [])];
    const highPriorityCount = compact ? 4 : 6;
    images.forEach((image, index) => loadProductImage(image, index < highPriorityCount ? 'high' : 'auto'));
  }

  function refreshImages(root) {
    if (!root) return;
    productImageObservers.get(root)?.disconnect();
    const scroller = root.querySelector('.marketplace-scroll');
    if (!scroller) return;

    const activeId = root.querySelector('[data-marketplace-target].active')?.dataset.marketplaceTarget || '';
    prioritizeCategoryImages(root, activeId);
    const images = [...root.querySelectorAll('.marketplace-product-image img[data-catalog-src]')];
    if (!images.length) return;
    if (!('IntersectionObserver' in window)) {
      images.forEach(image => loadProductImage(image));
      return;
    }

    const compact = window.matchMedia('(max-width: 720px)').matches;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadProductImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      root: scroller,
      rootMargin: compact ? '900px 0px' : '1400px 0px',
      threshold: 0.01
    });
    images.forEach(image => observer.observe(image));
    productImageObservers.set(root, observer);
  }

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
          image.fetchPriority = compact && active ? 'high' : 'auto';
          image.loading = 'eager';
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
      refreshImages(root);
      if (activeButton) requestAnimationFrame(() => keepCategoryVisible(activeButton));
    };
    const initialButton = buttons.find(button => button.dataset.marketplaceTarget === selectedId) || buttons[0];
    syncCategoryPreview(initialButton);
    const handlePreviewModeChange = () => syncCategoryPreview(buttons.find(button => button.dataset.marketplaceTarget === selectedId) || buttons[0]);
    if (categoryPreviewMedia.addEventListener) categoryPreviewMedia.addEventListener('change', handlePreviewModeChange);
    else categoryPreviewMedia.addListener(handlePreviewModeChange);
    refreshImages(root);
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

  window.LZNMarketplace = { bind, refresh: refreshImages };
})();
