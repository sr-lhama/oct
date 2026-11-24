"""Build crawlable product and language pages from the public site sources."""
from copy import deepcopy
from pathlib import Path
import argparse
import json
import re
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from lxml import etree, html

from dtf_pages import GUIDES, SERVICE, format_page

ORIGIN = 'https://orlandocustomtees.com'
LOCALES = {'en': 'en-US', 'es': 'es', 'pt': 'pt-BR'}
SOCIAL_IMAGE = '/assets/images/orlando-custom-tees-share.jpg'
PRODUCTS = {
    'gildan-64000': ('64000', 'Gildan 64000 Softstyle'),
    'next-level-6210': ('6210', 'Next Level 6210 CVC'),
    'team365-tt11': ('TT11', 'Team 365 TT11 Performance'),
    'team365-tt11l': ('TT11L', 'Team 365 TT11 Long Sleeve'),
    'team365-tt21': ('TT21', 'Team 365 TT21 Polo'),
    'premium-hoodie': ('18500', 'Gildan 18500 Hoodie'),
    'custom-cap': ('110M5', 'Flexfit 110M5'),
}
PRIVATE = {'product.html', 'customer.html', '404.html'}
SOCIAL_PROFILES = [
    'https://www.facebook.com/orlandotshirt/',
    'https://www.instagram.com/orlandotshirt/',
    'https://www.tiktok.com/@orlandotshirt',
    'https://www.youtube.com/@OrlandoTshirt',
    'https://wa.me/message/BKYBFEAJW4RJP1',
]
VERSIONED = {'site.js', 'language.js', 'garment-catalog.js', 'gildan-64000.js', 'product-banner.js',
             'site.css', 'dtf-page.css', 'locale-es.json', 'locale-pt.json'}
ATTRS = {'alt', 'title', 'aria-label', 'aria-roledescription', 'aria-valuetext', 'placeholder'}
ROOT = Path(__file__).resolve().parents[1]


def parse(path):
    return html.parse(str(path), parser=html.HTMLParser(encoding='utf-8')).getroot()


def write_page(path, page):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(html.tostring(page, encoding='utf-8', doctype='<!doctype html>') + b'\n')


def canonical_path(filename, lang):
    path = '/' if filename == 'index.html' else '/' + filename
    return path if lang == 'en' else '/' + lang + path


def set_meta(head, key, value, attribute='property'):
    nodes = head.xpath('meta[@' + attribute + '=$key]', key=key)
    node = nodes[0] if nodes else etree.SubElement(head, 'meta', {attribute: key})
    for duplicate in nodes[1:]:
        head.remove(duplicate)
    node.set('content', value)


def meta_content(head, name):
    return head.find('meta[@name="' + name + '"]').get('content')


def add_schema(head, data):
    etree.SubElement(head, 'script', type='application/ld+json').text = json.dumps(
        {'@context': 'https://schema.org', **data}, ensure_ascii=False, separators=(',', ':')
    ).replace('<', '\\u003c')


def translate_page(page, lookup):
    def preserve_space(value):
        if value and value.strip():
            key = value.strip()
            return value.replace(key, lookup(key), 1)
        return value

    for element in page.iter():
        if not isinstance(element.tag, str):
            continue
        if any(parent.tag in {'script', 'style', 'textarea'} or parent.get('translate') == 'no'
               for parent in [element, *element.iterancestors()] if isinstance(parent.tag, str)):
            continue
        if element.tag == 'option' and 'value' not in element.attrib and element.text:
            element.set('value', element.text)
        element.text = preserve_space(element.text)
        for child in element:
            child.tail = preserve_space(child.tail)
        for attribute in ATTRS.intersection(element.attrib):
            element.set(attribute, preserve_space(element.get(attribute)))


