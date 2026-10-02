import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronUp } from "@carbon/icons-react"

import { LOG, logTimestamp, type Tone } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const TONE_CLASS: Record<Tone, string> = {
  event: "text-foreground",
  muted: "text-muted-foreground",
  spotime: "text-spotime",
  "fraud-engine": "text-fraud-engine",
  "event-hub": "text-event-hub",
}

export function Terminal({ count }: { count: number }) {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const lines = LOG.slice(0, count)
  const last = lines.at(-1)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Ouvert, le panneau est calé en bas, à l'ouverture puis à chaque nouvelle ligne si on est près du bas.
  const lastHeight = useRef<number | null>(null)
  useLayoutEffect(() => {
    const el = panel.current
    if (!el || !open) {
      lastHeight.current = null
      return
    }
    // Près du bas avant l'arrivée des nouvelles lignes : on reste calé en bas.
    const near =
      lastHeight.current !== null &&
      lastHeight.current - el.scrollTop - el.clientHeight < 80
    if (lastHeight.current === null || near) el.scrollTop = el.scrollHeight
    lastHeight.current = el.scrollHeight
  }, [open, count])

  return (
    <div className="fixed right-0 bottom-0 left-rail z-20 flex flex-col border-t border-border bg-surface-deep font-mono labels:left-rail-wide bar:left-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "close event log" : "open event log"}
        aria-expanded={open}
        aria-controls="event-log"
        className="absolute bottom-full left-1/2 flex size-7 -translate-x-1/2 items-center justify-center border border-border border-b-surface-deep bg-surface-deep text-muted-foreground hover:text-foreground"
      >
        <ChevronUp
          aria-hidden
          className={cn(
            "size-3.5 transition-transform duration-250",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        id="event-log"
        ref={panel}
        inert={!open}
        className={cn(
          "h-0 overflow-y-auto overscroll-contain bg-surface-deep transition-height",
          open && "h-log-panel"
        )}
      >
        <div className="flex flex-col gap-0.5 px-5 py-3.5 text-xs leading-5">
          <div className="mb-2 text-small text-foreground-faint">
            events.log · history · scroll the page to emit more
          </div>
          {/* Les espaces séparent les lignes dans le texte brut (lecture, copie). */}{" "}
          {lines.map((line, i) => (
            <div key={i} className="flex min-w-0 gap-3">
              <span className="flex-none text-foreground-faint">
                {logTimestamp(i)}
              </span>{" "}
              <span
                className={cn(
                  "min-w-0 whitespace-pre-wrap",
                  TONE_CLASS[line.tone]
                )}
              >
                {line.text}
              </span>{" "}
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "flex h-8.75 items-center gap-5 overflow-hidden border-t border-transparent bg-surface-deep px-5 py-2 text-xs leading-5",
          open && "border-border"
        )}
      >
        <span className="text-small whitespace-nowrap text-foreground-faint">
          events.log · {count}
        </span>
        {last ? (
          <div className="flex min-w-0 gap-3 overflow-hidden text-ellipsis whitespace-pre">
            <span className="text-foreground-faint">
              {logTimestamp(count - 1)}
            </span>
            <span className={TONE_CLASS[last.tone]}>{last.text}</span>
          </div>
        ) : null}
        <span className="inline-block h-3.5 w-2 flex-none bg-foreground-secondary motion-safe:animate-blink" />
      </div>
    </div>
  )
}
