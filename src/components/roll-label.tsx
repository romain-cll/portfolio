import { useState } from "react"
import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

interface Rolling {
  cur: string
  prev: string
  key: number
  rank: number
  back: boolean
  animate: boolean
}

function Letters({ text, className }: { text: string; className: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none col-start-1 row-start-1 block whitespace-nowrap"
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={cn("inline-block whitespace-pre", className)}
          style={{ "--i": i } as CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

/**
 * Libellé qui roule lettre par lettre quand sa valeur change. Un rang inférieur au précédent veut dire
 * qu'on remonte : le roulement part dans l'autre sens. `silent` change la valeur sans l'animer.
 */
export function RollLabel({
  value,
  rank,
  silent = false,
}: {
  value: string
  rank: number
  silent?: boolean
}) {
  const [state, setState] = useState<Rolling>({
    cur: value,
    prev: "",
    key: 0,
    rank,
    back: false,
    animate: false,
  })
  let shown = state
  if (state.cur !== value) {
    shown = {
      cur: value,
      prev: silent ? "" : state.cur,
      key: state.key + 1,
      rank,
      back: rank < state.rank,
      animate: !silent,
    }
    setState(shown)
  }

  return (
    <span
      key={shown.key}
      className="relative inline-grid min-h-lh overflow-hidden align-bottom leading-tight"
    >
      <span className="sr-only">{shown.cur}</span>
      <Letters
        text={shown.cur}
        className={
          shown.animate
            ? shown.back
              ? "motion-safe:animate-roll-in-down"
              : "motion-safe:animate-roll-in"
            : ""
        }
      />
      {shown.prev ? (
        <span
          // L'ancien libellé est retiré une fois masqué : plus aucune animation ne reste en cours.
          onAnimationEnd={(event) => {
            if (event.animationName === "roll-hold") {
              setState({ ...shown, prev: "" })
            }
          }}
          className="pointer-events-none col-start-1 row-start-1 motion-safe:animate-roll-hold motion-reduce:hidden"
        >
          <Letters
            text={shown.prev}
            className={
              shown.back
                ? "motion-safe:animate-roll-out-down"
                : "motion-safe:animate-roll-out"
            }
          />
        </span>
      ) : null}
    </span>
  )
}
