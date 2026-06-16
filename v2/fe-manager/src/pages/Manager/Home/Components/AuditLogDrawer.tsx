import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../../components/Icons';
import { AUDIT_LOG, fmtHHMM } from '../../../../services/manager';
import type { ActivityEntry } from '../../../../services/manager';

interface Props {
  open: boolean;
  onClose: () => void;
  activeStore: string;
}

// Real system date — for calendar "today" highlight and future-date gating
const _now        = new Date();
const TODAY_STR   = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;
const TODAY_YEAR  = _now.getFullYear();
const TODAY_MONTH = _now.getMonth(); // 0-indexed

// Default selected date = most recent date that has data
const _sortedDates    = Object.keys(AUDIT_LOG).sort();
const LAST_DATA_DATE  = _sortedDates[_sortedDates.length - 1] ?? TODAY_STR;
const [_ldy, _ldm]    = LAST_DATA_DATE.split('-').map(Number);
const LAST_DATA_YEAR  = _ldy;
const LAST_DATA_MONTH = _ldm - 1; // 0-indexed

const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HDRS  = ['T2','T3','T4','T5','T6','T7','CN'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y: number, m: number) {
  const d = new Date(y, m, 1).getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;          // Mon=0, Sun=6
}
function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function fmtShort(ds: string) {
  const [, m, d] = ds.split('-');
  return `${d}/${m}`;
}

const dotColor = (e: ActivityEntry) =>
  e.event.includes('late') || e.event.includes('reject') ? '#B45309'
  : e.type === 'request' ? '#7C4FBF'
  : '#00B4A0';

export function AuditLogDrawer({ open, onClose, activeStore }: Props) {
  const { t, i18n } = useTranslation('manager');
  const MONTHS = i18n.language === 'en' ? MONTHS_EN : MONTHS_VI;
  const [date, setDate]         = useState(LAST_DATA_DATE);
  const [calYear, setCalYear]   = useState(LAST_DATA_YEAR);
  const [calMonth, setCalMonth] = useState(LAST_DATA_MONTH);

  useEffect(() => {
    if (open) {
      setDate(LAST_DATA_DATE);
      setCalYear(LAST_DATA_YEAR);
      setCalMonth(LAST_DATA_MONTH);
    }
  }, [open]);

  if (!open) return null;

  const allEntries = AUDIT_LOG[date] ?? [];
  const entries = activeStore === 'all'
    ? allEntries
    : allEntries.filter(a => a.locationId === activeStore);

  // Build calendar grid
  const dim  = daysInMonth(calYear, calMonth);
  const skip = firstWeekday(calYear, calMonth);
  const cells: (number | null)[] = [
    ...Array(skip).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isNextDisabled = calYear === TODAY_YEAR && calMonth === TODAY_MONTH;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isNextDisabled) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', borderBottom: '1px solid #E8ECEF', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#00B4A0', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                {t('manager.auditLog.eyebrow')}
              </div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1E2D3D' }}>
                {t('manager.auditLog.title', { count: entries.length, date: fmtShort(date) })}
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#F7F9FA', border: '1px solid #E8ECEF', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
              <Icons.x size={15} stroke="#6B7E8E" />
            </button>
          </div>

          {/* Calendar */}
          <div style={{ paddingBottom: 14 }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #E8ECEF', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icons.chevR size={13} stroke="#6B7E8E" style={{ transform: 'scaleX(-1)' }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D' }}>
                {MONTHS[calMonth]}, {calYear}
              </span>
              <button onClick={nextMonth} disabled={isNextDisabled} style={{ background: 'none', border: '1px solid #E8ECEF', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isNextDisabled ? 'not-allowed' : 'pointer', opacity: isNextDisabled ? 0.35 : 1 }}>
                <Icons.chevR size={13} stroke="#6B7E8E" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
              {DAY_HDRS.map(h => (
                <div key={h} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9BAAB5', padding: '2px 0 4px' }}>{h}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} />;
                const ds        = toStr(calYear, calMonth, day);
                const isSelected = ds === date;
                const isToday    = ds === TODAY_STR;
                const isFuture   = ds > TODAY_STR;
                const hasData    = ds in AUDIT_LOG;
                return (
                  <button
                    key={idx}
                    onClick={() => { if (!isFuture) setDate(ds); }}
                    style={{
                      height: 30, borderRadius: 6, fontSize: 12,
                      fontWeight: isSelected || isToday ? 700 : 400,
                      cursor: isFuture ? 'default' : 'pointer',
                      background: isSelected ? '#00B4A0' : 'transparent',
                      color: isSelected ? '#fff' : isFuture ? '#D0D8DF' : '#1E2D3D',
                      border: isToday && !isSelected ? '1.5px solid #00B4A0' : '1.5px solid transparent',
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {day}
                    {hasData && !isSelected && (
                      <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 999, background: isFuture ? '#D0D8DF' : '#00B4A0' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Entry list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {entries.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9BAAB5', fontSize: 13 }}>
              {t('manager.auditLog.empty')}
            </div>
          ) : entries.map((a, i) => (
            <div key={i} style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid #F0F4F7' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: '#9BAAB5', width: 38, flexShrink: 0, lineHeight: 1.6 }}>
                  {fmtHHMM(a.t)}
                </span>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: dotColor(a), flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E2D3D', lineHeight: 1.4 }}>{a.actor.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 2 }}>{a.target}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
