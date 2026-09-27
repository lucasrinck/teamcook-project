# teamcook-project

Monorepo React (Vite) + Node (Express), géré avec les npm workspaces.

## Structure

```
client/                 Front-end React (Vite)
  src/
    components/         Composants UI
    services/api.js     Appels HTTP vers le back
    App.jsx, main.jsx
server/                 API Node / Express
  src/
    routes/             Définition des routes (/api/...)
    controllers/        Logique des routes
    app.js              Config Express (middlewares, routes, erreurs)
    index.js            Démarrage du serveur
```

## Démarrer

```bash
npm install
cp server/.env.example server/.env
npm run dev        # client sur :5173, API sur :3001
```

En dev, Vite redirige `/api/*` vers le serveur (voir `client/vite.config.js`).

## Protection de la branche `main`

La branche `main` est protégée par un ruleset GitHub (`protect-main`). Aucun push direct n'est possible : toute modification passe par une pull request validée.

### Règles appliquées

| Règle | Effet |
|---|---|
| Pull request obligatoire | Aucun push direct sur `main` |
| 1 approbation requise | La PR doit être approuvée par un autre membre de l'équipe |
| Approbation du dernier push | Le dernier push doit être approuvé par quelqu'un d'autre que son auteur |
| Invalidation des approbations obsolètes | Une approbation est annulée si de nouveaux commits sont poussés |
| Résolution des conversations | Tous les commentaires de review doivent être résolus |
| Status checks obligatoires | Les jobs CI `client` et `server` doivent réussir |
| Branche à jour | La PR doit être à jour avec `main` avant le merge |
| Force push bloqué | L'historique de `main` ne peut pas être réécrit |
| Suppression bloquée | La branche `main` ne peut pas être supprimée |

Aucun contournement n'est autorisé (bypass list vide).

### Intégration continue

Le workflow `.github/workflows/ci.yml` s'exécute sur chaque pull request vers `main` et sur chaque push sur `main`. Il comporte deux jobs :

- `client` : installation, audit des dépendances, lint, tests et build du front React
- `server` : installation, audit des dépendances, lint et tests du back Node

### Contribuer

1. Créer une branche contenant la clé du ticket Jira : `git checkout -b SCRUM-XX-description`
2. Inclure la clé dans les messages de commit : `git commit -m "SCRUM-XX description"`
3. Pousser la branche et ouvrir une pull request vers `main` avec la clé dans le titre
4. Attendre que les checks `client` et `server` passent au vert
5. Obtenir une approbation et résoudre les commentaires de review
6. Merger

La clé Jira dans la branche, les commits et le titre de la PR permet de retrouver automatiquement le suivi dans le ticket correspondant.
