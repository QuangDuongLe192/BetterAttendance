import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateRequest } from '../features/requests/hooks/useCreateRequest';
import { useTodayShifts } from '../features/attendance/hooks/useTodayShifts';
import { useWeeklySchedule } from '../features/attendance/hooks/useWeeklySchedule';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { SectionLabel } from '../features/requests/components/SectionLabel';
import { SubmissionSuccess } from '../features/requests/components/SubmissionSuccess';
import { ShiftSelector } from '../features/requests/components/ShiftSelector';
import type { SelectableShift } from '../features/requests/components/ShiftSelector';
import { labelStyle, inputStyle } from '../features/requests/lib/formHelpers';
import type { ApiError } from '../shared/types';

type RequestType = 'leave' | 'late' | 'early';

const TYPE_META: Record<RequestType, { color: string; accent: string; hint: string }> = {
  leave: { color: '#E6F4FF', accent: '#3b82f6', hint: 'requests.formHint.leave' },
  late:  { color: '#FFF3E0', accent: '#f59e0b', hint: 'requests.formHint.late'  },
  early: { color: '#F0FFF4', accent: '#22c55e', hint: 'requests.formHint.early' },
};

export function RequestFormPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const reqType = (type ?? 'leave') as RequestType;
  const meta = TYPE_META[reqType] ?? TYPE_META.leave;

  const [startDate, setStartDate]             = useState('');
  const [endDate, setEndDate]                 = useState('');
  const [time, setTime]                       = useState('');
  const [reason, setReason]                   = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [submitted, setSubmitted]             = useState(false);
  const [submitError, setSubmitError]         = useState('');
  const [reasonTouched, setReasonTouched]     = useState(false);
  const [shiftTouched, setShiftTouched]       = useState(false);

  const isLateOrEarly = reqType === 'late' || reqType === 'early';
  const todayIso = new Date().toISOString().slice(0, 10);

  const nextMondayIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const { data: todayData, isLoading: shiftsLoading } = useTodayShifts();
  const { data: weekData } = useWeeklySchedule(nextMondayIso);

  const upcomingShifts = useMemo((): SelectableShift[] => {
    if (!isLateOrEarly) return [];
    const from_today: SelectableShift[] = (todayData?.shifts ?? [])
      .filter(s => !s.clockOut)
      .map(s => ({
        shiftId: s.shiftId,
        date: s.date,
        start: s.start,
        end: s.end,
        locationName: s.locationName,
        roleName: s.roleName,
      }));
    const from_week: SelectableShift[] = [];
    for (const day of (weekData?.days ?? [])) {
      if (day.date <= todayIso) continue;
      for (const s of day.shifts) {
        if (s.clockOut) continue;
        from_week.push({
          shiftId: s.shiftId,
          date: day.date,
          start: s.start,
          end: s.end,
          locationName: s.locationName,
          roleName: s.roleName,
        });
      }
    }
    return [...from_today, ...from_week];
  }, [isLateOrEarly, todayData, weekData, todayIso]);

  const canSubmit = isLateOrEarly
    ? selectedShiftId !== '' && reason.trim().length > 0
    : startDate.length > 0 && endDate.length > 0 && reason.trim().length > 0;

  const createRequest = useCreateRequest();

  const handleShiftSelect = (shift: SelectableShift) => {
    setSelectedShiftId(shift.shiftId);
    setStartDate(shift.date);
    setSubmitError('');
  };

  const handleSubmit = async () => {
    setReasonTouched(true);
    if (isLateOrEarly) setShiftTouched(true);
    if (!canSubmit) return;
    const payload = reqType === 'leave'
      ? { type: 'leave' as const, startDate, endDate, reason }
      : { type: reqType as 'late' | 'early', startDate, time, reason };
    try {
      await createRequest.mutateAsync(payload);
      setSubmitted(true);
      setTimeout(() => navigate('/requests', { replace: true, state: { tab: 'history' } }), 1600);
    } catch (err) {
      const apiErr = err as ApiError;
      setSubmitError(apiErr?.messageKey ?? 'error.generic');
    }
  };

  if (submitted) return <SubmissionSuccess />;

  return (
    <div className="cd-page">
      <ScreenHeader title={t(`requests.types.${reqType}`)} />

      {/* Type banner */}
      <div style={{
        background: meta.color,
        border: '1px solid rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${meta.accent}`,
        borderRadius: 'var(--r-lg)', padding: '14px 16px',
        marginBottom: 20,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
          {t(`requests.types.${reqType}`)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>
          {t(meta.hint)}
        </div>
      </div>

      {isLateOrEarly ? (
        <>
          <SectionLabel>{t('requests.section.shift')}</SectionLabel>
          <div style={{ marginBottom: 20 }}>
            <ShiftSelector
              shifts={upcomingShifts}
              selectedId={selectedShiftId}
              onChange={handleShiftSelect}
              touched={shiftTouched}
              isLoading={shiftsLoading}
              accent={meta.accent}
              accentBg={meta.color}
            />
          </div>

          <SectionLabel>{t('requests.section.time')}</SectionLabel>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 20,
          }}>
            <div style={{ padding: '16px 18px' }}>
              <label style={labelStyle}>{t('requests.form.time')}</label>
              <input
                type="time" value={time}
                onChange={e => setTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <SectionLabel>{t('requests.section.time')}</SectionLabel>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 20,
          }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line-2)' }}>
              <label style={labelStyle}>{t('requests.form.startDate')}</label>
              <input
                type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ padding: '16px 18px' }}>
              <label style={labelStyle}>{t('requests.form.endDate')}</label>
              <input
                type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </>
      )}

      <SectionLabel>{t('requests.section.reason')}</SectionLabel>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{ padding: '16px 18px' }}>
          <textarea
            className="cd-textarea"
            rows={4}
            placeholder={t('requests.form.reasonPlaceholder')}
            value={reason}
            onChange={e => { setReason(e.target.value); setSubmitError(''); }}
            onBlur={() => setReasonTouched(true)}
            style={{ border: 'none', outline: 'none', padding: 0, borderRadius: 0, resize: 'none', fontFamily: 'var(--font-body, inherit)', fontSize: 15 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            {reasonTouched && reason.trim().length === 0 ? (
              <span style={{ fontSize: 12, color: 'var(--c-danger)' }}>
                {t('requests.form.reason')} {t('common.isRequired', 'is required')}
              </span>
            ) : <span />}
            <span style={{ fontSize: 12, color: reason.length > 0 ? 'var(--fg-3)' : 'transparent' }}>
              {reason.length} {t('common.characters')}
            </span>
          </div>
        </div>
      </div>

      {submitError && (
        <div style={{
          marginBottom: 12, padding: '10px 14px',
          background: 'var(--c-danger-bg, #fff1f0)', border: '1px solid var(--c-danger, #ff4d4f)',
          borderRadius: 'var(--r-lg)', fontSize: 13, color: 'var(--c-danger, #cf1322)',
        }}>
          {t(submitError, { defaultValue: t('error.generic') })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
        <button
          className="cd-btn"
          style={{ flex: 1, border: '1px solid var(--line-1)', background: 'transparent', color: 'var(--fg-2)', minHeight: 52 }}
          onClick={() => navigate(-1)}
        >
          {t('requests.form.cancel')}
        </button>
        <button
          className="cd-btn cd-btn--primary"
          style={{ flex: 2, opacity: canSubmit ? 1 : 0.4, minHeight: 52 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {t('requests.form.submit')}
        </button>
      </div>
    </div>
  );
}
