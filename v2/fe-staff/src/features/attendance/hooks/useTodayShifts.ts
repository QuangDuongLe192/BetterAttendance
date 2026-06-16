import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { useAuthStore } from '../../../store/authStore';

export function useTodayShifts() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['today-shifts'],
    queryFn: () => attendanceApi.getTodayShifts(),
    enabled: !!accessToken,
  });
}
