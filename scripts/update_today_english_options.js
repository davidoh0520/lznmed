const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repo = path.resolve(__dirname, "..");
const catalogFile = path.join(repo, "tools", "catalog-products.js");
const sandbox = { window: {} };

vm.runInNewContext(fs.readFileSync(catalogFile, "utf8"), sandbox, {
  filename: catalogFile,
});

const data = sandbox.window.CATALOG_DATA;
const products = {
  "1046054732193": {
    name: "Complete Nose-Pad Installation Kit",
    description:
      "A complete optical workshop kit for installing and adjusting screw-mounted nose pads with precision.",
    labels: [
      "Complete Nose-Pad Installation Kit - 5 mm",
      "Complete Nose-Pad Installation Kit - 3 mm",
      "Complete Nose-Pad Installation Kit - 1 mm",
    ],
  },
  "599830820788": {
    name: "Press-Type Alcohol Dispenser Bottles and Parts",
    description:
      "Press-type dispenser bottles and replacement parts for controlled dispensing of workshop cleaning liquids.",
    labels: [
      "4C Straight-Nozzle Press Bottle - White",
      "4C Straight-Nozzle Press Bottle - Pink",
      "4C Straight-Nozzle Press Bottle - Blue",
      "6C Straight-Nozzle Press Bottle - White",
      "6C Straight-Nozzle Press Bottle - Blue",
      "8C Straight-Nozzle Press Bottle - Pink",
      "8C Straight-Nozzle Press Bottle - Blue",
      "9C Straight-Nozzle Press Bottle - White",
      "72 mm Straight Brass-Core Nozzle",
      "4A Anti-Spray Press Bottle - White",
      "4A Anti-Spray Press Bottle - Pink",
      "4A Anti-Spray Press Bottle - Blue",
      "6A Anti-Spray Press Bottle - White",
      "6A Anti-Spray Press Bottle - Pink",
      "6A Anti-Spray Press Bottle - Blue",
      "8A Anti-Spray Press Bottle - Pink",
      "8A Anti-Spray Press Bottle - Blue",
      "9A Anti-Spray Press Bottle - White",
      "72 mm Anti-Spray Brass-Core Nozzle",
      "200 ml Suction Tubes - 10 Pieces",
      "250 ml Suction Tubes - 10 Pieces",
      "500 ml Suction Tubes - 10 Pieces",
    ],
  },
  "628686984636": {
    name: "Aluminum Magnetic Screw Tray",
    description:
      "A compact magnetic aluminum tray that keeps small optical screws and metal parts organized during repairs.",
    labels: [
      "Gold Aluminum Magnetic Screw Tray",
      "Red Aluminum Magnetic Screw Tray",
      "Purple Aluminum Magnetic Screw Tray",
    ],
  },
  "729967954702": {
    name: "Children's Fabric Eye Patches",
    description:
      "Comfortable fabric eye patches for pediatric vision training, available in multiple sizes, colors, and patterns.",
    labels: [
      "Blue Fabric Eye Patch",
      "Pink Fabric Eye Patch",
      "Black Fabric Eye Patch",
      "Blue Large Fabric Eye Patch",
      "Black Large Fabric Eye Patch",
      "Pink Fabric Eye Patches - 6 Pieces",
      "Pink Cartoon Eye Patch Set A - 6 Pieces",
      "Pink Cartoon Eye Patch Set B - 6 Pieces",
      "Blue Cartoon Eye Patch Set A - 6 Pieces",
      "Blue Cartoon Eye Patch Set B - 6 Pieces",
      "Pink Pattern Eye Patch Set",
      "Blue Pattern Eye Patch Set",
    ],
  },
  "739204891463": {
    name: "Enlarged Anatomical Eye Models",
    description:
      "Detailed anatomical eye models for clinical education, patient explanation, and ophthalmic display.",
    labels: [
      "3x Enlarged Eye Model - 7 Parts",
      "6x Enlarged Eye Model - 8 Parts",
      "3x Eye and Orbit Model - 10 Parts",
    ],
  },
  "760918224534": {
    name: "Round Silicone Nose Pads",
    description:
      "Soft round silicone nose pads designed to improve eyewear comfort and reduce pressure at the nose bridge.",
    labels: [
      "Black Large Round Nose Pads - 2 Pairs",
      "Clear Large Round Nose Pads - 2 Pairs",
      "Black Small Round Nose Pads - 2 Pairs",
      "Clear Small Round Nose Pads - 2 Pairs",
      "Black Large Round Nose Pads - 4 Pairs",
      "Clear Large Round Nose Pads - 4 Pairs",
      "Black Small Round Nose Pads - 4 Pairs",
      "Clear Small Round Nose Pads - 4 Pairs",
    ],
  },
  "815613043837": {
    name: "3D Amblyopia Eye Patch",
    description:
      "A contoured light-blocking eye patch for adult and pediatric amblyopia training with a comfortable three-dimensional fit.",
    labels: [
      "Adult 3D Amblyopia Eye Patch - 1 Piece",
      "Adult 3D Amblyopia Eye Patches - 2 Pieces",
      "Adult 3D Amblyopia Eye Patches - 3 Pieces",
      "Child 3D Amblyopia Eye Patch - 1 Piece",
      "Child 3D Amblyopia Eye Patches - 2 Pieces",
      "Child 3D Amblyopia Eye Patches - 3 Pieces",
    ],
  },
  "821168484924": {
    name: "Decorative Eyeglass Holder Loops",
    description:
      "Decorative holder loops that attach securely to eyewear for use with chains, cords, and personalized accessories.",
    labels: [
      "White Plain Eyeglass Holder Loops",
      "White Red-Blue Enamel Holder Loops",
      "Black Blue Enamel Holder Loops",
      "Black Silver-Pattern Holder Loops",
      "White Multicolor Enamel Holder Loops",
      "White Silver-Floral Holder Loops",
      "White Gold Lucky-Charm Holder Loops",
    ],
  },
  "837845339246": {
    name: "Professional Eyeglass Repair Pliers",
    description:
      "Specialized optical pliers for frame adjustment, lens fitting, nose-pad work, cutting, and precision eyewear repair.",
    labels: [
      "10-Piece Eyeglass Repair Pliers Set",
      "AC21 Half-Round Plastic-Jaw Pliers",
      "A38 Straight Suction-Cup Pliers",
      "AC29 Lens-Ring Adjustment Pliers",
      "AC14 Nose-Pad Pliers",
      "AC47 Cutting Pliers",
      "AC59 Triangular Plastic-Jaw Pliers",
      "AC15 Curved Nose-Pad Pliers",
      "AC901 Small Square Plastic-Jaw Pliers",
    ],
  },
  "950197809027": {
    name: "Adjustable Eyeglass Retention Cord",
    description:
      "An adjustable retention cord that helps keep eyewear secure during sports, work, and everyday activity.",
    labels: ["Blue Adjustable Eyeglass Retention Cord"],
  },
  "964903108732": {
    name: "Nasal-Bridge Pressure-Relief Tape",
    description:
      "Soft cushioning tape for reducing localized pressure and improving comfort at the eyewear nose bridge.",
    labels: ["Nasal-Bridge Pressure-Relief Tape - 3 Rolls"],
  },
  "969193151157": {
    name: "Adjustable Eyeglass Strap",
    description:
      "A lightweight adjustable strap that keeps eyeglasses secure and comfortable during active use.",
    labels: [
      "Black Eyeglass Strap - 2 Pieces",
      "Red Eyeglass Strap - 2 Pieces",
      "Brown Eyeglass Strap - 2 Pieces",
      "Blue Eyeglass Strap - 2 Pieces",
    ],
  },
  "983486693358": {
    name: "Round Occluder Set",
    description:
      "Handheld round occluders for monocular vision screening, refraction support, and clinical eye examinations.",
    labels: [
      "Single Round Occluder",
      "Triple Round Occluder Set",
      "Double Round Occluder Set",
    ],
  },
};

