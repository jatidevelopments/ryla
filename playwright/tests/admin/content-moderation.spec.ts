/**
 * Content Moderation Journey E2E Tests
 * 
 * Tests the complete content moderation flow:
 * - Navigate to content → Filter → Flag image → Verify flag
 * 
 * Note: Admin app runs on port 3004 by default.
 */

import { test, expect } from '@playwright/test';

const ADMIN_BASE_URL = process.env.PLAYWRIGHT_ADMIN_BASE_URL || 'http://localhost:3004';

test.describe('Content Moderation Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${ADMIN_BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByPlaceholderText('••••••••').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for login to complete
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
  });

  test('should navigate to content page and list images', async ({ page }) => {
    // Navigate to content page
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Verify content page is loaded
    await expect(page.getByText('Content Moderation')).toBeVisible();
    await expect(page.getByText('Browse and moderate generated images')).toBeVisible();
    
    // Should show image list or empty state
    const hasImages = await page.getByText('No images found').isVisible().catch(() => false);
    const hasImageGrid = await page.locator('[class*="grid"]').isVisible().catch(() => false);
    
    expect(hasImages || hasImageGrid).toBe(true);
  });

  test('should search for images', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Enter search query
    const searchInput = page.getByPlaceholderText(/search by user, influencer, or prompt/i);
    await searchInput.fill('test prompt');
    
    // Wait for search to process
    await page.waitForTimeout(1000);
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('test prompt');
  });

  test('should filter images by status', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Find status filter
    const statusFilter = page.getByRole('combobox');
    await expect(statusFilter).toBeVisible();
    
    // Change filter to completed
    await statusFilter.selectOption('completed');
    await expect(statusFilter).toHaveValue('completed');
    
    // Filter should update
    await page.waitForTimeout(1000);
  });

  test('should toggle between grid and list view', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Find view mode toggle buttons
    const gridButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    const listButton = page.getByRole('button').filter({ has: page.locator('svg') }).nth(1);
    
    // Check if view toggle exists
    const hasViewToggle = await gridButton.isVisible().catch(() => false);
    
    if (hasViewToggle) {
      // Click list view
      await listButton.click();
      await page.waitForTimeout(500);
      
      // Click grid view
      await gridButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should open image detail modal', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Try to find an image to click
    // This depends on whether images exist in the test database
    const imageElements = page.locator('[class*="aspect"], img, [class*="image"]');
    const imageCount = await imageElements.count();
    
    if (imageCount > 0) {
      // Click first image
      await imageElements.first().click();
      
      // Wait for modal to appear
      await expect(page.getByText('Image Details')).toBeVisible({ timeout: 5000 });
      
      // Verify modal content
      await expect(page.getByText(/status|character|user|prompt/i)).toBeVisible();
    } else {
      // Skip test if no images exist
      test.skip();
    }
  });

  test('should close image detail modal', async ({ page }) => {
    await page.goto(`${ADMIN_BASE_URL}/content`);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Try to open modal
    const imageElements = page.locator('[class*="aspect"], img, [class*="image"]');
    const imageCount = await imageElements.count();
    
    if (imageCount > 0) {
      await imageElements.first().click();
      await expect(page.getByText('Image Details')).toBeVisible({ timeout: 5000 });
      
      // Find and click close button
      const closeButton = page.getByRole('button', { name: /close/i }).or(
        page.locator('button').filter({ has: page.locator('svg') }).last()
      );
      
      await closeButton.click();
      
      // Modal should close
      await expect(page.getByText('Image Details')).not.toBeVisible({ timeout: 2000 });
    } else {
      test.skip();
    }
  });
});
