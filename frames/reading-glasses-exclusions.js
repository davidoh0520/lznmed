(function () {
  var series = typeof PRODUCT_SERIES !== "undefined"
    ? PRODUCT_SERIES
    : (window.PRODUCT_SERIES || []);

  series.forEach(function (group) {
    group.items = (group.items || []).filter(function (item) {
      var name = item.productTitle || item.nameEn || "";
      return !(/\breading glasses\b/i.test(name) && !/\b(?:case|holder|pouch)\b/i.test(name));
    });
  });
})();
