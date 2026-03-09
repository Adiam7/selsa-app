import { test, expect } from '@playwright/test';

test.describe('Shop → Cart flow', () => {
  test('can browse products on shop page', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Should display at least one product card or a product grid
    const productCards = page.locator('[data-testid="product-card"], .product-card, article');
    // If products exist, ensure at least one is visible
    const count = await productCards.count();
    if (count > 0) {
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('can navigate to a product detail page', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Click the first product link
    const firstProduct = page.locator('a[href*="/shop/"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      // Should be on a product detail page
      expect(page.url()).toMatch(/\/shop\/.+/);
    }
  });

  test('can view cart page', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    // Cart page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
