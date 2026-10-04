# Liens GitHub à la place de GitLab

## User story
En tant que recruteur qui visite le portfolio ou lit le CV, je veux être renvoyé vers le profil et les dépôts GitHub de Romain, afin de consulter son code là où il le publie désormais.

## Critères d'acceptation

*Nouvelles URL :*
- profil : https://github.com/romain-cll ;
- Event Hub : https://github.com/romain-cll/events-hub (avec un « s ») ;
- Fraud Engine : https://github.com/romain-cll/fraud-engine-event-driven.

*Dossier de design : `/Users/romain/Downloads/Portfolio Event-Driven/`, export du 2026-10-05 à 00 h 34. Romain y a déjà fait les changements dans Claude Design. `Resume EN.dc.html` et `CV FR.dc.html` sont les sources des PDF et font foi, sans aucune modification à faire. `Portfolio Event-Driven.dc.html` est la maquette du site. Elle porte les mêmes changements. Seule exception, la note de la section contact : l'export affiche encore « Most of my GitHub work is in private repositories. ». Romain l'a déjà corrigée dans Claude Design, mais l'export local n'a pas été refait. Cet écart est attendu, et c'est CA2 qui fait foi.*

### Site
- [ ] CA1 — Étant donné la section contact, quand je l'inspecte, alors elle contient un lien `github` vers https://github.com/romain-cll, à la place du lien `gitlab`. L'ordre `github`, `linkedin`, `resume.pdf`, la flèche Carbon et le style des liens ne changent pas.
- [ ] CA2 — Étant donné la section contact, quand je l'inspecte, alors la note sous les liens affiche exactement « Some of my work is in private repositories. », à la place de « Most of my GitLab work is in private repositories. ». Sa position, sous les liens et au-dessus de la barre du terminal, et son style (texte discret) ne changent pas.
- [ ] CA3 — Étant donné la section Fraud Engine, quand je l'inspecte, alors son lien `repo` pointe vers https://github.com/romain-cll/fraud-engine-event-driven.
- [ ] CA4 — Étant donné la section Event Hub, quand je l'inspecte, alors son lien `repo` pointe vers https://github.com/romain-cll/events-hub, et la barre d'URL de sa capture affiche `github.com/romain-cll/events-hub`.
- [ ] CA5 — Étant donné la page d'accueil, quand je lis son JSON-LD `Person`, alors `sameAs` vaut [« https://github.com/romain-cll », « https://www.linkedin.com/in/romain-caill%C3%A9/ »].
- [ ] CA6 — Étant donné le build, quand je cherche « gitlab » sans tenir compte de la casse dans le HTML prérendu de chaque route, alors je ne trouve aucune occurrence.

### CV (PDF de `public/`)
- [ ] CA7 — Étant donné `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf`, quand je les ouvre, alors l'en-tête affiche `github.com/romain-cll`, avec un lien cliquable vers https://github.com/romain-cll, à la place de `gitlab.com/romain.caille`.
- [ ] CA8 — Étant donné les deux PDF, quand je lis la section des projets, alors le lien d'Event Hub et celui de Fraud Engine s'intitulent `github`, à la place de `gitlab`, et pointent vers leurs nouvelles URL.
- [ ] CA9 — Étant donné les deux PDF, quand je lis l'expérience Enedis, alors « GitLab CI/CD » y figure toujours, à l'identique. En anglais : la puce « GitLab CI/CD (80% coverage gate, Checkmarx, Docker, auto deploy, health check); OIDC SSO, role-based access, rate limiting, no personal data stored locally. » et la stack « Nuxt 3 · TypeScript · AdonisJS (Node.js) · PostgreSQL (SQL) · Docker · GitLab CI/CD · Symfony · AWS ». En français : la puce « CI/CD GitLab (couverture 80 %, Checkmarx, Docker, déploiement auto, health check) ; SSO OIDC, autorisation par rôle, rate limiting, aucune donnée personnelle stockée en local. » et la même stack. Ce sont les seules mentions de GitLab dans chaque PDF, et aucun lien ne pointe vers `gitlab.com`.
- [ ] CA10 — Étant donné le dossier de design ci-dessus, quand je lance `pnpm cv`, alors les deux PDF sont régénérés depuis ces fichiers, puis versionnés. Chacun tient toujours sur une seule page A4, avec un texte sélectionnable et des liens cliquables.

