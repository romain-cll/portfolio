import type { ReactNode } from 'react'

/**
 * Code inside text, like `code` in Markdown: a shell command, a tag, a
 * class. Chip is for rstack's skills and agents.
 */
export function Code({ children }: { children: ReactNode }) {
  // Same em sizing as Chip; keeps the color of the text around it
  return (
    <code className="rounded-md bg-surface box-decoration-clone px-[0.4em] py-[0.15em] font-mono text-[0.86em]">
      {children}
    </code>
  )
}
