import type { ReactNode } from 'react'

/**
 * Detail folded behind a "Read more" toggle. A native <details>: it opens
 * without JavaScript, the keyboard and screen readers get its state, and
 * find-in-page opens it on a match. The height animates in styles.css.
 */
export function ReadMore({ children }: { children: ReactNode }) {
  return (
    <details className="group">
      {/* Underlined in --border like the site's inline links, so it reads as a control */}
      <summary className="w-fit cursor-pointer list-none text-muted underline decoration-border underline-offset-(--underline-offset) decoration-(length:--underline-thickness) hover:decoration-current [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Read more</span>
        <span className="hidden group-open:inline">Read less</span>
      </summary>
      <div className="pt-(--gap-detail)">{children}</div>
    </details>
  )
}
