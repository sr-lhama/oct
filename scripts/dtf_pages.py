"""Render the DTF service and educational pages from reviewed, localized copy."""
import json
from pathlib import Path
from copy import deepcopy
from lxml import etree

CONTENT = json.loads(Path(__file__).with_name('dtf-content.json').read_text())
GUIDES = {guide['slug'] + '.html': guide for guide in CONTENT['guides']}
SERVICE = 'dtf-printing.html'

BLOG = {slug + '.html': GUIDES[slug + '.html'] for slug in CONTENT['blog_slugs']}
BLOG_LABEL = {'en': 'The Sr. Lhama apparel care blog', 'es': 'El blog de cuidado de prendas de Sr. Lhama', 'pt': 'Blog do Sr. Lhama: cuide da sua camiseta'}
BLOG_INTRO = {'en': 'Learn how DTF printing works, compare fabrics and brands, and discover practical ways to keep uniforms and graphic tees looking their best.', 'es': 'Descubre cómo funciona el DTF, compara tejidos y marcas y aprende consejos para conservar tus uniformes y camisetas.', 'pt': 'Conheça a impressão DTF, compare tecidos e marcas e aprenda dicas para conservar suas camisetas e uniformes por muito mais tempo.'}
READ = {'en': 'Read article', 'es': 'Leer artículo', 'pt': 'Ler artigo'}
BACK = {'en': 'All apparel care articles', 'es': 'Todos los artículos de cuidado', 'pt': 'Todos os artigos de cuidados'}
CATEGORY = {'en': ['Printing technology', 'Care & maintenance', 'Washing guide', 'Print care', 'Performance fabrics'], 'es': ['Tecnología de estampado', 'Cuidado y mantenimiento', 'Guía de lavado', 'Cuidado del estampado', 'Tejidos técnicos'], 'pt': ['Tecnologia de impressão', 'Cuidados e conservação', 'Guia de lavagem', 'Cuidados com a estampa', 'Tecidos performance']}
BLOG_CSS = """
.oct-care-hub {padding:clamp(30px,5vw,70px) 0;scroll-margin-top:95px}
.oct-care-hub .oct-care-intro{max-width:740px;margin:0 0 28px}
.oct-care-hub h2{margin:0 0 12px;font-size:clamp(28px,4vw,44px);max-width:none}
.oct-care-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.oct-care-card{display:flex;flex-direction:column;overflow:hidden;background:#fff;border:1px solid #dce7f0;border-radius:20px;box-shadow:0 6px 22px #091a3509;transition:transform .2s ease,box-shadow .2s ease}
.oct-care-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px #091a3516}
.oct-care-card:first-child{grid-column:span 2}
.oct-care-card > a:first-child{display:block;width:100%;min-width:0}
.oct-care-card img{display:block;width:100%;height:auto;aspect-ratio:766 / 340;object-fit:contain;object-position:center}
.oct-care-card-copy{display:flex;flex-direction:column;align-items:flex-start;flex:1;padding:22px}
.oct-care-card-copy h3{font-size:clamp(20px,2.5vw,25px);line-height:1.18;margin:9px 0}
.oct-care-card-copy p{margin:0 0 18px}
.oct-care-card-copy .btn{margin-top:auto}
.oct-care-tag{font-size:.73rem;letter-spacing:.07em;text-transform:uppercase;font-weight:800;color:#005a90}
.oct-care-article{max-width:970px!important;margin:auto;width:calc(100% - 36px);padding:clamp(26px,5vw,60px) 0}
.oct-care-article h1{font-size:clamp(30px,5vw,53px);line-height:1.08;margin:20px 0}
.oct-care-article .oct-care-cover{width:100%;height:auto;border-radius:22px;margin:24px 0 12px;display:block}
.oct-care-article h2{margin-top:34px;line-height:1.15}
.oct-care-article p{max-width:74ch}
.oct-care-article .oct-care-back{font-weight:800;color:#005a90;text-decoration:underline;text-underline-offset:4px}
.oct-care-table-wrap{width:100%;overflow-x:auto;border:1px solid #dce7f0;border-radius:16px;margin:18px 0 8px}
.oct-care-table{width:100%;border-collapse:collapse;min-width:560px;text-align:left;background:#fff;font-size:.94rem;line-height:1.45}
.oct-care-table th,.oct-care-table td{padding:14px;border-bottom:1px solid #dce7f0;vertical-align:top}
.oct-care-table thead th{background:#091a35;color:#fff;font-weight:750}
.oct-care-table tbody th{color:#091a35;font-weight:750;background:#f3f8fe}
.oct-care-table tbody tr:last-child>*{border-bottom:0}
.oct-care-article .oct-care-note{font-size:.86rem;color:#526478;margin:8px 0 20px}
.oct-care-product-links{list-style:none;display:flex;flex-wrap:wrap;gap:10px;padding:0;margin:18px 0 26px}
.oct-care-sources{font-size:.9rem;padding-left:20px}
.oct-care-sources a{color:#005a90;text-decoration:underline}
@media(max-width:850px){.oct-care-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.oct-care-card:first-child{grid-column:span 2}}
@media(max-width:540px){.oct-care-grid{grid-template-columns:minmax(0,1fr)}.oct-care-card:first-child{grid-column:auto}.oct-care-card-copy{padding:18px}}
@media(prefers-reduced-motion:reduce){.oct-care-card{transition:none}}
"""

