# CV — videoCn à la place de Fraud Engine

## User story
En tant que recruteur ou client qui télécharge le CV de Romain sur romain-caille.fr, je veux y voir son projet videoCn à la place de Fraud Engine, afin de découvrir son projet open source le plus récent.

## Critères d'acceptation

*Source : `/Users/romain/Downloads/Portfolio Event-Driven/`, export du 2026-10-05 à 01 h 21. Romain y a déjà fait les changements dans Claude Design. `Resume EN.dc.html` et `CV FR.dc.html` font foi pour le contenu et la mise en page des PDF, sans aucune modification à faire. Le seul changement par rapport aux PDF actuels : dans la section des projets, le bloc Fraud Engine est remplacé par un bloc videoCn. Les PDF sont produits par `pnpm cv` (spec `docs/features/portfolio-cv.md`), et le script ne change pas. Le site ne change pas.*

### Génération
- [ ] CA1 — Étant donné le dossier de design ci-dessus, quand je lance `pnpm cv`, alors `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf` sont régénérés depuis ces fichiers, puis versionnés.

### CV anglais (`/resume-romain-caille.pdf`)
- [ ] CA2 — Étant donné le PDF anglais, quand j'en lis le texte, alors la section « Projects » contient, après le bloc Event Hub, un bloc videoCn avec, à la lettre :
  - « videoCn » et « · open-source video player for shadcn/ui » ;
  - « Full video player built with shadcn/ui components and distributed as a shadcn registry: one command installs it, and it takes on the host project's theme. » ;
  - « Supports HLS streaming, WebVTT subtitles and chapters, and keyboard shortcuts. » ;
  - « React · TypeScript · Next.js · shadcn/ui ».

### CV français (`/cv-romain-caille.pdf`)
- [ ] CA3 — Étant donné le PDF français, quand j'en lis le texte, alors la section « Projets » contient, après le bloc Event Hub, un bloc videoCn avec, à la lettre :
  - « videoCn » et « · lecteur vidéo open source pour shadcn/ui » ;
  - « Lecteur vidéo complet construit avec les composants shadcn/ui et distribué comme registry shadcn : une commande l'installe, et il reprend le thème du projet hôte. » ;
  - « Streaming HLS, sous-titres et chapitres WebVTT, raccourcis clavier. » ;
  - « React · TypeScript · Next.js · shadcn/ui ».

### Liens des deux CV
- [ ] CA4 — Étant donné chaque PDF, quand je lis la rangée du titre videoCn, alors elle porte deux liens cliquables : `videocn.dev` vers https://videocn.dev/ et `github` vers https://github.com/romain-cll/videocn.
- [ ] CA5 — Étant donné chaque PDF, quand j'en liste les liens, alors on y trouve toujours le site, l'e-mail, le profil GitHub, LinkedIn, spotime.fr et le dépôt Event Hub, et plus aucun lien vers `fraud-engine-event-driven`.

### Fraud Engine retiré des deux CV
- [ ] CA6 — Étant donné chaque PDF, quand j'en lis le texte, alors il ne contient plus aucun de ces textes :
  - « Fraud Engine » ;
  - « Three Go services linked by Kafka, partitioned by card_id so a card is always scored by the same worker. » (EN) ;
  - « Trois services Go reliés par Kafka, partitionnés par card_id : une carte est toujours scorée par le même worker. » (FR) ;
  - « Go · Kafka · Redis · ClickHouse · Prometheus · Grafana · Docker ».

### Non-régression
- [ ] CA7 — Étant donné les deux nouveaux PDF, quand les tests existants tournent, alors restent verts, hors textes et liens de Fraud Engine adaptés selon les Contraintes :
  - CA5 (une page A4, texte sélectionnable, liens cliquables, au plus 400 000 octets), CA6 (langues, titres, accroches) et CA18 (uniquement Instrument Sans et IBM Plex Mono) de `portfolio-cv` ;
  - les blocs `cv-mise-a-jour` et `cv-mise-a-jour-2`, dont CA8 : la ligne de diplôme reste la dernière ligne, entière, à au moins 3 mm du bas de la page ;
  - les blocs `liens-github` : profil GitHub dans l'en-tête, GitLab cité seulement pour Enedis.
