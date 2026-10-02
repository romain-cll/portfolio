# Portfolio — pages

## User story
En tant que recruteur ou client qui visite romain-caille.fr, je veux parcourir au scroll les projets de Romain, présentés comme des événements qui traversent un pipeline (ingest, build, deploy), puis le contacter, afin de juger en quelques minutes de sa façon de travailler et de le joindre sans effort.

## Critères d'acceptation

*Le design de référence fait foi pour les textes (à la lettre), l'ordre, les couleurs, les tailles et les mouvements. Les CA en fixent les points vérifiables. Les seuils de défilement exacts sont ceux du script du design (méthodes `measure` et `renderVals`, constantes `PROJECTS`, `LOG` et `annTexts`). « Socle » renvoie à `docs/features/portfolio-socle.md`.*

### Structure et contenu
- [x] CA1 — Étant donné `/`, quand je la charge, alors elle contient, dans cet ordre, le hero du socle, la section overview, les sections Spotime, Fraud Engine et Event Hub, puis la section contact. Chaque section hors hero a un titre `h2`, et la page garde un seul `h1`.
- [x] CA2 — Étant donné le HTML de `/` reçu avec JavaScript désactivé, quand je le lis, alors il contient tous les textes du design :
  - overview : `// 01 · how to read this site`, le titre et les trois annotations ingest, build et deploy ;
  - chaque projet : la ligne `event <nom> →`, le nom, problem, decision, trade-off, what broke / learned, la stack, l'URL de la fenêtre, `deploy ✓`, le result et les liens ;
  - contact : `// 3 events · 1 sink`, le titre, l'adresse e-mail, les liens et la mention GitLab.

### Pipeline et navigation
- [x] CA3 — Étant donné une fenêtre d'au moins 900 px de large, quand je fais défiler toute la page, alors un bandeau reste fixé en haut, avec :
  - à gauche, `romain@portfolio`, `pipeline · <phase>` et l'étape en cours ;
  - au centre, les étapes INGEST, BUILD et DEPLOY reliées par une ligne ;
  - à droite, les liens spotime, fraud-engine, event-hub et contact.
- [x] CA4 — Étant donné une fenêtre de moins de 900 px de large, quand j'ouvre `/`, alors le pipeline devient un rail vertical fixé à gauche, aux étapes empilées. À partir de 700 px, le rail affiche aussi `romain@portfolio`, la phase, l'étape et les liens. En dessous de 700 px, il ne garde que les étapes.
- [x] CA5 — Étant donné le pipeline, quand la section active est le hero, l'overview, Spotime, Fraud Engine, Event Hub ou contact, alors la phase affichée vaut respectivement `idle`, `overview`, `spotime`, `fraud.engine`, `event.hub` et `done`. Pendant un projet, l'étape affichée passe de `ingest` à `build` puis à `deploy` au fil du défilement de la section.
- [x] CA6 — Étant donné l'overview ou un projet en section active, quand je la fais défiler du début à la fin, alors :
  - un point, le paquet, parcourt la ligne du pipeline de gauche à droite, ou de haut en bas sur le rail ;
  - le cadre de chaque étape se remplit à son passage ;
  - une étape remplie prend la couleur de la section : texte secondaire pendant l'overview, accent du projet pendant un projet.

  Quand je remonte, le paquet et le remplissage reculent.
- [x] CA7 — Étant donné un libellé de phase ou d'étape, quand il change, alors l'ancien sort et le nouveau entre lettre par lettre en défilant verticalement, vers le haut quand je descends la page et vers le bas quand je la remonte.
- [x] CA8 — Étant donné le paquet au repos à l'entrée du pipeline, après un premier défilement du hero ou au tout début de l'overview ou d'un projet, quand je regarde le pipeline, alors le paquet pulse.
- [x] CA9 — Étant donné les liens de navigation, quand je les inspecte, alors ce sont des liens `<a>` vers `#spotime`, `#fraud-engine`, `#event-hub` et `#contact`. Le lien de la section active prend la couleur de son accent : accent du projet, ou texte principal pour contact. À partir de 900 px, il est aussi souligné de cet accent. Les autres liens sont en texte atténué.
- [x] CA10 — Étant donné la page chargée, quand je clique sur un lien de navigation, alors la page défile en douceur jusqu'à la section, l'URL prend l'ancre correspondante, le titre de la section est visible à l'arrivée et son lien devient actif.
- [x] CA11 — Étant donné l'URL `/#fraud-engine`, ou une autre ancre de la navigation, ouverte directement, quand la page a fini de charger, alors la section visée est à l'écran, son titre est visible et son lien est actif.

### Terminal events.log
- [x] CA12 — Étant donné `/`, quelle que soit la largeur, quand je fais défiler la page, alors une barre reste fixée en bas de l'écran, sur la surface profonde. Elle affiche `events.log · <n>`, où n est le nombre de lignes émises, la dernière ligne émise avec son horodatage, et un curseur qui clignote.
- [x] CA13 — Étant donné le défilement de la page, quand j'atteins chaque seuil du tableau `LOG` du design, alors sa ligne est émise, de `> emit romain.init` au début du défilement du hero jusqu'à `> emit lets.talk → r.caille@icloud.com` à la fin du contact. Les lignes d'un projet sont dans son accent, et les horodatages sont ceux du design. Quand je remonte, les lignes situées au-delà de ma position disparaissent.
- [x] CA14 — Étant donné la barre du terminal, quand j'active son bouton chevron à la souris ou au clavier, alors un panneau s'ouvre au-dessus avec la mention `events.log · history · scroll the page to emit more` et tout l'historique émis, défilé jusqu'à la dernière ligne. Le bouton porte `aria-expanded` à jour et le libellé accessible `open event log` ou `close event log`. Échap ou un nouvel appui referment le panneau.

### Hero et overview
- [x] CA15 — Étant donné une fenêtre d'au moins 640 px de haut, quand j'ouvre `/`, alors l'indication `scroll ↓ to emit romain.init` s'affiche sous la liste du hero. Elle disparaît en fondu dès que j'ai défilé de plus de 20 px et ne revient pas. Sous 640 px de haut, elle n'apparaît pas. Sans JavaScript, elle reste affichée. Le contenu du hero décrit par CA10 du socle ne change pas.
- [x] CA16 — Étant donné l'overview, quand je la fais défiler, alors `// 01 · how to read this site` et le titre « Each project is an event. It goes through three stages. » restent à l'écran, et les annotations ingest, build et deploy apparaissent l'une après l'autre, en fondu et en montée.

### Projets
- [x] CA17 — Étant donné un projet, quand je fais défiler sa section depuis le début, alors son contenu reste fixé à l'écran pendant que ses éléments apparaissent dans l'ordre du design :
  1. la ligne `event <nom> → <étape>`, avec une pastille à l'accent du projet et une étape qui roule comme en CA7 ;
  2. le titre ;
  3. problem ;
  4. decision et le bouton des trade-offs ;
  5. la stack, étiquette par étiquette ;
  6. la fenêtre de déploiement.