def blog_category(guide, lang):
    if guide.get('category'):
        return guide['category'][lang]
    return CATEGORY[lang][list(BLOG).index(guide['slug'] + '.html')]


def comparison_details(article, guide, lang):
    labels = {
        'en': {'compare': 'Side-by-side comparison', 'models': 'Explore these models in our catalog', 'sources': 'Supplier technical specifications', 'illustration': 'Illustrative image; see the catalog for actual product details.'},
        'es': {'compare': 'Comparación lado a lado', 'models': 'Explora estos modelos en nuestro catálogo', 'sources': 'Fichas técnicas del proveedor', 'illustration': 'Imagen ilustrativa; consulta el catálogo para ver las prendas reales.'},
        'pt': {'compare': 'Comparação lado a lado', 'models': 'Conheça estes modelos em nosso catálogo', 'sources': 'Fichas técnicas do fornecedor', 'illustration': 'Imagem ilustrativa; consulte o catálogo para ver os detalhes reais das peças.'},
    }[lang]
    comparison = guide.get('comparison')
    if comparison:
        add(article, 'h2', labels['compare'], id='fabric-comparison')
        wrap = add(article, 'div', **{'class':'oct-care-table-wrap','role':'region','aria-labelledby':'fabric-comparison','tabindex':'0'})
        table = add(wrap, 'table', **{'class':'oct-care-table'})
        head = add(add(table, 'thead'), 'tr')
        for cell in comparison['headers']:
            add(head, 'th', cell[lang], scope='col')
        body = add(table, 'tbody')
        for row in comparison['rows']:
            tr = add(body, 'tr')
            add(tr, 'th', row[0][lang], scope='row')
            for cell in row[1:]:
                add(tr, 'td', cell[lang])
        add(article, 'p', comparison['note'][lang], **{'class':'oct-care-note'})
    if guide.get('products'):
        add(article, 'h2', labels['models'])
        links = add(article, 'ul', **{'class':'oct-care-product-links'})
        for product in guide['products']:
            add(add(links, 'li'), 'a', product['label'][lang] + ' →', href=product['href'], **{'class':'btn btn-outline btn-sm'})
    if guide.get('sources'):
        add(article, 'h2', labels['sources'])
        sources = add(article, 'ul', **{'class':'oct-care-sources'})
        for source in guide['sources']:
            add(add(sources, 'li'), 'a', source['label'][lang], href=source['href'], target='_blank', rel='noopener noreferrer')


