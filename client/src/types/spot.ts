// Types partagés par le frontend : ils reprennent le format renvoyé par l'API.

export type Category = {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
};

// Localisation d'un lieu (table spot_infos)
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
  category: Category;
  infos: SpotInfos | null; // null : le lieu n'a pas de fiche, il n'apparaît pas sur la carte
};

// Données envoyées à l'API pour créer ou modifier un lieu (POST / PUT).
// category_id, latitude et longitude peuvent manquer si le champ est vide :
// c'est alors le serveur qui renvoie l'erreur de validation.
export type SpotInput = {
  name: string;
  category_id?: number;
  description: string;
  images: string[];
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
};

// Filtres de la page Explorer
export type SpotFilters = {
  search: string;
  categoryId: number | null;
  city: string;
  onlyFavorites: boolean;
};
