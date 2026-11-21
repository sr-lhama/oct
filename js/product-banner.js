(() => {
  const gildan = ['Gildan', 'assets/images/brand-gildan.webp'];
  const team365 = ['Team 365', 'assets/catalog/Marcas/Team_365_High_Brand.webp'];
  const brands = new Map([
    ['gildan-64000', gildan],
    ['premium-hoodie', gildan],
    ['next-level-6210', ['Next Level Apparel', 'assets/images/brand-nextlevel.webp']],
    ['team365-tt11', team365],
    ['team365-tt11l', team365],
    ['team365-tt21', team365],
    ['custom-cap', ['Flexfit', 'assets/catalog/Marcas/Flexfit_High_Brand.webp']],
    ['workwear', ['Orlando Custom Tees', 'assets/images/logo-official.webp']]
  ]);
  const id = new URLSearchParams(location.search).get('id');
  const [name, image] = brands.get(id) ?? gildan;
  document.querySelector('[data-product-banner-name]').textContent = name;
  document.querySelector('[data-product-banner-brand]').src = image;
})();
