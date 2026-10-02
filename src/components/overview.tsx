import { Reveal } from "@/components/reveal"
import { ANNOTATIONS } from "@/lib/content"

export function Overview() {
  return (
    <section data-section="overview" className="h-section-long">
      <div data-sticky className="sticky top-0 bar:pt-bar">
        <div className="flex h-stage flex-col justify-center gap-10 px-gutter">
          <div className="font-mono text-annotation text-muted-foreground">
            // 01 · how to read this site
          </div>
          <h2 className="max-w-title text-title-overview text-balance">
            Each project is an event. It goes through three stages.
          </h2>
          <div className="grid max-w-annotations grid-cols-annotations gap-6">
            {ANNOTATIONS.map(({ name, text }, i) => (
              <Reveal
                key={name}
                from={0.08 + i * 0.3}
                to={0.22 + i * 0.3}
                className="border-t border-border pt-4"
              >
                <div className="mb-2.5 font-mono text-xs tracking-label text-foreground-secondary uppercase">
                  {name}
                </div>
                <p className="text-base/normal text-pretty text-foreground-secondary">
                  {text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
