import { SiteHeader } from './site-header'
import { RouteLink } from './text-link'

/** Top of a sub-page: back to the home page, and what kind of page it is */
export function PageHeader({ label }: { label: string }) {
  return (
    <SiteHeader>
      <div className="flex justify-between gap-(--gap-inline)">
        <RouteLink to="/" iconLeft="←">
          Romain Caillé
        </RouteLink>
        <p className="text-muted">{label}</p>
      </div>
    </SiteHeader>
  )
}
