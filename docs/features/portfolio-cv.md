# Portfolio — CV, favicon et textes Spotime

## User story
En tant que recruteur ou client qui visite romain-caille.fr, je veux télécharger le CV de Romain depuis le lien `resume.pdf` et lire la présentation à jour de Spotime, afin d'avoir son parcours complet en un clic, et reconnaître le site à son icône dans l'onglet. En tant que Romain, je veux régénérer les CV anglais et français d'une seule commande quand je les modifie dans Claude Design.

## Critères d'acceptation

*Design de référence : `/Users/romain/Downloads/Portfolio Event-Driven/`, nouvelle version du 2026-10-03. Le portfolio (`Portfolio Event-Driven.dc.html`) fait foi pour les textes, et les CV (`Resume EN.dc.html`, `CV FR.dc.html`) font foi pour le contenu et la mise en page des PDF. « Spec pages » renvoie à `docs/features/portfolio-pages.md`.*

### Lien de téléchargement
- [ ] CA1 — Étant donné les deux liens `resume.pdf` de la page, celui du hero et celui du contact, quand je les inspecte, alors chacun pointe vers `/resume-romain-caille.pdf` avec l'attribut `download`, et garde son libellé `resume.pdf` suivi de l'icône Carbon flèche en haut à droite.
- [ ] CA2 — Étant donné la page servie par le serveur de prod, quand je clique sur un lien `resume.pdf`, alors le navigateur télécharge le CV anglais sous le nom `resume-romain-caille.pdf`, au lieu d'ouvrir une page.
- [ ] CA3 — Étant donné toute la page, quand je liste ses liens, alors aucun ne pointe vers `/cv-romain-caille.pdf` : le CV français est en ligne mais pas encore lié.

### Fichiers PDF
- [ ] CA4 — Étant donné le serveur de prod lancé en local, quand je demande `/resume-romain-caille.pdf` puis `/cv-romain-caille.pdf`, alors chacun répond 200 avec `content-type: application/pdf`.
- [ ] CA5 — Étant donné les deux PDF versionnés dans `public/`, quand je les ouvre, alors chacun fait une seule page au format A4. Le texte y est sélectionnable, pas une image. Leurs liens sont cliquables (site, e-mail, GitLab, LinkedIn, spotime.fr et dépôts). Chacun pèse au plus 400 000 octets.
- [ ] CA6 — Étant donné les deux PDF, quand j'en lis le texte, alors `/resume-romain-caille.pdf` est la version anglaise (titres « Experience » et « Projects », accroche « Fullstack developer, ready for the agentic era. ») et `/cv-romain-caille.pdf` la version française (titres « Expérience » et « Projets »), avec les textes du design à la lettre.
- [ ] CA7 — Étant donné l'URL `/cv.pdf`, qui n'est plus référencée, quand je la demande, alors elle répond toujours 404 (CA22 du socle).

### Script `pnpm cv`
- [ ] CA8 — Étant donné le dossier de design, quand je lance `pnpm cv`, alors le script régénère `public/resume-romain-caille.pdf` depuis `Resume EN.dc.html` et `public/cv-romain-caille.pdf` depuis `CV FR.dc.html`, conformes à CA5 et CA6. Le dossier par défaut est `~/Downloads/Portfolio Event-Driven`, et on peut en passer un autre en argument (`pnpm cv <dossier>`).
- [ ] CA9 — Étant donné un dossier de design introuvable, ou auquel il manque l'un des deux fichiers, quand je lance `pnpm cv`, alors le script s'arrête avec un message qui nomme le chemin manquant et un code de sortie non nul. Aucun PDF existant n'est modifié.

### Textes Spotime
- [ ] CA10 — Étant donné la section Spotime, quand je la lis, alors problem, decision, trade-off, what broke / learned et result sont ceux du nouveau design, à la lettre. Le HTML prérendu les contient, comme l'exige CA2 de la spec pages.
- [ ] CA11 — Étant donné la stack de Spotime, quand je la lis, alors elle compte 8 étiquettes dans l'ordre du design : Tanstack Router, PostgreSQL, NestJS, TypeScript, shadcn/ui, Plausible (self-hosted), Expo/React Native, Electron. Elles apparaissent une à une au défilement, comme les autres (CA17 et E1 de la spec pages).
- [ ] CA12 — Étant donné les autres sections (hero, overview, Fraud Engine, Event Hub, contact, terminal), quand je les compare au nouveau design, alors leurs textes ne changent pas.

