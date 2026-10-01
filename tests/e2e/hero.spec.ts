import { expect, test, type Locator, type Page } from '@playwright/test'

import { assertBuilt, hexToRgb, installColorProbe, ORIGIN, rgbDistance, serveBuild } from './support.ts'

const STATE_LINE = '// state: idle · 0 packet · 3 stages'
const PORTRAIT_ALT = 'Portrait of Romain Caillé'
const LEAD = 'Fullstack developer, ready for the agentic era.'

// Couleurs du design (hex), comparées en 8 bits après rendu navigateur.
const MUTED = '#8b94a1'
const STATUS = '#62d99a'

test.beforeEach(async ({ page }) => {
  assertBuilt()
  await serveBuild(page)
  await installColorProbe(page)
})

async function openHome(page: Page) {
  await page.goto(`${ORIGIN}/`)
  await page.waitForLoadState('networkidle')
}

/** `dd` de la ligne de la liste dont le libellé (`dt`) est `label`. */
const valueOf = (page: Page, label: string): Locator =>
  page
    .locator('dt')
    .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`, 'i') })
    .locator('xpath=following-sibling::dd[1]')

// ---------------------------------------------------------------------------
// CA10 — hero, 1440 × 900
// ---------------------------------------------------------------------------

test.describe('CA10 — section hero', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA10 — affiche la ligne // state: idle · 0 packet · 3 stages', async ({ page }) => {
    await openHome(page)
    await expect(page.getByText(STATE_LINE, { exact: true })).toBeVisible()
  })

  test('CA10 — le portrait est en niveaux de gris, avec le texte alternatif attendu', async ({ page }) => {
    await openHome(page)
    const portrait = page.locator(`img[alt="${PORTRAIT_ALT}"]`)
    await expect(portrait).toBeVisible()

    const pixels = await portrait.evaluate(async (img: HTMLImageElement) => {
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let channelGap = 0
      let min = 255
      let max = 0
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!]
        channelGap = Math.max(channelGap, Math.abs(r - g), Math.abs(g - b))
        min = Math.min(min, g)
        max = Math.max(max, g)
      }
      return { width: canvas.width, height: canvas.height, channelGap, spread: max - min }
    })

    expect(pixels.width).toBeGreaterThan(0)
    expect(pixels.height).toBeGreaterThan(0)
    // R = G = B, à l'arrondi du codec près.
    expect(pixels.channelGap).toBeLessThanOrEqual(2)
    // Une vraie image, pas un aplat.
    expect(pixels.spread).toBeGreaterThan(20)
  })

  test('CA10 — le h1 « Romain CAILLE » grise « CAILLE »', async ({ page }) => {
    await openHome(page)
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText('Romain CAILLE')

    const colors = await h1.evaluate((el) => {
      const rgb = (window as unknown as { __rgb: (c: string) => number[] }).__rgb
      const surname = [...el.querySelectorAll('*')].find((child) => child.textContent?.trim() === 'CAILLE')
      return {
        title: rgb(getComputedStyle(el).color),
        surname: surname ? rgb(getComputedStyle(surname).color) : null,
      }
    })

    expect(colors.surname, 'CAILLE doit être dans un élément dédié').not.toBeNull()
    expect(rgbDistance(colors.surname!, hexToRgb(MUTED))).toBeLessThanOrEqual(1)
    expect(rgbDistance(colors.title, hexToRgb(MUTED)), 'le reste du titre n’est pas atténué').toBeGreaterThan(10)
  })

  test('CA10 — affiche l’accroche', async ({ page }) => {
    await openHome(page)
    await expect(page.getByText(LEAD, { exact: true })).toBeVisible()
  })

  test('CA10 — la liste porte les libellés status, contract, location, experience, education, english, resume', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('dl dt')).toHaveText(
      ['status', 'contract', 'location', 'experience', 'education', 'english', 'resume'].map((label) => new RegExp(`^\\s*${label}\\s*$`, 'i')),
    )
  })

  test('CA10 — la liste porte les textes du design', async ({ page }) => {
    await openHome(page)
    await expect(valueOf(page, 'status')).toHaveText('Open to work · available now')
    await expect(valueOf(page, 'contract')).toHaveText('Full-time / freelance')
    await expect(valueOf(page, 'location')).toHaveText('Remote or relocation · from Nantes, France')
    await expect(valueOf(page, 'experience')).toContainText('Spotime · 2025–now')
    await expect(valueOf(page, 'experience')).toContainText('Enedis, fullstack apprentice · 2023–2025')
    await expect(valueOf(page, 'experience')).toContainText('U Tech, fullstack apprentice · 2022–2023')
    await expect(valueOf(page, 'education')).toHaveText("Master's, IT & Information Systems · EPSI")
    await expect(valueOf(page, 'english')).toHaveText('C1')
  })

  test('CA10 — « Open to work · available now » est en accent statut, précédé d’une pastille ronde', async ({ page }) => {
    await openHome(page)
    const status = valueOf(page, 'status')
    await expect(status).toBeVisible()

    const found = await status.evaluate((dd, target) => {
      const rgb = (window as unknown as { __rgb: (c: string) => number[] }).__rgb
      const near = (a: number[], b: number[]) => Math.max(...a.map((v, i) => Math.abs(v - b[i]!))) <= 2

      const walker = document.createTreeWalker(dd, NodeFilter.SHOW_TEXT)
      let textNode: Text | null = null
      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.includes('Open to work')) textNode = walker.currentNode as Text
      }
      const range = document.createRange()
      if (textNode) range.selectNodeContents(textNode)

      const dot = [...dd.querySelectorAll('*')].find((el) => {
        const box = el.getBoundingClientRect()
        return box.width > 0 && box.width <= 16 && Math.abs(box.width - box.height) < 1 && near(rgb(getComputedStyle(el).backgroundColor), target)
      })
      const dotBox = dot?.getBoundingClientRect()
      const radius = dot ? getComputedStyle(dot).borderTopLeftRadius : ''
      return {
        textColor: textNode ? rgb(getComputedStyle(textNode.parentElement!).color) : null,
        textLeft: range.getBoundingClientRect().left,
        dotRight: dotBox?.right ?? null,
        dotWidth: dotBox?.width ?? null,
        dotRadius: radius,
      }
    }, hexToRgb(STATUS))

    expect(found.textColor, 'texte du statut introuvable').not.toBeNull()
    expect(rgbDistance(found.textColor!, hexToRgb(STATUS))).toBeLessThanOrEqual(1)
    expect(found.dotRight, 'aucune pastille de la couleur du statut dans la ligne status').not.toBeNull()
    expect(found.dotRight!, 'la pastille précède le texte').toBeLessThanOrEqual(found.textLeft + 0.5)
    const radius = Number.parseFloat(found.dotRadius)
    const round = found.dotRadius.endsWith('%') ? radius >= 50 : radius >= found.dotWidth! / 2
    expect(round, `pastille ronde (border-radius ${found.dotRadius})`).toBe(true)
  })

  test('CA10 — la ligne resume a le lien « resume.pdf » vers /cv.pdf, suivi d’une icône flèche Carbon', async ({ page }) => {
    await openHome(page)
    const link = valueOf(page, 'resume').locator('a')
    await expect(link).toHaveCount(1)
    await expect(link).toHaveText('resume.pdf')
    await expect(link).toHaveAttribute('href', '/cv.pdf')

    const icon = link.locator('svg')
    await expect(icon).toHaveCount(1)
    // Les icônes Carbon sont dessinées sur une grille de 32 × 32.
    await expect(icon).toHaveAttribute('viewBox', '0 0 32 32')

    const order = await link.evaluate((a) => {
      const svg = a.querySelector('svg')!
      const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.includes('resume.pdf')) range.selectNodeContents(walker.currentNode)
      }
      return { textRight: range.getBoundingClientRect().right, iconLeft: svg.getBoundingClientRect().left }
    })
    expect(order.iconLeft, 'l’icône suit le texte').toBeGreaterThanOrEqual(order.textRight - 0.5)
  })

  test('CA10 — aucune animation', async ({ page }) => {
    await openHome(page)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// CA11 — 320 × 568
// ---------------------------------------------------------------------------

test.describe('CA11 — fenêtre de 320 px', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('CA11 — aucun défilement horizontal', async ({ page }) => {
    await openHome(page)
    const widths = await page.evaluate(() => ({
      root: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }))
    expect(widths.root).toBeLessThanOrEqual(320)
    expect(widths.body).toBeLessThanOrEqual(320)
  })

  test('CA11 — aucun élément du hero n’est coupé ni ne déborde sur les côtés', async ({ page }) => {
    await openHome(page)

    const targets: [string, Locator][] = [
      ['ligne // state', page.getByText(STATE_LINE, { exact: true })],
      ['portrait', page.locator(`img[alt="${PORTRAIT_ALT}"]`)],
      ['h1', page.locator('h1')],
      ['accroche', page.getByText(LEAD, { exact: true })],
      ['lien resume.pdf', page.getByRole('link', { name: /resume\.pdf/ })],
    ]
    for (const [kind, selector] of [
      ['dt', 'dl dt'],
      ['dd', 'dl dd'],
    ] as const) {
      const all = await page.locator(selector).all()
      expect(all.length, `aucun ${kind} dans la liste`).toBeGreaterThan(0)
      all.forEach((locator, i) => targets.push([`${kind} #${i + 1}`, locator]))
    }

    const problems: string[] = []
    for (const [name, locator] of targets) {
      await expect(locator, `${name} introuvable`).toHaveCount(1)
      const box = await locator.evaluate((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const rect = el instanceof HTMLImageElement ? el.getBoundingClientRect() : range.getBoundingClientRect()
        return { left: rect.left, right: rect.right, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
      })
      if (box.left < -0.5 || box.right > 320.5) problems.push(`${name} : boîte de ${box.left.toFixed(1)} à ${box.right.toFixed(1)} px`)
      if (box.scrollWidth > box.clientWidth) problems.push(`${name} : scrollWidth ${box.scrollWidth} > clientWidth ${box.clientWidth}`)
    }

    // La pastille déborde vers la gauche de sa ligne : elle doit rester dans la fenêtre.
    const dotBoxes = await valueOf(page, 'status').evaluate((dd) =>
      [...dd.querySelectorAll('*')].map((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right }
      }),
    )
    for (const box of dotBoxes) {
      if (box.left < -0.5 || box.right > 320.5) problems.push(`élément de la ligne status : de ${box.left.toFixed(1)} à ${box.right.toFixed(1)} px`)
    }

    expect(problems).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// CA20 — pas de favicon, pas d'erreur console
// ---------------------------------------------------------------------------

test.describe('CA20 — chargement de /', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CA20 — aucune requête /favicon.ico, aucune erreur console, aucune ressource en échec', async ({ page }) => {
    const requested: string[] = []
    const consoleErrors: string[] = []
    const failed: string[] = []
    page.on('request', (request) => requested.push(request.url()))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(String(error)))
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
    })
    page.on('requestfailed', (request) => failed.push(`échec ${request.url()}`))

    await openHome(page)

    expect(requested.filter((url) => url.endsWith('/favicon.ico'))).toEqual([])
    expect(consoleErrors).toEqual([])
    expect(failed).toEqual([])
  })

  test('CA20 — l’absence de favicon est déclarée par <link rel="icon" href="data:,">', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute('href', 'data:,')
  })
})
