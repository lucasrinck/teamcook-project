// Carte interactive (Leaflet + React Leaflet) avec le fond CARTO Dark Matter.
// Les positions viennent de la table spot_infos (infos.latitude / infos.longitude).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// L : la bibliothèque Leaflet elle-même (création des icônes, des limites, des boutons de zoom)
import L from 'leaflet';
// Les composants React qui enveloppent Leaflet : la carte, les marqueurs, les couches d'images
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
// Le CSS de base de Leaflet (sans lui, la carte s'affiche en morceaux)
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../types/spot';
import { iconSvg } from './Icon';

// Centre de la carte au démarrage : Paris [latitude, longitude]
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

// true si l'utilisateur a demandé à réduire les animations dans les réglages de son système
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// La couleur vient de la base : on n'accepte qu'un format #RRGGBB avant de l'insérer dans le HTML.
// Sinon (couleur absente ou bizarre), on prend le vert acide par défaut.
function safeColor(color: string | null) {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#D4FF70';
}

// Marqueur personnalisé (divIcon = du HTML stylé en CSS, voir .spot-marker dans index.css).
// Il contient l'icône de la catégorie : l'information ne repose pas que sur la couleur.
function createMarkerIcon(spot: Spot, selected: boolean) {
  // Les classes CSS du marqueur ; "is-selected" le grossit et le remplit de couleur
  const classes = ['spot-marker'];
  if (selected) classes.push('is-selected');

  return L.divIcon({
    className: 'spot-marker-wrapper',
    // Le HTML du marqueur : un rond de la couleur de la catégorie (--marker-color) avec son icône
    html: `<span class="${classes.join(' ')}" style="--marker-color: ${safeColor(spot.category.color)}">${iconSvg(spot.category.icon ?? 'map-pin')}</span>`,
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

// Recadre la carte sur les lieux affichés quand les filtres changent.
// Ce composant n'affiche rien (return null) : il agit seulement sur la carte.
function FitToPoints({ points }: { points: MapPoint[] }) {
  // useMap() donne accès à la carte Leaflet dans laquelle ce composant est placé
  const map = useMap();
  // Les id des lieux affichés, réunis en un texte (ex. "1,4,7") : facile à comparer d'un affichage à l'autre
  const ids = points.map((point) => point.spot.id).join(',');

  function fit() {
    if (points.length === 0) return;
    // latLngBounds calcule le rectangle qui contient tous les lieux
    const bounds = L.latLngBounds(points.map((point) => point.position));
    // fitBounds zoome et déplace la carte pour montrer ce rectangle en entier
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: !prefersReducedMotion() });
  }

  // On recadre seulement quand la liste des lieux affichés change
  useEffect(() => {
    fit();
  }, [ids]);

  return null;
}

// Centre la carte sur le lieu sélectionné
function FlyToSelected({ point }: { point: MapPoint | null }) {
  const map = useMap();
  const selectedId = point?.spot.id;

  useEffect(() => {
    if (!point) return; // aucun lieu sélectionné : on ne bouge pas
    // On zoome au moins au niveau 15 (on garde le zoom actuel s'il est déjà plus proche)
    const zoom = Math.max(map.getZoom(), 15);
    if (prefersReducedMotion()) {
      map.setView(point.position, zoom); // déplacement instantané
    } else {
      map.flyTo(point.position, zoom, { duration: 0.8 }); // déplacement animé, comme un vol
    }
  }, [selectedId]); // on se déplace seulement quand un autre lieu est sélectionné

  return null;
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

  // Le point du lieu sélectionné (ou null)
  const selectedPoint = points.find((point) => point.spot.id === selectedId) ?? null;

  // Message "comment zoomer", affiché 1,5 seconde quand on fait défiler au-dessus de la carte
  const [zoomHintVisible, setZoomHintVisible] = useState(false);
  // useRef garde le numéro du minuteur entre deux affichages, sans relancer d'affichage
  const hintTimer = useRef<number | undefined>(undefined);

  // useCallback : la même fonction est gardée d'un affichage à l'autre
  const showZoomHint = useCallback(() => {
    setZoomHintVisible(true);
    // Si le message était déjà affiché, on annule l'ancien minuteur et on repart pour 1,5 seconde
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setZoomHintVisible(false), 1500);
  }, []);

  return (
    <div className="map-frame relative isolate h-full overflow-hidden rounded-[2rem] border border-white/10">
      {/* MapContainer crée la carte Leaflet. Tout ce qui est à l'intérieur est ajouté à la carte. */}
      <MapContainer
        center={PARIS}
        zoom={13}
        maxZoom={MAX_ZOOM}
        zoomSnap={0} // zoom progressif (utile pour le pincement du trackpad)
        className="h-full w-full"
        zoomControl={false} // on ajoute nos propres boutons de zoom (voir ZoomButtons)
        scrollWheelZoom={false} // molette simple = défilement de la page (le pincement est géré par PinchZoom)
      >
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

        {/* Ces composants n'affichent rien : ils pilotent la carte (cadrage, vol, zoom) */}
        <FitToPoints points={points} />
        <FlyToSelected point={selectedPoint} />
        <ZoomButtons />
        <PinchZoom onPlainScroll={showZoomHint} />
      </MapContainer>

      {/* Petit message quand on fait défiler la page au-dessus de la carte */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-6 z-[500] flex justify-center transition-opacity duration-300 ${
          zoomHintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="rounded-full bg-charcoal/90 px-4 py-2 text-sm text-mist">
          Pince le trackpad ou utilise Ctrl + molette pour zoomer
        </span>
      </div>

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

// Zoom au pincement du trackpad (ou Ctrl + molette).
// Le navigateur envoie un pincement comme une molette avec ctrlKey = true :
// on zoome la carte dans ce cas, sinon on laisse la page défiler normalement.
function PinchZoom({ onPlainScroll }: { onPlainScroll: () => void }) {
  const map = useMap();

  useEffect(() => {
    // L'élément HTML qui contient la carte
    const container = map.getContainer();

    // Appelée à chaque mouvement de molette (ou de trackpad) au-dessus de la carte
    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        onPlainScroll(); // défilement simple : la page défile, on rappelle comment zoomer
        return;
      }
      event.preventDefault(); // empêche le navigateur de zoomer toute la page
      // deltaY = l'ampleur du geste : négatif quand on écarte les doigts (zoom avant)
      const zoom = map.getZoom() - event.deltaY * 0.01;
      // On zoome autour du point de la carte qui est sous le pointeur
      map.setZoomAround(map.mouseEventToContainerPoint(event), zoom, { animate: false });
    }

    // passive: false est nécessaire pour pouvoir appeler preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });
    // Nettoyage : on retire l'écoute quand la carte disparaît
    return () => container.removeEventListener('wheel', handleWheel);
  }, [map, onPlainScroll]);

  return null;
}

// Boutons de zoom en bas à droite (plus faciles à atteindre au pouce sur mobile)
function ZoomButtons() {
  const map = useMap();

  useEffect(() => {
    // On crée les boutons + / - de Leaflet et on les ajoute à la carte
    const control = L.control.zoom({ position: 'bottomright', zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' });
    control.addTo(map);
    // Nettoyage : on les retire si la carte disparaît
    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}
