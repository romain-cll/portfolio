# CV — 2e mise à jour du 2026-10-04 (Enedis, U Tech, formation)

## User story
En tant que recruteur ou client qui visite romain-caille.fr, je veux télécharger la dernière version du CV de Romain, afin de lire son expérience Enedis et U Tech détaillée et chiffrée.

## Critères d'acceptation

*Source : `/Users/romain/Downloads/Portfolio Event-Driven/`, version du 2026-10-04 où la ligne de diplôme n'a plus de préfixe « Education: » ni « Formation : ». `Resume EN.dc.html` et `CV FR.dc.html` font foi pour le contenu et la mise en page des PDF. Les PDF sont produits par `pnpm cv` (spec `docs/features/portfolio-cv.md`), et le script ne change pas. Le site ne change pas.*

### Génération
- [ ] CA1 — Étant donné le dossier de design ci-dessus, quand je lance `pnpm cv`, alors `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf` sont régénérés depuis ces fichiers, puis versionnés.

### CV anglais (`/resume-romain-caille.pdf`)
- [ ] CA2 — Étant donné le PDF anglais, quand j'en lis le texte, alors il contient, à la lettre :
  - « May 2025 – Present » ;
  - « NestJS · TypeScript · PostgreSQL · React · TanStack Router · shadcn/ui · Plausible · Expo/React Native · Electron » ;
  - « Worksite inspection app (Pays de la Loire) » et « contractor-run worksites a year for safety, schedule and work quality. » ;
  - « Mon Orga, Enedis's company-wide org chart (41,000 employees): Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), the single source of org data for internal apps. Main frontend dev in a team of 4. » ;
  - « GitLab CI/CD (80% coverage gate, Checkmarx, Docker, auto deploy, health check); OIDC SSO, role-based access, rate limiting, no personal data stored locally. » ;
  - « the time lost to cross-team CI/CD blockers and got a weekly sync set up with the Cloud and CI/CD teams. » ;
  - « Nuxt 3 · TypeScript · AdonisJS (Node.js) · PostgreSQL (SQL) · Docker · GitLab CI/CD · Symfony · AWS » ;
  - « Tech subsidiary of Système U · team building the applications for its 28 warehouses » ;
  - « Routing app: moves pallets to the loading dock. » ;
  - « Vue · JavaScript · Java Spring Boot · PWA » ;
  - « Master's in IT & Information Systems · EPSI ».
- [ ] CA3 — Étant donné le PDF anglais, quand j'en lis le texte, alors il ne contient plus aucun de ces textes :
  - « Built an internal org chart in Nuxt. » ;
  - « to understand their needs and design apps around them. » ;
  - « Clear dev process » ;
  - « Nuxt · Symfony · AdonisJS · GitLab CI/CD · AWS » ;
  - « team building the warehouse applications » ;
  - « Routing app: moves orders from picking to the loading dock, bringing every pallet in. » ;
  - « Education: ».

### CV français (`/cv-romain-caille.pdf`)
- [ ] CA4 — Étant donné le PDF français, quand j'en lis le texte, alors il contient, à la lettre :
  - « NestJS · TypeScript · PostgreSQL · React · TanStack Router · shadcn/ui · Plausible · Expo/React Native · Electron » ;
  - « App d'inspection des chantiers (Pays de la Loire) : ~15 agents terrain inspectent ~3 000 chantiers prestataires par an (sécurité, délais, qualité d'exécution). » ;
  - « Mon Orga, organigramme national d'Enedis (41 000 salariés) : app Nuxt 3 et API REST TypeScript (AdonisJS, PostgreSQL), source unique des données d'organisation des apps internes. Dev frontend principal, équipe de 4. » ;
  - « CI/CD GitLab (couverture 80 %, Checkmarx, Docker, déploiement auto, health check) ; SSO OIDC, autorisation par rôle, rate limiting, aucune donnée personnelle stockée en local. » ;
  - « du temps perdu en blocages inter-équipes, d'où une réunion hebdo avec les équipes Cloud et CI/CD. » ;
  - « Nuxt 3 · TypeScript · AdonisJS (Node.js) · PostgreSQL (SQL) · Docker · GitLab CI/CD · Symfony · AWS » ;
  - « Filiale tech de Système U · équipe des applications de ses 28 entrepôts » ;
  - « Application d'acheminement des palettes jusqu'au quai de chargement. » ;
  - « Vue · JavaScript · Java Spring Boot · PWA » ;
  - « Master Bac+5 · Expert en informatique et SI · EPSI ».
