// Types partagés par le frontend : ils reprennent le format renvoyé par l'API.
// Un "type" décrit la forme d'un objet : quelles propriétés il a et de quel genre (texte, nombre...).
// Ça n'existe que pour TypeScript : ça aide à éviter les fautes, mais ça disparaît du site final.

// Une catégorie (table categories)
export type Category = {
  id: number;
  name: string;
  icon: string | null; // "string | null" : du texte, ou null si la case est vide en base
  color: string | null; // couleur au format #RRGGBB
};

// Localisation d'un lieu (table spot_infos)
export type SpotInfos = {
  address: string | null;
  city: string;
  latitude: number;
  longitude: number;
};

// Un lieu complet, tel que l'API le renvoie (table spots + sa catégorie + sa localisation)
export type Spot = {
  id: number;
  name: string;
  description: string | null;
  images: string[]; // string[] : une liste de textes (les adresses des images)
  category: Category;
  infos: SpotInfos | null; // null : le lieu n'a pas de fiche, il n'apparaît pas sur la carte
};

// Données envoyées à l'API pour créer ou modifier un lieu (POST / PUT).
// category_id, latitude et longitude peuvent manquer si le champ est vide :
// c'est alors le serveur qui renvoie l'erreur de validation.
// Le "?" après un nom veut dire "propriété facultative".
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
  search: string; // texte tapé dans la recherche
  categoryId: number | null; // catégorie choisie, null = toutes
};
