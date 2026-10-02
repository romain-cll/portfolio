import { expect, test, type Locator, type Page } from '@playwright/test'

import { VIDEO_CAPTION, designClock } from '../design.ts'
import {
  assertBuilt,
  nextFrames,
  normalize,
  openHome,
  opacityOf,
  rectOf,
  scrollToProgress,
  scrollToY,
  sectionLocator,
  settleAnimations,
} from './support.ts'

// CA21 et CA22 — lecteur vidéo de la carte Fraud Engine.
// Le navigateur de Playwright lit le H.264 (canPlayType + lecture vérifiés avant d'écrire ces tests) : la vidéo livrée
// (public/media/fraud-engine.mp4) est servie telle quelle par le serveur de production, requêtes Range comprises.

const VIDEO_URL = /\/media\/fraud-engine\.mp4(\?.*)?$/

test.use({ viewport: { width: 1440, height: 900 } })

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

const section = (page: Page) => sectionLocator(page, 'fraud-engine')
const video = (page: Page) => section(page).locator('video')
const poster = (page: Page) => section(page).locator('img[src$="fraud-engine-poster.webp"]')
const playPause = (page: Page) => section(page).getByRole('button', { name: 'play / pause', exact: true })
const fullscreen = (page: Page) => section(page).getByRole('button', { name: 'fullscreen', exact: true })
const seek = (page: Page) => section(page).getByRole('slider', { name: 'seek', exact: true })
const timeLabel = (page: Page) => section(page).getByText(/^\d+:\d{2} \/ \d+:\d{2}$/)

/** Requêtes vers la vidéo, relevées dès l'ouverture de la page. */
function watchVideoRequests(page: Page) {
  const requests: { url: string; range: string | undefined }[] = []
  page.on('request', (request) => {
    if (VIDEO_URL.test(request.url())) requests.push({ url: request.url(), range: request.headers().range })
  })
  return requests
}

const state = (page: Page) =>
  video(page).evaluate((el: HTMLVideoElement) => ({
    paused: el.paused,
    currentTime: el.currentTime,
    duration: el.duration,
    src: el.currentSrc || el.getAttribute('src') || '',
    readyState: el.readyState,
    muted: el.muted,
    loop: el.loop,
    controls: el.controls,
  }))

const isPlaying = async (page: Page) => {
  const s = await state(page)
  return !s.paused && s.currentTime > 0.3
}

/** Part du lecteur située dans la fenêtre (comme le calcule IntersectionObserver). */
const visibleFraction = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const visible = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0))
    return visible / r.height
  })

/**
 * Défile pour qu'une part `fraction` du lecteur soit à l'écran. La carte n'est pas encore fixée à ce stade :
 * le lecteur monte d'autant que la page défile, depuis sa position à scrollY = 0.
 */
async function scrollToFraction(page: Page, fraction: number) {
  await scrollToY(page, 0)
  // La carte revient à son état initial par une transition (échelle, montée) : on la mesure au repos.
  await settleAnimations(page)
  const box = await rectOf(video(page))
  const y = Math.round(box.top - (900 - fraction * box.height))
  await scrollToY(page, y)
  await settleAnimations(page)
  const actual = await visibleFraction(video(page))
  expect(Math.abs(actual - fraction), `part visible du lecteur : ${actual.toFixed(2)} pour ${fraction}`).toBeLessThan(0.05)
}

async function waitForMetadata(page: Page) {
  await expect
    .poll(async () => {
      const s = await state(page)
      return Number.isFinite(s.duration) && s.duration > 10
    }, { message: 'métadonnées de la vidéo chargées' })
    .toBe(true)
  return (await state(page)).duration
}

// ---------------------------------------------------------------------------
// CA21 — chargement différé, lecture, pause
// ---------------------------------------------------------------------------

