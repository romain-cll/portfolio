import { createFileRoute } from '@tanstack/react-router'

import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { Figure } from '../../components/figure'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { StatusDot } from '../../components/status-dot'
import { TextLink } from '../../components/text-link'

export const Route = createFileRoute('/projects/spotime')({
  head: () => ({ meta: [{ title: 'Spotime — Romain Caillé' }] }),
  component: Spotime,
})

const information: Array<Detail> = [
  { label: 'Role', value: 'Founder, solo' },
  { label: 'Period', value: '2025 – Now' },
  { label: 'Status', value: <StatusDot>Live · paying clients</StatusDot> },
  {
    label: 'Stack',
    value: 'TanStack Router, NestJS, PostgreSQL, shadcn/ui, Expo, Electron',
  },
  {
    label: 'Website',
    value: (
      <TextLink href="https://spotime.fr" iconRight="↗">
        spotime.fr
      </TextLink>
    ),
  },
]

// Same format as Information
const results: Array<Detail> = []

function Spotime() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">Spotime</h1>
        <Section title="About">
          <p>
            Time tracking for small and mid-sized businesses (SMBs) with field
            teams. Replaces paper timesheets and the month-end re-entry before
            payroll.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      {/* Full width, outside the label/content columns */}
      <Figure
        alt="Back office screenshot"
        caption="Web back office: admin and scheduling."
      />

      <Section title="Problem" />
      <Section title="Surfaces" />
      <Section title="Decisions" />
      <Section title="Trade-offs" />
      <Section title="Learned" />
      <Section title="Results">
        <DetailList items={results} />
      </Section>

      <ProjectNav current="spotime" />
    </>
  )
}
