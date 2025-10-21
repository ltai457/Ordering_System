import { test, expect } from '@playwright/test';

// Staff dashboard runs on port 5174
const STAFF_DASHBOARD_URL = 'http://localhost:5174';

test.describe('Staff Dashboard - Login', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto(STAFF_DASHBOARD_URL);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Check for login page elements
    await expect(page.getByRole('heading', { name: 'Staff Portal' })).toBeVisible();
    await expect(page.getByText('Sign in to manage menu, orders, and tables.')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Click sign in without entering credentials
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation errors
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should have username and password fields', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Check for form fields
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');

    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();

    // Check field types
    await expect(usernameField).toHaveAttribute('type', 'text');
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('should allow typing in username and password fields', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');

    // Type in fields
    await usernameField.fill('testuser');
    await passwordField.fill('testpassword');

    // Verify values
    await expect(usernameField).toHaveValue('testuser');
    await expect(passwordField).toHaveValue('testpassword');
  });

  test('should show forgot password button', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    const forgotPasswordBtn = page.getByRole('button', { name: 'Forgot password?' });
    await expect(forgotPasswordBtn).toBeVisible();
  });
});

test.describe('Staff Dashboard - Navigation (requires auth)', () => {
  test('should show login page when accessing protected routes', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto(`${STAFF_DASHBOARD_URL}/dashboard`);

    // Should redirect to login or show login elements
    const isLoginPage = await page.getByRole('heading', { name: 'Staff Portal' }).isVisible().catch(() => false);
    const isAtLoginUrl = page.url().includes('/login');

    expect(isLoginPage || isAtLoginUrl).toBeTruthy();
  });

  test('should show login page when accessing menu items', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/menu/items`);

    // Should redirect to login or show login elements
    const isLoginPage = await page.getByRole('heading', { name: 'Staff Portal' }).isVisible().catch(() => false);
    const isAtLoginUrl = page.url().includes('/login');

    expect(isLoginPage || isAtLoginUrl).toBeTruthy();
  });

  test('should show login page when accessing categories', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/menu/categories`);

    // Should redirect to login or show login elements
    const isLoginPage = await page.getByRole('heading', { name: 'Staff Portal' }).isVisible().catch(() => false);
    const isAtLoginUrl = page.url().includes('/login');

    expect(isLoginPage || isAtLoginUrl).toBeTruthy();
  });
});

test.describe('Staff Dashboard - Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Login form should be visible on mobile
    await expect(page.getByRole('heading', { name: 'Staff Portal' })).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Login form should be visible on tablet
    await expect(page.getByRole('heading', { name: 'Staff Portal' })).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});

test.describe('Staff Dashboard - UI Elements', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Check page title (if set in index.html)
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should show staff access notice', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Check for access notice
    await expect(page.getByText('Access is limited to restaurant staff and administrators.')).toBeVisible();
  });

  test('should have styled login form', async ({ page }) => {
    await page.goto(`${STAFF_DASHBOARD_URL}/login`);

    // Check for form existence
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check for labels
    await expect(page.getByText('Username', { exact: true })).toBeVisible();
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
  });
});
