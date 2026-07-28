(function () {
  var overrides = {
    "LZN-TL-1007": Array.from({ length: 27 }, function (_, index) {
      return (
        "/tools/assets/catalog/options-clean-english-20260728/tl1007-" +
        String(index + 1).padStart(2, "0") +
        ".webp"
      );
    }),
    "LZN-TL-1009": Array.from({ length: 5 }, function (_, index) {
      return (
        "/tools/assets/catalog/options-20260728-v2/tl1009-clean-" +
        String(index + 1).padStart(2, "0") +
        ".webp"
      );
    }),
    "LZN-FR-1004": Array.from({ length: 5 }, function (_, index) {
      return (
        "/tools/assets/catalog/options-20260728-v2/fr1004-clean-" +
        String(index + 1).padStart(2, "0") +
        ".webp"
      );
    })
  };

  function apply(item, options) {
    var images = overrides[item.model];
    if (!images) return;

    (options || []).forEach(function (option, index) {
      var image = images[Math.min(index, images.length - 1)];
      option.image = image;
      option.src = image;
    });

    item.image = images[0];
    item.title = images[0];
    item.images = images.slice();
  }

  (window.CATALOG_DATA || []).forEach(function (category) {
    (category.items || []).forEach(function (item) {
      apply(item, item.options);
    });
  });

  var series =
    typeof PRODUCT_SERIES !== "undefined"
      ? PRODUCT_SERIES
      : window.PRODUCT_SERIES || [];

  series.forEach(function (group) {
    (group.items || []).forEach(function (item) {
      apply(item, item.colors);
    });
  });
})();
