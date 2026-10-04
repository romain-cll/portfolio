// Textes du design, à la lettre (constantes `PROJECTS` et `annTexts` du design).

export const EMAIL = "r.caille@icloud.com"

export const ANNOTATIONS = [
  { name: "ingest", text: "Collection: what enters the system, as is." },
  {
    name: "build",
    text: "Processing: validation, enrichment, decisions. This is where the trade-offs live.",
  },
  { name: "deploy", text: "Exposure: APIs, dashboards, what others consume." },
] as const

export type Media =
  { kind: "shots"; shots: readonly string[] } | { kind: "video" }

export interface Project {
  name: string
  /** Nom de l'événement, après « event ». */
  ev: string
  /** Ancre de la navigation et valeur de `data-section`. */
  slug: "spotime" | "fraud-engine" | "event-hub"
  tone: "tone-spotime" | "tone-fraud-engine" | "tone-event-hub"
  url: string
  problem: string
  decision: string
  tradeoff: string
  learned: string
  result: string
  stack: readonly string[]
  media: Media
  link: { label: string; href: string }
}

export const PROJECTS: readonly Project[] = [
  {
    name: "Spotime",
    ev: "spotime",
    slug: "spotime",
    tone: "tone-spotime",
    url: "spotime.fr",
    problem:
      "Field crews of 10 to 30 people, spread across sites, track hours on paper. Every month-end turns into hours of manual re-entry before payroll can start. Spotime replaces that with three surfaces: a web back office for admin and scheduling, an employee mobile app (iOS/Android) and an Electron desktop app for on-site clock-in, published on the Windows Store.",
    decision:
      "Clock-ins are stored local-first and synced as soon as the network returns, with no data loss or duplicates. GPS location is captured only at the moment of clock-in. Development runs with a team of subagents (PO, architect, tester, developer, reviewer), framed by user stories, a DoR/DoD and TDD.",
    tradeoff:
      "Cold email to construction SMEs wasn't landing, so I switched to cold calling. Traded reach for signal quality, on purpose.",
    learned:
      "Construction still showed no traction, even on direct calls. Pivoting to personal care services proved more receptive, with a client coming in inbound. Testing the channel first, then the market, beats rewriting the pitch.",
    result:
      "Two paying clients: one in agriculture, and one in personal care services who came in inbound.",
    stack: [
      "Tanstack Router",
      "PostgreSQL",
      "NestJS",
      "TypeScript",
      "shadcn/ui",
      "Plausible (self-hosted)",
      "Expo/React Native",
      "Electron",
    ],
    media: {
      kind: "shots",
      shots: ["/media/spotime-1.webp", "/media/spotime-2.webp"],
    },
    link: {
      label: "visit spotime.fr",
      href: "https://spotime.fr",
    },
  },
  {
    name: "Fraud Engine",
    ev: "fraud.engine",
    slug: "fraud-engine",
    tone: "tone-fraud-engine",
    url: "grafana · scorer-group lag",
    problem:
      "Learn Go and event-driven design on a case where event ordering matters: fraud detection. The pipeline has to absorb growing load and scale horizontally without code changes.",
    decision:
      "Three independent Go binaries (generator, scorer, sink) linked by Kafka, partitioned by card_id so a card is always scored by the same worker. Redis holds per-card velocity in a sliding window, ClickHouse stores scored transactions. Adding a scorer only triggers a partition rebalance.",
    tradeoff:
      "When its 1,000-slot buffer is full, the generator drops messages instead of blocking. Acceptable for a load test, since the ceiling stays visible in metrics. On a real payment pipeline, losing an event before the fraud check is not: backpressure or a persistent buffer instead.",
    learned:
      "The first version ran 3 scorers at ~3 tx/s. kafka-go's default 1s BatchTimeout capped writes at about one message per second, and each Redis command was its own round-trip. Explicit batching (size or timer, first one wins) and a pipelined Redis call fixed it: one optimized scorer now keeps up with a generator alone.",
    result:
      "Live scaling: with 1 scorer for 2 ramping generators, lag climbs to ~410 messages (~8s of traffic). Starting 2 more scorers drains it to 0. Three scorers handle ~220 tx/s combined.",
    stack: [
      "Go",
      "Kafka",
      "Redis",
      "ClickHouse",
      "Prometheus",
      "Grafana",
      "Docker",
    ],
    media: { kind: "video" },
    link: {
      label: "repo",
      href: "https://github.com/romain-cll/fraud-engine-event-driven",
    },
  },
  {
    name: "Event Hub",
    ev: "event.hub",
    slug: "event-hub",
    tone: "tone-event-hub",
    url: "github.com/romain-cll/events-hub",
    problem:
      "Web analytics count visitors. Stripe counts money. Nothing joins the two, so teams selling through Stripe can't tell which source, campaign or page actually brings revenue without a data warehouse or a tag manager.",
    decision:
      "One endpoint, POST /v1/events, for every source: browser SDK, backend, CI, Stripe webhooks. The server derives the fields it guarantees (source, session, visitor); the client only sends jsonb context. Payments link back to the first visit through a visitor id in Stripe metadata. The core never knows what an event type means, and a test fails the build if it does.",
    tradeoff:
      "Cookieless by default: the visitor key is an HMAC that rotates daily, and IP and User-Agent are never stored. Enough to count, not to follow, so renewals and LTV only attribute in consented mode. Privacy first, attribution depth second.",
    learned:
      "One Stripe payment fires four webhooks that all carry an amount. Mapping them to disjoint event types and reading one precise type keeps the same euro from being counted four times. In tests, ad-hoc supertest ports failed once every ~66,000 requests on a random suite; a shared harness with one server per suite fixed it.",
    result:
      "Working proof of concept: web analytics and Stripe revenue attribution shipped, with traffic, revenue and deploy markers on one chart. Next: a per-project ingestion cap and cohort views in the dashboard.",
    stack: [
      "NestJS",
      "PostgreSQL",
      "Drizzle",
      "Zod",
      "TanStack Start",
      "Stripe Connect",
      "shadcn/ui",
      "Turborepo",
    ],
    media: {
      kind: "shots",
      shots: [
        "/media/event-hub-1.webp",
        "/media/event-hub-2.webp",
        "/media/event-hub-3.webp",
        "/media/event-hub-4.webp",
        "/media/event-hub-5.webp",
      ],
    },
    link: {
      label: "repo",
      href: "https://github.com/romain-cll/events-hub",
    },
  },
]
