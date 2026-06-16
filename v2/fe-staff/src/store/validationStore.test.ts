import { describe, it, expect, beforeEach } from 'vitest';
import { canClockIn, useValidationStore } from './validationStore';

describe('canClockIn', () => {
  it('mode=none → always true', () => {
    expect(canClockIn(false, 'none')).toBe(true);
  });

  it('mode=geo, geoOk=true → true', () => {
    expect(canClockIn(true, 'geo')).toBe(true);
  });

  it('mode=geo, geoOk=false → false', () => {
    expect(canClockIn(false, 'geo')).toBe(false);
  });

  it('mode=geo, geoOk=null (unknown) → true (not blocking)', () => {
    expect(canClockIn(null, 'geo')).toBe(true);
  });
});

describe('validationStore', () => {
  beforeEach(() => {
    useValidationStore.getState().reset();
  });

  it('initialises with null and mode=none', () => {
    const s = useValidationStore.getState();
    expect(s.geoOk).toBeNull();
    expect(s.mode).toBe('none');
  });

  it('setGeo updates geoOk', () => {
    useValidationStore.getState().setGeo(false);
    expect(useValidationStore.getState().geoOk).toBe(false);
  });

  it('reset clears all', () => {
    useValidationStore.getState().setGeo(true);
    useValidationStore.getState().reset();
    const s = useValidationStore.getState();
    expect(s.geoOk).toBeNull();
    expect(s.mode).toBe('none');
  });
});
