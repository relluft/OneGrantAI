import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 300 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://onegrantai.vercel.app',
    trace: 'on-first-retry',
    viewport: null,
    headless: false,
    launchOptions: {
      slowMo: 100,
      args: [
        '--start-maximized',
        '--disable-translate',
        '--disable-features=TranslateUI',
        '--lang=en-US',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chromium',
      },
    },
  ],
});
