import { expect, test, type Page } from '@playwright/test'

import { DESIGN_PROJECTS, EMAIL, GITLAB_NOTE, VIDEO_CAPTION, type SectionName } from '../design.ts'
import {
  assertBuilt,
  nextFrames,
  normalize,
  openHome,
  opacityOf,
  pipelineSnapshot,
  rectOf,
  scrollToProgress,
  scrollToY,
  sectionLocator,
  terminalSnapshot,
} from './support.ts'

// CA28 (320 px de large) et CA29 (clavier seul).

const PROJECTS = DESIGN_PROJECTS.map((p) => ({ ...p, section: p.slug as SectionName }))

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

// ---------------------------------------------------------------------------
// CA28 — fenêtre de 320 px
// ---------------------------------------------------------------------------

test.describe('CA28 — fenêtre de 320 × 568', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('CA28 — en défilant toute la page : aucun défilement horizontal, aucun texte coupé ni débordant sur les côtés ou sous le rail', async ({ page }) => {
    await openHome(page)
    const rail = (await pipelineSnapshot(page))?.container
    expect(rail, 'rail du pipeline introuvable').toBeTruthy()
    const railWidth = Math.round(rail!.width)
    expect(railWidth, 'rail de 56 px sous 700 px').toBeGreaterThan(40)
    expect(railWidth).toBeLessThan(70)

    const report = await page.evaluate(
      async ({ step, railLeft }) => {
        const problems: string[] = []
        const frames = (n: number) =>
          new Promise<void>((done) => {
            const tick = (left: number) => (left <= 0 ? done() : requestAnimationFrame(() => tick(left - 1)))
            tick(n)
          })
        const max = document.documentElement.scrollHeight - window.innerHeight
        let checked = 0
        for (let y = 0; y <= max + step; y += step) {
          const at = Math.min(y, max)
          window.scrollTo({ top: at, left: 0, behavior: 'instant' })
          await frames(3)
          if (document.documentElement.scrollWidth > 320) problems.push(`scrollY ${at} : documentElement.scrollWidth ${document.documentElement.scrollWidth}`)
          if (document.body.scrollWidth > 320) problems.push(`scrollY ${at} : body.scrollWidth ${document.body.scrollWidth}`)

          const walker = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            const node = walker.currentNode as Text
            const text = node.textContent?.trim()
            const parent = node.parentElement
            if (!text || !parent || !parent.checkVisibility()) continue
            // Contenu replié d'un <details> fermé : pas de boîte.
            const closed = parent.closest('details:not([open])')
            if (closed && !parent.closest('summary')) continue
            // Troncature volontaire du design (URL de la fenêtre, avec points de suspension).
            let clipped = false
            for (let n: Element | null = parent; n && n !== document.body; n = n.parentElement) {
              const style = getComputedStyle(n)
              if (style.textOverflow === 'ellipsis' && style.overflow !== 'visible') clipped = true
            }
            if (clipped) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            const box = range.getBoundingClientRect()
            if (box.width === 0 || box.height === 0) continue
            checked++
            if (box.left < railLeft - 0.5 || box.right > 320.5) {
              problems.push(`scrollY ${at} : « ${text.slice(0, 40)} » de ${box.left.toFixed(1)} à ${box.right.toFixed(1)} px`)
            }
          }
        }
        return { problems, checked }
      },
      { step: 280, railLeft: railWidth },
    )
    expect(report.checked, 'des textes ont été mesurés').toBeGreaterThan(200)
    expect(report.problems.slice(0, 15)).toEqual([])
  })

  test('CA28 — <main> laisse la place du rail : le contenu commence à droite de ses 56 px', async ({ page }) => {
    await openHome(page)
    const rail = (await pipelineSnapshot(page))!.container
    const contentLeft = await page.locator('main').evaluate((main) => {
      const style = getComputedStyle(main)
      return main.getBoundingClientRect().left + Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.borderLeftWidth)
    })
    expect(contentLeft).toBeGreaterThanOrEqual(rail.right - 0.5)
  })

  test('CA28 — en bas de page, la dernière ligne du contact est au-dessus du terminal', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    await nextFrames(page, 10)
    const note = sectionLocator(page, 'contact').getByText(GITLAB_NOTE, { exact: true })
    await expect(note).toBeVisible()
    const [box, t] = await Promise.all([rectOf(note), terminalSnapshot(page)])
    expect(t, 'terminal introuvable').not.toBeNull()
    expect(box.bottom, 'mention GitLab au-dessus de la barre du terminal').toBeLessThanOrEqual(t!.bar.top + 0.5)
    expect(box.top).toBeGreaterThanOrEqual(0)
  })

  test('CA28 — en bas de page, le bouton e-mail et les liens du contact restent entièrement visibles', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const t = (await terminalSnapshot(page))!
    for (const target of [
      page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true }),
      sectionLocator(page, 'contact').getByRole('link', { name: 'gitlab', exact: true }),
      sectionLocator(page, 'contact').getByRole('link', { name: 'linkedin', exact: true }),
      sectionLocator(page, 'contact').getByRole('link', { name: 'resume.pdf', exact: true }),
    ]) {
      const box = await rectOf(target)
      expect(box.left, 'à droite du rail').toBeGreaterThanOrEqual(55)
      expect(box.right).toBeLessThanOrEqual(320.5)
      expect(box.bottom).toBeLessThanOrEqual(t.bar.top + 0.5)
    }
  })

  test('CA28 — la fenêtre de déploiement de chaque projet tient entre le rail et le bord droit', async ({ page }) => {
    await openHome(page)
    for (const project of PROJECTS) {
      await scrollToProgress(page, project.section, 0.8)
      const url = sectionLocator(page, project.section).getByText(project.url, { exact: true })
      await expect(url).toBeVisible()
      const card = await url.locator("xpath=ancestor::*[contains(., 'deploy ✓')][1]").evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
      })
      expect(card.left, `${project.name} : fenêtre à droite du rail`).toBeGreaterThanOrEqual(55)
      expect(card.right, `${project.name} : fenêtre dans l’écran`).toBeLessThanOrEqual(320.5)
      expect(card.scrollWidth, `${project.name} : contenu de la fenêtre`).toBeLessThanOrEqual(card.clientWidth + 1)
    }
  })

  test('CA28 — le lecteur vidéo et ses contrôles tiennent dans la fenêtre', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const section = sectionLocator(page, 'fraud-engine')
    const controls = [
      section.getByRole('button', { name: 'play / pause', exact: true }),
      section.getByRole('slider', { name: 'seek', exact: true }),
      section.getByRole('button', { name: 'fullscreen', exact: true }),
      section.getByText(/^\d+:\d{2} \/ \d+:\d{2}$/),
      section.getByText(VIDEO_CAPTION, { exact: true }),
    ]
    for (const control of controls) {
      const box = await rectOf(control)
      expect(box.width).toBeGreaterThan(0)
      expect(box.left).toBeGreaterThanOrEqual(55)
      expect(box.right).toBeLessThanOrEqual(320.5)
    }
    const seek = await rectOf(controls[1]!)
    expect(seek.width, 'la barre de progression reste utilisable').toBeGreaterThan(40)
  })

  test('CA28 — le pipeline n’est visible qu’en rail de 56 px, le terminal commence à sa droite', async ({ page }) => {
    await openHome(page)
    const [rail, term] = await Promise.all([pipelineSnapshot(page), terminalSnapshot(page)])
    expect(term!.fixed.left).toBeGreaterThanOrEqual(rail!.container.right - 1)
    expect(rail!.container.bottom).toBeGreaterThanOrEqual(568 - 1)
  })
})

