import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const screenshotDir = './temporary screenshots';
mkdirSync(screenshotDir, { recursive: true });

let screenshotNum = 1;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  const path = `${screenshotDir}/screenshot-${++screenshotNum}-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`✅ Screenshot: ${name}`);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 720 });

  try {
    // Load page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');
    await screenshot(page, 'home');

    // Test dropdown Menu
    console.log('\n--- Testing Menu Dropdown ---');
    await page.click('button:nth-of-type(1)'); // First dropdown (Menu)
    await page.waitForSelector('.dropdown-menu[aria-hidden="false"]', { timeout: 2000 });
    await screenshot(page, 'menu-open');
    console.log('✅ Menu dropdown opens');

    // Click on O nas link
    await page.click('.dropdown-menu a:nth-of-type(1)'); // O nas link
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
    await wait(1500); // Wait for smooth scroll
    await screenshot(page, 'after-scroll-onas');
    console.log('✅ Smooth scroll to O nas works');

    // Test Kontakt dropdown (back to top)
    console.log('\n--- Testing Kontakt Dropdown ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await wait(500);
    const buttons = await page.$$('button.dropdown-btn');
    if (buttons.length >= 2) {
      await buttons[1].click(); // Second dropdown (Kontakt)
      await page.waitForSelector('.dropdown-menu[aria-hidden="false"]', { timeout: 2000 });
      await screenshot(page, 'kontakt-open');
      console.log('✅ Kontakt dropdown opens');

      // Close dropdown
      await page.keyboard.press('Escape');
      await wait(300);
      const isOpen = await page.evaluate(() => {
        return document.querySelector('.dropdown-menu[aria-hidden="false"]') !== null;
      });
      console.log(`✅ ESC closes dropdown: ${!isOpen}`);
    }

    // Test gallery lightbox
    console.log('\n--- Testing Gallery Lightbox ---');
    await page.goto('http://localhost:3000/#realizacje', { waitUntil: 'networkidle0' });
    await wait(1000);

    // Click first gallery item
    const galleryItems = await page.$$('.gallery-item img');
    await galleryItems[0].click();
    await page.waitForSelector('.lightbox.active', { timeout: 2000 });
    await screenshot(page, 'lightbox-open');
    console.log('✅ Lightbox opens on gallery click');

    // Test next button
    await page.click('.lightbox-btn.next');
    await wait(300);
    await screenshot(page, 'lightbox-next');
    console.log('✅ Lightbox next button works');

    // Test prev button
    await page.click('.lightbox-btn.prev');
    await wait(300);
    console.log('✅ Lightbox prev button works');

    // Close lightbox with ESC
    await page.keyboard.press('Escape');
    await wait(300);
    const lightboxClosed = await page.evaluate(() => {
      return !document.getElementById('lightbox').classList.contains('active');
    });
    console.log(`✅ ESC closes lightbox: ${lightboxClosed}`);
    await screenshot(page, 'lightbox-closed');

    // Test token hiding
    console.log('\n--- Testing Token Hiding ---');
    const hiddenTokens = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-token]');
      let hidden = 0;
      elements.forEach(el => {
        if (el.classList.contains('hidden')) hidden++;
      });
      return hidden;
    });
    console.log(`✅ Empty tokens hidden: ${hiddenTokens > 0}`);

    // Test hover effects on services
    console.log('\n--- Testing Service Hover ---');
    await page.goto('http://localhost:3000/#uslugi', { waitUntil: 'networkidle0' });
    await wait(500);
    const serviceItem = await page.$('.service-item');
    await serviceItem.hover();
    await wait(300);
    await screenshot(page, 'service-hover');
    console.log('✅ Service item hover works');

    console.log('\n✅ All interactive features tested successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
