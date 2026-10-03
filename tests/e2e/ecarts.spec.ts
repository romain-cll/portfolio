import { expect, test, type Locator, type Page } from '@playwright/test'

import { DESIGN_LOG, DESIGN_PROJECTS, EMAIL, HERO_HINT, designTimestamp, type SectionName } from '../design.ts'
import {
  assertBuilt,
  logLinePattern,
  nextFrames,
  openHome,
  opacityOf,
  progressY,
  rectOf,
  scrollToProgress,
  scrollToY,
  sectionLocator,
  settleAnimations,
  terminalSnapshot,
} from './support.ts'

// Écarts E1 à E7 relevés après la livraison de portfolio-pages (spec « Écarts après livraison »).
// Les valeurs attendues sont recopiées du design ou de la spec, jamais importées de `src/`.

const PROJECTS = DESIGN_PROJECTS.map((p) => ({ ...p, section: p.slug as SectionName }))

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

const durations = (value: string) => value.split(',').map((v) => Number.parseFloat(v))

// ---------------------------------------------------------------------------
// E1 — étiquettes de la stack : transition de 0,15 s
// ---------------------------------------------------------------------------

test.describe('E1 — étiquettes de la stack (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const project of PROJECTS) {
    test(`E1 — ${project.name} : chaque étiquette de la stack a une transition d’opacité et de translation de 0,15 s`, async ({ page }) => {
      await openHome(page)
      const section = sectionLocator(page, project.section)
      for (const label of project.stack) {
        const tag = section.getByText(label, { exact: true })
        await expect(tag, label).toHaveCount(1)
        const { property, duration } = await tag.evaluate((el) => {
          const cs = getComputedStyle(el)
          return { property: cs.transitionProperty, duration: cs.transitionDuration }
        })
        const properties = property.split(',').map((p) => p.trim())
        expect(properties, `${label} : propriétés`).toEqual(expect.arrayContaining(['opacity', 'translate']))
        expect(durations(duration), `${label} : durées « ${duration} »`).toEqual(durations(duration).map(() => 0.15))
      }
    })

    test(`E1 — ${project.name} : témoins, « problem » reste à 0,2 s et la carte à 0,25 s`, async ({ page }) => {
      await openHome(page)
      const section = sectionLocator(page, project.section)
      const problem = await section.getByText(project.problem).evaluate((el) => getComputedStyle(el).transitionDuration)
      expect(durations(problem), `problem : « ${problem} »`).toEqual(durations(problem).map(() => 0.2))

      // La carte est l'ancêtre de la fenêtre de déploiement qui anime aussi `scale`.
      const card = await section.getByText(project.url, { exact: true }).evaluate((el) => {
        for (let n: Element | null = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n)
          if (cs.transitionProperty.split(',').map((p) => p.trim()).includes('scale')) return cs.transitionDuration
        }
        return null
      })
      expect(card, 'carte : transition sur `scale` introuvable').not.toBeNull()
      expect(durations(card!), `carte : « ${card} »`).toEqual(durations(card!).map(() => 0.25))
    })
  }
})

// ---------------------------------------------------------------------------
// E2 — seuil du hero à partir de 900 px
// ---------------------------------------------------------------------------

