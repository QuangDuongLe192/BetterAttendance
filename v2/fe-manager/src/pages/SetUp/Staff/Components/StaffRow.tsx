import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../components/UI';
import { fmtVND, locById, rolesOf, roleById } from '../../../../services/setup';
import type { Staff as StaffType } from '../../../../services/setup';
import { SystemRoleBadges } from './SystemRoles';

export function StaffRow({ staff, borderTop, isSelected, col, onClick }: Readonly<{
  staff: StaffType; borderTop: boolean; isSelected: boolean;
  col: string; onClick: () => void;
}>) {
  const { t } = useTranslation('setup');
  const [hover, setHover] = useState(false);
  const hoverBg = hover ? 'rgba(0,180,160,0.03)' : 'transparent';
  const primaryPay = staff.payType === 'monthly'
    ? fmtVND(staff.monthly ?? 0) + t('setup.staff.detail.pay.perMonth')
    : fmtVND(staff.rate ?? 0) + t('setup.staff.detail.pay.perHour');

  return (
    <button
      className="staff-row"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: col,
        padding: '13px 20px', alignItems: 'center',
        borderTop: borderTop ? '1px solid rgba(200,212,220,0.3)' : 'none',
        background: isSelected ? 'rgba(0,180,160,0.07)' : hoverBg,
        cursor: 'pointer',
        transition: 'background 120ms',
        borderLeft: isSelected ? '3px solid #00B4A0' : '3px solid transparent',
        boxSizing: 'border-box',
        border: 'none', width: '100%', textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar name={staff.name} src={staff.avatar} size={32} />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {staff.name}
          </span>
          {staff.floater && (
            <span style={{ fontSize: 10, color: '#6B7E8E', fontWeight: 500 }}>{t('setup.staff.floater')}</span>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#6B7E8E' }}>{staff.phone}</div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {rolesOf(staff.larkUserId).length
          ? <SystemRoleBadges roles={rolesOf(staff.larkUserId) as any} />
          : <span style={{ fontSize: 11, color: '#C8D4DC' }}>—</span>
        }
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {staff.roleIds.map(id => {
          const r = roleById(id);
          return (
            <span key={id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999,
              background: 'rgba(0,180,160,0.09)', color: '#00897B', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: '#00B4A0', flexShrink: 0 }} />
              {r?.name ?? id}
            </span>
          );
        })}
        {staff.roleIds.length === 0 && <span style={{ fontSize: 11, color: '#C8D4DC' }}>—</span>}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {staff.locationIds.map(lid => (
          <span key={lid} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.7)', color: '#3A4F63', fontWeight: 500,
            border: '1px solid rgba(200,212,220,0.5)' }}>
            {locById(lid).name}
          </span>
        ))}
        {staff.locationIds.length === 0 && <span style={{ fontSize: 11, color: '#C8D4DC' }}>—</span>}
      </div>

      <div style={{ fontSize: 12, color: isSelected ? '#008C7C' : '#3A4F63', fontWeight: 600 }}>
        {primaryPay}
      </div>
    </button>
  );
}
