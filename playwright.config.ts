import { defineConfig, devices } from '@playwright/test'

// Les specs lisent le build (dist/client) : lancer `pnpm build` avant `pnpm test:e2e`.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
