(function () {
  const categoryId = "led-vision-charts";
  const asset = model => `/devices/assets/web/products/${model}.webp`;
  const chartStyles = [
    ["SNELLEN", "Snellen E Chart"],
    ["LANDOLT", "Landolt C Chart"],
    ["ENGLISH", "English Letter Chart"],
    ["NUMBERS", "Number Chart"],
    ["CHILDREN", "Children's Picture Chart"]
  ];
  const priceSource = "Liangyou wholesale price × 1.30 ÷ CNY 6.8/USD";
  const options = (model, priceUsd) => chartStyles.map(([code, label]) => ({
    model: `${model}-${code}`,
    label,
    priceUsd,
    image: asset(model)
  }));
  const product = ({
    model,
    nameEn,
    basePriceRmb,
    priceUsd,
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
    basePriceRmb,
    priceSource,
    priceUsd,
    priceDisplay: `USD ${priceUsd.toFixed(2)}`,
    optionLabel: "Chart style",
    options: options(model, priceUsd),
    packageSize,
    grossWeight,
    packingQuantity,
    cartonSize,
    cartonGrossWeight
  });

  const items = [
    product({
      model: "LY-21C",
      nameEn: "Slim LED Vision Chart",
      basePriceRmb: 200,
      priceUsd: 38.24,
      description: "Five-metre illuminated vision chart with a slim aluminium frame. Select the preferred optotype layout when ordering; optional remote control is available.",
      features: [
        "Test distance: 5 m",
        "Product size: 30 × 90 cm",
        "Slim aluminium frame",
        "Optional remote control available"
      ],
      packageSize: "101 × 9 × 35 cm",
      grossWeight: "2.4 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "104 × 39 × 46 cm",
      cartonGrossWeight: "13.2 kg"
    }),
    product({
      model: "LY-22C",
      nameEn: "Multi-function LED Vision Chart",
      basePriceRmb: 255,
      priceUsd: 48.75,
      description: "Five-metre multi-function illuminated vision chart with integrated acuity, colour, fixation and astigmatism tests. Select the preferred optotype layout when ordering.",
      features: [
        "Test distance: 5 m",
        "Product size: 42 × 82 cm",
        "Multi-function test panel",
        "Optional remote control available"
      ],
      packageSize: "95 × 9 × 50 cm",
      grossWeight: "3.3 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "100 × 42 × 55 cm",
      cartonGrossWeight: "17.8 kg"
    }),
    product({
      model: "LY-23C",
      nameEn: "Compact LED Vision Chart",
      basePriceRmb: 140,
      priceUsd: 26.76,
      description: "Compact illuminated vision chart for shorter examination rooms. Select either a 2.5-metre or 3-metre layout and the preferred optotype style when ordering.",
      features: [
        "Test distance: 2.5 m or 3 m",
        "Product size: 30 × 60 cm",
        "Slim aluminium frame",
        "Optional remote control available"
      ],
      packageSize: "69 × 7.5 × 36 cm",
      grossWeight: "1.7 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "72 × 38 × 40 cm",
      cartonGrossWeight: "9.4 kg"
    }),
    product({
      model: "LY-21D",
      nameEn: "Interchangeable LED Vision Chart Set",
      basePriceRmb: 220,
      priceUsd: 42.06,
      description: "Five-metre illuminated vision chart supplied with two replaceable chart panels. Select the primary layout below and specify the second panel with the sales team.",
      features: [
        "Test distance: 5 m",
        "Product size: 26 × 90 cm",
        "Includes two replaceable chart panels",
        "Additional chart panels available"
      ],
      packageSize: "102 × 35 × 9 cm",
      grossWeight: "2.4 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "104 × 39 × 46 cm",
      cartonGrossWeight: "12.7 kg"
    }),
    product({
      model: "LY-23D",
      nameEn: "Compact Interchangeable LED Vision Chart Set",
      basePriceRmb: 160,
      priceUsd: 30.59,
      description: "Compact illuminated vision chart supplied with two replaceable panels for 2.5-metre or 3-metre test rooms. Select the primary layout below and specify the second panel with the sales team.",
      features: [
        "Test distance: 2.5 m or 3 m",
        "Product size: 26 × 60 cm",
        "Includes two replaceable chart panels",
        "Additional chart panels available"
      ],
      packageSize: "74 × 35 × 7 cm",
      grossWeight: "1.3 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "72 × 38 × 40 cm",
      cartonGrossWeight: "8.9 kg"
    }),
    product({
      model: "LY-21E",
      nameEn: "Deep-frame LED Vision Chart",
      basePriceRmb: 160,
      priceUsd: 30.59,
      description: "Five-metre illuminated vision chart with a durable 4 cm deep frame. Select the preferred optotype layout when ordering.",
      features: [
        "Test distance: 5 m",
        "Product size: 26 × 90 cm",
        "4 cm deep frame",
        "Even LED illumination"
      ],
      packageSize: "104 × 35 × 12 cm",
      grossWeight: "3.3 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "106 × 63 × 37 cm",
      cartonGrossWeight: "13.2 kg"
    }),
    product({
      model: "LY-23E",
      nameEn: "Compact Deep-frame LED Vision Chart",
      basePriceRmb: 140,
      priceUsd: 26.76,
      description: "Compact illuminated vision chart with a durable 4 cm deep frame for 2.5-metre or 3-metre examination rooms. Select the preferred optotype layout when ordering.",
      features: [
        "Test distance: 2.5 m or 3 m",
        "Product size: 26 × 60 cm",
        "4 cm deep frame",
        "Even LED illumination"
      ],
      packageSize: "75 × 35 × 12 cm",
      grossWeight: "1.3 kg",
      packingQuantity: "5 pcs/carton",
      cartonSize: "76 × 63 × 37 cm",
      cartonGrossWeight: "9.7 kg"
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
      en: "LED Vision Charts",
      desc: "Illuminated Snellen, Landolt, letter, number and children's vision charts for professional examination rooms.",
      items
    });
  }
  window.CATALOG_DATA = catalog;
})();
