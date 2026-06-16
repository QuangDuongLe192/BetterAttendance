import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { requestsApi } from '../api/requests.api';
import type { CreateRequestPayload } from '../types';

function generateKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useCreateRequest() {
  const qc = useQueryClient();
  // Key is generated once per hook mount and rotated after each successful
  // submission so retries of the same attempt reuse the same key.
  const keyRef = useRef(generateKey());

  return useMutation({
    mutationFn: (payload: CreateRequestPayload) =>
      requestsApi.create(payload, keyRef.current),
    onSuccess: () => {
      keyRef.current = generateKey();
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
