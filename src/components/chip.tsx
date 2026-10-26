import type { ReactNode } from 'react'

/** A command or identifier inside text, e.g. /rs-plan */
export function Chip({ children }: { children: ReactNode }) {
  // 12px mono reads as large as the 14px text around it
  return (
    <code className="inline-block rounded-md border border-divider bg-surface px-2 font-mono text-[12px] leading-[18px] text-text">
      {children}
    </code>
  )
}
