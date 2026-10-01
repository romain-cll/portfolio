//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import { plugin as shadcn } from "@shadcn/lint"
import tsParser from "@typescript-eslint/parser"

// CA13 : couleur littérale (hex, rgb(), hsl(), oklch()…) dans une chaîne, un gabarit ou du texte JSX.
const COLOR_LITERAL =
  "#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b|\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\("

// CA14 : `white` et `black`, que `shadcn/no-raw-colors` accepte (text-white, hover:bg-black, bg-white/50…).
const WHITE_BLACK = "(?:^|[\\s:])[a-z][\\w-]*-(?:white|black)\\b"

// CA17 : tout module externe dont le nom contient icon ou lucide, sauf @carbon/icons-react.
const FOREIGN_ICON_LIBRARY = "^(?![./]|@/|@carbon/icons-react$).*(icon|lucide)"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "import/consistent-type-specifier-style": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    // Les tests lintent des fichiers virtuels de src/ (tests/unit/lint.test.ts), absents de tsconfig.json :
    // le service de projet les accepte via le projet par défaut.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: false,
        projectService: {
          allowDefaultProject: [
            "src/components/fixture.tsx",
            "src/components/ui/fixture.tsx",
          ],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Les tests sont écrits pour l'exécution (non-null assertions, chaînes optionnelles défensives) :
    // les règles de typage qui s'en plaignent ne s'y appliquent pas.
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
  {
    // Garde-fous de design (CA12 à CA15) : tout src/ sauf les composants générés par la CLI shadcn.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    rules: {
      "shadcn/no-inline-styles": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      // Une seule entrée : un second `no-restricted-syntax` remplacerait le premier.
      "no-restricted-syntax": [
        "error",
        ...["Literal", "TemplateElement", "JSXText"].map((type) => ({
          selector: `${type}[${type === "TemplateElement" ? "value.raw" : "value"}=/${COLOR_LITERAL}/]`,
          message:
            "Couleur littérale interdite : utiliser un token de src/styles.css.",
        })),
        ...["Literal", "TemplateElement"].map((type) => ({
          selector: `${type}[${type === "TemplateElement" ? "value.raw" : "value"}=/${WHITE_BLACK}/]`,
          message:
            "white et black sont interdits : utiliser un token de src/styles.css.",
        })),
      ],
    },
  },
  {
    // CA17 : s'applique partout, composants générés compris.
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: FOREIGN_ICON_LIBRARY,
              caseSensitive: false,
              message:
                "Seule @carbon/icons-react est autorisée pour les icônes.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      "dist",
      ".output",
      ".lighthouseci",
      ".pnpm-store",
      "test-results",
      "playwright-report",
      "src/routeTree.gen.ts",
      "tests/fixtures",
    ],
  },
]