- [ ] CA8 — Étant donné le site, quand je l'inspecte, alors rien ne change : la section Fraud Engine et son lien `repo` restent, les deux liens `resume.pdf` pointent toujours vers `/resume-romain-caille.pdf`, et le CV français n'est toujours pas lié.

## Hors scope
- Le site : sa section Fraud Engine reste telle quelle. La maquette du site n'a pas changé.
- L'accroche des deux CV, qui parle encore de « TypeScript and Go backends » et de Kafka : elle n'a pas changé dans le design.
- Toute modification de `src/` et de `scripts/cv.mjs`.
- Un lien vers le CV français.
- Retouche du design des CV. Si un test de mise en page échoue (CA8 de `cv-mise-a-jour-2`), le problème remonte à Romain.

## Contraintes
- Les agents ne touchent pas au dossier de design.
- Les tests existants qui portent sur Fraud Engine dans les CV sont adaptés, avec une décision datée. Repérés dans `tests/unit/cv.test.ts` : la liste des liens de CA5 (l. 68), les textes de CA6 (l. 144 à 146 et 201 à 203), et la liste `REPOS` du bloc `liens-github` (l. 371). Les tests du site sur Fraud Engine ne changent pas.
- Les phrases vérifiées dans les PDF évitent les ligatures fi, fl et ff : les CA ci-dessus ont été choisis ainsi.
- `pnpm cv` a besoin du réseau (React via unpkg, polices Google Fonts).
- Aucune nouvelle dépendance.

## Plan technique
### Approche
Aucun code de production ne change. `pnpm cv` régénère les deux PDF depuis l'export du 2026-10-05, sans toucher au script, à `src/` ni à `tests/pdf.ts`.
Dans `tests/unit/cv.test.ts`, chaque ligne qui porte sur Fraud Engine est remplacée par son équivalent videoCn. Un nouveau bloc `cv-videocn` couvre CA2 à CA6 avec l'outillage existant (`squash`, `rowOf`, `links[].rect`).

### Fichiers
- **modifiés par `pnpm cv` (dev)** : `/Users/romain/projects/portfolio/public/resume-romain-caille.pdf` et `/Users/romain/projects/portfolio/public/cv-romain-caille.pdf`.
- **modifié (tester)** : `/Users/romain/projects/portfolio/tests/unit/cv.test.ts`. Les numéros de ligne sont ceux d'avant toute insertion.
  - l. 59 : ajout d'une ligne de commentaire datée (cv-videocn, CA5).
  - l. 68 : `'https://github.com/romain-cll/videocn',`. Le titre l. 56 ne change pas : « les deux dépôts » désigne désormais events-hub et videocn.
  - Au-dessus de la l. 144, un commentaire daté, puis :
    - l. 144 : la 1re puce de CA2, entre guillemets doubles à cause de l'apostrophe de « project's » ;
    - l. 145 : « Supports HLS streaming, WebVTT subtitles and chapters, and keyboard shortcuts. » ;
    - l. 146 : « React · TypeScript · Next.js · shadcn/ui ».
  - Au-dessus de la l. 201, un commentaire daté, puis :
    - l. 201 : la 1re puce de CA3, entre guillemets doubles ;
    - l. 202 : « Streaming HLS, sous-titres et chapitres WebVTT, raccourcis clavier. » ;
    - l. 203 : « React · TypeScript · Next.js · shadcn/ui ».
  - Au-dessus de la l. 369, un commentaire daté. La l. 371 devient `{ project: 'videoCn', uri: 'https://github.com/romain-cll/videocn' }`.
  - Nouveau bloc `cv-videocn` après la l. 442, avant la section du script (l. 444). Contenu détaillé dans la stratégie de test.
