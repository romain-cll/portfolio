import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_BOXES,
  DESIGN_LOG,
  PHASE_NAMES,
  STAGE_NAMES,
  designActive,
  designContact,
  designFrame,
  designLogCount,
  designProgress,
  designProjectStage,
  designTimestamp,
  type DesignBox,
  type DesignContactGeometry,
  type DesignFrame,
  type Tone,
} from '../design.ts'

// Logique pure de src/lib/pipeline.ts : contrat fixé par le plan technique (tâche 3).
// Les seuils attendus viennent du design (tests/design.ts), jamais de src/.
// Le module est chargé à l'exécution (chemin dynamique) : sans lui, chaque test échoue sur le symbole manquant.

interface PipelineApi {
  STAGES: readonly string[]
  PHASES: readonly string[]
  LOG: readonly { section: number; at: number; text: string; tone: Tone }[]
  logTimestamp: (index: number) => string
  emittedCount: (active: number, progress: number) => number
  activeSection: (tops: number[], viewportHeight: number) => number
  sectionProgress: (
    index: number,
    top: number,
    height: number,
    stickyHeight: number,
    viewportHeight: number,
    reduced: boolean,
  ) => number
  pipelineFrame: (
    active: number,
    progress: number,
    boxes: DesignBox[] | null,
    reduced: boolean,
  ) => DesignFrame
  projectStage: (project: 0 | 1 | 2, active: number, stage: 0 | 1 | 2, progress: number) => 0 | 1 | 2
  contactFrame: (
    progress: number,
    geometry: DesignContactGeometry | null,
  ) => { converge: number; dotsVisible: boolean; x: number; y: number; visible: boolean; landed: boolean }
}

const modulePath = '../../src/lib/pipeline.ts'
const load = () => import(modulePath) as Promise<PipelineApi>

const EPS = 1e-6
function near(actual: number, expected: number, message: string, eps = EPS) {
  assert.ok(Math.abs(actual - expected) <= eps, `${message} : ${actual} au lieu de ${expected}`)
}

/** Boîtes mesurées sur un bandeau réaliste : [début %, fin %, longueur, épaisseur]. */
const BAR_BOXES: DesignBox[] = [
  [22.4, 33.1, 91.2, 33],
  [44.7, 55.6, 92, 33],
  [66.8, 77.4, 90.5, 33],
]
/** Boîtes d'un rail vertical : cadres plus courts que larges une fois tournés. */
const RAIL_BOXES: DesignBox[] = [
  [20.5, 31.2, 58, 40],
  [43.1, 54.0, 58, 40],
  [65.9, 76.8, 58, 40],
]

const PROGRESS_SWEEP = Array.from({ length: 101 }, (_, i) => i / 100)

// ---------------------------------------------------------------------------
// CA5 — phases et étapes
// ---------------------------------------------------------------------------

describe('CA5 — constantes du pipeline', () => {
  it('CA5 — STAGES vaut ingest, build, deploy', async () => {
    const lib = await load()
    assert.deepEqual([...lib.STAGES], [...STAGE_NAMES])
  })

  it('CA5 — PHASES vaut idle, overview, spotime, fraud.engine, event.hub, done (index = section active)', async () => {
    const lib = await load()
    assert.deepEqual([...lib.PHASES], [...PHASE_NAMES])
  })
})

