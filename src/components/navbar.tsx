import { posts } from '../data/posts'
import { sectionId } from './section'
import { TextLink } from './text-link'

// Writing only once there is something to read
const sections = [
  'Experiences',
  'Projects',
  ...(posts.length > 0 ? ['Writing'] : []),
  'Contact',
]

/** Name and role, then links to the home page's sections; goes in SiteHeader */
export function Navbar() {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-(--header-gap)">
      <div>
        <h1 className="font-(--weight-medium)">Romain Caillé</h1>
        <p className="text-muted">Fullstack developer</p>
      </div>
      <nav
        aria-label="Sections"
        className="flex flex-wrap gap-(--nav-gap) text-muted"
      >
        {sections.map((title) => (
          <TextLink key={title} href={`#${sectionId(title)}`}>
            {title}
          </TextLink>
        ))}
      </nav>
    </div>
  )
}
