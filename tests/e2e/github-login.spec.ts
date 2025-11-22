import { test, expect } from '@playwright/test';

test.describe('GitHub Login Investigation', () => {
  test('investigate login flow on deployed site', async ({ page }) => {
    console.log('=== Starting GitHub Login Investigation ===\n');
    
    // Navigate to the deployed site
    await page.goto('https://abutbul.github.io/telescope/');
    console.log('✓ Navigated to: https://abutbul.github.io/telescope/\n');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/e2e/screenshots/1-initial-page.png', fullPage: true });
    console.log('✓ Captured initial page screenshot\n');
    
    // Look for login button
    const loginButton = page.locator('button:has-text("Sign in with GitHub")');
    const loginButtonExists = await loginButton.count() > 0;
    console.log(`Login button exists: ${loginButtonExists}`);
    
    if (loginButtonExists) {
      console.log('✓ Found "Sign in with GitHub" button\n');
      
      // Set up console and network listeners
      page.on('console', msg => {
        console.log(`[Browser Console - ${msg.type()}]:`, msg.text());
      });
      
      let deviceFlowRequested = false;
      let requestErrors: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('github.com')) {
          console.log(`→ Request: ${request.method()} ${request.url()}`);
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('github.com')) {
          console.log(`← Response: ${response.status()} ${response.url()}`);
          if (response.url().includes('login/device/code')) {
            deviceFlowRequested = true;
          }
        }
      });
      
      page.on('requestfailed', request => {
        console.log(`✗ Request failed: ${request.url()}`);
        console.log(`  Failure: ${request.failure()?.errorText}`);
        requestErrors.push({
          url: request.url(),
          error: request.failure()?.errorText
        });
      });
      
      // Click the login button
      console.log('\n=== Clicking Sign in with GitHub button ===\n');
      await loginButton.click();
      
      // Wait a bit to see what happens
      await page.waitForTimeout(3000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'tests/e2e/screenshots/2-after-click.png', fullPage: true });
      console.log('✓ Captured after-click screenshot\n');
      
      // Check for authentication modal/instructions
      const modal = page.locator('text=Complete Authentication');
      const modalVisible = await modal.isVisible().catch(() => false);
      console.log(`Authentication modal visible: ${modalVisible}`);
      
      if (modalVisible) {
        console.log('✓ Device flow modal appeared\n');
        
        // Try to extract device code and verification URI
        const codeElement = page.locator('code');
        const linkElement = page.locator('a[href*="github.com"]');
        
        if (await codeElement.count() > 0) {
          const deviceCode = await codeElement.textContent();
          console.log(`Device code displayed: ${deviceCode}`);
        }
        
        if (await linkElement.count() > 0) {
          const verificationUri = await linkElement.getAttribute('href');
          console.log(`Verification URI: ${verificationUri}`);
        }
      } else {
        console.log('✗ No authentication modal appeared\n');
      }
      
      // Check for any error messages
      const errorMessages = await page.locator('[class*="error"], [role="alert"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('\n=== Error Messages Found ===');
        errorMessages.forEach(msg => console.log(`  - ${msg}`));
      }
      
      // Summary
      console.log('\n=== Summary ===');
      console.log(`Device flow initiated: ${deviceFlowRequested}`);
      console.log(`Network errors: ${requestErrors.length}`);
      if (requestErrors.length > 0) {
        console.log('\nNetwork Errors:');
        requestErrors.forEach(err => {
          console.log(`  - ${err.url}`);
          console.log(`    Error: ${err.error}`);
        });
      }
      
      // Check local/session storage
      const sessionStorage = await page.evaluate(() => {
        const storage: any = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            storage[key] = window.sessionStorage.getItem(key);
          }
        }
        return storage;
      });
      
      console.log('\nSession Storage:');
      console.log(JSON.stringify(sessionStorage, null, 2));
      
    } else {
      console.log('✗ Login button not found on page\n');
      
      // Check what's actually on the page
      const bodyText = await page.locator('body').textContent();
      console.log('Page content preview:', bodyText?.substring(0, 500));
    }
    
    console.log('\n=== Investigation Complete ===');
  });
});
