import { defineConfig, devices } from '@playwright/test'

// Les specs lisent le build (dist/client, dist/server) : lancer `pnpm build` avant `pnpm test:e2e`.
// Playwright lance `pnpm start` (le serveur de production) sur le port 3100, jamais réutilisé d'un run à l'autre :
// `server.spec.ts` le vise via `baseURL`, les autres specs simulent le serveur sous https://romain-caille.fr.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command: 'pnpm start',
    env: { PORT: '3100' },
    url: 'http://127.0.0.1:3100/',
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
