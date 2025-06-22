import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  // Create a browser instance for cleanup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto(baseURL);
    
    // Clean up test data
    await cleanupTestData(page);

  } catch (error) {
    console.error('⚠️ Global teardown error:', error);
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ E2E test teardown complete');
}

async function cleanupTestData(page: any) {
  try {
    // Clean up test users and tenants
    const cleanupResponse = await page.evaluate(async () => {
      try {
        // This would require admin authentication in a real scenario
        const responses = await Promise.all([
          fetch('/api/admin/cleanup/e2e-test-data', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          })
        ]);
        
        return responses.every(r => r.ok);
      } catch (error) {
        return false;
      }
    });

    if (cleanupResponse) {
      console.log('✅ Test data cleaned up');
    } else {
      console.log('⚠️ Test data cleanup may have failed');
    }

  } catch (error) {
    console.log('⚠️ Test data cleanup error:', error.message);
  }
}

export default globalTeardown; 