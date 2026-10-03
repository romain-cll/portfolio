import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test, type Locator, type Page } from '@playwright/test'

import { readIco } from '../icons.ts'
import {
  assertBuilt,
  COLOR_TOLERANCE,
  cssRgb,
  DIST,
  hexToRgb,
  openHome,
  rgbDistance,
  scrollToProgress,
  sectionLocator,
  type Rgb,
} from './support.ts'

// Ces tests visent le serveur de production lancé par Playwright (`baseURL`, voir playwright.config.ts) :
// - CA1 à CA3 et CA7 : les liens `resume.pdf` et le téléchargement du CV ;
// - CA13, CA15 et CA16 : le <head>, le dessin des icônes et leur disponibilité.
// Stabilité sur le runner lent de la CI : pas d'attente fixe, `img.decode()` avant tout canvas, couleurs avec tolérance.
test.use({ actionTimeout: 5_000, viewport: { width: 1440, height: 900 } })

test.beforeEach(() => {
  assertBuilt()
})

const RESUME_HREF = '/resume-romain-caille.pdf'
const RESUME_FILE = join(DIST, 'resume-romain-caille.pdf')

/** `dd` de la ligne `resume` du hero. */
const heroResume = (page: Page): Locator =>
  page
    .locator('dt')
    .filter({ hasText: /^\s*resume\s*$/i })
    .locator('xpath=following-sibling::dd[1]')
    .locator('a')

/** Lien `resume.pdf` du contact : visible une fois la section défilée jusqu'au bout. */
async function contactResume(page: Page): Promise<Locator> {
  await scrollToProgress(page, 'contact', 1)
  const link = sectionLocator(page, 'contact').getByRole('link', { name: 'resume.pdf', exact: true })
  await expect(link).toBeVisible()
  return link
}

// ---------------------------------------------------------------------------
// CA1 — les deux liens `resume.pdf`
// ---------------------------------------------------------------------------

async function expectResumeLink(link: Locator) {
  await expect(link).toHaveCount(1)
  await expect(link).toHaveText('resume.pdf')
  await expect(link).toHaveAttribute('href', RESUME_HREF)
  await expect(link).toHaveAttribute('download', '')
  const icon = link.locator('svg')
  await expect(icon).toHaveCount(1)
  // Les icônes Carbon sont dessinées sur une grille de 32 × 32.
  await expect(icon).toHaveAttribute('viewBox', '0 0 32 32')
  const order = await link.evaluate((a) => {
    const range = document.createRange()
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) if (walker.currentNode.textContent?.trim()) range.selectNodeContents(walker.currentNode)
    return { textRight: range.getBoundingClientRect().right, iconLeft: a.querySelector('svg')!.getBoundingClientRect().left }
  })
  expect(order.iconLeft, 'l’icône suit le texte').toBeGreaterThanOrEqual(order.textRight - 0.5)
}

test('CA1 — le lien resume.pdf du hero pointe vers /resume-romain-caille.pdf, avec download, texte puis icône flèche', async ({ page }) => {
  await openHome(page)
  await expectResumeLink(heroResume(page))
})

test('CA1 — le lien resume.pdf du contact pointe vers /resume-romain-caille.pdf, avec download, texte puis icône flèche', async ({ page }) => {
  await openHome(page)
  await expectResumeLink(await contactResume(page))
})

// ---------------------------------------------------------------------------
// CA2 — téléchargement
// ---------------------------------------------------------------------------

async function expectDownload(page: Page, link: Locator) {
  const url = page.url()
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15_000 }), link.click()])
  expect(download.suggestedFilename()).toBe('resume-romain-caille.pdf')
  expect(await download.failure(), 'échec du téléchargement').toBeNull()
  const path = await download.path()
  expect(readFileSync(path).equals(readFileSync(RESUME_FILE)), 'octets de dist/client/resume-romain-caille.pdf').toBe(true)
  expect(page.url(), 'la page ne change pas').toBe(url)
}

test('CA2 — un clic sur le lien resume.pdf du hero télécharge resume-romain-caille.pdf', async ({ page }) => {
  await openHome(page)
  await expectDownload(page, heroResume(page))
})

test('CA2 — un clic sur le lien resume.pdf du contact télécharge resume-romain-caille.pdf', async ({ page }) => {
  await openHome(page)
  await expectDownload(page, await contactResume(page))
})

// ---------------------------------------------------------------------------
// CA3 et CA7 — le CV français n'est pas lié, /cv.pdf n'est plus référencé
// ---------------------------------------------------------------------------

test('CA3 — aucun lien de la page ne pointe vers /cv-romain-caille.pdf : seuls les deux liens resume.pdf mènent à un PDF', async ({ page }) => {
  await openHome(page)
  const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''))
  expect(hrefs.filter((href) => href.includes('cv-romain-caille'))).toEqual([])
  expect(hrefs.filter((href) => href.endsWith('.pdf'))).toEqual([RESUME_HREF, RESUME_HREF])
  expect(readFileSync(join(DIST, 'index.html'), 'utf8')).not.toContain('cv-romain-caille')
})

