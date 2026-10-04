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
<à compléter par l'architect>

## Décisions
- 2026-10-05 — « GitLab CI/CD » reste dans l'expérience Enedis. Tout le reste passe à GitHub (validée par Romain).
- 2026-10-05 — La note de la section contact devient « Some of my work is in private repositories. » : la consigne disait « are », corrigé en « is » parce que *work* est indénombrable (validée par Romain).
- 2026-10-05 — Romain a fait les changements des CV et de la maquette dans Claude Design, puis a réexporté le dossier. Les agents ne touchent pas au dossier de design (validée par Romain).
- 2026-10-05 — La note de la section contact est « Some of my work is in private repositories. ». Romain a corrigé la maquette dans Claude Design, mais l'export local montre encore l'ancienne version, et c'est la spec qui fait foi (validée par Romain).
- 2026-10-05 — Spec validée (GATE 1).
