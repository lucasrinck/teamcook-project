# Simplification du front AFTERDARK : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** réduire le front d'environ 3 000 à environ 1 300 lignes pour qu'un étudiant débutant puisse expliquer chaque fichier en soutenance, sans toucher à la carte, à la protection admin ni au serveur.

**Architecture :** on supprime les fonctionnalités bonus (favoris, toasts, animations, dialog), puis on réécrit en plus simple les composants restants. Les interfaces publiques (`api.ts`, `useSpots`, `SpotMap`) ne changent pas. Chaque tâche laisse le projet compilable.

**Tech Stack :** React 19, TypeScript strict, Vite, Tailwind v4, react-router, react-leaflet (inchangé). Framer Motion est **désinstallé**.

**Spec :** `docs/superpowers/specs/2026-10-25-simplification-front-design.md` (à lire en entier avant de commencer).

## Global Constraints

- **Aucune nouvelle bibliothèque.** Seule suppression prévue : `framer-motion`.
- **Fichiers figés** (zéro diff) : `client/src/components/SpotMap.tsx`, `client/src/components/Icon.tsx`, `client/src/components/SpotImage.tsx`, `client/src/components/admin/UnlockScreen.tsx`, `client/src/hooks/useAdminToken.ts`, `client/src/hooks/useSpots.ts`, `client/src/pages/AdminPage.tsx`, `client/src/pages/NotFoundPage.tsx`, `client/src/services/api.ts`, `client/src/main.tsx`, tout `server/`, tout `supabase/`, `.github/`.
- **Interdits dans le code produit** : `useMemo`, `useCallback` (hors useSpots, figé), `useRef`, `createContext`, expressions régulières, `AnimatePresence` / `motion`, `dangerouslySetInnerHTML` (hors Icon.tsx, figé).
- **Commentaires** : en français, courts, un au-dessus de chaque bloc, dans le style pédagogique existant de la branche `commentaires-code`.
- **Vérification de chaque tâche** : `npm run build -w client` (= `tsc --noEmit && vite build`) doit afficher `✓ built in` sans erreur. Il n'y a **pas de lanceur de tests** dans le client, et en ajouter un est interdit. Les tests de logique se font avec un script `tsx` jetable dans le dossier scratchpad (jamais dans le repo).
- **Base de données** : aucune écriture. L'étudiant teste lui-même l'ajout, la modification et la suppression.
- **Workflow** : un commit par tâche, puis **arrêt pour validation de l'étudiant** avant la tâche suivante. Les messages de commit sont en français, commencent par `Simplification :` et se terminent par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Ajout réussi** : après « Ajouter le lieu » avec succès, tous les champs du formulaire se vident (y compris la ville, qui revient à `Paris`) et le message d'erreur disparaît. Testé en Task 3, Step 6.
2. **Supprimer le lieu en cours de modification** : si on supprime le lieu affiché dans le formulaire, le formulaire repasse en mode « Nouveau lieu » (sinon un PUT partirait vers un id supprimé et donnerait 404). Testé en Task 3, Step 6.
3. **Recherche avec majuscules et espaces** : `"  SOUS "` trouve « Le Sous-Sol » (on applique `trim()` + `toLowerCase()` à la recherche et au nom). Testé en Task 1, Step 2.
4. **Zone d'images avec lignes vides ou espaces** : `"url1\n\n  url2  \n"` envoie `['url1', 'url2']`. Un lieu sans image donne une zone vide. Testé en Task 3, Step 2.
5. **Erreur obsolète** : passer à « Modifier » un autre lieu, ou cliquer sur « Annuler », efface le message d'erreur précédent. Testé en Task 3, Step 6.

---

### Task 0 : Branche de travail

