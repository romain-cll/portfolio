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

  return (
    <section aria-labelledby={id} className="flex flex-wrap gap-(--row-gap)">
      <h2 id={id} className="flex-[0_0_var(--label-col)] text-muted">
        {title}
      </h2>
      <div className="min-w-0 flex-[1_1_var(--content-col)]">{children}</div>
    </section>
  )
}
