(() => {
  const catalogUrl = new URL('assets/catalog/catalogo_por_modelo.json', document.baseURI);
  const modelsByPage = {
    'gildan-64000': '64000',
    'next-level-6210': '6210',
    'team365-tt11': 'TT11',
    'team365-tt11l': 'TT11L',
    'team365-tt21': 'TT21',
    'premium-hoodie': '18500',
    'custom-cap': '110M5'
  };
  const names = {
    '64000': 'Gildan 64000 Softstyle',
    '6210': 'Next Level 6210 CVC',
    TT11: 'Team 365 TT11 Performance',
    TT11L: 'Team 365 TT11L Long Sleeve',
    TT21: 'Team 365 TT21 Polo',
    '18500': 'Gildan 18500 Hoodie',
    '110M5': 'Flexfit 110M5'
  };
  const params = new URLSearchParams(location.search);
  const page = document.querySelector('[data-product-page]');
  const form = document.querySelector('[data-quote-form]');
  const cards = document.querySelectorAll('.product-card .photo[href^="product.html?id="]');

  function showPhoto(image, product, color, view) {
    const path = color?.views[view];
    image.hidden = !path;
    if (!path) {
      image.removeAttribute('src');
      return;
    }
    image.alt = names[product.model] + ' in ' + color.name + ' — ' + view.toLowerCase();
    image.src = new URL(path, catalogUrl).href;
  }

  function setupPreview(controls, image, onColor) {
    const select = controls.querySelector('select');
    const views = [...controls.querySelectorAll('button[data-view]')];
    let product;
    let view = 'Front';

    function render() {
      const color = product?.colors.find(entry => entry.code === select.value);
      if (!color?.views[view]) view = color?.views.Front ? 'Front' : 'Back';
      for (const button of views) {
        const angle = button.dataset.view;
        button.disabled = !color?.views[angle];
        button.setAttribute('aria-pressed', String(!button.disabled && angle === view));
      }
      showPhoto(image, product, color, view);
      return color;
    }

    for (const button of views) {
      button.addEventListener('click', () => {
        view = button.dataset.view;
        render();
      });
    }

    select.addEventListener('change', () => onColor(render()));

    return (nextProduct, selectedColor, useFirstColor = false) => {
      product = nextProduct;
      view = 'Front';
      select.replaceChildren(new Option('Select a color', ''));
      for (const color of product?.colors ?? []) {
        select.add(new Option(color.name, color.code));
      }
      const selected = product?.colors.find(color => color.name === selectedColor);
      select.value = selected?.code ?? (useFirstColor ? product?.colors[0]?.code : '') ?? '';
      controls.hidden = !product;
      return render();
    };
  }

  async function loadCatalog() {
    const response = await fetch(catalogUrl);
    if (!response.ok) throw new Error('Catalog unavailable');
    const { products } = await response.json();
    const byModel = new Map(products.map(product => [product.model, product]));
    const byName = new Map(products.map(product => [names[product.model], product]));

    for (const card of cards) {
      const id = new URL(card.href).searchParams.get('id');
      const product = byModel.get(modelsByPage[id]);
      if (!product) continue;
      const color = product.colors.find(entry => entry.views.Front);
      if (color) showPhoto(card.querySelector('img'), product, color, 'Front');
    }

    if (page) {
      const id = params.get('id') || 'gildan-64000';
      const product = byModel.get(modelsByPage[id]);
      if (product) {
        const name = names[product.model];
        const link = page.querySelector('[data-product-link]');
        const updateLink = color => {
          const query = new URLSearchParams({ product: name });
          if (color) query.set('color', color.name);
          link.href = 'quote.html?' + query;
        };
        const preview = setupPreview(page.querySelector('[data-catalog-controls]'),
          page.querySelector('[data-product-image]'), updateLink);
        page.querySelector('[data-example-colors]').hidden = true;
        page.querySelector('[data-product-name]').textContent = name;
        document.title = name + ' | Orlando Custom Tees';
        updateLink(preview(product, params.get('color'), true));
      }
    }

    if (form) {
      const productField = form.elements.product;
      const colorField = form.elements.color;
      const controls = form.querySelector('[data-catalog-controls]');
      let chosenColor = '';
      const preview = setupPreview(controls, controls.querySelector('img'), color => {
        if (color) {
          chosenColor = color.name;
          colorField.value = chosenColor;
        } else if (chosenColor && colorField.value === chosenColor) {
          colorField.value = '';
          chosenColor = '';
        }
      });
      const currentProduct = () => byName.get(productField.value);
      const incomingColor = params.get('color');
      const initial = preview(currentProduct(), colorField.value || incomingColor);
      if (!colorField.value && initial) {
        chosenColor = initial.name;
        colorField.value = chosenColor;
      }
      productField.addEventListener('change', () => {
        if (chosenColor && colorField.value === chosenColor) colorField.value = '';
        chosenColor = '';
        preview(currentProduct(), colorField.value);
      });
      colorField.addEventListener('input', () => {
        chosenColor = '';
        preview(currentProduct(), colorField.value);
      });
      form.addEventListener('reset', () => queueMicrotask(() => {
        chosenColor = '';
        preview(currentProduct(), colorField.value);
      }));
    }
  }

  loadCatalog().catch(() => {
    // The original illustrations and manual quote fields remain usable.
  });
})();
