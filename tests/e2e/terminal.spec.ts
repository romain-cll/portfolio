import { expect, test, type Page } from '@playwright/test'

import {
  DESIGN_COLORS,
  DESIGN_LOG,
  DESIGN_PROJECTS,
  LOG_PANEL_HEADER,
  SECTION_NAMES,
  designLogCount,
  designTimestamp,
  type SectionName,
} from '../design.ts'
import {
  assertBuilt,
  colorDistance,
  COLOR_TOLERANCE,
  cssRgb,
  logLinePattern,
  nextFrames,
  normalize,
  openHome,
  panelSnapshot,
  progressY,
  scrollToProgress,
  scrollToY,
  settleAnimations,
  terminalSnapshot,
  type TerminalSnapshot,
} from './support.ts'

// CA12 à CA14 — terminal events.log : barre fixe, lignes émises au défilement, historique.

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

async function terminal(page: Page): Promise<TerminalSnapshot> {
  const value = await terminalSnapshot(page)
  expect(value, 'barre « events.log · n » introuvable').not.toBeNull()
  return value!
}

const button = (page: Page, name: 'open event log' | 'close event log') => page.getByRole('button', { name, exact: true })

/** Position juste après (`after`) ou juste avant (`before`) le seuil de la ligne `index` du design. */
function thresholdPosition(index: number, side: 'after' | 'before'): [SectionName, number] {
  const line = DESIGN_LOG[index]!
  return [SECTION_NAMES[line.s]!, line.t + (side === 'after' ? 0.015 : -0.015)]
}

// ---------------------------------------------------------------------------
// CA12 — barre fixe
// ---------------------------------------------------------------------------

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 320, height: 568 },
]) {
  test.describe(`CA12 — barre du terminal (${viewport.width} × ${viewport.height})`, () => {
    test.use({ viewport })

    test('CA12 — la barre reste fixée en bas de l’écran, sur la surface profonde, à plusieurs positions de défilement', async ({ page }) => {
      await openHome(page)
      const deep = await cssRgb(page, DESIGN_COLORS.surfaceDeep)
      for (const [section, p] of [['hero', 0.5], ['overview', 0.5], ['fraud-engine', 0.3], ['contact', 1]] as [SectionName, number][]) {
        await scrollToProgress(page, section, p)
        const t = await terminal(page)
        const where = `${section} à ${p}`
        expect(t.fixed.position, where).toBe('fixed')
        expect(t.fixed.bottom, where).toBeCloseTo(viewport.height, 0)
        expect(t.bar.bottom, where).toBeCloseTo(viewport.height, 0)
        expect(t.bar.height, where).toBeGreaterThanOrEqual(30)
        expect(t.bar.height, where).toBeLessThanOrEqual(40)
        expect(t.bg, where).not.toBeNull()
        expect(colorDistance(t.bg!, deep), `${where} : fond de la surface profonde`).toBeLessThanOrEqual(COLOR_TOLERANCE)
        expect(t.bar.right, where).toBeCloseTo(viewport.width, 0)
      }
    })

    test('CA12 — elle affiche « events.log · n », la dernière ligne émise avec son horodatage et un curseur qui clignote', async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, 'hero', 0.5)
      // hero à 50 % : deux lignes émises, la dernière est « ingest ← romain.init ».
      await expect.poll(async () => (await terminal(page)).n).toBe(2)
      const t = await terminal(page)
      expect(t.text).toContain('events.log · 2')
      expect(t.text).toMatch(logLinePattern(designTimestamp(1), DESIGN_LOG[1]!.txt))
      expect(t.text, 'la barre n’affiche que la dernière ligne').not.toMatch(logLinePattern(designTimestamp(0), DESIGN_LOG[0]!.txt))
      expect(t.animations, 'le curseur clignote').toContain('blink')
    })

    test('CA12 — avant tout défilement, la barre affiche events.log · 0 et aucune ligne', async ({ page }) => {
      await openHome(page)
      await scrollToY(page, 0)
      const t = await terminal(page)
      expect(t.n).toBe(0)
      expect(t.text).toContain('events.log · 0')
      expect(t.text).not.toMatch(/\d\d:\d\d:\d\d/)
    })
  })
}

