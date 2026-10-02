// Logique pure du défilement, reprise à l'identique du design (méthodes `measure` et `renderVals`).
// Aucun import : le module se teste avec `node --test`.

export const STAGES = ["ingest", "build", "deploy"] as const
export const PHASES = [
  "idle",
  "overview",
  "spotime",
  "fraud.engine",
  "event.hub",
  "done",
] as const

export type Tone = "event" | "muted" | "spotime" | "fraud-engine" | "event-hub"

/** Boîte d'une étape : [début %, fin %, longueur, épaisseur] le long de la ligne. */
export type Box = [number, number, number, number]

export interface PipelineFrame {
  packet: number
  packetVisible: boolean
  trail: boolean
  pulse: boolean
  fills: [number, number, number]
  edges: { ent: number; fill: number; ext: number }[]
  stage: 0 | 1 | 2
}

export interface ContactGeometry {
  sx: number
  sy: number
  ex: number
  ey: number
}

export interface ContactFrame {
  converge: number
  dotsVisible: boolean
  x: number
  y: number
  visible: boolean
  landed: boolean
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

const isProject = (index: number) => index >= 2 && index <= 4

export const LOG: readonly {
  section: number
  at: number
  text: string
  tone: Tone
}[] = [
  { section: 0, at: 0.04, text: "> emit romain.init", tone: "event" },
  { section: 0, at: 0.35, text: "  ingest  ← romain.init", tone: "muted" },
  {
    section: 1,
    at: 0.05,
    text: "  stage ingest   event collection",
    tone: "muted",
  },
  {
    section: 1,
    at: 0.4,
    text: "  stage build    processing · Go · Node · SQL",
    tone: "muted",
  },
  {
    section: 1,
    at: 0.75,
    text: "  stage deploy   exposure · API · dashboards",
    tone: "muted",
  },
  { section: 2, at: 0.02, text: "> emit spotime", tone: "spotime" },
  { section: 2, at: 0.15, text: "  ingest  ← spotime", tone: "spotime" },
  {
    section: 2,
    at: 0.35,
    text: "  build   nestjs · tanstack · postgres",
    tone: "spotime",
  },
  { section: 2, at: 0.55, text: "  deploy ✓ spotime", tone: "spotime" },
  { section: 3, at: 0.02, text: "> emit fraud.engine", tone: "fraud-engine" },
  {
    section: 3,
    at: 0.15,
    text: "  ingest  ← fraud.engine",
    tone: "fraud-engine",
  },
  {
    section: 3,
    at: 0.35,
    text: "  build   go · kafka · redis · clickhouse",
    tone: "fraud-engine",
  },
  {
    section: 3,
    at: 0.55,
    text: "  deploy ✓ fraud-engine",
    tone: "fraud-engine",
  },
  { section: 4, at: 0.02, text: "> emit event.hub", tone: "event-hub" },
  { section: 4, at: 0.15, text: "  ingest  ← event.hub", tone: "event-hub" },
  {
    section: 4,
    at: 0.35,
    text: "  build   nestjs · postgres · stripe",
    tone: "event-hub",
  },
  { section: 4, at: 0.55, text: "  deploy ✓ event-hub", tone: "event-hub" },
  { section: 5, at: 0.15, text: "> merge 3 events → contact", tone: "event" },
  {
    section: 5,
    at: 0.92,
    text: "> emit lets.talk → r.caille@icloud.com",
    tone: "event",
  },
]

export function logTimestamp(index: number): string {
  return `00:0${Math.floor(index / 6)}:${String((index * 17) % 60).padStart(2, "0")}`
}

export function emittedCount(active: number, progress: number): number {
  return LOG.filter(
    (line) =>
      line.section < active || (line.section === active && progress >= line.at)
  ).length
}

/** Section active : la dernière dont le haut a franchi son seuil (1 px pour un projet, 50 % de la fenêtre sinon). */
export function activeSection(tops: number[], viewportHeight: number): number {
  let active = 0
  tops.forEach((top, i) => {
    if (top <= (isProject(i) ? 1 : viewportHeight * 0.5)) active = i
  })
  return active
}

export function sectionProgress(
  index: number,
  top: number,
  height: number,
  stickyHeight: number,
  viewportHeight: number,
  reduced: boolean
): number {
  if (reduced) return top < viewportHeight * 0.6 ? 1 : 0
  if (isProject(index)) {
    return clamp(-top / Math.max(1, height - stickyHeight), 0, 1)
  }
  const range = height - viewportHeight
  return clamp(
    range > 0 ? -top / range : (viewportHeight - top) / viewportHeight,
    0,
    1
  )
}

const DEFAULT_BOXES: Box[] = [
  [24, 32, 90, 32],
  [46, 54, 90, 32],
  [68, 76, 90, 32],
]

// Poids de défilement d'un cadre (× sa largeur) et d'un trajet (× sa longueur).
const BOX_WEIGHT = 1.4
const MOVE_WEIGHT = 2.5

export function pipelineFrame(
  active: number,
  progress: number,
  boxes: Box[] | null,
  reduced: boolean
): PipelineFrame {
  const bx = boxes ?? DEFAULT_BOXES
  const live = active >= 1 && active <= 4
  const p = live ? progress : 0
  const end = Math.min(100, bx[2][1] + bx[0][0])

  const path: { box: number; a: number; b: number; d: number }[] = []
  let cursor = 0
  bx.forEach(([l, r], i) => {
    path.push({
      box: -1,
      a: cursor,
      b: l,
      d: Math.max(0, l - cursor) * MOVE_WEIGHT,
    })
    path.push({ box: i, a: l, b: r, d: (r - l) * BOX_WEIGHT })
    cursor = r
  })
  path.push({
    box: -1,
    a: cursor,
    b: end,
    d: Math.max(0, end - cursor) * MOVE_WEIGHT,
  })
  const total = path.reduce((sum, s) => sum + s.d, 0)

  const fills: [number, number, number] = [0, 0, 0]
  let packet = 0
  let hidden = false
  if (live) {
    let d = p * total
    for (const s of path) {
      if (p >= 1 || d >= s.d) {
        d -= s.d
        if (s.box >= 0) fills[s.box] = 100
        packet = s.b
        continue
      }
      const f = s.d > 0 ? d / s.d : 1
      if (s.box < 0) {
        packet = s.a + (s.b - s.a) * f
      } else {
        fills[s.box] = f * 100
        packet = f < 0.5 ? s.a : s.b
        hidden = true
      }
      break
    }
  }

  const idle = active === 0 && progress > 0.04
  const edges = bx.map((box, i) => {
    const along = box[2] || 90
    const cross = box[3] || 32
    const half = cross / 2
    const d = (fills[i] / 100) * (cross + along)
    return {
      ent: clamp(d / half, 0, 1),
      fill: clamp((d - half) / along, 0, 1),
      ext: clamp((d - half - along) / half, 0, 1),
    }
  })
  return {
    packet,
    packetVisible: live ? !hidden : idle,
    trail: live,
    pulse: !reduced && (idle || (live && p < 0.03)),
    fills,
    edges,
    stage: Math.max(0, fills.filter((f) => f > 0).length - 1) as 0 | 1 | 2,
  }
}

/** Étape de la ligne `event <nom> →` : celle du pipeline pendant le projet, déduite de sa progression sinon. */
export function projectStage(
  project: 0 | 1 | 2,
  active: number,
  stage: 0 | 1 | 2,
  progress: number
): 0 | 1 | 2 {
  if (active === project + 2) return stage
  return progress >= 1 ? 2 : progress < 0.2 ? 0 : progress < 0.5 ? 1 : 2
}

// Recul du portrait avant son départ, en px.
const PULL_X = -10
const PULL_Y = 22

export function contactFrame(
  progress: number,
  geometry: ContactGeometry | null
): ContactFrame {
  const converge = clamp(progress / 0.34, 0, 1)
  const pull = clamp((progress - 0.36) / 0.16, 0, 1)
  const pullEased = 1 - Math.pow(1 - pull, 3)
  const fly = clamp((progress - 0.54) / 0.26, 0, 1)
  const flyEased = 1 - Math.pow(1 - fly, 2)

  let x = 0
  let y = 0
  if (geometry) {
    const px = geometry.sx + PULL_X * pullEased
    const py = geometry.sy + PULL_Y * pullEased
    if (fly <= 0) {
      x = px
      y = py
    } else {
      const arc = Math.max(
        40,
        Math.min(
          Math.max(160, py - geometry.ey + 120),
          Math.min(py, geometry.ey) + Math.abs(geometry.ey - py) / 2 - 16
        )
      )
      x = px + (geometry.ex - px) * flyEased
      y =
        py + (geometry.ey - py) * flyEased - 4 * arc * flyEased * (1 - flyEased)
    }
  }
  return {
    converge,
    dotsVisible: converge < 1,
    x,
    y,
    visible: geometry !== null && converge >= 1,
    landed: fly >= 1,
  }
}
