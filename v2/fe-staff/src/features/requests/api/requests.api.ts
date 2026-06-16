import { authHeaders, request } from '../../../shared/api/http';
import type { CreateRequestPayload, RequestDto, RequestsResponse, StatusFilter } from '../types';

const BASE = '/api/requests';

export const requestsApi = {
  list: (status: StatusFilter, cursor?: string) => {
    const params = new URLSearchParams({ status });
    if (cursor) params.set('cursor', cursor);
    return request<RequestsResponse>(`${BASE}?${params}`, {
      headers: authHeaders(),
    });
  },

  detail: (id: string) =>
    request<RequestDto>(`${BASE}/${id}`, { headers: authHeaders() }),

  create: (body: CreateRequestPayload, idempotencyKey: string) =>
    request<RequestDto>(BASE, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'X-Idempotency-Key': idempotencyKey,
      } as HeadersInit,
      body: JSON.stringify(body),
    }),
};
