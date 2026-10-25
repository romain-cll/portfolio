import type { FileRouteTypes } from '../routeTree.gen'

type Project = {
  /** In-page anchor of the project row on the home page */
  id: string
  name: string
  href: string
  description: string
  /** Case study route, once written */
  page?: FileRouteTypes['to']
}

export const projects: Array<Project> = [
  {
    id: 'spotime',
    name: 'Spotime',
    href: 'https://spotime.fr',
    description:
      'Replaces paper hour tracking for field crews of 10–30. Web, mobile and Windows desktop app, local-first clock-ins.',
    page: '/projects/spotime',
  },
  {
    id: 'fraud-engine',
    name: 'Fraud Engine',
    href: 'https://github.com/romain-cll/fraud-engine-event-driven',
    description:
      'Event-driven fraud detection in Go over Kafka, Redis and ClickHouse. ~220 tx/s across three scorers.',
  },
  {
    id: 'event-hub',
    name: 'Event Hub',
    href: 'https://github.com/romain-cll/events-hub',
    description:
      'Cookieless analytics joined with Stripe revenue, to see which sources actually drive sales.',
  },
]

/** Next project in the list that has a case study, if any */
export function nextProject(id: string) {
  const index = projects.findIndex((project) => project.id === id)
  return projects.slice(index + 1).find((project) => project.page)
}
