'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapAlertItem } from '@/lib/api';

// Fix Leaflet default icon on Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '©OpenStreetMap contributors ©CARTO';
const INDIA_CENTER: [number, number] = [22.5, 82.0];
const DEFAULT_ZOOM = 5;

// Minimal fallback route lines
const FALLBACK_ROUTES: Array<[number, number][]> = [
  [[28.6418, 77.2195], [26.8467, 80.9462], [26.4499, 80.3319], [25.3176, 82.9739], [25.5941, 85.1376], [22.5833, 88.3432]],
  [[28.6418, 77.2195], [26.9124, 75.7873], [23.0225, 72.5714], [21.1702, 72.8311], [18.9399, 72.8355]],
  [[28.6418, 77.2195], [23.2599, 77.4126], [21.1458, 79.0882], [17.3616, 78.4747], [13.0827, 80.2707], [12.9777, 77.5713]],
];

const FALLBACK_STATIONS = [
  { name: 'New Delhi', code: 'NDLS', lat: 28.6418, lng: 77.2195 },
  { name: 'Mumbai CST', code: 'CSMT', lat: 18.9399, lng: 72.8355 },
  { name: 'Howrah', code: 'HWH', lat: 22.5833, lng: 88.3432 },
  { name: 'Chennai Central', code: 'MAS', lat: 13.0827, lng: 80.2707 },
  { name: 'Bangalore City', code: 'SBC', lat: 12.9777, lng: 77.5713 },
  { name: 'Hyderabad', code: 'HYB', lat: 17.3616, lng: 78.4747 },
];

// ── Severity colour helpers ──────────────────────────────────────────────────
function alertColor(severity: string): string {
  if (severity === 'RED') return '#ff3366';
  if (severity === 'YELLOW') return '#ffd700';
  return '#00ff88';
}

function alertTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    crack: '🔩', signal: '🚦', flood: '🌊', derailment: '💥', none: '⚠️',
  };
  return icons[type] ?? '⚠️';
}

// ── Train line style helpers ─────────────────────────────────────────────────
function trainColor(props: Record<string, unknown>): string {
  const name = ((props.name as string) || '').toUpperCase();
  if (['RAJDHANI', 'SHATABDI', 'DURONTO', 'TEJAS', 'VANDE'].some(t => name.includes(t))) return '#00d4ff';
  if (['EXPRESS', 'MAIL', 'SUPERFAST', 'INTERCITY'].some(t => name.includes(t))) return '#0694a2';
  return '#1e5e70';
}

function trainWeight(props: Record<string, unknown>): number {
  const name = ((props.name as string) || '').toUpperCase();
  if (['RAJDHANI', 'SHATABDI', 'DURONTO', 'TEJAS', 'VANDE'].some(t => name.includes(t))) return 2;
  if (['EXPRESS', 'MAIL', 'SUPERFAST'].some(t => name.includes(t))) return 1.5;
  return 1;
}

// ── Pulse ring marker for active alerts ─────────────────────────────────────
interface PulseMarkerProps {
  alert: MapAlertItem;
}

