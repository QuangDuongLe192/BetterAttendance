import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/components/Icons';
import { REQUEST_TYPES } from '../lib/requestHelpers';

const TYPE_ICON = {
  leave: Icons.calendar,
  late:  Icons.clock,
  early: Icons.arrowR,
} as const;

export function CreateTab() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--c-teal-light) 0%, rgba(0,180,160,0.06) 100%)',
        border: '1px solid rgba(0,180,160,0.2)',
        borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 4,
      }}>
        <p style={{ fontSize: 13, color: 'var(--c-teal-dark)', lineHeight: 1.5, margin: 0 }}>
          {t('requests.createHint')}
        </p>
      </div>

      {REQUEST_TYPES.map(({ type, colorClass, accentColor }) => {
        const TypeIcon = TYPE_ICON[type];
        return (
          <button
            key={type}
            onClick={() => navigate(`/requests/create/${type}`)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--line-1)',
              borderRadius: 'var(--r-lg)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all var(--t-fast) var(--ease-out)',
              borderLeft: `3px solid ${accentColor}`,
            }}
            className="cd-request-row"
          >
            <span className={`cd-setting__icon ${colorClass}`} style={{
              width: 40, height: 40, borderRadius: 'var(--r-md)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TypeIcon size={18} sw={1.75} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
                {t(`requests.types.${type}`)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>
                {t(`requests.desc.${type}`)}
              </div>
            </div>
            <Icons.chevR size={16} sw={2} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
          </button>
        );
      })}
    </div>
  );
}
