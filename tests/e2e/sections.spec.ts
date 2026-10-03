import { expect, test, type Locator, type Page } from '@playwright/test'

import {
  DESIGN_ANNOTATIONS,
  DESIGN_COLORS,
  DESIGN_PROJECTS,
  EMAIL,
  GITLAB_NOTE,
  HERO_HINT,
  KICKER_CONTACT,
  KICKER_OVERVIEW,
  PORTRAIT_ALT,
  TITLE_CONTACT,
  TITLE_OVERVIEW,
  designContact,
  designReveal,
  type DesignProject,
  type SectionName,
} from '../design.ts'
import {
  assertBuilt,
  colorDistance,
  colorOf,
  COLOR_TOLERANCE,
  cssRgb,
  eventStage,
  expectDisclosure,
  nextFrames,
  offsetOf,
  openHome,
  opacityOf,
  progressY,
  readout,
  rectOf,
  scrollToProgress,
  scrollToY,
  sectionLocator,
  settleAnimations,
  stable,
  type Rect,
  type Rgb,
} from './support.ts'

// CA15 à CA20 et CA23 à CA25 — hero, overview, projets, carrousels, contact.

const PROJECTS = DESIGN_PROJECTS.map((p) => ({ ...p, section: p.slug as SectionName }))

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

const within = (value: number, expected: number, tolerance: number) => Math.abs(value - expected) <= tolerance

/** Rectangle de la zone visible entre le bandeau (112 px) et le terminal (36 px), pour la fenêtre de 900 px de haut. */
async function onScreen(locator: Locator, vh = 900) {
  const [rect, opacity] = await Promise.all([rectOf(locator), opacityOf(locator)])
  return rect.height > 0 && rect.top >= 111 && rect.bottom <= vh - 35 && opacity >= 0.99
}

// ---------------------------------------------------------------------------
// CA15 — indication « scroll ↓ to emit romain.init »
// ---------------------------------------------------------------------------

test.describe('CA15 — indication de défilement du hero', () => {
  test.describe('1440 × 900', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('CA15 — l’indication s’affiche sous la liste du hero', async ({ page }) => {
      await openHome(page)
      const hint = page.getByText(HERO_HINT, { exact: true })
      await expect(hint).toBeVisible()
      await expect.poll(() => opacityOf(hint)).toBeGreaterThanOrEqual(0.99)
      const [hintBox, listBox] = await Promise.all([rectOf(hint), rectOf(page.locator('dl'))])
      expect(hintBox.top, 'sous la liste du hero').toBeGreaterThanOrEqual(listBox.bottom - 1)
    })

    test('CA15 — elle disparaît en fondu dès que la page a défilé de plus de 20 px, et ne revient pas', async ({ page }) => {
      await openHome(page)
      const hint = page.getByText(HERO_HINT, { exact: true })
      await expect.poll(() => opacityOf(hint)).toBeGreaterThanOrEqual(0.99)

      await scrollToY(page, 10)
      await nextFrames(page, 40)
      expect(await opacityOf(hint), 'à 10 px, l’indication reste affichée').toBeGreaterThanOrEqual(0.99)

      await scrollToY(page, 21)
      await expect.poll(() => opacityOf(hint), { message: 'après 21 px, l’indication disparaît' }).toBeLessThanOrEqual(0.02)
      const transition = await hint.evaluate((el) => {
        let n: Element | null = el
        const durations: string[] = []
        for (; n; n = n.parentElement) durations.push(getComputedStyle(n).transitionDuration)
        return durations
      })
      expect(
        transition.some((d) => d.split(',').some((v) => Number.parseFloat(v) > 0)),
        'la disparition est un fondu (transition d’opacité)',
      ).toBe(true)

      await scrollToY(page, 0)
      await nextFrames(page, 60)
      expect(await opacityOf(hint), 'de retour en haut, l’indication ne revient pas').toBeLessThanOrEqual(0.02)
    })
  })

  test.describe('hauteur de fenêtre', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('CA15 — affichée à partir de 640 px de haut, absente en dessous', async ({ page }) => {
      await openHome(page)
      const hint = page.getByText(HERO_HINT, { exact: true })
      for (const [height, visible] of [[640, true], [700, true], [639, false], [600, false], [500, false]] as [number, boolean][]) {
        await page.setViewportSize({ width: 1440, height })
        await nextFrames(page, 4)
        await expect(hint, `${height} px de haut`).toBeVisible({ visible })
      }
    })
  })
})

// ---------------------------------------------------------------------------
// CA16 — overview
// ---------------------------------------------------------------------------

