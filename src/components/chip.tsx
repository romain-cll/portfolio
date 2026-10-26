import type { ReactNode } from 'react'

/** A command or identifier inside text, e.g. /rs-plan */
export function Chip({ children }: { children: ReactNode }) {
  // Sized in em: 0.86em of mono reads as large as the text around it
  return (
    <code className="rounded-full border border-divider bg-linear-to-b from-chip-top to-chip-bottom px-[0.6em] py-[0.1em] font-mono text-[0.86em] whitespace-nowrap text-text shadow-(--chip-shadow)">
      {children}
    </code>
  )
}
