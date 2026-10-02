import { expect, test, type Page } from '@playwright/test'

import { DESIGN_COLORS, DESIGN_PROJECTS, STAGE_NAMES, type SectionName } from '../design.ts'
import {
  assertBuilt,
  colorDistance,
  colorOf,
  COLOR_TOLERANCE,
  cssRgb,
  nextFrames,
  openHome,
  opacityOf,
  pipelineSnapshot,
  progressY,
  readout,
  rectOf,
  scrollAndRecordAnimations,
  scrollToProgress,
  scrollToY,
  sectionGeometry,
  sectionLocator,
  stable,
  startScrollSampler,
  stopScrollSampler,
  type PipelineSnapshot,
} from './support.ts'

// CA3 à CA11 — bandeau, rail, phases, paquet, libellés qui roulent, liens de navigation.
// Les seuils (progressions, couleurs) sont recopiés du design ; voir tests/design.ts.

const PROJECTS = DESIGN_PROJECTS.map((p) => ({ ...p, section: p.slug as SectionName }))
const FAINT = 'oklch(0.5927 0.0199 253.4)' // texte discret : token éclairci du socle (CA9 du socle)

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

const nav = (page: Page) => page.getByRole('navigation', { name: 'sections' })
const link = (page: Page, name: string) => nav(page).getByRole('link', { name, exact: true })

async function snapshot(page: Page): Promise<PipelineSnapshot> {
  const value = await pipelineSnapshot(page)
  expect(value, 'bandeau ou rail du pipeline introuvable : trois cadres INGEST, BUILD, DEPLOY dans un conteneur fixe').not.toBeNull()
  return value!
}

const centerY = (r: { top: number; bottom: number }) => (r.top + r.bottom) / 2
const centerX = (r: { left: number; right: number }) => (r.left + r.right) / 2

const tone = (page: Page, section: SectionName) =>
  cssRgb(page, section === 'overview' ? DESIGN_COLORS.secondary : PROJECTS.find((p) => p.section === section)!.accent)

// ---------------------------------------------------------------------------
// CA3 — bandeau, à partir de 900 px
// ---------------------------------------------------------------------------

test.describe('CA3 — bandeau fixé en haut (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  const stops: [SectionName, number][] = [
    ['hero', 0],
    ['hero', 0.6],
    ['overview', 0.5],
    ['spotime', 0.3],
    ['fraud-engine', 0.8],
    ['event-hub', 0.5],
    ['contact', 1],
  ]

  test('CA3 — le bandeau reste fixé en haut, sur toute la largeur, quelle que soit la position de défilement', async ({ page }) => {
    await openHome(page)
    for (const [section, p] of stops) {
      await scrollToProgress(page, section, p)
      const { container } = await snapshot(page)
      const where = `${section} à ${p}`
      expect(container.position, where).toBe('fixed')
      expect(container.top, where).toBeCloseTo(0, 0)
      expect(container.left, where).toBeCloseTo(0, 0)
      expect(container.width, where).toBeCloseTo(1440, 0)
      expect(container.height, where).toBeGreaterThan(100)
      expect(container.height, where).toBeLessThan(125)
    }
  })

  test('CA3 — à gauche : romain@portfolio, « pipeline · <phase> » et l’étape en cours', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.1)
    const { frames } = await snapshot(page)

    const name = page.getByText('romain@portfolio', { exact: true })
    await expect(name).toBeVisible()
    await expect(page.getByText(/^pipeline\s*·/).first()).toBeVisible()
    expect((await rectOf(name)).right, 'les textes sont à gauche des étapes').toBeLessThan(frames[0]!.rect.left)

    await expect.poll(async () => (await readout(page))?.phase).toBe('fraud.engine')
    await expect.poll(async () => (await readout(page))?.stage).toBe('ingest')
  })

  test('CA3 — au centre : les étapes INGEST, BUILD et DEPLOY, côte à côte et reliées par une ligne', async ({ page }) => {
    await openHome(page)
    const { frames, lines } = await snapshot(page)
    expect(frames.map((f) => f.name)).toEqual([...STAGE_NAMES])
    expect(frames.map((f) => f.label)).toEqual(['INGEST', 'BUILD', 'DEPLOY'])

    for (let i = 1; i < 3; i++) {
      expect(frames[i]!.rect.left, `étape ${i} à droite de l’étape ${i - 1}`).toBeGreaterThan(frames[i - 1]!.rect.right)
      expect(Math.abs(centerY(frames[i]!.rect) - centerY(frames[0]!.rect)), 'même rangée').toBeLessThanOrEqual(2)
    }
    for (let i = 0; i < 2; i++) {
      const a = frames[i]!.rect
      const b = frames[i + 1]!.rect
      const connector = lines.find(
        (line) => line.left <= a.right + 3 && line.right >= b.left - 3 && Math.abs(centerY(line) - centerY(a)) <= 3,
      )
      expect(connector, `ligne entre l’étape ${i} et l’étape ${i + 1}`).toBeDefined()
    }
  })

  test('CA3 — à droite : les liens spotime, fraud-engine, event-hub et contact, après les étapes', async ({ page }) => {
    await openHome(page)
    const { frames, container } = await snapshot(page)
    const lastRight = frames[2]!.rect.right
    for (const name of ['spotime', 'fraud-engine', 'event-hub', 'contact']) {
      const target = link(page, name)
      await expect(target).toBeVisible()
      const rect = await rectOf(target)
      expect(rect.left, `${name} à droite des étapes`).toBeGreaterThan(lastRight)
      expect(rect.bottom, `${name} dans le bandeau`).toBeLessThanOrEqual(container.bottom)
    }
    await expect(nav(page).getByRole('link')).toHaveCount(4)
  })
})

