# Portfolio — socle technique

## User story
En tant que Romain, développeur du portfolio, je veux un socle TanStack Start + shadcn (style Lyra, tokens du design) + icônes Carbon, protégé par des règles de lint, déployé sur romain-caille.fr avec la section hero du design, afin de construire les sections suivantes sans m'écarter du design system, avec un SEO et des performances vérifiés automatiquement.

## Critères d'acceptation

### Rendu et SEO
- [x] CA1 — Étant donné le build de production, quand je requête `/` avec JavaScript désactivé, alors le HTML reçu contient le contenu de la page et la balise `<html lang="en">`.
- [x] CA2 — Étant donné une route du site, quand j'inspecte son `<head>`, alors il contient un `<title>`, une `meta name="description"` et un `link rel="canonical"` propres à la route, la canonical étant une URL absolue en `https://romain-caille.fr/…`. Pour `/` : title « Romain Caillé · Fullstack developer », description « Fullstack developer, ready for the agentic era. Open to work, full-time or freelance, remote or relocation from Nantes, France. ».
- [x] CA3 — Étant donné une route du site, quand j'inspecte son `<head>`, alors il contient `og:title`, `og:description`, `og:url` et `og:image` ; l'URL de `og:image` est absolue et répond 200 avec une image de 1200 × 630, sur le fond du design, qui affiche « Romain Caillé » et « Fullstack developer, ready for the agentic era. ».
- [x] CA4 — Étant donné le site déployé, quand je requête `/sitemap.xml`, alors il répond 200 et liste toutes les routes publiques en URL absolues `https://romain-caille.fr/…`.
- [x] CA5 — Étant donné le site déployé, quand je requête `/robots.txt`, alors il répond 200, autorise l'indexation et référence `https://romain-caille.fr/sitemap.xml`.
- [x] CA6 — Étant donné la page d'accueil, quand je passe son HTML au validateur schema.org, alors il détecte un objet `Person` sans erreur avec : `name` « Romain Caillé », `url` « https://romain-caille.fr », `jobTitle` « Fullstack developer », `sameAs` [« https://gitlab.com/romain.caille », « https://www.linkedin.com/in/romain-caill%C3%A9/ »].

### Thème et contenu
- [x] CA7 — Étant donné `components.json`, quand je le lis, alors le style shadcn déclaré est Lyra.
- [x] CA8 — Étant donné `styles.css`, quand je le lis, alors il définit en variables CSS tous les tokens listés dans « Contraintes > Tokens du design », et le thème shadcn les consomme.
- [x] CA9 — Étant donné le token « texte discret », quand je mesure son contraste sur le fond de page (`#121417`) et sur la surface profonde (`#0d0f12`), alors il est d'au moins 4,5:1 dans les deux cas.
- [x] CA10 — Étant donné `https://romain-caille.fr`, quand je l'ouvre, alors la section hero du design s'affiche, sans animation, avec :
  - la ligne `// state: idle · 0 packet · 3 stages` ;
  - le portrait en niveaux de gris, avec le texte alternatif « Portrait of Romain Caillé » ;
  - le titre `h1` « Romain CAILLE », « CAILLE » en texte atténué ;
  - l'accroche « Fullstack developer, ready for the agentic era. » ;
  - la liste status / contract / location / experience / education / english / resume, avec les textes du design (« Open to work · available now » en accent statut précédé d'une pastille, les trois expériences Spotime, Enedis et U Tech avec leurs années, « Master's, IT & Information Systems · EPSI », « C1 ») ;
  - sur la ligne resume, un lien « resume.pdf » vers `/cv.pdf`, suivi de l'icône Carbon flèche en haut à droite. Le fichier n'est pas encore fourni : le lien renvoie une 404 d'ici là, ce qui est accepté.
- [x] CA11 — Étant donné une fenêtre de 320 px de large, quand j'ouvre la page d'accueil, alors aucun défilement horizontal n'apparaît et aucun élément de CA10 n'est coupé ni ne déborde sur les côtés. Le défilement vertical est permis.

### Garde-fous (lint)
*Périmètre : CA12 à CA16 s'appliquent à tout `src/` sauf le dossier des composants générés par la CLI shadcn. CA17 (icônes) s'applique partout, y compris ce dossier.*
- [x] CA12 — Étant donné un composant dont l'attribut `style` définit une propriété CSS (ex. `style={{ color: 'red' }}`, `style={{ left: x }}`), quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne. Un attribut `style` qui ne définit que des variables CSS (ex. `style={{ '--progress': p }}`) passe.
- [x] CA13 — Étant donné une couleur littérale (`#hex`, `rgb()`, `hsl()`, `oklch()`) dans un fichier autre que `styles.css`, y compris comme valeur d'une variable CSS, quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne. Étant donné une couleur littérale dans `styles.css` écrite dans un autre format que `oklch()` (`#hex`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `color()`), quand je lance la commande de lint, alors elle échoue en indiquant la ligne ; `oklch()` et les références `var(--…)` passent. Une couleur nommée (ex. `white`, `red`) en valeur de déclaration dans `styles.css` échoue aussi, sauf `transparent` et `currentColor`.
- [x] CA14 — Étant donné une classe de couleur de la palette Tailwind par défaut (ex. `bg-red-500`, `text-zinc-400`), y compris `white` et `black` (ex. `text-white`, `bg-black`), quand je lance la commande de lint, alors elle échoue ; une classe de token défini dans `styles.css` (ex. `bg-primary`, `text-muted-foreground`) passe. Un token peut lui-même pointer vers une couleur de la palette Tailwind (ex. `var(--color-white)`), à l'intérieur de `styles.css`.
- [x] CA15 — Étant donné une classe Tailwind à valeur arbitraire (ex. `w-[37px]`, `p-[13px]`, `text-[15px]`, `bg-[#fff]`), quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne. La lecture d'une variable CSS sans valeur en dur (ex. `w-(--progress)`) n'est pas visée et passe.
- [x] CA16 — Étant donné un fichier `.css` autre que `styles.css` dans `src/`, quand je lance la commande de lint, alors elle échoue.
- [x] CA17 — Étant donné un import depuis un module externe dont le nom contient `icon` ou `lucide`, autre que `@carbon/icons-react` (ex. `lucide-react`, `@tabler/icons-react`, `react-icons`), quand je lance la commande de lint, alors elle échoue ; et aucun de ces modules n'est présent dans `package.json`.
- [x] CA18 — Étant donné un fichier du dépôt qui viole une règle de CA12 à CA17, quand je lance `git commit`, alors le commit est refusé.
- [ ] CA19 — Étant donné une MR qui contient une violation d'une règle de CA12 à CA17, quand la CI GitLab s'exécute, alors le pipeline échoue.

### Performance
- [ ] CA20 — Étant donné un pipeline sur `main`, quand la CI GitLab s'exécute, alors Lighthouse (profil mobile) tourne sur chaque route du build, et le pipeline échoue si l'un des scores Performance, Accessibilité, Bonnes pratiques ou SEO est inférieur à 95. Les pipelines de MR ne lancent pas Lighthouse.

### Déploiement
- [ ] CA21 — Étant donné un merge sur `main`, quand le déploiement Dokploy se termine, alors `https://romain-caille.fr` sert la version mergée en HTTPS.
- [ ] CA22 — Étant donné le site déployé, quand je requête une URL qui ne correspond à aucune page ni à aucun fichier (ex. `/page-inconnue`, ou `/cv.pdf` tant que le fichier manque), alors la réponse a le code HTTP 404.

## Hors scope
- Toutes les sections du design autres que le hero : barre pipeline, terminal `events.log`, overview, projets, contact (spec `portfolio-pages`).
- Toutes les animations, y compris celles du hero (indication « scroll ↓ to emit romain.init », lignes qui défilent, pastille pulsante).
- Le fichier `cv.pdf` lui-même : Romain l'ajoutera plus tard.
- Favicon : Romain le fournira plus tard. Son absence ne doit pas faire échouer CA20.
- Mode clair et bascule de thème : le design est uniquement sombre.
- Multilingue : site en anglais uniquement.
- Analytics, tracking, bannière cookies.
- CMS ou back-office.
- Configuration du VPS, du DNS et de l'application Dokploy (faite par Romain).