test.describe('CA16 — overview (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA16 — le kicker et le titre restent à l’écran pendant toute l’overview', async ({ page }) => {
    await openHome(page)
    const section = sectionLocator(page, 'overview')
    const kicker = section.getByText(KICKER_OVERVIEW, { exact: true })
    const title = section.getByText(TITLE_OVERVIEW, { exact: true })
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      await scrollToProgress(page, 'overview', p)
      await expect.poll(() => onScreen(kicker), { message: `kicker à ${p}` }).toBe(true)
      await expect.poll(() => onScreen(title), { message: `titre à ${p}` }).toBe(true)
    }
  })

  test('CA16 — le titre ne bouge pas pendant la section', async ({ page }) => {
    await openHome(page)
    const title = sectionLocator(page, 'overview').getByText(TITLE_OVERVIEW, { exact: true })
    const tops: number[] = []
    for (const p of [0.1, 0.4, 0.7, 0.95]) {
      await scrollToProgress(page, 'overview', p)
      tops.push((await rectOf(title)).top)
    }
    for (const top of tops) expect(Math.abs(top - tops[0]!), `positions ${tops.join(', ')}`).toBeLessThanOrEqual(1)
  })

  test('CA16 — les annotations ingest, build et deploy apparaissent l’une après l’autre, en fondu et en montée', async ({ page }) => {
    await openHome(page)
    const section = sectionLocator(page, 'overview')
    const annotations = DESIGN_ANNOTATIONS.map((text) => section.getByText(text, { exact: true }))

    // Fenêtres du design : de 0,08 + 0,3·i à 0,22 + 0,3·i.
    for (const p of [0.03, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
      await scrollToProgress(page, 'overview', p)
      for (const [i, annotation] of annotations.entries()) {
        const { op, ty } = designReveal(p, 0.08 + i * 0.3, 0.22 + i * 0.3)
        await expect
          .poll(async () => within(await opacityOf(annotation), op, 0.07), { message: `annotation ${i} à ${p} : opacité attendue ${op.toFixed(2)}` })
          .toBe(true)
        await expect
          .poll(async () => within((await offsetOf(annotation)).y, ty, 2.5), { message: `annotation ${i} à ${p} : montée attendue ${ty.toFixed(1)} px` })
          .toBe(true)
      }
    }
  })

  test('CA16 — au retour, les annotations se masquent dans l’ordre inverse', async ({ page }) => {
    await openHome(page)
    const section = sectionLocator(page, 'overview')
    const annotations = DESIGN_ANNOTATIONS.map((text) => section.getByText(text, { exact: true }))
    await scrollToProgress(page, 'overview', 1)
    for (const annotation of annotations) await expect.poll(() => opacityOf(annotation)).toBeGreaterThanOrEqual(0.99)
    await scrollToProgress(page, 'overview', 0.5)
    await expect.poll(async () => (await opacityOf(annotations[2]!)) <= 0.02).toBe(true)
    expect(await opacityOf(annotations[0]!)).toBeGreaterThanOrEqual(0.99)
    await scrollToProgress(page, 'overview', 0.03)
    await expect.poll(async () => (await opacityOf(annotations[0]!)) <= 0.02).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CA17 — projets : contenu fixé, éléments révélés dans l'ordre du design
// ---------------------------------------------------------------------------

const eventLineOf = (page: Page, project: DesignProject) =>
  sectionLocator(page, project.slug as SectionName).getByText(`event ${project.ev} →`)

test.describe('CA17 — projets (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const project of PROJECTS) {
    test.describe(project.name, () => {
      test('CA17 — les éléments apparaissent dans l’ordre du design pendant le défilement de la section', async ({ page }) => {
        await openHome(page)
        const section = sectionLocator(page, project.section)
        const event = eventLineOf(page, project)
        const title = section.locator('h2')
        const problem = section.getByText(project.problem)
        const decision = section.getByText(project.decision)
        const summary = section.locator('summary')
        const tags = project.stack.map((label) => section.getByText(label, { exact: true }))
        const card = section.getByText(project.url, { exact: true })

        // Fenêtres du design : ligne et titre 0–0,1 ; problem 0,12–0,25 ; decision, bouton et stack 0,3–0,45 ;
        // étiquettes 0,42 + 0,05·k à 0,5 + 0,05·k ; carte 0,4–0,55. Une étiquette hérite de la fenêtre de la stack.
        const expectations = (p: number): [string, Locator, number][] => [
          ['ligne event', event, designReveal(p, 0, 0.1).op],
          ['titre', title, designReveal(p, 0, 0.1).op],
          ['problem', problem, designReveal(p, 0.12, 0.25).op],
          ['decision', decision, designReveal(p, 0.3, 0.45).op],
          ['bouton des trade-offs', summary, designReveal(p, 0.3, 0.45).op],
          ...tags.map((tag, k): [string, Locator, number] => [
            `étiquette ${project.stack[k]}`,
            tag,
            designReveal(p, 0.3, 0.45).op * designReveal(p, 0.42 + k * 0.05, 0.5 + k * 0.05).op,
          ]),
          ['fenêtre de déploiement', card, designReveal(p, 0.4, 0.55).op],
        ]

        for (const p of [0.05, 0.2, 0.37, 0.47, 0.52, 0.7, 0.9]) {
          await scrollToProgress(page, project.section, p)
          for (const [name, locator, expected] of expectations(p)) {
            await expect
              .poll(async () => within(await opacityOf(locator), expected, 0.08), {
                message: `${project.name} à ${p} : ${name}, opacité attendue ${expected.toFixed(2)}`,
              })
              .toBe(true)
          }
        }
      })

      test('CA17 — les éléments montent à leur place : décalage proportionnel à la progression de leur fenêtre', async ({ page }) => {
        await openHome(page)
        const section = sectionLocator(page, project.section)
        const title = section.locator('h2')
        const problem = section.getByText(project.problem)
        // titre : 0–0,1, 18 px ; problem : 0,12–0,25, 18 px.
        await scrollToProgress(page, project.section, 0.05)
        await expect.poll(async () => within((await offsetOf(title)).y, 9, 2.5), { message: 'titre à 0,05' }).toBe(true)
        await scrollToProgress(page, project.section, 0.185)
        await expect.poll(async () => within((await offsetOf(problem)).y, 9, 2.5), { message: 'problem à 0,185' }).toBe(true)
        await scrollToProgress(page, project.section, 0.8)
        await expect.poll(async () => within((await offsetOf(title)).y, 0, 0.5)).toBe(true)
        await expect.poll(async () => within((await offsetOf(problem)).y, 0, 0.5)).toBe(true)
      })

      test('CA17 — le contenu reste fixé à l’écran : le titre ne bouge pas pendant la section', async ({ page }) => {
        await openHome(page)
        const title = sectionLocator(page, project.section).locator('h2')
        const tops: number[] = []
        for (const p of [0.2, 0.5, 0.75, 0.95]) {
          await scrollToProgress(page, project.section, p)
          await expect.poll(() => onScreen(title), { message: `titre à ${p}` }).toBe(true)
          tops.push((await rectOf(title)).top)
        }
        for (const top of tops) expect(Math.abs(top - tops[0]!), `positions du titre : ${tops.join(', ')}`).toBeLessThanOrEqual(1)
      })

      test('CA17 — la ligne event <nom> → s’affiche avec une pastille à l’accent du projet', async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, project.section, 0.3)
        const accent = await cssRgb(page, project.accent)
        const event = eventLineOf(page, project)
        await expect(event).toBeVisible()
        await expect.poll(async () => colorDistance(await colorOf(event), accent)).toBeLessThanOrEqual(COLOR_TOLERANCE)

        const dot = await event.evaluate((el, rgb) => {
          const probe = (window as unknown as { __probe: { rgba: (c: string) => number[] } }).__probe
          const textBox = el.getBoundingClientRect()
          const candidates = [...(el.closest('[data-section]')?.querySelectorAll('*') ?? [])].filter((c) => {
            const box = c.getBoundingClientRect()
            const style = getComputedStyle(c)
            const color = probe.rgba(style.backgroundColor)
            const round = style.borderTopLeftRadius.endsWith('%') || Number.parseFloat(style.borderTopLeftRadius) >= 4
            return (
              Math.abs(box.width - 8) < 0.6 &&
              Math.abs(box.height - 8) < 0.6 &&
              round &&
              color[3]! > 0.5 &&
              Math.max(...rgb.map((v, i) => Math.abs(v - color[i]!))) <= 3 &&
              Math.abs((box.top + box.bottom) / 2 - (textBox.top + textBox.bottom) / 2) <= 6
            )
          })
          return candidates.map((c) => c.getBoundingClientRect().right <= textBox.left + 1)
        }, accent)
        expect(dot, 'pastille de 8 px à l’accent, sur la ligne de l’événement').toHaveLength(1)
        expect(dot[0], 'la pastille précède le texte').toBe(true)
      })

      test('CA17 — l’étape de la ligne event roule de ingest à build puis deploy, comme celle du pipeline', async ({ page }) => {
        await openHome(page)
        for (const [p, stage] of [[0.1, 'ingest'], [0.58, 'build'], [0.92, 'deploy']] as [number, string][]) {
          await scrollToProgress(page, project.section, p)
          await expect.poll(() => eventStage(page, project), { message: `${project.name} à ${p}` }).toBe(stage)
          await expect.poll(async () => (await readout(page))?.stage, { message: `pipeline de ${project.name} à ${p}` }).toBe(stage)
        }
      })
    })
  }

  test('CA17 — un projet déjà passé affiche deploy, un projet à venir affiche ingest', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.3)
    await expect.poll(() => eventStage(page, PROJECTS[0]!)).toBe('deploy')
    await expect.poll(() => eventStage(page, PROJECTS[2]!)).toBe('ingest')
  })
})

