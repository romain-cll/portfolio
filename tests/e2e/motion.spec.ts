import { expect, test, type Locator, type Page } from '@playwright/test'

import {
  DESIGN_ANNOTATIONS,
  DESIGN_PROJECTS,
  EMAIL,
  GITLAB_NOTE,
  HERO_HINT,
  KICKER_CONTACT,
  KICKER_OVERVIEW,
  PHASE_NAMES,
  PORTRAIT_ALT,
  SECTION_NAMES,
  TITLE_OVERVIEW,
  VIDEO_CAPTION,
  designActive,
  designFrame,
  designLogCount,
  designProgress,
  type SectionName,
} from '../design.ts'
import {
  assertBuilt,
  eventStage,
  expectDisclosure,
  markScriptless,
  nextFrames,
  offsetOf,
  openHome,
  opacityOf,
  pipelineSnapshot,
  progressY,
  readout,
  rectOf,
  scrollAndRecordAnimations,
  scrollToProgress,
  scrollToY,
  sectionLocator,
  terminalSnapshot,
} from './support.ts'

// CA26 (mouvement réduit) et CA27 (JavaScript désactivé) : le contenu de chaque section est en état final.

const PROJECTS = DESIGN_PROJECTS.map((p) => ({ ...p, section: p.slug as SectionName }))

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

/** Échelle cumulée (`scale` et matrice `transform`) de l'élément et de ses ancêtres. */
const scaleOf = (locator: Locator) =>
  locator.evaluate((el) => {
    let scale = 1
    for (let n: Element | null = el; n; n = n.parentElement) {
      const style = getComputedStyle(n)
      if (style.scale && style.scale !== 'none') scale *= Number.parseFloat(style.scale) || 1
      if (style.transform && style.transform !== 'none') scale *= new DOMMatrix(style.transform).a
    }
    return scale
  })

/** Éléments dont le design révèle l'apparition : tous doivent être en état final dès qu'ils sont à l'écran. */
function revealedTargets(page: Page): { label: string; locator: Locator }[] {
  const targets: { label: string; locator: Locator }[] = []
  const overview = sectionLocator(page, 'overview')
  targets.push(
    { label: 'overview : kicker', locator: overview.getByText(KICKER_OVERVIEW, { exact: true }) },
    { label: 'overview : titre', locator: overview.getByText(TITLE_OVERVIEW, { exact: true }) },
    ...DESIGN_ANNOTATIONS.map((text, i) => ({ label: `overview : annotation ${i}`, locator: overview.getByText(text, { exact: true }) })),
  )
  for (const project of PROJECTS) {
    const section = sectionLocator(page, project.section)
    const card = section.getByText(project.url, { exact: true }).locator("xpath=ancestor::*[contains(., 'deploy ✓')][1]")
    targets.push(
      { label: `${project.name} : ligne event`, locator: section.getByText(`event ${project.ev} →`) },
      { label: `${project.name} : titre`, locator: section.locator('h2') },
      { label: `${project.name} : problem`, locator: section.getByText(project.problem) },
      { label: `${project.name} : decision`, locator: section.getByText(project.decision) },
      { label: `${project.name} : bouton des trade-offs`, locator: section.locator('summary') },
      ...project.stack.map((tag) => ({ label: `${project.name} : étiquette ${tag}`, locator: section.getByText(tag, { exact: true }) })),
      { label: `${project.name} : URL de la fenêtre`, locator: section.getByText(project.url, { exact: true }) },
      { label: `${project.name} : deploy ✓`, locator: card.getByText('deploy ✓', { exact: true }) },
      { label: `${project.name} : result`, locator: card.getByText(project.result) },
      { label: `${project.name} : lien`, locator: card.getByRole('link', { name: project.link.label, exact: true }) },
    )
  }
  const contact = sectionLocator(page, 'contact')
  targets.push(
    { label: 'contact : kicker', locator: contact.getByText(KICKER_CONTACT, { exact: true }) },
    { label: 'contact : titre', locator: contact.locator('h2') },
    { label: 'contact : bouton e-mail', locator: page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true }) },
    { label: 'contact : lien gitlab', locator: contact.getByRole('link', { name: 'gitlab', exact: true }) },
    { label: 'contact : lien linkedin', locator: contact.getByRole('link', { name: 'linkedin', exact: true }) },
    { label: 'contact : lien resume.pdf', locator: contact.getByRole('link', { name: 'resume.pdf', exact: true }) },
    { label: 'contact : mention GitLab', locator: contact.getByText(GITLAB_NOTE, { exact: true }) },
  )
  return targets
}

