import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../components/UI';
import { staffById, roleById, roleColor } from '../../../../services/setup';
import type { ShiftEntity } from '../../../../services/manager';
import { minutesFromVN, hhmmFromVN } from '../../../../services/manager';

export function RosterRow({ entry, borderTop }: { entry: ShiftEntity; borderTop: boolean }) {
  const { t } = useTranslation('manager');

  const STATUS_META: Record<ShiftEntity['status'], { label: string; color: string; bg: string }> = {
    in:        { label: t('manager.roster.status.in'),        color: '#00897B', bg: 'rgba(0,180,160,0.10)' },
    completed: { label: t('manager.roster.status.completed'), color: '#00897B', bg: 'rgba(0,180,160,0.10)' },
    late:      { label: t('manager.roster.status.late'),      color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
    absent:    { label: t('manager.roster.status.absent'),    color: '#DC2626', bg: 'rgba(220,38,38,0.08)'  },
    upcoming:  { label: t('manager.roster.status.upcoming'),  color: '#6B7E8E', bg: 'rgba(200,212,220,0.25)' },
    overtime:  { label: t('manager.roster.status.overtime'),  color: '#4F46E5', bg: 'rgba(99,102,241,0.10)' },
  };

  const role = roleById(entry.roleId);
  const meta = STATUS_META[entry.status];
  const startMins = minutesFromVN(entry.scheduleInTime);
  const endMins   = minutesFromVN(entry.scheduleOutTime);
  const startH = Math.floor(startMins / 60);
  const startM = startMins % 60;
  const endH   = Math.floor(endMins / 60) % 24;
  const endM   = endMins % 60;
  const timeStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} – ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  const staff = staffById(entry.larkUserId);
  const clockInStr  = entry.actualInTime  ? hhmmFromVN(entry.actualInTime)  : undefined;
  const clockOutStr = entry.actualOutTime ? hhmmFromVN(entry.actualOutTime) : undefined;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(6,1fr)',
      padding: '14px 20px', alignItems: 'center',
      borderTop: borderTop ? '1px solid rgba(200,212,220,0.25)' : 'none',
      transition: 'background 100ms',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.025)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={staff.name} src={staff.avatar} size={28} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{staff.name}</div>
          <div style={{ fontSize: 11, color: '#6B7E8E' }}>{staff.phone}</div>
        </div>
      </div>

      <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: `${roleColor(role)}18`, color: roleColor(role), fontWeight: 600, width: 'fit-content' }}>
        {role.name}
      </span>

      <div style={{ fontSize: 12, color: '#3A4F63' }}>{timeStr}</div>

      <div style={{ fontSize: 12 }}>
        {clockInStr ? (
          <span style={{ color: entry.status === 'late' ? '#F59E0B' : '#00B4A0', fontWeight: 700 }}>{clockInStr}</span>
        ) : (
          <span style={{ color: '#C8D4DC' }}>—</span>
        )}
      </div>

      <div style={{ fontSize: 12 }}>
        {clockOutStr
          ? <span style={{ color: '#3A4F63', fontWeight: 600 }}>{clockOutStr}</span>
          : <span style={{ color: '#C8D4DC' }}>—</span>
        }
      </div>

      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: meta.bg, color: meta.color, fontWeight: 600, width: 'fit-content' }}>
        {meta.label}
      </span>
    </div>
  );
}