- **modifié (PO)** : `/Users/romain/projects/portfolio/docs/features/cv-videocn.md` — plan, décisions datées, et la Contrainte complétée avec les l. 145 et 202 (voir la décision 1).
- **inchangés, vérifiés**
  - **Textes de CA2 à CA6, comparés à la lettre** :
    - export EN, `Resume EN.dc.html` : bloc videoCn l. 111-121, juste après Event Hub (l. 97-109) ;
    - export FR, `CV FR.dc.html` : bloc videoCn l. 112-122, juste après Event Hub (l. 98-110).
    - **Aucun écart.** Les apostrophes sont droites (« project's », « l'installe »). Aucun des deux exports ni la spec ne contient d'espace insécable (U+00A0, U+202F), d'apostrophe courbe ou de tiret insécable. « open-source » et « sous-titres » utilisent le trait d'union ASCII. Les « · » sont des U+00B7 partout (export et `cv.test.ts`). Les accents sont précomposés, sans U+0301. Les seuls demi-cadratins sont sur les dates (EN l. 53, 68, 83 ; FR l. 54, 69, 84).
    - **Aucune ligature** fi, fl ou ff dans les textes de CA2, CA3 et CA6.
  - **CA6, aucune fausse correspondance.** « Fraud », « scorer » et « card_id » n'apparaissent dans aucun des deux CV de l'export. « Kafka » ne reste que dans l'accroche (EN l. 42, FR l. 43), qui est hors scope. Après `squash`, aucun texte à faire disparaître n'est sous-chaîne du nouveau texte.
    - « videoCn » (C majuscule) ne se confond pas avec « videocn.dev ».
    - « React·TypeScript·Next.js·shadcn/ui » n'est pas sous-chaîne de la stack Spotime.
  - **Les autres phrases déjà testées sont toutes dans l'export.** Sont vérifiées, hors lignes Fraud Engine : `phrasesEn`, `phrasesFr`, les listes `keep` et `drop` de `MISE_A_JOUR_2`, l'en-tête et Enedis de `liens-github`, les accroches et les titres de CA6. Les listes `drop` sont toutes absentes. Le seul changement des CV est le bloc Fraud Engine → videoCn.
  - **Polices.** L'export charge Instrument Sans 400, 500 et 600, et IBM Plex Mono 400 et 500 (l. 12), exactement comme `WEIGHTS` de `/Users/romain/projects/portfolio/scripts/cv.mjs` (l. 23-27). Le bloc videoCn n'utilise qu'Instrument Sans 600 et 400, et IBM Plex Mono 400. Il n'ajoute ni famille, ni italique, ni image (la pastille `#e08a3c` est un fond CSS).
  - **Tests de CV portant sur Fraud Engine.** Seul `cv.test.ts` en contient : l. 68, 144, 145, 146, 201, 202, 203 et 371. `tests/e2e/cv.spec.ts` et `tests/e2e/server.spec.ts` lisent les PDF en octets, sans en lire le contenu : ils ne changent pas.
  - **Tests du site sur Fraud Engine, qui ne changent pas** : `tests/design.ts` (l. 84-97, 128-131) ; les e2e `sections.spec.ts` (l. 309, 335, 445, 524-529, 570-577), `video.spec.ts`, `media.spec.ts`, `pipeline.spec.ts`, `motion.spec.ts`, `responsive.spec.ts`, `terminal.spec.ts`, `ecarts.spec.ts` et `pages.spec.ts` l. 33 ; les unitaires `media.test.ts`, `pipeline.test.ts` et `tokens.test.ts` l. 138.
  - **Site.** La maquette l. 327 garde le dépôt `fraud-engine-event-driven` et ne contient pas videoCn. `src/lib/content.ts` l. 99 reste inchangé.

### Tâches (ordonnées)
1. **Dossier de design (tester)** — couvre CA1.
   - `ls -l "/Users/romain/Downloads/Portfolio Event-Driven"` : les deux CV doivent être datés du 2026-10-05 à 01 h 21. Je n'ai pas pu le vérifier, faute de shell.
   - `grep -ci fraud` doit renvoyer 0 sur les deux `.dc.html`.
