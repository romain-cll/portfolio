import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    // Lighthouse CI audite les fichiers de dist/client sous /index.html et /<route>/index.html : même route que le HTML prérendu.
    rewrite: {
      input: ({ url }) => {
        url.pathname = url.pathname.replace(/\/index\.html$/, "/")
        return url
      },
    },

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