// ---------------------------------------------------------------------------
// CA4 — rail vertical, sous 900 px
// ---------------------------------------------------------------------------

test.describe('CA4 — rail vertical', () => {
  test.describe('800 × 900 : le rail affiche aussi les libellés', () => {
    test.use({ viewport: { width: 800, height: 900 } })

    test('CA4 — rail fixé à gauche sur toute la hauteur, étapes empilées', async ({ page }) => {
      await openHome(page)
      const { container, frames } = await snapshot(page)
      expect(container.position).toBe('fixed')
      expect(container.left).toBeCloseTo(0, 0)
      expect(container.top).toBeCloseTo(0, 0)
      expect(container.height).toBeCloseTo(900, 0)
      expect(container.width).toBeGreaterThan(150)
      expect(container.width).toBeLessThan(250)
      for (let i = 1; i < 3; i++) {
        expect(Math.abs(centerX(frames[i]!.rect) - centerX(frames[0]!.rect)), 'même x').toBeLessThanOrEqual(1)
        expect(frames[i]!.rect.top, 'y croissants').toBeGreaterThan(frames[i - 1]!.rect.bottom)
      }
      for (const frame of frames) expect(frame.rect.height, `${frame.name} en écriture verticale`).toBeGreaterThan(frame.rect.width)
    })

    test('CA4 — à partir de 700 px, le rail affiche romain@portfolio, la phase, l’étape et les liens', async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, 'event-hub', 0.1)
      const { container } = await snapshot(page)
      await expect(page.getByText('romain@portfolio', { exact: true })).toBeVisible()
      await expect.poll(async () => (await readout(page))?.phase).toBe('event.hub')
      await expect.poll(async () => (await readout(page))?.stage).toBe('ingest')
      for (const name of ['spotime', 'fraud-engine', 'event-hub', 'contact']) {
        await expect(link(page, name)).toBeVisible()
        const rect = await rectOf(link(page, name))
        expect(rect.left).toBeGreaterThanOrEqual(container.left)
        expect(rect.right).toBeLessThanOrEqual(container.right + 0.5)
      }
    })
  })

  test.describe('600 × 900 : le rail ne garde que les étapes', () => {
    test.use({ viewport: { width: 600, height: 900 } })

    test('CA4 — rail étroit fixé à gauche, étapes empilées', async ({ page }) => {
      await openHome(page)
      const { container, frames } = await snapshot(page)
      expect(container.position).toBe('fixed')
      expect(container.left).toBeCloseTo(0, 0)
      expect(container.height).toBeCloseTo(900, 0)
      expect(container.width).toBeGreaterThan(40)
      expect(container.width).toBeLessThan(70)
      for (let i = 1; i < 3; i++) {
        expect(Math.abs(centerX(frames[i]!.rect) - centerX(frames[0]!.rect))).toBeLessThanOrEqual(1)
        expect(frames[i]!.rect.top).toBeGreaterThan(frames[i - 1]!.rect.bottom)
      }
    })

    test('CA4 — en dessous de 700 px, ni libellés, ni phase, ni liens', async ({ page }) => {
      await openHome(page)
      await snapshot(page)
      await expect(page.getByText('romain@portfolio', { exact: true })).toBeHidden()
      expect(await readout(page)).toBeNull()
      await expect(nav(page).getByRole('link')).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'fraud-engine', exact: true })).toHaveCount(0)
    })
  })

  test.describe('bascules à 700 px et à 900 px', () => {
    test.use({ viewport: { width: 1000, height: 900 } })

    test('CA4 — 900 px : bandeau ; 899 px : rail avec libellés ; 700 px : libellés ; 699 px : étapes seules', async ({ page }) => {
      await openHome(page)
      const widths: [number, 'bar' | 'rail', boolean][] = [
        [900, 'bar', true],
        [899, 'rail', true],
        [700, 'rail', true],
        [699, 'rail', false],
      ]
      for (const [width, kind, labels] of widths) {
        await page.setViewportSize({ width, height: 900 })
        await nextFrames(page, 4)
        const { container, frames } = await snapshot(page)
        const horizontal = Math.abs(centerY(frames[1]!.rect) - centerY(frames[0]!.rect)) <= 2
        expect(horizontal, `${width} px : ${kind}`).toBe(kind === 'bar')
        expect(container.width > 150 || kind === 'bar', `${width} px`).toBe(labels || kind === 'bar')
        await expect(page.getByText('romain@portfolio', { exact: true }), `${width} px`).toBeVisible({ visible: labels })
      }
    })
  })
})

