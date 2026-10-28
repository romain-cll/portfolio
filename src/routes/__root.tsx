import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { NotFound } from '../components/not-found'
import { themeScript } from '../components/theme-toggle'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: ({ matches }) => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      // Pages set their own title; a URL that matches no page has only
      // this root match, and gets the 404 one
      {
        title:
          matches.length === 1
            ? 'Page not found — Romain Caillé'
            : 'Romain Caillé',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      // Rendered by scripts/brand/render.sh
      { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
      { rel: 'icon', href: '/favicon-32.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets data-theme before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {/* Same centered column for every page */}
        <main className="mx-auto box-content flex max-w-(--container) flex-col gap-(--section-gap) p-(--page-padding)">
          {children}
        </main>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