## Contraintes
- Stack : TanStack Start + TanStack Router, shadcn/ui style Lyra, icônes `@carbon/icons-react`.
- Lint : `@shadcn/lint`, installé selon https://github.com/shadcn-ui/lint/blob/main/SETUP.md. Si l'outil ne couvre pas toutes les règles de CA12 à CA17, l'architect propose de quoi compléter.
- Variables CSS posées via `style` (CA12) : l'architect précise comment elles sont consommées (règles dans `styles.css` ou syntaxe variable de Tailwind), sans contredire CA15.
- Design de référence : `/Users/romain/Downloads/Portfolio Event-Driven/Portfolio Event-Driven.dc.html`, avec ses médias dans `uploads/`. Il reste hors du dépôt. `support.js` est le moteur d'exécution de Claude Design : il ne se reproduit pas.
- Médias : copiés depuis `uploads/` seulement quand une section en a besoin, et convertis dans un format d'image plus léger. Romain suggère WebP ; l'architect confirme le format.
- Portrait du hero : `uploads/53820114-DBAD-413B-8432-5934679BE470.PNG` (1,6 Mo). Le cadrage du design est un zoom sur le visage (`background-size: 250%`, `background-position: 47.3% 22.5%`).
- Petits écrans : le design réduit ses tailles et marges sous un certain seuil de largeur (ex. h1 à `min(8.5vw, 32px)` au minimum, marge latérale du hero à 16 px au minimum). Ces réductions sont à reproduire.
- Le design fait foi pour les couleurs, la typo et les espacements, reportés en tokens dans `styles.css`. Les composants shadcn restent en style Lyra.
- Hébergement : VPS OVH, déploiement Dokploy, build Railpack, dans le setup habituel de Romain (comme `clockinsnap/frontend-web`, qui a un script `start`). Railpack 0.15.4 lance le script `start` du projet (`pnpm run start`), qui démarre le serveur Node (srvx). Sans ce script, il retombe en site statique servi par Caddy. La variable `RAILPACK_SPA_OUTPUT_DIR` sera retirée de Dokploy après le merge, et la version de Railpack (0.15.4, imposée par Dokploy) ne peut pas être changée. Le projet fournit des scripts pnpm prêts pour le build et le démarrage, sans configuration d'hébergement à écrire ou maintenir (ni `Staticfile` ni `Caddyfile`). « Pipelines must succeed » est activé sur GitLab.
- Dépôt et CI : GitLab, sur le free tier. Le quota de minutes de CI est limité : aucun pipeline ne doit être relancé ou déclenché sans nécessité, et aucun agent ne lance de pipeline.
- Domaine : `romain-caille.fr`.
- Langue : anglais uniquement.

### Tokens du design
Relevés dans le HTML du design. Les noms sont indicatifs ; le nommage final revient à l'architect. Dans `styles.css`, toutes les valeurs sont écrites en `oklch()` (CA13) : les valeurs hex ci-dessous sont converties.

| Rôle | Valeur |
|---|---|
| Fond de page | `#121417` |
| Surface (cartes) | `#1a1d22` |
| Surface profonde (terminal, lecteur vidéo) | `#0d0f12` |
| Bordure | `#2a2f37` |
| Texte principal | `#e6e8eb` |
| Texte au survol | `#ffffff` |
| Texte secondaire | `#b8c0cc` |
| Texte atténué (labels) | `#8b94a1` |
| Texte discret (horodatages, notes) | `#525b66` dans le design, à éclaircir jusqu'à 4,5:1 (CA9), en restant au plus près |
| Accent statut (« open to work ») | `#62d99a` |
| Accent Spotime | `oklch(0.72 0.07 210.53)` |
| Accent Fraud Engine | `#f0a35a` |
| Accent Event Hub | `#b78cf5` |
| Fond des captures d'écran | `oklch(0.985 0.001 0)` |
| Voile translucide (barre fixe, overlays) | fond de page à 92 %, 70 % et 50 % d'opacité |

- Polices : Instrument Sans 400/500/600 pour le texte, IBM Plex Mono 400/500 pour les labels, la nav et le terminal.
- Labels en capitales : interlettrage `0.08em`. Titres : interlettrage de `-0.02em` à `-0.03em`.
- Rayons : `0` partout. Seuls les pastilles et l'avatar final sont ronds.
- Tailles de texte fluides (ex. h1 de `min(8.5vw, 32px)` à 150 px selon la fenêtre) : à exprimer en tokens, pas en valeurs arbitraires.

## Anomalies après livraison
*MR !1 mergée le 2026-10-01. B1 et B2 ont été corrigés sur `fix/portfolio-socle-deploy` (MR !2), B3 et B4 sur `fix/portfolio-socle-404`.*

- **B1 — Le déploiement Railpack échoue (CA21).**
  - Environnement : Railpack 0.15.4 dans Dokploy, mode « vite static site », Node 24.21.0 et pnpm 11.22.0 via Corepack, build lancé dans `/app` par `pnpm run build`.
  - Le prérendu affiche `Crawling: /`, puis `Prerendered 0 pages`. Le sitemap est écrit (`sitemap.xml`, `pages.json`), puis le processus plante avec `TypeError: fetch failed`, cause `connect ECONNREFUSED 127.0.0.1:43061`, code de sortie 1.
  - Le même `pnpm build` réussit en local et dans le job `build` de la CI GitLab (image Playwright).
  - Attendu : `pnpm build` réussit sous Railpack, et `dist/client/index.html` contient la page prérendue.
- **B2 — Le job `lighthouse` de la CI ne se termine pas (CA20).**
  - Pipeline de la MR !1, job `16869816761` : `lhci autorun` lance son serveur sur `http://localhost:<port>/index.html`, le run 1 et le run 2 se terminent en 12 s environ chacun, puis le run 3 reste bloqué. Romain a annulé le job au bout de 34 minutes.
  - Aucun délai maximal n'est configuré sur le job.
  - En local, `pnpm lhci` se termine normalement.
  - Attendu : le job se termine en un temps borné, et échoue franchement s'il bloque, au lieu de tourner sans fin.

- **B4 — srvx recompresse le JS en brotli à chaque requête (CA20, risque « performance » de la révision B3).**
  - Mesure en local sur `pnpm start`, bundle `index-*.js` de 341 502 octets, 5 requêtes par encodage :
    - `br` : ~0,34 s pour 94 028 o ;
    - `gzip` : ~0,006 s pour 108 543 o ;
    - identity : ~0,0006 s.
  - srvx appelle `createBrotliCompress()` avec la qualité par défaut, 11, à chaque requête et sans cache (`node_modules/srvx/dist/static.mjs`, lignes 61 et 66). Aucun `Cache-Control` sur le bundle ni sur `/`.
  - Le seuil de ~200 ms fixé par le plan est dépassé. Lighthouse CI ne le voit pas, puisqu'il audite `dist/client` avec son propre serveur.
  - Décision : corriger avant le merge (voir « Décisions »).
- **B3 — Aucune vraie 404 en production (CA10, CA22).**
  - Constat du 2026-10-01 par `curl` : `/cv.pdf` et `/page-inconnue` répondent 200 avec le contenu de la page d'accueil.
  - Cause, d'après l'architect : en mode « vite static site », Railpack 0.15.4 génère un Caddy qui renvoie `/index.html` pour toute URL inconnue. Il ignore `index_fallback` du `Staticfile`, une option lue seulement à partir de la 0.29.0. Romain ne peut pas changer la version de Railpack dans Dokploy.
  - Décision : passage au mode serveur Node (voir « Décisions »).
  - Vérifications du même jour, toutes OK : `/`, `/sitemap.xml`, `/robots.txt` et `/og.png` répondent 200 ; schema.org valide la page avec 0 erreur ; le hash du JS servi est identique au build de `main`.

### Correctifs
- **B1** — `9843150` : `preview.host = "127.0.0.1"` dans `vite.config.ts`. Sous Railpack, `localhost` résout d'abord en `::1` : le serveur de prérendu écoutait en IPv6 alors que le `fetch` visait `127.0.0.1`. Échec reproduit puis corrigé dans un conteneur `node:24` en local ; à confirmer au premier déploiement Dokploy.
- **B3** — rouge `57f45f5`, correctif `1400946`. Le script `start` (`srvx --prod -s ../client dist/server/server.js`) fait lancer le serveur Node par Railpack 0.15.4 au lieu de Caddy, et le `Staticfile` est supprimé. Les URL sans page ni fichier répondent 404 avec la page 404 de TanStack. À confirmer après le merge, une fois les changements Dokploy faits (tâche 5 de la révision B3).
- **B4** — rouge `102d59a`, correctif `eae02f2`. `srvx` passe en 1.0.5 : brotli en qualité 4 (environ 5 ms au lieu de 340 ms sur le bundle), sans recompression des images ni des polices, avec `ETag`, `Last-Modified` et `Vary`. Comme srvx est une dépendance directe, le serveur de rendu TanStack (`dist/server/server.js`, h3) utilise aussi la 1.0.5, au runtime comme pendant le prérendu. Toute montée de srvx touche donc aussi le rendu.
- **B2** — rouge `3cc6e1e`, correctif `a0ddbb6`. Le job `lighthouse` est limité à `timeout: 10 minutes` et ne tourne que sur `main` (`rules: if $CI_COMMIT_BRANCH == "main"`). `chromeFlags` reçoit en plus `--disable-dev-shm-usage --disable-gpu`. La cause probable, un `/dev/shm` de 64 Mo dans le conteneur, n'est pas prouvée ; à confirmer au premier pipeline de `main`.

## Plan technique

### Révision B4 : compression du serveur (architect, 2026-10-02)
*Le rapport de l'architect a été signalé par le filtre de sécurité de Claude Code, sans raison donnée. Aucun fichier n'avait été modifié. Romain a décidé de conditionner l'option A à une vérification préalable (voir « Décisions »).*

- **Constat** : srvx 0.11.22 ne propose aucun réglage du statique. Son CLI n'appelle que `serveStatic({ dir })` (`srvx/dist/cli.mjs`, l. 52), et les middlewares exportés passent après le statique.
- **Option A, recommandée** : passer `srvx` à 1.0.5, en version exacte. D'après l'architect, cette version réécrit le statique : brotli en qualité 4, uniquement sur les types texte de 1 Kio à 10 Mio, plus `ETag`, `Last-Modified` et `Range`. Le CLI, le script `start`, Railpack et Dokploy ne changent pas. Le lockfile garde `srvx@0.11.22` pour `@tanstack/start-plugin-core` et `h3`, qui servent au prérendu.
- **Option C, repli** : `serve` 14.2.6 (Vercel, comme clockinsnap), avec `"start": "serve dist/client --no-port-switching"`. Il compresse en brotli de qualité 4 et envoie un `ETag`. Sa 404 a son propre gabarit, sans `h1` : il faut ajouter un `404.html` pour que le test CA22 passe. Le build serveur de TanStack devient inutile. Une dizaine de dépendances directes s'ajoutent.
- Options écartées :
  - B, `server.mjs` maison plus un script de précompression, environ 55 lignes ;
  - D, plugin Vite de précompression, sans effet seul ;
  - E, Nitro, disproportionné.
