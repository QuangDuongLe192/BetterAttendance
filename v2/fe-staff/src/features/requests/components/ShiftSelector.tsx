import { useTranslation } from 'react-i18next';
import { formatShiftDate } from '../lib/formHelpers';
import { formatShiftTime } from '../../../shared/lib/shift';

export interface SelectableShift {
  shiftId: string;
  date: string;
  start: number;
  end: number;
  locationName: string;
  roleName: string;
}

export function ShiftSelector({
  shifts,
  selectedId,
  onChange,
  touched,
  isLoading,
  accent,
  accentBg,
}: {
  shifts: SelectableShift[];
  selectedId: string;
  onChange: (shift: SelectableShift) => void;
  touched: boolean;
  isLoading: boolean;
  accent: string;
  accentBg: string;
}) {
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return (
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
        borderRadius: 'var(--r-lg)', padding: '20px 18px',
        color: 'var(--fg-3)', fontSize: 14, textAlign: 'center',
      }}>
        …
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
        borderRadius: 'var(--r-lg)', padding: '20px 18px',
        color: 'var(--fg-3)', fontSize: 14, textAlign: 'center',
      }}>
        {t('requests.form.noUpcomingShifts')}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shifts.map(shift => {
          const selected = shift.shiftId === selectedId;
          return (
            <button
              key={shift.shiftId}
              onClick={() => onChange(shift)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                padding: '14px 16px', textAlign: 'left',
                background: selected ? accentBg : 'var(--bg-surface)',
                border: `1.5px solid ${selected ? accent : 'var(--line-1)'}`,
                borderRadius: 'var(--r-lg)',
                cursor: 'pointer', width: '100%',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 14, color: selected ? accent : 'var(--fg-1)',
                }}>
                  {formatShiftDate(shift.date, i18n.language)}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: 14, color: 'var(--fg-1)',
                }}>
                  {formatShiftTime(shift.start, i18n.language)} – {formatShiftTime(shift.end, i18n.language)}
                </span>
                {selected && (
                  <span style={{
                    marginLeft: 'auto', width: 18, height: 18,
                    borderRadius: '50%', background: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                {shift.locationName} · {shift.roleName}
              </div>
            </button>
          );
        })}
      </div>
      {touched && selectedId === '' && (
        <p style={{ fontSize: 12, color: 'var(--c-danger)', marginTop: 6, marginBottom: 0 }}>
          {t('requests.form.selectShift')} {t('common.isRequired', 'is required')}
        </p>
      )}
    </>
  );
}
