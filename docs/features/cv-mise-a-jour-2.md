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
### Approche
Aucun code de production ne change. `pnpm cv` régénère les deux PDF depuis le design, sans modifier le script ni `src/`, puis on les versionne.
Dans `cv.test.ts`, les 4 phrases retirées sont remplacées, et un nouveau bloc `cv-mise-a-jour-2` couvre CA2 à CA8 : textes, ordre des lignes extraites pour CA6, et `info.images`, déjà exposé, pour CA7.
`tests/pdf.ts` doit en plus connaître la hauteur de la ligne de base de chaque texte affiché. C'est le seul moyen de mesurer CA8 sans dépendance.

### Fichiers
- modifiés par `pnpm cv` : `/Users/romain/projects/portfolio/public/resume-romain-caille.pdf` et `/Users/romain/projects/portfolio/public/cv-romain-caille.pdf`.
- modifié (tester) : `/Users/romain/projects/portfolio/tests/pdf.ts` — ajout des positions verticales du texte, `PdfPageInfo.runs` (détail dans la stratégie de test). `text`, `images`, `fontNames`, `undecodable` et `textOperations` ne changent pas.
- modifié (tester) : `/Users/romain/projects/portfolio/tests/unit/cv.test.ts` — l. 136, 137, 192 et 193 remplacées. Nouveau bloc inséré après la l. 218, avant la section du script (l. 220).
- modifié (PO) : `/Users/romain/projects/portfolio/docs/features/cv-mise-a-jour-2.md` — plan et décisions datées.
- inchangés, vérifiés :
  - **Script et CV sans portrait.** `scripts/cv.mjs` gère le CV anglais sans photo, sans modification. Il n'attend que deux choses : `.sheet.paginated` (l. 46-48, `doc-page.js` l. 219) et les familles de polices (l. 53-68), jamais une image. `Resume EN.dc.html` ne contient ni `url(` ni `uploads/`. Il utilise Instrument Sans 400 et 600, et IBM Plex Mono 400 et 500, couverts par `WEIGHTS` (l. 24-27). Les deux CV gardent `<doc-page size="a4">` et une seule `section.page` (l. 21-22).
  - **Textes de CA2 à CA5.** Comparés à la lettre à la spec, dans `Resume EN.dc.html` (l. 53, 62, 72-77, 85, 87, 90, 127) et dans `CV FR.dc.html` (l. 63, 73-78, 86, 88, 91, 128) : **aucun écart**.
    - Les apostrophes sont droites, et le tiret de « May 2025 – Present » est un demi-cadratin (U+2013), comme dans la spec.
    - Aucun des trois fichiers (spec, design EN, design FR) ne contient d'espace insécable ni d'apostrophe courbe.
  - **CA3 et CA5, aucune fausse correspondance.** Aucun des textes à faire disparaître n'existe dans un `.dc.html`. Aucun n'est non plus une sous-chaîne d'un nouveau texte une fois les espaces retirés (`squash`) :
    - « team building the warehouse applications » ≠ « …the applications for its 28 warehouses » ;
    - « Nuxt · Symfony · AdonisJS · GitLab CI/CD · AWS » ≠ la nouvelle stack ;
    - « de la préparation de commandes… » ≠ « …des palettes jusqu'au quai… » ;
    - « Education: » et « Formation : » : dans le PDF, le titre sort en capitales (« EDUCATION », « FORMATION ») et sans deux-points.
  - **Site.** `Portfolio Event-Driven.dc.html` est identique à `tests/design.ts` et à `hero.spec.ts` l. 110-116 :
    - hero (l. 136-166, `contract` toujours commenté l. 146) ;
    - `PROJECTS` (l. 314-334), `LOG` (l. 336-355), `annTexts` (l. 535) ;
    - overview (l. 174-175) et contact (l. 278-302).
    - Le `href="cv.pdf"` du design (l. 162 et 300) est un écart déjà tranché par `portfolio-cv`.
  - **Tests.** `tests/design.ts`, `tests/e2e/hero.spec.ts`, `cv.spec.ts` et `server.spec.ts` ne changent pas. Seules les 4 lignes de `cv.test.ts` portent sur des textes retirés (vérifié par recherche dans `tests/`, `src/` et `scripts/`).

### Tâches (ordonnées)
Prérequis : les tests rouges, faits après le rendu d'essai si la décision 2 est retenue.

0. **Rendu d'essai (PO, décision 2)** — signal précoce sur CA8.
   - Lancer `pnpm cv`, copier les deux PDF dans le scratchpad pour le tester, puis restaurer : `git checkout -- public/resume-romain-caille.pdf public/cv-romain-caille.pdf`.
   - Le tester mesure CA8 sur ces copies. Si la marge est sous 3 mm, on remonte à Romain avant d'écrire les tests rouges.
