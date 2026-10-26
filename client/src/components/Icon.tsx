// Icônes SVG dessinées à la main (aucune bibliothèque).
// Chaque icône est un petit texte SVG : le composant <Icon> l'affiche dans React,
// et la carte réutilise le même texte dans ses marqueurs (voir iconSvg()).
// Les noms des icônes de catégories correspondent à la colonne categories.icon.

const ICONS: Record<string, string> = {
  // --- Catégories ---
  martini: '<path d="M5 4h14l-7 8z"/><path d="M12 12v8M8 20h8"/>',
  'building-2':
    '<path d="M4 21V5l8-2v18M12 9l8 2v10M2 21h20"/><path d="M8 8h.01M8 12h.01M8 16h.01M16 14h.01M16 18h.01"/>',
  camera:
    '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  'moon-star': '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v4M15 5h4"/>',
  'music-2': '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  trees: '<path d="M9 3 3.5 13h11z"/><path d="M9 13v8M17 21v-4M17 8l-4 9h8z"/>',
  palette:
    '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-1.9-.5-1.2.3-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  utensils: '<path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7a2 2 0 0 1-2 2M8 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
  'map-pin': '<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',

  // --- Interface (image de remplacement, cadenas de la page admin) ---
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
};

// Attributs communs : trait de la couleur du texte (currentColor), extrémités arrondies.
// viewBox="0 0 24 24" : chaque icône est dessinée dans un carré de 24 x 24.
const SVG_ATTRIBUTES =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

// Renvoie le dessin (texte SVG) d'une icône à partir de son nom, ex. iconContent('lock')
function iconContent(name: string) {
  return ICONS[name] ?? ICONS['map-pin']; // icône inconnue : un repère de carte
}

// Icône complète sous forme de texte SVG (utilisée dans le HTML des marqueurs de la carte).
// La carte Leaflet attend du HTML en texte, pas un composant React : d'où cette version "texte".
export function iconSvg(name: string) {
  return `<svg ${SVG_ATTRIBUTES}>${iconContent(name)}</svg>`;
}

type IconProps = {
  name: string; // nom de l'icône, ex. "lock" ou "martini"
  className?: string; // taille et couleur, ex. "size-4 text-acid"
};

// Composant React qui affiche une icône : <Icon name="lock" />
// Par défaut, l'icône fait la taille "size-5" (20 px).
export function Icon({ name, className = 'size-5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      // Le contenu vient de la liste ICONS ci-dessus (textes fixes écrits dans le code),
      // jamais d'une donnée saisie par un utilisateur : on peut l'insérer tel quel.
      dangerouslySetInnerHTML={{ __html: iconContent(name) }}
    />
  );
}
