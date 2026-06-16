import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Circle, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icons } from '../../../../components/Icons';

const PIN_ICON = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1E2D3D;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(30,45,61,0.35);position:relative;"><div style="position:absolute;top:50%;left:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#00B4A0;transform:rotate(45deg);"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
});

export interface GeofencePickerProps {
  lat: number;
  lng: number;
  radius: number;
  readOnly?: boolean;
  height?: number;
  onChange?: (lat: number, lng: number) => void;
}

function MapPanner({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef({ lat, lng });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      prev.current = { lat, lng };
      map.panTo([lat, lng], { animate: true, duration: 0.4 });
    }
  }, [lat, lng, map]);
  return null;
}

function MapEvents({ readOnly, onChange }: { readOnly: boolean; onChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { if (!readOnly) onChange?.(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export function GeofencePicker({ lat, lng, radius, readOnly = false, height = 280, onChange }: GeofencePickerProps) {
  const { t } = useTranslation('setup');
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');
  const mapRef = useRef<L.Map | null>(null);

  function handleGeolocate() {
    if (!navigator.geolocation) { setLocErr(t('setup.geofence.errNoSupport')); return; }
    setLocating(true);
    setLocErr('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 17, { duration: 1 });
        onChange?.(latitude, longitude);
        setLocating(false);
      },
      () => { setLocErr(t('setup.geofence.errFailed')); setLocating(false); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      {/* Tăng nhẹ contrast, giữ nguyên màu tự nhiên của tile */}
      <style>{`
        .ba-map .leaflet-tile-pane {
          filter: contrast(1.06) saturate(0.85) brightness(1.01);
        }
      `}</style>

      <MapContainer
        center={[lat, lng]}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
        className="ba-map"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <ZoomControl position="bottomright" />
        <MapPanner lat={lat} lng={lng} />
        <MapEvents readOnly={readOnly} onChange={onChange} />
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{ color: '#00B4A0', fillColor: '#00B4A0', fillOpacity: 0.15, weight: 2, dashArray: '5 4' }}
        />
        <Marker
          position={[lat, lng]}
          icon={PIN_ICON}
          draggable={!readOnly}
          eventHandlers={{
            dragend(e) {
              const pos = (e.target as L.Marker).getLatLng();
              onChange?.(pos.lat, pos.lng);
            },
          }}
        />
      </MapContainer>

      {!readOnly && (
        <button
          onClick={handleGeolocate}
          disabled={locating}
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 1000,
            background: '#fff', border: '1px solid #C8D4DC', borderRadius: 6,
            padding: '6px 10px', cursor: locating ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600,
            color: locating ? '#9BAAB5' : '#1E2D3D',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            opacity: locating ? 0.7 : 1,
            transition: 'opacity 150ms',
          }}
        >
          <Icons.target size={13} stroke={locating ? '#9BAAB5' : '#00B4A0'} />
          {locating ? t('setup.geofence.locating') : t('setup.geofence.getLocation')}
        </button>
      )}

      <div style={{
        position: 'absolute', bottom: 6, left: 6, zIndex: 999,
        background: 'rgba(255,255,255,0.75)', padding: '2px 6px', borderRadius: 3,
        fontSize: 10, color: '#6B7E8E', pointerEvents: 'none',
      }}>
        © <a href="https://openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>OpenStreetMap</a>
      </div>

      {locErr && (
        <div style={{
          position: 'absolute', bottom: 6, left: 6, right: 6, zIndex: 1000,
          background: '#FFF3E0', border: '1px solid rgba(180,83,9,0.25)',
          borderRadius: 6, padding: '6px 12px', fontSize: 12, color: '#B45309',
        }}>
          {locErr}
        </div>
      )}
    </div>
  );
}
