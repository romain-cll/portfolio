import { useEffect, useRef, useState } from "react"
import type { CSSProperties, RefObject } from "react"
import { ArrowUpRight, Checkmark, Copy } from "@carbon/icons-react"

import { EMAIL } from "@/lib/content"
import { cn } from "@/lib/utils"

const DOTS = ["bg-spotime", "bg-fraud-engine", "bg-event-hub"] as const
const LINK = "border border-border px-4 py-3 text-foreground no-underline"

export interface ContactRefs {
  /** Contenu fixé : origine des coordonnées. */
  outro: RefObject<HTMLDivElement | null>
  dots: RefObject<HTMLDivElement | null>
  slot: RefObject<HTMLDivElement | null>
}

export function Contact({
  refs,
  landed,
}: {
  refs: ContactRefs
  /** Le portrait a atterri : son image apparaît en fondu. */
  landed: boolean
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = () => {
    // Sans API presse-papiers (contexte non sécurisé) : ni erreur ni mention `copied`.
    const clipboard = navigator.clipboard as Clipboard | undefined
    if (!clipboard) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
    // Écriture refusée : on retire aussitôt la mention d'une copie qui n'a pas eu lieu.
    clipboard.writeText(EMAIL).catch(() => {
      clearTimeout(timer.current)
      setCopied(false)
    })
  }

  return (
    <section
      id="contact"
      data-section="contact"
      className="relative h-section-short tone-contact"
    >
      <div data-sticky className="sticky top-0 bar:pt-bar">
        <div
          ref={refs.outro}
          className="flex min-h-stage flex-col items-start justify-center-safe gap-contact-gap px-gutter pt-contact pb-contact-bottom"
        >
          <div
            ref={refs.dots}
            className="relative h-12 w-80 max-w-full flex-none"
          >
            {DOTS.map((color, i) => (
              <span
                key={color}
                className={cn(
                  "absolute top-1/2 left-1/2 -mt-1.75 -ml-1.75 size-3.5 dot-spread rounded-full",
                  color
                )}
                style={{ "--dx": i - 1 } as CSSProperties}
              />
            ))}
          </div>
          <div className="font-mono text-annotation text-muted-foreground">
            // 3 events · 1 sink
          </div>
          <div className="flex items-center gap-contact-inline">
            <h2 className="max-w-narrow text-title-contact text-balance">
              This is what I do. Let&apos;s talk.
            </h2>
            <div ref={refs.slot} className="relative size-avatar flex-none">
              <span
                role="img"
                aria-label="Portrait of Romain Caillé"
                className="pointer-events-none absolute inset-0 z-10 portrait-fly overflow-hidden rounded-full bg-foreground"
              >
                <img
                  src="/media/portrait-color.webp"
                  alt=""
                  width={192}
                  height={192}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "size-full object-cover transition-opacity delay-100 duration-350",
                    landed ? "opacity-100" : "opacity-0"
                  )}
                />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 font-mono text-annotation">
            <button
              type="button"
              onClick={copy}
              aria-label={`copy email address ${EMAIL}`}
              className="flex items-center gap-3 border border-foreground bg-foreground px-4 py-3 text-background hover:bg-foreground-strong"
            >
              <span>{EMAIL}</span>
              <span className="relative size-3.5 flex-none">
                <Copy
                  aria-hidden
                  className={cn(
                    "absolute inset-0 size-full",
                    copied && "opacity-0"
                  )}
                />
                <Checkmark
                  aria-hidden
                  className={cn(
                    "absolute inset-0 size-full",
                    !copied && "opacity-0"
                  )}
                />
              </span>
              <span
                className={cn(
                  "-ml-3 max-w-0 overflow-hidden text-small whitespace-nowrap opacity-0 transition-all duration-200",
                  copied && "ml-0 max-w-16 opacity-100"
                )}
              >
                copied
              </span>
            </button>
            <a href="https://gitlab.com/romain.caille" className={LINK}>
              gitlab
              <ArrowUpRight className="icon-inline" aria-hidden />
            </a>
            <a
              href="https://www.linkedin.com/in/romain-caill%C3%A9/"
              className={LINK}
            >
              linkedin
              <ArrowUpRight className="icon-inline" aria-hidden />
            </a>
            <a href="/cv.pdf" className={LINK}>
              resume.pdf
              <ArrowUpRight className="icon-inline" aria-hidden />
            </a>
          </div>
          <div className="font-mono text-xs text-foreground-faint">
            Most of my GitLab work is in private repositories.
          </div>
        </div>
      </div>
    </section>
  )
}
