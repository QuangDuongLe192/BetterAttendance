import { authHeaders, request } from '../../../shared/api/http';
import type { AdminRequestDto } from '../../../mocks/handlers';

const BASE = '/api/admin/requests';

export const adminRequestsApi = {
  list: (tab: 'pending' | 'history') =>
    request<{ requests: AdminRequestDto[] }>(`${BASE}?tab=${tab}`, {
      headers: authHeaders(),
    }),

  approve: (id: string, reviewComment?: string) =>
    request<AdminRequestDto>(`${BASE}/${id}/approve`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reviewComment }),
    }),

  reject: (id: string, reviewComment?: string) =>
    request<AdminRequestDto>(`${BASE}/${id}/reject`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reviewComment }),
    }),

  getDetail: (id: string) =>
    request<AdminRequestDto>(`${BASE}/${id}`, {
      headers: authHeaders(),
    }),
};
