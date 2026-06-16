import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { MonthGrid } from '../features/attendance/components/MonthGrid';
import { DayDetail } from '../features/attendance/components/DayDetail';
import { useRangeSchedule } from '../features/attendance/hooks/useRangeSchedule';
import { toIsoDate, firstDayOfMonth } from '../shared/lib/date';
import type { WeeklyDayShift } from '../features/attendance/types';
import { useCalendarStore } from '../store/calendarStore';
import { usePullToRefresh } from '../shared/hooks/usePullToRefresh';

export function CalendarPage() {
  const { t } = useTranslation();

  const today = new Date();
  const todayStr = toIsoDate(today);

  const {
    viewYear, viewMonth, selectedDate, weekAnchor, isCollapsed,
    setView, setSelectedDate, setWeekAnchor, setIsCollapsed, resetToToday,
  } = useCalendarStore();

  // Reset to today if stored date is in the past (stale state from a previous session)
  useEffect(() => {
    if (selectedDate < todayStr) resetToToday();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartScrollTop = useRef(0);
  const isCollapsedRef = useRef(false);

  // Keep ref in sync so gesture handlers always read current value without stale closure
  useEffect(() => { isCollapsedRef.current = isCollapsed; }, [isCollapsed]);

  // Measure full + collapsed panel heights after paint, re-run on month change
  useEffect(() => {
    if (!panelRef.current) return;
    const panel = panelRef.current;
    const id = requestAnimationFrame(() => {
      if (isCollapsedRef.current) return;
      const fullH = panel.scrollHeight;
      if (fullH === 0) return;
      panel.style.setProperty('--panel-full-h', `${fullH}px`);

      const headerEl = panel.querySelector('.cd-month-cal__header');
      const dowEl = panel.querySelector('.cd-month-cal__dow-row');
      const headerH = headerEl ? (headerEl as HTMLElement).scrollHeight : 44;
      const dowH = dowEl ? (dowEl as HTMLElement).scrollHeight : 20;
      panel.style.setProperty('--panel-collapsed-h', `${headerH + dowH + 46 + 10}px`);
    });
    return () => cancelAnimationFrame(id);
  }, [viewYear, viewMonth]);

  const rangeStart = firstDayOfMonth(viewYear, viewMonth);
  const { data, isLoading, refetch } = useRangeSchedule(rangeStart, 35);

  const { containerRef: ptrRef, onTouchStart: ptrTouchStart, onTouchEnd: ptrTouchEnd, dragOffset } = usePullToRefresh(() => refetch());

  const shiftMap = useMemo(() => {
    const map = new Map<string, WeeklyDayShift[]>();
    data?.days.forEach(d => map.set(d.date, d.shifts));
    return map;
  }, [data]);

  const selectedShifts = shiftMap.get(selectedDate) ?? [];

  function prevMonth() {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    setView(newYear, newMonth);
    const newFirst = firstDayOfMonth(newYear, newMonth);
    setSelectedDate(todayStr.startsWith(newFirst.slice(0, 7)) ? todayStr : newFirst);
  }

  function nextMonth() {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    setView(newYear, newMonth);
    const newFirst = firstDayOfMonth(newYear, newMonth);
    setSelectedDate(todayStr.startsWith(newFirst.slice(0, 7)) ? todayStr : newFirst);
  }

  // Week navigation: only move the visible week, don't change the selected date
  function shiftWeek(delta: number) {
    const d = new Date(weekAnchor + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const newIso = toIsoDate(d);
    const ny = d.getFullYear();
    const nm = d.getMonth();
    setWeekAnchor(newIso);
    if (ny !== viewYear || nm !== viewMonth) {
      setView(ny, nm);
    }
  }

  // Gesture handlers on the detail panel (collapse / expand)
  const handleDetailTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartScrollTop.current = detailRef.current?.scrollTop ?? 0;
  }, []);

  const handleDetailTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY; // positive = pulled up
    const wasAtTop = touchStartScrollTop.current === 0;
    if (!wasAtTop || Math.abs(dy) < 30) return;

    if (dy > 0 && !isCollapsedRef.current) {
      setIsCollapsed(true);
    } else if (dy < 0 && isCollapsedRef.current) {
      setIsCollapsed(false);
    }
  }, [setIsCollapsed]);

  return (
    <div className="cd-page cd-page--calendar" ref={ptrRef} onTouchStart={ptrTouchStart} onTouchEnd={ptrTouchEnd}>
      {dragOffset > 0 && (
        <div className="cd-ptr-indicator" style={{ '--ptr-progress': dragOffset / 72 } as React.CSSProperties} />
      )}
      <ScreenHeader title={t('calendar.title')} />

      <div
        ref={panelRef}
        className={`cd-month-panel${isCollapsed ? ' cd-month-panel--collapsed' : ''}`}
      >
        <MonthGrid
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          weekAnchor={weekAnchor}
          todayStr={todayStr}
          shiftMap={shiftMap}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          isCollapsed={isCollapsed}
          onWeekSwipe={shiftWeek}
        />
      </div>

      <div
        ref={detailRef}
        className="cd-month-detail-panel"
        onTouchStart={handleDetailTouchStart}
        onTouchEnd={handleDetailTouchEnd}
      >
        <DayDetail
          shifts={selectedShifts}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
