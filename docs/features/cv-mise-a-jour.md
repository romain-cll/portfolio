# CV et textes Spotime — mise à jour du 2026-10-04

## User story
En tant que recruteur ou client qui visite romain-caille.fr, je veux télécharger la dernière version du CV de Romain et lire sur le site un parcours cohérent avec ce CV, afin d'avoir des informations à jour et sans contradiction.

## Critères d'acceptation

*Source : `/Users/romain/Downloads/Portfolio Event-Driven/`, version du 2026-10-04 à 16 h 37. `Resume EN.dc.html` et `CV FR.dc.html` font foi pour le contenu et la mise en page des PDF. `Portfolio Event-Driven.dc.html` fait foi pour les textes du site. Les PDF sont produits par `pnpm cv` (spec `docs/features/portfolio-cv.md`), et le script ne change pas.*

### CV
- [ ] CA1 — Étant donné le dossier de design du 2026-10-04, quand je lance `pnpm cv`, alors `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf` sont régénérés depuis les nouveaux fichiers, puis versionnés.
- [ ] CA2 — Étant donné `/resume-romain-caille.pdf`, quand j'en lis le texte, alors il contient les phrases du nouveau `Resume EN.dc.html`, notamment :
  - « Master's in IT & Information Systems », sans « · 2025 » ;
  - « Cold-call prospecting: no traction in construction, so I pivoted to test the personal care services market, which proved more receptive, with prospects coming in inbound. » ;
  - « Development assisted by a team of subagents (PO, architect, tester, developer, reviewer), framed by user stories, a DoR/DoD and TDD. »
  
  Il ne contient plus « Full-time / freelance », ni l'ancienne phrase « Pivoted to personal care services, with a demo booked and a client signed through outbound. ».
- [ ] CA3 — Étant donné `/cv-romain-caille.pdf`, quand j'en lis le texte, alors il contient les phrases du nouveau `CV FR.dc.html`, notamment :
  - « Master Bac+5 · Expert en informatique et SI », sans « · 2025 » ;
  - « Prospection en cold call : sans résultat dans le BTP, pivot vers le service à la personne pour tester ce marché, plus réceptif, avec des prospects arrivés en inbound. » ;
  - « Développement assisté par une équipe de subagents (PO, architecte, testeur, développeur, reviewer), cadré par des user stories, une DoR/DoD et du TDD. »
  
  Il ne contient plus « CDI / freelance », ni l'ancienne phrase « Prospection en cold call : pas de traction dans le BTP malgré l'appel direct. ».
- [ ] CA4 — Étant donné les deux nouveaux PDF, quand les tests de la spec `portfolio-cv` tournent, alors CA4, CA5 (une page A4, texte sélectionnable, liens cliquables, au plus 400 000 octets), CA6 (langues, titres, accroches) et CA18 (uniquement Instrument Sans et IBM Plex Mono) restent verts.
- [ ] CA5 — Étant donné les deux liens `resume.pdf` du site, quand je les inspecte, alors ils pointent toujours vers `/resume-romain-caille.pdf`, et le CV français n'est toujours pas lié.

### Site
- [ ] CA6 — Étant donné le hero, quand je lis sa liste de détails, alors la ligne `contract` (« Full-time / freelance ») n'existe plus. Les autres lignes (status, location, experience, education, english, resume) restent dans le même ordre, avec les mêmes textes.
- [ ] CA7 — Étant donné la section Spotime, quand je déplie « what broke / learned », alors je lis à la lettre « Construction still showed no traction, even on direct calls. Pivoting to personal care services proved more receptive, with a client coming in inbound. Testing the channel first, then the market, beats rewriting the pitch. »
- [ ] CA8 — Étant donné la carte « deploy ✓ » de Spotime, quand je la lis, alors le résultat est à la lettre « Two paying clients: one in agriculture, and one in personal care services who came in inbound. »
- [ ] CA9 — Étant donné le HTML prérendu de `/`, quand je le lis sans JavaScript, alors il contient les textes de CA7 et CA8 et ne contient plus « Full-time / freelance », ni « signed through outbound ».
- [ ] CA10 — Étant donné les autres textes du site (problem, decision, trade-off et stack de Spotime, Fraud Engine, Event Hub, overview, contact, terminal), quand je les compare au design, alors ils ne changent pas.
- [ ] CA11 — Étant donné le build de production, quand je lance `pnpm lhci` en local, alors les scores Performance, Accessibilité, Bonnes pratiques et SEO restent d'au moins 95.
- [ ] CA12 — Étant donné le `<head>` de `/`, quand je lis `<meta name="description">` et `<meta property="og:description">`, alors chacune vaut à la lettre « Fullstack developer, ready for the agentic era. Open to work, remote or relocation from Nantes, France. ». Le HTML prérendu ne contient plus « full-time or freelance ».