test.describe('CA12 — barre du terminal à côté du rail (320 × 568)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('CA12 — sous 900 px, la barre commence à droite du rail', async ({ page }) => {
    await openHome(page)
    const t = await terminal(page)
    expect(t.fixed.left).toBeGreaterThanOrEqual(55)
    expect(t.fixed.left).toBeLessThanOrEqual(70)
  })
})

// ---------------------------------------------------------------------------
// CA13 — lignes émises aux seuils du design
// ---------------------------------------------------------------------------

test.describe('CA13 — lignes émises (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA13 — chaque ligne est émise à son seuil, de « > emit romain.init » à « > emit lets.talk → … », puis disparaît en remontant', async ({ page }) => {
    await openHome(page)

    // En descendant : juste après chaque seuil, la ligne est la dernière émise.
    for (let index = 0; index < DESIGN_LOG.length; index++) {
      const [section, p] = thresholdPosition(index, 'after')
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await terminal(page)).n, { message: `après le seuil de « ${DESIGN_LOG[index]!.txt.trim()} »` }).toBe(index + 1)
      const t = await terminal(page)
      expect(t.text, `dernière ligne après le seuil ${index}`).toMatch(logLinePattern(designTimestamp(index), DESIGN_LOG[index]!.txt))
      expect(t.text).toContain(`events.log · ${index + 1}`)
    }

    // En remontant : juste avant chaque seuil, la ligne a disparu et la précédente est la dernière.
    for (let index = DESIGN_LOG.length - 1; index >= 0; index--) {
      const [section, p] = thresholdPosition(index, 'before')
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await terminal(page)).n, { message: `avant le seuil de « ${DESIGN_LOG[index]!.txt.trim()} » au retour` }).toBe(index)
      const t = await terminal(page)
      if (index > 0) expect(t.text).toMatch(logLinePattern(designTimestamp(index - 1), DESIGN_LOG[index - 1]!.txt))
      expect(t.text, `la ligne ${index} a disparu`).not.toMatch(logLinePattern(designTimestamp(index), DESIGN_LOG[index]!.txt))
    }
  })

  test('CA13 — la première ligne est émise au début du défilement du hero, la dernière à la fin du contact', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'hero', 0.1)
    await expect.poll(async () => (await terminal(page)).text).toMatch(logLinePattern('00:00:00', '> emit romain.init'))
    await scrollToProgress(page, 'contact', 1)
    await expect.poll(async () => (await terminal(page)).n).toBe(DESIGN_LOG.length)
    const t = await terminal(page)
    expect(t.text).toMatch(logLinePattern(designTimestamp(18), '> emit lets.talk → r.caille@icloud.com'))
  })

  test('CA13 — les lignes d’un projet sont dans son accent, les autres selon le design (texte principal pour « > », atténué sinon)', async ({ page }) => {
    await openHome(page)
    const colors: Record<string, string> = {
      spotime: DESIGN_PROJECTS[0]!.accent,
      'fraud-engine': DESIGN_PROJECTS[1]!.accent,
      'event-hub': DESIGN_PROJECTS[2]!.accent,
      event: DESIGN_COLORS.text,
      muted: DESIGN_COLORS.muted,
    }
    for (let index = 0; index < DESIGN_LOG.length; index++) {
      const line = DESIGN_LOG[index]!
      const [section, p] = thresholdPosition(index, 'after')
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await terminal(page)).n).toBe(index + 1)
      const expected = await cssRgb(page, colors[line.tone]!)
      const t = await terminal(page)
      const leaf = t.leaves.find((l) => l.text.includes(normalize(line.txt)))
      expect(leaf, `texte de la ligne « ${line.txt.trim()} » dans la barre`).toBeDefined()
      expect(colorDistance(leaf!.color, expected), `couleur de « ${line.txt.trim()} » (${line.tone})`).toBeLessThanOrEqual(COLOR_TOLERANCE)
    }
  })

  test('CA13 — le nombre de lignes suit le design sur un balayage de toute la page, à l’aller et au retour', async ({ page }) => {
    await openHome(page)
    const probes: [SectionName, number][] = []
    for (const section of SECTION_NAMES) for (const p of [0.01, 0.3, 0.5, 0.7, 0.99]) probes.push([section, p])
    const order = [...probes, ...[...probes].reverse()]
    for (const [section, p] of order) {
      const y = await progressY(page, section, p)
      await scrollToY(page, y)
      // `designLogCount` prend la section active : celle du design pour cette position.
      const active = SECTION_NAMES.indexOf(section)
      await expect.poll(async () => (await terminal(page)).n, { message: `${section} à ${p}` }).toBe(designLogCount(active, p))
    }
  })
})

