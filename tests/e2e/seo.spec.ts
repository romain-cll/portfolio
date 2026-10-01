import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test, type Page } from '@playwright/test'

import { assertBuilt, DIST, ORIGIN, prerenderedRoutes, serveBuild } from './support.ts'

// Le HTML du build est lu tel que servi : JavaScript désactivé, donc rien n'est ajouté par l'hydratation.
test.use({ javaScriptEnabled: false })

test.beforeEach(async ({ page }) => {
  assertBuilt()
  await serveBuild(page)
})

const HOME_TITLE = 'Romain Caillé · Fullstack developer'
const HOME_DESCRIPTION =
  'Fullstack developer, ready for the agentic era. Open to work, full-time or freelance, remote or relocation from Nantes, France.'

const stripTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path)

async function metaContent(page: Page, selector: string): Promise<string | null> {
  const meta = page.locator(selector)
  await expect(meta, `${selector} doit être présent une seule fois`).toHaveCount(1)
  return meta.getAttribute('content')
}

// ---------------------------------------------------------------------------
// CA1
// ---------------------------------------------------------------------------

test('CA1 — le HTML de / contient <html lang="en"> et le contenu de la page sans JavaScript', async ({ page }) => {
  expect(readFileSync(join(DIST, 'index.html'), 'utf8')).toMatch(/<html[^>]*\slang="en"/)

  await page.goto(`${ORIGIN}/`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('h1')).toHaveText('Romain CAILLE')
  await expect(page.locator('dl')).toContainText('Open to work · available now')
})

// ---------------------------------------------------------------------------
// CA2
// ---------------------------------------------------------------------------

test('CA2 — chaque route a un title, une description et une canonical absolue, propres à la route', async ({ page }) => {
  const routes = prerenderedRoutes()
  expect(routes).toContain('/')

  const titles = new Set<string>()
  const descriptions = new Set<string>()
  const canonicals = new Set<string>()

  for (const route of routes) {
    await page.goto(`${ORIGIN}${route}`)

    await expect(page.locator('head > title'), `${route} : un seul <title>`).toHaveCount(1)
    const title = await page.title()
    expect(title.trim(), `${route} : title non vide`).not.toBe('')

    const description = await metaContent(page, 'meta[name="description"]')
    expect(description?.trim(), `${route} : description non vide`).toBeTruthy()

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical, `${route} : une seule canonical`).toHaveCount(1)
    const href = (await canonical.getAttribute('href')) ?? ''
    expect(href, `${route} : canonical absolue`).toMatch(/^https:\/\/romain-caille\.fr\//)
    expect(stripTrailingSlash(new URL(href).pathname), `${route} : canonical propre à la route`).toBe(stripTrailingSlash(route))

    titles.add(title)
    descriptions.add(description!)
    canonicals.add(href)
  }

  expect(titles.size, 'un title par route').toBe(routes.length)
  expect(descriptions.size, 'une description par route').toBe(routes.length)
  expect(canonicals.size, 'une canonical par route').toBe(routes.length)
})

test('CA2 — / porte le title, la description et la canonical attendus', async ({ page }) => {
  await page.goto(`${ORIGIN}/`)
  expect(await page.title()).toBe(HOME_TITLE)
  expect(await metaContent(page, 'meta[name="description"]')).toBe(HOME_DESCRIPTION)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}/`)
})

// ---------------------------------------------------------------------------
// CA3
// ---------------------------------------------------------------------------

test('CA3 — chaque route a og:title, og:description, og:url et og:image, og:image étant une URL absolue', async ({ page }) => {
  for (const route of prerenderedRoutes()) {
    await page.goto(`${ORIGIN}${route}`)

    for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
      const content = await metaContent(page, `meta[property="${property}"]`)
      expect(content?.trim(), `${route} : ${property} non vide`).toBeTruthy()
    }
    expect(await metaContent(page, 'meta[property="og:url"]'), `${route} : og:url absolue`).toMatch(/^https:\/\/romain-caille\.fr\//)
    expect(await metaContent(page, 'meta[property="og:image"]'), `${route} : og:image absolue`).toMatch(/^https:\/\/romain-caille\.fr\//)
  }
})

test('CA3 — / : og:url vaut la canonical et og:image pointe vers og.png', async ({ page }) => {
  await page.goto(`${ORIGIN}/`)
  expect(await metaContent(page, 'meta[property="og:url"]')).toBe(`${ORIGIN}/`)
  expect(await metaContent(page, 'meta[property="og:image"]')).toBe(`${ORIGIN}/og.png`)
})

test('CA3 — og:image désigne un PNG de dist/client de 1200 × 630', async ({ page }) => {
  for (const route of prerenderedRoutes()) {
    await page.goto(`${ORIGIN}${route}`)
    const image = (await metaContent(page, 'meta[property="og:image"]')) ?? ''
    const file = join(DIST, decodeURIComponent(new URL(image).pathname))

    let png: Buffer
    try {
      png = readFileSync(file)
    } catch {
      throw new Error(`${route} : ${image} ne correspond à aucun fichier de dist/client (${file})`)
    }
    expect(png.subarray(0, 8).toString('hex'), `${route} : signature PNG`).toBe('89504e470d0a1a0a')
    expect(png.subarray(12, 16).toString('ascii'), `${route} : chunk IHDR`).toBe('IHDR')
    expect([png.readUInt32BE(16), png.readUInt32BE(20)], `${route} : dimensions de l'image`).toEqual([1200, 630])
  }
})

