import { create } from 'zustand';

export type ValidationMode = 'geo' | 'none';

interface ValidationState {
  geoOk: boolean | null;
  mode: ValidationMode;
  setGeo: (ok: boolean | null) => void;
  setMode: (mode: ValidationMode) => void;
  reset: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  geoOk: null,
  mode: 'none',
  setGeo: (ok) => set({ geoOk: ok }),
  setMode: (mode) => set({ mode }),
  reset: () => set({ geoOk: null, mode: 'none' }),
}));

/** Returns true when the device satisfies the shift's validation requirements. */
export function canClockIn(
  geoOk: boolean | null,
  mode: ValidationMode,
): boolean {
  if (mode === 'none') return true;
  return geoOk !== false;
}
