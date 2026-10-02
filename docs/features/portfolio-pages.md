# Portfolio — pages

## User story
En tant que recruteur ou client qui visite romain-caille.fr, je veux parcourir au scroll les projets de Romain, présentés comme des événements qui traversent un pipeline (ingest, build, deploy), puis le contacter, afin de juger en quelques minutes de sa façon de travailler et de le joindre sans effort.

## Critères d'acceptation

*Le design de référence fait foi pour les textes (à la lettre), l'ordre, les couleurs, les tailles et les mouvements. Les CA en fixent les points vérifiables. Les seuils de défilement exacts sont ceux du script du design (méthodes `measure` et `renderVals`, constantes `PROJECTS`, `LOG` et `annTexts`). « Socle » renvoie à `docs/features/portfolio-socle.md`.*

### Structure et contenu
- [ ] CA1 — Étant donné `/`, quand je la charge, alors elle contient, dans cet ordre, le hero du socle, la section overview, les sections Spotime, Fraud Engine et Event Hub, puis la section contact. Chaque section hors hero a un titre `h2`, et la page garde un seul `h1`.
- [ ] CA2 — Étant donné le HTML de `/` reçu avec JavaScript désactivé, quand je le lis, alors il contient tous les textes du design :
  - overview : `// 01 · how to read this site`, le titre et les trois annotations ingest, build et deploy ;
  - chaque projet : la ligne `event <nom> →`, le nom, problem, decision, trade-off, what broke / learned, la stack, l'URL de la fenêtre, `deploy ✓`, le result et les liens ;
  - contact : `// 3 events · 1 sink`, le titre, l'adresse e-mail, les liens et la mention GitLab.

### Pipeline et navigation
- [ ] CA3 — Étant donné une fenêtre d'au moins 900 px de large, quand je fais défiler toute la page, alors un bandeau reste fixé en haut, avec :
  - à gauche, `romain@portfolio`, `pipeline · <phase>` et l'étape en cours ;
  - au centre, les étapes INGEST, BUILD et DEPLOY reliées par une ligne ;
  - à droite, les liens spotime, fraud-engine, event-hub et contact.
- [ ] CA4 — Étant donné une fenêtre de moins de 900 px de large, quand j'ouvre `/`, alors le pipeline devient un rail vertical fixé à gauche, aux étapes empilées. À partir de 700 px, le rail affiche aussi `romain@portfolio`, la phase, l'étape et les liens. En dessous de 700 px, il ne garde que les étapes.
- [ ] CA5 — Étant donné le pipeline, quand la section active est le hero, l'overview, Spotime, Fraud Engine, Event Hub ou contact, alors la phase affichée vaut respectivement `idle`, `overview`, `spotime`, `fraud.engine`, `event.hub` et `done`. Pendant un projet, l'étape affichée passe de `ingest` à `build` puis à `deploy` au fil du défilement de la section.
- [ ] CA6 — Étant donné l'overview ou un projet en section active, quand je la fais défiler du début à la fin, alors :
  - un point, le paquet, parcourt la ligne du pipeline de gauche à droite, ou de haut en bas sur le rail ;
  - le cadre de chaque étape se remplit à son passage ;
  - une étape remplie prend la couleur de la section : texte secondaire pendant l'overview, accent du projet pendant un projet.

  Quand je remonte, le paquet et le remplissage reculent.
- [ ] CA7 — Étant donné un libellé de phase ou d'étape, quand il change, alors l'ancien sort et le nouveau entre lettre par lettre en défilant verticalement, vers le haut quand je descends la page et vers le bas quand je la remonte.
- [ ] CA8 — Étant donné le paquet au repos à l'entrée du pipeline, après un premier défilement du hero ou au tout début de l'overview ou d'un projet, quand je regarde le pipeline, alors le paquet pulse.
- [ ] CA9 — Étant donné les liens de navigation, quand je les inspecte, alors ce sont des liens `<a>` vers `#spotime`, `#fraud-engine`, `#event-hub` et `#contact`. Le lien de la section active est coloré et souligné de son accent : accent du projet, ou texte principal pour contact. Les autres sont en texte atténué.
- [ ] CA10 — Étant donné la page chargée, quand je clique sur un lien de navigation, alors la page défile en douceur jusqu'à la section, l'URL prend l'ancre correspondante, le titre de la section est visible à l'arrivée et son lien devient actif.
- [ ] CA11 — Étant donné l'URL `/#fraud-engine`, ou une autre ancre de la navigation, ouverte directement, quand la page a fini de charger, alors la section visée est à l'écran, son titre est visible et son lien est actif.

