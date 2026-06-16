import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShiftDetail } from '../features/attendance/hooks/useShiftDetail';
import { formatDayName } from '../shared/lib/date';
import { formatShiftTime } from '../shared/lib/shift';
import { Skeleton } from '../shared/components/ui/Skeleton';

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const labelStyle = { fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' } as const;
const valueStyle = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' } as const;

function Row({ label, value, large, accent, last }: {
  label: string; value: string; large?: boolean; accent?: boolean; last?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--line-2)',
    }}>
      <div style={labelStyle}>{label}</div>
      <div style={{
        ...valueStyle,
        fontSize: large ? 18 : 16,
        color: accent ? 'var(--c-teal)' : 'var(--fg-1)',
      }}>{value}</div>
    </div>
  );
}

export function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const { data: shift, isPending, isError } = useShiftDetail(id);

  if (isPending) {
    return (
      <div className="cd-page">
        <div className="cd-header">
          <Skeleton height={22} width="50%" borderRadius={6} />
        </div>
        <div className="cd-card">
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--line-2)' : 'none' }}>
              <Skeleton height={16} width="80%" borderRadius={4} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !shift) {
    return (
      <div className="cd-page">
        <div className="cd-card cd-card--soft">
          <div className="cd-empty">
            <div className="cd-empty__title">{t('attendance.shiftDetail.notFound')}</div>
          </div>
        </div>
      </div>
    );
  }

  const dayLabel = formatDayName(new Date(shift.date + 'T00:00:00'), i18n.language);

  const clockInTime = shift.clockIn
    ? new Date(shift.clockIn).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
    : null;
  const clockOutTime = shift.clockOut
    ? new Date(shift.clockOut).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
    : null;

  const initials = shift.managerName
    ? shift.managerName.split(' ').slice(-2).map(w => w[0]).join('')
    : null;

  return (
    <div className="cd-page">
      <div className="cd-header" style={{ paddingBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--c-teal)', marginBottom: 4 }}>
          {t('attendance.shiftDetail.title')}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--fg-1)', margin: 0 }}>
          {dayLabel}, {formatDate(shift.date)}
        </h1>
      </div>

      {/* Manager card */}
      {shift.managerName && (
        <div className="cd-card">
          <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--c-teal)', textTransform: 'uppercase', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            {t('attendance.shift.manager')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--c-teal-light)', color: 'var(--c-teal-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{shift.managerName}</div>
              </div>
          </div>
        </div>
      )}

      {/* Shift details card */}
      <div className="cd-card">
        <Row label={t('attendance.shift.time')} value={`${formatShiftTime(shift.start, i18n.language)} — ${formatShiftTime(shift.end, i18n.language)}`} large />
        <Row label={t('attendance.shift.location')} value={shift.locationName} />
        {shift.address && <Row label={t('attendance.shift.address')} value={shift.address} />}
        <Row label={t('attendance.shift.role')} value={shift.roleName} />
        {shift.breakWindow && <Row label={t('attendance.shift.breakWindow')} value={shift.breakWindow} />}
        {clockInTime && (
          <Row
            label={t('attendance.shift.clockIn')}
            value={clockInTime}
            accent
            last={!clockOutTime}
          />
        )}
        {clockOutTime && (
          <Row
            label={t('attendance.shift.clockOut')}
            value={clockOutTime}
            last
          />
        )}
      </div>

      {/* Pay estimate */}
      {shift.expectedPayVnd != null && (
        <div className="cd-card">
          <Row
            label={t('attendance.shiftDetail.expectedPay')}
            value={shift.expectedPayVnd.toLocaleString('vi-VN')}
            last
          />
        </div>
      )}
    </div>
  );
}
