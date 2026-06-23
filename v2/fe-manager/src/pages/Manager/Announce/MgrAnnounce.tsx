import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
import { ANNOUNCEMENTS } from '../../../services/manager';
import { locById, LOCATIONS } from '../../../services/setup';
import { useAuth } from '../../../stores/AuthContext';
import type { Announcement } from '../../../services/manager';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1.5px solid rgba(200,212,220,0.45)',
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(12px)',
  fontSize: 13,
  color: '#1E2D3D',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

interface Props { isLoading?: boolean; error?: string | null; }

export function MgrAnnounce({ isLoading, error }: Props = {}) {
  const { t } = useTranslation('manager');
  const { user } = useAuth();
  const isAdmin = user?.access.some(a => a.type === 'ADMIN') ?? false;
  const mgrStores = isAdmin
    ? LOCATIONS.map(l => l.locationId)
    : [...new Set((user?.access ?? []).filter(a => a.type === 'MANAGER' && a.locationId).map(a => a.locationId as string))];

  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState(() => mgrStores[0] ?? '');

  if (isLoading) return <MgrAnnounceSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const Send = Icons.send;
  const send = () => {
    setCompose(false);
    setTitle('');
    setBody('');
  };

  return (
    <div style={{ margin: '-36px -40px -80px', padding: '36px 40px 80px', background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'fadeUp 350ms ease both' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{t('manager.announce.eyebrow')}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', margin: 0 }}>{t('manager.announce.title')}</h1>
        <p style={{ fontSize: 13, color: '#6B7E8E', marginTop: 4, marginBottom: 0 }}>{t('manager.announce.subtitle')}</p>
      </div>

      {/* Compose trigger / form */}
      {compose ? (
        <div style={{ ...glass, borderRadius: 14, marginBottom: 24, overflow: 'hidden' }}>
          {/* Form header */}
          <div style={{ background: 'linear-gradient(145deg, rgba(30,45,61,0.88) 0%, rgba(0,90,78,0.84) 100%)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,180,160,0.15)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,180,160,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={15} stroke="rgba(255,255,255,0.9)" />
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{t('manager.announce.compose.title')}</span>
            </div>
            <button onClick={() => setCompose(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: '5px 7px', borderRadius: 7, color: 'rgba(255,255,255,0.7)', display: 'flex', position: 'relative' }}>
              <Icons.x size={14} stroke="currentColor" />
            </button>
          </div>

          {/* Form body */}
          <div style={{ padding: '20px 24px', background: '#f7f9fa', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Scope */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3A4F63', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{t('manager.announce.compose.scopeLabel')}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([...mgrStores, 'all'] as string[]).map(sid => {
                  const label = sid === 'all' ? t('manager.announce.compose.scopeAll') : locById(sid).name;
                  const active = scope === sid;
                  return (
                    <button key={sid} onClick={() => setScope(sid)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? '#1E2D3D' : 'rgba(200,212,220,0.5)'}`, background: active ? '#1E2D3D' : 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : '#3A4F63', transition: 'all 120ms' }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3A4F63', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{t('manager.announce.compose.titleLabel')}</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={t('manager.announce.compose.titlePlaceholder')}
                style={inputStyle} />
            </div>

            {/* Body */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3A4F63', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{t('manager.announce.compose.bodyLabel')}</label>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder={t('manager.announce.compose.bodyPlaceholder')}
                style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} />
            </div>
          </div>

          {/* Form footer */}
          <div style={{ padding: '14px 24px', background: 'rgba(247,249,250,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(200,212,220,0.2)', display: 'flex', gap: 10 }}>
            <button onClick={() => setCompose(false)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid rgba(200,212,220,0.5)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7E8E' }}>
              {t('manager.announce.compose.cancel')}
            </button>
            <button disabled={!title.trim()} onClick={send}
              style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: title.trim() ? '#00B4A0' : 'rgba(200,212,220,0.3)', cursor: title.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, color: title.trim() ? '#fff' : '#9BAAB5', boxShadow: title.trim() ? '0 2px 8px rgba(0,180,160,0.3)' : 'none', transition: 'all 150ms' }}>
              <Send size={14} stroke="currentColor" /> {t('manager.announce.compose.send')}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCompose(true)}
          style={{ ...glass, width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: '1.5px dashed rgba(0,180,160,0.35)', transition: 'all 150ms' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,160,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,180,160,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = glass.background as string; e.currentTarget.style.borderColor = 'rgba(0,180,160,0.35)'; }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,180,160,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={17} stroke="#00B4A0" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>{t('manager.announce.compose.trigger.title')}</div>
            <div style={{ fontSize: 12, color: '#9BAAB5', marginTop: 1 }}>{t('manager.announce.compose.trigger.sub')}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00B4A0', background: 'rgba(0,180,160,0.1)', padding: '6px 16px', borderRadius: 20 }}>{t('manager.announce.compose.trigger.btn')}</span>
        </button>
      )}

      {/* Sent history */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {t('manager.announce.sent.header', { count: ANNOUNCEMENTS.length })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(ANNOUNCEMENTS ?? []).map(a => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement: a }: Readonly<{ announcement: Announcement }>) {
  const { t } = useTranslation('manager');
  const Send = Icons.send;
  const readPct = Math.round(a.read / a.total * 100);
  const scopes = a.scope.split(',');
  const allRead = a.read === a.total;

  return (
    <div style={{ ...glass, borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,180,160,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={15} stroke="#00B4A0" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D', marginBottom: 4 }}>{a.title}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#9BAAB5' }}>{a.sent}</span>
            {scopes.map(s => (
              <span key={s} style={{ fontSize: 10, fontWeight: 600, color: '#3A4F63', background: 'rgba(200,212,220,0.25)', border: '1px solid rgba(200,212,220,0.4)', padding: '1px 7px', borderRadius: 999 }}>
                {s === 'all' ? t('manager.announce.card.scopeAll') : (locById(s)?.name ?? s)}
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, flexShrink: 0, ...(allRead ? { color: '#00897B', background: 'rgba(0,180,160,0.1)' } : { color: '#3A4F63', background: 'rgba(200,212,220,0.2)' }) }}>
          {t('manager.announce.card.readCount', { read: a.read, total: a.total })}
        </span>
      </div>

      {/* Body */}
      <p style={{ fontSize: 13, color: '#3A4F63', lineHeight: 1.6, margin: 0 }}>{a.body}</p>

      {/* Read progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#9BAAB5' }}>
            {a.total - a.read > 0
              ? t('manager.announce.card.unread', { count: a.total - a.read })
              : t('manager.announce.card.allRead')}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: allRead ? '#00897B' : '#3A4F63' }}>{readPct}%</span>
        </div>
        <div style={{ height: 5, background: 'rgba(200,212,220,0.3)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: allRead ? '#00B4A0' : '#2B7EC4', borderRadius: 999, width: `${readPct}%`, transition: 'width 400ms' }} />
        </div>
      </div>
    </div>
  );
}

function MgrAnnounceSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={240} style={{ marginBottom: 24 }} />
      <SkeletonCard lines={4} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(['a', 'b', 'c'] as const).map(k => <SkeletonCard key={k} lines={2} />)}
      </div>
    </div>
  );
}
