import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (code: string) => authApi.login({ code }),
    onSuccess: (data) => {
      setToken(data.token, data.expiresAt);
    },
  });
}