test.describe('E2 — seuil de `> emit romain.init` et du paquet', () => {
  const FIRST = DESIGN_LOG[0]!

  /** Animations `packet-pulse` en cours. */
  const pulses = (page: Page) =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName === 'packet-pulse')
        .map((a) => ({ playState: a.playState })),
    )

  const hint = (page: Page) => page.getByText(HERO_HINT, { exact: true })

  /** Nombre de lignes émises, une fois le contrôleur passé : l'indication a quitté l'écran dans le même défilement. */
  async function emittedAfterScroll(page: Page, y: number) {
    await scrollToY(page, y)
    await expect.poll(() => opacityOf(hint(page)), { message: `indication masquée à ${y} px` }).toBeLessThanOrEqual(0.02)
    await nextFrames(page, 10)
    return (await terminalSnapshot(page))!
  }

  test.describe('1440 × 900', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    // 112 px de bandeau, plus 4 % de la plage du hero (1,3 × 900 − 900).
    const THRESHOLD = 112 + 0.04 * (1.3 - 1) * 900
    const BELOW = Math.floor(THRESHOLD - 4)
    const ABOVE = Math.ceil(THRESHOLD + 5)

    test('E2 — le seuil est à 122,8 px : 118 px de défilement et la ligne n’est pas émise, le paquet ne pulse pas', async ({ page }) => {
      expect(THRESHOLD).toBeCloseTo(122.8, 5)
      expect(BELOW).toBe(118)
      await openHome(page)
      const t = await emittedAfterScroll(page, BELOW)
      expect(t.text, `à ${BELOW} px`).toContain('events.log · 0')
      expect(t.n, `à ${BELOW} px`).toBe(0)
      expect(t.text).not.toMatch(logLinePattern(designTimestamp(0), FIRST.txt))
      expect(await pulses(page), `paquet à ${BELOW} px`).toEqual([])
    })

    test('E2 — à 128 px, `> emit romain.init` est émise, le paquet pulse et l’indication a disparu', async ({ page }) => {
      await openHome(page)
      await scrollToY(page, ABOVE)
      await expect.poll(async () => (await terminalSnapshot(page))?.n, { message: `lignes émises à ${ABOVE} px` }).toBe(1)
      const t = (await terminalSnapshot(page))!
      expect(t.text).toContain('events.log · 1')
      expect(t.text).toMatch(logLinePattern(designTimestamp(0), FIRST.txt))
      await expect.poll(async () => (await pulses(page)).length, { message: `paquet à ${ABOVE} px` }).toBe(1)
      expect((await pulses(page))[0]!.playState).toBe('running')
      await expect.poll(() => opacityOf(hint(page))).toBeLessThanOrEqual(0.02)
    })
  })

  test.describe('800 × 900 (rail)', () => {
    test.use({ viewport: { width: 800, height: 900 } })

    test('E2 — sous 900 px rien ne change : la ligne est déjà émise à 12 px (seuil à 10,8 px)', async ({ page }) => {
      await openHome(page)
      await scrollToY(page, 12)
      await expect.poll(async () => (await terminalSnapshot(page))?.n, { message: 'lignes émises à 12 px' }).toBe(1)
      expect((await terminalSnapshot(page))!.text).toMatch(logLinePattern(designTimestamp(0), FIRST.txt))
    })
  })
})

// ---------------------------------------------------------------------------
// E3 — marge intérieure de la ligne des étapes : 2 % de sa largeur
// ---------------------------------------------------------------------------

test.describe('E3 — ligne des étapes du bandeau', () => {
  /** Premier ancêtre commun des trois cadres INGEST, BUILD, DEPLOY qui n'est pas en `display: contents`. */
  const stageRow = (page: Page) =>
    page.evaluate(() => {
      const names = ['ingest', 'build', 'deploy']
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
      const fixedAncestor = (el: Element) => {
        for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
          if (getComputedStyle(n).position === 'fixed') return n
        }
        return null
      }
      const frames = [...document.querySelectorAll('body *')].filter((el) => {
        if (!names.includes(norm(el.textContent || '').toLowerCase())) return false
        const cs = getComputedStyle(el)
        return (Number.parseFloat(cs.borderTopWidth) > 0 || Number.parseFloat(cs.borderLeftWidth) > 0) && fixedAncestor(el) !== null
      })
      if (frames.length !== 3) return null
      let row: Element | null = frames[0]!.parentElement
      while (row && !frames.every((f) => row!.contains(f))) row = row.parentElement
      while (row && getComputedStyle(row).display === 'contents') row = row.parentElement
      if (!row) return null
      const cs = getComputedStyle(row)
      return {
        width: row.getBoundingClientRect().width,
        left: Number.parseFloat(cs.paddingLeft),
        right: Number.parseFloat(cs.paddingRight),
      }
    })

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test.describe(`${viewport.width} × ${viewport.height}`, () => {
      test.use({ viewport })

      test('E3 — la marge intérieure horizontale de la ligne des étapes vaut 2 % de sa largeur', async ({ page }) => {
        await openHome(page)
        const row = await stageRow(page)
        expect(row, 'ligne des étapes introuvable').not.toBeNull()
        const expected = row!.width * 0.02
        expect(Math.abs(row!.left - expected), `padding-left : ${row!.left} px, attendu ${expected} px (2 % de ${row!.width} px), à 0,5 px près`).toBeLessThanOrEqual(0.5)
        expect(Math.abs(row!.right - expected), `padding-right : ${row!.right} px, attendu ${expected} px, à 0,5 px près`).toBeLessThanOrEqual(0.5)
      })
    })
  }
})

