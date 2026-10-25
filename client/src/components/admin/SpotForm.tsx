// Formulaire d'ajout ET de modification d'un lieu (même composant, prérempli en modification).
// L'état du formulaire est géré avec useState. La validation est faite par le SERVEUR :
// son message d'erreur s'affiche en notification (noValidate désactive celle du navigateur).
import { useState, type FormEvent, type ReactNode } from 'react';
import type { Category, Spot, SpotInput } from '../../types/spot';
import { Icon } from '../Icon';
import { SpotImage } from '../SpotImage';

// Nombre maximum d'images par lieu
const MAX_IMAGES = 6;

// Valeurs des champs : des chaînes, comme dans les <input>
// (un <input> contient toujours du texte, même quand on y tape un nombre)
type FormValues = {
  name: string;
  category_id: string;
  description: string;
  images: string[];
  address: string;
  city: string;
  latitude: string;
  longitude: string;
};

// Préremplissage : vide pour un ajout, valeurs du lieu pour une modification.
// "spot?.name" lit name seulement si spot existe ; "?? ''" met un texte vide sinon.
function toFormValues(spot: Spot | null): FormValues {
  return {
    name: spot?.name ?? '',
    category_id: spot ? String(spot.category.id) : '', // String() transforme le nombre 3 en texte "3"
    description: spot?.description ?? '',
    images: spot ? [...spot.images] : [], // copie de la liste d'images (ou liste vide)
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
function toSpotInput(values: FormValues): SpotInput {
  return {
    name: values.name,
    category_id: toNumber(values.category_id),
    description: values.description,
    images: values.images.map((url) => url.trim()), // on enlève les espaces autour de chaque URL
    address: values.address,
    city: values.city,
    latitude: toNumber(values.latitude),
    longitude: toNumber(values.longitude),
  };
}

type SpotFormProps = {
  spot: Spot | null; // null = ajout
  categories: Category[]; // pour la liste déroulante des catégories
  onSubmit: (input: SpotInput) => Promise<void>; // appelée à la validation (ControlRoom envoie à l'API)
  onCancel: () => void; // bouton "Annuler"
};

export function SpotForm({ spot, categories, onSubmit, onCancel }: SpotFormProps) {
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

  // Modifie l'URL de l'image numéro "index"
  function setImage(index: number, url: string) {
    const images = [...values.images]; // copie de la liste (on ne modifie jamais l'état directement)
    images[index] = url;
    setValues({ ...values, images });
  }

  // Ajoute un champ d'image vide à la fin de la liste
  function addImage() {
    setValues({ ...values, images: [...values.images, ''] });
  }

  // Retire l'image numéro "index" (filter garde toutes les autres)
  function removeImage(index: number) {
    setValues({ ...values, images: values.images.filter((_, i) => i !== index) });
  }

  // Appelée quand on clique sur "Ajouter le lieu" / "Enregistrer les modifications"
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); // empêche le rechargement de la page
    setSubmitting(true);
    await onSubmit(toSpotInput(values)); // on envoie les valeurs converties au parent (ControlRoom)
    setSubmitting(false);
  }

  return (
    // noValidate : le navigateur ne bloque pas l'envoi, c'est le serveur qui vérifie les champs
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Chaque champ suit le même schéma : value lit l'état, onChange le met à jour */}
      <Field id="name" label="Nom" required>
        <input
          id="name"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          className="field-input"
        />
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

      {/* hint : petit texte d'aide sous le champ, ici le nombre de caractères tapés */}
      <Field id="description" label="Description" hint={`${values.description.length} / 1000 caractères`}>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          className="field-input"
        />
      </Field>

      {/* Images : liste dynamique de champs URL (6 maximum) avec aperçu */}
      <fieldset className="flex flex-col gap-3">
        <legend className="field-label mb-2">Images</legend>
        <p className="-mt-1 text-sm text-ash">
          La première image sert de couverture. {MAX_IMAGES} images maximum.
          {values.images.length === 0 && ' Aucune image pour le moment.'}
        </p>
        {/* Un champ par image : aperçu, URL, bouton Retirer */}
        {values.images.map((url, index) => {
          return (
            <div key={index} className="flex items-center gap-3">
              {/* Aperçu de l'image tapée (ou visuel de remplacement si l'URL est vide ou fausse) */}
              <SpotImage
                src={url.trim() || undefined}
                alt={`Aperçu de l'image ${index + 1}`}
                className="size-14 shrink-0 rounded-xl object-cover"
                compact
              />
              <label htmlFor={`image-${index}`} className="sr-only">
                URL de l'image {index + 1}
              </label>
              <input
                id={`image-${index}`}
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={url}
                onChange={(e) => setImage(index, e.target.value)}
                className="field-input"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="btn btn-ghost shrink-0 px-3"
                aria-label={`Retirer l'image ${index + 1}`}
              >
                <Icon name="x" />
                {/* Le mot "Retirer" n'apparaît que sur les écrans assez larges */}
                <span className="hidden sm:inline">Retirer</span>
              </button>
            </div>
          );
        })}
        {/* Désactivé quand on a déjà 6 images */}
        <button
          type="button"
          onClick={addImage}
          disabled={values.images.length >= MAX_IMAGES}
          className="btn btn-ghost self-start"
        >
          <Icon name="plus" />
          Ajouter une image
        </button>
      </fieldset>

      <Field id="address" label="Adresse">
        <input
          id="address"
          value={values.address}
          onChange={(e) => setField('address', e.target.value)}
          className="field-input"
        />
      </Field>

      <Field id="city" label="Ville" required>
        <input
          id="city"
          value={values.city}
          onChange={(e) => setField('city', e.target.value)}
          className="field-input"
        />
      </Field>

      {/* Latitude et longitude côte à côte. inputMode="decimal" affiche un clavier numérique sur mobile. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="latitude" label="Latitude" required hint="Entre -90 et 90, ex. 48.8566">
          <input
            id="latitude"
            inputMode="decimal"
            value={values.latitude}
            onChange={(e) => setField('latitude', e.target.value)}
            className="field-input"
          />
        </Field>
        <Field id="longitude" label="Longitude" required hint="Entre -180 et 180, ex. 2.3522">
          <input
            id="longitude"
            inputMode="decimal"
            value={values.longitude}
            onChange={(e) => setField('longitude', e.target.value)}
            className="field-input"
          />
        </Field>
      </div>
      <p className="-mt-3 text-sm text-ash">
        Astuce : sur Google Maps ou OpenStreetMap, un clic droit sur un point affiche ses coordonnées.
      </p>

      {/* Boutons collés en bas du panneau, même quand on fait défiler le formulaire */}
      <div className="sticky bottom-0 -mx-6 flex flex-col-reverse gap-3 border-t border-white/8 bg-charcoal px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Annuler
        </button>
        {/* Le texte du bouton dépend de la situation : envoi en cours, modification ou ajout */}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Enregistrement…' : spot ? 'Enregistrer les modifications' : 'Ajouter le lieu'}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string; // id du champ, pour relier le libellé au champ
  label: string; // texte du libellé
  required?: boolean; // affiche "(obligatoire)" après le libellé
  hint?: string; // texte d'aide facultatif sous le champ
  children: ReactNode; // le champ lui-même (<input>, <select>...)
};

// Un champ : libellé, contrôle, puis texte d'aide éventuel.
// Ce petit composant évite de répéter la même structure pour chaque champ.
function Field({ id, label, required = false, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-ash"> (obligatoire)</span>}
      </label>
      {children}
      {hint && <p className="text-sm text-ash">{hint}</p>}
    </div>
  );
}
