import type { ReactNode } from 'react'

/** Green dot before a live status: availability, product status */
export function StatusDot({ children }: { children: ReactNode }) {
  // `flex`, not `inline-flex`: an inline box would add 2px to the row height
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  )
}