test.describe('CA21 — chargement et lecture automatiques', () => {
  test('CA21 — hors de l’écran, le poster est dans la page et aucune requête ne part vers la vidéo', async ({ page }) => {
    const requests = watchVideoRequests(page)
    await openHome(page)
    await expect(video(page)).toHaveCount(1)
    await expect(poster(page)).toHaveCount(1)
    expect((await state(page)).src, 'la vidéo n’a pas de source avant d’arriver à l’écran').toBe('')
    expect(await video(page).getAttribute('preload')).toBe('none')

    await nextFrames(page, 60)
    expect(requests, 'aucune requête vers la vidéo au chargement').toEqual([])
  })

  test('CA21 — en dessous de 35 % de visibilité, aucun octet de la vidéo n’est demandé', async ({ page }) => {
    const requests = watchVideoRequests(page)
    await openHome(page)
    for (const fraction of [0.1, 0.2, 0.3]) {
      await scrollToFraction(page, fraction)
      await nextFrames(page, 40)
      expect(requests, `${Math.round(fraction * 100)} % visible`).toEqual([])
      expect((await state(page)).src).toBe('')
    }
    await expect.poll(async () => (await poster(page).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)), { message: 'le poster est chargé quand la carte approche' }).toBe(true)
  })

  test('CA21 — à partir de 35 % visible, la vidéo se charge, se lit en boucle et sans le son', async ({ page }) => {
    const requests = watchVideoRequests(page)
    await openHome(page)
    await scrollToFraction(page, 0.6)

    await expect.poll(() => requests.length, { message: 'requête vers la vidéo' }).toBeGreaterThan(0)
    await expect.poll(() => isPlaying(page), { message: 'la vidéo se lit' }).toBe(true)
    const s = await state(page)
    expect(s.src).toMatch(VIDEO_URL)
    expect(s.loop, 'en boucle').toBe(true)
    expect(s.muted, 'sans le son').toBe(true)
  })

  test('CA21 — la lecture repart du début quand la vidéo atteint la fin : elle boucle', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const duration = await waitForMetadata(page)
    await expect.poll(() => isPlaying(page)).toBe(true)
    await video(page).evaluate((el: HTMLVideoElement, t) => {
      el.currentTime = t
    }, duration - 0.7)
    await expect
      .poll(async () => {
        const s = await state(page)
        return !s.paused && s.currentTime < 4
      }, { message: 'après la dernière image, la lecture reprend au début', timeout: 15_000 })
      .toBe(true)
  })

  test('CA21 — tant que la vidéo se charge, le poster reste affiché ; il disparaît une fois l’image prête', async ({ page }) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route(VIDEO_URL, async (route) => {
      await gate
      await route.continue()
    })

    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    await expect.poll(async () => (await state(page)).src, { message: 'la source est posée à l’arrivée à l’écran' }).toMatch(VIDEO_URL)

    const posterShown = async () => {
      if ((await poster(page).count()) === 0) return false
      const [opacity, box, hidden] = await Promise.all([
        opacityOf(poster(page)),
        rectOf(poster(page)),
        poster(page).evaluate((el) => getComputedStyle(el).visibility === 'hidden'),
      ])
      return opacity >= 0.99 && box.width > 100 && !hidden
    }
    await expect.poll(() => posterShown(), { message: 'poster affiché pendant le chargement' }).toBe(true)
    expect((await state(page)).readyState).toBeLessThan(2)

    release()
    await expect.poll(() => isPlaying(page), { message: 'la vidéo se lit une fois chargée' }).toBe(true)
    await expect.poll(() => posterShown(), { message: 'le poster est masqué une fois la vidéo prête' }).toBe(false)
  })

  test('CA21 — quand le lecteur sort de l’écran, la vidéo se met en pause ; elle reprend à son retour', async ({ page }) => {
    await openHome(page)
    await scrollToFraction(page, 0.6)
    await expect.poll(() => isPlaying(page)).toBe(true)

    await scrollToY(page, 0)
    await expect.poll(async () => (await state(page)).paused, { message: 'pause hors de l’écran' }).toBe(true)

    await scrollToFraction(page, 0.6)
    await expect.poll(() => isPlaying(page), { message: 'reprise au retour à l’écran' }).toBe(true)
  })

  test('CA21 — une pause de l’utilisateur est conservée quand le lecteur sort puis revient à l’écran', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    await expect.poll(() => isPlaying(page)).toBe(true)

    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)

    await scrollToY(page, 0)
    await nextFrames(page, 10)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    await nextFrames(page, 60)
    expect((await state(page)).paused, 'la vidéo ne reprend pas seule').toBe(true)

    await playPause(page).click()
    await expect.poll(() => isPlaying(page), { message: 'le bouton relance la lecture' }).toBe(true)
  })

  test('CA21 — le bouton play / pause relance la lecture après une pause de l’utilisateur', async ({ page }) => {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    await expect.poll(() => isPlaying(page)).toBe(true)
    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)
    const before = (await state(page)).currentTime
    await playPause(page).click()
    await expect.poll(async () => (await state(page)).currentTime, { message: 'la lecture avance après la reprise' }).toBeGreaterThan(before + 0.3)
  })
})

