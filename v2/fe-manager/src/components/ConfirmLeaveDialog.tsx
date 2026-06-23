import { createPortal } from 'react-dom';
import { Icons } from './Icons';

const Alert = Icons.alert;

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmLeaveDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return createPortal(
    <dialog
      open
      aria-modal
      onClose={onCancel}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,45,61,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', border: 'none', padding: 0, margin: 0, maxWidth: '100%', width: '100%' }}
    >
      <div
        style={{ background: '#fff', borderRadius: 14, padding: '28px 28px 24px', maxWidth: 400, width: '90%', boxShadow: '0 16px 48px rgba(30,45,61,0.22)', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(220,38,38,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Alert size={18} stroke="#DC2626" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#6B7E8E', lineHeight: 1.7, margin: 0, paddingLeft: 48 }}>
          {body}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E8ECEF', background: '#fff', color: '#1E2D3D', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
