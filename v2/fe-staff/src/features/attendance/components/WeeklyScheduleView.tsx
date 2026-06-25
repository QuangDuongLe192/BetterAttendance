import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { formatClockTime } from '../../../shared/lib/shift';
import { formatDayDate, getDayLabel } from '../../../shared/lib/date';
import type { WeeklyDay } from '../types';

const ArrowL = Icons.arrowL;
const ArrowR = Icons.arrowR;
const Clock = Icons.clock;

interface WeeklyScheduleViewProps {
  days: WeeklyDay[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday?: () => void;
  onShiftClick?: (date: string, shiftIndex: number) => void;
}

export function WeeklyScheduleView({ days, onPrevWeek, onNextWeek, onGoToToday, onShiftClick }: Readonly<WeeklyScheduleViewProps>) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="cd-weeknav">
        <button onClick={onPrevWeek}>
          <ArrowL size={16} />{t('attendance.weekly.prevWeek')}
        </button>
        <button className="cd-weeknav__now" onClick={onGoToToday}>{t('attendance.weekly.thisWeek')}</button>
        <button onClick={onNextWeek}>
          {t('attendance.weekly.nextWeek')}<ArrowR size={16} />
        </button>
      </div>

      <div className="cd-week">
        {days.map(day => {
          const isToday = day.date === todayIso;
          return (
            <div key={day.date} className={`cd-week__row${isToday ? ' cd-week__row--today' : ''}`}>
              <div className="cd-week__day">
                <div className="cd-week__dw">{getDayLabel(day.date, lang)}</div>
                <div className="cd-week__dd">{formatDayDate(day.date)}</div>
              </div>
              <div className="cd-week__shifts">
                {day.shifts.length === 0 ? (
                  <span className="cd-week__empty">{t('attendance.weekly.noShift')}</span>
                ) : (
                  day.shifts.map((shift, i) => (
                    <button key={shift.shiftId} className="cd-week__shift" onClick={() => onShiftClick?.(day.date, i)}>
                      <div className="cd-week__time">
                        {formatClockTime(shift.start, lang)}<span> — </span>{formatClockTime(shift.end, lang)}
                      </div>
                      <div className="cd-week__loc">{shift.locationName}</div>
                      {(shift.clockIn || shift.clockOut) && (
                        <div className="cd-day-detail__clock">
                          {shift.clockIn && (
                            <span className="cd-day-detail__clock-item">
                              <Clock size={11} sw={2} />
                              {t('calendar.clockIn')} {formatClockTime(shift.clockIn, lang)}
                            </span>
                          )}
                          {shift.clockOut && (
                            <span className="cd-day-detail__clock-item cd-day-detail__clock-item--out">
                              <Clock size={11} sw={2} />
                              {t('calendar.clockOut')} {formatClockTime(shift.clockOut, lang)}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
