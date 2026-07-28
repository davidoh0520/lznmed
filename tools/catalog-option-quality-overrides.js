(function () {
  var cleanMainModels = [
    "1001", "1002", "1003", "1004", "1005", "1006", "1008", "1010",
    "1011", "1012", "1013", "1014", "1016", "1017", "1019", "1020",
    "1021", "1022", "1023", "1024", "1025", "1026", "1027", "1028",
    "1031", "1032", "1034", "1035", "1037", "1038", "1039", "1041",
    "1042", "1043", "1044", "1045", "1046"
  ];

  var mainOverrides = cleanMainModels.reduce(function (result, model) {
    result["LZN-TL-" + model] =
      "/tools/assets/catalog/main-clean-english-20260728/tl" + model + ".webp";
    return result;
  }, {});

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

  function applyMain(item) {
    var image = mainOverrides[item.model];
    if (!image) return;

    item.image = image;
    item.title = image;
    item.images = [image];
  }

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
      applyMain(item);
      apply(item, item.options);
    });
  });

  var series =
    typeof PRODUCT_SERIES !== "undefined"
      ? PRODUCT_SERIES
      : window.PRODUCT_SERIES || [];

  series.forEach(function (group) {
    (group.items || []).forEach(function (item) {
      applyMain(item);
      apply(item, item.colors);
    });
  });
})();
