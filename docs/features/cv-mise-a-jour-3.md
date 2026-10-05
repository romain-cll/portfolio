# CV — mise à jour 3

## User story
En tant que recruteur ou client qui télécharge le CV de Romain sur romain-caille.fr, je veux lire sa version à jour, afin de voir son positionnement fullstack TypeScript, des résultats chiffrés sur Spotime et les dates exactes de ses postes.

## Critères d'acceptation

*Source : `/Users/romain/Downloads/Portfolio Event-Driven/`, export du 2026-10-05 à 03 h 08 (contenu identique à celui de 02 h 48). Romain y a déjà fait les changements dans Claude Design. `Resume EN.dc.html` et `CV FR.dc.html` font foi pour le contenu et la mise en page des PDF, sans aucune modification à faire. Les PDF sont produits par `pnpm cv` (spec `docs/features/portfolio-cv.md`), et le script ne change pas. Le site ne change pas.*

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
- Les tests existants qui portent sur les textes modifiés (accroches, sous-titres et 2es puces de Spotime, dates d'Enedis et U Tech, 2es puces d'Enedis, lignes de diplôme) sont adaptés, avec une décision datée. Liste exacte dans `tests/unit/cv.test.ts` (numéros d'avant toute insertion) : `phrasesEn` l. 126, 133, 136 et 140 ; `phrasesFr` l. 188, 191, 194 et 199 ; `MISE_A_JOUR_2` l. 261, 268, 281, 282, 290, 297, 310 et 311 ; `VIDEOCN` l. 469 et 481 (le diplôme ferme la suite ordonnée de `cv-videocn` CA2 et CA3).
- Les phrases vérifiées dans les PDF évitent les ligatures fi, fl et ff (par exemple « field » dans le sous-titre Spotime anglais).
- `pnpm cv` a besoin du réseau (React via unpkg, polices Google Fonts).
- Aucune nouvelle dépendance.

## Plan technique
### Approche
Aucun code de production ne change. `pnpm cv` régénère les deux PDF depuis l'export de 02 h 48, sans toucher à `scripts/cv.mjs`, à `src/` ni à `tests/pdf.ts`.
Dans `tests/unit/cv.test.ts`, 18 littéraux portent sur un texte modifié : diplôme, 1re phrase de l'accroche, 2e puce de Spotime, Mon Orga. Ils prennent la valeur de l'export.
Un nouveau bloc `cv-mise-a-jour-3` couvre CA2 à CA15 avec l'outillage existant. Il vérifie l'ordre des `indexOf` dans `squash(info.text)`, sur le modèle de `cv-videocn` CA2 (l. 490-498), et lit la rangée du lien `spotime.fr` avec `rowOf`.

### Fichiers
- **modifiés par `pnpm cv` (dev)** : `/Users/romain/projects/portfolio/public/resume-romain-caille.pdf` et `/Users/romain/projects/portfolio/public/cv-romain-caille.pdf`.
- **modifié (tester)** : `/Users/romain/projects/portfolio/tests/unit/cv.test.ts`. Les numéros de ligne sont ceux d'avant toute insertion.
  - **`phrasesEn`** : commentaire daté inséré après la l. 123, puis :
    - l. 126 → `"Master's in Computer Science & Information Systems"` ;
    - l. 133 → `'I build full-stack TypeScript products end to end, from the backend to web, mobile and desktop apps.'` ;
    - l. 136 → `'Cold-called 150 construction companies with no traction, so I switched to personal care services, where prospects come in through the website. 3 paying clients, 15 users.'` ;
    - l. 140 → `"Mon Orga, Enedis's company-wide org chart (41,000 employees): Nuxt 3 app and TypeScript REST API (AdonisJS, PostgreSQL), built as the single source of org data for internal apps. Main frontend dev in a team of 4."`.
  - **`phrasesFr`** : commentaire daté inséré après la l. 185, puis :
    - l. 188 → `"Master Bac+5 · Informatique et systèmes d'information"` (guillemets doubles à cause de l'apostrophe) ;
    - l. 191 → `'Je construis des produits TypeScript fullstack de bout en bout, du backend aux apps web, mobile et desktop.'` ;
    - l. 194 → `'150 entreprises du BTP démarchées en cold call, sans résultat : pivot vers le service à la personne, où les prospects arrivent par le site. 3 clients payants, 15 utilisateurs.'` ;
    - l. 199 → `"Mon Orga, organigramme national d'Enedis (41 000 salariés) : app Nuxt 3 et API REST TypeScript (AdonisJS, PostgreSQL), conçue comme source unique des données d'organisation des apps internes. Dev frontend principal, équipe de 4."`.
  - **`MISE_A_JOUR_2`** : commentaire daté inséré après la l. 251, puis :
    - l. 261 = nouvelle l. 140 ;
    - l. 268 et l. 281 → `"Master's in Computer Science & Information Systems · EPSI, France"` ;
    - l. 282 → `"Master's in Computer Science & Information Systems"` ;
    - l. 290 = nouvelle l. 199 ;
    - l. 297 et l. 310 → `"Master Bac+5 · Informatique et systèmes d'information · EPSI, France"` ;
    - l. 311 → `"Master Bac+5 · Informatique et systèmes d'information"`.
  - **`VIDEOCN`** : commentaire daté au-dessus de la l. 458, puis :
    - l. 469 → diplôme EN (comme la l. 281) ;
    - l. 481 → diplôme FR (comme la l. 310).
    - **La Contrainte de la spec ne cite pas ces deux lignes.** Sans elles, `cv-videocn` CA2 et CA3 restent rouges, puisque le diplôme ferme leur suite ordonnée. Le PO doit les ajouter à la Contrainte.
  - **Nouveau bloc `cv-mise-a-jour-3`**, inséré après la l. 537, avant la section du script (l. 538). Contenu dans « Stratégie de test ».
- **modifié (PO)** : `/Users/romain/projects/portfolio/docs/features/cv-mise-a-jour-3.md` — plan, décisions datées, et la Contrainte complétée avec la liste exacte ci-dessus.
- **inchangés, vérifiés**
  - **Textes de CA2 à CA15, comparés à la lettre : aucun écart avec la spec.**
    - Lignes comparées :
      - EN : l. 42, 55, 58, 68, 73, 83, 88-91, 127 ;
      - FR : l. 43, 56, 59, 69, 74, 84, 89-92, 128.
    - **Caractères.** Ni les deux exports ni la spec ne contiennent :
      - d'espace insécable (U+00A0, U+202F, U+2009) ;
      - d'apostrophe courbe ;
      - de tiret insécable ;
      - de ligature précomposée (U+FB00 à U+FB06) ;
      - d'accent combinant.
      Les « · » sont tous des U+00B7.
    - **Dates.** Le tiret est un demi-cadratin U+2013, entouré d'espaces ASCII : EN l. 68 et 83, FR l. 69 et 84, spec l. 19, 22, 31 et 34. « sept. » a un point ASCII. Les anciennes dates « 2023–2025 » et « 2022–2023 » de la spec sont aussi en U+2013 sans espace, comme dans les PDF actuels.
    - **« & » du diplôme.** Il est écrit `&amp;` dans l'export EN (l. 127) et sort « & » dans le PDF.
    - **Ligatures.** La seule est le « fi » de « field », dans le sous-titre Spotime EN (CA3), déjà signalé par la spec. Il apparaît aussi dans la suite de l'accroche EN (« for field crews »). Aucun autre texte de CA2 à CA15, ni aucun fragment du nouveau bloc, ne contient fi, fl ou ff.
  - **Hors CA2 à CA15, l'export est identique aux PDF actuels.**
    - J'ai lu le texte des deux PDF avec `Read` (texte et aperçu de la page) et je l'ai comparé à l'export, ligne à ligne.
    - Sont identiques :
      - l'en-tête et la rangée de statut ;
      - la suite des deux accroches, à partir de « I also run Spotime… » et « Je porte aussi Spotime… » ;
      - les titres et les dates de Spotime (« May 2025 – Present », « 2025–auj. ») ;
      - les puces 1, 3 et 4 de Spotime ;
      - le sous-titre et les puces 1, 3 et 4 d'Enedis ;
      - le sous-titre et les puces 1 et 2 d'U Tech ;
      - toutes les stacks, Event Hub, videoCn et les 8 liens.
    - Aucun des anciens textes n'apparaît dans les deux CV de l'export : Kafka, « construction and », « le BTP et », « Expert en informatique », « IT &amp; », « 2023–2025 », « 2022–2023 ». La maquette du site en contient encore 5 occurrences, ce qui est hors scope.
  - **Polices.**
    - La l. 12 des deux exports n'a pas changé : Instrument Sans 400, 500 et 600, IBM Plex Mono 400 et 500. C'est exactement `WEIGHTS` de `/Users/romain/projects/portfolio/scripts/cv.mjs` (l. 24-27).
    - Les nouveaux textes utilisent Instrument Sans 400, IBM Plex Mono 400 (dates) et 500 (diplôme).
    - Seul nouveau glyphe : « û » d'« août », en Plex Mono 400. Il fait partie du sous-ensemble latin, déjà chargé.
    - Le portrait FR (l. 25) n'a pas changé.
  - **Tests existants proches de ces textes, qui ne changent pas.**
    - **`it` « titres… accroche du design »** (l. 113-120 et 171-182). Il vérifie la phrase sous le nom, pas le paragraphe : ce que les tests appellent « accroche » n'est pas ce que la spec appelle ainsi. Il reste vert. Le paragraphe est vérifié par les l. 133 et 191, dans le `it` « reprend à la lettre ».
    - **`cv-mise-a-jour` CA2 et CA3** (l. 158-167 et 216-225), ainsi que les listes `drop` de `MISE_A_JOUR_2` (l. 270-278 et 299-307) : ces textes restent absents, et aucun n'est une sous-chaîne d'un nouveau texte une fois passé à `squash`.
    - **`ENEDIS` de `liens-github`** (l. 379-390) : la 3e puce et la stack d'Enedis ne changent pas.
    - **Sous-titres de Spotime et dates.** Aucun test de CV ne porte sur les anciens sous-titres ni sur « 2023–2025 » ou « 2022–2023 » : il n'y a rien à adapter.
    - **Ailleurs.**
      - `tests/e2e/hero.spec.ts` (l. 113-115) et `tests/design.ts` (l. 77) portent sur les textes du site, qui ne changent pas.
      - `tests/e2e/cv.spec.ts` et `tests/e2e/server.spec.ts` lisent les PDF en octets, pas leur texte.

### Tâches (ordonnées)
1. **Dossier de design (tester)** — couvre CA1.
   - `ls -lT "/Users/romain/Downloads/Portfolio Event-Driven"` : les deux CV doivent dater du 2026-10-05 à 02 h 48. Je n'ai pas pu le vérifier, faute de shell.
   - Vérification par le contenu :
     - `grep -c "Sep 2023 – Sep 2025" "Resume EN.dc.html"` renvoie 1 ;
     - `grep -c "sept. 2023 – sept. 2025" "CV FR.dc.html"` renvoie 1 ;
     - `grep -ci kafka` renvoie 0 sur les deux fichiers.
2. **Tests et rendu d'essai (tester, décision 3, réseau requis)** — couvre CA2 à CA17.
   - Écrire les modifications listées dans « Fichiers ».
   - **Calibrer CA3 et CA10 sur les PDF actuels.** Le lien `spotime.fr` existe déjà, et le message rouge affiche la rangée lue. Il faut contrôler qu'elle ne contient que le sous-titre, et voir comment le « fi » de « field » y est lu.
   - Lancer `pnpm cv`, puis `node --test tests/unit/cv.test.ts` : tout doit être vert.
   - Ensuite `git checkout -- public/resume-romain-caille.pdf public/cv-romain-caille.pdf`, relancer, et constater exactement les rouges attendus.
   - `pnpm typecheck` et `pnpm lint` passent avant le commit rouge (leçon de 8767ef5).
   - Si CA8 de `cv-mise-a-jour-2` échoue sur le rendu d'essai : arrêt, et remontée à Romain (hors scope).
3. **`pnpm cv` (dev, réseau requis)** — couvre CA1. `git status` montre exactement les deux PDF modifiés.
4. **Tests unitaires (dev)** — couvre CA2 à CA15 et CA17.
   - `node --test tests/unit/cv.test.ts`, puis `pnpm test`.
   - Le dev relève la marge sous la ligne de diplôme, en mm, et la transmet au PO.
   - Si CA8 de `cv-mise-a-jour-2` échoue : arrêt, sans toucher aux tests, au design ni au script.
5. **Comparaison complète du texte (dev, décision 1)** — couvre CA16.
   - Le texte de `git show main:public/<pdf>` est comparé à celui du nouveau PDF : `inspectPdf(…).text` de `tests/pdf.ts`, ou `Read` sur les deux fichiers. Les fichiers intermédiaires vont dans le scratchpad.
   - Seules les lignes des paragraphes de CA2 à CA15 doivent différer : accroche, sous-titre et 2e puce de Spotime, ligne du titre et 2e puce d'Enedis, ligne du titre et 3e puce d'U Tech, diplôme.
   - Le résultat est noté pour la décision datée de livraison.
6. **Vérifications locales (dev)** — couvre CA17, CA18 et la DoD.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
   - `git diff --stat main -- src scripts tests/pdf.ts tests/e2e tests/design.ts` est vide.
   - Avant le push, les e2e passent aussi dans l'image de la CI limitée à 1 CPU.
   - `pnpm lhci` n'est pas requis : le rendu du site ne change pas.
7. **Relecture manuelle (Romain, à la livraison)** — couvre CA1 et CA16.
   - Les deux PDF dans Aperçu : une seule page, la nouvelle accroche, la 3e puce d'U Tech, la ligne de diplôme entière.

### Stratégie de test
- **Commandes**
  - `node --test tests/unit/cv.test.ts`, puis `pnpm test`. Total attendu : 213, soit 199 + 14, avec un `it` par CA.
  - E2e ciblés : `pnpm build && pnpm test:e2e tests/e2e/cv.spec.ts tests/e2e/server.spec.ts tests/e2e/hero.spec.ts`, puis le lancement complet.
- **Bloc `cv-mise-a-jour-3`**
  - Une table par langue. Chaque entrée porte :
    - `ca` ;
    - `seq` : des textes dont les `indexOf(squash(…))` dans `squash(info.text)` doivent être tous ≥ 0 et strictement croissants ;
    - `gone` : des textes absents, comparés en respectant la casse.
  - Un `it` par entrée, plus un `it` par langue pour la rangée `spotime.fr`. Le message d'échec liste les textes absents, mal placés ou encore présents.
  - Tous les fragments ci-dessous sont sans ligature fi, fl ou ff.
  - **EN**
    - CA2 :
      - `seq` :
        - `'Remote or relocation · from Nantes, France I build full-stack TypeScript products end to end, from the backend to web, mobile and desktop apps. I also run Spotime, a time-tracking SaaS for'` ;
        - `'eld crews, end to end: product, code and sales. French native, English C1.'`.
      - `gone` : l'ancienne 1re phrase.
      - Le 1er élément est une seule chaîne qui enchaîne la fin de la rangée de statut, la nouvelle phrase et le début de la suite. Il prouve donc que l'accroche commence par la nouvelle phrase.
    - CA4 :
      - `seq` :
        - `'3-surface product: web back'` ;
        - la nouvelle puce ;
        - `'Clock-ins are stored local-'` ;
        - `'Development assisted by a team of subagents'`.
      - `gone` : l'ancienne puce.
    - CA5 :
      - `seq` : `'Fullstack developer, Enedis Lab'`, `'Sep 2023 – Sep 2025'`, `"France's electricity grid"`.
      - `gone` : `'2023–2025'`.
    - CA6 :
      - `seq` :
        - `'Worksite inspection app (Pays de la Loire)'` ;
        - `'(AdonisJS, PostgreSQL), built as the single source of org data for internal apps.'` ;
        - `'GitLab CI/CD (80% coverage gate'`.
      - `gone` : `'(AdonisJS, PostgreSQL), the single source of org data'`.
    - CA7 :
      - `seq` :
        - `'Fullstack developer, apprentice'` ;
        - `'Sep 2022 – Aug 2023'` ;
        - `'Tech subsidiary of Système U'` ;
        - la puce Routing, puis la puce Loading ;
        - `'Visited warehouses to watch operators use the apps and adjust them to how they work.'` ;
        - `'Vue · JavaScript · Java Spring Boot · PWA'`.
      - `gone` : `'2022–2023'`.
    - CA8 :
      - `seq` : `"Master's in Computer Science & Information Systems · EPSI, France"`.
      - `gone` : `"Master's in IT & Information Systems"`.
  - **FR**
    - CA9 :
      - `seq` : une seule chaîne, `'Remote ou relocalisation · basé à Nantes Je construis des produits TypeScript fullstack de bout en bout, du backend aux apps web, mobile et desktop. Je porte aussi Spotime, un SaaS de suivi des heures pour les équipes terrain, de bout en bout : produit, code et vente. Français natif, anglais C1.'`. L'accroche FR est sans ligature : elle est vérifiée en entier.
      - `gone` : l'ancienne 1re phrase.
    - CA11 :
      - `seq` :
        - `'Produit à 3 interfaces'` ;
        - la nouvelle puce ;
        - `'Pointages enregistrés en local-'` ;
        - `'Développement assisté par une équipe de subagents'`.
      - `gone` : l'ancienne puce.
    - CA12 :
      - `seq` : `'Développeur fullstack, Enedis Lab'`, `'sept. 2023 – sept. 2025'`, `'Réseau électrique français'`.
      - `gone` : `'2023–2025'`.
    - CA13 :
      - `seq` :
        - `"App d'inspection des chantiers (Pays de la Loire)"` ;
        - `"(AdonisJS, PostgreSQL), conçue comme source unique des données d'organisation des apps internes."` ;
        - `'CI/CD GitLab (couverture 80 %'`.
      - `gone` : `'(AdonisJS, PostgreSQL), source unique des données'`.
    - CA14 :
      - `seq` :
        - `'Développeur fullstack, alternant'` ;
        - `'sept. 2022 – août 2023'` ;
        - `'Filiale tech de Système U'` ;
        - la puce d'acheminement ;
        - `'Application de chargement : le chargement de ces palettes dans les camions.'` ;
        - `"Visites en entrepôt pour observer les opérateurs utiliser les apps et les adapter à leur façon de travailler."` ;
        - la stack U Tech.
      - `gone` : `'2022–2023'`.
    - CA15 :
      - `seq` : `"Master Bac+5 · Informatique et systèmes d'information · EPSI, France"`.
      - `gone` : `'Master Bac+5 · Expert en informatique et SI'`.
  - Chaque fragment de `seq` est unique dans le texte du PDF, ce que j'ai vérifié sur l'export. Par exemple, `'Fullstackdeveloper,EnedisLab'` ne se confond pas avec la phrase sous le nom.
- **CA1 → manuel.** Tâches 1 et 3 : `git status`, puis `pnpm test` vert.
- **CA2 et CA9 → unitaire** : la nouvelle phrase vient juste après la rangée de statut, puis la suite de l'accroche ; l'ancienne phrase est absente. S'y ajoutent les l. 133 et 191 adaptées.
- **CA3 et CA10 → unitaire, avec `rowOf(info, 'https://spotime.fr')`.**
  - EN : la rangée commence par `'Time-trackingSaaSfor'`, finit par `'eldcrews·spotime.fr'`, et il y a au plus 2 caractères entre les deux. Cela couvre les trois lectures possibles du « fi » : 2 caractères, U+FB01, ou une `/ActualText`, absente des `runs`. Et « construction and » ne tient pas dans cet écart.
  - FR : la rangée est exactement `squash('SaaS de suivi des heures pour les équipes terrain · spotime.fr')`.
  - Le lien est donc toujours cliquable, et posé sur la ligne du sous-titre.
- **CA4 et CA11 → unitaire** : la nouvelle puce est entre les puces 1 et 3, l'ancienne est absente. S'y ajoutent les l. 136 et 194 adaptées.
- **CA5 et CA12 → unitaire** : la date est entre le titre d'Enedis et son sous-titre ; « 2023–2025 » est absent.
- **CA6 et CA13 → unitaire** : le fragment de la 2e puce est entre les puces 1 et 3, l'ancien est absent. S'y ajoutent les l. 140, 199, 261 et 290 adaptées.
- **CA7 et CA14 → unitaire** : date, puces 1, 2 et 3, puis stack, dans cet ordre ; « 2022–2023 » est absent.
- **CA8 et CA15 → unitaire.**
  - Nouveau test : l'ancienne ligne de diplôme est absente.
  - Tests adaptés de `cv-mise-a-jour-2` :
    - CA2 et CA4 (`keep`) ;
    - CA6 : la ligne de diplôme suit le titre, et son préfixe n'apparaît qu'une fois ;
    - CA8 : c'est la dernière ligne, entière, à au moins 3 mm du bas.
  - S'y ajoutent `cv-videocn` CA2 et CA3 adaptés, ainsi que les l. 126 et 188.
- **CA16 → tests existants, fragments du nouveau bloc, comparaison complète de la tâche 5 et relecture de Romain.**
  - Les tests existants couvrent déjà l'en-tête, le statut, « May 2025 – Present », les stacks, Event Hub, videoCn, les liens (CA5, `liens-github`, `cv-videocn` CA4) et le portrait (`cv-mise-a-jour-2` CA7).
- **CA17 → tests existants, inchangés hors adaptations.**
  - Dans `cv.test.ts` :
    - CA5 (l. 32-79) ;
    - CA18 (l. 85-103) ;
    - CA6 et `cv-mise-a-jour` (l. 112-226) ;
    - `cv-mise-a-jour-2` (l. 315-365) ;
    - `liens-github` (l. 406-446) ;
    - `cv-videocn` (l. 485-536) ;
    - script, CA8 et CA9 (l. 571-598).
  - `server.spec.ts` CA4 (l. 29 et suivantes).
- **CA18 → e2e existants, inchangés**, plus le diff vide de la tâche 6.
  - `cv.spec.ts` : CA1 (l. 71-79), CA3 (l. 109-115) et CA7 (l. 117-122).
  - `hero.spec.ts` (l. 110-116).
- **Rouges attendus sur les PDF actuels** (EN et FR) :
  - `portfolio-cv` CA6 « reprend à la lettre » ;
  - `cv-mise-a-jour-2` CA2, CA4, CA6 et CA8 ;
  - `cv-videocn` CA2 et CA3 ;
  - les 14 tests du bloc `cv-mise-a-jour-3`.
- **Restent verts** :
  - CA5 (poids, page, texte, liens) et CA18 ;
  - CA6, titres et phrase sous le nom ;
  - `cv-mise-a-jour` CA2 et CA3 ;
  - `cv-mise-a-jour-2` CA3, CA5 et CA7 ;
  - `liens-github` en entier ;
  - `cv-videocn` CA4, CA5 et CA6 ;
  - le script, CA8 et CA9 ;
  - tous les e2e.

### Décisions à valider (tranchées, voir « Décisions »)
- **CA16 : comment prouver que « tout le reste est identique au PDF actuel » ?**
  - A : tests existants, fragments du nouveau bloc, et une comparaison complète du texte, faite une fois par le dev (tâche 5) et notée à la livraison.
  - B : A, plus une liste durable des textes inchangés que rien ne couvre encore (« 2025–auj. », puces 1 à 3 d'Event Hub…).
  - Recommandation : A. La référence, le PDF actuel, disparaît au commit : la comparaison ne peut se faire qu'une fois. Elle est exhaustive. B testerait des textes hors de cette feature, à réadapter à chaque mise à jour du CV.
- **CA3 : le sous-titre EN contient la ligature « fi ».**
  - A : `rowOf` sur `spotime.fr`, préfixe et suffixe sans ligature, au plus 2 caractères entre les deux.
  - B : uniquement dans le texte, présence des deux fragments et absence de « SaaS for construction », sans lien.
  - Recommandation : A. Le même test couvre « le lien reste cliquable » sur la ligne du sous-titre, et respecte la Contrainte sur les ligatures. Le FR suit le même modèle, avec une égalité stricte.
- **Rendu d'essai avant le commit rouge (tâche 2) ?**
  - A : oui, par le tester, avec `public/` restauré ensuite.
  - B : non.
  - Recommandation : A, comme pour `cv-mise-a-jour-2` et `cv-videocn`. Le rendu d'essai valide sur la vraie sortie l'ordre du flux supposé par les tests (date après le titre, statut avant l'accroche) et la marge de CA8. Les tests n'ont alors pas à être retouchés après leur commit rouge.

### Risques
- **Marge sous la ligne de diplôme (CA8 de `cv-mise-a-jour-2`).**
  - La seule ligne ajoutée est la 3e puce d'U Tech :
    - EN : 8,7 pt × 1,32 plus 0,5 mm d'écart, soit environ 4,55 mm ;
    - FR : 8,6 pt × 1,32 plus 0,5 mm, soit environ 4,50 mm.
  - Les deux puces tiennent sur une ligne. Comparaison avec des puces de même longueur sur l'aperçu actuel :
    - EN : 84 caractères, environ 505 px sur 782 ;
    - FR : 109 caractères, environ 670 px, à comparer à « Chiffrage du temps perdu… », 108 caractères sur une ligne.
  - Les autres changements gardent le même nombre de lignes : sous-titres plus courts, nouvelles 2es puces de Spotime sur 2 lignes, Mon Orga sur 2 lignes, accroche FR sur 3 lignes, dates sur la ligne du titre.
  - **Marge estimée : environ 9,0 mm en EN (13,5 − 4,55) et 9,8 mm en FR (14,3 − 4,50), pour 3 mm exigés.**
  - **Point fragile : l'accroche EN.** Elle gagne environ 14 caractères. Sur l'aperçu actuel, elle tient encore sur 2 lignes, avec environ 40 px (6 caractères) de reste sur la 2e. Si elle passait à 3 lignes (+5,3 mm), la marge EN tomberait vers 3,7 mm : elle passerait encore, mais de peu. La tâche 2 le détecte.
  - L'estimation suppose que l'export n'a pas changé les espacements CSS depuis celui de 01 h 21, qui n'est pas versionné. Je n'ai comparé que le texte.
- **Rangée `spotime.fr`.** Si le `Rect` du lien capte une autre ligne, l'égalité FR échoue. Le tester le calibre sur les PDF actuels avant le commit rouge (tâche 2).
- **Réseau de `pnpm cv`** (unpkg et Google Fonts). Une nouvelle version d'Instrument Sans peut déplacer des retours à la ligne, donc l'accroche EN et la marge.
- **Horodatage de l'export non vérifié**, faute de shell. Le contenu, lui, est vérifié. C'est la tâche 1.
- **Divergence entre le site et les CV** (accroche, dates, diplôme), acceptée par décision. Les tests du site gardent les anciens textes : `hero.spec.ts` l. 113-115.
- **Poids du dépôt.** Chaque régénération ajoute environ 300 Ko à l'historique git.

## Décisions
- 2026-10-05 — Les textes du site ne changent pas, même s'ils divergent des CV (validée par Romain).
- 2026-10-05 — Romain a ré-exporté le dossier de design à 02 h 48 avec le CV français à jour. L'export fait foi pour les deux CV (validée par Romain).
- 2026-10-05 — Liste des changements du CV anglais (CA2 à CA8) validée par Romain. Le CV français reprend les mêmes points dans l'export (CA9 à CA15).
- 2026-10-05 — Export vérifié par le PO : `Resume EN.dc.html` et `CV FR.dc.html` datés du 2026-10-05 à 02 h 48.
- 2026-10-05 — Les tests de `cv.test.ts` sur les textes modifiés sont adaptés à la valeur de l'export : `phrasesEn` l. 126, 133, 136, 140 ; `phrasesFr` l. 188, 191, 194, 199 ; `MISE_A_JOUR_2` l. 261, 268, 281, 282, 290, 297, 310, 311 ; `VIDEOCN` l. 469 et 481, oubliées par la spec et ajoutées à la Contrainte (validée par Romain).
- 2026-10-05 — CA16 est prouvé par les tests existants, les fragments du nouveau bloc et une comparaison complète du texte ancien/nouveau faite une fois par le dev, notée à la livraison (option A, validée par Romain).
- 2026-10-05 — CA3 et CA10 sont testés par la rangée du lien `spotime.fr` (`rowOf`), préfixe et suffixe sans ligature en EN, égalité stricte en FR (option A, validée par Romain).
- 2026-10-05 — Le tester fait un rendu d'essai avec `pnpm cv` pour calibrer les tests, puis restaure `public/` avant le commit rouge (option A, validée par Romain).
- 2026-10-05 — Romain a ré-exporté le dossier de design à 03 h 08. Le PO a relu `Resume EN.dc.html` et `CV FR.dc.html` : texte identique ligne à ligne à l'export de 02 h 48, tailles inchangées. Le plan reste valable ; à la tâche 1, l'horodatage attendu devient 03 h 08 (validée par Romain).
