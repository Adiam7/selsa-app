import { test, expect } from '@playwright/test';

// Example Playwright E2E test for your Next.js app

test('homepage has expected title and content', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Selsa/i);
  // Check for a visible element or text on your homepage
  await expect(page.locator('body')).toContainText(['Selsa', 'Login', 'Sign Up']);
});
