import { useEffect, useMemo, useRef, useState } from "react"

import { Contact } from "@/components/contact"
import { Hero } from "@/components/hero"
import { Overview } from "@/components/overview"
import { Pipeline } from "@/components/pipeline"
import { Project } from "@/components/project"
import { Terminal } from "@/components/terminal"
import { PROJECTS } from "@/lib/content"
import {
  activeSection,
  contactFrame,
  emittedCount,
  pipelineFrame,
  projectStage,
  sectionProgress,
  type Box,
  type ContactGeometry,
} from "@/lib/pipeline"

const SECTIONS = [
  "hero",
  "overview",
  "spotime",
  "fraud-engine",
  "event-hub",
  "contact",
] as const

/** Valeurs discrètes : l'état React ne change que quand l'une d'elles change. Les valeurs continues passent par des variables CSS. */
interface View {
  active: number
  stage: 0 | 1 | 2
  filled: boolean[]
  pulse: boolean
  count: number
  projectStages: (0 | 1 | 2)[]
  scrolled: boolean
  landed: boolean
}

// État final : celui du HTML prérendu et du premier rendu.
const INITIAL: View = {
  active: 0,
  stage: 0,
  filled: [false, false, false],
  pulse: false,
  count: 0,
  projectStages: [2, 2, 2],
  scrolled: false,
  landed: true,
}

const sameView = (a: View, b: View) => JSON.stringify(a) === JSON.stringify(b)

// Diamètre du point que le portrait est avant d'atterrir, en px.
const DOT = 14

