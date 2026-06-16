import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../../components/Icons';
import { TODAY_FULL } from './weekUtils';

const VI_WEEKDAY_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const EN_WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VI_MONTH = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const EN_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDay(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

interface DateNavProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DateNav({ selectedDate, onSelect }: DateNavProps) {
  const { i18n } = useTranslation('manager');
  const WEEKDAY_FULL = i18n.language === 'en' ? EN_WEEKDAY_FULL : VI_WEEKDAY_FULL;
  const MONTH_LABELS = i18n.language === 'en' ? EN_MONTH : VI_MONTH;
  const [calOpen, setCalOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = parseDate(selectedDate);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calOpen) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setCalOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [calOpen]);

  useEffect(() => {
    const d = parseDate(selectedDate);
    setCalMonth({ y: d.getFullYear(), m: d.getMonth() });
  }, [selectedDate]);

  const isToday  = selectedDate === TODAY_FULL;
  const selDate  = parseDate(selectedDate);
  const weekdayFull = WEEKDAY_FULL[selDate.getDay()];
  const dateStr  = `${String(selDate.getDate()).padStart(2, '0')}/${String(selDate.getMonth() + 1).padStart(2, '0')}/${selDate.getFullYear()}`;

  // Calendar grid — week starts Monday
  const firstDay   = new Date(calMonth.y, calMonth.m, 1);
  const lastDay    = new Date(calMonth.y, calMonth.m + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells  = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '7px 8px',
        background: 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
        borderRadius: 15, userSelect: 'none',
      }}>
        <button onClick={() => onSelect(shiftDay(selectedDate, -1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
          <Icons.chevR size={13} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <button onClick={() => setCalOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}>
          <Icons.calendar size={13} stroke="#9BAAB5" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', whiteSpace: 'nowrap' }}>
            {weekdayFull}, {dateStr}
          </span>
          {isToday && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00B4A0', background: 'rgba(0,180,160,0.10)', padding: '1px 8px', borderRadius: 999 }}>
              Hôm nay
            </span>
          )}
        </button>

        <button onClick={() => onSelect(shiftDay(selectedDate, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
          <Icons.chevR size={13} />
        </button>
      </div>

      {/* Calendar popover */}
      {calOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(200,212,220,0.35)', borderRadius: 14,
          boxShadow: '0 12px 32px rgba(30,45,61,0.14)', padding: 16, minWidth: 272,
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={() => setCalMonth(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
              <Icons.chevR size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', fontFamily: 'var(--font-display)' }}>
              {MONTH_LABELS[calMonth.m]} {calMonth.y}
            </span>
            <button onClick={() => setCalMonth(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
              <Icons.chevR size={14} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9BAAB5', paddingBottom: 5, letterSpacing: '0.04em' }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayNum = idx - startOffset + 1;
              if (dayNum < 1 || dayNum > lastDay.getDate()) return <div key={idx} />;
              const dateKey = formatDate(new Date(calMonth.y, calMonth.m, dayNum));
              const isSel  = dateKey === selectedDate;
              const isT    = dateKey === TODAY_FULL;
              return (
                <button
                  key={idx}
                  onClick={() => { onSelect(dateKey); setCalOpen(false); }}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: isSel ? 800 : isT ? 700 : 400,
                    background: isSel ? '#1E2D3D' : isT ? 'rgba(0,180,160,0.10)' : 'transparent',
                    color: isSel ? '#fff' : isT ? '#00B4A0' : '#3A4F63',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: isT && !isSel ? '1.5px solid rgba(0,180,160,0.35)' : 'none',
                    transition: 'background 80ms',
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(0,180,160,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSel ? '#1E2D3D' : isT ? 'rgba(0,180,160,0.10)' : 'transparent'; }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Jump to today */}
          {selectedDate !== TODAY_FULL && (
            <button
              onClick={() => { onSelect(TODAY_FULL); setCalOpen(false); }}
              style={{ width: '100%', marginTop: 12, padding: '7px', borderRadius: 8, border: '1px solid rgba(0,180,160,0.3)', background: 'rgba(0,180,160,0.06)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#00897B' }}
            >
              Về hôm nay
            </button>
          )}
        </div>
      )}
    </div>
  );
}
