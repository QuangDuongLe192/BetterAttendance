import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Btn, Skeleton, SkeletonCard, ErrorBanner, Eyebrow } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { LOCATIONS, type Location } from '../../../services/setup';

interface Props { isLoading?: boolean; error?: string | null; }

function modeLabel(mode: string[] = [], t: (k: string) => string): string {
  const hasWifi = mode.includes('wifi');
  const hasGeo  = mode.includes('geo');
  if (hasWifi && hasGeo) return t('setup.locations.mode.wifiAndGps');
  if (hasWifi) return t('setup.locations.mode.wifiOnly');
  if (hasGeo)  return t('setup.locations.mode.gpsOnly');
  return t('setup.locations.mode.none');
}

function modeIcon(mode: string[] = []) {
  const hasWifi = mode.includes('wifi');
  const hasGeo  = mode.includes('geo');
  if (hasWifi && hasGeo) return <><Icons.wifi size={12} stroke="#00B4A0" /><Icons.target size={12} stroke="#00B4A0" /></>;
  if (hasWifi) return <Icons.wifi size={12} stroke="#00B4A0" />;
  if (hasGeo)  return <Icons.target size={12} stroke="#00B4A0" />;
  return <Icons.x size={12} stroke="#6B7E8E" />;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

export function LocationsList({ isLoading, error }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('setup');
  const [search, setSearch] = useState('');

  if (isLoading) return <LocationsListSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const locations = LOCATIONS ?? [];
  const filtered = search.trim()
    ? locations.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase()))
    : locations;

  return (
    <div style={{ margin: '-40px -40px -80px', padding: '36px 40px 80px', position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)' }}>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } .loc-row { animation: fadeUp 380ms ease both; }`}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.22) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%',  width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.08) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>{t('setup.locations.eyebrow')}</Eyebrow>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
              {t('setup.locations.title')}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7E8E', marginTop: 8 }}>
              {t('setup.locations.subtitle', { count: locations.length })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', ...glass, borderRadius: 8, minWidth: 240, height: 36, boxSizing: 'border-box' }}>
              <Icons.search size={14} stroke="#6B7E8E" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('setup.locations.search.placeholder')}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1E2D3D', flex: 1, minWidth: 0 }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 0 }}>
                  <Icons.x size={12} />
                </button>
              )}
            </div>
            <Btn variant="primary" size="sm" icon={<Icons.plus size={14} />} onClick={() => navigate('/setup/locations-new')} style={{ height: 36, boxSizing: 'border-box' }}>
              {t('setup.locations.addBtn')}
            </Btn>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map((loc, i) => (
            <LocationCard
              key={loc.locationId}
              loc={loc}
              delay={i * 50}
              t={t}
              onClick={() => navigate(`/setup/locations/${loc.locationId}`, { state: { locationName: loc.name } })}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', color: '#9BAAB5', fontSize: 13 }}>
              {t('setup.locations.empty')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function LocationCard({ loc, delay, onClick, t }: { loc: Location; delay: number; onClick: () => void; t: (k: string) => string }) {
  const [hover, setHover] = useState(false);
  const active = (loc.activeValidation ?? []).length > 0;

  return (
    <div
      className="loc-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...glass,
        borderRadius: 12,
        borderTop: `3px solid ${loc.style?.color ?? '#6B7E8E'}`,
        cursor: 'pointer',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover
          ? `0 16px 36px rgba(30,45,61,0.12), 0 0 0 1.5px ${loc.style?.color ?? '#6B7E8E'}40, inset 0 1px 0 rgba(255,255,255,0.85)`
          : glass.boxShadow,
        transition: 'transform 200ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 200ms',
        overflow: 'hidden',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Card header */}
      <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: loc.style?.color ?? '#6B7E8E', flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 5}}>
            <Icons.pin size={11} stroke="#9BAAB5" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.address}</span>
          </div>
        </div>
        <span style={{
          transform: hover ? 'translateX(2px)' : 'none',
          transition: 'transform 180ms ease',
          display: 'flex', flexShrink: 0,
        }}>
          <Icons.chevR size={16} stroke={hover ? loc.style?.color ?? '#00B4A0' : '#C8D4DC'} />
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', padding: '12px 20px', borderTop: '1px solid rgba(200,212,220,0.35)', gap: 0 }}>
        <Stat label={t('setup.locations.stat.staff')} value={loc.staffCount.toString()} />
        <div style={{ width: 1, background: 'rgba(200,212,220,0.35)', margin: '0 16px' }} />
        <Stat label={t('setup.locations.stat.mode')} value={modeLabel(loc.activeValidation, t)} icon={modeIcon(loc.activeValidation)} />
        <div style={{ width: 1, background: 'rgba(200,212,220,0.35)', margin: '0 16px' }} />
        <Stat label={t('setup.locations.stat.radius')} value={`${loc.validationConfig?.radiusMeters ?? 0}m`} />
      </div>

      {/* Status badge */}
      <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? '#00B4A0' : '#C8D4DC', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#008C7C' : '#9BAAB5', fontFamily: 'var(--font-display)', letterSpacing: 0.3 }}>
          {active ? t('setup.locations.status.active') : t('setup.locations.status.unconfiguredAuth')}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </div>
    </div>
  );
}

function LocationsListSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