## Hors scope
- Migration du dépôt du portfolio vers GitHub : le remote `origin`, `.gitlab-ci.yml`, `glab`, et la section « CI GitLab » d'`AGENTS.md` restent tels quels.
- Les mentions GitLab de l'expérience Enedis (CA9) : c'est l'outil de l'employeur.
- Toute modification du dossier de design, y compris `uploads/README.md` (« Built by @romain.caille »), qui n'est affiché nulle part.
- L'historique des specs (`docs/features/*.md`) : il n'est pas réécrit.
- L'image Open Graph (`public/og.png`), qui ne mentionne pas GitLab.
- Un lien vers le CV français : il n'en existe toujours aucun.

## Contraintes
- Contenu du site et des CV en anglais, et en français pour le CV FR.
- Le dossier de design est en lecture seule : aucun agent ne le modifie, et il n'est pas copié dans le dépôt. Seuls les PDF régénérés sont versionnés.
- `pnpm cv` a besoin du réseau (React via unpkg, polices Google Fonts).
- Les règles du design system (`AGENTS.md`) s'appliquent. Aucune nouvelle dépendance.
- Le changement touche le rendu : `pnpm lhci` doit passer en local.

## Plan technique
### Approche
- Sept lignes de `src/` changent : le lien et la note du contact, les deux liens `repo`, la barre d'URL d'Event Hub et `sameAs`. Le style et la structure restent identiques.
- `pnpm cv` régénère les deux PDF depuis l'export du 2026-10-05. Le script ne change pas.
- Tests : l'oracle `tests/design.ts` et les attentes GitLab existantes passent à GitHub. Un bloc `liens-github` ajoute CA1 (ordre et style), CA6 (HTML prérendu) et CA7 à CA9 (PDF). `tests/pdf.ts` ne change pas.

### Fichiers
- **modifié (dev)** : `src/components/contact.tsx`
  - l. 131-132 : `href="https://github.com/romain-cll"` et libellé `github`.
  - l. 148 : `Some of my work is in private repositories.`
  - Ne changent pas : `LINK` (l. 9), `ArrowUpRight`, l'ordre des liens et les classes de la note (l. 147).
- **modifié (dev)** : `src/lib/content.ts`
  - l. 99 : `https://github.com/romain-cll/fraud-engine-event-driven`
  - l. 107 : `github.com/romain-cll/events-hub`
  - l. 140 : `https://github.com/romain-cll/events-hub`
- **modifié (dev)** : `src/routes/index.tsx` — l. 17 : `https://github.com/romain-cll`.
- **modifiés par `pnpm cv` (dev)** : `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf`.
- **modifié (tester)** : `tests/design.ts`
  - l. 1-6 : une ligne datée dans l'en-tête.
  - l. 54 : `GITLAB_NOTE` devient `CONTACT_NOTE = 'Some of my work is in private repositories.'`, avec un commentaire sur l'écart assumé avec l'export (décision du 2026-10-05).
  - l. 94, 101 et 110 : URL GitHub.
  - l. 360 : `'github'`.
  - l. 363 : `CONTACT_NOTE`.
- **modifié (tester)** : `tests/e2e/sections.spec.ts`
  - l. 8 : import.
  - l. 445-446 : URL.
  - l. 843-864 : titre sans « GitLab », locator `github`.
  - l. 867 : `['github', 'https://github.com/romain-cll']`.
  - l. 891-894 : titre et `CONTACT_NOTE`.
  - Nouveau test `liens-github CA1`, dans le describe CA25, après la l. 889.