// ---------------------------------------------------------------------------
// CA18 — dépliage des trade-offs
// ---------------------------------------------------------------------------

test.describe('CA18 — dépliage « + trade-offs & what broke » (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const project of PROJECTS) {
    test(`CA18 — ${project.name} : clic, Entrée et Espace déplient et replient trade-off et what broke / learned`, async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, project.section, 0.8)
      await expectDisclosure(page, project)
    })
  }

  test('CA18 — chaque projet a son propre dépliage', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'spotime', 0.8)
    await sectionLocator(page, 'spotime').locator('summary').click()
    await expect(sectionLocator(page, 'spotime').locator('details')).toHaveJSProperty('open', true)
    await expect(sectionLocator(page, 'fraud-engine').locator('details')).toHaveJSProperty('open', false)
    await expect(sectionLocator(page, 'event-hub').locator('details')).toHaveJSProperty('open', false)
  })

  test('CA18 — le bouton expose son état à l’accessibilité : <summary> d’un <details> natif', async ({ page }) => {
    await openHome(page)
    const summary = sectionLocator(page, 'spotime').locator('details > summary')
    await expect(summary).toHaveCount(1)
    expect(await summary.evaluate((el) => el.parentElement?.tagName)).toBe('DETAILS')
    expect(await summary.evaluate((el) => getComputedStyle(el).display)).not.toBe('none')
    expect(await summary.evaluate((el) => (el as HTMLElement).tabIndex)).toBeGreaterThanOrEqual(0)
  })
})

// ---------------------------------------------------------------------------
// CA19 — fenêtre de déploiement
// ---------------------------------------------------------------------------

const ARROW_VIEWBOX = '0 0 32 32'

