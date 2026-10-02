import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { expect, type Locator, type Page } from '@playwright/test'

import {
  LABEL_COLLAPSE,
  LABEL_EXPAND,
  SECTION_NAMES,
  type DesignProject,
  type SectionName,
} from '../design.ts'

/** Origine de production : le build est servi sous cette origine, comme le fait Railpack après déploiement. */
export const ORIGIN = 'https://romain-caille.fr'

/** Racine du build statique. Les specs se lancent depuis la racine du dépôt. */
export const DIST = resolve(process.cwd(), 'dist/client')

export function assertBuilt() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/client/index.html est manquant : lancer `pnpm build` avant `pnpm test:e2e`')
  }
}

/** Routes prérendues : un `index.html` par route (`/`, `/about` pour `about/index.html`, …). */
export function prerenderedRoutes(): string[] {
  assertBuilt()
  const routes: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) walk(path)
      else if (entry === 'index.html') {
        const folder = relative(DIST, dir).split(sep).join('/')
        routes.push(folder === '' ? '/' : `/${folder}`)
      }
    }
  }
  walk(DIST)
  return routes.sort()
}

/**
 * Simule la partie statique du serveur (srvx) : sert dist/client sous https://romain-caille.fr, sans serveur ni réseau.
 * Une URL sans fichier y répond 404 en texte brut ; le vrai serveur rend la page 404 de TanStack, testée dans server.spec.ts.
 */
export async function serveBuild(page: Page) {
  await page.route(
    (url) => url.origin === ORIGIN,
    async (route) => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname)
      const target = resolve(DIST, `.${pathname}`)
      const inside = target === DIST || target.startsWith(DIST + sep)
      const file =
        inside && existsSync(target)
          ? statSync(target).isDirectory()
            ? join(target, 'index.html')
            : target
          : undefined
      if (file && existsSync(file)) await route.fulfill({ path: file })
      else await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found' })
    },
  )
}

/** Installe `window.__rgb(cssColor)` : couleur CSS quelconque (oklch inclus) → [r, g, b] en 8 bits. */
export async function installColorProbe(page: Page) {
  await page.addInitScript(() => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    ;(window as unknown as Record<string, unknown>).__rgb = (css: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      return [r, g, b]
    }
  })
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Écart maximal entre deux canaux 8 bits. */
export function rgbDistance(a: number[], b: number[]): number {
  return Math.max(...a.map((v, i) => Math.abs(v - b[i]!)))
}

// ---------------------------------------------------------------------------
// Helpers de la feature « pages » : défilement, mesures de la page et sondes DOM
// ---------------------------------------------------------------------------

export type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }
export type Rgb = [number, number, number]

export interface PipelineSnapshot {
  container: Rect & { position: string }
  frames: { name: string; label: string; rect: Rect; color: Rgb; writingMode: string; edges: Rgb[] }[]
  /** Pastille de 12 px du paquet, `null` si introuvable. */
  packet: { cx: number; cy: number; opacity: number; color: Rgb } | null
  /** Segments de 1 à 2 px de haut ou de large : connecteurs entre les cadres. */
  lines: Rect[]
}

export interface TerminalSnapshot {
  n: number
  fixed: Rect & { position: string }
  bar: Rect
  /** Premier fond opaque en remontant depuis la barre. */
  bg: Rgb | null
  text: string
  leaves: { text: string; color: Rgb }[]
  animations: string[]
}

