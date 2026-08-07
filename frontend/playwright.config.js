import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.VITE_URL || 'http://localhost:3000',
    channel: 'chrome',
    trace: 'on-first-retry',
  },
});
