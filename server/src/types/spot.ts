// Format d'un lieu renvoyé par l'API.

export type Category = {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
};

// Contenu de la table spot_infos (localisation du lieu)
export type SpotInfos = {
  address: string | null;
  city: string;
  latitude: number;
  longitude: number;
};

export type Spot = {
  id: number;
  name: string;
  description: string | null;
  images: string[];
  available: boolean;
  category: Category;
  infos: SpotInfos | null; // null si le lieu n'a pas de fiche spot_infos
};

// Une erreur de validation, rattachée au champ concerné
export type FieldError = {
  field: string;
  message: string;
};
