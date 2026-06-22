import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Btn, Tag, Avatar, Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { type PayrollEntry, type FinSummary, type FinByLoc, type FinLoc, fmtVND, fmtM } from '../../../services/finance';

const Users = Icons.users;
const Check = Icons.check;

type Layout = 'split' | 'table' | 'cards';

interface PayrollProps {
  payroll: PayrollEntry[];
  summary: FinSummary;
  byLoc: FinByLoc[];
  finLocs: FinLoc[];
  layout: Layout;
  onLayoutChange: (l: Layout) => void;
  onReview: (id: string) => void;
  onUnreview: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

// ─── Employee detail panel ──────────────────────────────────────────────────

function EmployeeDetail({ s, finLocs, compact, onReview, onUnreview }: Readonly<{ s: PayrollEntry | null; finLocs: FinLoc[]; compact?: boolean; onReview: (id: string) => void; onUnreview: (id: string) => void }>) {
  const { t } = useTranslation('finance');

  if (!s) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#6B7E8E' }}>
      <Users size={32} stroke="#C8D4DC"/>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>{t('finance.payroll.detail.selectHint')}</span>
    </div>
  );
  const loc = finLocs.find(l => l.id === s.loc);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: compact ? 20 : 28 }}>
      {/* identity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={s.name} size={44} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#1E2D3D' }}>{s.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: '#6B7E8E', flexWrap: 'wrap' }}>
              <span style={{  }}>{s.code}</span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: loc?.color }}/>
                {loc?.name}
              </span>
              {s.isManager && <Tag tone="teal">{t('finance.payroll.detail.manager')}</Tag>}
              {s.otHours > 0 && <Tag tone="warning">OT {s.otHours}h</Tag>}
            </div>
          </div>
        </div>
        {s.status === 'reviewed'
          ? <Tag tone="success" icon={<Check size={10}/>}>{t('finance.payroll.detail.reviewed')}</Tag>
          : <Tag tone="warning">{t('finance.payroll.detail.pending')}</Tag>}
      </div>

      {/* breakdown table */}
      <div style={{ border: '1px solid #E8ECEF', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 56px 56px 90px 100px', padding: '12px 18px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
          <span>{t('finance.payroll.detail.col.role')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.detail.col.type')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.payroll.detail.col.regHours')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.detail.col.otHours')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.payroll.detail.col.rate')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.detail.col.amount')}</span>
        </div>
        {s.items.map((it, i) => {
          const lineReg = it.type === 'hourly' ? (it.regH ?? 0) * (it.rate ?? 0) : 0;
          const lineOT  = it.type === 'hourly' ? (it.otH  ?? 0) * (it.rate ?? 0) * 1.5 : 0;
          const lineMo  = it.type === 'monthly' ? (it.monthly ?? 0) : 0;
          const otDisplay = it.type === 'monthly' ? '—' : ((it.otH ?? 0) > 0 ? `${it.otH}h` : '—');
          return (
            <>
              <div key={it.name} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 56px 56px 90px 100px', padding: '13px 18px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center', background: i % 2 ? '#FAFBFC' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: it.color }}/>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{it.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, background: it.type === 'monthly' ? '#F1E9FB' : '#E6F8F6', color: it.type === 'monthly' ? '#7C4FBF' : '#008C7C' }}>
                    {it.type === 'monthly' ? t('finance.payroll.detail.typeMonthly') : t('finance.payroll.detail.typeHourly')}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: it.type === 'monthly' ? '#C8D4DC' : '#1E2D3D' }}>{it.type === 'monthly' ? '—' : `${it.regH}h`}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: (it.otH ?? 0) > 0 ? '#B45309' : '#C8D4DC' }}>{otDisplay}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#6B7E8E' }}>{it.type === 'monthly' ? '—' : fmtVND(it.rate ?? 0)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>{fmtVND(lineReg + lineOT + lineMo)}</div>
              </div>
              {it.type === 'hourly' && (it.otH ?? 0) > 0 && (
                <div key={`ot-${it.name}`} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 56px 56px 90px 100px', padding: '7px 18px 7px 40px', background: '#FFF9F0', borderTop: '1px dashed #F0E0C0' }}>
                  <div style={{ fontSize: 11, color: '#B45309', fontStyle: 'italic' }}>{t('finance.payroll.detail.otRow')}</div>
                  <div/><div/>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#B45309' }}>{it.otH}h</div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#B45309' }}>{fmtVND((it.rate ?? 0) * 1.5)}/h</div>
                  <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#B45309' }}>{fmtVND(lineOT)}</div>
                </div>
              )}
            </>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 56px 56px 90px 100px', padding: '14px 18px', background: '#1E2D3D', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff', letterSpacing: 0.5 }}>{t('finance.payroll.detail.periodTotal')}</div>
          <div/><div/>
          <div style={{ textAlign: 'right', fontSize: 11, color: s.otHours > 0 ? '#F4B26E' : '#6B7E8E' }}>{s.otHours > 0 ? `${s.otHours}h` : '—'}</div>
          <div/>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#00B4A0', letterSpacing: '-0.01em' }}>{fmtVND(s.total)}</div>
        </div>
      </div>

      {/* pay components */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { labelKey: 'finance.payroll.detail.comp.reg',     val: s.totalReg, show: s.totalReg > 0, bg: '#F0FAF7', border: '#A8E4DC', fg: '#008C7C' },
          { labelKey: 'finance.payroll.detail.comp.ot',      val: s.totalOT,  show: true,            bg: s.totalOT > 0 ? '#FFF9F0' : '#F7F9FA', border: s.totalOT > 0 ? '#F5E2A8' : '#E8ECEF', fg: s.totalOT > 0 ? '#B45309' : '#C8D4DC' },
          { labelKey: 'finance.payroll.detail.comp.monthly', val: s.totalMonthly, show: s.totalMonthly > 0, bg: '#F1E9FB', border: '#D9C3F5', fg: '#7C4FBF' },
        ].map((c) => (
          <div key={c.labelKey} style={{ padding: '12px 14px', background: c.bg, borderRadius: 8, border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 10, color: '#6B7E8E', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t(c.labelKey)}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: c.fg, marginTop: 4 }}>{c.show && c.val > 0 ? fmtVND(c.val) : '—'}</div>
          </div>
        ))}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {s.status === 'pending'
          ? <Btn variant="primary" size="sm" icon={<Icons.check size={13}/>} onClick={() => onReview(s.id)}>{t('finance.payroll.detail.reviewBtn')}</Btn>
          : <>
              <Btn variant="ghost" size="sm" icon={<Icons.edit size={13}/>} onClick={() => onUnreview(s.id)}>{t('finance.payroll.detail.adjustBtn')}</Btn>
              <span style={{ fontSize: 12, color: '#1A6B55', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icons.check size={12} stroke="#1A6B55"/>{t('finance.payroll.detail.reviewedAt')}
              </span>
            </>}
      </div>
    </div>
  );
}

