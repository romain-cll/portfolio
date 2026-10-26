import { Separator } from './separator'
import { RouteLink } from './text-link'

/** Top of a sub-page: back to the home page, and what kind of page it is */
export function PageHeader({ label }: { label: string }) {
  // Mirrors ProjectNav at the bottom: line 24px from the links, section gap on the content side
  return (
    <header className="flex flex-col gap-(--gap-separator)">
      <div className="flex justify-between gap-(--gap-inline)">
        <RouteLink to="/" iconLeft="←">
          Romain Caillé
        </RouteLink>
        <p className="text-muted">{label}</p>
      </div>
      <Separator />
    </header>
  )
}
