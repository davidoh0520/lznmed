(function () {
  const categoryId = "dyeing-machines";
  const asset = model => `/devices/assets/web/products/${model}.webp`;
  const product = ({
    model,
    nameEn,
    description,
    features,
    packageSize,
    grossWeight,
    packingQuantity,
    cartonSize,
    cartonGrossWeight
  }) => ({
    category: categoryId,
    model,
    nameEn,
    image: asset(model),
    images: [asset(model)],
    description,
    features,
    priceOnRequest: true,
    priceDisplay: "Price on request",
    packageSize,
    grossWeight,
    packingQuantity,
    cartonSize,
    cartonGrossWeight
  });

  const items = [
    product({
      model: "DM-2",
      nameEn: "2-Pot Lens Dyeing Machine",
      description: "Compact bench-top lens dyeing machine with two stainless-steel pots and individual controls for optical workshop use.",
      features: [
        "2 stainless-steel dyeing pots",
        "Individual power controls",
        "Compact bench-top housing"
      ],
      packageSize: "33 × 17 × 21 cm",
      grossWeight: "2.4 kg",
      packingQuantity: "4 pcs/carton",
      cartonSize: "43 × 38 × 50 cm",
      cartonGrossWeight: "10.5 kg"
    }),
    product({
      model: "DM-4",
      nameEn: "4-Pot Lens Dyeing Machine",
      description: "Four-pot bench-top lens dyeing machine with individual controls and a front mechanical timer for optical workshop use.",
      features: [
        "4 stainless-steel dyeing pots",
        "Individual power controls",
        "Front mechanical timer"
      ],
      packageSize: "39 × 37 × 22 cm",
      grossWeight: "5 kg",
      packingQuantity: "2 pcs/carton",
      cartonSize: "43 × 38 × 50 cm",
      cartonGrossWeight: "10.9 kg"
    }),
    product({
      model: "DM-6",
      nameEn: "6-Pot Lens Dyeing Machine",
      description: "Six-pot bench-top lens dyeing machine with individual controls and a front mechanical timer for higher-volume optical workshop use.",
      features: [
        "6 stainless-steel dyeing pots",
        "Individual power controls",
        "Front mechanical timer"
      ],
      packageSize: "51 × 37 × 22 cm",
      grossWeight: "6.4 kg",
      packingQuantity: "2 pcs/carton",
      cartonSize: "55 × 47 × 40 cm",
      cartonGrossWeight: "15.1 kg"
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
      en: "Dyeing Machines",
      desc: "Multi-pot bench-top dyeing machines for professional optical workshops.",
      items
    });
  }
  window.CATALOG_DATA = catalog;
})();
