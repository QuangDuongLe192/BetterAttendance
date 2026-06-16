import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../components/Icons';
import { locById } from '../../../services/setup';
import { MgrRoster } from './MgrRoster';
import { MgrRosterWeek } from './MgrRosterWeek';
import { MgrRosterMonth } from './MgrRosterMonth';

type Tab = 'daily' | 'weekly' | 'monthly';

const TAB_DEFS: { id: Tab; tKey: string; icon: keyof typeof Icons }[] = [
  { id: 'daily',   tKey: 'manager.roster.tab.daily',   icon: 'calendar' },
  { id: 'weekly',  tKey: 'manager.roster.tab.weekly',  icon: 'grid'     },
  { id: 'monthly', tKey: 'manager.roster.tab.monthly', icon: 'trendUp'  },
];

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

export function MgrAttendance({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const [tab, setTab] = useState<Tab>('daily');

  return (
    <div style={{
      margin: '-36px -40px -80px', padding: '36px 40px 80px',
      position: 'relative', minHeight: 'calc(100vh - 68px)',
      background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Shared header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#00B4A0', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            {t('manager.roster.eyebrow')}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E2D3D', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            {activeStore === 'all' ? t('manager.roster.titleAll') : t('manager.roster.titleBranch', { name: locById(activeStore).name })}
          </h1>
        </div>

        {/* Glass segmented tab bar */}
        <div style={{
          display: 'inline-flex', gap: 3, padding: 4, marginBottom: 28,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.65)',
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(30,45,61,0.08)',
        }}>
          {TAB_DEFS.map(tabDef => {
            const Icon = Icons[tabDef.icon];
            const active = tab === tabDef.id;
            return (
              <button
                key={tabDef.id}
                onClick={() => setTab(tabDef.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#1E2D3D' : '#6B7E8E',
                  fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500, fontSize: 13,
                  boxShadow: active ? '0 1px 6px rgba(30,45,61,0.10)' : 'none',
                  transition: 'all 150ms',
                }}
              >
                <Icon size={14} stroke={active ? '#00B4A0' : '#9BAAB5'} />
                {t(tabDef.tKey)}
              </button>
            );
          })}
        </div>

        {tab === 'daily'   && <MgrRoster      activeStore={activeStore} isLoading={isLoading} error={error} />}
        {tab === 'weekly'  && <MgrRosterWeek  activeStore={activeStore} isLoading={isLoading} error={error} />}
        {tab === 'monthly' && <MgrRosterMonth activeStore={activeStore} isLoading={isLoading} error={error} />}
      </div>
    </div>
  );
}