// ---------------------------------------------------------------------------
// CA5 — phase et étape affichées
// ---------------------------------------------------------------------------

test.describe('CA5 — phase et étape (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  const phases: [SectionName, number, string][] = [
    ['hero', 0.1, 'idle'],
    ['overview', 0.5, 'overview'],
    ['spotime', 0.3, 'spotime'],
    ['fraud-engine', 0.3, 'fraud.engine'],
    ['event-hub', 0.3, 'event.hub'],
    ['contact', 0.5, 'done'],
  ]

  test('CA5 — la phase vaut idle, overview, spotime, fraud.engine, event.hub puis done selon la section active', async ({ page }) => {
    await openHome(page)
    for (const [section, p, phase] of phases) {
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await readout(page))?.phase, { message: section }).toBe(phase)
    }
  })

  test('CA5 — la phase suit aussi le retour vers le haut', async ({ page }) => {
    await openHome(page)
    for (const [section, p, phase] of [...phases].reverse()) {
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await readout(page))?.phase, { message: section }).toBe(phase)
    }
  })

  test('CA5 — hors projet, aucune étape n’est affichée', async ({ page }) => {
    await openHome(page)
    for (const [section, p] of [['hero', 0.3], ['overview', 0.5], ['contact', 0.5]] as [SectionName, number][]) {
      await scrollToProgress(page, section, p)
      await expect.poll(async () => (await readout(page))?.stage, { message: section }).toBe('')
    }
  })

  for (const project of PROJECTS) {
    test(`CA5 — ${project.name} : l’étape passe de ingest à build puis à deploy au fil de la section`, async ({ page }) => {
      await openHome(page)
      // Les cadres se remplissent aux poids du design : build entre 48 % et 68 % environ, deploy au-delà de 68 %.
      for (const [p, stage] of [[0.1, 'ingest'], [0.58, 'build'], [0.92, 'deploy']] as [number, string][]) {
        await scrollToProgress(page, project.section, p)
        await expect.poll(async () => (await readout(page))?.stage, { message: `${project.name} à ${p}` }).toBe(stage)
      }
      for (const [p, stage] of [[0.58, 'build'], [0.1, 'ingest']] as [number, string][]) {
        await scrollToProgress(page, project.section, p)
        await expect.poll(async () => (await readout(page))?.stage, { message: `${project.name} au retour à ${p}` }).toBe(stage)
      }
    })
  }
})

