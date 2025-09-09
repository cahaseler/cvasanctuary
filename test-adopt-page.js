import { chromium } from 'playwright';

async function testAdoptPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:8080/adopt/');
    await page.goto('http://localhost:8080/adopt/', { waitUntil: 'networkidle' });
    
    console.log('Waiting for content to load...');
    
    // Wait for either pet cards to appear or error message to show
    // Using a race condition to handle both success and failure cases
    try {
      await Promise.race([
        page.waitForSelector('.pet-card', { timeout: 10000 }),
        page.waitForSelector('.error', { timeout: 10000 }),
        page.waitForSelector('[data-error]', { timeout: 10000 }),
        page.waitForFunction(() => {
          const content = document.body.textContent;
          return content.includes('Error') || content.includes('failed') || content.includes('Unable to load');
        }, { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('Timeout waiting for content, proceeding with screenshot...');
    }
    
    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000);
    
    // Count pet cards
    const petCards = await page.$$('.pet-card');
    const petCardCount = petCards.length;
    
    // Check for error messages
    const errorElements = await page.$$('.error, [data-error]');
    const hasErrors = errorElements.length > 0;
    
    // Get page content to check for error text
    const bodyText = await page.textContent('body');
    const hasErrorText = bodyText.includes('Error') || bodyText.includes('failed') || bodyText.includes('Unable to load');
    
    console.log(`Found ${petCardCount} pet cards`);
    console.log(`Has error elements: ${hasErrors}`);
    console.log(`Has error text: ${hasErrorText}`);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: '/tmp/adopt_page_local.png', 
      fullPage: true 
    });
    
    console.log('Screenshot saved to /tmp/adopt_page_local.png');
    
    // Report results
    if (petCardCount > 0) {
      console.log(`✅ SUCCESS: ${petCardCount} pet cards loaded correctly`);
    } else if (hasErrors || hasErrorText) {
      console.log('❌ ERROR: Error message displayed, pets did not load');
    } else {
      console.log('⚠️  UNKNOWN: No pet cards found, but no obvious error message either');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    
    // Still try to take a screenshot for debugging
    try {
      await page.screenshot({ 
        path: '/tmp/adopt_page_local.png', 
        fullPage: true 
      });
      console.log('Error screenshot saved to /tmp/adopt_page_local.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
  } finally {
    await browser.close();
  }
}

testAdoptPage();