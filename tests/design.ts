// Données et formules recopiées du design de référence
// (`Portfolio Event-Driven.dc.html`, constantes `PROJECTS`, `LOG` et `annTexts`, méthodes `measure` et `renderVals`).
// Spotime : textes et stack du design du 2026-10-03 (spec portfolio-cv, CA10 et CA11),
// `learned` et `result` du design du 2026-10-04 (spec cv-mise-a-jour, CA7 et CA8).
// Les tests s'en servent comme oracle : rien n'est importé de `src/`.
// Ce module ne dépend d'aucun outil de test, il se charge aussi bien depuis `node --test` que depuis Playwright.

export type Tone = 'event' | 'muted' | 'spotime' | 'fraud-engine' | 'event-hub'

export interface DesignProject {
  name: string
  ev: string
  slug: string
  /** Couleur d'accent du design (hex ou oklch), comparée en 8 bits après rendu navigateur. */
  accent: string
  url: string
  shots: number
  video: boolean
  problem: string
  decision: string
  tradeoff: string
  learned: string
  result: string
  stack: string[]
  link: { label: string; href: string }
}

export interface DesignLogLine {
  s: number
  t: number
  txt: string
  tone: Tone
}

export const SECTION_NAMES = ['hero', 'overview', 'spotime', 'fraud-engine', 'event-hub', 'contact'] as const
export type SectionName = (typeof SECTION_NAMES)[number]
export const STAGE_NAMES = ['ingest', 'build', 'deploy'] as const
export const PHASE_NAMES = ['idle', 'overview', 'spotime', 'fraud.engine', 'event.hub', 'done'] as const

/** Couleurs du design (hex). */
export const DESIGN_COLORS = {
  text: '#e6e8eb',
  secondary: '#b8c0cc',
  muted: '#8b94a1',
  surfaceDeep: '#0d0f12',
  border: '#2a2f37',
} as const

export const KICKER_OVERVIEW = '// 01 · how to read this site'
export const TITLE_OVERVIEW = 'Each project is an event. It goes through three stages.'
export const KICKER_CONTACT = '// 3 events · 1 sink'
export const TITLE_CONTACT = "This is what I do. Let's talk."
export const EMAIL = 'r.caille@icloud.com'
export const GITLAB_NOTE = 'Most of my GitLab work is in private repositories.'
export const HERO_HINT = 'scroll ↓ to emit romain.init'
export const LABEL_EXPAND = '+ trade-offs & what broke'
export const LABEL_COLLAPSE = '− collapse'
export const VIDEO_CAPTION = '2 generators · 1 → 3 scorers'
export const LOG_PANEL_HEADER = 'events.log · history · scroll the page to emit more'
export const PORTRAIT_ALT = 'Portrait of Romain Caillé'


