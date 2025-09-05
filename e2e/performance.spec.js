import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('adoption page should handle large pet lists efficiently', async ({ page }) => {
    await page.goto('/adopt');
    
    // Measure time to first pet card
    const startTime = Date.now();
    await page.waitForSelector('.pet-card');
    const timeToFirstPet = Date.now() - startTime;
    
    // Should show first pet within 2 seconds
    expect(timeToFirstPet).toBeLessThan(2000);
    
    // Check that images are optimized
    const images = page.locator('.pet-card img');
    for (const img of await images.all()) {
      // Images should have loading attribute for lazy loading
      const loading = await img.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('should not have memory leaks when filtering pets', async ({ page }) => {
    await page.goto('/adopt');
    await page.waitForSelector('.pet-card');
    
    // Get initial memory usage
    const initialMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });
    
    // Perform multiple filter operations
    for (let i = 0; i < 10; i++) {
      await page.locator('button:has-text("Dogs")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("Cats")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("All")').click();
      await page.waitForTimeout(100);
    }
    
    // Check memory hasn't grown excessively
    const finalMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });
    
    if (initialMetrics && finalMetrics) {
      const memoryGrowth = finalMetrics - initialMetrics;
      // Memory growth should be less than 10MB
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    }
  });

  test('should cache static assets properly', async ({ page }) => {
    // First visit
    await page.goto('/');
    
    // Get all CSS and JS requests
    const assetRequests = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.css') || url.includes('.js')) {
        assetRequests.push({
          url,
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Second visit should use cache
    await page.reload();
    
    // Check that static assets have cache headers
    for (const asset of assetRequests) {
      if (asset.headers['cache-control']) {
        expect(asset.headers['cache-control']).toMatch(/max-age|immutable/);
      }
    }
  });

  test('should have optimized critical rendering path', async ({ page }) => {
    await page.goto('/');
    
    // Check that CSS is in the head
    const cssInHead = await page.locator('head link[rel="stylesheet"]').count();
    expect(cssInHead).toBeGreaterThan(0);
    
    // Check that JavaScript is deferred or at bottom
    const scriptsInHead = await page.locator('head script:not([defer]):not([async])').count();
    expect(scriptsInHead).toBe(0);
    
    // Ensure no render-blocking resources
    const metrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
        loadComplete: entries.loadEventEnd - entries.loadEventStart
      };
    });
    
    // DOM should be interactive quickly
    expect(metrics.domContentLoaded).toBeLessThan(1000);
  });
});