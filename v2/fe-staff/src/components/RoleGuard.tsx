import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

interface RoleGuardProps {
  allow: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role);
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
