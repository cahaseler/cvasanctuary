#!/usr/bin/env node

import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

// Get URL from command line args
const url = process.argv[2] || 'http://localhost:8888';
const pageName = process.argv[3] || 'screenshot';
const scrollAmount = parseInt(process.argv[4]) || 500;

async function takeScreenshotWithScroll() {
  console.log(`Taking screenshot of ${url} with scroll...`);
  
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
    await page.waitForTimeout(2000);
    
    // Scroll down
    await page.evaluate((pixels) => {
      window.scrollBy(0, pixels);
    }, scrollAmount);
    
    // Wait for any lazy-loaded content
    await page.waitForTimeout(2000);
    
    // Take screenshot after scroll
    const screenshotPath = resolve(screenshotDir, `${pageName}-scrolled.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false 
    });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Check for specific elements
    const petCards = await page.locator('.pet-card').count();
    const loadingElement = await page.locator('.loading').count();
    const errorElement = await page.locator('.error-message, .no-pets-message').count();
    
    console.log('\nPage status:');
    console.log(`- Pet cards found: ${petCards}`);
    console.log(`- Loading indicator: ${loadingElement > 0 ? 'Yes' : 'No'}`);
    console.log(`- Error/No pets message: ${errorElement > 0 ? 'Yes' : 'No'}`);
    
    if (errorElement > 0) {
      const errorText = await page.locator('.error-message, .no-pets-message').first().textContent();
      console.log(`- Message: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
takeScreenshotWithScroll().catch(console.error);