- **modifié (tester)** : `tests/e2e/responsive.spec.ts` — l. 3, 110, 114, 124 et 249.
- **modifié (tester)** : `tests/e2e/motion.spec.ts` — l. 7, 95 et 98.
- **modifié (tester)** : `tests/e2e/seo.spec.ts` — l. 187.
- **modifié (tester)** : `tests/e2e/pages.spec.ts` — l. 15 (import de `prerenderedRoutes`). Nouveau test `liens-github CA6` après la l. 144.
- **modifié (tester)** : `tests/unit/cv.test.ts`
  - l. 56 : titre, « GitHub ».
  - l. 63, 66 et 67 : nouvelles URL.
  - l. 126 : `'github.com/romain-cll'`.
  - Un commentaire daté au-dessus de chaque liste.
  - Nouveau bloc `liens-github` après la l. 359, avant la section du script (l. 361).
- **modifié (PO)** : `docs/features/liens-github.md` — plan et décisions.
- **inchangés, vérifiés** :
  - **CV de l'export.**
    - `Resume EN.dc.html` : `github` aux l. 32, 100 et 114. « GitLab » n'apparaît qu'aux l. 74 et 77 (Enedis), mot pour mot comme dans CA9.
    - `CV FR.dc.html` : `github` aux l. 33, 101 et 115. « GitLab » n'apparaît qu'aux l. 75 et 78, là aussi mot pour mot comme dans CA9.
    - Il ne reste ni `gitlab` ni `romain.caille` ailleurs dans les deux fichiers, sauf dans `uploads/README.md` l. 312, qui est hors scope.
    - Toutes les phrases déjà testées (`cv.test.ts` l. 121-145, 181-201 et 250-305) sont encore dans l'export.
    - Mise en page :
      - `github.com/romain-cll` (21 caractères) remplace `gitlab.com/romain.caille` (24 caractères). La colonne reste dimensionnée par `linkedin.com/in/romain-caillé` (29 caractères).
      - `github` a la même longueur que `gitlab`.
  - **Maquette du site** (`Portfolio Event-Driven.dc.html`).
    - Les l. 298, 327, 328 et 334 portent les valeurs de CA1, CA3 et CA4.
    - La l. 302 garde « Most of my GitHub work… ». C'est l'écart attendu : CA2 fait foi.
    - Le reste est identique à `tests/design.ts` : hero l. 136-166, `PROJECTS` l. 313-335, `LOG` l. 336-356, contact l. 278-301.
  - **Script.** Dans `scripts/cv.mjs`, les sources (l. 13-15) et les graisses (l. 24-27) couvrent les polices de l'export (l. 12).
  - **Composant des projets.** `src/components/project.tsx` lit `content.ts` pour la barre d'URL (l. 124-125, `truncate`) et pour le lien (l. 143-146).
  - **Build actuel.** `dist/client/index.html` contient 7 occurrences de « gitlab ». Elles viennent toutes des 7 lignes de `src/` listées plus haut :
    - JSON-LD ;
    - `href` et libellé du contact ;
    - note ;
    - deux liens `repo` ;
    - barre d'URL d'Event Hub.
  - **Routes.** `/` est la seule route prérendue (`tests/e2e/support.ts` l. 27-42). La page 404 est rendue par le serveur.
  - **Hors scope, non touchés** : `.gitlab-ci.yml`, `AGENTS.md`, `tests/unit/ci.test.ts`, `tests/pdf.ts`.

### Tâches (ordonnées)
1. **Calibrage (tester), avant le commit rouge** — couvre CA7 et CA8.
   - Appliquer `rowOf` (voir la stratégie de test) aux PDF actuels, avec les anciennes valeurs :
     - la rangée de `https://gitlab.com/romain.caille` contient `gitlab.com/romain.caille` ;
     - la rangée du dépôt `event-hub` contient `EventHub` et `gitlab` ;
     - celle de `fraud-engine-event-driven` contient `FraudEngine` et `gitlab`.
   - Aucune rangée ne doit contenir de texte de puce.
