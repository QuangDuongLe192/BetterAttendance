import { useQuery } from '@tanstack/react-query';
import { authHeaders, request } from '../../../shared/api/http';
import { useAuthStore } from '../../../store/authStore';

export interface ShiftDetailDto {
  shiftId: string;
  date: string;
  locationName: string;
  address: string;
  roleName: string;
  start: number;
  end: number;
  status: 'scheduled' | 'in' | 'completed' | 'absent' | 'cancelled';
  clockIn: number | null;
  clockOut: number | null;
  managerName: string;
  expectedPayVnd: number;
  breakWindow?: string;
}

export function useShiftDetail(shiftId: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['shift-detail', shiftId],
    queryFn: () => request<ShiftDetailDto>(`/api/shifts/${shiftId}`, { headers: authHeaders() }),
    enabled: !!accessToken && !!shiftId,
  });
}
