// import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import type { ClockStatus } from '../types';

interface ClockControlProps {
  shiftId: string;
  status?: ClockStatus;
  mode?: 'tap' | 'hold' | 'swipe';
  clockInTime?: string;
  clockOutTime?: string;
  totalMinutes?: number;
  isLoading?: boolean;
  errorCode?: string;
  onClockIn?: () => void;
  onClockOut?: () => void;
}

const ERROR_KEY: Record<string, string> = {
  ALREADY_CLOCKED_IN: 'attendance.error.alreadyClockedIn',
  NOT_CLOCKED_IN:     'attendance.error.notClockedIn',
  NETWORK_ERROR:      'attendance.error.networkError',
};

const formatHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}h${m}`;
};

function TapClock({ isIn, canClock, isLoading, onIn, onOut, t }: {
  isIn: boolean; canClock: boolean; isLoading?: boolean;
  onIn?: () => void; onOut?: () => void; t: ReturnType<typeof useTranslation>['t'];
}) {
  const disabled = isLoading || (!canClock && !isIn);
  return (
    <button
      className={`cd-clock cd-clock--tap${isIn ? ' cd-clock--out' : ''}${disabled ? ' cd-clock--disabled' : ''}`}
      onClick={isIn ? onOut : onIn}
      disabled={disabled}
    >
      <Icons.clock size={22} />
      <span>{isIn ? t('attendance.today.clockOut') : t('attendance.today.clockIn')}</span>
    </button>
  );
}

// function HoldClock({ isIn, canClock, isLoading, onIn, onOut, t }: {
//   isIn: boolean; canClock: boolean; isLoading?: boolean;
//   onIn?: () => void; onOut?: () => void; t: ReturnType<typeof useTranslation>['t'];
// }) {
//   const [pct, setPct] = useState(0);
//   const timer = useRef<ReturnType<typeof setInterval> | null>(null);
//   const disabled = !canClock && !isIn;

//   const start = () => {
//     if (disabled || isLoading) return;
//     let p = 0;
//     timer.current = setInterval(() => {
//       p += 4;
//       setPct(p);
//       if (p >= 100) {
//         clearInterval(timer.current!);
//         timer.current = null;
//         isIn ? onOut?.() : onIn?.();
//         setTimeout(() => setPct(0), 150);
//       }
//     }, 24);
//   };
//   const stop = () => {
//     if (timer.current) { clearInterval(timer.current); timer.current = null; }
//     if (pct < 100) setPct(0);
//   };
//   useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

//   return (
//     <button
//       className={`cd-clock cd-clock--hold${isIn ? ' cd-clock--out' : ''}${disabled ? ' cd-clock--disabled' : ''}`}
//       onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
//       onTouchStart={start} onTouchEnd={stop}
//       disabled={disabled || isLoading}
//     >
//       <div className="cd-clock__fill" style={{ width: `${pct}%` }} />
//       <div className="cd-clock__label">
//         <Icons.clock size={22} />
//         <span>{pct > 5 ? t('attendance.today.release') : (isIn ? t('attendance.today.clockOut') : t('attendance.today.holdToClockIn'))}</span>
//       </div>
//     </button>
//   );
// }

// // function SwipeClock({ isIn, canClock, isLoading, onIn, onOut, t }: {
//   isIn: boolean; canClock: boolean; isLoading?: boolean;
//   onIn?: () => void; onOut?: () => void; t: ReturnType<typeof useTranslation>['t'];
// }) {
//   const trackRef = useRef<HTMLDivElement>(null);
//   const [x, setX] = useState(0);
//   const dragging = useRef(false);
//   const startX = useRef(0);
//   const startVal = useRef(0);
//   const disabled = !canClock && !isIn;

//   const onDown = (e: React.MouseEvent | React.TouchEvent) => {
//     if (disabled || isLoading) return;
//     dragging.current = true;
//     startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     startVal.current = x;
//   };
//   const onMove = (e: MouseEvent | TouchEvent) => {
//     if (!dragging.current) return;
//     const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     const w = trackRef.current?.clientWidth ?? 300;
//     const max = w - 56;
//     setX(Math.max(0, Math.min(max, startVal.current + (cx - startX.current))));
//   };
//   const onUp = () => {
//     if (!dragging.current) return;
//     dragging.current = false;
//     const w = trackRef.current?.clientWidth ?? 300;
//     const max = w - 56;
//     if (x > max * 0.85) {
//       setX(max);
//       setTimeout(() => { isIn ? onOut?.() : onIn?.(); setX(0); }, 120);
//     } else setX(0);
//   };
//   useEffect(() => {
//     window.addEventListener('mousemove', onMove);
//     window.addEventListener('mouseup', onUp);
//     window.addEventListener('touchmove', onMove, { passive: true });
//     window.addEventListener('touchend', onUp);
//     return () => {
//       window.removeEventListener('mousemove', onMove);
//       window.removeEventListener('mouseup', onUp);
//       window.removeEventListener('touchmove', onMove);
//       window.removeEventListener('touchend', onUp);
//     };
//   });

//   return (
//     <div ref={trackRef} className={`cd-swipe${isIn ? ' cd-swipe--out' : ''}${disabled ? ' cd-swipe--disabled' : ''}`}>
//       <span className="cd-swipe__label">{isIn ? t('attendance.today.swipeToClockOut') : t('attendance.today.swipeToClockIn')}</span>
//       <div
//         className="cd-swipe__thumb"
//         style={{ transform: `translateX(${x}px)` }}
//         onMouseDown={onDown}
//         onTouchStart={onDown}
//       >
//         <Icons.arrowR size={22} />
//       </div>
//     </div>
//   );
// }

export function ClockControl({
  status = 'idle',
  mode = 'tap',
  clockInTime,
  clockOutTime,
  totalMinutes,
  isLoading = false,
  errorCode,
  onClockIn,
  onClockOut,
}: ClockControlProps) {
  const { t } = useTranslation();
  const isIn = status === 'clocked-in';
  const canClock = true; // validation chips handle the guard separately

  const errorKey = errorCode ? ERROR_KEY[errorCode] ?? 'attendance.error.generic' : null;

  const clockProps = { isIn, canClock, isLoading, onIn: onClockIn, onOut: onClockOut, t };

  return (
    <div>
      {errorKey && (
        <p style={{ fontSize: 13, color: 'var(--c-warning)', marginBottom: 10 }}>
          {t(errorKey)}
        </p>
      )}

      {status === 'clocked-out' ? (
        <div>
          <p className="cd-since">
            <Icons.check size={14} sw={2} />
            <span>{t('attendance.today.clockedOutAt', { time: clockOutTime })}</span>
            {totalMinutes !== undefined && (
              <span> · {t('attendance.today.totalHours', { hours: formatHours(totalMinutes) })}</span>
            )}
          </p>
        </div>
      ) : (
        <>
          {/* {mode === 'hold'  && <HoldClock  {...clockProps} />} */}
          {/* {mode === 'swipe' && <SwipeClock {...clockProps} />} */}
          {mode === 'tap'   && <TapClock   {...clockProps} />}
          {status === 'clocked-in' && (
            <p className="cd-since">
              <Icons.check size={14} sw={2} />
              {t('attendance.today.clockedInAt', { time: clockInTime })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
