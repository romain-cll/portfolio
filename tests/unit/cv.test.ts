import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { inspectPdf, squash, type PdfInfo } from '../pdf.ts'

// CA5 et CA6 — les deux CV versionnés dans public/ : une page A4, texte et liens, poids, version anglaise et française.
// CA8 et CA9 — le script `pnpm cv` : garde-fous avant tout rendu. Aucun de ces tests ne lance Chromium ni n'utilise le réseau.
// La fidélité visuelle au design se relit à la main dans Aperçu, après `pnpm cv` (CA8).

const PUBLIC = new URL('../../public/', import.meta.url)
const SCRIPT = fileURLToPath(new URL('../../scripts/cv.mjs', import.meta.url))

const EN = { file: 'resume-romain-caille.pdf', source: 'Resume EN.dc.html' }
const FR = { file: 'cv-romain-caille.pdf', source: 'CV FR.dc.html' }

function load(file: string): { size: number; info: PdfInfo } {
  const url = new URL(file, PUBLIC)
  assert.ok(existsSync(url), `public/${file} est manquant`)
  return { size: statSync(url).size, info: inspectPdf(readFileSync(url)) }
}

// ---------------------------------------------------------------------------
// CA5 — format, texte, liens, poids
// ---------------------------------------------------------------------------

for (const { file } of [EN, FR]) {
  describe(`CA5 — public/${file}`, () => {
    it('CA5 — pèse au plus 400 000 octets', () => {
      const { size } = load(file)
      assert.ok(size > 10_000, `fichier trop petit pour un CV : ${size} octets`)
      assert.ok(size <= 400_000, `${size} octets pour un plafond de 400 000`)
    })

    it('CA5 — fait une seule page, au format A4 (595,28 × 841,89 pt, à 1 pt près)', () => {
      const { info } = load(file)
      assert.equal(info.pageObjects, 1, 'objets /Type /Page')
      assert.equal(info.pages.length, 1, 'pages de l’arbre')
      const [page] = info.pages
      assert.ok(Math.abs(page!.width - 595.28) <= 1, `largeur ${page!.width} pt`)
      assert.ok(Math.abs(page!.height - 841.89) <= 1, `hauteur ${page!.height} pt`)
    })

    it('CA5 — le texte est sélectionnable : il se décode par ToUnicode, ce n’est pas une image', () => {
      const { info } = load(file)
      assert.ok(info.textOperations > 100, `${info.textOperations} opérations d’affichage de texte`)
      assert.ok(squash(info.text).length > 1500, `${squash(info.text).length} caractères lus`)
      assert.equal(info.undecodable, 0, 'glyphes sans ToUnicode')
    })

    it('CA5 — les liens sont cliquables : site, e-mail, GitLab, LinkedIn, spotime.fr et les deux dépôts', () => {
      const { info } = load(file)
      // Chromium écrit des URL résolues (`https://spotime.fr/`) : on compare après `new URL(…).href`.
      const uris = info.pages[0]!.links.map((link) => new URL(link.uri).href)
      for (const expected of [
        'https://romain-caille.fr',
        'mailto:r.caille@icloud.com',
        'https://gitlab.com/romain.caille',
        'https://www.linkedin.com/in/romain-caill%C3%A9/',
        'https://spotime.fr',
        'https://gitlab.com/romain.caille/event-hub',
        'https://gitlab.com/romain.caille/fraud-engine-event-driven',
      ]) {
        assert.ok(uris.includes(new URL(expected).href), `lien ${expected} absent, liens trouvés : ${uris.join(', ')}`)
      }
      for (const link of info.pages[0]!.links) {
        assert.equal(link.rect.length, 4, `zone cliquable de ${link.uri}`)
        assert.ok(link.rect[2]! > link.rect[0]! && link.rect[3]! > link.rect[1]!, `zone vide pour ${link.uri}`)
      }
    })
  })
}

// ---------------------------------------------------------------------------
// CA18 — polices embarquées : celles du site, aucune police système
// ---------------------------------------------------------------------------

