import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ConfirmLeaveDialog } from '../../../components/ConfirmLeaveDialog';
import { Btn, Eyebrow, Input, Switch, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { toast } from 'sonner';
import { Icons } from '../../../components/Icons';
import { LOCATIONS, WIFI_SCAN, type Location, type WifiNetwork } from '../../../services/setup';
import { ColorPicker } from './Components/ColorPicker';
import { WifiScannerCard } from './Components/WifiScannerCard';
import { GeofenceMapCard } from './Components/GeofenceMapCard';
import { StaffAssignmentCard } from './Components/StaffAssignmentCard';

interface LocationsProps { openId?: string; isLoading?: boolean; error?: string | null; onEditingChange?: (v: boolean) => void; }

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

export function Locations({ openId, isLoading, error, onEditingChange }: LocationsProps) {
  const routerLoc = useRouterLocation();
  const scrollTo = (routerLoc.state as { scrollTo?: string } | null)?.scrollTo;
  const locationsList = LOCATIONS ?? [];
  const selected = locationsList.find(l => l.locationId === openId);
  const { t } = useTranslation('setup');

  if (isLoading) return <SetupLocationsSkeleton />;
  if (error) return <ErrorBanner message={error} />;
  if (!selected) return (
    <div style={{ padding: '56px 40px', textAlign: 'center', color: '#9BAAB5', fontSize: 13 }}>
      {t('setup.locations.notFound')}
    </div>
  );

  return <LocationDetail key={openId} loc={selected} scrollToStaff={scrollTo === 'staff'} onEditingChange={onEditingChange} />;
}


function deriveModeLabel(mode: string[], t: (k: string) => string): string {
  const hasWifi = mode.includes('wifi');
  const hasGeo = mode.includes('geo');
  if (hasWifi && hasGeo) return t('setup.locations.validation.both.title');
  if (hasWifi) return t('setup.locations.validation.wifiOnly.title');
  if (hasGeo) return t('setup.locations.validation.gpsOnly.title');
  return t('setup.locations.validation.none.title');
}

interface TabBtnProps {
  readonly id: 'infor' | 'staff';
  readonly label: string;
  readonly icon: string;
  readonly active: boolean;
  readonly disabled: boolean;
  readonly disabledHint: string;
  readonly onSelect: (id: 'infor' | 'staff') => void;
}

function getTabButtonStyle(active: boolean, disabled: boolean): CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 18px', borderRadius: 8, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13, fontWeight: active ? 700 : 500,
    color: disabled ? '#C8D4DC' : active ? '#fff' : '#6B7E8E',
    background: active ? '#1E2D3D' : 'transparent',
    boxShadow: active ? '0 2px 8px rgba(30,45,61,0.25)' : 'none',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 160ms cubic-bezier(0.2,0.7,0.2,1)',
    fontFamily: 'var(--font-display)',
  };
}

function getIconStroke(active: boolean, disabled: boolean): string {
  if (disabled) return '#C8D4DC';
  return active ? '#fff' : '#9BAAB5';
}

function TabButton({ id, label, icon, active, disabled, disabledHint, onSelect }: TabBtnProps) {
  const IconComp = Icons[icon as keyof typeof Icons];
  return (
    <button
      onClick={disabled ? undefined : () => onSelect(id)}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      style={getTabButtonStyle(active, disabled)}
    >
      <IconComp size={13} stroke={getIconStroke(active, disabled)} />
      {label}
    </button>
  );
}

