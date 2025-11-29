import { defineConfig, devices } from '@playwright/test';

// Use local dev server if E2E_TARGET_URL is not set to production
const isLocal = !process.env.E2E_TARGET_URL || process.env.E2E_TARGET_URL.includes('localhost');
const baseURL = process.env.E2E_TARGET_URL ?? 'http://localhost:3002/telescope/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start local dev server when running locally (disabled - start server manually)
  // ...(isLocal && {
  //   webServer: {
  //     command: 'npm run dev',
  //     url: 'http://localhost:3002/telescope/',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //   },
  // }),
});
