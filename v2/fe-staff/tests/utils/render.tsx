import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  token?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { token = 'test-token', ...renderOptions }: WrapperOptions & RenderOptions = {},
) {
  // Seed authStore with a token so authenticated hooks fire.
  if (token) {
    // Dynamic import is not available at module level in ESM test context;
    // callers should seed authStore directly if needed.
  }

  const qc = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient: qc };
}