test('CA7 — aucun lien de la page ne pointe vers /cv.pdf', async ({ page }) => {
  await openHome(page)
  await expect(page.locator('a[href="/cv.pdf"]')).toHaveCount(0)
  await expect(page.locator(`a[href="${RESUME_HREF}"]`)).toHaveCount(2)
  expect(readFileSync(join(DIST, 'index.html'), 'utf8')).not.toContain('/cv.pdf')
})

// ---------------------------------------------------------------------------
// CA13 — le <head> déclare les trois icônes
// ---------------------------------------------------------------------------

type Attributes = Record<string, string>

/** Balises <link> d'un HTML, avec leurs attributs. */
function linksOf(html: string): Attributes[] {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => {
    const attributes: Attributes = {}
    for (const [, name, quoted, single, bare] of tag!.matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>/]+)))?/g)) {
      if (name === 'link') continue
      attributes[name!.toLowerCase()] = quoted ?? single ?? bare ?? ''
    }
    return attributes
  })
}

function expectIconDeclarations(links: Attributes[], where: string) {
  const rels = (rel: string) => links.filter((l) => l.rel?.split(/\s+/).includes(rel))
  const svg = rels('icon').filter((l) => l.type === 'image/svg+xml' && l.href === '/favicon.svg')
  const ico = rels('icon').filter((l) => l.href === '/favicon.ico')
  const touch = rels('apple-touch-icon').filter((l) => l.href === '/apple-touch-icon.png')
  expect(svg, `${where} : icône SVG`).toHaveLength(1)
  expect(ico, `${where} : icône /favicon.ico`).toHaveLength(1)
  expect(ico[0]?.sizes, `${where} : taille déclarée de l’ICO`).toBe('32x32')
  expect(touch, `${where} : apple-touch-icon`).toHaveLength(1)
  expect(
    links.filter((l) => l.href === 'data:,'),
    `${where} : le lien data:, du socle disparaît`,
  ).toEqual([])
}

test('CA13 — le <head> de / servie déclare l’icône SVG, l’ICO de repli et l’apple-touch-icon, sans data:,', async ({ page }) => {
  await openHome(page)
  const links = await page
    .locator('head link')
    .evaluateAll((nodes) => nodes.map((node) => Object.fromEntries([...node.attributes].map((a) => [a.name.toLowerCase(), a.value]))))
  expectIconDeclarations(links as Attributes[], '/')
})

test('CA13 — dist/client/index.html déclare les mêmes icônes', () => {
  expectIconDeclarations(linksOf(readFileSync(join(DIST, 'index.html'), 'utf8')), 'dist/client/index.html')
})

// ---------------------------------------------------------------------------
// CA16 — chaque icône déclarée répond 200
// ---------------------------------------------------------------------------

test('CA16 — chaque href d’icône du <head> répond 200', async ({ page }) => {
  await openHome(page)
  const hrefs = await page
    .locator('head link[rel~="icon"], head link[rel="apple-touch-icon"]')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLLinkElement).href))
  expect(hrefs.length, `icônes déclarées : ${hrefs.join(', ')}`).toBeGreaterThanOrEqual(3)
  for (const href of hrefs) {
    const response = await page.request.get(href)
    expect(response.status(), href).toBe(200)
  }
})

// ---------------------------------------------------------------------------
// CA15 — le dessin du SVG est repris par le PNG et par l'ICO
// ---------------------------------------------------------------------------

const BACKGROUND = '#121417'
const LETTER = '#e6e8eb'
const DOT = 'oklch(0.72 0.07 210.53)'

interface Raster {
  /** Écart moyen par canal (0 à 255) entre le SVG dessiné à la taille de l'image et l'image, composés sur du magenta. */
  meanDifference: number
  /** Pixels opaques de la couleur du « R » : dans l'image, puis dans le SVG de référence. */
  letterPixels: { image: number; reference: number }
  /** Couleur et alpha des points d'échantillon, relevés dans l'image. */
  background: number[]
  dot: number[]
  corners: number[][]
  alphaMin: number
}

/**
 * Dessine `/favicon.svg` et l'image `source` à la même taille sur des canvas, puis les compare.
 * `backdrop` : fond sous le SVG de référence (celui de l'apple-touch-icon, opaque), sinon transparent.
 */