2. **Rendu d'essai et calibrage (tester, décision 3, réseau requis)** — couvre CA2 à CA7.
   - Lancer `pnpm cv`, écrire les tests (tâche 3), puis `node --test tests/unit/cv.test.ts` : tout doit être vert, en particulier `rowOf` sur la rangée videoCn et CA8 de `cv-mise-a-jour-2`.
   - Ensuite `git checkout -- public/resume-romain-caille.pdf public/cv-romain-caille.pdf`, relancer, et constater exactement les rouges attendus.
   - Si CA8 de `cv-mise-a-jour-2` échoue sur le rendu d'essai : arrêt, et remontée à Romain (hors scope).
3. **Tests rouges (tester)** — couvre CA2 à CA7. Les modifications de `cv.test.ts` listées dans « Fichiers ».
4. **`pnpm cv` (dev, réseau requis)** — couvre CA1. `git status` doit montrer exactement les deux PDF modifiés.
5. **Tests unitaires (dev)** — couvre CA2 à CA7. `node --test tests/unit/cv.test.ts`, puis `pnpm test`.
   - Si CA8 de `cv-mise-a-jour-2` échoue : arrêt. Le dev transmet la marge en mm au PO, sans toucher aux tests, au design ni au script.
6. **Vérifications locales (dev)** — couvre CA7, CA8 et la DoD.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
   - `git diff --stat main -- src scripts tests/pdf.ts tests/e2e tests/design.ts` doit être vide.
   - Avant le push, les e2e passent aussi dans l'image de la CI limitée à 1 CPU.
   - `pnpm lhci` n'est pas requis : le rendu du site ne change pas.
7. **Relecture manuelle (Romain, à la livraison)** — couvre CA1, CA4 et CA8.
   - Les deux PDF dans Aperçu : le bloc videoCn sous Event Hub, une seule page, la ligne de diplôme entière.
   - Un clic sur `videocn.dev` et sur `github`.

### Stratégie de test
- **Commandes** :
  - `node --test tests/unit/cv.test.ts`, puis `pnpm test` ;
  - e2e ciblés : `pnpm build && pnpm test:e2e tests/e2e/cv.spec.ts tests/e2e/server.spec.ts tests/e2e/sections.spec.ts tests/e2e/hero.spec.ts` ;
  - puis `pnpm test:e2e` complet.
- **Données du bloc `cv-videocn`**, une entrée par langue :
  - `pdf` ;
  - le sous-titre (« · open-source video player for shadcn/ui » / « · lecteur vidéo open source pour shadcn/ui ») ;
  - les 2 puces de CA2 et CA3 ;
  - la phrase Fraud Engine de CA6 propre à la langue ;
  - le diplôme, repris de `MISE_A_JOUR_2`.

  Constantes communes :
  - stack videoCn : `'React · TypeScript · Next.js · shadcn/ui'` ;
  - stack Event Hub : `'NestJS · PostgreSQL · Drizzle · Zod · TanStack Start · Stripe Connect · Turborepo'`, identique en EN et en FR, et unique dans le texte ;
  - `https://videocn.dev/` et `https://github.com/romain-cll/videocn`.
- **CA1 → manuel.** Tâches 1 et 4 : `git status` montre les deux PDF modifiés, puis `pnpm test` est vert.
- **CA2 et CA3 → unitaire, nouveau test par langue.**
  - Dans `squash(info.text)`, les `indexOf` de cette suite sont tous ≥ 0 et strictement croissants : stack Event Hub, « videoCn », sous-titre, puce 1, puce 2, stack videoCn, diplôme. Cela couvre à la fois « après Event Hub » et « dans la section des projets », avant Education ou Formation.
  - Le message d'échec liste les textes absents ou mal placés.
  - Les mêmes textes sont aussi couverts par `phrasesEn` et `phrasesFr` adaptées (l. 144-146 et 201-203).