2. **Tests rouges (tester)** — couvre CA1 à CA10. Ce sont les fichiers ci-dessus. Vérifier que les rouges obtenus sont ceux qui sont attendus.
3. **Site (dev)** — couvre CA1 à CA6. Modifier les 7 lignes de `src/`.
4. **Dossier de design (dev)** — couvre CA10.
   - `ls -l "/Users/romain/Downloads/Portfolio Event-Driven"` : les deux CV sont datés du 2026-10-05 à 00 h 34.
   - `grep -in gitlab` sur les deux `.dc.html` ne renvoie que les l. 74 et 77 (EN), 75 et 78 (FR).
5. **`pnpm cv` (dev, réseau requis)** — couvre CA7 à CA10.
   - `git status` montre exactement les deux PDF modifiés.
   - `node --test tests/unit/cv.test.ts` est vert.
6. **Vérifications locales (dev)** — couvre CA1 à CA6 et la DoD.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`, puis `pnpm lhci` : la feature touche au rendu.
   - Avant le push, les e2e passent aussi dans l'image de la CI limitée à 1 CPU.
7. **Relecture manuelle (Romain, à la livraison)** — couvre CA1, CA2, CA7, CA8 et CA10.
   - Section contact à 1440 px et à 320 px.
   - Les deux PDF dans Aperçu : l'en-tête, un clic sur chaque lien `github`, une seule page.

### Stratégie de test
- **Commandes.**
  - Unitaires : `node --test tests/unit/cv.test.ts`, puis `pnpm test`.
  - E2E ciblés : `pnpm build && pnpm test:e2e tests/e2e/sections.spec.ts tests/e2e/responsive.spec.ts tests/e2e/motion.spec.ts tests/e2e/seo.spec.ts tests/e2e/pages.spec.ts tests/e2e/ecarts.spec.ts tests/e2e/server.spec.ts`.
- **CA1 → e2e.**
  - Tests existants mis à jour :
    - `sections.spec.ts` CA25 (l. 866-889) : l'`href` est `https://github.com/romain-cll`, et l'icône Carbon (`viewBox` `0 0 32 32`) suit le texte ;
    - `responsive.spec.ts` l. 124 : le lien est visible à 320 px ;
    - `responsive.spec.ts` l. 249 : le lien prend le focus clavier ;
    - `motion.spec.ts` l. 95 : le lien est dans son état final.
  - Nouveau test `liens-github CA1` (1440 × 900) :
    - les liens de la section contact ont pour textes `['github', 'linkedin', 'resume.pdf']`, dans cet ordre ;
    - ils sont sur la même rangée, avec des `left` croissants ;
    - le style calculé du lien `github` est égal à celui de `linkedin` : bordure, padding, `color`, `backgroundColor`, `fontFamily`, `fontSize`, `textDecorationLine` ;
    - aucun lien nommé `gitlab` n'existe dans la page.
- **CA2 → e2e, par `CONTACT_NOTE`.** Aucun nouveau test, et l'absence de l'ancien texte est couverte par CA6. Tests qui portent la note :
  - `sections.spec.ts` CA25 (l. 843-864) : la note est sous la rangée e-mail et liens ;
  - `sections.spec.ts` l. 891-900 : la note est en texte discret ;
  - `responsive.spec.ts` l. 106-116 : la note est au-dessus de la barre du terminal ;
  - `motion.spec.ts` l. 98 : la note est dans son état final ;
  - `pages.spec.ts` CA2 (l. 89-121) : le texte exact est dans le HTML prérendu, dans la réponse du serveur, dans la page sans JavaScript, et dans la section contact.
- **CA3 → e2e.**
  - `sections.spec.ts` CA19 (l. 420-437), avec `design.ts` l. 94.
  - `sections.spec.ts` l. 445.
