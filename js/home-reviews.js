(() => {
  'use strict';
  const section = document.querySelector('[data-google-reviews]');
  if (!section) return;
  const lang = document.documentElement.lang.toLowerCase().split('-')[0];
  const t = ({
    en:{review:'Google review',fallback:'Google user',noComment:'Rating only — no written comment.',more:'Read full review',close:'Close review',pause:'Pause animation',resume:'Play animation',count:n=>n+' reviews on Google',stars:n=>n+' out of 5 stars',unavailable:'Reviews are temporarily unavailable here. Read all feedback directly on Google.',row1:'Google reviews, first row',row2:'Google reviews, second row'},
    pt:{review:'Avaliação no Google',fallback:'Usuário do Google',noComment:'Avaliação sem comentário escrito.',more:'Ler avaliação completa',close:'Fechar avaliação',pause:'Pausar animação',resume:'Retomar animação',count:n=>n+' avaliações no Google',stars:n=>n+' de 5 estrelas',unavailable:'As avaliações estão temporariamente indisponíveis aqui. Veja todos os comentários diretamente no Google.',row1:'Avaliações do Google, primeira faixa',row2:'Avaliações do Google, segunda faixa'},
    es:{review:'Reseña en Google',fallback:'Usuario de Google',noComment:'Valoración sin comentario escrito.',more:'Leer reseña completa',close:'Cerrar reseña',pause:'Pausar animación',resume:'Reanudar animación',count:n=>n+' reseñas en Google',stars:n=>n+' de 5 estrellas',unavailable:'Las reseñas no están disponibles aquí temporalmente. Lee todos los comentarios directamente en Google.',row1:'Reseñas de Google, primera fila',row2:'Reseñas de Google, segunda fila'}
  })[lang] || {};
  const status = section.querySelector('[data-review-status]');
  const motion = section.querySelector('[data-review-motion]');
  const pause = section.querySelector('[data-review-pause]');
  const dialog = section.querySelector('[data-review-dialog]');
  const summary = section.querySelector('[data-review-summary]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reduced.matches;
  let visible = false;
  let ready = false;
  const googlePaths = [
    ['#4285F4','M21.8 10.0H12v4.0h5.6c-.24 1.3-.97 2.4-2.07 3.15v2.62h3.35c1.96-1.8 3.09-4.45 3.09-7.6 0-.73-.07-1.45-.17-2.17Z'],
    ['#34A853','M12 22c2.81 0 5.17-.93 6.9-2.53l-3.35-2.62c-.93.62-2.12.99-3.55.99-2.72 0-5.03-1.84-5.85-4.31H2.69v2.7A10.42 10.42 0 0 0 12 22Z'],
    ['#FBBC05','M6.15 13.53a6.24 6.24 0 0 1 0-4.06v-2.7H2.69a10.24 10.24 0 0 0 0 9.46l3.46-2.7Z'],
    ['#EA4335','M12 5.16c1.54 0 2.93.53 4.02 1.58l3.02-3.02A10.12 10.12 0 0 0 12 1 10.42 10.42 0 0 0 2.69 6.77l3.46 2.7c.82-2.47 3.13-4.31 5.85-4.31Z']
  ];
  const el = (name, cls, text) => {
    const node = document.createElement(name);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function googleIcon() {
    const wrap = el('span','oct-review-google-icon');
    wrap.setAttribute('aria-hidden','true');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    for (const [color,d] of googlePaths) {
      const p = document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('fill',color); p.setAttribute('d',d); svg.append(p);
    }
    wrap.append(svg); return wrap;
  }
  function person(review, dialogTitle=false) {
    const person = el('div','oct-review-person');
    const avatar = el('span','oct-review-avatar',review.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());
    avatar.setAttribute('aria-hidden','true');
    try {
      const url = new URL(review.photo);
      if (url.protocol === 'https:' && /(^|\.)googleusercontent\.com$/.test(url.hostname)) {
        const img = el('img');
        img.alt = ''; img.width=54; img.height=54; img.loading='lazy'; img.decoding='async'; img.referrerPolicy='no-referrer';
        img.addEventListener('error',()=>img.remove(),{once:true});
        img.src=url.href; avatar.append(img);
      }
    } catch {}
    const info=el('div','oct-review-person-info'), name=el('strong','',review.name);
    name.setAttribute('translate','no');
    if (dialogTitle) name.id='oct-review-dialog-name';
    info.append(name,el('small','',t.review));
    person.append(avatar,info,googleIcon());
    return person;
  }
  function stars(rating) {
    const result=el('div','oct-review-stars');
    result.setAttribute('role','img'); result.setAttribute('aria-label',t.stars(rating));
    for(let i=1;i<=5;i++){
      const s=el('span',i>rating?'is-empty':'','★');
      s.setAttribute('aria-hidden','true');result.append(s);
    }
    return result;
  }
  let lastTrigger;
  function openReview(review,trigger) {
    if(!dialog || !dialog.showModal) return;
    lastTrigger=trigger;
    dialog.querySelector('[data-review-dialog-header]').replaceChildren(person(review,true));
    dialog.querySelector('[data-review-dialog-text]').textContent=review.comment || t.noComment;
    dialog.querySelector('[data-review-dialog-rating]').replaceChildren(stars(review.rating));
    dialog.showModal();
  }
  if(dialog){
    const close=dialog.querySelector('[data-review-close]');
    close.setAttribute('aria-label',t.close);
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog.addEventListener('close',()=>lastTrigger?.focus());
  }
  function card(review,duplicate) {
    const li=el('li','oct-review-card');
    const comment=el('p','oct-review-comment',review.comment || t.noComment);
    if(review.comment)comment.setAttribute('translate','no');
    li.append(person(review),comment);
    if(review.comment && review.comment.length>120){
      const more=el('button','oct-review-read',t.more+' ↗');
      more.type='button'; if(duplicate)more.tabIndex=-1;
      more.addEventListener('click',()=>openReview(review,more)); li.append(more);
    }
    li.append(stars(review.rating)); return li;
  }
  function updateMotion(){
    if(!ready)return;
    motion.classList.toggle('is-paused',userPaused);
    motion.classList.toggle('is-running',!userPaused && visible && !document.hidden);
    pause.setAttribute('aria-pressed',String(userPaused));
    pause.textContent=userPaused?'▶  '+t.resume:'Ⅱ  '+t.pause;
  }
  pause.addEventListener('click',()=>{userPaused=!userPaused;updateMotion();});
  reduced.addEventListener('change',()=>{userPaused=reduced.matches;updateMotion()});
  document.addEventListener('visibilitychange',updateMotion);
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);updateMotion()},{threshold:0.03});
  observer.observe(motion);
  function buildRow(row,reviews){
    row.setAttribute('aria-label',t[row.dataset.reviewLabel]);
    const belt=row.querySelector('.oct-review-belt');
    const items=reviews.length?reviews:[];
    if(!items.length){row.hidden=true;return;}
    belt.style.setProperty('--review-duration',Math.max(54,items.length*14)+'s');
    const originals=el('ul','oct-review-set');
    originals.setAttribute('role','list');
    const duplicates=el('ul','oct-review-set');
    duplicates.setAttribute('aria-hidden','true');
    for(const review of items){originals.append(card(review,false));duplicates.append(card(review,true));}
    belt.replaceChildren(originals,duplicates);
  }
  async function load(){
    try{
      const url='https://xemugzorxsmzmuuiidgu.supabase.co/rest/v1/oct_google_review_feed?id=eq.1&select=payload';
      const resp=await fetch(url,{headers:{apikey:'sb_publishable_CIXSDcMhMfy5Vj-ak0YkzQ_2kO7Fix5',Accept:'application/json'},credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(!resp.ok)throw new Error('Reviews unavailable');
      const data=await resp.json(), payload=data[0]?.payload;
      if(!payload || !Array.isArray(payload.reviews))throw new Error('Empty reviews');
      const reviews=payload.reviews.filter(r=>Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5)
        .map(r=>({name:typeof r.name==='string'&&r.name.trim()?r.name:t.fallback,photo:typeof r.photo==='string'?r.photo:'',comment:typeof r.comment==='string'?r.comment:'',rating:r.rating}));
      if(!reviews.length)throw new Error('Empty reviews');
      const average=Number(payload.average), total=Number(payload.total);
      if(Number.isFinite(average)&&average>=1&&average<=5&&Number.isInteger(total)&&total>0){
        summary.querySelector('[data-review-average]').textContent=average.toFixed(1);
        summary.querySelector('[data-review-total]').textContent=t.count(total);
        const starLabel=summary.querySelector('.oct-review-summary-stars');
        starLabel.textContent='★'.repeat(Math.round(average))+'☆'.repeat(5-Math.round(average));
        summary.querySelector('[data-google-icon]').replaceWith(googleIcon());
        summary.hidden=false;
      }
      const rows=[...section.querySelectorAll('[data-review-row]')];
      rows.forEach((row,i)=>buildRow(row,reviews.filter((_,index)=>index%2===i)));
      motion.hidden=false;status.hidden=true;pause.hidden=false;ready=true;updateMotion();
    }catch{status.textContent=t.unavailable;status.hidden=false;}
  }
  load();
})();