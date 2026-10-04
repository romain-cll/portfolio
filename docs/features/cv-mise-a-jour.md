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

## Hors scope
- Modification de `scripts/cv.mjs`.
- Lien vers le CV français.
- Favicon (`favicon.svg` présent dans le dossier de design).
- Toute autre évolution de mise en page du hero que le retrait de la ligne `contract`.

## Contraintes
- Les tests existants qui portent sur des textes modifiés sont adaptés, chacun avec une décision datée :
  - phrases des CV dans `tests/unit/cv.test.ts` (CA6 de `portfolio-cv`), recopiées à la lettre du nouveau design, sans ligature fi/fl ;
  - textes de Spotime dans l'oracle `tests/design.ts` ;
  - ligne `contract` du hero, partout où un test l'attend.
- `pnpm cv` a besoin du réseau (Google Fonts, unpkg).
- Aucune nouvelle dépendance.
- Langue du site : anglais.

## Plan technique

## Décisions
- 2026-10-04 — Les textes du site sont alignés sur les nouveaux CV : retrait de « Full-time / freelance » du hero, et Spotime en « inbound » dans « what broke / learned » et le résultat (validée par Romain)
- 2026-10-04 — Spec validée (gate 1) (validée par Romain)
- 2026-10-04 — Tests existants adaptés aux nouveaux textes : phrases des CV dans `tests/unit/cv.test.ts`, textes de Spotime dans `tests/design.ts`, ligne `contract` du hero (validée par Romain)
