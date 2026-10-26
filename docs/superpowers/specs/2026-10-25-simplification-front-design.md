# Simplification du front AFTERDARK : document de conception

Date : 25/10/2026

## 1. Intention

AFTERDARK est un projet scolaire (React → Express → Supabase) qui sera présenté en
**soutenance**. L'étudiant doit pouvoir expliquer **chaque fichier et chaque ligne**
au professeur. Le front actuel fait environ 3 000 lignes, dont la moitié correspond à des
bonus (animations, favoris, notifications, carrousel...) que l'étudiant ne maîtrise pas.

But : **réduire la complexité du front** pour qu'un débutant puisse le présenter, tout en
gardant un site propre et la carte, qui est « le cœur du site ».

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Chaque fichier restant doit pouvoir s'expliquer avec les notions vues en cours :
  composants, props, `useState`, `useEffect`, `fetch` via `api.ts`, `map`, conditions.
- Le front respecte toujours la grille du professeur : page client avec des **cartes en
  flex**, page gérant avec un **formulaire en `useState`**, ajouter, modifier et supprimer
  qui appellent les 4 routes de l'API, avec le message 400 du serveur affiché quand un
  champ obligatoire est vide.
- Le site reste présentable : même identité visuelle (couleurs, polices, fond sombre).

**Non-objectifs**
- Aucune modification du **serveur** (`server/`), de la **base** (`supabase/`) ni de
  la CI.
- Aucune nouvelle fonctionnalité.

**Anti-objectifs (ce qui ferait échouer le travail, même si le code compile)**
- Modifier la carte ou les marqueurs (voir § 4).
- Modifier le comportement de la protection admin (voir § 4).
- Ajouter une bibliothèque.
- Remplacer de la complexité par une autre « astuce » difficile à expliquer (expression
  régulière, `useCallback` inutile, `useMemo`, `ref`, Context...).

## 3. Contraintes

- TypeScript strict, Tailwind v4 (`@theme` dans `index.css`), react-router, Vite.
  `npm run build -w client` (`tsc --noEmit && vite build`) doit passer, car la CI
  l'exécute. `npm audit` aussi.
- **Ne jamais ajouter de bibliothèque.** En supprimer une est autorisé
  (Framer Motion, voir § 5).
- Le code contient déjà des **commentaires pédagogiques en français** (branche
  `commentaires-code`). Tout fichier modifié garde ce style : un commentaire court en
  français au-dessus de chaque bloc, qui dit à quoi il sert.
- L'étudiant fait **lui-même** les tests d'écriture sur la vraie base Supabase. Le
  constructeur ne lance que des vérifications en lecture (build, typecheck, affichage).
- La branche `main` est protégée : on travaille sur une nouvelle branche créée depuis
  `commentaires-code`, avec un commit par étape, puis une PR.

## 4. Ce qui NE change PAS (décisions de l'étudiant)

- **`components/SpotMap.tsx`** : le fichier reste **identique**, ainsi que tout ce dont il
  dépend :
  - `components/Icon.tsx` (SpotMap importe `iconSvg`). Le fichier reste entier ;
  - la section « Carte (Leaflet) » de `styles/index.css` (`.map-frame`, `.map-tiles-*`,
    `.spot-marker*`, `.leaflet-*`, et le keyframe `marker-pulse` s'il est défini
    ailleurs dans le fichier) ;
  - son interface (`spots`, `selectedId`, `onSelect`) : ExplorerPage continue de lui
    passer les lieux filtrés, et un clic sur un marqueur ouvre le panneau de détail.
- **La protection admin** : `hooks/useAdminToken.ts`, `components/admin/UnlockScreen.tsx`,
  `pages/AdminPage.tsx`, `services/api.ts` (`verifyAdminToken`, header
  `x-admin-token`). Ces fichiers restent **identiques**. Le comportement reste le même :
  un 401 renvoie à l'écran de déverrouillage.
- *(Choix du concepteur)* `services/api.ts`, `hooks/useSpots.ts`,
  `pages/NotFoundPage.tsx`, `main.tsx` et `components/SpotImage.tsx` restent identiques.
  SpotImage garde donc son icône dans le visuel « image indisponible » : c'est une
  exception à la règle « plus d'icônes » du § 5, puisque `Icon.tsx` reste de toute façon.

## 5. Ce qui est retiré (décisions de l'étudiant)