- **Tâches** :
  1. Tester : deux tests B4 dans `server.spec.ts`.
     - « Le bundle principal part en brotli en moins de 100 ms » : 5 GET en `accept-encoding: br`, médiane sous 100 ms, `content-encoding: br`, corps décodé identique au fichier.
     - « png, webp et woff2 ne sont pas recompressés » : pas de `content-encoding` sur `/og.png`, `/portrait.webp` et le plus gros `.woff2`.
     - Les chemins hachés se calculent dans le test.
  2. Dev : appliquer l'option retenue.
  3. Vérifications locales, sans pipeline : `pnpm lint && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci`, puis la mesure `curl` de B4 en `br`, en `gzip` et sans encodage (en-têtes `etag`, `last-modified` et `vary`), et `/cv.pdf` et `/page-inconnue` en 404.
  4. Après déploiement, Romain : même mesure sur `https://romain-caille.fr`, puis PageSpeed Insights en mobile.
- **Risques** :
  - srvx 1.0.5 n'est pas testé par TanStack avec h3 2.0.1-rc.20. `server.spec.ts` sert de filet.
  - Fraîcheur heuristique : avec `Last-Modified` et sans `Cache-Control`, un visiteur peut revoir l'ancienne page pendant au plus 10 % du temps écoulé depuis le build précédent.
  - La mesure de temps peut être instable en CI. Ne pas relancer un pipeline sans avoir reproduit l'échec en local.

### Révision B3 : passage en mode serveur (architect, 2026-10-01)
*Cette section prime sur le plan v2 pour l'hébergement, le `Staticfile` et les e2e du serveur.*

#### Approche
- Railpack 0.15.4 ne gère pas TanStack Start : il pose seulement l'étiquette `nodeRuntime: tanstack-start`. C'est le script `start` du projet qui le fait sortir du mode « vite static site », et ce script devient la commande de démarrage (`pnpm run start`). Railpack n'impose aucun port. Le build TanStack exporte seulement un handler `fetch` (`dist/server/server.js`). `srvx`, déjà présent dans les dépendances en 0.11.22, le sert sur `PORT` (3000 par défaut), sur toutes les interfaces.
- On garde le prérendu. srvx sert d'abord les fichiers de `dist/client` : `/` renvoie le `index.html` prérendu tel quel, ce qui préserve CA1 et CA20. Tout le reste passe au handler TanStack. Une URL sans fichier ni route (`/page-inconnue`, `/cv.pdf`) aboutit au `notFoundComponent` racine, rendu avec le statut 404 (CA22). Le rendu à la requête ne sert qu'à ces 404.
- B1 reste utile : sous Railpack, le build prérend toujours via le serveur de preview Vite. Lighthouse CI continue d'auditer `dist/client`. Les e2e existants gardent leur simulation. Un nouveau spec teste CA22 sur le serveur buildé, que Playwright lance.

#### Fichiers
- modifié : `package.json` — script `"start": "srvx --prod -s ../client dist/server/server.js"` ; `"srvx": "0.11.22"` en `dependencies`, en version exacte (même règle que `@shadcn/lint`, avant la 1.0).
- modifié : `pnpm-lock.yaml` — srvx passe de dépendance transitive à directe, dans la même version 0.11.22. Aucun nouveau paquet n'est téléchargé.
- supprimé : `Staticfile` — sans effet en 0.15.4 (B3) et sans objet hors du mode statique.
- modifié : `playwright.config.ts` — `webServer` qui lance `pnpm start` sur le port 3100, `use.baseURL`, commentaire d'en-tête.
- créé : `tests/e2e/server.spec.ts` — CA22, et vérifie que le serveur sert bien le build (CA1, CA3 à CA5).
- modifié : `tests/e2e/support.ts` — commentaire de `serveBuild` : il simule la partie statique du serveur et ne cite plus le `Staticfile`.
- inchangés, vérifiés : `vite.config.ts` (B1) ; `lighthouserc.json` ; `src/router.tsx` (la réécriture `/index.html` sert toujours à LHCI) ; `src/routes/__root.tsx` (le `notFoundComponent` existe déjà) ; `.gitlab-ci.yml` et `tests/unit/ci.test.ts`.

#### Tâches (ordonnées)
1. **Test rouge de CA22** — couvre CA22, CA1, CA3, CA4, CA5
   - `playwright.config.ts` : `use: { baseURL: 'http://127.0.0.1:3100' }`, `webServer: { command: 'pnpm start', env: { PORT: '3100' }, url: 'http://127.0.0.1:3100/', reuseExistingServer: false }`. Port dédié, pour ne pas viser `pnpm dev` sur 3000. Avec `reuseExistingServer: false`, le test porte toujours sur le build qui vient d'être fait. Les specs existants utilisent des URL absolues en `https://romain-caille.fr` et ne sont donc pas touchés par `baseURL`.
   - `tests/e2e/server.spec.ts`, JavaScript activé :
     - CA22 : `page.goto('/page-inconnue')` donne le statut 404 et un `h1` « 404 » ; `request.get('/cv.pdf')` donne 404 ;
     - CA1 : `request.get('/')` répond 200 avec un corps strictement égal à `dist/client/index.html` ;
     - CA3 à CA5 : `/og.png`, `/portrait.webp`, `/sitemap.xml` et `/robots.txt` répondent 200.
   - `pnpm build && pnpm test:e2e tests/e2e/server.spec.ts` doit échouer : il n'y a pas encore de script `start`.
2. **Serveur Node** — couvre CA22, CA21
   - `pnpm add -E srvx@0.11.22`, puis le script `start` ci-dessus. Le test de la tâche 1 passe.
   - Pourquoi ce script suffit, d'après le tag v0.15.4 de Railpack :
     - `core/providers/node/spa.go`, `isSPA` : `RAILPACK_SPA_OUTPUT_DIR` force le mode statique ; sinon `if p.hasCustomStartCommand(ctx) { return false }`, où `hasCustomStartCommand` lit `p.packageJson.Scripts["start"]` ; sinon `return (isVite || …) && p.getOutputDirectory(ctx) != ""`. Le projet est détecté comme Vite : sans script `start`, Railpack reste sur Caddy et sert `dist` une fois la variable retirée (`DefaultViteOutputDirectory = "dist"`).
     - `core/providers/node/node.go`, `GetStartCommand` : `if start := p.getScripts(p.packageJson, "start"); start != "" { return p.packageManager.RunCmd("start") }`. Aucune commande par défaut pour TanStack Start.
     - `isTanstackStart()` ne sert qu'à la métadonnée `nodeRuntime`.
     - `GetNodeEnvVars` pose `NODE_ENV=production`, `CI=true` et des `NPM_CONFIG_*`, mais aucun `PORT`. Le Caddy actuel écoutait sur `:{$PORT:80}`.
     - **Correction de la v1** : `tanstack.go` n'existe pas au tag v0.15.4. Il est arrivé avec la PR #672 (2 août 2026) et définit `DefaultTanstackSrvxStartCommand = "srvx --prod -s ../client dist/server/server.js"`, utilisé seulement sans script `start`. Notre script reprend la même commande : une future montée de version de Railpack ne changera rien.
   - Pourquoi srvx : `dist/server/server.js` exporte un objet `{ fetch }` qui n'écoute aucun port. srvx 0.11.22 résout `-s` depuis le dossier de l'entrée (`dist/client`), lit `PORT` (3000 sinon) et `HOST` (toutes les interfaces sinon). Son `serveStatic` essaie le fichier, puis `<chemin>.html`, puis `<chemin>/index.html`, puis passe au handler TanStack, qui renvoie 404 quand la route racine est marquée `_notFound`.
3. **Nettoyage** — couvre CA22
   - `git rm Staticfile`.
   - Commentaires de `support.ts` (`serveBuild` simule la partie statique de srvx ; une URL sans fichier y répond 404 en texte brut, alors que le vrai serveur rend la page 404 de TanStack, testée dans `server.spec.ts`) et de l'en-tête de `playwright.config.ts`.
   - Ne pas toucher à `vite.config.ts` : `preview.host` sert au prérendu pendant le build, pas à srvx.
4. **Vérifications locales, sans pipeline** — couvre CA19, CA20, CA21
   - `pnpm lint && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci`.
   - Plan Railpack avec la version de Dokploy (`railpack plan` n'a pas besoin de BuildKit) : installer Railpack 0.15.4 en local, puis `railpack plan . | grep startCommand` (attendu : `"startCommand": "pnpm run start"`) et `railpack plan --env RAILPACK_SPA_OUTPUT_DIR=dist/client . | grep startCommand` (attendu : `caddy run …`, ce qui prouve qu'il faut retirer la variable).
