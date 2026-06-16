import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Icons } from '../shared/components/Icons';
import { useClockIn } from '../features/attendance/hooks/useClockIn';
import { useClockOut } from '../features/attendance/hooks/useClockOut';
import { haversineMeters } from '../shared/lib/geo';
import type { TodayShiftsResponse } from '../features/attendance/types';
import { formatShiftTime } from '../shared/lib/shift';

type CheckState = 'checking' | 'success' | 'failed' | 'no-geofence';

function generateKey() {
  return crypto.randomUUID();
}

export function GpsCheckPage() {
  const { shiftId, action } = useParams<{ shiftId: string; action: 'in' | 'out' }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const idempotencyKeyRef = useRef(generateKey());

  const [state, setState] = useState<CheckState>('checking');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const cachedData = qc.getQueryData<TodayShiftsResponse>(['today-shifts']);
  const shift = cachedData?.shifts.find((s) => s.shiftId === shiftId);

  const runGpsCheck = useCallback(() => {
    setState('checking');
    setDistanceMeters(null);

    if (!shift?.geofence) {
      setState('no-geofence');
      return;
    }

    if (!navigator.geolocation) {
      setState('failed');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          shift.geofence!.lat,
          shift.geofence!.lng,
        );
        setDistanceMeters(Math.round(dist));
        setState(dist <= shift.geofence!.radiusMeters ? 'success' : 'failed');
      },
      () => setState('failed'),
      { timeout: 10_000, maximumAge: 0 },
    );
  }, [shift]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { runGpsCheck(); }, [runGpsCheck]);

  const handleConfirm = useCallback(() => {
    if (!shiftId) return;
    const key = idempotencyKeyRef.current;
    const onSuccess = () => {
      idempotencyKeyRef.current = generateKey();
      navigate('/');
    };

    if (action === 'in') {
      clockIn.mutate({ shiftId, idempotencyKey: key }, { onSuccess });
    } else {
      clockOut.mutate({ shiftId, idempotencyKey: key }, { onSuccess });
    }
  }, [action, shiftId, clockIn, clockOut, navigate]);

  const isPending = clockIn.isPending || clockOut.isPending;
  const mutationError = (clockIn.error ?? clockOut.error) as { code?: string } | null;
  const errorMsgKey = mutationError?.code
    ? `error.${mutationError.code.toLowerCase()}`
    : mutationError
    ? 'error.generic'
    : null;

  const confirmLabel =
    action === 'in' ? t('gpsCheck.confirmClockIn') : t('gpsCheck.confirmClockOut');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--line-2)',
        background: 'var(--bg-surface)',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-1)' }}>
          {action === 'in' ? t('attendance.today.holdToCheckIn') : t('attendance.today.holdToCheckOut')}
        </span>
      </div>

      {/* Shift info */}
      {shift && (
        <div style={{
          margin: '16px 16px 0',
          padding: '12px 14px',
          borderRadius: 'var(--r-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--line-2)',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <Icons.clock size={16} sw={2} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
              {formatShiftTime(shift.start, 'vi')} — {formatShiftTime(shift.end, 'vi')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
              {shift.locationName}
            </div>
          </div>
        </div>
      )}

      {/* GPS Check Card */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
        gap: 24,
      }}>

        {/* Status icon */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: state === 'success'
            ? 'var(--c-success-bg)'
            : state === 'failed'
            ? 'var(--c-danger-bg)'
            : 'var(--c-teal-light)',
          transition: 'background 0.25s',
        }}>
          {state === 'checking' && (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid var(--c-teal-light)',
              borderTopColor: 'var(--c-teal)',
              animation: 'gps-spin 0.8s linear infinite',
            }} />
          )}
          {state === 'success' && (
            <Icons.check size={40} sw={2.5} style={{ color: 'var(--c-success)' }} />
          )}
          {(state === 'failed' || state === 'no-geofence') && (
            <Icons.pin size={40} sw={2} style={{ color: 'var(--c-danger)' }} />
          )}
        </div>

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          {state === 'checking' && (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-1)' }}>
                {t('gpsCheck.checking')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 6 }}>
                {t('gpsCheck.checkingSub')}
              </div>
            </>
          )}
          {state === 'success' && (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--c-success)' }}>
                {t('gpsCheck.success')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 6 }}>
                {t('gpsCheck.successSub')}
              </div>
            </>
          )}
          {state === 'failed' && (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--c-danger)' }}>
                {t('gpsCheck.failed')}
              </div>
              {distanceMeters !== null && (
                <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 6 }}>
                  {t('gpsCheck.failedSub', { distance: distanceMeters })}
                </div>
              )}
            </>
          )}
          {state === 'no-geofence' && (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-1)' }}>
                {t('gpsCheck.success')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 6 }}>
                {t('gpsCheck.successSub')}
              </div>
            </>
          )}
        </div>

        {/* Mutation error */}
        {errorMsgKey && (
          <div style={{
            padding: '10px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--c-danger-bg)',
            border: '1px solid rgba(124,29,29,0.15)',
            fontSize: 13, color: 'var(--c-danger)', textAlign: 'center',
          }}>
            {t(errorMsgKey, { defaultValue: t('error.generic') })}
          </div>
        )}

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(state === 'success' || state === 'no-geofence') && (
            <button
              onClick={handleConfirm}
              disabled={isPending}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--r-xl)',
                border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
                background: isPending ? 'var(--c-gray-light)' : 'var(--c-teal)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                transition: 'background 0.15s',
              }}
            >
              {isPending ? '...' : confirmLabel}
            </button>
          )}

          {state === 'failed' && (
            <button
              onClick={runGpsCheck}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--r-xl)',
                border: 'none', cursor: 'pointer',
                background: 'var(--c-teal)',
                color: '#fff', fontSize: 15, fontWeight: 600,
              }}
            >
              {t('gpsCheck.retry')}
            </button>
          )}

          {state !== 'checking' && (
            <button
              onClick={() => navigate(-1)}
              disabled={isPending}
              style={{
                width: '100%', padding: '13px', borderRadius: 'var(--r-xl)',
                border: '1.5px solid var(--line-1)', cursor: 'pointer',
                background: 'transparent',
                color: 'var(--fg-2)', fontSize: 15, fontWeight: 500,
              }}
            >
              {t('gpsCheck.back')}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gps-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