### Favicon
*Source : `/Users/romain/Downloads/favicon-r.svg`. C'est un carré sombre aux coins arrondis, avec un « R » clair en IBM Plex Mono gras et une pastille à l'accent Spotime.*
- [ ] CA13 — Étant donné le `<head>` de `/`, quand je l'inspecte, alors il déclare l'icône SVG (`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`), une icône `/favicon.ico` de repli pour les navigateurs sans SVG, et une `apple-touch-icon` PNG de 180 × 180. Le `<link rel="icon" href="data:,">` du socle disparaît.
- [ ] CA14 — Étant donné le serveur de prod lancé en local, quand je demande `/favicon.svg`, `/favicon.ico` et `/apple-touch-icon.png`, alors chacun répond 200 avec son type (`image/svg+xml`, `image/x-icon` ou `image/vnd.microsoft.icon`, `image/png`). `/favicon.ico` contient au moins les tailles 16 × 16 et 32 × 32.
- [ ] CA15 — Étant donné `/favicon.svg`, quand je l'affiche sur un système qui n'a pas la police IBM Plex Mono, alors le « R » garde sa forme : il est dessiné en tracé, sans dépendre d'une police. Le fichier ne contient ni `<text>`, ni police externe, ni métadonnées inutiles, et pèse au plus 2 000 octets. Les versions PNG et ICO reproduisent le même dessin, couleurs comprises, et l'`apple-touch-icon` est opaque, sans coins transparents.
- [ ] CA16 — Étant donné le chargement de `/`, quand j'observe le réseau et la console, alors aucune requête d'icône n'échoue et aucune erreur n'apparaît. Ce CA remplace les tests du socle qui exigeaient `data:,` et l'absence de requête `/favicon.ico` (CA20 du socle).

### Non-régression
- [ ] CA17 — Étant donné le build de production, quand je lance `pnpm lhci` en local, alors les scores Performance, Accessibilité, Bonnes pratiques et SEO restent d'au moins 95.

## Hors scope
- Lien vers le CV français, sélecteur de langue ou version française du site.
- Page HTML du CV sur le site.
- Modification du contenu des CV : le design fait foi.
- Génération des PDF en CI ou au build : ils sont produits par `pnpm cv` sur la machine de Romain, puis versionnés.
- Le visuel `uploads/pasted-1791018415568-0.png`, que le design n'utilise pas.
- Manifeste d'application web (`manifest.webmanifest`) et icônes Android de 192 et 512 px.

## Contraintes
- Le design reste hors du dépôt. Le script lit les fichiers dans le dossier de design, avec `support.js`, `doc-page.js` et `uploads/`, qui font tourner les pages Claude Design. Les CV chargent leurs polices depuis Google Fonts : `pnpm cv` a donc besoin du réseau.
- Aucune nouvelle dépendance : le script utilise le Chromium de `@playwright/test`, déjà en dépendance de dev, comme `pnpm og` (`scripts/og.mjs`).
- Hébergement (`AGENTS.md`) : les PDF sont des fichiers statiques de `public/`, servis par srvx 1.0.5. Le script `start` et srvx ne changent pas.
- Tests du socle et de la spec pages à adapter, avec une décision datée :
  - le lien `resume.pdf` vers `/cv.pdf` (CA10 du socle dans `tests/e2e/hero.spec.ts`, CA25 de la spec pages dans `tests/e2e/sections.spec.ts`) ;
  - les textes de Spotime dans l'oracle `tests/design.ts` ;
  - le favicon `data:,` et l'absence de requête `/favicon.ico` (CA20 du socle dans `tests/e2e/hero.spec.ts`).
