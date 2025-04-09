const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // List of URLs to test
  const urls = [
    'http://localhost:4000/',
    'http://localhost:4000/about/',
    'http://localhost:4000/blog/',
    'http://localhost:4000/contact/',
    'http://localhost:4000/projects/'
  ];

  const resultsDir = './axe-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  for (const url of urls) {
    console.log(`Testing accessibility for ${url}`);
    await page.goto(url);

    const results = await new AxePuppeteer(page).analyze();
    const fileName = `${resultsDir}/${url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_')}.json`;
    fs.writeFileSync(fileName, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${fileName}`);
  }

  await browser.close();
})();