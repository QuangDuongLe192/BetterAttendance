import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useAdminRequestDetail, useApproveRequest, useRejectRequest } from '../features/requests/hooks/useAdminRequests';
import { ReviewModal } from '../features/requests/components/ReviewModal';
import type { AdminRequestDto } from '../mocks/handlers';

const TYPE_LABEL: Record<string, string> = {
  leave: 'Nghỉ phép',
  late:  'Đi trễ',
  early: 'Về sớm',
};

const STATUS_COLOR: Record<string, string> = {
  pending:  'var(--c-warning)',
  approved: 'var(--c-success)',
  rejected: 'var(--c-danger)',
};

const STATUS_BG: Record<string, string> = {
  pending:  'rgba(245,158,11,0.1)',
  approved: 'rgba(16,185,129,0.1)',
  rejected: 'rgba(239,68,68,0.1)',
};

const STATUS_LABEL: Record<string, string> = {
  pending:  'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name.split(' ').slice(-2).map(p => p[0]).join('').toUpperCase();
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="cd-muted">{label}</div>
      <div className="cd-detail__v" style={{ marginTop: 2 }}>{value}</div>
    </div>
  );
}

export function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);

  const { data: req, isPending } = useAdminRequestDetail(id ?? '');
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const handleConfirm = (comment: string) => {
    if (!modal || !req) return;
    if (modal === 'approve') {
      approveRequest.mutate({ id: req.id, reviewComment: comment }, {
        onSuccess: () => navigate(-1),
      });
    } else {
      rejectRequest.mutate({ id: req.id, reviewComment: comment }, {
        onSuccess: () => navigate(-1),
      });
    }
    setModal(null);
  };

  if (isPending || !req) {
    return (
      <div className="cd-page">
        <ScreenHeader title="…" />
        <div className="cd-card" style={{ minHeight: 140 }} />
      </div>
    );
  }

  const typedReq = req as AdminRequestDto;

  return (
    <div className="cd-page">
      <ScreenHeader
        title={TYPE_LABEL[typedReq.type] ?? typedReq.type}
      />

      {/* Status + submitted date */}
      <div style={{
        marginBottom: 16, paddingBottom: 14,
        borderBottom: '1px solid var(--line-2)',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 0 14px',
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '3px 10px',
          borderRadius: 'var(--r-sm)',
          background: STATUS_BG[typedReq.status],
          color: STATUS_COLOR[typedReq.status],
          fontFamily: 'var(--font-display)',
          border: `1px solid ${STATUS_COLOR[typedReq.status]}33`,
        }}>
          {STATUS_LABEL[typedReq.status]}
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
          Nộp {formatDateTime(typedReq.submittedAt)}
        </span>
      </div>

      {/* Staff info card */}
      <div className="cd-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'var(--c-teal)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
          }}>
            {getInitials(typedReq.staffName)}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>
              {typedReq.staffName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
              {typedReq.staffId} · {typedReq.branchName}
            </div>
          </div>
        </div>
      </div>

      {/* Request details card */}
      <div className="cd-card" style={{ marginBottom: 12 }}>
        <DetailRow
          label="Loại đơn"
          value={TYPE_LABEL[typedReq.type] ?? typedReq.type}
        />
        <DetailRow
          label="Ngày"
          value={
            typedReq.endDate
              ? `${formatDate(typedReq.startDate)} – ${formatDate(typedReq.endDate)}`
              : formatDate(typedReq.startDate)
          }
        />
        {typedReq.time && (
          <DetailRow label="Giờ" value={typedReq.time} />
        )}
        <div style={{ marginBottom: 0 }}>
          <div className="cd-muted">Lý do</div>
          <div style={{
            marginTop: 6, padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--bg-1)',
            borderLeft: '2px solid var(--line-1)',
            fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6,
          }}>
            {typedReq.reason}
          </div>
        </div>
      </div>

      {/* Reviewer card (if processed) */}
      {typedReq.reviewerName && (
        <div className="cd-card" style={{ borderLeft: '3px solid var(--c-teal)', marginBottom: 12 }}>
          <DetailRow label="Người duyệt" value={typedReq.reviewerName} />
          {typedReq.reviewedAt && (
            <DetailRow label="Thời gian duyệt" value={formatDateTime(typedReq.reviewedAt)} />
          )}
          {typedReq.reviewComment && (
            <div>
              <div className="cd-muted">Nhận xét</div>
              <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 4, fontStyle: 'italic' }}>
                "{typedReq.reviewComment}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons (pending only) */}
      {typedReq.status === 'pending' && (
        <div style={{
          marginTop: 24, marginBottom: 32,
          padding: '12px 0',
          borderTop: '1px solid var(--line-1)',
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={() => setModal('reject')}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-danger)', background: 'transparent',
              color: 'var(--c-danger)', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}
          >
            Từ chối
          </button>
          <button
            onClick={() => setModal('approve')}
            style={{
              flex: 2, padding: '13px 0', borderRadius: 'var(--r-lg)',
              border: 'none', background: 'var(--c-success)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}
          >
            Duyệt đơn
          </button>
        </div>
      )}

      {modal && (
        <ReviewModal
          request={typedReq}
          action={modal}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
