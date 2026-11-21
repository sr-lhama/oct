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
    "Custom Hoodie",
    "A warm branded layer for work crews, teams and merchandise. We check print placement around pockets, seams and the hood for the selected model."
  ],
  "custom-cap": [
    "Custom Cap",
    "Branded headwear for teams and events. Share your logo so we can confirm the suitable cap shape, decoration area and print size."
  ],
  "workwear": [
    "Team Workwear",
    "Build a coordinated uniform around your crew’s work and preferred coverage. Tell us which garments and colors you need in the estimate."
  ]
}));
  const requestedId = new URLSearchParams(location.search).get('id');
  const id = products.has(requestedId) ? requestedId : 'gildan-64000';
  const [name, copy] = products.get(id);
  document.querySelector('[data-product-banner-name]').textContent = name;
  document.querySelector('[data-product-banner-copy]').textContent = copy;
  document.querySelector('[data-product-banner-image]').src = 'assets/products/' + id + '.webp';
})();
