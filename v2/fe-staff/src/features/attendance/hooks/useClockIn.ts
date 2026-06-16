import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { ClockInRequest } from '../types';

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ClockInRequest) => attendanceApi.clockIn(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-shifts'] });
      qc.invalidateQueries({ queryKey: ['earnings'], exact: false });
    },
  });
}
