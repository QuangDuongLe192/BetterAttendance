import { useTranslation } from "react-i18next";
import { Icons } from "../../../../components/Icons";
import { Approval, approvalIcon, fmtAge, fmtHHMM } from "../../../../services/manager";

const Check = Icons.check;
const X = Icons.x;

export function ApprovalCard({ approval, handled, approve, openDetail }: Readonly<{
  approval: Approval;
  handled?: 'approved' | 'rejected';
  approve: (id: string) => void;
  openDetail: (id: string, rejectMode?: boolean) => void;
}>) {
  const { t } = useTranslation('manager');

  const KIND_CHIP: Record<string, { label: string; bg: string; fg: string }> = {
    late:    { label: t('manager.approvals.chip.late'),    bg: '#FFF3E0', fg: '#B45309' },
    edit:    { label: t('manager.approvals.chip.edit'),    bg: '#F0F4F7', fg: '#3A4F63' },
    timeoff: { label: t('manager.approvals.chip.timeoff'), bg: '#F3F0FD', fg: '#7C4FBF' },
    swap:    { label: t('manager.approvals.chip.swap'),    bg: '#EFF6FF', fg: '#2B7EC4' },
  };

  const IconComp = Icons[approvalIcon(approval.kind) as keyof typeof Icons] ?? Icons.clock;
  const kc = KIND_CHIP[approval.kind] ?? KIND_CHIP.edit;

  const origDisplay  = approval.original == null ? '—' : fmtHHMM(approval.original);
  const propDisplay  = approval.proposed == null ? '—' : fmtHHMM(approval.proposed);
  const showTimeLine = approval.original != null || approval.proposed != null;

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0F4F7', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: handled ? 0.55 : 1 }}>
      <span style={{ width: 36, height: 36, borderRadius: 8, background: kc.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <IconComp size={16} stroke={kc.fg} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 7 }}>
          <span style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: 99, background: kc.bg, color: kc.fg, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{kc.label}</span>
          <span style={{ fontSize: 11, color: '#9BAAB5' }}>· {approval.locationName} · {fmtAge(approval.createdAt)} trước</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>{approval.staffName}</span>
          <span style={{ fontSize: 12, color: '#9BAAB5' }}>· {approval.larkUserId}</span>
        </div>
        <div style={{ fontSize: 13, color: '#3A4F63', marginBottom: 8, lineHeight: 1.4 }}>{approval.body}</div>
        {showTimeLine && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#9BAAB5', textDecoration: approval.original == null ? 'none' : 'line-through' }}>{origDisplay}</span>
            <span style={{ color: '#9BAAB5' }}>→</span>
            <span style={{ fontWeight: 700, color: '#1E2D3D' }}>{propDisplay}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, minWidth: 96 }}>
        {handled ? (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, textAlign: 'center', ...(handled === 'approved' ? { color: '#00897B', background: 'rgba(0,180,160,0.1)' } : { color: '#DC2626', background: 'rgba(220,38,38,0.08)' }) }}>
            {handled === 'approved' ? t('manager.approvals.handledApproved') : t('manager.approvals.handledRejected')}
          </span>
        ) : (
          <>
            <button className="btn-approve" onClick={() => approve(approval.id)}>
              <Check size={13} stroke="currentColor" sw={2.5} /> {t('manager.approvals.approve')}
            </button>
            <button className="btn-reject" onClick={() => openDetail(approval.id, true)}>
              <X size={13} stroke="currentColor" /> {t('manager.approvals.reject')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
