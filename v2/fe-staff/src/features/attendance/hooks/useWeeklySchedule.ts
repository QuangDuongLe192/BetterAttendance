import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { useAuthStore } from '../../../store/authStore';

export function useWeeklySchedule(weekStart: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['weekly-shifts', weekStart],
    queryFn: () => attendanceApi.getWeeklyShifts(weekStart),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });
}
