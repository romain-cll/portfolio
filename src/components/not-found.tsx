import { Section } from './section'
import { RouteLink } from './text-link'

/** Any URL that matches no page */
export function NotFound() {
  return (
    <Section title="404">
      <div className="flex flex-col gap-(--gap-paragraph)">
        <p>Oops, there’s nothing to see here!</p>
        <p>
          <RouteLink to="/">Go back home</RouteLink>
        </p>
      </div>
    </Section>
  )
}
