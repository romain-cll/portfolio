import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import { assertBuilt, DIST } from './support.ts'

// Ces tests visent le serveur de production lancé par Playwright (`pnpm start`, voir playwright.config.ts),
// sans simulation : ce sont les vraies réponses HTTP qui comptent.
test.beforeEach(() => {
  assertBuilt()
})

test('CA22 — une URL sans page ni fichier répond 404 avec la page « 404 »', async ({ page }) => {
  const response = await page.goto('/page-inconnue')
  expect(response?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('404')
})

test('CA22 — un fichier manquant (/cv.pdf) répond 404', async ({ request }) => {
  const response = await request.get('/cv.pdf')
  expect(response.status()).toBe(404)
})

test('CA1 — GET / répond 200 avec exactement le index.html prérendu', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  expect(await response.text()).toBe(readFileSync(join(DIST, 'index.html'), 'utf8'))
})

for (const path of ['/og.png', '/portrait.webp', '/sitemap.xml', '/robots.txt']) {
  test(`CA3 à CA5 — ${path} répond 200`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
  })
}