// ---------------------------------------------------------------------------
// CA22 — contrôles
// ---------------------------------------------------------------------------

/** Tracés des `path` des icônes affichées dans le bouton. */
const iconOf = (button: Locator) =>
  button.evaluate((el) => [...el.querySelectorAll('svg')].map((svg) => [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|')).join('#'))

test.describe('CA22 — contrôles du lecteur', () => {
  async function ready(page: Page) {
    await openHome(page)
    await scrollToProgress(page, 'fraud-engine', 0.8)
    const duration = await waitForMetadata(page)
    await expect.poll(() => isPlaying(page)).toBe(true)
    // Les mesures des contrôles (clics à x relatif, glissé à x absolu) supposent la carte révélée : transition finie.
    await settleAnimations(page)
    return duration
  }

  test('CA22 — la disposition : play / pause, barre de progression, temps puis plein écran, de gauche à droite', async ({ page }) => {
    await ready(page)
    const [p, s, t, f] = await Promise.all([rectOf(playPause(page)), rectOf(seek(page)), rectOf(timeLabel(page)), rectOf(fullscreen(page))])
    expect(p.right).toBeLessThanOrEqual(s.left + 1)
    expect(s.right).toBeLessThanOrEqual(t.left + 1)
    expect(t.right).toBeLessThanOrEqual(f.left + 1)
    expect(s.width, 'la barre occupe la place disponible').toBeGreaterThan(100)
    for (const button of [playPause(page), fullscreen(page)]) {
      await expect(button.locator('svg')).toHaveCount(1)
      await expect(button.locator('svg')).toHaveAttribute('viewBox', '0 0 32 32')
    }
  })

  test('CA22 — le bouton play / pause bascule la lecture et son icône', async ({ page }) => {
    await ready(page)
    const playingIcon = await iconOf(playPause(page))
    expect(playingIcon, 'une icône pendant la lecture').not.toBe('')

    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)
    await expect.poll(() => iconOf(playPause(page)), { message: 'icône de lecture une fois en pause' }).not.toBe(playingIcon)
    const pausedIcon = await iconOf(playPause(page))
    const frozen = (await state(page)).currentTime
    await nextFrames(page, 30)
    expect((await state(page)).currentTime, 'la lecture est arrêtée').toBeCloseTo(frozen, 1)

    await playPause(page).click()
    await expect.poll(() => isPlaying(page)).toBe(true)
    await expect.poll(() => iconOf(playPause(page))).toBe(playingIcon)
    expect(pausedIcon).not.toBe(playingIcon)
  })

  test('CA22 — un clic au milieu de la barre de progression déplace la lecture à la moitié de la vidéo', async ({ page }) => {
    const duration = await ready(page)
    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)

    const box = await rectOf(seek(page))
    await seek(page).click({ position: { x: box.width * 0.5, y: box.height / 2 } })
    await expect
      .poll(async () => Math.abs((await state(page)).currentTime - duration * 0.5) / duration, { message: 'currentTime à 50 % de la durée' })
      .toBeLessThan(0.04)

    await seek(page).click({ position: { x: box.width * 0.25, y: box.height / 2 } })
    await expect
      .poll(async () => Math.abs((await state(page)).currentTime - duration * 0.25) / duration, { message: 'currentTime à 25 % de la durée' })
      .toBeLessThan(0.04)
  })

  test('CA22 — un glissé sur la barre de progression déplace la lecture à la position pointée', async ({ page }) => {
    const duration = await ready(page)
    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)

    const box = await rectOf(seek(page))
    const y = box.top + box.height / 2
    await page.mouse.move(box.left + box.width * 0.2, y)
    await page.mouse.down()
    await page.mouse.move(box.left + box.width * 0.45, y, { steps: 8 })
    await page.mouse.move(box.left + box.width * 0.75, y, { steps: 8 })
    await page.mouse.up()
    await expect
      .poll(async () => Math.abs((await state(page)).currentTime - duration * 0.75) / duration, { message: 'currentTime à 75 % de la durée après le glissé' })
      .toBeLessThan(0.04)
  })

  test('CA22 — le temps « m:ss / m:ss » suit la lecture', async ({ page }) => {
    const duration = await ready(page)
    await expect(timeLabel(page)).toHaveText(new RegExp(`/ ${designClock(duration)}$`))
    const seconds = async () => {
      const text = (await timeLabel(page).textContent()) ?? ''
      const [m, s] = text.split('/')[0]!.trim().split(':').map(Number)
      return m! * 60 + s!
    }
    await expect.poll(seconds, { message: 'le temps écoulé avance pendant la lecture', timeout: 15_000 }).toBeGreaterThanOrEqual(2)
  })

  test('CA22 — après un déplacement, le temps affiché est celui de la position', async ({ page }) => {
    const duration = await ready(page)
    await playPause(page).click()
    await expect.poll(async () => (await state(page)).paused).toBe(true)
    const box = await rectOf(seek(page))
    await seek(page).click({ position: { x: box.width * 0.5, y: box.height / 2 } })
    await expect
      .poll(async () => {
        const [text, s] = [normalize((await timeLabel(page).textContent()) ?? ''), await state(page)]
        return text === `${designClock(s.currentTime)} / ${designClock(duration)}`
      }, { message: 'temps affiché = currentTime / durée' })
      .toBe(true)
  })

  test('CA22 — la légende « 2 generators · 1 → 3 scorers » reste affichée sur l’image, avant et pendant la lecture', async ({ page }) => {
    await ready(page)
    const caption = section(page).getByText(VIDEO_CAPTION, { exact: true })
    await expect(caption).toBeVisible()
    const [c, v] = await Promise.all([rectOf(caption), rectOf(video(page))])
    expect(c.left).toBeGreaterThanOrEqual(v.left - 1)
    expect(c.bottom).toBeLessThanOrEqual(v.bottom + 1)
    expect(c.top).toBeGreaterThanOrEqual(v.top - 1)
    await expect.poll(() => opacityOf(caption)).toBeGreaterThanOrEqual(0.99)
    await playPause(page).click()
    await expect(caption).toBeVisible()
  })

  test('CA22 — le bouton fullscreen passe la vidéo en plein écran natif, avec les contrôles du navigateur', async ({ page }) => {
    await ready(page)
    expect((await state(page)).controls, 'pas de contrôles natifs hors plein écran').toBe(false)
    await fullscreen(page).click()
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.tagName ?? null), { message: 'élément en plein écran' })
      .toBe('VIDEO')
    expect((await state(page)).controls, 'contrôles du navigateur en plein écran').toBe(true)

    await page.evaluate(() => document.exitFullscreen())
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true)
    await expect.poll(async () => (await state(page)).controls, { message: 'les contrôles natifs disparaissent à la sortie' }).toBe(false)
  })
})