- **CA4 → unitaire, nouveau test par langue.**
  - `rowOf(info, 'https://videocn.dev/')` et `rowOf(info, 'https://github.com/romain-cll/videocn')` contiennent chacune `videoCn`, puis `videocn.dev` avant `github`.
  - Le `Rect` du lien videocn.dev est entièrement à gauche de celui du dépôt : `max(x0, x2)` du premier ≤ `min(x0, x2)` du second.
  - Seuls `links[].rect` et `runs[].y` servent, déjà exposés par `tests/pdf.ts` (décision 2).
  - S'y ajoute `liens-github` CA8 adapté (l. 371) : la rangée du dépôt videoCn contient `github` et `videoCn`, et aucun `gitlab`.
- **CA5 → unitaire.**
  - Le test existant `portfolio-cv` CA5 est adapté (l. 68) : le site, l'e-mail, le profil GitHub, LinkedIn, spotime.fr, events-hub et videocn sont présents, avec des zones cliquables non vides.
  - Nouveau test `cv-videocn` CA5 : aucune URI de `links` ne contient `fraud-engine-event-driven`.
- **CA6 → unitaire, nouveau test par langue.** `['Fraud Engine', phrase de la langue, 'Go · Kafka · Redis · ClickHouse · Prometheus · Grafana · Docker']`, filtrés sur `squash(info.text).includes(squash(…))`, valent `[]`. La comparaison est sensible à la casse, sur le modèle des l. 156-165.
- **CA7 → tests existants, inchangés hors adaptations.**
  - Dans `cv.test.ts` :
    - CA5 (l. 32-78) ;
    - CA18 (l. 84-102) ;
    - CA6, titres, accroches et `cv-mise-a-jour` (l. 111-223) ;
    - `cv-mise-a-jour-2`, CA2 à CA8 (l. 312-362) ;
    - `liens-github`, CA7 à CA9 (l. 402-442) ;
    - script, CA8 et CA9 (l. 477-504).
  - `server.spec.ts` CA4 (l. 29-38).
- **CA8 → e2e existants, inchangés.**
  - `sections.spec.ts` l. 441-447 : le lien `repo` de Fraud Engine.
  - `cv.spec.ts` :
    - CA1 (l. 71-79) ;
    - CA3 (l. 109-115) : exactement deux `.pdf`, aucun `cv-romain-caille` ;
    - CA7 (l. 117-122).
  - `hero.spec.ts` l. 160-166 et `sections.spec.ts` l. 869.
  - Le diff vide de la tâche 6.
- **Rouge attendu sur les PDF actuels** (EN et FR) :
  - `portfolio-cv` CA5 « liens » ;
  - CA6 « reprend à la lettre » ;
  - `liens-github` CA8 pour videoCn ;
  - `cv-videocn` CA2/CA3, CA4, CA5 et CA6.

  Restent verts :
  - CA5 (poids, page, texte) et CA18 ;
  - CA6 titres et accroches ;
  - `cv-mise-a-jour` ;
  - `cv-mise-a-jour-2` en entier ;
  - `liens-github` CA7, CA8 Event Hub et CA9 ;
  - CA8 et CA9 du script ;
  - tous les e2e.

### Décisions à valider (tranchées, voir « Décisions »)
- **Comment adapter les tests existants sur Fraud Engine ?** Les l. 145 et 202 en font partie, alors que la Contrainte ne les liste pas. Ce sont les 2es puces de Fraud Engine (« Scales without code changes… » et « Scale sans changer le code… »), absentes de l'export : sans adaptation, CA7 serait rouge. Options :
  - A : remplacer chaque ligne Fraud Engine par son équivalent videoCn (l. 68, 144-146, 201-203 et 371) ;
  - B : supprimer ces lignes, et ne couvrir videoCn que par le nouveau bloc.

  Recommandation : A. C'est le précédent de `cv-mise-a-jour-2` (l. 139, 197) et de `liens-github`. Les titres « les deux dépôts » et « le lien de chaque projet » restent vrais. La Contrainte et la décision datée doivent citer les l. 145 et 202.