export const DESIGN_PROJECTS: DesignProject[] = [
  {
    name: "Spotime",
    ev: "spotime",
    slug: "spotime",
    accent: "oklch(0.72 0.07 210.53)",
    url: "spotime.fr",
    shots: 2,
    video: false,
    problem: "Field crews of 10 to 30 people, spread across sites, track hours on paper. Every month-end turns into hours of manual re-entry before payroll can start. Spotime replaces that with three surfaces: a web back office for admin and scheduling, an employee mobile app (iOS/Android) and an Electron desktop app for on-site clock-in, published on the Windows Store.",
    decision: "Clock-ins are stored local-first and synced as soon as the network returns, with no data loss or duplicates. GPS location is captured only at the moment of clock-in. Development runs with a team of subagents (PO, architect, tester, developer, reviewer), framed by user stories, a DoR/DoD and TDD.",
    tradeoff: "Cold email to construction SMEs wasn't landing, so I switched to cold calling. Traded reach for signal quality, on purpose.",
    learned: "Construction still showed no traction, even on direct calls. Pivoting to personal care services proved more receptive, with a client coming in inbound. Testing the channel first, then the market, beats rewriting the pitch.",
    result: "Two paying clients: one in agriculture, and one in personal care services who came in inbound.",
    stack: ["Tanstack Router","PostgreSQL","NestJS","TypeScript","shadcn/ui","Plausible (self-hosted)","Expo/React Native","Electron"],
    link: { label: "visit spotime.fr", href: "https://spotime.fr" },
  },
  {
    name: "Fraud Engine",
    ev: "fraud.engine",
    slug: "fraud-engine",
    accent: "#f0a35a",
    url: "grafana · scorer-group lag",
    shots: 0,
    video: true,
    problem: "Learn Go and event-driven design on a case where event ordering matters: fraud detection. The pipeline has to absorb growing load and scale horizontally without code changes.",
    decision: "Three independent Go binaries (generator, scorer, sink) linked by Kafka, partitioned by card_id so a card is always scored by the same worker. Redis holds per-card velocity in a sliding window, ClickHouse stores scored transactions. Adding a scorer only triggers a partition rebalance.",
    tradeoff: "When its 1,000-slot buffer is full, the generator drops messages instead of blocking. Acceptable for a load test, since the ceiling stays visible in metrics. On a real payment pipeline, losing an event before the fraud check is not: backpressure or a persistent buffer instead.",
    learned: "The first version ran 3 scorers at ~3 tx/s. kafka-go's default 1s BatchTimeout capped writes at about one message per second, and each Redis command was its own round-trip. Explicit batching (size or timer, first one wins) and a pipelined Redis call fixed it: one optimized scorer now keeps up with a generator alone.",
    result: "Live scaling: with 1 scorer for 2 ramping generators, lag climbs to ~410 messages (~8s of traffic). Starting 2 more scorers drains it to 0. Three scorers handle ~220 tx/s combined.",
    stack: ["Go","Kafka","Redis","ClickHouse","Prometheus","Grafana","Docker"],
    link: { label: "repo", href: "https://gitlab.com/romain.caille/fraud-engine-event-driven" },
  },
  {
    name: "Event Hub",
    ev: "event.hub",
    slug: "event-hub",
    accent: "#b78cf5",
    url: "gitlab.com/romain.caille/event-hub",
    shots: 5,
    video: false,
    problem: "Web analytics count visitors. Stripe counts money. Nothing joins the two, so teams selling through Stripe can't tell which source, campaign or page actually brings revenue without a data warehouse or a tag manager.",
    decision: "One endpoint, POST /v1/events, for every source: browser SDK, backend, CI, Stripe webhooks. The server derives the fields it guarantees (source, session, visitor); the client only sends jsonb context. Payments link back to the first visit through a visitor id in Stripe metadata. The core never knows what an event type means, and a test fails the build if it does.",
    tradeoff: "Cookieless by default: the visitor key is an HMAC that rotates daily, and IP and User-Agent are never stored. Enough to count, not to follow, so renewals and LTV only attribute in consented mode. Privacy first, attribution depth second.",
    learned: "One Stripe payment fires four webhooks that all carry an amount. Mapping them to disjoint event types and reading one precise type keeps the same euro from being counted four times. In tests, ad-hoc supertest ports failed once every ~66,000 requests on a random suite; a shared harness with one server per suite fixed it.",
    result: "Working proof of concept: web analytics and Stripe revenue attribution shipped, with traffic, revenue and deploy markers on one chart. Next: a per-project ingestion cap and cohort views in the dashboard.",
    stack: ["NestJS","PostgreSQL","Drizzle","Zod","TanStack Start","Stripe Connect","shadcn/ui","Turborepo"],
    link: { label: "repo", href: "https://gitlab.com/romain.caille/event-hub" },
  },
]

/** Tableau `LOG` du design : `s` section (0 à 5), `t` seuil de progression, `tone` déduit de `c` et `ev`. */
export const DESIGN_LOG: DesignLogLine[] = [
  { s: 0, t: 0.04, txt: "> emit romain.init", tone: "event" },
  { s: 0, t: 0.35, txt: "  ingest  ← romain.init", tone: "muted" },
  { s: 1, t: 0.05, txt: "  stage ingest   event collection", tone: "muted" },
  { s: 1, t: 0.4, txt: "  stage build    processing · Go · Node · SQL", tone: "muted" },
  { s: 1, t: 0.75, txt: "  stage deploy   exposure · API · dashboards", tone: "muted" },
  { s: 2, t: 0.02, txt: "> emit spotime", tone: "spotime" },
  { s: 2, t: 0.15, txt: "  ingest  ← spotime", tone: "spotime" },
  { s: 2, t: 0.35, txt: "  build   nestjs · tanstack · postgres", tone: "spotime" },
  { s: 2, t: 0.55, txt: "  deploy ✓ spotime", tone: "spotime" },
  { s: 3, t: 0.02, txt: "> emit fraud.engine", tone: "fraud-engine" },
  { s: 3, t: 0.15, txt: "  ingest  ← fraud.engine", tone: "fraud-engine" },
  { s: 3, t: 0.35, txt: "  build   go · kafka · redis · clickhouse", tone: "fraud-engine" },
  { s: 3, t: 0.55, txt: "  deploy ✓ fraud-engine", tone: "fraud-engine" },
  { s: 4, t: 0.02, txt: "> emit event.hub", tone: "event-hub" },
  { s: 4, t: 0.15, txt: "  ingest  ← event.hub", tone: "event-hub" },
  { s: 4, t: 0.35, txt: "  build   nestjs · postgres · stripe", tone: "event-hub" },
  { s: 4, t: 0.55, txt: "  deploy ✓ event-hub", tone: "event-hub" },
  { s: 5, t: 0.15, txt: "> merge 3 events → contact", tone: "event" },
  { s: 5, t: 0.92, txt: "> emit lets.talk → r.caille@icloud.com", tone: "event" },
]