### Terminal events.log
- [ ] CA12 — Étant donné `/`, quelle que soit la largeur, quand je fais défiler la page, alors une barre reste fixée en bas de l'écran, sur la surface profonde. Elle affiche `events.log · <n>`, où n est le nombre de lignes émises, la dernière ligne émise avec son horodatage, et un curseur qui clignote.
- [ ] CA13 — Étant donné le défilement de la page, quand j'atteins chaque seuil du tableau `LOG` du design, alors sa ligne est émise, de `> emit romain.init` au début du défilement du hero jusqu'à `> emit lets.talk → r.caille@icloud.com` à la fin du contact. Les lignes d'un projet sont dans son accent, et les horodatages sont ceux du design. Quand je remonte, les lignes situées au-delà de ma position disparaissent.
- [ ] CA14 — Étant donné la barre du terminal, quand j'active son bouton chevron à la souris ou au clavier, alors un panneau s'ouvre au-dessus avec la mention `events.log · history · scroll the page to emit more` et tout l'historique émis, défilé jusqu'à la dernière ligne. Le bouton porte `aria-expanded` à jour et le libellé accessible `open event log` ou `close event log`. Échap ou un nouvel appui referment le panneau.

### Hero et overview
- [ ] CA15 — Étant donné une fenêtre d'au moins 640 px de haut, quand j'ouvre `/`, alors l'indication `scroll ↓ to emit romain.init` s'affiche sous la liste du hero. Elle disparaît en fondu dès que j'ai défilé de plus de 20 px et ne revient pas. Sous 640 px de haut, elle n'apparaît pas. Le contenu du hero décrit par CA10 du socle ne change pas.
- [ ] CA16 — Étant donné l'overview, quand je la fais défiler, alors `// 01 · how to read this site` et le titre « Each project is an event. It goes through three stages. » restent à l'écran, et les annotations ingest, build et deploy apparaissent l'une après l'autre, en fondu et en montée.

### Projets
- [ ] CA17 — Étant donné un projet, quand je fais défiler sa section depuis le début, alors son contenu reste fixé à l'écran pendant que ses éléments apparaissent dans l'ordre du design :
  1. la ligne `event <nom> → <étape>`, avec une pastille à l'accent du projet et une étape qui roule comme en CA7 ;
  2. le titre ;
  3. problem ;
  4. decision et le bouton des trade-offs ;
  5. la stack, étiquette par étiquette ;
  6. la fenêtre de déploiement.
- [ ] CA18 — Étant donné un projet, quand j'active le bouton `+ trade-offs & what broke`, alors trade-off et what broke / learned s'affichent et le bouton devient `− collapse`. Un nouvel appui les masque. Le bouton expose son état à l'accessibilité. Sans JavaScript, ce dépliage fonctionne aussi.
- [ ] CA19 — Étant donné la fenêtre de déploiement d'un projet, quand je l'inspecte, alors elle montre :
  - une barre de navigateur avec trois pastilles et l'URL du design (`spotime.fr`, `grafana · scorer-group lag`, `gitlab.com/romain.caille/event-hub`) ;
  - le média ;
  - `deploy ✓` à l'accent du projet, puis le result ;
  - les liens, chacun suivi de l'icône Carbon flèche en haut à droite : `visit spotime.fr` vers https://spotime.fr, `repo` vers https://gitlab.com/romain.caille/fraud-engine-event-driven, `repo` vers https://gitlab.com/romain.caille/event-hub.
- [ ] CA20 — Étant donné le carrousel de Spotime (2 captures) ou d'Event Hub (5 captures), quand j'active `next screenshot` ou `previous screenshot`, alors la capture suivante ou précédente apparaît en fondu, le carrousel boucle aux extrémités et le compteur `i / n` se met à jour. Chaque capture a le texte alternatif `<Projet> — screenshot`.
- [ ] CA21 — Étant donné la carte Fraud Engine, quand elle n'est pas encore à l'écran, alors son poster s'affiche et aucun octet de la vidéo n'est téléchargé. Quand au moins 35 % du lecteur est visible, la vidéo se charge et se lit en boucle, sans le son. Quand le lecteur sort de l'écran, la vidéo se met en pause. Si je l'ai mise en pause moi-même, elle ne reprend pas seule.
- [ ] CA22 — Étant donné le lecteur vidéo, quand j'utilise ses contrôles, alors :
  - le bouton `play / pause` bascule la lecture et son icône ;
  - un clic ou un glissé sur la barre de progression déplace la lecture à la position pointée ;
  - le temps `m:ss / m:ss` se met à jour ;
  - le bouton `fullscreen` passe la vidéo en plein écran natif, avec les contrôles du navigateur.

  La légende `2 generators · 1 → 3 scorers` reste affichée sur l'image.

