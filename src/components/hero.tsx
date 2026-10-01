import { ArrowUpRight } from "@carbon/icons-react"

export function Hero() {
  return (
    <main className="overflow-x-clip">
      <section className="flex min-h-dvh flex-col justify-center-safe gap-hero-gap px-gutter py-hero-y">
        <div className="flex min-w-0 flex-col gap-hero-stack">
          <div className="font-mono text-annotation text-muted-foreground">
            // state: idle · 0 packet · 3 stages
          </div>
          <div className="flex min-w-0 items-center gap-hero-inline">
            <img
              src="/portrait.webp"
              alt="Portrait of Romain Caillé"
              width={108}
              height={108}
              className="size-portrait flex-none border border-border bg-card object-cover"
            />
            <h1 className="min-w-0 text-display whitespace-nowrap">
              Romain <span className="text-muted-foreground">CAILLE</span>
            </h1>
          </div>
          <p className="text-lead text-pretty">
            Fullstack developer, ready for the agentic era.
          </p>
        </div>
        <dl className="grid max-w-meta grid-cols-meta gap-x-meta-col gap-y-meta-row font-mono text-meta">
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            status
          </dt>
          <dd className="relative text-status">
            <span
              aria-hidden
              className="absolute top-1/2 -left-3.75 size-1.75 -translate-y-1/2 rounded-full bg-status ring-3 ring-status/15"
            />
            Open to work · available now
          </dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            contract
          </dt>
          <dd className="text-foreground-secondary">Full-time / freelance</dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            location
          </dt>
          <dd className="text-foreground-secondary">
            Remote or relocation · from Nantes, France
          </dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            experience
          </dt>
          <dd className="flex flex-col text-foreground-secondary">
            <span>
              Spotime{" "}
              <span className="whitespace-nowrap text-muted-foreground">
                · 2025–now
              </span>
            </span>
            <span>
              Enedis, fullstack apprentice{" "}
              <span className="whitespace-nowrap text-muted-foreground">
                · 2023–2025
              </span>
            </span>
            <span>
              U Tech, fullstack apprentice{" "}
              <span className="whitespace-nowrap text-muted-foreground">
                · 2022–2023
              </span>
            </span>
          </dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            education
          </dt>
          <dd className="text-foreground-secondary">
            Master&apos;s, IT &amp; Information Systems{" "}
            <span className="whitespace-nowrap text-muted-foreground">
              · EPSI
            </span>
          </dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            english
          </dt>
          <dd className="text-foreground-secondary">C1</dd>
          <dt className="self-baseline text-label text-muted-foreground uppercase">
            resume
          </dt>
          <dd>
            <a
              href="/cv.pdf"
              className="border-b border-border pb-px no-underline hover:border-muted-foreground"
            >
              resume.pdf
              <ArrowUpRight className="icon-inline" aria-hidden />
            </a>
          </dd>
        </dl>
      </section>
    </main>
  )
}