test.describe('CA19 — fenêtre de déploiement (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  const cardOf = (page: Page, project: DesignProject) =>
    sectionLocator(page, project.slug as SectionName)
      .getByText(project.url, { exact: true })
      .locator("xpath=ancestor::*[contains(., 'deploy ✓')][1]")

  for (const project of PROJECTS) {
    test.describe(project.name, () => {
      test('CA19 — barre de navigateur : trois pastilles et l’URL du design', async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, project.section, 0.8)
        // La carte se révèle par une transition (opacité, montée, échelle) : on mesure une fois la révélation finie.
        await settleAnimations(page)
        const card = cardOf(page, project)
        await expect(card).toHaveCount(1)
        const url = sectionLocator(page, project.section).getByText(project.url, { exact: true })
        await expect(url).toBeVisible()
        const urlBox = await rectOf(url)

        const dots = await card.evaluate((el) =>
          [...el.querySelectorAll('*')]
            .map((c) => ({ box: c.getBoundingClientRect(), style: getComputedStyle(c) }))
            .filter(({ box, style }) => Math.abs(box.width - 10) < 0.6 && Math.abs(box.height - 10) < 0.6 && (style.borderTopLeftRadius.endsWith('%') || Number.parseFloat(style.borderTopLeftRadius) >= 5))
            .map(({ box }) => ({ cx: (box.left + box.right) / 2, cy: (box.top + box.bottom) / 2 })),
        )
        expect(dots, 'trois pastilles rondes de 10 px').toHaveLength(3)
        for (const dot of dots) {
          expect(dot.cx, 'les pastilles précèdent l’URL').toBeLessThan(urlBox.left)
          expect(Math.abs(dot.cy - (urlBox.top + urlBox.bottom) / 2), 'sur la même rangée que l’URL').toBeLessThanOrEqual(8)
        }
      })

      test('CA19 — le média, puis « deploy ✓ » à l’accent du projet, le result et les liens, dans cet ordre', async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, project.section, 0.8)
        // La carte se révèle par une transition (opacité, montée, échelle) : on mesure une fois la révélation finie.
        await settleAnimations(page)
        const card = cardOf(page, project)
        const media = project.video ? card.locator('video') : card.locator(`img[alt="${project.name} — screenshot"]`).first()
        await expect(media).toHaveCount(1)
        const deploy = card.getByText('deploy ✓', { exact: true })
        await expect(deploy).toBeVisible()
        const accent = await cssRgb(page, project.accent)
        expect(colorDistance(await colorOf(deploy), accent), '« deploy ✓ » à l’accent').toBeLessThanOrEqual(COLOR_TOLERANCE)

        const result = card.getByText(project.result)
        await expect(result).toBeVisible()
        const links = card.getByRole('link', { name: project.link.label, exact: true })
        await expect(links).toHaveCount(1)

        const [url, mediaBox, deployBox, resultBox, linkBox] = await Promise.all([
          rectOf(sectionLocator(page, project.section).getByText(project.url, { exact: true })),
          rectOf(media),
          rectOf(deploy),
          rectOf(result),
          rectOf(links),
        ])
        expect(url.bottom, 'URL puis média').toBeLessThanOrEqual(mediaBox.top + 1)
        expect(mediaBox.bottom, 'média puis deploy ✓').toBeLessThanOrEqual(deployBox.top + 1)
        expect(deployBox.bottom, 'deploy ✓ puis result').toBeLessThanOrEqual(resultBox.top + 1)
        expect(resultBox.bottom, 'result puis liens').toBeLessThanOrEqual(linkBox.top + 1)
      })

      test(`CA19 — le lien « ${project.link.label} » mène à ${project.link.href}, suivi d’une icône Carbon flèche`, async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, project.section, 0.8)
        const link = cardOf(page, project).getByRole('link', { name: project.link.label, exact: true })
        await expect(link).toHaveCount(1)
        await expect(link).toHaveAttribute('href', project.link.href)

        const icon = link.locator('svg')
        await expect(icon).toHaveCount(1)
        await expect(icon).toHaveAttribute('viewBox', ARROW_VIEWBOX)
        const order = await link.evaluate((a) => {
          const range = document.createRange()
          const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) if (walker.currentNode.textContent?.trim()) range.selectNodeContents(walker.currentNode)
          return { textRight: range.getBoundingClientRect().right, iconLeft: a.querySelector('svg')!.getBoundingClientRect().left }
        })
        expect(order.iconLeft, 'l’icône suit le texte').toBeGreaterThanOrEqual(order.textRight - 0.5)
      })
    })
  }

  test('CA19 — Spotime propose « visit spotime.fr » seul, les deux autres projets « repo »', async ({ page }) => {
    await openHome(page)
    await expect(sectionLocator(page, 'spotime').getByRole('link', { name: 'visit spotime.fr', exact: true })).toHaveAttribute('href', 'https://spotime.fr')
    await expect(sectionLocator(page, 'spotime').getByRole('link', { name: 'repo', exact: true })).toHaveCount(0)
    await expect(sectionLocator(page, 'fraud-engine').getByRole('link', { name: 'repo', exact: true })).toHaveAttribute('href', 'https://gitlab.com/romain.caille/fraud-engine-event-driven')
    await expect(sectionLocator(page, 'event-hub').getByRole('link', { name: 'repo', exact: true })).toHaveAttribute('href', 'https://gitlab.com/romain.caille/event-hub')
  })
})

// ---------------------------------------------------------------------------
// CA20 — carrousels
// ---------------------------------------------------------------------------

