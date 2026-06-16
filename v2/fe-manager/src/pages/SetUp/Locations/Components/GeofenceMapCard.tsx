import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Eyebrow, Field, Input } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { GeofencePicker } from './GeofencePicker';

const PRESET_DEFS = [
  { tKey: 'setup.geofenceMap.preset.street',    r: 60 },
  { tKey: 'setup.geofenceMap.preset.mall',      r: 100 },
  { tKey: 'setup.geofenceMap.preset.office',    r: 80 },
  { tKey: 'setup.geofenceMap.preset.warehouse', r: 150 },
];

export function GeofenceMapCard({ lat, lng, radius, onLatChange, onLngChange, onRadiusChange, isEditing }: {
  lat: number;
  lng: number;
  radius: number;
  onLatChange: (v: number) => void;
  onLngChange: (v: number) => void;
  onRadiusChange: (r: number) => void;
  isEditing: boolean;
}) {
  const { t } = useTranslation('setup');
  const [latStr, setLatStr] = useState(lat.toFixed(6));
  const [lngStr, setLngStr] = useState(lng.toFixed(6));

  useEffect(() => { setLatStr(lat.toFixed(6)); }, [lat]);
  useEffect(() => { setLngStr(lng.toFixed(6)); }, [lng]);

  const pct = ((radius - 20) / 180) * 100;

  return (
    <Card pad={false} style={{ overflow: 'hidden' }}>
      <div style={{ padding: 24, borderBottom: '1px solid #E8ECEF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Eyebrow>{t('setup.geofenceMap.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', marginTop: 6 }}>{t('setup.geofenceMap.title')}</h3>
          </div>
        </div>
      </div>
      <div style={{ isolation: 'isolate' }}>
        <GeofencePicker
          lat={lat}
          lng={lng}
          radius={radius}
          readOnly={!isEditing}
          height={240}
          onChange={(newLat, newLng) => { onLatChange(newLat); onLngChange(newLng); }}
        />
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{t('setup.geofenceMap.radius')}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#00B4A0' }}>{radius}m</span>
        </div>
        {isEditing ? (
          <>
            <input
              type="range" min={20} max={200} step={5} value={radius}
              onChange={e => onRadiusChange(Number(e.target.value))}
              className="geo-slider"
              style={{ '--pct': `${pct}%` } as React.CSSProperties}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#C8D4DC' }}>
              <span>20m</span><span>60m</span><span>100m</span><span>150m</span><span>200m</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {PRESET_DEFS.map(p => (
                <button key={p.r} onClick={() => onRadiusChange(p.r)} style={{
                  padding: '4px 11px', borderRadius: 999,
                  border: `1.5px solid ${radius === p.r ? '#00B4A0' : '#E8ECEF'}`,
                  background: radius === p.r ? '#E6F8F6' : '#fff',
                  color: radius === p.r ? '#008C7C' : '#6B7E8E',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                  {t(p.tKey)}<span style={{ opacity: 0.6, marginLeft: 4 }}>({p.r}m)</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', height: 6, background: '#E8ECEF', borderRadius: 999 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: 6, width: `${(radius / 200) * 100}%`, background: '#00B4A0', borderRadius: 999 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${(radius / 200) * 100}%`, transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: 999, background: '#fff', border: '2px solid #00B4A0', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#6B7E8E' }}><span>20m</span><span>200m</span></div>
          </>
        )}
        <div style={{ marginTop: 14, padding: '10px 12px', background: '#F0FAF7', borderRadius: 6, fontSize: 12, color: '#1A6B55', lineHeight: 1.5 }}>
          {t('setup.geofenceMap.tip')}
        </div>
        {!isEditing ? (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8ECEF' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
              {t('setup.geofenceMap.coordsSection')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label={t('setup.geofenceMap.lat')}>
                {lat.toFixed(4)}
              </Field>
              <Field label={t('setup.geofenceMap.lng')}>
                {lng.toFixed(4)}
              </Field>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8ECEF' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
              {t('setup.geofenceMap.coordsSection')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label={t('setup.geofenceMap.lat')}>
                <Input
                  value={latStr}
                  onChange={v => {
                    setLatStr(v);
                    const n = parseFloat(v);
                    if (!isNaN(n) && n >= -90 && n <= 90) onLatChange(n);
                  }}
                  mono
                  placeholder="10.7724"
                />
              </Field>
              <Field label={t('setup.geofenceMap.lng')}>
                <Input
                  value={lngStr}
                  onChange={v => {
                    setLngStr(v);
                    const n = parseFloat(v);
                    if (!isNaN(n) && n >= -180 && n <= 180) onLngChange(n);
                  }}
                  mono
                  placeholder="106.6983"
                />
              </Field>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#9BAAB5', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icons.pin size={11} stroke="#9BAAB5" />
              {t('setup.geofenceMap.coordHint')}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