def blog_image(parent, guide, lang, cover=False):
    image = add(parent, 'img', src='assets/blog/' + guide['slug'] + '.webp',
                alt=guide['title'][lang], width='766', height='340',
                decoding='async', loading='eager' if cover else 'lazy')
    if cover:
        image.set('class', 'oct-care-cover')
        image.set('fetchpriority', 'high')
    return image

def blog_cards(page, main, lang):
    add(page.find('head'), 'style', BLOG_CSS)
    hub = etree.Element('section', {'class': 'section section-soft oct-care-hub', 'id': 'blog',
                                   'aria-labelledby': 'oct-care-title'})
    container = add(hub, 'div', **{'class': 'container'})
    intro = add(container, 'div', **{'class': 'oct-care-intro'})
    add(intro, 'span', {'en':'THE CUSTOMER GUIDE','es':'GUÍA DEL CLIENTE','pt':'GUIA DO CLIENTE'}[lang], **{'class':'eyebrow'})
    add(intro, 'h2', BLOG_LABEL[lang], id='oct-care-title')
    add(intro, 'p', BLOG_INTRO[lang], **{'class':'lead'})
    grid = add(container, 'div', **{'class':'oct-care-grid'})
    for i, (path, guide) in enumerate(BLOG.items()):
        card = add(grid, 'article', **{'class':'oct-care-card'})
        link = add(card, 'a', href=path, **{'aria-label':guide['title'][lang]})
        blog_image(link, guide, lang)
        copy = add(card, 'div', **{'class':'oct-care-card-copy'})
        add(copy, 'span', blog_category(guide, lang), **{'class':'oct-care-tag'})
        add(copy, 'h3', guide['title'][lang])
        add(copy, 'p', guide['description'][lang])
        add(copy, 'a', READ[lang] + ' →', href=path, **{'class':'btn btn-outline btn-sm','aria-label':READ[lang]+': '+guide['title'][lang]})
    overview = main.xpath('.//section[contains(@class,"how-overview")]')
    if overview:
        overview[0].addnext(hub)
    else:
        main.insert(1, hub)
    menus = main.xpath('.//ul[contains(@class,"how-guide-nav")]')
    if menus:
        add(add(menus[0], 'li'), 'a', BLOG_LABEL[lang], href='#blog')


RELATED_PAGES = {
    'index.html', 'apparel.html', 'business-uniforms-orlando.html', 'custom-t-shirts-orlando.html',
    'custom-polos-orlando.html', 'event-t-shirts-orlando.html', 'birthday-shirts-orlando.html',
    'how-it-works.html', 'services.html',
}
SERVICE_LINK = {
    'en': 'Full-color DTF printing for finished garments',
    'es': 'Impresión DTF a todo color en prendas listas para usar',
    'pt': 'Estampa DTF colorida em peças prontas para usar',
}


def add(parent, tag, text=None, **attributes):
    element = etree.SubElement(parent, tag, attributes)
    element.text = text
    return element


def heading(section, label, heading_id):
    section.set('aria-labelledby', heading_id)
    return add(section, 'h2', label, id=heading_id)


