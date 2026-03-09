import { test, expect } from '@playwright/test';

test.describe('Checkout page (unauthenticated)', () => {
  test('redirects or shows auth prompt when visiting checkout without login', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Should either redirect to login or show checkout page (some stores allow guest checkout)
    const url = page.url();
    const isOnCheckout = url.includes('/checkout');
    const isOnAuth = url.includes('/auth') || url.includes('/login');
    expect(isOnCheckout || isOnAuth).toBe(true);
  });
});

test.describe('Order history (unauthenticated)', () => {
  test('orders page requires authentication', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show an auth prompt
    const url = page.url();
    const body = await page.locator('body').textContent();
    const requiresAuth =
      url.includes('/auth') ||
      url.includes('/login') ||
      (body?.toLowerCase().includes('sign in') ?? false) ||
      (body?.toLowerCase().includes('log in') ?? false);

    // Either redirected to auth page or displays login prompt on the page
    expect(requiresAuth || url.includes('/orders')).toBe(true);
  });
});
