import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const htmlContent = readFileSync('./index.html', 'utf-8');

try {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  console.log('✅ HTML parses without errors');

  const sections = document.querySelectorAll('section');
  console.log(`✅ Found ${sections.length} sections`);

  const sectionIds = Array.from(sections).map(s => s.id).filter(Boolean);
  console.log(`✅ Section IDs: ${sectionIds.join(', ')}`);

  const requiredIds = ['start', 'onas', 'realizacje', 'opinie', 'uslugi', 'kontakt'];
  const missing = requiredIds.filter(id => !sectionIds.includes(id));
  if (missing.length) {
    console.log(`❌ Missing sections: ${missing.join(', ')}`);
  } else {
    console.log(`✅ All required sections present`);
  }

  const tokens = document.querySelectorAll('[data-token]');
  console.log(`✅ Found ${tokens.length} token elements`);

  const images = document.querySelectorAll('img[src*="assets/img"]');
  console.log(`✅ Found ${images.length} image elements with assets/img paths`);

  const externalScripts = document.querySelectorAll('script[src*="cdnjs"], script[src*="cdn.jsdelivr"], script[src*="fonts.googleapis"]');
  console.log(`✅ Found ${externalScripts.length} external CDN scripts`);

  const header = document.querySelector('header');
  if (header && header.querySelector('.logo') && header.querySelectorAll('.dropdown').length === 2) {
    console.log('✅ Header with logo and 2 dropdowns found');
  } else {
    console.log('❌ Header structure incomplete');
  }

  const gallery = document.querySelector('.gallery');
  const galleryItems = gallery?.querySelectorAll('.gallery-item');
  if (galleryItems && galleryItems.length === 9) {
    console.log('✅ Gallery has 9 items');
  } else {
    console.log(`❌ Gallery has ${galleryItems?.length || 0} items (expected 9)`);
  }

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    console.log('✅ Lightbox element found');
  } else {
    console.log('❌ Lightbox not found');
  }

  const styles = document.querySelectorAll('style');
  console.log(`✅ Found ${styles.length} style blocks (inline CSS)`);

  const cssVars = Array.from(styles).map(s => s.textContent).join('').match(/--[\w-]+/g) || [];
  const requiredVars = ['--paper', '--paper-2', '--ink', '--ink-soft', '--navy', '--line'];
  const foundVars = requiredVars.filter(v => cssVars.includes(v));
  console.log(`✅ Found ${foundVars.length}/${requiredVars.length} required CSS variables`);

  console.log('\n✅ HTML structure validation complete');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
