import type { ReactNode } from 'react'

/** Anchor id of a section, for in-page links */
export function sectionId(title: string) {
  return title.toLowerCase().replaceAll(' ', '-')
}

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const id = sectionId(title)

  // Below 504px (label col + gap + content col) the title wraps above its
  // content: it is then uppercased to stand out
  return (
    <section
      aria-labelledby={id}
      className="@container flex flex-wrap gap-(--row-gap)"
    >
      <h2
        id={id}
        className="flex-[0_0_var(--label-col)] text-muted @max-[504px]:tracking-wider @max-[504px]:uppercase"
      >
        {title}
      </h2>
      <div className="min-w-0 flex-[1_1_var(--content-col)]">{children}</div>
    </section>
  )
}