/** Écarts à l'état final parmi les éléments à l'écran : opacité < 1, décalage ou échelle résiduels. */
async function finalStateProblems(page: Page): Promise<string[]> {
  const problems: string[] = []
  const vh = await page.evaluate(() => window.innerHeight)
  for (const { label, locator } of revealedTargets(page)) {
    const count = await locator.count()
    if (count !== 1) {
      problems.push(`${label} : ${count} élément(s) trouvé(s) au lieu d’un`)
      continue
    }
    const box = await rectOf(locator)
    if (box.height === 0 || box.bottom <= 0 || box.top >= vh) continue
    const [opacity, offset, scale] = await Promise.all([opacityOf(locator), offsetOf(locator), scaleOf(locator)])
    if (opacity < 0.99) problems.push(`${label} : opacité ${opacity.toFixed(2)}`)
    if (Math.abs(offset.x) > 0.5 || Math.abs(offset.y) > 0.5) problems.push(`${label} : décalage (${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}) px`)
    if (Math.abs(scale - 1) > 0.005) problems.push(`${label} : échelle ${scale.toFixed(3)}`)
  }
  return problems
}

const SAMPLE_STOPS: [SectionName, number][] = [
  ['hero', 0.5],
  ['overview', 0],
  ['overview', 0.5],
  ['overview', 1],
  ['spotime', 0.05],
  ['spotime', 0.9],
  ['fraud-engine', 0.05],
  ['fraud-engine', 0.9],
  ['event-hub', 0.05],
  ['event-hub', 0.9],
  ['contact', 0],
  ['contact', 0.5],
  ['contact', 1],
]

// ---------------------------------------------------------------------------
// CA26 — mouvement réduit
// ---------------------------------------------------------------------------

