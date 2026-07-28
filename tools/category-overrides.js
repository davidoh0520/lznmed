(function () {
  var catalog = window.CATALOG_DATA || [];
  var casesIndex = catalog.findIndex(function (category) {
    return category.id === "cases";
  });
  var contactCases = catalog.find(function (category) {
    return category.id === "contact-lens-cases";
  });

  if (!contactCases) {
    contactCases = {
      id: "contact-lens-cases",
      en: "Contact Lens Care & Cases",
      desc: "Cases, rinse bottles, drain trays, organizers, and care accessories for soft contact lenses and RGP lenses.",
      items: []
    };
    catalog.splice(casesIndex >= 0 ? casesIndex + 1 : catalog.length, 0, contactCases);
  }

  var contactCaseModels = new Set([
    "LZN-622631947328",
    "LZN-723662946871",
    "LZN-723282936906",
    "LZN-662993495475",
    "LZN-739604037804",
    "LZN-612244347689",
    "LZN-763152459242",
    "LZN-678366350023",
    "LZN-658527917520"
  ]);
  var movedModels = new Set((contactCases.items || []).map(function (item) {
    return item.model;
  }));

  catalog.forEach(function (category) {
    if (category.id === "contact-lens-cases") return;

    category.items = (category.items || []).filter(function (item) {
      var searchable = [
        item.nameEn,
        item.chineseName,
        item.description
      ].filter(Boolean).join(" ");
      var isContactCase =
        contactCaseModels.has(item.model) ||
        /(?:contact|RGP)\s+lens.*(?:case|storage|organizer|rinse|rinsing|drain|bottle)/i.test(searchable);

      if (!isContactCase) return true;
      if (!movedModels.has(item.model)) {
        item.category = "contact-lens-cases";
        contactCases.items.push(item);
        movedModels.add(item.model);
      }
      return false;
    });
  });

  var productRoutes = [
    {
      categoryId: "lens-cloths",
      models: new Set([
        "LZN-TL-0017",
        "LZN-TL-0020",
        "LZN-651195961829",
        "LZN-669731145847"
      ])
    },
    {
      categoryId: "accessories",
      models: new Set([
        "LZN-TL-0018",
        "LZN-TL-0019",
        "LZN-670127834258"
      ])
    }
  ];

  productRoutes.forEach(function (route) {
    var target = catalog.find(function (category) {
      return category.id === route.categoryId;
    });
    if (!target) return;

    var existingModels = new Set((target.items || []).map(function (item) {
      return item.model;
    }));

    catalog.forEach(function (category) {
      if (category.id === route.categoryId) return;
      category.items = (category.items || []).filter(function (item) {
        if (!route.models.has(item.model)) return true;
        if (!existingModels.has(item.model)) {
          item.category = route.categoryId;
          target.items.push(item);
          existingModels.add(item.model);
        }
        return false;
      });
    });
  });
})();
