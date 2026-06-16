import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Btn, Eyebrow, Avatar } from '../../../../components/UI';
import { toast } from 'sonner';
import { Icons } from '../../../../components/Icons';
import { STAFF, roleById, type Location } from '../../../../services/setup';

export function StaffAssignmentCard({ loc }: { loc: Location }) {
  const { t } = useTranslation('setup');
  const [assignedIds, setAssignedIds] = useState<string[]>(
    () => STAFF.filter(s => s.locationIds.includes(loc.locationId)).map(s => s.larkUserId)
  );
  const [addOpen, setAddOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addOpen]);

  const staffMap = new Map(STAFF.map(s => [s.larkUserId, s]));
  const assigned  = assignedIds.map(id => staffMap.get(id)).filter(s => !!s);
  const q = searchQ.trim().toLowerCase();
  const available = STAFF.filter(s =>
    !assignedIds.includes(s.larkUserId) &&
    (!q || s.name.toLowerCase().includes(q))
  );

  const add = (id: string) => {
    const s = staffMap.get(id);
    setAssignedIds(p => [...p, id]);
    setSearchQ('');
    setAddOpen(false);
    toast.success(t('setup.staffCard.toast.added', { name: s?.name ?? id, loc: loc.name }));
  };
  const remove = (id: string) => {
    const s = staffMap.get(id);
    setAssignedIds(p => p.filter(x => x !== id));
    toast.info(t('setup.staffCard.toast.removed', { name: s?.name ?? id, loc: loc.name }));
  };

  const COL = 'repeat(3, 1fr) 40px';

  return (
    <Card pad={false}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8ECEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Eyebrow>{t('setup.staffCard.eyebrow')}</Eyebrow>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E2D3D', marginTop: 6 }}>
            {t('setup.staffCard.title')}
          </h3>
        </div>
        <div ref={dropRef} style={{ position: 'relative' }}>
          <Btn variant="primary" size="sm" icon={<Icons.plus size={14} />} onClick={() => { setAddOpen(o => !o); setSearchQ(''); setTimeout(() => searchRef.current?.focus(), 50); }}>
            {t('setup.staffCard.addBtn')}
          </Btn>
          {addOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 280, background: '#fff', borderRadius: 10, border: '1px solid #E8ECEF', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #E8ECEF' }}>
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder={t('setup.staffCard.search.placeholder')}
                  style={{ width: '100%', border: '1px solid #E8ECEF', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-display)', color: '#1E2D3D', outline: 'none', background: '#F7F9FA', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#00B4A0')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E8ECEF')}
                />
              </div>
              {available.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: '#9BAAB5' }}>
                  {searchQ ? t('setup.staffCard.dropEmpty.search') : t('setup.staffCard.dropEmpty.all')}
                </div>
              ) : available.map((s, i) => (
                <button
                  key={s.larkUserId}
                  onClick={() => add(s.larkUserId)}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', borderTop: i > 0 ? '1px solid #F0F4F7' : 'none', background: '#fff', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FA')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <Avatar name={s.name} src={s.avatar} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7E8E' }}>{s.phone}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {assigned.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: '#9BAAB5' }}>
          {t('setup.staffCard.empty')}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '8px 24px', background: '#F7F9FA', borderBottom: '1px solid #E8ECEF' }}>
            {[t('setup.staffCard.col.staff'), t('setup.staffCard.col.phone'), t('setup.staffCard.col.role'), ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7E8E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {assigned.map((s, i) => (
            <div key={s.larkUserId} style={{ display: 'grid', gridTemplateColumns: COL, padding: '12px 24px', alignItems: 'center', borderTop: i > 0 ? '1px solid #E8ECEF' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={s.name} src={s.avatar} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{s.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6B7E8E' }}>{s.phone}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {s.roleIds.map(id => {
                  const r = roleById(id);
                  const color = s.payType === 'hourly' ? '#00B4A0' : '#7C4FBF';
                  return (
                    <span key={id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${color}15`, color, fontWeight: 600 }}>
                      {r?.name ?? id}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => remove(s.larkUserId)}
                  title={t('setup.staffCard.removeTooltip')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#9BAAB5', borderRadius: 4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9BAAB5'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  <Icons.x size={14} />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}
