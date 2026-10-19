// Carte interactive (Leaflet + React Leaflet) avec le fond CARTO Dark Matter.
// Les positions viennent de la table spot_infos (infos.latitude / infos.longitude).
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../types/spot';
import { iconSvg } from './Icon';

const PARIS: [number, number] = [48.8606, 2.3522];

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
// routeStep : numéro affiché sur le marqueur si le lieu fait partie de la Night Route
function createMarkerIcon(spot: Spot, selected: boolean, routeStep: number | null) {
  const classes = ['spot-marker'];
  if (selected) classes.push('is-selected');
  if (!spot.available) classes.push('is-unavailable');

  return L.divIcon({
    className: 'spot-marker-wrapper',
    html: `<span class="${classes.join(' ')}" style="--marker-color: ${safeColor(spot.category.color)}">${iconSvg(spot.category.icon ?? 'map-pin')}${
      routeStep !== null ? `<span class="spot-marker-step">${routeStep}</span>` : ''
    }</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

type SpotMarkerProps = {
  point: MapPoint;
  selected: boolean;
  routeStep: number | null;
  onSelect: (id: number) => void;
};

function SpotMarker({ point, selected, routeStep, onSelect }: SpotMarkerProps) {
  const { spot } = point;
  // L'icône n'est recréée que si son apparence change
  const icon = useMemo(
    () => createMarkerIcon(spot, selected, routeStep),
    [spot.category.icon, spot.category.color, spot.available, selected, routeStep],
  );

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
    const hidden = map.getContainer().clientWidth === 0;
    if (points.length === 0 || hidden) return;
    const bounds = L.latLngBounds(points.map((point) => point.position));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: !prefersReducedMotion() });
  }

  // On recadre seulement quand la liste des lieux affichés change
  useEffect(() => {
    fit();
  }, [ids]);

  // Sur mobile, la carte est masquée quand on regarde la liste. Quand elle
  // réapparaît, Leaflet doit recalculer sa taille (invalidateSize), puis on recadre.
  useEffect(() => {
    let wasHidden = map.getContainer().clientWidth === 0;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      const hidden = map.getContainer().clientWidth === 0;
      if (wasHidden && !hidden) fit();
      wasHidden = hidden;
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, ids]);

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
  routeStops: Spot[]; // étapes de la Night Route, dans l'ordre
};

export function SpotMap({ spots, selectedId, onSelect, routeStops }: SpotMapProps) {
  // Seuls les lieux qui ont une fiche spot_infos peuvent être placés sur la carte
  const points = useMemo(() => {
    const result: MapPoint[] = [];
    for (const spot of spots) {
      if (spot.infos) result.push({ spot, position: [spot.infos.latitude, spot.infos.longitude] });
    }
    return result;
  }, [spots]);

  const selectedPoint = points.find((point) => point.spot.id === selectedId) ?? null;

  // Night Route : position de chaque étape (ligne droite entre elles, à vol d'oiseau)
  const routeIds = routeStops.map((stop) => stop.id);
  const routePositions: [number, number][] = [];
  for (const stop of routeStops) {
    if (stop.infos) routePositions.push([stop.infos.latitude, stop.infos.longitude]);
  }

  return (
    <div className="map-frame relative isolate h-full overflow-hidden rounded-[2rem] border border-white/10">
      <MapContainer center={PARIS} zoom={13} className="h-full w-full" zoomControl={false}>
        <TileLayer
          url={BASE_TILES}
          attribution={ATTRIBUTION}
          className="map-tiles-base"
          subdomains="abcd"
          maxZoom={20}
        />
        <TileLayer url={LABEL_TILES} className="map-tiles-labels" subdomains="abcd" maxZoom={20} zIndex={2} />

        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ className: 'route-line', color: '#D4FF70', weight: 3, dashArray: '2 10' }}
          />
        )}

        {points.map((point) => {
          const stepIndex = routeIds.indexOf(point.spot.id);
          return (
            <SpotMarker
              key={point.spot.id}
              point={point}
              selected={point.spot.id === selectedId}
              routeStep={stepIndex === -1 ? null : stepIndex + 1}
              onSelect={onSelect}
            />
          );
        })}

        <FitToPoints points={points} />
        <FlyToSelected point={selectedPoint} />
        <ZoomButtons />
      </MapContainer>

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
