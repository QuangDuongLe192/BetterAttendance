import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../Icons';
import { useClickOutside } from '../../hooks/useClickOutside';

interface MiniCalendarProps {
  value: string;
  minDate?: string;
  maxDate?: string;
  onChange: (iso: string) => void;
  onClose: () => void;
}

const DOW_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DOW_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function isoToDate(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

function dateToIso(d: Date): string {
  return d.toISOString().split('T')[0];
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // getDay: 0=Sun, 1=Mon … convert to Mon-first index
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function MiniCalendar({ value, minDate, maxDate, onChange, onClose }: MiniCalendarProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const ref = useRef<HTMLDivElement>(null);

  const initial = isoToDate(value);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const todayIso = dateToIso(new Date());
  const dow = lang === 'vi' ? DOW_VI : DOW_EN;

  useClickOutside(ref, onClose);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells = buildGrid(viewYear, viewMonth);

  const monthLabel = lang === 'vi'
    ? `Tháng ${viewMonth + 1}/${viewYear}`
    : new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="cd-mini-cal" ref={ref}>
      <div className="cd-mini-cal__header">
        <button className="cd-mini-cal__nav" onClick={prevMonth} type="button">
          <Icons.arrowL size={14} />
        </button>
        <span className="cd-mini-cal__title">{monthLabel}</span>
        <button className="cd-mini-cal__nav" onClick={nextMonth} type="button">
          <Icons.arrowR size={14} />
        </button>
      </div>

      <div className="cd-mini-cal__grid">
        {dow.map(d => (
          <div key={d} className="cd-mini-cal__dow">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="cd-mini-cal__day cd-mini-cal__day--empty" />;
          }

          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = iso === value;
          const isToday = iso === todayIso;
          const isDisabled = (minDate != null && iso < minDate) || (maxDate != null && iso > maxDate);

          let cls = 'cd-mini-cal__day';
          if (isSelected) cls += ' cd-mini-cal__day--selected';
          else if (isToday) cls += ' cd-mini-cal__day--today';

          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={isDisabled}
              onClick={() => onChange(iso)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