export interface PanelSnapshot {
  text: string
  rect: Rect
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

interface Probe {
  opacity: (el: Element) => number
  offset: (el: Element) => { x: number; y: number }
  a11y: (el: Element) => string
  rgba: (css: string) => [number, number, number, number]
  pipeline: () => PipelineSnapshot | null
  readout: () => { phase: string; stage: string } | null
  terminal: () => TerminalSnapshot | null
  panel: () => PanelSnapshot | null
  geometry: (name: string) => { top: number; height: number; sticky: number; vh: number } | null
}

declare global {
  interface Window {
    __probe: Probe
  }
}

/** Sondes DOM installées dans la page (`window.__probe`) : une seule source, utilisable aussi sans JavaScript. */
export const PROBE_SOURCE = `window.__probe = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const rgba = (css) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2], d[3] / 255]
  }
  const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
  const norm = (s) => s.replace(/\\s+/g, ' ').trim()
  const opacity = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o }
  const offset = (el) => {
    let x = 0, y = 0
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.translate && cs.translate !== 'none') { const [tx = '0', ty = '0'] = cs.translate.split(' '); x += parseFloat(tx) || 0; y += parseFloat(ty) || 0 }
      if (cs.transform && cs.transform !== 'none') { const m = new DOMMatrix(cs.transform); x += m.e; y += m.f }
    }
    return { x, y }
  }
  const a11y = (el) => {
    let s = ''
    for (const n of el.childNodes) {
      if (n.nodeType === 3) s += n.textContent
      else if (n.nodeType === 1) {
        if (n.getAttribute('aria-hidden') === 'true') continue
        const cs = getComputedStyle(n)
        if (cs.display === 'none' || cs.visibility === 'hidden') continue
        s += a11y(n)
      }
    }
    return s
  }
  const fixedAncestor = (el) => { for (let n = el; n && n !== document.documentElement; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return n; return null }
  const leafWithText = (test) => [...document.querySelectorAll('body *')].find((el) => el.children.length === 0 && test(norm(el.textContent || '')))
  const dedupe = (t) => { const half = t.length / 2; return Number.isInteger(half) && half > 0 && t.slice(0, half) === t.slice(half) ? t.slice(0, half) : t }

  const pipeline = () => {
    const names = ['ingest', 'build', 'deploy']
    const frames = [...document.querySelectorAll('body *')].filter((el) => {
      if (!names.includes(norm(el.textContent || '').toLowerCase())) return false
      const cs = getComputedStyle(el)
      return (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) && fixedAncestor(el) !== null
    })
    if (frames.length !== 3) return null
    const container = fixedAncestor(frames[0])
    const cr = rect(container)
    const dot = [...container.querySelectorAll('*')].find((c) => {
      const b = c.getBoundingClientRect(), cs = getComputedStyle(c)
      return Math.abs(b.width - 12) < 0.6 && Math.abs(b.height - 12) < 0.6 && (cs.borderTopLeftRadius.endsWith('%') || parseFloat(cs.borderTopLeftRadius) >= 6) && rgba(cs.backgroundColor)[3] > 0.5
    })
    const lines = [...container.querySelectorAll('*')].map(rect).filter((r) => (r.height <= 2 && r.width >= 8) || (r.width <= 2 && r.height >= 8))
    return {
      container: { ...cr, position: getComputedStyle(container).position },
      frames: frames.map((el) => ({
        name: norm(el.textContent).toLowerCase(),
        label: norm(el.innerText || ''),
        rect: rect(el),
        color: rgba(getComputedStyle(el).color).slice(0, 3),
        writingMode: getComputedStyle(el).writingMode,
        edges: [...el.querySelectorAll('*')].filter((c) => { const b = c.getBoundingClientRect(); return b.width > 0.5 && b.height > 0.5 && opacity(c) > 0.01 && rgba(getComputedStyle(c).backgroundColor)[3] > 0.5 }).map((c) => rgba(getComputedStyle(c).backgroundColor).slice(0, 3)),
      })),
      packet: dot ? { cx: dot.getBoundingClientRect().left + dot.getBoundingClientRect().width / 2, cy: dot.getBoundingClientRect().top + dot.getBoundingClientRect().height / 2, opacity: opacity(dot), color: rgba(getComputedStyle(dot).backgroundColor).slice(0, 3) } : null,
      lines,
    }
  }

  const readout = () => {
    const name = leafWithText((t) => t === 'romain@portfolio')
    if (!name || name.getClientRects().length === 0 || !fixedAncestor(name)) return null
    const rows = [...name.parentElement.children]
    const clean = (el) => dedupe((el ? a11y(el) : '').replace(/\\s+/g, '').replace(/^pipeline·/, ''))
    return { phase: clean(rows[1]), stage: clean(rows[2]) }
  }

  const terminal = () => {
    const count = leafWithText((t) => /^events\\.log · \\d+$/.test(t))
    if (!count) return null
    const fixed = fixedAncestor(count)
    let bar = count
    while (bar.parentElement && bar.parentElement !== fixed && bar.parentElement !== document.body && bar.parentElement.getBoundingClientRect().height <= 40) bar = bar.parentElement
    let bg = null
    for (let n = bar; n && !bg; n = n.parentElement) { const c = rgba(getComputedStyle(n).backgroundColor); if (c[3] > 0.5) bg = c.slice(0, 3) }
    return {
      n: Number(norm(count.textContent).split(' ').pop()),
      fixed: { ...rect(fixed), position: fixed ? getComputedStyle(fixed).position : 'static' },
      bar: rect(bar),
      bg,
      text: norm(bar.textContent || ''),
      leaves: [...bar.querySelectorAll('*')].filter((el) => el !== count && el.children.length === 0 && norm(el.textContent || '') !== '').map((el) => ({ text: norm(el.textContent), color: rgba(getComputedStyle(el).color).slice(0, 3) })),
      animations: bar.getAnimations({ subtree: true }).map((a) => a.animationName).filter(Boolean),
    }
  }

  const panel = () => {
    const header = leafWithText((t) => t === 'events.log · history · scroll the page to emit more')
    if (!header) return null
    let sc = header.parentElement
    while (sc && !['auto', 'scroll'].includes(getComputedStyle(sc).overflowY)) sc = sc.parentElement
    if (!sc) return null
    return { text: norm(sc.textContent || ''), rect: rect(sc), scrollTop: sc.scrollTop, scrollHeight: sc.scrollHeight, clientHeight: sc.clientHeight }
  }

  const geometry = (name) => {
    const el = document.querySelector('[data-section="' + name + '"]')
    if (!el) return null
    const sticky = [...el.querySelectorAll('*')].find((c) => getComputedStyle(c).position === 'sticky')
    return { top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height, sticky: sticky ? sticky.getBoundingClientRect().height : 0, vh: innerHeight }
  }

  return { opacity, offset, a11y, rgba, pipeline, readout, terminal, panel, geometry }
})()`

/** Charge une page de la feature et installe les sondes. Le serveur de prod de Playwright répond sous `baseURL`. */
export async function openHome(page: Page, path = '/') {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(PROBE_SOURCE)
  await nextFrames(page, 4)
}

/** Pages ouvertes sans JavaScript : une promesse attendue par `page.evaluate` y reste en suspens, on attend alors à l'horloge. */
const scriptless = new WeakSet<Page>()
export const markScriptless = (page: Page) => void scriptless.add(page)

/** Laisse passer `n` frames : défilement, `requestAnimationFrame` du contrôleur, rendu React. */
export async function nextFrames(page: Page, n = 3) {
  if (scriptless.has(page)) {
    await page.waitForTimeout(20 * n)
    return
  }
  await page.evaluate(
    (count) =>
      new Promise<void>((done) => {
        const step = (left: number) => (left <= 0 ? done() : requestAnimationFrame(() => step(left - 1)))
        step(count)
      }),
    n,
  )
}

export async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y)
  await nextFrames(page)
}

