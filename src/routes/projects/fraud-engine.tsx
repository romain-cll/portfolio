import { createFileRoute } from '@tanstack/react-router'

import { Code } from '../../components/code'
import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { Figure } from '../../components/figure'
import { FlowDiagram, Node, Stack } from '../../components/flow-diagram'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { Table } from '../../components/table'
import { TextLink } from '../../components/text-link'
import { Wide } from '../../components/wide'
import { projectSeo } from '../../data/projects'

export const Route = createFileRoute('/projects/fraud-engine')({
  head: () => projectSeo('fraud-engine'),
  component: FraudEngine,
})

// In Information and again at the bottom of the page
const repository: Detail = {
  label: 'Repository',
  value: (
    <TextLink
      href="https://github.com/romain-cll/fraud-engine-event-driven"
      iconRight="↗"
    >
      github.com/romain-cll/fraud-engine-event-driven
    </TextLink>
  ),
}

const information: Array<Detail> = [
  { label: 'Period', value: 'September 2026' },
  { label: 'Context', value: 'Learning project' },
  {
    label: 'Stack',
    value: 'Go, Kafka, Redis, ClickHouse, Prometheus, Grafana, Docker',
  },
  repository,
]

const decisions: Array<Item> = [
  {
    title: 'Partitioned by card',
    detail: (
      <>
        Transactions are keyed by <Code>card_id</Code>, so a card is always
        scored by the same worker and its velocity count stays consistent.
        Adding a scorer only triggers a partition rebalance. The 12 partitions
        cap how many scorers can work at once.
      </>
    ),
  },
  {
    title: 'Explicit batching everywhere',
    detail:
      'Generator, scorer and sink buffer messages and flush on size or on a timer, whichever comes first.',
  },
  {
    title: 'One Redis round-trip per transaction',
    detail:
      'The four velocity commands go out in a single pipeline instead of four calls.',
  },
  {
    title: 'Reading and writing decoupled',
    detail:
      'Separate goroutines linked by a channel, so a slow network write doesn’t stall consumption.',
  },
  {
    title: 'Measured, not assumed',
    detail:
      'Every binary exposes Prometheus metrics, and kminion exports the consumer group lag. One Grafana dashboard shows throughput and lag side by side.',
  },
]

const tradeOffs: Array<Item> = [
  {
    title: 'The generator drops when full',
    detail:
      'When its 1,000-slot buffer is full, the generator drops messages instead of blocking. Acceptable for a load test, since the ceiling stays visible in metrics. On a real payment pipeline, losing an event before the fraud check is not: backpressure or a persistent buffer instead.',
  },
  {
    title: 'At-least-once',
    detail:
      'No exactly-once delivery: a transaction can be scored twice, never skipped.',
  },
  {
    title: 'Rules, not a model',
    detail: 'Three fixed rules keep the focus on the pipeline, not on scoring.',
  },
]

const learned: Array<Item> = [
  {
    title: 'Defaults set the ceiling',
    detail: (
      <>
        The first version ran 3 scorers at ~3 tx/s. kafka-go’s default 1 s{' '}
        <Code>BatchTimeout</Code> capped writes at about one message per second,
        and each Redis command was its own round-trip. Explicit batching and a
        pipelined Redis call fixed it: one scorer now keeps up with a generator
        alone.
      </>
    ),
  },
  {
    title: 'The load tool was the bottleneck',
    detail:
      'A single generator tops out at 73–109 tx/s, a limit of the sequential simulator, not of the architecture. Showing the scaling took several generators.',
  },
  {
    title: 'Test data shapes the load',
    detail:
      'With only 5 test cards, only 5 of the 12 partitions get traffic. A wider set of cards would spread the load over all of them.',
  },
]

const limits: Array<Item> = [
  {
    title: 'No fault tolerance',
    detail: 'One Kafka broker with replication factor 1, one Redis instance.',
  },
  { title: 'Rule-based scoring only', detail: 'No machine learning model.' },
]

function Pipeline() {
  return (
    <FlowDiagram caption="Three Go binaries linked by Kafka. Dashed boxes are storage.">
      <Stack>
        <Node title="Generators">simulated transactions, rising rate</Node>
        <Node variant="muted" title={<Code>transactions.raw</Code>}>
          Kafka · 12 partitions · keyed by card
        </Node>
        <Node title="Scorers">
          one consumer group · velocity in Redis · geo · amount
        </Node>
        <Node variant="muted" title={<Code>transactions.scored</Code>}>
          Kafka · 12 partitions
        </Node>
        <Node title="Sink">batches of 50 rows or 3 s</Node>
        <Node variant="muted" title="ClickHouse">
          scored transactions
        </Node>
      </Stack>
    </FlowDiagram>
  )
}

function FraudEngine() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">fraud-engine</h1>
        <Section title="About">
          <p>
            An event-driven fraud scoring pipeline in Go, on Kafka, Redis and
            ClickHouse. It absorbs growing load by starting more scorers,
            without code changes.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      <Section title="Why">
        <div className="flex flex-col gap-(--gap-paragraph)">
          <p>
            I wanted to learn Go and event-driven design on a case where event
            order matters.
          </p>
          <p>
            Fraud detection is one: a card’s velocity only means something if
            its transactions are counted in order, by the same worker.
          </p>
        </div>
      </Section>

      <Section title="Solution">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            Each transaction is scored by three rules, then stored for
            analytics.
          </p>
          <Pipeline />
          <Wide>
            <Table
              columns={[
                { header: 'Rule' },
                { header: 'Triggers when' },
                { header: 'Score', align: 'right' },
              ]}
              rows={[
                [
                  'Velocity',
                  'more than 5 transactions on a card in 60 s',
                  '+30',
                ],
                ['Geo mismatch', 'card country differs from IP country', '+40'],
                ['High amount', 'over 400', '+20'],
              ]}
              caption="60 or more blocks the transaction, 30 or more flags it, anything else is accepted."
            />
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

      <Section title="Limits">
        <ItemList items={limits} />
      </Section>

      <Section title="Results">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            With 1 scorer for 2 ramping generators, lag climbs to ~410 messages,
            about 8 s of traffic. Starting 2 more scorers drains it to 0.
          </p>
          <Figure
            src="/projects/fraud-engine/lag.webp"
            alt="Grafana chart of the scorer group’s Kafka lag, peaking near 410 then back to 0"
            caption="Scorer group lag during the live scaling run."
            // Size of the capture, so nothing is cropped
            ratio="800 / 608"
          />
          <Wide>
            <Table
              columns={[
                { header: 'Setup' },
                { header: 'Result', align: 'right' },
              ]}
              rows={[
                ['3 scorers, first version', '~3 tx/s, 66% behind'],
                ['1 optimized scorer, 1 generator at ~73 tx/s', 'lag at 0'],
                ['3 optimized scorers, 3 generators', '~220 tx/s combined'],
              ]}
              highlightLast
            />
          </Wide>
          <DetailList items={[repository]} />
        </div>
      </Section>

      <ProjectNav current="fraud-engine" />
    </>
  )
}