- [x] CA18 — Étant donné un projet, quand j'active le bouton `+ trade-offs & what broke`, alors trade-off et what broke / learned s'affichent et le bouton devient `− collapse`. Un nouvel appui les masque. Le bouton expose son état à l'accessibilité. Sans JavaScript, ce dépliage fonctionne aussi.
- [x] CA19 — Étant donné la fenêtre de déploiement d'un projet, quand je l'inspecte, alors elle montre :
  - une barre de navigateur avec trois pastilles et l'URL du design (`spotime.fr`, `grafana · scorer-group lag`, `gitlab.com/romain.caille/event-hub`) ;
  - le média ;
  - `deploy ✓` à l'accent du projet, puis le result ;
  - les liens, chacun suivi de l'icône Carbon flèche en haut à droite : `visit spotime.fr` vers https://spotime.fr, `repo` vers https://gitlab.com/romain.caille/fraud-engine-event-driven, `repo` vers https://gitlab.com/romain.caille/event-hub.
- [x] CA20 — Étant donné le carrousel de Spotime (2 captures) ou d'Event Hub (5 captures), quand j'active `next screenshot` ou `previous screenshot`, alors la capture suivante ou précédente apparaît en fondu, le carrousel boucle aux extrémités et le compteur `i / n` se met à jour. Chaque capture a le texte alternatif `<Projet> — screenshot`.
- [x] CA21 — Étant donné la carte Fraud Engine, quand elle n'est pas encore à l'écran, alors son poster s'affiche et aucun octet de la vidéo n'est téléchargé. Quand au moins 35 % du lecteur est visible, la vidéo se charge et se lit en boucle, sans le son. Quand le lecteur sort de l'écran, la vidéo se met en pause. Si je l'ai mise en pause moi-même, elle ne reprend pas seule.
- [x] CA22 — Étant donné le lecteur vidéo, quand j'utilise ses contrôles, alors :
  - le bouton `play / pause` bascule la lecture et son icône ;
  - un clic ou un glissé sur la barre de progression déplace la lecture à la position pointée ;
  - le temps `m:ss / m:ss` se met à jour ;
  - le bouton `fullscreen` passe la vidéo en plein écran natif, avec les contrôles du navigateur.

  La légende `2 generators · 1 → 3 scorers` reste affichée sur l'image.

### Contact
- [x] CA23 — Étant donné la section contact, quand je la fais défiler, alors trois points aux accents de Spotime, Fraud Engine et Event Hub convergent en un seul. Ce point recule, part en parabole et atterrit à droite du titre « This is what I do. Let's talk. », où il grandit en portrait rond et en couleur de Romain, avec le texte alternatif « Portrait of Romain Caillé ». Quand je remonte, l'animation se joue à l'envers.
- [x] CA24 — Étant donné le bouton `r.caille@icloud.com`, quand je l'active, alors l'adresse est copiée dans le presse-papiers, et la coche et la mention `copied` s'affichent environ 1,8 s avant le retour de l'icône de copie. Le libellé accessible du bouton est `copy email address r.caille@icloud.com`.
- [x] CA25 — Étant donné la section contact, quand je l'inspecte, alors elle affiche `// 3 events · 1 sink`, le titre, le bouton e-mail, les liens `gitlab` vers https://gitlab.com/romain.caille, `linkedin` vers https://www.linkedin.com/in/romain-caill%C3%A9/ et `resume.pdf` vers `/cv.pdf`, chacun suivi de l'icône Carbon flèche, puis la mention « Most of my GitLab work is in private repositories. ».

### Mouvement réduit et sans JavaScript
- [x] CA26 — Étant donné un navigateur qui demande de réduire les animations, quand je fais défiler toute la page puis ouvre le terminal, alors :
  - aucune animation ni transition ne tourne une fois le défilement arrêté (`document.getAnimations()` est vide) ;
  - le contenu de chaque section est toujours en état final, tandis que le pipeline et le terminal suivent les seuils de défilement du design ;
  - les libellés changent sans rouler, le paquet ne pulse pas et le curseur ne clignote pas ;
  - la vidéo ne démarre pas seule ;
  - les liens de navigation font défiler la page sans douceur.

  Ce CA remplace la clause « sans animation » de CA10 du socle.
- [x] CA27 — Étant donné JavaScript désactivé, quand j'ouvre `/` et fais défiler la page, alors chaque section affiche en état final tous ses textes, sa stack, sa fenêtre de déploiement (première capture ou poster vidéo) et ses liens. Aucun n'est masqué par une opacité nulle ou un décalage. La ligne `event <nom> →` de chaque projet affiche l'étape `deploy`. Les liens de navigation mènent à leur section.

### Responsive et accessibilité
- [x] CA28 — Étant donné une fenêtre de 320 px de large, quand je fais défiler toute la page, alors aucun défilement horizontal n'apparaît, aucun contenu n'est coupé ni ne déborde sur les côtés, et rien n'est masqué en permanence par le rail ou par le terminal. Ce CA étend CA11 du socle à toute la page.
- [x] CA29 — Étant donné le clavier seul, quand je parcours la page avec Tab, alors chaque contrôle reçoit le focus avec un indicateur visible et s'active au clavier : les liens avec Entrée, les boutons et le dépliage avec Entrée ou Espace, la barre de progression vidéo avec les flèches. Cela vaut pour les liens de navigation, le bouton du terminal, les boutons des trade-offs, les flèches des carrousels, les contrôles vidéo, le bouton e-mail et les liens. Un contrôle qui a le focus est toujours visible à l'écran, jamais à opacité nulle.

### Performance et médias
- [x] CA30 — Étant donné le build de production, quand je lance `pnpm lhci` en local, alors les scores Performance, Accessibilité, Bonnes pratiques et SEO restent tous d'au moins 95, comme l'exige CA20 du socle.
- [x] CA31 — Étant donné la vidéo Fraud Engine livrée, quand je l'inspecte, alors elle provient de `Fraud Engine demo.mp4` (montage complet, 90 s), pèse au plus 3 000 000 octets, ne dépasse pas 720p, et se lit dans Chrome, Firefox et Safari, sur macOS et sur iOS. La lecture sur Safari iOS se vérifie à la main. *Vérifié : 2 768 599 o, H.264 High 1280 × 720, `moov` en tête, sans audio, 90,7 s. Lecture validée à la main par Romain dans Chrome, Firefox, Safari macOS et Safari iOS.*
- [x] CA32 — Étant donné le serveur de prod lancé en local, quand je demande la vidéo avec un en-tête `Range`, alors il répond 206 avec la plage demandée.
- [x] CA33 — Étant donné le build, quand je liste les captures des projets et le poster de la vidéo, alors ils sont tous en WebP.

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
### Approche
- **Rendu.** `/` reste prérendue et contient tout le contenu. Chaque section reprend la structure du design : une section haute, un contenu `sticky` et, pour les projets, un espaceur de 100vh. Un seul markup sert au bandeau (≥ 900 px) et au rail (< 900 px, libellés à partir de 700 px). La bascule passe par des breakpoints déclarés en tokens, sans détecter la largeur en JS, donc sans décalage à l'hydratation. Aucune nouvelle dépendance.
- **Pilotage des animations.** Un seul contrôleur de défilement (`requestAnimationFrame`, dans `home.tsx`) applique les formules du design (`measure`, `renderVals`), isolées en fonctions pures dans `src/lib/pipeline.ts`.
  - Les valeurs continues deviennent des variables CSS, écrites uniquement par `element.style.setProperty('--…')`. Les utilitaires de `styles.css` les lisent en `opacity`, `translate` ou `scale`, jamais en `width` ou `left` : pas de décalage de mise en page.
  - Les valeurs discrètes (section active, étape, nombre de lignes, libellés) vont dans l'état React, mis à jour seulement quand elles changent.