1. **Dossier de design** — couvre CA1.
   - `ls -l "/Users/romain/Downloads/Portfolio Event-Driven"` : les deux CV sont datés du 2026-10-04.
   - « Education: » et « Formation : » sont absents des deux `.dc.html`.
2. **`pnpm cv`** — couvre CA1. Réseau requis (unpkg et Google Fonts). `git status` montre exactement les deux PDF modifiés.
3. **Tests unitaires** — couvre CA2 à CA9. Commande : `node --test tests/unit/cv.test.ts`.
   - Si CA8 échoue, on s'arrête. Le message du test donne la marge mesurée en mm, et le dev la transmet au PO, qui remonte à Romain (voir Hors scope).
   - Dans ce cas, on ne touche ni aux tests, ni au design, ni au script.
4. **Relecture dans Aperçu** — CA7 et CA8.
   - CV anglais : pas de photo.
   - CV français : photo dans l'en-tête.
   - Les deux : section Education ou Formation en bas, avec la ligne de diplôme entière.
5. **Vérifications locales** — couvre CA9, CA10, CA11 et la DoD.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
   - Avant le push, les e2e passent aussi dans l'image de la CI limitée à 1 CPU.
   - `pnpm lhci` n'est pas requis : le rendu du site ne change pas.

### Stratégie de test
- **Commandes.**
  - Unitaires : `node --test tests/unit/cv.test.ts`, puis `pnpm test`.
  - E2E ciblés : `pnpm build && pnpm test:e2e tests/e2e/cv.spec.ts tests/e2e/server.spec.ts tests/e2e/hero.spec.ts`.
- **Ajout à `tests/pdf.ts`, pour CA8.**
  - **Nouveau type.** `PdfTextRun { text; y; size }` est exporté, et `PdfPageInfo.runs: PdfTextRun[]` contient un élément par opérateur `Tj`, `TJ`, `'` ou `"`.
    - `y` : hauteur de la ligne de base au-dessus du bord bas de la MediaBox, en pt (y moins y0).
    - `size` : taille effective du texte, en pt.
  - **Suivi dans `walkContent`.**
    - CTM : `cm` fait CTM = M × CTM. La CTM est sauvegardée par `q`/`Q` avec la police et sa taille : la pile `fontStack` (l. 459, 495-500) devient une pile d'états.
    - Taille : 2e opérande de `Tf` (l. 501-505).
    - Matrice de texte :
      - `BT` : remise à l'identité ;
      - `Tm` : Tm = Tlm = opérandes ;
      - `Td`, `TD` : Tlm = translation × Tlm, puis Tm = Tlm ;
      - `TL`, `T*`, `'` et `"` : passage à la ligne suivante (l. 506-526).
    - Pour chaque affichage, on calcule M = Tm × CTM. Alors `y` = M.f et `size` = Tf × hypot(M.c, M.d).
    - Form XObject (l. 546-556) : la récursion reçoit `/Matrix` × CTM, avec l'identité par défaut.
  - **Limites assumées.**
    - x n'est pas suivi : les avances des glyphes sont ignorées, ce qui ne change pas y pour du texte horizontal.
    - Le texte posé par `/ActualText` n'a pas de position.
  - **Calibrage sur les PDF actuels, avant le commit rouge.** Dans les deux CV, la dernière ligne doit être la stack de Fraud Engine. Pour le CV FR, son bas doit tomber vers 5 à 6 mm, la mesure de la livraison `cv-mise-a-jour`. Pour le CV EN, vers 18 mm, lu sur le rendu.
