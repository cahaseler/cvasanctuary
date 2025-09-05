import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Adopt page
    await page.locator('nav').getByText('Adopt').click();
    await expect(page).toHaveURL('/adopt');
    await expect(page.locator('h1')).toContainText('Adopt');
    
    // Navigate back home via logo
    await page.locator('.logo').click();
    await expect(page).toHaveURL('/');
    
    // Test dropdown navigation for Programs
    await page.locator('nav').getByText('Programs').hover();
    await expect(page.locator('.dropdown')).toBeVisible();
    
    // Check dropdown items
    await expect(page.locator('.dropdown').getByText('Vaccination & Microchip Clinic')).toBeVisible();
    await expect(page.locator('.dropdown').getByText('Pet Food Bank')).toBeVisible();
    await expect(page.locator('.dropdown').getByText('TNR & Barn Cats')).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('.site-footer');
    
    // Test phone link
    const phoneLink = footer.locator('a[href^="tel:"]');
    await expect(phoneLink).toHaveAttribute('href', 'tel:509-684-1475');
    
    // Test email link
    const emailLink = footer.locator('a[href^="mailto:"]');
    await expect(emailLink).toHaveAttribute('href', 'mailto:office@cvasanctuary.org');
    
    // Test social links open in new tabs
    const socialLinks = footer.locator('.social-links a');
    for (const link of await socialLinks.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 content or redirect to home
    const heading = await page.locator('h1').textContent();
    expect(heading).toMatch(/404|Not Found|Colville Valley/i);
  });
});