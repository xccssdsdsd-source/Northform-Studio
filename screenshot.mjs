import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const screenshotDir = './temporary screenshots';

if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

const files = readdirSync(screenshotDir);
const lastNum = files.length ? Math.max(...files.map(f => parseInt(f.match(/\d+/)?.[0]) || 0)) : 0;
const screenshotPath = resolve(screenshotDir, `screenshot-${lastNum + 1}.png`);

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 720 });

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