- **Nouveau bloc `cv-mise-a-jour-2` dans `cv.test.ts`.**
  - Données par langue :
    - EN : CA2/CA3, `'projects'`, `'education'`, diplôme « Master's in IT & Information Systems · EPSI », préfixe « Master's in IT & Information Systems ».
    - FR : CA4/CA5, `'projets'`, `'formation'`, diplôme « Master Bac+5 · Expert en informatique et SI · EPSI », préfixe « Master Bac+5 · Expert en informatique et SI ».
  - **CA2 → unitaire.** Les 11 textes de CA2 sont tous inclus dans `squash(info.text)`. Le message d'échec liste les absents, sur le modèle de la l. 148.
  - **CA3 → unitaire.** Les 7 textes de CA3 sont tous absents de `squash(info.text)`. La comparaison est sensible à la casse, sur le modèle des l. 153-162.
  - **CA4 et CA5 → unitaire.** Même chose sur le PDF français.
  - **CA6 → unitaire.** On travaille sur `lines(info)` (l. 108), sans les lignes vides :
    - l'indice du titre de projets est trouvé ;
    - celui du titre de diplôme lui est supérieur ;
    - la concaténation des lignes qui suivent le titre de diplôme commence par `squash(diplôme).toLowerCase()`, ce qui tolère une ligne découpée en plusieurs morceaux ;
    - le préfixe sans « · EPSI » n'apparaît qu'une fois dans `squash(info.text)`. Cela attrape aussi l'ancienne ligne de l'en-tête, qui n'avait pas « · EPSI ».
  - **CA7 → unitaire.** EN : `info.images === 0`. FR : `info.images > 0`.
    - Rien à ajouter à `pdf.ts` : `images` compte déjà les `/Subtype /Image` (l. 644-653).
    - `> 0` suffit pour le FR : le portrait est le seul `url(` de `CV FR.dc.html` (l. 25).
    - Les deux PDF actuels contiennent chacun 2 images : la photo 290 × 287 et son `/SMask`.
  - **CA8 → unitaire, pour chaque PDF.**
    - On prend les runs de texte non vide, et la plus basse valeur de `y` parmi eux.
    - Les runs à moins de 0,5 pt de cette ligne de base, concaténés puis passés à `squash`, doivent égaler le diplôme : c'est la dernière ligne, et elle est entière.
    - Le bas de la ligne vaut le minimum de `y − 0,3 × size` sur ces runs (décision 1). Il doit être ≥ 3 × 72 / 25,4 = 8,504 pt.
    - Le message donne la marge en mm et le texte de la dernière ligne trouvée.
- **CA1 → manuel.** `pnpm cv`, puis `git status` (les deux PDF sont modifiés), puis `pnpm test` au vert.
- **CA9 → tests existants.**
  - `cv.test.ts` : CA5 et CA18 (l. 32-101), CA6 titres et accroches (l. 111-118, 166-177), `cv-mise-a-jour` CA2 et CA3 (l. 153-162, 208-217).
  - `server.spec.ts` CA4 (l. 29-35, octets identiques à `public/`).
  - Les 7 liens de CA5 sont toujours dans les deux designs.
- **CA10 → e2e existants.** `cv.spec.ts` CA1 (l. 71-79) et CA3 (l. 109-115).
- **CA11 → e2e existant.** `hero.spec.ts` l. 101-116, inchangé, avec un design du site inchangé.
- **Rouge attendu sur les PDF actuels.**
  - CA2, CA3, CA4 et CA5.
  - CA6 et CA8 pour les deux PDF. Il n'y a pas de titre Education ni Formation, et la dernière ligne est la stack de Fraud Engine.
  - CA7 EN (2 images).
  - `portfolio-cv` CA6 « reprend à la lettre », EN et FR, à cause des 4 phrases remplacées.
  - Restent verts :
    - CA7 FR, qui sert de garde-fou ;
    - CA5 et CA18 ;
    - CA6 titres et accroches ;
    - `cv-mise-a-jour` CA2 et CA3 ;
    - CA8 et CA9 du script ;
    - tous les e2e.
  - Tout passe au vert après `pnpm cv`, sauf peut-être CA8 (voir Risques).
- **Tests existants à adapter** (la décision datée existe déjà), dans `tests/unit/cv.test.ts` :
  - l. 136 → « Mon Orga, Enedis's company-wide org chart (41,000 employees): Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), the single source of org data for internal apps. Main frontend dev in a team of 4. » (en guillemets doubles, à cause de l'apostrophe) ;
  - l. 137 → « Tech subsidiary of Système U · team building the applications for its 28 warehouses » ;
  - l. 192 → « Mon Orga, organigramme national d'Enedis (41 000 salariés) : app Nuxt 3 et API REST TypeScript (AdonisJS, PostgreSQL), source unique des données d'organisation des apps internes. Dev frontend principal, équipe de 4. » ;
  - l. 193 → « Filiale tech de Système U · équipe des applications de ses 28 entrepôts » ;
  - un commentaire daté au-dessus de chaque liste, sur le modèle de la l. 152. Aucune autre ligne existante ne change.

### Décisions à valider
- **CA8 : que veut dire « son bas » ?** Options :
  - A : ligne de base − 0,3 em, une borne fixe ;
  - B : ligne de base − `/Descent` du descripteur de la police.

  Recommandation : A. IBM Plex Mono descend de 0,274 em (`/Descent 274` dans les PDF actuels). A est donc plus strict d'au plus 0,08 mm, sans avoir à relier chaque run à son descripteur. De plus, Skia écrit `/Descent` en positif, ce qui n'est pas la convention PDF.
- **Rendu d'essai avant les tests rouges (tâche 0) ?** Options :
  - A : oui, fait par le PO, avec les PDF dans le scratchpad et `public/` restauré ;
  - B : non, CA8 se découvre à l'étape dev.

  Recommandation : A, comme pour `portfolio-cv`. Si CA8 échoue, Romain corrige le design avant que l'équipe n'investisse. Et le tester valide le suivi des positions sur la vraie sortie, ce qui évite de modifier les tests après leur commit rouge.
