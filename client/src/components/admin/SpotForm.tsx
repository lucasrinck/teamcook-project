// Formulaire d'ajout ET de modification d'un lieu (même composant, prérempli en modification).
// L'état du formulaire est géré avec useState. La validation est faite par le SERVEUR :
// son message d'erreur s'affiche en rouge sous les champs (noValidate désactive celle du navigateur).
import { useState, type FormEvent, type ReactNode } from 'react';
import type { Category, Spot, SpotInput } from '../../types/spot';

// Valeurs des champs : des chaînes, comme dans les <input>
// (un <input> contient toujours du texte, même quand on y tape un nombre)
type FormValues = {
  name: string;
  category_id: string;
  description: string;
  images: string; // toutes les URL dans un seul texte, une par ligne
  address: string;
  city: string;
  latitude: string;
  longitude: string;
};

// Préremplissage : vide pour un ajout, valeurs du lieu pour une modification.
// "spot?.name" lit name seulement si spot existe ; "?? ''" met un texte vide sinon.
export function toFormValues(spot: Spot | null): FormValues {
  return {
    name: spot?.name ?? '',
    category_id: spot ? String(spot.category.id) : '', // String() transforme le nombre 3 en texte "3"
    description: spot?.description ?? '',
    images: spot ? spot.images.join('\n') : '', // join('\n') : une URL par ligne
    address: spot?.infos?.address ?? '',
    city: spot?.infos?.city ?? 'Paris', // Paris par défaut pour un nouveau lieu
    latitude: spot?.infos ? String(spot.infos.latitude) : '',
    longitude: spot?.infos ? String(spot.infos.longitude) : '',
  };
}

// Champ vide -> undefined (le serveur répondra "obligatoire"), sinon nombre.
// replace(',', '.') accepte aussi la virgule française : "48,85" devient 48.85
function toNumber(value: string) {
  return value.trim() === '' ? undefined : Number(value.replace(',', '.'));
}

// Conversion des valeurs du formulaire vers le format attendu par l'API
export function toSpotInput(values: FormValues): SpotInput {
  return {
    name: values.name,
    category_id: toNumber(values.category_id),
    description: values.description,
    // split('\n') coupe le texte à chaque retour à la ligne, trim() enlève les espaces,
    // filter() retire les lignes vides : "url1\n\n url2 " devient ['url1', 'url2']
    images: values.images
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== ''),
    address: values.address,
    city: values.city,
    latitude: toNumber(values.latitude),
    longitude: toNumber(values.longitude),
  };
}

type SpotFormProps = {
  spot: Spot | null; // null = ajout
  categories: Category[]; // pour la liste déroulante des catégories
  error: string; // message d'erreur du serveur ("" = pas d'erreur)
  onSubmit: (input: SpotInput) => Promise<boolean>; // ControlRoom envoie à l'API et répond true si c'est réussi
  onCancel: () => void; // bouton "Annuler"
};

export function SpotForm({ spot, categories, error, onSubmit, onCancel }: SpotFormProps) {
  // ↓ L'état du formulaire : une seule variable pour tous les champs.
  // values contient la valeur actuelle de chaque champ ; setValues est le "setter" :
  // en l'appelant avec un nouvel objet, React met à jour les champs affichés.
  const [values, setValues] = useState<FormValues>(() => toFormValues(spot));
  // true pendant l'envoi à l'API (le bouton est alors désactivé)
  const [submitting, setSubmitting] = useState(false);

  // Modifie un champ en gardant les autres.
  // "...values" recopie tous les champs, puis "[field]: value" remplace celui qui change.
  // keyof FormValues = le nom d'un des champs ("name", "city"...).
  function setField(field: keyof FormValues, value: string) {
    setValues({ ...values, [field]: value });
  }

  // Appelée quand on clique sur "Ajouter le lieu" / "Enregistrer les modifications"
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); // empêche le rechargement de la page
    setSubmitting(true);
    const ok = await onSubmit(toSpotInput(values)); // le parent (ControlRoom) envoie à l'API
    setSubmitting(false);
    // Enregistrement réussi : on vide le formulaire pour pouvoir ajouter un autre lieu
    if (ok) setValues(toFormValues(null));
  }

  return (
    // noValidate : le navigateur ne bloque pas l'envoi, c'est le serveur qui vérifie les champs
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Chaque champ suit le même schéma : value lit l'état, onChange le met à jour */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nom" required>
          <input id="name" value={values.name} onChange={(e) => setField('name', e.target.value)} className="field-input" />
        </Field>

        {/* Liste déroulante remplie avec les catégories venant de l'API */}
        <Field id="category_id" label="Catégorie" required>
          <select
            id="category_id"
            value={values.category_id}
            onChange={(e) => setField('category_id', e.target.value)}
            className="field-input"
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="city" label="Ville" required>
          <input id="city" value={values.city} onChange={(e) => setField('city', e.target.value)} className="field-input" />
        </Field>

        <Field id="address" label="Adresse">
          <input
            id="address"
            value={values.address}
            onChange={(e) => setField('address', e.target.value)}
            className="field-input"
          />
        </Field>

        {/* inputMode="decimal" affiche un clavier numérique sur mobile */}
        <Field id="latitude" label="Latitude" required>
          <input
            id="latitude"
            inputMode="decimal"
            placeholder="ex. 48.8566"
            value={values.latitude}
            onChange={(e) => setField('latitude', e.target.value)}
            className="field-input"
          />
        </Field>
        <Field id="longitude" label="Longitude" required>
          <input
            id="longitude"
            inputMode="decimal"
            placeholder="ex. 2.3522"
            value={values.longitude}
            onChange={(e) => setField('longitude', e.target.value)}
            className="field-input"
          />
        </Field>
      </div>

      <Field id="description" label="Description">
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          className="field-input"
        />
      </Field>

      <Field id="images" label="Images (une URL par ligne)">
        <textarea
          id="images"
          rows={3}
          placeholder="https://…"
          value={values.images}
          onChange={(e) => setField('images', e.target.value)}
          className="field-input"
        />
      </Field>

      {/* Le message d'erreur du serveur (ex. 400 : champ obligatoire vide), seulement s'il y en a un */}
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Le texte du bouton dépend de la situation : envoi en cours, modification ou ajout */}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Enregistrement…' : spot ? 'Enregistrer les modifications' : 'Ajouter le lieu'}
        </button>
        {/* "Annuler" n'existe qu'en modification : il repasse le formulaire en mode ajout */}
        {spot && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  id: string; // id du champ, pour relier le libellé au champ
  label: string; // texte du libellé
  required?: boolean; // affiche "(obligatoire)" après le libellé
  children: ReactNode; // le champ lui-même (<input>, <select>...)
};

// Un champ : libellé puis contrôle.
// Ce petit composant évite de répéter la même structure pour chaque champ.
function Field({ id, label, required = false, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-ash"> (obligatoire)</span>}
      </label>
      {children}
    </div>
  );
}