test.describe('CA20 — carrousels (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const project of PROJECTS.filter((p) => p.shots > 0)) {
    const n = project.shots
    test.describe(`${project.name} (${n} captures)`, () => {
      async function setup(page: Page) {
        await openHome(page)
        await scrollToProgress(page, project.section, 0.8)
        const section = sectionLocator(page, project.section)
        const images = section.locator(`img[alt="${project.name} — screenshot"]`)
        await expect(images).toHaveCount(n)
        return {
          images,
          next: section.getByRole('button', { name: 'next screenshot', exact: true }),
          prev: section.getByRole('button', { name: 'previous screenshot', exact: true }),
          counter: (i: number) => section.getByText(`${i} / ${n}`, { exact: true }),
        }
      }

      /** Index de la capture à l'écran : la seule à opacité effective 1, les autres à 0. */
      async function expectCurrent(images: Locator, index: number, message: string) {
        await expect
          .poll(async () => (await images.evaluateAll((els) => els.map((el) => (window as unknown as { __probe: { opacity: (e: Element) => number } }).__probe.opacity(el)))).map((o) => Math.round(o * 100) / 100), { message })
          .toEqual(Array.from({ length: n }, (_, i) => (i === index ? 1 : 0)))
      }

      test('CA20 — la première capture est affichée avec le compteur « 1 / n », chaque capture a le texte alternatif attendu', async ({ page }) => {
        const { images, counter, next, prev } = await setup(page)
        await expectCurrent(images, 0, 'état initial')
        await expect(counter(1)).toBeVisible()
        await expect(next).toBeVisible()
        await expect(prev).toBeVisible()
        const alts = await images.evaluateAll((els) => els.map((el) => el.getAttribute('alt')))
        expect(alts).toEqual(Array.from({ length: n }, () => `${project.name} — screenshot`))
      })

      test('CA20 — « next screenshot » passe à la suivante, puis boucle en fin de série ; le compteur suit', async ({ page }) => {
        const { images, counter, next } = await setup(page)
        for (let step = 1; step < n; step++) {
          await next.click()
          await expectCurrent(images, step, `après ${step} clic(s) sur next`)
          await expect(counter(step + 1)).toBeVisible()
        }
        await next.click()
        await expectCurrent(images, 0, 'next à la dernière capture : retour à la première')
        await expect(counter(1)).toBeVisible()
      })

      test('CA20 — « previous screenshot » revient en arrière, puis boucle au début de la série ; le compteur suit', async ({ page }) => {
        const { images, counter, prev } = await setup(page)
        await prev.click()
        await expectCurrent(images, n - 1, 'previous à la première capture : saut à la dernière')
        await expect(counter(n)).toBeVisible()
        await prev.click()
        await expectCurrent(images, n - 2, 'previous encore')
        await expect(counter(n - 1)).toBeVisible()
      })

      test('CA20 — la nouvelle capture apparaît en fondu : l’opacité des captures est animée', async ({ page }) => {
        const { images } = await setup(page)
        const transitions = await images.evaluateAll((els) => els.map((el) => ({ property: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration })))
        for (const t of transitions) {
          expect(t.property, 'transition sur l’opacité').toMatch(/opacity|all/)
          expect(Number.parseFloat(t.duration), 'durée de la transition').toBeGreaterThan(0)
        }
      })
    })
  }

  test('CA20 — Fraud Engine n’a pas de carrousel : son média est une vidéo, alors que Spotime a ses flèches', async ({ page }) => {
    await openHome(page)
    await expect(sectionLocator(page, 'fraud-engine').locator('video')).toHaveCount(1)
    await expect(sectionLocator(page, 'spotime').getByRole('button', { name: 'next screenshot', exact: true })).toHaveCount(1)
    await expect(sectionLocator(page, 'fraud-engine').getByRole('button', { name: 'next screenshot' })).toHaveCount(0)
    await expect(sectionLocator(page, 'fraud-engine').getByRole('button', { name: 'previous screenshot' })).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------
// CA23 — contact : points, portrait
// ---------------------------------------------------------------------------

const contactAccents = PROJECTS.map((p) => p.accent)

test.describe('CA23 — contact : trois points et portrait (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /** Les trois points aux accents des projets : centre et opacité effective, `null` si introuvable. */
  async function dots(page: Page) {
    const rgbs: Rgb[] = await Promise.all(contactAccents.map((c) => cssRgb(page, c)))
    return page.evaluate((colors) => {
      const probe = (window as unknown as { __probe: { rgba: (c: string) => number[]; opacity: (e: Element) => number } }).__probe
      const all = [...document.querySelectorAll('[data-section="contact"] *')]
      return colors.map((rgb) => {
        const el = all.find((e) => {
          const box = e.getBoundingClientRect()
          const style = getComputedStyle(e)
          const color = probe.rgba(style.backgroundColor)
          const round = style.borderTopLeftRadius.endsWith('%') || Number.parseFloat(style.borderTopLeftRadius) >= 7
          return Math.abs(box.width - 14) < 1.5 && Math.abs(box.height - 14) < 1.5 && round && color[3]! > 0.5 && Math.max(...rgb.map((v, i) => Math.abs(v - color[i]!))) <= 3
        })
        if (!el) return null
        const box = el.getBoundingClientRect()
        return { cx: (box.left + box.right) / 2, cy: (box.top + box.bottom) / 2, opacity: probe.opacity(el) }
      })
    }, rgbs)
  }

  const portrait = (page: Page) => sectionLocator(page, 'contact').getByRole('img', { name: PORTRAIT_ALT })
  const center = (r: Rect) => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 })

  async function settledDots(page: Page) {
    return stable(page, async () => (await dots(page)).map((d) => (d ? { ...d, cx: Math.round(d.cx * 2) / 2, cy: Math.round(d.cy * 2) / 2, opacity: Math.round(d.opacity * 100) / 100 } : null)))
  }

  test('CA23 — au début, trois points écartés de 120 px, aux accents de Spotime, Fraud Engine et Event Hub', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 0)
    const found = await settledDots(page)
    expect(found.every(Boolean), 'trois points de 14 px aux accents des projets').toBe(true)
    const [a, b, c] = found as NonNullable<(typeof found)[number]>[]
    expect(within(b!.cx - a!.cx, 120, 3), `écart spotime → fraud-engine : ${b!.cx - a!.cx}`).toBe(true)
    expect(within(c!.cx - b!.cx, 120, 3), `écart fraud-engine → event-hub : ${c!.cx - b!.cx}`).toBe(true)
    for (const d of found) expect(d!.opacity).toBeGreaterThanOrEqual(0.99)
    await expect.poll(() => opacityOf(portrait(page))).toBeLessThanOrEqual(0.02)
  })

  test('CA23 — les points se rapprochent à mesure que la page défile, jusqu’à ne faire qu’un', async ({ page }) => {
    await openHome(page)
    const spreads: number[] = []
    for (const p of [0, 0.1, 0.2, 0.3, 0.34]) {
      await scrollToProgress(page, 'contact', p)
      const found = await settledDots(page)
      expect(found.every(Boolean)).toBe(true)
      const spread = found[2]!.cx - found[0]!.cx
      // Convergence du design : écart = 2 × 120 × (1 − p / 0,34).
      expect(within(spread, 240 * (1 - Math.min(1, p / 0.34)), 6), `écart à ${p} : ${spread}`).toBe(true)
      spreads.push(spread)
    }
    for (let i = 1; i < spreads.length; i++) expect(spreads[i]!).toBeLessThan(spreads[i - 1]!)
  })

  test('CA23 — après la convergence, un seul point : les trois points disparaissent, le portrait est un point de 14 px', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 0.4)
    const found = await settledDots(page)
    for (const d of found) expect(d!.opacity, 'les trois points ont fusionné').toBeLessThanOrEqual(0.02)
    await expect.poll(() => opacityOf(portrait(page))).toBeGreaterThanOrEqual(0.99)
    // Le point porte une transition d'échelle (0,45 s) : on le mesure au repos.
    await settleAnimations(page)
    const box = await rectOf(portrait(page))
    expect(within(box.width, 14, 1.5) && within(box.height, 14, 1.5), `taille du point : ${box.width} × ${box.height}`).toBe(true)
    const middle = found[1]!
    expect(Math.abs(center(box).x - middle.cx), 'le point est à l’endroit où les trois points ont convergé (au recul près)').toBeLessThanOrEqual(15)
    expect(Math.abs(center(box).y - middle.cy)).toBeLessThanOrEqual(25)
  })

  test('CA23 — le point recule, part en parabole et atterrit : sa trajectoire suit celle du design', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const landed = await stable(page, async () => {
      const box = await rectOf(portrait(page))
      return { cx: Math.round(center(box).x), cy: Math.round(center(box).y), w: Math.round(box.width) }
    })
    const start = (await settledDots(page))[1]!
    const geometry = { sx: start.cx, sy: start.cy, ex: landed.cx, ey: landed.cy }

    for (const p of [0.4, 0.5, 0.58, 0.64, 0.7, 0.76]) {
      await scrollToProgress(page, 'contact', p)
      const expected = designContact(p, geometry)
      const box = await stable(page, async () => {
        const rect = await rectOf(portrait(page))
        return { x: Math.round(center(rect).x), y: Math.round(center(rect).y), w: Math.round(rect.width) }
      })
      expect(Math.abs(box.x - expected.x), `x à ${p} : ${box.x} au lieu de ${expected.x.toFixed(0)}`).toBeLessThanOrEqual(8)
      expect(Math.abs(box.y - expected.y), `y à ${p} : ${box.y} au lieu de ${expected.y.toFixed(0)}`).toBeLessThanOrEqual(8)
      expect(within(box.w, 14, 1.5), `largeur à ${p} : ${box.w} (le point n’a pas encore atterri)`).toBe(true)
    }
  })

  test('CA23 — à la fin, le portrait est à droite du titre, centré verticalement, à la taille de l’emplacement', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const title = sectionLocator(page, 'contact').locator('h2')
    const box = await stable(page, async () => {
      const r = await rectOf(portrait(page))
      return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) }
    })
    const titleBox = await rectOf(title)
    expect(within(box.width, 96, 2), `largeur ${box.width} (8 vw plafonné à 96 px à 1440 px)`).toBe(true)
    expect(within(box.height, 96, 2)).toBe(true)
    expect(box.left, 'à droite du titre').toBeGreaterThanOrEqual(titleBox.right - 1)
    expect(Math.abs((box.top + box.bottom) / 2 - (titleBox.top + titleBox.bottom) / 2), 'centré verticalement sur le titre').toBeLessThanOrEqual(3)
    await expect.poll(() => opacityOf(portrait(page))).toBeGreaterThanOrEqual(0.99)
  })

  test('CA23 — à l’atterrissage, le point grandit progressivement jusqu’à la taille du portrait, sans saut', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 0.7)
    await expect.poll(async () => within((await rectOf(portrait(page))).width, 14, 1.5), { message: 'point de 14 px avant l’atterrissage' }).toBe(true)
    const y = await progressY(page, 'contact', 1)
    const widths = await page.evaluate(
      async ({ top, name }) => {
        const el = document.querySelector(`[data-section="contact"] [role="img"][aria-label="${name}"]`)!
        const samples: number[] = []
        window.scrollTo({ top, left: 0, behavior: 'instant' })
        const end = performance.now() + 1200
        await new Promise<void>((done) => {
          const tick = () => {
            samples.push(el.getBoundingClientRect().width)
            if (performance.now() >= end) done()
            else requestAnimationFrame(tick)
          }
          tick()
        })
        return samples
      },
      { top: y, name: PORTRAIT_ALT },
    )
    const final = widths.at(-1)!
    expect(within(final, 96, 2), `taille finale : ${final}`).toBe(true)
    const between = widths.filter((w) => w > 14 + 8 && w < final - 8)
    expect(between.length, `largeurs relevées image par image : ${widths.map((w) => Math.round(w)).join(', ')}`).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < widths.length; i++) expect(widths[i]!, `la largeur ne décroît pas (image ${i})`).toBeGreaterThanOrEqual(widths[i - 1]! - 0.5)
  })

  test('CA23 — la taille de l’emplacement suit 8 vw entre 64 et 96 px', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 })
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const box = await stable(page, async () => {
      const r = await rectOf(portrait(page))
      return { width: Math.round(r.width) }
    })
    expect(within(box.width, 80, 2), `largeur ${box.width} à 1000 px de large`).toBe(true)
  })

  test('CA23 — le portrait est rond, en couleur, avec le texte alternatif « Portrait of Romain Caillé »', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const figure = portrait(page)
    await expect(figure).toHaveCount(1)
    await expect(figure).toHaveAttribute('aria-label', PORTRAIT_ALT)
    await expect.poll(async () => {
      const [box, radius] = await Promise.all([rectOf(figure), figure.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)])
      return radius.endsWith('%') ? Number.parseFloat(radius) >= 50 : Number.parseFloat(radius) >= box.width / 2 - 0.5
    }, { message: 'portrait rond' }).toBe(true)

    const image = figure.locator('img')
    await expect(image).toHaveCount(1)
    await expect(image).toHaveAttribute('src', /portrait-color\.webp$/)
    await expect(image).toHaveAttribute('alt', '')
    await expect.poll(() => opacityOf(image), { message: 'l’image apparaît en fondu à l’atterrissage' }).toBeGreaterThanOrEqual(0.99)

    const colors = await image.evaluate(async (img: HTMLImageElement) => {
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let gap = 0
      for (let i = 0; i < data.length; i += 4) gap = Math.max(gap, Math.abs(data[i]! - data[i + 1]!), Math.abs(data[i + 1]! - data[i + 2]!))
      return { width: canvas.width, gap }
    })
    expect(colors.width).toBeGreaterThan(0)
    expect(colors.gap, 'portrait en couleur, sans filtre de niveaux de gris').toBeGreaterThan(20)
  })

  test('CA23 — l’image du portrait n’apparaît qu’à l’atterrissage', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 0.6)
    await expect.poll(() => opacityOf(portrait(page).locator('img'))).toBeLessThanOrEqual(0.05)
    await scrollToProgress(page, 'contact', 1)
    await expect.poll(() => opacityOf(portrait(page).locator('img'))).toBeGreaterThanOrEqual(0.99)
  })

  test('CA23 — en remontant, l’animation se joue à l’envers', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect.poll(() => opacityOf(portrait(page))).toBeGreaterThanOrEqual(0.99)
    await scrollToProgress(page, 'contact', 0.6)
    await scrollToProgress(page, 'contact', 0.2)
    await scrollToProgress(page, 'contact', 0)
    await expect.poll(() => opacityOf(portrait(page)), { message: 'portrait masqué en haut de la section' }).toBeLessThanOrEqual(0.02)
    const found = await settledDots(page)
    expect(found.every(Boolean)).toBe(true)
    for (const d of found) expect(d!.opacity).toBeGreaterThanOrEqual(0.99)
    expect(within(found[2]!.cx - found[0]!.cx, 240, 6)).toBe(true)
  })

  test('CA23 — le portrait du contact est un role=img distinct, sans second img à l’alt du hero', async ({ page }) => {
    await openHome(page)
    await expect(page.locator(`img[alt="${PORTRAIT_ALT}"]`)).toHaveCount(1)
    await expect(page.getByRole('img', { name: PORTRAIT_ALT })).toHaveCount(2)
    await expect(sectionLocator(page, 'hero').getByRole('img', { name: PORTRAIT_ALT })).toHaveCount(1)
    await expect(sectionLocator(page, 'contact').getByRole('img', { name: PORTRAIT_ALT })).toHaveCount(1)
  })
})