// ---------------------------------------------------------------------------
// CA6 — paquet et remplissages
// ---------------------------------------------------------------------------

const STEPS = Array.from({ length: 21 }, (_, i) => i / 20)

async function packetAt(page: Page, axis: 'cx' | 'cy', y: number) {
  await scrollToY(page, y)
  return stable(page, async () => {
    const value = await snapshot(page)
    return value.packet ? Math.round(value.packet[axis] * 10) / 10 : Number.NaN
  })
}

test.describe('CA6 — paquet (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const section of ['overview', 'fraud-engine'] as SectionName[]) {
    test(`CA6 — ${section} : le paquet parcourt la ligne de gauche à droite, puis recule en remontant`, async ({ page }) => {
      await openHome(page)
      const ys = await Promise.all(STEPS.map((p) => progressY(page, section, p)))
      const forward: number[] = []
      for (const y of ys) forward.push(await packetAt(page, 'cx', y))
      expect(forward.every(Number.isFinite), `positions : ${forward.join(', ')}`).toBe(true)

      for (let i = 1; i < forward.length; i++) {
        expect(forward[i]!, `le paquet avance de ${STEPS[i - 1]} à ${STEPS[i]}`).toBeGreaterThanOrEqual(forward[i - 1]! - 0.5)
      }
      const { frames } = await snapshot(page)
      expect(forward[0]!, 'au début, le paquet est à l’entrée, avant le premier cadre').toBeLessThan(frames[0]!.rect.left)
      expect(forward.at(-1)!, 'à la fin, le paquet a dépassé le dernier cadre').toBeGreaterThan(frames[2]!.rect.right)
      expect(forward.at(-1)! - forward[0]!, 'le paquet parcourt la ligne').toBeGreaterThan(400)

      const backward: number[] = []
      for (const y of [...ys].reverse()) backward.push(await packetAt(page, 'cx', y))
      backward.reverse()
      backward.forEach((x, i) => expect(Math.abs(x - forward[i]!), `retour à ${STEPS[i]}`).toBeLessThanOrEqual(2))
    })
  }

  test('CA6 — le paquet se cache pendant le passage dans un cadre et réapparaît à sa sortie', async ({ page }) => {
    await openHome(page)
    const seen = new Set<boolean>()
    for (const p of STEPS) {
      await scrollToProgress(page, 'spotime', p)
      const opacity = await stable(page, async () => Math.round(((await snapshot(page)).packet?.opacity ?? Number.NaN) * 100) / 100)
      seen.add(opacity < 0.05)
    }
    expect(seen, 'le paquet est tantôt visible, tantôt caché dans un cadre').toEqual(new Set([true, false]))
  })
})

test.describe('CA6 — paquet sur le rail (800 × 900)', () => {
  test.use({ viewport: { width: 800, height: 900 } })

  test('CA6 — le paquet descend le long du rail, puis remonte', async ({ page }) => {
    await openHome(page)
    const steps = Array.from({ length: 11 }, (_, i) => i / 10)
    const ys = await Promise.all(steps.map((p) => progressY(page, 'event-hub', p)))
    const forward: number[] = []
    for (const y of ys) forward.push(await packetAt(page, 'cy', y))
    for (let i = 1; i < forward.length; i++) expect(forward[i]!, `descente à ${steps[i]}`).toBeGreaterThanOrEqual(forward[i - 1]! - 0.5)
    const { frames } = await snapshot(page)
    expect(forward[0]!).toBeLessThan(frames[0]!.rect.top)
    expect(forward.at(-1)!).toBeGreaterThan(frames[2]!.rect.bottom)

    const backward: number[] = []
    for (const y of [...ys].reverse()) backward.push(await packetAt(page, 'cy', y))
    backward.reverse()
    backward.forEach((v, i) => expect(Math.abs(v - forward[i]!)).toBeLessThanOrEqual(2))
  })
})

