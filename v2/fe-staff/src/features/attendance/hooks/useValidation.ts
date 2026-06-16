import { useEffect, useRef } from 'react';
import { useValidationStore, type ValidationMode } from '../../../store/validationStore';
import { haversineMeters } from '../../../shared/lib/geo';

const POLL_INTERVAL_MS = 10_000;

export function useValidation(
  mode: ValidationMode,
  geofence: { lat: number; lng: number; radiusMeters: number } | null,
) {
  const { setGeo, setMode, reset } = useValidationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);

  useEffect(() => {
    if (mode === 'none') {
      reset();
      return;
    }

    const check = () => {
      if (!geofence) {
        setGeo(null);
        return;
      }
      if (!navigator.geolocation) {
        setGeo(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = haversineMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            geofence.lat,
            geofence.lng,
          );
          setGeo(dist <= geofence.radiusMeters);
        },
        () => setGeo(false),
        { timeout: 8_000, maximumAge: 30_000 },
      );
    };

    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, geofence, setGeo, reset]);
}