def rewrite_links(page, filename, lang, localized, revision):
    current = canonical_path(filename, lang)
    nested = filename.startswith('products/') or lang != 'en'
    for element in page.xpath('//*[@href or @src]'):
        for attribute in ('href', 'src'):
            value = element.get(attribute)
            if not value:
                continue
            link = urlsplit(value)
            if link.scheme and (link.scheme != 'https' or link.netloc not in
                                {'orlandocustomtees.com', 'www.orlandocustomtees.com'}):
                if 'fonts.googleapis.com' in value or 'fonts.gstatic.com' in value:
                    element.getparent().remove(element)
                continue
            if link.netloc and not link.scheme:
                continue
            if value.startswith('#'):
                if nested:
                    element.set(attribute, current + value)
                continue
            path = link.path.lstrip('/')
            query = parse_qs(link.query, keep_blank_values=True)
            if element.tag == 'a' and path == 'product.html':
                product = query.get('id', [''])[0]
                if product in PRODUCTS:
                    path = 'products/' + product + '.html'
                    query.pop('id')
                    if 'photo' in element.get('class', '').split():
                        element.set('data-catalog-product', product)
            if path.endswith('logo-header-animated.gif'):
                path = path.removesuffix('.gif') + '.webp'
            if element.tag == 'img' and 'oct-showcase-logo' in element.get('class', '') and path.endswith('logo-official.webp'):
                path = 'assets/images/logo-card.webp'
            if lang != 'en' and element.tag == 'a' and (path in localized or not path):
                path = canonical_path(path or 'index.html', lang).lstrip('/')
                query.pop('lang', None)
            if path.rsplit('/', 1)[-1] in VERSIONED:
                query['v'] = [revision]
            if path or value.startswith(ORIGIN):
                element.set(attribute, urlunsplit(('', '', '/' + path, urlencode(query, doseq=True), link.fragment)))


def base_product(page, slug, catalog, specs):
    model, name = PRODUCTS[slug]
    product = catalog[model]
    details = specs.get(slug)
    color = next(color for color in product['colors'] if 'Front' in color['views'])
    photo = '/assets/catalog/' + color['views']['Front']
    head = page.find('head')
    page.set('data-product', slug)
    intro = head.xpath('meta[@name="description"]')[0]
    intro.set('content', details['summary'] if details else {
        '64000': 'A lightweight, modern-classic crewneck for custom DTF printing, staff shirts and event apparel.',
        '110M5': 'An adjustable mesh-back cap for custom team apparel and branded merchandise.',
    }[model])
    head.find('title').text = name + ' Custom Printing in Orlando | Orlando Custom Tees'
    original = page.xpath('//main[@id="main"]')[0]
    if model != '110M5':
        template = page.xpath('//template[@id="gildan-64000-template"]/main')[0]
        main = deepcopy(template)
        original.getparent().replace(original, main)
        main.xpath('.//*[@data-gildan-photo]')[0].set('src', photo)
        main.xpath('.//*[@data-gildan-photo]')[0].set('alt', name)
        main.xpath('.//*[@data-gildan-color]')[0].text = color['name']
        main.xpath('.//*[@data-gildan-count]')[0].text = str(len(product['colors'])) + ' colors'
        main.xpath('.//*[@data-gildan-quote]')[0].set('href', '/quote.html?' + urlencode({'product': name}))
        if details:
            main.xpath('.//h1')[0].text = details['title']
            main.xpath('.//*[@class="oct-gildan-brand"]')[0].text = details['brand']
            main.xpath('.//*[@class="oct-gildan-meta"]/p/strong')[0].text = details['sizes'][0] + '–' + details['sizes'][-1]
            main.xpath('.//nav/span[@aria-current]')[0].text = name
            description = main.xpath('.//*[@id="gildan-description"]')[0]
            for child in list(description):
                description.remove(child)
            etree.SubElement(description, 'p').text = details['summary']
            features = etree.SubElement(description, 'ul')
            for feature in details['features']:
                etree.SubElement(features, 'li').text = feature
            table = main.xpath('.//*[@id="gildan-specs"]//table')[0]
            row = table.find('thead/tr')
            body = table.find('tbody')
            for element in (row, body):
                for child in list(element):
                    element.remove(child)
            for label in ['Measurement', *details['sizes']]:
                etree.SubElement(row, 'th', scope='col').text = label
            for label, values in details['rows'].items():
                row = etree.SubElement(body, 'tr')
                etree.SubElement(row, 'th', scope='row').text = label
                for value in values:
                    etree.SubElement(row, 'td').text = value
    else:
        original.xpath('.//h1')[0].text = name
        original.xpath('.//*[@data-product-name]')[0].text = 'Adjustable mesh-back cap'
        original.xpath('.//*[@data-product-subtitle]')[0].text = 'One size'
        original.xpath('.//*[@data-product-description]')[0].text = intro.get('content')
        original.xpath('.//*[@data-product-type]')[0].text = 'Custom Caps'
        original.xpath('.//*[@data-product-material]')[0].text = 'Placement confirmed with your quote'
        original.xpath('.//*[@data-product-image]')[0].set('src', photo)
        original.xpath('.//*[@data-product-image]')[0].set('alt', name)
        original.xpath('.//*[@data-product-link]')[0].set('href', '/quote.html?' + urlencode({'product': name}))


