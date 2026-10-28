/** Where the site is served: canonical URLs and share images must be absolute */
export const SITE_URL = 'https://romain-caille.fr'

export type ShareImage = {
  src: string
  width: number
  height: number
  alt: string
}

/** Rendered by scripts/brand/render.sh; any page without its own image uses it */
const defaultImage: ShareImage = {
  src: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Romain Caillé, Fullstack developer',
}

/**
 * Head of a page: title, description, canonical URL, and the Open Graph and
 * Twitter tags that shape a shared link. Use in a route's `head()`.
 */
export function seo({
  title,
  description,
  path,
  image = defaultImage,
}: {
  title: string
  description: string
  /** Route path, e.g. /projects/spotime */
  path: string
  /** Defaults to the home page's share image */
  image?: ShareImage
}) {
  const url = SITE_URL + path
  const imageUrl = SITE_URL + image.src
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: path === '/' ? 'website' : 'article' },
      { property: 'og:site_name', content: 'Romain Caillé' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: String(image.width) },
      { property: 'og:image:height', content: String(image.height) },
      { property: 'og:image:alt', content: image.alt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: image.alt },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