// ─── Variant A: Split/Master-detail ─────────────────────────────────────────

function PayrollSplit({ list, finLocs, summary, onReview, onUnreview }: { list: PayrollEntry[]; finLocs: FinLoc[]; summary: FinSummary; onReview: (id: string) => void; onUnreview: (id: string) => void }) {
  const { t } = useTranslation('finance');
  const [sel, setSel] = useState<PayrollEntry | null>(null);

  const currentSel = sel ? list.find(p => p.id === sel.id) ?? null : null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', border: '1px solid #C8D4DC', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <div style={{ width: 296, borderRight: '1px solid #E8ECEF', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '13px 16px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1E2D3D' }}>{t('finance.payroll.split.staffCount', { count: list.length })}</span>
          <span style={{ fontSize: 11, color: '#6B7E8E' }}>{t('finance.payroll.split.reviewedCount', { reviewed: summary.reviewed, staff: summary.staff })}</span>
        </div>
        {list.map((s, i) => {
          const loc = finLocs.find(l => l.id === s.loc);
          const active = currentSel?.id === s.id;
          return (
            <button key={s.id} onClick={() => setSel(s)} style={{ width: '100%', textAlign: 'left', padding: '13px 16px', border: 'none', borderTop: i > 0 ? '1px solid #F0F3F5' : 'none', borderLeft: `3px solid ${active ? '#00B4A0' : 'transparent'}`, background: active ? '#F7FCFB' : '#fff', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Avatar name={s.name} size={28} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{  }}>{s.code}</span>
                    <span>·</span>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: loc?.color, display: 'inline-block' }}/>
                    {loc?.short}
                    {s.otHours > 0 && <span style={{ color: '#B45309', fontWeight: 700 }}>OT {s.otHours}h</span>}
                  </div>
                </div>
                {s.status === 'reviewed'
                  ? <Icons.check size={13} stroke="#1A6B55"/>
                  : <span style={{ width: 7, height: 7, borderRadius: 999, background: '#B45309', flexShrink: 0, display: 'inline-block' }}/>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 3 }}>{s.items.map((it, ii) => <span key={ii} style={{ width: 6, height: 6, borderRadius: 2, background: it.color }}/>)}</div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{fmtM(s.total)}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EmployeeDetail s={currentSel} finLocs={finLocs} onReview={onReview} onUnreview={onUnreview}/>
      </div>
    </div>
  );
}

// ─── Variant B: Expandable table ─────────────────────────────────────────────

function PayrollTable({ list, finLocs, onReview, onUnreview }: { list: PayrollEntry[]; finLocs: FinLoc[]; onReview: (id: string) => void; onUnreview: (id: string) => void }) {
  const { t } = useTranslation('finance');
  const [exp, setExp] = useState<string | null>(null);
  const cols = '32px 1.6fr 1fr 80px 72px 110px 110px 100px 72px';

  return (
    <div style={{ border: '1px solid #C8D4DC', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 20px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
        <span/><span>{t('finance.payroll.table.col.employee')}</span><span>{t('finance.payroll.table.col.role')}</span>
        <span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.regHours')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.ot')}</span>
        <span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.monthly')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.hourly')}</span>
        <span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.total')}</span><span style={{ textAlign: 'right' }}>{t('finance.payroll.table.col.status')}</span>
      </div>
      {list.map((s, i) => {
        const loc = finLocs.find(l => l.id === s.loc);
        const isExp = exp === s.id;
        return (
          <div key={s.id}>
            <div onClick={() => setExp(isExp ? null : s.id)} style={{ display: 'grid', gridTemplateColumns: cols, padding: '15px 20px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center', cursor: 'pointer', background: isExp ? '#F7FCFB' : '#fff', transition: 'background 120ms' }}>
              <span style={{ color: '#6B7E8E', display: 'inline-block', transition: 'transform 150ms', transform: isExp ? 'rotate(90deg)' : 'none' }}><Icons.chevR size={13}/></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={s.name} size={28} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10 }}>{s.code}</span><span>·</span>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: loc?.color, display: 'inline-block' }}/>{loc?.short}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {s.items.map((it, ii) => (
                  <span key={ii} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '2px 6px', borderRadius: 999, background: it.color + '18', color: it.color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 1, background: it.color }}/>{it.name}
                  </span>
                ))}
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#1E2D3D' }}>{s.totalHours > 0 ? `${s.totalHours}h` : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: s.otHours > 0 ? '#B45309' : '#C8D4DC', fontWeight: s.otHours > 0 ? 700 : 400 }}>{s.otHours > 0 ? `${s.otHours}h` : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: s.totalMonthly > 0 ? '#7C4FBF' : '#C8D4DC' }}>{s.totalMonthly > 0 ? fmtM(s.totalMonthly) : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, color: (s.totalReg + s.totalOT) > 0 ? '#008C7C' : '#C8D4DC' }}>{(s.totalReg + s.totalOT) > 0 ? fmtM(s.totalReg + s.totalOT) : '—'}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{fmtM(s.total)}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {s.status === 'reviewed' ? <Tag tone="success" icon={<Icons.check size={9}/>}>OK</Tag> : <Tag tone="warning">{t('finance.overview.byLoc.waiting')}</Tag>}
              </div>
            </div>
            {isExp && (
              <div style={{ borderTop: '1px dashed #E8ECEF', background: '#F7FCFB' }}>
                <EmployeeDetail s={s} finLocs={finLocs} compact onReview={onReview} onUnreview={onUnreview}/>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 20px', background: '#1E2D3D', alignItems: 'center' }}>
        <span/><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{t('finance.payroll.table.totalRow', { count: list.length })}</span><span/>
        <div style={{ textAlign: 'right', fontSize: 12, color: '#C8D4DC' }}>{list.reduce((s, p) => s + p.totalHours, 0)}h</div>
        <div style={{ textAlign: 'right', fontSize: 12, color: '#F4B26E' }}>{list.reduce((s, p) => s + p.otHours, 0)}h</div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#D4B3F7' }}>{fmtM(list.reduce((s, p) => s + p.totalMonthly, 0))}</div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#7BE4D6' }}>{fmtM(list.reduce((s, p) => s + p.totalReg + p.totalOT, 0))}</div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#00B4A0', letterSpacing: '-0.01em' }}>{fmtM(list.reduce((s, p) => s + p.total, 0))}</div>
        <span/>
      </div>
    </div>
  );
}