def build(output, revision):
    pages = {path.name for path in ROOT.glob('*.html')} | set(GUIDES)
    localized = pages - PRIVATE | {'products/' + slug + '.html' for slug in PRODUCTS}
    routes = pages | localized
    catalog = {record['model']: record for record in json.loads(
        (ROOT / 'assets/catalog/catalogo_por_modelo.json').read_text())['products']}
    specs = json.loads(re.search(r'const models = (\{.*?\n  \});',
                                (ROOT/'js/gildan-64000.js').read_text(), re.S)[1])
    dictionaries = {
        lang: {' '.join(key.split()): value for key, value in
               json.loads((ROOT / f'js/locale-{lang}.json').read_text()).items()}
        for lang in ('es', 'pt')
    }
    sitemap = etree.Element('urlset', nsmap={None: 'http://www.sitemaps.org/schemas/sitemap/0.9'})
    homepage_styles = []
    for filename in sorted(routes):
        slug = Path(filename).stem if filename.startswith('products/') else None
        for lang in (LOCALES if filename in localized else ['en']):
            source = 'product.html' if slug else SERVICE if filename in GUIDES else filename
            page = parse(ROOT / source)
            head = page.find('head')
            if slug:
                base_product(page, slug, catalog, specs)
            page.set('lang', LOCALES[lang])
            if filename in localized:
                page.set('data-oct-localized', '')
            if slug or lang != 'en':
                charset = head.find('meta[@charset]')
                head.insert(head.index(charset) + 1 if charset is not None else 0, etree.Element('base', href='/'))
            lookup = lambda value: dictionaries.get(lang, {}).get(' '.join(value.split()), value)
            translate_page(page, lookup)
            if lang != 'en':
                for meta in head.xpath('meta[@name="description"]'):
                    meta.set('content', lookup(meta.get('content')))
                if slug:
                    suffix = {'es': 'Estampado personalizado en Orlando', 'pt': 'Estampa personalizada em Orlando'}[lang]
                    head.find('title').text = PRODUCTS[slug][1] + ' | ' + suffix + ' | Orlando Custom Tees'
            format_page(page, filename, lang)
            rewrite_links(page, filename, lang, localized, revision)

            url = ORIGIN + canonical_path(filename, lang)
            for element in head.xpath('link[@rel="canonical" or @hreflang]'):
                head.remove(element)
            if filename not in {'404.html', 'customer.html'}:
                etree.SubElement(head, 'link', rel='canonical', href=url)
            if filename in localized:
                for code, tag in {**LOCALES, 'x-default': 'x-default'}.items():
                    target = ORIGIN + canonical_path(filename, 'en' if code == 'x-default' else code)
                    etree.SubElement(head, 'link', rel='alternate', hreflang=tag, href=target)

            title = head.findtext('title')
            description = meta_content(head, 'description') if head.find('meta[@name="description"]') is not None else title
            social_alt = {'en': 'Orlando Custom Tees custom apparel', 'es': 'Ropa personalizada de Orlando Custom Tees',
                          'pt': 'Vestuário personalizado da Orlando Custom Tees'}[lang]
            for key, value in {'og:url': url, 'og:title': title, 'og:description': description,
                               'og:site_name': 'Orlando Custom Tees', 'og:type': 'product' if slug else 'article' if filename in GUIDES else 'website',
                               'og:locale': LOCALES[lang].replace('-', '_') if lang != 'es' else 'es_US',
                               'og:image': ORIGIN + SOCIAL_IMAGE, 'og:image:width': '1200', 'og:image:height': '630',
                               'og:image:alt': social_alt}.items():
                set_meta(head, key, value)
            for key, value in {'card': 'summary_large_image', 'title': title, 'description': description,
                               'image': ORIGIN + SOCIAL_IMAGE, 'image:alt': social_alt}.items():
                set_meta(head, 'twitter:' + key, value, 'name')

            if filename == 'index.html':
                for node in head.xpath('script[@type="application/ld+json"]'):
                    data = json.loads(node.text)
                    if data.get('@type') == 'Organization':
                        head.remove(node)
                        add_schema(head, {**data, '@type': 'LocalBusiness', 'sameAs': SOCIAL_PROFILES,
                                          'areaServed': {'@type': 'City', 'name': 'Orlando',
                                                         'containedInPlace': {'@type': 'State', 'name': 'Florida'}}})
                styles = head.xpath('link[@rel="stylesheet" and starts-with(@href,"/css/")]')
                homepage_styles = [urlsplit(node.get('href')).path.lstrip('/') for node in styles]
                styles[0].set('href', '/css/home-bundle.css?v=' + revision)
                for node in styles[1:]:
                    head.remove(node)
            if filename == 'services.html':
                for node in head.xpath('meta[@name="robots" and contains(@content, "noindex")]'):
                    head.remove(node)
            if filename == 'product.html':
                set_meta(head, 'robots', 'noindex,follow', 'name')
            service_page = filename.endswith('-orlando.html') or filename in {'dtf-printing.html', 'services.html'}
            if slug or service_page or filename in GUIDES:
                home_labels = {'en': 'Home', 'es': 'Inicio', 'pt': 'Início'}
                catalog_labels = {'en': 'Apparel', 'es': 'Ropa', 'pt': 'Vestuário'}
                services_labels = {'en': 'Services', 'es': 'Servicios', 'pt': 'Serviços'}
                trail = [(home_labels[lang], canonical_path('index.html', lang))]
                if slug:
                    trail.append((catalog_labels[lang], canonical_path('apparel.html', lang)))
                elif filename in GUIDES:
                    trail.append((lookup('DTF Printing'), canonical_path(SERVICE, lang)))
                elif filename != 'services.html':
                    trail.append((services_labels[lang], canonical_path('services.html', lang)))
                current_name = PRODUCTS[slug][1] if slug else title.split(' | ', 1)[0]
                items = [
                    {'@type': 'ListItem', 'position': index, 'name': name, 'item': ORIGIN + path}
                    for index, (name, path) in enumerate(trail, 1)
                ]
                items.append({'@type': 'ListItem', 'position': len(items) + 1, 'name': current_name})
                add_schema(head, {'@type': 'BreadcrumbList', 'itemListElement': items})
            if filename in {'how-it-works.html', SERVICE}:
                questions = []
                for details in page.xpath('//main//details[summary]'):
                    question = ' '.join(details.find('summary').text_content().split())
                    answer = ' '.join(' '.join(node.text_content() for node in details if node.tag != 'summary').split())
                    if question and answer:
                        questions.append({'@type': 'Question', 'name': question,
                                          'acceptedAnswer': {'@type': 'Answer', 'text': answer}})
                if questions:
                    add_schema(head, {'@type': 'FAQPage', 'mainEntity': questions})

            destination = output / (filename if lang == 'en' else lang + '/' + filename)
            write_page(destination, page)
            robots = head.find('meta[@name="robots"]')
            if filename not in PRIVATE and (robots is None or 'noindex' not in robots.get('content', '')):
                etree.SubElement(etree.SubElement(sitemap, 'url'), 'loc').text = url
    if not homepage_styles:
        raise RuntimeError('No home stylesheets found')
    (output/'css').mkdir(exist_ok=True)
    (output/'css/home-bundle.css').write_text('\n'.join((ROOT/path).read_text() for path in homepage_styles))
    (output/'sitemap.xml').write_bytes(etree.tostring(sitemap, xml_declaration=True, encoding='UTF-8', pretty_print=True))
    (output/'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {ORIGIN}/sitemap.xml\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=Path)
    parser.add_argument('--revision', default='seo1')
    args = parser.parse_args()
    build(args.output, args.revision)
