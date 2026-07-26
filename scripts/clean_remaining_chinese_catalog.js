const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repo = path.resolve(__dirname, "..");
const catalogFile = path.join(repo, "tools", "catalog-products.js");
const sandbox = { window: { CATALOG_DATA: [] } };

vm.runInNewContext(fs.readFileSync(catalogFile, "utf8"), sandbox, {
  filename: catalogFile,
});

const cleanImageIds = new Set([
  "15333423615",
  "20052613980",
  "582020332203",
  "594853758645",
  "608800446878",
  "624508088377",
  "632477033344",
  "673765851712",
  "738268296093",
  "779201236504",
  "807888035006",
  "808569964690",
  "816789510780",
  "840574461963",
  "886101652276",
  "898461568746",
  "948519747052",
  "951327613005",
  "959733497199",
  "972711305522",
  "976152256120",
  "983202892410",
  "989792061106",
  "1007095936432",
  "1009238894295",
  "1011125552269",
  "1014803725583",
  "1028215754918",
  "1034702556904",
]);

const productCopy = {
  "840574461963": {
    name: "Flip-Up Multifocal Reading Glasses",
    description:
      "Flip-up multifocal reading glasses support near, intermediate, and distance viewing with a convenient lifting front.",
  },
  "624508088377": {
    name: "Optical Lens Layout Marking Gauge",
    description:
      "A precision optical gauge for marking parallel reference lines and checking lens layout during workshop preparation.",
  },
  "1011125552269": {
    name: "Portable Ultrasonic Contact Lens Cleaner",
    description:
      "A compact ultrasonic cleaning unit for deep cleaning contact lenses with dedicated left and right lens chambers.",
  },
  "589448610321": {
    name: "Microfiber Lens Cleaning Cloth",
    description:
      "A soft microfiber cleaning cloth for removing fingerprints, dust, and light residue from optical lenses.",
  },
  "670890306251": {
    name: "Wooden Eyewear Display Stand",
    description:
      "A compact wooden display stand for presenting multiple eyewear styles on counters, shelves, and showcases.",
  },
  "1030400367140": {
    name: "Multi-Level Metal Eyewear Display Rack",
    description:
      "A multi-level metal rack that organizes and presents eyewear clearly in optical stores and display areas.",
  },
  "628352782969": {
    name: "Eyewear Display Head Stand",
    description:
      "A compact display head stand for presenting eyeglasses and sunglasses in a natural wearing position.",
  },
  "1000973896135": {
    name: "Magnetic Metal Eyewear Display Plates",
    description:
      "Durable metal display plates for creating clean, stable eyewear presentation fixtures and retail displays.",
  },
  "816789510780": {
    name: "Multi-Tier Eyewear Storage Rack",
    description:
      "A space-saving multi-tier rack for organizing multiple pairs of eyewear on counters, shelves, or inside cabinets.",
  },
  "951327613005": {
    name: "Eyeglass Frame Repair Adhesive Set",
    description:
      "A precision adhesive set for securing and repairing compatible metal, plastic, and resin eyewear components.",
  },
};

function productId(product) {
  return String(product.model || "").match(/(\d{8,})/)?.[1] || "";
}

for (const category of sandbox.window.CATALOG_DATA) {
  for (const product of category.items || []) {
    const id = productId(product);
    const copy = productCopy[id];

    if (copy) {
      const oldGenericName = `LZN Optical Product ${id}`;
      product.nameEn = copy.name;
      product.chineseName = copy.name;
      product.description = copy.description;

      if (Object.prototype.hasOwnProperty.call(product, "name")) {
        product.name = copy.name;
      }

      for (const option of product.options || []) {
        option.label = String(option.label || "").replace(
          oldGenericName,
          copy.name,
        );
      }
    }

    if (!cleanImageIds.has(id)) {
      continue;
    }

    const oldImage = product.image;
    const cleanImage = `assets/catalog/${id}/english-card.png`;
    product.image = cleanImage;

    if (Array.isArray(product.images)) {
      product.images = [
        ...new Set(
          product.images.map((image) =>
            image === oldImage ? cleanImage : image,
          ),
        ),
      ];
    } else {
      product.images = [cleanImage];
    }

    for (const option of product.options || []) {
      if (option.image === oldImage) {
        option.image = cleanImage;
      }
    }
  }
}

fs.writeFileSync(
  catalogFile,
  `(function () {\n  const importedCategories = ${JSON.stringify(
    sandbox.window.CATALOG_DATA,
    null,
    2,
  )};\n  window.CATALOG_DATA = importedCategories;\n})();\n`,
  "utf8",
);

const indexFile = path.join(repo, "tools", "index.html");
const index = fs
  .readFileSync(indexFile, "utf8")
  .replace(
    /catalog-products\.js\?v=[^"'<>]+/g,
    "catalog-products.js?v=20260727-1",
  );

fs.writeFileSync(indexFile, index, "utf8");
