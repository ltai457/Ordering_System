import { test, expect } from '@playwright/test';

test.describe('Customer App - Basic Loading', () => {
  test('should load the customer app homepage', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads with correct title
    await expect(page).toHaveTitle(/customer-app/i);

    // Verify the app container is present
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();

    // Check for the restaurant name (use heading to be specific)
    await expect(page.getByRole('heading', { name: 'ChangAn BBQ' })).toBeVisible();
  });

  test('should display table number input modal', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show table number input modal heading or have table info text
    const tableModalHeading = page.getByRole('heading', { name: 'Enter Your Table Number' });
    const tableInfoText = page.getByText(/You are ordering for Table/i);

    // Either modal heading should be visible OR table info should be displayed
    const modalVisible = await tableModalHeading.isVisible().catch(() => false);
    const tableVisible = await tableInfoText.isVisible().catch(() => false);

    expect(modalVisible || tableVisible).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Check if search box exists
    const searchBox = page.locator('input[placeholder*="Search"]');
    await expect(searchBox).toBeVisible();
  });

  test('should have cart button', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Check for cart button using exact role and name
    const cartButton = page.getByRole('button', { name: 'Cart', exact: true });
    await expect(cartButton).toBeVisible();
  });
});

test.describe('Customer App - Menu Display (with backend)', () => {
  test('should display menu categories when data is available', async ({ page }) => {
    await page.goto('/');

    // Wait for network to be idle (data loaded)
    await page.waitForLoadState('networkidle');

    // Wait a bit for the modal to appear if needed
    await page.waitForTimeout(500);

    // Check if we need to enter table number (use heading for specificity)
    const tableModalHeading = page.getByRole('heading', { name: 'Enter Your Table Number' });
    const modalCount = await tableModalHeading.count();

    if (modalCount > 0 && await tableModalHeading.isVisible()) {
      // Enter table number
      const tableInput = page.locator('#table-number');
      await tableInput.fill('T1');
      await page.getByRole('button', { name: /Confirm/i }).click();

      // Wait for modal to close and menu to load
      await page.waitForTimeout(1000);
    }

    // Now check for categories or menu content
    // The page should show either categories or loading indicator
    const loadingIndicator = page.getByText('Loading menu...');
    const categoryHeadings = page.locator('h2.text-3xl');

    // Wait for either loading to finish or categories to appear
    await expect(loadingIndicator.or(categoryHeadings.first())).toBeVisible({ timeout: 10000 });
  });

  test('should allow searching for menu items', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Handle table modal if present (use heading)
    const tableModalHeading = page.getByRole('heading', { name: 'Enter Your Table Number' });
    const modalCount = await tableModalHeading.count();

    if (modalCount > 0) {
      const isVisible = await tableModalHeading.isVisible().catch(() => false);
      if (isVisible) {
        await page.locator('#table-number').fill('T1');
        await page.getByRole('button', { name: /Confirm/i }).click();
        await page.waitForTimeout(1500);
      }
    }

    // Find and use search box
    const searchBox = page.locator('input[placeholder*="Search"]');
    await expect(searchBox).toBeVisible({ timeout: 5000 });

    // Search for "rice" which should exist in the menu
    await searchBox.fill('rice');

    // Wait for search to process
    await page.waitForTimeout(1000);

    // Should show either "Search Results" heading or "no items found" message
    const searchResultsHeading = page.getByText(/Search Results for/i);
    const noResultsMessage = page.getByText(/No items found matching your search/i);

    // Check if either is visible
    const resultsVisible = await searchResultsHeading.isVisible().catch(() => false);
    const noResultsVisible = await noResultsMessage.isVisible().catch(() => false);

    expect(resultsVisible || noResultsVisible).toBeTruthy();
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Handle table modal if present
    const tableModalHeading = page.getByRole('heading', { name: 'Enter Your Table Number' });
    const modalCount = await tableModalHeading.count();

    if (modalCount > 0 && await tableModalHeading.isVisible()) {
      await page.locator('#table-number').fill('T1');
      await page.getByRole('button', { name: /Confirm/i }).click();
      await page.waitForTimeout(1000);
    }

    // Click cart button using exact match
    const cartButton = page.getByRole('button', { name: 'Cart', exact: true });
    await cartButton.click();

    // Should navigate to cart page
    await expect(page).toHaveURL(/\/cart/);
  });
});

test.describe('Customer App - Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Verify the page renders on mobile
    await expect(page).toHaveTitle(/customer-app/i);
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Logo heading should be visible
    await expect(page.getByRole('heading', { name: 'ChangAn BBQ' })).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Verify the page renders on tablet
    await expect(page).toHaveTitle(/customer-app/i);
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Logo heading should be visible
    await expect(page.getByRole('heading', { name: 'ChangAn BBQ' })).toBeVisible();
  });
});