- [ ] CA5 — Étant donné le PDF français, quand j'en lis le texte, alors il ne contient plus aucun de ces textes :
  - « Conception d'un organigramme interne en Nuxt. » ;
  - « Rencontres avec les utilisateurs sur le terrain » ;
  - « Processus de dev clair » ;
  - « Nuxt · Symfony · AdonisJS · GitLab CI/CD · AWS » ;
  - « équipe des applications d'entrepôt » ;
  - « de la préparation de commandes jusqu'au quai de chargement » ;
  - « Formation : ».

### Mise en page des deux CV
- [ ] CA6 — Étant donné chaque PDF, quand je lis son texte dans l'ordre, alors la ligne de diplôme (CA2 et CA4) vient juste après un titre de section « Education » (EN) ou « Formation » (FR), lui-même placé après la section « Projects » ou « Projets ». La ligne de diplôme n'apparaît qu'une fois, et plus sous l'accroche de l'en-tête.
- [ ] CA7 — Étant donné le PDF anglais, quand je l'inspecte, alors il ne contient aucune image. Étant donné le PDF français, quand je l'inspecte, alors il contient toujours la photo de l'en-tête.
- [ ] CA8 — Étant donné chaque PDF, quand je mesure la ligne de diplôme, dernière ligne de la page, alors elle est entière et son bas est à au moins 3 mm du bord bas de la page.
- [ ] CA9 — Étant donné les deux nouveaux PDF, quand les tests existants tournent, alors restent verts : CA4, CA5 (une page A4, texte sélectionnable, liens cliquables, au plus 400 000 octets), CA6 (langues, titres, accroches) et CA18 (uniquement Instrument Sans et IBM Plex Mono) de `portfolio-cv`, ainsi que CA2 et CA3 (anciennes phrases absentes) de `cv-mise-a-jour`.

### Site
- [ ] CA10 — Étant donné les deux liens `resume.pdf` du site, quand je les inspecte, alors ils pointent toujours vers `/resume-romain-caille.pdf`, et le CV français n'est toujours pas lié.
- [ ] CA11 — Étant donné le hero, quand je lis ses lignes `experience` et `education`, alors elles restent « Spotime · 2025–now », « Enedis, fullstack apprentice · 2023–2025 », « U Tech, fullstack apprentice · 2022–2023 » et « Master's, IT & Information Systems · EPSI ».

## Hors scope
- Alignement du hero sur les CV (intitulé Enedis, date « May 2025 » de Spotime) : le design du site n'a pas changé.
- Toute modification de `src/`.
- Modification de `scripts/cv.mjs`.
- Lien vers le CV français.
- Favicon (`favicon.svg` et `favicon-r.svg` présents dans le dossier de design).
- Retouche du design des CV. Si CA8 échoue, le problème remonte à Romain.

## Contraintes
- Les tests existants qui portent sur des textes retirés des CV sont adaptés, avec une décision datée : dans `tests/unit/cv.test.ts` (CA6 de `portfolio-cv`), « Built an internal org chart in Nuxt. », « Tech subsidiary of Système U · team building the warehouse applications », « Conception d'un organigramme interne en Nuxt. » et « Filiale tech de Système U · équipe des applications d'entrepôt ».
- Les phrases vérifiées dans les PDF évitent les ligatures fi, fl et ff : les CA ci-dessus ont été choisis ainsi.
- `pnpm cv` a besoin du réseau (Google Fonts, unpkg).
- Aucune nouvelle dépendance.

## Plan technique
<à compléter par l'architect>

## Décisions
- 2026-10-04 — Le CV anglais n'a plus de photo, comme le design ; le CV français la garde (validée par Romain)
- 2026-10-04 — Le site ne change pas : le hero garde ses textes, le design du site n'ayant pas changé (validée par Romain)
- 2026-10-04 — La ligne de diplôme n'a pas de préfixe « Education: » ni « Formation : » ; Romain l'a retiré du design (validée par Romain)
- 2026-10-04 — CA8 : seuil de 3 mm sous la dernière ligne, pour les deux CV (validée par Romain)
- 2026-10-04 — Tests existants adaptés : les 4 phrases retirées des CV sont remplacées dans `tests/unit/cv.test.ts` (validée par Romain)
- 2026-10-04 — Spec validée (gate 1) (validée par Romain)
