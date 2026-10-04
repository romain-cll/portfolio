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
    "Master's in IT & Information Systems",
    'romain-caille.fr',
    'r.caille@icloud.com',
    'gitlab.com/romain.caille',
    'linkedin.com/in/romain-caillé',
    'Open to work · available now',
    'Remote or relocation · from Nantes, France',
    'I build TypeScript and Go backends, from REST APIs to event-driven pipelines on Kafka.',
    'French native, English C1.',
    'Founder, fullstack developer',
    'Cold-call prospecting: no traction in construction, so I pivoted to test the personal care services market, which proved more receptive, with prospects coming in inbound.',
    'Development assisted by a team of subagents (PO, architect, tester, developer, reviewer), framed by user stories, a DoR/DoD and TDD.',
    "France's electricity grid, Europe's largest smart grid (37M+ connected meters)",
    // Décision 2026-10-04 (cv-mise-a-jour-2) : ces deux phrases sont remplacées par celles du nouveau design.
    "Mon Orga, Enedis's company-wide org chart (41,000 employees): Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), the single source of org data for internal apps. Main frontend dev in a team of 4.",
    'Tech subsidiary of Système U · team building the applications for its 28 warehouses',
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

  // Décision 2026-10-04 (cv-mise-a-jour, CA2) : « Master's… » est contenue dans l'ancienne ligne, seule l'absence de la ligne complète prouve le retrait de « · 2025 ».
  it('cv-mise-a-jour CA2 — ne contient plus les anciennes phrases', () => {
    const { info } = load(EN.file)
    const text = squash(info.text)
    const present = [
      "Master's in IT & Information Systems · 2025",
      'Full-time / freelance',
      'Pivoted to personal care services, with a demo booked and a client signed through outbound.',
    ].filter((phrase) => text.includes(squash(phrase)))
    assert.deepEqual(present, [], 'anciennes phrases encore présentes dans le texte du PDF')
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
    'Master Bac+5 · Expert en informatique et SI',
    'En recherche · disponible immédiatement',
    'Remote ou relocalisation · basé à Nantes',
    'Je conçois des backends TypeScript et Go, des API REST aux pipelines event-driven sur Kafka.',
    'Français natif, anglais C1.',
    'Fondateur, développeur fullstack',
    'Prospection en cold call : sans résultat dans le BTP, pivot vers le service à la personne pour tester ce marché, plus réceptif, avec des prospects arrivés en inbound.',
    'Développement assisté par une équipe de subagents (PO, architecte, testeur, développeur, reviewer), cadré par des user stories, une DoR/DoD et du TDD.',
    "La position GPS n'est capturée qu'au moment du pointage.",
    "Réseau électrique français, 1er smart grid d'Europe (37M+ compteurs connectés)",
    // Décision 2026-10-04 (cv-mise-a-jour-2) : ces deux phrases sont remplacées par celles du nouveau design.
    "Mon Orga, organigramme national d'Enedis (41 000 salariés) : app Nuxt 3 et API REST TypeScript (AdonisJS, PostgreSQL), source unique des données d'organisation des apps internes. Dev frontend principal, équipe de 4.",
    "Filiale tech de Système U · équipe des applications de ses 28 entrepôts",
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

  // Décision 2026-10-04 (cv-mise-a-jour, CA3) : même raisonnement que pour la version anglaise.
  it('cv-mise-a-jour CA3 — ne contient plus les anciennes phrases', () => {
    const { info } = load(FR.file)
    const text = squash(info.text)
    const present = [
      'Master Bac+5 · Expert en informatique et SI · 2025',
      'CDI / freelance',
      "Prospection en cold call : pas de traction dans le BTP malgré l'appel direct.",
    ].filter((phrase) => text.includes(squash(phrase)))
    assert.deepEqual(present, [], 'anciennes phrases encore présentes dans le texte du PDF')
  })
})

// ---------------------------------------------------------------------------
// cv-mise-a-jour-2 — CA2 à CA8 : Enedis, U Tech, formation en bas de page
// ---------------------------------------------------------------------------