- **CA4 : comment relier chaque libellé à son lien ?** Options :
  - A : `rowOf`, plus l'ordre horizontal des deux `Rect` et l'ordre des libellés dans la rangée ;
  - B : `rowOf` seul, comme `liens-github` CA8.

  Recommandation : A. Les deux liens sont sur la même rangée : avec B, des URL inversées passeraient. A n'ajoute que 2 assertions sur `links[].rect`, déjà exposé.
- **Rendu d'essai avant le commit rouge (tâche 2) ?** Options :
  - A : oui, par le tester, avec `public/` restauré ensuite ;
  - B : non.

  Recommandation : A, comme pour `cv-mise-a-jour-2`. La rangée videoCn a une structure nouvelle (un `span` flex qui contient deux liens et un « / ») : on ne peut pas la calibrer sur les PDF actuels. Le bloc gagne aussi probablement une ligne de puce, sur un CV EN qui remplit déjà sa page. Avec A, les tests n'ont pas à être retouchés après leur commit rouge.

### Risques
- **Marge de CA8 de `cv-mise-a-jour-2`.**
  - La 1re puce videoCn fait environ 154 caractères en EN et 160 en FR. Elle passe donc sans doute sur 2 lignes, alors que les deux puces Fraud Engine testées (104 à 116 caractères) en tenaient une chacune. Une ligne de plus coûte environ 4 mm (8,7 pt × 1,32 en EN, 8,6 pt × 1,32 en FR).
  - Dernières mesures : 9,04 mm (EN, page pleine) et 9,83 mm (FR). Marge attendue : environ 5 mm (EN) et 5,8 mm (FR), pour 3 mm exigés.
  - Je ne peux pas le vérifier sans rendu, et je ne connais pas le bloc Fraud Engine exact de l'ancien export. La tâche 2 le détecte. En cas d'échec, remontée à Romain.
- **`rowOf` sur la nouvelle rangée.** Si la ligne de base de « videoCn » tombe hors du `Rect` d'un lien placé dans le `span` imbriqué, CA4 échoue. La tâche 2 le détecte.
  - Repli, à faire valider : l'ordre des textes dans `squash(info.text)` (« videoCn » < « videocn.dev » < « github » < puce 1) et les URI.
- **Réseau de `pnpm cv`** (unpkg et Google Fonts). Une nouvelle version d'Instrument Sans peut déplacer des retours à la ligne, donc la marge de CA8.
- **Horodatage de l'export non vérifié**, faute de shell : c'est la tâche 1.
- **Existence de videocn.dev et du dépôt `romain-cll/videocn`.** Aucun test ne va sur le réseau. Ce n'est vérifié qu'au clic, en tâche 7.
- **Poids du dépôt.** Chaque régénération ajoute environ 300 Ko à l'historique git.

## Décisions
- 2026-10-05 — Seuls les CV changent : le site garde sa section Fraud Engine, sa maquette n'ayant pas changé (validée par Romain).
- 2026-10-05 — Dans les CV, le seul changement est le remplacement du bloc Fraud Engine par videoCn (validée par Romain).
- 2026-10-05 — Les tests de `cv.test.ts` sur Fraud Engine (l. 68, 144 à 146, 201 à 203 et 371) sont remplacés par leur équivalent videoCn, pas supprimés. Les l. 145 et 202, oubliées par la spec, en font partie (option A, validée par Romain).
- 2026-10-05 — CA4 vérifie aussi l'ordre des liens sur la rangée videoCn : `videocn.dev` à gauche de `github`, par leurs `Rect` et l'ordre des libellés (option A, validée par Romain).
- 2026-10-05 — Le tester fait un rendu d'essai avec `pnpm cv` pour calibrer les tests, puis restaure `public/` avant le commit rouge (option A, validée par Romain).
- 2026-10-05 — videocn.dev et https://github.com/romain-cll/videocn sont publics : Romain le confirme, et aucune vérification n'est nécessaire (validée par Romain).
- 2026-10-05 — Export vérifié par le PO : `Resume EN.dc.html` et `CV FR.dc.html` datés du 2026-10-05 à 01 h 21, sans aucune occurrence de « fraud ».
