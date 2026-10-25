import { nextProject } from '../data/projects'
import { Separator } from './separator'
import { RouteLink } from './text-link'

/** Bottom of a case study: back to the home's projects, and the next one if it has a page */
export function ProjectNav({ current }: { current: string }) {
  const next = nextProject(current)

  return (
    <nav aria-label="Projects" className="flex flex-col gap-(--gap-separator)">
      <Separator />
      <div className="flex justify-between gap-(--gap-inline)">
        <RouteLink to="/" hash="projects" iconLeft="←">
          All projects
        </RouteLink>
        {next?.page && (
          <div className="text-right">
            <p className="text-muted">Next</p>
            <RouteLink to={next.page} iconRight="→">
              {next.name}
            </RouteLink>
          </div>
        )}
      </div>
    </nav>
  )
}
