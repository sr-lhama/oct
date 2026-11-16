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

  document.documentElement.lang = selected.tag;
  let translate = value => value;
  window.octLocale = {code: selected.code, tag: selected.tag, t: value => translate(value)};
  const topBar = document.querySelector('.benefitbar .inner') || document.querySelector('.header .header-actions');
  const social = topBar?.querySelector('.social-links--top');
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
    topBar?.append(bar);
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


  const consentKey = 'oct-cookie-preferences-v2';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const validChoice = value => value === 'all' || value === 'essential';
  let choice;
  try {
    const previous = JSON.parse(localStorage.getItem(consentKey));
    if (validChoice(previous?.choice) && previous.expires > Date.now()) choice = previous.choice;
  } catch {}

  // Set this to the public GA4 web-stream measurement ID before activating tracking.
  const measurementId = '';
  const analyticsEnabled = /^G-[A-Z0-9]+$/.test(measurementId)
    && ['orlandocustomtees.com','www.orlandocustomtees.com'].includes(url.hostname)
    && !url.pathname.endsWith('/customer.html');
  let analyticsLoaded = false;
  function applyAnalyticsConsent() {
    if (!analyticsEnabled) return;
    window['ga-disable-' + measurementId] = choice !== 'all';
    if (choice !== 'all') {
      if (!analyticsLoaded && !/(?:^|;\s*)_ga=/.test(document.cookie)) return;
      for (const key of ['_ga','_ga_' + measurementId.slice(2)]) {
        document.cookie = key + '=; Max-Age=0; path=/; Secure; SameSite=Lax';
        document.cookie = key + '=; Max-Age=0; path=/; domain=orlandocustomtees.com; Secure; SameSite=Lax';
      }
      return;
    }
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted'});
    window.gtag('js',new Date());
    window.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    const pageLocation = url.origin + url.pathname;
    window.gtag('event','page_view',{send_to:measurementId,page_location:pageLocation,language:selected.tag});
    window.octAnalytics = {
      lead(kind) {
        if (choice === 'all' && (kind === 'quote' || kind === 'contact')) {
          window.gtag('event','generate_lead',{send_to:measurementId,form_name:kind,page_location:pageLocation});
        }
      }
    };
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.append(tag);
  }
  applyAnalyticsConsent();

  const consent = document.createElement('section');
  consent.className = 'oct-cookie-notice';
  consent.hidden = Boolean(choice);
  consent.id = 'oct-cookie-notice';
  consent.setAttribute('aria-labelledby', 'oct-cookie-heading');
  consent.innerHTML = '<div class="oct-cookie-copy"><h2 id="oct-cookie-heading">Cookie preferences</h2>' +
    '<p>We use essential browser storage to remember your language and keep your account signed in. You can choose whether to allow optional cookies.</p>' +
    '<a href="privacy.html#cookies">Read our cookie policy</a></div>' +
    '<div class="oct-cookie-actions"><button type="button" class="btn btn-outline" data-choice="essential">Essential only</button>' +
    '<button type="button" class="btn btn-pink" data-choice="all">Accept all</button></div>';
  document.body.append(consent);

  let settings;
  let openedFromSettings = false;
  if (footer) {
    settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'oct-cookie-settings';
    settings.textContent = 'Cookie settings';
    settings.setAttribute('aria-controls', 'oct-cookie-notice');
    settings.setAttribute('aria-expanded', String(!consent.hidden));
    (footer.querySelector('.copyright') || footer.querySelector('.container') || footer).append(settings);
    settings.addEventListener('click', () => {
      openedFromSettings = true;
      consent.hidden = false;
      settings.setAttribute('aria-expanded', 'true');
      consent.querySelector('[data-choice="' + (choice || 'essential') + '"]').focus();
    });
  }
  consent.addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button || !validChoice(button.dataset.choice)) return;
    choice = button.dataset.choice;
    applyAnalyticsConsent();
    try {
      localStorage.setItem(consentKey, JSON.stringify({choice, expires: Date.now() + consentLifetime}));
    } catch {}
    consent.hidden = true;
    settings?.setAttribute('aria-expanded', 'false');
    if (openedFromSettings) settings.focus();
    openedFromSettings = false;
  });

  const attributes = ['alt', 'title', 'aria-label', 'aria-roledescription', 'aria-valuetext', 'placeholder'];
  const exclusion = 'script,style,[translate="no"],.google-review-author h3,.oct-review-person strong';
  function updateLink(element) {
    if (!element.matches('a[href]') || element.closest(exclusion)) return;
    const href = element.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const target = new URL(href, url);
    if (target.origin !== url.origin || !target.pathname.endsWith('.html')) return;
    if (target.searchParams.get('lang') === selected.code) return;
    if (selected.code === 'en' && !target.searchParams.has('lang')) return;
    target.searchParams.set('lang', selected.code);
    element.setAttribute('href', href.split(/[?#]/, 1)[0] + target.search + target.hash);
  }
  if (selected.code === 'en') {
    document.querySelectorAll('a[href*="lang="]').forEach(updateLink);
    return;
  }
  const dictionaryUrl = new URL('locale-' + selected.code + '.json', document.currentScript.src);
  dictionaryUrl.search = new URL(document.currentScript.src).search;
  fetch(dictionaryUrl).then(response => {
    if (!response.ok) throw new Error('Translation unavailable');
    return response.json();
  }).then(dictionary => {
    const identifier = /\{(\w+)\}/g;
    const normalize = value => value.trim().replace(/\s+/g, ' ');
    const canonical = new Map(Object.keys(dictionary).map(key => [normalize(key), key]));
    const lookup = value => {
      const key = Object.hasOwn(dictionary, value) ? value : canonical.get(normalize(value));
      return key === undefined ? value : dictionary[key];
    };
    const format = (key, values) => lookup(key).replace(identifier, (_, name) => values[name] ?? '');
    const patterns = [
      [/^(\d+) (pieces|colors)$/, m => m[1] + ' ' + lookup(m[2])],
      [/^(Go to banner|Illustrated example of) (.+)$/, m => lookup(m[1]) + ' ' + lookup(m[2])],
      [/^Go to review page (\d+)$/, m => format('Go to review page {n}', {n:m[1]})],
      [/^(\d+) catalog colors\. Select the color you prefer; availability is confirmed after review\.$/, m => format('{n} catalog colors. Select the color you prefer; availability is confirmed after review.', {n:m[1]})],
      [/^Request (\S+) received\. (.+)$/, m => format('Request {id} received.', {id:m[1]}) + ' ' + m[2].split(/ (?=Our team will review)/).map(lookup).join(' ')],
      [/^New request (\S+) created\. You can edit it while it remains new\.$/, m => format('New request {id} created. You can edit it while it remains new.', {id:m[1]})],
      [/^(Unable to send your request\.) (.+)$/, m => lookup(m[1]) + ' ' + (lookup(m[2]) === m[2] ? lookup('Please try again.') : lookup(m[2]))],
      [/^(Unable to load requests:|Unable to send the login link:|PayPal Sandbox status:) (.+)$/, m => lookup(m[1]) + ' ' + (m[1].startsWith('Unable') ? lookup('Please try again.') : lookup(m[2]))],
      [/^(Estimate total|Artwork|Sizes|Front|Back)([:·])\s*(.+)$/, m => lookup(m[1]) + m[2] + ' ' + lookup(m[3])],
      [/^(\d+) pieces · Front: (.*?) · Back: (.+)$/, m => m[1] + ' ' + lookup('pieces') + ' · ' + lookup('Front') + ': ' + lookup(m[2]) + ' · ' + lookup('Back') + ': ' + lookup(m[3])],
      [/^Select (.+)$/, m => format('Select {color}', {color:lookup(m[1])})],
      [/^(.+?) in (.+?) (?:—|-) (front|back|side)(?: view)?$/i, m => format('Garment image: {product} · {color} · {view}', {product:m[1],color:lookup(m[2]),view:lookup(m[3][0].toUpperCase()+m[3].slice(1).toLowerCase())})],
      [/^(Front|Back|Side) photo$/, m => format('{view} photo', {view:lookup(m[1])})],
      [/^(.+?) style (\S+)$/, m => format('{brand} style {style}', {brand:m[1],style:m[2]})],
      [/^(.+) custom apparel campaign for Orlando Custom Tees$/, m => format('{name} custom apparel campaign for Orlando Custom Tees',{name:lookup(m[1])})],
      [/^(.+?)\s*\|\s*Orlando Custom Tees$/, m => lookup(m[1]) + ' · Orlando Custom Tees'],
    ];
    translate = value => {
      const key = value.trim();
      if (!key) return value;
      const translated = lookup(key);
      if (translated !== key) return value.replace(key, () => translated);
      for (const [pattern, replacement] of patterns) {
        const match = key.match(pattern);
        if (match) return value.replace(key, () => replacement(match));
      }
      return value;
    };
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
      if (!parent || parent.closest(exclusion) || parent.tagName === 'TEXTAREA') return;
      const translated = translate(node.data);
      if (translated === node.data) return;
      if (parent.tagName === 'OPTION' && !parent.hasAttribute('value')) parent.value = parent.value;
      node.data = translated;
    }
    function updateTree(root) {
      if (root.nodeType === Node.TEXT_NODE) return updateText(root);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      updateAttributes(root);
      updateLink(root);
      for (const element of root.querySelectorAll(attributes.map(name => '[' + name + ']').concat('a[href]').join(','))) {
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
    (topBar ? bar : document.querySelector('main') || document.body).append(notice);
  });
})();
