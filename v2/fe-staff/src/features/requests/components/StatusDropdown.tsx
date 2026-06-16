import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';
import { getRequestStatusColor } from '../../../shared/lib/date';
import type { StatusFilter } from '../types';

export function StatusDropdown({
  value,
  counts,
  onChange,
}: {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (v: StatusFilter) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const options: StatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'var(--bg-surface)',
          border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)',
          padding: '12px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: getRequestStatusColor(value),
          }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
            color: 'var(--fg-1)',
          }}>
            {t(`requests.statusFilter.${value}`)}
          </span>
          <span style={{
            background: 'var(--c-teal-light)', color: 'var(--c-teal-dark)',
            borderRadius: 'var(--r-pill)', padding: '1px 8px',
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
          }}>
            {counts[value]}
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--t-fast) var(--ease-out)', color: 'var(--fg-3)', flexShrink: 0 }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
          borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden',
        }}>
          {options.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width: '100%', background: opt === value ? 'var(--c-teal-light)' : 'transparent',
                border: 'none', borderBottom: idx < options.length - 1 ? '1px solid var(--line-2)' : 'none',
                padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background var(--t-fast) var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: getRequestStatusColor(opt),
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: opt === value ? 700 : 500,
                  fontSize: 14,
                  color: opt === value ? 'var(--c-teal-dark)' : 'var(--fg-1)',
                }}>
                  {t(`requests.statusFilter.${opt}`)}
                </span>
              </div>
              <span style={{
                background: opt === value ? 'rgba(0,180,160,0.15)' : 'var(--line-2)',
                color: opt === value ? 'var(--c-teal-dark)' : 'var(--fg-3)',
                borderRadius: 'var(--r-pill)', padding: '1px 8px',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}>
                {counts[opt]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
