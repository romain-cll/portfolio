// Génère public/og.png (1200 × 630) depuis scripts/og.html. Lancé par `pnpm og` ; l'image est versionnée.
import { chromium } from "@playwright/test"
import { fileURLToPath, pathToFileURL } from "node:url"

const page = fileURLToPath(new URL("./og.html", import.meta.url))
const output = fileURLToPath(new URL("../public/og.png", import.meta.url))

const browser = await chromium.launch()
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await tab.goto(pathToFileURL(page).href)
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: output })
} finally {
  await browser.close()
}
