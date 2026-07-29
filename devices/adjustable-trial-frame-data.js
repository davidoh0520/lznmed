(function () {
  const category = (window.CATALOG_DATA || []).find(item => item.id === "trial");
  if (!category) return;

  const asset = model => `/devices/assets/web/products/${model}.webp`;
  const priceSource = "Liangyou untaxed wholesale price × 1.30 ÷ CNY 6.8/USD";
  const items = [
    {
      category: "trial",
      model: "TF-B",
      nameEn: "Adjustable Trial Frame",
      image: asset("TF-B"),
      images: [asset("TF-B")],
      description: "Adjustable trial frame with continuous pupillary-distance control from 48 to 80 mm. PD is adjusted directly on the frame, so no fixed-PD ordering option is required.",
      pdMode: "adjustable",
      pdRange: "48-80 mm",
      basePriceRmb: 95,
      priceSource,
      priceUsd: 18.16,
      priceDisplay: "USD 18.16",
      packageSize: "19 x 10 x 5.5 cm",
      grossWeight: "0.12 kg",
      packingQuantity: "50 pcs/carton",
      cartonSize: "50 x 41 x 30 cm",
      cartonGrossWeight: "6.9 kg",
      features: [
        "Continuous PD adjustment: 48-80 mm",
        "PD adjusts directly on the frame",
        "No fixed-PD ordering option required"
      ]
    },
    {
      category: "trial",
      model: "TF-BT",
      nameEn: "Adjustable Trial Frame",
      image: asset("TF-BT"),
      images: [asset("TF-BT")],
      description: "Adjustable trial frame with continuous pupillary-distance control from 54 to 70 mm. PD is adjusted directly on the frame, so no fixed-PD ordering option is required.",
      pdMode: "adjustable",
      pdRange: "54-70 mm",
      basePriceRmb: 180,
      priceSource,
      priceUsd: 34.41,
      priceDisplay: "USD 34.41",
      packageSize: "16.5 x 9 x 5.5 cm",
      grossWeight: "0.15 kg",
      packingQuantity: "50 pcs/carton",
      cartonSize: "47 x 36 x 30 cm",
      cartonGrossWeight: "7.9 kg",
      features: [
        "Continuous PD adjustment: 54-70 mm",
        "PD adjusts directly on the frame",
        "No fixed-PD ordering option required"
      ]
    },
    {
      category: "trial",
      model: "TF-S",
      nameEn: "Adjustable Trial Frame",
      image: asset("TF-S"),
      images: [asset("TF-S")],
      description: "Adjustable trial frame with continuous pupillary-distance control from 50 to 80 mm. PD is adjusted directly on the frame, so no fixed-PD ordering option is required.",
      pdMode: "adjustable",
      pdRange: "50-80 mm",
      basePriceRmb: 400,
      priceSource,
      priceUsd: 76.47,
      priceDisplay: "USD 76.47",
      packageSize: "18.5 x 10.5 x 6 cm",
      grossWeight: "0.15 kg",
      packingQuantity: "25 pcs/carton",
      cartonSize: "53 x 33 x 22 cm",
      cartonGrossWeight: "4.5 kg",
      features: [
        "Continuous PD adjustment: 50-80 mm",
        "PD adjusts directly on the frame",
        "No fixed-PD ordering option required"
      ]
    }
  ];

  const knownModels = new Set((category.items || []).map(item => String(item.model).toUpperCase()));
  items.forEach(item => {
    if (!knownModels.has(item.model)) category.items.push(item);
  });
})();
