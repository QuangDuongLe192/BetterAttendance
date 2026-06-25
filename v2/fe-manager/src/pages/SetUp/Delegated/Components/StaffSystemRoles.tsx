import { useState } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Switch, Avatar } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
const Search = Icons.search;
const Users = Icons.users;
const Lock = Icons.lock;
const ChevR = Icons.chevR;
const Briefcase = Icons.briefcase;
const Shield = Icons.shield;
const Check = Icons.check;
import { STAFF } from '../../../../services/setup';
import type { Staff as StaffType, StaffRoleScope } from '../../../../services/setup';

const PAGE_SIZE = 8;

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

export function StaffSystemRoles({ scopes, setScopes }: Readonly<{
  scopes: StaffRoleScope[];
  setScopes: React.Dispatch<React.SetStateAction<StaffRoleScope[]>>;
}>) {
  const { t } = useTranslation('setup');
  const staffList = STAFF ?? [];
  const [drawerStaffId, setDrawerStaffId] = useState<string | null>(null);
  const [staffPage, setStaffPage] = useState(0);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState<'all' | 'FINANCE' | 'regular'>('all');

  const rolesOf = (uid: string) => {
    const s = scopes.find(x => x.larkUserId === uid);
    if (!s) return [];
    return [...s.orgRoles, ...(s.managedLocationIds.length > 0 ? ['MANAGER'] : [])];
  };

  const handleSave = (staffId: string, hasFinance: boolean) => {
    const staffName = staffList.find(s => s.larkUserId === staffId)?.name;
    setScopes(prev => {
      const existing = prev.find(s => s.larkUserId === staffId);
      const newOrgRoles = hasFinance
        ? [...(existing?.orgRoles.filter(r => r !== 'FINANCE') ?? []), 'FINANCE']
        : (existing?.orgRoles.filter(r => r !== 'FINANCE') ?? []);
      if (existing) {
        const updated = { ...existing, orgRoles: newOrgRoles };
        if (updated.orgRoles.length === 0 && updated.managedLocationIds.length === 0)
          return prev.filter(s => s.larkUserId !== staffId);
        return prev.map(s => s.larkUserId === staffId ? updated : s);
      }
      if (!hasFinance) return prev;
      return [...prev, { larkUserId: staffId, orgRoles: ['FINANCE'], managedLocationIds: [] }];
    });
    setDrawerStaffId(null);
    if (hasFinance) toast.success(t('setup.delegated.finance.toast.granted', { name: staffName }));
    else toast.info(t('setup.delegated.finance.toast.revoked', { name: staffName }));
  };

  const q = staffSearch.trim().toLowerCase();
  const filteredStaff = staffList.filter(s => {
    if (q && !s.name.toLowerCase().includes(q) && !s.phone.toLowerCase().includes(q)) return false;
    const roles = rolesOf(s.larkUserId);
    if (staffFilter === 'FINANCE') return roles.includes('FINANCE');
    if (staffFilter === 'regular') return !roles.includes('MANAGER') && !roles.includes('FINANCE') && !roles.includes('ADMIN');
    return true;
  });

  const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE);
  const pagedStaff = filteredStaff.slice(staffPage * PAGE_SIZE, (staffPage + 1) * PAGE_SIZE);
  const drawerStaff = drawerStaffId ? staffList.find(s => s.larkUserId === drawerStaffId) ?? null : null;

  return (
    <div style={{ marginBottom: 8 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1E2D3D', marginBottom: 4 }}>{t('setup.delegated.finance.title')}</div>
          <div style={{ fontSize: 13, color: '#6B7E8E', lineHeight: 1.5 }}>
            {t('setup.delegated.finance.subtitle')}
          </div>
        </div>
      </div>

      {/* Search + filter toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 14px', ...glass, borderRadius: 8, height: 36, boxSizing: 'border-box' }}>
          <Search size={14} stroke="#6B7E8E" />
          <input
            value={staffSearch}
            onChange={e => { setStaffSearch(e.target.value); setStaffPage(0); }}
            placeholder={t('setup.delegated.finance.search.placeholder')}
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1E2D3D', background: 'transparent', flex: 1, minWidth: 0 }}
          />
          {staffSearch && (
            <button onClick={() => { setStaffSearch(''); setStaffPage(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 0 }}>
              <Icons.x size={12} />
            </button>
          )}
        </div>
        {(['all', 'FINANCE', 'regular'] as const).map(f => {
          const labels = { all: t('setup.delegated.finance.filter.all'), FINANCE: t('setup.delegated.finance.filter.finance'), regular: t('setup.delegated.finance.filter.regular') };
          const active = staffFilter === f;
          return (
            <button key={f} onClick={() => { setStaffFilter(f); setStaffPage(0); }} style={{
              height: 36, padding: '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 120ms',
              border: active ? '1.5px solid rgba(0,180,160,0.4)' : '1px solid rgba(200,212,220,0.5)',
              background: active ? 'rgba(230,249,247,0.85)' : 'rgba(255,255,255,0.55)',
              color: active ? '#00897B' : '#6B7E8E',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}>
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Staff table glass card */}
      <div style={{ ...glass, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>

        {/* Column header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr) minmax(0,1.6fr) 36px', padding: '9px 20px',
          background: 'rgba(247,249,250,0.7)', borderBottom: '1px solid rgba(200,212,220,0.3)' }}>
          {[
            { key: 'staff', h: t('setup.delegated.finance.col.staff') },
            { key: 'phone', h: t('setup.delegated.finance.col.phone') },
            { key: 'sysRole', h: t('setup.delegated.finance.col.sysRole') },
            { key: 'actions', h: '' },
          ].map(({ key, h }) => (
            <div key={key} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,180,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={20} stroke="#00B4A0" />
            </div>
            <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('setup.delegated.finance.empty')}</div>
          </div>
        )}

        {pagedStaff.map((s, i) => {
          const roles = rolesOf(s.larkUserId);
          const isAdmin = roles.includes('ADMIN');
          const isManager = roles.includes('MANAGER');
          const isFinance = roles.includes('FINANCE');
          return (
            <button
              type="button"
              key={s.larkUserId}
              disabled={isAdmin}
              onClick={() => setDrawerStaffId(s.larkUserId)}
              style={{
                display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr) minmax(0,1.6fr) 36px',
                alignItems: 'center', padding: '12px 20px',
                borderTop: i > 0 ? '1px solid rgba(200,212,220,0.25)' : 'none',
                cursor: isAdmin ? 'default' : 'pointer', transition: 'background 100ms',
                background: isFinance ? 'rgba(230,249,247,0.35)' : 'transparent',
                border: 'none', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isAdmin) e.currentTarget.style.background = 'rgba(0,180,160,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isFinance ? 'rgba(230,249,247,0.35)' : 'transparent'; }}
            >
              {/* Name + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Avatar name={s.name} src={s.avatar} size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                </div>
              </div>

              {/* Phone */}
              <div style={{ fontSize: 12, color: '#6B7E8E' }}>{s.phone}</div>

              {/* Role badges */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {isAdmin && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(200,212,220,0.25)', color: '#6B7E8E', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={9} stroke="#9BAAB5" /> {t('setup.delegated.finance.badge.admin')}
                  </span>
                )}
                {isManager && !isAdmin && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', color: '#4F46E5', border: '1px solid rgba(99,102,241,0.2)' }}>{t('setup.delegated.finance.badge.manager')}</span>
                )}
                {isFinance && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,180,160,0.12)', color: '#00897B', border: '1px solid rgba(0,180,160,0.22)' }}>{t('setup.delegated.finance.badge.finance')}</span>
                )}
                {!isAdmin && !isManager && !isFinance && (
                  <span style={{ fontSize: 11, color: '#C8D4DC' }}>{t('setup.delegated.finance.badge.regular')}</span>
                )}
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!isAdmin && <ChevR size={13} stroke="#C8D4DC" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredStaff.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' }}>
          <span style={{ fontSize: 12, color: '#9BAAB5' }}>
            {t('setup.delegated.finance.pagination', { start: staffPage * PAGE_SIZE + 1, end: Math.min((staffPage + 1) * PAGE_SIZE, filteredStaff.length), total: filteredStaff.length })}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <PageBtn onClick={() => setStaffPage(p => p - 1)} disabled={staffPage === 0}>‹</PageBtn>
            {Array.from({ length: totalPages }, (_, p) => (
              <PageBtn key={p} onClick={() => setStaffPage(p)} active={staffPage === p}>{p + 1}</PageBtn>
            ))}
            <PageBtn onClick={() => setStaffPage(p => p + 1)} disabled={staffPage === totalPages - 1}>›</PageBtn>
          </div>
        </div>
      )}

      {drawerStaff && (
        <FinanceDrawer
          staff={drawerStaff}
          currentRoles={rolesOf(drawerStaff.larkUserId)}
          onClose={() => setDrawerStaffId(null)}
          onSave={hasFinance => handleSave(drawerStaff.larkUserId, hasFinance)}
        />
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: Readonly<{ children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }>) {
  let bgColor: string;
  if (active) bgColor = '#E6F9F7';
  else if (disabled) bgColor = 'transparent';
  else bgColor = 'rgba(255,255,255,0.6)';
  let textColor: string;
  if (active) textColor = '#00B4A0';
  else if (disabled) textColor = '#C8D4DC';
  else textColor = '#3A4F63';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 28, height: 28, padding: '0 6px', borderRadius: 6, fontSize: 13, fontWeight: active ? 700 : 400,
      border: active ? '1.5px solid #00B4A0' : '1px solid rgba(200,212,220,0.5)',
      background: bgColor,
      color: textColor,
      cursor: disabled ? 'default' : 'pointer',
      backdropFilter: 'blur(8px)',
      transition: 'all 120ms',
    }}>
      {children}
    </button>
  );
}

