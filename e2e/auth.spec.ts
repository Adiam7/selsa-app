import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Should display email and password fields
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"], input[name="email"]'));
    const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows validation error on empty login submit', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Click submit without filling in fields
    const submitButton = page.getByRole('button', { name: /sign in|log in|login/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show some validation feedback (error message or required attribute)
      await page.waitForTimeout(500);
      // Check for any error indicators
      const errorIndicators = page.locator('[role="alert"], .error, .text-red, .text-destructive, [aria-invalid="true"]');
      const requiredFields = page.locator(':invalid');
      const hasErrors = (await errorIndicators.count()) > 0 || (await requiredFields.count()) > 0;
      expect(hasErrors).toBe(true);
    }
  });
});
