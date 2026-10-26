// Carte interactive (Leaflet + React Leaflet) avec le fond CARTO Dark Matter.
// Les positions viennent de la table spot_infos (infos.latitude / infos.longitude).
import { useMemo } from 'react';
// L : la bibliothèque Leaflet elle-même (ici, pour créer les icônes des marqueurs)
import L from 'leaflet';
// Les composants React qui enveloppent Leaflet : la carte, les marqueurs, les couches d'images
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
// Le CSS de base de Leaflet (sans lui, la carte s'affiche en morceaux)
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../types/spot';
import { iconSvg } from './Icon';

// Centre de la carte au démarrage : Paris [latitude, longitude].
// Au zoom 13, tous les lieux de démonstration sont visibles.
const PARIS: [number, number] = [48.8606, 2.3522];

// CARTO fournit des tuiles jusqu'au zoom 18 seulement (au-delà : erreur 403 et carte noire).
// Au zoom 19, Leaflet agrandit simplement les tuiles du niveau 18.
const MAX_TILE_ZOOM = 18;
const MAX_ZOOM = 19;

// Attribution obligatoire : données OpenStreetMap, fond de carte CARTO
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Clé CARTO (gratuite pour un usage scolaire). Ce n'est pas un secret :
// elle apparaît dans l'adresse de chaque tuile chargée par le navigateur.
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY;

// Deux couches CARTO Dark Matter superposées :
// - le fond sans les noms de rues, teinté en CSS pour l'ambiance cyberpunk (.map-tiles-base)
// - les noms de rues seuls, par-dessus, laissés intacts pour rester lisibles
// Une "tuile" est une petite image carrée de la carte. Leaflet remplace {z} (zoom), {x} et {y}
// (position) pour charger les bonnes tuiles ; {s} et {r} choisissent le serveur et la résolution.
const BASE_TILES = `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;
const LABEL_TILES = `https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;

// Un lieu placé sur la carte : le lieu + sa position [latitude, longitude]
type MapPoint = {
  spot: Spot;
  position: [number, number];
};

// Marqueur personnalisé (divIcon = du HTML stylé en CSS, voir .spot-marker dans index.css).
// Il contient l'icône de la catégorie : l'information ne repose pas que sur la couleur.
function createMarkerIcon(spot: Spot, selected: boolean) {
  // Les classes CSS du marqueur ; "is-selected" le grossit et le remplit de couleur
  const classes = ['spot-marker'];
  if (selected) classes.push('is-selected');

  return L.divIcon({
    className: 'spot-marker-wrapper',
    // Le HTML du marqueur : un rond de la couleur de la catégorie (--marker-color) avec son icône.
    // Si la catégorie n'a pas de couleur (null), on prend le vert acide par défaut.
    html: `<span class="${classes.join(' ')}" style="--marker-color: ${spot.category.color ?? '#D4FF70'}">${iconSvg(spot.category.icon ?? 'map-pin')}</span>`,
    iconSize: [40, 40], // taille du marqueur en pixels
    iconAnchor: [20, 20], // le point du marqueur posé sur la position : son centre
  });
}

type SpotMarkerProps = {
  point: MapPoint;
  selected: boolean;
  onSelect: (id: number) => void; // appelée au clic sur le marqueur
};

// Un marqueur sur la carte
function SpotMarker({ point, selected, onSelect }: SpotMarkerProps) {
  const { spot } = point;
  // L'icône n'est recréée que si son apparence change
  const icon = useMemo(() => createMarkerIcon(spot, selected), [spot.category.icon, spot.category.color, selected]);

  return (
    <Marker
      position={point.position}
      icon={icon}
      title={spot.name} // texte au survol, et nom lu par les lecteurs d'écran
      alt={spot.name}
      zIndexOffset={selected ? 1000 : 0} // le lieu sélectionné passe devant les autres
      eventHandlers={{ click: () => onSelect(spot.id) }} // clic : on sélectionne ce lieu
    />
  );
}

type SpotMapProps = {
  spots: Spot[]; // les lieux filtrés (les mêmes que la liste)
  selectedId: number | null; // le lieu ouvert (null = aucun)
  onSelect: (id: number) => void; // appelée au clic sur un marqueur
};

export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  // Seuls les lieux qui ont une fiche spot_infos peuvent être placés sur la carte
  const points = useMemo(() => {
    const result: MapPoint[] = [];
    for (const spot of spots) {
      if (spot.infos) result.push({ spot, position: [spot.infos.latitude, spot.infos.longitude] });
    }
    return result;
  }, [spots]);

  return (
    <div className="map-frame relative isolate h-full overflow-hidden rounded-[2rem] border border-white/10">
      {/* MapContainer crée la carte Leaflet. Tout ce qui est à l'intérieur est ajouté à la carte.
          Le zoom se fait avec la molette, le pincement du trackpad ou les boutons + / -. */}
      <MapContainer center={PARIS} zoom={13} maxZoom={MAX_ZOOM} className="h-full w-full">
        {/* Couche 1 : le fond de carte sans les noms (teinté en violet par le CSS) */}
        <TileLayer
          url={BASE_TILES}
          attribution={ATTRIBUTION}
          className="map-tiles-base"
          subdomains="abcd"
          maxNativeZoom={MAX_TILE_ZOOM}
          maxZoom={MAX_ZOOM}
        />
        {/* Couche 2 : les noms de rues et de quartiers, posés par-dessus */}
        <TileLayer
          url={LABEL_TILES}
          className="map-tiles-labels"
          subdomains="abcd"
          maxNativeZoom={MAX_TILE_ZOOM}
          maxZoom={MAX_ZOOM}
          zIndex={2}
        />

        {/* Un marqueur par lieu localisé */}
        {points.map((point) => (
          <SpotMarker key={point.spot.id} point={point} selected={point.spot.id === selectedId} onSelect={onSelect} />
        ))}
      </MapContainer>

      {/* Si la clé CARTO manque dans client/.env, on prévient au lieu d'afficher une carte vide */}
      {!CARTO_KEY && (
        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-[500] rounded-2xl border border-red-400/40 bg-charcoal/90 px-4 py-3 text-sm text-red-200">
          Fond de carte indisponible : ajoute VITE_CARTO_KEY dans client/.env puis relance le site.
        </div>
      )}

      {/* Aucun lieu n'a de localisation : message au lieu d'une carte sans marqueur */}
      {points.length === 0 && (
        <div className="pointer-events-none absolute inset-x-6 top-6 z-[500] rounded-2xl border border-white/10 bg-charcoal/90 px-4 py-3 text-sm text-ash">
          Aucun lieu localisé à afficher sur la carte.
        </div>
      )}
    </div>
  );
}
