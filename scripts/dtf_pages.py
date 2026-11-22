"""Render the DTF service and educational pages from reviewed, localized copy."""
import json
from pathlib import Path
from copy import deepcopy
from lxml import etree

CONTENT = json.loads(Path(__file__).with_name('dtf-content.json').read_text())
GUIDES = {guide['slug'] + '.html': guide for guide in CONTENT['guides']}
SERVICE = 'dtf-printing.html'
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
        add(nav, 'a', SERVICE_LINK[lang], href=SERVICE)
        add(article, 'h1', guide['title'][lang])
        add(article, 'p', guide['description'][lang], **{'class': 'lead'})
        for index, item in enumerate(guide['sections'], 1):
            add(article, 'h2', item['heading'][lang], id=f'dtf-topic-{index}')
            add(article, 'p', item['text'][lang])
        main.append(closing)

    related = etree.Element('section', {'class': 'container dtf-section dtf-guides', 'id': 'guides'})
    heading(related, CONTENT['guide_label'][lang], 'dtf-guide-title')
    links = add(related, 'ul', **{'class': 'dtf-guide-list'})
    for path, guide in GUIDES.items():
        if path == filename:
            continue
        card = add(links, 'li')
        add(add(card, 'h3'), 'a', guide['title'][lang], href=path)
        add(card, 'p', guide['description'][lang])
    main.xpath('.//section[contains(@class,"dtf-closing")]')[0].addprevious(related)
