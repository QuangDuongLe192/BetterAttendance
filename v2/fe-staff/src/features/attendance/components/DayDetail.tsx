import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { deriveShiftStatus, formatClockTime, formatShiftTime } from '../../../shared/lib/shift';
import type { WeeklyDayShift } from '../types';

const Pin = Icons.pin;
const User = Icons.user;
const Clock = Icons.clock;

interface DayDetailProps {
  shifts: WeeklyDayShift[];
  isLoading: boolean;
}

function DayOffIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="18" fill="var(--c-teal-light)" stroke="var(--c-teal)" strokeWidth="2" />
      <circle cx="30" cy="32" r="2.5" fill="var(--c-teal)" />
      <circle cx="42" cy="32" r="2.5" fill="var(--c-teal)" />
      <path d="M28 40 Q36 48 44 40" stroke="var(--c-teal)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M36 14v-5M36 63v-5" stroke="var(--c-teal)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 36H9M63 36h-5" stroke="var(--c-teal)" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 21.5l-3.5-3.5M54 50l-3.5-3.5M50.5 21.5l3.5-3.5M18 50l3.5-3.5" stroke="var(--c-teal)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DayDetail({ shifts, isLoading }: Readonly<DayDetailProps>) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  if (isLoading) return null;

  if (shifts.length === 0) {
    return (
      <div className="cd-day-off">
        <div className="cd-day-off__icon">
          <DayOffIllustration />
        </div>
        <p className="cd-day-off__text">{t('calendar.dayOff')}</p>
      </div>
    );
  }

  return (
    <div className="cd-day-detail">
      {shifts.map(shift => {
        const derived = deriveShiftStatus({
          start: shift.start,
          end: shift.end,
          clockIn: shift.clockIn,
          clockOut: shift.clockOut,
        });

        const badges: { key: string; cls: string }[] = [];
        if (shift.status === 'cancelled') {
          badges.push({ key: 'calendar.status.cancelled', cls: 'cd-badge--rejected' });
        } else {
          if (shift.status === 'completed' || derived.includes('completed')) {
            badges.push({ key: 'calendar.status.completed', cls: 'cd-badge--approved' });
          }
          if (derived.includes('active')) {
            badges.push({ key: 'calendar.status.active', cls: 'cd-badge--info' });
          }
          if (derived.includes('late')) {
            badges.push({ key: 'calendar.status.late', cls: 'cd-badge--pending' });
          }
          if (derived.includes('early_leave')) {
            badges.push({ key: 'calendar.status.earlyLeave', cls: 'cd-badge--pending' });
          }
          if (derived.includes('absent')) {
            badges.push({ key: 'calendar.status.absent', cls: 'cd-badge--rejected' });
          }
        }

        return (
          <button
            key={shift.shiftId}
            className="cd-day-detail__card"
            onClick={() => navigate(`/shifts/${shift.shiftId}`)}
          >
            <div className="cd-day-detail__time">
              {formatShiftTime(shift.start, i18n.language)} — {formatShiftTime(shift.end, i18n.language)}
            </div>
            <div className="cd-day-detail__meta">
              <div className="cd-day-detail__meta-row">
                <Pin size={13} sw={2} />
                <span>{shift.locationName}</span>
              </div>
              <div className="cd-day-detail__meta-row">
                <User size={13} sw={2} />
                <span>{shift.roleName}</span>
              </div>
            </div>

            {(shift.clockIn || shift.clockOut) && (
              <div className="cd-day-detail__clock">
                {shift.clockIn && (
                  <span className="cd-day-detail__clock-item">
                    <Clock size={11} sw={2} />
                    {t('calendar.clockIn')} {formatClockTime(shift.clockIn, i18n.language)}
                  </span>
                )}
                {shift.clockOut && (
                  <span className="cd-day-detail__clock-item cd-day-detail__clock-item--out">
                    <Clock size={11} sw={2} />
                    {t('calendar.clockOut')} {formatClockTime(shift.clockOut, i18n.language)}
                  </span>
                )}
              </div>
            )}

            {badges.length > 0 && (
              <div className="cd-day-detail__status">
                {badges.map(b => (
                  <span key={b.key} className={`cd-badge ${b.cls}`}>{t(b.key)}</span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
