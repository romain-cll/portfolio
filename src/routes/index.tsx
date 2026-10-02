import { createFileRoute } from "@tanstack/react-router"

import { Home } from "@/components/home"

const ORIGIN = "https://romain-caille.fr"
const TITLE = "Romain Caillé · Fullstack developer"
const DESCRIPTION =
  "Fullstack developer, ready for the agentic era. Open to work, full-time or freelance, remote or relocation from Nantes, France."

const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Romain Caillé",
  url: ORIGIN,
  jobTitle: "Fullstack developer",
  sameAs: [
    "https://gitlab.com/romain.caille",
    "https://www.linkedin.com/in/romain-caill%C3%A9/",
  ],
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${ORIGIN}/` },
      { property: "og:image", content: `${ORIGIN}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(PERSON) },
    ],
  }),
  component: Home,
})
