# CV — mise à jour 3

## User story
En tant que recruteur ou client qui télécharge le CV de Romain sur romain-caille.fr, je veux lire sa version à jour, afin de voir son positionnement fullstack TypeScript, des résultats chiffrés sur Spotime et les dates exactes de ses postes.

## Critères d'acceptation

*Source : `/Users/romain/Downloads/Portfolio Event-Driven/`, export du 2026-10-05 à 02 h 48. Romain y a déjà fait les changements dans Claude Design. `Resume EN.dc.html` et `CV FR.dc.html` font foi pour le contenu et la mise en page des PDF, sans aucune modification à faire. Les PDF sont produits par `pnpm cv` (spec `docs/features/portfolio-cv.md`), et le script ne change pas. Le site ne change pas.*

*Constat du PO, export comparé au texte des PDF en ligne : les deux CV changent sur les mêmes points, listés ci-dessous. Tout le reste est identique.*

### Génération
- [ ] CA1 — Étant donné le dossier de design ci-dessus, quand je lance `pnpm cv`, alors `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf` sont régénérés depuis cet export, puis versionnés.

### CV anglais (`/resume-romain-caille.pdf`)
- [ ] CA2 — Étant donné le PDF anglais, quand j'en lis l'accroche, alors elle commence, à la lettre, par « I build full-stack TypeScript products end to end, from the backend to web, mobile and desktop apps. », et ne contient plus « I build TypeScript and Go backends, from REST APIs to event-driven pipelines on Kafka. ». La suite de l'accroche ne change pas.
- [ ] CA3 — Étant donné le bloc Spotime, quand j'en lis le sous-titre, alors c'est « Time-tracking SaaS for field crews · spotime.fr », sans « construction and ». Le lien `spotime.fr` reste cliquable.
- [ ] CA4 — Étant donné le bloc Spotime, quand j'en lis la 2e puce, alors c'est, à la lettre, « Cold-called 150 construction companies with no traction, so I switched to personal care services, where prospects come in through the website. 3 paying clients, 15 users. ». L'ancienne puce (« Cold-call prospecting: no traction in construction, so I pivoted to test the personal care services market, which proved more receptive, with prospects coming in inbound. ») a disparu. Les 3 autres puces ne changent pas.
- [ ] CA5 — Étant donné le bloc Enedis, quand j'en lis la date, alors c'est « Sep 2023 – Sep 2025 », et plus « 2023–2025 ».
- [ ] CA6 — Étant donné le bloc Enedis, quand j'en lis la 2e puce, alors elle contient « (AdonisJS, PostgreSQL), built as the single source of org data for internal apps. ». Les 3 autres puces ne changent pas.
- [ ] CA7 — Étant donné le bloc U Tech, quand je le lis, alors :
  - la date est « Sep 2022 – Aug 2023 », et plus « 2022–2023 » ;
  - une 3e puce suit « Loading app: loading those pallets onto trucks. » : « Visited warehouses to watch operators use the apps and adjust them to how they work. » ;
  - la stack « Vue · JavaScript · Java Spring Boot · PWA » suit cette 3e puce.
- [ ] CA8 — Étant donné la section « Education », quand je la lis, alors la ligne de diplôme est « Master's in Computer Science & Information Systems · EPSI, France », et plus « Master's in IT & Information Systems · EPSI ».

