#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ORIGINAL_SITE = 'https://www.cvasanctuary.org';
const NEW_SITE = 'http://localhost:8082';
const SCREENSHOT_DIR = path.join(path.dirname(__dirname), 'screenshots-comparison');

// Pages to capture (based on the URL list you provided)
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'about-cvas', path: '/about-cvas' },
  { name: 'cvas-impact', path: '/cvas-impact' },
  { name: 'our-board', path: '/our-board' },
  { name: 'adopt', path: '/adopt' },
  { name: 'volunteer-with-us', path: '/volunteer-with-us' },
  { name: 'foster-program', path: '/foster-program' },
  { name: 'programs', path: '/programs' },
  { name: 'pet-food-bank', path: '/pet-food-bank' },
  { name: 'tnr-barn-cats', path: '/tnr-barn-cats' },
  { name: 'sponsorship-program', path: '/sponsorship-program' },
  { name: 'sss', path: '/sss' },
  { name: 'newsletter', path: '/newsletter' },
  { name: 'communitypartners', path: '/communitypartners' },
  { name: 'forever-angels', path: '/forever-angels' },
  { name: 'community-resources', path: '/community-resources' },
  { name: 'contact-us', path: '/contact-us' },
  { name: 'kitten-cam-live', path: '/kitten-cam-live' },
  { name: 'donate', path: '/donate' },
];

// Viewport sizes
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

async function captureScreenshots() {
  // Create screenshot directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  console.log('Starting screenshot capture...\n');

  for (const viewport of VIEWPORTS) {
    console.log(`\nCapturing ${viewport.name} screenshots (${viewport.width}x${viewport.height})...`);
    
    // Create viewport subdirectory
    const viewportDir = path.join(SCREENSHOT_DIR, viewport.name);
    if (!fs.existsSync(viewportDir)) {
      fs.mkdirSync(viewportDir, { recursive: true });
    }

    // Create browser context with viewport
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    
    const page = await context.newPage();
    
    for (const pageInfo of PAGES) {
      console.log(`  Capturing ${pageInfo.name}...`);
      
      try {
        // Capture original site
        await page.goto(`${ORIGINAL_SITE}${pageInfo.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait a bit for any animations
        await page.waitForTimeout(2000);
        
        // Capture full page screenshot
        await page.screenshot({
          path: path.join(viewportDir, `original-${pageInfo.name}.png`),
          fullPage: true,
        });
        
        // Also capture above-the-fold
        await page.screenshot({
          path: path.join(viewportDir, `original-${pageInfo.name}-fold.png`),
          fullPage: false,
        });
        
      } catch (error) {
        console.log(`    ⚠️  Error capturing original ${pageInfo.name}: ${error.message}`);
      }
      
      try {
        // Capture new site
        await page.goto(`${NEW_SITE}${pageInfo.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait a bit for any animations
        await page.waitForTimeout(1000);
        
        // Capture full page screenshot
        await page.screenshot({
          path: path.join(viewportDir, `new-${pageInfo.name}.png`),
          fullPage: true,
        });
        
        // Also capture above-the-fold
        await page.screenshot({
          path: path.join(viewportDir, `new-${pageInfo.name}-fold.png`),
          fullPage: false,
        });
        
        console.log(`    ✓ Completed ${pageInfo.name}`);
        
      } catch (error) {
        console.log(`    ⚠️  Error capturing new ${pageInfo.name}: ${error.message}`);
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  console.log('\n✅ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
  
  // Create index file for easy reference
  const indexContent = {
    capturedAt: new Date().toISOString(),
    pages: PAGES.map(p => p.name),
    viewports: VIEWPORTS.map(v => v.name),
    originalSite: ORIGINAL_SITE,
    newSite: NEW_SITE,
  };
  
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'index.json'),
    JSON.stringify(indexContent, null, 2)
  );
}

// Run the capture
captureScreenshots().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});