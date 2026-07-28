(function () {
  function bind(root) {
    if (!root || root.dataset.marketplaceBound === 'true') return;
    const scroller = root.querySelector('.marketplace-scroll');
    const buttons = [...root.querySelectorAll('[data-marketplace-target]')];
    const sections = [...root.querySelectorAll('[data-marketplace-section]')];
    if (!scroller || !buttons.length || !sections.length) return;

    root.dataset.marketplaceBound = 'true';
    const select = id => {
      buttons.forEach(button => {
        const active = button.dataset.marketplaceTarget === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
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