describe('CA5 — section active', () => {
  it('CA5 — le hero est actif tant qu’aucun seuil n’est franchi', async () => {
    const { activeSection } = await load()
    assert.equal(activeSection([0, 1170, 2160, 3000, 4000, 5000], 900), 0)
    assert.equal(activeSection([-300, 870, 1500, 2500, 3500, 4500], 900), 0)
  })

  it('CA5 — l’overview, le contact et le hero basculent quand leur haut atteint 50 % de la fenêtre', async () => {
    const { activeSection } = await load()
    // vh = 800 : seuil à 400 px.
    assert.equal(activeSection([-700, 400, 1300, 2300, 3300, 4300], 800), 1)
    assert.equal(activeSection([-700, 401, 1300, 2300, 3300, 4300], 800), 0)
    assert.equal(activeSection([-4000, -3500, -2500, -1500, -500, 400], 800), 5)
    assert.equal(activeSection([-4000, -3500, -2500, -1500, -500, 401], 800), 4)
  })

  it('CA5 — un projet devient actif quand son haut atteint 1 px, pas 50 % de la fenêtre', async () => {
    const { activeSection } = await load()
    assert.equal(activeSection([-2000, -1200, 1, 900, 1800, 2700], 800), 2)
    assert.equal(activeSection([-2000, -1200, 2, 900, 1800, 2700], 800), 1)
    assert.equal(activeSection([-2000, -1200, 399, 900, 1800, 2700], 800), 1)
    assert.equal(activeSection([-3000, -2200, -1000, 0, 900, 1800], 800), 3)
    assert.equal(activeSection([-4000, -3200, -2000, -1000, 1, 900], 800), 4)
  })

  it('CA5 — la dernière section dont le seuil est franchi l’emporte', async () => {
    const { activeSection } = await load()
    assert.equal(activeSection([-5000, -4000, -3000, -2000, -1000, -10], 800), 5)
    assert.equal(activeSection([-5000, -4000, -3000, -2000, 5, 900], 800), 3)
  })

  it('CA5 — même résultat que le design sur un balayage de positions', async () => {
    const { activeSection } = await load()
    const vh = 900
    const heights = [1.3 * vh, 1.6 * vh, 2 * vh, 2 * vh, 2 * vh, 1.3 * vh]
    for (let scroll = 0; scroll <= 9000; scroll += 25) {
      let acc = 0
      const tops = heights.map((h) => {
        const top = acc - scroll
        acc += h
        return top
      })
      assert.equal(activeSection(tops, vh), designActive(tops, vh), `scrollY ${scroll}`)
    }
  })
})

// ---------------------------------------------------------------------------
// CA5, CA6, CA17 — progression d'une section
// ---------------------------------------------------------------------------

