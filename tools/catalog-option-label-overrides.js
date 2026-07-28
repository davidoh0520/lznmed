(function () {
  var specialLabels = {
    "LZN-TL-1007": [
      "Single-Tier Basic - White",
      "Double-Tier Classic - Brown",
      "Double-Tier Elegant - White",
      "Triple-Tier Classic - Brown",
      "Triple-Tier Elegant - White",
      "Double-Tier Elegant - White - Set A",
      "Double-Tier Elegant - White - Set B",
      "Double-Tier Elegant - White - Set C",
      "Double-Tier Elegant - White - Set D",
      "Double-Tier Classic - Brown - Set A",
      "Double-Tier Classic - Brown - Set B",
      "Double-Tier Classic - Brown - Set C",
      "Double-Tier Classic - Brown - Set D",
      "Double-Tier Classic - Brown - Set E",
      "Triple-Tier Classic - Brown - Set A",
      "Triple-Tier Classic - Brown - Set B",
      "Triple-Tier Classic - Brown - Set C",
      "Triple-Tier Classic - Brown - Set D",
      "Triple-Tier Classic - Brown - Set E",
      "Triple-Tier Elegant - White - Set A",
      "Triple-Tier Elegant - White - Set B",
      "Triple-Tier Elegant - White - Set C",
      "Triple-Tier Elegant - White - Set D",
      "Triple-Tier Elegant - White - Set E",
      "Single-Tier Basic - White - Set A",
      "Single-Tier Basic - White - Set B",
      "Single-Tier Basic - White - Set C"
    ]
  };

  function styleName(index) {
    var value = index + 1;
    var label = "";
    while (value > 0) {
      value -= 1;
      label = String.fromCharCode(65 + (value % 26)) + label;
      value = Math.floor(value / 26);
    }
    return "Style " + label;
  }

  function cleanLabel(value, index) {
    var label = String(value || "")
      .replace(/^.*?\boption\s*\d+\b\s*[-:·]*\s*/i, "")
      .replace(/^[\s\-:·]+|[\s\-:·]+$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!label || /^option$/i.test(label)) {
      return styleName(index);
    }

    return label;
  }

  function normalizeOptions(options, model) {
    (options || []).forEach(function (option, index) {
      var current = option.name || option.label || option.title || "";
      var labels = specialLabels[model] || [];
      var label = labels[index] || cleanLabel(current, index);
      option.name = label;
      option.label = label;
      option.title = label;
      option.displayName = label;
    });
  }

  (window.CATALOG_DATA || []).forEach(function (category) {
    (category.items || []).forEach(function (item) {
      normalizeOptions(item.options, item.model);
    });
  });

  var series =
    typeof PRODUCT_SERIES !== "undefined"
      ? PRODUCT_SERIES
      : window.PRODUCT_SERIES || [];

  series.forEach(function (group) {
    (group.items || []).forEach(function (item) {
      normalizeOptions(item.colors, item.model);
    });
  });
})();
