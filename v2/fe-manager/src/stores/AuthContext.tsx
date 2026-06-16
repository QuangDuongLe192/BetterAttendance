import { createContext, useContext, useState, type ReactNode } from 'react';
import { authStore } from './useAuthStore';

export interface AccessRow {
  type: 'ADMIN' | 'MANAGER' | 'FINANCE';
  locationId: string | null;
  canAssignRoles: boolean;
}

export interface CurrentUser {
  openId: string;      // Lark open_id
  name: string;        // Lark display name (họ tên đầy đủ)
  avatarUrl: string;   // Lark avatar URL — dùng <img>, fallback về initials nếu rỗng/lỗi
  title: string;       // chức danh (Lark job_title hoặc backend)
  org: string;         // tên công ty / chi nhánh (từ backend)
  access: AccessRow[]; // quyền truy cập (từ backend)
}

// Tách 2 ký tự đầu của từ đầu và từ cuối: "Trần Khôi Nguyên" → "TN"
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AuthContextValue {
  user: CurrentUser | null;
  loginWithToken: (token: string, expiresAt: number, asUser?: CurrentUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'ba_user';

// Mock user với shape đúng Lark — thay bằng API call khi backend sẵn sàng
const MOCK_USER: CurrentUser = {
  openId: 'lark_user_008',
  name: 'Hoàng Việt Hùng',
  avatarUrl: '',
  title: 'Quản trị viên hệ thống',
  org: 'Better Coffee Co.',
  access: [{ type: 'ADMIN', locationId: null, canAssignRoles: false }],
};

function resolveInitialUser(): CurrentUser | null {
  if (!authStore.get()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : MOCK_USER;
  } catch {
    return MOCK_USER;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(resolveInitialUser);

  const loginWithToken = (token: string, expiresAt: number, asUser: CurrentUser = MOCK_USER) => {
    authStore.set(token, expiresAt);
    localStorage.setItem(USER_KEY, JSON.stringify(asUser));
    setUser(asUser);
  };

  const logout = () => {
    authStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
