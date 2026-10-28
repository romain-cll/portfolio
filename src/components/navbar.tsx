import { posts } from '../data/posts'
import { sectionId } from './section'
import { TextLink } from './text-link'
import { ThemeToggle } from './theme-toggle'

// Writing only once there is something to read
const sections = [
  'Experiences',
  'Projects',
  ...(posts.length > 0 ? ['Writing'] : []),
  'Contact',
]

export function Navbar() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-(--header-gap)">
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
        <ThemeToggle />
      </nav>
    </header>
  )
}