def format_page(page, filename, lang):
    main = page.find('.//main')
    if filename == 'how-it-works.html':
        blog_cards(page, main, lang)
    if filename not in GUIDES and filename != SERVICE:
        if filename in RELATED_PAGES or filename.startswith('products/'):
            section = etree.Element('p', {'class': 'container small oct-dtf-related'})
            main.addnext(section) if filename.startswith('products/') else main.append(section)
            add(section, 'a', SERVICE_LINK[lang], href=SERVICE)
        return
    landing = CONTENT['landing']
    if filename == SERVICE:
        page.find('head/title').text = landing['title'][lang]
        page.find('head/meta[@name="description"]').set('content', landing['description'][lang])
        hero = main.xpath('.//*[@class="dtf-hero-copy"]')[0]
        hero.find('h1').text = landing['heading'][lang]
        hero.find('p').text = landing['intro'][lang]

        faq = main.xpath('.//section[contains(@class,"dtf-faq")]')[0]
        price = etree.Element('section', {'class': 'container dtf-section dtf-pricing', 'id': 'pricing'})
        heading(price, landing['pricing_heading'][lang], 'dtf-price-title')
        add(price, 'p', landing['pricing_intro'][lang])
        table = add(add(price, 'div', **{'class': 'dtf-table-scroll', 'tabindex': '0',
                    'role': 'region', 'aria-labelledby': 'dtf-price-title'}), 'table')
        header = add(add(table, 'thead'), 'tr')
        for entry in landing['pricing_headers']:
            add(header, 'th', entry[lang], scope='col')
        body = add(table, 'tbody')
        for entry in landing['pricing_rows']:
            row = add(body, 'tr')
            label, placement, information = entry['cells']
            add(add(row, 'th', scope='row'), 'a', label[lang], href=entry['link'])
            for cell in (placement, information):
                add(row, 'td', cell[lang])
        faq.addprevious(price)
        for question, answer in landing['faq']:
            item = add(faq, 'details')
            add(item, 'summary', question[lang])
            add(item, 'p', answer[lang])
    else:
        guide = GUIDES[filename]
        page.find('head/title').text = guide['title'][lang] + ' | Orlando Custom Tees'
        page.find('head/meta[@name="description"]').set('content', guide['description'][lang])
        closing = deepcopy(main.xpath('.//section[contains(@class,"dtf-closing")]')[0])
        for child in list(main):
            main.remove(child)
        article = add(main, 'article', **{'class': 'container dtf-section dtf-article'})
        nav = add(article, 'nav', **{'aria-label': CONTENT['guide_label'][lang]})
        if filename in BLOG:
            add(page.find('head'), 'style', BLOG_CSS)
            article.set('class', 'container dtf-section dtf-article oct-care-article')
            add(nav, 'a', '← ' + BACK[lang], href='how-it-works.html#blog', **{'class':'oct-care-back'})
            add(article, 'span', blog_category(guide, lang), **{'class':'oct-care-tag'})
        else:
            add(nav, 'a', SERVICE_LINK[lang], href=SERVICE)
        add(article, 'h1', guide['title'][lang])
        add(article, 'p', guide['description'][lang], **{'class': 'lead'})
        if filename in BLOG:
            blog_image(article, guide, lang, cover=True)
            if guide.get('comparison'):
                add(article, 'p', {'en':'Illustrative image — see our catalog for actual product details.', 'es':'Imagen ilustrativa — consulta nuestro catálogo para ver las prendas reales.', 'pt':'Imagem ilustrativa — consulte nosso catálogo para ver os detalhes reais das peças.'}[lang], **{'class':'oct-care-note'})
        for index, item in enumerate(guide['sections'], 1):
            add(article, 'h2', item['heading'][lang], id=f'dtf-topic-{index}')
            add(article, 'p', item['text'][lang])
        if filename in BLOG:
            comparison_details(article, guide, lang)
        main.append(closing)

    related = etree.Element('section', {'class': 'container dtf-section dtf-guides', 'id': 'guides'})
    heading(related, BLOG_LABEL[lang] if filename in BLOG else CONTENT['guide_label'][lang], 'dtf-guide-title')
    links = add(related, 'ul', **{'class': 'dtf-guide-list'})
    for path, guide in (BLOG if filename in BLOG else GUIDES).items():
        if path == filename:
            continue
        card = add(links, 'li')
        add(add(card, 'h3'), 'a', guide['title'][lang], href=path)
        add(card, 'p', guide['description'][lang])
    main.xpath('.//section[contains(@class,"dtf-closing")]')[0].addprevious(related)
