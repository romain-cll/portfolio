import { createFileRoute } from '@tanstack/react-router'

import { Code } from '../../components/code'
import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { Figure } from '../../components/figure'
import { Edge, FlowDiagram, Node, Stack } from '../../components/flow-diagram'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { TextLink } from '../../components/text-link'
import { Wide } from '../../components/wide'
import { projectSeo } from '../../data/projects'

export const Route = createFileRoute('/projects/events-hub')({
  head: () => projectSeo('events-hub'),
  component: EventsHub,
})

// In Information and again at the bottom of the page
const repository: Detail = {
  label: 'Repository',
  value: (
    <TextLink href="https://github.com/romain-cll/events-hub" iconRight="↗">
      github.com/romain-cll/events-hub
    </TextLink>
  ),
}

const information: Array<Detail> = [
  { label: 'Period', value: 'August – September 2026' },
  { label: 'Open source', value: 'MIT License' },
  {
    label: 'Stack',
    value:
      'NestJS, PostgreSQL, Drizzle, Zod, TanStack Start, Stripe Connect, shadcn/ui, Turborepo',
  },
  repository,
]

const decisions: Array<Item> = [
  {
    title: 'One endpoint for every source',
    detail: (
      <>
        Browser, backend, CI and Stripe all send to <Code>POST /v1/events</Code>
        . Event types are free-form, so a new source needs no new route.
      </>
    ),
  },
  {
    title: 'The server sets what it guarantees',
    detail:
      'The source comes from the key class, never from the payload. Session and visitor are derived at ingestion. The client only sends context and payload, stored as jsonb, so it can never write a value the server is meant to guarantee.',
  },
  {
    title: 'Payments link back to the first visit',
    detail:
      'The site’s backend puts the visitor id in the Stripe Checkout Session and Customer metadata. Reads join each payment to that visitor’s first visit. Revenue that can’t be attributed is kept and counted, never hidden.',
  },
  {
    title: 'The core never knows what a type means',
    detail:
      'The core routes, stores and counts. A test fails the build if a core file names an event type, even in a comment.',
  },
  {
    title: 'One read path',
    detail: (
      <>
        <Code>EventStore</Code> is the only access to the events table, and
        every read goes through one private <Code>where()</Code>. A rule like
        server-only events can’t be forgotten by the next module.
      </>
    ),
  },
  {
    title: 'Stripe as the source of truth',
    detail:
      'Read-only OAuth through Stripe Connect, with no token stored. Amounts are stored as Stripe sends them, so no recomputed figure can disagree with the Stripe dashboard.',
  },
  {
    title: 'A contract checked both ways',
    detail:
      'The dashboard consumes the API’s Zod schemas from a shared package. A test fails if a response and its schema diverge in either direction.',
  },
]

const tradeOffs: Array<Item> = [
  {
    title: 'Cookieless by default',
    detail:
      'The visitor key is an HMAC that rotates daily, and IP and User-Agent are never stored. Enough to count, not to follow, so renewals and lifetime value only attribute in consented mode. Privacy first, attribution depth second.',
  },
  {
    title: 'Strict validation',
    detail:
      'An unknown field is a 400, not a value silently dropped. A client breaks loudly instead of losing data quietly.',
  },
  {
    title: 'No version on events',
    detail: (
      <>
        Compatibility lives in the <Code>/v1</Code> prefix: only optional
        additions inside it, breaking changes go to <Code>/v2</Code>.
      </>
    ),
  },
]

const learned: Array<Item> = [
  {
    title: 'One payment, four amounts',
    detail:
      'One Stripe payment fires four webhooks that all carry an amount. Mapping them to disjoint event types and reading one precise type keeps the same euro from being counted four times.',
  },
  {
    title: 'A flaky test once every 66,000 requests',
    detail:
      'Ad-hoc supertest ports failed once every ~66,000 requests, on a random suite. A shared harness with one listening server per suite fixed it.',
  },
  {
    title: 'Cookieless still needs an opt-out',
    detail:
      'Without consent, the default mode rests on legitimate interest, which only holds if visitors can object. The hub honors Global Privacy Control and an explicit opt-out.',
  },
]

const next: Array<Item> = [
  { title: 'A per-project ingestion cap' },
  {
    title: 'Cohorts in the dashboard',
    detail: 'Retention by acquisition month is in the API, not on screen yet.',
  },
  { title: 'More sources', detail: 'Error tracking, uptime.' },
]

const results: Array<Detail> = [
  {
    label: 'Status',
    value:
      'Working proof of concept: web analytics and Stripe revenue attribution',
  },
  {
    label: 'Privacy',
    value:
      'Cookieless by default, Global Privacy Control honored, data purged after 25 months',
  },
  repository,
]

function IngestionFlow() {
  return (
    <FlowDiagram
      minWidth={560}
      caption="Every source goes through the same pipeline. Features read through one store."
    >
      <Stack>
        <Stack direction="row" connect={false} align="stretch" spacing={24}>
          <Node id="browser" title="Browser SDK" className="w-40">
            public key
          </Node>
          <Node id="backend" title="Backend · CI" className="w-40">
            secret key
          </Node>
          <Node id="stripe" title="Stripe" className="w-40">
            webhooks
          </Node>
        </Stack>
        <Node
          id="endpoint"
          edge={false}
          title={<Code>POST /v1/events</Code>}
          className="mt-6"
        >
          strict validation · opt-out · key → source
        </Node>
        <Node title="Derived by the server">
          visitor key · session · GeoIP · device
        </Node>
        <Node title="Events · Postgres">one read path</Node>
        <Node title="Features">analytics · revenue · event explorer</Node>
        <Node title="Dashboard" />
      </Stack>

      <Edge from="browser" to="endpoint" toAt={1 / 4} />
      <Edge from="backend" to="endpoint" />
      <Edge from="stripe" to="endpoint" toAt={3 / 4} />
    </FlowDiagram>
  )
}

function EventsHub() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">events-hub</h1>
        <Section title="About">
          <p>
            An event hub that links each Stripe payment back to the visit that
            brought it. Browser, backend, CI and Stripe events land in one
            stream, so traffic, revenue and deploys share one chart. Cookieless
            by default.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      {/* Full width, outside the label/content columns */}
      <Figure
        src="/projects/events-hub/dashboard.webp"
        alt="events-hub dashboard, audience and revenue over 30 days"
        caption="Traffic, revenue and deploy markers on one chart, on demo data."
        // Size of the capture, so nothing is cropped
        ratio="2880 / 1612"
      />

      <Section title="Why">
        <div className="flex flex-col gap-(--gap-paragraph)">
          <p>
            Web analytics count visitors. Stripe counts money. Nothing joins the
            two.
          </p>
          <p>
            Teams that sell through Stripe can’t tell which source, campaign or
            page actually brings revenue, short of a data warehouse or a tag
            manager.
          </p>
        </div>
      </Section>

      <Section title="Solution">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            One endpoint ingests events from every source into one table, and
            each payment carries the visitor id of the visit that led to it.
          </p>
          <Wide>
            <IngestionFlow />
          </Wide>
        </div>
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

      <Section title="What’s next">
        <ItemList items={next} />
      </Section>

      <Section title="Results">
        <DetailList items={results} />
      </Section>

      <ProjectNav current="events-hub" />
    </>
  )
}
