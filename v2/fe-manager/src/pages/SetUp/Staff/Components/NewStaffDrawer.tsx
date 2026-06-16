import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Btn, Field, Input, Switch } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { STAFF, LOCATIONS, ROLES, locById, roleById } from '../../../../services/setup';
import type { Staff as StaffType } from '../../../../services/setup';
import { LocAddDropdown } from './LocAddDropdown';
import { RoleAddDropdown } from './RoleAddDropdown';

const LARK_USERS = [
  { id: 'lark001', name: 'Nguyễn Thị Mai',   phone: '090 123 4567' },
  { id: 'lark002', name: 'Trần Văn Bình',    phone: '093 234 5678' },
  { id: 'lark003', name: 'Lê Thị Lan',       phone: '097 345 6789' },
  { id: 'lark004', name: 'Phạm Minh Đức',    phone: '091 456 7890' },
  { id: 'lark005', name: 'Vũ Thị Hoa',       phone: '094 567 8901' },
  { id: 'lark006', name: 'Đỗ Văn Hùng',      phone: '098 678 9012' },
  { id: 'lark007', name: 'Hoàng Thị Nhung',  phone: '096 789 0123' },
  { id: 'lark008', name: 'Bùi Minh Tú',      phone: '092 890 1234' },
];

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.7)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#9BAAB5',
  letterSpacing: '0.07em', textTransform: 'uppercase',
  marginBottom: 8,
};

