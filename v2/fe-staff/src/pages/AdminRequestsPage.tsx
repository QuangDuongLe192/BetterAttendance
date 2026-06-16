import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import {
  useAdminRequests,
  useAdminRequestDetail,
  useApproveRequest,
  useRejectRequest,
} from '../features/requests/hooks/useAdminRequests';
import { ReviewModal } from '../features/requests/components/ReviewModal';
import type { AdminRequestDto } from '../mocks/handlers';
import type { RequestType, RequestStatus } from '../features/requests/types';

type ViewTab = 'pending' | 'history';
type TypeFilter = 'all' | RequestType;

const TYPE_LABEL: Record<TypeFilter, string> = {
  all:   'Tất cả loại',
  leave: 'Nghỉ phép',
  late:  'Đi trễ',
  early: 'Về sớm',
};

const TYPE_ICON: Record<TypeFilter, string> = {
  all:   '📋',
  leave: '🌴',
  late:  '⏰',
  early: '🏃',
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  pending:  'var(--c-warning)',
  approved: 'var(--c-success)',
  rejected: 'var(--c-danger)',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending:  'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const BRANCH_COLORS = [
  'var(--c-teal)',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#10b981',
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
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

// ── Dropdown chip ──────────────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  icon?: string;
  active?: boolean;
  items: { key: string; label: string; icon?: string; dotColor?: string; count?: number }[];
  selected: string;
  onSelect: (key: string) => void;
}

