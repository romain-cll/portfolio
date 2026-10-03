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
*À compléter par l'architect.*

## Décisions
- 2026-10-03 — CV en ligne sous `/resume-romain-caille.pdf` (anglais) et `/cv-romain-caille.pdf` (français). Le lien `resume.pdf` télécharge la version anglaise, et la française n'est pas encore liée (validée par Romain)
- 2026-10-03 — PDF régénérés par un script `pnpm cv` depuis le dossier de design, puis versionnés (validée par Romain)
- 2026-10-03 — Favicon fourni par Romain (`favicon-r.svg`), ajouté à cette spec. La conversion est laissée à l'équipe (validée par Romain)
- 2026-10-03 — Spec validée (gate 1). Pour le favicon : « R » converti en tracé, métadonnées C2PA retirées, versions ICO et `apple-touch-icon` opaque, manifeste hors scope (validée par Romain)
