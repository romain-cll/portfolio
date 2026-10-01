import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

const root = fileURLToPath(new URL('../../', import.meta.url))
const fixturesDir = join(root, 'tests/fixtures/lint')
const checkSrcPath = join(root, 'scripts/check-src.mjs')

const fixture = (name: string) => readFileSync(join(fixturesDir, name), 'utf8')

// ---------------------------------------------------------------------------
// ESLint : les fixtures sont lintées sous des chemins virtuels de src/
// ---------------------------------------------------------------------------

const GENERATED = 'src/components/ui/fixture.tsx' // dossier des composants générés par la CLI shadcn
const HAND_WRITTEN = 'src/components/fixture.tsx'

let eslint: ESLint | undefined

async function lintErrors(fixtureName: string, virtualPath: string) {
  assert.ok(existsSync(join(root, 'eslint.config.js')), 'eslint.config.js est manquant')
  eslint ??= new ESLint({ cwd: root })
  const [result] = await eslint.lintText(fixture(fixtureName), { filePath: join(root, virtualPath) })
  assert.ok(result, 'ESLint n’a renvoyé aucun résultat')
  return result.messages.filter((m) => m.severity === 2)
}

const describeErrors = (errors: { line: number; ruleId: string | null; message: string }[]) =>
  errors.map((e) => `ligne ${e.line} [${e.ruleId ?? 'parse'}] ${e.message}`)

/** Le lint échoue, et signale chacune des lignes attendues. */
async function assertFailsOnLines(fixtureName: string, virtualPath: string, lines: number[]) {
  const errors = await lintErrors(fixtureName, virtualPath)
  const reported = new Set(errors.map((e) => e.line))
  const missing = lines.filter((l) => !reported.has(l))
  assert.deepEqual(missing, [], `lignes non signalées dans ${fixtureName} (signalées : ${[...reported].join(', ') || 'aucune'})`)
}

/** Le lint ne signale aucune erreur. */
async function assertPasses(fixtureName: string, virtualPath: string) {
  assert.deepEqual(describeErrors(await lintErrors(fixtureName, virtualPath)), [])
}

// ---------------------------------------------------------------------------
// scripts/check-src.mjs : lancé dans un répertoire temporaire
// ---------------------------------------------------------------------------

const CARBON_PACKAGE_JSON = JSON.stringify({ name: 'tmp', dependencies: { '@carbon/icons-react': '11.89.0' } }, null, 2)

/** Lance check-src dans un dépôt temporaire ; `files` s'ajoute (ou se substitue) à une base propre. */
function runCheckSrc(files: Record<string, string> = {}) {
  assert.ok(existsSync(checkSrcPath), 'scripts/check-src.mjs est manquant')
  const dir = mkdtempSync(join(tmpdir(), 'check-src-'))
  try {
    const all: Record<string, string> = {
      'package.json': CARBON_PACKAGE_JSON,
      'src/styles.css': fixture('styles-ok.css'),
      ...files,
    }
    for (const [path, content] of Object.entries(all)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true })
      writeFileSync(join(dir, path), content)
    }
    const run = spawnSync(process.execPath, [checkSrcPath], { cwd: dir, encoding: 'utf8' })
    return { status: run.status, output: `${run.stdout}${run.stderr}` }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** La sortie désigne `fichier:ligne`. */
function assertReports(output: string, file: string, line: number) {
  assert.match(output, new RegExp(`${escapeRe(file)}:${line}(?!\\d)`), `${file}:${line} absent de la sortie :\n${output}`)
}

function assertCheckSrcFails(result: { status: number | null; output: string }) {
  assert.ok(result.status !== null && result.status !== 0, `code de sortie attendu différent de 0, reçu ${result.status}`)
}

function assertCheckSrcPasses(result: { status: number | null; output: string }) {
  assert.equal(result.status, 0, `code de sortie attendu 0, reçu ${result.status} :\n${result.output}`)
}

// ---------------------------------------------------------------------------
// CA12 — attribut style
// ---------------------------------------------------------------------------

describe('CA12 — style n’accepte que des variables CSS', () => {
  it('CA12 — style={{ color: "red" }} et style={{ left: x }} échouent avec la ligne', async () => {
    await assertFailsOnLines('style-props.tsx', HAND_WRITTEN, [1, 2])
  })

  it('CA12 — style={{ "--progress": p }} passe', async () => {
    await assertPasses('style-vars.tsx', HAND_WRITTEN)
  })

  it('CA12 — le dossier des composants générés est exempté', async () => {
    await assertPasses('style-props.tsx', GENERATED)
  })
})

// ---------------------------------------------------------------------------
// CA13 — couleurs littérales
// ---------------------------------------------------------------------------

describe('CA13 — couleurs littérales hors styles.css', () => {
  it('CA13 — un hex, rgb(), hsl() ou oklch() échoue dans une chaîne, un gabarit, style et fill, avec la ligne', async () => {
    await assertFailsOnLines('color-literals.tsx', HAND_WRITTEN, [1, 2, 3, 4, 5, 6, 7])
  })

  it('CA13 — le dossier des composants générés est exempté', async () => {
    await assertPasses('color-literals.tsx', GENERATED)
  })

  it('CA13 — un .svg de src/ avec une couleur littérale échoue avec la ligne', () => {
    const result = runCheckSrc({ 'src/assets/logo.svg': fixture('logo-bad.svg') })
    assertCheckSrcFails(result)
    for (const line of [2, 3, 4]) assertReports(result.output, 'src/assets/logo.svg', line)
  })

  it('CA13 — un .svg de src/ en currentColor passe', () => {
    assertCheckSrcPasses(runCheckSrc({ 'src/assets/logo.svg': fixture('logo-ok.svg') }))
  })
})