## Hors scope
- Modification de `scripts/cv.mjs`.
- Lien vers le CV français.
- Favicon (`favicon.svg` présent dans le dossier de design).
- Toute autre évolution de mise en page du hero que le retrait de la ligne `contract`.

## Contraintes
- Les tests existants qui portent sur des textes modifiés sont adaptés, chacun avec une décision datée :
  - phrases des CV dans `tests/unit/cv.test.ts` (CA6 de `portfolio-cv`), recopiées à la lettre du nouveau design, sans ligature fi/fl ;
  - textes de Spotime dans l'oracle `tests/design.ts` ;
  - ligne `contract` du hero, partout où un test l'attend ;
  - description de la page dans `tests/e2e/seo.spec.ts` (CA2 du socle).
- `pnpm cv` a besoin du réseau (Google Fonts, unpkg).
- Aucune nouvelle dépendance.
- Langue du site : anglais.

## Plan technique
### Approche
Le changement ne touche que des données et du texte. Dans `hero.tsx`, on retire le `dt`/`dd` `contract`, comme dans le design, où ces lignes sont commentées (l. 146-147). Dans `content.ts`, `learned` et `result` de Spotime sont recopiés à la lettre du design (l. 318-319). Les deux PDF sont régénérés par `pnpm cv`, sans changer le script, puis versionnés. Côté tests, on adapte l'oracle, les phrases des CV et les libellés du hero, et on ajoute des tests d'absence (CA2, CA3, CA9).

### Fichiers
- modifié : `src/components/hero.tsx` l. 41-44 — suppression du `dt` `contract` et du `dd` « Full-time / freelance ». Les six autres lignes, leurs classes et leur ordre ne bougent pas.
- modifié : `src/lib/content.ts` l. 48-49 (`learned`) et l. 50-51 (`result`) de `PROJECTS[0]`, à la lettre du design.
- modifiés (`pnpm cv`) : `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf`.
- modifiés (tester) :
  - `tests/design.ts` : l. 3, le commentaire passe au design du 2026-10-04 (cv-mise-a-jour, CA7 et CA8) ; l. 74-75, `learned` et `result`.
  - `tests/e2e/hero.spec.ts` l. 101-106 et l. 111.
  - `tests/unit/cv.test.ts` l. 120-151 (EN) et l. 168-194 (FR).
  - `tests/e2e/pages.spec.ts` : un test ajouté dans le `describe` CA2 (l. 89-129).