test.describe('CA6 — cadres des étapes (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /** Cadres remplis : texte à la couleur de la section ; bordures de cette couleur visibles. */
  async function fills(page: Page, section: SectionName) {
    const [accent, faint] = await Promise.all([tone(page, section), cssRgb(page, FAINT)])
    return stable(page, async () => {
      const { frames } = await snapshot(page)
      return frames.map((frame) => ({
        filled: colorDistance(frame.color, accent) <= COLOR_TOLERANCE,
        faint: colorDistance(frame.color, faint) <= COLOR_TOLERANCE,
        edges: frame.edges.filter((edge) => colorDistance(edge, accent) <= COLOR_TOLERANCE).length,
      }))
    })
  }

  for (const section of ['overview', 'spotime', 'event-hub'] as SectionName[]) {
    test(`CA6 — ${section} : le cadre de chaque étape se remplit à son passage, dans l’ordre, et se vide au retour`, async ({ page }) => {
      await openHome(page)
      const ys = await Promise.all(STEPS.map((p) => progressY(page, section, p)))

      await scrollToY(page, ys[0]!)
      const start = await fills(page, section)
      expect(start.map((f) => f.filled), 'rien n’est rempli au début').toEqual([false, false, false])
      expect(start.map((f) => f.faint), 'texte discret avant remplissage').toEqual([true, true, true])
      expect(start.map((f) => f.edges)).toEqual([0, 0, 0])

      let previous = 0
      let partial = false
      const filledOrder: number[] = []
      for (const y of ys) {
        await scrollToY(page, y)
        const now = await fills(page, section)
        const count = now.filter((f) => f.filled).length
        expect(count, 'les cadres remplis ne se vident pas en avançant').toBeGreaterThanOrEqual(previous)
        // un cadre n’est rempli que si les précédents le sont.
        now.forEach((f, i) => {
          if (f.filled && i > 0) expect(now[i - 1]!.filled, `cadre ${i} rempli avant le cadre ${i - 1}`).toBe(true)
        })
        if (now.some((f) => !f.filled && f.edges > 0)) partial = true
        previous = count
        filledOrder.push(count)
      }
      expect(filledOrder.at(-1), 'tout est rempli à la fin').toBe(3)
      expect(partial, 'un cadre se remplit progressivement : des bordures de la couleur de la section apparaissent avant que le texte la prenne').toBe(true)

      const end = await fills(page, section)
      expect(end.every((f) => f.filled && f.edges > 0)).toBe(true)

      for (const y of [...ys].reverse()) await scrollToY(page, y)
      const back = await fills(page, section)
      expect(back.map((f) => f.filled), 'le remplissage recule en remontant').toEqual([false, false, false])
    })
  }

  test('CA6 — les cadres remplis prennent le texte secondaire dans l’overview et l’accent du projet pendant un projet', async ({ page }) => {
    await openHome(page)
    const expected: [SectionName, string][] = [
      ['overview', DESIGN_COLORS.secondary],
      ...PROJECTS.map((p) => [p.section, p.accent] as [SectionName, string]),
    ]
    for (const [section, color] of expected) {
      await scrollToProgress(page, section, 1)
      const rgb = await cssRgb(page, color)
      await expect
        .poll(async () => (await snapshot(page)).frames.map((f) => colorDistance(f.color, rgb) <= COLOR_TOLERANCE), { message: section })
        .toEqual([true, true, true])
      // le paquet prend la même couleur.
      const packet = (await snapshot(page)).packet
      expect(packet, `paquet de ${section}`).not.toBeNull()
      expect(colorDistance(packet!.color, rgb), `couleur du paquet (${section})`).toBeLessThanOrEqual(COLOR_TOLERANCE)
    }
  })
})

// ---------------------------------------------------------------------------
// CA7 — libellés qui roulent
// ---------------------------------------------------------------------------

