import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
    test('home page loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Ryla/);
    });

    test('login page loads', async ({ page }) => {
        await page.goto('/login');
        // Check for common login elements
        await expect(page.getByRole('heading', { name: /Immerse Yourself/i })).toBeVisible();
        await expect(page.getByText('Log in')).toBeVisible();
    });
});