- modifié (PO) : `docs/features/cv-mise-a-jour.md` — le plan et les décisions datées.
- inchangés, vérifiés :
  - `scripts/cv.mjs`. Les deux nouveaux CV gardent `<doc-page size="a4">` et une seule `section.page`, avec les mêmes graisses : Instrument Sans 400, 500 et 600, IBM Plex Mono 400 et 500 (l. 24-27 du script). `doc-page.js` garde `.sheet.paginated` (l. 219), et `support.js` et `doc-page.js` sont toujours dans le dossier.
  - `src/components/contact.tsx` et le lien du hero : `/resume-romain-caille.pdf` avec `download`, et aucun lien vers le CV français (CA5).
  - `src/components/project.tsx` et `src/styles.css` : aucun code ni token ne dépend de ces textes.
  - `src/routes/index.tsx` l. 7-8 : la description contient « full-time or freelance » (voir Décisions).
  - Les textes du design du 2026-10-04 sont identiques à `tests/design.ts` et `hero.spec.ts` pour Fraud Engine, Event Hub, `LOG`, `annTexts`, l'overview, le contact et les six lignes restantes du hero (design l. 136-166, 174-175, 278-302, 313-356, 535). Seuls `learned` et `result` de Spotime changent.
  - `tests/e2e/cv.spec.ts`, `server.spec.ts` et `seo.spec.ts` ne changent pas.

### Tâches (ordonnées)
Prérequis : les tests rouges (voir la stratégie de test).

