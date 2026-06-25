import { useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { buildMonthGrid } from '../../../shared/lib/date';
import type { WeeklyDayShift } from '../types';

const ArrowL = Icons.arrowL;
const ArrowR = Icons.arrowR;

const DOW_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DOW_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const CELL_H = 46;

interface MonthGridProps {
  viewYear: number;
  viewMonth: number;
  selectedDate: string;
  weekAnchor: string;
  todayStr: string;
  shiftMap: Map<string, WeeklyDayShift[]>;
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isCollapsed: boolean;
  onWeekSwipe: (days: number) => void;
}

function getWeekDates(isoDate: string): string[] {
  const d = new Date(isoDate + 'T00:00:00');
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = new Date(d);
    t.setDate(d.getDate() + mondayOffset + i);
    dates.push(
      `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MonthGrid({
  viewYear,
  viewMonth,
  selectedDate,
  weekAnchor,
  todayStr,
  shiftMap,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  isCollapsed,
  onWeekSwipe,
}: Readonly<MonthGridProps>) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language;

  const cells = buildMonthGrid(viewYear, viewMonth);
  const dow = lang === 'vi' ? DOW_VI : DOW_EN;

  const monthLabel =
    lang === 'vi'
      ? `Tháng ${viewMonth + 1}/${viewYear}`
      : new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Full-grid translateY (expanded mode)
  const selectedDay = Number.parseInt(selectedDate.split('-')[2], 10);
  const selectedMonthPrefix = selectedDate.slice(0, 7);
  const thisMonthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const cellIdx = selectedMonthPrefix === thisMonthPrefix ? cells.indexOf(selectedDay) : 0;
  const rowIdx = Math.max(0, Math.floor(cellIdx / 7));
  const translateY = isCollapsed ? -(rowIdx * CELL_H) : 0;

  // scroll-snap container ref
  const snapRef = useRef<HTMLDivElement>(null);
  // true while we're programmatically resetting scroll to center — ignore scroll events
  const resetting = useRef(false);
  // Silently jump scroll to center panel (no animation)
  const resetToCenter = useCallback(() => {
    const el = snapRef.current;
    if (!el) return;
    resetting.current = true;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = el.offsetWidth;
    // Allow one frame for the DOM update, then re-enable event handling
    requestAnimationFrame(() => {
      resetting.current = false;
    });
  }, []);

  // When collapsed mode activates, reset scroll silently to center
  useEffect(() => {
    if (!isCollapsed) return;
    resetToCenter();
  }, [isCollapsed, resetToCenter]);

  // After weekAnchor updates (new week loaded), re-center without animation
  const prevAnchor = useRef(weekAnchor);
  useEffect(() => {
    if (prevAnchor.current !== weekAnchor) {
      prevAnchor.current = weekAnchor;
      if (isCollapsed) resetToCenter();
    }
  }, [weekAnchor, isCollapsed, resetToCenter]);

  // Detect when scroll snap settles, then navigate to new week
  useEffect(() => {
    if (!isCollapsed) return;
    const el = snapRef.current;
    if (!el) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function onSettled() {
      if (resetting.current) return;
      const w = el!.offsetWidth;
      if (!w) return;
      const panel = Math.round(el!.scrollLeft / w); // 0=prev, 1=center, 2=next
      if (panel === 1) return; // stayed on center — nothing to do
      const delta = panel === 2 ? 7 : -7;
      resetting.current = true;
      el!.style.scrollBehavior = 'auto';
      el!.scrollLeft = w;
      requestAnimationFrame(() => {
        resetting.current = false;
        onWeekSwipe(delta);
      });
    }

    function onScroll() {
      if (resetting.current) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      // 80ms after last scroll event = snap has settled
      debounceTimer = setTimeout(onSettled, 80);
    }

    // Use scrollend when available (Chrome 109+, Safari 16.4+), fall back to debounced scroll
    const target = el as EventTarget & HTMLDivElement;
    const supportsScrollEnd = 'onscrollend' in el;
    if (supportsScrollEnd) {
      target.addEventListener('scrollend' as 'scroll', onSettled);
    } else {
      target.addEventListener('scroll', onScroll);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      target.removeEventListener('scrollend' as 'scroll', onSettled);
      target.removeEventListener('scroll', onScroll);
    };
  }, [isCollapsed, onWeekSwipe]);

  // Month-mode swipe (expanded) — simple touch tracking, no DOM animation needed
  const monthTouchStartX = useRef(0);
  const monthTouchStartY = useRef(0);

  function handleMonthTouchStart(e: React.TouchEvent) {
    monthTouchStartX.current = e.touches[0].clientX;
    monthTouchStartY.current = e.touches[0].clientY;
  }

  function handleMonthTouchEnd(e: React.TouchEvent) {
    const dx = monthTouchStartX.current - e.changedTouches[0].clientX;
    const dy = monthTouchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx > 0) onNextMonth(); else onPrevMonth();
  }

  function renderWeekCells(weekDates: string[]) {
    return weekDates.map(iso => {
      const isToday = iso === todayStr;
      const isSelected = iso === selectedDate;
      const shifts = shiftMap.get(iso) ?? [];
      const visibleDots = shifts.slice(0, 3);
      const day = Number.parseInt(iso.split('-')[2], 10);

      let cls = 'cd-month-cal__cell';
      if (isSelected) cls += ' cd-month-cal__cell--selected';
      else if (isToday) cls += ' cd-month-cal__cell--today';

      return (
        <button type="button" key={iso} className={cls} onClick={() => onSelectDate(iso)} style={{ background: 'none', border: 'none', padding: 0 }}>
          <div className="cd-month-cal__num">{day}</div>
          {visibleDots.length > 0 && (
            <div className="cd-month-cal__dots">
              {visibleDots.map((shift) => (
                <div
                  key={shift.shiftId}
                  className={`cd-month-cal__dot${shift.status === 'cancelled' ? ' cd-month-cal__dot--cancelled' : ''}`}
                />
              ))}
            </div>
          )}
        </button>
      );
    });
  }

  return (
    <div className={`cd-month-cal${isCollapsed ? ' cd-month-cal--collapsed' : ''}`}>
      <div className="cd-month-cal__header">
        <button
          type="button"
          className="cd-month-cal__nav"
          onClick={isCollapsed ? () => onWeekSwipe(-7) : onPrevMonth}
          aria-label={t('calendar.prevMonth')}
        >
          <ArrowL size={14} />
        </button>
        <span className="cd-month-cal__title">{monthLabel}</span>
        <button
          type="button"
          className="cd-month-cal__nav"
          onClick={isCollapsed ? () => onWeekSwipe(7) : onNextMonth}
          aria-label={t('calendar.nextMonth')}
        >
          <ArrowR size={14} />
        </button>
      </div>

      <div className="cd-month-cal__dow-row">
        {dow.map(d => (
          <div key={d} className="cd-month-cal__dow">{d}</div>
        ))}
      </div>

      {isCollapsed && (
        // Scroll-snap carousel — sits OUTSIDE rows-clip so overflow:hidden doesn't block scroll
        <div ref={snapRef} className="cd-month-cal__snap-track">
          <div className="cd-month-cal__week-panel cd-month-cal__grid--cells-only">
            {renderWeekCells(getWeekDates(shiftDate(weekAnchor, -7)))}
          </div>
          <div className="cd-month-cal__week-panel cd-month-cal__grid--cells-only">
            {renderWeekCells(getWeekDates(weekAnchor))}
          </div>
          <div className="cd-month-cal__week-panel cd-month-cal__grid--cells-only">
            {renderWeekCells(getWeekDates(shiftDate(weekAnchor, 7)))}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="cd-month-cal__rows-clip">
          <div
            className="cd-month-cal__grid--cells-only"
            style={{ transform: `translateY(${translateY}px)` }}
            onTouchStart={handleMonthTouchStart}
            onTouchEnd={handleMonthTouchEnd}
          >
            {cells.map((day, i) => ({ day, cellKey: day !== null ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : `e${i}` })).map(({ day, cellKey }) => {
              if (day === null) {
                return <div key={cellKey} className="cd-month-cal__cell cd-month-cal__cell--empty" />;
              }
              const iso = cellKey;
              const isToday = iso === todayStr;
              const isSelected = iso === selectedDate;
              const shifts = shiftMap.get(iso) ?? [];
              const visibleDots = shifts.slice(0, 3);

              let cls = 'cd-month-cal__cell';
              if (isSelected) cls += ' cd-month-cal__cell--selected';
              else if (isToday) cls += ' cd-month-cal__cell--today';

              return (
                <button type="button" key={iso} className={cls} onClick={() => onSelectDate(iso)} style={{ background: 'none', border: 'none', padding: 0 }}>
                  <div className="cd-month-cal__num">{day}</div>
                  {visibleDots.length > 0 && (
                    <div className="cd-month-cal__dots">
                      {visibleDots.map((shift) => (
                        <div
                          key={shift.shiftId}
                          className={`cd-month-cal__dot${shift.status === 'cancelled' ? ' cd-month-cal__dot--cancelled' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
