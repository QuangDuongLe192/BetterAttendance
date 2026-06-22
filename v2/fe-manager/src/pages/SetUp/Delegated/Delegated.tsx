import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eyebrow, Switch, Avatar, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { LOCATIONS, STAFF, STAFF_ROLE_SCOPES, locById } from '../../../services/setup';
import type { StaffRoleScope } from '../../../services/setup';
import { StaffSystemRoles } from './Components/StaffSystemRoles';

interface Props { isLoading?: boolean; error?: string | null; onDirtyChange?: (dirty: boolean) => void; }

interface DelegatedConfig {
  locId: string;
  enabled: boolean;
  canAssignRoles: boolean;
  canEditAttendance: boolean;
  canApproveOT: boolean;
}

const INITIAL: DelegatedConfig[] = (LOCATIONS ?? []).map(l => ({
  locId: l.locationId,
  enabled: l.delegation.enabled,
  canAssignRoles: l.delegation.canAssignRoles,
  canEditAttendance: l.delegation.canEditAttendance,
  canApproveOT: l.delegation.canApproveOT,
}));

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#6B7E8E',
  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10,
};

export function Delegated({ isLoading, error, onDirtyChange }: Props = {}) {
  const { t } = useTranslation('setup');
  const [tab, setTab] = useState<'delegation' | 'system'>('delegation');
  const [configs, setConfigs] = useState<DelegatedConfig[]>(INITIAL);
  const [saved, setSaved] = useState<DelegatedConfig[]>(INITIAL);
  const [roleScopes, setRoleScopes] = useState<StaffRoleScope[]>([...STAFF_ROLE_SCOPES]);
  const [expandedLoc, setExpandedLoc] = useState<string | null>(LOCATIONS[0]?.locationId ?? null);

  const isDirty = JSON.stringify(configs) !== JSON.stringify(saved);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  const update = (locId: string, patch: Partial<DelegatedConfig>) =>
    setConfigs(prev => prev.map(c => c.locId === locId ? { ...c, ...patch } : c));

  const handleSave = () => {
    console.log('[PUT] /api/delegation', configs);
    setSaved(configs);
    toast.success(t('setup.delegated.toast.saved'));
  };
  const handleCancel = () => setConfigs(saved);

  const managersForLoc = (locId: string) =>
    roleScopes
      .filter(s => s.managedLocationIds.includes(locId))
      .map(s => (STAFF ?? []).find(st => st.larkUserId === s.larkUserId))
      .filter(Boolean) as typeof STAFF;

  const addManager = (locId: string, larkUserId: string) => {
    setRoleScopes(prev => {
      const existing = prev.find(s => s.larkUserId === larkUserId);
      if (existing) {
        if (existing.managedLocationIds.includes(locId)) return prev;
        return prev.map(s => s.larkUserId === larkUserId
          ? { ...s, managedLocationIds: [...s.managedLocationIds, locId] }
          : s);
      }
      return [...prev, { larkUserId, orgRoles: [], managedLocationIds: [locId] }];
    });
    const staffName = (STAFF ?? []).find(s => s.larkUserId === larkUserId)?.name;
    const locName = locById(locId)?.name;
    toast.success(t('setup.delegated.toast.addedManager', { staff: staffName, loc: locName }));
  };

  const removeManager = (locId: string, larkUserId: string) => {
    const staffName = (STAFF ?? []).find(s => s.larkUserId === larkUserId)?.name;
    const locName = locById(locId)?.name;
    setRoleScopes(prev => prev
      .map(s => s.larkUserId === larkUserId
        ? { ...s, managedLocationIds: s.managedLocationIds.filter(l => l !== locId) }
        : s)
      .filter(s => s.orgRoles.length > 0 || s.managedLocationIds.length > 0)
    );
    toast.info(t('setup.delegated.toast.removedManager', { staff: staffName, loc: locName }));
  };

  const enabledCount = configs.filter(c => c.enabled).length;
  const locationsList = LOCATIONS ?? [];
  const staffList = STAFF ?? [];
  const managerCandidates = staffList;

  if (isLoading) return <SetupDelegatedSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div style={{
      margin: '-40px -40px -80px', padding: '36px 40px 80px', position: 'relative',
      minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .loc-card:hover { box-shadow: 0 6px 24px rgba(30,45,61,0.10), inset 0 1px 0 rgba(255,255,255,0.75) !important; }
        .perm-row:hover { background: rgba(255,255,255,0.94) !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,160,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: 'fadeUp 350ms ease both' }}>
          <Eyebrow style={{ marginBottom: 8 }}>{t('setup.delegated.eyebrow')}</Eyebrow>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 8px' }}>
            {t('setup.delegated.title')}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7E8E', margin: 0 }}>
            {t('setup.delegated.subtitle')}
          </p>
        </div>

        {/* Tab bar — glass segmented control */}
        <div style={{ display: 'inline-flex', ...glass, borderRadius: 10, padding: 3, marginBottom: 28, animation: 'fadeUp 420ms ease both' }}>
          {([
            ['delegation', t('setup.delegated.tab.delegation'), 'shield'],
            ['system',     t('setup.delegated.tab.system'),     'briefcase'],
          ] as const).map(([id, label, icon]) => {
            const active = tab === id;
            const IconComp = Icons[icon];
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? '#1E2D3D' : '#6B7E8E',
                background: active ? '#fff' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(30,45,61,0.1)' : 'none',
                transition: 'all 150ms',
              }}>
                <IconComp size={14} stroke={active ? '#00B4A0' : '#9BAAB5'} />
                {label}
              </button>
            );
          })}
        </div>

        {tab === 'delegation' && (
          <>
            {/* Summary chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, animation: 'fadeUp 480ms ease both' }}>
              <div style={{ ...glass, borderRadius: 8, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: enabledCount > 0 ? '#00B4A0' : '#C8D4DC' }} />
                <span style={{ fontSize: 13, color: '#6B7E8E' }}>{t('setup.delegated.enabledCount', { n: enabledCount, total: locationsList.length })}</span>
              </div>
              {configs.some(c => c.enabled && managersForLoc(c.locId).length === 0) && (
                <div style={{ ...glass, borderRadius: 8, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(254,243,199,0.82)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Icons.alert size={13} stroke="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#B45309' }}>{t('setup.delegated.warnNoManager')}</span>
                </div>
              )}
            </div>

            {/* Location cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
              {configs.map((cfg, cardIdx) => {
                const loc = locById(cfg.locId);
                const mgrs = managersForLoc(cfg.locId);
                const isExpanded = expandedLoc === cfg.locId;
                const barColor = loc?.style.color ?? (cfg.enabled ? '#00B4A0' : '#C8D4DC');

                return (
                  <div key={cfg.locId} className="loc-card" style={{
                    ...glass, borderRadius: 14, overflow: 'hidden',
                    animation: `fadeUp ${500 + cardIdx * 50}ms ease both`,
                    transition: 'box-shadow 150ms',
                  }}>
                    {/* Card header row */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedLoc(isExpanded ? null : cfg.locId)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedLoc(isExpanded ? null : cfg.locId); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(247,249,250,0.6)' : 'transparent',
                        borderBottom: isExpanded ? '1px solid rgba(200,212,220,0.25)' : 'none',
                        transition: 'background 120ms',
                      }}
                    >
                      {/* Color bar */}
                      <span style={{ width: 4, height: 36, borderRadius: 2, background: barColor, flexShrink: 0, opacity: cfg.enabled ? 1 : 0.35 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>{loc?.name ?? cfg.locId}</div>
                        <div style={{ fontSize: 12, color: '#6B7E8E', marginTop: 3 }}>
                          {mgrs.length > 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ display: 'inline-flex' }}>
                                {mgrs.slice(0, 3).map((m, i) => (
                                  <span key={m.larkUserId} style={{ marginLeft: i > 0 ? -6 : 0, display: 'inline-block', borderRadius: '50%', outline: '2px solid rgba(255,255,255,0.8)' }}>
                                    <Avatar name={m.name} src={m.avatar} size={16} />
                                  </span>
                                ))}
                              </span>
                              <span>
                                {mgrs[0].name}
                                {mgrs.length === 2 && `, ${mgrs[1].name}`}
                                {mgrs.length > 2 && ` +${mgrs.length - 1}`}
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: cfg.enabled ? '#B45309' : '#C8D4DC', fontStyle: 'italic' }}>
                              {cfg.enabled ? t('setup.delegated.card.noManager') : t('setup.delegated.card.notEnabled')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Permission tags */}
                      <div style={{ display: 'flex', gap: 5 }}>
                        {cfg.enabled && cfg.canAssignRoles && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,180,160,0.1)', color: '#00897B', border: '1px solid rgba(0,180,160,0.2)' }}>{t('setup.delegated.badge.assignRoles')}</span>
                        )}
                        {cfg.enabled && cfg.canEditAttendance && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,180,160,0.1)', color: '#00897B', border: '1px solid rgba(0,180,160,0.2)' }}>{t('setup.delegated.badge.editAttendance')}</span>
                        )}
                        {cfg.enabled && cfg.canApproveOT && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,180,160,0.1)', color: '#00897B', border: '1px solid rgba(0,180,160,0.2)' }}>{t('setup.delegated.badge.approveOT')}</span>
                        )}
                        {!cfg.enabled && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(200,212,220,0.2)', color: '#9BAAB5', border: '1px solid rgba(200,212,220,0.3)' }}>{t('setup.delegated.badge.disabled')}</span>
                        )}
                      </div>

                      {/* Toggle */}
                      <div onClick={e => e.stopPropagation()}>
                        <Switch checked={cfg.enabled} onChange={v => update(cfg.locId, { enabled: v })} />
                      </div>

                      <Icons.chevD size={14} stroke="#9BAAB5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }} />
                    </div>

                    {/* Expanded — enabled */}
                    {isExpanded && cfg.enabled && (
                      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Manager assignment */}
                        <div>
                          <div style={sectionLabel}>{t('setup.delegated.section.managers')}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            {mgrs.map(m => (
                              <span key={m.larkUserId} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '5px 8px 5px 10px', borderRadius: 999,
                                background: 'rgba(230,249,247,0.8)', border: '1px solid rgba(0,180,160,0.25)',
                                fontSize: 12, fontWeight: 600, color: '#1A6B55',
                              }}>
                                <Avatar name={m.name} src={m.avatar} size={18} />
                                {m.name}
                                <button
                                  onClick={() => removeManager(cfg.locId, m.larkUserId)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9BAAB5', padding: 0, marginLeft: 2 }}
                                  onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                                  onMouseLeave={e => (e.currentTarget.style.color = '#9BAAB5')}
                                >
                                  <Icons.x size={11} />
                                </button>
                              </span>
                            ))}
                            <ManagerDropdown
                              candidates={managerCandidates.filter(s => !mgrs.some(m => m.larkUserId === s.larkUserId))}
                              onAdd={uid => addManager(cfg.locId, uid)}
                              addLabel={t('setup.delegated.addManager')}
                            />
                          </div>
                        </div>

                        {/* Permission rows */}
                        <div>
                          <div style={sectionLabel}>{t('setup.delegated.section.perms')}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <PermRow
                              label={t('setup.delegated.perm.assignRoles.label')}
                              desc={t('setup.delegated.perm.assignRoles.desc')}
                              restrictedLabel={t('setup.delegated.perm.assignRoles.restricted')}
                              checked={cfg.canAssignRoles}
                              onChange={v => update(cfg.locId, { canAssignRoles: v })}
                              restricted
                            />
                            <PermRow
                              label={t('setup.delegated.perm.editAttendance.label')}
                              desc={t('setup.delegated.perm.editAttendance.desc')}
                              checked={cfg.canEditAttendance}
                              onChange={v => update(cfg.locId, { canEditAttendance: v })}
                            />
                            <PermRow
                              label={t('setup.delegated.perm.approveOT.label')}
                              desc={t('setup.delegated.perm.approveOT.desc')}
                              checked={cfg.canApproveOT}
                              onChange={v => update(cfg.locId, { canApproveOT: v })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded — disabled */}
                    {isExpanded && !cfg.enabled && (
                      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(200,212,220,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icons.lock size={14} stroke="#9BAAB5" />
                        </div>
                        <span style={{ fontSize: 13, color: '#9BAAB5' }}>
                          {t('setup.delegated.disabled.hint')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'system' && (
          <div style={{ animation: 'fadeUp 420ms ease both' }}>
            <StaffSystemRoles scopes={roleScopes} setScopes={setRoleScopes} />
          </div>
        )}

      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'rgba(22,34,46,0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 14,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
        }}>
          <Icons.alert size={15} stroke="#F59E0B" />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{t('setup.delegated.saveBar.unsaved')}</span>
          <button onClick={handleCancel} style={{
            padding: '7px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>{t('setup.delegated.saveBar.cancel')}</button>
          <button onClick={handleSave} style={{
            padding: '7px 20px', borderRadius: 8, border: 'none',
            background: '#00B4A0', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Icons.check size={14} stroke="#fff" />
            {t('setup.delegated.saveBar.save')}
          </button>
        </div>
      )}
    </div>
  );
}

function ManagerDropdown({ candidates, onAdd, addLabel }: {
  candidates: typeof STAFF;
  onAdd: (larkUserId: string) => void;
  addLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (candidates.length === 0) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          border: '1.5px dashed rgba(0,180,160,0.45)',
          background: open ? 'rgba(0,180,160,0.06)' : 'transparent',
          color: '#00B4A0', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'background 100ms',
        }}
      >
        <Icons.plus size={11} /> {addLabel}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 240,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,212,220,0.5)', borderRadius: 10,
          boxShadow: '0 10px 32px rgba(30,45,61,0.14)', zIndex: 200, overflow: 'hidden',
        }}>
          {candidates.map((s, i) => (
            <button
              key={s.larkUserId}
              onClick={() => { onAdd(s.larkUserId); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none',
                borderTop: i > 0 ? '1px solid rgba(200,212,220,0.25)' : 'none',
                background: 'transparent', cursor: 'pointer', transition: 'background 80ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar name={s.name} src={s.avatar} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#9BAAB5' }}>{s.phone}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PermRow({ label, desc, checked, onChange, restricted, restrictedLabel }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; restricted?: boolean; restrictedLabel?: string;
}) {
  return (
    <div className="perm-row" style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '12px 14px', borderRadius: 10,
      background: checked ? 'rgba(230,249,247,0.82)' : 'rgba(255,255,255,0.72)',
      border: `1px solid ${checked ? 'rgba(0,180,160,0.22)' : 'rgba(200,212,220,0.35)'}`,
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      transition: 'all 120ms',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{label}</span>
          {restricted && restrictedLabel && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6B7E8E', background: 'rgba(200,212,220,0.3)', padding: '2px 7px', borderRadius: 4 }}>
              <Icons.lock size={9} stroke="#6B7E8E" />
              {restrictedLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#6B7E8E', marginTop: 3, lineHeight: 1.55 }}>{desc}</div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function SetupDelegatedSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={220} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
