// Formulaire d'ajout ET de modification d'un lieu (même composant, prérempli en modification).
// L'état du formulaire est géré avec useState. La validation est faite par le SERVEUR :
// ses erreurs sont affichées sous chaque champ (noValidate désactive celle du navigateur).
import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiError } from '../../services/api';
import type { Category, Spot, SpotInput } from '../../types/spot';
import { Icon } from '../Icon';
import { SpotImage } from '../SpotImage';

const MAX_IMAGES = 6;

// Valeurs des champs : des chaînes, comme dans les <input>
type FormValues = {
  name: string;
  category_id: string;
  description: string;
  images: string[];
  available: boolean;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
};

// Préremplissage : vide pour un ajout, valeurs du lieu pour une modification
function toFormValues(spot: Spot | null): FormValues {
  return {
    name: spot?.name ?? '',
    category_id: spot ? String(spot.category.id) : '',
    description: spot?.description ?? '',
    images: spot ? [...spot.images] : [],
    available: spot?.available ?? true,
    address: spot?.infos?.address ?? '',
    city: spot?.infos?.city ?? 'Paris',
    latitude: spot?.infos ? String(spot.infos.latitude) : '',
    longitude: spot?.infos ? String(spot.infos.longitude) : '',
  };
}

// Champ vide -> undefined (le serveur répondra "obligatoire"), sinon nombre
function toNumber(value: string) {
  return value.trim() === '' ? undefined : Number(value.replace(',', '.'));
}

// Conversion des valeurs du formulaire vers le format attendu par l'API
function toSpotInput(values: FormValues): SpotInput {
  return {
    name: values.name,
    category_id: toNumber(values.category_id),
    description: values.description,
    images: values.images.map((url) => url.trim()),
    available: values.available,
    address: values.address,
    city: values.city,
    latitude: toNumber(values.latitude),
    longitude: toNumber(values.longitude),
  };
}

type SpotFormProps = {
  spot: Spot | null; // null = ajout
  categories: Category[];
  onSubmit: (input: SpotInput) => Promise<void>;
  onCancel: () => void;
};

export function SpotForm({ spot, categories, onSubmit, onCancel }: SpotFormProps) {
  // ↓ L'état du formulaire : une seule variable pour tous les champs
  const [values, setValues] = useState<FormValues>(() => toFormValues(spot));
  // Erreurs renvoyées par l'API, rangées par nom de champ : { name: "Le nom est obligatoire" }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Modifie un champ en gardant les autres
  function setField(field: keyof FormValues, value: string | boolean) {
    setValues({ ...values, [field]: value });
  }

  function setImage(index: number, url: string) {
    const images = [...values.images];
    images[index] = url;
    setValues({ ...values, images });
  }

  function addImage() {
    setValues({ ...values, images: [...values.images, ''] });
  }

  function removeImage(index: number) {
    setValues({ ...values, images: values.images.filter((_, i) => i !== index) });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(toSpotInput(values));
    } catch (error) {
      // 400 : on range chaque erreur sous son champ
      if (error instanceof ApiError && error.details.length > 0) {
        const byField: Record<string, string> = {};
        for (const detail of error.details) byField[detail.field] = detail.message;
        setErrors(byField);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {errorCount > 0 && (
        <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {errorCount === 1 ? 'Un champ est à corriger.' : `${errorCount} champs sont à corriger.`}
        </p>
      )}

      <Field id="name" label="Nom" required error={errors.name}>
        <input id="name" value={values.name} onChange={(e) => setField('name', e.target.value)} {...fieldProps('name', errors)} />
      </Field>

      <Field id="category_id" label="Catégorie" required error={errors.category_id}>
        <select
          id="category_id"
          value={values.category_id}
          onChange={(e) => setField('category_id', e.target.value)}
          {...fieldProps('category_id', errors)}
        >
          <option value="">Choisir une catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="description" label="Description" error={errors.description} hint={`${values.description.length} / 1000 caractères`}>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          {...fieldProps('description', errors)}
        />
      </Field>

      {/* Images : liste dynamique de champs URL (6 maximum) avec aperçu */}
      <fieldset className="flex flex-col gap-3">
        <legend className="field-label mb-2">Images</legend>
        <p className="-mt-1 text-sm text-ash">
          La première image sert de couverture. {MAX_IMAGES} images maximum.
          {values.images.length === 0 && ' Aucune image pour le moment.'}
        </p>
        {values.images.map((url, index) => {
          const error = errors[`images.${index}`]; // ex. "images.2" pour la 3e image
          return (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <SpotImage src={url.trim() || undefined} alt={`Aperçu de l'image ${index + 1}`} className="size-14 shrink-0 rounded-xl object-cover" compact />
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
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `image-${index}-error` : undefined}
                  className="field-input"
                />
                <button type="button" onClick={() => removeImage(index)} className="btn btn-ghost shrink-0 px-3" aria-label={`Retirer l'image ${index + 1}`}>
                  <Icon name="x" />
                  <span className="hidden sm:inline">Retirer</span>
                </button>
              </div>
              {error && (
                <p id={`image-${index}-error`} className="field-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}
        {errors.images && <p className="field-error">{errors.images}</p>}
        <button type="button" onClick={addImage} disabled={values.images.length >= MAX_IMAGES} className="btn btn-ghost self-start">
          <Icon name="plus" />
          Ajouter une image
        </button>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-mist">
        <input type="checkbox" checked={values.available} onChange={(e) => setField('available', e.target.checked)} className="switch" />
        Disponible
      </label>

      <Field id="address" label="Adresse" error={errors.address}>
        <input id="address" value={values.address} onChange={(e) => setField('address', e.target.value)} {...fieldProps('address', errors)} />
      </Field>

      <Field id="city" label="Ville" required error={errors.city}>
        <input id="city" value={values.city} onChange={(e) => setField('city', e.target.value)} {...fieldProps('city', errors)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="latitude" label="Latitude" required error={errors.latitude} hint="Entre -90 et 90, ex. 48.8566">
          <input
            id="latitude"
            inputMode="decimal"
            value={values.latitude}
            onChange={(e) => setField('latitude', e.target.value)}
            {...fieldProps('latitude', errors)}
          />
        </Field>
        <Field id="longitude" label="Longitude" required error={errors.longitude} hint="Entre -180 et 180, ex. 2.3522">
          <input
            id="longitude"
            inputMode="decimal"
            value={values.longitude}
            onChange={(e) => setField('longitude', e.target.value)}
            {...fieldProps('longitude', errors)}
          />
        </Field>
      </div>
      <p className="-mt-3 text-sm text-ash">
        Astuce : sur Google Maps ou OpenStreetMap, un clic droit sur un point affiche ses coordonnées.
      </p>

      <div className="sticky bottom-0 -mx-6 flex flex-col-reverse gap-3 border-t border-white/8 bg-charcoal px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Annuler
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Enregistrement…' : spot ? 'Enregistrer les modifications' : 'Ajouter le lieu'}
        </button>
      </div>
    </form>
  );
}

// Attributs communs des champs : style, état invalide, lien vers le message d'erreur
function fieldProps(field: string, errors: Record<string, string>) {
  return {
    className: 'field-input',
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  };
}

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

// Un champ : libellé, contrôle, puis message d'erreur (ou aide)
function Field({ id, label, required = false, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-ash"> (obligatoire)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-ash">{hint}</p>
      )}
    </div>
  );
}