// ---------------------------------------------------------------------------
// E4 — bouton e-mail sans API presse-papiers, ou avec écriture refusée
// ---------------------------------------------------------------------------

test.describe('E4 — bouton e-mail sans presse-papiers utilisable (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  const copyButton = (page: Page) => page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true })

  /** Pictogramme effectivement affiché dans le bouton (tracé du `path`). */
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

  /** Erreurs JavaScript non rattrapées et erreurs de console. */
  function recordErrors(page: Page) {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror : ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console : ${message.text()}`)
    })
    return errors
  }

  /** Relève `copied` et le pictogramme toutes les 50 ms pendant `ms` : la mention ne doit jamais apparaître. */
  async function watchNoCopied(page: Page, icon: string, ms: number) {
    const end = Date.now() + ms
    const seen: string[] = []
    while (Date.now() < end) {
      if (await copiedShown(page)) seen.push('copied affiché')
      const now = await shownIcon(page)
      if (now !== icon) seen.push('icône changée')
      await page.waitForTimeout(50)
    }
    return seen
  }

  test('E4 — sans API presse-papiers : aucune erreur JavaScript, `copied` n’apparaît jamais et l’icône de copie reste', async ({ page }) => {
    const errors = recordErrors(page)
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined, configurable: true })
    })
    await openHome(page)
    expect(await page.evaluate(() => navigator.clipboard), 'navigator.clipboard doit être indéfini').toBeUndefined()
    await scrollToProgress(page, 'contact', 1)
    await expect(copyButton(page)).toBeVisible()
    await nextFrames(page, 20)
    const icon = await shownIcon(page)
    expect(icon, 'icône de copie affichée au départ').not.toBe('')

    await copyButton(page).click()
    expect(await watchNoCopied(page, icon, 500), 'pendant les 500 ms qui suivent le clic').toEqual([])
    expect(errors).toEqual([])
  })

  test('E4 — écriture refusée : aucune erreur, `copied` est masqué après le rejet et le reste', async ({ page }) => {
    const errors = recordErrors(page)
    await page.addInitScript(() => {
      const store = window as unknown as { __writes: number }
      store.__writes = 0
      Clipboard.prototype.writeText = () => {
        store.__writes += 1
        return Promise.reject(new DOMException('write denied', 'NotAllowedError'))
      }
    })
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await expect(copyButton(page)).toBeVisible()
    await nextFrames(page, 20)
    const icon = await shownIcon(page)
    expect(icon, 'icône de copie affichée au départ').not.toBe('')

    await copyButton(page).click()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __writes: number }).__writes), { message: 'writeText appelé' }).toBe(1)
    await expect.poll(() => copiedShown(page), { message: '`copied` masqué après le rejet' }).toBe(false)
    await settleAnimations(page)
    expect(await watchNoCopied(page, icon, 500), 'après le rejet').toEqual([])
    expect(errors).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// E5 — captures masquées hors de l'arbre d'accessibilité
// ---------------------------------------------------------------------------

test.describe('E5 — carrousels et arbre d’accessibilité (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const project of PROJECTS.filter((p) => p.shots > 0)) {
    const n = project.shots
    const alt = `${project.name} — screenshot`

    test(`E5 — ${project.name} : une seule capture est exposée, celle qui est affichée, à chaque position du carrousel`, async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, project.section, 0.8)
      const section = sectionLocator(page, project.section)
      const exposed = section.getByRole('img', { name: alt, exact: true })
      const all = section.locator(`img[alt="${alt}"]`)
      const next = section.getByRole('button', { name: 'next screenshot', exact: true })
      const prev = section.getByRole('button', { name: 'previous screenshot', exact: true })
      await expect(all).toHaveCount(n)

      /** `src` de la capture à opacité 1 : la seule affichée. */
      const shownSrc = async () => {
        const entries = await all.evaluateAll((els) =>
          els.map((el) => ({
            src: el.getAttribute('src'),
            opacity: (window as unknown as { __probe: { opacity: (e: Element) => number } }).__probe.opacity(el),
          })),
        )
        const visible = entries.filter((e) => e.opacity >= 0.99)
        return entries.filter((e) => e.opacity > 0.01).length === 1 && visible.length === 1 ? visible[0]!.src : null
      }

      /** Une fois le compteur passé à `index + 1` : la seule capture à opacité 1 est la n° `index`, et c'est la seule exposée. */
      const expectExposedIsShown = async (index: number, message: string) => {
        await expect(section.getByText(`${index + 1} / ${n}`, { exact: true }), `${message} : compteur`).toBeVisible()
        const expectedSrc = await all.nth(index).getAttribute('src')
        await expect.poll(shownSrc, { message: `${message} : la capture ${index + 1} est la seule à opacité 1` }).toBe(expectedSrc)
        await expect(exposed, `${message} : captures exposées à l’arbre d’accessibilité`).toHaveCount(1)
        expect(await exposed.getAttribute('src'), `${message} : la capture exposée est celle qui est affichée`).toBe(expectedSrc)
      }

      await expectExposedIsShown(0, 'état initial')
      for (let step = 1; step <= n; step++) {
        await next.click()
        await expectExposedIsShown(step % n, `après ${step} clic(s) sur next`)
      }
      await prev.click()
      await expectExposedIsShown(n - 1, 'après previous')
      await prev.click()
      await expectExposedIsShown((n - 2 + n) % n, 'après un second previous')
    })

    test(`E5 — ${project.name} : le compteur « i / n » est un texte exposé, hors de tout aria-hidden, et suit la position`, async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, project.section, 0.8)
      const section = sectionLocator(page, project.section)
      const next = section.getByRole('button', { name: 'next screenshot', exact: true })
      for (let i = 1; i <= n; i++) {
        const counter = section.getByText(`${i} / ${n}`, { exact: true })
        await expect(counter, `compteur ${i} / ${n}`).toHaveCount(1)
        expect(await counter.evaluate((el) => el.closest('[aria-hidden="true"]') === null), `compteur ${i} / ${n} hors d’un aria-hidden`).toBe(true)
        await next.click()
      }
    })
  }
})

// ---------------------------------------------------------------------------
// E6 — liens du rail sans soulignement
// ---------------------------------------------------------------------------

test.describe('E6 — liens de navigation du rail et du bandeau', () => {
  const links = (page: Page) => page.getByRole('navigation', { name: 'sections' }).getByRole('link')
  const box = (link: Locator) =>
    link.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { border: cs.borderBottomWidth, padding: cs.paddingBottom }
    })

  test.describe('800 × 900 (rail)', () => {
    test.use({ viewport: { width: 800, height: 900 } })

    for (const [title, section, p] of [
      ['pendant le hero', 'hero', 0.1],
      ['avec Fraud Engine actif', 'fraud-engine', 0.3],
    ] as [string, SectionName, number][]) {
      test(`E6 — ${title}, aucun lien du rail n’a de marge ni de bordure basses`, async ({ page }) => {
        await openHome(page)
        await scrollToProgress(page, section, p)
        if (section === 'fraud-engine') {
          await expect(links(page).filter({ hasText: /^fraud-engine$/ })).toHaveAttribute('aria-current', 'true')
        }
        await expect(links(page)).toHaveCount(4)
        const boxes = await links(page).evaluateAll((els) =>
          els.map((el) => {
            const cs = getComputedStyle(el)
            return { name: el.textContent, border: cs.borderBottomWidth, padding: cs.paddingBottom }
          }),
        )
        expect(boxes).toEqual(boxes.map(({ name }) => ({ name, border: '0px', padding: '0px' })))
      })
    }
  })

  test.describe('1440 × 900 (bandeau)', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('E6 — dans le bandeau, le lien actif garde sa bordure de 1 px et sa marge de 2 px', async ({ page }) => {
      await openHome(page)
      await scrollToProgress(page, 'fraud-engine', 0.3)
      const active = links(page).filter({ hasText: /^fraud-engine$/ })
      await expect(active).toHaveAttribute('aria-current', 'true')
      expect(await box(active)).toEqual({ border: '1px', padding: '2px' })
    })
  })
})

// ---------------------------------------------------------------------------
// E7 — libellés qui roulent : lettres décalées de 12 ms
// ---------------------------------------------------------------------------

test.describe('E7 — lettres décalées de 12 ms (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  interface Group {
    name: string
    word: string
    inSection: boolean
    letters: { rank: number; delay: number }[]
  }

  /**
   * Défile, puis relève frame par frame les animations `roll-*` (hors `roll-hold`) pendant `durationMs` : les lettres sortantes
   * sont lues dans la même évaluation que le défilement, avant que l'ancien libellé ne soit retiré. Chaque lettre est relevée
   * une fois, à sa première apparition : son rang parmi ses sœurs et son délai (`getComputedTiming().delay`, en ms).
   */
  function scrollAndReadLetters(page: Page, top: number, section: string, durationMs = 900) {
    return page.evaluate(
      async ({ y, name, duration }) => {
        const seen = new Map<Element, { animation: string; rank: number; delay: number; inSection: boolean }>()
        const sample = () => {
          for (const animation of document.getAnimations()) {
            const animationName = (animation as CSSAnimation).animationName
            if (!/^roll-/.test(animationName) || animationName === 'roll-hold') continue
            const target = (animation.effect as KeyframeEffect | null)?.target
            if (!target || seen.has(target)) continue
            const rank = [...(target.parentElement?.children ?? [])].indexOf(target)
            // `inSection` se lit tout de suite : l'ancien libellé est retiré du document avant la fin de l'échantillonnage.
            const inSection = name !== '' && target.closest(`[data-section="${name}"]`) !== null
            seen.set(target, { animation: animationName, rank, delay: Number(animation.effect!.getComputedTiming().delay), inSection })
          }
        }
        window.scrollTo({ top: y, left: 0, behavior: 'instant' })
        const end = performance.now() + duration
        await new Promise<void>((done) => {
          const tick = () => {
            sample()
            if (performance.now() >= end) done()
            else requestAnimationFrame(tick)
          }
          tick()
        })
        const parents = new Map<Element, Group>()
        for (const [target, info] of seen) {
          const parent = target.parentElement!
          if (!parents.has(parent)) {
            parents.set(parent, {
              name: info.animation,
              word: '',
              inSection: info.inSection,
              letters: [],
            })
          }
          const group = parents.get(parent)!
          group.letters.push({ rank: info.rank, delay: info.delay })
        }
        for (const [parent, group] of parents) {
          group.letters.sort((a, b) => a.rank - b.rank)
          group.word = [...parent.children].map((c) => c.textContent).join('')
        }
        return [...parents.values()]
      },
      { y: top, name: section, duration: durationMs },
    )
  }

  const label = (group: Group) => `${group.name}:${group.word}`

  /** Chaque lettre de rang i démarre i × 12 ms après la première, à 0,5 ms près. */
  function expectShutter(group: Group) {
    const wrong = group.letters
      .filter((l, i) => l.rank !== i || Math.abs(l.delay - 12 * l.rank) > 0.5)
      .map((l) => `rang ${l.rank} : ${l.delay} ms au lieu de ${12 * l.rank} ms`)
    expect(group.letters.length, `${label(group)} : une animation par lettre`).toBe(group.word.length)
    expect.soft(wrong, `${label(group)} : délais des lettres`).toEqual([])
  }

  test('E7 — phase « idle » vers « overview » en descendant : les lettres entrantes (8) et sortantes (4) partent en volet', async ({ page }) => {
    await openHome(page)
    await nextFrames(page, 30)
    const groups = await scrollAndReadLetters(page, await progressY(page, 'overview', 0.5), '')
    expect(groups.map(label).sort()).toEqual(['roll-in:overview', 'roll-out:idle'])
    groups.forEach(expectShutter)
  })

  test('E7 — phase « overview » vers « idle » en remontant : les variantes -down partent en volet', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'overview', 0.5)
    await expect.poll(async () => (await page.evaluate(() => window.__probe.readout()))?.phase).toBe('overview')
    await nextFrames(page, 60)
    await settleAnimations(page)
    const groups = await scrollAndReadLetters(page, 0, '')
    expect(groups.map(label).sort()).toEqual(['roll-in-down:idle', 'roll-out-down:overview'])
    groups.forEach(expectShutter)
  })

  test('E7 — étape « ingest » vers « build » : la ligne `event spotime →` roule en volet, comme l’étape du pipeline', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'spotime', 0.1)
    await expect.poll(async () => (await page.evaluate(() => window.__probe.readout()))?.stage).toBe('ingest')
    await nextFrames(page, 60)
    await settleAnimations(page)
    const groups = await scrollAndReadLetters(page, await progressY(page, 'spotime', 0.58), 'spotime')

    // Deux libellés d'étape roulent : celui du pipeline et celui de la ligne du projet.
    expect(groups.map(label).sort()).toEqual(['roll-in:build', 'roll-in:build', 'roll-out:ingest', 'roll-out:ingest'])
    expect(groups.filter((g) => g.inSection).map(label).sort(), 'dans la section du projet').toEqual(['roll-in:build', 'roll-out:ingest'])
    groups.forEach(expectShutter)
  })
})
