import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { formatShiftTime } from '../../../shared/lib/shift';
import type { ShiftItemDto } from '../types';

export function UpcomingShiftItem({ shift }: { shift: ShiftItemDto }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [now] = useState(() => Date.now());

  const isStarted = now >= shift.start && now <= shift.end;

  const hoursUntil = useMemo(() => {
    const vi = i18n.language === 'vi';
    const diff = Math.round((shift.start - now) / 60000);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) return vi ? `${h}g ${m}p nữa` : `in ${h}h ${m}m`;
    return vi ? `${m} phút nữa` : `in ${m} min`;
  }, [shift.start, i18n.language, now]);

  const startLabel = formatShiftTime(shift.start, i18n.language);
  const endLabel = formatShiftTime(shift.end, i18n.language);

  return (
    <button
      className="cd-upcoming-item"
      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      onClick={() => navigate(`/shifts/${shift.shiftId}`)}
    >
      <div className="cd-upcoming-item__icon">
        <Icons.calendar size={16} sw={2} />
      </div>
      <div className="cd-upcoming-item__body">
        <div className="cd-upcoming-item__time">
          {startLabel}–{endLabel}
        </div>
        <div className="cd-upcoming-item__meta">
          {shift.roleName} · {shift.locationName}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {isStarted && (
          <span className="cd-badge cd-badge--pending" style={{ fontSize: 11 }}>
            {t('calendar.status.late')}
          </span>
        )}
        {!isStarted && hoursUntil && (
          <span className="cd-badge cd-badge--info" style={{ fontSize: 11 }}>
            {hoursUntil}
          </span>
        )}
        <Icons.chevR size={14} sw={2} style={{ color: 'rgba(255,255,255,0.35)' }} />
      </div>
    </button>
  );
}