| Élément | Fichiers concernés |
|---|---|
| **Favoris** (bouton ♥, filtre « Mes favoris », `localStorage`) | supprimer `hooks/useFavorites.ts` et `components/SpotActions.tsx`, et retirer leurs usages |
| **Notifications** (toasts, Context) | supprimer `hooks/useToast.tsx` et retirer `ToastProvider` de `App.tsx` |
| **Animations** (intro, `Reveal`, cartes qui glissent, panneau qui coulisse, `AnimatePresence`) | supprimer `components/Motion.tsx`, retirer `MotionConfig` de `App.tsx`, retirer tout `motion.*`, puis **désinstaller `framer-motion`** (`client/package.json` + lockfile) |
| **Filtres ville et favoris**, bouton « Filtres » repliable sur mobile avec compteur | `components/FiltersBar.tsx`, `utils/spots.ts` |
| **Étiquette « Lieu fictif »** et l'expression régulière `DEMO_PREFIX` | `DemoTag` dans `Badges.tsx`, `readDescription` dans `utils/spots.ts`. La description s'affiche telle quelle, préfixe `[Démo — lieu fictif]` compris. |
| **Recherche sans accents** (`normalizeText`, `normalize('NFD')`) | remplacée par `toLowerCase().includes(...)` |
| **Carrousel du panneau de détail**, fermeture à la touche Échap | `components/SpotDetail.tsx` |
| **Panneau latéral et fenêtre de confirmation de la page admin** | supprimer `components/Dialog.tsx` |
| **Bloc de statistiques** de la Control Room | `components/admin/ControlRoom.tsx` |
| **Icônes dans les boutons et les badges** (hors carte et hors UnlockScreen) | retirer les usages de `<Icon>` partout **sauf** dans `SpotMap.tsx`, `UnlockScreen.tsx` et `SpotImage.tsx` (fichiers figés, voir § 4) |

## 6. Ce que devient chaque fichier conservé

### `App.tsx`
`BrowserRouter` > `Routes` avec les 3 routes actuelles. Plus de `MotionConfig` ni de
`ToastProvider`.

### `types/spot.ts`
`SpotFilters` devient `{ search: string; categoryId: number | null }`. Les autres types ne
changent pas.

### `utils/spots.ts`
Ne garder que :
- `EMPTY_FILTERS` (adapté au nouveau type) ;
- `filterSpots(spots, filters)` : nom qui contient la recherche (en minuscules) **et**
  catégorie égale si une catégorie est choisie ;
- `formatLocation` (utilisée par les cartes et la page admin).

Supprimer `normalizeText`, `countActiveFilters`, `getCities` et `readDescription`.

### `components/FiltersBar.tsx`
Un `<input>` de recherche par nom + un `<select>` de catégorie (« Toutes les catégories »
correspond à `null`) + un bouton « Réinitialiser » si un filtre est actif. Le composant
reçoit `filters` et `onChange`, comme aujourd'hui. Cible : environ 30 à 40 lignes.

### `pages/ExplorerPage.tsx`
Même ordre qu'aujourd'hui : Navbar, Hero, titre « Explorer la nuit » + compteur
(« X lieux sur Y »), FiltersBar, états chargement / erreur / vide / aucun résultat
(`StateMessage`, `Loader`), puis la carte (`SpotMap`, inchangée) au-dessus de la liste
`<ul className="flex flex-wrap ...">` de `SpotCard`, puis le Footer, puis `SpotDetail` si
un lieu est sélectionné. États : `filters` et `selectedId` uniquement. `visibleSpots` est
calculé directement, **sans `useMemo`**.

### `components/SpotCard.tsx`
Photo, `CategoryBadge`, nom, lieu (`formatLocation`), début de la description, bouton
« Explorer » qui appelle `onExplore`. Plus de bouton favori, plus de `DemoTag`, plus
d'icône.

### `components/Badges.tsx`
Ne garder que `CategoryBadge` : le nom de la catégorie dans sa couleur, sans icône.

### `components/SpotDetail.tsx`
Panneau fixe sur le côté droit (plein écran sur mobile), sans animation : bouton ✕
(texte) qui appelle `onClose`, nom, `CategoryBadge`, photos **les unes à côté des
autres** (rangée qui défile horizontalement si nécessaire, avec `SpotImage`),
description, adresse et ville. Pas de `useEffect` ni de `useRef`. Un clic sur le fond
sombre ferme le panneau *(choix du concepteur, facultatif)*.

### `components/Hero.tsx`
Version statique : photo de fond, titre AFTERDARK, sous-titre, lien « Explorer » vers
`#explorer`. Plus de `motion`, plus de prop `ready`, plus de halos animés.

### `components/Layout.tsx`
Garder `Navbar` (logo + liens Explorer / Control Room) et `Footer`. Retirer les icônes.
Si `useId` ou un menu mobile ne servent qu'à de la décoration, les simplifier.

### `components/StateMessage.tsx`
Garder `Loader` et `StateMessage`, sans icône. `Loader` peut devenir un simple texte
« Chargement des lieux… ».

