import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 0,          // fix flakes at the source — retries hide problems
  workers: 1,          // serial: multiplayer tests open multiple contexts on the same port
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,      // lock DPR so screenshots are consistent across machines
    locale: 'en-US',
    timezoneId: 'America/New_York',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
        },
      },
    },
  ],

  // Starts vite automatically before tests run; reuses if already running.
  // Change WS_URL in index.html to ws://localhost:8080 before running tests locally.
  webServer: {
    command: 'npx vite --port 3000 --strictPort',
    port: 3000,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
