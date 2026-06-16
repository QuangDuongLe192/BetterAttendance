import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Btn, Tag, Field, Input, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { ROLES, STAFF, SHIFT_TEMPLATES } from '../../../services/setup';
import type { Role } from '../../../services/setup';
import { RoleRow } from './Components/RoleRow';
import { type ShiftTemplate, ShiftRow, ShiftBar, toMin } from '../PayRules/Components/ShiftRow';

const SHIFT_COLORS = ['#F59E0B', '#3B82F6', '#7C3AED', '#10B981', '#EC4899', '#EF4444'];
const INIT_SHIFTS: ShiftTemplate[] = SHIFT_TEMPLATES.map(s => ({
  id: s.id,
  name: s.label,
  start: s.defaultStartTime,
  end: s.defaultEndTime,
  color: s.color,
}));

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const glassDark: React.CSSProperties = {
  background: 'rgba(30,45,61,0.88)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 32px rgba(30,45,61,0.28)',
};

interface Props { isLoading?: boolean; error?: string | null; onDirtyChange?: (dirty: boolean) => void; }

export function Roles({ isLoading, error, onDirtyChange }: Props = {}) {
  const { t } = useTranslation('setup');
  const [editing, setEditing]       = useState<string | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName]   = useState('');
  const [roleList, setRoleList]     = useState<Role[]>(() => [...(ROLES ?? [])]);

  const confirmAddRole = () => {
    const name = newRoleName.trim();
    if (!name) return;
    const newRole: Role = { id: `R${Date.now()}`, name, status: 'Active', permissions: {}, snapshotUserCount: 0 };
    ROLES.push(newRole);
    setRoleList(prev => [...prev, newRole]);
    toast.success(t('setup.roles.toast.created', { name }));
    setNewRoleName('');
    setIsAddingRole(false);
  };

  const cancelAddRole = () => { setNewRoleName(''); setIsAddingRole(false); };

  const [grace,            setGrace]            = useState('10');
  const [absenceThreshold, setAbsenceThreshold] = useState('120');
  const [absenceDeduct,    setAbsenceDeduct]    = useState(true);
  const [savedGrace,       setSavedGrace]       = useState({ grace: '10', absenceThreshold: '120', absenceDeduct: true });

  const [shifts,      setShifts]      = useState<ShiftTemplate[]>(INIT_SHIFTS);
  const [savedShifts, setSavedShifts] = useState<ShiftTemplate[]>(INIT_SHIFTS);
  const [newShiftId,  setNewShiftId]  = useState<string | null>(null);

  const [tab, setTab] = useState<'roles' | 'shifts' | 'grace'>('roles');

  const graceDirty  = grace !== savedGrace.grace || absenceThreshold !== savedGrace.absenceThreshold || absenceDeduct !== savedGrace.absenceDeduct;
  const shiftsDirty = JSON.stringify(shifts) !== JSON.stringify(savedShifts);
  const anyDirty    = graceDirty || shiftsDirty;

  useEffect(() => { onDirtyChange?.(anyDirty); }, [anyDirty, onDirtyChange]);

  if (isLoading) return <SetupRolesSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const staffedRoleIds = new Set((STAFF ?? []).flatMap(s => s.roleIds));
  const totalHC        = roleList.reduce((s, r) => s + r.snapshotUserCount, 0);

  const handleDelete = (roleId: string) => {
    const name = roleList.find(r => r.id === roleId)?.name;
    setRoleList(prev => prev.filter(r => r.id !== roleId));
    const idx = ROLES.findIndex(r => r.id === roleId);
    if (idx !== -1) ROLES.splice(idx, 1);
    if (editing === roleId) setEditing(null);
    toast.info(t('setup.roles.toast.deleted', { name }));
  };

  const graceNum     = Math.max(0, Math.min(120, parseInt(grace) || 0));
  const thresholdNum = Math.max(graceNum + 1, Math.min(480, parseInt(absenceThreshold) || 120));

  const fmtTime = (addMin: number) => {
    const total = 8 * 60 + addMin;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const saveGrace   = () => { setSavedGrace({ grace, absenceThreshold, absenceDeduct }); toast.success(t('setup.roles.grace.toast.saved')); };
  const cancelGrace = () => { setGrace(savedGrace.grace); setAbsenceThreshold(savedGrace.absenceThreshold); setAbsenceDeduct(savedGrace.absenceDeduct); };

  const saveShifts   = () => {
    setSavedShifts(shifts);
    setNewShiftId(null);
    toast.success(t('setup.roles.shifts.toast.saved'));
  };
  const cancelShifts = () => setShifts(savedShifts);

  const addShift = () => {
    const id    = `new-${Date.now()}`;
    const color = SHIFT_COLORS[shifts.length % SHIFT_COLORS.length];
    setShifts(s => [...s, { id, name: t('setup.roles.shifts.newName'), start: '08:00', end: '16:00', color }]);
    setNewShiftId(id);
  };
  const updateShift = (id: string, field: keyof ShiftTemplate, val: string) =>
    setShifts(s => s.map(sh => sh.id === id ? { ...sh, [field]: val } : sh));
  const removeShift = (id: string) => setShifts(s => s.filter(sh => sh.id !== id));

  const TABS = [
    { id: 'roles'  as const, label: t('setup.roles.tab.roles'),  icon: 'briefcase' as const },
    { id: 'shifts' as const, label: t('setup.roles.tab.shifts'), icon: 'calendar'  as const },
    { id: 'grace'  as const, label: t('setup.roles.tab.grace'),  icon: 'clock'     as const },
  ];

  return (
    <div style={{
      margin: '-40px -40px -80px',
      padding: '36px 40px',
      paddingBottom: anyDirty ? 120 : 80,
      position: 'relative',
      minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
    }}>
      <style>{`
        @keyframes rolesFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .roles-in { animation: rolesFadeUp 380ms ease both; }
        @keyframes rolesShimmer { 0%,100% { opacity:.6 } 50% { opacity:1 } }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-12%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.16) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%',  width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.07) 0%, transparent 60%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="roles-in" style={{ animationDelay: '0ms' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00B4A0', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
            {t('setup.roles.eyebrow')}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: '#1E2D3D', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
              {t('setup.roles.title')}
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#6B7E8E', marginTop: 10, lineHeight: 1.6 }}>
            {t('setup.roles.subtitle')}
          </p>
        </div>

        {/* ── Stat chips ───────────────────────────────────────────────────── */}
        <div className="roles-in" style={{ animationDelay: '60ms', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: t('setup.roles.stat.roles'),  value: roleList.length, icon: 'briefcase', accent: '#00B4A0' },
            { label: t('setup.roles.stat.shifts'), value: shifts.length,   icon: 'calendar',  accent: '#6B7E8E' },
          ].map(stat => {
            const IconComp = Icons[stat.icon as keyof typeof Icons];
            return (
              <div key={stat.label} style={{ ...glass, borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 160 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={16} stroke={stat.accent} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#9BAAB5', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tab switcher ─────────────────────────────────────────────────── */}
        <div className="roles-in" style={{ animationDelay: '100ms', display: 'flex' }}>
          <div style={{ display: 'inline-flex', ...glass, borderRadius: 12, padding: 4, gap: 2 }}>
            {TABS.map(t => {
              const IconComp = Icons[t.icon];
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : '#6B7E8E',
                  background: isActive ? '#1E2D3D' : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(30,45,61,0.28)' : 'none',
                  transition: 'all 180ms cubic-bezier(0.2,0.7,0.2,1)',
                  fontFamily: 'var(--font-display)',
                  position: 'relative',
                }}>
                  <IconComp size={14} stroke={isActive ? '#fff' : '#9BAAB5'} />
                  {t.label}
                  {t.id === 'grace' && graceDirty && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 999, background: '#F59E0B' }} />
                  )}
                  {t.id === 'shifts' && shiftsDirty && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 999, background: '#F59E0B' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* Tab: Vai trò                                                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'roles' && (
          <div className="roles-in" style={{ animationDelay: '140ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D' }}>{t('setup.roles.list.title')}</div>
              </div>
              {!isAddingRole && (
                <Btn variant="primary" icon={<Icons.plus size={14} />} onClick={() => setIsAddingRole(true)}>{t('setup.roles.addBtn')}</Btn>
              )}
            </div>

            <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 20px', background: 'rgba(30,45,61,0.04)', borderBottom: '1px solid rgba(200,212,220,0.4)' }}>
                {[t('setup.roles.col.role'), t('setup.roles.col.staff'), ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>{h}</div>
                ))}
              </div>
              {roleList.map((role, i) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  isEditing={editing === role.id}
                  onEdit={() => setEditing(editing === role.id ? null : role.id)}
                  onDelete={() => handleDelete(role.id)}
                  hasStaff={staffedRoleIds.has(role.id)}
                  borderTop={i > 0}
                  totalHC={totalHC}
                />
              ))}
              {roleList.length === 0 && !isAddingRole && (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9BAAB5', fontSize: 13 }}>
                  {t('setup.roles.empty')}
                </div>
              )}

              {/* Inline new-role row */}
              {isAddingRole && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 24px', alignItems: 'center', borderTop: roleList.length > 0 ? '1px solid rgba(200,212,220,0.4)' : 'none', background: 'rgba(0,180,160,0.04)' }}>
                  <input
                    autoFocus
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmAddRole(); if (e.key === 'Escape') cancelAddRole(); }}
                    placeholder={t('setup.roles.newPlaceholder')}
                    style={{ fontSize: 14, fontWeight: 600, color: '#1E2D3D', background: 'none', border: 'none', outline: 'none', width: '100%', fontFamily: 'var(--font-body)' }}
                  />
                  <div />
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={cancelAddRole} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4, color: '#9BAAB5' }}>
                      <Icons.x size={15} />
                    </button>
                    <button onClick={confirmAddRole} disabled={!newRoleName.trim()} style={{ background: newRoleName.trim() ? '#00B4A0' : '#E8ECEF', border: 'none', cursor: newRoleName.trim() ? 'pointer' : 'default', padding: 6, borderRadius: 4, color: newRoleName.trim() ? '#fff' : '#9BAAB5', transition: 'background 150ms' }}>
                      <Icons.check size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add button at bottom when adding */}
              {!isAddingRole && (
                <div style={{ padding: '10px 20px', borderTop: roleList.length > 0 ? '1px solid rgba(200,212,220,0.35)' : 'none' }}>
                  <Btn variant="ghost" size="sm" icon={<Icons.plus size={13} />} onClick={() => setIsAddingRole(true)}>{t('setup.roles.addBtn')}</Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* Tab: Mẫu ca làm việc                                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'shifts' && (
          <div className="roles-in" style={{ animationDelay: '140ms', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 24h chart — dark glass panel */}
            <div style={{ ...glassDark, borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{t('setup.roles.shifts.chartLabel')}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{t('setup.roles.shifts.chart24h')}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {shifts.map(sh => (
                    <span key={sh.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: sh.color, display: 'inline-block', flexShrink: 0 }} />
                      {sh.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div style={{ position: 'relative' }}>
                {/* Hour grid lines */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
                  {[6, 12, 18].map(h => (
                    <div key={h} style={{ position: 'absolute', left: `${h / 24 * 100}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <div style={{ position: 'relative', height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {shifts.flatMap(sh => {
                    const s = toMin(sh.start), e = toMin(sh.end), D = 24 * 60;
                    if (e >= s) return [<ShiftBar key={sh.id} left={s / D * 100} width={(e - s) / D * 100} color={sh.color} label={sh.name} />];
                    return [
                      <ShiftBar key={sh.id + 'a'} left={s / D * 100} width={(D - s) / D * 100} color={sh.color} label={sh.name} />,
                      <ShiftBar key={sh.id + 'b'} left={0}            width={e / D * 100}        color={sh.color} label="" />,
                    ];
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {['00:00', '06:00', '12:00', '18:00', '24:00'].map(h => <span key={h}>{h}</span>)}
                </div>
              </div>
            </div>

            {/* Shift list */}
            <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr 110px 110px 80px 32px', gap: 12, padding: '10px 20px', background: 'rgba(30,45,61,0.04)', borderBottom: '1px solid rgba(200,212,220,0.4)' }}>
                {['', t('setup.roles.shifts.col.name'), t('setup.roles.shifts.col.start'), t('setup.roles.shifts.col.end'), t('setup.roles.shifts.col.duration'), ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>{h}</div>
                ))}
              </div>
              {shifts.map((sh, i) => (
                <ShiftRow key={sh.id} shift={sh} borderTop={i > 0} onUpdate={updateShift} onRemove={removeShift} autoFocus={sh.id === newShiftId} />
              ))}
              <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(200,212,220,0.35)' }}>
                <Btn variant="ghost" size="sm" icon={<Icons.plus size={13} />} onClick={addShift}>{t('setup.roles.shifts.addBtn')}</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* Tab: Thời gian trễ & Vắng                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'grace' && (
          <div className="roles-in" style={{ animationDelay: '140ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

            {/* Left: inputs */}
            <div style={{ ...glass, borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', marginBottom: 4 }}>{t('setup.roles.grace.settingsTitle')}</div>
                <div style={{ fontSize: 12, color: '#9BAAB5' }}>{t('setup.roles.grace.settingsSub')}</div>
              </div>

              <Field label={t('setup.roles.grace.fieldGrace')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, ...glass, borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setGrace(v => String(Math.max(0, parseInt(v) - 5 || 0)))}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E8E', fontSize: 16, lineHeight: 1 }}>−</button>
                    <Input
                      value={grace}
                      onChange={v => {
                        const n = Math.max(0, Math.min(120, parseInt(v) || 0));
                        setGrace(n.toString());
                        if (n >= thresholdNum) setAbsenceThreshold((n + 1).toString());
                      }}
                      type="number"
                      style={{ width: 100, textAlign: 'center', border: 'none', borderLeft: '1px solid rgba(200,212,220,0.4)', borderRight: '1px solid rgba(200,212,220,0.4)', borderRadius: 0 }}
                    />
                    <button onClick={() => setGrace(v => String(Math.min(120, parseInt(v) + 5 || 5)))}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E8E', fontSize: 16, lineHeight: 1 }}>+</button>
                  </div>
                  <span style={{ fontSize: 12, color: '#9BAAB5' }}>{t('setup.roles.grace.graceUnit')}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7E8E', marginTop: 8, lineHeight: 1.55 }}>
                  <span dangerouslySetInnerHTML={{ __html: t('setup.roles.grace.graceHint', { n: graceNum }).replace(String(graceNum), `<strong style="color:#00B4A0">${graceNum}</strong>`) }} />
                </p>
              </Field>

              <Field label={t('setup.roles.grace.fieldAbsence')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, ...glass, borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setAbsenceThreshold(v => String(Math.max(graceNum + 1, parseInt(v) - 15 || graceNum + 1)))}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E8E', fontSize: 16, lineHeight: 1 }}>−</button>
                    <Input
                      value={absenceThreshold}
                      onChange={v => {
                        const n = Math.max(graceNum + 1, Math.min(480, parseInt(v) || graceNum + 1));
                        setAbsenceThreshold(n.toString());
                      }}
                      type="number"
                      style={{ width: 100, textAlign: 'center', border: 'none', borderLeft: '1px solid rgba(200,212,220,0.4)', borderRight: '1px solid rgba(200,212,220,0.4)', borderRadius: 0 }}
                    />
                    <button onClick={() => setAbsenceThreshold(v => String(Math.min(480, parseInt(v) + 15 || graceNum + 16)))}
                      style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E8E', fontSize: 16, lineHeight: 1 }}>+</button>
                  </div>
                  <span style={{ fontSize: 12, color: '#9BAAB5' }}>{t('setup.roles.grace.absenceUnit', { n: graceNum + 1 })}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7E8E', marginTop: 8, lineHeight: 1.55 }}>
                  <span dangerouslySetInnerHTML={{ __html: t('setup.roles.grace.absenceHint', { n: thresholdNum }).replace(String(thresholdNum), `<strong style="color:#DC2626">${thresholdNum}</strong>`) }} />
                </p>
              </Field>
            </div>

            {/* Right: visual timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Zone bar */}
              <div style={{ ...glassDark, borderRadius: 14, padding: '22px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{t('setup.roles.grace.vizLabel')}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 20 }}>{t('setup.roles.grace.vizTitle')}</div>

                {/* Zone bar visual */}
                {(() => {
                  const max = Math.max(thresholdNum + 30, 150);
                  const greenW  = (graceNum / max) * 100;
                  const orangeW = ((thresholdNum - graceNum) / max) * 100;
                  const redW    = 100 - greenW - orangeW;
                  return (
                    <div>
                      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 36, marginBottom: 6 }}>
                        <div style={{ width: `${greenW}%`, background: 'linear-gradient(90deg,#00B4A0,#00C9B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 2 }}>
                          {greenW > 8 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{t('setup.roles.grace.zoneOnTime')}</span>}
                        </div>
                        <div style={{ width: `${orangeW}%`, background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 2 }}>
                          {orangeW > 8 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{t('setup.roles.grace.zoneLate')}</span>}
                        </div>
                        <div style={{ flex: 1, background: 'linear-gradient(90deg,#EF4444,#DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 2 }}>
                          {redW > 6 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{t('setup.roles.grace.zoneAbsent')}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', position: 'relative', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        <span style={{ position: 'absolute', left: 0 }}>+0p</span>
                        {graceNum > 0 && <span style={{ position: 'absolute', left: `${greenW}%`, transform: 'translateX(-50%)' }}>+{graceNum}p</span>}
                        <span style={{ position: 'absolute', left: `${greenW + orangeW}%`, transform: 'translateX(-50%)' }}>+{thresholdNum}p</span>
                        <span style={{ position: 'absolute', right: 0 }}>+{max}p</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
                  {[
                    { color: '#00B4A0', label: t('setup.roles.grace.legendOnTime'), sub: `≤ +${graceNum}p` },
                    { color: '#F59E0B', label: t('setup.roles.grace.legendLate'),   sub: `+${graceNum + 1} → +${thresholdNum}p` },
                    { color: '#EF4444', label: t('setup.roles.grace.legendAbsent'), sub: `> +${thresholdNum}p` },
                  ].map(z => (
                    <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: z.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{z.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{z.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example list */}
              <div style={{ ...glass, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7E8E', fontFamily: 'var(--font-display)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>{t('setup.roles.grace.exampleLabel')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <GraceExample time="07:55"                     label={t('setup.roles.grace.exampleEarly')}                               tone="success" />
                  <GraceExample time="08:00"                     label={t('setup.roles.grace.exampleOnTime')}                              tone="success" />
                  <GraceExample time={fmtTime(graceNum)}         label={t('setup.roles.grace.exampleWithinGrace', { n: graceNum })}        tone="success" />
                  <GraceExample time={fmtTime(graceNum + 1)}     label={t('setup.roles.grace.exampleLate')}                               tone="warning" />
                  {thresholdNum > graceNum + 2 && (
                    <GraceExample time={fmtTime(thresholdNum)}   label={t('setup.roles.grace.exampleLateN', { n: thresholdNum })}          tone="warning" />
                  )}
                  <GraceExample time={fmtTime(thresholdNum + 1)} label={t('setup.roles.grace.exampleAbsent')}                             tone="danger" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Save bar ───────────────────────────────────────────────────────── */}
      {anyDirty && (
        <div style={{
          position: 'fixed', bottom: 0, left: 260, right: 0, zIndex: 1000,
          background: 'rgba(30,45,61,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 28px rgba(0,0,0,0.3)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#F59E0B', animation: 'rolesShimmer 1.6s ease infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 }}>
            {[graceDirty && t('setup.roles.saveBar.graceDirty'), shiftsDirty && t('setup.roles.saveBar.shiftsDirty')].filter(Boolean).join(' và ')} {t('setup.roles.saveBar.unsaved')}
          </span>
          {graceDirty && (
            <>
              <Btn variant="dark" size="sm" onClick={cancelGrace} style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.15)' }}>{t('setup.roles.saveBar.cancelGrace')}</Btn>
              <Btn variant="primary" size="sm" icon={<Icons.check size={13} />} onClick={saveGrace}>{t('setup.roles.saveBar.saveGrace')}</Btn>
            </>
          )}
          {shiftsDirty && (
            <>
              <Btn variant="dark" size="sm" onClick={cancelShifts} style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.15)' }}>{t('setup.roles.saveBar.cancelShifts')}</Btn>
              <Btn variant="primary" size="sm" icon={<Icons.check size={13} />} onClick={saveShifts}>{t('setup.roles.saveBar.saveShifts')}</Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GraceExample({ time, label, tone }: { time: string; label: string; tone: 'success' | 'warning' | 'danger' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: '#1E2D3D', width: 46, flexShrink: 0 }}>{time}</span>
      <Tag tone={tone} style={{ fontSize: 11 }}>{label}</Tag>
    </div>
  );
}

function SetupRolesSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={160} style={{ marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