5. **Romain, dans Dokploy, après le merge** — couvre CA21, CA22
   - Ne rien changer tant que le merge n'est pas sur `main`. Si le merge déclenche un déploiement alors que la variable est encore là, le site reste servi par Caddy, sans danger.
   - Supprimer `RAILPACK_SPA_OUTPUT_DIR` ; ne pas ajouter `HOST` ; `PORT` n'est pas nécessaire.
   - Domaine `romain-caille.fr`, « Container Port » : `3000` (port par défaut de srvx ; avant, 80 pour Caddy). Si l'application a une variable `PORT`, ce champ doit avoir la même valeur.
   - Si un healthcheck vise `/health`, le pointer sur `/`.
   - Redéployer, puis vérifier : au build, plus de « Deploying as vite static site » ; au démarrage, `➜ Listening on: http://localhost:3000/ (all interfaces)`. Le site peut répondre en erreur pendant environ une minute.
6. **Vérifications après déploiement** — couvre CA21, CA22, CA3, CA4, CA5, CA10, CA20.

#### Stratégie de test
- Commandes : tous les e2e, serveur lancé par `webServer` : `pnpm build && pnpm test:e2e` ; CA22 seul : `pnpm build && pnpm test:e2e tests/e2e/server.spec.ts`.
- CA22 → intégration, sur le serveur buildé lancé en local par Playwright : `/page-inconnue` en navigation répond 404 avec un `h1` « 404 » ; `/cv.pdf` en requête simple répond 404. Après déploiement : `for u in "" cv.pdf page-inconnue sitemap.xml robots.txt og.png; do curl -s -o /dev/null -w "%{http_code} /$u\n" "https://romain-caille.fr/$u"; done` (attendu : `200 /`, `404 /cv.pdf`, `404 /page-inconnue`, puis trois `200`).
- CA1 → `GET /` sur le serveur renvoie exactement `dist/client/index.html` ; ce test échoue aussi si srvx ne trouve plus `dist/client`.
- CA3, CA4, CA5 → `/og.png`, `/portrait.webp`, `/sitemap.xml` et `/robots.txt` répondent 200 sur le serveur.
- CA2, CA6, CA7 à CA18 → inchangés.
- CA19 → inchangé ; le job `e2e` démarre en plus srvx via `webServer`.
- CA20 → inchangé si la décision 2 est A ; après déploiement, un passage PageSpeed Insights mobile, plus la mesure du risque de performance.
- CA21 → avant le merge, `railpack plan` en 0.15.4 ; après le déploiement, les logs, `curl -sI` en 200 et le hash du JS servi.

#### Décisions à valider
- **srvx en dépendance directe** — A : `srvx` 0.11.22 en `dependencies` (déjà installé en transitif, commande documentée par TanStack et lancée par les Railpack récents) / B : serveur maison `scripts/serve.mjs` sur `node:http` (~80 lignes) / C : `vite preview` en production (déconseillé par Vite) — recommandation : A.
- **Lighthouse CI** — A : inchangé, audite `dist/client` (découverte automatique des routes ; la compression de srvx n'est pas mesurée) / B : `startServerCommand: "pnpm start"` (liste d'URL à maintenir, réécriture du routeur retirée, revient sur une décision validée) — recommandation : A.
- **E2e existants** — A : CA1 à CA11 et CA20 gardent la simulation, seuls CA22 et le service du build passent par le serveur lancé / B : tous les specs sur le serveur lancé — recommandation : A.
- **Ligne « Hébergement » de la spec** — A : la reformuler (« Railpack 0.15.4 lance le script `start` du projet (`pnpm run start`), qui démarre le serveur Node (srvx). Sans ce script, il retombe en site statique servi par Caddy. ») / B : la garder — recommandation : A.

#### Risques
- **Ordre des opérations dans Dokploy** : retirer la variable puis déployer un code sans script `start` fait servir `/app/dist` par Caddy, sans `index.html` à la racine : le site tombe. Changer Dokploy après le merge.
- **Le script `start` est porteur** : s'il est retiré, Railpack retombe sans prévenir en site statique cassé. En CI, `webServer` le protège.
- **Performance du serveur Node** : srvx compresse chaque fichier statique à la volée en brotli qualité 11, sans cache, sans `Cache-Control` ni `ETag` (Caddy faisait du gzip/zstd, plus rapide). Le bundle principal peut coûter quelques centaines de ms de CPU par requête ; impact surtout sur le chargement du JS, peu sur le LCP. La CI ne le voit pas (décision 2 = A). Mesure après déploiement : `curl` du bundle en `br` contre `gzip`, plus PageSpeed Insights mobile. Au-delà de ~200 ms d'écart ou sous 95 : anomalie dédiée, et LHCI en option B.
- **srvx en 0.x** : la résolution de `--static` pourrait changer ; version exacte et lockfile, et `server.spec.ts` échoue dans ce cas.
- **En-tête `Accept`** : le handler TanStack renvoie 406 au lieu de 404 si `Accept` ne contient ni `*/*` ni `text/html`. Navigateurs, `curl` et `fetch` envoient `*/*`.
- **Healthcheck** : `/health` répond 404 avec srvx ; un healthcheck Dokploy qui le viserait ferait échouer le déploiement.
- **Page 404** : celle du template (`__root.tsx`), sans title ni style du design. À traiter dans `portfolio-pages` si souhaité.

