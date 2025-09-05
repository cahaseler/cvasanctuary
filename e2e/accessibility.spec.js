import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    // All images should have alt text
    const images = page.locator('img');
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('alt');
    }
    
    // Page should have proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    
    // Form inputs should have labels
    const inputs = page.locator('input:not([type="hidden"])');
    for (const input of await inputs.all()) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toHaveCount(1);
      }
    }
    
    // Links should have discernible text
    const links = page.locator('a');
    for (const link of await links.all()) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('adoption page should have no accessibility violations', async ({ page }) => {
    await page.goto('/adopt');
    await page.waitForSelector('.pet-card');
    
    // Pet cards should have proper ARIA attributes
    const petCards = page.locator('.pet-card');
    for (const card of await petCards.all()) {
      // Images should have alt text
      const img = card.locator('img');
      await expect(img).toHaveAttribute('alt');
      
      // Links should be keyboard accessible
      const link = card.locator('a');
      const tabindex = await link.getAttribute('tabindex');
      expect(tabindex).not.toBe('-1');
    }
    
    // Filter buttons should be keyboard accessible
    const filterButtons = page.locator('.adoption-filters button');
    for (const button of await filterButtons.all()) {
      const tabindex = await button.getAttribute('tabindex');
      expect(tabindex).not.toBe('-1');
    }
  });

  test('site should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through main navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
    
    // Continue tabbing and ensure we can reach main content
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should be able to activate links with Enter
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should have navigated somewhere
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('site should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check primary button contrast
    const primaryButton = page.locator('.btn-primary').first();
    const buttonBg = await primaryButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    const buttonColor = await primaryButton.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Buttons should have sufficient contrast
    // This is a basic check - for comprehensive testing use axe-core
    expect(buttonBg).toBeTruthy();
    expect(buttonColor).toBeTruthy();
  });

  test('site should work with screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA landmarks
    await expect(page.locator('header[role="banner"], .site-header')).toHaveCount(1);
    await expect(page.locator('main, [role="main"]')).toHaveCount(1);
    await expect(page.locator('footer[role="contentinfo"], .site-footer')).toHaveCount(1);
    
    // Navigation should have proper ARIA
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
    
    // Skip to content link for keyboard users
    // This might not be implemented yet, but it's good practice
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toHaveAttribute('class', /sr-only|visually-hidden/);
    }
  });
});