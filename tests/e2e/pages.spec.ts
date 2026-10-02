import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import {
  DESIGN_PROJECTS,
  KICKER_CONTACT,
  KICKER_OVERVIEW,
  SECTION_NAMES,
  TITLE_CONTACT,
  TITLE_OVERVIEW,
  designTexts,
} from '../design.ts'
import { assertBuilt, DIST, htmlToText, markScriptless, normalize, openHome, sectionLocator } from './support.ts'

// Les specs de la feature « pages » visent le serveur de production lancé par Playwright (baseURL), sans simulation.

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

// ---------------------------------------------------------------------------
// CA1 — structure
// ---------------------------------------------------------------------------

test.describe('CA1 — structure de /', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA1 — le hero, l’overview, Spotime, Fraud Engine, Event Hub puis le contact se suivent dans cet ordre', async ({ page }) => {
    await openHome(page)
    const names = await page.locator('[data-section]').evaluateAll((els) => els.map((el) => el.getAttribute('data-section')))
    expect(names).toEqual([...SECTION_NAMES])

    const tops = await page
      .locator('[data-section]')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top + window.scrollY))
    expect([...tops].sort((a, b) => a - b)).toEqual(tops)
    expect(new Set(tops).size).toBe(tops.length)
  })

  test('CA1 — les six sections sont dans un seul <main>, le hero du socle en premier', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('main [data-section]')).toHaveCount(6)
    await expect(sectionLocator(page, 'hero').locator('h1')).toHaveText('Romain CAILLE')
    await expect(sectionLocator(page, 'hero').getByText('// state: idle · 0 packet · 3 stages', { exact: true })).toBeVisible()
  })

  test('CA1 — la page garde un seul h1, dans le hero', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(sectionLocator(page, 'hero').locator('h1')).toHaveCount(1)
  })

  test('CA1 — chaque section hors hero a un titre h2', async ({ page }) => {
    await openHome(page)
    await expect(sectionLocator(page, 'hero').locator('h2')).toHaveCount(0)
    await expect(sectionLocator(page, 'overview').locator('h2')).toHaveText(TITLE_OVERVIEW)
    for (const project of DESIGN_PROJECTS) {
      const section = sectionLocator(page, project.slug as (typeof SECTION_NAMES)[number])
      await expect(section.locator('h2'), project.name).toHaveCount(1)
      await expect(section.locator('h2')).toHaveText(project.name)
    }
    await expect(sectionLocator(page, 'contact').locator('h2')).toHaveText(TITLE_CONTACT)
  })

  test('CA1 — les sections hors hero n’ajoutent aucune liste de définition (dl)', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('dl')).toHaveCount(1)
    await expect(sectionLocator(page, 'hero').locator('dl')).toHaveCount(1)
  })
})

// ---------------------------------------------------------------------------
// CA2 — HTML prérendu : tous les textes du design, sans JavaScript
// ---------------------------------------------------------------------------

/** Textes du design absents de `text`, sous la forme « section : texte ». */
function missingTexts(text: string) {
  return designTexts()
    .filter((entry) => !text.includes(normalize(entry.text)))
    .map((entry) => `${entry.section} : ${entry.text}`)
}

test.describe('CA2 — textes du design dans le HTML reçu', () => {
  test('CA2 — dist/client/index.html contient tous les textes du design', () => {
    const text = htmlToText(readFileSync(join(DIST, 'index.html'), 'utf8'))
    expect(missingTexts(text)).toEqual([])
  })

  test('CA2 — le HTML répondu par le serveur contient tous les textes du design', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    expect(missingTexts(htmlToText(await response.text()))).toEqual([])
  })

  test.describe('JavaScript désactivé', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })

    test.beforeEach(({ page }) => {
      markScriptless(page)
    })

    test('CA2 — la page rendue sans JavaScript porte tous les textes du design, trade-off et learned compris', async ({ page }) => {
      await page.goto('/')
      const text = normalize(await page.evaluate(() => document.body.textContent ?? ''))
      expect(missingTexts(text)).toEqual([])
    })

    test('CA2 — l’overview, un projet et le contact portent leurs textes dans la bonne section', async ({ page }) => {
      await page.goto('/')
      const bySection = async (name: (typeof SECTION_NAMES)[number]) =>
        normalize((await sectionLocator(page, name).textContent()) ?? '')
      for (const { section, text } of designTexts()) {
        expect(await bySection(section), `${section} : ${text}`).toContain(normalize(text))
      }
    })
  })

  test('CA2 — les libellés de l’overview et du contact sont ceux du design, à la lettre', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(KICKER_OVERVIEW, { exact: true })).toHaveCount(1)
    await expect(page.getByText(KICKER_CONTACT, { exact: true })).toHaveCount(1)
  })
})
