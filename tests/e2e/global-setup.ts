import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Start the development server if not already running
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    // Check if server is already running
    const response = await fetch(baseURL);
    if (response.ok) {
      console.log('✅ Server already running at', baseURL);
    }
  } catch (error) {
    console.log('⚠️ Server not running, tests may fail');
  }

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto(baseURL);
    
    // Wait for the app to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Application is accessible');

    // Create test data if needed
    await setupTestData(page);

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ E2E test setup complete');
}

async function setupTestData(page: any) {
  try {
    // Create test tenant if needed
    const createTenantResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'E2E Test Corporation',
            domain: 'e2e-test.com',
            plan: 'enterprise'
          })
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    });

    if (createTenantResponse) {
      console.log('✅ Test tenant created');
    }

    // Create test admin user if needed
    const createAdminResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@e2e-test.com',
            password: 'AdminPassword123!',
            tenantId: 'e2e-test-tenant'
          })
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    });

    if (createAdminResponse) {
      console.log('✅ Test admin user created');
    }

  } catch (error) {
    console.log('⚠️ Test data setup failed:', error.message);
  }
}

export default globalSetup; 