async function compareWithSvg(page: Page, source: string, dimension: number, backdrop: string | null): Promise<Raster> {
  return page.evaluate(
    async ({ url: imageUrl, px: size, under: underlay, letter, tolerance }) => {
      const load = async (url: string) => {
        const img = new Image()
        img.src = url
        await img.decode()
        return img
      }
      const draw = (img: HTMLImageElement, under: string | null) => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!
        if (under) {
          ctx.fillStyle = under
          ctx.fillRect(0, 0, size, size)
        }
        ctx.drawImage(img, 0, 0, size, size)
        return ctx.getImageData(0, 0, size, size).data
      }
      const [svg, image] = await Promise.all([load('/favicon.svg'), load(imageUrl)])
      const reference = draw(svg, underlay)
      const pixels = draw(image, null)

      const MAGENTA = [255, 0, 255]
      let total = 0
      let letterImage = 0
      let letterReference = 0
      const isLetter = (data: Uint8ClampedArray, i: number) =>
        data[i + 3]! >= 250 && letter.every((c, k) => Math.abs(data[i + k]! - c) <= tolerance)
      for (let i = 0; i < pixels.length; i += 4) {
        for (let k = 0; k < 3; k++) {
          const a = pixels[i + 3]! / 255
          const b = reference[i + 3]! / 255
          const over = (data: Uint8ClampedArray, alpha: number) => data[i + k]! * alpha + MAGENTA[k]! * (1 - alpha)
          total += Math.abs(over(pixels, a) - over(reference, b))
        }
        if (isLetter(pixels, i)) letterImage++
        if (isLetter(reference, i)) letterReference++
      }
      // Points d'échantillon, en unités de la grille 32 × 32 du SVG : fond (5, 7), pastille (25, 21,5).
      const at = (x: number, y: number) => {
        const i = (Math.floor((y / 32) * size) * size + Math.floor((x / 32) * size)) * 4
        return [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, pixels[i + 3]!]
      }
      const corner = (x: number, y: number) => {
        const i = (y * size + x) * 4
        return [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, pixels[i + 3]!]
      }
      let alphaMin = 255
      for (let i = 3; i < pixels.length; i += 4) alphaMin = Math.min(alphaMin, pixels[i]!)
      return {
        meanDifference: total / (size * size * 3),
        letterPixels: { image: letterImage, reference: letterReference },
        background: at(5, 7),
        dot: at(25, 21.5),
        corners: [corner(0, 0), corner(size - 1, 0), corner(0, size - 1), corner(size - 1, size - 1)],
        alphaMin,
      }
    },
    { url: source, px: dimension, under: backdrop, letter: hexToRgb(LETTER), tolerance: COLOR_TOLERANCE },
  )
}

/** Mêmes contrôles pour toute taille : même dessin que le SVG, mêmes couleurs. */
async function expectSameDrawing(page: Page, raster: Raster, label: string, maxDifference: number) {
  expect(raster.meanDifference, `${label} : écart moyen avec le SVG`).toBeLessThanOrEqual(maxDifference)
  expect(raster.letterPixels.reference, `${label} : le SVG dessine un « R » clair`).toBeGreaterThan(0)
  expect(raster.letterPixels.image, `${label} : pixels du « R » (aplat ${LETTER})`).toBeGreaterThanOrEqual(raster.letterPixels.reference * 0.5)
  const dot: Rgb = await cssRgb(page, DOT)
  expect(rgbDistance(raster.dot.slice(0, 3), dot), `${label} : centre de la pastille ${raster.dot.join(',')}`).toBeLessThanOrEqual(COLOR_TOLERANCE)
  expect(raster.dot[3], `${label} : pastille opaque`).toBe(255)
  expect(rgbDistance(raster.background.slice(0, 3), hexToRgb(BACKGROUND)), `${label} : fond ${raster.background.join(',')}`).toBeLessThanOrEqual(COLOR_TOLERANCE)
  expect(raster.background[3], `${label} : fond opaque`).toBe(255)
}

test('CA15 — l’apple-touch-icon reprend le dessin du SVG sur son fond sombre, opaque, coins pleins', async ({ page, request }) => {
  expect((await request.get('/apple-touch-icon.png')).status()).toBe(200)
  await openHome(page)
  const raster = await compareWithSvg(page, '/apple-touch-icon.png', 180, BACKGROUND)
  await expectSameDrawing(page, raster, 'apple-touch-icon 180 px', 10)
  expect(raster.alphaMin, 'tous les pixels sont opaques').toBe(255)
  for (const corner of raster.corners) {
    expect(rgbDistance(corner.slice(0, 3), hexToRgb(BACKGROUND)), `coin ${corner.join(',')} à ${BACKGROUND}`).toBeLessThanOrEqual(COLOR_TOLERANCE)
  }
})

for (const size of [16, 32]) {
  test(`CA15 — l’entrée ${size} × ${size} de favicon.ico reprend le dessin du SVG, coins transparents`, async ({ page, request }) => {
    expect((await request.get('/favicon.svg')).status(), '/favicon.svg').toBe(200)
    const response = await request.get('/favicon.ico')
    expect(response.status()).toBe(200)
    const ico = readIco(await response.body())
    const entry = ico?.entries.find((e) => e.width === size && e.height === size)
    expect(entry, `entrée ${size} × ${size} de l’ICO`).toBeDefined()
    expect(entry!.isPng, 'entrée PNG').toBe(true)

    await openHome(page)
    const raster = await compareWithSvg(page, `data:image/png;base64,${entry!.data.toString('base64')}`, size, null)
    await expectSameDrawing(page, raster, `favicon.ico ${size} px`, size === 16 ? 16 : 10)
    for (const corner of raster.corners) {
      expect(corner[3], `coin ${corner.join(',')} transparent (coins arrondis)`).toBeLessThanOrEqual(40)
    }
  })
}