- **État final par défaut.** Chaque variable a l'état final comme valeur de repli (`var(--p, 1)`).
  - Le HTML prérendu et le rendu sans JS (CA27) montrent donc tout le contenu.
  - Le mouvement réduit (CA26) force l'état final dans les mêmes utilitaires, via `@media (prefers-reduced-motion: reduce)`.
  - À l'hydratation, seules les sections sous la ligne de flottaison passent à leur état initial, en opacité et en transform : rien de visible ne bouge et il n'y a pas de CLS.
  - La navigation repose sur des ancres natives, avec `scroll-behavior: smooth` seulement si aucun mouvement réduit n'est demandé.

### Fichiers
- créé : `src/lib/pipeline.ts` — logique pure reprise du script du design : `LOG`, seuils, horodatages, section active, progression, paquet et remplissages, étape des projets, trajectoire du contact. Aucun import, donc testable avec `node --test`.
- créé : `src/lib/content.ts` — textes du design à la lettre :
  - `PROJECTS` : nom, `ev`, ancre, accent, URL, problem, decision, trade-off, learned, result, stack, médias, liens ;
  - `ANNOTATIONS`.
- créé : `src/components/home.tsx` — composant de la route : bandeau, terminal, `<main>`, sections et contrôleur de défilement.
- créé : `src/components/pipeline.tsx` — bandeau et rail, navigation (CA3 à CA10).
- créé : `src/components/roll-label.tsx` — libellé qui roule lettre par lettre (CA7, CA17).
- créé : `src/components/terminal.tsx` — CA12 à CA14.
- créé : `src/components/overview.tsx` — CA16.
- créé : `src/components/project.tsx` — section projet, dépliage, fenêtre de déploiement (CA17 à CA19).
- créé : `src/components/carousel.tsx` — CA20.
- créé : `src/components/video-player.tsx` — CA21, CA22.
- créé : `src/components/contact.tsx` — CA23 à CA25.
- modifié : `src/components/hero.tsx` :
  - `<section>` de 130vh au contenu `sticky` ;
  - ajout de l'indication `scroll ↓` ;
  - `<main>` déplacé dans `home.tsx` ;
  - contenu et classes du socle inchangés.
- modifié : `src/routes/index.tsx` — `component: Home`. `head()` inchangé.
- modifié : `src/styles.css` — tokens, variantes, keyframes, utilitaires, couche `base` (tâche 2).
- créés : dans `public/media/` :
  - `spotime-1.webp`, `spotime-2.webp` ;
  - `event-hub-1.webp` à `event-hub-5.webp` ;
  - `fraud-engine-poster.webp`, `fraud-engine.mp4` ;
  - `portrait-color.webp`.
- créés (tester) :
  - `tests/unit/pipeline.test.ts`, `tests/unit/media.test.ts` ;
  - `tests/e2e/pages.spec.ts`, `pipeline.spec.ts`, `terminal.spec.ts`, `sections.spec.ts`, `video.spec.ts`, `motion.spec.ts`, `responsive.spec.ts` (découpage indicatif).
- modifiés (tester) :
  - `tests/e2e/hero.spec.ts` (voir « Tests du socle impactés ») ;
  - `tests/e2e/support.ts` : ajout de helpers, ceux qui existent ne changent pas.
- inchangés, vérifiés :
  - `package.json` : aucune dépendance, aucun script ;
  - `vite.config.ts`, `lighthouserc.json`, `eslint.config.js`, `scripts/check-src.mjs`, `src/routes/__root.tsx` ;
  - `playwright.config.ts` : son `baseURL` sert les nouveaux specs ;
  - `src/router.tsx` : `scrollRestoration` gère déjà le hash, voir Risques.

### Tâches (ordonnées)
1. **Médias**, convertis une seule fois. Le résultat est versionné et les commandes sont notées dans le message de commit. Couvre CA21, CA23, CA31, CA33.
   - **Captures.** `pnpm dlx sharp-cli`, comme le portrait du socle : rien n'est ajouté à `package.json`, et le profil couleur est converti en sRGB, ce que ffmpeg ne fait pas.
     - Réglages : WebP de 1040 px de large (deux fois la carte de 520 px), sans agrandissement, qualité 80.
     - Spotime : `pasted-1788789618943-0.png` donne `spotime-1.webp`, `pasted-1788789125294-0.png` donne `spotime-2.webp`.
     - Event Hub, dans l'ordre du design : `analytics.png`, `1-acquisition.png`, `2-audience-pages.png`, `3-locations.png` et `events.png` donnent `event-hub-1.webp` à `event-hub-5.webp`.
   - **Poster.** `fraud-engine-poster.jpg` devient `fraud-engine-poster.webp`, avec les mêmes réglages.
   - **Portrait du contact.** Le design l'affiche en couleur, sans le filtre du hero.
     - Source : `53820114-….PNG`, avec le recadrage du socle (carré de 0,4·w, origine x = 0,2838·w, y = 0,225·(h − 0,4·w)).
     - Sortie : `portrait-color.webp`, 192 × 192, sans passage en niveaux de gris.
   - **Vidéo.** ffmpeg en deux passes : H.264 High 4.0, `yuv420p`, sans piste audio, hauteur d'au plus 720, `+faststart` (le `moov` en tête est indispensable à la lecture progressive et aux `Range`).
     - Budget : 3 000 000 o × 8 / 90 s ≈ 266 kbit/s, soit 240 kbit/s pour la vidéo.
     ```
     SRC="$HOME/Downloads/Portfolio Event-Driven/uploads/Fraud Engine demo.mp4"
     OPTS=(-an -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset veryslow -profile:v high -level:v 4.0 -pix_fmt yuv420p -b:v 240k)
     ffmpeg -y -i "$SRC" "${OPTS[@]}" -pass 1 -passlogfile /tmp/fe -f mp4 /dev/null
     ffmpeg -y -i "$SRC" "${OPTS[@]}" -pass 2 -passlogfile /tmp/fe -movflags +faststart public/media/fraud-engine.mp4
     ffprobe -v error -show_entries stream=codec_name,profile,height:format=duration,size public/media/fraud-engine.mp4
     ```
     - Vérifier ensuite à l'œil que les chiffres Grafana restent lisibles (décision 3).