// ---------------------------------------------------------------------------
// CA4
// ---------------------------------------------------------------------------

test('CA4 — sitemap.xml liste chaque page prérendue en URL absolue, sans /cv.pdf', () => {
  assertBuilt()
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]!)

  expect(locs.length, 'sitemap.xml ne contient aucune <loc>').toBeGreaterThan(0)
  for (const loc of locs) expect(loc, 'URL absolue sur romain-caille.fr').toMatch(/^https:\/\/romain-caille\.fr(\/|$)/)
  expect(locs.filter((loc) => loc.includes('cv.pdf'))).toEqual([])

  const listed = new Set(locs.map((loc) => stripTrailingSlash(new URL(loc).pathname)))
  for (const route of prerenderedRoutes()) {
    expect(listed.has(stripTrailingSlash(route)), `${route} absente de sitemap.xml`).toBe(true)
  }
})

test('CA4 — sitemap.xml déclare l’espace de noms http://www.sitemaps.org/schemas/sitemap/0.9 sur l’élément racine urlset', () => {
  assertBuilt()
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
  const root = xml.match(/<urlset\b[^>]*>/)?.[0]

  expect(root, 'sitemap.xml ne contient aucun élément racine <urlset>').toBeDefined()
  const xmlns = root!.match(/\sxmlns\s*=\s*(?:"([^"]*)"|'([^']*)')/)
  expect(xmlns?.[1] ?? xmlns?.[2], 'xmlns par défaut de <urlset>').toBe('http://www.sitemaps.org/schemas/sitemap/0.9')
})

// ---------------------------------------------------------------------------
// CA5
// ---------------------------------------------------------------------------

test('CA5 — robots.txt autorise l’indexation et référence le sitemap', () => {
  assertBuilt()
  const lines = readFileSync(join(DIST, 'robots.txt'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())

  expect(lines).toContain('User-agent: *')
  expect(lines).toContain('Allow: /')
  expect(lines, 'robots.txt ne doit pas interdire le site').not.toContain('Disallow: /')
  expect(lines).toContain('Sitemap: https://romain-caille.fr/sitemap.xml')
})

// ---------------------------------------------------------------------------
// CA6
// ---------------------------------------------------------------------------

test('CA6 — le JSON-LD de / décrit un Person avec name, url, jobTitle et sameAs', async ({ page }) => {
  await page.goto(`${ORIGIN}/`)

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(blocks.length, 'aucun script JSON-LD dans la page').toBeGreaterThan(0)

  const nodes = blocks.flatMap((text) => {
    const data = JSON.parse(text) as Record<string, unknown> | Record<string, unknown>[]
    const items = Array.isArray(data) ? data : [data]
    return items.flatMap((item) => (Array.isArray(item['@graph']) ? (item['@graph'] as Record<string, unknown>[]) : [item]))
  })
  const person = nodes.find((node) => node['@type'] === 'Person')
  expect(person, 'aucun objet Person dans le JSON-LD').toBeDefined()

  const context = blocks.map((text) => JSON.parse(text)).flat().map((d: Record<string, unknown>) => d['@context'])
  expect(context.some((c) => typeof c === 'string' && /^https?:\/\/schema\.org\/?$/.test(c)), '@context schema.org').toBe(true)

  expect(person).toMatchObject({
    name: 'Romain Caillé',
    url: 'https://romain-caille.fr',
    jobTitle: 'Fullstack developer',
    sameAs: ['https://gitlab.com/romain.caille', 'https://www.linkedin.com/in/romain-caill%C3%A9/'],
  })
})
