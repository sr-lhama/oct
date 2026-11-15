(() => {
  'use strict';

  const languages = [
    {code: 'en', tag: 'en-US', flag: '<path fill="#fff" d="M0 0h24v16H0z"/><path stroke="#b31942" stroke-width="1.25" d="M0 .65h24M0 3.1h24M0 5.55h24M0 8h24M0 10.45h24M0 12.9h24M0 15.35h24"/><path fill="#0a3161" d="M0 0h10v8H0z"/><path stroke="#fff" stroke-width="1" stroke-linecap="round" d="M2 2h.1m2.8 0h.1m2.8 0h.1M3.5 4h.1m2.8 0h.1M2 6h.1m2.8 0h.1m2.8 0h.1"/>' , label: 'English'},
    {code: 'es', tag: 'es', flag: '<path fill="#aa151b" d="M0 0h24v16H0z"/><path fill="#f1bf00" d="M0 4h24v8H0z"/><path fill="#aa151b" d="M6 6h3v4H6z"/>' , label: 'Español'},
    {code: 'pt', tag: 'pt-BR', flag: '<path fill="#009b3a" d="M0 0h24v16H0z"/><path fill="#ffdf00" d="m12 2 9 6-9 6-9-6z"/><circle fill="#002776" cx="12" cy="8" r="3.5"/><path fill="none" stroke="#fff" stroke-width=".8" d="M8.8 7.2c2.3-.6 4.8.3 6.2 1.9"/>' , label: 'Português'},
  ];
  const storageKey = 'oct-language';
  const url = new URL(location.href);
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {}
  const selected = languages.find(entry => entry.code === url.searchParams.get('lang'))
    || languages.find(entry => entry.code === saved)
    || languages[0];
  try { localStorage.setItem(storageKey, selected.code); } catch {}

  const topBar = document.querySelector('.benefitbar .inner');
  if (!topBar) return;
  const social = topBar.querySelector('.social-links--top');
  const bar = document.createElement('div');
  bar.className = 'oct-language-bar';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', {en: 'Website language', es: 'Idioma del sitio', pt: 'Idioma do site'}[selected.code]);
  nav.className = 'oct-language-links';
  nav.setAttribute('translate', 'no');
  bar.append(nav);
  for (const entry of languages) {
    const link = document.createElement('a');
    const destination = new URL(url);
    destination.searchParams.set('lang', entry.code);
    link.href = destination.href;
    link.lang = entry.tag;
    link.hreflang = entry.tag;
    link.setAttribute('aria-label', entry.label);
    if (selected.code === entry.code) link.setAttribute('aria-current', 'true');
    link.title = entry.label;
    link.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 16" width="20" height="14" focusable="false">' + entry.flag + '</svg>';
    nav.append(link);
  }
  if (social) {
    social.before(bar);
    bar.append(social);
  } else {
    topBar.append(bar);
  }

  const footer = document.querySelector('.footer');
  if (footer) {
    const footerBar = document.createElement('div');
    footerBar.className = 'oct-language-bar oct-language-bar--footer';
    const footerNav = nav.cloneNode(true);
    footerNav.setAttribute('aria-label', {
      en: 'Website language in the footer',
      es: 'Idioma del sitio en el pie de página',
      pt: 'Idioma do site no rodapé',
    }[selected.code]);
    footerBar.append(footerNav);
    const footerSocial = footer.querySelector('.social-links--footer');
    if (footerSocial) {
      footerSocial.before(footerBar);
      footerBar.prepend(footerSocial);
    } else {
      (footer.querySelector('.footer-grid > :first-child') || footer.querySelector('.container') || footer).append(footerBar);
    }
  }

  if (selected.code === 'en') return;
  const dictionaryUrl = new URL('locale-' + selected.code + '.json', document.currentScript.src);
  const attributes = ['alt', 'title', 'aria-label', 'placeholder'];
  const exclusion = 'script,style,textarea,[translate="no"],.google-review-author h3,.oct-review-person strong';

  fetch(dictionaryUrl).then(response => {
    if (!response.ok) throw new Error('Translation unavailable');
    return response.json();
  }).then(dictionary => {
    document.documentElement.lang = selected.tag;
    const lookup = value => Object.hasOwn(dictionary, value) ? dictionary[value] : value;
    const patterns = [
      [/^(\d+) (pieces|colors)$/, match => match[1] + ' ' + lookup(match[2])],
      [/^(Go to banner|Illustrated example of) (.+)$/, match => lookup(match[1]) + ' ' + lookup(match[2])],
      [/^Request (\S+) (received\..+)$/, match => lookup('Request') + ' ' + match[1] + ' ' + lookup(match[2])],
      [/^(Unable to send your request\.) (.+)$/, match => lookup(match[1]) + ' ' + (lookup(match[2]) === match[2] ? lookup('Please try again.') : lookup(match[2]))],
    ];
    function translate(value) {
      const key = value.trim();
      if (!key) return value;
      if (Object.hasOwn(dictionary, key)) return value.replace(key, () => dictionary[key]);
      for (const [pattern, replacement] of patterns) {
        const match = key.match(pattern);
        if (match) return value.replace(key, () => replacement(match));
      }
      return value;
    }
    function updateAttributes(element) {
      if (element.closest(exclusion)) return;
      for (const attribute of attributes) {
        const original = element.getAttribute(attribute);
        if (!original) continue;
        const translated = translate(original);
        if (translated !== original) element.setAttribute(attribute, translated);
      }
    }
    function updateText(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(exclusion)) return;
      const translated = translate(node.data);
      if (translated === node.data) return;
      if (parent.tagName === 'OPTION' && !parent.hasAttribute('value')) parent.value = parent.value;
      node.data = translated;
    }
    function updateLink(element) {
      if (!element.matches('a[href]') || element.closest(exclusion)) return;
      const href = element.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const target = new URL(href, url);
      if (target.origin !== url.origin || !target.pathname.endsWith('.html') || target.searchParams.has('lang')) return;
      target.searchParams.set('lang', selected.code);
      element.setAttribute('href', href.split(/[?#]/, 1)[0] + target.search + target.hash);
    }
    function updateTree(root) {
      if (root.nodeType === Node.TEXT_NODE) return updateText(root);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      updateAttributes(root);
      updateLink(root);
      for (const element of root.querySelectorAll('[alt],[title],[aria-label],[placeholder],a[href]')) {
        updateAttributes(element);
        updateLink(element);
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) updateText(walker.currentNode);
    }

    updateTree(document.documentElement);
    for (const element of document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')) {
      element.content = translate(element.content);
    }
    const observer = new MutationObserver(records => {
      observer.disconnect();
      for (const record of records) {
        if (record.type === 'attributes') {
          updateAttributes(record.target);
          updateLink(record.target);
        } else if (record.type === 'characterData') updateText(record.target);
        else for (const node of record.addedNodes) updateTree(node);
      }
      observer.observe(document.documentElement, options);
    });
    const options = {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributes, 'href']};
    observer.observe(document.documentElement, options);
  }).catch(() => {
    const notice = document.createElement('span');
    notice.textContent = 'Translation unavailable. The page is shown in English.';
    notice.setAttribute('role', 'status');
    bar.append(notice);
  });
})();
