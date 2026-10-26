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
]

/** Next project in the list that has a case study, if any */
export function nextProject(id: string) {
  const index = projects.findIndex((project) => project.id === id)
  return projects.slice(index + 1).find((project) => project.page)
}
