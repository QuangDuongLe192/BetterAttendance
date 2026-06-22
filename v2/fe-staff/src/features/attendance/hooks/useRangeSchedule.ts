import { useQueries } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { attendanceApi } from '../api/attendance.api';
import { addDays } from '../../../shared/lib/date';
import type { WeeklyDay } from '../types';

function getMondayOf(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function useRangeSchedule(rangeStart: string, numDays: number) {
  const accessToken = useAuthStore(s => s.accessToken);

  const weekStartSet = new Set<string>();
  for (let d = 0; d < numDays; d += 7) {
    weekStartSet.add(getMondayOf(addDays(rangeStart, d)));
  }
  const lastMonday = getMondayOf(addDays(rangeStart, numDays - 1));
  weekStartSet.add(lastMonday);
  const weekStarts = Array.from(weekStartSet).sort((a, b) => a.localeCompare(b));

  const results = useQueries({
    queries: weekStarts.map(ws => ({
      queryKey: ['weekly-shifts', ws],
      queryFn: () => attendanceApi.getWeeklyShifts(ws),
      enabled: !!accessToken,
      staleTime: 5 * 60_000,
    })),
  });

  const isLoading = results.some(r => r.isLoading);
  const rangeEnd = addDays(rangeStart, numDays - 1);

  const seen = new Set<string>();
  const days: WeeklyDay[] = results
    .flatMap(r => r.data?.days ?? [])
    .filter(d => {
      if (d.date < rangeStart || d.date > rangeEnd) return false;
      if (seen.has(d.date)) return false;
      seen.add(d.date);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  function refetch() {
    results.forEach(r => r.refetch());
  }

  return { data: { days }, isLoading, refetch };
}