- `AGENTS.md` : mettre à jour les « Points connus » (`/cv.pdf` n'existe pas encore, pas de favicon) et ajouter `pnpm cv` au tableau des commandes.
- Favicon : la source contient un `<text>` en IBM Plex Mono 700, une graisse que le site ne charge pas et qu'une image SVG ne peut pas charger. Elle contient aussi une couleur `oklch()`, que certains convertisseurs raster ne lisent pas, et environ 7 Ko de métadonnées C2PA. La conversion est faite une fois et versionnée, avec ses commandes notées dans le commit, comme pour les médias.
- Langue du site : anglais.

## Plan technique
### Approche
`scripts/cv.mjs` reprend le modèle de `og.mjs`. Il imprime les deux CV Claude Design en mémoire avec le Chromium de Playwright, puis écrit les deux PDF de `public/` seulement si les deux rendus ont réussi. Les deux liens `resume.pdf` reçoivent `href="/resume-romain-caille.pdf"` et `download`.
Le favicon est converti une fois, sans dépendance : le « R » est lu dans le WOFF IBM Plex Mono 700 de Fontsource, et Chromium, qui lit `oklch()`, fait le raster. Le `<head>` est mis à jour.
Pour Spotime, seules les données de `content.ts` changent. srvx 1.0.5 sert déjà les bons types : rien ne change côté serveur ni dans le script `start`.

### Fichiers
- créé : `scripts/cv.mjs` — script `pnpm cv [dossier]` (tâche 3).
- créé : `public/resume-romain-caille.pdf`, `public/cv-romain-caille.pdf` — produits par `pnpm cv`, puis versionnés.
- créé : `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png` — produits par la conversion de la tâche 5, puis versionnés.
- créé (selon la décision 1) : `scripts/favicon.mjs` — conversion unique du favicon, sans entrée dans `package.json`.
- modifié : `package.json` — script `"cv": "node scripts/cv.mjs"`. Aucune dépendance.
- modifié : `src/components/hero.tsx` l. 91-97 — lien de la ligne `resume` : `href="/resume-romain-caille.pdf"` et `download`.
- modifié : `src/components/contact.tsx` l. 142-145 — dernier lien de la rangée gitlab / linkedin : même changement.
- modifié : `src/routes/__root.tsx` l. 29-33 — l'entrée `data:,` et son commentaire sont remplacés par trois liens d'icône.
- modifié : `src/lib/content.ts` l. 42-59 (`PROJECTS[0]`) — problem, decision, tradeoff, learned, result et stack de Spotime, à la lettre (design, l. 314-319).
- modifié (PO) : `AGENTS.md` — `pnpm cv [dossier]` ajouté au tableau des commandes, avec la mention « réseau requis ». « Points connus » : les lignes `/cv.pdf` et favicon sont remplacées par l'état réel des deux CV (l'un lié, l'autre non) et du favicon.
- modifié (PO) : `docs/features/portfolio-cv.md` — décisions datées pour chaque test du socle ou des pages adapté.
- créés (tester) :
  - `tests/pdf.ts` — lecture minimale d'un PDF, sur le modèle de `tests/mp4.ts` ;
  - `tests/icons.ts` — répertoire ICO, entrées PNG et IHDR d'un PNG ;
  - `tests/unit/cv.test.ts`, `tests/unit/favicon.test.ts`, `tests/e2e/cv.spec.ts`.
- modifiés (tester) : `tests/design.ts`, `tests/e2e/hero.spec.ts`, `tests/e2e/sections.spec.ts`, `tests/e2e/server.spec.ts` (voir la stratégie de test).
- inchangés, vérifiés :
  - `src/components/project.tsx` : il gère déjà 8 étiquettes, comme pour Event Hub ;
  - `scripts/check-src.mjs` : il ne parcourt que `src/` et `package.json`, donc `oklch()` reste permis dans `public/favicon.svg` ;
  - `vite.config.ts`, `playwright.config.ts`, `lighthouserc.json`, ainsi que srvx et le script `start`.

### Tâches (ordonnées)
Prérequis : les tests rouges (voir la stratégie de test).

1. **Textes Spotime** — couvre CA10, CA11, CA12.
   - Dans `content.ts`, remplacer les cinq textes et la stack par ceux du design, à la lettre. L'apostrophe de « wasn't » est droite.
   - Stack : Tanstack Router, PostgreSQL, NestJS, TypeScript, shadcn/ui, Plausible (self-hosted), Expo/React Native, Electron.
   - Effet sur les révélations : aucun code à changer. Dans `project.tsx` (l. 82-93), l'étiquette k se révèle de `0.42 + k·0.05` à `0.5 + k·0.05`, comme dans le design (l. 550). Les nouvelles k = 6 et k = 7 se révèlent sur 0,72–0,80 et 0,77–0,85, donc avant la fin de la section, comme les 8 étiquettes d'Event Hub. La clé React est le libellé, et les 8 libellés sont uniques.
   - Autres sections : dans le nouveau design, les textes de Fraud Engine, d'Event Hub, de `LOG` et de `annTexts`, ainsi que ceux repérés dans le hero, l'overview et le contact, sont identiques à `tests/design.ts`. Rien d'autre ne change.

2. **Liens `resume.pdf`** — couvre CA1, CA2, CA3.
   - `<a href="/resume-romain-caille.pdf" download …>` dans le hero et dans le contact.
   - `download` est un attribut booléen : React le rend en `download=""`.
   - srvx n'envoie pas de `Content-Disposition`, donc le nom du fichier téléchargé vient de l'URL : `resume-romain-caille.pdf`.
   - Libellé, icône et classes ne changent pas. Aucun lien vers le CV français.

3. **Script `pnpm cv`** — couvre CA8, CA9.
   - **Dossier.** `process.argv[2]`, résolu depuis le dossier courant. Par défaut : `join(homedir(), "Downloads", "Portfolio Event-Driven")`.
   - **Couples source → sortie.** `Resume EN.dc.html` → `resume-romain-caille.pdf`, `CV FR.dc.html` → `cv-romain-caille.pdf`. Les sorties sont résolues par `new URL("../public/…", import.meta.url)`, comme dans `og.mjs`.
   - **Garde-fous (CA9), avant de lancer Chromium.**
     - Ordre des vérifications : le dossier, puis les deux CV, puis `support.js` et `doc-page.js`.
     - Au premier chemin absent : `console.error(\`Introuvable : ${chemin absolu}\`)`, puis `process.exit(1)`.
   - **Rendu, une page par CV.**
     - `goto(pathToFileURL(fichier).href, { waitUntil: "networkidle" })`. Le réseau sert à React et ReactDOM, que `support.js` charge depuis unpkg, et à Google Fonts.
     - `waitForFunction(() => document.querySelector("doc-page")?.shadowRoot?.querySelector(".sheet.paginated"))`. Cette condition garantit que l'élément est défini, rendu par le runtime x-dc, et mesuré en pagination explicite.
     - Polices : `evaluate` attend `document.fonts.ready`, puis renvoie les familles des `FontFace` en statut `loaded`, sans guillemets. Si « Instrument Sans » ou « IBM Plex Mono » manque, le script lève `"<source> : police … non chargée (réseau ?)"`.
     - `page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })`. En Playwright 1.63.0, `margin` est un objet (`types.d.ts`, l. 4150). `doc-page.js` injecte `@page { size: 210mm 297mm; margin: 0 }`.
   - **Écriture.** Les deux buffers sont écrits seulement après les deux rendus. Toute exception fait rejeter le `await` de premier niveau : sortie en code 1, navigateur fermé dans le `finally`, aucun PDF touché.

4. **Générer les PDF** — couvre CA4, CA5, CA6, CA7.
   - Lancer `pnpm cv` sur la machine de Romain (réseau requis), puis versionner les deux PDF.
   - `/cv.pdf` reste absent : il répond toujours 404.

5. **Favicon, conversion unique** — couvre CA14, CA15. Commande à noter dans le commit : `node scripts/favicon.mjs ~/Downloads/favicon-r.svg`.
   - **Outils disponibles, vérifiés.**
     - Aucun outil de police ni de vectorisation : Homebrew est vide, le Python système n'a pas fontTools, et il n'y a ni Inkscape, ni rsvg, ni ImageMagick.
     - Le store pnpm contient `sharp-cli`, `png-to-ico` et `resvg-js` (utilisables par `dlx`), mais aucun outil qui vectorise un glyphe. Le support d'`oklch()` par librsvg dans sharp 0.34 n'est pas vérifié.
     - `node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff` est un WOFF 1 à contours TrueType (tables `cmap`, `glyf`, `loca`, `hmtx` présentes) : `node:zlib` suffit à le lire. Le `.woff2` demanderait Brotli et le décodage des transformations `glyf` : on l'écarte.
   - **SVG.**
     - Retirer `<metadata>…</metadata>` et `xmlns:c2pa`.
     - Lire x, y, font-size, fill et text-anchor du `<text>`, puis le remplacer par `<path fill="#e6e8eb" d="…"/>`.
     - Glyphe « R » : `cmap` au format 4 pour U+0052, puis `loca` et `glyf`. Le glyphe doit être simple (`numberOfContours > 0`), sinon le script s'arrête. On lit aussi `head` (`unitsPerEm`, `indexToLocFormat`) et `hhea`/`hmtx` (avance a).
     - Contours quadratiques, avec les points « on » implicites, convertis en `M`, `L`, `Q`, `Z`. Transformation : s = 21 / unitsPerEm, X = 14,5 − a·s/2 + gx·s (ancre `middle`), Y = 23 − gy·s. Arrondi à 2 décimales.
     - Le `rect` et le `circle` restent tels quels, `oklch()` compris. Poids attendu : environ 1 Ko.
   - **Raster.** Chromium de `@playwright/test`, avec `<img src="data:image/svg+xml;base64,…">` de N px et une capture d'élément.
     - 16 et 32 px : `omitBackground: true`, coins transparents.
     - 180 px : fond `body` à la couleur du `rect` (#121417), sans `omitBackground`. On obtient `apple-touch-icon.png`, opaque, coins pleins.
   - **ICO.** ICONDIR (0, 1, 2), puis 2 entrées de 16 octets (largeur, hauteur, 0, 0, plans 1, 32 bpp, taille, offset), puis les PNG 16 et 32. Le PNG dans un ICO est lu par tous les navigateurs actuels.

6. **`<head>`** — couvre CA13, CA16. Dans `__root.tsx`, `links` remplace `data:,` par :
   - `{ rel: "icon", href: "/favicon.ico", sizes: "32x32" }` : avec `sizes`, Chrome préfère le SVG ;
   - `{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }` ;
   - `{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" }`.

7. **srvx 1.0.5 : aucun code à écrire** — couvre CA4, CA14. Vérifié dans `node_modules/.pnpm/srvx@1.0.5/node_modules/srvx/dist/` :
   - `cli.mjs`, l. 29 et 70-74 : `-s ../client` pointe sur `dist/client`. `staticMiddleware({ dir })` passe avant le handler TanStack, et Vite y copie `public/`.
   - `static.mjs`, l. 19, 22, 23 et 33 : `.ico` → `image/vnd.microsoft.icon`, `.png` → `image/png`, `.svg` → `image/svg+xml`, `.pdf` → `application/pdf`.
   - l. 188 : pas de `charset` pour les types qui ne sont pas `text/`.
   - l. 266-268 : le SVG est compressible (`+xml`), il part en br ou gzip au-delà de 1 024 octets. PDF, ICO et PNG partent tels quels, avec `Content-Length` et `Accept-Ranges` (l. 189-191).

8. **Documentation (PO)** — `AGENTS.md` et décisions datées de la spec (voir Fichiers).

9. **Vérifications locales** — couvre CA17 et les vérifications manuelles.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci`.
   - `pnpm cv` puis `pnpm cv "<autre dossier>"`.
   - Ouvrir les deux PDF dans Aperçu : une page, liens cliquables, fidèles au design.
   - Onglet dans Chrome, Firefox et Safari, puis écran d'accueil iOS.

### Stratégie de test
- **Commandes.**
  - Unitaires : `pnpm test` (un fichier : `node --test tests/unit/cv.test.ts`).
  - E2E : `pnpm build && pnpm test:e2e` (ciblé : `pnpm build && pnpm test:e2e tests/e2e/cv.spec.ts tests/e2e/server.spec.ts`).
  - Lighthouse : `pnpm build && pnpm lhci`.
- **Stabilité sur le runner lent de la CI.**
  - Les nouveaux e2e visent le serveur de prod (`baseURL`, `openHome`), avec `test.use({ actionTimeout: 5_000 })`.
  - Ni `waitForTimeout` ni attente fixe : les changements d'état passent par `expect.poll`.
  - Téléchargement : `Promise.all([page.waitForEvent('download'), lien.click()])`.
  - Avant tout canvas : `img.decode()`.
  - Couleurs comparées avec des tolérances. Les PNG sont produits sous macOS et comparés sous Linux.
  - Aucun test unitaire ne lance Chromium ni n'utilise le réseau : CA9 s'arrête avant le lancement.
- CA1 → e2e (`cv.spec.ts`) — les deux liens (`dd` de `resume`, contact) ont `href="/resume-romain-caille.pdf"`, l'attribut `download`, le texte `resume.pdf`, puis un `svg` `viewBox="0 0 32 32"` placé après le texte.
- CA2 → e2e, serveur de prod — clic réel sur le lien du hero, puis sur celui du contact après `scrollToProgress(page, 'contact', 1)` et `toBeVisible()`.
  - Attendu : un événement `download` avec `suggestedFilename() === 'resume-romain-caille.pdf'`.
  - L'URL de la page ne change pas.
  - Les octets téléchargés sont ceux de `dist/client/resume-romain-caille.pdf`.
- CA3 → e2e — `a[href*="cv-romain-caille"]` : 0 sur la page. `dist/client/index.html` ne contient pas `cv-romain-caille`.
- CA4 → e2e (`server.spec.ts`) — les deux PDF répondent 200, en `application/pdf`. Le corps commence par `%PDF-` et reprend le fichier de `public/` à l'octet près.
- CA5 → unitaire (`cv.test.ts` et `tests/pdf.ts`).
  - Poids au plus 400 000 octets ; un seul objet `/Type /Page` ; MediaBox de 595,28 × 841,89 pt, à 1 pt près.
  - Le texte se décode par `ToUnicode` et n'est pas vide : il est sélectionnable, ce n'est pas une image.
  - Les URI des annotations contiennent site, mailto, GitLab, LinkedIn, spotime.fr et les deux dépôts. Comparer après `new URL(x).href`, car Chromium écrit des URL résolues (`https://spotime.fr/`).
- CA6 → unitaire — texte décodé, comparé sans espaces.
  - EN : « Experience » et « Projects », insensibles à la casse (le CSS met les titres en capitales), et l'accroche, sans « Expérience ».
  - FR : « Expérience », « Projets » et « Développeur fullstack, prêt pour l'ère agentique. ».
  - Quelques phrases recopiées du design, choisies sans ligature fi/fl.
  - Le « à la lettre » complet tient à la construction (rendu du design lui-même), plus une relecture manuelle.
- CA7 → e2e — le test existant `server.spec.ts` (`/cv.pdf` répond 404). On ajoute : aucun `a[href="/cv.pdf"]` sur la page.
- CA8 → manuel — `pnpm cv`, puis `pnpm cv "<dossier>"` : les deux PDF sont régénérés (date de modification), puis `pnpm test` passe au vert sur les nouveaux fichiers.
- CA9 → unitaire — `spawnSync(process.execPath, ['scripts/cv.mjs', dossier])` sur trois cas : un dossier inexistant, un dossier temporaire avec `Resume EN.dc.html` seul, puis un autre avec `CV FR.dc.html` seul.
  - Attendu : un code non nul, et `stderr` contient le chemin absolu manquant.
  - Le SHA-256 des PDF de `public/` ne change pas (ou les fichiers restent absents).
- CA10 → e2e, tests existants après mise à jour de `tests/design.ts` — `pages.spec.ts` CA2 (HTML prérendu, réponse du serveur, rendu sans JS) et `sections.spec.ts` CA18.
- CA11 → e2e, tests existants — `sections.spec.ts` CA17 (ordre et fenêtres de révélation des 8 étiquettes) et `ecarts.spec.ts` E1.
- CA12 → e2e, tests existants — `pages.spec.ts` CA2, `hero.spec.ts` CA10, `sections.spec.ts` CA16 et CA25, ainsi que les specs du terminal. Ils gardent un oracle inchangé hors Spotime.
- CA13 → e2e — dans `/` (servie) et dans `dist/client/index.html` :
  - `link[rel="icon"][type="image/svg+xml"][href="/favicon.svg"]`, `link[rel="icon"][href="/favicon.ico"]` et `link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]` apparaissent une fois chacun ;
  - aucun `href="data:,"`.
- CA14 → e2e (`server.spec.ts`) et unitaire.
  - E2E : les trois URL répondent 200, avec `image/svg+xml`, `image/vnd.microsoft.icon` ou `image/x-icon`, et `image/png`.
  - Unitaire (`favicon.test.ts`) : l'ICO est de type 1, avec des entrées de 16 et de 32 px.
- CA15 → unitaire et e2e.
  - Unitaire : le SVG pèse au plus 2 000 octets et contient `<path`. Il ne contient ni `<text`, `font`, `<style`, `url(`, `<metadata`, `c2pa` ni `<!--`. L'IHDR du PNG vaut 180 × 180.
  - E2E : on dessine `/favicon.svg` sur un canvas, à 180 px sur fond #121417 et à 16 et 32 px sur fond transparent. On compare avec `apple-touch-icon.png` et avec les entrées de l'ICO, extraites en Node et passées en data URL. Attendu : un écart moyen faible, et des points d'échantillon dans `COLOR_TOLERANCE` (fond #121417, aplat du « R » #e6e8eb, centre de la pastille = `cssRgb('oklch(0.72 0.07 210.53)')`).
  - `apple-touch-icon` : tous les alpha valent 255 et les quatre coins sont à #121417.
  - Manuel : affichage dans Chrome, Firefox, Safari et iOS.
- CA16 → e2e — le test CA20 de `hero.spec.ts`, adapté, vérifie qu'il n'y a ni erreur console ni `pageerror`, ni réponse ≥ 400, ni `requestfailed`. `cv.spec.ts` ajoute que chaque `href` d'icône du `<head>` répond 200. Chromium headless ne demande pas les favicons : on ne peut pas compter sur ses requêtes.
- CA17 → manuel local — `pnpm build && pnpm lhci` (seuil de 95 sur les quatre catégories), puis la CI sur `main`.
- **Tests existants à adapter**, chacun avec une décision datée :
  - `tests/e2e/hero.spec.ts` l. 161-166 (CA10 du socle) : `href` `/cv.pdf` → `/resume-romain-caille.pdf`, et ajout de `download`. Raison : CA1.
  - `tests/e2e/hero.spec.ts` l. 273 (CA20 du socle) : retirer l'assertion « aucune requête `/favicon.ico` », et garder le reste du test. Raison : le fichier existe et peut être demandé (CA16).
  - `tests/e2e/hero.spec.ts` l. 278-281 (CA20 du socle) : supprimer le test `data:,`. Raison : CA13 le remplace.
  - `tests/e2e/sections.spec.ts` l. 869 (CA25 des pages) : `['resume.pdf', '/cv.pdf']` → `'/resume-romain-caille.pdf'`. Raison : CA1.
  - `tests/design.ts` l. 70-75 : les textes et la stack (8 étiquettes) de Spotime sont recopiés du nouveau design. Raison : CA10, CA11. Le changement se propage à `pages.spec.ts`, `sections.spec.ts` et `ecarts.spec.ts`.
  - `tests/e2e/server.spec.ts` l. 20-23 : rien à changer (il couvre CA7). On ajoute CA4 et CA14 dans le même fichier.

### Décisions à valider
- **Script de conversion du favicon** — options :
  - A : versionné en `scripts/favicon.mjs`, sans entrée dans `package.json` ;
  - B : jetable, dans le scratchpad, avec les étapes résumées dans le commit.

  Recommandation : A. Le script fait environ 100 lignes (lecture du WOFF, ICO), qu'un message de commit ne peut pas porter. `og.mjs` est déjà un générateur versionné à côté de son produit, et A n'ajoute aucune dépendance.
- **Lecture du texte des PDF dans les tests (CA5, CA6)** — options :
  - A : helper maison `tests/pdf.ts`, avec `node:zlib`, comme `tests/mp4.ts` ;
  - B : `pdfjs-dist` en devDependency (nouvelle dépendance) ;
  - C : texte vérifié à la main, et tests limités aux pages, au format, aux liens et au poids.

  Recommandation : A, sans dépendance. Repli sur C si la sortie de Skia se révèle illisible sans moteur PDF.
- **Ambiguïtés de la spec : aucune bloquante.** Interprétations à confirmer :
  - CA6 : comparaison des titres insensible à la casse ;
  - CA9 : le script vérifie aussi `support.js` et `doc-page.js` ;
  - CA13 : l'ICO est déclaré avec `sizes="32x32"` ;
  - CA15 : la pastille garde `oklch()` dans le SVG. Elle est rendue nativement par les navigateurs actuels, et le raster passe par Chromium.

### Risques
- **Sortie PDF de Skia.** Google sert sans doute Instrument Sans en police variable. Skia peut alors l'embarquer en Type3, avec des codes sur 1 octet, des ligatures en `/ActualText` et du texte dans des XObjects. `tests/pdf.ts` doit couvrir ces cas. Le tester développe le helper sur un PDF produit dans le scratchpad avec la commande d'essai du PO, car les PDF n'existent pas encore au moment des tests rouges.
- **`pnpm cv` dépend d'unpkg, que `support.js` utilise pour charger React, en plus de Google Fonts.** Ce point n'est pas dans la spec. Une coupure réseau ou une évolution de `doc-page.js` (classe `.sheet.paginated`) fait échouer le script bruyamment, et aucun fichier n'est écrit.
- **Les textes de Spotime s'allongent**, au niveau d'Event Hub, la plus longue section aujourd'hui. Il faut surveiller CA17 (titre à l'écran) et CA29 (focus du `summary`) à 1440 × 900. Aucun changement de mise en page n'est prévu.
- **Comparaisons de pixels.** Les PNG sont faits par Chromium sous macOS, et la CI les compare sous Linux. On utilise des tolérances, pas une égalité exacte.
- **Poids du dépôt.** Chaque régénération ajoute environ 440 Ko de PDF à l'historique git.

## Décisions
- 2026-10-03 — CV en ligne sous `/resume-romain-caille.pdf` (anglais) et `/cv-romain-caille.pdf` (français). Le lien `resume.pdf` télécharge la version anglaise, et la française n'est pas encore liée (validée par Romain)
- 2026-10-03 — PDF régénérés par un script `pnpm cv` depuis le dossier de design, puis versionnés (validée par Romain)
- 2026-10-03 — Favicon fourni par Romain (`favicon-r.svg`), ajouté à cette spec. La conversion est laissée à l'équipe (validée par Romain)
- 2026-10-03 — Spec validée (gate 1). Pour le favicon : « R » converti en tracé, métadonnées C2PA retirées, versions ICO et `apple-touch-icon` opaque, manifeste hors scope (validée par Romain)
- 2026-10-03 — Plan technique validé (gate 2), avec les recommandations de l'architect (validée par Romain) :
  - conversion du favicon versionnée dans `scripts/favicon.mjs`, sans commande `pnpm` ;
  - texte des PDF lu dans les tests par un helper maison, `tests/pdf.ts`, sans dépendance. Repli sur une vérification manuelle du texte si la sortie de Chromium est illisible ;
  - interprétations retenues : titres de CA6 comparés sans la casse ; `pnpm cv` vérifie aussi `support.js` et `doc-page.js` ; ICO déclaré en `sizes="32x32"` ; pastille du favicon en `oklch()` dans le SVG ;
  - `pnpm cv` dépend aussi d'unpkg (React chargé par `support.js`), en plus de Google Fonts.
- 2026-10-03 — Tests existants adaptés pour cette feature (validée par Romain) :
  - `hero.spec.ts`, CA10 du socle : le lien `resume.pdf` pointe vers `/resume-romain-caille.pdf`, avec `download` (CA1) ;
  - `hero.spec.ts`, CA20 du socle : l'assertion « aucune requête `/favicon.ico` » est retirée et le test `data:,` est supprimé (CA13, CA16) ;
  - `sections.spec.ts`, CA25 de la spec pages : le lien `resume.pdf` pointe vers `/resume-romain-caille.pdf` (CA1) ;
  - `tests/design.ts` : textes et stack de Spotime recopiés du nouveau design (CA10, CA11).
