import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { DetailList } from '../components/detail-list'
import type { Detail } from '../components/detail-list'
import { Navbar } from '../components/navbar'
import { Section } from '../components/section'
import { StatusDot } from '../components/status-dot'
import { RouteLink, TextLink } from '../components/text-link'
import { projects } from '../data/projects'

export const Route = createFileRoute('/')({ component: Home })

const information: Array<Detail> = [
  { label: 'Based in', value: 'Nantes, France' },
  { label: 'Availability', value: <StatusDot>Now</StatusDot> },
  {
    label: 'Education',
    // Non-breaking space keeps "@ EPSI" together when the line wraps
    value: "Master's, IT & Information Systems @ EPSI, 2025",
  },
  { label: 'Languages', value: 'French, English (C1)' },
]

const experience: Array<{ title: ReactNode; detail: string; period: string }> =
  [
    {
      title: (
        <>
          Founder,{' '}
          <RouteLink to="/projects/spotime" variant="inline">
            Spotime
          </RouteLink>
        </>
      ),
      detail: 'Time tracking for field crews',
      period: '2025 – Now',
    },
    {
      title: 'Fullstack apprentice, Enedis',
      detail: 'Enedis Lab',
      period: '2023 – 2025',
    },
    {
      title: 'Fullstack apprentice, U Tech',
      detail: 'Système U',
      period: '2022 – 2023',
    },
  ]

// Placeholders from the mockup, until the posts exist
const posts = [
  {
    title: '[Post title — e.g. Batching Kafka and pipelining Redis in Go]',
    date: '[Date]',
    href: '#',
  },
  {
    title: '[Post title — e.g. Four Stripe webhooks, one payment]',
    date: '[Date]',
    href: '#',
  },
  {
    title: '[Post title — e.g. Shipping with a team of AI subagents]',
    date: '[Date]',
    href: '#',
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
      <TextLink
        href="https://romain-caille.fr/resume-romain-caille.pdf"
        iconRight="↗"
      >
        PDF
      </TextLink>
    ),
  },
]

function Home() {
  return (
    <>
      <Navbar />

      <Section title="About">
        <div className="flex flex-col gap-(--gap-about)">
          <p>
            Full-stack developer who ships fast. I build products end to end
            with{' '}
            <TextLink
              href="https://github.com/romain-cll/rstack"
              variant="inline"
            >
              rstack
            </TextLink>
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

      <Section title="Experiences">
        <ol className="flex flex-col gap-(--gap-experience)">
          {experience.map(({ title, detail, period }) => (
            <li
              key={period}
              className="flex justify-between gap-(--gap-inline)"
            >
              <div>
                <p>{title}</p>
                <p className="text-muted">{detail}</p>
              </div>
              <span className="whitespace-nowrap text-muted">{period}</span>
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

      <Section title="Writing">
        <ul className="flex flex-col gap-(--gap-writing)">
          {posts.map(({ title, date, href }) => (
            <li key={title} className="flex justify-between gap-(--gap-inline)">
              <TextLink href={href}>{title}</TextLink>
              <span className="whitespace-nowrap text-muted">{date}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Contact">
        <DetailList items={contact} />
      </Section>
    </>
  )
}
