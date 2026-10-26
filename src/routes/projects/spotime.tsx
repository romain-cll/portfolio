import { createFileRoute } from '@tanstack/react-router'

import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { Figure } from '../../components/figure'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
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

const surfaces: Array<Item> = [
  {
    title: 'Web back-office',
    detail: 'Planning, hour review, payroll export',
  },
  {
    title: 'Mobile app (iOS/Android)',
    detail: 'Clock in/out, missed-punch requests',
  },
  {
    title: 'Desktop kiosk (Windows)',
    detail: 'Shared clock-in terminal on site',
  },
]

const decisions: Array<Item> = [
  {
    title: 'Local-first punches',
    detail:
      'Each offline punch gets a client-generated ID, so syncing never loses or duplicates an entry.',
  },
  {
    title: 'Phone + OTP login',
    detail: 'No passwords for field staff to forget.',
  },
  {
    title: 'GPS at punch time only',
    detail: 'Proof of presence without continuous tracking.',
  },
  {
    title: 'Native app over PWA',
    detail: 'Reliable offline behavior and store distribution.',
  },
  {
    title: 'Labor rules as data',
    detail:
      'Each rule tagged by source (law, collective agreement, company) instead of hardcoded.',
  },
  {
    title: 'Flat, transparent pricing',
    detail:
      'One simple per-user price, no setup fees or paid add-ons, so small teams on tight budgets know exactly what they’ll pay.',
  },
]

const tradeOffs: Array<Item> = [
  {
    title: 'Narrow scope vs. HR suites',
    detail:
      'No leave or payroll processing, so I lose some deals, but the product stays light and affordable for 10–150 employees.',
  },
  {
    title: 'Native over PWA',
    detail: 'Store reviews slow releases, in exchange for offline reliability.',
  },
  {
    title: 'Punch-time GPS',
    detail:
      'Privacy comes first: employees are located only when they clock in, never tracked live.',
  },
]

const learned: Array<Item> = [
  {
    title: 'Read the labor code before writing the hours engine',
    detail:
      'I didn’t, and had to rework which hours are counted, how, and which earn a premium.',
  },
  {
    title: 'The obvious market isn’t always the one that buys',
    detail: 'Construction stayed silent, home-care services converted.',
  },
  {
    title: 'Cold calls opened more doors than cold emails',
    detail: 'In the sectors I target, not as a general rule.',
  },
]

const results: Array<Detail> = [
  {
    label: 'Live on',
    value: (
      <>
        <TextLink href="https://apps.apple.com/fr/app/spotime/id6758910855">
          App Store
        </TextLink>
        ,{' '}
        <TextLink href="https://play.google.com/store/apps/details?id=fr.spotime.mobileapplication&hl=fr">
          Google Play
        </TextLink>
        ,{' '}
        <TextLink href="https://apps.microsoft.com/detail/9p969491d8w8?hl=fr-FR&gl=FR">
          Microsoft Store
        </TextLink>
      </>
    ),
  },
  { label: 'Retention', value: 'First customer still on it since 2025' },
  {
    label: 'Sectors',
    value: 'Agriculture, Home care, Private security, Construction',
  },
]

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
        src="/projects/spotime/back-office.webp"
        alt="Spotime back office, weekly hours review"
        caption="Web back office: admin and scheduling."
        // Size of the capture, so nothing is cropped
        ratio="3024 / 1722"
      />

      <Section title="Problem">
        <p>
          Field crews at SMBs work across scattered sites and log hours on
          paper, or leave no record at all. Every month-end, managers spend
          hours re-keying timesheets before payroll can even start.
        </p>
      </Section>
      <Section title="Solution">
        <p>
          Workers clock in from their phone or a shared on-site terminal, even
          offline. Managers review, correct and approve hours in one place, then
          export them straight to payroll. No paper, no re-entry.
        </p>
      </Section>
      <Section title="Surfaces">
        <ItemList items={surfaces} />
      </Section>
      <Section title="Decisions">
        <ItemList items={decisions} />
      </Section>
      <Section title="Trade-offs">
        <ItemList items={tradeOffs} />
      </Section>
      <Section title="Learned">
        <ItemList items={learned} />
      </Section>
      <Section title="Results">
        <DetailList items={results} />
      </Section>

      <ProjectNav current="spotime" />
    </>
  )
}