### Contact
- [ ] CA23 — Étant donné la section contact, quand je la fais défiler, alors trois points aux accents de Spotime, Fraud Engine et Event Hub convergent en un seul. Ce point recule, part en parabole et atterrit à droite du titre « This is what I do. Let's talk. », où il grandit en portrait rond de Romain, avec le texte alternatif « Portrait of Romain Caillé ». Quand je remonte, l'animation se joue à l'envers.
- [ ] CA24 — Étant donné le bouton `r.caille@icloud.com`, quand je l'active, alors l'adresse est copiée dans le presse-papiers, et la coche et la mention `copied` s'affichent environ 1,8 s avant le retour de l'icône de copie. Le libellé accessible du bouton est `copy email address`.
- [ ] CA25 — Étant donné la section contact, quand je l'inspecte, alors elle affiche `// 3 events · 1 sink`, le titre, le bouton e-mail, les liens `gitlab` vers https://gitlab.com/romain.caille, `linkedin` vers https://www.linkedin.com/in/romain-caill%C3%A9/ et `resume.pdf` vers `/cv.pdf`, chacun suivi de l'icône Carbon flèche, puis la mention « Most of my GitLab work is in private repositories. ».

### Mouvement réduit et sans JavaScript
- [ ] CA26 — Étant donné un navigateur qui demande de réduire les animations, quand je fais défiler toute la page puis ouvre le terminal, alors :
  - aucune animation ni transition ne tourne une fois le défilement arrêté (`document.getAnimations()` est vide) ;
  - chaque section affiche son contenu en état final dès qu'elle arrive à l'écran ;
  - les libellés changent sans rouler, le paquet ne pulse pas et le curseur ne clignote pas ;
  - la vidéo ne démarre pas seule ;
  - les liens de navigation font défiler la page sans douceur.

  Ce CA remplace la clause « sans animation » de CA10 du socle.
- [ ] CA27 — Étant donné JavaScript désactivé, quand j'ouvre `/` et fais défiler la page, alors chaque section affiche en état final tous ses textes, sa stack, sa fenêtre de déploiement (première capture ou poster vidéo) et ses liens. Aucun n'est masqué par une opacité nulle ou un décalage. Les liens de navigation mènent à leur section.

### Responsive et accessibilité
- [ ] CA28 — Étant donné une fenêtre de 320 px de large, quand je fais défiler toute la page, alors aucun défilement horizontal n'apparaît, aucun contenu n'est coupé ni ne déborde sur les côtés, et rien n'est masqué en permanence par le rail ou par le terminal. Ce CA étend CA11 du socle à toute la page.
- [ ] CA29 — Étant donné le clavier seul, quand je parcours la page avec Tab, alors chaque contrôle reçoit le focus avec un indicateur visible et s'active avec Entrée ou Espace. Cela vaut pour les liens de navigation, le bouton du terminal, les boutons des trade-offs, les flèches des carrousels, les contrôles vidéo, le bouton e-mail et les liens. Un contrôle qui a le focus est toujours visible à l'écran, jamais à opacité nulle.

### Performance et médias
- [ ] CA30 — Étant donné le build de production, quand je lance `pnpm lhci` en local, alors les scores Performance, Accessibilité, Bonnes pratiques et SEO restent tous d'au moins 95, comme l'exige CA20 du socle.
- [ ] CA31 — Étant donné la vidéo Fraud Engine livrée, quand je l'inspecte, alors elle provient de `Fraud Engine demo.mp4` (montage complet, 90 s), pèse au plus 3 Mo, ne dépasse pas 720p, et se lit dans Chrome, Firefox et Safari, sur macOS et sur iOS. La lecture sur Safari iOS se vérifie à la main.
- [ ] CA32 — Étant donné le serveur de prod lancé en local, quand je demande la vidéo avec un en-tête `Range`, alors il répond 206 avec la plage demandée.
- [ ] CA33 — Étant donné le build, quand je liste les captures des projets et le poster de la vidéo, alors ils sont tous en WebP.

