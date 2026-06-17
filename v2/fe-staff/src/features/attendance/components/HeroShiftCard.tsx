import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { useClockIn } from '../hooks/useClockIn';
import { useClockOut } from '../hooks/useClockOut';
import { useValidation } from '../hooks/useValidation';
import { useValidationStore, canClockIn } from '../../../store/validationStore';
import type { ShiftItemDto } from '../types';
import { formatMinutes } from '../../../shared/lib/date';
import { formatShiftTime } from '../../../shared/lib/shift';

function generateKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ShiftCtaProps {
  isMissed: boolean;
  isClockedOut: boolean;
  isOverdue: boolean;
  isClockedIn: boolean;
  needsGpsPage: boolean;
  canClock: boolean;
  clockInPending: boolean;
  clockOutPending: boolean;
  endLabel: string;
  onClockIn: () => void;
  onClockOut: () => void;
  t: (k: string, opts?: Record<string, unknown>) => string;
}

function ShiftCta({
  isMissed, isClockedOut, isOverdue, isClockedIn,
  needsGpsPage, canClock, clockInPending, clockOutPending,
  endLabel, onClockIn, onClockOut, t,
}: ShiftCtaProps) {
  if (isMissed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,80,80,0.12)' }}>
        <Icons.alert size={16} sw={2} style={{ color: 'var(--c-danger, #ff5252)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-danger, #ff5252)' }}>{t('attendance.today.missedShift')}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{t('attendance.today.missedShiftSub')}</div>
        </div>
      </div>
    );
  }
  if (isClockedOut) return null;
  if (isOverdue && isClockedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icons.alert size={13} sw={2} style={{ flexShrink: 0, color: '#ff4444' }} />
          {t('attendance.today.shiftEndedPrompt', { time: endLabel })}
        </span>
        <button
          className={`cd-hold-btn${clockOutPending ? ' cd-hold-btn--disabled' : ''}`}
          disabled={clockOutPending}
          style={{ background: 'rgba(30,45,61,0.3)' }}
          onClick={onClockOut}
        >
          <span className="cd-hold-btn__label">
            {clockOutPending ? '…' : t('attendance.today.holdToCheckOut')}
          </span>
        </button>
      </div>
    );
  }
  if (isClockedIn) {
    return (
      <button
        className={`cd-hold-btn${clockOutPending ? ' cd-hold-btn--disabled' : ''}`}
        disabled={clockOutPending}
        style={{ background: 'rgba(30,45,61,0.3)' }}
        onClick={onClockOut}
      >
        <span className="cd-hold-btn__label">
          {clockOutPending ? '…' : t('attendance.today.holdToCheckOut')}
        </span>
      </button>
    );
  }
  const clockInDisabled = !needsGpsPage && !canClock;
  return (
    <button
      className={`cd-hold-btn${clockInDisabled ? ' cd-hold-btn--disabled' : ''}`}
      disabled={clockInDisabled}
      onClick={onClockIn}
    >
      <span className="cd-hold-btn__label">
        {clockInPending ? '…' : clockInDisabled ? t('validation.outOfRange') : t('attendance.today.holdToCheckIn')}
      </span>
    </button>
  );
}