export function Home() {
  const [view, setView] = useState(INITIAL)
  const [live, setLive] = useState(false)
  const pipeline = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const frames = useRef<(HTMLDivElement | null)[]>([])
  const main = useRef<HTMLElement>(null)
  const outro = useRef<HTMLDivElement>(null)
  const dots = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const frameRefs = useMemo(
    () =>
      [0, 1, 2].map((i) => (el: HTMLDivElement | null) => {
        frames.current[i] = el
      }),
    []
  )

  // Contrôleur de défilement : formules de src/lib/pipeline.ts, valeurs continues écrites en variables CSS.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const sections = SECTIONS.map(
      (name) =>
        main.current?.querySelector<HTMLElement>(`[data-section="${name}"]`) ??
        null
    )
    const stickies = sections.map(
      (section) => section?.querySelector<HTMLElement>("[data-sticky]") ?? null
    )

    const written = new WeakMap<Element, Map<string, string>>()
    const write = (el: HTMLElement | null, name: string, value: string) => {
      if (!el) return
      let known = written.get(el)
      if (!known) written.set(el, (known = new Map()))
      if (known.get(name) === value) return
      known.set(name, value)
      el.style.setProperty(name, value)
    }

    // Géométrie des cadres d'étapes, en % de la ligne : relue seulement quand la mise en page change.
    let boxes: Box[] | null = null
    // Côté de l'emplacement du portrait : le point qu'il est avant d'atterrir en est la réduction à 14 px.
    let slotSize = 0
    const measureBoxes = () => {
      slotSize = slot.current?.offsetWidth ?? 0
      const line = row.current?.getBoundingClientRect()
      const cells = frames.current
      if (!line || cells.length < 3) {
        boxes = null
        return
      }
      const horizontal = line.width > line.height
      const origin = horizontal ? line.left : line.top
      const length = horizontal ? line.width : line.height
      const measured = cells.map((el): Box | null => {
        const r = el?.getBoundingClientRect()
        if (!r) return null
        return horizontal
          ? [
              ((r.left - origin) / length) * 100,
              ((r.right - origin) / length) * 100,
              r.width,
              r.height,
            ]
          : [
              ((r.top - origin) / length) * 100,
              ((r.bottom - origin) / length) * 100,
              r.height,
              r.width,
            ]
      })
      boxes = length > 0 && measured.every(Boolean) ? (measured as Box[]) : null
    }

    const contactGeometry = (): ContactGeometry | null => {
      const o = outro.current?.getBoundingClientRect()
      const d = dots.current?.getBoundingClientRect()
      const s = slot.current?.getBoundingClientRect()
      if (!o || !d || !s) return null
      return {
        sx: d.left + d.width / 2 - o.left,
        sy: d.top + d.height / 2 - o.top,
        ex: s.left + s.width / 2 - o.left,
        ey: s.top + s.height / 2 - o.top,
      }
    }

    const update = () => {
      const vh = window.innerHeight
      const rects = sections.map((el) => el?.getBoundingClientRect())
      const tops = rects.map((r) => r?.top ?? 0)
      const active = activeSection(tops, vh)
      const progress = rects.map((r, i) =>
        sectionProgress(
          i,
          r?.top ?? 0,
          r?.height ?? 0,
          stickies[i]?.getBoundingClientRect().height ?? 0,
          vh,
          reduced
        )
      )
      const current = progress[active] ?? 0
      const pf = pipelineFrame(active, current, boxes, reduced)

      write(pipeline.current, "--packet", `${pf.packet.toFixed(2)}%`)
      write(
        pipeline.current,
        "--trail",
        pf.trail ? (pf.packet / 100).toFixed(4) : "0"
      )
      write(pipeline.current, "--packet-op", pf.packetVisible ? "1" : "0")
      frames.current.forEach((el, i) => {
        const edge = pf.edges[i]
        write(el, "--ent", edge.ent.toFixed(3))
        write(el, "--fill", edge.fill.toFixed(3))
        write(el, "--ext", edge.ext.toFixed(3))
      })
      for (const i of [1, 2, 3, 4]) {
        write(sections[i] ?? null, "--p", (progress[i] ?? 0).toFixed(4))
      }

      // Mouvement réduit : le contact reste dans son état final (valeurs par défaut du CSS).
      let landed = true
      if (!reduced) {
        const geometry = (rects[5]?.top ?? vh) <= vh ? contactGeometry() : null
        const contact = contactFrame(progress[5] ?? 0, geometry)
        landed = contact.landed
        const target = outro.current
        write(target, "--converge", contact.converge.toFixed(4))
        write(target, "--dots-op", contact.dotsVisible ? "1" : "0")
        write(target, "--tv-op", contact.visible ? "1" : "0")
        write(
          target,
          "--tv-x",
          `${geometry ? (contact.x - geometry.ex).toFixed(1) : 0}px`
        )
        write(
          target,
          "--tv-y",
          `${geometry ? (contact.y - geometry.ey).toFixed(1) : 0}px`
        )
        write(
          target,
          "--tv-scale",
          landed || !slotSize ? "1" : (DOT / slotSize).toFixed(4)
        )
      }

      const next = {
        active,
        stage: pf.stage,
        filled: pf.fills.map((f) => f >= 99.5),
        pulse: pf.pulse,
        count: emittedCount(active, current),
        projectStages: ([0, 1, 2] as const).map((i) =>
          projectStage(i, active, pf.stage, progress[i + 2] ?? 0)
        ),
        landed,
      }
      const scrolled = window.scrollY > 20
      setView((prev) => {
        const merged = { ...next, scrolled: prev.scrolled || scrolled }
        return sameView(prev, merged) ? prev : merged
      })
    }

    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        update()
      })
    }
    const relayout = () => {
      measureBoxes()
      schedule()
    }

    measureBoxes()
    update()
    // Les libellés ne roulent qu'après la première mesure : elle ne fait que passer du HTML prérendu à la position réelle.
    const settle = requestAnimationFrame(() =>
      requestAnimationFrame(() => setLive(true))
    )
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", relayout)
    window.addEventListener("load", relayout)
    void document.fonts.ready.then(relayout)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(settle)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", relayout)
      window.removeEventListener("load", relayout)
    }
  }, [])

  return (
    <>
      <Pipeline
        active={view.active}
        stage={view.stage}
        filled={view.filled}
        pulse={view.pulse}
        silent={!live}
        rootRef={pipeline}
        rowRef={row}
        frameRefs={frameRefs}
      />
      <Terminal count={view.count} />
      <main
        ref={main}
        className="overflow-x-clip pl-rail labels:pl-rail-wide bar:pl-0"
      >
        <Hero scrolled={view.scrolled} />
        <Overview />
        {PROJECTS.map((project, i) => (
          <Project
            key={project.slug}
            project={project}
            stage={view.projectStages[i] ?? 2}
            silent={!live}
          />
        ))}
        <Contact refs={{ outro, dots, slot }} landed={view.landed} />
      </main>
    </>
  )
}
