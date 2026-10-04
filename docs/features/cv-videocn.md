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
- Les tests existants qui portent sur Fraud Engine dans les CV sont adaptés, avec une décision datée. Repérés dans `tests/unit/cv.test.ts` : la liste des liens de CA5 (l. 68), les textes de CA6 (l. 144, 146, 201 et 203), et la liste `REPOS` du bloc `liens-github` (l. 371). Les tests du site sur Fraud Engine ne changent pas.
- Les phrases vérifiées dans les PDF évitent les ligatures fi, fl et ff : les CA ci-dessus ont été choisis ainsi.
- `pnpm cv` a besoin du réseau (React via unpkg, polices Google Fonts).
- Aucune nouvelle dépendance.

## Plan technique
*À compléter par l'architect.*

## Décisions
- 2026-10-05 — Seuls les CV changent : le site garde sa section Fraud Engine, sa maquette n'ayant pas changé (validée par Romain).
- 2026-10-05 — Dans les CV, le seul changement est le remplacement du bloc Fraud Engine par videoCn (validée par Romain).
