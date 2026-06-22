import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { Card, Tag, Btn, Avatar, Eyebrow, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { type PayrollEntry, type FinHistory as FinHistoryItem, type FinLoc, fmtVND, fmtM } from '../../../services/finance';

const ChevR = Icons.chevR;
const Lock = Icons.lock;
const Download = Icons.download;
const Scroll = Icons.scroll;
const ChevD = Icons.chevD;

interface Props {
  history: FinHistoryItem[];
  payroll: PayrollEntry[];
  finLocs: FinLoc[];
  isLoading?: boolean;
  error?: string | null;
}

export function FinHistory({ history, payroll, finLocs, isLoading, error }: Readonly<Props>) {
  const { t } = useTranslation('finance');
  const [sel, setSel] = useState<FinHistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
  const [chartPeriod, setChartPeriod] = useState(6);
  const [filterMonth, setFilterMonth] = useState('all');

  const safeHistory = history ?? [];
  const displayHistory = viewMode === 'recent' ? safeHistory.slice(0, 6) : safeHistory;
  const maxP = displayHistory.length > 0 ? Math.max(...displayHistory.map(p => p.total)) : 0;

  const totals = {
    all: displayHistory.reduce((s, p) => s + p.total, 0),
    avg: displayHistory.reduce((s, p) => s + p.total, 0) / (displayHistory.length || 1),
    min: displayHistory.length > 0 ? Math.min(...displayHistory.map(p => p.total)) : 0,
    max: displayHistory.length > 0 ? Math.max(...displayHistory.map(p => p.total)) : 0,
  };

  const chartData = safeHistory.slice(0, chartPeriod).reverse();
  const chartMax = chartData.length > 0 ? Math.max(...chartData.map(p => p.total)) : 0;
  const chartMin = chartData.length > 0 ? Math.min(...chartData.map(p => p.total)) : 0;

  useEffect(() => {
    const barEl = document.querySelector('.fin-chart-scroll') as HTMLElement | null;
    const lblEl = document.getElementById('fin-chart-labels');
    if (!barEl || !lblEl) return;
    const syncBar = () => { lblEl.scrollLeft = barEl.scrollLeft; };
    const syncLbl = () => { barEl.scrollLeft = lblEl.scrollLeft; };
    barEl.addEventListener('scroll', syncBar);
    lblEl.addEventListener('scroll', syncLbl);
    return () => { barEl.removeEventListener('scroll', syncBar); lblEl.removeEventListener('scroll', syncLbl); };
  }, [chartPeriod]);

  if (isLoading) return <FinHistorySkeleton />;
  if (error) return <ErrorBanner message={error} />;

  if (sel) {
    const staff = payroll.map(s => ({ ...s, total: Math.round(s.total * (0.92 + Math.random() * 0.16)), status: 'reviewed' as const }));
    const periodMonthly = staff.reduce((s, p) => s + p.totalMonthly, 0);
    const periodHourly  = staff.reduce((s, p) => s + p.totalReg, 0);
    const periodOT      = staff.reduce((s, p) => s + p.totalOT, 0);

    return (
      <div>
        <button onClick={() => setSel(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '8px 14px', background: 'transparent', border: '1px solid #C8D4DC', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0F3F5'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <ChevR size={14} stroke="#1E2D3D" style={{ transform: 'rotate(180deg)' }}/>{t('finance.history.detail.backBtn')}
        </button>

        <div style={{ marginBottom: 32 }}>
          <Eyebrow style={{ marginBottom: 8 }}>{t('finance.history.detail.eyebrow')}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{sel.period}</h1>
            <span style={{ fontSize: 15, color: '#6B7E8E', fontWeight: 500 }}>{sel.start} — {sel.end}</span>
            <Tag tone="success" icon={<Lock size={10}/>}>{t('finance.history.detail.locked', { date: sel.locked.slice(0, 10) })}</Tag>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { id: 'total',   label: t('finance.history.detail.card.total'),   val: fmtVND(sel.total), sub: t('finance.history.detail.card.staffCount', { count: sel.staff }), accent: true },
            { id: 'monthly', label: t('finance.history.detail.card.monthly'), val: fmtM(periodMonthly), sub: t('finance.history.detail.card.pct', { pct: Math.round(periodMonthly / sel.total * 100) }), color: '#7C4FBF' },
            { id: 'hourly',  label: t('finance.history.detail.card.hourly'),  val: fmtM(periodHourly),  sub: t('finance.history.detail.card.pct', { pct: Math.round(periodHourly  / sel.total * 100) }), color: '#00B4A0' },
            { id: 'ot',      label: t('finance.history.detail.card.ot'),      val: fmtM(periodOT),       sub: t('finance.history.detail.card.otStaff', { count: staff.filter(s => s.totalOT > 0).length }), color: '#B45309' },
          ].map((c) => (
            <Card key={c.id} style={{ padding: 22, background: c.accent ? '#1E2D3D' : '#fff', borderColor: c.accent ? '#1E2D3D' : '#C8D4DC' }}>
              <div style={{ fontSize: 11, color: c.accent ? '#6AB3E8' : '#6B7E8E', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 10 }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: c.accent ? 22 : 26, letterSpacing: '-0.02em', color: c.accent ? '#fff' : (c.color || '#1E2D3D') }}>{c.val}</div>
              <div style={{ fontSize: 12, color: c.accent ? '#C8D4DC' : '#6B7E8E', marginTop: 6 }}>{c.sub}</div>
            </Card>
          ))}
        </div>

        <Card pad={false} style={{ marginBottom: 24 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Eyebrow style={{ marginBottom: 4 }}>{t('finance.history.detail.table.eyebrow')}</Eyebrow>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', margin: 0 }}>{t('finance.history.detail.table.title', { count: staff.length })}</h3>
            </div>
            <Btn variant="secondary" size="sm" icon={<Download size={13}/>}>{t('finance.history.detail.table.downloadBtn')}</Btn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 90px 100px 100px 90px 110px', padding: '12px 24px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
            <span>{t('finance.history.detail.table.col.employee')}</span><span>{t('finance.history.detail.table.col.role')}</span>
            <span style={{ textAlign: 'right' }}>{t('finance.history.detail.table.col.monthly')}</span><span style={{ textAlign: 'right' }}>{t('finance.history.detail.table.col.hourly')}</span>
            <span style={{ textAlign: 'right' }}>{t('finance.history.detail.table.col.ot')}</span><span style={{ textAlign: 'right' }}>{t('finance.history.detail.table.col.hours')}</span>
            <span style={{ textAlign: 'right' }}>{t('finance.history.detail.table.col.total')}</span>
          </div>
          {staff.map((s, i) => {
            const loc = finLocs.find(l => l.id === s.loc);
            return (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 90px 100px 100px 90px 110px', padding: '15px 24px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center', background: i % 2 ? '#FAFBFC' : '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={s.name} size={28} bg={s.isManager ? '#00B4A0' : '#1E2D3D'}/>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10 }}>{s.code}</span><span>·</span>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: loc?.color ?? '#ccc', display: 'inline-block' }}/>{loc?.short ?? '?'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {s.items.map((it) => <span key={it.name} style={{ fontSize: 9, padding: '2px 5px', borderRadius: 999, background: it.color + '18', color: it.color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{it.name}</span>)}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: s.totalMonthly > 0 ? '#7C4FBF' : '#C8D4DC' }}>{s.totalMonthly > 0 ? fmtM(s.totalMonthly) : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: s.totalReg > 0 ? '#008C7C' : '#C8D4DC' }}>{s.totalReg > 0 ? fmtM(s.totalReg) : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: s.totalOT > 0 ? '#B45309' : '#C8D4DC' }}>{s.totalOT > 0 ? fmtM(s.totalOT) : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#6B7E8E' }}>{s.totalHours > 0 ? `${s.totalHours}h` : '—'}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E2D3D' }}>{fmtM(s.total)}</div>
              </div>
            );
          })}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 90px 100px 100px 90px 110px', padding: '14px 24px', background: '#1E2D3D', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{t('finance.history.detail.table.totalRow')}</span><span/>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#D4B3F7' }}>{fmtM(periodMonthly)}</div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#7BE4D6' }}>{fmtM(periodHourly)}</div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#F4B26E' }}>{fmtM(periodOT)}</div>
            <span/>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#00B4A0', letterSpacing: '-0.01em' }}>{fmtM(sel.total)}</div>
          </div>
        </Card>

        <Card>
          <Eyebrow style={{ marginBottom: 6 }}>{t('finance.history.detail.exports.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', marginBottom: 18, marginTop: 4 }}>{t('finance.history.detail.exports.title')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { format: t('finance.history.detail.exports.csvFormat'),  date: sel.locked, size: '124 KB', by: sel.lockedBy },
              { format: t('finance.history.detail.exports.misaFormat'), date: sel.locked, size: '186 KB', by: sel.lockedBy },
            ].map((f) => (
              <div key={f.format} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#F7F9FA', borderRadius: 8, border: '1px solid #E8ECEF' }}>
                <span style={{ width: 36, height: 36, borderRadius: 6, background: '#E6F8F6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Scroll size={16} stroke="#00B4A0"/>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1E2D3D' }}>{f.format}</div>
                  <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 2 }}>{t('finance.history.detail.exports.exportedAt', { date: f.date, size: f.size, by: f.by.split(' ').slice(-2).join(' ') })}</div>
                </div>
                <Btn variant="ghost" size="sm" icon={<Download size={12}/>}>{t('finance.history.detail.exports.downloadBtn')}</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Eyebrow style={{ marginBottom: 8 }}>{t('finance.history.eyebrow')}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#1E2D3D', margin: 0 }}>{t('finance.history.title')}</h1>
            <p style={{ fontSize: 14, color: '#3A4F63', marginTop: 6, marginBottom: 0 }}>{t('finance.history.displayCount', { count: displayHistory.length })} · {t('finance.history.exportedCount', { exported: safeHistory.filter(p => p.exported).length, total: safeHistory.length })}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#F0F3F5', borderRadius: 8, padding: 4, gap: 3 }}>
              {([['recent', t('finance.history.view.recent')], ['all', t('finance.history.view.all', { count: history.length })]] as const).map(([v, label]) => (
                <button key={v} onClick={() => setViewMode(v)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, transition: 'all 150ms', background: viewMode === v ? '#1E2D3D' : 'transparent', color: viewMode === v ? '#fff' : '#6B7E8E' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <select value={filterMonth} onChange={e => { const v = e.target.value; setFilterMonth(v); if (v !== 'all') setSel(safeHistory.find(p => p.period === v) ?? null); }}
                style={{ padding: '10px 36px 10px 16px', borderRadius: 8, border: '1px solid #C8D4DC', background: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#1E2D3D', cursor: 'pointer', appearance: 'none', minWidth: 220 }}>
                <option value="all">{t('finance.history.select.placeholder')}</option>
                {safeHistory.map(p => <option key={p.period} value={p.period}>{p.period}</option>)}
              </select>
              <ChevD size={14} stroke="#6B7E8E" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { id: 'total', label: t('finance.history.stat.total'),   val: fmtM(totals.all), sub: viewMode === 'recent' ? t('finance.history.stat.recentSub') : t('finance.history.stat.periodsSub', { count: displayHistory.length }), color: '#1E2D3D' },
          { id: 'avg',   label: t('finance.history.stat.avg'),     val: fmtM(totals.avg), sub: t('finance.history.stat.avgSub', { count: displayHistory.length }), color: '#00B4A0' },
          { id: 'max',   label: t('finance.history.stat.max'),     val: fmtM(totals.max), sub: displayHistory.find(p => p.total === totals.max)?.period ?? '', color: '#B45309' },
          { id: 'min',   label: t('finance.history.stat.min'),     val: fmtM(totals.min), sub: displayHistory.find(p => p.total === totals.min)?.period ?? '', color: '#2B7EC4' },
        ].map((c) => (
          <Card key={c.id} style={{ padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.color, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#1E2D3D', marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: '#6B7E8E' }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E8ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Eyebrow style={{ marginBottom: 4 }}>{t('finance.history.chart.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', margin: 0 }}>{t('finance.history.chart.title')}</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 6, 12].map(n => (
              <button key={n} onClick={() => setChartPeriod(n)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${chartPeriod === n ? '#00B4A0' : '#C8D4DC'}`, background: chartPeriod === n ? '#00B4A015' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: chartPeriod === n ? '#00B4A0' : '#6B7E8E', transition: 'all 150ms' }}>
                {t('finance.history.chart.nMonths', { n })}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '18px 24px 24px' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 50, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 192, marginBottom: 28, flexShrink: 0 }}>
              {[100, 75, 50, 25, 0].map(pct => (
                <div key={pct} style={{ fontSize: 10, color: '#9EAFBD', textAlign: 'right' }}>
                  {fmtM(Math.round(chartMax * pct / 100))}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 192, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {[0, 25, 50, 75, 100].map(pct => (
                    <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `${pct}%`, height: 1, background: pct === 0 ? '#C8D4DC' : '#E8ECEF' }}/>
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, overflowX: 'auto', overflowY: 'hidden' }} className="fin-chart-scroll">
                  <div style={{ display: 'flex', gap: 8, height: '100%', width: '100%', alignItems: 'flex-end' }}>
                    {chartData.map((p, i) => {
                      const range = chartMax - chartMin;
                      const h = range > 0 ? (p.total - chartMin) / range * 85 + 15 : 50;
                      const isCurrent = i === chartData.length - 1;
                      const isMax = p.total === chartMax;
                      const isMin = p.total === Math.min(...chartData.map(d => d.total));
                      let barColor = '#C8D4DC';
                      if (isCurrent) barColor = '#00B4A0';
                      else if (isMax) barColor = '#B45309';
                      else if (isMin) barColor = '#2B7EC4';
                      return (
                        <div key={p.period} style={{ flex: '1', height: `${h}%`, background: barColor, borderRadius: '4px 4px 0 0', transition: 'height 300ms', position: 'relative', minHeight: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 7 }}>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>{fmtM(p.total)}</span>
                          {isCurrent && <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, borderRadius: '50%', background: '#00B4A0', border: '2px solid #fff' }}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div id="fin-chart-labels" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <div style={{ display: 'flex', gap: 8, width: '100%', paddingTop: 6 }}>
                  {chartData.map((p, i) => (
                    <div key={p.period} style={{ flex: 1, minWidth: 0, fontSize: 10, color: i === chartData.length - 1 ? '#00B4A0' : '#6B7E8E', textAlign: 'center', fontWeight: i === chartData.length - 1 ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.period.replace(t('finance.history.chart.stripPrefix'), '')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Period timeline table */}
      <Card pad={false}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Eyebrow style={{ marginBottom: 4 }}>{t('finance.history.timeline.eyebrow')}</Eyebrow>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E2D3D', margin: 0 }}>{t('finance.history.timeline.periodCount', { count: displayHistory.length })}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#6B7E8E' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#1A6B55' }}/>{t('finance.history.timeline.exportedLegend')}
            </span>
            <span>· {safeHistory.filter(p => p.exported).length}/{safeHistory.length}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 90px 90px 140px 110px 80px', padding: '12px 24px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7E8E' }}>
          <span>{t('finance.history.timeline.col.period')}</span><span>{t('finance.history.timeline.col.range')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.history.timeline.col.staff')}</span><span style={{ textAlign: 'right' }}>{t('finance.history.timeline.col.total')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.history.timeline.col.lockedAt')}</span><span style={{ textAlign: 'right' }}>{t('finance.history.timeline.col.lockedBy')}</span>
          <span style={{ textAlign: 'right' }}>{t('finance.history.timeline.col.status')}</span>
        </div>
        {displayHistory.map((p, i) => {
          const pct = (maxP > 0 ? p.total / maxP * 100 : 0).toFixed(0);
          const periodBarColor = p.total === totals.max ? '#B45309' : p.total === totals.min ? '#2B7EC4' : '#00B4A0';
          return (
            <div key={p.period}
              role="button"
              tabIndex={0}
              style={{ display: 'grid', gridTemplateColumns: '180px 1fr 90px 90px 140px 110px 80px', padding: '16px 24px', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none', alignItems: 'center', background: i % 2 ? '#FAFBFC' : '#fff', cursor: 'pointer', transition: 'background 150ms' }}
              onClick={() => setSel(p)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSel(p); }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FCFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 ? '#FAFBFC' : '#fff'; }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1E2D3D' }}>{p.period}</div>
                <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 2 }}>{p.start.slice(0, 5)} — {p.end.slice(0, 5)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 8, background: '#F0F3F5', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: periodBarColor, borderRadius: 999, transition: 'width 600ms cubic-bezier(0.2,0.7,0.2,1)' }}/>
                </div>
                <span style={{ fontSize: 11, color: '#6B7E8E', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#1E2D3D' }}>{p.staff}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1E2D3D' }}>{fmtM(p.total)}</div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#6B7E8E' }}>{p.locked.slice(0, 10)}<br/><span style={{ fontSize: 10 }}>{p.locked.slice(11)}</span></div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#6B7E8E' }}>{p.lockedBy.split(' ').slice(-2).join(' ')}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {p.exported ? <Tag tone="success" icon={<Icons.check size={9}/>}>{t('finance.history.timeline.exported')}</Tag> : <Tag tone="neutral">{t('finance.history.timeline.pendingExport')}</Tag>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function FinHistorySkeleton() {
  return (
    <div>
      <Skeleton h={32} w={240} style={{ marginBottom: 32 }} />
      <SkeletonCard lines={4} style={{ height: 240, marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
