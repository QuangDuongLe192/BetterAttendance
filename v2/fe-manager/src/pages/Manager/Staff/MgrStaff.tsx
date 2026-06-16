import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { STAFF, locById, hasRole, roleById } from '../../../services/setup';
import type { Staff } from '../../../services/setup';
import { RoleEditDrawer } from './Components/RoleEditDrawer';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

export function MgrStaff({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const [search, setSearch] = useState('');
  const [localStaff, setLocalStaff] = useState(STAFF);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  if (isLoading) return <MgrStaffSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const locStaff = activeStore === 'all'
    ? (localStaff ?? [])
    : (localStaff ?? []).filter(s => s.floater || s.locationIds.includes(activeStore));
  const filtered = locStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSaveRoles = (staffId: string, roleIds: string[]) => {
    const staff = localStaff.find(s => s.larkUserId === staffId);
    setLocalStaff(prev => prev.map(s => s.larkUserId === staffId ? { ...s, roleIds } : s));
    toast.success(t('manager.staff.toast.rolesSaved', { name: staff?.name ?? staffId }));
    console.log('[PUT] /api/staff/' + staffId, { roleIds });
  };

  const storeName = activeStore === 'all' ? t('manager.sidebar.store.all') : locById(activeStore).name;
  const COL = '1fr 110px repeat(2, 1fr) 40px';

  return (
    <>
      <div style={{ margin: '-36px -40px -80px', padding: '36px 40px 80px', background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'fadeUp 350ms ease both' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{t('manager.staff.eyebrow')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', margin: 0 }}>{t('manager.staff.title')}</h1>
            {activeStore !== 'all' && (
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#00B4A0', margin: 0 }}>{storeName}</h1>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#6B7E8E', marginTop: 4, marginBottom: 0 }}>{t('manager.staff.count', { count: locStaff.length })}</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 20, flex: 1, maxWidth: 300 }}>
            <Icons.search size={13} stroke="#9BAAB5" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('manager.staff.search')}
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1E2D3D', background: 'transparent', flex: 1, minWidth: 0 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9BAAB5', display: 'flex', lineHeight: 1 }}>
                <Icons.x size={12} />
              </button>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ ...glass, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#6B7E8E' }}>
            {t('manager.staff.results', { count: filtered.length })}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...glass, borderRadius: 14, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 20px', borderBottom: '1px solid rgba(200,212,220,0.25)', background: 'rgba(247,249,250,0.97)', minWidth: 700, position: 'sticky', top: 0, zIndex: 2 }}>
            {[
              t('manager.staff.col.staff'),
              t('manager.staff.col.phone'),
              t('manager.staff.col.role'),
              t('manager.staff.col.store'),
              '',
            ].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase', ...(i === 0 ? { position: 'sticky' as const, left: 0, background: 'rgba(247,249,250,0.97)', zIndex: 3 } : {}) }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((staff, i) => {
            const isManager = hasRole(staff.larkUserId, 'MANAGER');
            return (
              <div key={staff.larkUserId}
                style={{ display: 'grid', gridTemplateColumns: COL, padding: '12px 20px', alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(200,212,220,0.2)' : 'none', minWidth: 700, transition: 'background 100ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'sticky', left: 0 }}>
                  <Avatar name={staff.name} src={staff.avatar} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap' }}>{staff.name}</span>
                      {isManager && (
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(0,180,160,0.1)', color: '#00B4A0', fontWeight: 700 }}>{t('manager.staff.badge.manager')}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{staff.larkUserId}</div>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ fontSize: 12, color: '#6B7E8E' }}>{staff.phone}</div>

                {/* Roles */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {staff.roleIds.map(id => (
                    <span key={id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,180,160,0.08)', color: '#00897B', fontWeight: 600 }}>
                      {roleById(id)?.name ?? id}
                    </span>
                  ))}
                </div>

                {/* Locations */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {staff.locationIds.map(locId => (
                    <span key={locId} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'rgba(200,212,220,0.2)', color: '#3A4F63', fontWeight: 500, border: '1px solid rgba(200,212,220,0.35)' }}>
                      {locById(locId).name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <button title={t('manager.staff.edit.title')} onClick={() => setEditStaff(staff)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#6B7E8E', transition: 'all 100ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,160,0.08)'; e.currentTarget.style.color = '#00B4A0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7E8E'; }}>
                    <Icons.edit size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9BAAB5', fontSize: 13 }}>
              {t('manager.staff.empty')}
            </div>
          )}
        </div>
      </div>

      {editStaff && (
        <RoleEditDrawer
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          onSave={handleSaveRoles}
        />
      )}
    </>
  );
}

function MgrStaffSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
