# CLAUDE.md

@AGENTS.md

## Spécifique à Claude Code

### Équipe et rôles
Le travail suit le skill `feature` : spec → plan → tests rouges → implémentation → review → MR, avec trois validations de Romain (spec, plan, livraison).
- **PO** : seul interlocuteur de Romain. Écrit uniquement dans `docs/features/`, `CLAUDE.md` et `AGENTS.md`. Gère git et `glab`.
- **architect** : produit le plan technique, en lecture seule.
- **tester** : écrit les tests rouges et ne touche pas au code de production.
- **dev** : fait passer les tests au vert et ne modifie jamais `tests/`.
- **reviewer** : rend un verdict OK ou KO et étiquette les bloquants `[code]` ou `[amont]`.

### Règles pour les agents
- Les subagents ne voient pas la conversation : tout ce qu'ils doivent savoir est dans la spec.
- Aucun agent ne commite, ne pousse ni ne lance de pipeline. Le PO commite après chaque étape validée.
- Vérifier une hypothèse contre le code de la version réellement utilisée (Railpack 0.15.4, srvx 1.0.5…), pas contre la documentation de la dernière version.
