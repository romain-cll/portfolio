import type { FileRouteTypes } from '../routeTree.gen'
import { seo } from '../seo'
import type { ShareImage } from '../seo'

type Project = {
  /** In-page anchor of the project row on the home page */
  id: string
  name: string
  href: string
  description: string
  /** Case study route, once written */
  page?: FileRouteTypes['to']
  /** Image for links shared to the case study; the home page's otherwise */
  image?: ShareImage
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
    id: 'rstack',
    name: 'rstack',
    href: 'https://github.com/romain-cll/rstack',
    description:
      'Skills and agent loops to build features in parallel: one worktree per feature, from a spec I approve to a tested pull request.',
    page: '/projects/rstack',
  },
  {
    id: 'reflex-rag',
    name: 'Reflex RAG',
    href: 'https://github.com/romain-cll/reflex-rag',
    description:
      'A retrieval loop judged by a small decision model instead of an LLM. Same quality as Claude Haiku, retrieval about ten times faster and 58% cheaper.',
    page: '/projects/reflex-rag',
  },
  {
    id: 'videocn',
    name: 'VideoCn',
    href: 'https://videocn.dev',
    description:
      'A complete video player for React, installed with one shadcn command. Takes the host project’s theme and plays MP4, HLS, DASH and live streams.',
    page: '/projects/videocn',
  },
  {
    id: 'events-hub',
    name: 'events-hub',
    href: 'https://github.com/romain-cll/events-hub',
    description:
      'Joins web analytics and Stripe: each payment traced back to the visit that brought it. Cookieless by default.',
    page: '/projects/events-hub',
  },
  {
    id: 'fraud-engine',
    name: 'fraud-engine',
    href: 'https://github.com/romain-cll/fraud-engine-event-driven',
    description:
      'Event-driven fraud scoring in Go on Kafka, Redis and ClickHouse. Scales by starting more scorers, without code changes.',
    page: '/projects/fraud-engine',
  },
]

/** Next project in the list that has a case study, if any */
export function nextProject(id: string) {
  const index = projects.findIndex((project) => project.id === id)
  return projects.slice(index + 1).find((project) => project.page)
}

/** Head of a case study: its name, its home description, its image if it has one */
export function projectSeo(id: string) {
  const project = projects.find((p) => p.id === id)
  if (!project?.page) throw new Error(`No case study for ${id}`)
  return seo({
    title: `${project.name} — Romain Caillé`,
    description: project.description,
    path: project.page,
    image: project.image,
  })
}
