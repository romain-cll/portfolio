import { ArrowUpRight } from "@carbon/icons-react"

import { Carousel } from "@/components/carousel"
import { Reveal } from "@/components/reveal"
import { RollLabel } from "@/components/roll-label"
import { VideoPlayer } from "@/components/video-player"
import type { Project as ProjectContent } from "@/lib/content"
import { STAGES } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const LABEL =
  "mb-1.5 block font-mono text-xs tracking-label text-muted-foreground uppercase"

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <p className="text-detail text-pretty text-foreground-secondary">
      <span className={LABEL}>{label}</span>
      {children}
    </p>
  )
}

export function Project({
  project,
  stage,
  silent,
}: {
  project: ProjectContent
  /** Étape affichée par la ligne `event <nom> →`. */
  stage: 0 | 1 | 2
  silent: boolean
}) {
  const { media, link } = project
  return (
    <section
      data-section={project.slug}
      className={cn("relative flex flex-col", project.tone)}
    >
      <span id={project.slug} aria-hidden className="absolute top-anchor" />
      <div data-sticky className="sticky top-0 bar:pt-bar">
        <div className="grid min-h-stage grid-cols-project content-start gap-project-gap px-gutter pt-project-y pb-6 labels:pb-15">
          <div className="flex min-w-0 flex-col gap-5.5">
            <Reveal
              from={0}
              to={0.1}
              dy={0}
              className="flex items-center gap-3 font-mono text-annotation text-tone"
            >
              <span className="size-2 rounded-full bg-tone" />
              <span className="flex gap-ch">
                <span>event {project.ev} →</span>
                <RollLabel value={STAGES[stage]} rank={stage} silent={silent} />
              </span>
            </Reveal>
            <Reveal as="h2" from={0} to={0.1} className="text-title-project">
              {project.name}
            </Reveal>
            <Reveal
              as="p"
              from={0.12}
              to={0.25}
              className="max-w-copy text-prose text-pretty text-foreground-secondary"
            >
              <span className={LABEL}>problem</span>
              {project.problem}
            </Reveal>
            <Reveal
              as="p"
              from={0.3}
              to={0.45}
              className="max-w-copy text-prose text-pretty text-foreground"
            >
              <span className={LABEL}>decision</span>
              {project.decision}
            </Reveal>
            <Reveal
              from={0.3}
              to={0.45}
              dy={0}
              className="flex max-w-full flex-wrap gap-2"
            >
              {project.stack.map((tag, k) => (
                <Reveal
                  key={tag}
                  as="span"
                  from={0.42 + k * 0.05}
                  to={0.5 + k * 0.05}
                  dy={8}
                  className="border border-border px-2.5 py-1.25 font-mono text-xs whitespace-nowrap text-foreground-secondary"
                >
                  {tag}
                </Reveal>
              ))}
            </Reveal>
            <Reveal from={0.3} to={0.45} dy={0}>
              <details className="group">
                <summary className="inline-block cursor-pointer border border-border px-3 py-2 font-mono text-xs text-foreground hover:border-muted-foreground">
                  <span className="group-open:hidden">
                    + trade-offs &amp; what broke
                  </span>
                  <span className="hidden group-open:inline">− collapse</span>
                </summary>
                <div className="mt-4 grid max-w-copy gap-4 border-l border-border pl-4">
                  <Detail label="trade-off">{project.tradeoff}</Detail>
                  <Detail label="what broke / learned">
                    {project.learned}
                  </Detail>
                </div>
              </details>
            </Reveal>
          </div>
          <div className="flex min-w-0 items-start">
            <Reveal
              from={0.4}
              to={0.55}
              dy={40}
              scale
              className="w-full max-w-card border border-border bg-card shadow-card"
            >
              <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="ml-2 min-w-0 flex-1 truncate border border-border bg-background px-2.5 py-1 font-mono text-small text-muted-foreground">
                  {project.url}
                </span>
              </div>
              {media.kind === "video" ? (
                <VideoPlayer />
              ) : (
                <Carousel name={project.name} shots={media.shots} />
              )}
              <div className="flex flex-col gap-4 p-5.5">
                <div className="flex items-center gap-2 font-mono text-xs text-tone">
                  <span className="size-1.5 rounded-full bg-tone" />
                  deploy ✓
                </div>
                <p className="text-base/normal text-pretty text-foreground">
                  {project.result}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={link.href}
                    className="border border-tone px-3 py-2 font-mono text-xs text-tone no-underline"
                  >
                    {link.label}
                    <ArrowUpRight className="icon-inline" aria-hidden />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="h-spacer flex-none" />
    </section>
  )
}