for (const { file } of [EN, FR]) {
  describe(`CA18 — polices de public/${file}`, () => {
    it('CA18 — seulement Instrument Sans et IBM Plex Mono, sans police système', () => {
      const { info } = load(file)
      assert.ok(info.fontNames.length > 0, 'aucun descripteur de police trouvé')
      // `/FontName` : `InstrumentSans-Regular_SemiBold`, `IBMPlexMono-Medium`… (préfixe de sous-ensemble retiré).
      const foreign = info.fontNames.filter((name) => !/^(InstrumentSans|IBMPlexMono)(-|$)/.test(name))
      assert.deepEqual(foreign, [], `polices autres que Instrument Sans et IBM Plex Mono : ${info.fontNames.join(', ')}`)
      assert.ok(
        info.fontNames.some((name) => name.startsWith('InstrumentSans')),
        `Instrument Sans absente : ${info.fontNames.join(', ')}`,
      )
      assert.ok(
        info.fontNames.some((name) => name.startsWith('IBMPlexMono')),
        `IBM Plex Mono absente : ${info.fontNames.join(', ')}`,
      )
    })
  })
}

// ---------------------------------------------------------------------------
// CA6 — versions anglaise et française, textes du design
// ---------------------------------------------------------------------------

/** Lignes du texte, sans la casse : le CSS met les titres de section en capitales. */
const lines = (info: PdfInfo) => info.text.split('\n').map((line) => squash(line).toLowerCase())

describe('CA6 — /resume-romain-caille.pdf est la version anglaise', () => {
  it('CA6 — titres « Experience » et « Projects », accroche du design, sans « Expérience »', () => {
    const { info } = load(EN.file)
    assert.ok(lines(info).includes('experience'), 'titre « Experience » absent')
    assert.ok(lines(info).includes('projects'), 'titre « Projects » absent')
    assert.ok(squash(info.text).includes(squash('Fullstack developer, ready for the agentic era.')), 'accroche absente')
    assert.ok(!squash(info.text).toLowerCase().includes('expérience'), 'texte français « Expérience » présent')
    assert.ok(!lines(info).includes('projets'), 'titre français « Projets » présent')
  })

  // Phrases du design (`Resume EN.dc.html`), choisies sans ligature fi ni fl.
  const phrasesEn = [
    'Romain CAILLÉ',
    "Master's in IT & Information Systems · 2025",
    'romain-caille.fr',
    'r.caille@icloud.com',
    'gitlab.com/romain.caille',
    'linkedin.com/in/romain-caillé',
    'Open to work · available now',
    'Full-time / freelance',
    'Remote or relocation · from Nantes, France',
    'I build TypeScript and Go backends, from REST APIs to event-driven pipelines on Kafka.',
    'French native, English C1.',
    'Founder, fullstack developer',
    'Cold-call prospecting: no traction in construction despite direct calls.',
    'Pivoted to personal care services, with a demo booked and a client signed through outbound.',
    "France's electricity grid, Europe's largest smart grid (37M+ connected meters)",
    'Built an internal org chart in Nuxt.',
    'Tech subsidiary of Système U · team building the warehouse applications',
    'Loading app: loading those pallets onto trucks.',
    'Maps the four webhooks of one Stripe payment to disjoint event types so each euro is counted once.',
    'analytics + Stripe revenue attribution',
    'Three Go services linked by Kafka, partitioned by card_id so a card is always scored by the same worker.',
    'Scales without code changes: lag of ~410 messages drains to 0 when 2 scorers join. Three scorers handle ~220 tx/s.',
    'Go · Kafka · Redis · ClickHouse · Prometheus · Grafana · Docker',
  ]

  it('CA6 — reprend à la lettre les phrases du design', () => {
    const { info } = load(EN.file)
    const missing = phrasesEn.filter((phrase) => !squash(info.text).includes(squash(phrase)))
    assert.deepEqual(missing, [], 'phrases absentes du texte du PDF')
  })
})