function PulseMarker({ alert }: PulseMarkerProps) {
  const map = useMap();
  const position: [number, number] = [alert.lat, alert.lng];
  const color = alertColor(alert.severity);

  useEffect(() => {
    const pulses = [1, 2, 3].map((i) => {
      const circle = L.circleMarker(position, {
        radius: 8 + i * 6,
        color,
        fillColor: color,
        fillOpacity: 0,
        weight: 1.5,
        opacity: 0,
      }).addTo(map);

      let opacity = 0.8;
      let growing = false;
      const interval = setInterval(() => {
        if (growing) {
          opacity += 0.05;
          if (opacity >= 0.8) growing = false;
        } else {
          opacity -= 0.03;
          if (opacity <= 0) growing = true;
        }
        circle.setStyle({ opacity: Math.max(0, opacity - i * 0.25) });
      }, 50 + i * 20);

      return { circle, interval };
    });

    return () => {
      pulses.forEach(p => { clearInterval(p.interval); p.circle.remove(); });
    };
  }, [map, alert.lat, alert.lng, alert.severity, color, position]);

  return (
    <CircleMarker
      center={position}
      radius={6}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
    >
      <Tooltip permanent={false} direction="top">
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#e2e8f0', maxWidth: '220px' }}>
          <div style={{ fontWeight: 700, color, marginBottom: 4 }}>
            {alertTypeIcon(alert.type)} {alert.station}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>
            {alert.type === 'crack' ? 'Track defect' :
             alert.type === 'signal' ? 'Signal failure' :
             alert.type === 'flood' ? 'Track flooding' :
             alert.type === 'derailment' ? 'Derailment risk' : 'Alert'} · {alert.severity} severity
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export interface MapInnerProps {
  mapAlerts: MapAlertItem[];
  routeState: 'normal' | 'disrupted';
}

export default function MapInner({ mapAlerts, routeState }: MapInnerProps) {
  const [trainsGeo, setTrainsGeo] = useState<GeoJSON.GeoJsonObject | null>(null);
  const [stationsGeo, setStationsGeo] = useState<GeoJSON.GeoJsonObject | null>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'fallback'>('loading');

  useEffect(() => {
    Promise.all([
      fetch('/data/trains_map.geojson').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch('/data/stations.geojson').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ])
      .then(([trains, stations]) => {
        setTrainsGeo(trains);
        setStationsGeo(stations);
        setLoadStatus('loaded');
      })
      .catch(() => setLoadStatus('fallback'));
  }, []);

  // Style for train route lines (colour-coded by train class)
  const trainLineStyle = (feature?: GeoJSON.Feature) => {
    const props = (feature?.properties ?? {}) as Record<string, unknown>;
    const disrupted = routeState === 'disrupted';
    return {
      color: disrupted ? '#ff6b6b' : trainColor(props),
      weight: trainWeight(props),
      opacity: disrupted ? 0.45 : 0.65,
      dashArray: disrupted ? '4 4' : undefined,
    };
  };

  // Render each station as a small circle
  const stationPointToLayer = (_: GeoJSON.Feature, latlng: L.LatLng) =>
    L.circleMarker(latlng, {
      radius: 2.5,
      color: '#00b4ff',
      fillColor: '#00b4ff',
      fillOpacity: 0.75,
      weight: 0.5,
    });

  // Popup tooltip for each station
  const onEachStation = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const p = (feature.properties ?? {}) as Record<string, string>;
    layer.bindPopup(
      `<div style="font-family:Inter,sans-serif;font-size:12px;color:#e2e8f0;padding:4px 0">
         <div style="font-weight:700;color:#00d4ff">${p.name || p.code}</div>
         <div style="color:#94a3b8;font-size:10px">${p.code ?? ''} · ${p.zone ?? ''} · ${p.state ?? ''}</div>
       </div>`,
      { closeButton: false }
    );
  };

  // Popup tooltip for each train route
  const onEachTrain = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const p = (feature.properties ?? {}) as Record<string, unknown>;
    layer.bindPopup(
      `<div style="font-family:Inter,sans-serif;font-size:12px;color:#e2e8f0;padding:4px 0">
         <div style="font-weight:700;color:#06b6d4">${p.name ?? ''}</div>
         <div style="color:#94a3b8;font-size:10px">No. ${p.number ?? ''} · ${p.distance ?? 0} km</div>
         <div style="color:#64748b;font-size:10px;margin-top:2px">${p.from ?? ''} → ${p.to ?? ''}</div>
       </div>`,
      { closeButton: false }
    );
  };

  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%', background: '#0a0e1a' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={DARK_TILES} attribution={TILE_ATTRIBUTION} />

      {/* ── Real train routes (railways-master dataset) ── */}
      {loadStatus === 'loaded' && trainsGeo && (
        <GeoJSON
          key={`trains-${routeState}`}
          data={trainsGeo}
          style={trainLineStyle}
          onEachFeature={onEachTrain}
        />
      )}

      {/* ── Real station dots (railways-master dataset) ── */}
      {loadStatus === 'loaded' && stationsGeo && (
        <GeoJSON
          key="stations"
          data={stationsGeo}
          pointToLayer={stationPointToLayer}
          onEachFeature={onEachStation}
        />
      )}

      {/* ── Fallback lines when dataset hasn't loaded ── */}
      {loadStatus === 'fallback' && FALLBACK_ROUTES.map((route, i) => (
        <Polyline
          key={i}
          positions={route}
          pathOptions={{ color: '#06b6d4', weight: 1.5, opacity: 0.6 }}
        />
      ))}

      {/* ── Fallback station markers ── */}
      {loadStatus === 'fallback' && FALLBACK_STATIONS.map((s) => (
        <CircleMarker
          key={s.code}
          center={[s.lat, s.lng]}
          radius={4}
          pathOptions={{ color: '#00b4ff', fillColor: '#00b4ff', fillOpacity: 0.8, weight: 1 }}
        >
          <Tooltip direction="top" opacity={0.95}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#e2e8f0' }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{s.code}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* ── Active alert pulse markers ── */}
      {mapAlerts.map((alert) => (
        <PulseMarker key={alert.id} alert={alert} />
      ))}
    </MapContainer>
  );
}
