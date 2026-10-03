// Conversion unique du favicon : `node scripts/favicon.mjs ~/Downloads/favicon-r.svg`.
// Produit public/favicon.svg (« R » dessiné en tracé, sans métadonnées), public/favicon.ico (16 et 32 px)
// et public/apple-touch-icon.png (180 px, opaque). Les trois fichiers sont versionnés ; le script n'est pas dans package.json.
// Le « R » est lu dans le WOFF 1 IBM Plex Mono 700 de Fontsource (contours TrueType) avec `node:zlib`, sans dépendance.
import { chromium } from "@playwright/test"
import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { inflateSync } from "node:zlib"

const [, , sourceArg] = process.argv
if (!sourceArg) {
  console.error("Usage : node scripts/favicon.mjs <favicon-r.svg>")
  process.exit(1)
}
const source = resolve(sourceArg.replace(/^~(?=\/)/, homedir()))
const woff = fileURLToPath(
  new URL(
    "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff",
    import.meta.url
  )
)
const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))

// --- Lecture du glyphe -----------------------------------------------------

function readTables(buffer) {
  if (buffer.toString("latin1", 0, 4) !== "wOFF") throw new Error("WOFF 1 attendu")
  const tables = {}
  for (let i = 0; i < buffer.readUInt16BE(12); i++) {
    const entry = 44 + i * 20
    const offset = buffer.readUInt32BE(entry + 4)
    const length = buffer.readUInt32BE(entry + 8)
    const original = buffer.readUInt32BE(entry + 12)
    const data = buffer.subarray(offset, offset + length)
    tables[buffer.toString("latin1", entry, entry + 4)] =
      length < original ? inflateSync(data) : data
  }
  return tables
}

/** Index du glyphe d'un caractère : `cmap`, sous-table de format 4. */
function glyphIndex(cmap, code) {
  for (let i = 0; i < cmap.readUInt16BE(2); i++) {
    const table = cmap.readUInt32BE(4 + i * 8 + 4)
    if (cmap.readUInt16BE(table) !== 4) continue
    const segments = cmap.readUInt16BE(table + 6) / 2
    const ends = table + 14
    const starts = ends + segments * 2 + 2
    const deltas = starts + segments * 2
    const ranges = deltas + segments * 2
    for (let s = 0; s < segments; s++) {
      if (code > cmap.readUInt16BE(ends + s * 2)) continue
      if (code < cmap.readUInt16BE(starts + s * 2)) break
      const range = cmap.readUInt16BE(ranges + s * 2)
      const delta = cmap.readInt16BE(deltas + s * 2)
      if (range === 0) return (code + delta) & 0xffff
      const at = ranges + s * 2 + range + (code - cmap.readUInt16BE(starts + s * 2)) * 2
      const glyph = cmap.readUInt16BE(at)
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff
    }
  }
  throw new Error(`Aucun glyphe pour U+${code.toString(16)}`)
}

/** Contours (listes de points `{ x, y, on }`) d'un glyphe simple, et avance. */
function readGlyph(tables, code) {
  const { cmap, head, hhea, hmtx, loca, glyf } = tables
  const index = glyphIndex(cmap, code)
  const long = head.readInt16BE(50) === 1
  const at = (i) => (long ? loca.readUInt32BE(i * 4) : loca.readUInt16BE(i * 2) * 2)
  const unitsPerEm = head.readUInt16BE(18)
  const metrics = hhea.readUInt16BE(34)
  const advance = hmtx.readUInt16BE(Math.min(index, metrics - 1) * 4)

  let p = at(index)
  const contourCount = glyf.readInt16BE(p)
  if (contourCount <= 0) throw new Error("Glyphe simple attendu")
  p += 10
  const ends = Array.from({ length: contourCount }, (_, i) => glyf.readUInt16BE(p + i * 2))
  p += contourCount * 2
  p += 2 + glyf.readUInt16BE(p)
  const count = ends.at(-1) + 1

  const flags = []
  while (flags.length < count) {
    const flag = glyf.readUInt8(p++)
    flags.push(flag)
    if (flag & 8) for (let n = glyf.readUInt8(p++); n > 0; n--) flags.push(flag)
  }
  const coords = (short, same) => {
    let value = 0
    return flags.map((flag) => {
      if (flag & short) {
        const d = glyf.readUInt8(p++)
        value += flag & same ? d : -d
      } else if (!(flag & same)) {
        value += glyf.readInt16BE(p)
        p += 2
      }
      return value
    })
  }
  const xs = coords(2, 16)
  const ys = coords(4, 32)

  let first = 0
  const contours = ends.map((end) => {
    const points = []
    for (let i = first; i <= end; i++) points.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) })
    first = end + 1
    return points
  })
  return { contours, advance, unitsPerEm }
}