### `components/admin/ControlRoom.tsx`
Disposition validée par l'étudiant :
```
Control Room                                [Se déconnecter]
Formulaire (titre « Nouveau lieu » ou « Modifier « X » »)
  + message d'erreur du serveur en rouge si besoin
Lieux enregistrés : une ligne par lieu avec [Modifier] [Supprimer]
```
- États : `editingSpot` (`null` = ajout), `error` (texte), `busyId` si utile.
- **Modifier** remplit le formulaire avec le lieu (et fait défiler jusqu'au formulaire
  *(choix du concepteur)*). **Annuler** remet le formulaire en mode ajout.
- **Supprimer** : `if (!window.confirm(`Supprimer « ${spot.name} » ?`)) return;` puis
  `deleteSpot`, puis `reload()`.
- Après un ajout ou une modification réussi(e) : le formulaire revient vide (mode
  ajout), on efface l'erreur et on appelle `reload()`.
- *(Choix du concepteur)* **Remise à zéro du formulaire** : `handleSave` renvoie `true`
  si l'enregistrement a réussi et `false` sinon. SpotForm fait
  `const ok = await onSubmit(...); if (ok) setValues(toFormValues(null));`. On n'utilise
  pas de compteur de `key`, qui serait une astuce de plus à expliquer. Après une
  modification, `editingSpot` repasse aussi à `null`.
- Erreur d'API : un **401** appelle `onLogout()` (comportement actuel conservé) ; toute
  autre erreur range `err.message` dans `error`, affiché en rouge au-dessus des boutons
  du formulaire.
- Pas de `Dialog`, pas de statistiques, pas de toasts, pas d'`AnimatePresence`.

### `components/admin/AdminSpotRow.tsx`
Il reste (une ligne de la liste), sans `motion.li` et sans icônes : miniature
`SpotImage`, nom, `CategoryBadge`, lieu, boutons « Modifier » et « Supprimer ».

### `components/admin/SpotForm.tsx`
Un seul `useState` `values` (comme aujourd'hui), mêmes champs : nom, catégorie
(`<select>`), description, adresse, ville, latitude, longitude, et **images dans un seul
`<textarea>` avec une URL par ligne**. Pour l'envoi :
`images: values.images.split('\n').map(url => url.trim()).filter(url => url !== '')`.
Pour le préremplissage : `spot.images.join('\n')`. Garder `noValidate`, puisque la
validation est faite par le serveur. Le composant reçoit l'erreur à afficher (prop
`error`) ou la remonte au parent : au choix du constructeur. `onSubmit` a le type
`(input: SpotInput) => Promise<boolean>` (voir ControlRoom). Le parent recrée le
formulaire quand on choisit un autre lieu à modifier (`key={editingSpot?.id ?? 'new'}`,
déjà utilisé aujourd'hui). Supprimer les aperçus d'images, les boutons +/– et `MAX_IMAGES`.

### `styles/index.css`
Garder `@import 'tailwindcss'`, `@theme` (couleurs + polices), `@layer base`, les classes
`.btn` / `.btn-*` et `.field-*` encore utilisées, et **toute la section Carte telle
quelle**. Supprimer ce qui n'est plus utilisé : `.chip`, `.switch`, `.gallery-btn`,
`.dialog-*`, `.hero-glow*`, `.loader-orbit`, et les keyframes associés (sauf ceux
utilisés par la carte).

## 7. Laissé au constructeur

- Les classes Tailwind exactes et la mise en page fine, tant que l'identité visuelle
  actuelle (couleurs `charcoal` / `acid` / `forest` / `mist` / `ash` / `volt`, polices)
  est conservée.
- Le découpage en étapes et en commits. Suggestion : 1) retirer favoris + toasts,
  2) retirer les animations + Framer Motion, 3) Explorer (filtres, cartes, détail, hero),
  4) page admin, 5) nettoyage du CSS et des fichiers inutilisés.
- Le nom de la branche.

## 8. Vérification

- `npm run build -w client` passe (typecheck + build), sans import inutilisé.
- `git diff` ne montre **aucune modification** de `SpotMap.tsx`, `Icon.tsx`,
  `UnlockScreen.tsx`, `useAdminToken.ts`, `AdminPage.tsx`, `api.ts`, `useSpots.ts`, ni de
  `server/`.
- `grep -r "framer-motion\|useToast\|useFavorites\|Dialog" client/src` ne renvoie rien.
- Vérification visuelle avec `npm run dev` (lecture seule) : la liste s'affiche, la
  recherche et la catégorie filtrent la liste **et** la carte, un clic sur un marqueur ou
  sur « Explorer » ouvre le panneau, ✕ le ferme.
- L'étudiant teste lui-même les écritures (ajout, modification, suppression, champ vide
  qui donne 400, mauvais token qui donne 401).
