import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Avatar, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { APPROVALS } from '../../../services/manager';
import { VN_OFFSET_MS } from '../../../services/Job/job';
import type { Approval } from '../../../services/manager';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const KIND_COLORS: Record<Approval['kind'], { color: string; bg: string }> = {
  late:    { color: '#EA580C', bg: 'rgba(234,88,12,0.09)' },
  edit:    { color: '#30aa96', bg: 'rgba(55, 81, 79, 0.08)' },
  timeoff: { color: '#7C4FBF', bg: 'rgba(124,79,191,0.09)' },
  swap:    { color: '#2B7EC4', bg: 'rgba(43,126,196,0.09)' },
};

const ALL_KINDS: Approval['kind'][] = ['late', 'edit', 'timeoff', 'swap'];

export type ApprovalCtx = {
  lateHistory?: { count: number; totalMins: number; items: string[] };
  swapWith?: { name: string; confirmed: boolean };
  teamOnDay?: { name: string; role: string; time: string }[];
};

export const APPROVAL_CTX: Record<string, ApprovalCtx> = {
  A1: { lateHistory: { count: 3, totalMins: 67, items: ['05/05 +23 ph', '12/04 +31 ph', '28/03 +13 ph'] } },
  A4: {
    swapWith: { name: 'Phan Thanh Hằng', confirmed: true },
    teamOnDay: [
      { name: 'Vũ Hải Yến', role: 'Pha chế', time: '08:00–16:00' },
      { name: 'Phan Thanh Hằng', role: 'Pha chế', time: '14:00–22:00' },
      { name: 'Đặng Khánh Linh', role: 'Thu ngân', time: '07:00–15:00' },
    ],
  },
  A5: { lateHistory: { count: 1, totalMins: 18, items: ['12/05 +18 ph'] } },
};

const fmtDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const fmtMs = (ms: number) => {
  const d = new Date(ms + VN_OFFSET_MS);
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
};
function timeAgo(utcMs: number): string {
  const diff = (Date.now() - utcMs) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} ph trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} g trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
interface Props {
  isLoading?: boolean;
  error?: string | null;
  handled: Record<string, 'approved' | 'rejected'>;
  handledBy?: Record<string, string>;
  approve: (id: string) => void;
  openDetail: (id: string, rejectMode?: boolean) => void;
}