1. **Hero** — couvre CA6, CA9 (partie hero) et CA10.
   - Supprimer les l. 41-44 de `hero.tsx`.
   - Effets vérifiés :
     - La hauteur de la section est fixe : `h-section-short`, 130vh (`styles.css` l. 176). La progression ne dépend que de cette hauteur. Les seuils E2 (`ecarts.spec.ts` l. 106-112), le terminal et le pipeline ne bougent donc pas.
     - Le bloc sticky (`min-h-stage`, `justify-center-safe`) recentre son contenu. La liste perd environ 35 px à 1440 × 900 (17 px × 1,45 + 10,8 px d'écart). L'indication reste sous la liste (`sections.spec.ts` l. 71-78).
     - Le hero n'a aucune animation de révélation.
     - CA11 et CA28 (320 × 568) y gagnent : il y a moins de contenu. CA29 aussi : le lien `resume.pdf` du hero remonte.
     - Lighthouse : rien ne change pour le LCP (h1 ou portrait) ni pour le CLS. Les paires `dt`/`dd` restent valides.
2. **Spotime** — couvre CA7, CA8, CA9 (partie Spotime) et CA10.
   - Recopier `learned` et `result` à la lettre (design l. 318-319). Ces textes ne contiennent aucune apostrophe.
   - `learned` gagne 15 caractères, dans le `<details>` replié, et `result` en perd 4 : aucun changement de mise en page.
3. **PDF** — couvre CA1 à CA5.
   - Avant de lancer quoi que ce soit, vérifier avec `ls -l` que le dossier est bien la version de 16 h 37.
   - Lancer `pnpm cv`, réseau requis (unpkg et Google Fonts). `git status` doit montrer les deux PDF modifiés.
   - `node --test tests/unit/cv.test.ts` doit passer au vert.
   - Relire les deux PDF dans Aperçu : une page, liens cliquables, dernière ligne (stack de Fraud Engine) entière, marge basse visible (voir Risques).
4. **Vérifications locales** — couvre CA11 et la DoD.
   - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci`.
   - Avant le push, les e2e passent aussi dans l'image de la CI, limitée à 1 CPU (`AGENTS.md`).

### Stratégie de test
- **Commandes.**
  - Unitaires : `pnpm test`, ou un seul fichier : `node --test tests/unit/cv.test.ts`.
  - E2E ciblés : `pnpm build && pnpm test:e2e tests/e2e/hero.spec.ts tests/e2e/pages.spec.ts tests/e2e/sections.spec.ts tests/e2e/motion.spec.ts`.
  - Lighthouse : `pnpm build && pnpm lhci`.
- **CA1 → manuel.** `pnpm cv`, puis `git status` (les deux PDF sont modifiés), puis `pnpm test` passe au vert sur les nouveaux fichiers.
- **CA2 → unitaire (`cv.test.ts`, describe CA6 EN).**
  - `phrasesEn` :
    - l. 123 devient « Master's in IT & Information Systems » ;
    - l. 129 « Full-time / freelance » est retirée ;
    - l. 134-135 sont remplacées par « Cold-call prospecting: no traction in construction, so I pivoted to test the personal care services market, which proved more receptive, with prospects coming in inbound. » ;
    - on ajoute « Development assisted by a team of subagents (PO, architect, tester, developer, reviewer), framed by user stories, a DoR/DoD and TDD. ».
  - Nouveau `it` : `squash(text)` ne contient ni « Master's in IT & Information Systems · 2025 », ni « Full-time / freelance », ni « Pivoted to personal care services, with a demo booked and a client signed through outbound. ».
  - La nouvelle phrase « Master's… » est contenue dans l'ancienne : seul le test d'absence prouve le retrait de « · 2025 ».
  - Aucune des nouvelles phrases ne contient la ligature fi ou fl (vérifié).
- **CA3 → unitaire (describe CA6 FR).**
  - `phrasesFr` :
    - l. 171 devient « Master Bac+5 · Expert en informatique et SI » ;
    - l. 173 « CDI / freelance » est retirée ;
    - l. 178 est remplacée par la nouvelle phrase de prospection ;
    - on ajoute la phrase « Développement assisté… ».
  - Nouveau `it` : le texte ne contient ni « Master Bac+5 · Expert en informatique et SI · 2025 », ni « CDI / freelance », ni « Prospection en cold call : pas de traction dans le BTP malgré l'appel direct. ».
- **CA4 → tests existants, inchangés.** `cv.test.ts` CA5 et CA18 (l. 32-101) et `server.spec.ts` CA4 (octets identiques à ceux de `public/`).
- **CA5 → tests existants, inchangés.** `cv.spec.ts` CA1 et CA3 (l. 71-79 et 109-115 : exactement deux `.pdf`, aucun `cv-romain-caille`).
- **CA6 → e2e (`hero.spec.ts`).**
  - Le test des l. 101-106 attend désormais six libellés : status, location, experience, education, english, resume. Son titre change aussi. `toHaveText` sur un tableau échoue s'il reste un 7e `dt` : le test prouve l'absence de `contract` et l'ordre des lignes.
  - La l. 111 est supprimée. Les l. 110 et 112-117 couvrent « mêmes textes ».
- **CA7 → e2e, par l'oracle.** `design.ts` l. 74, puis `sections.spec.ts` CA18 (`expectDisclosure`, `support.ts` l. 497-530 : texte caché, puis visible au clic, à Entrée et à Espace) et `motion.spec.ts` CA27 (sans JavaScript).
- **CA8 → e2e, par l'oracle.** `design.ts` l. 75, puis `sections.spec.ts` CA19 (l. 389-418) et `motion.spec.ts` l. 86.
- **CA9 → e2e.**
  - Présence : `pages.spec.ts` CA2 (l. 90-121), sur le fichier, la réponse du serveur et le rendu sans JavaScript, via `designTexts()`.
  - Absence, nouveau test dans le `describe` CA2 : `dist/client/index.html` et la réponse de `request.get('/')` ne contiennent ni « Full-time / freelance » ni « signed through outbound ». On vérifie le HTML brut et sa version `htmlToText`.
  - La comparaison est sensible à la casse et porte sur ces littéraux exacts. La meta description contient « full-time or freelance » (voir Décisions).
- **CA10 → tests existants.** L'oracle ne change pas hors `learned` et `result` de Spotime : `pages.spec.ts` CA2, `sections.spec.ts` CA16 à CA19 et CA25, `ecarts.spec.ts` E1, `terminal.spec.ts`, et `hero.spec.ts` CA10 pour les autres lignes.
- **CA11 → manuel.** `pnpm build && pnpm lhci` en local, avec un seuil de 95 sur les quatre catégories.
- **Rouge attendu avant l'implémentation.**
  - `cv.test.ts` CA6, EN et FR (les quatre `it`).
  - `hero.spec.ts`, test des libellés.
  - `pages.spec.ts` CA2, plus le nouveau test.
  - `sections.spec.ts` CA18 et CA19 pour Spotime.
  - `motion.spec.ts` CA27 et le test qui inclut la l. 86, pour Spotime.
  - Les e2e passent au vert après les tâches 1 et 2. Les tests unitaires des CV restent rouges jusqu'à `pnpm cv` (tâche 3), qui demande le réseau.
- **Tests existants à adapter** (la décision datée existe déjà dans la spec) :
  - `tests/e2e/hero.spec.ts` l. 101-106 et l. 111 ;
  - `tests/design.ts` l. 3 et 74-75 ;
  - `tests/unit/cv.test.ts` l. 123, 129, 134-135, 171, 173 et 178.

### Décisions à valider
Tranchées par Romain le 2026-10-04 (voir « Décisions »).
- **Meta description et `og:description`** (`src/routes/index.tsx` l. 7-8, testées dans `seo.spec.ts` l. 17-18) : option B retenue, « full-time or freelance » est retiré. CA12 est ajouté.
  - Tâche 2 bis (dev) : dans `src/routes/index.tsx`, `DESCRIPTION` devient « Fullstack developer, ready for the agentic era. Open to work, remote or relocation from Nantes, France. ». `og.png` n'est pas concerné (`scripts/og.html` ne contient pas ce texte).
  - Test (tester) : `tests/e2e/seo.spec.ts` l. 17-18, `HOME_DESCRIPTION` prend la nouvelle valeur. Le test d'absence de CA9 (`pages.spec.ts`) vérifie aussi que le HTML prérendu ne contient plus « full-time or freelance ».
- **CA2 et CA3** : le retrait de « · 2025 » est vérifié par l'absence de la ligne complète (« Master's in IT & Information Systems · 2025 », et son équivalent en français), pas de « 2025 » seul.

### Risques
- **Coupe silencieuse en bas de page.** À l'impression, `doc-page.js` (l. 275-278) fixe la page au format A4 avec `overflow: hidden !important`. Un débordement est donc coupé sans prévenir, et le PDF garde une seule page : les tests CA5 restent verts. À la livraison précédente, la marge basse du CV FR était déjà tombée à 5 ou 6 mm avec Instrument Sans. Le nouveau CV FR a une marge basse de 7 mm (l. 22) et une puce de prospection plus longue.
  - Les tests de phrases ne détectent la coupe que si les dernières lignes ne sont plus du tout écrites dans le PDF.
  - Contrôle manuel dans Aperçu : la dernière ligne (stack de Fraud Engine) est entière.
  - Si elle est coupée, le problème remonte à Romain (design) : le script est hors scope.
- **Réseau.** `pnpm cv` dépend d'unpkg et de Google Fonts. Une nouvelle version d'Instrument Sans servie par Google peut changer les retours à la ligne. Une coupure réseau fait échouer le script bruyamment, et aucun fichier n'est écrit.
- **Version du dossier de design.** J'ai vérifié le contenu (textes des CA présents à la lettre), mais pas l'horodatage de 16 h 37 : je n'avais pas de shell. Le dev le vérifie avant `pnpm cv`.
- **Poids du dépôt.** Chaque régénération ajoute environ 350 Ko de PDF à l'historique git.

## Décisions
- 2026-10-04 — Les textes du site sont alignés sur les nouveaux CV : retrait de « Full-time / freelance » du hero, et Spotime en « inbound » dans « what broke / learned » et le résultat (validée par Romain)
- 2026-10-04 — Spec validée (gate 1) (validée par Romain)
- 2026-10-04 — Tests existants adaptés aux nouveaux textes : phrases des CV dans `tests/unit/cv.test.ts`, textes de Spotime dans `tests/design.ts`, ligne `contract` du hero (validée par Romain)
- 2026-10-04 — Plan technique validé (gate 2) (validée par Romain) :
  - meta description et `og:description` : « full-time or freelance » est retiré (option B), CA12 est ajouté, et `tests/e2e/seo.spec.ts` (CA2 du socle) est adapté ;
  - retrait de « · 2025 » vérifié par l'absence de la ligne complète du diplôme.