describe('CA6 — /cv-romain-caille.pdf est la version française', () => {
  it('CA6 — titres « Expérience » et « Projets », accroche du design, sans titres anglais', () => {
    const { info } = load(FR.file)
    assert.ok(lines(info).includes('expérience'), 'titre « Expérience » absent')
    assert.ok(lines(info).includes('projets'), 'titre « Projets » absent')
    assert.ok(
      squash(info.text).includes(squash("Développeur fullstack, prêt pour l'ère agentique.")),
      'accroche absente',
    )
    assert.ok(!lines(info).includes('experience'), 'titre anglais « Experience » présent')
    assert.ok(!lines(info).includes('projects'), 'titre anglais « Projects » présent')
    assert.ok(!squash(info.text).includes(squash('ready for the agentic era')), 'accroche anglaise présente')
  })

  // Phrases du design (`CV FR.dc.html`), choisies sans ligature fi ni fl.
  const phrasesFr = [
    'Romain CAILLÉ',
    'Master Bac+5 · Expert en informatique et SI · 2025',
    'En recherche · disponible immédiatement',
    'CDI / freelance',
    'Remote ou relocalisation · basé à Nantes',
    'Je conçois des backends TypeScript et Go, des API REST aux pipelines event-driven sur Kafka.',
    'Français natif, anglais C1.',
    'Fondateur, développeur fullstack',
    "Prospection en cold call : pas de traction dans le BTP malgré l'appel direct.",
    "La position GPS n'est capturée qu'au moment du pointage.",
    "Réseau électrique français, 1er smart grid d'Europe (37M+ compteurs connectés)",
    "Conception d'un organigramme interne en Nuxt.",
    "Filiale tech de Système U · équipe des applications d'entrepôt",
    'analytics + attribution du revenu Stripe',
    "Les quatre webhooks d'un paiement Stripe sont mappés sur des types d'événements disjoints : chaque euro n'est compté qu'une fois.",
    'Trois services Go reliés par Kafka, partitionnés par card_id : une carte est toujours scorée par le même worker.',
    'Scale sans changer le code : ~410 messages de lag résorbés en ajoutant 2 scorers. Trois scorers absorbent ~220 tx/s.',
    'Go · Kafka · Redis · ClickHouse · Prometheus · Grafana · Docker',
  ]

  it('CA6 — reprend à la lettre les phrases du design', () => {
    const { info } = load(FR.file)
    const missing = phrasesFr.filter((phrase) => !squash(info.text).includes(squash(phrase)))
    assert.deepEqual(missing, [], 'phrases absentes du texte du PDF')
  })
})

// ---------------------------------------------------------------------------
// CA8 et CA9 — `scripts/cv.mjs` : dossier de design introuvable
// ---------------------------------------------------------------------------

const sandbox = mkdtempSync(join(tmpdir(), 'cv-test-'))
after(() => rmSync(sandbox, { recursive: true, force: true }))

const sha = (file: string) => {
  const url = new URL(file, PUBLIC)
  return existsSync(url) ? createHash('sha256').update(readFileSync(url)).digest('hex') : null
}
const snapshot = () => ({ [EN.file]: sha(EN.file), [FR.file]: sha(FR.file) })

/** Lance le script sans réseau ni Chromium : il doit s'arrêter avant. `home` remplace le dossier personnel. */
function runCv(args: string[], home = sandbox) {
  assert.ok(existsSync(SCRIPT), 'scripts/cv.mjs est manquant')
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    timeout: 20_000,
    cwd: sandbox,
    env: { ...process.env, HOME: home, USERPROFILE: home },
  })
}

function expectMissing(args: string[], missing: string, home?: string) {
  const before = snapshot()
  const result = runCv(args, home)
  assert.equal(result.error, undefined, `le script n'a pas pu se lancer ou a dépassé le délai : ${String(result.error)}`)
  assert.ok(result.status !== null && result.status !== 0, `code de sortie ${String(result.status)}, non nul attendu`)
  assert.ok(result.stderr.includes(missing), `stderr devrait nommer ${missing}, reçu :\n${result.stderr}`)
  assert.deepEqual(snapshot(), before, 'un PDF de public/ a été modifié')
}

describe('CA9 — pnpm cv avec un dossier de design incomplet', () => {
  it('CA9 — un dossier inexistant : code non nul, stderr nomme le dossier, aucun PDF modifié', () => {
    const folder = join(sandbox, 'absent')
    expectMissing([folder], folder)
  })

  it('CA9 — « CV FR.dc.html » manque : code non nul, stderr nomme son chemin, aucun PDF modifié', () => {
    const folder = join(sandbox, 'sans-fr')
    mkdirSync(folder)
    writeFileSync(join(folder, EN.source), '<!DOCTYPE html>')
    expectMissing([folder], join(folder, FR.source))
  })

  it('CA9 — « Resume EN.dc.html » manque : code non nul, stderr nomme son chemin, aucun PDF modifié', () => {
    const folder = join(sandbox, 'sans-en')
    mkdirSync(folder)
    writeFileSync(join(folder, FR.source), '<!DOCTYPE html>')
    expectMissing([folder], join(folder, EN.source))
  })
})

describe('CA8 — dossier de design par défaut', () => {
  it('CA8 — sans argument, le script cherche ~/Downloads/Portfolio Event-Driven', () => {
    const home = join(sandbox, 'home')
    mkdirSync(home)
    expectMissing([], join(home, 'Downloads', 'Portfolio Event-Driven'), home)
  })
})
