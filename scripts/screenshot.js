#!/usr/bin/env node

import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

// Get URL from command line args
const url = process.argv[2] || 'http://localhost:8888';
const pageName = process.argv[3] || 'screenshot';

async function takeScreenshot() {
  console.log(`Taking screenshot of ${url}...`);
  
  // Ensure screenshots directory exists
  const screenshotDir = resolve(process.cwd(), 'screenshots');
  mkdirSync(screenshotDir, { recursive: true });
  
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(1000);
    
    // Take full page screenshot
    const screenshotPath = resolve(screenshotDir, `${pageName}-full.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`Full page screenshot saved to: ${screenshotPath}`);
    
    // Take viewport screenshot
    const viewportPath = resolve(screenshotDir, `${pageName}-viewport.png`);
    await page.screenshot({ 
      path: viewportPath,
      fullPage: false 
    });
    console.log(`Viewport screenshot saved to: ${viewportPath}`);
    
    // Also take mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobilePath = resolve(screenshotDir, `${pageName}-mobile.png`);
    await page.screenshot({ 
      path: mobilePath,
      fullPage: false 
    });
    console.log(`Mobile screenshot saved to: ${mobilePath}`);
    
    // Log page title and any errors
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Page error:', msg.text());
      }
    });
    
    // Get page content info
    const h1Count = await page.locator('h1').count();
    const imgCount = await page.locator('img').count();
    const linkCount = await page.locator('a').count();
    
    console.log('\nPage content summary:');
    console.log(`- H1 headings: ${h1Count}`);
    console.log(`- Images: ${imgCount}`);
    console.log(`- Links: ${linkCount}`);
    
    // Check for specific elements
    const hasHero = await page.locator('.hero').count() > 0;
    const hasNav = await page.locator('nav').count() > 0;
    const hasFooter = await page.locator('footer').count() > 0;
    
    console.log('\nKey sections:');
    console.log(`- Navigation: ${hasNav ? '✓' : '✗'}`);
    console.log(`- Hero section: ${hasHero ? '✓' : '✗'}`);
    console.log(`- Footer: ${hasFooter ? '✓' : '✗'}`);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
takeScreenshot().catch(console.error);