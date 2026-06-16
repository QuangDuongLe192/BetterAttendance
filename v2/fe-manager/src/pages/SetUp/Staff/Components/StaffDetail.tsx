import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar, Tag, Btn, Field, Input, Switch } from '../../../../components/UI';
import { Icons } from '../../../../components/Icons';
import { LOCATIONS, ROLES, locById, roleById, fmtVND, rolesOf } from '../../../../services/setup';
import type { Staff as StaffType } from '../../../../services/setup';
import { SystemRoleBadges } from './SystemRoles';
import { LocAddDropdown } from './LocAddDropdown';
import { RoleAddDropdown } from './RoleAddDropdown';

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

export function StaffDetail({ staff, onClose }: { staff: StaffType; onClose: () => void }) {
  const { t } = useTranslation('setup');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    locationIds: [...staff.locationIds],
    floater: staff.floater ?? false,
    payType: staff.payType as 'hourly' | 'monthly',
    rate: staff.rate ?? 0,
    monthly: staff.monthly ?? 0,
    roleIds: [...staff.roleIds],
  });

  const unusedLocs = LOCATIONS.filter(l => !draft.locationIds.includes(l.locationId));
  const unusedRoles = ROLES.filter(r => !draft.roleIds.includes(r.id));

  const addLoc = (id: string) => setDraft(d => ({ ...d, locationIds: [...d.locationIds, id] }));
  const removeLoc = (id: string) => setDraft(d => ({ ...d, locationIds: d.locationIds.filter(l => l !== id) }));

  const addRole    = (roleId: string) => setDraft(d => ({ ...d, roleIds: [...d.roleIds, roleId] }));
  const removeRole = (i: number)      => setDraft(d => ({ ...d, roleIds: d.roleIds.filter((_, idx) => idx !== i) }));

  const save = () => {
    Object.assign(staff, {
      locationIds: draft.locationIds,
      floater: draft.floater,
      payType: draft.payType,
      rate:    draft.payType === 'hourly'  ? draft.rate    : undefined,
      monthly: draft.payType === 'monthly' ? draft.monthly : undefined,
      roleIds: draft.roleIds,
    });
    setIsEditing(false);
    toast.success(t('setup.staff.detail.toast.saved', { name: staff.name }));
  };
  const cancel = () => {
    setDraft({ locationIds: [...staff.locationIds], floater: staff.floater ?? false, payType: staff.payType as 'hourly' | 'monthly', rate: staff.rate ?? 0, monthly: staff.monthly ?? 0, roleIds: [...staff.roleIds] });
    setIsEditing(false);
  };

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes backdropFadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.38)', zIndex: 900, animation: 'backdropFadeIn 200ms ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, zIndex: 901,
        display: 'flex', flexDirection: 'column',
        animation: 'drawerSlideIn 240ms cubic-bezier(0.32,0,0.2,1)',
        ...glass,
        borderRadius: '16px 0 0 16px',
        boxShadow: '-12px 0 48px rgba(0,0,0,0.16)',
        overflowY: 'auto',
      }}>

        {/* Hero header — dark glass */}
        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '24px 20px 20px',
          borderRadius: '16px 0 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle orb */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,160,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={staff.name || 'NV'} src={staff.avatar} size={52} />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 999,
                background: '#00B4A0', border: '2px solid rgba(30,45,61,0.92)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {staff.name}
                </span>
                <SystemRoleBadges roles={rolesOf(staff.larkUserId) as any} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                <Icons.send size={11} stroke="rgba(255,255,255,0.45)" />
                {staff.phone}
              </div>
              {staff.floater && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                  borderRadius: 999, background: 'rgba(0,180,160,0.2)', border: '1px solid rgba(0,180,160,0.35)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: '#00B4A0' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#7FDED4' }}>{t('setup.staff.detail.floaterBadge')}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', padding: 6, color: 'rgba(255,255,255,0.6)', borderRadius: 8, display: 'flex', flexShrink: 0 }}>
              <Icons.x size={15} />
            </button>
          </div>

          {/* Pay summary chip */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.coins size={13} stroke="rgba(255,255,255,0.5)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                {fmtVND(staff.rate ?? staff.monthly ?? 0)}
                <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>{staff.payType === 'hourly' ? t('setup.staff.detail.pay.perHour') : t('setup.staff.detail.pay.perMonth')}</span>
              </span>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.pin size={13} stroke="rgba(255,255,255,0.5)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {t('setup.locations.stat.staff')}: {staff.locationIds.length}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 8px', background: '#f7f9fa' }}>

          {/* System roles (edit mode only) */}
          {isEditing && (
            <Section>
              <div style={sectionLabel}>{t('setup.staff.detail.systemRole.label')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {(rolesOf(staff.larkUserId) as string[]).length > 0
                  ? <SystemRoleBadges roles={rolesOf(staff.larkUserId) as any} />
                  : <span style={{ fontSize: 12, color: '#777d81' }}>{t('setup.staff.detail.regularStaff')}</span>
                }
              </div>
              <div style={{ fontSize: 11, color: '#777d81', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.lock size={11} stroke="#777d81" />
                {t('setup.staff.detail.systemRole.hint')}
              </div>
            </Section>
          )}

          {/* Locations */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={sectionLabel}>{t('setup.staff.detail.locations.label')}</div>
              {isEditing && unusedLocs.length > 0 && <LocAddDropdown locs={unusedLocs} onAdd={addLoc} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isEditing ? draft.locationIds : staff.locationIds).map(lid => {
                const loc = locById(lid);
                return (
                  <div key={lid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'rgba(255,255,255,0.88)', borderRadius: 8, border: '1px solid rgba(200,212,220,0.35)' }}>
                    <Icons.pin size={14} stroke="#9BAAB5" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#1E2D3D', fontWeight: 600 }}>{loc?.name}</div>
                      <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 1 }}>{loc?.address}</div>
                    </div>
                    {staff.managedLocs.includes(lid) && <Tag tone="warning">{t('setup.staff.detail.locations.managed')}</Tag>}
                    {isEditing && (
                      <button onClick={() => removeLoc(lid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 4 }}>
                        <Icons.x size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
              {(isEditing ? draft.locationIds : staff.locationIds).length === 0 && (
                <div style={{ fontSize: 12, color: '#C8D4DC', textAlign: 'center', padding: '12px 0',
                  background: 'rgba(255,255,255,0.7)', borderRadius: 8, border: '1px dashed rgba(200,212,220,0.5)' }}>
                  {t('setup.staff.detail.locations.empty')}
                </div>
              )}
            </div>
          </Section>

          {/* Floater toggle */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10,
              background: (isEditing ? draft.floater : staff.floater) ? 'rgba(0,180,160,0.07)' : 'rgba(255,255,255,0.82)',
              border: `1px solid ${(isEditing ? draft.floater : staff.floater) ? 'rgba(0,180,160,0.3)' : 'rgba(200,212,220,0.35)'}`,
              transition: 'all 150ms' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{t('setup.staff.detail.floater.label')}</div>
                <div style={{ fontSize: 11, color: '#9BAAB5', marginTop: 3, lineHeight: 1.5 }}>
                  {t('setup.staff.detail.floater.sub')}
                </div>
              </div>
              <Switch
                checked={isEditing ? draft.floater : (staff.floater ?? false)}
                onChange={isEditing ? v => setDraft(d => ({ ...d, floater: v })) : undefined}
              />
            </div>
          </Section>

          {/* Roles */}
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={sectionLabel}>{t('setup.staff.detail.roles.label')}</div>
              {isEditing && unusedRoles.length > 0 && <RoleAddDropdown roles={unusedRoles} onAdd={addRole} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isEditing ? draft.roleIds : staff.roleIds).map((id, i) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'rgba(230,249,247,0.8)', borderRadius: 8, border: '1px solid rgba(0,180,160,0.15)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#00B4A0', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1E2D3D' }}>{roleById(id)?.name ?? id}</div>
                  {isEditing && (
                    <button onClick={() => removeRole(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8D4DC', display: 'flex', padding: 4, borderRadius: 4 }}>
                      <Icons.x size={13} />
                    </button>
                  )}
                </div>
              ))}
              {(isEditing ? draft.roleIds : staff.roleIds).length === 0 && (
                <div style={{ fontSize: 12, color: '#C8D4DC', textAlign: 'center', padding: '12px 0',
                  background: 'rgba(255,255,255,0.7)', borderRadius: 8, border: '1px dashed rgba(200,212,220,0.5)' }}>
                  {t('setup.staff.detail.roles.empty')}
                </div>
              )}
            </div>
          </Section>

          {/* Pay */}
          <Section>
            <div style={sectionLabel}>{t('setup.staff.detail.pay.label')}</div>
            {!isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999,
                  background: staff.payType === 'hourly' ? 'rgba(0,180,160,0.09)' : 'rgba(139,92,246,0.09)',
                  color: staff.payType === 'hourly' ? '#00897B' : '#7C3AED', fontWeight: 600 }}>
                  {staff.payType === 'hourly' ? t('setup.staff.detail.pay.hourly') : t('setup.staff.detail.pay.monthly')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1E2D3D' }}>
                  {fmtVND(staff.rate ?? staff.monthly ?? 0)}
                  <span style={{ color: '#9BAAB5', fontWeight: 400, fontSize: 12 }}>{staff.payType === 'hourly' ? t('setup.staff.detail.pay.perHour') : t('setup.staff.detail.pay.perMonth')}</span>
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['hourly', 'monthly'] as const).map(pt => (
                    <button key={pt} onClick={() => setDraft(d => ({ ...d, payType: pt }))} style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${draft.payType === pt ? '#00B4A0' : 'rgba(200,212,220,0.5)'}`,
                      background: draft.payType === pt ? 'rgba(0,180,160,0.09)' : 'rgba(255,255,255,0.6)',
                      color: draft.payType === pt ? '#00897B' : '#6B7E8E',
                      transition: 'all 120ms',
                    }}>
                      {pt === 'hourly' ? t('setup.staff.detail.pay.hourly') : t('setup.staff.detail.pay.monthly')}
                    </button>
                  ))}
                </div>
                {draft.payType === 'hourly' ? (
                  <Field label={t('setup.staff.detail.pay.hourlyField')}>
                    <Input value={draft.rate.toLocaleString('vi-VN')} onChange={v => setDraft(d => ({ ...d, rate: Number(v.replace(/\D/g, '')) || 0 }))} mono suffix={t('setup.staff.detail.pay.perHour')} />
                  </Field>
                ) : (
                  <Field label={t('setup.staff.detail.pay.monthlyField')}>
                    <Input value={draft.monthly.toLocaleString('vi-VN')} onChange={v => setDraft(d => ({ ...d, monthly: Number(v.replace(/\D/g, '')) || 0 }))} mono suffix={t('setup.staff.detail.pay.perMonth')} />
                  </Field>
                )}
              </div>
            )}
          </Section>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(200,212,220,0.3)', display: 'flex', gap: 8, flexShrink: 0,
          background: 'rgba(247,249,250,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          {isEditing ? (
            <>
              <Btn variant="ghost" size="sm" style={{ flex: 1 }} onClick={cancel}>{t('setup.staff.detail.cancelBtn')}</Btn>
              <Btn variant="primary" size="sm" style={{ flex: 2 }} icon={<Icons.check size={13} />} onClick={save}>{t('setup.staff.detail.saveBtn')}</Btn>
            </>
          ) : (
            <>
              <Btn variant="primary" size="sm" style={{ flex: 1 }} icon={<Icons.edit size={13} />} onClick={() => setIsEditing(true)}>{t('setup.staff.detail.editBtn')}</Btn>
              <Btn variant="ghost" size="sm"><Icons.trash size={14} /></Btn>
            </>
          )}
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