test.describe('CA7 — libellés qui roulent (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA7 — en descendant, l’ancien libellé sort et le nouveau entre lettre par lettre (roll-out, roll-in)', async ({ page }) => {
    await openHome(page)
    const y = await progressY(page, 'overview', 0.5)
    const names = await scrollAndRecordAnimations(page, y)
    // « overview » entre (8 lettres), « idle » sort (4 lettres) : une animation par lettre.
    expect(names['roll-in'] ?? 0, JSON.stringify(names)).toBeGreaterThanOrEqual(8)
    expect(names['roll-out'] ?? 0, JSON.stringify(names)).toBeGreaterThanOrEqual(4)
    expect(names['roll-in-down'] ?? 0).toBe(0)
    expect(names['roll-out-down'] ?? 0).toBe(0)
  })

  test('CA7 — en remontant, les versions -down roulent vers le bas (roll-out-down, roll-in-down)', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'overview', 0.5)
    await expect.poll(async () => (await readout(page))?.phase).toBe('overview')
    await nextFrames(page, 60)
    const names = await scrollAndRecordAnimations(page, 0)
    expect(names['roll-in-down'] ?? 0, JSON.stringify(names)).toBeGreaterThanOrEqual(4)
    expect(names['roll-out-down'] ?? 0, JSON.stringify(names)).toBeGreaterThanOrEqual(8)
    expect(names['roll-in'] ?? 0).toBe(0)
    expect(names['roll-out'] ?? 0).toBe(0)
  })

  test('CA7 — le libellé d’étape roule aussi dans un projet : ingest vers build en descendant, build vers ingest en remontant', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'spotime', 0.1)
    await expect.poll(async () => (await readout(page))?.stage).toBe('ingest')
    await nextFrames(page, 60)

    const down = await scrollAndRecordAnimations(page, await progressY(page, 'spotime', 0.58))
    expect(down['roll-in'] ?? 0, JSON.stringify(down)).toBeGreaterThanOrEqual('build'.length)
    expect(down['roll-out'] ?? 0, JSON.stringify(down)).toBeGreaterThanOrEqual('ingest'.length)
    expect(down['roll-in-down'] ?? 0).toBe(0)
    await expect.poll(async () => (await readout(page))?.stage).toBe('build')
    await nextFrames(page, 60)

    const up = await scrollAndRecordAnimations(page, await progressY(page, 'spotime', 0.1))
    expect(up['roll-in-down'] ?? 0, JSON.stringify(up)).toBeGreaterThanOrEqual('ingest'.length)
    expect(up['roll-out-down'] ?? 0, JSON.stringify(up)).toBeGreaterThanOrEqual('build'.length)
    expect(up['roll-in'] ?? 0).toBe(0)
  })

  test('CA7 — rien n’est animé au premier rendu', async ({ page }) => {
    await openHome(page)
    expect(await readout(page), 'libellés de phase et d’étape du pipeline').toEqual({ phase: 'idle', stage: '' })
    await nextFrames(page, 60)
    const rolling = await page.evaluate(() =>
      document
        .getAnimations()
        .map((a) => (a as CSSAnimation).animationName)
        .filter((name) => /^roll-/.test(name ?? '')),
    )
    expect(rolling).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// CA8 — pulsation du paquet au repos
// ---------------------------------------------------------------------------

test.describe('CA8 — pulsation du paquet (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /** Animations `packet-pulse` en cours, avec la taille de l'élément animé. */
  const pulses = (page: Page) =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName === 'packet-pulse')
        .map((a) => {
          const box = (a.effect as KeyframeEffect).target!.getBoundingClientRect()
          return { width: Math.round(box.width), height: Math.round(box.height), playState: a.playState }
        }),
    )

  const cases: [string, SectionName, number, boolean][] = [
    ['au tout début du hero, le paquet est caché et ne pulse pas', 'hero', 0, false],
    ['après un premier défilement du hero, le paquet pulse', 'hero', 0.1, true],
    ['à la fin du hero, le paquet pulse encore', 'hero', 1, true],
    ['au tout début de l’overview, le paquet pulse', 'overview', 0.005, true],
    ['au milieu de l’overview, il ne pulse plus', 'overview', 0.5, false],
    ['au tout début de Spotime, le paquet pulse', 'spotime', 0.005, true],
    ['au milieu de Spotime, il ne pulse pas', 'spotime', 0.5, false],
    ['au tout début de Fraud Engine, le paquet pulse', 'fraud-engine', 0.005, true],
    ['au tout début d’Event Hub, le paquet pulse', 'event-hub', 0.005, true],
    ['dans le contact, il ne pulse pas', 'contact', 0.5, false],
  ]

  for (const [title, section, p, pulsing] of cases) {
    test(`CA8 — ${title}`, async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, section, p)
      if (pulsing) {
        await expect.poll(async () => (await pulses(page)).length, { message: `${section} à ${p}` }).toBe(1)
        const [pulse] = await pulses(page)
        expect(pulse).toMatchObject({ width: 12, height: 12, playState: 'running' })
      } else {
        await nextFrames(page, 10)
        expect(await pulses(page), `${section} à ${p}`).toEqual([])
      }
    })
  }
})