> **Amendements post-livraison** (ils priment sur le texte de l'architect ci-dessous) :
> - tâche 8, prérendu : `vite.config.ts` fixe `preview.host = "127.0.0.1"` (B1) ;
> - tâche 11, Lighthouse CI : `chromeFlags` vaut `--no-sandbox --headless=new --disable-dev-shm-usage --disable-gpu` (B2) ;
> - tâche 12, CI GitLab : le job `lighthouse` a `timeout: 10 minutes` et ne tourne que sur les pipelines de `main` (CA20 modifié, B2).

### Changements depuis la v1
- **Couleurs (CA13)** : tous les tokens sont en `oklch()`, valeurs converties ci-dessous. `check-src` refuse désormais dans `src/styles.css` toute couleur dans un autre format. Les voiles sont écrits en oklch avec une transparence. Le test CA9 lit les valeurs oklch.
- **Blanc et noir (CA14)** : une règle ajoutée bloque `text-white`, `bg-black`, etc. en dehors du dossier ui. Un token de `styles.css` peut pointer vers `var(--color-…)`.
- **Petits écrans (CA11)** : la largeur cible passe à 320 px. La marge a été vérifiée, et le test contrôle que le texte n'est ni coupé ni hors de la fenêtre.
- **Favicon** : il n'y en a pas. La balise `<link rel="icon" href="data:,">` empêche le navigateur de demander `/favicon.ico`, ce qui évite une 404 en console et la perte de points en « Bonnes pratiques » (CA20).
- **Hébergement** : le dépôt ne contient qu'un fichier propre à Railpack, le `Staticfile` avec `index_fallback: false`. Il sert à renvoyer de vraies 404, y compris pour `/cv.pdf` (CA10). La liste des réglages Dokploy et les risques qui en dépendaient sont retirés, car Romain les a déjà en place. `.node-version` est retiré : `engines.node` suffit.
- **Pre-commit** : comparaison faite avec husky seul et avec husky + lint-staged. Je confirme l'option A (hook natif).
- **Décisions de la v1 appliquées** :
  - prérendu statique, `radix-lyra`, Fontsource, Playwright ;
  - Lighthouse CI en dépendance de dev avec la médiane de 3 runs ;
  - portrait converti une seule fois ;
  - title et description de CA2 ;
  - hero d'un écran (`min-h-dvh`) ;
  - CA15 et CA17 sont désormais explicites dans la spec, plus de question ouverte à leur sujet.

### Approche
- **Stack** : TanStack Start 1.168 (React 19.2, Vite 8, TypeScript 6), généré par `shadcn init -t start` en `radix-lyra`. Tailwind CSS 4.3, `@carbon/icons-react` 11.89, `@shadcn/lint` 0.2.0 sur ESLint 10, Node 24 LTS, pnpm 10.
- **Rendu** : toutes les routes sont prérendues en HTML statique au build, avec le sitemap natif. Le HTML est complet sans JavaScript (CA1), et Lighthouse CI audite ces mêmes fichiers de `dist/client` (CA20).
- **Hébergement** : Railpack construit avec `pnpm build` et sert `dist/client` en statique (la variable est déjà posée dans Dokploy). Un `Staticfile` désactive le repli sur `index.html` pour que les URL inconnues, dont `/cv.pdf`, répondent en vraie 404 (CA10).

### Fichiers
Racine : `/Users/romain/projects/portfolio`. Le dépôt est vierge, tous les fichiers sont créés.
- créé : `package.json` — scripts `dev`, `build`, `preview`, `lint`, `test`, `test:e2e`, `lhci`, `og`, `prepare` ; `packageManager` pnpm ; `engines.node: "24.x"`, que Railpack lit.
- créé : `pnpm-lock.yaml`.
- créé : fichiers du template start-app gardés tels quels : `tsconfig.json` (exclut `tests/fixtures`), `tsr.config.json`, `.prettierrc`, `.prettierignore`, `.npmrc`, `pnpm-workspace.yaml`, `src/router.tsx`, `src/routeTree.gen.ts` (généré), `src/lib/utils.ts`.
- créé : `.gitignore` — `dist`, `.output`, `.lighthouseci`, `test-results`, `playwright-report`.
- créé : `vite.config.ts` — `tanstackStart({ prerender: { enabled: true, crawlLinks: false }, sitemap: { enabled: true, host: 'https://romain-caille.fr' } })`, `tailwindcss()`, `viteReact()`, sans devtools.
- créé : `components.json` — `"style": "radix-lyra"`, `tailwind.css: "src/styles.css"`, `cssVariables: true`, `iconLibrary: "lucide"` (voir tâche 4), alias `ui` vers `@/components/ui`.
- créé : `eslint.config.js` — config du template, plus `@shadcn/lint` et ses règles, plus les règles de complément pour CA13, CA14 et CA17.
- créé : `src/styles.css` — seul fichier CSS : tokens en oklch, thème shadcn, tailles fluides, `@utility`, polices, couche `base`.
- créé : `src/routes/__root.tsx` — `<html lang="en" className="dark">`, charset, viewport, préchargement de la police du h1, `<link rel="icon" href="data:,">`, `HeadContent`/`Scripts`.
- créé : `src/routes/index.tsx` — `head()` (title, description, canonical, Open Graph, JSON-LD Person) et rendu de `<Hero />`.
- créé : `src/components/hero.tsx` — section hero statique.
- créé : `public/portrait.webp`, `public/og.png`, `public/robots.txt`.
- créé : `Staticfile` — `index_fallback: false`, pour que les URL inconnues et `/cv.pdf` répondent en vraie 404 (CA10).
- créé : `scripts/check-src.mjs` — ce que l'outil ne couvre pas : CA16 ; CA13 dans les fichiers de `src/` qui ne sont pas du JS/TS, et dans `styles.css` pour les formats autres qu'oklch ; CA17 dans `package.json`. Sortie au format `fichier:ligne`, code 1 en cas d'échec.
- créé : `scripts/og.html`, `scripts/og.mjs` — composition et capture de l'image Open Graph.
- créé : `.githooks/pre-commit` (exécutable) — lance `pnpm lint`.
- créé : `lighthouserc.json`, `.gitlab-ci.yml`, `playwright.config.ts`.
- créé : `tests/unit/tokens.test.ts` (CA7 à CA9), `tests/unit/lint.test.ts` (CA12 à CA17), `tests/fixtures/lint/*.tsx` et `*.css`, `tests/e2e/seo.spec.ts` (CA1 à CA6), `tests/e2e/hero.spec.ts` (CA10, CA11, absence d'erreur console).

### Tâches (ordonnées)
1. **Mise en place du projet** — couvre CA7, CA17
   - Lancer `pnpm dlx shadcn@latest init -t start` avec la base Radix, le style Lyra et les variables CSS, puis ramener les fichiers à la racine du dépôt (`docs/` reste en place).
   - Retirer du template :
     - les devtools (`@tanstack/react-devtools`, `@tanstack/react-router-devtools`, `@tanstack/devtools-vite`), pour alléger le JS (CA20) ;
     - `src/logo.svg`, `public/manifest.json`, les logos et `public/favicon.ico`.
   - `pnpm remove lucide-react`.
2. **Tokens et thème dans `src/styles.css`** — couvre CA8, CA9, CA10
   - Le thème est unique et sombre. Les valeurs vont dans `:root` et le bloc `.dark` généré est supprimé. `class="dark"` sur `<html>` active les variantes `dark:` des composants Lyra. On ajoute `color-scheme: dark`.
   - Correspondance entre les tokens du design et les variables. Les valeurs sont en oklch ; l'hex d'origine du design est entre parenthèses.
     - Fond de page → `--background` : `oklch(0.1904 0.0069 258.4)` (#121417).
     - Surface → `--card`, `--popover`, `--secondary`, `--muted`, `--accent` : `oklch(0.2298 0.0107 260.7)` (#1a1d22).
     - Surface profonde → `--surface-deep` : `oklch(0.1676 0.0071 258.4)` (#0d0f12).
     - Bordure → `--border`, `--input` : `oklch(0.3036 0.0161 259.8)` (#2a2f37).
     - Texte principal → `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`, `--primary` : `oklch(0.9303 0.0046 258.3)` (#e6e8eb). `--primary-foreground` vaut `var(--background)`.
     - Texte au survol → `--foreground-strong` : `oklch(1 0 0)` (#ffffff).
     - Texte secondaire → `--foreground-secondary` : `oklch(0.8052 0.0191 258.4)` (#b8c0cc).
     - Texte atténué → `--muted-foreground`, `--ring` : `oklch(0.6635 0.0219 257.5)` (#8b94a1).
     - Texte discret → `--foreground-faint` : **`oklch(0.5927 0.0199 253.4)`** (#767f8a).
     - Accent statut → `--status` : `oklch(0.8004 0.1414 157.71)` (#62d99a).
     - Accents projets → `--spotime` : `oklch(0.72 0.07 210.53)` ; `--fraud-engine` : `oklch(0.7769 0.1276 62.53)` (#f0a35a) ; `--event-hub` : `oklch(0.7225 0.1534 301.57)` (#b78cf5).
     - Fond des captures → `--screenshot` : `oklch(0.985 0.001 0)`.
     - Voiles → `--veil-92`, `--veil-70`, `--veil-50` : `oklch(0.1904 0.0069 258.4 / 0.92 | 0.7 | 0.5)`.
     - Les tokens Lyra sans équivalent dans le design (`--destructive`, `--chart-*`, `--sidebar-*`) sont générés en oklch et gardés. Tout autre format est converti.
   - Comment les valeurs ont été obtenues : matrices OKLab de Björn Ottosson, avec L et C arrondis à 4 décimales et la teinte à 0,1° pour les gris, 0,01° pour les accents. Le test CA8 vérifie que chaque valeur redonne exactement l'hex du design en 8 bits.
   - Texte discret : `#767f8a` a la même teinte que `#525b66`, qui vaut `oklch(0.4674 0.0212 253.5)`. Seule la clarté monte, la chroma reste quasi identique.
     - Contraste recalculé depuis la valeur oklch arrondie : 4,55:1 sur le fond de page et 4,73:1 sur la surface profonde. Les fonds en oklch redonnent exactement #121417 et #0d0f12.
     - L'arrondi déplace la luminance de moins de 0,1 %. Le cran sRGB juste en dessous (#757e89) tombe à 4,48:1.
   - Dans `@theme inline`, chaque nouveau token reçoit `--color-<nom>: var(--<nom>)`. Classes obtenues : `bg-surface-deep`, `text-foreground-secondary`, `text-foreground-faint`, `hover:text-foreground-strong`, `text-status`, `bg-veil-92`, etc.
   - Autres tokens : `--radius: 0`, `--font-sans` (Instrument Sans), `--font-mono` (IBM Plex Mono), `--tracking-label: 0.08em`, `--tracking-title: -0.03em`, `--tracking-heading: -0.02em`.
   - Tailles fluides dans `@theme`, valeurs reprises du design. Elles deviennent des classes nommées, sans valeur arbitraire :
     - `--text-display: clamp(min(8.5vw, 32px), min(9vw, 11vh), 150px)`, avec interligne 0.95, interlettrage -0.03em, graisse 600 → h1.
     - `--text-lead: clamp(min(4.8vw, 18px), min(2.6vw, 4.6vh), 34px)`, interligne 1.25, interlettrage -0.01em → accroche.
     - `--text-meta: clamp(min(3.9vw, 14px), min(1.5vw, 2.6vh), 17px)`, interligne 1.45 → `dd`.
     - `--text-label: clamp(min(3.2vw, 12px), min(1.1vw, 2vh), 14px)`, interlettrage 0.08em → `dt`.
     - `--text-annotation: 13px` → ligne `// state…`.
     - Espacements : `--spacing-gutter: clamp(16px, 6vw, 96px)`, `--spacing-hero-y: clamp(12px, 3vh, 48px)`, `--spacing-hero-gap: clamp(12px, 2.6vh, 40px)`, `--spacing-hero-stack: clamp(6px, 1.6vh, 18px)`, `--spacing-hero-inline: clamp(14px, 2vw, 24px)`, `--spacing-portrait: clamp(min(6.5vw, 24px), min(6.5vw, 8vh), 108px)`, `--spacing-meta-col: clamp(20px, 4vw, 40px)`, `--spacing-meta-row: clamp(4px, 1.2vh, 12px)`.
     - Largeur : `--container-meta: 720px`.
     - Les planchers en `min()` reproduisent la réduction du design sur petits écrans, sans breakpoint.
   - Deux `@utility` couvrent ce que l'échelle Tailwind n'a pas :
     - `grid-cols-meta` : `max-content minmax(0, 1fr)` ;
     - `icon-inline` : 0.9em, marge de début 0.35em, `vertical-align: -0.1em`.
   - Couche `base` : `body` en `bg-background text-foreground font-sans antialiased` ; `a` en `var(--foreground)`, `a:hover` en `var(--foreground-strong)`.
   - Polices Fontsource importées dans `styles.css`. Le woff2 latin d'Instrument Sans est préchargé dans `__root.tsx` via un import `?url`.
3. **Lint** — couvre CA12, CA13, CA14, CA15, CA16, CA17
   - **Installation selon SETUP.md.**
     - Le projet utilise pnpm, la config plate ESLint du template, et un `components.json` qui pointe vers `src/components/ui` et `src/styles.css`.
     - `pnpm add -D -E @shadcn/lint @typescript-eslint/parser`, puis enregistrement de `plugins: { shadcn }` sans toucher aux règles existantes.
     - `pnpm lint` doit charger la config.
     - Activer les règles est une deuxième étape, rendue nécessaire par les CA.
   - **Ce que couvre `@shadcn/lint`**, dans le bloc `files: ["src/**/*.{ts,tsx}"]`, `ignores: ["src/components/ui/**"]` :
     - CA12 → `shadcn/no-inline-styles` : **couvert**. Chaque propriété CSS d'un `style` est signalée, ainsi que les éléments `<style>`. Les variables à valeur dynamique passent.
     - CA13 → **partiel**. Sont couverts :
       - une couleur en dur comme valeur de variable dans `style` ;
       - un littéral dans `fill`/`stroke` SVG ;
       - `bg-[#fff]`.
       Ne sont pas couverts : les chaînes JS/TS, le texte JSX, les autres fichiers de `src/`, et `styles.css` (l'outil ne lint pas le CSS).
     - CA14 → `shadcn/no-raw-colors` : palette et tokens non déclarés **couverts**. **`white` et `black` ne sont pas couverts** : la règle les accepte.
     - CA15 → `shadcn/no-arbitrary-values`, sans `allow` : **couvert**. `w-(--progress)` n'est pas signalé, ce qui correspond à CA15.
     - CA16 et CA17 → **non couverts**.
   - **Compléments dans le même bloc.** Une seule entrée `no-restricted-syntax` regroupe tous les sélecteurs, sinon le second bloc remplacerait le premier.
     - CA13 : ``#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(`` appliqué à `Literal`, `TemplateElement` et `JSXText`.
     - CA14 : ``(?:^|[\s:])[a-z][\w-]*-(?:white|black)\b`` appliqué à `Literal` et `TemplateElement`. Cela couvre `text-white`, `hover:bg-black`, `bg-white/50`, `fill-white`.
   - **Compléments pour CA17** (bloc `files: ["**/*.{js,jsx,ts,tsx,mjs}"]`, dossier ui compris) : `no-restricted-imports` avec `patterns: [{ regex: "^(?![./]|@/|@carbon/icons-react$).*(icon|lucide)", caseSensitive: false }]`.
   - **`scripts/check-src.mjs`**, qui parcourt `src/` sans le dossier ui :
     - échoue sur tout `.css` autre que `src/styles.css` (CA16) ;
     - applique la regex CA13 aux autres fichiers texte qui ne sont pas du JS/TS ;
     - applique à `src/styles.css` ``#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab)\(`` et sort `src/styles.css:<ligne>`. Le `\b` laisse passer `oklch(` sans laisser passer `lch(` ni `lab(`, et `var(--…)` passe (CA13) ;
     - échoue si `package.json` contient une dépendance qui correspond à la regex icônes, hors `@carbon/icons-react` (CA17).
   - Ignorés globalement : `dist`, `.output`, `.lighthouseci`, `src/routeTree.gen.ts`, `tests/fixtures`.
   - Script : `"lint": "eslint . && node scripts/check-src.mjs"`.
   - **Variables posées via `style`** : elles se lisent avec la syntaxe variable de Tailwind, par exemple `w-(--progress)` avec `style={{ '--progress': `${p}%` }}`. Le hero n'en a pas besoin.
4. **Icônes Carbon** — couvre CA17
   - La CLI shadcn ne connaît pas Carbon. Elle accepte `lucide`, `tabler`, `hugeicons`, `phosphor`, `remixicon` et `radix`. Avec une valeur inconnue, elle laisse les `IconPlaceholder` sans les transformer et l'import est cassé. On garde donc `iconLibrary: "lucide"`.
   - Le socle n'ajoute aucun composant shadcn.
   - Procédure pour chaque `shadcn add` :
     - la CLI réinstalle `lucide-react` et écrit des imports lucide dans `src/components/ui/`, ce qui fait échouer `pnpm lint` ;
     - remplacer chaque icône par son équivalent Carbon (`ChevronDownIcon` → `ChevronDown`, `XIcon` → `Close`, `CheckIcon` → `Checkmark`, `ChevronRightIcon` → `ChevronRight`), garder les classes de taille ;
     - lancer `pnpm remove lucide-react`.
   - Dans le hero : `import { ArrowUpRight } from '@carbon/icons-react'`, même tracé que le SVG du design. Le paquet déclare `sideEffects: false`.
5. **Pre-commit** — couvre CA18
   - `.githooks/pre-commit` lance `pnpm lint` sur tout le dépôt, ce qui correspond à CA18 (« un fichier du dépôt »).
   - `"prepare": "git config core.hooksPath .githooks || true"`. Le `|| true` est obligatoire, car il n'y a pas de `.git` pendant le build Railpack ni dans certains jobs.
6. **Portrait** — couvre CA10
   - Format WebP : un gain AVIF serait négligeable à cette taille, et WebP satisfait l'audit « formats modernes ».
   - Recadrage : pour une source de w × h pixels, carré de côté `0,4·w`, origine x = `0,2838·w`, y = `0,225·(h − 0,4·w)`. C'est l'équivalent de `background-size: 250%` avec `background-position: 47.3% 22.5%`.
   - Niveaux de gris, puis `contrast(0.95) brightness(0.9)` intégrés au fichier sous forme d'une transformation linéaire a = 0,855, b = 5,74 (sur 0 à 255).
   - 216 × 216, WebP qualité 80 environ, moins de 10 Ko, écrit dans `public/portrait.webp`.
   - Conversion faite une seule fois avec `pnpm dlx sharp-cli`, commande notée dans le message de commit. Seul le WebP est versionné.
   - Balise `<img>` avec `alt`, `width`/`height` 108 et `size-portrait`. Pas de `background-image`, qui exigerait un `style` ou une classe arbitraire.
7. **Hero** — couvre CA10, CA11
   - Structure : `main.overflow-x-clip`, puis une `section` en `min-h-dvh flex flex-col justify-center-safe gap-hero-gap px-gutter py-hero-y`. Pas d'indication « scroll ↓ ».
   - Contenu, dans l'ordre :
     - la ligne `// state…` en `font-mono text-annotation text-muted-foreground` ;
     - le portrait, puis `h1.text-display.whitespace-nowrap` avec `<span class="text-muted-foreground">CAILLE</span>` ;
     - l'accroche en `text-lead text-pretty` ;
     - `dl.grid.grid-cols-meta.gap-x-meta-col.gap-y-meta-row.font-mono.text-meta.max-w-meta`, avec les `dt` en `text-label uppercase text-muted-foreground self-baseline` et les `dd` en `text-foreground-secondary`, années en `text-muted-foreground whitespace-nowrap`.
   - Pastille du statut : `span[aria-hidden]` en `absolute -left-3.75 top-1/2 -translate-y-1/2 size-1.75 rounded-full bg-status ring-3 ring-status/15`.
   - Lien `a[href="/cv.pdf"]` « resume.pdf » en `border-b border-border pb-px no-underline hover:border-muted-foreground`, suivi de `<ArrowUpRight className="icon-inline" />`. Ni animation ni transition.
   - Marge à 320 px :
     - le h1 fait 28,8 px, le portrait 20,8 px et la marge latérale 19,2 px, soit environ 260 px occupés sur 320 ;
     - `// state…` tient sur 281 px pour 281,6 px disponibles, et passe à la ligne sinon ;
     - dans la liste, la colonne des libellés fait environ 70 px et celle des valeurs environ 190 px. Le plus long segment qui ne peut pas passer à la ligne, « · 2023–2025 », fait environ 82 px.
     - Aucune adaptation au-delà des tokens n'est nécessaire.
8. **SEO et `<head>`** — couvre CA1, CA2, CA3, CA4, CA5, CA6, CA20
   - Prérendu avec `crawlLinks: false`. Le crawler suit `/cv.pdf`, et la 404 ferait échouer le build. Les routes statiques restent trouvées par `autoStaticPathsDiscovery`.
   - `head()` de `/` :
     - title « Romain Caillé · Fullstack developer » ;
     - description « Fullstack developer, ready for the agentic era. Open to work, full-time or freelance, remote or relocation from Nantes, France. » ;
     - canonical vers `https://romain-caille.fr/` ;
     - `og:type`, `og:title`, `og:description`, `og:url`, et `og:image` vers `https://romain-caille.fr/og.png`, avec `og:image:width` et `og:image:height` ;
     - JSON-LD Person avec exactement les champs de CA6.
   - `__root.tsx` déclare `links: [{ rel: 'icon', href: 'data:,' }]`. Le navigateur ne demande alors pas `/favicon.ico` : pas de 404 en console, et l'audit `errors-in-console` de « Bonnes pratiques » reste vert sans aucune image. Il suffira de remplacer cette valeur quand Romain fournira le favicon.
   - `public/robots.txt` contient `User-agent: *`, `Allow: /` et `Sitemap: https://romain-caille.fr/sitemap.xml`.
9. **Image Open Graph** — couvre CA3
   - `scripts/og.html` fait 1200 × 630 : fond `var(--background)`, « Romain Caillé » en Instrument Sans 600, « Fullstack developer, ready for the agentic era. » en dessous.
   - Les couleurs viennent d'un lien vers `../src/styles.css` : le navigateur ignore `@import` et `@theme` et applique `:root`, où l'oklch est bien rendu. Les polices sont chargées par `@font-face` depuis `node_modules`.
   - `scripts/og.mjs` (commande `pnpm og`) ouvre le fichier dans le Chromium de Playwright, attend `document.fonts.ready`, puis écrit la capture dans `public/og.png`. L'image est versionnée.
10. **Tests** — couvre tous les CA
    - Fixtures de lint lintées avec l'API ESLint `lintText` sous des chemins virtuels `src/components/…` et `src/components/ui/…`.
    - `check-src.mjs` est lancé dans un répertoire temporaire.
    - Lecture des valeurs oklch dans `tokens.test.ts`, sans dépendance :
      - regex `--<nom>:\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)` ;
      - conversion : a = C·cos h, b = C·sin h, puis LMS = (L + …)³, puis sRGB linéaire avec les matrices inverses d'Ottosson ;
      - luminance WCAG calculée directement sur le sRGB linéaire (0,2126 R + 0,7152 G + 0,0722 B, valeurs bornées à [0, 1]) ;
      - pour CA8, la valeur est en plus réencodée en sRGB 8 bits et comparée à l'hex du design.
11. **Lighthouse CI** — couvre CA20
    - `lighthouserc.json` :
      - collecte : `staticDistDir: "dist/client"`, `maxAutodiscoverUrls: 0`, `numberOfRuns: 3`, `chromeFlags: "--no-sandbox --headless=new"`, sans `preset`, donc le profil mobile ;
      - assertions : les 4 catégories en `["error", { "minScore": 0.95, "aggregationMethod": "median-run" }]` ;
      - envoi : `filesystem` vers `.lighthouseci`.
12. **CI GitLab** — couvre CA19, CA20
    - `workflow:rules` : pipelines de MR et branche `main`.
    - Image `mcr.microsoft.com/playwright:v<version de @playwright/test>-noble`. Le `before_script` lance `corepack enable && pnpm install --frozen-lockfile`. Le store pnpm est mis en cache avec `pnpm-lock.yaml` comme clé.
    - Jobs :
      - `check` : `lint` (`pnpm lint`) et `unit` (`pnpm test`) ;
      - `build` : `pnpm build`, avec `dist/` en artefact ;
      - `verify` : `e2e` (`pnpm test:e2e`) et `lighthouse` (`CHROME_PATH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())") pnpm lhci`, avec `.lighthouseci/` en artefact `when: always`).
13. **Déploiement** — couvre CA4, CA5, CA10, CA21
    - Le `Staticfile` à la racine contient `index_fallback: false`. Sans lui, Railpack renvoie `index.html` en 200 pour toute URL inconnue. Avec lui, `/cv.pdf` et les URL inconnues répondent 404 (CA10).
    - Rien d'autre côté dépôt. Railpack détecte pnpm (`packageManager`) et Node (`engines.node`), lance `pnpm build` et sert `dist/client`.

### Stratégie de test
- Commandes pour le dev et le tester :
  - `pnpm lint` ;
  - `pnpm test` (`node --test "tests/unit/**/*.test.ts"`) ;
  - `pnpm build && pnpm test:e2e` ;
  - `pnpm build && pnpm lhci`.
- CA1 → e2e — `dist/client/index.html` est chargé par `page.setContent` avec JavaScript désactivé : `html[lang="en"]`, le h1 et la liste sont présents. Après déploiement : `curl -s https://romain-caille.fr | grep "Open to work"`.
- CA2 → e2e — pour chaque HTML de `dist/client` : un seul `title`, une description, une canonical absolue. Pour `/`, title et description sont exactement ceux de CA2.
- CA3 → e2e — les balises `og:*` sont présentes, `og:image` est absolue et pointe vers un fichier de `dist/client`, le PNG fait 1200 × 630 (en-tête IHDR). Vérification visuelle manuelle de `og.png`. Après déploiement : `curl -sI https://romain-caille.fr/og.png` répond 200.
- CA4 → e2e, puis vérification manuelle après déploiement — `sitemap.xml` liste chaque page prérendue en URL absolue, sans `/cv.pdf`. Après déploiement : `curl -s -w '%{http_code}' https://romain-caille.fr/sitemap.xml`.
- CA5 → e2e, puis vérification manuelle après déploiement — `robots.txt` contient `Allow: /` et la ligne Sitemap. Après déploiement : `curl -s -w '%{http_code}' https://romain-caille.fr/robots.txt`.
- CA6 → e2e, puis vérification manuelle — le JSON-LD est comparé champ par champ, puis l'URL déployée passe dans validator.schema.org.
- CA7 → unitaire — `components.json` a bien `style === "radix-lyra"`.
- CA8 → unitaire — chaque token est déclaré en oklch et redonne l'hex du design en 8 bits ; `@theme inline` expose le `--color-*` correspondant.
- CA9 → unitaire — contraste de `--foreground-faint` contre `--background` et `--surface-deep`, valeurs oklch converties : au moins 4,5 dans les deux cas.
- CA10 → e2e en 1440 × 900, puis vérification manuelle après déploiement :
  - textes, image `alt` en niveaux de gris (R = G = B sur un canvas), couleur atténuée de « CAILLE », lien `/cv.pdf` avec un `svg`, pastille, `document.getAnimations().length === 0` ;
  - après déploiement : `for u in cv.pdf page-inconnue; do curl -s -o /dev/null -w "%{http_code} $u\n" https://romain-caille.fr/$u; done` doit afficher `404` deux fois.
- CA11 → e2e en 320 × 568 — `documentElement.scrollWidth ≤ 320`. Pour chaque élément de CA10, la boîte de son texte (`Range.getBoundingClientRect`) est comprise entre 0 et 320, et `scrollWidth ≤ clientWidth`.
- CA12 → test du lint sur fixtures — `style={{ color: 'red' }}` et `style={{ left: x }}` échouent avec la ligne. `style={{ '--progress': p }}` passe. Le dossier ui est exempté.
- CA13 → test du lint sur fixtures :
  - un littéral hex, `rgb()`, `hsl()` ou `oklch()` échoue dans une chaîne TS, dans `style`, dans `fill` et dans un `.svg` de `src/` ;
  - un `styles.css` de fixture qui contient `#fff`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lab()`, `lch()` et `oklab()` sort une erreur par ligne ;
  - `oklch()` et `var(--x)` passent.
- CA14 → test du lint sur fixtures — `bg-red-500`, `text-zinc-400`, `text-white`, `hover:bg-black` et `bg-white/50` échouent dans `src/` et passent dans `src/components/ui/` ; `bg-primary` passe partout.
- CA15 → test du lint sur fixtures — `w-[37px]`, `p-[13px]`, `text-[15px]` et `bg-[#fff]` échouent avec la ligne ; `w-(--progress)` passe.
- CA16 → test du lint sur fixtures — avec `src/extra.css`, code différent de 0 et chemin affiché ; avec `src/styles.css` seul, code 0.
- CA17 → test du lint sur fixtures — `lucide-react`, `@tabler/icons-react`, `react-icons` et quatre autres bibliothèques échouent dans `src/` comme dans le dossier ui ; `@carbon/icons-react` passe. `check-src` échoue sur un `package.json` qui contient `lucide-react`.
- CA18 → manuel, sur une branche jetable `git switch -c tmp/ca18` :
  1. `printf "export const X = () => <div style={{ color: 'red' }} />\n" > src/ca18.tsx && git add src/ca18.tsx && git commit -m ca18` : commit refusé, `src/ca18.tsx:1` affiché.
  2. `git commit --no-verify -m ca18 && git commit --allow-empty -m ca18-bis` : le second commit est refusé, car le fichier est désormais dans le dépôt.
  3. Nettoyage : `git switch - && git branch -D tmp/ca18`.
- CA19 → manuel — MR jetable qui ajoute `bg-red-500` dans `src/`, commitée avec `--no-verify`. Attendu : job `lint` en échec, pipeline en échec.
- CA20 → Lighthouse CI, plus e2e :
  - le job `lighthouse` tourne sur chaque MR ;
  - une MR jetable qui retire la description le fait échouer ;
  - en e2e, le chargement de `/` ne déclenche aucune requête `/favicon.ico` ni aucune erreur console.
- CA21 → manuel après déploiement — `curl -sI https://romain-caille.fr` répond 200 en HTTPS, et le hash du JS principal servi est identique à celui de l'artefact `dist/` du pipeline `main`.

### Décisions à valider
- **Pre-commit : hook natif, husky seul, ou husky + lint-staged ?**
  - A, hook natif :
    - aucune dépendance ;
    - lint de tout le dépôt à chaque commit, donc conforme à CA18 (« un fichier du dépôt ») ;
    - à maintenir : un fichier shell et une ligne `prepare`, sur un mécanisme Git stable (`core.hooksPath`).
  - Husky seul :
    - une dépendance de dev ;
    - même comportement que A (`.husky/pre-commit` lance `pnpm lint`), donc conforme ;
    - apporte l'installation par `prepare: "husky"` et la désactivation par `HUSKY=0` ;
    - à maintenir : les montées de version, le format de configuration ayant déjà changé en v9.
  - Husky + lint-staged :
    - deux dépendances, dont une dizaine tirées par lint-staged ;
    - ne lint que les fichiers indexés : un fichier en violation déjà dans le dépôt ne bloque pas le commit, donc **non conforme à CA18 tel qu'il est écrit** ;
    - `check-src` (CA16, `package.json`) doit de toute façon parcourir tout le dépôt, et le gain de vitesse est nul sur un dépôt de cette taille.
  - Recommandation : **A confirmée**. Husky seul fait la même chose avec une dépendance en plus, et lint-staged contredit CA18. Effet de bord commun à A et à husky seul : un fichier non suivi en violation dans `src/` bloque aussi le commit.

### Risques
- `@shadcn/lint` est en 0.2.0, avant la 1.0, et son comportement peut changer. On épingle la version exacte, et les fixtures de CA12 à CA17 servent de filet.
- Performance mobile au moins à 95 sur des runners partagés : la simulation Lantern dépend du CPU, et l'hydratation React plus Router (environ 100 Ko gzip) pèse sur le TBT. Parades : médiane de 3 runs et devtools retirés ; runner dédié sur le VPS si les faux négatifs se répètent.
- Décalage de mise en page au chargement des polices, sur un h1 qui monte à 150 px. La police du h1 est préchargée ; à surveiller dans les rapports Lighthouse.
- Le sitemap natif est documenté avec `crawlLinks: true`. S'il sort vide, le test CA4 échoue : il faudra déclarer `pages: [{ path: '/' }]`.
- Les regex de CA13 et CA14 peuvent donner des faux positifs, par exemple `#add`, `#123` ou « pitch-black » dans une chaîne. Réponse : un `eslint-disable-next-line` justifié.
- Les valeurs oklch ont été calculées à la main. Si un canal ne retombe pas sur l'hex du design, le test CA8 échoue : recalculer avec un convertisseur et garder 4 décimales.
- La CLI shadcn ne génère pas d'icônes Carbon : chaque `shadcn add` impose un remplacement à la main, bloqué par le lint tant qu'il n'est pas fait.
- L'image Docker Playwright de la CI doit rester alignée sur la version de `@playwright/test`.

### Ambiguïtés de la spec
- **CA13, dans `styles.css`** : les mots-clés de couleur (`red`, `white`, `transparent`, `currentColor`) et la fonction `color()` ne figurent pas dans la liste.
  - Lue au pied de la lettre, la liste laisse passer `color: red`, ce qui contredit la décision « couleurs uniquement en `oklch()` ».
  - Proposition : interdire aussi `color()` et les noms de couleur CSS, par une liste de 148 noms dans `check-src`. Garder `transparent`, `currentColor` et `inherit`, qui ne sont pas des couleurs du design.
  - Le plan n'utilise aucun de ces mots-clés.

## Décisions
- 2026-10-01 — Le design fait foi pour les couleurs, la typo et les espacements, posés sur une base shadcn Lyra (validée par Romain)
- 2026-10-01 — Deux specs : `portfolio-socle`, puis `portfolio-pages` (validée par Romain)
- 2026-10-01 — Hébergement sur le VPS OVH via Dokploy et Railpack ; déploiement inclus dans le socle (validée par Romain)
- 2026-10-01 — Lighthouse ≥ 95 en mobile sur les 4 catégories, vérifié en CI de façon bloquante (validée par Romain)
- 2026-10-01 — Lint bloquant au pre-commit et en CI GitLab (validée par Romain)
- 2026-10-01 — Site en anglais uniquement, sur le domaine romain-caille.fr (validée par Romain)
- 2026-10-01 — SEO du socle : title/description/canonical, Open Graph + image, sitemap + robots.txt, JSON-LD Person (validée par Romain)
- 2026-10-01 — Couleurs : tokens de `styles.css` uniquement dans le code ; un token peut pointer vers la palette Tailwind (validée par Romain)
- 2026-10-01 — Composants générés par shadcn exemptés des règles de lint, sauf pour les icônes (validée par Romain)
- 2026-10-01 — Outil de lint : `@shadcn/lint` (validée par Romain)
- 2026-10-01 — Texte discret éclairci jusqu'au contraste WCAG AA de 4,5:1 (validée par Romain)
- 2026-10-01 — Le socle livre le hero du design, statique (validée par Romain)
- 2026-10-01 — Attribut `style` autorisé uniquement pour définir des variables CSS (validée par Romain)
- 2026-10-01 — Ligne « resume » gardée dans le hero ; le lien vers `cv.pdf` renvoie une 404 tant que le fichier n'est pas fourni (validée par Romain)
- 2026-10-01 — Image de partage fabriquée par l'équipe à partir du design (validée par Romain)
- 2026-10-01 — Le design reste hors du dépôt ; les médias sont copiés au besoin, puis convertis dans un format léger (validée par Romain)
- 2026-10-01 — Couleurs écrites uniquement en `oklch()`, y compris dans `styles.css` (validée par Romain)
- 2026-10-01 — `text-white`, `bg-black`, etc. bloqués hors composants shadcn ; un token de `styles.css` peut pointer vers une variable Tailwind (validée par Romain)
- 2026-10-01 — Pas de favicon dans le socle, Romain le fournira plus tard (validée par Romain)
- 2026-10-01 — Largeur minimale prise en charge : 320 px, sans débordement horizontal ; défilement vertical permis (validée par Romain)
- 2026-10-01 — Title et description de `/` proposés par l'architect (validée par Romain)
- 2026-10-01 — Hero statique d'un écran (`min-h-dvh`), sans le défilement sur 130vh du design (validée par Romain)
- 2026-10-01 — Prérendu statique, `radix-lyra`, polices Fontsource, Playwright, Lighthouse CI en dépendance de dev avec médiane de 3 runs, portrait converti une fois en WebP (validée par Romain)
- 2026-10-01 — `Staticfile` de Railpack accepté dans le dépôt pour renvoyer de vraies 404 (validée par Romain)
- 2026-10-01 — Pre-commit : hook natif (option A), après comparaison avec husky et husky + lint-staged (validée par Romain)
- 2026-10-01 — Couleurs nommées et `color()` bloquées dans `styles.css`, sauf `transparent` et `currentColor` ; ambiguïté CA13 du plan tranchée selon la proposition de l'architect (validée par Romain)
- 2026-10-01 — Plan technique v2 validé (validée par Romain)
- 2026-10-01 — Lighthouse CI : réécriture `/index.html` → `/` dans le routeur, plutôt qu'une liste d'URL à maintenir dans `lighthouserc.json` (validée par Romain)
- 2026-10-01 — Sitemap : correctif de l'espace de noms annulé. On garde le `xmlns` en `https` tel que généré par TanStack ; CA4 et ses tests reviennent à leur version d'origine. Le point est signalé dans la MR (validée par Romain)
- 2026-10-01 — `src/components/ui/button.tsx`, généré par le template, est gardé pour `portfolio-pages` (validée par Romain)
- 2026-10-01 — Passage du prérendu statique servi par Caddy au mode serveur Node détecté par Railpack, le setup habituel de Romain, pour obtenir de vraies 404 (CA22). Railpack reste en 0.15.4, la variable `RAILPACK_SPA_OUTPUT_DIR` est retirée de Dokploy, et le `Staticfile` est retiré du dépôt. Remplace la décision « prérendu statique » (décision 1 du plan) et la décision « `Staticfile` accepté » (validée par Romain)
- 2026-10-02 — Vérification de srvx 1.0.5 : GO.
  - Version `latest` sur npm, publiée le 2026-09-14 par `pi0`, comme toutes les versions depuis 0.11.20. Dépôt `h3js/srvx`, aucune dépendance, aucun script d'installation. L'intégrité du tarball correspond au registre.
  - OSV, GitHub Advisory Database et `npm audit` : 0 vulnérabilité. Le seul advisory connu (GHSA-p36q-q72m-gchr) vise les versions antérieures à 0.11.13.
  - Essai local : `br` en 4 à 5 ms, pour 109 555 o au lieu de 94 028 o en qualité 11 ; images non recompressées ; `ETag` et `Vary` présents.
  - Réserves : pas d'attestation de provenance npm, comme pour 0.11.22 ; version majeure récente, donc version exacte.
- 2026-10-02 — Correctif de B4 : option A, srvx 1.0.5, à condition qu'une vérification la valide d'abord. Il faut que la version existe sur le registre npm, qu'elle soit publiée par les mainteneurs habituels et qu'aucune CVE ni advisory ne la vise. Sinon, repli sur `serve` (option C) avec un `404.html`. Pas de `Cache-Control`. Seuil du test de temps à 100 ms. Romain ne demande pas de validation supplémentaire pour la suite de ce correctif (validée par Romain)
- 2026-10-01 — B4 (brotli à la volée) corrigé avant le merge de la bascule serveur. L'architect propose le correctif le plus simple, et Romain le valide (validée par Romain)
- 2026-10-01 — Révision B3 validée : script `start` avec srvx 0.11.22 en dépendance directe, préféré à `serve` utilisé dans clockinsnap, parce que c'est le serveur que TanStack documente. Lighthouse CI inchangé (il audite `dist/client`). Les e2e existants sont inchangés, avec un nouveau `server.spec.ts` sur le serveur lancé. Ligne « Hébergement » reformulée. Changements Dokploy après le merge seulement (validée par Romain)
- 2026-10-01 — B1 (build Railpack) corrigé directement par le dev, sans test de reproduction préalable (validée par Romain)
- 2026-10-01 — Lighthouse CI uniquement sur les pipelines de `main`, plus sur les MR, pour préserver le quota du free tier. Une baisse de score n'empêche plus le merge et sera détectée après coup (validée par Romain)
- 2026-10-01 — Livraison : CA1 à CA18 vérifiés (tests, et CA18 en local sur une branche jetable). CA19 et CA20 restent à vérifier sur le premier pipeline de la MR, CA21 après le merge, ainsi que les vérifications post-déploiement de CA3 à CA6 et CA10. Review OK au 2e passage.