export const sectionLocator = (page: Page, name: SectionName): Locator => page.locator(`[data-section="${name}"]`)

export const sections = SECTION_NAMES

export async function sectionGeometry(page: Page, name: SectionName) {
  const geometry = await page.evaluate((n) => window.__probe.geometry(n), name)
  if (!geometry) throw new Error(`section [data-section="${name}"] introuvable`)
  return geometry
}

const isProject = (name: SectionName) => name === 'spotime' || name === 'fraud-engine' || name === 'event-hub'

/** Position de défilement d'une progression p : `top + p × (hauteur − hauteur fixée)` pour un projet, `top + p × (hauteur − vh)` sinon. */
export async function progressY(page: Page, name: SectionName, p: number) {
  const g = await sectionGeometry(page, name)
  const range = isProject(name) ? g.height - g.sticky : g.height - g.vh
  return Math.round(g.top + p * range)
}

export async function scrollToProgress(page: Page, name: SectionName, p: number) {
  const y = await progressY(page, name, p)
  await scrollToY(page, y)
  return y
}

/** Défile (instantanément) puis relève, frame par frame, les animations CSS en cours : nom → nombre maximal simultané. */
export function scrollAndRecordAnimations(page: Page, y: number, durationMs = 900) {
  return page.evaluate(
    async ({ top, duration }) => {
      const max: Record<string, number> = {}
      const sample = () => {
        const counts: Record<string, number> = {}
        for (const animation of document.getAnimations()) {
          const name = (animation as CSSAnimation).animationName
          if (name) counts[name] = (counts[name] ?? 0) + 1
        }
        for (const [name, count] of Object.entries(counts)) max[name] = Math.max(max[name] ?? 0, count)
      }
      window.scrollTo({ top, left: 0, behavior: 'instant' })
      const end = performance.now() + duration
      await new Promise<void>((done) => {
        const tick = () => {
          sample()
          if (performance.now() >= end) done()
          else requestAnimationFrame(tick)
        }
        tick()
      })
      return max
    },
    { top: y, duration: durationMs },
  )
}

