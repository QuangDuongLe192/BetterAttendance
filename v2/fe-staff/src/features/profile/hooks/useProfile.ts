import { useAuthStore } from '../../../store/authStore';

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const name = user?.name ?? '';
  const initials = name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('');

  return { user, userId: user?.id ?? null, role, name, initials, clearAuth };
}
