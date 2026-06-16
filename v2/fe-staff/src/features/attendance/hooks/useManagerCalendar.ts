import { useQuery } from '@tanstack/react-query';
import { authHeaders, request } from '../../../shared/api/http';
import type { ManagerEmployee, ManagerShift } from '../../../mocks/handlers';

export function useManagerEmployees() {
  return useQuery({
    queryKey: ['manager-employees'],
    queryFn: () =>
      request<{ employees: ManagerEmployee[] }>('/api/manager/employees', {
        headers: authHeaders(),
      }),
    staleTime: 300_000,
  });
}

export function useManagerShifts(weekStart: string) {
  return useQuery({
    queryKey: ['manager-shifts', weekStart],
    queryFn: () =>
      request<{ shifts: ManagerShift[] }>(`/api/manager/shifts?weekStart=${weekStart}`, {
        headers: authHeaders(),
      }),
    staleTime: 60_000,
  });
}
