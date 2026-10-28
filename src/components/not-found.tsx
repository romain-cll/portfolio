import { Link } from '@tanstack/react-router'

import { Section } from './section'

/** Any URL that matches no page */
export function NotFound() {
  return (
    <Section title="404">
      <div className="flex flex-col items-start gap-(--gap-block)">
        <p>Page not found.</p>
        <Link
          to="/"
          className="rounded-md border border-divider px-3 py-1.5 hover:bg-surface"
        >
          ← Back to home
        </Link>
      </div>
    </Section>
  )
}
