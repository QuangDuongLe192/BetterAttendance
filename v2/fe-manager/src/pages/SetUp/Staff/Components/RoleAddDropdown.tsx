import { useState, useRef, useEffect } from 'react';
import { Icons } from '../../../../components/Icons';
import { roleColor } from '../../../../services/setup';
import type { Role } from '../../../../services/setup';

export function RoleAddDropdown({ roles, onAdd }: { roles: Role[]; onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
        color: '#00B4A0', background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-display)', padding: '2px 4px',
      }}>
        <Icons.plus size={12} /> Thêm
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: 230, background: '#fff', borderRadius: 8, border: '1px solid #E8ECEF', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
          {roles.map((r, i) => (
            <button key={r.id} onClick={() => { onAdd(r.id); setOpen(false); }}
              style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', borderTop: i > 0 ? '1px solid #F0F4F7' : 'none', background: '#fff', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FA')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: roleColor(r), flexShrink: 0 }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1E2D3D' }}>{r.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
