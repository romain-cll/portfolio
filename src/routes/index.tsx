import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { DetailList } from '../components/detail-list'
import type { Detail } from '../components/detail-list'
import { Navbar } from '../components/navbar'
import { ReadMore } from '../components/read-more'
import { Section } from '../components/section'
import { SiteHeader } from '../components/site-header'
import { StatusDot } from '../components/status-dot'
import { RouteLink, TextLink } from '../components/text-link'
import { posts } from '../data/posts'
import { projects } from '../data/projects'
import { seo } from '../seo'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'Romain Caillé — Fullstack developer',
      description:
        'Full-stack developer who ships fast. I build products end to end with rstack, the agent loop I designed and open-sourced, and get them in front of paying users.',
      path: '/',
    }),
  component: Home,
})

const information: Array<Detail> = [
  { label: 'Based in', value: 'Nantes, France' },
  { label: 'Availability', value: <StatusDot>Now</StatusDot> },
  {
    label: 'Education',
    // Non-breaking space keeps "@ EPSI" together when the line wraps
    value: 'Master’s in Computer Science & Information Systems @ EPSI, 2025',
  },
  { label: 'Languages', value: 'French, English (C1)' },
]

type Experience = {
  title: ReactNode
  subtitle: string
  period: string
  /** Folded behind Read more: one short paragraph per point of the resume */
  detail?: Array<string>
}

const experience: Array<Experience> = [
  {
    title: (
      <>
        Founder,{' '}
        <RouteLink to="/projects/spotime" variant="inline">
          Spotime
        </RouteLink>
      </>
    ),
    subtitle: 'Time tracking for field crews',
    period: '2025 – Now',
  },
  {
    title: 'Fullstack developer, Enedis',
    subtitle: 'Enedis Lab, apps for the field agents of France’s power grid',
    period: '2023 – 2025',
    detail: [
      'Mon Orga, the org chart of Enedis’s 41,000 employees: Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), built as the single source of org data for internal apps, in a team of 4.',
      'A worksite inspection app with which ~15 field agents inspect ~3,000 contractor-run worksites a year for safety, schedule and work quality.',
      'GitLab CI/CD with an 80% coverage gate, Checkmarx, Docker, auto deploy and health checks; OIDC SSO, role-based access and rate limiting, no personal data stored locally.',
      'Quantified the time lost to cross-team CI/CD blockers and got a weekly sync set up with the Cloud and CI/CD teams.',
    ],
  },
  {
    title: 'Fullstack developer, U Tech',
    subtitle: 'Système U’s tech subsidiary, PWAs for its 28 warehouses',
    period: '2022 – 2023',
    detail: [
      'A routing PWA that moves pallets to the loading dock, and a loading PWA to put them onto trucks.',
      'Visited warehouses to watch operators use the PWAs, and adjusted them to how they work.',
    ],
  },
]

const contact: Array<Detail> = [
  {
    label: 'Email',
    value: (
      <TextLink href="mailto:r.caille@icloud.com">r.caille@icloud.com</TextLink>
    ),
  },
  {
    label: 'GitHub',
    value: (
      <TextLink href="https://github.com/romain-cll" iconRight="↗">
        romain-cll
      </TextLink>
    ),
  },
  {
    label: 'LinkedIn',
    value: (
      <TextLink
        href="https://www.linkedin.com/in/romain-caill%C3%A9/"
        iconRight="↗"
      >
        romain-caillé
      </TextLink>
    ),
  },
  {
    label: 'Resume',
    value: (
      <TextLink href="/resume-romain-caille.pdf" target="_blank" iconRight="↗">
        PDF
      </TextLink>
    ),
  },
]

function Home() {
  return (
    <>
      <SiteHeader>
        <Navbar />
      </SiteHeader>

      <Section title="About">
        <div className="flex flex-col gap-(--gap-paragraph)">
          <p>
            Full-stack developer who ships fast. I build products end to end
            with{' '}
            <RouteLink to="/projects/rstack" variant="inline">
              rstack
            </RouteLink>
            , the agent loop I designed and open-sourced, and get them in front
            of paying users.
          </p>
          <p className="text-muted">
            Built{' '}
            <RouteLink to="/projects/spotime" variant="inline">
              Spotime
            </RouteLink>
            . Now looking for a full-time role, remote or relocation.
          </p>
        </div>
      </Section>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      <Section title="Experience">
        <ol className="flex flex-col gap-(--gap-experience)">
          {experience.map(({ title, subtitle, period, detail }) => (
            <li key={period} className="flex flex-col gap-(--gap-title-desc)">
              {/* The period sits on the title's line, the rest spans the full width */}
              <div className="flex justify-between gap-(--gap-inline)">
                <p>{title}</p>
                <span className="whitespace-nowrap text-muted">{period}</span>
              </div>
              <p className="text-muted">{subtitle}</p>
              {detail && (
                <ReadMore>
                  <div className="flex flex-col gap-(--gap-detail) text-muted">
                    {detail.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </ReadMore>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Projects">
        <ul className="flex flex-col gap-(--gap-projects)">
          {projects.map(({ id, name, href, description, page }) => (
            <li
              key={id}
              id={id}
              className="flex flex-col gap-(--gap-title-desc)"
            >
              {page ? (
                // Name to the case study, ↗ to the live site or repo
                <div className="flex justify-between gap-(--gap-inline)">
                  <RouteLink to={page}>{name}</RouteLink>
                  <TextLink
                    href={href}
                    aria-label={`${name}, ${new URL(href).host}`}
                  >
                    <span className="text-muted">↗</span>
                  </TextLink>
                </div>
              ) : (
                <TextLink
                  href={href}
                  iconRight={<span className="text-muted">↗</span>}
                  className="flex justify-between gap-(--gap-inline)"
                >
                  {name}
                </TextLink>
              )}
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {posts.length > 0 && (
        <Section title="Writing">
          <ul className="flex flex-col gap-(--gap-writing)">
            {posts.map(({ title, date, href }) => (
              <li
                key={title}
                className="flex justify-between gap-(--gap-inline)"
              >
                <TextLink href={href}>{title}</TextLink>
                <span className="whitespace-nowrap text-muted">{date}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Contact">
        <DetailList items={contact} />
      </Section>
    </>
  )
}
