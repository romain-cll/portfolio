import { readdirSync, readFileSync, statSync } from 'node:fs'
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

// Le plus gros fichier de dist/client/assets ayant cette extension : le nom est haché, on le cherche à l'exécution.
function largestAsset(extension: string): { path: string; file: string } {
  const dir = join(DIST, 'assets')
  const [name] = readdirSync(dir)
    .filter((entry) => entry.endsWith(extension))
    .sort((a, b) => statSync(join(dir, b)).size - statSync(join(dir, a)).size)
  if (name === undefined) throw new Error(`aucun fichier ${extension} dans dist/client/assets`)
  return { path: `/assets/${name}`, file: join(dir, name) }
}

test('B4 — le bundle principal part en brotli en moins de 100 ms', async ({ request }) => {
  const bundle = largestAsset('.js')
  const expected = readFileSync(bundle.file)
  const durations: number[] = []

  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    const response = await request.get(bundle.path, { headers: { 'accept-encoding': 'br' } })
    const body = await response.body()
    durations.push(performance.now() - start)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-encoding']).toBe('br')
    expect(body.equals(expected)).toBe(true)
  }

  const median = [...durations].sort((a, b) => a - b)[2] as number
  expect(median, `temps des 5 requêtes (ms) : ${durations.map((d) => Math.round(d)).join(', ')}`).toBeLessThan(100)
})

test('B4 — png, webp et woff2 ne sont pas recompressés', async ({ request }) => {
  const paths = ['/og.png', '/portrait.webp', largestAsset('.woff2').path]

  for (const path of paths) {
    const response = await request.get(path, { headers: { 'accept-encoding': 'br' } })
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-encoding'], path).toBeUndefined()
  }
})
