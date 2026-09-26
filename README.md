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