function LocationDetail({ loc, scrollToStaff, onEditingChange }: { loc: Location; scrollToStaff?: boolean; onEditingChange?: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation('setup');
  const staffRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'infor' | 'staff'>(scrollToStaff ? 'staff' : 'infor');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);

  function setEditing(v: boolean) { setIsEditing(v); onEditingChange?.(v); }
  const [color, setColor] = useState(loc.style.color);

  const scanNetworks = WIFI_SCAN[loc.locationId]?.networks ?? [];
  const bssidToNetwork = (bssid: string): WifiNetwork => {
    const found = scanNetworks.find(n => n.bssid === bssid);
    return { ssid: found?.ssid ?? '', bssid };
  };

  const [draft, setDraft] = useState({
    name: loc.name,
    addr: loc.address,
    mode: [...loc.activeValidation],
    radius: loc.validationConfig.radiusMeters,
    lat: loc.lat,
    lng: loc.long,
    networks: (loc.validationConfig.allowed_bssid ?? []).map(bssidToNetwork),
    autoIn: loc.autoIn,
    autoOut: loc.autoOut,
  });

  useEffect(() => {
    if (scrollToStaff && staffRef.current) {
      const t = setTimeout(() => staffRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      return () => clearTimeout(t);
    }
  }, [scrollToStaff]);

  const hasInvalidBssid = draft.networks.some(n => n.bssid !== '' && !/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(n.bssid));

  const modeLabel = deriveModeLabel(draft.mode, t);

  const active = (loc.activeValidation ?? []).length > 0;

  function handleSave() {
    try {
      setEditing(false);
      toast.success(t('setup.locations.toast.saved', { name: draft.name }));
    } catch {
      toast.error(t('setup.locations.toast.saveFailed'));
    }
  }

  function handleCancel() {
    setDraft({
      name: loc.name,
      addr: loc.address,
      mode: [...loc.activeValidation],
      radius: loc.validationConfig.radiusMeters,
      lat: loc.lat,
      lng: loc.long,
      networks: (loc.validationConfig.allowed_bssid ?? []).map(bssidToNetwork),
      autoIn: loc.autoIn,
      autoOut: loc.autoOut,
    });
    setColor(loc.style.color);
    setEditing(false);
  }

  return (
    <div style={{
      margin: '-40px -40px -80px',
      padding: '36px 40px 80px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
      paddingBottom: isEditing ? 120 : 80,
    }}>
      <style>{`
        @keyframes locFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .loc-section { animation: locFadeUp 360ms ease both; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Back */}
        <div className="loc-section" style={{ animationDelay: '0ms', marginBottom: -4 }}>
          <button
            onClick={() => isEditing ? setConfirmBack(true) : navigate('/setup/locations')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E8E', fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'var(--font-display)' }}
          >
            <Icons.chevR size={14} stroke="#6B7E8E" style={{ transform: 'scaleX(-1)' }} />
            {t('setup.locations.back')}
          </button>
        </div>

        {/* Hero card */}
        <div className="loc-section" style={{ animationDelay: '40ms', ...glass, borderRadius: 16, overflow: 'hidden', borderTop: `3px solid ${color}` }}>
          {/* Header tint */}
          <div style={{ padding: '22px 24px 18px', background: `linear-gradient(135deg, ${color}14 0%, transparent 60%)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#008C7C' : '#9BAAB5', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                    {active ? t('setup.locations.status.active') : t('setup.locations.status.unconfigured')}
                  </span>
                </div>
                {isEditing
                  ? <Input value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }} />
                  : <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', margin: '0 0 8px' }}>{draft.name}</h2>
                }
                {isEditing
                  ? <Input value={draft.addr} onChange={v => setDraft(d => ({ ...d, addr: v }))} />
                  : <div style={{ fontSize: 13, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icons.pin size={12} stroke="#9BAAB5" />
                      <span>{draft.addr}</span>
                    </div>
                }
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <ColorPicker color={color} onChange={setColor} disabled={!isEditing} />
                {!isEditing && (
                  <Btn variant="ghost" size="sm" icon={<Icons.edit size={14} />} onClick={() => setEditing(true)} disabled={tab === 'staff'}>{t('setup.locations.editBtn')}</Btn>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', padding: '14px 24px', borderTop: '1px solid rgba(200,212,220,0.35)', gap: 0 }}>
            <HeroStat label={t('setup.locations.hero.staff')} value={loc.staffCount.toString()} />
            <div style={{ width: 1, background: 'rgba(200,212,220,0.4)', margin: '0 20px' }} />
            <HeroStat label={t('setup.locations.hero.radius')} value={`${draft.radius}m`} />
            <div style={{ width: 1, background: 'rgba(200,212,220,0.4)', margin: '0 20px' }} />
            <HeroStat label={t('setup.locations.hero.authMode')} value={modeLabel} />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="loc-section" style={{ animationDelay: '80ms', display: 'flex' }}>
          <div style={{ display: 'inline-flex', ...glass, borderRadius: 10, padding: 3, gap: 2 }}>
            <TabButton id="infor" label={t('setup.locations.tab.info')} icon="settings" active={tab === 'infor'} disabled={false} disabledHint="" onSelect={setTab} />
            <TabButton id="staff" label={t('setup.locations.tab.staff')} icon="users" active={tab === 'staff'} disabled={isEditing} disabledHint={t('setup.locations.tab.staffDisabledHint')} onSelect={setTab} />
          </div>
        </div>

        {tab === 'infor' && <>
          {/* Validation mode */}
          <div className="loc-section" style={{ animationDelay: '120ms', ...glass, borderRadius: 14, padding: '22px 24px' }}>
            <Eyebrow style={{ marginBottom: 6 }}>{t('setup.locations.validation.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', margin: '0 0 18px' }}>{t('setup.locations.validation.title')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <ModeOption icon="wifi"   title={t('setup.locations.validation.wifiOnly.title')}  sub={t('setup.locations.validation.wifiOnly.sub')}  selected={draft.mode.includes('wifi') && !draft.mode.includes('geo')}  onClick={isEditing ? () => setDraft(d => ({ ...d, mode: ['wifi'] })) : undefined} />
              <ModeOption icon="target" title={t('setup.locations.validation.gpsOnly.title')}   sub={t('setup.locations.validation.gpsOnly.sub')}   selected={draft.mode.includes('geo') && !draft.mode.includes('wifi')}  onClick={isEditing ? () => setDraft(d => ({ ...d, mode: ['geo'] })) : undefined} />
              <ModeOption icon="shield" title={t('setup.locations.validation.both.title')}      sub={t('setup.locations.validation.both.sub')}      selected={draft.mode.includes('wifi') && draft.mode.includes('geo')}   onClick={isEditing ? () => setDraft(d => ({ ...d, mode: ['wifi', 'geo'] })) : undefined} />
              <ModeOption icon="x"     title={t('setup.locations.validation.none.title')}      sub={t('setup.locations.validation.none.sub')}      selected={!draft.mode.includes('wifi') && !draft.mode.includes('geo')} onClick={isEditing ? () => setDraft(d => ({ ...d, mode: [] })) : undefined} />
            </div>
          </div>

          {/* Wifi + Geo cards */}
          {(draft.mode.includes('wifi') || draft.mode.includes('geo')) && (() => {
            const both = draft.mode.includes('wifi') && draft.mode.includes('geo');
            return (
              <div className="loc-section" style={{ animationDelay: '160ms', display: 'grid', gridTemplateColumns: both ? '1fr 1fr' : '1fr', gap: 18 }}>
                {draft.mode.includes('wifi') && (
                  <WifiScannerCard
                    locId={loc.locationId}
                    networks={draft.networks}
                    onNetworksChange={ns => setDraft(d => ({ ...d, networks: ns }))}
                    isEditing={isEditing}
                  />
                )}
                {draft.mode.includes('geo') && (
                  <GeofenceMapCard
                    lat={draft.lat}
                    lng={draft.lng}
                    radius={draft.radius}
                    onLatChange={v => setDraft(d => ({ ...d, lat: v }))}
                    onLngChange={v => setDraft(d => ({ ...d, lng: v }))}
                    onRadiusChange={r => setDraft(d => ({ ...d, radius: r }))}
                    isEditing={isEditing}
                  />
                )}
              </div>
            );
          })()}

          {/* Auto clock */}
          <div className="loc-section" style={{ animationDelay: '200ms', ...glass, borderRadius: 14, padding: '22px 24px' }}>
            <Eyebrow style={{ marginBottom: 6 }}>{t('setup.locations.autoClock.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', margin: '0 0 18px' }}>{t('setup.locations.autoClock.title')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AutoToggleRow label={t('setup.locations.autoClock.autoIn.label')} sub={t('setup.locations.autoClock.autoIn.sub')} checked={draft.autoIn} onChange={isEditing ? v => setDraft(d => ({ ...d, autoIn: v })) : undefined} />
              <AutoToggleRow label={t('setup.locations.autoClock.autoOut.label')} sub={t('setup.locations.autoClock.autoOut.sub')} checked={draft.autoOut} onChange={isEditing ? v => setDraft(d => ({ ...d, autoOut: v })) : undefined} />
              <AutoToggleRow label={t('setup.locations.autoClock.biometric.label')} sub={t('setup.locations.autoClock.biometric.sub')} checked={false} disabled />
            </div>
          </div>
        </>}

        {tab === 'staff' && (
          <div ref={staffRef} className="loc-section" style={{ animationDelay: '120ms' }}>
            <StaffAssignmentCard loc={loc} />
          </div>
        )}

      </div>

      <ConfirmLeaveDialog
        open={confirmBack}
        title={t('setup.locations.leaveConfirm.title')}
        body={t('setup.locations.leaveConfirm.body')}
        confirmLabel={t('setup.locations.leaveConfirm.confirm')}
        cancelLabel={t('setup.locations.leaveConfirm.cancel')}
        onConfirm={() => { setConfirmBack(false); navigate('/setup/locations'); }}
        onCancel={() => setConfirmBack(false)}
      />

      {/* Save bar */}
      {isEditing && (
        <div style={{
          position: 'fixed', bottom: 0, left: 260, right: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(200,212,220,0.5)',
          boxShadow: '0 -4px 24px rgba(30,45,61,0.1)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: hasInvalidBssid ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#6B7E8E' }}>
              {hasInvalidBssid ? t('setup.locations.saveBar.hasError') : t('setup.locations.saveBar.editing')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" icon={<Icons.x size={14} />} onClick={handleCancel}>{t('setup.locations.saveBar.cancel')}</Btn>
            <Btn variant="primary" size="sm" icon={<Icons.check size={14} />} onClick={handleSave} disabled={hasInvalidBssid}>{t('setup.locations.saveBar.save')}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function ModeOption({ icon, title, sub, selected, onClick }: { icon: string; title: string; sub: string; selected: boolean; onClick?: () => void }) {
  const IconComp = Icons[icon as keyof typeof Icons];
  return (
    <div role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined} style={{
      padding: '16px 18px', borderRadius: 10,
      border: `1.5px solid ${selected ? '#00B4A0' : 'rgba(200,212,220,0.5)'}`,
      background: selected ? 'rgba(0,180,160,0.08)' : 'rgba(255,255,255,0.5)',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      transition: 'border-color 150ms, background 150ms',
    }}>
      {selected && (
        <span style={{ position: 'absolute', top: 12, right: 12, width: 18, height: 18, borderRadius: 999, background: '#00B4A0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.check size={10} stroke="#fff" sw={2.5} />
        </span>
      )}
      <IconComp size={18} stroke={selected ? '#00B4A0' : '#6B7E8E'} />
      <div style={{ marginTop: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1E2D3D', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6B7E8E', lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  );
}

function AutoToggleRow({ label, sub, checked, disabled, onChange }: { label: string; sub: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 18px', borderRadius: 10,
      background: checked ? 'rgba(0,180,160,0.06)' : 'rgba(255,255,255,0.5)',
      border: `1px solid ${checked ? 'rgba(0,180,160,0.25)' : 'rgba(200,212,220,0.5)'}`,
      opacity: disabled ? 0.5 : 1,
      transition: 'background 150ms, border-color 150ms',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6B7E8E', marginTop: 3, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Switch checked={checked} onChange={disabled ? undefined : onChange} />
    </div>
  );
}

function SetupLocationsSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
        <SkeletonCard lines={6} />
      </div>
    </div>
  );
}
