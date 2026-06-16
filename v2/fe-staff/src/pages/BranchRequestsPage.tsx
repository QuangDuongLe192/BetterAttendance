import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { useAdminRequests } from '../features/requests/hooks/useAdminRequests';
import type { AdminRequestDto } from '../mocks/handlers';
import type { RequestType, RequestStatus } from '../features/requests/types';

type ViewTab = 'pending' | 'history';
type TypeFilter = 'all' | RequestType;

const TYPE_LABEL: Record<TypeFilter, string> = {
  all:   'Tất cả',
  leave: 'Nghỉ phép',
  late:  'Đi trễ',
  early: 'Về sớm',
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  pending:  'var(--c-warning)',
  approved: 'var(--c-success)',
  rejected: 'var(--c-danger)',
};

const STATUS_BG: Record<RequestStatus, string> = {
  pending:  'rgba(245,158,11,0.1)',
  approved: 'rgba(16,185,129,0.1)',
  rejected: 'rgba(239,68,68,0.1)',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending:  'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').slice(-2).map(p => p[0]).join('').toUpperCase();
}

interface CompactCardProps {
  req: AdminRequestDto;
  onClick: () => void;
}

function CompactRequestCard({ req, onClick }: CompactCardProps) {
  const isPending = req.status === 'pending';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--line-1)',
        borderLeft: `3px solid ${STATUS_COLOR[req.status as RequestStatus]}`,
        borderRadius: 'var(--r-lg)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isPending ? 'var(--c-teal)' : 'var(--line-1)',
        color: isPending ? '#fff' : 'var(--fg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
      }}>
        {getInitials(req.staffName)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 14, color: 'var(--fg-1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {req.staffName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>
          {TYPE_LABEL[req.type as TypeFilter]} · {formatDate(req.startDate)}
          {req.endDate ? ` – ${formatDate(req.endDate)}` : ''}
          {req.time ? ` lúc ${req.time}` : ''}
        </div>
      </div>

      {/* Status badge + chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 7px',
          borderRadius: 'var(--r-sm)',
          background: STATUS_BG[req.status as RequestStatus],
          color: STATUS_COLOR[req.status as RequestStatus],
          fontFamily: 'var(--font-display)',
          border: `1px solid ${STATUS_COLOR[req.status as RequestStatus]}33`,
          whiteSpace: 'nowrap',
        }}>
          {STATUS_LABEL[req.status as RequestStatus]}
        </span>
        <span style={{ fontSize: 18, color: 'var(--fg-3)', lineHeight: 1 }}>›</span>
      </div>
    </button>
  );
}

export function BranchRequestsPage() {
  const { branchName: encodedBranch } = useParams<{ branchName: string }>();
  const branchName = decodeURIComponent(encodedBranch ?? '');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ViewTab>('pending');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const { data: pendingData } = useAdminRequests('pending');
  const { data: historyData } = useAdminRequests('history');

  const pendingAll = (pendingData?.requests ?? []).filter(r => r.branchName === branchName);
  const historyAll = (historyData?.requests ?? []).filter(r => r.branchName === branchName);

  const pendingList = pendingAll.filter(r => typeFilter === 'all' || r.type === typeFilter);
  const historyList = historyAll.filter(r => typeFilter === 'all' || r.type === typeFilter);

  const TYPE_FILTERS: TypeFilter[] = ['all', 'leave', 'late', 'early'];

  return (
    <div className="cd-page" style={{ paddingBottom: 90 }}>
      <ScreenHeader title={branchName} />

      {/* Tab chính */}
      <div className="cd-filter-tabs" style={{ margin: '0 16px' }}>
        <button
          className={`cd-filter-tab${activeTab === 'pending' ? ' active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          {`Chờ duyệt${pendingAll.length > 0 ? ` (${pendingAll.length})` : ''}`}
        </button>
        <button
          className={`cd-filter-tab${activeTab === 'history' ? ' active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử
        </button>
        <div
          className="cd-filter-tab-indicator"
          style={{ transform: `translateX(${(['pending', 'history'] as ViewTab[]).indexOf(activeTab) * 100}%)` }}
        />
      </div>

      {/* Filter theo loại */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 16px', overflowX: 'auto' }}>
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-full, 999px)',
              border: `1px solid ${typeFilter === f ? 'var(--c-teal)' : 'var(--line-1)'}`,
              background: typeFilter === f ? 'rgba(0,180,160,0.1)' : 'transparent',
              color: typeFilter === f ? 'var(--c-teal)' : 'var(--fg-2)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Danh sách */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTab === 'pending' && (
          pendingList.length === 0
            ? <p style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 14, marginTop: 40 }}>
                Không có đơn chờ duyệt
              </p>
            : pendingList.map(req => (
                <CompactRequestCard
                  key={req.id}
                  req={req}
                  onClick={() => navigate(`/admin/requests/${req.id}`)}
                />
              ))
        )}
        {activeTab === 'history' && (
          historyList.length === 0
            ? <p style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 14, marginTop: 40 }}>
                Chưa có lịch sử
              </p>
            : historyList.map(req => (
                <CompactRequestCard
                  key={req.id}
                  req={req}
                  onClick={() => navigate(`/admin/requests/${req.id}`)}
                />
              ))
        )}
      </div>
    </div>
  );
}