test.describe('CA26 — mouvement réduit (1440 × 900)', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })

  test('CA26 — une fois le défilement arrêté, aucune animation ni transition ne tourne (document.getAnimations() est vide)', async ({ page }) => {
    await openHome(page)
    for (const [section, p] of SAMPLE_STOPS) {
      await scrollToProgress(page, section, p)
      await page.waitForTimeout(600)
      const running = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty))
      expect(running, `${section} à ${p}`).toEqual([])
    }

    // Terminal ouvert : le panneau et le chevron ne s'animent pas non plus.
    await page.getByRole('button', { name: 'open event log', exact: true }).click()
    await expect(page.getByRole('button', { name: 'close event log', exact: true })).toBeVisible()
    await page.waitForTimeout(600)
    const running = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty))
    expect(running, 'terminal ouvert').toEqual([])
  })

  test('CA26 — le paquet ne pulse pas et le curseur ne clignote pas, même au repos à l’entrée du pipeline', async ({ page }) => {
    await openHome(page)
    for (const [section, p] of [['hero', 0.5], ['overview', 0.005], ['spotime', 0.005]] as [SectionName, number][]) {
      await scrollToProgress(page, section, p)
      await nextFrames(page, 20)
      const names = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName))
      expect(names, `${section} à ${p}`).not.toContain('packet-pulse')
      expect(names).not.toContain('blink')
      const t = await terminalSnapshot(page)
      expect(t?.animations, 'curseur du terminal').toEqual([])
    }
  })

  test('CA26 — à chaque palier, le contenu à l’écran est en état final : opacité 1, aucun décalage ni échelle', async ({ page }) => {
    await openHome(page)
    for (const [section, p] of SAMPLE_STOPS) {
      await scrollToProgress(page, section, p)
      await page.waitForTimeout(100)
      expect(await finalStateProblems(page), `${section} à ${p}`).toEqual([])
    }
  })

  test('CA26 — le contact est en état final : portrait posé à droite du titre, sans points', async ({ page }) => {
    await openHome(page)
    const contact = sectionLocator(page, 'contact')
    const portrait = contact.getByRole('img', { name: PORTRAIT_ALT })
    for (const p of [0, 0.3, 1]) {
      await scrollToProgress(page, 'contact', p)
      await expect.poll(() => opacityOf(portrait), { message: `portrait à ${p}` }).toBeGreaterThanOrEqual(0.99)
      const [box, title, image] = await Promise.all([rectOf(portrait), rectOf(contact.locator('h2')), opacityOf(portrait.locator('img'))])
      expect(Math.abs(box.width - 96), `largeur du portrait à ${p}`).toBeLessThanOrEqual(2)
      expect(box.left, 'à droite du titre').toBeGreaterThanOrEqual(title.right - 1)
      expect(Math.abs((box.top + box.bottom) / 2 - (title.top + title.bottom) / 2)).toBeLessThanOrEqual(3)
      expect(image, 'image du portrait affichée').toBeGreaterThanOrEqual(0.99)
    }
  })

  test('CA26 — le pipeline et le terminal suivent les seuils du design (progression à 0 ou 1)', async ({ page }) => {
    await openHome(page)
    const measure = () =>
      page.evaluate(() => {
        const probe = (window as unknown as { __probe: { geometry: (n: string) => { top: number; height: number; sticky: number; vh: number } | null } }).__probe
        const names = ['hero', 'overview', 'spotime', 'fraud-engine', 'event-hub', 'contact']
        return names.map((name) => {
          const g = probe.geometry(name)
          if (!g) throw new Error(`section [data-section="${name}"] introuvable`)
          return { top: g.top - window.scrollY, height: g.height, sticky: g.sticky, vh: g.vh }
        })
      })

    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    const phases = new Set<string>()
    for (let y = 0; y <= max + 300; y += 300) {
      await scrollToY(page, Math.min(y, max))
      const sections = await measure()
      const vh = sections[0]!.vh
      const active = designActive(sections.map((s) => s.top), vh)
      const s = sections[active]!
      const progress = designProgress(active, s.top, s.height, s.sticky, vh, true)
      const expectedCount = designLogCount(active, progress)
      const frame = designFrame(active, progress, null, true)
      const where = `scrollY ${Math.min(y, max)} : section ${SECTION_NAMES[active]}, progression ${progress}`
      phases.add(PHASE_NAMES[active]!)

      await expect.poll(async () => (await readout(page))?.phase, { message: where }).toBe(PHASE_NAMES[active])
      await expect.poll(async () => (await terminalSnapshot(page))?.n, { message: `lignes émises, ${where}` }).toBe(expectedCount)
      await expect
        .poll(async () => {
          const snapshot = await pipelineSnapshot(page)
          return snapshot?.frames.map((f) => f.edges.length > 0)
        }, { message: `cadres remplis, ${where}` })
        .toEqual(frame.fills.map((f) => f >= 99.5))
      if (active >= 2 && active <= 4) {
        await expect
          .poll(async () => (await readout(page))?.stage, { message: `étape, ${where}` })
          .toBe(['ingest', 'build', 'deploy'][frame.stage])
      }
    }
    expect(phases.size, 'toutes les phases ont été rencontrées').toBe(PHASE_NAMES.length)
  })

  test('CA26 — les libellés changent sans rouler : aucune animation roll-*, le texte est à jour', async ({ page }) => {
    await openHome(page)
    const names = await scrollAndRecordAnimations(page, await progressY(page, 'overview', 0.5))
    expect(names, 'aucune animation pendant le changement de libellé').toEqual({})
    await expect.poll(async () => (await readout(page))?.phase).toBe('overview')
    expect((await readout(page))?.phase.length, 'un seul libellé, sans ancien texte').toBe('overview'.length)
  })

  test('CA26 — la vidéo ne démarre pas seule quand elle arrive à l’écran', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    await expect(sectionLocator(page, 'fraud-engine').getByText(VIDEO_CAPTION, { exact: true })).toBeVisible()
    await page.waitForTimeout(600)
    const video = sectionLocator(page, 'fraud-engine').locator('video')
    const state = await video.evaluate((el: HTMLVideoElement) => ({ paused: el.paused, currentTime: el.currentTime }))
    expect(state).toEqual({ paused: true, currentTime: 0 })
  })

  test('CA26 — un clic sur un lien de navigation fait défiler la page sans douceur', async ({ page }) => {
    await openHome(page)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe('smooth')
    await page.getByRole('navigation', { name: 'sections' }).getByRole('link', { name: 'fraud-engine', exact: true }).click()
    await nextFrames(page, 2)
    const [scrollY, target] = await page.evaluate(() => [window.scrollY, document.getElementById('fraud-engine')!.getBoundingClientRect().top + window.scrollY])
    expect(Math.abs(scrollY! - target!), `scrollY ${scrollY} pour une ancre à ${target}`).toBeLessThanOrEqual(3)
    expect(scrollY).toBeGreaterThan(1000)
  })
})

