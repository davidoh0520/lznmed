(function () {
  var catalog = window.CATALOG_DATA || [];
  var categoryId = "reading-glasses";
  var target = catalog.find(function (category) {
    return category.id === categoryId;
  });

  if (!target) {
    target = {
      id: categoryId,
      en: "Reading Glasses",
      desc: "Ready-to-order reading glasses in compact, foldable, rimless, and multifocal styles.",
      items: []
    };
    var accessoriesIndex = catalog.findIndex(function (category) {
      return category.id === "accessories";
    });
    catalog.splice(accessoriesIndex >= 0 ? accessoriesIndex + 1 : catalog.length, 0, target);
  }

  function option(model, number, label, priceUsd, image) {
    return {
      model: model + "-" + String(number).padStart(2, "0"),
      label: label,
      priceUsd: priceUsd,
      image: image
    };
  }

  function product(config) {
    return {
      category: categoryId,
      model: config.model,
      nameEn: config.name,
      chineseName: config.name,
      image: config.image,
      images: [config.image],
      description: config.description,
      priceUsd: config.priceUsd,
      priceOnRequest: false,
      priceDisplay: config.priceDisplay,
      optionLabel: "Choose style and power",
      options: config.options,
      features: [
        "Designed for comfortable everyday near-vision use.",
        "Multiple styles, colors, or reading powers are available.",
        "Prepared for professional optical retail and customer care."
      ]
    };
  }

  var migratedProducts = [
    product({
      model: "LZN-694016088201",
      name: "Rimless Blue-Light Reading Glasses",
      image: "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp",
      description: "Lightweight rimless reading glasses with blue-light filtering for comfortable everyday near-vision use.",
      priceUsd: 4.58,
      priceDisplay: "USD 4.58",
      options: [
        option("LZN-694016088201", 1, "Option 01 - Pink / Gold", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 2, "Option 02 - Pink / Gold", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 3, "Option 03 - Pink / Gold", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 4, "Option 04 - Pink / Gold", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 5, "Option 05 - Pink / Silver", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 6, "Option 06 - Pink / Silver", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 7, "Option 07 - Pink / Silver", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 8, "Option 08 - Pink / Silver", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp"),
        option("LZN-694016088201", 9, "Option 09 - Pink / Silver", 4.58, "/tools/assets/catalog/incoming-20260728/90abb591d22936957268.webp")
      ]
    }),
    product({
      model: "LZN-594962368226",
      name: "Pen-Style Compact Reading Glasses",
      image: "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp",
      description: "Compact reading glasses in a pen-style format for convenient storage and travel.",
      priceUsd: 1.82,
      priceDisplay: "USD 1.82 - 9.56",
      options: [
        option("LZN-594962368226", 1, "Option 01 - Yellow", 1.82, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 2, "Option 02 - Blue", 1.82, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 3, "Option 03 - Silver", 1.82, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 4, "Option 04 - Red", 9.56, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 5, "Option 05 - Yellow", 9.56, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 6, "Option 06 - Gray / Purple", 9.56, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp"),
        option("LZN-594962368226", 7, "Option 07 - Blue", 9.56, "/tools/assets/catalog/incoming-20260728/e9948e34c6fa5299d7a6.webp")
      ]
    }),
    product({
      model: "LZN-617968191574",
      name: "Foldable Blue-Light Reading Glasses",
      image: "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp",
      description: "Foldable blue-light reading glasses offered in multiple colors and near-vision powers.",
      priceUsd: 7.07,
      priceDisplay: "USD 7.07",
      options: [
        option("LZN-617968191574", 1, "Option 01 - Red / +1.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 2, "Option 02 - Red / +1.50", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 3, "Option 03 - Red / +2.50", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 4, "Option 04 - Red / +3.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 5, "Option 05 - Red / +3.50", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 6, "Option 06 - Red / +4.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 7, "Option 07 - Gold / +1.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 8, "Option 08 - Gold / +1.50", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 9, "Option 09 - Gold / +2.50", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 10, "Option 10 - Gold / +3.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp"),
        option("LZN-617968191574", 11, "Option 11 - Gold / +4.00", 7.07, "/tools/assets/catalog/incoming-20260728/f2dc97a65dba74d48107.webp")
      ]
    })
  ];

  var movedModels = new Set((target.items || []).map(function (item) {
    return item.model;
  }));

  catalog.forEach(function (category) {
    if (category.id === categoryId) return;
    category.items = (category.items || []).filter(function (item) {
      var name = item.nameEn || item.productTitle || "";
      var isReadingGlasses = /\breading glasses\b/i.test(name) && !/\b(?:case|holder|pouch)\b/i.test(name);
      if (!isReadingGlasses) return true;
      if (!movedModels.has(item.model)) {
        item.category = categoryId;
        target.items.push(item);
        movedModels.add(item.model);
      }
      return false;
    });
  });

  migratedProducts.forEach(function (item) {
    if (movedModels.has(item.model)) return;
    target.items.push(item);
    movedModels.add(item.model);
  });
})();
