const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

function browserContext() {
  const context = { window: {} };
  context.window.window = context.window;
  return vm.createContext(context);
}

function deviceProducts() {
  const context = browserContext();
  vm.runInContext(read('devices/catalog-data-devices.js'), context);
  vm.runInContext(read('tools/catalog-option-curation.js'), context);
  return (context.window.CATALOG_DATA || []).flatMap(category =>
    (category.items || []).map(product => ({ ...product, category: product.category || category.id }))
  );
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function legacyDeviceProducts() {
  const html = read('devices/index.html');
  const products = [];
  const cardPattern = /<(button|article)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(cardPattern)) {
    const attributes = match[2];
    if (!/class=(?:"[^"]*\bproduct-card\b[^"]*"|'[^']*\bproduct-card\b[^']*')/i.test(attributes)) continue;
    const body = match[3];
    const heading = body.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
    const title = attributes.match(/data-title=(?:"([^"]*)"|'([^']*)')/i);
    const model = decodeHtml(heading || title?.[1] || title?.[2]);
    if (!model) continue;
    const description = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
    products.push({ model, nameEn: decodeHtml(description) || model, category: 'legacy-device' });
  }
  return products;
}

function toolProducts() {
  const context = browserContext();
  vm.runInContext(read('tools/products.js'), context);
  vm.runInContext(read('tools/catalog-products.js'), context);
  vm.runInContext(read('tools/catalog-product-exclusions.js'), context);
  vm.runInContext(read('tools/catalog-option-curation.js'), context);
  return (context.window.CATALOG_DATA || []).flatMap(category =>
    (category.items || []).map(product => ({ ...product, category: product.category || category.id }))
  );
}

function frameProducts() {
  const context = browserContext();
  vm.runInContext(`${read('frames/products.js')}\n;globalThis.__series = PRODUCT_SERIES;`, context);
  vm.runInContext(read('frames/catalog-products.js'), context);
  vm.runInContext(read('frames/reading-glasses-exclusions.js'), context);
  vm.runInContext(read('tools/catalog-product-exclusions.js'), context);
  vm.runInContext(read('tools/catalog-model-overrides.js'), context);
  vm.runInContext(read('tools/catalog-option-image-overrides.js'), context);
  vm.runInContext(read('tools/catalog-option-curation.js'), context);
  return (context.__series || []).flatMap(series =>
    (series.items || []).map(product => ({ ...product, category: series.code }))
  );
}

function lensProducts() {
  const source = read('lenses/script.js');
  const start = source.indexOf('const products = [');
  const end = source.indexOf('\n];', start);
  if (start < 0 || end < 0) throw new Error('Unable to locate the lenses product array.');
  const context = vm.createContext({});
  vm.runInContext(`${source.slice(start, end + 3)}\nglobalThis.__products = products;`, context);
  return context.__products || [];
}

function numberFrom(value) {
  const match = String(value || '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function dimensionsFrom(value) {
  const dimensions = String(value || '').match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) || [];
  return dimensions.length === 3 ? dimensions : [];
}

function compact(product, store) {
  const dimensions = dimensionsFrom(product.packageSize);
  const cartonDimensions = dimensionsFrom(product.cartonSize);
  return {
    model: String(product.model || product.name || '').trim().toUpperCase(),
    product_name: product.nameEn || product.productTitle || product.name || product.model,
    store_section: store,
    category: product.category || product.cat || '',
    parent_model: product.parentModel || '',
    catalog_package_weight_kg: numberFrom(product.grossWeight),
    catalog_package_dimensions_cm: dimensions,
    catalog_units_per_carton: numberFrom(product.packingQuantity),
    catalog_carton_weight_kg: numberFrom(product.cartonGrossWeight),
    catalog_carton_dimensions_cm: cartonDimensions
  };
}

function orderableOptions(product, store) {
  if (store === 'Frames') {
    return (product.colors || []).map((color, index) => {
      const code = color.code || `C${String(index + 1).padStart(2, '0')}`;
      return { model: `${product.model}-${code}`, label: color.en || color.label || code };
    });
  }
  const options = [...(product.options || [])];
  if (store !== 'Devices') return options;
  if (product.category === 'trial-lens-sets' && options.length > 1 && !options.some(option => /^ALL\b/i.test(option.label || ''))) {
    options.push({ model: `${product.model}-ALL`, label: 'ALL (All configurations)' });
  }
  if (product.pdMode !== 'adjustable' && !options.length) {
    const pdRange = String(product.description || '').match(/Selectable PD:\s*(\d+)\s*-\s*(\d+)\s*mm/i);
    if (pdRange) {
      const minimum = Number(pdRange[1]);
      const maximum = Number(pdRange[2]);
      for (let size = minimum; size <= maximum; size += 2) options.push({ model: `${product.model}-${size}MM`, label: `${size} MM` });
      options.push({ model: `${product.model}-ALL`, label: `ALL (${minimum}-${maximum} MM)` });
    }
  }
  return options;
}

function compactProductModels(product, store) {
  const rootProduct = compact(product, store);
  const variants = orderableOptions(product, store)
    .filter(option => option?.model && String(option.model).toUpperCase() !== rootProduct.model)
    .map(option => compact({
      ...product,
      model: option.model,
      nameEn: `${rootProduct.product_name} — ${option.label || option.name || option.model}`,
      productTitle: null,
      parentModel: rootProduct.model
    }, store));
  return [rootProduct, ...variants];
}

const products = [
  ...toolProducts().flatMap(product => compactProductModels(product, 'Tools')),
  // Devices are also present in the shared tools catalog. Keep this later so
  // the dedicated device classification wins when models overlap.
  ...deviceProducts().flatMap(product => compactProductModels(product, 'Devices')),
  // Older device sections (including unit tables) are rendered directly in
  // devices/index.html and may intentionally have no catalog price. They are
  // still physical products and must be available for logistics entry.
  ...legacyDeviceProducts().flatMap(product => compactProductModels(product, 'Devices')),
  ...frameProducts().flatMap(product => compactProductModels(product, 'Frames')),
  ...lensProducts().flatMap(product => compactProductModels(product, 'Lenses'))
].filter(product => product.model);

const unique = [...new Map(products.map(product => [product.model, product])).values()]
  .sort((first, second) => `${first.store_section} ${first.model}`.localeCompare(`${second.store_section} ${second.model}`));

const output = `/* Generated by scripts/build-admin-logistics-catalog.js. */\nwindow.LZN_ADMIN_LOGISTICS_CATALOG = ${JSON.stringify(unique)};\n`;
fs.writeFileSync(path.join(root, 'tools/admin-logistics-catalog.js'), output);
console.log(`Generated ${unique.length} catalog logistics products.`);