export function NewStaffDrawer({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (s: StaffType) => void;
}) {
  const { t } = useTranslation('setup');
  const [larkSearch, setLarkSearch] = useState('');
  const [selectedLark, setSelectedLark] = useState<typeof LARK_USERS[number] | null>(null);
  const [locs, setLocs] = useState<string[]>([]);
  const [floater, setFloater] = useState(false);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [payType, setPayType] = useState<'hourly' | 'monthly'>('hourly');
  const [rate, setRate] = useState(0);
  const [monthly, setMonthly] = useState(0);

  const alreadyAdded = new Set(STAFF.map(s => s.phone));
  const q = larkSearch.trim().toLowerCase();
  const larkResults = q
    ? LARK_USERS.filter(u => !alreadyAdded.has(u.phone) && u.name.toLowerCase().includes(q))
    : [];

  const unusedLocs = LOCATIONS.filter(l => !locs.includes(l.locationId));
  const unusedRoles = ROLES.filter(r => !roleIds.includes(r.id));

  const addLoc = (id: string) => setLocs(prev => [...prev, id]);
  const removeLoc = (id: string) => setLocs(prev => prev.filter(l => l !== id));

  const addRole    = (id: string) => setRoleIds(prev => [...prev, id]);
  const removeRole = (i: number)  => setRoleIds(prev => prev.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!selectedLark) return;
    const newStaff: StaffType = {
      larkUserId: selectedLark.id,
      name: selectedLark.name,
      avatar: '',
      phone: selectedLark.phone,
      locationIds: locs,
      floater,
      managedLocs: [],
      payType,
      rate,
      monthly,
      roleIds,
    };
    onCreate(newStaff);
  };

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.38)', zIndex: 900,
        animation: 'backdropFadeIn 200ms ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, zIndex: 901,
        display: 'flex', flexDirection: 'column',
        animation: 'drawerSlideIn 240ms cubic-bezier(0.32,0,0.2,1)',
        ...glass,
        borderRadius: '16px 0 0 16px',
        boxShadow: '-12px 0 48px rgba(0,0,0,0.16)',
      }}>

        {/* Header — dark glass */}
        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '22px 20px 20px',
          borderRadius: '16px 0 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,160,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,180,160,0.2)', border: '1px solid rgba(0,180,160,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.users size={16} stroke="#7FDED4" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{t('setup.staff.new.title')}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', paddingLeft: 42 }}>{t('setup.staff.new.sub')}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', padding: 6, color: 'rgba(255,255,255,0.6)', borderRadius: 8, display: 'flex', flexShrink: 0 }}>
              <Icons.x size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, background: '#f7f9fa' }}>

          {/* Lark search */}
          <Section>
            <div style={sectionLabel}>{t('setup.staff.new.lark.label')}</div>
            {selectedLark ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'rgba(0,180,160,0.07)', border: '1.5px solid rgba(0,180,160,0.3)', borderRadius: 10 }}>
                <Avatar name={selectedLark.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D' }}>{selectedLark.name}</div>
                  <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{selectedLark.phone}</div>
                </div>
                <button onClick={() => { setSelectedLark(null); setLarkSearch(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', display: 'flex', padding: 4, borderRadius: 4 }}>
                  <Icons.x size={14} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                  background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(200,212,220,0.5)', borderRadius: 8 }}>
                  <Icons.search size={14} stroke="#9BAAB5" />
                  <input
                    autoFocus
                    value={larkSearch}
                    onChange={e => setLarkSearch(e.target.value)}
                    placeholder={t('setup.staff.new.lark.placeholder')}
                    style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1E2D3D', background: 'transparent', flex: 1 }}
                  />
                  {larkSearch && (
                    <button onClick={() => setLarkSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', display: 'flex', padding: 0 }}>
                      <Icons.x size={12} />
                    </button>
                  )}
                </div>
                {larkResults.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(200,212,220,0.4)', borderRadius: 10,
                    boxShadow: '0 12px 32px rgba(30,45,61,0.12)', zIndex: 50, overflow: 'hidden' }}>
                    {larkResults.map((u, i) => (
                      <button key={u.id} onClick={() => { setSelectedLark(u); setLarkSearch(''); }}
                        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', border: 'none', borderTop: i > 0 ? '1px solid rgba(200,212,220,0.2)' : 'none',
                          background: 'transparent', cursor: 'pointer', transition: 'background 100ms' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Avatar name={u.name} size={30} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#9BAAB5' }}>{u.phone}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {q && larkResults.length === 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9BAAB5', textAlign: 'center', padding: '10px 0' }}>
                    {t('setup.staff.new.lark.noResult')}
                  </div>
                )}
              </div>
            )}
          </Section>

          {selectedLark && (
            <>
              {/* Locations */}
              <Section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={sectionLabel}>{t('setup.staff.detail.locations.label')}</div>
                  {unusedLocs.length > 0 && <LocAddDropdown locs={unusedLocs} onAdd={addLoc} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {locs.map(lid => {
                    const loc = locById(lid);
                    return (
                      <div key={lid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: 'rgba(255,255,255,0.88)', borderRadius: 8, border: '1px solid rgba(200,212,220,0.35)' }}>
                        <Icons.pin size={14} stroke="#9BAAB5" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: '#1E2D3D', fontWeight: 600 }}>{loc?.name}</div>
                          <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{loc?.address}</div>
                        </div>
                        <button onClick={() => removeLoc(lid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', display: 'flex', padding: 4, borderRadius: 4 }}>
                          <Icons.x size={13} />
                        </button>
                      </div>
                    );
                  })}
                  {locs.length === 0 && (
                    <div style={{ fontSize: 12, color: '#C8D4DC', textAlign: 'center', padding: '12px 0',
                      background: 'rgba(255,255,255,0.7)', borderRadius: 8, border: '1px dashed rgba(200,212,220,0.5)' }}>
                      {t('setup.staff.new.loc.empty')}
                    </div>
                  )}
                </div>
              </Section>

              {/* Floater */}
              <Section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10,
                  background: floater ? 'rgba(0,180,160,0.07)' : 'rgba(255,255,255,0.82)',
                  border: `1px solid ${floater ? 'rgba(0,180,160,0.3)' : 'rgba(200,212,220,0.35)'}`,
                  transition: 'all 150ms' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{t('setup.staff.detail.floater.label')}</div>
                    <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 3, lineHeight: 1.5 }}>
                      {t('setup.staff.new.floater.sub')}
                    </div>
                  </div>
                  <Switch checked={floater} onChange={setFloater} />
                </div>
              </Section>

              {/* Roles */}
              <Section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={sectionLabel}>{t('setup.staff.detail.roles.label')}</div>
                  {unusedRoles.length > 0 && <RoleAddDropdown roles={unusedRoles} onAdd={addRole} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {roleIds.map((id, i) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      background: 'rgba(230,249,247,0.8)', borderRadius: 8, border: '1px solid rgba(0,180,160,0.15)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: '#00B4A0', flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{roleById(id)?.name ?? id}</div>
                      <button onClick={() => removeRole(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', display: 'flex', padding: 4, borderRadius: 4 }}>
                        <Icons.x size={13} />
                      </button>
                    </div>
                  ))}
                  {roleIds.length === 0 && (
                    <div style={{ fontSize: 12, color: '#C8D4DC', textAlign: 'center', padding: '12px 0',
                      background: 'rgba(255,255,255,0.7)', borderRadius: 8, border: '1px dashed rgba(200,212,220,0.5)' }}>
                      {t('setup.staff.new.role.empty')}
                    </div>
                  )}
                </div>
              </Section>

              {/* Pay */}
              <Section>
                <div style={sectionLabel}>{t('setup.staff.detail.pay.label')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['hourly', 'monthly'] as const).map(pt => (
                      <button key={pt} onClick={() => setPayType(pt)} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${payType === pt ? '#00B4A0' : 'rgba(200,212,220,0.5)'}`,
                        background: payType === pt ? 'rgba(0,180,160,0.09)' : 'rgba(255,255,255,0.8)',
                        color: payType === pt ? '#00897B' : '#6B7E8E',
                        transition: 'all 120ms',
                      }}>
                        {pt === 'hourly' ? t('setup.staff.detail.pay.hourly') : t('setup.staff.detail.pay.monthly')}
                      </button>
                    ))}
                  </div>
                  {payType === 'hourly' ? (
                    <Field label={t('setup.staff.detail.pay.hourlyField')}>
                      <Input value={rate.toLocaleString('vi-VN')} onChange={v => setRate(Number(v.replace(/\D/g, '')) || 0)} mono suffix={t('setup.staff.detail.pay.perHour')} />
                    </Field>
                  ) : (
                    <Field label={t('setup.staff.detail.pay.monthlyField')}>
                      <Input value={monthly.toLocaleString('vi-VN')} onChange={v => setMonthly(Number(v.replace(/\D/g, '')) || 0)} mono suffix={t('setup.staff.detail.pay.perMonth')} />
                    </Field>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(200,212,220,0.3)', display: 'flex', gap: 8, flexShrink: 0,
          background: 'rgba(247,249,250,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <Btn variant="ghost" style={{ flex: 1 }} onClick={onClose}>{t('setup.staff.new.cancelBtn')}</Btn>
          <Btn variant="primary" style={{ flex: 2 }} icon={<Icons.plus size={14} />} onClick={handleCreate} disabled={!selectedLark}>
            {t('setup.staff.new.createBtn')}
          </Btn>
        </div>
      </div>
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(200,212,220,0.2)' }}>
      {children}
    </div>
  );
}
