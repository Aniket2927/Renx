import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form on homepage', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    // Try to login with empty fields
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Try with invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page.url()).toContain('/login');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // First register a test user
    await page.goto('/register');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for registration to complete and redirect
    await expect(page.url()).toContain('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Now test login
    await expect(page.url()).toContain('/login');
    await page.fill('input[type="email"]', 'e2e-test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/register');

    // Test validation
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test password mismatch
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible();

    // Test weak password
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();

    // Successful registration
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `test-${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Test validation
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();

    // Test with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email format')).toBeVisible();

    // Test with valid email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `session-test-${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // This would require mocking or setting a very short token expiration
    // For now, test the logout functionality
    
    // Login first
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `expiry-test-${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');

    // Manually logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page.url()).toContain('/login');

    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page.url()).toContain('/login');
  });

  test('should handle multi-tenant login', async ({ page }) => {
    // Register user for tenant 1
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `tenant1-${timestamp}@corp1.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.selectOption('select[name="tenant"]', { label: 'Corporate Plan' });
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');
    
    // Check tenant context
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('Corporate');

    // Logout and login to different tenant
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Register for different tenant
    await page.goto('/register');
    await page.fill('input[name="email"]', `tenant2-${timestamp}@startup.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.selectOption('select[name="tenant"]', { label: 'Startup Plan' });
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('Startup');
  });

  test('should handle tenant switching', async ({ page }) => {
    // This test would require a user with access to multiple tenants
    // For now, test the tenant switcher UI
    
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `multi-tenant-${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('/dashboard');

    // Look for tenant switcher
    const tenantSwitcher = page.locator('[data-testid="tenant-switcher"]');
    if (await tenantSwitcher.isVisible()) {
      await tenantSwitcher.click();
      await expect(page.locator('[data-testid="tenant-list"]')).toBeVisible();
    }
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Network error')).toBeVisible();

    // Test server error handling
    await page.unroute('**/api/auth/login');
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Server error')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();

    // Test form submission with Enter key
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.keyboard.press('Enter');

    // Should attempt login
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test touch interactions
    await page.tap('input[type="email"]');
    await page.fill('input[type="email"]', 'mobile@example.com');
    
    await page.tap('input[type="password"]');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    await page.tap('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
}); 