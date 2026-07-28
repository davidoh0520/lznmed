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
      en: "Contact Lens Cases",
      desc: "Cases and organizers for soft contact lenses, RGP lenses, and lens-care accessories.",
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
    "LZN-763152459242"
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
        /(?:contact|RGP)\s+lens.*(?:case|storage|organizer)/i.test(searchable);

      if (!isContactCase) return true;
      if (!movedModels.has(item.model)) {
        item.category = "contact-lens-cases";
        contactCases.items.push(item);
        movedModels.add(item.model);
      }
      return false;
    });
  });
})();
