import { useAuthStore } from '../../store/authStore';
import type { ApiError } from '../types';

export function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T>(url: string, options?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      const err: ApiError = await res.json().catch(() => ({
        code: res.status === 401 ? 'UNAUTHORIZED' : res.status === 403 ? 'FORBIDDEN' : 'UNKNOWN',
        messageKey: res.status === 401 ? 'error.token_expired' : res.status === 403 ? 'error.forbidden' : 'error.generic',
      }));
      if (res.status === 401) {
        useAuthStore.getState().clearAuth();
      }
      throw err;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw { code: 'TIMEOUT', messageKey: 'error.timeout' } as ApiError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
