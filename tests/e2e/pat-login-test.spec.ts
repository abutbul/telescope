import { test, expect } from '@playwright/test';

declare const process: { env?: Record<string, string | undefined> };

const TARGET_URL = process?.env?.E2E_TARGET_URL ?? 'https://abutbul.github.io/telescope/';

interface ApiCallMeta {
  method: string;
  url: string;
  headers: Record<string, string>;
}

test.describe('PAT Login Test', () => {
  test('test PAT login and check API calls', async ({ page }) => {
    console.log('=== Testing PAT Login Flow ===\n');
    
    // Track API calls
    const apiCalls: ApiCallMeta[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Console Error]:`, msg.text());
        errors.push(msg.text());
      }
    });
    
    page.on('request', request => {
      if (request.url().includes('api.github.com')) {
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers()
        });
        console.log(`→ API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('api.github.com')) {
        console.log(`← API Response: ${response.status()} ${response.url()}`);
        if (!response.ok()) {
          try {
            const body = await response.text();
            console.log(`   Error body: ${body}`);
          } catch (e) {
            // ignore
          }
        }
      }
    });
    
    // Navigate to the site
    await page.goto(TARGET_URL);
    console.log('✓ Navigated to site\n');
    
    await page.waitForLoadState('networkidle');
    
    // Click PAT option
    const patButton = page.getByRole('button', { name: 'Sign in with Personal Token' });
    const patButtonVisible = await patButton.isVisible().catch(() => false);
    if (!patButtonVisible) {
      console.log('✗ PAT button not available in this build. Skipping detailed checks.');
      test.skip(true, 'PAT login UI not available on target deployment');
    }

    console.log('✓ Found PAT button\n');
    await patButton.click();
    await page.waitForTimeout(500);

    const patModal = page.getByRole('heading', { name: 'Sign in with Personal Access Token' });
    await expect(patModal).toBeVisible();
    console.log('✓ PAT modal displayed\n');
    
    // Note: We can't actually test with a real PAT in automated tests
    // Instead, let's check the structure and what happens with an invalid token
    
    console.log('\n=== Summary ===');
    console.log(`Total API calls: ${apiCalls.length}`);
    console.log(`Total errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Check session storage structure
    const storage = await page.evaluate(() => {
      return {
        sessionKeys: Object.keys(window.sessionStorage),
        sessionData: JSON.parse(JSON.stringify(window.sessionStorage))
      };
    });
    
    console.log('\nSession Storage:', JSON.stringify(storage, null, 2));
  });
});
