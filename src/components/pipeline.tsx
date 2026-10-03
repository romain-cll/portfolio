import type { Ref } from "react"

import { RollLabel } from "@/components/roll-label"
import { PHASES, STAGES } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "spotime", section: 2, tone: "tone-spotime" },
  { label: "fraud-engine", section: 3, tone: "tone-fraud-engine" },
  { label: "event-hub", section: 4, tone: "tone-event-hub" },
  { label: "contact", section: 5, tone: "tone-contact" },
] as const

/** Couleur de la section active : accent du projet pendant un projet, texte secondaire sinon. */
const TONES = [
  "",
  "",
  "tone-spotime",
  "tone-fraud-engine",
  "tone-event-hub",
  "",
] as const

const EDGE = "absolute bg-tone"
// Bandeau : le cadre se remplit par ses bords gauche, haut et bas, puis droit.
const BAR_EDGES = [
  "-left-px bottom-1/2 h-1/2 w-px origin-bottom scale-y-(--ent)",
  "-left-px top-1/2 h-1/2 w-px origin-top scale-y-(--ent)",
  "-top-px -right-px -left-px h-px origin-left scale-x-(--fill)",
  "-right-px -bottom-px -left-px h-px origin-left scale-x-(--fill)",
  "-top-px -right-px h-1/2 w-px origin-top scale-y-(--ext)",
  "-right-px -bottom-px h-1/2 w-px origin-bottom scale-y-(--ext)",
]
// Rail : même parcours, tourné d'un quart de tour.
const RAIL_EDGES = [
  "-top-px right-1/2 h-px w-1/2 origin-right scale-x-(--ent)",
  "-top-px left-1/2 h-px w-1/2 origin-left scale-x-(--ent)",
  "-top-px -bottom-px -left-px w-px origin-top scale-y-(--fill)",
  "-top-px -right-px -bottom-px w-px origin-top scale-y-(--fill)",
  "-bottom-px -left-px h-px w-1/2 origin-left scale-x-(--ext)",
  "-right-px -bottom-px h-px w-1/2 origin-right scale-x-(--ext)",
]

export function Pipeline({
  active,
  stage,
  filled,
  pulse,
  silent,
  rootRef,
  rowRef,
  frameRefs,
}: {
  active: number
  stage: 0 | 1 | 2
  filled: boolean[]
  pulse: boolean
  silent: boolean
  rootRef: Ref<HTMLDivElement>
  rowRef: Ref<HTMLDivElement>
  frameRefs: Ref<HTMLDivElement>[]
}) {
  const inProject = active >= 2 && active <= 4
  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed top-0 left-0 z-20 flex h-dvh w-rail flex-col border-r border-border bg-veil-92 py-6 pipeline-state labels:w-rail-wide bar:inset-x-0 bar:grid bar:h-bar bar:w-auto bar:grid-cols-bar bar:items-center bar:gap-5 bar:border-r-0 bar:border-b bar:px-6 bar:py-0 bar:backdrop-blur-sm",
        TONES[active]
      )}
    >
      <div className="hidden flex-col gap-1 px-5 pb-5 font-mono text-xs text-muted-foreground labels:flex bar:p-0">
        <span className="font-medium text-foreground">romain@portfolio</span>
        <span className="flex gap-ch whitespace-nowrap">
          <span className="hidden bar:inline">pipeline ·</span>
          <RollLabel value={PHASES[active]} rank={active} silent={silent} />
        </span>
        <span className="flex whitespace-nowrap">
          <RollLabel
            value={inProject ? STAGES[stage] : ""}
            rank={active * 3 + stage}
            silent={silent}
          />
        </span>
      </div>
      <div
        ref={rowRef}
        className="relative flex flex-1 flex-col items-center py-0.5 labels:py-2 bar:h-16 bar:flex-none bar:flex-row bar:px-pipeline-inline bar:py-0"
      >
        <span
          aria-hidden
          className="absolute top-0 left-1/2 z-10 h-full w-px origin-top scale-y-(--trail) bg-tone bar:top-1/2 bar:left-0 bar:h-px bar:w-full bar:origin-left bar:scale-x-(--trail) bar:scale-y-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 translate-y-(--packet) bar:translate-x-(--packet) bar:translate-y-0"
        >
          <span
            className={cn(
              "absolute top-0 left-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full bg-tone text-tone opacity-(--packet-op) transition-opacity duration-150 bar:top-1/2 bar:left-0",
              pulse && "motion-safe:animate-packet-pulse"
            )}
          />
        </span>
        {STAGES.map((name, i) => (
          <div key={name} className="contents">
            <span
              aria-hidden
              className="relative z-0 min-h-6 w-px flex-1 bg-border bar:h-px bar:min-h-0 bar:w-auto bar:min-w-5"
            />
            <div
              ref={frameRefs[i]}
              className={cn(
                "relative z-20 border border-border bg-background px-1 py-1.5 font-mono text-small tracking-label uppercase transition-colors duration-200 stage-frame writing-vertical labels:px-2 bar:px-3.5 bar:py-2 bar:text-xs",
                filled[i] ? "text-tone" : "text-foreground-faint"
              )}
            >
              {BAR_EDGES.map((edge) => (
                <span
                  key={edge}
                  aria-hidden
                  className={cn(EDGE, "hidden bar:block", edge)}
                />
              ))}
              {RAIL_EDGES.map((edge) => (
                <span
                  key={edge}
                  aria-hidden
                  className={cn(EDGE, "block bar:hidden", edge)}
                />
              ))}
              {name}
            </div>
          </div>
        ))}
        <span
          aria-hidden
          className="relative z-0 min-h-6 w-px flex-1 bg-border bar:h-px bar:min-h-0 bar:w-auto bar:min-w-5"
        />
      </div>
      <nav
        aria-label="sections"
        className="hidden flex-col gap-2 px-5 pt-5 font-mono text-small labels:flex bar:flex-row bar:justify-end bar:gap-3.5 bar:p-0"
      >
        {LINKS.map(({ label, section, tone }) => {
          const current = active === section
          return (
            <a
              key={label}
              href={`#${label}`}
              aria-current={current ? "true" : undefined}
              className={cn(
                "whitespace-nowrap bar:border-b bar:pb-0.5",
                current
                  ? cn(tone, "text-tone bar:border-tone")
                  : "text-muted-foreground bar:border-transparent"
              )}
            >
              {label}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