const cleanImageIds = new Set([
  "821168484924",
  "969193151157",
  "983486693358",
]);

function optionImage(id, index) {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");

  if (id === "1046054732193" && number === 2) {
    return "assets/catalog/1046054732193/english-option-01.png";
  }

  if (id === "815613043837" && number === 3) {
    return "assets/catalog/815613043837/english-option-02.png";
  }

  if (id === "815613043837" && (number === 5 || number === 6)) {
    return "assets/catalog/815613043837/english-option-04.png";
  }

  const extension = cleanImageIds.has(id) ? "webp" : "png";
  return `assets/catalog/${id}/english-option-${padded}.${extension}`;
}

const found = new Set();

for (const category of data) {
  for (const product of category.items || []) {
    const serialized = JSON.stringify(product);
    const id = Object.keys(products).find((candidate) =>
      serialized.includes(candidate),
    );

    if (!id || found.has(id)) {
      continue;
    }

    const specification = products[id];
    if (
      !Array.isArray(product.options) ||
      product.options.length !== specification.labels.length
    ) {
      throw new Error(
        `Option count mismatch for ${id}: catalog=${
          product.options && product.options.length
        }, expected=${specification.labels.length}`,
      );
    }

    product.nameEn = specification.name;
    if (Object.prototype.hasOwnProperty.call(product, "name")) {
      product.name = specification.name;
    }
    product.description = specification.description;
    product.image = optionImage(id, 0);

    product.options.forEach((option, index) => {
      option.label = specification.labels[index];
      if (Object.prototype.hasOwnProperty.call(option, "nameEn")) {
        option.nameEn = specification.labels[index];
      }
      if (Object.prototype.hasOwnProperty.call(option, "name")) {
        option.name = specification.labels[index];
      }
      option.image = optionImage(id, index);
    });
    product.images = [
      ...new Set(product.options.map((option) => option.image).filter(Boolean)),
    ];

    found.add(id);
  }
}

const missing = Object.keys(products).filter((id) => !found.has(id));
if (missing.length) {
  throw new Error(`Products not found: ${missing.join(", ")}`);
}

fs.writeFileSync(
  catalogFile,
  `window.CATALOG_DATA = ${JSON.stringify(data, null, 2)};\n`,
  "utf8",
);

const indexFile = path.join(repo, "tools", "index.html");
const index = fs
  .readFileSync(indexFile, "utf8")
  .replace(
    /catalog-products\.js\?v=[^"'<>]+/g,
    "catalog-products.js?v=20260726-7",
  );

fs.writeFileSync(indexFile, index, "utf8");
console.log(`Updated products: ${found.size}`);
