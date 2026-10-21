// Carte interactive (Leaflet + React Leaflet) avec le fond CARTO Dark Matter.
// Les positions viennent de la table spot_infos (infos.latitude / infos.longitude).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../types/spot';
import { iconSvg } from './Icon';

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
const BASE_TILES = `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;
const LABEL_TILES = `https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;

// Un lieu placé sur la carte : le lieu + sa position [latitude, longitude]
type MapPoint = {
  spot: Spot;
  position: [number, number];
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// La couleur vient de la base : on n'accepte qu'un format #RRGGBB avant de l'insérer dans le HTML
function safeColor(color: string | null) {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#D4FF70';
}

// Marqueur personnalisé (divIcon = du HTML stylé en CSS, voir .spot-marker dans index.css).
// Il contient l'icône de la catégorie : l'information ne repose pas que sur la couleur.
function createMarkerIcon(spot: Spot, selected: boolean) {
  const classes = ['spot-marker'];
  if (selected) classes.push('is-selected');

  return L.divIcon({
    className: 'spot-marker-wrapper',
    html: `<span class="${classes.join(' ')}" style="--marker-color: ${safeColor(spot.category.color)}">${iconSvg(spot.category.icon ?? 'map-pin')}</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

type SpotMarkerProps = {
  point: MapPoint;
  selected: boolean;
  onSelect: (id: number) => void;
};

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
      eventHandlers={{ click: () => onSelect(spot.id) }}
    />
  );
}

// Recadre la carte sur les lieux affichés quand les filtres changent
function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const ids = points.map((point) => point.spot.id).join(',');

  function fit() {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((point) => point.position));
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
    if (!point) return;
    const zoom = Math.max(map.getZoom(), 15);
    if (prefersReducedMotion()) {
      map.setView(point.position, zoom);
    } else {
      map.flyTo(point.position, zoom, { duration: 0.8 });
    }
  }, [selectedId]); // on se déplace seulement quand un autre lieu est sélectionné

  return null;
}

type SpotMapProps = {
  spots: Spot[]; // les lieux filtrés (les mêmes que la liste)
  selectedId: number | null;
  onSelect: (id: number) => void;
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

  const selectedPoint = points.find((point) => point.spot.id === selectedId) ?? null;

  // Message "comment zoomer", affiché 1,5 seconde quand on fait défiler au-dessus de la carte
  const [zoomHintVisible, setZoomHintVisible] = useState(false);
  const hintTimer = useRef<number | undefined>(undefined);

  // useCallback : la même fonction est gardée d'un affichage à l'autre
  const showZoomHint = useCallback(() => {
    setZoomHintVisible(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setZoomHintVisible(false), 1500);
  }, []);

  return (
    <div className="map-frame relative isolate h-full overflow-hidden rounded-[2rem] border border-white/10">
      <MapContainer
        center={PARIS}
        zoom={13}
        maxZoom={MAX_ZOOM}
        zoomSnap={0} // zoom progressif (utile pour le pincement du trackpad)
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false} // molette simple = défilement de la page (le pincement est géré par PinchZoom)
      >
        <TileLayer
          url={BASE_TILES}
          attribution={ATTRIBUTION}
          className="map-tiles-base"
          subdomains="abcd"
          maxNativeZoom={MAX_TILE_ZOOM}
          maxZoom={MAX_ZOOM}
        />
        <TileLayer
          url={LABEL_TILES}
          className="map-tiles-labels"
          subdomains="abcd"
          maxNativeZoom={MAX_TILE_ZOOM}
          maxZoom={MAX_ZOOM}
          zIndex={2}
        />

        {points.map((point) => (
          <SpotMarker key={point.spot.id} point={point} selected={point.spot.id === selectedId} onSelect={onSelect} />
        ))}

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

      {!CARTO_KEY && (
        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-[500] rounded-2xl border border-red-400/40 bg-charcoal/90 px-4 py-3 text-sm text-red-200">
          Fond de carte indisponible : ajoute VITE_CARTO_KEY dans client/.env puis relance le site.
        </div>
      )}

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
    const container = map.getContainer();

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        onPlainScroll(); // défilement simple : la page défile, on rappelle comment zoomer
        return;
      }
      event.preventDefault(); // empêche le navigateur de zoomer toute la page
      const zoom = map.getZoom() - event.deltaY * 0.01;
      map.setZoomAround(map.mouseEventToContainerPoint(event), zoom, { animate: false });
    }

    // passive: false est nécessaire pour pouvoir appeler preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [map, onPlainScroll]);

  return null;
}

// Boutons de zoom en bas à droite (plus faciles à atteindre au pouce sur mobile)
function ZoomButtons() {
  const map = useMap();

  useEffect(() => {
    const control = L.control.zoom({ position: 'bottomright', zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' });
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}
