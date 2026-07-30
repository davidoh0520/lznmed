(function () {
  const category = (window.CATALOG_DATA || []).find(item => item.id === "tables");
  if (!category) return;

  const model = "LY-180A";
  if ((category.items || []).some(item => String(item.model).toUpperCase() === model)) return;

  const image = "/devices/assets/web/products/LY-180A.webp";
  category.items.push({
    category: "tables",
    model,
    nameEn: "Small Combined Ophthalmic Table",
    image,
    images: [image],
    description: "Compact motorized combined table for optical shops and ophthalmic examination rooms where space is limited. The table provides stable vertical travel, an integrated drawer and a 20 W examination light.",
    basePriceRmb: 1400,
    priceSource: "Liangyou untaxed wholesale price × 1.30 ÷ CNY 6.8/USD",
    priceUsd: 267.65,
    priceOnRequest: false,
    priceDisplay: "USD 267.65",
    packageSize: "99 × 59 × 43 cm",
    grossWeight: "62 kg",
    features: [
      "Compact footprint for optical shops and examination rooms",
      "Unit size: 90 × 60 × 71 cm",
      "Table size: 95 × 52 cm",
      "Drawer size: 54.5 × 32 cm",
      "Vertical travel: 20 cm",
      "Integrated examination light: 20 W",
      "Stable motorized lifting system"
    ]
  });
})();