### CV français (`/cv-romain-caille.pdf`)
- [ ] CA9 — Étant donné le PDF français, quand j'en lis l'accroche, alors elle commence, à la lettre, par « Je construis des produits TypeScript fullstack de bout en bout, du backend aux apps web, mobile et desktop. », et ne contient plus « Je conçois des backends TypeScript et Go, des API REST aux pipelines event-driven sur Kafka. ». La suite de l'accroche ne change pas.
- [ ] CA10 — Étant donné le bloc Spotime, quand j'en lis le sous-titre, alors c'est « SaaS de suivi des heures pour les équipes terrain · spotime.fr », sans « le BTP et ». Le lien `spotime.fr` reste cliquable.
- [ ] CA11 — Étant donné le bloc Spotime, quand j'en lis la 2e puce, alors c'est, à la lettre, « 150 entreprises du BTP démarchées en cold call, sans résultat : pivot vers le service à la personne, où les prospects arrivent par le site. 3 clients payants, 15 utilisateurs. ». L'ancienne puce (« Prospection en cold call : sans résultat dans le BTP, pivot vers le service à la personne pour tester ce marché, plus réceptif, avec des prospects arrivés en inbound. ») a disparu. Les 3 autres puces ne changent pas.
- [ ] CA12 — Étant donné le bloc Enedis, quand j'en lis la date, alors c'est « sept. 2023 – sept. 2025 », et plus « 2023–2025 ».
- [ ] CA13 — Étant donné le bloc Enedis, quand j'en lis la 2e puce, alors elle contient « (AdonisJS, PostgreSQL), conçue comme source unique des données d'organisation des apps internes. ». Les 3 autres puces ne changent pas.
- [ ] CA14 — Étant donné le bloc U Tech, quand je le lis, alors :
  - la date est « sept. 2022 – août 2023 », et plus « 2022–2023 » ;
  - une 3e puce suit « Application de chargement : le chargement de ces palettes dans les camions. » : « Visites en entrepôt pour observer les opérateurs utiliser les apps et les adapter à leur façon de travailler. » ;
  - la stack « Vue · JavaScript · Java Spring Boot · PWA » suit cette 3e puce.
- [ ] CA15 — Étant donné la section « Formation », quand je la lis, alors la ligne de diplôme est « Master Bac+5 · Informatique et systèmes d'information · EPSI, France », et plus « Master Bac+5 · Expert en informatique et SI · EPSI ».

### Non-régression
- [ ] CA16 — Étant donné chaque PDF, quand j'en lis le texte, alors tout le reste est identique au PDF actuel : en-tête (portrait compris en FR), rangée de statut, date de Spotime, puces et stacks non citées plus haut, section des projets (Event Hub, videoCn) et tous les liens.
- [ ] CA17 — Étant donné les nouveaux PDF, quand les tests existants tournent, alors ils restent verts, hors textes adaptés selon les Contraintes :
  - CA5 (une page A4, texte sélectionnable, liens cliquables, au plus 400 000 octets), CA6 (langues, titres) et CA18 (uniquement Instrument Sans et IBM Plex Mono) de `portfolio-cv` ;
  - les blocs `cv-mise-a-jour` et `cv-mise-a-jour-2`, dont CA8 : la ligne de diplôme reste la dernière ligne, entière, à au moins 3 mm du bas de la page ;
  - les blocs `liens-github` et `cv-videocn`.
- [ ] CA18 — Étant donné le site, quand je l'inspecte, alors rien ne change : les deux liens `resume.pdf` pointent toujours vers `/resume-romain-caille.pdf`, et le CV français n'est toujours pas lié.

## Hors scope
- Le site : ses textes (accroche, Spotime, Enedis, U Tech) restent tels quels, même s'ils divergent désormais des CV.
- Toute modification de `src/` et de `scripts/cv.mjs`.
- Un lien vers le CV français.
- Retouche du design des CV. Si un test de mise en page échoue (CA8 de `cv-mise-a-jour-2`), le problème remonte à Romain.

## Contraintes
- Les agents ne touchent pas au dossier de design.
- Les tests existants qui portent sur les textes modifiés (accroches, sous-titres et 2es puces de Spotime, dates d'Enedis et U Tech, 2es puces d'Enedis, lignes de diplôme) sont adaptés, avec une décision datée. L'architect en dresse la liste exacte.
- Les phrases vérifiées dans les PDF évitent les ligatures fi, fl et ff (par exemple « field » dans le sous-titre Spotime anglais).
- `pnpm cv` a besoin du réseau (React via unpkg, polices Google Fonts).
- Aucune nouvelle dépendance.

## Plan technique
<à produire par l'architect>

## Décisions
- 2026-10-05 — Les textes du site ne changent pas, même s'ils divergent des CV (validée par Romain).
- 2026-10-05 — Romain a ré-exporté le dossier de design à 02 h 48 avec le CV français à jour. L'export fait foi pour les deux CV (validée par Romain).
- 2026-10-05 — Liste des changements du CV anglais (CA2 à CA8) validée par Romain. Le CV français reprend les mêmes points dans l'export (CA9 à CA15).
