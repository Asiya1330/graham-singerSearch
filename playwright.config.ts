import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://localhost:5000'
  },

  projects: [
    {
      name: 'api-tests',
      use: {}
    }
  ]
});