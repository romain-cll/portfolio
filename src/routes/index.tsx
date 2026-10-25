import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Navbar } from '../components/navbar'
import { Section } from '../components/section'
import { TextLink } from '../components/text-link'

export const Route = createFileRoute('/')({ component: Home })

const information: Array<{ label: string; value: ReactNode }> = [
  { label: 'Based in', value: 'Nantes, France' },
  {
    label: 'Availability',
    value: (
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
        Now
      </span>
    ),
  },
  { label: 'Education', value: "Master's, EPSI — 2025" },
  { label: 'Languages', value: 'French, English (C1)' },
]

const experience: Array<{ title: ReactNode; detail: string; period: string }> =
  [
    {
      title: (
        <>
          Founder,{' '}
          <TextLink href="https://spotime.fr" variant="inline">
            Spotime
          </TextLink>
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

const projects = [
  {
    name: 'Spotime',
    href: 'https://spotime.fr',
    description:
      'Replaces paper hour tracking for field crews of 10–30. Web, mobile and Windows desktop app, local-first clock-ins.',
  },
  {
    name: 'Fraud Engine',
    href: 'https://github.com/romain-cll/fraud-engine-event-driven',
    description:
      'Event-driven fraud detection in Go over Kafka, Redis and ClickHouse. ~220 tx/s across three scorers.',
  },
  {
    name: 'Event Hub',
    href: 'https://github.com/romain-cll/events-hub',
    description:
      'Cookieless analytics joined with Stripe revenue, to see which sources actually drive sales.',
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

const contact: Array<{ label: string; value: ReactNode }> = [
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
    <main className="mx-auto box-content flex max-w-(--container) flex-col gap-(--section-gap) p-(--page-padding)">
      <Navbar />

      <Section title="About">
        <div className="flex flex-col gap-(--gap-about)">
          <p>
            Fullstack developer, ready for the agentic era. I build products end
            to end — back office, mobile, desktop — and get them in front of
            paying users.
          </p>
          <p className="text-muted">
            Currently building{' '}
            <TextLink href="https://spotime.fr" variant="inline">
              Spotime
            </TextLink>
            . Open to work, remote or relocation.
          </p>
        </div>
      </Section>

      <Section title="Information">
        <dl className="flex flex-col gap-(--gap-info)">
          {information.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between gap-(--gap-inline)"
            >
              <dt className="text-muted">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Experience">
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
          {projects.map(({ name, href, description }) => (
            <li key={name} className="flex flex-col gap-(--gap-title-desc)">
              <TextLink
                href={href}
                iconRight={<span className="text-muted">↗</span>}
                className="flex justify-between gap-(--gap-inline)"
              >
                {name}
              </TextLink>
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
        <dl className="flex flex-col gap-(--gap-info)">
          {contact.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between gap-(--gap-inline)"
            >
              <dt className="text-muted">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </main>
  )
}