// ---------------------------------------------------------------------------
// CA14 — historique
// ---------------------------------------------------------------------------

test.describe('CA14 — panneau d’historique (1440 × 600)', () => {
  test.use({ viewport: { width: 1440, height: 600 } })

  const timestamps = (text: string) => text.match(/\b00:0\d:\d\d\b/g) ?? []

  async function expectOpen(page: Page, open: boolean) {
    const expected = open ? 'close event log' : 'open event log'
    await expect(button(page, expected)).toBeVisible()
    await expect(button(page, expected)).toHaveAttribute('aria-expanded', open ? 'true' : 'false')
    await expect
      .poll(async () => ((await panelSnapshot(page))?.clientHeight ?? -1) > 100, { message: open ? 'panneau ouvert' : 'panneau fermé' })
      .toBe(open)
    // Le panneau s'ouvre et se ferme par une transition de hauteur : on mesure une fois l'état de repos atteint.
    await settleAnimations(page)
  }

  test('CA14 — fermé au départ : bouton « open event log », aria-expanded=false, panneau sans hauteur', async ({ page }) => {
    await openHome(page)
    await expectOpen(page, false)
    expect((await panelSnapshot(page))!.clientHeight).toBeLessThanOrEqual(1)
  })

  test('CA14 — un clic ouvre le panneau au-dessus de la barre, avec l’en-tête et tout l’historique, défilé jusqu’à la dernière ligne', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect.poll(async () => (await terminal(page)).n).toBe(DESIGN_LOG.length)

    await button(page, 'open event log').click()
    await expectOpen(page, true)

    const panel = (await panelSnapshot(page))!
    expect(panel.text).toContain(LOG_PANEL_HEADER)
    const bar = await terminal(page)
    expect(panel.rect.bottom, 'le panneau est au-dessus de la barre').toBeLessThanOrEqual(bar.bar.top + 1)
    expect(panel.rect.height).toBeGreaterThan(150)

    DESIGN_LOG.forEach((line, index) => {
      expect(panel.text, `ligne ${index} dans l’historique`).toMatch(logLinePattern(designTimestamp(index), line.txt))
    })
    expect(timestamps(panel.text)).toHaveLength(DESIGN_LOG.length)

    await expect
      .poll(async () => {
        const p = (await panelSnapshot(page))!
        return p.scrollHeight - p.scrollTop - p.clientHeight
      }, { message: 'l’historique est défilé jusqu’à la dernière ligne' })
      .toBeLessThanOrEqual(2)
    const scrolled = (await panelSnapshot(page))!
    expect(scrolled.scrollHeight, 'le panneau déborde : il faut défiler pour tout voir').toBeGreaterThan(scrolled.clientHeight)
    expect(scrolled.scrollTop).toBeGreaterThan(0)
  })

  test('CA14 — le panneau s’ouvre progressivement : sa hauteur grandit sur plusieurs images', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect.poll(async () => (await terminal(page)).n).toBe(DESIGN_LOG.length)
    await page.evaluate(() => {
      const store = window as unknown as { __panelHeights: number[]; __panelRaf: number }
      store.__panelHeights = []
      const tick = () => {
        store.__panelHeights.push(window.__probe.panel()?.clientHeight ?? 0)
        store.__panelRaf = requestAnimationFrame(tick)
      }
      tick()
    })
    await button(page, 'open event log').click()
    await expectOpen(page, true)
    await settleAnimations(page)
    await nextFrames(page, 2)
    const heights = await page.evaluate(() => {
      const store = window as unknown as { __panelHeights: number[]; __panelRaf: number }
      cancelAnimationFrame(store.__panelRaf)
      return store.__panelHeights
    })
    const final = heights.at(-1)!
    expect(final, 'panneau ouvert').toBeGreaterThan(150)
    const between = heights.filter((h) => h > 10 && h < final - 10)
    expect(between.length, `hauteurs relevées image par image : ${heights.map(Math.round).join(', ')}`).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < heights.length; i++) expect(heights[i]!, `la hauteur ne décroît pas (image ${i})`).toBeGreaterThanOrEqual(heights[i - 1]! - 0.5)
  })

  test('CA14 — l’historique ne contient que les lignes émises jusqu’ici', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'spotime', 0.6)
    const count = designLogCount(2, 0.6)
    await expect.poll(async () => (await terminal(page)).n).toBe(count)
    await button(page, 'open event log').click()
    await expectOpen(page, true)
    const panel = (await panelSnapshot(page))!
    expect(timestamps(panel.text)).toHaveLength(count)
    expect(panel.text).not.toMatch(logLinePattern(designTimestamp(count), DESIGN_LOG[count]!.txt))
  })

  test('CA14 — ouvert, le panneau reçoit les nouvelles lignes et reste calé en bas', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'hero', 0.5)
    await expect.poll(async () => (await terminal(page)).n).toBe(2)
    await button(page, 'open event log').click()
    await expectOpen(page, true)
    expect(timestamps((await panelSnapshot(page))!.text)).toHaveLength(2)

    await scrollToProgress(page, 'contact', 1)
    await expect.poll(async () => timestamps((await panelSnapshot(page))!.text).length).toBe(DESIGN_LOG.length)
    await expect
      .poll(async () => {
        const p = (await panelSnapshot(page))!
        return p.scrollHeight - p.scrollTop - p.clientHeight
      })
      .toBeLessThanOrEqual(2)
  })

  test('CA14 — le bouton s’active au clavier : Entrée ouvre, Espace ferme, puis Espace ouvre, Entrée ferme', async ({ page }) => {
    await openHome(page)
    await button(page, 'open event log').focus()
    await page.keyboard.press('Enter')
    await expectOpen(page, true)
    await page.keyboard.press('Space')
    await expectOpen(page, false)
    await page.keyboard.press('Space')
    await expectOpen(page, true)
    await page.keyboard.press('Enter')
    await expectOpen(page, false)
  })

  test('CA14 — Échap referme le panneau, bouton focalisé ou non', async ({ page }) => {
    await openHome(page)
    await button(page, 'open event log').click()
    await expectOpen(page, true)
    await page.keyboard.press('Escape')
    await expectOpen(page, false)

    await button(page, 'open event log').click()
    await expectOpen(page, true)
    await page.locator('h1').click()
    await page.keyboard.press('Escape')
    await expectOpen(page, false)
  })

  test('CA14 — un nouvel appui sur le bouton referme le panneau', async ({ page }) => {
    await openHome(page)
    await button(page, 'open event log').click()
    await expectOpen(page, true)
    await button(page, 'close event log').click()
    await expectOpen(page, false)
  })
})
