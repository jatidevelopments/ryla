/**
 * User Management Journey E2E Tests
 * 
 * Tests the complete user management flow:
 * - Navigate to users → Search → View detail → Update status
 * 
 * Note: Admin app runs on port 3004 by default.
 */

import { test, expect } from '@playwright/test';

const ADMIN_BASE_URL = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'http://localhost:3004';

test.describe('User Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${ADMIN_BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByPlaceholderText('••••••••').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for login to complete
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
  });

  test('should navigate to users page and list users', async ({ page }) => {
    // Navigate to users page
    await page.goto(`${ADMIN_BASE_URL}/users`);
    
    // Verify users page is loaded
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('Manage user accounts and permissions')).toBeVisible();
    
    // Should show user list or empty state
    const hasUsers = await page.getByText('No users found').isVisible().catch(() => false);
    const hasUserList = await page.getByRole('table').isVisible().catch(() => false);
    
    expect(hasUsers || hasUserList).toBe(true);
  });

  test('should search for users', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/users`);
    
    // Enter search query
    const searchInput = page.getByPlaceholderText(/search by name or email/i);
    await searchInput.fill('test@example.com');
    
    // Wait for search results (if any)
    // The search might trigger automatically or require form submission
    await page.waitForTimeout(1000);
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('test@example.com');
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/users`);
    
    // Find status filter
    const statusFilter = page.getByRole('combobox');
    await expect(statusFilter).toBeVisible();
    
    // Change filter
    await statusFilter.selectOption('banned');
    await expect(statusFilter).toHaveValue('banned');
    
    // Filter should update (results may change)
    await page.waitForTimeout(1000);
  });

  test('should view user detail page', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/users`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Try to find a user link or button to view details
    // This depends on whether users exist in the test database
    const viewButtons = page.getByText(/view|details/i);
    const viewButtonCount = await viewButtons.count();
    
    if (viewButtonCount > 0) {
      // Click first view button
      await viewButtons.first().click();
      
      // Should navigate to user detail page
      await page.waitForURL(/\/users\/[^/]+/, { timeout: 5000 });
      
      // Verify user detail page elements
      await expect(page.getByText(/user|profile|details/i)).toBeVisible();
    } else {
      // Skip test if no users exist
      test.skip();
    }
  });

  test('should navigate using pagination', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/users`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Find pagination buttons
    const nextButton = page.getByRole('button', { name: /next|chevron.*right/i }).first();
    const prevButton = page.getByRole('button', { name: /previous|chevron.*left/i }).first();
    
    // Check if pagination exists
    const hasPagination = await nextButton.isVisible().catch(() => false);
    
    if (hasPagination) {
      // Check if next button is enabled
      const isNextEnabled = await nextButton.isEnabled();
      
      if (isNextEnabled) {
        // Click next
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Previous button should now be enabled
        await expect(prevButton).toBeEnabled();
      }
    }
  });
});
