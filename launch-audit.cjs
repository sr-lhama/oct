const { chromium, webkit, devices } = require('playwright');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');

const origin = 'http://127.0.0.1:4173';
const pages = ['/', '/apparel.html', '/product.html?id=team365-tt21', '/quote.html', '/contact.html', '/customer.html', '/work.html'];

async function viewport(engine, label, options) {
  const browser = await engine.launch();
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const path of pages) {
      await page.goto(origin + path, {waitUntil:'domcontentloaded'});
      await page.locator('.oct-cookie-notice').waitFor({state:'attached'});
      const widths = await page.evaluate(() => ({screen:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
      console.log('VIEWPORT',label,path,JSON.stringify(widths));
      if (widths.content > widths.screen + 1) errors.push(label + ' overflow ' + path + ' ' + JSON.stringify(widths));
      const picker = page.locator('.oct-cookie-notice [data-choice="essential"]');
      if (await picker.isVisible()) await picker.click();
    }
    await page.goto(origin + '/quote.html?lang=pt');
    await page.locator('.mobile-menu').waitFor({state:'attached'});
    const nav = page.locator('[data-menu-toggle]');
    if (await nav.isVisible()) {
      await nav.click();
      assert.equal(await nav.getAttribute('aria-expanded'),'true');
    }
    await page.locator('.oct-cookie-settings').click();
    await page.getByRole('button',{name:'Só os essenciais'}).waitFor();
    await page.getByRole('button',{name:'Só os essenciais'}).click();
    const data = await page.evaluate(() => ({ consent:JSON.parse(localStorage.getItem('oct-cookie-preferences-v2')).choice, lang:document.documentElement.lang }));
    assert.deepEqual(data,{consent:'essential',lang:'pt-BR'});
  } catch (error) {
    errors.push(label + ' ' + error.message);
  } finally {
    await browser.close();
  }
  return errors;
}

async function audit() {
  const issues = [];
  issues.push(...await viewport(chromium,'Desktop 1440',{viewport:{width:1440,height:900}}));
  issues.push(...await viewport(chromium,'Tablet 768',{viewport:{width:768,height:1024},hasTouch:true}));
  issues.push(...await viewport(chromium,'Mobile 360',{viewport:{width:360,height:800},isMobile:true,hasTouch:true}));
  issues.push(...await viewport(webkit,'iPhone 13',{...devices['iPhone 13']}));
  for (const [mode,path] of [['mobile','/'],['desktop','/'],['mobile','/quote.html']]) {
    const args = [origin+path,'--only-categories=performance,accessibility,seo','--chrome-flags=--headless --no-sandbox','--output=json','--output-path=audit.json','--quiet'];
    if (mode === 'desktop') args.push('--preset=desktop');
    execFileSync('./node_modules/.bin/lighthouse',args,{stdio:'inherit',env:{...process.env,CHROME_PATH:chromium.executablePath()}});
    const report=JSON.parse(readFileSync('audit.json','utf8'));
    console.log('LIGHTHOUSE',mode,path,JSON.stringify({performance:report.categories.performance.score,accessibility:report.categories.accessibility.score,seo:report.categories.seo.score,LCP:report.audits['largest-contentful-paint'].numericValue,CLS:report.audits['cumulative-layout-shift'].numericValue,TBT:report.audits['total-blocking-time'].numericValue}));
  }
  if (issues.length) throw new Error(issues.join('\n'));
}
audit().catch(error=>{ console.error(error); process.exitCode=1; });