test.describe('CA26 — sans demande de réduction (1440 × 900)', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })

  test('CA26 — le défilement est doux : scroll-behavior vaut smooth sur la page', async ({ page }) => {
    await openHome(page)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth')
  })
})

// ---------------------------------------------------------------------------
// CA27 — JavaScript désactivé
// ---------------------------------------------------------------------------

test.describe('CA27 — JavaScript désactivé (1440 × 900)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })

  test.beforeEach(({ page }) => {
    markScriptless(page)
  })

  async function scrollWithoutScript(page: Page, y: number) {
    await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y)
    await nextFrames(page, 3)
  }

  test('CA27 — en défilant, chaque section affiche en état final ses textes, sa stack, sa fenêtre de déploiement et ses liens', async ({ page }) => {
    await openHome(page)
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    expect(max, 'la page défile').toBeGreaterThan(5000)
    for (let y = 0; y <= max + 300; y += 300) {
      await scrollWithoutScript(page, Math.min(y, max))
      await page.waitForTimeout(50)
      expect(await finalStateProblems(page), `scrollY ${Math.min(y, max)}`).toEqual([])
    }
  })

  test('CA27 — chaque fenêtre de déploiement montre sa première capture ou son poster vidéo', async ({ page }) => {
    await openHome(page)
    for (const project of PROJECTS) {
      await scrollToProgress(page, project.section, 0.8)
      const section = sectionLocator(page, project.section)
      const media = project.video ? section.locator('img[src$="fraud-engine-poster.webp"]') : section.locator(`img[alt="${project.name} — screenshot"]`).first()
      await expect(media, project.name).toHaveCount(1)
      await expect.poll(() => media.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { message: `${project.name} : image chargée` }).toBe(true)
      await expect.poll(() => opacityOf(media), { message: project.name }).toBeGreaterThanOrEqual(0.99)
      const box = await rectOf(media)
      expect(box.width, `${project.name} : taille de l’image`).toBeGreaterThan(200)
      expect(box.height).toBeGreaterThan(100)
    }
  })

  test('CA27 — la ligne « event <nom> → » de chaque projet affiche l’étape deploy', async ({ page }) => {
    await openHome(page)
    for (const project of PROJECTS) expect(await eventStage(page, project), project.name).toBe('deploy')
  })

  test('CA27 — le dépliage des trade-offs fonctionne sans JavaScript (CA18)', async ({ page }) => {
    await openHome(page)
    for (const project of PROJECTS) {
      await scrollToProgress(page, project.section, 0.8)
      await expectDisclosure(page, project)
    }
  })

  test('CA15 — sans JavaScript, l’indication « scroll ↓ to emit romain.init » reste affichée, même après avoir défilé', async ({ page }) => {
    await openHome(page)
    const hint = page.getByText(HERO_HINT, { exact: true })
    await expect(hint).toBeVisible()
    expect(await opacityOf(hint)).toBeGreaterThanOrEqual(0.99)
    await scrollWithoutScript(page, 200)
    await page.waitForTimeout(400)
    expect(await opacityOf(hint)).toBeGreaterThanOrEqual(0.99)
  })

  for (const name of ['spotime', 'fraud-engine', 'event-hub', 'contact']) {
    test(`CA27 — le lien « ${name} » pose le hash et amène sa section à l’écran`, async ({ page }) => {
      await openHome(page)
      const link = page.getByRole('navigation', { name: 'sections' }).getByRole('link', { name, exact: true })
      await expect(link).toHaveAttribute('href', `#${name}`)
      await link.click()
      await expect(page).toHaveURL(new RegExp(`#${name}$`))
      const section = sectionLocator(page, name as SectionName)
      await expect
        .poll(async () => {
          const title = section.locator('h2')
          const [box, opacity, vh] = await Promise.all([rectOf(title), opacityOf(title), page.evaluate(() => window.innerHeight)])
          return box.top >= 111 && box.bottom <= vh - 35 && box.height > 0 && opacity >= 0.99
        }, { message: `titre de ${name} à l’écran` })
        .toBe(true)
    })
  }
})