// --- SVG ---------------------------------------------------------------------

const round = (n) => String(Math.round(n * 100) / 100)

/** Tracé SVG (M, L, Q, Z) des contours, après transformation `(x, y) → (X, Y)`. */
function toPath(contours, transform) {
  const point = (p) => transform(p.x, p.y).map(round).join(" ")
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true })
  return contours
    .map((points) => {
      // Départ sur un point « on », ou au milieu de deux points « off » consécutifs.
      const start = points.findIndex((p) => p.on)
      const ring =
        start >= 0
          ? [...points.slice(start), ...points.slice(0, start)]
          : [mid(points.at(-1), points[0]), ...points]
      let d = `M${point(ring[0])}`
      for (let i = 1; i <= ring.length; i++) {
        const current = ring[i % ring.length]
        if (current.on) {
          d += i === ring.length ? "" : `L${point(current)}`
          continue
        }
        const next = ring[(i + 1) % ring.length]
        const end = next.on ? next : mid(current, next)
        d += `Q${point(current)} ${point(end)}`
        if (next.on) i++
      }
      return `${d}Z`
    })
    .join("")
}

const original = readFileSync(source, "utf8")
const text = original.match(/<text\b([^>]*)>([^<]*)<\/text>/)
if (!text) throw new Error("<text> introuvable dans la source")
const attribute = (name) => text[1].match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
const x = Number(attribute("x"))
const y = Number(attribute("y"))
const size = Number(attribute("font-size"))
const fill = attribute("fill")
if (attribute("text-anchor") !== "middle") throw new Error("text-anchor=middle attendu")

const glyph = readGlyph(readTables(readFileSync(woff)), text[2].codePointAt(0))
const scale = size / glyph.unitsPerEm
const path = toPath(glyph.contours, (gx, gy) => [
  x - (glyph.advance * scale) / 2 + gx * scale,
  y - gy * scale,
])

const svg = original
  .replace(/<metadata>[\s\S]*?<\/metadata>/, "")
  .replace(/\s*xmlns:c2pa="[^"]*"/, "")
  .replace(text[0], `<path fill="${fill}" d="${path}"/>`)
  .replace(/><\/(rect|circle)>/g, "/>")
  .trim()
writeFileSync(out("favicon.svg"), `${svg}\n`)

// --- Raster ------------------------------------------------------------------

const background = svg.match(/<rect\b[^>]*\bfill="([^"]*)"/)[1]
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`

const browser = await chromium.launch()
let png16, png32, png180
try {
  const tab = await browser.newPage()
  const render = async (px, opaque) => {
    await tab.setContent(
      `<body style="margin:0;background:${opaque ? background : "transparent"}"><img id="icon" width="${px}" height="${px}" src="${dataUrl}"></body>`
    )
    await tab.evaluate(() => document.getElementById("icon").decode())
    return tab.locator("#icon").screenshot({ omitBackground: !opaque })
  }
  png16 = await render(16, false)
  png32 = await render(32, false)
  png180 = await render(180, true)
} finally {
  await browser.close()
}
writeFileSync(out("apple-touch-icon.png"), png180)

// ICONDIR (0, 1, 2), deux entrées de 16 octets, puis les PNG.
const images = [
  [16, png16],
  [32, png32],
]
const header = Buffer.alloc(6 + images.length * 16)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
images.forEach(([px, data], i) => {
  const entry = 6 + i * 16
  header.writeUInt8(px, entry)
  header.writeUInt8(px, entry + 1)
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(data.length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += data.length
})
writeFileSync(out("favicon.ico"), Buffer.concat([header, ...images.map(([, data]) => data)]))