// ---------------------------------------------------------------------------
// CA24 — copie de l'adresse e-mail
// ---------------------------------------------------------------------------

test.describe('CA24 — bouton e-mail (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })

  const copyButton = (page: Page) => page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true })

  /** Pictogramme effectivement affiché dans le bouton (tracé du `path`), `''` s'il n'y en a pas. */
  const shownIcon = (page: Page) =>
    copyButton(page).evaluate((button) => {
      const probe = (window as unknown as { __probe: { opacity: (e: Element) => number } }).__probe
      return [...button.querySelectorAll('svg')]
        .filter((svg) => probe.opacity(svg) >= 0.99 && svg.getBoundingClientRect().width > 4)
        .map((svg) => [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|'))
        .join('#')
    })

  const copiedShown = async (page: Page) => {
    const mention = copyButton(page).getByText('copied', { exact: true })
    if ((await mention.count()) === 0) return false
    const [opacity, box] = await Promise.all([opacityOf(mention), rectOf(mention)])
    return opacity >= 0.99 && box.width >= 8
  }

  test('CA24 — le bouton porte le libellé accessible « copy email address r.caille@icloud.com » et le texte de l’adresse', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect(copyButton(page)).toBeVisible()
    await expect(copyButton(page)).toContainText(EMAIL)
    expect(await copiedShown(page), 'rien n’est copié au départ').toBe(false)
  })

  test('CA24 — un clic copie l’adresse, affiche la coche et « copied » environ 1,8 s, puis rend l’icône de copie', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect(copyButton(page)).toBeVisible()
    await nextFrames(page, 20)
    const before = await shownIcon(page)
    expect(before, 'icône de copie affichée au départ').not.toBe('')

    // Horloge simulée, figée : seul `runFor` fait avancer les minuteries de la page.
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T00:00:10Z'))
    await copyButton(page).click()

    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()), { message: 'presse-papiers' }).toBe(EMAIL)
    await expect.poll(() => copiedShown(page), { message: '« copied » s’affiche après le clic' }).toBe(true)
    const during = await shownIcon(page)
    expect(during, 'la coche remplace l’icône de copie').not.toBe('')
    expect(during).not.toBe(before)

    await page.clock.runFor(1700)
    expect(await copiedShown(page), 'encore affiché à 1,7 s').toBe(true)
    expect(await shownIcon(page)).toBe(during)

    await page.clock.runFor(200)
    await expect.poll(() => copiedShown(page), { message: '« copied » disparaît après 1,8 s' }).toBe(false)
    await expect.poll(() => shownIcon(page), { message: 'l’icône de copie revient' }).toBe(before)
  })

  test('CA24 — un second clic repart pour 1,8 s', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect(copyButton(page)).toBeVisible()
    await nextFrames(page, 20)
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T00:00:10Z'))
    await copyButton(page).click()
    await expect.poll(() => copiedShown(page)).toBe(true)
    await page.clock.runFor(1500)
    await copyButton(page).click()
    await page.clock.runFor(1500)
    expect(await copiedShown(page), '3 s après le premier clic mais 1,5 s après le second').toBe(true)
    await page.clock.runFor(400)
    await expect.poll(() => copiedShown(page)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// CA25 — contenu du contact
// ---------------------------------------------------------------------------

test.describe('CA25 — contact (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA25 — kicker, titre, bouton e-mail, liens et mention GitLab, dans cet ordre', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const section = sectionLocator(page, 'contact')
    const kicker = section.getByText(KICKER_CONTACT, { exact: true })
    const title = section.locator('h2')
    const email = page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true })
    const gitlab = section.getByRole('link', { name: 'gitlab', exact: true })
    const note = section.getByText(GITLAB_NOTE, { exact: true })
    await expect(kicker).toBeVisible()
    await expect(title).toHaveText(TITLE_CONTACT)
    await expect(email).toBeVisible()
    await expect(email).toContainText(EMAIL)
    await expect(note).toBeVisible()

    const [k, t, e, g, n] = await Promise.all([rectOf(kicker), rectOf(title), rectOf(email), rectOf(gitlab), rectOf(note)])
    expect(k.bottom).toBeLessThanOrEqual(t.top + 1)
    expect(t.bottom).toBeLessThanOrEqual(e.top + 1)
    expect(e.bottom).toBeLessThanOrEqual(n.top + 1)
    expect(Math.abs(g.top - e.top), 'e-mail et liens sur la même rangée').toBeLessThanOrEqual(2)
    expect(g.left).toBeGreaterThan(e.right)
  })

  const links: [string, string][] = [
    ['gitlab', 'https://gitlab.com/romain.caille'],
    ['linkedin', 'https://www.linkedin.com/in/romain-caill%C3%A9/'],
    ['resume.pdf', '/resume-romain-caille.pdf'],
  ]
  for (const [name, href] of links) {
    test(`CA25 — le lien « ${name} » mène à ${href}, suivi d’une icône Carbon flèche`, async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, 'contact', 1)
      const link = sectionLocator(page, 'contact').getByRole('link', { name, exact: true })
      await expect(link).toHaveCount(1)
      await expect(link).toHaveAttribute('href', href)
      const icon = link.locator('svg')
      await expect(icon).toHaveCount(1)
      await expect(icon).toHaveAttribute('viewBox', ARROW_VIEWBOX)
      const order = await link.evaluate((a) => {
        const range = document.createRange()
        const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) if (walker.currentNode.textContent?.trim()) range.selectNodeContents(walker.currentNode)
        return { textRight: range.getBoundingClientRect().right, iconLeft: a.querySelector('svg')!.getBoundingClientRect().left }
      })
      expect(order.iconLeft, 'l’icône suit le texte').toBeGreaterThanOrEqual(order.textRight - 0.5)
    })
  }

  test('CA25 — la mention GitLab est en texte discret (plus claire que le fond, plus sombre que le texte atténué)', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const note = sectionLocator(page, 'contact').getByText(GITLAB_NOTE, { exact: true })
    const [color, muted, text] = await Promise.all([colorOf(note), cssRgb(page, DESIGN_COLORS.muted), cssRgb(page, DESIGN_COLORS.text)])
    const luminance = (c: number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
    expect(luminance(color), 'moins claire que le texte atténué').toBeLessThan(luminance(muted))
    expect(luminance(color)).toBeLessThan(luminance(text))
    expect(colorDistance(color, muted), 'distincte du texte atténué').toBeGreaterThan(5)
  })

  test('CA25 — le lien resume.pdf du contact s’ajoute à celui du hero, qui reste seul dans le hero', async ({ page }) => {
    await openHome(page)
    await expect(page.getByRole('link', { name: 'resume.pdf', exact: true })).toHaveCount(2)
    await expect(sectionLocator(page, 'hero').getByRole('link', { name: 'resume.pdf' })).toHaveCount(1)
  })
})

// Plage de défilement des projets.
test.describe('CA17 — plage de défilement des projets (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA17 — la plage de défilement d’un projet vaut la hauteur de la section moins celle du contenu fixé', async ({ page }) => {
    await openHome(page)
    for (const project of PROJECTS) {
      const y0 = await progressY(page, project.section, 0)
      const y1 = await progressY(page, project.section, 1)
      expect(y1 - y0, project.name).toBeGreaterThan(700)
      // Le titre se révèle de 0 à 0,1 (montée de 18 px, CA17) : on le mesure une fois la révélation finie.
      const title = sectionLocator(page, project.section).locator('h2')
      await scrollToProgress(page, project.section, 0.2)
      await expect.poll(async () => within((await offsetOf(title)).y, 0, 0.5), { message: `${project.name} : titre révélé à 0,2` }).toBe(true)
      const top0 = (await rectOf(title)).top
      await scrollToY(page, y1)
      expect(Math.abs((await rectOf(title)).top - top0), `${project.name} : contenu fixé sur toute la plage`).toBeLessThanOrEqual(1)
      await scrollToY(page, y1 + 200)
      expect((await rectOf(title)).top, `${project.name} : la section repart après sa plage`).toBeLessThan(top0 - 100)
    }
  })
})
