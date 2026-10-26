import type { ReactNode } from 'react'

const VARIANTS = {
  /** A command: /rs-plan */
  command:
    'border-divider bg-linear-to-b from-chip-top to-chip-bottom shadow-(--chip-shadow)',
  /** An agent: @tester */
  agent: 'border-dashed border-chip-dashed',
} as const

/** A command or an agent inside text */
export function Chip({
  variant = 'command',
  children,
}: {
  variant?: keyof typeof VARIANTS
  children: ReactNode
}) {
  // Sized in em: 0.86em of mono reads as large as the text around it
  return (
    <code
      className={`rounded-full border px-[0.6em] py-[0.1em] font-mono text-[0.86em] whitespace-nowrap text-text ${VARIANTS[variant]}`}
    >
      {children}
    </code>
  )
}