function Dropdown({ label, icon, active, items, selected, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedItem = items.find(i => i.key === selected);

  return (
    <div className="cd-dropdown" ref={ref}>
      <button
        className={`cd-dropdown__trigger${active || selected !== items[0]?.key ? ' cd-dropdown__trigger--active' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        {selectedItem?.dotColor && (
          <span className="cd-dropdown__dot" style={{ background: selectedItem.dotColor }} />
        )}
        {icon && !selectedItem?.dotColor && <span style={{ fontSize: 13 }}>{icon}</span>}
        <span>{selectedItem?.label ?? label}</span>
        {selectedItem?.count != null && selectedItem.count > 0 && (
          <span style={{
            background: 'var(--c-warning)', color: '#fff',
            borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 700,
            padding: '1px 5px', lineHeight: 1.4,
          }}>
            {selectedItem.count}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="cd-dropdown__menu">
          {items.map(item => (
            <button
              key={item.key}
              className={`cd-dropdown__item${selected === item.key ? ' cd-dropdown__item--active' : ''}`}
              onClick={() => { onSelect(item.key); setOpen(false); }}
            >
              {item.dotColor && <span className="cd-dropdown__dot" style={{ background: item.dotColor }} />}
              {item.icon && !item.dotColor && <span style={{ fontSize: 15 }}>{item.icon}</span>}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count != null && item.count > 0 && (
                <span style={{
                  background: 'var(--c-warning)', color: '#fff',
                  borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px',
                }}>
                  {item.count}
                </span>
              )}
              {selected === item.key && <span className="cd-dropdown__check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Request card ───────────────────────────────────────────────────────────
interface CompactCardProps {
  req: AdminRequestDto;
  selected: boolean;
  onClick: () => void;
}

function CompactRequestCard({ req, selected, onClick }: CompactCardProps) {
  const dateLabel = req.endDate
    ? `${formatDate(req.startDate)} – ${formatDate(req.endDate)}`
    : formatDate(req.startDate);
  const timeLabel = req.time ? ` · ${req.time}` : '';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px',
        background: selected ? 'rgba(0,180,160,0.05)' : 'var(--bg-surface)',
        border: selected ? `1.5px solid var(--c-teal)` : `1px solid var(--line-1)`,
        borderLeft: `3px solid ${STATUS_COLOR[req.status as RequestStatus]}`,
        borderRadius: 'var(--r-lg)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        boxShadow: selected ? '0 2px 8px rgba(0,180,160,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 150ms ease',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: req.status === 'pending' ? 'var(--c-teal)' : 'var(--line-1)',
        color: req.status === 'pending' ? '#fff' : 'var(--fg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
      }}>
        {getInitials(req.staffName)}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: Name + Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 14, color: 'var(--fg-1)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            flex: 1,
          }}>
            {req.staffName}
          </span>
          <span className={`cd-badge cd-badge--${req.status}`} style={{ flexShrink: 0 }}>
            {STATUS_LABEL[req.status as RequestStatus]}
          </span>
        </div>

        {/* Row 2: Type · Branch + Date */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 3, gap: 8,
        }}>
          <span style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500 }}>
            {TYPE_ICON[req.type as TypeFilter]} {TYPE_LABEL[req.type as TypeFilter]} · {req.branchName}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>
            {dateLabel}{timeLabel}
          </span>
        </div>

        {/* Row 3: Reason preview */}
        {req.reason && (
          <div style={{
            marginTop: 5, fontSize: 12, color: 'var(--fg-3)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontStyle: 'italic',
          }}>
            "{req.reason}"
          </div>
        )}
      </div>
    </button>
  );
}

// ── Bottom sheet ───────────────────────────────────────────────────────────
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function BottomSheet({ open, onClose, children, footer }: BottomSheetProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 210);
  };

  if (!open && !closing) return null;

  return (
    <>
      <div
        className={`cd-sheet-overlay${closing ? ' cd-sheet-overlay--closing' : ''}`}
        onClick={handleClose}
      />
      <div className={`cd-sheet${closing ? ' cd-sheet--closing' : ''}`}>
        <div className="cd-sheet__handle" />
        <div className="cd-sheet__body">{children}</div>
        {footer && <div className="cd-sheet__footer">{footer}</div>}
      </div>
    </>
  );
}

// ── Detail content (inside sheet) ─────────────────────────────────────────
interface SheetDetailProps {
  id: string;
  onClose: () => void;
}

function SheetDetail({ id, onClose }: SheetDetailProps) {
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const { data: req, isPending } = useAdminRequestDetail(id);
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const handleConfirm = (comment: string) => {
    if (!modal || !req) return;
    const typedReq = req as AdminRequestDto;
    if (modal === 'approve') {
      approveRequest.mutate({ id: typedReq.id, reviewComment: comment }, { onSuccess: () => onClose() });
    } else {
      rejectRequest.mutate({ id: typedReq.id, reviewComment: comment }, { onSuccess: () => onClose() });
    }
    setModal(null);
  };

  if (isPending || !req) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[80, 120, 60].map((h, i) => (
          <div key={i} className="cd-skeleton" style={{ height: h, borderRadius: 12, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  const typedReq = req as AdminRequestDto;

  const footer = typedReq.status === 'pending' ? (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={() => setModal('reject')}
        style={{
          flex: 1, padding: '13px 0', borderRadius: 'var(--r-lg)',
          border: '1.5px solid var(--c-danger)', background: 'transparent',
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
        ✓ Duyệt đơn
      </button>
    </div>
  ) : null;

  return (
    <BottomSheet open onClose={onClose} footer={footer}>
      {/* Staff header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 16, marginBottom: 16,
        borderBottom: '1px solid var(--line-2)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: 'var(--c-teal)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
        }}>
          {getInitials(typedReq.staffName)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>
            {typedReq.staffName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>
            {typedReq.staffId} · {typedReq.branchName}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span className={`cd-badge cd-badge--${typedReq.status}`}>
            {STATUS_LABEL[typedReq.status]}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--line-2)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--fg-2)', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Request info */}
      <div className="cd-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{TYPE_ICON[typedReq.type as TypeFilter]}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>
            {TYPE_LABEL[typedReq.type as TypeFilter]}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
          <div>
            <div className="cd-muted">Ngày</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', marginTop: 2 }}>
              {typedReq.endDate
                ? `${formatDate(typedReq.startDate)} –\n${formatDate(typedReq.endDate)}`
                : formatDate(typedReq.startDate)}
            </div>
          </div>
          {typedReq.time && (
            <div>
              <div className="cd-muted">Giờ</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', marginTop: 2 }}>{typedReq.time}</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="cd-muted">Nộp lúc</div>
            <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>
              {formatDateTime(typedReq.submittedAt)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
          <div className="cd-muted" style={{ marginBottom: 6 }}>Lý do</div>
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-page)',
            borderLeft: '2px solid var(--line-1)',
            fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.6,
          }}>
            {typedReq.reason}
          </div>
        </div>
      </div>

      {/* Reviewer info */}
      {typedReq.reviewerName && (
        <div className="cd-card" style={{ borderLeft: '3px solid var(--c-teal)', marginBottom: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
            <div>
              <div className="cd-muted">Người duyệt</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', marginTop: 2 }}>{typedReq.reviewerName}</div>
            </div>
            {typedReq.reviewedAt && (
              <div>
                <div className="cd-muted">Thời gian</div>
                <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>{formatDateTime(typedReq.reviewedAt)}</div>
              </div>
            )}
          </div>
          {typedReq.reviewComment && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-2)' }}>
              <div className="cd-muted" style={{ marginBottom: 4 }}>Nhận xét</div>
              <div style={{ fontSize: 14, color: 'var(--fg-2)', fontStyle: 'italic' }}>
                "{typedReq.reviewComment}"
              </div>
            </div>
          )}
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
    </BottomSheet>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export function AdminRequestsPage() {
  const { t } = useTranslation();

  const { data: pendingData, isPending: loadingPending } = useAdminRequests('pending');
  const { data: historyData, isPending: loadingHistory } = useAdminRequests('history');

  const pendingAll = pendingData?.requests ?? [];
  const historyAll = historyData?.requests ?? [];

  // Build branch list sorted by pending count
  const branchMap = new Map<string, { pendingCount: number; colorIdx: number }>();
  for (const r of pendingAll) {
    if (!branchMap.has(r.branchName)) {
      branchMap.set(r.branchName, { pendingCount: 0, colorIdx: branchMap.size });
    }
    branchMap.get(r.branchName)!.pendingCount += 1;
  }
  for (const r of historyAll) {
    if (!branchMap.has(r.branchName)) {
      branchMap.set(r.branchName, { pendingCount: 0, colorIdx: branchMap.size });
    }
  }
  const branches = Array.from(branchMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.pendingCount - a.pendingCount);

  const [activeBranch, setActiveBranch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ViewTab>('pending');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentBranch = activeBranch || branches[0]?.name || '';
  const branchPending = pendingAll.filter(r => r.branchName === currentBranch);
  const branchHistory = historyAll.filter(r => r.branchName === currentBranch);

  const pendingList = branchPending.filter(r => typeFilter === 'all' || r.type === typeFilter);
  const historyList = branchHistory.filter(r => typeFilter === 'all' || r.type === typeFilter);
  const totalPending = pendingAll.length;

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
    setSelectedId(null);
  };

  const handleBranchChange = (name: string) => {
    setActiveBranch(name);
    setSelectedId(null);
    setTypeFilter('all');
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type as TypeFilter);
    setSelectedId(null);
  };

  // Branch dropdown items
  const branchItems = branches.map(b => ({
    key: b.name,
    label: b.name,
    dotColor: BRANCH_COLORS[b.colorIdx % BRANCH_COLORS.length],
    count: b.pendingCount,
  }));

  // Type dropdown items
  const typeItems = (['all', 'leave', 'late', 'early'] as TypeFilter[]).map(f => ({
    key: f,
    label: TYPE_LABEL[f],
    icon: TYPE_ICON[f],
  }));

  const currentList = activeTab === 'pending' ? pendingList : historyList;
  const isEmpty = currentList.length === 0;
  const isLoading = loadingPending || loadingHistory;

  return (
    <div className="cd-page" style={{ padding: '0 0 90px' }}>
      <div style={{ padding: '0 16px' }}>
        <ScreenHeader title={t('admin.requests.title')} />
      </div>

      {/* Sticky controls */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--line-2)',
      }}>
        {/* Tab: Pending / History */}
        <div className="cd-filter-tabs" style={{ margin: '0 16px', marginBottom: 0, borderBottom: 'none' }}>
          <button
            className={`cd-filter-tab${activeTab === 'pending' ? ' active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            Chờ duyệt
            {totalPending > 0 && (
              <span className="cd-filter-badge">{totalPending}</span>
            )}
          </button>
          <button
            className={`cd-filter-tab${activeTab === 'history' ? ' active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            Lịch sử
          </button>
          <div
            className="cd-filter-tab-indicator"
            style={{ transform: `translateX(${(['pending', 'history'] as ViewTab[]).indexOf(activeTab) * 100}%)` }}
          />
        </div>

        {/* Filter row: Branch + Type dropdowns */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px 10px',
        }}>
          {!isLoading && branchItems.length > 0 && (
            <Dropdown
              label="Chi nhánh"
              icon="🏢"
              items={branchItems}
              selected={currentBranch}
              onSelect={handleBranchChange}
            />
          )}
          {isLoading && branchItems.length === 0 && (
            <div className="cd-skeleton" style={{ height: 32, width: 110, borderRadius: 'var(--r-pill)' }} />
          )}
          <Dropdown
            label="Loại đơn"
            icon="📋"
            items={typeItems}
            selected={typeFilter}
            onSelect={handleTypeChange}
          />
          {/* Spacer + pending count indicator */}
          <div style={{ flex: 1 }} />
          {activeTab === 'pending' && branchPending.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
              fontFamily: 'var(--font-display)',
            }}>
              {pendingList.length} đơn
            </span>
          )}
        </div>
      </div>

      {/* Request list */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="cd-skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))
        ) : isEmpty ? (
          <div className="cd-empty" style={{ paddingTop: 60 }}>
            <div className="cd-empty__icon">{activeTab === 'pending' ? '✅' : '📂'}</div>
            <div className="cd-empty__title">
              {activeTab === 'pending' ? 'Không có đơn chờ duyệt' : 'Chưa có lịch sử'}
            </div>
            <div className="cd-empty__sub">
              {activeTab === 'pending'
                ? 'Tất cả đơn của chi nhánh này đã được xử lý'
                : 'Lịch sử duyệt đơn sẽ xuất hiện ở đây'}
            </div>
          </div>
        ) : (
          currentList.map(req => (
            <CompactRequestCard
              key={req.id}
              req={req}
              selected={selectedId === req.id}
              onClick={() => setSelectedId(prev => prev === req.id ? null : req.id)}
            />
          ))
        )}
      </div>

      {/* Bottom sheet detail */}
      {selectedId && (
        <SheetDetail
          key={selectedId}
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