// ---------------------------------------------------------------------------
// CA9 — liens de navigation
// ---------------------------------------------------------------------------

const NAV: { name: string; href: string; section: SectionName }[] = [
  { name: 'spotime', href: '#spotime', section: 'spotime' },
  { name: 'fraud-engine', href: '#fraud-engine', section: 'fraud-engine' },
  { name: 'event-hub', href: '#event-hub', section: 'event-hub' },
  { name: 'contact', href: '#contact', section: 'contact' },
]

async function underline(page: Page, name: string) {
  const target = link(page, name)
  const [width, color] = await Promise.all([target.evaluate((el) => Number.parseFloat(getComputedStyle(el).borderBottomWidth)), colorOf(target, 'borderBottomColor')])
  return { visible: width > 0 && color[3] > 0.5, color: color.slice(0, 3) as [number, number, number] }
}

test.describe('CA9 — liens de navigation', () => {
  test.describe('1440 × 900', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('CA9 — ce sont des liens <a> vers #spotime, #fraud-engine, #event-hub et #contact', async ({ page }) => {
      await openHome(page)
      await expect(nav(page).locator('a')).toHaveCount(4)
      await expect(nav(page).getByRole('link')).toHaveCount(4)
      for (const { name, href } of NAV) {
        await expect(link(page, name)).toHaveAttribute('href', href)
        expect(await link(page, name).evaluate((el) => el.tagName)).toBe('A')
      }
    })

    test('CA9 — aucun lien n’est actif tant que le hero ou l’overview est la section active, et tous sont en texte atténué', async ({ page }) => {
      await openHome(page)
      const muted = await cssRgb(page, DESIGN_COLORS.muted)
      for (const [section, p] of [['hero', 0.1], ['overview', 0.5]] as [SectionName, number][]) {
        await scrollToProgress(page, section, p)
        for (const { name } of NAV) {
          await expect.poll(async () => colorDistance(await colorOf(link(page, name)), muted), { message: `${name} dans ${section}` }).toBeLessThanOrEqual(COLOR_TOLERANCE)
          await expect(link(page, name)).not.toHaveAttribute('aria-current', /.+/)
          expect((await underline(page, name)).visible, `${name} dans ${section}`).toBe(false)
        }
      }
    })

    for (const { name, section } of NAV) {
      test(`CA9 — ${section} actif : son lien prend l’accent (texte principal pour contact) et est souligné, les autres restent atténués`, async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, section, section === 'contact' ? 0.5 : 0.3)
        const accent = await cssRgb(page, section === 'contact' ? DESIGN_COLORS.text : PROJECTS.find((p) => p.section === section)!.accent)
        const muted = await cssRgb(page, DESIGN_COLORS.muted)

        await expect.poll(async () => colorDistance(await colorOf(link(page, name)), accent), { message: `couleur de ${name}` }).toBeLessThanOrEqual(COLOR_TOLERANCE)
        await expect(link(page, name)).toHaveAttribute('aria-current', 'true')
        const own = await underline(page, name)
        expect(own.visible, `${name} souligné à partir de 900 px`).toBe(true)
        expect(colorDistance(own.color, accent), `soulignement de ${name}`).toBeLessThanOrEqual(COLOR_TOLERANCE)

        for (const other of NAV.filter((n) => n.name !== name)) {
          await expect.poll(async () => colorDistance(await colorOf(link(page, other.name)), muted), { message: `${other.name} atténué` }).toBeLessThanOrEqual(COLOR_TOLERANCE)
          await expect(link(page, other.name)).not.toHaveAttribute('aria-current', /.+/)
          expect((await underline(page, other.name)).visible, `${other.name} sans soulignement`).toBe(false)
        }
      })
    }
  })

  test.describe('800 × 900 (rail)', () => {
    test.use({ viewport: { width: 800, height: 900 } })

    test('CA9 — dans le rail, le lien actif prend l’accent mais n’est pas souligné', async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, 'fraud-engine', 0.3)
      const accent = await cssRgb(page, PROJECTS[1]!.accent)
      await expect.poll(async () => colorDistance(await colorOf(link(page, 'fraud-engine')), accent)).toBeLessThanOrEqual(COLOR_TOLERANCE)
      await expect(link(page, 'fraud-engine')).toHaveAttribute('aria-current', 'true')
      for (const { name } of NAV) expect((await underline(page, name)).visible, `${name} sans soulignement dans le rail`).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// CA10 — clic sur un lien
// ---------------------------------------------------------------------------

/** Le titre de la section est dans la fenêtre, sous le bandeau et au-dessus du terminal, à opacité 1. */
async function expectTitleOnScreen(page: Page, section: SectionName, message: string) {
  const title = sectionLocator(page, section).locator('h2')
  await expect
    .poll(
      async () => {
        const [rect, opacity, vh] = await Promise.all([rectOf(title), opacityOf(title), page.evaluate(() => window.innerHeight)])
        return rect.top >= 111 && rect.bottom <= vh - 35 && rect.height > 0 && opacity >= 0.99
      },
      { message: `${message} : le titre de ${section} doit être visible, sous le bandeau, à opacité 1` },
    )
    .toBe(true)
}

test.describe('CA10 — clic sur un lien de navigation (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA10 — la page défile en douceur, l’URL prend l’ancre, le titre est visible et le lien devient actif', async ({ page }) => {
    await openHome(page)
    await startScrollSampler(page)
    await link(page, 'fraud-engine').click()
    await expect(page).toHaveURL(/#fraud-engine$/)
    await expectTitleOnScreen(page, 'fraud-engine', 'après le clic')
    await expect(link(page, 'fraud-engine')).toHaveAttribute('aria-current', 'true')
    await nextFrames(page, 30)
    const samples = await stopScrollSampler(page)
    const final = samples.at(-1)!
    expect(final, 'la page a défilé').toBeGreaterThan(1000)
    expect(
      samples.some((y) => y > 50 && y < final - 50),
      `défilement doux : aucun scrollY intermédiaire entre 0 et ${final}`,
    ).toBe(true)
    // la cible est l'ancre du design : 50 % de la hauteur de la fenêtre après le haut de la section.
    const g = await sectionGeometry(page, 'fraud-engine')
    expect(Math.abs(final - (g.top + 450)), 'arrivée sur l’ancre à 50 vh de la section').toBeLessThanOrEqual(3)
  })

  for (const { name, section } of NAV) {
    test(`CA10 — le lien ${name} mène à sa section : hash, titre à l’écran, lien actif`, async ({ page }) => {
      await openHome(page)
      await link(page, name).click()
      await expect(page).toHaveURL(new RegExp(`#${name}$`))
      await expectTitleOnScreen(page, section, `lien ${name}`)
      await expect(link(page, name)).toHaveAttribute('aria-current', 'true')
      for (const other of NAV.filter((n) => n.name !== name)) {
        await expect(link(page, other.name)).not.toHaveAttribute('aria-current', /.+/)
      }
    })
  }

  test('CA10 — enchaîner deux liens fonctionne, y compris en revenant en arrière', async ({ page }) => {
    await openHome(page)
    await link(page, 'event-hub').click()
    await expectTitleOnScreen(page, 'event-hub', 'premier clic')
    await link(page, 'spotime').click()
    await expectTitleOnScreen(page, 'spotime', 'second clic')
    await expect(link(page, 'spotime')).toHaveAttribute('aria-current', 'true')
    await expect(page).toHaveURL(/#spotime$/)
  })
})

// ---------------------------------------------------------------------------
// CA11 — ancre ouverte directement
// ---------------------------------------------------------------------------

test.describe('CA11 — ouverture directe sur une ancre (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const { name, section } of NAV) {
    test(`CA11 — /#${name} : la section est à l’écran, son titre est visible et son lien est actif`, async ({ page }) => {
      await openHome(page, `/#${name}`)
      await expectTitleOnScreen(page, section, `ouverture sur #${name}`)
      await expect(link(page, name)).toHaveAttribute('aria-current', 'true')
      const box = await rectOf(sectionLocator(page, section))
      expect(box.top < 900 && box.bottom > 0, 'la section intersecte la fenêtre').toBe(true)
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
    })
  }
})
