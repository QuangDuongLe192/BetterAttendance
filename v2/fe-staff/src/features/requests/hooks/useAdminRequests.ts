import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminRequestsApi } from '../api/admin-requests.api';

export function useAdminRequests(tab: 'pending' | 'history') {
  return useQuery({
    queryKey: ['admin-requests', tab],
    queryFn: () => adminRequestsApi.list(tab),
    staleTime: 30_000,
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewComment }: { id: string; reviewComment?: string }) =>
      adminRequestsApi.approve(id, reviewComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewComment }: { id: string; reviewComment?: string }) =>
      adminRequestsApi.reject(id, reviewComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
  });
}

export function useAdminRequestDetail(id: string) {
  return useQuery({
    queryKey: ['admin-request', id],
    queryFn: () => adminRequestsApi.getDetail(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}
