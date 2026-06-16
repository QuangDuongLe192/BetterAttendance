import { useInfiniteQuery } from '@tanstack/react-query';
import { requestsApi } from '../api/requests.api';
import type { StatusFilter } from '../types';

export function useRequests(status: StatusFilter) {
  return useInfiniteQuery({
    queryKey: ['requests', status],
    queryFn: ({ pageParam }) =>
      requestsApi.list(status, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}
