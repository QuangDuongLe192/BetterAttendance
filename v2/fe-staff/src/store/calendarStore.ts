import { create } from 'zustand';
import { toIsoDate } from '../shared/lib/date';

interface CalendarState {
  viewYear: number;
  viewMonth: number;
  selectedDate: string;
  weekAnchor: string;
  isCollapsed: boolean;
  setView: (year: number, month: number) => void;
  setSelectedDate: (date: string) => void;
  setWeekAnchor: (date: string) => void;
  setIsCollapsed: (v: boolean) => void;
  resetToToday: () => void;
}

const now = new Date();

export const useCalendarStore = create<CalendarState>((set) => ({
  viewYear: now.getFullYear(),
  viewMonth: now.getMonth(),
  selectedDate: toIsoDate(now),
  weekAnchor: toIsoDate(now),
  isCollapsed: false,

  setView: (year, month) => set({ viewYear: year, viewMonth: month }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setWeekAnchor: (date) => set({ weekAnchor: date }),
  setIsCollapsed: (v) => set({ isCollapsed: v }),
  resetToToday: () => {
    const today = new Date();
    const iso = toIsoDate(today);
    set({
      viewYear: today.getFullYear(),
      viewMonth: today.getMonth(),
      selectedDate: iso,
      weekAnchor: iso,
    });
  },
}));