// CA8 : le bas de la ligne de diplôme, dernière ligne de la page, est à au moins 3 mm du bord bas.
// Le bas d'une ligne vaut sa ligne de base moins 0,3 em (décision 2026-10-04) ; IBM Plex Mono descend de 0,274 em.
const MIN_MARGIN_PT = (3 * 72) / 25.4
const toMm = (pt: number) => (pt * 25.4) / 72

/** Dernière ligne de la page : les textes non vides posés à la plus basse ligne de base (à 0,5 pt près), et la marge sous cette ligne. */
function lastLine(info: PdfInfo) {
  const runs = info.pages[0]!.runs.filter((run) => run.text.trim() !== '')
  assert.ok(runs.length > 0, 'aucun texte positionné dans le PDF')
  const baseline = Math.min(...runs.map((run) => run.y))
  const row = runs.filter((run) => run.y - baseline < 0.5)
  return {
    text: squash(row.map((run) => run.text).join('')),
    bottom: Math.min(...row.map((run) => run.y - 0.3 * run.size)),
  }
}

const countOf = (haystack: string, needle: string) => haystack.split(needle).length - 1

// CA2 et CA3 pour l'anglais, CA4 et CA5 pour le français : textes présents (`keep`) et textes retirés (`drop`).
const MISE_A_JOUR_2 = [
  {
    label: 'anglais',
    pdf: EN,
    keep: [
      'May 2025 – Present',
      'NestJS · TypeScript · PostgreSQL · React · TanStack Router · shadcn/ui · Plausible · Expo/React Native · Electron',
      'Worksite inspection app (Pays de la Loire)',
      'contractor-run worksites a year for safety, schedule and work quality.',
      "Mon Orga, Enedis's company-wide org chart (41,000 employees): Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), the single source of org data for internal apps. Main frontend dev in a team of 4.",
      'GitLab CI/CD (80% coverage gate, Checkmarx, Docker, auto deploy, health check); OIDC SSO, role-based access, rate limiting, no personal data stored locally.',
      'the time lost to cross-team CI/CD blockers and got a weekly sync set up with the Cloud and CI/CD teams.',
      'Nuxt 3 · TypeScript · AdonisJS (Node.js) · PostgreSQL (SQL) · Docker · GitLab CI/CD · Symfony · AWS',
      'Tech subsidiary of Système U · team building the applications for its 28 warehouses',
      'Routing app: moves pallets to the loading dock.',
      'Vue · JavaScript · Java Spring Boot · PWA',
      "Master's in IT & Information Systems · EPSI",
    ],
    drop: [
      'Built an internal org chart in Nuxt.',
      'to understand their needs and design apps around them.',
      'Clear dev process',
      'Nuxt · Symfony · AdonisJS · GitLab CI/CD · AWS',
      'team building the warehouse applications',
      'Routing app: moves orders from picking to the loading dock, bringing every pallet in.',
      'Education:',
    ],
    projects: 'projects',
    education: 'education',
    diploma: "Master's in IT & Information Systems · EPSI",
    prefix: "Master's in IT & Information Systems",
  },
  {
    label: 'français',
    pdf: FR,
    keep: [
      'NestJS · TypeScript · PostgreSQL · React · TanStack Router · shadcn/ui · Plausible · Expo/React Native · Electron',
      "App d'inspection des chantiers (Pays de la Loire) : ~15 agents terrain inspectent ~3 000 chantiers prestataires par an (sécurité, délais, qualité d'exécution).",
      "Mon Orga, organigramme national d'Enedis (41 000 salariés) : app Nuxt 3 et API REST TypeScript (AdonisJS, PostgreSQL), source unique des données d'organisation des apps internes. Dev frontend principal, équipe de 4.",
      'CI/CD GitLab (couverture 80 %, Checkmarx, Docker, déploiement auto, health check) ; SSO OIDC, autorisation par rôle, rate limiting, aucune donnée personnelle stockée en local.',
      "du temps perdu en blocages inter-équipes, d'où une réunion hebdo avec les équipes Cloud et CI/CD.",
      'Nuxt 3 · TypeScript · AdonisJS (Node.js) · PostgreSQL (SQL) · Docker · GitLab CI/CD · Symfony · AWS',
      "Filiale tech de Système U · équipe des applications de ses 28 entrepôts",
      "Application d'acheminement des palettes jusqu'au quai de chargement.",
      'Vue · JavaScript · Java Spring Boot · PWA',
      'Master Bac+5 · Expert en informatique et SI · EPSI',
    ],
    drop: [
      "Conception d'un organigramme interne en Nuxt.",
      'Rencontres avec les utilisateurs sur le terrain',
      'Processus de dev clair',
      'Nuxt · Symfony · AdonisJS · GitLab CI/CD · AWS',
      "équipe des applications d'entrepôt",
      'de la préparation de commandes jusqu\'au quai de chargement',
      'Formation :',
    ],
    projects: 'projets',
    education: 'formation',
    diploma: 'Master Bac+5 · Expert en informatique et SI · EPSI',
    prefix: 'Master Bac+5 · Expert en informatique et SI',
  },
] as const

