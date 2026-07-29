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
    const select = id => {
      if (!id || id === selectedId) return;
      selectedId = id;
      let activeButton = null;
      buttons.forEach(button => {
        const active = button.dataset.marketplaceTarget === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        if (active) activeButton = button;
      });
      if (activeButton) requestAnimationFrame(() => keepCategoryVisible(activeButton));
    };
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
