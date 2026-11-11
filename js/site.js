// Static GitHub Pages design preview: backend is intentionally disabled.
window.OCT_PREVIEW_ONLY=true;
(function(){
  'use strict';
  const menu=document.querySelector('[data-menu]');
  const toggle=document.querySelector('[data-menu-toggle]');
  if(toggle && menu){toggle.addEventListener('click',()=>{const show=!menu.classList.contains('open');menu.classList.toggle('open',show);toggle.setAttribute('aria-expanded',String(show));});}
  // Two calendar-driven seasonal banner slots with tasteful evergreen fallbacks.
  const slots=Array.from(document.querySelectorAll('[data-campaign-slide]'));
  if(slots.length){
    const today=new Date(), iso=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    const active=(window.OCT_CAMPAIGNS||[]).filter(c=>c.start<=iso&&c.end>=iso).slice(0,2);
    slots.forEach((slide,i)=>{
      const box=slide.querySelector('.campaign-slide'),img=slide.querySelector('img'),source=slide.querySelector('source'),overlay=slide.querySelector('.evergreen-layer');
      const promo=active[i];
      if(promo){img.src=promo.desktop;img.alt=promo.name+' custom apparel campaign for Orlando Custom Tees';source.srcset=promo.mobile;box.classList.remove('is-evergreen');overlay.hidden=true;}
      else {const fallback=i===0?'assets/images/dtf-production.webp':'assets/images/hero-llama-showroom.webp';img.src=fallback;img.alt='Orlando Custom Tees branded apparel and DTF production';source.srcset=fallback;box.classList.add('is-evergreen');overlay.hidden=false;}
    });
  }
  const slides=Array.from(document.querySelectorAll('[data-slide]'));
  let slide=0, timer=null;
  if(slides.length>1){
    const dots=document.querySelector('[data-slider-dots]');
    slides.forEach((s,i)=>{let b=document.createElement('button');b.className='slider-dot'+(i===0?' active':'');b.setAttribute('aria-label','Go to banner '+(i+1));b.addEventListener('click',()=>go(i));dots.appendChild(b);});
    function go(i){slides[slide].classList.remove('active');slide=(i+slides.length)%slides.length;slides[slide].classList.add('active');dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===slide));reset();}
    function reset(){if(timer)clearInterval(timer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>go(slide+1),7500);}
    document.querySelectorAll('[data-slide-arrow]').forEach(b=>b.addEventListener('click',()=>go(slide+(b.dataset.slideArrow==='next'?1:-1))));
    const car=document.querySelector('[data-carousel]');if(car){car.addEventListener('mouseenter',()=>clearInterval(timer));car.addEventListener('mouseleave',reset);car.addEventListener('focusin',()=>clearInterval(timer));car.addEventListener('focusout',reset);}
    reset();
  }
  // Gentle scroll parallax on the active hero scene, without impairing reduced-motion users.
  const semanticCarousel=document.querySelector('.oct-semantic-carousel');
  if(semanticCarousel && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    let frame=0;
    const updateHeroOffset=()=>{
      if(frame)return;
      frame=window.requestAnimationFrame(()=>{
        frame=0;
        const rect=semanticCarousel.getBoundingClientRect();
        if(rect.bottom<0 || rect.top>window.innerHeight)return;
        const scrollDrift=Math.max(-18,Math.min(18,(window.innerHeight*.5-(rect.top+rect.height*.5))*.045));
        semanticCarousel.style.setProperty('--oct-scroll-shift',scrollDrift.toFixed(1)+'px');
      });
    };
    window.addEventListener('scroll',updateHeroOffset,{passive:true});
    window.addEventListener('resize',updateHeroOffset,{passive:true});
    updateHeroOffset();
  }
  const filters=document.querySelectorAll('[data-filter]');
  if(filters.length){filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.toggle('active',x===b));const category=b.dataset.filter;document.querySelectorAll('[data-card-category]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.cardCategory!==category;});}));}
  if(location.hash){const key=location.hash.slice(1);const chosen=document.querySelector('[data-filter="'+key+'"]');if(chosen){chosen.click();document.querySelector('.filters')?.scrollIntoView({block:'start'});}}
  const productMap={
    'gildan-64000':{name:'Gildan 64000 Softstyle',subtitle:'Softstyle crewneck T-shirt',description:'Comfortable everyday team apparel and promotional T-shirts with a soft feel, ready for detailed DTF customization.',type:'Custom T-Shirts',material:'Softstyle cotton construction',colors:[['#111827','Black'],['#fff','White'],['#304f83','Navy'],['#bd2229','Red']]},
    'next-level-6210':{name:'Next Level 6210 CVC',subtitle:'Premium CVC T-shirt',description:'A polished, modern-feeling option for branded workwear, event apparel and company merchandise.',type:'Custom T-Shirts',material:'CVC cotton/poly blend',colors:[['#444e5f','Heather charcoal'],['#111827','Black'],['#eef0f4','Light heather'],['#244781','Heather navy']]},
    'team365-tt11':{name:'Team 365 TT11 Performance',subtitle:'Moisture-managing active T-shirt',description:'Made for active teams and warm days with a comfortable performance-focused feel.',type:'Performance Apparel',material:'Performance polyester',colors:[['#0575c8','Royal'],['#111827','Black'],['#f7f7f7','White'],['#d11d2e','Red']]},
    'team365-tt11l':{name:'Team 365 TT11L Long Sleeve',subtitle:'Long-sleeve performance T-shirt',description:'Lightweight performance apparel suitable for outdoor crews and long-sleeve team uniforms.',type:'Performance Apparel',material:'Long-sleeve performance polyester',colors:[['#fafafa','White'],['#111827','Black'],['#123d77','Navy'],['#19b6f2','Sport blue']]},
    'team365-tt21':{name:'Team 365 TT21 Polo',subtitle:'Professional performance polo',description:'A clean, durable professional appearance for sales teams, restaurants and company uniforms.',type:'Custom Polos',material:'Performance pique polyester',colors:[['#fff','White'],['#162b51','Navy'],['#111827','Black'],['#117ad9','Royal']]},
    'premium-hoodie':{name:'Custom Hoodie',subtitle:'Comfortable branded layers',description:'Versatile sweatshirts and hoodies for work crews, teams, events and branded merchandise. Model quoted by request.',type:'Hoodies & Sweatshirts',material:'Fabric varies by selected model',colors:[['#111827','Black'],['#777f90','Grey'],['#fff','White']]},
    'custom-cap':{name:'Custom Cap',subtitle:'Branded hats and caps',description:'Personalized headwear for businesses and events. Decoration and suitable cap styles are confirmed per project.',type:'Hats & Caps',material:'Varies by cap style',colors:[['#111827','Black'],['#fff','White'],['#172b63','Navy']]},
    'workwear':{name:'Team Workwear',subtitle:'Visible, functional uniforms',description:'Practical garment options for service crews, outdoor teams, and businesses. Availability varies by product.',type:'Work Uniforms',material:'Varies by style',colors:[['#e6fc1a','Safety yellow'],['#fa7115','Safety orange'],['#162b63','Navy']]}
  };
  const productNode=document.querySelector('[data-product-page]');
  if(productNode){const params=new URLSearchParams(location.search);const id=params.get('id')||'gildan-64000';const d=productMap[id]||productMap['gildan-64000'];
    document.title=d.name+' | Orlando Custom Tees';
    for(let k of ['name','subtitle','description','type','material'])document.querySelectorAll('[data-product-'+k+']').forEach(el=>el.textContent=d[k]);
    document.querySelectorAll('[data-product-image]').forEach(el=>{el.src='assets/products/'+(productMap[id]?id:'gildan-64000')+'.webp';el.alt='Illustrated example of '+d.name;});
    document.querySelectorAll('[data-product-link]').forEach(el=>el.href='quote.html?product='+encodeURIComponent(d.name));
    const sw=document.querySelector('[data-product-swatches]');if(sw){d.colors.forEach(([color,label],i)=>{const b=document.createElement('button');b.className='swatch'+(i===0?' selected':'');b.style.background=color;b.setAttribute('aria-label',label);b.title=label;b.addEventListener('click',()=>{sw.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');const t=document.querySelector('[data-color-label]');if(t)t.textContent=label;});sw.appendChild(b)});const t=document.querySelector('[data-color-label]');if(t)t.textContent=d.colors[0][1];}
  }
  const quote=document.querySelector('[data-quote-form]');
  if(quote){
    const params=new URLSearchParams(location.search);if(params.has('product')){const sel=quote.querySelector('[name="product"]');if(sel){const wanted=params.get('product');const match=Array.from(sel.options).find(o=>o.value===wanted);if(match)sel.value=wanted;else{const op=document.createElement('option');op.value=wanted;op.textContent=wanted;op.selected=true;sel.append(op);}}}
    const count=quote.querySelector('[name="quantity"]'), sum=document.querySelector('[data-quantity-summary]');
    if(count&&sum)count.addEventListener('input',()=>{const n=parseInt(count.value,10);sum.textContent=Number.isFinite(n)&&n>0?n+' pieces':'Quantity not selected';});
    quote.addEventListener('submit',async ev=>{ev.preventDefault();if(window.OCT_PREVIEW_ONLY){const r=document.querySelector('[data-form-result]');r.className='form-result error';r.textContent='Prévia do GitHub Pages: este formulário não envia solicitações. Para ativar, é necessário hospedar o backend PHP ou integrar ao CRM.';r.scrollIntoView({behavior:'smooth',block:'center'});return;}const result=document.querySelector('[data-form-result]');const submit=quote.querySelector('[type="submit"]');const n=Number(count.value);if(!Number.isInteger(n)||n<12){result.className='form-result error';result.textContent='The standard minimum is 12 pieces. Please update the quantity or contact us about an exception.';return;}
      if(quote.elements.company_email && quote.elements.company_email.value)return;
      const upload=quote.querySelector('input[type=file]');if(upload&&upload.files[0]&&upload.files[0].size>8*1024*1024){result.className='form-result error';result.textContent='Artwork cannot exceed 8 MB. Please select a smaller file.';return;}
      submit.disabled=true;submit.textContent='Sending request…';result.className='form-result';result.textContent='';
      try{const response=await fetch('api/quote.php',{method:'POST',body:new FormData(quote),headers:{Accept:'application/json'}});let data;try{data=await response.json()}catch{throw new Error('This preview is not connected to the PHP form handler. Install the full package on a PHP-enabled server to receive requests.');}
      if(!response.ok||!data.ok)throw new Error(data.message||'Submission failed.');result.className='form-result ok';result.textContent='Thank you! Your request '+data.request_id+' has been received. Our team will contact you to review details and pricing.';quote.reset();result.scrollIntoView({behavior:'smooth',block:'center'});}
      catch(err){result.className='form-result error';result.textContent='Unable to send your request: '+err.message+' You can contact info@orlandocustomtees.com.';}
      finally{submit.disabled=false;submit.innerHTML='Send Quote Request <span class="icon-arrow">→</span>';}
    });
  }
})();
