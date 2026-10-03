# AGENTS.md — portfolio romain-caille.fr

Instructions pour tout agent de code (Claude Code, Codex, Cursor…) qui travaille sur ce dépôt.

## Projet
- Portfolio de Romain Caillé, en ligne sur https://romain-caille.fr.
- Contenu du site **en anglais**. Specs, docs, commits et MR **en français**.
- Stack : TanStack Start (React 19, Vite 8, TypeScript), shadcn/ui en style `radix-lyra`, Tailwind CSS 4, icônes `@carbon/icons-react`, Node 24, pnpm 11.
- Les specs vivent dans `docs/features/<slug>.md`. La spec fait contrat : critères d'acceptation, hors scope, contraintes, plan technique, décisions.
- Design de référence (hors dépôt) : `~/Downloads/Portfolio Event-Driven/Portfolio Event-Driven.dc.html`. Les médias de `uploads/` sont copiés au besoin et convertis en WebP.

## Commandes
| Usage | Commande |
|---|---|
| Dev | `pnpm dev` (port 3000) |
| Build (prérendu + sitemap) | `pnpm build` |
| Serveur de prod en local | `pnpm start`, après `pnpm build` (srvx, `PORT` ou 3000) |
| Lint (vérification seule) | `pnpm lint` (ESLint, puis `scripts/check-src.mjs`) |
| Types | `pnpm typecheck` |
| Tests unitaires | `pnpm test` |
| Tests e2e | `pnpm build && pnpm test:e2e` (Playwright lance `pnpm start` sur le port 3100) |
| Lighthouse | `pnpm build && pnpm lhci` |
| Image Open Graph | `pnpm og` (régénère `public/og.png`) |
| CV en PDF | `pnpm cv [dossier]` (régénère `public/resume-romain-caille.pdf` et `public/cv-romain-caille.pdf` depuis le dossier de design, `~/Downloads/Portfolio Event-Driven` par défaut ; réseau requis) |

## Design system : règles bloquantes
Elles sont vérifiées par `pnpm lint`, au pre-commit et en CI. Elles s'appliquent à tout `src/`, sauf `src/components/ui/` (code généré par shadcn), qui n'est soumis qu'à la règle des icônes.
- **`style`** : seulement pour définir des variables CSS (`style={{ '--progress': p }}`), lues avec la syntaxe Tailwind `w-(--progress)`. Aucune propriété CSS directe.
- **Couleurs** :
  - jamais de couleur littérale hors de `src/styles.css` ;
  - dans `styles.css`, uniquement `oklch()` ou `var(--…)`, sans hex, `rgb`, `hsl`, `color()` ni couleur nommée (`transparent` et `currentColor` restent autorisés) ;
  - dans le code, uniquement des classes de tokens (`bg-background`, `text-muted-foreground`…). Pas de palette Tailwind (`bg-red-500`), ni `text-white` ou `bg-black`.
- **Valeurs arbitraires** : interdites (`w-[37px]`, `text-[15px]`…). Une valeur manquante devient un token dans `@theme` de `styles.css`.
- **CSS** : `src/styles.css` est le seul fichier CSS.
- **Icônes** : `@carbon/icons-react` uniquement, partout. Après chaque `shadcn add`, la CLI réinstalle `lucide-react` : remplace ses icônes par leur équivalent Carbon, puis lance `pnpm remove lucide-react`.
- **Thème** : sombre uniquement, rayons à 0, polices Instrument Sans et IBM Plex Mono via Fontsource.

## Hébergement : ne pas casser
- Déploiement par Dokploy et Railpack **0.15.4**. Cette version est imposée et ne peut pas être changée.
- **Le script `start` est porteur.** Railpack exécute `pnpm run start` (srvx). Sans ce script, il bascule sans prévenir en site statique servi par Caddy : plus de vraies 404, ou un site cassé.
- Ne jamais réintroduire `RAILPACK_SPA_OUTPUT_DIR`, ni de `Staticfile` ou de `Caddyfile`.
- `vite.config.ts` fixe `preview.host = "127.0.0.1"` : le prérendu en a besoin sous Railpack, où `localhost` désigne d'abord `::1`. Ne pas le retirer.
- `srvx` est épinglé en **version exacte** (1.0.5). Il sert aussi au rendu TanStack (h3) : toute montée de version doit passer `tests/e2e/server.spec.ts`.
- Dépendances : versions exactes pour les paquets en 0.x. Aucune nouvelle dépendance sans validation de Romain.

## CI GitLab : quota free tier
- **Ne jamais déclencher, relancer ni annuler un pipeline.** Les reproductions se font en local.
- Pipelines : sur MR, `lint`, `unit`, `build` et `e2e` ; sur `main`, la même chose plus `lighthouse`, avec un timeout de 10 min et un seuil de 95 sur les 4 catégories en mobile.
- Un seul push par MR, une fois le travail relu.
- Avant tout push qui déclenche un pipeline, les e2e passent aussi dans l'image de la CI, limitée à 1 CPU. Le runner de la CI est environ 6 fois plus lent qu'un Mac : un test sensible au temps peut passer en local et échouer en CI. Il faut Docker, et l'image doit rester celle de `.gitlab-ci.yml` :
  ```sh
  git archive HEAD | docker run -i --rm --cpus=1 mcr.microsoft.com/playwright:v1.63.0-noble \
    bash -c 'mkdir /work && cd /work && tar -xf - && corepack enable && CI=true pnpm install --frozen-lockfile && pnpm build && CI=true pnpm test:e2e'
  ```
- Commits qui ne touchent que la doc : `[skip ci]` dans le message.

## Git
- Branches : `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, créées depuis `main` à jour. MR vers `main` avec `glab`.
- Commits conventionnels en français : `type(scope): résumé`, par exemple `fix(portfolio-socle): …`. Commiter à chaque étape validée.
- Hook pre-commit natif (`.githooks/pre-commit`, qui lance `pnpm lint`). Ne jamais le contourner avec `--no-verify`.
- `.claude/` est ignoré : c'est la mémoire locale des agents.

## Definition of Done
- Tous les critères d'acceptation de la spec sont cochés, ou leur vérification manuelle restante est notée.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` et `pnpm build && pnpm test:e2e` passent.
- Avant le push, les e2e passent aussi dans l'image de la CI limitée à 1 CPU (voir « CI GitLab »).
- `pnpm lhci` passe en local dès qu'un changement touche le rendu.
- Les tests n'ont pas été modifiés depuis leur commit rouge.
- Toute décision prise en route est datée dans la section « Décisions » de la spec.
- Aucun pipeline déclenché, hors celui de la MR.

## Points connus
- CV : `/resume-romain-caille.pdf` (anglais) est téléchargé par les liens `resume.pdf`. `/cv-romain-caille.pdf` (français) est en ligne, mais aucun lien n'y mène encore. `/cv.pdf` n'existe pas et répond 404.
- Favicon : `public/favicon.svg`, `favicon.ico` et `apple-touch-icon.png` sont produits une fois par `node scripts/favicon.mjs <source.svg>`, puis versionnés.
- Le sitemap généré par TanStack déclare `xmlns` en `https://` au lieu de `http://`. Gardé tel quel par décision.
