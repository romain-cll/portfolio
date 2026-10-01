// Garde-fous que ESLint ne couvre pas (CA13, CA16, CA17). Lancé depuis la racine du dépôt.
// Sortie au format `chemin:ligne  message`, code 1 en cas d'échec.
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { extname } from "node:path"

const STYLES = "src/styles.css"
const GENERATED_DIR = "src/components/ui" // composants générés par la CLI shadcn : exemptés
const SCRIPT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
]) // couverts par ESLint

const HEX = "#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b"
const ANY_COLOR = new RegExp(
  `${HEX}|\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(`,
  "g"
)
// Dans styles.css, seul oklch() est permis : le `\b` laisse passer `oklch(` sans laisser passer `lch(` ni `lab(`.
const NON_OKLCH_COLOR = new RegExp(
  `${HEX}|\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|color)\\(`,
  "g"
)

const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
  cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
  darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
  firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
  hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
  mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
  slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
  whitesmoke yellow yellowgreen`.split(/\s+/)
)

const errors = []
const report = (file, line, message) =>
  errors.push(`${file}:${line}  ${message}`)

/** Numéro de ligne (à partir de 1) de l'offset `index` dans `text`. */
const lineAt = (text, index) => text.slice(0, index).split("\n").length

/** Remplace les commentaires CSS par des espaces, sans décaler les numéros de ligne. */
const blankComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (path === GENERATED_DIR) continue
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

function checkStyles(css) {
  const text = blankComments(css)
  for (const match of text.matchAll(NON_OKLCH_COLOR)) {
    report(
      STYLES,
      lineAt(text, match.index),
      `couleur dans un autre format qu'oklch() : ${match[0]}`
    )
  }

  const withoutStrings = text.replace(
    /"[^"\n]*"|'[^'\n]*'|url\([^)]*\)/g,
    (s) => s.replace(/[^\n]/g, " ")
  )
  for (const declaration of withoutStrings.matchAll(
    /(?<![\w-])[\w-]+\s*:\s*([^;{}]+)/g
  )) {
    const valueStart =
      declaration.index + declaration[0].length - declaration[1].length
    for (const word of declaration[1].matchAll(
      /(?<![\w-])[a-z]+(?![\w(-])/gi
    )) {
      if (NAMED_COLORS.has(word[0].toLowerCase())) {
        report(
          STYLES,
          lineAt(text, valueStart + word.index),
          `couleur nommée interdite : ${word[0]}`
        )
      }
    }
  }
}

if (existsSync("src")) {
  for (const file of walk("src")) {
    const extension = extname(file)
    if (extension === ".css") {
      if (file === STYLES) checkStyles(readFileSync(file, "utf8"))
      else
        report(file, 1, `fichier CSS interdit : tout le CSS va dans ${STYLES}`)
      continue
    }
    if (SCRIPT_EXTENSIONS.has(extension)) continue

    const content = readFileSync(file)
    if (content.includes(0)) continue // binaire (image, police…)
    const text = content.toString("utf8")
    for (const match of text.matchAll(ANY_COLOR)) {
      report(
        file,
        lineAt(text, match.index),
        `couleur littérale interdite : ${match[0]}`
      )
    }
  }
}

if (existsSync("package.json")) {
  const raw = readFileSync("package.json", "utf8")
  const pkg = JSON.parse(raw)
  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      if (name !== "@carbon/icons-react" && /icon|lucide/i.test(name)) {
        const line = lineAt(raw, raw.indexOf(`"${name}"`))
        report(
          "package.json",
          line,
          `bibliothèque d'icônes interdite : ${name} (seule @carbon/icons-react est autorisée)`
        )
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exit(1)
}
