(() => {
  const catalog = window.CATALOG_DATA || [];
  const lensmeterIndex = catalog.findIndex(category => category.id === 'lensmeter');
  if (lensmeterIndex >= 0) {
    window.CATALOG_DATA = catalog.slice(0, lensmeterIndex + 1);
  }
})();
