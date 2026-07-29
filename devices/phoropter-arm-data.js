(function () {
  const categoryId = "phoropter-arms";
  const asset = model => `/devices/assets/web/products/${model}.webp`;
  const product = ({ model, nameEn, description, features, grossWeight }) => ({
    category: categoryId,
    model,
    nameEn,
    image: asset(model),
    images: [asset(model)],
    description,
    features,
    priceOnRequest: true,
    priceDisplay: "Price on request",
    grossWeight
  });

  const items = [
    product({
      model: "PA-1",
      nameEn: "Counter-mounted Phoropter Arm with Light",
      description: "Counter-mounted articulated phoropter arm with an integrated examination light and curved operating handle for professional examination-room installations.",
      features: [
        "Counter-mounted articulated arm",
        "Integrated examination light",
        "Up/down arm angle: ±30°",
        "Arm rotation: 90°",
        "Curved operating handle"
      ],
      grossWeight: "20 kg"
    }),
    product({
      model: "PA-2",
      nameEn: "Wall-mounted Phoropter Arm",
      description: "Wall-mounted articulated phoropter arm with vertical rail adjustment and an equipment tray for compact professional examination-room installations.",
      features: [
        "Wall-mounted articulated arm",
        "Vertical rail adjustment",
        "Integrated equipment tray",
        "Up/down arm angle: ±30°",
        "Arm rotation: 180°"
      ],
      grossWeight: "14 kg"
    })
  ];

  const categoryIds = Array.isArray(window.LZN_DEVICE_CATEGORY_IDS)
    ? [...window.LZN_DEVICE_CATEGORY_IDS]
    : [];
  if (!categoryIds.includes(categoryId)) {
    window.LZN_DEVICE_CATEGORY_IDS = Object.freeze([...categoryIds, categoryId]);
  }

  const catalog = Array.isArray(window.CATALOG_DATA) ? window.CATALOG_DATA : [];
  if (!catalog.some(category => category.id === categoryId)) {
    catalog.push({
      id: categoryId,
      en: "Phoropter Arms",
      desc: "Counter-mounted and wall-mounted support arms for professional phoropter installations.",
      items
    });
  }
  window.CATALOG_DATA = catalog;
})();
