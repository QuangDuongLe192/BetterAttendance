import type { UserRole } from '../../../store/authStore';

export interface LoginRequest {
  code: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: number;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
}