- [ ] **Step 1 : Créer la branche depuis `origin/main`** (qui contient déjà `commentaires-code`, PR #8)

```bash
git fetch origin
git switch -c simplification-front origin/main
```
Expected : `Switched to a new branch 'simplification-front'`. Le dossier `docs/` (non suivi par git) est conservé.

- [ ] **Step 2 : Commiter le spec et ce plan**

```bash
git add docs/superpowers
git commit -m "Simplification : document de conception et plan"
```

---

### Task 1 : Filtres simplifiés et suppression des favoris

**Files :**
- Modify : `client/src/types/spot.ts` (type `SpotFilters`)
- Modify : `client/src/utils/spots.ts`
- Modify : `client/src/components/FiltersBar.tsx` (réécriture)
- Modify : `client/src/pages/ExplorerPage.tsx` (retirer les favoris, `useMemo`, `getCities`)
- Modify : `client/src/components/SpotCard.tsx`, `client/src/components/SpotDetail.tsx` (retirer seulement les props et le bouton favori)
- Delete : `client/src/hooks/useFavorites.ts`, `client/src/components/SpotActions.tsx`

**Interfaces :**
- Produces :
  - `type SpotFilters = { search: string; categoryId: number | null }`
  - `EMPTY_FILTERS: SpotFilters = { search: '', categoryId: null }`
  - `filterSpots(spots: Spot[], filters: SpotFilters): Spot[]`
  - `formatLocation(spot: Spot): string` (inchangée)
  - `FiltersBar({ filters, onChange, categories }: { filters: SpotFilters; onChange: (filters: SpotFilters) => void; categories: Category[] })`
  - `SpotCard({ spot, selected, onExplore }: { spot: Spot; selected: boolean; onExplore: (spot: Spot) => void })`
  - `SpotDetail({ spot, onClose }: { spot: Spot; onClose: () => void })`
- `readDescription` reste pour l'instant (supprimé en Task 2).

- [ ] **Step 1 : Écrire le script de vérification de `filterSpots`**

Créer `<scratchpad>/check-filters.ts` (hors du repo) :
```ts
import { filterSpots, EMPTY_FILTERS } from '/Users/lucasrinckenbach/Documents/START_PROJECTS/teamcook-project/client/src/utils/spots.ts';
import assert from 'node:assert/strict';

const cat = (id: number) => ({ id, name: `c${id}`, icon: null, color: null });
const spot = (id: number, name: string, catId: number) =>
  ({ id, name, description: null, images: [], category: cat(catId), infos: null });
const spots = [spot(1, 'Le Sous-Sol', 1), spot(2, 'Rooftop Nord', 2), spot(3, 'Sous les toits', 2)];

assert.deepEqual(filterSpots(spots, EMPTY_FILTERS).map((s) => s.id), [1, 2, 3]);
assert.deepEqual(filterSpots(spots, { search: '  SOUS ', categoryId: null }).map((s) => s.id), [1, 3]);
assert.deepEqual(filterSpots(spots, { search: '', categoryId: 2 }).map((s) => s.id), [2, 3]);
assert.deepEqual(filterSpots(spots, { search: 'sous', categoryId: 2 }).map((s) => s.id), [3]);
console.log('filterSpots OK');
```

- [ ] **Step 2 : Lancer le script et constater l'échec**

Run : `npx tsx <scratchpad>/check-filters.ts`
Expected : FAIL (l'ancienne signature attend `favoriteIds`, et `EMPTY_FILTERS` a 4 champs).

- [ ] **Step 3 : Mettre à jour `SpotFilters` et `utils/spots.ts`**

`filterSpots` : garder un lieu si `spot.name.toLowerCase().includes(filters.search.trim().toLowerCase())` **et** (`filters.categoryId === null` ou `spot.category.id === filters.categoryId`). Supprimer `normalizeText`, `countActiveFilters` et `getCities`. Garder `readDescription` et `formatLocation`.

- [ ] **Step 4 : Relancer le script**

Run : `npx tsx <scratchpad>/check-filters.ts`
Expected : `filterSpots OK`

- [ ] **Step 5 : Réécrire `FiltersBar.tsx`** (cible : environ 40 lignes)

Un `<input type="search">` (placeholder `Rechercher un lieu…`, libellé `sr-only`, classe `field-input`), un `<select>` de catégorie (première option `value=""` qui affiche `Toutes les catégories`. `onChange` donne `categoryId: value === '' ? null : Number(value)`), et un bouton `Réinitialiser` (`btn btn-ghost`) affiché seulement si `filters.search !== '' || filters.categoryId !== null`, qui appelle `onChange(EMPTY_FILTERS)`. Pas d'icône, pas de `useState`.

- [ ] **Step 6 : Retirer les favoris de `ExplorerPage`, `SpotCard` et `SpotDetail`, puis supprimer `useFavorites.ts` et `SpotActions.tsx`**

Dans ExplorerPage : `const visibleSpots = filterSpots(spots, filters);` sans `useMemo`, et `<FiltersBar filters={filters} onChange={setFilters} categories={categories} />`. Ne pas encore toucher aux animations (Task 2).

- [ ] **Step 7 : Build**

Run : `npm run build -w client`
Expected : `✓ built in`, 0 erreur TypeScript.

- [ ] **Step 8 : Vérifier qu'il ne reste aucune trace**

Run : `grep -rn "Favorite\|favorite\|getCities\|countActiveFilters\|normalizeText\|onlyFavorites" client/src`
Expected : aucune ligne.

- [ ] **Step 9 : Commit, puis arrêt pour validation**

```bash
git add -A client/src
git commit -m "Simplification : filtres recherche + catégorie, retrait des favoris"
```

---

### Task 2 : Page Explorer sans animations ni étiquette démo

**Files :**
- Modify : `client/src/pages/ExplorerPage.tsx` (retirer `Intro`, `Reveal`, `AnimatePresence`, `motion.li`, `showIntro`)
- Modify : `client/src/components/Hero.tsx` (statique, sans props)
- Modify : `client/src/components/SpotDetail.tsx` (réécriture)
- Modify : `client/src/components/SpotCard.tsx` (retirer `DemoTag`, `readDescription` et l'icône `map-pin`)
- Modify : `client/src/components/Badges.tsx` (ne garder que `CategoryBadge`, sans icône)
- Modify : `client/src/components/StateMessage.tsx` (retirer `Icon` et `loader-orbit`)
- Modify : `client/src/utils/spots.ts` (supprimer `readDescription` et `DEMO_PREFIX`)
- Delete : `client/src/components/Motion.tsx`

**Interfaces :**
- Consumes : `SpotCard`, `SpotDetail` et `FiltersBar` de la Task 1.
- Produces : `Hero(): JSX.Element` sans props. `CategoryBadge({ category }: { category: Category })`. `Loader({ label }: { label?: string })` et `StateMessage(...)` gardent leurs props actuelles.

- [ ] **Step 1 : `Hero.tsx` statique**

Mêmes textes qu'aujourd'hui (`La nuit cache` / `bien plus.`, le sous-titre, le lien `#explorer` « Explorer la carte », `Your city. Your night. Your story.`), même photo `HERO_IMAGE` en `<img>` et même dégradé. Supprimer `motion`, `ready`, `TITLE_LINES.map` (deux lignes écrites directement, séparées par `<br />`), et les `div` `hero-glow`.

- [ ] **Step 2 : `ExplorerPage.tsx` sans animations**

États : `filters` et `selectedId` uniquement. `<Hero />`. Le bloc titre redevient une simple `div`. La liste devient `<ul className="flex flex-wrap gap-6">` avec des `<li key={spot.id} className="flex w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">`. `SpotDetail` est rendu avec `{selectedSpot && <SpotDetail spot={selectedSpot} onClose={() => setSelectedId(null)} />}`. Garder le `<SpotMap spots={visibleSpots} selectedId={selectedId} onSelect={setSelectedId} />` à l'identique.

- [ ] **Step 3 : Réécrire `SpotDetail.tsx`** (cible : environ 60 lignes)

Structure : un fond `div` `fixed inset-0 z-40 bg-black/60` dont l'`onClick` appelle `onClose`, puis un `aside` `fixed` à droite (`lg:w-[28rem]`, plein écran sur mobile, `overflow-y-auto`, `bg-charcoal`) avec un bouton texte `✕ Fermer` (`btn btn-ghost`, `onClick={onClose}`), le titre `h2`, `CategoryBadge`, puis les photos dans `<div className="flex gap-3 overflow-x-auto">` avec un `SpotImage` par URL (`key={url}`, `alt={`Photo ${index + 1} : ${spot.name}`}`, `className="h-48 w-64 shrink-0 rounded-2xl object-cover"`). Ensuite, la description (`spot.description` affichée telle quelle si elle existe) et l'adresse + la ville (ou `Localisation non renseignée : ce lieu n'apparaît pas sur la carte.` si `infos` vaut `null`). Ni `useState`, ni `useEffect`, ni `useRef`, ni `matchMedia`.

- [ ] **Step 4 : `SpotCard`, `Badges`, `StateMessage`, `utils`**

`SpotCard` affiche `spot.description` directement (`line-clamp-2`). `Badges.tsx` : `CategoryBadge` = `<span style={{ color: category.color ?? undefined }}>{category.name}</span>`, et on supprime `DemoTag`. `Loader` = `<p role="status">` avec le texte du label. `StateMessage` garde son titre, son texte et son action, sans icône. Supprimer `readDescription` dans `utils/spots.ts`, puis supprimer `Motion.tsx`.

- [ ] **Step 5 : Build et vérification**

Run : `npm run build -w client`
Expected : `✓ built in`

Run : `grep -rn "framer-motion\|Motion\|DemoTag\|readDescription\|loader-orbit\|hero-glow\|<Icon" client/src/pages client/src/components --include='*.tsx' | grep -v "SpotMap.tsx\|Icon.tsx\|SpotImage.tsx\|UnlockScreen.tsx\|admin/"`
Expected : aucune ligne. (Les fichiers `admin/` sont traités en Task 3.)

- [ ] **Step 6 : Vérification visuelle (lecture seule)**

Run : `npm run dev`, puis ouvrir `http://localhost:5173`.
Expected : le bandeau d'accueil s'affiche directement, sans intro. La recherche et la catégorie filtrent la liste **et** les marqueurs. Un clic sur « Explorer » ou sur un marqueur ouvre le panneau, et « ✕ Fermer » ou un clic sur le fond le ferme.

- [ ] **Step 7 : Commit, puis arrêt pour validation**

```bash
git add -A client/src
git commit -m "Simplification : page Explorer sans animations, panneau de détail simple"
```

---

### Task 3 : Page admin simplifiée, retrait des toasts, du Dialog et de Framer Motion

**Files :**
- Modify : `client/src/components/admin/ControlRoom.tsx` (réécriture)
- Modify : `client/src/components/admin/SpotForm.tsx` (réécriture)
- Modify : `client/src/components/admin/AdminSpotRow.tsx` (`motion.li` devient `li`, retrait des icônes)
- Modify : `client/src/App.tsx` (retirer `MotionConfig` et `ToastProvider`)
- Delete : `client/src/components/Dialog.tsx`, `client/src/hooks/useToast.tsx`
- Modify : `client/package.json` + `package-lock.json` (désinstallation de `framer-motion`)

**Interfaces :**
- Consumes : `createSpot`, `updateSpot`, `deleteSpot`, `ApiError` (`api.ts`, figé). `useSpots()` renvoie `{ spots, categories, status, error, reload, retry }` (figé).
- Produces :
  - `ControlRoom({ token, onLogout }: { token: string; onLogout: () => void })` (inchangé, utilisé par AdminPage, qui est figé)
  - `SpotForm({ spot, categories, error, onSubmit, onCancel }: { spot: Spot | null; categories: Category[]; error: string; onSubmit: (input: SpotInput) => Promise<boolean>; onCancel: () => void })`
  - `AdminSpotRow` : props inchangées (`spot`, `busy`, `onEdit`, `onDelete`)
  - Dans SpotForm : `FormValues.images: string` (une URL par ligne), et les fonctions `toFormValues(spot: Spot | null): FormValues` et `toSpotInput(values: FormValues): SpotInput`.

- [ ] **Step 1 : Écrire le script de vérification des conversions du formulaire**

Exporter `toFormValues` et `toSpotInput` depuis `SpotForm.tsx` (export nommé, sans changer leur rôle). Créer `<scratchpad>/check-form.ts` :
```ts
import { toFormValues, toSpotInput } from '/Users/lucasrinckenbach/Documents/START_PROJECTS/teamcook-project/client/src/components/admin/SpotForm.tsx';
import assert from 'node:assert/strict';

const empty = toFormValues(null);
assert.equal(empty.images, '');
assert.equal(empty.city, 'Paris');
const input = toSpotInput({ ...empty, name: 'A', category_id: '2', latitude: '48,85', longitude: '', images: 'url1\n\n  url2  \n' });
assert.deepEqual(input.images, ['url1', 'url2']);
assert.equal(input.category_id, 2);
assert.equal(input.latitude, 48.85);
assert.equal(input.longitude, undefined);
const spot = { id: 1, name: 'B', description: null, images: ['u1', 'u2'], category: { id: 3, name: 'c', icon: null, color: null }, infos: null };
assert.equal(toFormValues(spot).images, 'u1\nu2');
console.log('SpotForm conversions OK');
```

- [ ] **Step 2 : Lancer le script et constater l'échec, réécrire `SpotForm.tsx`, relancer**

Run : `npx tsx <scratchpad>/check-form.ts`. Expected d'abord : FAIL (`images` est un tableau). Ensuite, réécrire SpotForm :
- `toSpotInput` : `images: values.images.split('\n').map((url) => url.trim()).filter((url) => url !== '')` ;
- `toFormValues` : `images: spot ? spot.images.join('\n') : ''`, et `toNumber` reste tel quel ;
- un seul `useState` `values`, `setField` inchangé, plus de `setImage`, `addImage`, `removeImage`, `MAX_IMAGES` ni aperçus. Le champ Images est un `<textarea rows={3}>` avec le libellé `Images (une URL par ligne)` ;
- garder le petit composant `Field` et `noValidate` ;
- `handleSubmit` : `setSubmitting(true); const ok = await onSubmit(toSpotInput(values)); setSubmitting(false); if (ok) setValues(toFormValues(null));` ;
- `{error && <p role="alert" className="text-sm text-red-300">{error}</p>}` juste au-dessus des boutons ;
- les boutons ne sont plus `sticky` : `Annuler` (affiché seulement si `spot !== null`) et le bouton d'envoi au texte actuel.

Run : `npx tsx <scratchpad>/check-form.ts`
Expected : `SpotForm conversions OK`

- [ ] **Step 3 : Réécrire `ControlRoom.tsx`**

États : `editingSpot: Spot | null`, `error: string`, `busyId: number | null`. Fonctions :
- `handleApiError(err: unknown)` : si `err instanceof ApiError && err.status === 401`, appeler `onLogout()` ; sinon `setError(err instanceof Error ? err.message : 'Erreur inattendue.')` ;
- `startEdit(spot: Spot)` : `setEditingSpot(spot); setError(''); document.getElementById('spot-form')?.scrollIntoView();` ;
- `cancelEdit()` : `setEditingSpot(null); setError('')` ;
- `handleSave(input: SpotInput): Promise<boolean>` : `updateSpot` ou `createSpot` selon `editingSpot`, puis en cas de succès `setEditingSpot(null); setError(''); await reload(); return true`. En `catch` : `handleApiError(err); return false` ;
- `handleDelete(spot: Spot)` : `if (!window.confirm(`Supprimer « ${spot.name} » ?`)) return;` puis `setBusyId(spot.id)`, `deleteSpot`, `if (editingSpot?.id === spot.id) setEditingSpot(null)`, `await reload()`. En `catch` : `handleApiError`. En `finally` : `setBusyId(null)`.

Rendu (disposition du spec § 6) : en-tête `Control Room` + `Se déconnecter`, puis `<section id="spot-form">` avec le titre `Nouveau lieu` ou `Modifier « {editingSpot.name} »` et `<SpotForm key={editingSpot?.id ?? 'new'} spot={editingSpot} categories={categories} error={error} onSubmit={handleSave} onCancel={cancelEdit} />`, puis les états `Loader` / `StateMessage` (erreur avec `retry`, liste vide), puis `<ul className="flex flex-col gap-3">` d'`AdminSpotRow` avec `onEdit={startEdit}` et `onDelete={handleDelete}`. Le formulaire n'est affiché que si `status === 'ready'`. Ni `Dialog`, ni `Stat`, ni `useToast`, ni `AnimatePresence`.

- [ ] **Step 4 : `AdminSpotRow`, `App.tsx`, suppressions, désinstallation**

`AdminSpotRow` : `motion.li` devient `<li className=...>` (mêmes classes), et on retire les deux `<Icon>`. `App.tsx` : `<BrowserRouter><Routes>…</Routes></BrowserRouter>`, et on met à jour les commentaires. Supprimer `Dialog.tsx` et `useToast.tsx`. Puis :
```bash
npm uninstall framer-motion -w client
```
Expected : `framer-motion` n'apparaît plus dans `client/package.json`.

- [ ] **Step 5 : Build et vérification**

Run : `npm run build -w client`
Expected : `✓ built in`

Run : `grep -rn "framer-motion\|useToast\|ToastProvider\|Dialog\|showToast\|motion\." client/src client/package.json`
Expected : aucune ligne.

- [ ] **Step 6 : Liste de tests manuels pour l'étudiant** (Claude n'écrit pas en base)

À transmettre à l'étudiant avec `npm run dev` lancé :
1. Ajouter un lieu avec tous les champs : le lieu apparaît dans la liste, et le formulaire se vide (la ville revient à `Paris`).
2. Valider avec le nom vide : un message rouge du serveur apparaît (400).
3. Cliquer sur « Modifier » : la page défile jusqu'au formulaire, qui est prérempli (une image par ligne). Changer le nom et enregistrer : la liste est mise à jour et le formulaire revient à « Nouveau lieu ».
4. Provoquer l'erreur 400, puis cliquer sur « Modifier » sur un autre lieu, ou sur « Annuler » : le message rouge disparaît.
5. Cliquer sur « Modifier » sur le lieu X, puis « Supprimer » ce même lieu X et confirmer : le formulaire repasse en « Nouveau lieu ».
6. « Supprimer » puis « Annuler » dans la confirmation : rien n'est supprimé.
7. Changer le token dans les outils du navigateur (sessionStorage), puis faire une action : retour à l'écran du token (401).

- [ ] **Step 7 : Commit, puis arrêt pour validation**

```bash
git add -A client package-lock.json
git commit -m "Simplification : page admin sans panneau ni toasts, retrait de Framer Motion"
```

---

### Task 4 : Nettoyage du CSS et vérification finale

**Files :**
- Modify : `client/src/styles/index.css`

- [ ] **Step 1 : Supprimer les styles inutilisés**

Supprimer `.btn-link`, `.btn-danger-solid`, `.chip`, `.switch` (+ `::after`, `:checked::after`), `.gallery-btn`, `.dialog-base` / `.dialog-drawer` / `.dialog-center` (+ `::backdrop`, `[open]`), `.hero-glow*`, `.loader-orbit*`, et les keyframes `spin`, `drawer-in`, `pop-in` et `glow-drift`. **Garder sans y toucher** : `@import`, `@theme`, `@layer base`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.field-label`, `.field-input`, `.field-error` (utilisée par UnlockScreen), toute la section `Carte (Leaflet)`, `@keyframes marker-pulse` et le bloc `prefers-reduced-motion`.

- [ ] **Step 2 : Vérifier qu'aucune classe supprimée n'est encore utilisée**

Run : `grep -rnE "btn-link|btn-danger-solid|\"chip|switch|gallery-btn|dialog-|hero-glow|loader-orbit" client/src --include='*.tsx'`
Expected : aucune ligne.

- [ ] **Step 3 : Vérifier les fichiers figés**

Run : `git diff --stat origin/main -- client/src/components/SpotMap.tsx client/src/components/Icon.tsx client/src/components/SpotImage.tsx client/src/components/admin/UnlockScreen.tsx client/src/hooks/useAdminToken.ts client/src/hooks/useSpots.ts client/src/pages/AdminPage.tsx client/src/pages/NotFoundPage.tsx client/src/services/api.ts client/src/main.tsx server supabase .github`
Expected : aucune sortie.

- [ ] **Step 4 : Build final et nombre de lignes**

Run : `npm run build -w client && wc -l $(git ls-files client/src) | tail -1`
Expected : `✓ built in`, et un total d'environ 1 300 lignes (contre 2 993 avant).

- [ ] **Step 5 : Vérification visuelle (lecture seule)**

`npm run dev` : la page Explorer et la page admin gardent les mêmes couleurs et polices, et la carte s'affiche comme avant.

- [ ] **Step 6 : Commit, push, puis arrêt pour validation**

```bash
git add client/src/styles/index.css
git commit -m "Simplification : nettoyage du CSS inutilisé"
git push -u origin simplification-front
```
L'étudiant ouvre ensuite la PR vers `main` (protégée).