- **CA4 → e2e.**
  - `sections.spec.ts` CA19 l. 365-387 : l'URL de la barre est visible.
  - `sections.spec.ts` l. 389-418 : ordre dans la carte.
  - `sections.spec.ts` l. 420-437 : `href`.
  - `sections.spec.ts` l. 446.
  - `pages.spec.ts` CA2 : le texte de l'URL est présent.
  - Tous ces tests suivent `design.ts` l. 101 et 110.
- **CA5 → e2e.**
  - `seo.spec.ts` CA6 (l. 166-189), avec `sameAs` mis à jour.
  - `toMatchObject` compare les tableaux à longueur égale : c'est exactement CA5.
- **CA6 → e2e sans navigateur.** Nouveau test `liens-github CA6` dans `pages.spec.ts` :
  - pour chaque route de `prerenderedRoutes()`, lire `join(DIST, route, 'index.html')` ;
  - relever chaque correspondance de `/gitlab/gi`, avec 40 caractères de contexte ;
  - attendre `[]` ;
  - la liste des routes doit contenir `/`.
  - Sur le build actuel, il échoue sur les 7 occurrences relevées plus haut.
- **Bloc unitaire `liens-github` dans `cv.test.ts`, pour EN et FR.** Données :
  - le profil `https://github.com/romain-cll` ;
  - les deux dépôts : `['Event Hub', '…/events-hub']` et `['Fraud Engine', '…/fraud-engine-event-driven']` ;
  - pour chaque langue, la puce et la stack Enedis, copiées de CA9.

  Fonction `rowOf(info, uri)` :
  - elle trouve le lien de `info.pages[0].links` dont l'URL vaut `uri`, après `new URL(…).href` ;
  - elle renvoie le `squash` des runs non vides dont `y` tombe entre les deux bornes verticales, triées, du `rect` de ce lien.
- **CA7 → unitaire.**
  - `squash(text)` contient `github.com/romain-cll`, et ne contient plus `gitlab.com/romain.caille`.
  - Dans le texte, `r.caille@icloud.com` vient avant `github.com/romain-cll`, qui vient avant `linkedin.com/in/romain-caillé`.
  - `rowOf(profil)` contient `github.com/romain-cll`.
- **CA8 → unitaire.** Pour chaque dépôt, le lien existe, et `rowOf` contient `github` et `squash(projet)`, sans `/gitlab/i`.
- **CA9 → unitaire.**
  - Les deux phrases Enedis sont dans `squash(text)`.
  - Une fois chacune retirée une fois, le reste ne contient plus `/gitlab/i`.
  - Aucune URI de lien ne contient `gitlab`.
- **CA10 → manuel et tests existants.**
  - Manuel : tâches 4, 5 et 7.
  - `cv.test.ts` CA5 (l. 32-76) : une page A4, du texte décodable, les liens (liste mise à jour), au plus 400 000 octets.
  - `cv.test.ts` CA18 (l. 83-101).
  - `cv-mise-a-jour-2` CA6 à CA8 (l. 327-357) : la mise en page ne change pas.
  - `server.spec.ts` CA4 (l. 29-38) : les octets servis sont ceux de `public/`.
- **Rouge attendu.**
  - Unitaires :
    - CA5 liens, EN et FR ;
    - CA6 phrases EN (l. 126) ;
    - `liens-github` CA7 et CA8 ;
    - CA9, sauf la présence des phrases Enedis.
  - E2E : tous les tests qui lisent le lien `github`, la note, l'URL ou les `href` d'Event Hub et de Fraud Engine, dans `sections`, `responsive`, `motion`, `ecarts` (l. 64), `pages` (CA2 et CA6) et `seo` (CA6).
  - Restent verts : CA5 (poids, page, texte), CA18, `cv-mise-a-jour`, `cv-mise-a-jour-2`, CA8 et CA9 du script, `server.spec.ts`.

### Décisions à valider
- **Comment adapter les tests existants qui citent GitLab** (liste dans « Fichiers ») ? Options :
  - A : adaptés en place dans le commit rouge, avec `GITLAB_NOTE` renommé `CONTACT_NOTE` et des titres de test sans « GitLab » ;
  - B : seules les valeurs changent, le nom reste.

  Recommandation : A. Avec B, le nom et les libellés « mention GitLab » deviennent faux. A ne coûte que 3 lignes d'import de plus.
