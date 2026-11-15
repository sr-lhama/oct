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

    if (page?.isConnected) {
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
      const productField=form.elements.product;
      const colorField=form.elements.color;
      const manualField=document.getElementById('octManualColor');
      const manualWrapper=form.querySelector('[data-oct-manual-color]');
      const controls=form.querySelector('[data-catalog-controls]');
      const swatches=document.getElementById('octColorSwatches');
      const frontImg=form.querySelector('[data-oct-front-img]');
      const backImg=form.querySelector('[data-oct-back-img]');
      const hint=document.getElementById('octColorHelp');
      const incomingColor=params.get('color');
      let selectedColor='';
      const getProduct=()=>byName.get(productField.value);
      function sendColorEvent(){form.dispatchEvent(new CustomEvent('oct:colorchange',{bubbles:true}))}
      function updateImages(product,color){
        for(const [view,img] of [['Front',frontImg],['Back',backImg]]){
          const photo=color?.views?.[view];
          if(photo){
            img.src=new URL(photo,catalogUrl).href;
            img.hidden=false;
            img.alt=(names[product.model]||product.model)+' in '+color.name+' - '+view;
          }else{img.hidden=true;img.removeAttribute('src')}
        }
      }
      function render(){
        const product=getProduct();
        const isCatalog=Boolean(product);
        controls.hidden=!isCatalog;
        manualWrapper.hidden=isCatalog;
        if(!isCatalog){
          selectedColor='';
          colorField.value=manualField.value.trim();
          manualField.required=true;
          sendColorEvent();
          return;
        }
        manualField.required=false;
        const colors=product.colors||[];
        if(!selectedColor||!colors.some(c=>c.name===selectedColor)){
          const preferred=colors.find(c=>c.name===incomingColor)||colors.find(c=>c.name==='Black')||colors[0];
          selectedColor=preferred?.name||'';
        }
        swatches.replaceChildren();
        for(const color of colors){
          const button=document.createElement('button');
          button.type='button';button.className='oct-swatch';
          button.setAttribute('aria-label','Select '+color.name);
          button.setAttribute('aria-pressed',String(color.name===selectedColor));
          const dot=document.createElement('span');dot.className='oct-swatch-dot';
          const photo=color.views?.Front||color.views?.Back;
          if(photo){dot.style.backgroundImage='url("'+new URL(photo,catalogUrl).href+'")';dot.style.backgroundSize='300%';dot.style.backgroundPosition='center 35%';}
          const label=document.createElement('span');label.className='oct-swatch-label';label.textContent=color.name;
          button.append(dot,label);
          button.addEventListener('click',()=>{selectedColor=color.name;paintSelection()});
          swatches.append(button);
        }
        hint.textContent=colors.length+' catalog colors. Select the color you prefer; availability is confirmed after review.';
        paintSelection();
        function paintSelection(){
          const color=colors.find(c=>c.name===selectedColor);
          colorField.value=color?.name||'';
          swatches.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.querySelector('.oct-swatch-label')?.textContent===selectedColor)));
          updateImages(product,color);
          sendColorEvent();
        }
      }
      productField.addEventListener('change',()=>{selectedColor='';render()});
      manualField.addEventListener('input',()=>{if(!getProduct()){colorField.value=manualField.value.trim();sendColorEvent()}});
      form.addEventListener('reset',()=>queueMicrotask(()=>{selectedColor='';render()}));
      render();
    }
  }

  loadCatalog().catch(() => {
    const form=document.querySelector('[data-quote-form]');
    if(form){
      const manual=form.querySelector('[data-oct-manual-color]');
      const input=form.querySelector('#octManualColor');
      if(manual)manual.hidden=false;
      if(input){input.required=true;input.addEventListener('input',()=>{form.elements.color.value=input.value.trim();form.dispatchEvent(new CustomEvent('oct:colorchange'))})}
      const controls=form.querySelector('[data-catalog-controls]');
      if(controls)controls.hidden=true;
    }
  });
})();
