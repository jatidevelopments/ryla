/**
 * Admin Login Journey E2E Tests
 * 
 * Tests the complete admin login flow:
 * - Navigate to login → Enter credentials → Access dashboard
 * 
 * Note: Admin app runs on port 3004 by default.
 * Set PLAYWRIGHT_BASE_URL environment variable or update playwright.config.ts
 */

import { test, expect } from '@playwright/test';

// Get base URL from environment or use default
const ADMIN_BASE_URL = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'http://localhost:3004';

test.describe('Admin Login Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${ADMIN_BASE_URL}/login`);
  });

  test('should successfully login and access dashboard', async ({ page }) => {
    // Step 1: Navigate to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('RYLA Admin')).toBeVisible();
    await expect(page.getByText('Sign in to access the admin panel')).toBeVisible();

    // Step 2: Enter credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByPlaceholderText('••••••••');
    
    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');

    // Step 3: Submit form
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Step 4: Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    
    // Step 5: Verify dashboard is loaded
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Overview of your platform metrics')).toBeVisible();
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByPlaceholderText('••••••••');
    
    await emailInput.fill('admin@example.com');
    await passwordInput.fill('wrong-password');

    // Submit form
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Wait for error message
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({ timeout: 5000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to returnUrl after successful login', async ({ page }) => {
    // Navigate to login with returnUrl
    await page.goto('/login?returnUrl=%2Fusers');

    // Enter credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByPlaceholderText('••••••••');
    
    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');

    // Submit form
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Should redirect to returnUrl
    await page.waitForURL(/\/users/, { timeout: 5000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholderText('••••••••');
    const toggleButton = page.getByLabel(/show password/i);

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(page.getByLabel(/hide password/i)).toBeVisible();

    // Click toggle to hide password again
    await page.getByLabel(/hide password/i).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should disable submit button while loading', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByPlaceholderText('••••••••');
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password123');

    // Click submit
    await submitButton.click();

    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled();
    await expect(page.getByText('Signing in...')).toBeVisible();
  });
});
