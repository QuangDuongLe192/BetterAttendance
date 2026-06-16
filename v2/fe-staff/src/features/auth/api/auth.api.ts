import { authHeaders, request } from '../../../shared/api/http';
import type { LoginRequest, LoginResponse, MeResponse } from '../types';

const BASE = '/api/auth';

export const authApi = {
  login: (body: LoginRequest) =>
    request<LoginResponse>(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  me: () =>
    request<MeResponse>('/api/me', { headers: authHeaders() }),
};
