(() => {
  const products = new Map(Object.entries({
  "gildan-64000": [
    "Gildan 64000 Softstyle",
    "A soft crewneck for company shirts, promotions and group events. A small chest logo and a larger back design work well together."
  ],
  "next-level-6210": [
    "Next Level 6210 CVC",
    "A cotton-poly blend for branded merchandise, staff shirts and events where you want a soft, modern tee."
  ],
  "team365-tt11": [
    "Team 365 TT11 Performance",
    "A short-sleeve performance tee for active crews and teams. Choose a lightweight uniform and place your logo where it reads clearly."
  ],
  "team365-tt11l": [
    "Team 365 TT11L Long Sleeve",
    "A lightweight performance shirt with long sleeves for outdoor crews. Ask about available safety colors when requesting your quote."
  ],
  "team365-tt21": [
    "Team 365 TT21 Polo",
    "A performance polo for shops, sales teams and customer-facing uniforms. A left-chest logo keeps the front clean and easy to recognize."
  ],
  "premium-hoodie": [
    "Gildan 18500 Hoodie",
    "A warm branded layer for work crews, teams and merchandise. We check print placement around pockets, seams and the hood for the selected model."
  ],
  "custom-cap": [
    "Flexfit 110M5 Cap",
    "Branded headwear for teams and events. Share your logo so we can confirm the suitable cap shape, decoration area and print size."
  ],
  "workwear": [
    "Team Workwear",
    "Build a coordinated uniform around your crew’s work and preferred coverage. Tell us which garments and colors you need in the estimate."
  ]
}));
  const brands = {
    gildan: ['Gildan', 'assets/images/brand-gildan.webp', 'Gildan'],
    nextLevel: ['Next Level Apparel', 'assets/images/brand-nextlevel.webp', 'Next_Level'],
    team365: ['Team 365', 'assets/catalog/Marcas/Team_365_High_Brand.webp', 'Team_365'],
    flexfit: ['Flexfit', 'assets/catalog/Marcas/Flexfit_High_Brand.webp', 'Flexfit'],
    oct: ['Orlando Custom Tees', 'assets/images/logo-official.webp']
  };
  const models = {
    'gildan-64000': [brands.gildan, '64000'],
    'next-level-6210': [brands.nextLevel, '6210'],
    'team365-tt11': [brands.team365, 'TT11'],
    'team365-tt11l': [brands.team365, 'TT11L'],
    'team365-tt21': [brands.team365, 'TT21'],
    'premium-hoodie': [brands.gildan, '18500'],
    'custom-cap': [brands.flexfit, '110M5'],
    workwear: [brands.oct]
  };

  const requestedId = new URLSearchParams(location.search).get('id');
  const id = products.has(requestedId) ? requestedId : 'gildan-64000';
  const [name, copy] = products.get(id);
  document.querySelector('[data-product-banner-name]').textContent = name;
  document.querySelector('[data-product-banner-copy]').textContent = copy;
  const [[brandName, brandImage, folder], model] = models[id];
  const logo = document.querySelector('[data-product-banner-brand]');
  logo.alt = brandName;
  logo.src = brandImage;

  const garment = document.querySelector('[data-product-banner-image]');
  garment.src = model
    ? `assets/catalog/Fotos/${folder}/${model}/${folder}_${model}_Black_Front_High.webp`
    : 'assets/products/workwear.webp';
})();
