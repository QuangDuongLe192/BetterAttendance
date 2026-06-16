import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const PALETTE = [
  { tKey: 'setup.colorPicker.red',        value: '#EF4444' },
  { tKey: 'setup.colorPicker.rose',       value: '#F43F5E' },
  { tKey: 'setup.colorPicker.orangeRed',  value: '#EA580C' },
  { tKey: 'setup.colorPicker.orange',     value: '#F97316' },
  { tKey: 'setup.colorPicker.amber',      value: '#D97706' },
  { tKey: 'setup.colorPicker.yellow',     value: '#EAB308' },
  { tKey: 'setup.colorPicker.lime',       value: '#65A30D' },
  { tKey: 'setup.colorPicker.green',      value: '#16A34A' },
  { tKey: 'setup.colorPicker.emerald',    value: '#10B981' },
  { tKey: 'setup.colorPicker.teal',       value: '#00B4A0' },
  { tKey: 'setup.colorPicker.cyan',       value: '#0891B2' },
  { tKey: 'setup.colorPicker.blue',       value: '#2B7EC4' },
  { tKey: 'setup.colorPicker.indigo',     value: '#4338CA' },
  { tKey: 'setup.colorPicker.violet',     value: '#7C4FBF' },
  { tKey: 'setup.colorPicker.purple',     value: '#9333EA' },
  { tKey: 'setup.colorPicker.pink',       value: '#DB2777' },
  { tKey: 'setup.colorPicker.hotpink',    value: '#EC4899' },
  { tKey: 'setup.colorPicker.navy',       value: '#1E2D3D' },
  { tKey: 'setup.colorPicker.slate',      value: '#64748B' },
  { tKey: 'setup.colorPicker.brown',      value: '#92400E' },
];

export function ColorPicker({ color, onChange, disabled }: { color: string; onChange: (c: string) => void; disabled?: boolean }) {
  const { t } = useTranslation('setup');
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !popRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const openPicker = () => {
    if (disabled || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const popW = 176 + 28;
    const left = Math.min(r.right - popW, window.innerWidth - popW - 8);
    setPos({ top: r.bottom + 8, left: Math.max(8, left) });
    setOpen(true);
  };

  const popup = (
    <div
      ref={popRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, background: '#fff', borderRadius: 10, border: '1px solid #E8ECEF', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 14 }}
    >
      <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#6B7E8E', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
        {t('setup.colorPicker.label')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 12 }}>
        {PALETTE.map(c => (
          <button
            key={c.value}
            title={t(c.tKey)}
            onClick={() => onChange(c.value)}
            style={{ width: 28, height: 28, borderRadius: 7, background: c.value, border: 'none', cursor: 'pointer', outline: c.value === color ? `3px solid ${c.value}` : 'none', outlineOffset: 2, boxShadow: c.value === color ? `0 0 0 1px #fff inset` : 'none', transition: 'transform 100ms', transform: c.value === color ? 'scale(1.15)' : 'scale(1)' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#F7F9FA', borderRadius: 6 }}>
        <span style={{ width: 20, height: 20, borderRadius: 5, background: color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
        <span style={{ fontSize: 12, color: '#3A4F63', letterSpacing: 0.5 }}>{color}</span>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={openPicker}
        title={disabled ? undefined : t('setup.colorPicker.tooltip')}
        style={{ width: 28, height: 28, borderRadius: 8, background: color, border: `2px solid ${open ? '#1E2D3D' : 'rgba(0,0,0,0.15)'}`, cursor: disabled ? 'default' : 'pointer', flexShrink: 0, transition: 'border-color 150ms' }}
      />
      {open && createPortal(popup, document.body)}
    </>
  );
}
