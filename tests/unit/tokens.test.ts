import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const root = new URL('../../', import.meta.url)
const componentsPath = new URL('components.json', root)
const stylesPath = new URL('src/styles.css', root)

// ---------------------------------------------------------------------------
// Lecture de styles.css
// ---------------------------------------------------------------------------

function readStyles(): string {
  assert.ok(existsSync(stylesPath), 'src/styles.css est manquant')
  // Les commentaires sont retirés pour ne pas matcher une valeur citée en note.
  return readFileSync(stylesPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Contenu du premier bloc `{ … }` qui suit `opener` (accolades équilibrées). */
function blockAfter(css: string, opener: RegExp): string {
  const match = opener.exec(css)
  assert.ok(match, `bloc introuvable dans src/styles.css : ${opener}`)
  let depth = 0
  const start = css.indexOf('{', match.index)
  for (let i = start; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(start + 1, i)
  }
  throw new Error(`bloc non refermé dans src/styles.css : ${opener}`)
}

interface Oklch {
  l: number
  c: number
  h: number
  alpha: number
}

/** Valeur oklch de `--name` dans `:root`, ou null si la variable n'est pas déclarée en oklch. */
function oklchToken(name: string): Oklch | null {
  const rootBlock = blockAfter(readStyles(), /:root\s*\{/)
  const re = new RegExp(
    `(?:^|[\\s;{])--${name}\\s*:\\s*oklch\\(\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*/\\s*([\\d.]+))?\\s*\\)`,
  )
  const m = re.exec(rootBlock)
  if (!m) return null
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]), alpha: m[4] === undefined ? 1 : Number(m[4]) }
}

function requireToken(name: string): Oklch {
  const token = oklchToken(name)
  assert.ok(token, `--${name} n'est pas déclaré en oklch(L C h) dans le bloc :root de src/styles.css`)
  return token
}

// ---------------------------------------------------------------------------
// Conversions couleur (matrices OKLab de Björn Ottosson, sans dépendance)
// ---------------------------------------------------------------------------

function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

function encodeSrgb8(linear: number): number {
  const x = clamp01(linear)
  const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  return Math.round(encoded * 255)
}

function oklchToHex(token: Oklch): string {
  return (
    '#' +
    oklchToLinearSrgb(token)
      .map((v) => encodeSrgb8(v).toString(16).padStart(2, '0'))
      .join('')
  )
}

function relativeLuminance(token: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(token).map(clamp01)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: Oklch, b: Oklch): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// ---------------------------------------------------------------------------
// CA7
// ---------------------------------------------------------------------------

describe('CA7 — components.json', () => {
  it('CA7 — le style shadcn déclaré est Lyra (radix-lyra)', () => {
    assert.ok(existsSync(componentsPath), 'components.json est manquant')
    const components = JSON.parse(readFileSync(componentsPath, 'utf8')) as { style?: string }
    assert.equal(components.style, 'radix-lyra')
  })
})

// ---------------------------------------------------------------------------
// CA8
// ---------------------------------------------------------------------------

/** Variable → hex du design (« Contraintes > Tokens du design ») telle que nommée dans le plan. */
const designHex: Record<string, string> = {
  background: '#121417',
  card: '#1a1d22',
  popover: '#1a1d22',
  secondary: '#1a1d22',
  muted: '#1a1d22',
  accent: '#1a1d22',
  'surface-deep': '#0d0f12',
  border: '#2a2f37',
  input: '#2a2f37',
  foreground: '#e6e8eb',
  'card-foreground': '#e6e8eb',
  'popover-foreground': '#e6e8eb',
  'secondary-foreground': '#e6e8eb',
  'accent-foreground': '#e6e8eb',
  primary: '#e6e8eb',
  'foreground-strong': '#ffffff',
  'foreground-secondary': '#b8c0cc',
  'muted-foreground': '#8b94a1',
  ring: '#8b94a1',
  status: '#62d99a',
  'fraud-engine': '#f0a35a',
  'event-hub': '#b78cf5',
}

describe('CA8 — tokens du design dans src/styles.css', () => {
  for (const [name, hex] of Object.entries(designHex)) {
    it(`CA8 — --${name} est déclaré en oklch() et redonne ${hex} en 8 bits`, () => {
      assert.equal(oklchToHex(requireToken(name)), hex)
    })
  }

  it('CA8 — --spotime vaut oklch(0.72 0.07 210.53)', () => {
    const t = requireToken('spotime')
    assert.deepEqual([t.l, t.c, t.h, t.alpha], [0.72, 0.07, 210.53, 1])
  })

  it('CA8 — --screenshot vaut oklch(0.985 0.001 0)', () => {
    const t = requireToken('screenshot')
    assert.deepEqual([t.l, t.c, t.h, t.alpha], [0.985, 0.001, 0, 1])
  })

  it('CA8 — --foreground-faint (texte discret) est déclaré en oklch()', () => {
    requireToken('foreground-faint')
  })

  for (const [name, alpha] of [
    ['veil-92', 0.92],
    ['veil-70', 0.7],
    ['veil-50', 0.5],
  ] as const) {
    it(`CA8 — --${name} est le fond de page à ${alpha * 100} % d'opacité`, () => {
      const veil = requireToken(name)
      const bg = requireToken('background')
      assert.equal(veil.alpha, alpha)
      for (const k of ['l', 'c', 'h'] as const) {
        assert.ok(Math.abs(veil[k] - bg[k]) < 1e-9, `--${name}.${k} (${veil[k]}) diffère de --background (${bg[k]})`)
      }
    })
  }

  it('CA8 — --primary-foreground reprend le fond de page', () => {
    const css = readStyles()
    const rootBlock = blockAfter(css, /:root\s*\{/)
    const viaVar = /--primary-foreground\s*:\s*var\(--background\)/.test(rootBlock)
    const viaValue = oklchToken('primary-foreground')
    const bg = requireToken('background')
    assert.ok(
      viaVar || (viaValue && oklchToHex(viaValue) === oklchToHex(bg)),
      '--primary-foreground doit valoir var(--background) ou la même couleur',
    )
  })

  const themed = [...Object.keys(designHex), 'foreground-faint', 'spotime', 'screenshot', 'veil-92', 'veil-70', 'veil-50']
  for (const name of themed) {
    it(`CA8 — le thème shadcn consomme --${name} via --color-${name} dans @theme inline`, () => {
      const theme = blockAfter(readStyles(), /@theme\s+inline\s*\{/)
      assert.match(theme, new RegExp(`--color-${name}\\s*:\\s*var\\(--${name}\\)`))
    })
  }
})

// ---------------------------------------------------------------------------
// CA9
// ---------------------------------------------------------------------------

describe('CA9 — contraste du texte discret', () => {
  for (const [label, surface] of [
    ['le fond de page (#121417)', 'background'],
    ['la surface profonde (#0d0f12)', 'surface-deep'],
  ] as const) {
    it(`CA9 — --foreground-faint a un contraste d'au moins 4,5:1 sur ${label}`, () => {
      const ratio = contrastRatio(requireToken('foreground-faint'), requireToken(surface))
      assert.ok(ratio >= 4.5, `contraste mesuré ${ratio.toFixed(3)}:1, attendu >= 4.5:1`)
    })
  }
})
