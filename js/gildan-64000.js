(() => {
  const params = new URLSearchParams(location.search);
  const template = document.querySelector('#gildan-64000-template');
  if (!template || (params.has('id') && params.get('id') !== 'gildan-64000')) return;

  const swatches = {
  "White": [
    "#f7f7f7",
    "11-0601 TCX"
  ],
  "Black": [
    "#20232a",
    "426"
  ],
  "Antique Cherry Red": [
    "#a61530",
    "7427"
  ],
  "Antique Heliconia": [
    "#b33e7b",
    "227"
  ],
  "Antique Sapphire": [
    "#016890",
    "7706"
  ],
  "Azalea": [
    "#ff86a5",
    "2045"
  ],
  "Cardinal Red": [
    "#95203a",
    "1955"
  ],
  "Carolina Blue": [
    "#8eb3e7",
    "659"
  ],
  "Charcoal": [
    "#5c5859",
    "Cool Grey 10"
  ],
  "Cherry Red": [
    "#b71d3f",
    "187"
  ],
  "Coral Silk": [
    "#ff706c",
    "1777"
  ],
  "Cornsilk": [
    "#d7ce81",
    "393"
  ],
  "Daisy": [
    "#ffcc2b",
    "122"
  ],
  "Dark Chocolate": [
    "#4b413f",
    "412"
  ],
  "Dark Heather": [
    "#5e626b",
    "7545"
  ],
  "Fan Candy Pink": [
    "#efa1bb",
    "507"
  ],
  "Fan Dark Green": [
    "#0d4935",
    "554"
  ],
  "Fan Deep Royal": [
    "#152c72",
    "3597"
  ],
  "Fan Marine Green": [
    "#083f3e",
    "2217"
  ],
  "Fan Texas Orange": [
    "#a6502f",
    "7586"
  ],
  "Forest": [
    "#2a3e33",
    "5535"
  ],
  "Garnet": [
    "#720f2c",
    "188"
  ],
  "Gold": [
    "#ffc104",
    "1235"
  ],
  "Graphite Heather": [
    "#8a858b",
    "424C"
  ],
  "Heather Berry": [
    "#d66196",
    "682"
  ],
  "Heather Cardinal Red": [
    "#cc6473",
    "194"
  ],
  "Heather Dark Grey": [
    "#636363",
    "Cool Grey 11"
  ],
  "Heather Galapagos Blue": [
    "#43a4b9",
    "632"
  ],
  "Heather Heliconia": [
    "#ff6c9e",
    "7424"
  ],
  "Heather Indigo": [
    "#8ca4bc",
    "2139"
  ],
  "Heather Irish Green": [
    "#049866",
    "2249"
  ],
  "Heather Maroon": [
    "#723c4a",
    "7643"
  ],
  "Heather Military Green": [
    "#848773",
    "416"
  ],
  "Heather Navy": [
    "#535667",
    "432"
  ],
  "Heather Oatmeal": [
    "#e2d6c6",
    "4246"
  ],
  "Heather Orange": [
    "#ff7f5f",
    "1635"
  ],
  "Heather Purple": [
    "#6c5b8f",
    "668"
  ],
  "Heather Radiant Orchid": [
    "#e190c1",
    "7655"
  ],
  "Heather Red": [
    "#d94962",
    "193"
  ],
  "Heather Royal": [
    "#7099d9",
    "2727"
  ],
  "Heather Sapphire": [
    "#44a6c7",
    "7690"
  ],
  "Heliconia": [
    "#fb4d88",
    "213"
  ],
  "Ice Grey": [
    "#e4dad8",
    "Warm Grey 1"
  ],
  "Indigo Blue": [
    "#58738e",
    "5405"
  ],
  "Iris": [
    "#558dca",
    "660"
  ],
  "Irish Green": [
    "#019b5d",
    "2252"
  ],
  "Jade Dome": [
    "#00a3ac",
    "7717"
  ],
  "Kelly Green": [
    "#00b88d",
    "335c"
  ],
  "Kiwi": [
    "#8faf66",
    "2276"
  ],
  "Light Blue": [
    "#a8c3de",
    "543C"
  ],
  "Light Pink": [
    "#efcddd",
    "684"
  ],
  "Lime": [
    "#9fe271",
    "7488"
  ],
  "Maroon": [
    "#5f2031",
    "7644"
  ],
  "Metro Blue": [
    "#4c5687",
    "2111"
  ],
  "Military Green": [
    "#61604e",
    "5615"
  ],
  "Mint Green": [
    "#b8e9bc",
    "345"
  ],
  "Natural": [
    "#e2d3c0",
    "2309"
  ],
  "Navy": [
    "#263145",
    "533"
  ],
  "Neon Blue": [
    "#2a58ad",
    "2145C"
  ],
  "Off White": [
    "#f7f0de",
    "9161"
  ],
  "Orange": [
    "#ff6640",
    "2026"
  ],
  "Paragon": [
    "#bea0aa",
    "7653"
  ],
  "Pistachio": [
    "#d2deba",
    "577"
  ],
  "Prairie Dust": [
    "#928469",
    "7497"
  ],
  "Purple": [
    "#4d2e79",
    "2112"
  ],
  "Red": [
    "#d4293c",
    "200"
  ],
  "Royal": [
    "#1759ad",
    "7686"
  ],
  "Sage": [
    "#a5b39c",
    "2406"
  ],
  "Sand": [
    "#c9b9aa",
    "7528"
  ],
  "Sapphire": [
    "#028dc0",
    "641"
  ],
  "Sky": [
    "#b9e6fb",
    "297"
  ],
  "Sport Grey": [
    "#a0a0a0",
    "Cool Grey 7"
  ],
  "Stone Blue": [
    "#9bacbc",
    "2164"
  ],
  "Tropical Blue": [
    "#1a8494",
    "7712"
  ],
  "Turf Green": [
    "#047d4a",
    "7732"
  ]
};
  const catalogUrl = new URL('assets/catalog/catalogo_por_modelo.json', document.baseURI);
  const viewLabels = { Front: 'Front', Back: 'Back', DirectSide: 'Side', Side: 'Side' };

  async function init() {
    const response = await fetch(catalogUrl);
    if (!response.ok) return;
    const { products } = await response.json();
    const product = products.find(entry => entry.model === '64000');
    if (!product?.colors.length) return;

    const main = template.content.firstElementChild.cloneNode(true);
    const photo = main.querySelector('[data-gildan-photo]');
    const thumbs = main.querySelector('[data-gildan-thumbs]');
    const swatchGrid = main.querySelector('[data-gildan-swatches]');
    const filter = main.querySelector('#gildan-colors');
    const count = main.querySelector('[data-gildan-count]');
    const colorName = main.querySelector('[data-gildan-color]');
    const pms = main.querySelector('[data-gildan-pms]');
    const quote = main.querySelector('[data-gildan-quote]');
    const dialog = main.querySelector('[data-gildan-dialog]');
    const arrows = [...main.querySelectorAll('[data-photo-step]')];
    let color = product.colors.find(entry => entry.name === params.get('color')) || product.colors[0];
    let views = [];
    let viewIndex = 0;

    function setPhoto(image, view) {
      image.src = new URL(color.views[view], catalogUrl).href;
      image.alt = 'Gildan 64000 in ' + color.name + ' — ' + viewLabels[view].toLowerCase() + ' view';
    }

    function showView(index) {
      viewIndex = (index + views.length) % views.length;
      setPhoto(photo, views[viewIndex]);
      [...thumbs.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === viewIndex)));
    }

    function showColor(entry) {
      color = entry;
      views = Object.keys(viewLabels).filter(view => color.views[view]);
      colorName.textContent = color.name;
      pms.textContent = swatches[color.name]?.[1] ? ' · PMS ' + swatches[color.name][1] : '';
      quote.href = 'quote.html?' + new URLSearchParams({ product: 'Gildan 64000 Softstyle', color: color.name });
      for (const button of swatchGrid.children) button.setAttribute('aria-pressed', String(button.textContent === color.name));
      thumbs.replaceChildren(...views.map((view, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', viewLabels[view] + ' photo');
        const image = document.createElement('img');
        setPhoto(image, view);
        image.alt = '';
        button.append(image);
        button.addEventListener('click', () => showView(index));
        return button;
      }));
      arrows.forEach(button => { button.disabled = views.length < 2; });
      showView(0);
    }

    function renderSwatches() {
      const visible = product.colors.filter(entry => {
        const heather = /heather/i.test(entry.name);
        return filter.value === 'all' || (filter.value === 'heather' ? heather : !heather);
      });
      swatchGrid.replaceChildren(...visible.map(entry => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = entry.name;
        const hex = swatches[entry.name]?.[0] || '#e5e7eb';
        button.style.setProperty('--swatch-color', hex);
        button.setAttribute('aria-pressed', String(entry === color));
        button.addEventListener('click', () => showColor(entry));
        return button;
      }));
      count.textContent = visible.length + ' colors';
    }

    filter.addEventListener('change', renderSwatches);
    for (const button of arrows) button.addEventListener('click', () => showView(viewIndex + Number(button.dataset.photoStep)));
    main.querySelector('[data-gildan-zoom]').addEventListener('click', () => {
      setPhoto(dialog.querySelector('img'), views[viewIndex]);
      dialog.showModal();
    });
    main.querySelector('[data-gildan-close]').addEventListener('click', () => dialog.close());

    const tabs = [...main.querySelectorAll('[role="tab"]')];
    function activate(tab, focus = false) {
      for (const candidate of tabs) {
        const selected = candidate === tab;
        candidate.tabIndex = selected ? 0 : -1;
        candidate.setAttribute('aria-selected', String(selected));
        main.querySelector('#' + candidate.getAttribute('aria-controls')).hidden = !selected;
      }
      if (focus) tab.focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        const target = { ArrowLeft: 1 - i, ArrowRight: 1 - i, Home: 0, End: 1 }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        activate(tabs[target], true);
      });
    });
    main.querySelector('[data-gildan-description]').addEventListener('click', () => activate(tabs[0], true));

    renderSwatches();
    showColor(color);
    document.querySelector('#main').replaceWith(main);
    document.title = 'Gildan 64000 Unisex Softstyle® T-Shirt | Orlando Custom Tees';
    if (location.hash === '#gildan-details') main.querySelector('#gildan-details').scrollIntoView();
  }

  init().catch(() => {});
})();
