(function () {
  const category = (window.CATALOG_DATA || []).find(item => item.id === "trial-lens-sets");
  if (!category) return;

  const model = "JS-22";
  if ((category.items || []).some(item => String(item.model).toUpperCase() === model)) return;

  const image = "/devices/assets/web/products/JS-22.webp";
  category.items.push({
    category: "trial-lens-sets",
    model,
    nameEn: "22-Piece Progressive Trial Lens Set",
    image,
    images: [image],
    description: "Compact professional progressive trial lens set with 22 metal-rim lenses in an aluminium carrying case.",
    priceOnRequest: true,
    priceDisplay: "Price on request",
    packageSize: "22 × 18 × 9 cm",
    grossWeight: "0.9 kg",
    features: [
      "22-piece progressive trial lens set",
      "Metal lens rims",
      "Aluminium carrying case",
      "For progressive lens testing and fitting"
    ]
  });
})();
