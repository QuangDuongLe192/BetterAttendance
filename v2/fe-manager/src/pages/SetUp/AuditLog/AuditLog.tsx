import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eyebrow, FilterDrop, Avatar, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { AUDIT } from '../../../services/setup';
import type { AuditEntry } from '../../../services/setup';
import { fmtMs } from '../../../lib/fmt';

interface Props { isLoading?: boolean; error?: string | null; }

function buildTypeMeta(t: (k: string) => string): Record<AuditEntry['type'], { label: string; color: string; bg: string; icon: keyof typeof Icons }> {
  return {
    wifi:     { label: t('setup.auditlog.type.wifi'),     color: '#00B4A0', bg: 'rgba(0,180,160,0.1)',    icon: 'wifi'      },
    geo:      { label: t('setup.auditlog.type.geo'),      color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   icon: 'target'    },
    role:     { label: t('setup.auditlog.type.role'),     color: '#6B7E8E', bg: 'rgba(107,126,142,0.12)', icon: 'briefcase' },
    rate:     { label: t('setup.auditlog.type.rate'),     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   icon: 'coins'     },
    att:      { label: t('setup.auditlog.type.att'),      color: '#6366F1', bg: 'rgba(99,102,241,0.1)',   icon: 'clock'     },
    loc:      { label: t('setup.auditlog.type.loc'),      color: '#9BAAB5', bg: 'rgba(155,170,181,0.12)', icon: 'pin'       },
    approval: { label: t('setup.auditlog.type.approval'), color: '#10B981', bg: 'rgba(16,185,129,0.1)',   icon: 'check'     },
    request:  { label: t('setup.auditlog.type.request'),  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',   icon: 'send'      },
  };
}

const STAT_TILE_DEFS = [
  { key: 'total',   tKey: 'setup.auditlog.stat.total',  color: '#00B4A0', icon: 'clock'     as const },
  { key: 'today',   tKey: 'setup.auditlog.stat.today',  color: '#F59E0B', icon: 'calendar'  as const },
  { key: 'week',    tKey: 'setup.auditlog.stat.week',   color: '#3B82F6', icon: 'trendUp'   as const },
  { key: 'actors',  tKey: 'setup.auditlog.stat.actors', color: '#8B5CF6', icon: 'users'     as const },
] as const;

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const localDateStr = (ms = Date.now()) => {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const TODAY = localDateStr();
const LIMIT = 25;

const COL = '148px minmax(0,1.6fr) 110px minmax(0,2fr) minmax(0,1.8fr)';

export function AuditLog({ isLoading, error }: Props = {}) {
  const { t } = useTranslation('setup');
  const TYPE_META = buildTypeMeta(t);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(TODAY);
  const [dateTo, setDateTo] = useState(TODAY);
  const [page, setPage] = useState(1);

  const auditList = AUDIT ?? [];
  const filtered = auditList.filter(a => {
    if (!dateFrom || !dateTo) return false;
    const typeMatch = typeFilter === 'all' || a.type === typeFilter;
    const q = search.toLowerCase();
    const searchMatch = !search ||
      a.actor.name.toLowerCase().includes(q) ||
      a.target.toLowerCase().includes(q) ||
      a.event.toLowerCase().includes(q);
    const fromMs = new Date(dateFrom).getTime();
    const toMs = new Date(dateTo).getTime() + 86399999;
    const dateMatch = a.t >= fromMs && a.t <= toMs;
    return typeMatch && searchMatch && dateMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const todayCount = auditList.filter(a => localDateStr(a.t) === TODAY).length;
  const weekAgo = Date.now() - 7 * 86400000;
  const weekCount = auditList.filter(a => a.t >= weekAgo).length;
  const actorCount = new Set(auditList.map(a => a.actor.larkUserId)).size;

  const statValues = { total: auditList.length, today: todayCount, week: weekCount, actors: actorCount };

  if (isLoading) return <SetupAuditLogSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div style={{
      margin: '-40px -40px -80px', padding: '36px 40px 80px', position: 'relative',
      minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .audit-row:hover { background: rgba(0,180,160,0.035) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32, animation: 'fadeUp 350ms ease both' }}>
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>{t('setup.auditlog.eyebrow')}</Eyebrow>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 8px' }}>
              {t('setup.auditlog.title')}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7E8E', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icons.lock size={12} stroke="#9BAAB5" />
              {t('setup.auditlog.subtitle')}
            </p>
          </div>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            height: 36, padding: '0 16px', borderRadius: 8,
            ...glass, fontSize: 13, fontWeight: 600, color: '#3A4F63',
            border: '1px solid rgba(200,212,220,0.5)', cursor: 'pointer',
          }}>
            <Icons.download size={14} stroke="#6B7E8E" />
            {t('setup.auditlog.exportCsv')}
          </button>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {STAT_TILE_DEFS.map((tile, i) => {
            const IconComp = Icons[tile.icon];
            const value = statValues[tile.key];
            return (
              <div key={tile.key} style={{ ...glass, borderRadius: 14, padding: '20px 22px', borderTop: `3px solid ${tile.color}`,
                animation: `fadeUp ${350 + i * 55}ms ease both` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tile.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={18} stroke={tile.color} />
                  </div>
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: tile.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7E8E', marginTop: 6 }}>{t(tile.tKey)}</div>
              </div>
            );
          })}
        </div>

        {/* Filter toolbar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap', animation: 'fadeUp 500ms ease both', position: 'relative', zIndex: 10 }}>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', ...glass, borderRadius: 8, flex: 1, minWidth: 180, maxWidth: 260, height: 36, boxSizing: 'border-box' }}>
            <Icons.search size={14} stroke="#6B7E8E" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('setup.auditlog.search.placeholder')}
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1E2D3D', background: 'transparent', flex: 1, minWidth: 0 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 0 }}>
                <Icons.x size={12} />
              </button>
            )}
          </div>

          {/* Type filter */}
          <FilterDrop
            label={typeFilter === 'all' ? t('setup.auditlog.filter.allTypes') : TYPE_META[typeFilter as AuditEntry['type']]?.label ?? typeFilter}
            options={[
              { value: 'all', label: t('setup.auditlog.filter.allTypes') },
              ...Object.entries(TYPE_META).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
          />

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', ...glass, borderRadius: 8, height: 36, boxSizing: 'border-box' }}>
            <Icons.calendar size={13} stroke="#6B7E8E" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              style={{ border: 'none', outline: 'none', fontSize: 12, color: '#1E2D3D', background: 'transparent', width: 116 }}
            />
            <span style={{ fontSize: 12, color: '#C8D4DC' }}>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              style={{ border: 'none', outline: 'none', fontSize: 12, color: '#1E2D3D', background: 'transparent', width: 116 }}
            />
            {(dateFrom !== TODAY || dateTo !== TODAY) && (
              <button onClick={() => { setDateFrom(TODAY); setDateTo(TODAY); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 0 }}>
                <Icons.x size={12} />
              </button>
            )}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9BAAB5', fontWeight: 500 }}>
            {t('setup.auditlog.count', { n: filtered.length })}
          </span>
        </div>

        {/* Table glass card */}
        <div style={{ ...glass, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 560ms ease both' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 22px',
            background: 'rgba(247,249,250,0.7)', borderBottom: '1px solid rgba(200,212,220,0.35)' }}>
            {[t('setup.auditlog.col.time'), t('setup.auditlog.col.actor'), t('setup.auditlog.col.type'), t('setup.auditlog.col.event'), t('setup.auditlog.col.change')].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {paged.map((a, i) => (
            <AuditRow key={i} entry={a} borderTop={i > 0} col={COL} typeMeta={TYPE_META} />
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,180,160,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icons.clock size={24} stroke="#00B4A0" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D', marginBottom: 6 }}>{t('setup.auditlog.empty.title')}</div>
              <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('setup.auditlog.empty.sub')}</div>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px',
              borderTop: '1px solid rgba(200,212,220,0.35)', background: 'rgba(247,249,250,0.5)' }}>
              <span style={{ fontSize: 12, color: '#9BAAB5' }}>
                {t('setup.auditlog.pagination', { start: filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1, end: Math.min(page * LIMIT, filtered.length), total: filtered.length })}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PageBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PageBtn>
                ))}
                <PageBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</PageBtn>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function AuditRow({ entry, borderTop, col, typeMeta }: { entry: AuditEntry; borderTop: boolean; col: string; typeMeta: ReturnType<typeof buildTypeMeta> }) {
  const meta = typeMeta[entry.type];
  const IconComp = Icons[meta.icon];

  return (
    <div className="audit-row" style={{
      display: 'grid', gridTemplateColumns: col,
      padding: '12px 22px', alignItems: 'center',
      borderTop: borderTop ? '1px solid rgba(200,212,220,0.28)' : 'none',
      transition: 'background 100ms',
    }}>
      {/* Timestamp */}
      <div style={{ fontSize: 11, color: '#9BAAB5', lineHeight: 1.5 }}>
        {fmtMs(entry.t)}
      </div>

      {/* Actor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Avatar name={entry.actor.name} size={26} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#1E2D3D', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.actor.name}</div>
          <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{entry.actor.role}</div>
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
          background: meta.bg, color: meta.color,
          border: `1px solid ${meta.color}28`,
        }}>
          <IconComp size={10} stroke={meta.color} />
          {meta.label}
        </span>
      </div>

      {/* Event + target */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#9BAAB5', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.event}</div>
        <div style={{ fontSize: 13, color: '#3A4F63', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.target}</div>
      </div>

      {/* Before → After */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
        {entry.before != null && (
          <>
            <span style={{ fontSize: 12, color: '#9BAAB5', textDecoration: 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{entry.before}</span>
            <Icons.chevR size={11} stroke="#C8D4DC" style={{ flexShrink: 0 }} />
          </>
        )}
        <span style={{ fontSize: 12, color: '#1E2D3D', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{entry.after}</span>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 28, height: 28, padding: '0 6px', borderRadius: 6, fontSize: 13, fontWeight: active ? 700 : 400,
      border: active ? '1.5px solid #00B4A0' : '1px solid rgba(200,212,220,0.5)',
      background: active ? '#E6F9F7' : disabled ? 'transparent' : 'rgba(255,255,255,0.6)',
      color: active ? '#00B4A0' : disabled ? '#C8D4DC' : '#3A4F63',
      cursor: disabled ? 'default' : 'pointer',
      backdropFilter: 'blur(8px)',
      transition: 'all 120ms',
    }}>
      {children}
    </button>
  );
}

function SetupAuditLogSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={200} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
