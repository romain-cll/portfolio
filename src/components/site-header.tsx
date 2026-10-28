import type { ReactNode } from 'react'

import { Separator } from './separator'
import { ThemeToggle } from './theme-toggle'

/**
 * Top of every page: the page's own content, the theme toggle on the right of
 * its first line, then the separator.
 */
export function SiteHeader({ children }: { children: ReactNode }) {
  // Line 24px under the header; the page's section gap follows
  return (
    <header className="flex flex-col gap-(--gap-separator)">
      <div className="flex items-start gap-(--gap-inline)">
        <div className="min-w-0 flex-1">{children}</div>
        {/* As tall as one line of text, so the icon centers on it */}
        <div className="flex h-lh items-center">
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </header>
  )
}
