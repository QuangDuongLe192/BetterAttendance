import { useTranslation } from 'react-i18next';
import type { SystemRole } from '../../../../services/setup';

const SELECTABLE_ROLES: SystemRole[] = ['MANAGER', 'FINANCE'];

function useRoleMeta(): Record<SystemRole, { label: string; color: string; bg: string }> {
  const { t } = useTranslation('setup');
  return {
    ADMIN:   { label: t('setup.delegated.finance.badge.admin'),   color: '#1E2D3D', bg: '#E8ECEF' },
    MANAGER: { label: t('setup.delegated.finance.badge.manager'), color: '#B45309', bg: '#FEF3C7' },
    FINANCE: { label: t('setup.delegated.finance.badge.finance'), color: '#1E40AF', bg: '#DBEAFE' },
  };
}

export function SystemRoleBadges({ roles }: { roles: SystemRole[] }) {
  const ROLE_META = useRoleMeta();
  if (!roles.length) return null;
  return (
    <>
      {roles.map(r => (
        <span key={r} style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: ROLE_META[r].bg, color: ROLE_META[r].color }}>
          {ROLE_META[r].label}
        </span>
      ))}
    </>
  );
}

export function SystemRoleEditor({ roles, onChange }: { roles: SystemRole[]; onChange: (r: SystemRole[]) => void }) {
  const { t } = useTranslation('setup');
  const ROLE_META = useRoleMeta();
  const hasAdmin = roles.includes('ADMIN');
  const toggle = (r: SystemRole) => {
    onChange(roles.includes(r) ? roles.filter(x => x !== r) : [...roles, r]);
  };
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
        {t('setup.staff.sysRoles.label')}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SELECTABLE_ROLES.map(r => {
          const active = roles.includes(r);
          const m = ROLE_META[r];
          return (
            <button key={r} type="button" onClick={() => toggle(r)} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${active ? m.color : '#E8ECEF'}`,
              background: active ? m.bg : '#fff',
              color: active ? m.color : '#6B7E8E',
              transition: 'all 120ms',
            }}>
              {m.label}
            </button>
          );
        })}
        {hasAdmin && (
          <span style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1.5px solid #C8D4DC', background: '#E8ECEF', color: '#6B7E8E' }}>
            {ROLE_META.ADMIN.label}
          </span>
        )}
      </div>
      {!roles.length && (
        <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 6 }}>{t('setup.staff.sysRoles.noAccess')}</div>
      )}
    </div>
  );
}
