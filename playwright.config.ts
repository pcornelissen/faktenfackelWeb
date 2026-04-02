import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.SMOKE_TEST_URL || 'https://faktenfackel.de',
    extraHTTPHeaders: {
      'Accept-Language': 'de-DE,de;q=0.9',
    },
  },
  projects: [
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.ts/,
      use: {
        headless: true,
      },
    },
  ],
})
