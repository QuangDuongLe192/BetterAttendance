import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { ROLES, roleById, roleColor } from '../../../../services/setup';
import type { Staff } from '../../../../services/setup';

export function RoleEditDrawer({ staff, onClose, onSave }: {
  staff: Staff;
  onClose: () => void;
  onSave: (staffId: string, roleIds: string[]) => void;
}) {
  const { t } = useTranslation('manager');
  const [roleIds, setRoleIds] = useState<string[]>(staff.roleIds);
  const hasChanges = JSON.stringify([...roleIds].sort()) !== JSON.stringify([...staff.roleIds].sort());

  const available = ROLES.filter(r => !roleIds.includes(r.id));
  const removeRole = (id: string) => setRoleIds(prev => prev.filter(r => r !== id));
  const addRole    = (id: string) => setRoleIds(prev => [...prev, id]);

  return (
    <>
      <style>{`
        @keyframes roleDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes roleBackdropIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.38)', zIndex: 900, animation: 'roleBackdropIn 200ms ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, zIndex: 901, animation: 'roleDrawerIn 240ms cubic-bezier(0.32,0.72,0,1)', borderRadius: '16px 0 0 16px', boxShadow: '-12px 0 48px rgba(0,0,0,0.16)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Dark gradient header */}
        <div style={{ background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)', padding: '24px 24px 20px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,180,160,0.15)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={staff.name} src={staff.avatar} size={40} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,180,160,0.9)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{t('manager.staff.roleDrawer.eyebrow')}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{staff.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{staff.larkUserId}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
              <Icons.x size={16} stroke="currentColor" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#f7f9fa', flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Current roles */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3A4F63', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{t('manager.staff.roleDrawer.currentRoles')}</label>
            {roleIds.length === 0 ? (
              <div style={{ fontSize: 13, color: '#9BAAB5', fontStyle: 'italic', padding: '12px 16px', background: 'rgba(200,212,220,0.15)', borderRadius: 8 }}>
                {t('manager.staff.roleDrawer.noRoles')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {roleIds.map(id => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(0,180,160,0.18)', background: 'rgba(0,180,160,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#00B4A0', flexShrink: 0 }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{roleById(id)?.name ?? id}</div>
                    </div>
                    <button onClick={() => removeRole(id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', padding: 4, borderRadius: 4, display: 'flex' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#C8D4DC'; e.currentTarget.style.background = 'none'; }}>
                      <Icons.x size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add roles */}
          {available.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3A4F63', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{t('manager.staff.roleDrawer.addRoles')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {available.map(r => {
                  const color = roleColor(r);
                  return (
                    <button key={r.id} onClick={() => addRole(r.id)}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(200,212,220,0.4)', display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left', background: 'rgba(255,255,255,0.8)', transition: 'all 100ms' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,212,220,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}>
                      <Icons.plus size={14} stroke={color} />
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{r.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Permission note */}
          <div style={{ padding: '10px 14px', background: 'rgba(200,212,220,0.15)', borderRadius: 8, fontSize: 12, color: '#6B7E8E', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icons.lock size={13} stroke="#9BAAB5" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{t('manager.staff.roleDrawer.permNote')}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'rgba(247,249,250,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(200,212,220,0.2)', padding: '14px 24px', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid rgba(200,212,220,0.5)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6B7E8E' }}>
            {t('manager.staff.roleDrawer.cancel')}
          </button>
          <button disabled={!hasChanges} onClick={() => { onSave(staff.larkUserId, roleIds); onClose(); }}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: hasChanges ? '#00B4A0' : 'rgba(200,212,220,0.3)', cursor: hasChanges ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, color: hasChanges ? '#fff' : '#9BAAB5', boxShadow: hasChanges ? '0 2px 8px rgba(0,180,160,0.3)' : 'none', transition: 'all 150ms' }}>
            {t('manager.staff.roleDrawer.save')}
          </button>
        </div>
      </div>
    </>
  );
}
