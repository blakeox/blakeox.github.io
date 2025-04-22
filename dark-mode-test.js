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

  const resultsDir = './dark-mode-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  for (const url of urls) {
    console.log(`Testing dark mode for ${url}`);
    await page.goto(url);

    // Enable dark mode by simulating prefers-color-scheme: dark
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' },
    ]);

    const screenshotPath = `${resultsDir}/${url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_')}_dark_mode.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Dark mode screenshot saved to ${screenshotPath}`);
  }

  await browser.close();
})();