/** `annTexts` du design, dans l'ordre ingest, build, deploy. */
export const DESIGN_ANNOTATIONS = [
  "Collection: what enters the system, as is.",
  "Processing: validation, enrichment, decisions. This is where the trade-offs live.",
  "Exposure: APIs, dashboards, what others consume.",
]

// ---------------------------------------------------------------------------
// Formules du design
// ---------------------------------------------------------------------------

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Fenêtre de révélation `rv(p, from, to)` du design : opacité de 0 à 1 et décalage `(1 − t) × dy`. */
export function designReveal(p: number, from: number, to: number, dy = 18): { op: number; ty: number } {
  const t = clamp((p - from) / (to - from), 0, 1)
  return { op: t, ty: (1 - t) * dy }
}

/** Horodatage de la i-ième ligne du journal. */
export function designTimestamp(index: number): string {
  return '00:0' + Math.floor(index / 6) + ':' + String((index * 17) % 60).padStart(2, '0')
}

/** Nombre de lignes émises quand la section `active` est à la progression `progress`. */
export function designLogCount(active: number, progress: number): number {
  return DESIGN_LOG.filter((l) => l.s < active || (l.s === active && progress >= l.t)).length
}

/** Section active : la dernière dont le haut a franchi son seuil (1 px pour les projets, 50 % de la fenêtre sinon). */
export function designActive(tops: number[], vh: number): number {
  let active = 0
  tops.forEach((top, i) => {
    if (top <= (i >= 2 && i <= 4 ? 1 : vh * 0.5)) active = i
  })
  return active
}

/** Progression d'une section (méthode `measure`). */
export function designProgress(
  index: number,
  top: number,
  height: number,
  stickyHeight: number,
  vh: number,
  reduced: boolean,
): number {
  if (reduced) return top < vh * 0.6 ? 1 : 0
  let range = height - vh
  if (index >= 2 && index <= 4) {
    range = Math.max(1, height - stickyHeight)
    return clamp(-top / range, 0, 1)
  }
  return clamp(range > 0 ? -top / range : (vh - top) / vh, 0, 1)
}

export type DesignBox = [number, number, number, number]
export const DEFAULT_BOXES: DesignBox[] = [
  [24, 32, 90, 32],
  [46, 54, 90, 32],
  [68, 76, 90, 32],
]

export interface DesignFrame {
  packet: number
  packetVisible: boolean
  trail: boolean
  pulse: boolean
  fills: [number, number, number]
  edges: { ent: number; fill: number; ext: number }[]
  stage: 0 | 1 | 2
}

/** Paquet, remplissages et étape du pipeline (méthode `renderVals`, bloc « pipeline »). */
export function designFrame(active: number, prog: number, boxes: DesignBox[] | null, reduced: boolean): DesignFrame {
  const bx = boxes ?? DEFAULT_BOXES
  const live = active >= 1 && active <= 4
  const p = live ? prog : 0
  const gap = bx[0]![0]
  const START = 0
  const END = Math.min(100, bx[2]![1] + gap)
  const K = 1.4
  const M = 2.5
  const path: { t: 'move' | 'box'; i?: number; a: number; b: number; d: number }[] = []
  let cur = START
  let L = 0
  bx.forEach(([l, r], i) => {
    path.push({ t: 'move', a: cur, b: l, d: Math.max(0, l - cur) * M })
    path.push({ t: 'box', i, a: l, b: r, d: (r - l) * K })
    cur = r
  })
  path.push({ t: 'move', a: cur, b: END, d: Math.max(0, END - cur) * M })
  path.forEach((s) => {
    L += s.d
  })
  const fills: [number, number, number] = [0, 0, 0]
  let pct = START
  let dotOp = live ? 1 : 0
  if (live) {
    let d = p * L
    for (const s of path) {
      if (d >= s.d && p < 1) {
        d -= s.d
        if (s.t === 'box') fills[s.i!] = 100
        pct = s.b
        continue
      }
      if (p >= 1) {
        if (s.t === 'box') fills[s.i!] = 100
        pct = s.b
        continue
      }
      const f = s.d > 0 ? d / s.d : 1
      if (s.t === 'move') {
        pct = s.a + (s.b - s.a) * f
      } else {
        fills[s.i!] = f * 100
        pct = f < 0.5 ? s.a : s.b
        dotOp = 0
      }
      break
    }
  }
  const idle = active === 0 && prog > 0.04
  const op = live ? dotOp : idle ? 1 : 0
  const pulse = !reduced && (idle || (live && p < 0.03))
  const edges = bx.map((box, i) => {
    const along = box[2] || 90
    const cross = box[3] || 32
    const half = cross / 2
    const d = (fills[i]! / 100) * (cross + along)
    return {
      ent: clamp(d / half, 0, 1),
      fill: clamp((d - half) / along, 0, 1),
      ext: clamp((d - half - along) / half, 0, 1),
    }
  })
  const stage = Math.max(0, fills.filter((f) => f > 0).length - 1) as 0 | 1 | 2
  return { packet: pct, packetVisible: op > 0, trail: live, pulse, fills, edges, stage }
}

