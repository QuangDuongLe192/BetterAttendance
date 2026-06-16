import { useState } from 'react';
import type { AdminRequestDto } from '../../../mocks/handlers';

const TYPE_LABEL: Record<string, string> = {
  all:   'Tất cả',
  leave: 'Nghỉ phép',
  late:  'Đi trễ',
  early: 'Về sớm',
};

interface ReviewModalProps {
  request: AdminRequestDto;
  action: 'approve' | 'reject';
  onConfirm: (comment: string) => void;
  onClose: () => void;
}

export function ReviewModal({ request, action, onConfirm, onClose }: ReviewModalProps) {
  const [comment, setComment] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--bg-surface)', borderRadius: '20px 20px 0 0',
          padding: '24px 20px', width: '100%', maxWidth: 480,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-1)', margin: '0 auto 20px' }} />
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
          color: 'var(--fg-1)', marginBottom: 6,
        }}>
          {action === 'approve' ? '✅ Duyệt đơn' : '❌ Từ chối đơn'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 16 }}>
          {request.staffName} — {TYPE_LABEL[request.type] ?? request.type}
        </p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={action === 'approve' ? 'Nhận xét (tuỳ chọn)…' : 'Lý do từ chối (tuỳ chọn)…'}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)',
            padding: '10px 12px', fontSize: 14, color: 'var(--fg-1)',
            background: 'var(--bg-1)', resize: 'none',
            fontFamily: 'var(--font-body)', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: 'var(--r-lg)',
              border: '1px solid var(--line-1)', background: 'transparent',
              fontSize: 14, fontWeight: 600, color: 'var(--fg-2)', cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(comment)}
            style={{
              flex: 2, padding: '12px', borderRadius: 'var(--r-lg)',
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: action === 'approve' ? 'var(--c-success)' : 'var(--c-danger)',
              color: '#fff',
            }}
          >
            {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
}
