const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
globalThis.fetch = fetch;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // List of URLs to test
  const urls = [
    'http://localhost:4001/',
    'http://localhost:4001/about/',
    'http://localhost:4001/blog/',
    'http://localhost:4001/contact/',
    'http://localhost:4001/projects/'
  ];

  for (const url of urls) {
    console.log(`Testing accessibility for ${url}`);
    await page.goto(url);

    const results = await new AxePuppeteer(page).analyze();
    console.log(JSON.stringify(results, null, 2));
  }

  await browser.close();
})();