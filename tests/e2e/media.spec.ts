import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'

import { expect, test } from '@playwright/test'

import { DESIGN_PROJECTS, type SectionName } from '../design.ts'
import { assertBuilt, DIST, openHome, sectionLocator } from './support.ts'

// Ces tests visent le serveur de production lancé par Playwright (`pnpm start`) et les fichiers de dist/client.

const VIDEO_PATH = '/media/fraud-engine.mp4'

// Un contrôle absent fait échouer le test sur une assertion rapide, pas sur le délai du test.
test.use({ actionTimeout: 5_000 })

test.beforeEach(() => {
  assertBuilt()
})

function videoFile() {
  const file = join(DIST, VIDEO_PATH)
  expect(existsSync(file), `${file} est manquant : la vidéo doit être copiée dans le build`).toBe(true)
  return { file, size: statSync(file).size }
}

function readBytes(file: string, start: number, length: number) {
  const fd = openSync(file, 'r')
  try {
    const buffer = Buffer.alloc(length)
    readSync(fd, buffer, 0, length, start)
    return buffer
  } finally {
    closeSync(fd)
  }
}

// ---------------------------------------------------------------------------
// CA32 — requêtes Range sur la vidéo
// ---------------------------------------------------------------------------

test.describe('CA32 — requêtes Range', () => {
  test('CA32 — Range: bytes=0-1023 répond 206 avec la plage demandée', async ({ request }) => {
    const { file, size } = videoFile()
    const response = await request.get(VIDEO_PATH, { headers: { Range: 'bytes=0-1023' } })
    expect(response.status()).toBe(206)
    expect(response.headers()['content-range']).toBe(`bytes 0-1023/${size}`)
    expect(response.headers()['content-type']).toBe('video/mp4')
    const body = await response.body()
    expect(body.length).toBe(1024)
    expect(body.equals(readBytes(file, 0, 1024))).toBe(true)
  })

  test('CA32 — Range: bytes=-1024 répond avec les 1 024 derniers octets', async ({ request }) => {
    const { file, size } = videoFile()
    const response = await request.get(VIDEO_PATH, { headers: { Range: 'bytes=-1024' } })
    expect(response.status()).toBe(206)
    expect(response.headers()['content-range']).toBe(`bytes ${size - 1024}-${size - 1}/${size}`)
    const body = await response.body()
    expect(body.length).toBe(1024)
    expect(body.equals(readBytes(file, size - 1024, 1024))).toBe(true)
  })

  test('CA32 — une plage au milieu du fichier est servie telle quelle', async ({ request }) => {
    const { file, size } = videoFile()
    const start = Math.floor(size / 2)
    const response = await request.get(VIDEO_PATH, { headers: { Range: `bytes=${start}-${start + 4095}` } })
    expect(response.status()).toBe(206)
    expect(response.headers()['content-range']).toBe(`bytes ${start}-${start + 4095}/${size}`)
    expect((await response.body()).equals(readBytes(file, start, 4096))).toBe(true)
  })

  test('CA32 — le serveur annonce Accept-Ranges: bytes', async ({ request }) => {
    videoFile()
    const response = await request.get(VIDEO_PATH, { headers: { Range: 'bytes=0-0' } })
    expect(response.headers()['accept-ranges']).toBe('bytes')
  })
})

// ---------------------------------------------------------------------------
// CA33 — captures et poster en WebP
// ---------------------------------------------------------------------------

/** Signature d'un fichier WebP : `RIFF`, taille sur 4 octets, `WEBP`. */
function isWebp(file: string) {
  const head = readBytes(file, 0, 12)
  return head.toString('latin1', 0, 4) === 'RIFF' && head.toString('latin1', 8, 12) === 'WEBP'
}

test.describe('CA33 — médias en WebP', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA33 — chaque capture de projet et le poster pointent vers un fichier WebP du build', async ({ page }) => {
    await openHome(page)

    const sources: string[] = []
    for (const project of DESIGN_PROJECTS) {
      const images = sectionLocator(page, project.slug as SectionName).locator('img')
      const urls = await images.evaluateAll((els) => els.map((el) => el.getAttribute('src') ?? ''))
      if (project.shots > 0) {
        expect(urls.length, `captures de ${project.name}`).toBe(project.shots)
      } else {
        const poster = urls.filter((url) => /poster/.test(url))
        expect(poster.length, `poster de ${project.name}`).toBe(1)
        expect(urls, `images de ${project.name}`).toEqual(poster)
      }
      sources.push(...urls)
    }

    expect(sources.length).toBe(DESIGN_PROJECTS.reduce((sum, p) => sum + (p.shots || 1), 0))
    for (const src of sources) {
      expect(src, 'src absolu depuis la racine du site').toMatch(/^\/[^?#]+\.webp$/)
      const file = resolve(DIST, `.${src}`)
      expect(file.startsWith(DIST + sep), src).toBe(true)
      expect(existsSync(file), `${src} est absent de dist/client`).toBe(true)
      expect(isWebp(file), `${src} n’est pas un fichier WebP (signature RIFF…WEBP)`).toBe(true)
    }
  })

  test('CA33 — le poster est servi en image/webp et les noms du plan sont respectés', async ({ request }) => {
    for (const name of ['spotime-1', 'spotime-2', 'event-hub-1', 'event-hub-2', 'event-hub-3', 'event-hub-4', 'event-hub-5', 'fraud-engine-poster']) {
      const response = await request.get(`/media/${name}.webp`)
      expect(response.status(), name).toBe(200)
      expect(response.headers()['content-type'], name).toBe('image/webp')
      expect(readFileSync(join(DIST, 'media', `${name}.webp`)).toString('latin1', 8, 12), name).toBe('WEBP')
    }
  })
})