describe('CA13 — formats de couleur dans src/styles.css', () => {
  it('CA13 — #hex, rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(), oklab(), color() et les couleurs nommées échouent, une erreur par ligne', () => {
    const result = runCheckSrc({ 'src/styles.css': fixture('styles-bad.css') })
    assertCheckSrcFails(result)
    for (let line = 2; line <= 13; line++) assertReports(result.output, 'src/styles.css', line)
  })

  it('CA13 — oklch(), var(--…), var(--color-white), transparent et currentColor passent', () => {
    assertCheckSrcPasses(runCheckSrc({ 'src/styles.css': fixture('styles-ok.css') }))
  })
})

// ---------------------------------------------------------------------------
// CA14 — palette Tailwind par défaut
// ---------------------------------------------------------------------------

describe('CA14 — classes de la palette Tailwind', () => {
  it('CA14 — bg-red-500, text-zinc-400, text-white, hover:bg-black et bg-white/50 échouent avec la ligne', async () => {
    await assertFailsOnLines('palette-classes.tsx', HAND_WRITTEN, [1, 2, 3, 4, 5])
  })

  it('CA14 — ces classes passent dans le dossier des composants générés', async () => {
    await assertPasses('palette-classes.tsx', GENERATED)
  })

  it('CA14 — bg-primary et text-muted-foreground passent, dans src/ comme dans le dossier des composants générés', async () => {
    await assertPasses('token-classes.tsx', HAND_WRITTEN)
    await assertPasses('token-classes.tsx', GENERATED)
  })
})

// ---------------------------------------------------------------------------
// CA15 — valeurs arbitraires
// ---------------------------------------------------------------------------

describe('CA15 — classes à valeur arbitraire', () => {
  it('CA15 — w-[37px], p-[13px], text-[15px] et bg-[#fff] échouent avec la ligne', async () => {
    await assertFailsOnLines('arbitrary-values.tsx', HAND_WRITTEN, [1, 2, 3, 4])
  })

  it('CA15 — w-(--progress) passe', async () => {
    await assertPasses('style-vars.tsx', HAND_WRITTEN)
  })

  it('CA15 — le dossier des composants générés est exempté', async () => {
    await assertPasses('arbitrary-values.tsx', GENERATED)
  })
})

// ---------------------------------------------------------------------------
// CA16 — un seul fichier CSS
// ---------------------------------------------------------------------------

describe('CA16 — styles.css est le seul fichier CSS de src/', () => {
  it('CA16 — avec src/styles.css seul, le contrôle passe', () => {
    assertCheckSrcPasses(runCheckSrc())
  })

  it('CA16 — un src/extra.css fait échouer le contrôle, chemin affiché', () => {
    const result = runCheckSrc({ 'src/extra.css': '.a { display: block; }\n' })
    assertCheckSrcFails(result)
    assert.match(result.output, /src\/extra\.css/)
  })

  it('CA16 — un .css dans un sous-dossier de src/ fait échouer le contrôle, chemin affiché', () => {
    const result = runCheckSrc({ 'src/components/card.css': '.a { display: block; }\n' })
    assertCheckSrcFails(result)
    assert.match(result.output, /src\/components\/card\.css/)
  })

  it('CA16 — le dossier des composants générés est exempté', () => {
    assertCheckSrcPasses(runCheckSrc({ 'src/components/ui/extra.css': '.a { color: #fff; }\n' }))
  })
})

// ---------------------------------------------------------------------------
// CA17 — icônes
// ---------------------------------------------------------------------------

const EXTERNAL_ICON_IMPORT_LINES = [1, 2, 3, 4, 5, 6, 7] // lucide-react, @tabler/icons-react, react-icons, + quatre autres

describe('CA17 — seule @carbon/icons-react est autorisée', () => {
  it('CA17 — lucide-react, @tabler/icons-react, react-icons et quatre autres bibliothèques échouent dans src/, avec la ligne', async () => {
    await assertFailsOnLines('icons-external.tsx', HAND_WRITTEN, EXTERNAL_ICON_IMPORT_LINES)
  })

  it('CA17 — les mêmes imports échouent dans le dossier des composants générés', async () => {
    await assertFailsOnLines('icons-external.tsx', GENERATED, EXTERNAL_ICON_IMPORT_LINES)
  })

  it('CA17 — l’import depuis @carbon/icons-react passe, dans src/ comme dans le dossier des composants générés', async () => {
    await assertPasses('icons-carbon.tsx', HAND_WRITTEN)
    await assertPasses('icons-carbon.tsx', GENERATED)
  })

  it('CA17 — check-src échoue sur un package.json qui contient lucide-react', () => {
    const result = runCheckSrc({
      'package.json': JSON.stringify({ name: 'tmp', dependencies: { 'lucide-react': '1.0.0' } }, null, 2),
    })
    assertCheckSrcFails(result)
    assert.match(result.output, /package\.json/)
  })

  it('CA17 — check-src échoue sur une bibliothèque d’icônes en devDependencies', () => {
    const result = runCheckSrc({
      'package.json': JSON.stringify(
        { name: 'tmp', dependencies: { '@carbon/icons-react': '11.89.0' }, devDependencies: { '@tabler/icons-react': '3.0.0' } },
        null,
        2,
      ),
    })
    assertCheckSrcFails(result)
    assert.match(result.output, /package\.json/)
  })

  it('CA17 — le package.json du dépôt ne déclare aucune bibliothèque d’icônes autre que @carbon/icons-react', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>
    const declared = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].flatMap((field) =>
      Object.keys(pkg[field] ?? {}),
    )
    const iconLibraries = declared.filter((name) => /icon|lucide/i.test(name)).sort()
    assert.deepEqual(iconLibraries, ['@carbon/icons-react'])
  })
})