- **CA7 et CA8 : comment relier un libellé à son lien dans le PDF ?** Options :
  - A : la rangée du `Rect` de l'annotation (`rowOf`) ;
  - B : compter 3 `github` dans le texte et vérifier les URI.

  Recommandation : A. Seule A prouve que le `github` d'Event Hub est bien le lien vers `events-hub`. Elle n'utilise que `links[].rect` et `runs[].y`, déjà exposés par `tests/pdf.ts`, et la tâche 1 la valide avant le commit rouge. B reste le repli si le calibrage échoue.
- **Rendu d'essai avant les tests rouges ?** Options :
  - A : non ;
  - B : oui, comme pour `cv-mise-a-jour-2`.

  Recommandation : A.
  - Les chaînes sont plus courtes ou de même longueur, donc la mise en page ne bouge pas.
  - La marge basse mesurée est de 9 mm pour 3 mm exigés.
  - Les PDF actuels ont la même structure : le calibrage sur ces PDF suffit.

### Risques
- **Réseau de `pnpm cv`.** Le script dépend d'unpkg et de Google Fonts. Une nouvelle version d'Instrument Sans peut déplacer des retours à la ligne, mais il reste environ 6 mm de marge sur CA8 de `cv-mise-a-jour-2`.
- **Horodatage de l'export non vérifié.** Je n'avais pas de shell ici : c'est la tâche 4.
- **`Rect` des liens écrits par Chromium.** Si la ligne de base du libellé tombe hors du `Rect`, `rowOf` échoue. La tâche 1 le détecte, et B sert alors de repli.
- **Resynchronisation future depuis l'export.** Recopier la l. 302 de l'export réintroduirait « Most of my GitHub work… ». Deux garde-fous : le commentaire daté dans `tests/design.ts`, et CA2 testé mot pour mot.
- **Existence des dépôts.** Aucun test ne va sur le réseau. Que `events-hub` et `fraud-engine-event-driven` existent et soient publics ne se vérifie qu'au clic, en tâche 7.
- **Commit rouge très étendu.** `design.ts` alimente de nombreux e2e, qui échoueront tous : c'est attendu, et le dev ne touche pas à `tests/`.
- **Poids du dépôt.** Chaque régénération ajoute environ 320 Ko à l'historique git.

### Ambiguïtés sur la spec
Aucune.

## Décisions
- 2026-10-05 — « GitLab CI/CD » reste dans l'expérience Enedis. Tout le reste passe à GitHub (validée par Romain).
- 2026-10-05 — La note de la section contact devient « Some of my work is in private repositories. » : la consigne disait « are », corrigé en « is » parce que *work* est indénombrable (validée par Romain).
- 2026-10-05 — Romain a fait les changements des CV et de la maquette dans Claude Design, puis a réexporté le dossier. Les agents ne touchent pas au dossier de design (validée par Romain).
- 2026-10-05 — La note de la section contact est « Some of my work is in private repositories. ». Romain a corrigé la maquette dans Claude Design, mais l'export local montre encore l'ancienne version, et c'est la spec qui fait foi (validée par Romain).
- 2026-10-05 — Spec validée (GATE 1).
- 2026-10-05 — Plan validé (GATE 2). Décision 1 → A : les tests existants sont adaptés dans le commit rouge, avec `GITLAB_NOTE` renommé `CONTACT_NOTE` et des titres de test sans « GitLab ». Décision 2 → A : `rowOf` rattache chaque lien à sa rangée, avec B en repli si le calibrage de la tâche 1 échoue. Décision 3 → A : pas de rendu d'essai (validées par Romain).
- 2026-10-05 — `events-hub` et `fraud-engine-event-driven` sont publics sur GitHub : Romain le confirme, et aucune vérification n'est nécessaire (validée par Romain).
