import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth, type AccessRow } from './AuthContext';

interface Props {
  children: ReactNode;
  roles?: AccessRow['type'][];
}

export function RequireAuth({ children, roles }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !user.access.some(a => roles.includes(a.type))) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
