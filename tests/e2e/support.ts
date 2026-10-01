import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import type { Page } from '@playwright/test'

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
 * Sert dist/client sous https://romain-caille.fr, sans serveur ni réseau.
 * Comme avec le `Staticfile` (`index_fallback: false`), une URL sans fichier répond 404.
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