describe('CA6 — progression des sections', () => {
  it('CA6 — hero, overview et contact : plage = hauteur − fenêtre', async () => {
    const { sectionProgress } = await load()
    // hero de 130 vh : plage de 0,3 vh = 270 px.
    near(sectionProgress(0, -135, 1170, 0, 900, false), 0.5, 'hero à mi-plage')
    near(sectionProgress(0, 40, 1170, 0, 900, false), 0, 'progression')
    near(sectionProgress(0, -400, 1170, 0, 900, false), 1, 'progression')
    // overview de 160 vh : plage de 540 px.
    near(sectionProgress(1, -270, 1440, 0, 900, false), 0.5, 'overview à mi-plage')
    // contact de 130 vh.
    near(sectionProgress(5, -81, 1170, 0, 900, false), 0.3, 'contact à 30 %')
  })

  it('CA6 — une section plus courte que la fenêtre progresse de l’entrée à la sortie de l’écran', async () => {
    const { sectionProgress } = await load()
    // plage ≤ 0 : (vh − top) / vh.
    near(sectionProgress(1, 450, 800, 0, 900, false), 0.5, 'section courte à mi-chemin')
    near(sectionProgress(1, 900, 800, 0, 900, false), 0, 'progression')
    near(sectionProgress(1, -100, 800, 0, 900, false), 1, 'progression')
  })

  it('CA6 — un projet : plage = hauteur de la section − hauteur du contenu fixé', async () => {
    const { sectionProgress } = await load()
    // section de 2000 px dont le contenu fixé fait 1100 px : plage de 900 px.
    near(sectionProgress(2, -450, 2000, 1100, 900, false), 0.5, 'projet à mi-plage')
    near(sectionProgress(3, 10, 2000, 1100, 900, false), 0, 'progression')
    near(sectionProgress(4, -1500, 2000, 1100, 900, false), 1, 'progression')
    // plage plancher à 1 px quand le contenu fixé remplit la section.
    near(sectionProgress(2, -1, 2000, 2000, 900, false), 1, 'progression')
    near(sectionProgress(2, 0, 2000, 2000, 900, false), 0, 'progression')
  })

  it('CA26 — mouvement réduit : 1 quand le haut de la section est à moins de 60 % de la fenêtre, 0 sinon', async () => {
    const { sectionProgress } = await load()
    for (const index of [0, 1, 2, 3, 4, 5]) {
      near(sectionProgress(index, 539, 3000, 1100, 900, true), 1, `section ${index}, top 539`)
      near(sectionProgress(index, 540, 3000, 1100, 900, true), 0, `section ${index}, top 540`)
      near(sectionProgress(index, -2500, 3000, 1100, 900, true), 1, `section ${index}, top négatif`)
      near(sectionProgress(index, 1200, 3000, 1100, 900, true), 0, `section ${index}, top sous la fenêtre`)
    }
  })

  it('CA6 — même résultat que le design sur un balayage', async () => {
    const { sectionProgress } = await load()
    for (const reduced of [false, true]) {
      for (let index = 0; index <= 5; index++) {
        for (let top = 1300; top >= -3200; top -= 37) {
          near(
            sectionProgress(index, top, 1800, 1000, 900, reduced),
            designProgress(index, top, 1800, 1000, 900, reduced),
            `section ${index}, top ${top}, réduit ${reduced}`,
          )
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// CA13 — terminal : table LOG et horodatages
// ---------------------------------------------------------------------------

describe('CA13 — table LOG', () => {
  it('CA13 — LOG reprend les 19 lignes du design : section, seuil, texte et ton', async () => {
    const { LOG } = await load()
    assert.equal(LOG.length, 19)
    assert.deepEqual(
      LOG.map(({ section, at, text, tone }) => ({ section, at, text, tone })),
      DESIGN_LOG.map((l) => ({ section: l.s, at: l.t, text: l.txt, tone: l.tone })),
    )
  })

  it('CA13 — la première ligne est « > emit romain.init » et la dernière « > emit lets.talk → r.caille@icloud.com »', async () => {
    const { LOG } = await load()
    assert.equal(LOG[0]!.text, '> emit romain.init')
    assert.equal(LOG[0]!.section, 0)
    assert.equal(LOG.at(-1)!.text, '> emit lets.talk → r.caille@icloud.com')
    assert.equal(LOG.at(-1)!.section, 5)
  })

  it('CA13 — les lignes d’un projet portent le ton de son accent, les lignes « > » le ton event, les autres muted', async () => {
    const { LOG } = await load()
    for (const line of LOG) {
      if (line.section >= 2 && line.section <= 4) {
        assert.equal(line.tone, (['spotime', 'fraud-engine', 'event-hub'] as const)[line.section - 2], line.text)
      } else if (line.text.startsWith('>')) {
        assert.equal(line.tone, 'event', line.text)
      } else {
        assert.equal(line.tone, 'muted', line.text)
      }
    }
  })

  it('CA13 — les lignes sont triées par section puis par seuil', async () => {
    const { LOG } = await load()
    for (let i = 1; i < LOG.length; i++) {
      const [a, b] = [LOG[i - 1]!, LOG[i]!]
      assert.ok(a.section < b.section || (a.section === b.section && a.at < b.at), `ligne ${i}`)
    }
  })
})

describe('CA13 — horodatages', () => {
  it('CA13 — logTimestamp suit `00:0${⌊i/6⌋}:${(17·i) mod 60}` sur 2 chiffres', async () => {
    const { logTimestamp } = await load()
    assert.equal(logTimestamp(0), '00:00:00')
    assert.equal(logTimestamp(1), '00:00:17')
    assert.equal(logTimestamp(3), '00:00:51')
    assert.equal(logTimestamp(4), '00:00:08')
    assert.equal(logTimestamp(6), '00:01:42')
    assert.equal(logTimestamp(18), '00:03:06')
    for (let i = 0; i < 19; i++) assert.equal(logTimestamp(i), designTimestamp(i), `index ${i}`)
  })
})

describe('CA13 — nombre de lignes émises', () => {
  it('CA13 — emittedCount franchit chaque seuil de LOG exactement à sa valeur', async () => {
    const { emittedCount } = await load()
    DESIGN_LOG.forEach((line, index) => {
      assert.equal(emittedCount(line.s, line.t), index + 1, `à ${line.t} dans la section ${line.s} (${line.txt.trim()})`)
      assert.equal(emittedCount(line.s, line.t - 0.001), index, `juste avant ${line.t} dans la section ${line.s}`)
    })
  })

  it('CA13 — rien n’est émis avant le début du défilement du hero, tout l’est à la fin du contact', async () => {
    const { emittedCount } = await load()
    assert.equal(emittedCount(0, 0), 0)
    assert.equal(emittedCount(0, 0.039), 0)
    assert.equal(emittedCount(5, 0.92), 19)
    assert.equal(emittedCount(5, 1), 19)
  })

  it('CA13 — passer à la section suivante émet tout ce qui précède, même si la progression est basse', async () => {
    const { emittedCount } = await load()
    assert.equal(emittedCount(1, 0), 2)
    assert.equal(emittedCount(2, 0), 5)
    assert.equal(emittedCount(3, 0), 9)
    assert.equal(emittedCount(4, 0), 13)
    assert.equal(emittedCount(5, 0), 17)
  })

  it('CA13 — en remontant, les lignes au-delà de la position disparaissent (même résultat que le design)', async () => {
    const { emittedCount } = await load()
    for (let active = 0; active <= 5; active++) {
      for (const p of PROGRESS_SWEEP) {
        assert.equal(emittedCount(active, p), designLogCount(active, p), `section ${active}, progression ${p}`)
      }
    }
    assert.ok(emittedCount(5, 0.5) > emittedCount(2, 0.5))
    assert.ok(emittedCount(2, 0.5) > emittedCount(0, 0.5))
  })
})

// ---------------------------------------------------------------------------
// CA5, CA6, CA8 — cadre du pipeline
// ---------------------------------------------------------------------------

describe('CA8 — paquet au repos et pulsation', () => {
  it('CA8 — hero au tout début : paquet caché, sans pulsation, trait absent', async () => {
    const { pipelineFrame } = await load()
    for (const progress of [0, 0.02, 0.04]) {
      const frame = pipelineFrame(0, progress, null, false)
      assert.equal(frame.packetVisible, false, `hero ${progress}`)
      assert.equal(frame.pulse, false, `hero ${progress}`)
      assert.equal(frame.trail, false, `hero ${progress}`)
      assert.equal(frame.packet, 0)
    }
  })

  it('CA8 — après un premier défilement du hero (> 4 %), le paquet apparaît à l’entrée et pulse', async () => {
    const { pipelineFrame } = await load()
    for (const progress of [0.05, 0.5, 1]) {
      const frame = pipelineFrame(0, progress, null, false)
      assert.equal(frame.packetVisible, true, `hero ${progress}`)
      assert.equal(frame.pulse, true, `hero ${progress}`)
      assert.equal(frame.packet, 0, `hero ${progress}`)
      assert.equal(frame.trail, false, `hero ${progress}`)
    }
  })

  it('CA8 — au tout début de l’overview ou d’un projet (< 3 %), le paquet pulse ; ensuite non', async () => {
    const { pipelineFrame } = await load()
    for (const active of [1, 2, 3, 4]) {
      assert.equal(pipelineFrame(active, 0, null, false).pulse, true, `section ${active}, 0`)
      assert.equal(pipelineFrame(active, 0.029, null, false).pulse, true, `section ${active}, 0,029`)
      assert.equal(pipelineFrame(active, 0.03, null, false).pulse, false, `section ${active}, 0,03`)
      assert.equal(pipelineFrame(active, 0.5, null, false).pulse, false, `section ${active}, 0,5`)
      assert.equal(pipelineFrame(active, 0, null, false).packetVisible, true, `section ${active}, paquet visible au repos`)
    }
  })

  it('CA8 — le contact n’a ni paquet ni pulsation', async () => {
    const { pipelineFrame } = await load()
    for (const progress of [0, 0.5, 1]) {
      const frame = pipelineFrame(5, progress, null, false)
      assert.equal(frame.packetVisible, false)
      assert.equal(frame.pulse, false)
      assert.equal(frame.trail, false)
      assert.deepEqual(frame.fills, [0, 0, 0])
    }
  })

  it('CA26 — mouvement réduit : le paquet est visible mais ne pulse jamais', async () => {
    const { pipelineFrame } = await load()
    assert.equal(pipelineFrame(0, 1, null, true).packetVisible, true)
    for (const active of [0, 1, 2, 3, 4, 5]) {
      for (const progress of [0, 0.01, 0.5, 1]) {
        assert.equal(pipelineFrame(active, progress, null, true).pulse, false, `section ${active}, ${progress}`)
      }
    }
  })
})

describe('CA6 — paquet et remplissages (boîtes par défaut du design)', () => {
  // Boîtes par défaut : [24, 32], [46, 54], [68, 76], fin à 100. Poids : 60 + 11,2 + 35 + 11,2 + 35 + 11,2 + 60 = 223,6.
  const L = 223.6

  it('CA6 — au début, le paquet est à l’entrée du pipeline, le trait est actif, rien n’est rempli', async () => {
    const { pipelineFrame } = await load()
    const frame = pipelineFrame(1, 0, null, false)
    assert.equal(frame.packet, 0)
    assert.equal(frame.packetVisible, true)
    assert.equal(frame.trail, true)
    assert.deepEqual(frame.fills, [0, 0, 0])
    assert.equal(frame.stage, 0)
  })

  it('CA6 — le paquet roule vers le premier cadre : position linéaire en pourcentage', async () => {
    const { pipelineFrame } = await load()
    const frame = pipelineFrame(2, 30 / L, null, false)
    near(frame.packet, 12, 'paquet à mi-chemin du premier cadre')
    assert.equal(frame.packetVisible, true)
    assert.deepEqual(frame.fills, [0, 0, 0])
  })

  it('CA6 — au passage d’un cadre, le paquet se cache et le cadre se remplit', async () => {
    const { pipelineFrame } = await load()
    // 2,8 sur 11,2 de poids dans le premier cadre : remplissage à 25 %.
    const frame = pipelineFrame(2, (60 + 2.8) / L, null, false)
    near(frame.fills[0], 25, 'remplissage du premier cadre')
    assert.equal(frame.fills[1], 0)
    assert.equal(frame.packetVisible, false)
    assert.equal(frame.packet, 24)
    assert.equal(frame.stage, 0)
    // bordures : 30,5 sur 122 de périmètre parcouru.
    near(frame.edges[0]!.ent, 1, 'entrée du premier cadre')
    near(frame.edges[0]!.fill, (30.5 - 16) / 90, 'corps du premier cadre')
    near(frame.edges[0]!.ext, 0, 'sortie du premier cadre')
  })

  it('CA6 — à la moitié du cadre, le paquet est considéré sorti à droite', async () => {
    const { pipelineFrame } = await load()
    const frame = pipelineFrame(2, (60 + 6) / L, null, false)
    assert.equal(frame.packet, 32)
    assert.equal(frame.packetVisible, false)
  })

  it('CA6 — après un cadre, le paquet repart du bord droit et le cadre reste rempli', async () => {
    const { pipelineFrame } = await load()
    const frame = pipelineFrame(3, (60 + 11.2 + 17.5) / L, null, false)
    assert.deepEqual(frame.fills, [100, 0, 0])
    near(frame.packet, 39, 'paquet entre le premier et le deuxième cadre')
    assert.equal(frame.packetVisible, true)
    assert.equal(frame.stage, 0)
  })

  it('CA5 — l’étape passe de ingest à build puis deploy à mesure que les cadres se remplissent', async () => {
    const { pipelineFrame } = await load()
    assert.equal(pipelineFrame(2, 0.1, null, false).stage, 0)
    assert.equal(pipelineFrame(2, 0.4, null, false).stage, 0)
    assert.equal(pipelineFrame(2, 0.5, null, false).stage, 1)
    assert.equal(pipelineFrame(2, 0.6, null, false).stage, 1)
    assert.equal(pipelineFrame(2, 0.7, null, false).stage, 2)
    assert.equal(pipelineFrame(2, 1, null, false).stage, 2)
  })

  it('CA6 — à la fin, tout est rempli et le paquet sort du pipeline', async () => {
    const { pipelineFrame } = await load()
    const frame = pipelineFrame(4, 1, null, false)
    assert.deepEqual(frame.fills, [100, 100, 100])
    assert.equal(frame.packet, 100)
    assert.equal(frame.packetVisible, true)
    assert.equal(frame.trail, true)
    for (const edge of frame.edges) {
      near(edge.ent, 1, 'entrée')
      near(edge.fill, 1, 'corps')
      near(edge.ext, 1, 'sortie')
    }
  })

  it('CA6 — l’overview utilise le même cadre que les projets', async () => {
    const { pipelineFrame } = await load()
    assert.deepEqual(pipelineFrame(1, 0.8, null, false), pipelineFrame(2, 0.8, null, false))
  })

  it('CA6 — à l’aller comme au retour, le cadre ne dépend que de la progression (le paquet et les remplissages reculent)', async () => {
    const { pipelineFrame } = await load()
    const forward = PROGRESS_SWEEP.map((p) => pipelineFrame(3, p, null, false))
    const backward = [...PROGRESS_SWEEP].reverse().map((p) => pipelineFrame(3, p, null, false)).reverse()
    assert.deepEqual(backward, forward)
    // le paquet ne recule jamais quand on avance.
    for (let i = 1; i < forward.length; i++) {
      assert.ok(forward[i]!.packet >= forward[i - 1]!.packet - EPS, `paquet à ${PROGRESS_SWEEP[i]}`)
      for (let k = 0; k < 3; k++) assert.ok(forward[i]!.fills[k]! >= forward[i - 1]!.fills[k]! - EPS)
    }
    assert.ok(forward.at(-1)!.packet > forward[0]!.packet)
  })
})

describe('CA6 — même résultat que le design avec des boîtes mesurées', () => {
  const cases: [string, DesignBox[] | null][] = [
    ['boîtes par défaut (null)', null],
    ['bandeau', BAR_BOXES],
    ['rail', RAIL_BOXES],
    ['boîtes sans dimensions', DEFAULT_BOXES.map(([a, b]) => [a, b, 0, 0] as DesignBox)],
  ]
  for (const [label, boxes] of cases) {
    it(`CA6 — ${label} : paquet, remplissages, bordures et étape`, async () => {
      const { pipelineFrame } = await load()
      for (const active of [0, 1, 2, 3, 4, 5]) {
        for (const reduced of [false, true]) {
          for (const p of PROGRESS_SWEEP) {
            const actual = pipelineFrame(active, p, boxes, reduced)
            const expected = designFrame(active, p, boxes, reduced)
            const where = `section ${active}, progression ${p}, réduit ${reduced}`
            near(actual.packet, expected.packet, `paquet (${where})`)
            assert.equal(actual.packetVisible, expected.packetVisible, `paquet visible (${where})`)
            assert.equal(actual.trail, expected.trail, `trait (${where})`)
            assert.equal(actual.pulse, expected.pulse, `pulsation (${where})`)
            assert.equal(actual.stage, expected.stage, `étape (${where})`)
            for (let k = 0; k < 3; k++) {
              near(actual.fills[k]!, expected.fills[k]!, `remplissage ${k} (${where})`)
              near(actual.edges[k]!.ent, expected.edges[k]!.ent, `entrée ${k} (${where})`)
              near(actual.edges[k]!.fill, expected.edges[k]!.fill, `corps ${k} (${where})`)
              near(actual.edges[k]!.ext, expected.edges[k]!.ext, `sortie ${k} (${where})`)
            }
          }
        }
      }
    })
  }
})

// ---------------------------------------------------------------------------
// CA17 — étape de la ligne « event <nom> → »
// ---------------------------------------------------------------------------

describe('CA17 — étape de chaque projet', () => {
  it('CA17 — pendant son projet, l’étape suit celle du pipeline', async () => {
    const { projectStage } = await load()
    for (const project of [0, 1, 2] as const) {
      for (const stage of [0, 1, 2] as const) {
        assert.equal(projectStage(project, project + 2, stage, 0.5), stage, `projet ${project}, étape ${stage}`)
        assert.equal(projectStage(project, project + 2, stage, 0.05), stage, `projet ${project}, étape ${stage}`)
      }
    }
  })

  it('CA17 — un projet déjà passé affiche deploy, un projet à venir affiche ingest', async () => {
    const { projectStage } = await load()
    assert.equal(projectStage(0, 3, 1, 1), 2)
    assert.equal(projectStage(1, 4, 0, 1), 2)
    assert.equal(projectStage(1, 2, 2, 0), 0)
    assert.equal(projectStage(2, 3, 1, 0), 0)
  })

  it('CA17 — hors section active, l’étape suit les seuils 20 % et 50 % de la progression du projet', async () => {
    const { projectStage } = await load()
    assert.equal(projectStage(0, 1, 0, 0.19), 0)
    assert.equal(projectStage(0, 1, 0, 0.2), 1)
    assert.equal(projectStage(0, 1, 0, 0.49), 1)
    assert.equal(projectStage(0, 1, 0, 0.5), 2)
    assert.equal(projectStage(0, 1, 0, 1), 2)
  })

  it('CA17 — même résultat que le design', async () => {
    const { projectStage } = await load()
    for (const project of [0, 1, 2] as const) {
      for (let active = 0; active <= 5; active++) {
        for (const stage of [0, 1, 2] as const) {
          for (const p of PROGRESS_SWEEP) {
            assert.equal(
              projectStage(project, active, stage, p),
              designProjectStage(project, active, stage, p),
              `projet ${project}, section ${active}, étape ${stage}, progression ${p}`,
            )
          }
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// CA23 — trajectoire du contact
// ---------------------------------------------------------------------------

describe('CA23 — convergence et trajectoire du portrait', () => {
  const geometry: DesignContactGeometry = { sx: 160, sy: 40, ex: 640, ey: 180 }

  it('CA23 — les trois points convergent entre 0 et 34 % de la progression, puis disparaissent', async () => {
    const { contactFrame } = await load()
    near(contactFrame(0, geometry).converge, 0, 'convergence au début')
    near(contactFrame(0.17, geometry).converge, 0.5, 'à mi-convergence')
    near(contactFrame(0.34, geometry).converge, 1, 'convergence à 34 %')
    near(contactFrame(1, geometry).converge, 1, 'convergence à la fin')
    assert.equal(contactFrame(0, geometry).dotsVisible, true)
    assert.equal(contactFrame(0.339, geometry).dotsVisible, true)
    assert.equal(contactFrame(0.34, geometry).dotsVisible, false)
    assert.equal(contactFrame(0.9, geometry).dotsVisible, false)
  })

  it('CA23 — le portrait n’apparaît qu’une fois les points convergés, et seulement si la géométrie est connue', async () => {
    const { contactFrame } = await load()
    assert.equal(contactFrame(0.2, geometry).visible, false)
    assert.equal(contactFrame(0.34, geometry).visible, true)
    assert.equal(contactFrame(0.6, geometry).visible, true)
    assert.equal(contactFrame(0.6, null).visible, false)
    assert.equal(contactFrame(1, null).visible, false)
  })

  it('CA23 — sans géométrie, le portrait reste à l’origine', async () => {
    const { contactFrame } = await load()
    for (const p of [0, 0.4, 0.7, 1]) {
      const frame = contactFrame(p, null)
      near(frame.x, 0, 'x sans géométrie')
      near(frame.y, 0, 'y sans géométrie')
    }
  })

  it('CA23 — le portrait recule (−10 px, +22 px) entre 36 % et 52 %, avant de partir', async () => {
    const { contactFrame } = await load()
    const start = contactFrame(0.34, geometry)
    near(start.x, 160, 'x au départ')
    near(start.y, 40, 'y au départ')
    const pulled = contactFrame(0.52, geometry)
    near(pulled.x, 150, 'x après le recul')
    near(pulled.y, 62, 'y après le recul')
    assert.equal(pulled.landed, false)
    // le recul ralentit (courbe cubique) : plus de la moitié est parcourue à mi-chemin.
    const half = contactFrame(0.44, geometry)
    assert.ok(Math.abs(half.y - 40) > 11, 'recul à mi-chemin supérieur à la moitié')
  })

  it('CA23 — le portrait atterrit sur l’emplacement final à 80 % de la progression', async () => {
    const { contactFrame } = await load()
    const landed = contactFrame(0.8, geometry)
    assert.equal(landed.landed, true)
    near(landed.x, 640, 'x à l’atterrissage')
    near(landed.y, 180, 'y à l’atterrissage')
    const end = contactFrame(1, geometry)
    assert.equal(end.landed, true)
    near(end.x, 640, 'x à la fin')
    near(end.y, 180, 'y à la fin')
    assert.equal(contactFrame(0.79, geometry).landed, false)
  })

  it('CA23 — en vol, la trajectoire est une parabole qui passe au-dessus de la ligne droite', async () => {
    const { contactFrame } = await load()
    const mid = contactFrame(0.67, geometry)
    const expected = designContact(0.67, geometry)
    near(mid.x, expected.x, 'x en vol')
    near(mid.y, expected.y, 'y en vol')
    const pull = { x: 150, y: 62 }
    const straight = { y: pull.y + (geometry.ey - pull.y) * 0.75 }
    assert.ok(mid.y < straight.y - 20, 'le portrait passe au-dessus de la droite')
  })

  it('CA23 — l’animation se joue à l’envers en remontant : mêmes valeurs pour une même progression', async () => {
    const { contactFrame } = await load()
    const forward = PROGRESS_SWEEP.map((p) => contactFrame(p, geometry))
    const backward = [...PROGRESS_SWEEP].reverse().map((p) => contactFrame(p, geometry)).reverse()
    assert.deepEqual(backward, forward)
    assert.equal(forward[0]!.dotsVisible, true)
    assert.equal(forward[0]!.visible, false)
  })

  it('CA23 — même résultat que le design sur un balayage, avec et sans géométrie, vers le haut et vers le bas', async () => {
    const { contactFrame } = await load()
    const geometries: (DesignContactGeometry | null)[] = [
      geometry,
      { sx: 100, sy: 300, ex: 500, ey: 120 },
      { sx: 90, sy: 40, ex: 300, ey: 400 },
      null,
    ]
    for (const g of geometries) {
      for (const p of PROGRESS_SWEEP) {
        const actual = contactFrame(p, g)
        const expected = designContact(p, g)
        const where = `géométrie ${JSON.stringify(g)}, progression ${p}`
        near(actual.converge, expected.converge, `convergence (${where})`)
        near(actual.x, expected.x, `x (${where})`, 0.05)
        near(actual.y, expected.y, `y (${where})`, 0.05)
        assert.equal(actual.dotsVisible, expected.dotsVisible, `points (${where})`)
        assert.equal(actual.visible, expected.visible, `portrait visible (${where})`)
        assert.equal(actual.landed, expected.landed, `atterri (${where})`)
      }
    }
  })
})