for (const { label, pdf, keep, drop, projects, education, diploma, prefix } of MISE_A_JOUR_2) {
  const [present, absent] = pdf === EN ? ['CA2', 'CA3'] : ['CA4', 'CA5']

  describe(`cv-mise-a-jour-2 — CV ${label}`, () => {
    it(`cv-mise-a-jour-2 ${present} — contient à la lettre les textes Enedis, U Tech, Spotime et formation`, () => {
      const { info } = load(pdf.file)
      const text = squash(info.text)
      const missing = keep.filter((phrase) => !text.includes(squash(phrase)))
      assert.deepEqual(missing, [], 'textes absents du PDF')
    })

    it(`cv-mise-a-jour-2 ${absent} — ne contient plus aucun des anciens textes`, () => {
      const { info } = load(pdf.file)
      const text = squash(info.text)
      const found = drop.filter((phrase) => text.includes(squash(phrase)))
      assert.deepEqual(found, [], 'anciens textes encore présents dans le PDF')
    })

    it(`cv-mise-a-jour-2 CA6 — la ligne de diplôme suit le titre « ${education} », placé après la section « ${projects} », et n'apparaît qu'une fois`, () => {
      const { info } = load(pdf.file)
      const all = lines(info).filter((line) => line !== '')
      const projectsAt = all.indexOf(projects)
      const educationAt = all.indexOf(education)
      assert.ok(projectsAt >= 0, `titre « ${projects} » absent`)
      assert.ok(educationAt >= 0, `titre « ${education} » absent`)
      assert.ok(educationAt > projectsAt, `titre « ${education} » (ligne ${educationAt}) avant « ${projects} » (ligne ${projectsAt})`)
      const following = all.slice(educationAt + 1).join('')
      assert.ok(
        following.startsWith(squash(diploma).toLowerCase()),
        `la ligne de diplôme ne suit pas le titre « ${education} », début trouvé : ${following.slice(0, 80)}`,
      )
      const occurrences = countOf(squash(info.text), squash(prefix))
      assert.equal(occurrences, 1, `« ${prefix} » apparaît ${occurrences} fois dans le texte du PDF, une seule attendue`)
    })

    it(`cv-mise-a-jour-2 CA7 — ${pdf === EN ? 'aucune image' : "la photo de l'en-tête est toujours là"}`, () => {
      const { info } = load(pdf.file)
      if (pdf === EN) assert.equal(info.images, 0, 'images du PDF anglais')
      else assert.ok(info.images > 0, 'aucune image : la photo de l’en-tête a disparu')
    })

    it('cv-mise-a-jour-2 CA8 — la ligne de diplôme, dernière ligne de la page, est entière et à au moins 3 mm du bord bas', () => {
      const { info } = load(pdf.file)
      const last = lastLine(info)
      const margin = toMm(last.bottom)
      const detail = `marge sous la dernière ligne : ${margin.toFixed(2)} mm, dernière ligne : « ${last.text} »`
      assert.equal(last.text, squash(diploma), `la dernière ligne n'est pas la ligne de diplôme entière (${detail})`)
      assert.ok(last.bottom >= MIN_MARGIN_PT, `${detail}, 3 mm attendus au moins`)
    })
  })
}

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
