window.CATALOG_DATA = [{
  en: 'Optical Frames',
  items: PRODUCT_SERIES.flatMap(series => series.items.map(product => {
    const priceUsd = ['86', '87'].includes(product.series) ? 10 : 7;
    return {
      model: product.model,
      nameEn: product.productTitle || `Model ${product.model}`,
      image: product.title,
      priceUsd,
      options: (product.colors || []).map((color, index) => {
        const code = `C${String(index + 1).padStart(2, '0')}`;
        return {
          model: `${product.model}-${code}`,
          label: `${code} · ${color.en}`,
          priceUsd,
          image: color.src
        };
      })
    };
  }))
}];
