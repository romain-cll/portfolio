import type { ReactNode } from 'react'

/**
 * Inside a Section's content column, also spans the title column, so a wide
 * table gets the full page width. Once the section stacks (narrow screens),
 * the content column already has it. Not as a section's first block: the
 * title sits there.
 */
export function Wide({ children }: { children: ReactNode }) {
  // 504px: where Section stacks, see section.tsx
  return (
    <div className="@min-[504px]:-ml-[calc(var(--label-col)+var(--column-gap))]">
      {children}
    </div>
  )
}