/** Étape de la ligne `event <nom> →` d'un projet (`sIdx` du design). */
export function designProjectStage(project: number, active: number, stage: number, progress: number): 0 | 1 | 2 {
  if (active === project + 2) return stage as 0 | 1 | 2
  return progress >= 1 ? 2 : progress < 0.2 ? 0 : progress < 0.5 ? 1 : 2
}

export interface DesignContactGeometry {
  sx: number
  sy: number
  ex: number
  ey: number
}

/** Convergence des trois points puis trajectoire du portrait (« slingshot » du design). */
export function designContact(o: number, og: DesignContactGeometry | null) {
  const conv = clamp(o / 0.34, 0, 1)
  const pull = clamp((o - 0.36) / 0.16, 0, 1)
  const pullE = 1 - Math.pow(1 - pull, 3)
  const fly = clamp((o - 0.54) / 0.26, 0, 1)
  const flyE = 1 - Math.pow(1 - fly, 2)
  const landed = fly >= 1
  const PX = -10
  const PY = 22
  let tv = { x: 0, y: 0 }
  if (og) {
    const px = og.sx + PX * pullE
    const py = og.sy + PY * pullE
    if (fly <= 0) tv = { x: px, y: py }
    else {
      const hgt = Math.max(
        40,
        Math.min(Math.max(160, py - og.ey + 120), Math.min(py, og.ey) + Math.abs(og.ey - py) / 2 - 16),
      )
      tv = {
        x: px + (og.ex - px) * flyE,
        y: py + (og.ey - py) * flyE - 4 * hgt * flyE * (1 - flyE),
      }
    }
  }
  return { converge: conv, dotsVisible: conv < 1, x: tv.x, y: tv.y, visible: og !== null && conv >= 1, landed }
}

/** `m:ss` du design (lecteur vidéo). */
export function designClock(seconds: number): string {
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0')
}

// ---------------------------------------------------------------------------
// Textes attendus (CA2, CA27)
// ---------------------------------------------------------------------------

/** Chaque texte du design, avec la section qui le porte. */
export function designTexts(): { section: SectionName; text: string }[] {
  const texts: { section: SectionName; text: string }[] = [
    { section: 'overview', text: KICKER_OVERVIEW },
    { section: 'overview', text: TITLE_OVERVIEW },
    ...DESIGN_ANNOTATIONS.map((text) => ({ section: 'overview' as const, text })),
  ]
  for (const project of DESIGN_PROJECTS) {
    const section = project.slug as SectionName
    texts.push(
      { section, text: `event ${project.ev} →` },
      { section, text: project.name },
      { section, text: 'problem' },
      { section, text: project.problem },
      { section, text: 'decision' },
      { section, text: project.decision },
      { section, text: 'trade-off' },
      { section, text: project.tradeoff },
      { section, text: 'what broke / learned' },
      { section, text: project.learned },
      ...project.stack.map((text) => ({ section, text })),
      { section, text: project.url },
      { section, text: 'deploy ✓' },
      { section, text: project.result },
      { section, text: project.link.label },
    )
  }
  texts.push(
    { section: 'contact', text: KICKER_CONTACT },
    { section: 'contact', text: TITLE_CONTACT },
    { section: 'contact', text: EMAIL },
    { section: 'contact', text: 'gitlab' },
    { section: 'contact', text: 'linkedin' },
    { section: 'contact', text: 'resume.pdf' },
    { section: 'contact', text: GITLAB_NOTE },
  )
  return texts
}