- **Où mettre CA2 à CA5 ?** Options :
  - A : un nouveau bloc `cv-mise-a-jour-2` ;
  - B : étendre `phrasesEn` et `phrasesFr`, comme l'a fait `cv-mise-a-jour`.

  Recommandation : A. La spec n'autorise à modifier que 4 lignes des tests existants, et chaque CA garde son propre test, rouge ou vert.

### Risques
- **Coupe silencieuse en bas du CV FR, et CA8.** C'est le risque principal.
  - **Mécanisme.** À l'impression, `doc-page.js` (l. 275-278) fixe la page au format A4 avec `overflow: hidden !important`. Un contenu qui déborde consomme d'abord le padding bas (5,5 mm, `CV FR.dc.html` l. 22), puis il est coupé au bord de la page sans créer de 2e page : CA5 reste vert.
  - **Pourquoi l'aperçu ne suffit pas.** Dans l'aperçu Claude Design, le texte sans empattement est rendu en police système (`doc-page.js` l. 190), alors que le PDF force Instrument Sans (`cv.mjs` l. 49-52).
    - Les lignes en IBM Plex Mono sont identiques dans les deux rendus, car leur police est fixée explicitement. La stack Spotime, avec « React · », fait 113 caractères, soit 179,4 mm pour 182 mm disponibles : elle tient sur une ligne.
    - La dérive vient donc des paragraphes en Instrument Sans.
  - **Ordre de grandeur.** La dérive passée était de 3 à 4 mm (`portfolio-cv`), puis de 1 à 1,5 mm (`cv-mise-a-jour`). La marge attendue va donc de 1,5 à 4,5 mm. Une seule ligne de puce de plus qu'à l'aperçu coûte 4,0 mm (8,6 pt × 1,32), plus que les 2,5 mm de tolérance : CA8 peut échouer.
  - **Détection.** CA8 attrape à la fois la marge insuffisante et la ligne coupée ou disparue (CA4 et CA6 aussi, dans ce dernier cas).
  - **Si CA8 échoue.** On remonte à Romain (hors scope pour l'équipe). Le CV EN a 9 mm de padding et perd sa photo : il est moins exposé.
- **Lecture des positions dans la sortie Skia.** Skia écrit un `Tm` inversé, puis des `Td` relatifs, et pose le retournement de la page par un `cm`. Il n'y a pas de Form XObject dans les PDF actuels, mais la récursion les gère. Contrôles : le calibrage sur les PDF actuels, puis sur le rendu d'essai.
- **« palettes » (CA4) contient « tt ».** Si Instrument Sans avait une ligature t_t, son texte passerait par `ToUnicode` ou `/ActualText`, que `pdf.ts` décode déjà. À confirmer sur le rendu d'essai.
- **Réseau.** `pnpm cv` dépend d'unpkg et de Google Fonts. Une nouvelle version d'Instrument Sans peut changer les retours à la ligne, donc la marge de CA8.
- **Version du dossier de design.** J'ai vérifié le contenu, mais pas l'horodatage, faute de shell : c'est la tâche 1.
- **Poids du dépôt.** Chaque régénération ajoute environ 350 Ko à l'historique git, un peu moins pour le CV EN sans photo.

## Décisions
- 2026-10-04 — Le CV anglais n'a plus de photo, comme le design ; le CV français la garde (validée par Romain)
- 2026-10-04 — Le site ne change pas : le hero garde ses textes, le design du site n'ayant pas changé (validée par Romain)
- 2026-10-04 — La ligne de diplôme n'a pas de préfixe « Education: » ni « Formation : » ; Romain l'a retiré du design (validée par Romain)
- 2026-10-04 — CA8 : seuil de 3 mm sous la dernière ligne, pour les deux CV (validée par Romain)
- 2026-10-04 — Tests existants adaptés : les 4 phrases retirées des CV sont remplacées dans `tests/unit/cv.test.ts` (validée par Romain)
- 2026-10-04 — Spec validée (gate 1) (validée par Romain)
- 2026-10-04 — Plan technique validé (gate 2) (validée par Romain) :
  - CA8 : le bas de la dernière ligne vaut sa ligne de base − 0,3 em (option A) ;
  - rendu d'essai avant les tests rouges (option A). Il est fait par le tester, et non par le PO, qui ne lance pas `pnpm`. Les PDF sont copiés hors de `public/`, qui est ensuite restauré ;
  - CA2 à CA8 sont couverts par un nouveau bloc `cv-mise-a-jour-2` dans `cv.test.ts` (option A).