2. **`src/styles.css`.** Couvre CA3, CA4, CA7, CA8, CA12, CA15 et CA26 à CA29.
   - **Variantes.**
     - Breakpoints en tokens : `--breakpoint-labels: 43.75rem` (700 px) et `--breakpoint-bar: 56.25rem` (900 px), qui donnent les variantes `labels:` et `bar:`.
     - `@custom-variant tall (@media (min-height: 40rem))` pour l'indication du hero (CA15). C'est du CSS, pas un calcul JS de la hauteur, donc pas de décalage.
   - **Tokens** pour les valeurs du design absentes de l'échelle Tailwind :
     - titres `clamp(28px,4vw,52px)`, `clamp(34px,4.5vw,64px)` et `clamp(32px,5vw,72px)` ; textes de 10, 11, 15 et 17 px ;
     - hauteurs de section 130vh et 160vh ; bandeau 112 px ; rails 56 et 200 px ; terminal 36 px ;
     - largeurs maximales 16, 22 et 52ch ; carte 520 px ; avatar `clamp(64px,8vw,96px)` ;
     - panneau `calc(60dvh - 36px)` ; ratio `3024 / 1724` ; ancre à 50vh ;
     - ombre `0 30px 60px oklch(0 0 0 / 0.4)` ; `scroll-padding-bottom` de la hauteur du terminal.
   - **Couleur de section.**
     - `--tone` dans `:root`, qui vaut `var(--foreground-secondary)` par défaut, et `--color-tone: var(--tone)` dans `@theme inline`.
     - Les `@utility` `tone-spotime`, `tone-fraud-engine`, `tone-event-hub` et `tone-contact` (texte principal) définissent `--tone`.
     - On utilise ensuite `text-tone`, `bg-tone` et `border-tone`.
   - **Animations.** Les keyframes du design vont dans `@theme` avec leurs `--animate-*` : `blink`, `packet-pulse`, `roll-in`, `roll-out`, `roll-in-down`, `roll-out-down`, `roll-hold`. Les utilitaires `roll-*` intègrent le délai par lettre, `calc(var(--i) * 12ms)`.
   - **Utilitaires.**
     - `reveal` : `--t = clamp(0, (var(--p, 1) − var(--from)) / (var(--to) − var(--from)), 1)`, puis `opacity: var(--t)`, une translation de `(1 − t) × var(--dy)` et une transition de 0,2 s.
       - État final forcé en mouvement réduit.
       - État final forcé aussi sous `:focus-within`, pour qu'un contrôle qui a le focus ne soit jamais à opacité nulle (CA29).
     - `grid-cols-bar`, `grid-cols-project`, `grid-cols-annotations`.
     - `writing-vertical` pour les étapes du rail, `transition-height` pour le panneau, `seek` pour la piste et le curseur de l'`input range`, avec un remplissage en `--seek`.
   - **Couche `base`.**
     - `html { scroll-behavior: smooth }` uniquement sous `prefers-reduced-motion: no-preference` (CA10, CA26).
     - Sous `reduce`, `animation: none !important; transition: none !important` sur tout. Cela couvre aussi le `transition-all` du `Button` shadcn.
     - Indicateur `:focus-visible` commun, et marqueur de `summary` masqué.
3. **Logique pure, `src/lib/pipeline.ts`.** Elle reprend le design à l'identique (mêmes seuils, mêmes constantes). Couvre CA5, CA6, CA8, CA13, CA17, CA23. Les index de section vont de 0 à 5 : hero, overview, spotime, fraud-engine, event-hub, contact. Les signatures suivantes servent de contrat aux tests unitaires :
   ```ts
   export const STAGES = ['ingest', 'build', 'deploy'] as const
   export const PHASES = ['idle', 'overview', 'spotime', 'fraud.engine', 'event.hub', 'done'] as const
   export type Tone = 'event' | 'muted' | 'spotime' | 'fraud-engine' | 'event-hub'
   export const LOG: readonly { section: number; at: number; text: string; tone: Tone }[]
   export function logTimestamp(index: number): string // `00:0${⌊i/6⌋}:${(17·i) mod 60, 2 chiffres}`
   export function emittedCount(active: number, progress: number): number
   export function activeSection(tops: number[], viewportHeight: number): number
   export function sectionProgress(index: number, top: number, height: number, stickyHeight: number, viewportHeight: number, reduced: boolean): number
   export function pipelineFrame(active: number, progress: number, boxes: [number, number, number, number][] | null, reduced: boolean): {
     packet: number /* 0–100 */; packetVisible: boolean; trail: boolean; pulse: boolean
     fills: [number, number, number] /* 0–100 */; edges: { ent: number; fill: number; ext: number }[] /* 0–1 */; stage: 0 | 1 | 2
   }
   export function projectStage(project: 0 | 1 | 2, active: number, stage: 0 | 1 | 2, progress: number): 0 | 1 | 2
   export function contactFrame(progress: number, geometry: { sx: number; sy: number; ex: number; ey: number } | null): {
     converge: number; dotsVisible: boolean; x: number; y: number; visible: boolean; landed: boolean
   }
   ```
4. **Page, hero et contenu prérendu.** Couvre CA1, CA2, CA11, CA15, CA18, CA19, CA25, CA27.
   - **Page.** `home.tsx` rend `Pipeline`, `Terminal`, puis un `<main className="overflow-x-clip …">` qui contient le hero, l'overview, les 3 projets et le contact.
     - Sous 900 px, `main` a une marge gauche de 56 ou 200 px pour le rail.
     - À partir de 900 px, il a un `pt` de 112 px pour le bandeau.
   - **Hero.**
     - Section de 130vh, au contenu `sticky` : `top` de 0 ou 112 px, hauteur minimale de `100dvh − bandeau − 36 px`.
     - L'indication `scroll ↓ to emit romain.init` est en `hidden tall:flex`. Elle passe à `opacity-0` (transition de 0,3 s) dès que `scrolled` est vrai.
   - **Contrat DOM**, pour que les tests rouges soient écrits avant le code :
     - chaque section porte `data-section="hero|overview|spotime|fraud-engine|event-hub|contact"` ;
     - ancres des projets : `<span id="spotime|fraud-engine|event-hub">` en `absolute`, à 50vh du haut de la section. Le design fait défiler jusqu'à `offsetTop + 50vh`, où le titre est visible ;
     - ancre du contact : `id="contact"` sur la section ;
     - navigation : `<nav aria-label="sections">` avec des `<a href="#…">`, et `aria-current="true"` sur le lien actif ;
     - aucun `dl` hors du hero : les specs du socle visent `dl` et `dl dt` sans limiter la portée.
   - **Sans JS.**
     - Tout le contenu est en état final.
     - Les lignes `event <nom> →` sont rendues avec `deploy` (Ambiguïté 2).
     - Le dépliage est un `<details>`/`<summary>`. Son libellé bascule avec les variantes `group-open:` (`+ trade-offs & what broke` ou `− collapse`).
     - La première capture est au premier plan, et le poster est un `<img loading="lazy">` (tâche 9).
   - **Portrait du contact.**
     - Structure : `<span role="img" aria-label="Portrait of Romain Caillé">` contenant `<img alt="" src="/media/portrait-color.webp" loading="lazy">`, dans l'emplacement à droite du titre.
     - C'est la structure du design (`role="img"`). Elle ne crée pas de second `img[alt="Portrait of Romain Caillé"]` qui casserait les tests du socle.