## Hors scope
- Le fichier `cv.pdf` et le favicon : Romain les fournira plus tard (décisions du socle inchangées).
- Pages dédiées à chaque projet, ou toute autre route que `/`.
- Les médias de `uploads/` que le design n'utilise pas : l'enregistrement d'écran du 2026-09-28, `fraud_engine_edited.mp4`, les `draw-*.png` et `pasted-1788789676407-0.png`.
- Le repli « blob » du script du design pour les serveurs qui ignorent les requêtes `Range` : le serveur doit les gérer (CA32).
- Formulaire de contact et lien `mailto:`.
- Sous-titres de la vidéo : c'est une démo muette.
- Modifications des métadonnées SEO, de l'image Open Graph, du sitemap et du JSON-LD.
- Mode clair, multilingue, analytics, CMS : inchangé par rapport au socle.

## Contraintes
- Design de référence : `/Users/romain/Downloads/Portfolio Event-Driven/Portfolio Event-Driven.dc.html`, hors du dépôt, avec ses médias dans `uploads/`. `support.js` est le moteur d'exécution de Claude Design et ne se reproduit pas. Les variantes du design (`horizontal`, `vertical`, `railLabels`) dépendent uniquement de la largeur de la fenêtre (900 px et 700 px).
- Hero : il passe au défilement du design (section de 130vh au contenu fixé, bandeau fixe en haut au-dessus de 900 px). Cela remplace la décision du socle « hero statique d'un écran (`min-h-dvh`) ». Son contenu (CA10 du socle) ne change pas.
- Tests du socle : le test e2e `CA10 — aucune animation` (`tests/e2e/hero.spec.ts`) est remplacé par CA26. Tous les autres tests du socle restent verts sans modification, sauf si l'architect démontre qu'un changement de mise en page l'impose.
- Règles du design system (`AGENTS.md`), toutes bloquantes : `style` réservé aux variables CSS, donc toutes les valeurs pilotées par le défilement passent par des variables CSS ; aucune couleur littérale hors de `styles.css` ; aucune valeur arbitraire, une valeur manquante devient un token ; icônes `@carbon/icons-react` uniquement, y compris pour les icônes que le design dessine en SVG ou en CSS (flèche, lecture, pause, plein écran, copie, coche, chevron) quand un équivalent Carbon existe.
- Couleurs : les tokens du socle couvrent déjà les accents des projets, la surface profonde, les voiles et le fond des captures. Le texte discret du design (`#525b66` : horodatages, étapes inactives, mention GitLab) utilise le token éclairci du socle (CA9 du socle).
- Prérendu : `/` reste prérendue, et son HTML contient tout le contenu (CA1 et CA2).
- Médias : copiés depuis `uploads/`. Captures et poster convertis en WebP et chargés en différé. Vidéo recompressée depuis `Fraud Engine demo.mp4`, sans chargement avant d'arriver à l'écran (CA21). La conversion se fait une fois, et le résultat est versionné.
- Hébergement (`AGENTS.md`) : srvx 1.0.5 en version exacte, script `start` porteur, ni `Staticfile` ni `Caddyfile`. Les requêtes `Range` (CA32) doivent être vérifiées contre le code de srvx 1.0.5, pas contre la documentation de la dernière version.
- Dépendances : aucune nouvelle dépendance sans validation de Romain. Une dépendance proposée par l'architect passe par la gate du plan.
- Performance : Lighthouse mobile d'au moins 95 sur les 4 catégories (CA20 du socle), vérifié en local avec `pnpm lhci`, sans pipeline.
- Langue du site : anglais.

## Plan technique
*À compléter par l'architect.*

## Décisions
- 2026-10-02 — Les animations du design font partie de cette feature (validée par Romain)
- 2026-10-02 — Navigation par liens d'ancre (`#spotime`, `#fraud-engine`, `#event-hub`, `#contact`) au lieu des boutons du design (validée par Romain)
- 2026-10-02 — Sans JavaScript et en mouvement réduit, tout le contenu s'affiche en état final (validée par Romain)
- 2026-10-02 — Vidéo Fraud Engine : `Fraud Engine demo.mp4`, le montage final, recompressée (validée par Romain)
- 2026-10-02 — Spec validée (gate 1), avec ces points (validée par Romain) :
  - vidéo de 3 Mo au plus ;
  - en mouvement réduit, la vidéo ne démarre pas seule ;
  - le hero passe au défilement du design (130vh, contenu fixé), ce qui remplace la décision du socle « hero statique d'un écran » ;
  - le test du socle `CA10 — aucune animation` est remplacé par CA26 ;
  - icônes Carbon à la place des icônes dessinées par le design, quand un équivalent existe.
