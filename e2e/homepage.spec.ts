import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows store branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Selsa/i);
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');
    // Should have a link to the shop
    const shopLink = page.getByRole('link', { name: /shop/i });
    await expect(shopLink).toBeVisible();
  });
});