export const pipelineSnapshot = (page: Page) => page.evaluate(() => window.__probe.pipeline())
export const readout = (page: Page) => page.evaluate(() => window.__probe.readout())
export const terminalSnapshot = (page: Page) => page.evaluate(() => window.__probe.terminal())
export const panelSnapshot = (page: Page) => page.evaluate(() => window.__probe.panel())

/** Opacité effective : produit des `opacity` de l'élément et de ses ancêtres (Playwright compte un élément à opacité nulle comme visible). */
export const opacityOf = (locator: Locator) => locator.evaluate((el) => window.__probe.opacity(el))

/** Décalage cumulé (`translate` et `transform`) de l'élément et de ses ancêtres, en px. */
export const offsetOf = (locator: Locator) => locator.evaluate((el) => window.__probe.offset(el))

/** Texte tel que le lit une technologie d'assistance : sans les sous-arbres `aria-hidden`, `display: none` ou `visibility: hidden`. */
export const a11yTextOf = (locator: Locator) => locator.evaluate((el) => window.__probe.a11y(el))

export const rectOf = (locator: Locator): Promise<Rect> =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
  })

export const colorOf = (locator: Locator, property: 'color' | 'backgroundColor' | 'borderBottomColor' | 'borderTopColor' = 'color') =>
  locator.evaluate((el, prop) => window.__probe.rgba(getComputedStyle(el)[prop]), property)

/** Couleur CSS quelconque (hex, oklch…) → [r, g, b, alpha]. */
export const cssColor = (page: Page, css: string) => page.evaluate((c) => window.__probe.rgba(c), css)

export async function cssRgb(page: Page, css: string): Promise<Rgb> {
  const [r, g, b] = await cssColor(page, css)
  return [r, g, b]
}

/** Espaces normalisés. */
export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

export const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Expression qui trouve `ts` puis `text` (espaces souples) dans un texte aux espaces normalisés : « 00:00:17 ingest ← romain.init ». */
export function logLinePattern(ts: string, text: string) {
  return new RegExp(`${escapeRegExp(ts)}\\s*${text.trim().split(/\s+/).map(escapeRegExp).join('\\s+')}`)
}

/** Écart maximal entre deux couleurs, canal par canal. */
export const colorDistance = (a: number[], b: number[]) => rgbDistance(a.slice(0, 3), b.slice(0, 3))

/** Tolérance de comparaison des couleurs du design (hex) aux tokens rendus par le navigateur. */
export const COLOR_TOLERANCE = 3

/** Texte d'un document HTML : sans script, style ni commentaire, entités décodées, espaces normalisés. */
export function htmlToText(html: string): string {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return normalize(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
      .replace(/&([a-z]+);/gi, (match, name: string) => entities[name.toLowerCase()] ?? match),
  )
}

