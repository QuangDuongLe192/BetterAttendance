import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await authApi.me();
      setUser({ id: data.id, name: data.name, email: data.email, avatar: data.avatar, role: data.role });
      return data;
    },
    enabled: !!accessToken,
    staleTime: Infinity,
    retry: false,
  });
}