function FinanceDrawer({ staff, currentRoles, onClose, onSave }: {
  staff: StaffType;
  currentRoles: string[];
  onClose: () => void;
  onSave: (hasFinance: boolean) => void;
}) {
  const { t } = useTranslation('setup');
  const [financeOn, setFinanceOn] = useState(currentRoles.includes('FINANCE'));
  const isManager = currentRoles.includes('MANAGER');
  const isDirty = financeOn !== currentRoles.includes('FINANCE');

  return createPortal(
    <>
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <button type="button" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.45)', zIndex: 900, animation: 'backdropFadeIn 200ms ease', border: 'none', padding: 0, cursor: 'default' }}></button>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        zIndex: 901, display: 'flex', flexDirection: 'column',
        borderRadius: '16px 0 0 16px', overflow: 'hidden',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
        animation: 'drawerSlideIn 240ms cubic-bezier(0.32,0,0.2,1)',
      }}>

        {/* Dark glass header */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          padding: '22px 24px 20px', flexShrink: 0, position: 'relative', overflow: 'hidden',
        }}>
          {/* Teal orb */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.3) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,180,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,180,160,0.35)' }}>
                <Briefcase size={16} stroke="#5AE4D4" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{t('setup.delegated.finance.drawer.accessLabel')}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 6, color: 'rgba(255,255,255,0.65)', display: 'flex', borderRadius: 7 }}>
              <Icons.x size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <Avatar name={staff.name} src={staff.avatar} size={42} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{staff.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{staff.phone}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#f7f9fa', flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {isManager && (
            <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 12, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={13} stroke="#4F46E5" />
              {t('setup.delegated.finance.drawer.isManagerHint')}
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 4 }}>
            {t('setup.delegated.finance.drawer.sysRoleSection')}
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 10,
            background: financeOn ? 'rgba(230,249,247,0.9)' : 'rgba(255,255,255,0.82)',
            border: `1.5px solid ${financeOn ? 'rgba(0,180,160,0.3)' : 'rgba(200,212,220,0.4)'}`,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            boxShadow: financeOn ? '0 2px 12px rgba(0,180,160,0.1)' : 'none',
            transition: 'all 150ms',
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: financeOn ? 'rgba(0,180,160,0.12)' : 'rgba(200,212,220,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms' }}>
              <Briefcase size={16} stroke={financeOn ? '#00B4A0' : '#9BAAB5'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', marginBottom: 3 }}>{t('setup.delegated.finance.drawer.financeLabel')}</div>
              <div style={{ fontSize: 12, color: '#6B7E8E', lineHeight: 1.55 }}>{t('setup.delegated.finance.drawer.financeSub')}</div>
            </div>
            <Switch checked={financeOn} onChange={setFinanceOn} />
          </div>

          {!financeOn && !isManager && (
            <div style={{ fontSize: 12, color: '#9BAAB5', padding: '4px 2px', fontStyle: 'italic' }}>
              {t('setup.delegated.finance.drawer.noPermHint')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', background: 'rgba(247,249,250,0.85)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(200,212,220,0.3)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            flex: 1, height: 38, borderRadius: 9, border: '1px solid rgba(200,212,220,0.5)',
            background: 'rgba(255,255,255,0.7)', color: '#3A4F63', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}>{t('setup.delegated.finance.drawer.close')}</button>
          {isDirty && (
            <button onClick={() => onSave(financeOn)} style={{
              flex: 2, height: 38, borderRadius: 9, border: 'none',
              background: '#00B4A0', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Check size={14} stroke="#fff" />
              {t('setup.delegated.finance.drawer.save')}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
