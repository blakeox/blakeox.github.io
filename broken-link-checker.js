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

  const resultsDir = './broken-links-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  for (const url of urls) {
    console.log(`Checking broken links for ${url}`);
    await page.goto(url);

    const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
    const brokenLinks = [];

    for (const link of links) {
      try {
        const response = await page.goto(link);
        if (!response || response.status() >= 400) {
          brokenLinks.push({ link, status: response ? response.status() : 'No Response' });
        }
      } catch (error) {
        brokenLinks.push({ link, status: 'Error', error: error.message });
      }
    }

    const fileName = `${resultsDir}/${url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_')}_broken_links.json`;
    fs.writeFileSync(fileName, JSON.stringify(brokenLinks, null, 2));
    console.log(`Broken links saved to ${fileName}`);
  }

  await browser.close();
})();