export function HeroShiftCard({ shift }: { shift: ShiftItemDto }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const clockInKeyRef = useRef(generateKey());
  const clockOutKeyRef = useRef(generateKey());

  const geofence = shift.geofence;

  useValidation(shift.validationMode, geofence);

  const { geoOk, mode } = useValidationStore();
  const canClock = canClockIn(geoOk, mode);

  const isClockedIn = !!shift.clockIn && !shift.clockOut;
  const isClockedOut = !!shift.clockIn && !!shift.clockOut;

  const [now] = useState(() => Date.now());
  const isOverdue = isClockedIn && now > shift.end;
  const isMissed = !shift.clockIn && now > shift.end;

  const needsGpsPage = shift.validationMode === 'geo';

  const handleClockIn = useCallback(() => {
    if (needsGpsPage) {
      navigate(`/clock/${shift.shiftId}/in`);
      return;
    }
    clockIn.mutate(
      { shiftId: shift.shiftId, idempotencyKey: clockInKeyRef.current },
      { onSuccess: () => { clockInKeyRef.current = generateKey(); } },
    );
  }, [needsGpsPage, navigate, clockIn, shift.shiftId]);

  const handleClockOut = useCallback(() => {
    if (needsGpsPage) {
      navigate(`/clock/${shift.shiftId}/out`);
      return;
    }
    clockOut.mutate(
      { shiftId: shift.shiftId, idempotencyKey: clockOutKeyRef.current },
      { onSuccess: () => { clockOutKeyRef.current = generateKey(); } },
    );
  }, [needsGpsPage, navigate, clockOut, shift.shiftId]);

  const errorCode = (clockIn.error ?? clockOut.error) as { code?: string } | null;
  const errorMsgKey = errorCode?.code ? `error.${errorCode.code.toLowerCase()}` : null;

  const clockInTime = shift.clockIn
    ? new Date(shift.clockIn).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
    : null;
  const clockOutTime = shift.clockOut
    ? new Date(shift.clockOut).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
    : null;

  const startLabel = formatShiftTime(shift.start, i18n.language);
  const endLabel = formatShiftTime(shift.end, i18n.language);

  const cardClass = `cd-hero-card${isClockedIn ? ' cd-hero-card--in' : isClockedOut ? ' cd-hero-card--done' : isMissed ? ' cd-hero-card--missed' : ''}`;

  return (
    <div className={cardClass}>
      {/* Chips + detail link — single row */}
      <div className="cd-hero-card__chips" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
          <span className="cd-hero-chip">
            <Icons.user size={10} sw={2} />{shift.roleName}
          </span>
          <span className="cd-hero-chip">
            <Icons.pin size={10} sw={2} />{shift.locationName}
          </span>
        </div>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 3,
            color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500,
            padding: '14px 0 14px 8px', margin: '-14px 0 -14px',
          }}
          onClick={() => navigate(`/shifts/${shift.shiftId}`)}
        >
          {t('attendance.today.viewDetail')} <Icons.chevR size={9} sw={2} />
        </button>
      </div>

      {/* Time */}
      <div className="cd-hero-time">
        {startLabel}
        <span className="cd-hero-time__dash">—</span>
        {endLabel}
      </div>

      {/* Clocked-in timestamp */}
      {isClockedIn && clockInTime && (
        <div className="cd-hero-since">
          <Icons.check size={13} sw={2.5} />
          {t('attendance.today.clockedInAt', { time: clockInTime })}
        </div>
      )}

      {/* Both timestamps when done */}
      {isClockedOut && (
        <div style={{ marginBottom: 8 }}>
          <div className="cd-hero-since">
            <Icons.check size={13} sw={2.5} />
            {t('attendance.today.clockedInAt', { time: clockInTime })}
          </div>
          <div className="cd-hero-since" style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            <Icons.check size={13} sw={2.5} />
            {t('attendance.today.clockedOutAt', { time: clockOutTime })}
          </div>
          {clockOut.data && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              {t('attendance.today.totalHours', { hours: formatMinutes(clockOut.data.totalMinutes) })}
            </div>
          )}
        </div>
      )}

      {/* Geo validation chip */}
      {shift.validationMode === 'geo' && !isClockedOut && (
        <div className="cd-hero-val">
          <span className={`cd-hero-val-chip${geoOk ? ' cd-hero-val-chip--ok' : ' cd-hero-val-chip--warn'}`}>
            <Icons.pin size={11} sw={2} />
            {geoOk ? t('validation.inRange') : t('validation.outRange')}
          </span>
        </div>
      )}

      {/* Error */}
      {errorMsgKey && (
        <p style={{ fontSize: 13, color: 'rgba(255,220,100,0.95)', marginBottom: 10, marginTop: 0 }}>
          {t(errorMsgKey, { defaultValue: t('error.generic') })}
        </p>
      )}

      {/* CTA */}
      <ShiftCta
        isMissed={isMissed}
        isClockedOut={isClockedOut}
        isOverdue={isOverdue}
        isClockedIn={isClockedIn}
        needsGpsPage={needsGpsPage}
        canClock={canClock}
        clockInPending={clockIn.isPending}
        clockOutPending={clockOut.isPending}
        endLabel={endLabel}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        t={t}
      />
    </div>
  );
}
