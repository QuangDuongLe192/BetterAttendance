import { useQuery } from '@tanstack/react-query';
import { requestsApi } from '../api/requests.api';

export function useRequestDetail(id: string) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => requestsApi.detail(id),
    staleTime: 60_000,
  });
}
