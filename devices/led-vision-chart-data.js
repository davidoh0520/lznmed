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
  const inquiryProduct = ({
    model,
    nameEn,
    imageModel,
    description,
    features,
    packageSize,
    grossWeight
  }) => ({
    category: categoryId,
    model,
    nameEn,
    image: asset(imageModel || model),
    images: [asset(imageModel || model)],
    description,
    features,
    priceOnRequest: true,
    priceDisplay: "Price on request",
    packageSize,
    grossWeight
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
    }),
    inquiryProduct({
      model: "LY-185",
      nameEn: "18.5-inch LCD Vision Tester",
      imageModel: "LY-185-215-230",
      description: "Remote-controlled LCD vision tester with nine built-in chart series for visual-acuity and related vision examinations. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 18.5 inches",
        "Nine built-in vision-chart series",
        "Tests include acuity, myopia, hyperopia, colour vision and astigmatism",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "52 × 12 × 41 cm",
      grossWeight: "4.6 kg"
    }),
    inquiryProduct({
      model: "LY-215",
      nameEn: "21.5-inch LCD Vision Tester",
      imageModel: "LY-185-215-230",
      description: "Remote-controlled LCD vision tester with nine built-in chart series for visual-acuity and related vision examinations. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 21.5 inches",
        "Nine built-in vision-chart series",
        "Tests include acuity, myopia, hyperopia, colour vision and astigmatism",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "60 × 13 × 45 cm",
      grossWeight: "5.3 kg"
    }),
    inquiryProduct({
      model: "LY-230",
      nameEn: "23-inch LCD Vision Tester",
      imageModel: "LY-185-215-230",
      description: "Remote-controlled 23-inch LCD vision tester with nine built-in chart series for visual-acuity and related vision examinations. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 23 inches",
        "Nine built-in vision-chart series",
        "Tests include acuity, myopia, hyperopia, colour vision and astigmatism",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "68 × 12 × 45 cm",
      grossWeight: "5.6 kg"
    }),
    inquiryProduct({
      model: "LY-230(3D)",
      nameEn: "23-inch 3D LCD Vision Tester",
      imageModel: "LY-185-215-230",
      description: "Remote-controlled 23-inch 3D LCD vision tester with nine built-in chart series for visual-acuity and related vision examinations. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 23 inches",
        "3D-capable LCD vision tester",
        "Nine built-in vision-chart series",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "68 × 12 × 45 cm",
      grossWeight: "5.6 kg"
    }),
    inquiryProduct({
      model: "LY-220A",
      nameEn: "21.5-inch All-in-one LCD Vision Tester",
      description: "All-in-one remote-controlled LCD vision tester with nine built-in chart series for visual-acuity and related vision examinations. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 21.5 inches",
        "All-in-one desktop-style housing",
        "Nine built-in vision-chart series",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "58.5 × 18 × 50 cm",
      grossWeight: "6.5 kg"
    }),
    inquiryProduct({
      model: "LY-215A(3D)",
      nameEn: "21.5-inch 3D LCD Vision Tester",
      imageModel: "LY-215A-3D",
      description: "Remote-controlled 3D LCD vision tester with polarized accessories and nine built-in chart series. Supports test distances from 1 to 6 metres.",
      features: [
        "Screen size: 21.5 inches",
        "Polarized 3D accessories included",
        "Nine built-in vision-chart series",
        "Test distance: 1-6 m",
        "Remote-control operation"
      ],
      packageSize: "60.5 × 15 × 46 cm",
      grossWeight: "5.2 kg"
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
      desc: "Illuminated charts and remote-controlled LCD vision testers for professional examination rooms.",
      items
    });
  }
  window.CATALOG_DATA = catalog;
})();
