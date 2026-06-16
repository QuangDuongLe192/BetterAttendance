import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'staff' | 'manager' | 'admin';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role?: UserRole;
}

interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
  user: UserInfo | null;
  role: UserRole | null;
  setToken: (token: string, expiresAt: number) => void;
  setAuth: (userId: string, accessToken: string) => void;
  setUser: (user: UserInfo | null) => void;
  setRole: (role: UserRole | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      user: null,
      role: null,
      setToken: (token, expiresAt) => set({ accessToken: token, expiresAt }),
      setAuth: (_userId, accessToken) => set({ accessToken }),
      setUser: (user) => set({ user, role: user?.role ?? null }),
      setRole: (role) => set({ role }),
      clearAuth: () => set({ accessToken: null, expiresAt: null, user: null, role: null }),
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        role: state.role,
      }),
    },
  ),
);
