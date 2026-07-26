window.CATALOG_DATA = [{
  en: 'Optical Frames',
  items: PRODUCT_SERIES.flatMap(series => series.items.map(product => {
    const fallbackPriceUsd = ['86', '87'].includes(product.series) ? 10 : 7;
    const productPriceUsd = Number(product.priceUsd);
    const priceUsd = Number.isFinite(productPriceUsd) && productPriceUsd > 0 ? productPriceUsd : fallbackPriceUsd;
    return {
      model: product.model,
      nameEn: product.productTitle || `Model ${product.model}`,
      image: product.title,
      priceUsd,
      options: (product.colors || []).map((color, index) => {
        const code = `C${String(index + 1).padStart(2, '0')}`;
        const colorPriceUsd = Number(color.priceUsd);
        return {
          model: `${product.model}-${code}`,
          label: `${code} · ${color.en}`,
          priceUsd: Number.isFinite(colorPriceUsd) && colorPriceUsd > 0 ? colorPriceUsd : priceUsd,
          image: color.src
        };
      })
    };
  }))
}];
