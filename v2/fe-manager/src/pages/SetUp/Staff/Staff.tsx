import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Btn, Eyebrow, FilterDrop, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { STAFF, STAFF_SUMMARY, LOCATIONS, locById } from '../../../services/setup';
import { StaffRow } from './Components/StaffRow';
import { StaffDetail } from './Components/StaffDetail';
import { NewStaffDrawer } from './Components/NewStaffDrawer';

const LIMIT = 25;

interface Props { isLoading?: boolean; error?: string | null; }

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const STAT_TILE_DEFS = [
  { key: 'total',      tKey: 'setup.staff.stat.total',      color: '#00B4A0', icon: 'users'     as const },
  { key: 'managers',   tKey: 'setup.staff.stat.managers',   color: '#F59E0B', icon: 'shield'    as const },
  { key: 'multiRole',  tKey: 'setup.staff.stat.multiRole',  color: '#8B5CF6', icon: 'star'      as const },
  { key: 'rolesCount', tKey: 'setup.staff.stat.rolesCount', color: '#3B82F6', icon: 'briefcase' as const },
] as const;

export function Staff({ isLoading, error }: Props = {}) {
  const { t } = useTranslation('setup');
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [, setTick] = useState(0);

  const staffList = STAFF ?? [];
  const filtered = staffList.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(search.toLowerCase()) || s.larkUserId.toLowerCase().includes(search.toLowerCase());
    const locMatch = locFilter === 'all' || s.locationIds.includes(locFilter);
    return nameMatch && locMatch;
  });

  useEffect(() => { setPage(1); }, [search, locFilter]);

  if (isLoading) return <SetupStaffSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, filtered.length);

  const sel = selected ? staffList.find(s => s.larkUserId === selected) : null;
  const COL = 'minmax(0,2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,1.6fr) minmax(0,1.2fr)';

  return (
    <div style={{ margin: '-40px -40px -80px', padding: '36px 40px 80px', position: 'relative', minHeight: 'calc(100vh - 73px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)' }}>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .staff-row:hover { background: rgba(0,180,160,0.045) !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,160,0.22) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,61,0.08) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32, animation: 'fadeUp 350ms ease both' }}>
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>{t('setup.staff.eyebrow')}</Eyebrow>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
              {t('setup.staff.title')}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7E8E', marginTop: 8, marginBottom: 0 }}>
              {t('setup.staff.subtitle')}
            </p>
          </div>
          <Btn variant="primary" size="sm" icon={<Icons.plus size={14} />} onClick={() => setShowAdd(true)} style={{ height: 36, boxSizing: 'border-box' }}>
            {t('setup.staff.addBtn')}
          </Btn>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {STAT_TILE_DEFS.map((tile, i) => {
            const IconComp = Icons[tile.icon];
            const value = STAFF_SUMMARY[tile.key as keyof typeof STAFF_SUMMARY];
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

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', animation: 'fadeUp 500ms ease both', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', ...glass, borderRadius: 8, flex: 1, maxWidth: 300, height: 36, boxSizing: 'border-box' }}>
            <Icons.search size={14} stroke="#6B7E8E" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('setup.staff.search.placeholder')}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1E2D3D', flex: 1, minWidth: 0 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 0 }}>
                <Icons.x size={12} />
              </button>
            )}
          </div>
          <FilterDrop
            label={locFilter === 'all' ? t('setup.staff.filter.allStores') : (locById(locFilter)?.name ?? locFilter)}
            options={[{ value: 'all', label: t('setup.staff.filter.allStores') }, ...(LOCATIONS ?? []).map(l => ({ value: l.locationId, label: l.name }))]}
            value={locFilter}
            onChange={setLocFilter}
          />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9BAAB5', fontWeight: 500 }}>
            {t('setup.staff.count', { n: filtered.length })}
          </span>
        </div>

        {/* Table glass card */}
        <div style={{ ...glass, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 560ms ease both' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 20px',
            background: 'rgba(247,249,250,0.7)', borderBottom: '1px solid rgba(200,212,220,0.35)' }}>
            {[t('setup.staff.col.staff'), t('setup.staff.col.phone'), t('setup.staff.col.access'), t('setup.staff.col.role'), t('setup.staff.col.location'), t('setup.staff.col.pay')].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {paged.map((s, i) => (
            <StaffRow
              key={s.larkUserId}
              staff={s}
              borderTop={i > 0}
              isSelected={selected === s.larkUserId}
              col={COL}
              onClick={() => setSelected(selected === s.larkUserId ? null : s.larkUserId)}
            />
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,180,160,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icons.users size={24} stroke="#00B4A0" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D', marginBottom: 6 }}>{t('setup.staff.empty.title')}</div>
              <div style={{ fontSize: 13, color: '#9BAAB5' }}>{t('setup.staff.empty.sub')}</div>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px',
              borderTop: '1px solid rgba(200,212,220,0.35)', background: 'rgba(247,249,250,0.5)' }}>
              <span style={{ fontSize: 12, color: '#9BAAB5' }}>
                {t('setup.staff.pagination', { start: rangeStart, end: rangeEnd, total: filtered.length })}
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

      {sel && <StaffDetail staff={sel} onClose={() => setSelected(null)} />}

      {showAdd && (
        <NewStaffDrawer
          onClose={() => setShowAdd(false)}
          onCreate={s => {
            staffList.push(s);
            setShowAdd(false);
            setSelected(s.larkUserId);
            setTick(prev => prev + 1);
            toast.success(t('setup.staff.toast.added', { name: s.name }));
          }}
        />
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 28, height: 28, padding: '0 6px', borderRadius: 6, fontSize: 13, fontWeight: active ? 700 : 400,
        border: active ? '1.5px solid #00B4A0' : '1px solid rgba(200,212,220,0.5)',
        background: active ? '#E6F9F7' : disabled ? 'transparent' : 'rgba(255,255,255,0.6)',
        color: active ? '#00B4A0' : disabled ? '#C8D4DC' : '#3A4F63',
        cursor: disabled ? 'default' : 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 120ms',
      }}
    >
      {children}
    </button>
  );
}

function SetupStaffSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={160} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
