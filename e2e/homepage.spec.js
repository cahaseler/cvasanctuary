import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the site header with logo and navigation', async ({ page }) => {
    // Site header exists
    await expect(page.locator('.site-header')).toBeVisible();
    
    // Logo is clickable and links to home
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
    
    // Main navigation items exist
    await expect(page.locator('nav').getByText('About CVAS')).toBeVisible();
    await expect(page.locator('nav').getByText('Adopt')).toBeVisible();
    await expect(page.locator('nav').getByText('Volunteer')).toBeVisible();
    await expect(page.locator('nav').getByText('Programs')).toBeVisible();
    await expect(page.locator('nav').getByText('Donate')).toBeVisible();
  });

  test('should display hero section with call-to-action buttons', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    
    // Hero has title and description
    await expect(hero.locator('h1')).toContainText('Help Animals in Need');
    await expect(hero.locator('p')).toContainText('mission');
    
    // CTA buttons exist and link correctly
    const adoptButton = hero.locator('a:has-text("View Adoptable Pets")');
    await expect(adoptButton).toBeVisible();
    await expect(adoptButton).toHaveAttribute('href', '/adopt');
    
    const donateButton = hero.locator('a:has-text("Donate Now")');
    await expect(donateButton).toBeVisible();
    await expect(donateButton).toHaveAttribute('href', '/donate');
  });

  test('should display impact statistics', async ({ page }) => {
    const stats = page.locator('.stats');
    await expect(stats).toBeVisible();
    
    // Check for stat cards
    const statCards = stats.locator('.stat-card');
    await expect(statCards).toHaveCount(3);
    
    // Each stat card has a number and label
    for (const card of await statCards.all()) {
      await expect(card.locator('.stat-number')).toBeVisible();
      await expect(card.locator('.stat-label')).toBeVisible();
    }
  });

  test('should display footer with contact information', async ({ page }) => {
    const footer = page.locator('.site-footer');
    await expect(footer).toBeVisible();
    
    // Contact info
    await expect(footer).toContainText('501 Old Arden Hwy');
    await expect(footer).toContainText('Colville, WA 99114');
    await expect(footer).toContainText('509-684-1475');
    await expect(footer).toContainText('office@cvasanctuary.org');
    
    // Social links
    await expect(footer.locator('a[aria-label="Facebook"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="Instagram"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="TikTok"]')).toBeVisible();
  });

  test('should have responsive mobile navigation', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu toggle should be visible
    const menuToggle = page.locator('.nav-toggle');
    await expect(menuToggle).toBeVisible();
    
    // Desktop menu should be hidden
    await expect(page.locator('.nav-menu')).not.toBeVisible();
    
    // Click toggle to open menu
    await menuToggle.click();
    await expect(page.locator('.nav-menu')).toBeVisible();
  });
});