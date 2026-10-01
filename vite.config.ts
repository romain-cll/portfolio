import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Le prérendu lance un serveur de preview puis l'appelle avec fetch. Sans hôte explicite,
  // le serveur écoute sur `localhost`, que certains conteneurs résolvent en ::1 alors que
  // fetch se connecte en 127.0.0.1 : ECONNREFUSED. On fixe l'IPv4 des deux côtés.
  preview: { host: "127.0.0.1" },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: false },
      sitemap: { enabled: true, host: "https://romain-caille.fr" },
    }),
    viteReact(),
  ],
})

export default config