export function MgrApprovals({ isLoading, error, handled, handledBy = {}, approve, openDetail }: Props) {
  const { t } = useTranslation('manager');
  const [kindFilter, setKindFilter] = useState<'all' | Approval['kind']>('all');
  const [statusFilter, setStatus] = useState<StatusFilter>('pending');
  const [hovered, setHovered] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState(false);

  if (isLoading) return <MgrApprovalsSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const all = APPROVALS ?? [];
  const pending = all.filter(a => !handled[a.id]);

  const filtered = all
    .filter(a => kindFilter === 'all' || a.kind === kindFilter)
    .filter(a => {
      const h = handled[a.id];
      if (statusFilter === 'pending') return !h;
      if (statusFilter === 'approved') return h === 'approved';
      if (statusFilter === 'rejected') return h === 'rejected';
      return true;
    });

  const kindCounts = Object.fromEntries(
    ALL_KINDS.map(k => [k, pending.filter(a => a.kind === k).length])
  ) as Record<Approval['kind'], number>;

  const kindTabs = [
    { k: 'all' as const, label: t('manager.approvals.kind.all'), count: pending.length, color: '#00897B', activeBg: '#1E2D3D' },
    ...ALL_KINDS.map(k => ({
      k,
      label: t(`manager.approvals.kind.${k}`),
      count: kindCounts[k],
      color: KIND_COLORS[k].color,
      activeBg: KIND_COLORS[k].color,
    })),
  ];
  const statusTabs: { k: StatusFilter; label: string }[] = [
    { k: 'all',      label: t('manager.approvals.status.all') },
    { k: 'pending',  label: t('manager.approvals.status.pending') },
    { k: 'approved', label: t('manager.approvals.status.approved') },
    { k: 'rejected', label: t('manager.approvals.status.rejected') },
  ];

  return (
    <div style={{ margin: '-36px -40px -80px', padding: '36px 40px 80px', background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'fadeUp 350ms ease both' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{t('manager.approvals.eyebrow')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', margin: 0 }}>{t('manager.approvals.title')}</h1>
          {pending.length > 0 && (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#dd3d3dff', borderRadius: 999, padding: '2px 10px', lineHeight: 1.6 }}>{pending.length}</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#6B7E8E', marginTop: 4, marginBottom: 0 }}>{t('manager.approvals.allStores')}</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Kind */}
        <div style={{ ...glass, display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 20 }}>
          {kindTabs.map(({ k, label, count, color, activeBg }) => {
            const active = kindFilter === k;
            return (
              <button key={k} onClick={() => setKindFilter(k)}
                style={{ padding: '5px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500, background: active ? activeBg : 'transparent', color: active ? '#fff' : '#6B7E8E', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 150ms' }}>
                {label}
                {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: active ? 'rgba(255,255,255,0.22)' : `${color}18`, color: active ? '#fff' : color, borderRadius: 999, padding: '1px 6px', lineHeight: 1.4 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Status */}
        <div style={{ ...glass, display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 20 }}>
          {statusTabs.map(({ k, label }) => {
            const active = statusFilter === k;
            return (
              <button key={k} onClick={() => setStatus(k)}
                style={{ padding: '5px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500, background: active ? '#1E2D3D' : 'transparent', color: active ? '#fff' : '#6B7E8E', transition: 'all 150ms' }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Quick-approve toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: quickMode ? '#1E2D3D' : '#9BAAB5', transition: 'color 200ms' }}>{t('manager.approvals.quickApprove')}</span>
          <button
            onClick={() => setQuickMode(v => !v)}
            style={{ width: 38, height: 22, borderRadius: 999, background: quickMode ? '#00B4A0' : 'rgba(200,212,220,0.55)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 220ms', flexShrink: 0 }}
          >
            <span style={{ position: 'absolute', top: 3, left: quickMode ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 200ms' }} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ ...glass, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(200,212,220,0.22)', background: 'rgba(247,249,250,0.97)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('manager.approvals.listHeader', { count: filtered.length })}</span>
          {pending.length === 0 && <span style={{ fontSize: 10, fontWeight: 600, color: '#00897B', background: 'rgba(0,180,160,0.08)', padding: '1px 8px', borderRadius: 999 }}>{t('manager.approvals.allDone')}</span>}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '52px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10, color: '#C8D4DC' }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2D3D', marginBottom: 4 }}>{t('manager.approvals.empty.title')}</div>
            <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('manager.approvals.empty.sub')}</div>
          </div>
        ) : filtered.map((a, i) => {
          const kindColors = KIND_COLORS[a.kind];
          const kindLabel = t(`manager.approvals.chip.${a.kind}`);
          const action = handled[a.id];
          const isDone = !!action;
          const isHov = !isDone && hovered === a.id;
          const showBtns = !isDone && quickMode;
          return (
            <div key={a.id} role="button" tabIndex={0} onClick={() => openDetail(a.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDetail(a.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 23px', borderTop: i > 0 ? '1px solid rgba(200,212,220,0.18)' : 'none', background: isHov ? 'rgba(0,180,160,0.025)' : 'transparent', transition: 'background 80ms', position: 'relative', opacity: isDone ? 0.45 : 1, cursor: 'pointer' }}
              onMouseEnter={() => !isDone && setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}>

              <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: '0 2px 2px 0', background: isDone ? 'rgba(200,212,220,0.3)' : kindColors.color + '80' }} />
              <Avatar name={a.staffName} size={34} />

              <div style={{ }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: isDone ? 500 : 700, color: isDone ? '#6B7E8E' : '#1E2D3D' }}>{a.staffName}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: kindColors.color, background: kindColors.bg, padding: '1px 7px', borderRadius: 999 }}>{kindLabel}</span>
                </div>
                <div style={{ fontSize: 12, color: '#3A4F63', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.body}</div>
              </div>

              <span style={{ width: 2, height: 30, background: '#d1dae2ff', flexShrink: 0 }} />

              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#26343fff' }}>{a.locationName}</div>
                <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{fmtDate(a.date)} · {timeAgo(a.createdAt)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {isDone && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, ...(action === 'approved' ? { color: '#00897B', background: 'rgba(0,180,160,0.1)' } : { color: '#DC2626', background: 'rgba(220,38,38,0.08)' }) }}>
                      {action === 'approved' ? t('manager.approvals.handledApproved') : t('manager.approvals.handledRejected')}
                    </span>
                    {handledBy[a.id] && <span style={{ fontSize: 10, color: '#9BAAB5' }}>{t('manager.approvals.handledBy', { name: handledBy[a.id] })}</span>}
                  </div>
                )}
                {showBtns && (
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                    <button onClick={() => approve(a.id)}
                      style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#00B4A0', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,180,160,0.28)' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                      {t('manager.approvals.approve')}
                    </button>
                    <button onClick={e => { e.stopPropagation(); openDetail(a.id, true); }}
                      style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(200,212,220,0.5)', background: 'rgba(255,255,255,0.85)', color: '#6B7E8E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,212,220,0.5)'; e.currentTarget.style.color = '#6B7E8E'; }}>
                      {t('manager.approvals.reject')}
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>

  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

export function ApprovalDetailDrawer({ approval: a, ctx, handled, handledBy, rejectedReason, initialRejectMode, onClose, onApprove, onReject }: {
  approval: Approval;
  ctx?: ApprovalCtx;
  handled?: 'approved' | 'rejected';
  handledBy?: string;
  rejectedReason?: string;
  initialRejectMode: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const { t } = useTranslation('manager');
  const [rejectMode, setRejectMode] = useState(initialRejectMode);
  const [rejectReason, setRejectReason] = useState('');

  const kindColors = KIND_COLORS[a.kind];
  const kindLabel  = t(`manager.approvals.chip.${a.kind}`);
  const isDone = !!handled;

  return (
    <>
      <style>{`
        @keyframes detailIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes detailBg  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.38)', zIndex: 900, animation: 'detailBg 200ms ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, zIndex: 901, animation: 'detailIn 240ms cubic-bezier(0.32,0.72,0,1)', borderRadius: '16px 0 0 16px', boxShadow: '-12px 0 48px rgba(0,0,0,0.16)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)', padding: '22px 24px 18px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,180,160,0.15)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={a.staffName} size={42} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{a.staffName}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: kindColors.color, background: `${kindColors.color}35`, padding: '2px 8px', borderRadius: 999 }}>{kindLabel}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{a.locationName} · {fmtDate(a.date)}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(255,255,255,0.7)', display: 'flex', position: 'relative' }}>
              <Icons.x size={15} stroke="currentColor" />
            </button>
          </div>
          {isDone && (
            <div style={{ marginTop: 12, position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, ...(handled === 'approved' ? { color: '#6EE7B7', background: 'rgba(0,180,160,0.25)' } : { color: '#FCA5A5', background: 'rgba(220,38,38,0.25)' }) }}>
              {handled === 'approved'
                ? t('manager.approvals.detail.handledApproved')
                : (rejectedReason
                    ? t('manager.approvals.detail.handledRejectedReason', { reason: rejectedReason })
                    : t('manager.approvals.detail.handledRejected'))
              }
              {handledBy && <span style={{ opacity: 0.75, fontWeight: 500 }}> · {t('manager.approvals.handledBy', { name: handledBy })}</span>}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ background: '#f7f9fa', flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Request details */}
          <CtxSection title={t('manager.approvals.detail.title')}>
            <p style={{ fontSize: 13, color: '#1E2D3D', lineHeight: 1.65, margin: 0 }}>{a.body}</p>
            {(a.original !== null || a.proposed !== null) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                {a.original !== null && <TimeChip label={t('manager.approvals.detail.originalTime')} value={fmtMs(a.original)} color="#EA580C" />}
                {a.original !== null && a.proposed !== null && <ArrowRight size={16} color="#C8D4DC" />}
                {a.proposed !== null && <TimeChip label={t('manager.approvals.detail.newTime')} value={fmtMs(a.proposed)} color="#00B4A0" />}
              </div>
            )}
          </CtxSection>

          {/* Late history */}
          {a.kind === 'late' && ctx?.lateHistory && (
            <CtxSection title={t('manager.approvals.detail.lateHistory')}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <StatBadge value={ctx.lateHistory.count} label={t('manager.approvals.detail.lateCount')} warn={ctx.lateHistory.count >= 3} />
                <StatBadge value={ctx.lateHistory.totalMins} label={t('manager.approvals.detail.lateMins')} warn={ctx.lateHistory.totalMins >= 60} />
              </div>
              {ctx.lateHistory.items.map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: '#EA580C', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </CtxSection>
          )}

          {/* Swap: colleague confirmation */}
          {a.kind === 'swap' && ctx?.swapWith && (
            <CtxSection title={t('manager.approvals.detail.swapConfirm')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={ctx.swapWith.name} size={30} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{ctx.swapWith.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: ctx.swapWith.confirmed ? '#00897B' : '#EA580C' }}>
                    {ctx.swapWith.confirmed ? t('manager.approvals.detail.swapConfirmed') : t('manager.approvals.detail.swapPending')}
                  </div>
                </div>
              </div>
            </CtxSection>
          )}

          {/* Swap: team on that day */}
          {a.kind === 'swap' && ctx?.teamOnDay && (
            <CtxSection title={t('manager.approvals.detail.teamSchedule')}>
              {ctx.teamOnDay.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: i % 2 === 0 ? 'rgba(200,212,220,0.1)' : 'transparent', borderRadius: 6 }}>
                  <Avatar name={m.name} size={24} />
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#1E2D3D' }}>{m.name}</div>
                  <span style={{ fontSize: 11, color: '#6B7E8E', background: 'rgba(200,212,220,0.2)', padding: '2px 8px', borderRadius: 999 }}>{m.role}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#3A4F63' }}>{m.time}</span>
                </div>
              ))}
            </CtxSection>
          )}


        </div>

        {/* Footer actions */}
        {!isDone && (
          <div style={{ background: 'rgba(247,249,250,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(200,212,220,0.2)', padding: '14px 24px', flexShrink: 0 }}>
            {!rejectMode ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setRejectMode(true)}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(220,38,38,0.3)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#DC2626', transition: 'background 120ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {t('manager.approvals.detail.rejectBtn')}
                </button>
                <button onClick={() => onApprove(a.id)}
                  style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#00B4A0', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(0,180,160,0.3)' }}>
                  {t('manager.approvals.detail.approveBtn')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('manager.approvals.detail.rejectLabel')}</div>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder={t('manager.approvals.detail.rejectPlaceholder')}
                  autoFocus
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(220,38,38,0.35)', background: 'rgba(255,255,255,0.85)', fontSize: 13, color: '#1E2D3D', outline: 'none', resize: 'none', minHeight: 76, fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(220,38,38,0.65)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(220,38,38,0.35)')} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setRejectMode(false); setRejectReason(''); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid rgba(200,212,220,0.5)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7E8E' }}>
                    {t('manager.approvals.detail.cancelReject')}
                  </button>
                  <button disabled={!rejectReason.trim()} onClick={() => onReject(a.id, rejectReason)}
                    style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: rejectReason.trim() ? '#DC2626' : 'rgba(200,212,220,0.3)', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, color: rejectReason.trim() ? '#fff' : '#9BAAB5', transition: 'all 150ms' }}>
                    {t('manager.approvals.detail.confirmReject')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────

function CtxSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.72)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(200,212,220,0.25)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</div>
      {children}
    </div>
  );
}

function TimeChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: `${color}08`, border: `1.5px solid ${color}25`, borderRadius: 8, padding: '7px 14px', textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 10, color: '#9BAAB5', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function StatBadge({ value, label, warn }: { value: number; label: string; warn: boolean }) {
  return (
    <div style={{ background: warn ? 'rgba(234,88,12,0.07)' : 'rgba(200,212,220,0.15)', border: `1px solid ${warn ? 'rgba(234,88,12,0.2)' : 'rgba(200,212,220,0.3)'}`, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: warn ? '#EA580C' : '#1E2D3D', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#9BAAB5', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MgrApprovalsSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={220} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
