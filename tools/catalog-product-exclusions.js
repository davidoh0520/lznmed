(function () {
  var excludedSourceIds = new Set([
    "626769523006",
    "737807180518",
    "684620908475",
    "685253897109",
    "595399753758",
    "674373644031",
    "607384329144",
    "587412731820"
  ]);

  function isExcluded(item) {
    var model = String(item && (item.legacyModel || item.model) || "");
    var sourceId = model.replace(/^LZN-/, "").split("-")[0];
    return excludedSourceIds.has(sourceId);
  }

  (window.CATALOG_DATA || []).forEach(function (category) {
    category.items = (category.items || []).filter(function (item) {
      return !isExcluded(item);
    });
  });

  var frameSeries = typeof PRODUCT_SERIES !== "undefined"
    ? PRODUCT_SERIES
    : (window.PRODUCT_SERIES || []);
  frameSeries.forEach(function (series) {
    series.items = (series.items || []).filter(function (item) {
      return !isExcluded(item);
    });
  });

  var purchaseSources = window.LZN_ADMIN_PURCHASE_SOURCES || {};
  Object.keys(purchaseSources).forEach(function (publicModel) {
    var source = purchaseSources[publicModel] || {};
    if (excludedSourceIds.has(String(source.sourceProductId || ""))) {
      delete purchaseSources[publicModel];
    }
  });
})();
