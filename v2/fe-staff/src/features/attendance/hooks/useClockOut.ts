import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { ClockOutRequest } from '../types';

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ClockOutRequest) => attendanceApi.clockOut(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-shifts'] });
      qc.invalidateQueries({ queryKey: ['earnings'], exact: false });
    },
  });
}