5. **Contrôleur de défilement, dans `home.tsx`.** Couvre CA5, CA6, CA13, CA16, CA17, CA23, CA26.
   - **Écoute.** `scroll` (passif) et `resize`, regroupés par `requestAnimationFrame`, plus une mesure au `load` et à `document.fonts.ready`. `prefers-reduced-motion` est lu une fois, dans l'effet.
   - **À chaque frame.**
     - `getBoundingClientRect` des sections et de leurs contenus fixés donne la section active et la progression.
     - La plage d'un projet vaut la hauteur de la section moins celle du contenu fixé, lue sur une référence et non sur `firstElementChild`.
     - La géométrie des cadres d'étapes n'est relue qu'au `resize`. L'axe se déduit de la ligne : plus large que haute, c'est le bandeau.
   - **Écritures**, uniquement par `style.setProperty('--…')` :
     - `--p` sur l'overview, les projets et le contact ;
     - sur le pipeline : `--packet` (en %), `--trail`, `--packet-op`, et `--ent-i`, `--fill-i`, `--ext-i` de 0 à 1 ;
     - sur le contact : `--converge`, `--dots-op`, `--tv-x` et `--tv-y` (en px, par rapport à l'emplacement final), `--tv-op`, `--tv-scale`.
   - **État React**, modifié seulement si la valeur change : section active, étape, cadres remplis, pulsation, nombre de lignes, étape de chaque projet, `scrolled`, `landed`.
   - **Mouvement réduit.**
     - Progression à 0 ou 1, au seuil du design (haut de la section à moins de 60 % de la fenêtre).
     - Ni pulsation ni lecture automatique.
     - Les révélations et le contact restent en état final grâce au CSS.
6. **Pipeline et navigation.** Couvre CA3 à CA10.
   - **Markup.** Grille `grid-cols-bar` en `bar:`, colonne sous 900 px. Libellés et liens en `hidden labels:flex`. Cadres en `writing-vertical` dans le rail.
   - **Paquet.**
     - Une enveloppe pleine longueur est translatée de `--packet`, sur l'axe X en bandeau et Y en rail. Elle porte un point de 12 px en `bg-tone`, avec `motion-safe:animate-packet-pulse` quand `pulse` est vrai.
     - La traînée et les 6 segments de chaque cadre utilisent `scale` depuis leur origine.
   - **Couleurs.** `tone-*` de la section active : texte secondaire en overview, accent pendant un projet. Le texte d'une étape est en `text-tone` si elle est remplie, en `text-foreground-faint` sinon.
   - **`RollLabel`.**
     - Il garde la valeur précédente et son rang, en état dérivé des props.
     - Quand la valeur change, il rend l'ancienne (`aria-hidden`, `roll-out` ou `roll-out-down`) et la nouvelle lettre par lettre (`roll-in` ou `roll-in-down`, `--i` par lettre).
     - Le sens dépend du rang : un rang inférieur au précédent veut dire qu'on remonte.
     - Rien n'est animé au premier rendu, et le texte courant est aussi rendu en `sr-only`.
   - **Liens.** Par défaut `text-muted-foreground border-b border-transparent`. Le lien actif reçoit `tone-<lien> text-tone border-tone` et `aria-current`.
7. **Terminal.** Couvre CA12 à CA14.
   - **Barre.** Fixe en bas, `left` égal à la largeur du rail sous 900 px, en `bg-surface-deep`, 35 px de haut.
     - Elle affiche `events.log · n` puis la dernière ligne, en `whitespace-pre` et coupée par ellipse.
     - Elle se termine par le curseur, en `motion-safe:animate-blink`.
   - **Bouton.**
     - Attributs : `aria-expanded`, `aria-controls`, et `aria-label` `open event log` ou `close event log`.
     - Icône Carbon `ChevronUp`, tournée de 180° quand le panneau est ouvert.
     - Échap, écouté sur `window`, referme le panneau.
   - **Panneau.**
     - Hauteur `h-0` fermé, `h-log-panel` ouvert, avec `transition-height` ; `inert` quand il est fermé.
     - Il affiche l'en-tête du design puis toutes les lignes.
     - Il défile jusqu'en bas à l'ouverture, puis à chaque nouvelle ligne si l'utilisateur est près du bas.
   - **Couleurs.** `tone` pour les lignes de projet, `text-foreground` pour les lignes `>`, `text-muted-foreground` pour les autres. Horodatage en `text-foreground-faint`.
8. **Overview et projets.** Couvre CA16 à CA20.
   - **`reveal`**, avec les fenêtres du design :
     - annotations : de 0,08 + 0,3·i à 0,22 + 0,3·i ;
     - ligne `event` et titre : de 0 à 0,1 ;
     - problem : de 0,12 à 0,25 ;
     - decision, stack et bouton : de 0,3 à 0,45 ;
     - étiquettes : de 0,42 + 0,05·k à 0,5 + 0,05·k, avec 8 px de translation ;
     - carte : de 0,4 à 0,55, avec 40 px de translation et un `scale` de 0,96 à 1.
   - **Fenêtre de déploiement.**
     - 3 pastilles, puis l'URL, le média, `deploy ✓` en `text-tone` et le result.
     - Liens suivis de `ArrowUpRight` en `icon-inline`. Pour Spotime, `visit spotime.fr` est bordé à l'accent. Pour les deux autres projets, `repo`.
   - **Carrousel.**
     - Images empilées en `absolute inset-0 object-contain` et `loading="lazy"`. L'image courante est à opacité 1, les autres à 0, avec une transition de 0,3 s.
     - Boutons `‹` et `›` (`previous screenshot`, `next screenshot`), index modulo n, compteur `i / n`, et `alt` `<Projet> — screenshot`.
9. **Lecteur vidéo.** Couvre CA21, CA22.
   - **Rendu initial.**
     - `<video muted loop playsInline preload="none">` est rendu sans `src` ni attribut `poster`. Le poster est un `<img loading="lazy">` superposé, masqué au premier `loadeddata`.
     - Raison : l'attribut `poster` se charge toujours au chargement de la page, ce qui contredit « chargés en différé ».
   - **`IntersectionObserver`**, au seuil de 0,35 :
     - à la première entrée, il pose `src="/media/fraud-engine.mp4"` puis appelle `play()`, sauf en mouvement réduit ;
     - aux entrées suivantes, il relance la lecture si l'utilisateur n'a pas mis en pause ;
     - à la sortie, il met en pause, sauf en plein écran.
     - `muted` et `defaultMuted` sont posés en propriété, car React ne rend pas l'attribut.
   - **Contrôles.**
     - Bouton `play / pause`, avec les icônes `PlayFilledAlt` et `PauseFilled`.
     - `<input type="range" aria-label="seek">` : clic, glissé et clavier sont natifs.
     - Temps au format `m:ss / m:ss`.
     - Bouton `fullscreen`, avec l'icône `Maximize` : il passe `controls` à vrai puis appelle `requestFullscreen()`, ou `webkitEnterFullscreen()` en repli sur iOS. `fullscreenchange` repasse `controls` à faux.
     - Légende `2 generators · 1 → 3 scorers` en `bg-veil-70`.
10. **Contact.** Couvre CA23 à CA25.
    - **Points.** 3 pastilles de 14 px en `tone-*`. Translation de (i − 1) × 120 px × (1 − `--converge`), opacité `--dots-op` (0 par défaut).
    - **Portrait.**
      - Translation de `--tv-x`, `--tv-y`, et `scale` de `--tv-scale` : 14 px rapportés à la taille de l'emplacement avant l'atterrissage, puis 1, avec une transition de 0,45 s.
      - Opacité `--tv-op`. L'image apparaît en fondu à l'atterrissage, en 0,35 s après 0,1 s.
      - Valeurs par défaut : portrait posé dans son emplacement.
    - **Copie.**
      - `navigator.clipboard.writeText`, `aria-label="copy email address"`.
      - L'icône `Copy` laisse place à `Checkmark` et à la mention `copied` pendant 1 800 ms.
      - Pas de repli `execCommand` : il faudrait écrire des propriétés `style`.
    - **Liens.** `gitlab`, `linkedin` et `resume.pdf`, chacun suivi de `ArrowUpRight`. La mention GitLab est en `text-foreground-faint`.
11. **Requêtes `Range` (CA32) : aucun code à écrire.** Vérifié dans srvx 1.0.5 installé (`node_modules/.pnpm/srvx@1.0.5/node_modules/srvx/dist/`) :
    - `cli.mjs`, l. 72 : le CLI monte `staticMiddleware({ dir })` sans option ;
    - `static.mjs`, l. 63 : `ranges = options.ranges ?? true` ;
    - l. 29 et 266-268 : `.mp4` est servi en `video/mp4`, type non compressible ;
    - l. 136-139 : l'en-tête `Range: bytes=…` est lu sur les GET ;
    - l. 143 et 161 : pas de compression quand la requête porte un `Range` ;
    - l. 191 : `Accept-Ranges: bytes` ;
    - l. 221-246 : réponse 206 avec `Content-Range` et `Content-Length`, ou 416 hors du fichier ;
    - l. 289-314 : une seule plage est gérée. Plusieurs plages donnent un 200 complet, ce que la RFC 9110 permet ;
    - l. 284-288 : un `If-Range` qui porte un ETag donne aussi un 200 complet, ce qui est conforme.
12. **Vérifications locales.** Couvre CA30, CA31, CA32.
    - `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci`.
    - `pnpm start`, puis `curl -s -o /dev/null -D - -H 'Range: bytes=0-1023' http://127.0.0.1:3000/media/fraud-engine.mp4` : attendu 206 avec `Content-Range: bytes 0-1023/<taille>`.
    - Lecture de la vidéo à la main dans Chrome, Firefox, Safari macOS et Safari iOS.

### Stratégie de test
**Commandes**
- Unitaires : `pnpm test` (`node --test`). Le projet n'a pas Vitest, et on n'en ajoute pas.
- E2E : `pnpm build && pnpm test:e2e`, ou un seul fichier avec `pnpm build && pnpm test:e2e tests/e2e/pipeline.spec.ts`.
- Lighthouse : `pnpm build && pnpm lhci`.

**Conventions**
- Les nouveaux specs visent le serveur de prod lancé par Playwright (`page.goto('/')`, `baseURL` 127.0.0.1:3100). On a ainsi de vraies réponses `Range` et un contexte sécurisé pour le presse-papiers. Les specs du socle gardent leur simulation.
- Défilement : `scrollTo({ top, behavior: 'instant' })`, sinon le défilement doux du CSS s'applique, puis `expect.poll`.
- Opacité effective : produit des `opacity` de l'élément et de ses ancêtres. Playwright considère comme visible un élément à opacité nulle.
- Fenêtres : 1440×900 (bandeau), 800×900 (rail avec libellés), 600×900 (rail seul), 320×568.
- Position d'une progression p : `offsetTop + p × (hauteur − hauteur fixée)` pour un projet, `offsetTop + p × (hauteur − vh)` sinon.
- Les seuils attendus sont recopiés du design dans les tests, jamais importés de `src/`.

**Par critère**
- CA1 → e2e : ordre des `data-section`, un seul `h1`, un `h2` par section hors hero.
- CA2 → e2e sans JS, plus lecture de `dist/client/index.html` : chaque texte du design est présent, y compris trade-off et learned dans le `<details>` fermé.
- CA3 → e2e 1440×900 : bandeau en `position: fixed`, en haut à plusieurs positions de défilement. Textes de gauche, 3 étapes reliées, 4 liens.
- CA4 → e2e 800×900 et 600×900 : rail fixé à gauche, étapes empilées (même x, y croissants). Libellés et liens présents à 800 px, absents à 600 px.
- CA5 → unitaire (`PHASES`, `pipelineFrame().stage`) et e2e : phase lue dans chaque section, étape `ingest`, `build` puis `deploy` dans un projet.
- CA6 → unitaire et e2e.
  - Unitaire : `pipelineFrame` aux seuils, à l'aller et au retour.
  - E2e : x du paquet (ou y sur le rail) croissant puis décroissant en remontant. Étapes remplies en `#b8c0cc` dans l'overview, à l'accent dans un projet.
- CA7 → e2e : au changement, `getAnimations()` du libellé contient `roll-in` et `roll-out` en descendant, leurs versions `-down` en remontant.
- CA8 → unitaire (`pulse`) et e2e : animation `packet-pulse` active après un premier défilement du hero et au début de l'overview ou d'un projet, absente ailleurs.
- CA9 → e2e : `href` des 4 liens. Couleur et bordure du lien actif à l'accent (`#e6e8eb` pour contact), les autres en `#8b94a1`.
- CA10 → e2e 1440×900 : après un clic, on observe un `scrollY` intermédiaire. Puis le hash est posé, le titre est dans la fenêtre à opacité 1 et le lien porte `aria-current`.
- CA11 → e2e : `goto('/#fraud-engine')` et les 3 autres ancres, mêmes vérifications une fois le défilement stabilisé.
- CA12 → e2e 1440 et 320 : barre fixe en bas, fond `#0d0f12`, `events.log · n`, dernière ligne et son horodatage, animation `blink`.
- CA13 → unitaire et e2e.
  - Unitaire : la table `LOG` en entier (seuils, textes, tons) et `logTimestamp`.
  - E2e : première ligne au seuil du hero, dernière ligne en fin de contact, accent d'une ligne de projet, lignes qui disparaissent en remontant.
- CA14 → e2e : ouverture à la souris, avec Entrée et avec Espace. `aria-expanded`, libellés, en-tête, toutes les lignes, `scrollTop` en bas, fermeture par Échap.
- CA15 → e2e : indication visible en 1440×900, à opacité 0 après 21 px et qui ne revient pas. Non affichée en 1440×600.
- CA16 → e2e : kicker et titre dans la fenêtre pendant toute l'overview. Opacités des 3 annotations qui montent dans l'ordre.
- CA17 → e2e : à des progressions situées entre les seuils, opacités dans l'ordre (ligne, titre, problem, decision et bouton, étiquettes, fenêtre). Position du titre constante pendant la section. Étape de la ligne `event`.
- CA18 → e2e, avec et sans JS : clic, Entrée et Espace sur `summary`. Les textes s'affichent, le libellé devient `− collapse`, `details` passe `toBeExpanded`.
- CA19 → e2e : pastilles, URL, `deploy ✓` à l'accent, result, `href`, et icône Carbon (`viewBox 0 0 32 32`) après chaque lien.
- CA20 → e2e : suivante et précédente, bouclage aux extrémités, compteur, image courante à opacité 1, `alt`.
- CA21 → e2e :
  - aucune requête vers la vidéo sous 35 % de visibilité ;
  - requête et lecture au-delà ;
  - pause quand le lecteur sort de l'écran ;
  - une pause de l'utilisateur est conservée ;
  - le poster est visible avant la lecture.
- CA22 → e2e :
  - `paused` et icône qui basculent ;
  - un clic à 50 % de la barre amène `currentTime` à environ la moitié de la durée ;
  - le temps `m:ss / m:ss` avance ;
  - `fullscreen` : `document.fullscreenElement` est la vidéo et `controls` est vrai ;
  - la légende est présente.
- CA23 → e2e :
  - au début, 3 points écartés ;
  - après la convergence, un seul point ;
  - à la fin, portrait à droite du `h2`, centré verticalement, à la taille de l'emplacement ;
  - en remontant, retour à l'état initial ;
  - `getByRole('img', { name: 'Portrait of Romain Caillé' })` limité au contact.
- CA24 → e2e, avec permissions presse-papiers et `page.clock` : texte copié, coche et `copied`, retour à l'icône après 1 800 ms, `aria-label`.
- CA25 → e2e : textes, `href`, icônes.
- CA26 → e2e en `reducedMotion: 'reduce'`. On fait défiler toute la page par paliers puis on ouvre le terminal. Vérifications :
  - 600 ms après, `document.getAnimations()` est vide ;
  - à chaque palier, les éléments à l'écran sont à opacité effective 1, sans translation ;
  - les libellés changent sans animation ;
  - la vidéo reste `paused` une fois à l'écran ;
  - après un clic de navigation, le `scrollY` final est atteint dès la frame suivante.
- CA27 → e2e en `javaScriptEnabled: false`, à chaque palier :
  - textes, stack, première capture ou poster, liens : opacité effective 1, sans transform ;
  - chaque lien de navigation pose le hash et amène sa section à l'écran.
- CA28 → e2e 320×568, à chaque palier :
  - `scrollWidth ≤ 320` ;
  - boîtes de texte comprises entre 56 et 320 px ;
  - marge gauche de `main` au moins égale à la largeur du rail ;
  - en bas de page, la dernière ligne du contact est au-dessus du terminal.
- CA29 → e2e 1440×900 : Tab jusqu'au dernier contrôle.
  - Chaque contrôle a un indicateur visible (outline ou ombre), est dans la fenêtre et à opacité effective 1.
  - On active un contrôle de chaque type avec Entrée et Espace (la barre de progression avec les flèches, Ambiguïté 4).
- CA30 → `pnpm build && pnpm lhci` en local, à la main ; en CI sur `main`.
- CA31 → unitaire `tests/unit/media.test.ts` sur `public/media/fraud-engine.mp4`, plus vérification manuelle.
  - Unitaire : au plus 3 000 000 o, boîte `tkhd` d'une hauteur ≤ 720, codec `avc1`, `moov` avant `mdat`.
  - Manuel : lecture dans Chrome, Firefox, Safari macOS et iOS, durée d'environ 90 s.
- CA32 → e2e sur le serveur.
  - `Range: bytes=0-1023` : 206, `content-range: bytes 0-1023/<taille>`, corps égal aux 1 024 premiers octets du fichier.
  - `bytes=-1024` : les 1 024 derniers octets.
- CA33 → e2e sur le build : chaque `src` d'image de projet et le poster pointent vers un fichier de `dist/client` dont la signature est `RIFF….WEBP`.

**Tests du socle impactés**
- `hero.spec.ts`, « CA10 — aucune animation » : supprimé et remplacé par CA26, comme prévu par la spec. Le curseur clignote dès le chargement.
- `hero.spec.ts`, « CA11 — aucun élément du hero n'est coupé ».
  - Le sélecteur `page.getByRole('link', { name: /resume\.pdf/ })` trouve aussi le lien `resume.pdf` du contact (CA25), et `toHaveCount(1)` échoue.
  - Ce n'est pas la mise en page qui l'impose, mais le contenu : décision 1.
- Tous les autres restent verts sans modification, grâce aux contraintes du plan :
  - le portrait du contact n'est pas un `img[alt=…]` ;
  - aucun autre `dl` ;
  - un seul `h1` ;
  - aucun texte du hero dupliqué.
  - `seo.spec.ts` et `server.spec.ts` ne changent pas.

### Décisions à valider
- **Test du socle CA11 (`hero.spec.ts`).**
  - Option A : limiter le sélecteur au hero, par exemple `valueOf(page, 'resume').getByRole('link')`.
  - Option B : donner au lien du contact un nom accessible sans « resume.pdf ».
  - Recommandation : A, une seule ligne à changer. B contredit WCAG 2.5.3.
- **Écriture des valeurs continues.**
  - Option A : `style.setProperty('--…')` depuis la boucle de défilement, l'état React ne servant qu'aux changements discrets.
  - Option B : tout passe par l'état React et `style={{ '--…': v }}` en JSX, comme le design. Toute la page est alors re-rendue à chaque frame.
  - Recommandation : A. La règle « variables CSS uniquement » est respectée sans rendu React à 60 images par seconde sur mobile. Le lint ne contrôle pas ces écritures en JS : la revue doit vérifier qu'elles ne visent que des `--…`.
- **Repli si la vidéo de 3 Mo est illisible.**
  - Option A : 720p à 15 images par seconde.
  - Option B : 960×540 à la cadence d'origine.
  - Option C : relever le plafond de 3 Mo.
  - Recommandation : A. Le texte reste net, et un tableau de bord bouge lentement.
- **Si le navigateur de Playwright ne lit pas le H.264.** À vérifier au début de l'étape des tests.
  - Option A : dans les e2e de CA21 et CA22, servir à la place une courte fixture VP9/WebM par `page.route` (`tests/fixtures/media/`). Le H.264 reste vérifié à la main (CA31).
  - Option B : `channel: 'chrome'`, ce qui installe Chrome en CI et coûte des minutes.
  - Option C : CA21 et CA22 vérifiés à la main.
  - Recommandation : A.

### Risques
- **H.264 dans les e2e.** Playwright 1.63 embarque Chrome for Testing 153, dont la lecture du H.264 n'est pas prouvée. Premier geste du tester : `canPlayType('video/mp4; codecs="avc1.640028"')`.
- **320 px avec le rail de 56 px.** D'après les valeurs du socle, la ligne portrait + `h1` en `nowrap` fait environ 221,6 px pour 225,6 px disponibles : 4 px de marge.
  - Si CA11 du socle ou CA28 échoue, la seule correction touche les tokens du hero (plancher du `h1` ou de la marge latérale).
  - Ce serait un écart au design, à soumettre à Romain.
- **Score Performance Lighthouse.** L'arbre à hydrater est plus gros, ce qui pèse sur le TBT. Parades :
  - aucun rendu React par frame ;
  - tout ce qui est sous la ligne de flottaison se charge en différé, y compris le poster ;
  - même police qu'aujourd'hui.

  Sous 95, mesurer avant d'optimiser.
- **Double défilement sur les ancres.** Un clic sur une ancre déclenche `popstate`. TanStack Router rappelle alors `scrollIntoView` sur la même cible (`router-core/dist/esm/scroll-restoration.js`, l. 185) : c'est sans effet visible, et les e2e CA10 et CA11 le couvrent.
- **Safari iOS.** Le plein écran passe uniquement par `webkitEnterFullscreen`, et la lecture automatique dépend de la propriété `muted`. Vérification à la main.
- **Contenus fixés plus hauts que la fenêtre sur mobile.** Dans un projet long, le bas de la carte n'apparaît que quand la section remonte. C'est le comportement du design.
- **Stabilité des e2e.** Seuils et transitions de 0,2 s imposent des `expect.poll`. Les seules attentes fixes sont les 600 ms de CA26 et l'horloge simulée de CA24.
- **Poids du dépôt.** Environ 3 Mo de vidéo et 0,5 Mo d'images versionnés.

### Ambiguïtés de la spec
1. **CA9, soulignement.** Le design ne souligne le lien actif que dans le bandeau, pas dans le rail. Proposition : suivre le design, soulignement à partir de 900 px seulement, couleur partout.
2. **CA27, étape de la ligne `event <nom> →` sans JS.** Proposition : `deploy`, l'état final. Après hydratation, la ligne revient à `ingest`, hors de l'écran.
3. **CA26, « dès qu'elle arrive à l'écran ».** Le design ne révèle le contenu qu'une fois le haut de la section à 60 % de la fenêtre. Proposition : en mouvement réduit, révélations et contact toujours en état final. Le pipeline et le terminal gardent le seuil du design.
4. **CA29, « Entrée ou Espace » pour la barre de progression.** C'est un curseur : il se manipule aux flèches. Entrée et Espace valent pour les boutons, les liens et le `summary`.
5. **CA31, « 3 Mo ».** Cible : au plus 3 000 000 octets, ce qui satisfait aussi la lecture en 2²⁰.
6. **CA24, nom accessible.** `copy email address` ne contient pas le texte visible `r.caille@icloud.com`, ce qui contredit WCAG 2.5.3 (Lighthouse ne l'audite pas). Proposition : garder le texte de la spec. Option : `copy email address r.caille@icloud.com`.
7. **CA15 sans JS.** L'indication reste affichée, puisque le défilement ne peut pas être détecté.
8. **Flèches du carrousel.** `‹` et `›` sont du texte dans le design, pas un SVG ni du CSS. Elles restent en texte : la contrainte Carbon vise les icônes dessinées.
9. **Portrait du contact.** Il est en couleur dans le design, alors que celui du hero est gris. D'où un média de plus, `portrait-color.webp`. À confirmer.

*Gate 2, 2026-10-02 : les ambiguïtés sont tranchées dans les CA et dans « Décisions ». Pour l'ambiguïté 6, Romain retient l'option `copy email address r.caille@icloud.com`, qui prime sur l'`aria-label` de la tâche 10.*

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
- 2026-10-02 — Plan technique validé (gate 2), avec les recommandations de l'architect (validée par Romain) :
  - le test du socle « CA11 — aucun élément du hero n'est coupé » limite son sélecteur `resume.pdf` au hero ;
  - les valeurs continues des animations sont écrites par `style.setProperty('--…')` depuis la boucle de défilement, et l'état React ne porte que les changements discrets. La revue vérifie que ces écritures ne visent que des variables CSS ;
  - si la vidéo est illisible à 3 Mo, repli en 720p à 15 images par seconde ;
  - si le navigateur de Playwright ne lit pas le H.264, les e2e de CA21 et CA22 utilisent une courte fixture WebM servie par `page.route`, et le H.264 se vérifie à la main (CA31).
- 2026-10-02 — Ambiguïtés du plan tranchées et reportées dans les CA (validée par Romain) :
  - CA9 : le lien actif n'est souligné qu'à partir de 900 px, et il est coloré partout ;
  - CA15 : sans JS, l'indication « scroll ↓ » reste affichée ;
  - CA23 : le portrait du contact est en couleur, comme dans le design (`portrait-color.webp`) ;
  - CA24 : libellé accessible `copy email address r.caille@icloud.com`, conforme à WCAG 2.5.3 ;
  - CA26 : en mouvement réduit, le contenu des sections est toujours en état final, et le pipeline et le terminal gardent les seuils du design ;
  - CA27 : sans JS, la ligne `event <nom> →` affiche `deploy` ;
  - CA29 : la barre de progression vidéo se règle aux flèches ;
  - CA31 : 3 Mo s'entend comme 3 000 000 octets ;
  - les flèches `‹` et `›` du carrousel restent en texte, comme dans le design.
- 2026-10-02 — Retours du tester, mini gate 1 (validée par Romain) :
  - CA29 : au clavier, les liens s'activent avec Entrée, les boutons et le dépliage avec Entrée ou Espace, la barre de progression vidéo avec les flèches. Un `<a>` ne réagit pas à Espace, qui fait défiler la page ;
  - CA7 : le sens du roulement se vérifie par l'animation qui joue (`roll-in`/`roll-out` en descendant, variantes `-down` en remontant), pas par la trajectoire des lettres ;
  - le Chromium de Playwright lit le H.264, donc pas de fixture WebM : les e2e de CA21 et CA22 utilisent la vraie vidéo.
- 2026-10-02 — Blocages remontés par le dev à l'étape verte (validée par Romain) :
  - deux défauts de test sont corrigés par le tester, avec un nouveau commit rouge. Le test de CA17 sur la plage de défilement comparait la position du titre pendant son apparition. L'outil d'attente `stable()` rendait la main en pleine transition ;
  - le dev remet les transitions du design qu'il avait retirées pour contourner ces tests : fondu du paquet, glissement des trois points du contact, ouverture du panneau du terminal, et portrait qui grandit en atterrissant (CA23) ;
  - écart au design : sous 700 px, la taille du titre du hero passe de 9vw à 8,6vw, pour que « Romain CAILLE » tienne à 320 px à côté du rail de 56 px (CA11 du socle, CA28) ;
  - écart au design : sous 700 px, l'espace entre les contrôles vidéo passe de 12 à 8 px, pour que la barre de progression reste utilisable à 320 px (CA28).
- 2026-10-02 — Livraison. Review OK au 2e passage, après correction de trois bloquants `[code]` sur la fidélité au design : couleur des liens `repo`, bordure haute du terminal, montée en trop de trois éléments des projets. CA1 à CA30, CA32 et CA33 sont vérifiés par les tests. Lighthouse mobile en local : 97 / 100 / 100 / 100. Il reste à vérifier à la main la lecture de la vidéo (CA31) dans Firefox, Safari macOS et Safari iOS, puis CA30 en CI sur `main`.
- 2026-10-02 — Pipeline de la MR !5 en échec sur un seul e2e : CA14 mesurait le panneau du terminal pendant sa transition de 0,3 s, ce qu'on ne voit que sur le runner lent de la CI. On l'a reproduit dans l'image Docker de la CI limitée à 1 CPU. Le tester attend la fin des transitions (`settleAnimations`) avant les mesures de CA14, et le même motif est corrigé par prévention dans CA19, CA22, CA23 et CA28. Les assertions ne changent pas. Second push accepté par Romain. Règle retenue : avant chaque push, les e2e passent dans l'image de la CI limitée à 1 CPU (validée par Romain)
- 2026-10-02 — Clôture : MR !5 mergée et déployée. Le pipeline `main` est vert, y compris Lighthouse en CI (CA30). Lighthouse mobile sur la prod : 99 à 100 / 100 / 100 / 100 en 12.6.1, 100 partout en 13.5.0. Romain mesure 100 / 100 / 96 / 100 avec son navigateur, tous les scores restant d'au moins 95. En prod, `/` répond 200, `/cv.pdf` et `/page-inconnue` répondent 404, les médias 200, et la vidéo répond 206 aux requêtes `Range` (CA32). Romain a validé à la main la lecture de la vidéo dans Chrome, Firefox, Safari macOS et Safari iOS (CA31). CA1 à CA33 sont cochés (validée par Romain)
