import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

// Provide a localStorage stub so Zustand's persist middleware works in Node/jsdom.
const _storage: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (k) => _storage[k] ?? null,
  setItem: (k, v) => { _storage[k] = String(v); },
  removeItem: (k) => { delete _storage[k]; },
  clear: () => { Object.keys(_storage).forEach(k => delete _storage[k]); },
  key: (i) => Object.keys(_storage)[i] ?? null,
  get length() { return Object.keys(_storage).length; },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Stub browser APIs not available in jsdom
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});
