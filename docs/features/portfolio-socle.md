# Portfolio — socle technique

## User story
En tant que Romain, développeur du portfolio, je veux un socle TanStack Start + shadcn (style Lyra, tokens du design) + icônes Carbon, protégé par des règles de lint, déployé sur romain-caille.fr avec la section hero du design, afin de construire les sections suivantes sans m'écarter du design system, avec un SEO et des performances vérifiés automatiquement.

## Critères d'acceptation

### Rendu et SEO
- [ ] CA1 — Étant donné le build de production, quand je requête `/` avec JavaScript désactivé, alors le HTML reçu contient le contenu de la page et la balise `<html lang="en">`.
- [ ] CA2 — Étant donné une route du site, quand j'inspecte son `<head>`, alors il contient un `<title>`, une `meta name="description"` et un `link rel="canonical"` propres à la route, la canonical étant une URL absolue en `https://romain-caille.fr/…`.
- [ ] CA3 — Étant donné une route du site, quand j'inspecte son `<head>`, alors il contient `og:title`, `og:description`, `og:url` et `og:image` ; l'URL de `og:image` est absolue et répond 200 avec une image de 1200 × 630, sur le fond du design, qui affiche « Romain Caillé » et « Fullstack developer, ready for the agentic era. ».
- [ ] CA4 — Étant donné le site déployé, quand je requête `/sitemap.xml`, alors il répond 200 et liste toutes les routes publiques en URL absolues `https://romain-caille.fr/…`.
- [ ] CA5 — Étant donné le site déployé, quand je requête `/robots.txt`, alors il répond 200, autorise l'indexation et référence `https://romain-caille.fr/sitemap.xml`.
- [ ] CA6 — Étant donné la page d'accueil, quand je passe son HTML au validateur schema.org, alors il détecte un objet `Person` sans erreur avec : `name` « Romain Caillé », `url` « https://romain-caille.fr », `jobTitle` « Fullstack developer », `sameAs` [« https://gitlab.com/romain.caille », « https://www.linkedin.com/in/romain-caill%C3%A9/ »].

### Thème et contenu
- [ ] CA7 — Étant donné `components.json`, quand je le lis, alors le style shadcn déclaré est Lyra.
- [ ] CA8 — Étant donné `styles.css`, quand je le lis, alors il définit en variables CSS tous les tokens listés dans « Contraintes > Tokens du design », et le thème shadcn les consomme.
- [ ] CA9 — Étant donné le token « texte discret », quand je mesure son contraste sur le fond de page (`#121417`) et sur la surface profonde (`#0d0f12`), alors il est d'au moins 4,5:1 dans les deux cas.
- [ ] CA10 — Étant donné `https://romain-caille.fr`, quand je l'ouvre, alors la section hero du design s'affiche, sans animation, avec :
  - la ligne `// state: idle · 0 packet · 3 stages` ;
  - le portrait en niveaux de gris, avec le texte alternatif « Portrait of Romain Caillé » ;
  - le titre `h1` « Romain CAILLE », « CAILLE » en texte atténué ;
  - l'accroche « Fullstack developer, ready for the agentic era. » ;
  - la liste status / contract / location / experience / education / english / resume, avec les textes du design (« Open to work · available now » en accent statut précédé d'une pastille, les trois expériences Spotime, Enedis et U Tech avec leurs années, « Master's, IT & Information Systems · EPSI », « C1 ») ;
  - sur la ligne resume, un lien « resume.pdf » vers `/cv.pdf`, suivi de l'icône Carbon flèche en haut à droite. Le fichier n'est pas encore fourni : le lien renvoie une 404 d'ici là, ce qui est accepté.
- [ ] CA11 — Étant donné une fenêtre de 360 px de large, quand j'ouvre la page d'accueil, alors aucun défilement horizontal n'apparaît et tout le contenu de CA10 est visible.

### Garde-fous (lint)
*Périmètre : CA12 à CA16 s'appliquent à tout `src/` sauf le dossier des composants générés par la CLI shadcn. CA17 (icônes) s'applique partout, y compris ce dossier.*
- [ ] CA12 — Étant donné un composant dont l'attribut `style` définit une propriété CSS (ex. `style={{ color: 'red' }}`, `style={{ left: x }}`), quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne. Un attribut `style` qui ne définit que des variables CSS (ex. `style={{ '--progress': p }}`) passe.
- [ ] CA13 — Étant donné une couleur littérale (`#hex`, `rgb()`, `hsl()`, `oklch()`) dans un fichier autre que `styles.css`, y compris comme valeur d'une variable CSS, quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne.
- [ ] CA14 — Étant donné une classe de couleur de la palette Tailwind par défaut (ex. `bg-red-500`, `text-zinc-400`), quand je lance la commande de lint, alors elle échoue ; une classe de token défini dans `styles.css` (ex. `bg-primary`, `text-muted-foreground`) passe. Un token peut lui-même pointer vers une couleur de la palette Tailwind, à l'intérieur de `styles.css`.
- [ ] CA15 — Étant donné une classe Tailwind à valeur arbitraire (ex. `w-[37px]`, `p-[13px]`, `text-[15px]`, `bg-[#fff]`), quand je lance la commande de lint, alors elle échoue en indiquant le fichier et la ligne.
- [ ] CA16 — Étant donné un fichier `.css` autre que `styles.css` dans `src/`, quand je lance la commande de lint, alors elle échoue.
- [ ] CA17 — Étant donné un import d'icône depuis une autre librairie que `@carbon/icons-react` (ex. `lucide-react`), quand je lance la commande de lint, alors elle échoue ; et `lucide-react` est absent de `package.json`.
- [ ] CA18 — Étant donné un fichier indexé qui viole une règle de CA12 à CA17, quand je lance `git commit`, alors le commit est refusé.
- [ ] CA19 — Étant donné une MR qui contient une violation d'une règle de CA12 à CA17, quand la CI GitLab s'exécute, alors le pipeline échoue.

### Performance
- [ ] CA20 — Étant donné une MR, quand la CI GitLab s'exécute, alors Lighthouse (profil mobile) tourne sur chaque route du build, et le pipeline échoue si l'un des scores Performance, Accessibilité, Bonnes pratiques ou SEO est inférieur à 95.

### Déploiement
- [ ] CA21 — Étant donné un merge sur `main`, quand le déploiement Dokploy se termine, alors `https://romain-caille.fr` sert la version mergée en HTTPS.

## Hors scope
- Toutes les sections du design autres que le hero : barre pipeline, terminal `events.log`, overview, projets, contact (spec `portfolio-pages`).
- Toutes les animations, y compris celles du hero (indication « scroll ↓ to emit romain.init », lignes qui défilent, pastille pulsante).
- Le fichier `cv.pdf` lui-même : Romain l'ajoutera plus tard.
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
- Hébergement : VPS OVH, déploiement Dokploy, build Railpack.
- Dépôt et CI : GitLab.
- Domaine : `romain-caille.fr`.
- Langue : anglais uniquement.

### Tokens du design
Relevés dans le HTML du design. Les noms sont indicatifs ; le nommage final revient à l'architect.

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

## Plan technique
*(À remplir par l'architect.)*

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