// ─── Variant C: Cards ────────────────────────────────────────────────────────

function PayrollCards({ list, finLocs, onReview, onUnreview }: { list: PayrollEntry[]; finLocs: FinLoc[]; onReview: (id: string) => void; onUnreview: (id: string) => void }) {
  const { t } = useTranslation('finance');
  const [sel, setSel] = useState<PayrollEntry | null>(null);
  const currentSel = sel ? list.find(p => p.id === sel.id) ?? null : null;

  if (currentSel) return (
    <div>
      <button onClick={() => setSel(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#00B4A0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
        <Icons.chevR size={13} stroke="#00B4A0" style={{ transform: 'rotate(180deg)' }}/> {t('finance.payroll.cards.backBtn')}
      </button>
      <div style={{ background: '#fff', border: '1px solid #C8D4DC', borderRadius: 8 }}>
        <EmployeeDetail s={currentSel} finLocs={finLocs} onReview={onReview} onUnreview={onUnreview}/>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {list.map(s => {
        const loc = finLocs.find(l => l.id === s.loc);
        const mo = s.total > 0 ? (s.totalMonthly / s.total) * 100 : 0;
        const hr = s.total > 0 ? (s.totalReg  / s.total) * 100 : 0;
        const ot = s.total > 0 ? (s.totalOT   / s.total) * 100 : 0;
        return (
          <div key={s.id} onClick={() => setSel(s)}
            style={{ background: '#fff', border: '1px solid #C8D4DC', borderRadius: 8, padding: 20, cursor: 'pointer', transition: 'all 150ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E2D3D'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(30,45,61,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8D4DC'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={s.name} size={36} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1E2D3D', lineHeight: 1.2 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10 }}>{s.code}</span><span>·</span>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: loc?.color, display: 'inline-block' }}/>{loc?.name}
                  </div>
                </div>
              </div>
              {s.status === 'reviewed' ? <Icons.check size={14} stroke="#1A6B55"/> : <span style={{ width: 8, height: 8, borderRadius: 999, background: '#B45309', display: 'inline-block', marginTop: 4 }}/>}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
              {s.items.map((it, ii) => (
                <span key={ii} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '3px 7px', borderRadius: 999, background: it.color + '15', color: it.color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 1, background: it.color }}/>
                  {it.name}{it.type === 'hourly' && ` · ${(it.regH ?? 0) + (it.otH ?? 0)}h`}
                  {(it.otH ?? 0) > 0 && <span style={{ color: '#B45309' }}> ↑OT</span>}
                </span>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: '#F0F3F5' }}>
                {mo > 0 && <div style={{ width: `${mo}%`, background: '#7C4FBF' }}/>}
                {hr > 0 && <div style={{ width: `${hr}%`, background: '#00B4A0' }}/>}
                {ot > 0 && <div style={{ width: `${ot}%`, background: '#B45309' }}/>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 5, fontSize: 10, color: '#6B7E8E' }}>
                {s.totalMonthly > 0 && <span style={{ color: '#7C4FBF' }}>{t('finance.payroll.cards.pctMonthly', { pct: Math.round(mo) })}</span>}
                {s.totalReg > 0 && <span style={{ color: '#00B4A0' }}>{t('finance.payroll.cards.pctHourly', { pct: Math.round(hr) })}</span>}
                {s.totalOT > 0 && <span style={{ color: '#B45309' }}>{t('finance.payroll.cards.pctOT', { pct: Math.round(ot) })}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14, borderTop: '1px solid #E8ECEF', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6B7E8E' }}>{t('finance.payroll.cards.periodTotal')}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', color: '#1E2D3D' }}>{fmtVND(s.total)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PayrollScreen: wrapper ──────────────────────────────────────────────────

export function FinPayroll({ payroll, summary, byLoc, finLocs, layout, onLayoutChange, onReview, onUnreview, isLoading, error }: PayrollProps) {
  const { t } = useTranslation('finance');
  const [locFilter, setLocFilter] = useState<string | null>(null);

  if (isLoading) return <FinPayrollSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const safePayroll = payroll ?? [];
  const safeByLoc = byLoc ?? [];
  const list = locFilter ? safePayroll.filter(p => p.loc === locFilter) : safePayroll;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Eyebrow style={{ marginBottom: 8 }}>{t('finance.payroll.eyebrow')}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{t('finance.payroll.title')}</h1>
            <span style={{ fontSize: 15, color: '#6B7E8E', fontWeight: 500 }}>{t('finance.payroll.subtitle')}</span>
          </div>
          <p style={{ fontSize: 14, color: '#3A4F63', marginTop: 6, marginBottom: 0 }}>
            {t('finance.payroll.reviewedStatus', { reviewed: summary.reviewed, staff: summary.staff })} ·{' '}
            <span style={{ color: summary.pending > 0 ? '#B45309' : '#1A6B55', fontWeight: 600 }}>
              {summary.pending > 0 ? t('finance.payroll.pendingCount', { count: summary.pending }) : t('finance.payroll.readyToApprove')}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#F0F3F5', borderRadius: 8, padding: 4, gap: 3 }}>
            {([['split', 'finance.payroll.layout.split', 'grid'], ['table', 'finance.payroll.layout.table', 'scroll'], ['cards', 'finance.payroll.layout.cards', 'users']] as const).map(([v, labelKey, icon]) => {
              const IconComp = Icons[icon];
              return (
                <button key={v} onClick={() => onLayoutChange(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, transition: 'all 150ms', background: layout === v ? '#1E2D3D' : 'transparent', color: layout === v ? '#fff' : '#6B7E8E' }}>
                  <IconComp size={13}/>{t(labelKey)}
                </button>
              );
            })}
          </div>
          <Btn variant="secondary" size="sm" icon={<Icons.download size={13}/>}>{t('finance.payroll.exportCsv')}</Btn>
        </div>
      </div>

      {/* location filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setLocFilter(null)} style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${!locFilter ? '#1E2D3D' : '#C8D4DC'}`, background: !locFilter ? '#1E2D3D' : '#fff', color: !locFilter ? '#fff' : '#3A4F63', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 120ms' }}>
          {t('finance.payroll.filter.all', { count: safePayroll.length })}
        </button>
        {safeByLoc.map(l => (
          <button key={l.id} onClick={() => setLocFilter(l.id)} style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${locFilter === l.id ? l.color : '#C8D4DC'}`, background: locFilter === l.id ? l.color : '#fff', color: locFilter === l.id ? '#fff' : '#3A4F63', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 120ms', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: locFilter === l.id ? 'rgba(255,255,255,0.7)' : l.color }}/>
            {l.name} ({l.count})
            {l.reviewed < l.count && <span style={{ background: 'rgba(255,255,255,0.25)', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>⚠ {l.count - l.reviewed}</span>}
          </button>
        ))}
      </div>

      {layout === 'split' && <PayrollSplit list={list} finLocs={finLocs} summary={summary} onReview={onReview} onUnreview={onUnreview}/>}
      {layout === 'table' && <PayrollTable list={list} finLocs={finLocs} onReview={onReview} onUnreview={onUnreview}/>}
      {layout === 'cards' && <PayrollCards list={list} finLocs={finLocs} onReview={onReview} onUnreview={onUnreview}/>}
    </div>
  );
}

function FinPayrollSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={220} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      </div>
    </div>
  );
}
