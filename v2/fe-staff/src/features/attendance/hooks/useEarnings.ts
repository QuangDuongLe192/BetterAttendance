import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { useAuthStore } from '../../../store/authStore';

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useEarnings(month: string) {
  const accessToken = useAuthStore(s => s.accessToken);
  return useQuery({
    queryKey: ['earnings', month],
    queryFn: () => attendanceApi.getEarnings(month),
    enabled: !!accessToken,
  });
}
