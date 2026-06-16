import { useEffect, useRef } from 'react';
import { Icons } from '../../../../components/Icons';

export interface ShiftTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  color: string; // UI-only — stripped when sending to API
}

export const toMin  = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
export const durMin = (s: string, e: string) => { const sv = toMin(s), ev = toMin(e); return ev >= sv ? ev - sv : 24 * 60 - sv + ev; };
export const fmtDur = (min: number) => { const h = Math.floor(min / 60), m = min % 60; return m > 0 ? `${h}g ${m}p` : `${h}g`; };

export function ShiftBar({ left, width, color, label }: { left: number; width: number; color: string; label: string }) {
  return (
    <div style={{ position: 'absolute', top: 0, height: '100%', left: `${left}%`, width: `${Math.max(width, 0.5)}%`, background: color, opacity: 0.88, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {width > 8 ? label : ''}
    </div>
  );
}

export function ShiftRow({ shift, borderTop, onUpdate, onRemove, autoFocus }: {
  shift: ShiftTemplate;
  borderTop: boolean;
  onUpdate: (id: string, field: keyof ShiftTemplate, val: string) => void;
  onRemove: (id: string) => void;
  autoFocus?: boolean;
}) {
  const dur      = durMin(shift.start, shift.end);
  const overnight = toMin(shift.end) < toMin(shift.start);
  const nameRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [autoFocus]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr 110px 110px 80px 32px', gap: 12, padding: '12px 20px', alignItems: 'center', borderTop: borderTop ? '1px solid #E8ECEF' : 'none' }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: shift.color, flexShrink: 0, marginTop: 1 }} />

      <input
        ref={nameRef}
        value={shift.name}
        onChange={e => onUpdate(shift.id, 'name', e.target.value)}
        style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', border: '1px solid transparent', borderRadius: 4, padding: '3px 6px', background: 'transparent', outline: 'none', width: '100%' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#00B4A0')}
        onBlur={e  => (e.currentTarget.style.borderColor = 'transparent')}
      />

      <input
        type="time"
        value={shift.start}
        onChange={e => onUpdate(shift.id, 'start', e.target.value)}
        style={{ fontSize: 13, color: '#1E2D3D', border: '1px solid #E8ECEF', borderRadius: 4, padding: '5px 8px', background: '#fff', width: '100%' }}
      />

      <input
        type="time"
        value={shift.end}
        onChange={e => onUpdate(shift.id, 'end', e.target.value)}
        style={{ fontSize: 13, color: '#1E2D3D', border: '1px solid #E8ECEF', borderRadius: 4, padding: '5px 8px', background: '#fff', width: '100%' }}
      />

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{fmtDur(dur)}</div>
        {overnight && <div style={{ fontSize: 10, color: '#B45309', marginTop: 1 }}>Qua đêm</div>}
      </div>

      <button
        onClick={() => onRemove(shift.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8D4DC', padding: 4, borderRadius: 4, width: '100%' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C8D4DC'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
      >
        <Icons.x size={14} />
      </button>
    </div>
  );
}
