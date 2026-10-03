// Génère les deux CV PDF de public/ depuis les fichiers Claude Design. Lancé par `pnpm cv [dossier]` ; les PDF sont versionnés.
// Réseau requis : support.js charge React depuis unpkg, et les CV chargent leurs polices depuis Google Fonts.
import { chromium } from "@playwright/test"
import { existsSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const folder = process.argv[2]
  ? resolve(process.argv[2])
  : join(homedir(), "Downloads", "Portfolio Event-Driven")

const CVS = [
  { source: "Resume EN.dc.html", output: "resume-romain-caille.pdf" },
  { source: "CV FR.dc.html", output: "cv-romain-caille.pdf" },
].map(({ source, output }) => ({
  source,
  file: join(folder, source),
  output: fileURLToPath(new URL(`../public/${output}`, import.meta.url)),
}))

// Polices attendues dans chaque PDF, et graisses utilisées par les CV.
const REQUIRED_FONTS = ["Instrument Sans", "IBM Plex Mono"]
const WEIGHTS = [
  ["Instrument Sans", [400, 500, 600]],
  ["IBM Plex Mono", [400, 500]],
]

// Garde-fous : rien n'est lancé tant qu'un fichier du design manque.
for (const path of [
  folder,
  ...CVS.map((cv) => cv.file),
  join(folder, "support.js"),
  join(folder, "doc-page.js"),
]) {
  if (!existsSync(path)) {
    console.error(`Introuvable : ${path}`)
    process.exit(1)
  }
}

async function render(browser, { source, file }) {
  const tab = await browser.newPage()
  try {
    await tab.goto(pathToFileURL(file).href, { waitUntil: "networkidle" })
    await tab.waitForFunction(() =>
      document.querySelector("doc-page")?.shadowRoot?.querySelector(".sheet.paginated")
    )
    // `doc-page` impose la police système sur son hôte : on rend la main à Instrument Sans.
    await tab.addStyleTag({
      content: "doc-page { font-family: 'Instrument Sans', Helvetica, sans-serif }",
    })
    const families = await tab.evaluate(async (weights) => {
      await Promise.all(
        weights.flatMap(([family, list]) =>
          list.map((weight) => document.fonts.load(`${weight} 1em "${family}"`))
        )
      )
      await document.fonts.ready
      return [...document.fonts]
        .filter((font) => font.status === "loaded")
        .map((font) => font.family.replace(/["']/g, ""))
    }, WEIGHTS)
    for (const family of REQUIRED_FONTS) {
      if (!families.includes(family)) {
        throw new Error(`${source} : police ${family} non chargée (réseau ?)`)
      }
    }
    return await tab.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
  } finally {
    await tab.close()
  }
}

const browser = await chromium.launch()
try {
  const pdfs = []
  for (const cv of CVS) pdfs.push(await render(browser, cv))
  CVS.forEach(({ output }, i) => writeFileSync(output, pdfs[i]))
} finally {
  await browser.close()
}