/** Relit `read` frame après frame jusqu'à deux valeurs identiques de suite (transitions CSS comprises), puis la renvoie. */
export async function stable<T>(page: Page, read: () => Promise<T>, maxFrames = 60): Promise<T> {
  let previous = JSON.stringify(await read())
  let value = await read()
  for (let i = 0; i < maxFrames; i++) {
    const current = JSON.stringify(value)
    if (current === previous) return value
    previous = current
    await nextFrames(page, 2)
    value = await read()
  }
  return value
}

/** Enregistre `window.scrollY` à chaque frame, jusqu'à `stopScrollSampler`. */
export async function startScrollSampler(page: Page) {
  await page.evaluate(() => {
    const samples: number[] = []
    const store = window as unknown as { __scrollSamples: number[]; __scrollRaf: number }
    store.__scrollSamples = samples
    const tick = () => {
      samples.push(window.scrollY)
      store.__scrollRaf = requestAnimationFrame(tick)
    }
    tick()
  })
}

export function stopScrollSampler(page: Page) {
  return page.evaluate(() => {
    const store = window as unknown as { __scrollSamples: number[]; __scrollRaf: number }
    cancelAnimationFrame(store.__scrollRaf)
    return store.__scrollSamples
  })
}

/** Étape lue après `event <nom> →` dans le texte accessible de la ligne (espaces retirés, doublon éventuel replié). */
export function stageAfter(text: string, ev: string): string {
  const rest = text.replace(/\s+/g, '').replace(`event${ev}→`, '')
  const half = rest.length / 2
  return Number.isInteger(half) && half > 0 && rest.slice(0, half) === rest.slice(half) ? rest.slice(0, half) : rest
}

/** Étape affichée par la ligne `event <nom> →` d'un projet. */
export async function eventStage(page: Page, project: DesignProject) {
  const line = sectionLocator(page, project.slug as SectionName).getByText(`event ${project.ev} →`)
  return stageAfter(await a11yTextOf(line.locator('xpath=..')), project.ev)
}

/**
 * CA18 — dépliage « trade-offs & what broke » d'un projet : souris, Entrée et Espace.
 * Le dépliage est un `<details>` natif : il doit marcher avec et sans JavaScript.
 */
export async function expectDisclosure(page: Page, project: DesignProject) {
  const section = sectionLocator(page, project.slug as SectionName)
  const details = section.locator('details')
  const summary = details.locator('summary')
  const tradeoff = section.getByText(project.tradeoff)
  const learned = section.getByText(project.learned)

  await expect(details, project.name).toHaveCount(1)
  await expect(summary).toHaveCount(1)
  const label = async () => normalize(await summary.evaluate((el) => (el as HTMLElement).innerText))

  const expectState = async (open: boolean, how: string) => {
    await expect(details, `${project.name} : ${how}`).toHaveJSProperty('open', open)
    expect(await label(), `${project.name} : libellé après ${how}`).toBe(open ? LABEL_COLLAPSE : LABEL_EXPAND)
    if (open) {
      await expect(tradeoff, `${project.name} : trade-off après ${how}`).toBeVisible()
      await expect(learned, `${project.name} : learned après ${how}`).toBeVisible()
    } else {
      await expect(tradeoff, `${project.name} : trade-off masqué après ${how}`).toBeHidden()
      await expect(learned, `${project.name} : learned masqué après ${how}`).toBeHidden()
    }
  }

  await expectState(false, 'le chargement')
  await summary.click()
  await expectState(true, 'un clic')
  await summary.click()
  await expectState(false, 'un second clic')

  await summary.focus()
  await page.keyboard.press('Enter')
  await expectState(true, 'Entrée')
  await page.keyboard.press('Enter')
  await expectState(false, 'Entrée (fermeture)')
  await page.keyboard.press('Space')
  await expectState(true, 'Espace')
  await page.keyboard.press('Space')
  await expectState(false, 'Espace (fermeture)')
}