// ---------------------------------------------------------------------------
// CA29 — clavier seul
// ---------------------------------------------------------------------------

test.describe('CA29 — navigation au clavier (1440 × 900)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })

  interface Focused {
    label: string
    tag: string
    focusVisible: boolean
    indicator: boolean
    inViewport: boolean
    uncovered: boolean
    opacity: number
  }

  /** Ce qui a le focus : libellé, indicateur visible, présence à l'écran, absence de recouvrement, opacité effective. */
  const focused = (page: Page): Promise<Focused | null> =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body || el === document.documentElement) return null
      const probe = (window as unknown as { __probe: { opacity: (e: Element) => number; rgba: (c: string) => number[] } }).__probe
      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      const outline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0 && probe.rgba(style.outlineColor)[3]! > 0
      const shadow = style.boxShadow !== 'none'
      const hit = document.elementFromPoint((box.left + box.right) / 2, (box.top + box.bottom) / 2)
      return {
        label: el.getAttribute('aria-label') || (el.innerText || '').replace(/\s+/g, ' ').trim() || el.getAttribute('alt') || el.tagName,
        tag: el.tagName,
        focusVisible: el.matches(':focus-visible'),
        indicator: outline || shadow,
        inViewport: box.width > 0 && box.height > 0 && box.top >= 0 && box.bottom <= window.innerHeight && box.left >= 0 && box.right <= window.innerWidth,
        uncovered: hit === el || (hit !== null && el.contains(hit)),
        opacity: probe.opacity(el),
      }
    })

  /** Attend que le contrôle qui a le focus soit à l'écran, découvert et à opacité 1 (défilement et transitions compris). */
  async function settledFocus(page: Page, message: string) {
    let last: Focused | null = null
    await expect
      .poll(async () => {
        last = await focused(page)
        return last !== null && last.inViewport && last.uncovered && last.opacity >= 0.99
      }, { message })
      .toBe(true)
    return last as unknown as Focused
  }

  const REQUIRED: [string, number][] = [
    ['spotime', 1],
    ['fraud-engine', 1],
    ['event-hub', 1],
    ['contact', 1],
    ['open event log', 1],
    ['resume.pdf', 2],
    ['+ trade-offs & what broke', 3],
    ['previous screenshot', 2],
    ['next screenshot', 2],
    ['play / pause', 1],
    ['seek', 1],
    ['fullscreen', 1],
    ['visit spotime.fr', 1],
    ['repo', 2],
    [`copy email address ${EMAIL}`, 1],
    ['gitlab', 1],
    ['linkedin', 1],
  ]

  test('CA29 — avec Tab, chaque contrôle reçoit le focus avec un indicateur visible, à l’écran et à opacité 1', async ({ page }) => {
    test.setTimeout(120_000)
    await openHome(page)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

    const visited: Focused[] = []
    const problems: string[] = []
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press('Tab')
      const first = await focused(page)
      if (first === null) break
      const state = await settledFocus(page, `contrôle n° ${i + 1} (${first.label}) : à l'écran, découvert, à opacité 1`).catch(() => first)
      const now = (await focused(page)) ?? state
      visited.push(now)
      if (!now.focusVisible) problems.push(`${now.label} : :focus-visible faux après Tab`)
      if (!now.indicator) problems.push(`${now.label} : aucun indicateur de focus (outline ou ombre)`)
      if (!now.inViewport) problems.push(`${now.label} : hors de la fenêtre`)
      if (!now.uncovered) problems.push(`${now.label} : recouvert par le bandeau ou le terminal`)
      if (now.opacity < 0.99) problems.push(`${now.label} : opacité effective ${now.opacity.toFixed(2)}`)
      // Retour au premier contrôle : le tour est fait.
      if (visited.length > 3 && now.label === visited[0]!.label && now.tag === visited[0]!.tag) break
    }

    expect(problems).toEqual([])
    const labels = visited.map((v) => v.label)
    for (const [label, count] of REQUIRED) {
      expect(labels.filter((l) => l === label).length, `« ${label} » doit recevoir le focus ${count} fois : ${labels.join(' | ')}`).toBeGreaterThanOrEqual(count)
    }
    expect(visited.length, 'nombre de contrôles atteints').toBeGreaterThanOrEqual(REQUIRED.reduce((sum, [, n]) => sum + n, 0))
  })

  test('CA29 — un contrôle focalisé alors que sa carte n’est pas encore révélée devient visible, à opacité 1', async ({ page }) => {
    await openHome(page)
    const controls = [
      sectionLocator(page, 'spotime').getByRole('button', { name: 'next screenshot', exact: true }),
      sectionLocator(page, 'fraud-engine').getByRole('button', { name: 'play / pause', exact: true }),
      sectionLocator(page, 'event-hub').getByRole('link', { name: 'repo', exact: true }),
      sectionLocator(page, 'fraud-engine').locator('summary'),
    ]
    for (const control of controls) {
      await scrollToY(page, 0)
      await control.focus()
      const state = await settledFocus(page, 'contrôle focalisé depuis le haut de la page')
      expect(state.opacity).toBeGreaterThanOrEqual(0.99)
    }
  })

  test('CA29 — Entrée et Espace activent le lien de section (Entrée) et les boutons du carrousel, du lecteur et du terminal', async ({ page }) => {
    await openHome(page)
    // Lien de navigation : Entrée.
    await page.getByRole('navigation', { name: 'sections' }).getByRole('link', { name: 'event-hub', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#event-hub$/)

    // Carrousel de Spotime : Entrée puis Espace.
    await scrollToProgress(page, 'spotime', 0.8)
    const spotime = sectionLocator(page, 'spotime')
    const next = spotime.getByRole('button', { name: 'next screenshot', exact: true })
    await next.focus()
    await page.keyboard.press('Enter')
    await expect(spotime.getByText('2 / 2', { exact: true })).toBeVisible()
    await page.keyboard.press('Space')
    await expect(spotime.getByText('1 / 2', { exact: true })).toBeVisible()
    const prev = spotime.getByRole('button', { name: 'previous screenshot', exact: true })
    await prev.focus()
    await page.keyboard.press('Enter')
    await expect(spotime.getByText('2 / 2', { exact: true })).toBeVisible()
    await page.keyboard.press('Space')
    await expect(spotime.getByText('1 / 2', { exact: true })).toBeVisible()
  })

  test('CA29 — play / pause au clavier : Entrée puis Espace basculent la lecture', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const section = sectionLocator(page, 'fraud-engine')
    const video = section.locator('video')
    const paused = () => video.evaluate((el: HTMLVideoElement) => el.paused)
    await expect.poll(async () => !(await paused()), { message: 'lecture automatique' }).toBe(true)
    await section.getByRole('button', { name: 'play / pause', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect.poll(paused).toBe(true)
    await page.keyboard.press('Space')
    await expect.poll(paused).toBe(false)
    await page.keyboard.press('Space')
    await expect.poll(paused).toBe(true)
    await page.keyboard.press('Enter')
    await expect.poll(paused).toBe(false)
  })

  test('CA29 — la barre de progression se règle aux flèches', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const section = sectionLocator(page, 'fraud-engine')
    const video = section.locator('video')
    const time = () => video.evaluate((el: HTMLVideoElement) => el.currentTime)
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => Number.isFinite(el.duration) && el.duration > 10)).toBe(true)
    await section.getByRole('button', { name: 'play / pause', exact: true }).click()
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true)

    const seek = section.getByRole('slider', { name: 'seek', exact: true })
    await seek.focus()
    const duration = await video.evaluate((el: HTMLVideoElement) => el.duration)
    // Place la lecture au milieu, puis règle aux flèches.
    await page.keyboard.press('Home')
    await expect.poll(time).toBeLessThan(1)
    await page.keyboard.press('ArrowRight')
    await expect.poll(time, { message: 'flèche droite : la lecture avance' }).toBeGreaterThan(0.05)
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
    const forward = await time()
    expect(forward).toBeGreaterThan(0.3)
    await page.keyboard.press('ArrowLeft')
    await expect.poll(time, { message: 'flèche gauche : la lecture recule' }).toBeLessThan(forward)
    await page.keyboard.press('End')
    await expect.poll(time, { message: 'fin : la lecture est à la fin' }).toBeGreaterThan(duration - 2)
  })

  test('CA29 — le bouton e-mail se déclenche à Entrée puis à Espace', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'contact', 1)
    const copy = page.getByRole('button', { name: `copy email address ${EMAIL}`, exact: true })
    const copied = copy.getByText('copied', { exact: true })
    const shown = async () => {
      if ((await copied.count()) === 0) return false
      const [opacity, box] = await Promise.all([opacityOf(copied), rectOf(copied)])
      return opacity >= 0.99 && box.width >= 8
    }
    await copy.focus()
    await page.keyboard.press('Enter')
    await expect.poll(shown, { message: 'copied après Entrée' }).toBe(true)
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL)
    await expect.poll(shown, { message: 'copied disparaît', timeout: 6000 }).toBe(false)

    await page.evaluate(() => navigator.clipboard.writeText('autre'))
    await copy.focus()
    await page.keyboard.press('Space')
    await expect.poll(shown, { message: 'copied après Espace' }).toBe(true)
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL)
  })

  test('CA29 — le bouton plein écran se déclenche à Entrée puis à Espace', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const fullscreen = sectionLocator(page, 'fraud-engine').getByRole('button', { name: 'fullscreen', exact: true })
    for (const key of ['Enter', 'Space']) {
      await fullscreen.focus()
      await page.keyboard.press(key)
      await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName ?? null), { message: `plein écran après ${key}` }).toBe('VIDEO')
      await page.evaluate(() => document.exitFullscreen())
      await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true)
    }
  })

  test('CA29 — le libellé accessible de chaque contrôle est celui du design', async ({ page }) => {
    await openHome(page)
    for (const name of ['open event log', `copy email address ${EMAIL}`]) {
      await expect(page.getByRole('button', { name, exact: true })).toHaveCount(1)
    }
    await expect(page.getByRole('button', { name: 'next screenshot' })).toHaveCount(2)
    await expect(page.getByRole('button', { name: 'previous screenshot' })).toHaveCount(2)
    await expect(page.getByRole('slider', { name: 'seek', exact: true })).toHaveCount(1)
    expect(normalize(await sectionLocator(page, 'spotime').locator('summary').evaluate((el) => (el as HTMLElement).innerText))).toBe('+ trade-offs & what broke')
  })
})
