import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../../components/Icons';
import { STAFF, SHIFT_TEMPLATES, locById, roleById } from '../../../../services/setup';
import { TODAY_FULL, fmtShort } from '../../Roster/Components/weekUtils';
import type { WeekDay } from '../../Roster/Components/weekUtils';
import type { ShiftEntity } from '../../../../services/Job/job';
import { VN_OFFSET_MS } from '../../../../services/Job/job';


function calcShiftDuration(startTime: string, endTime: string): { totalMins: number; isOvernight: boolean } {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const raw = (eh * 60 + em) - (sh * 60 + sm);
  if (raw === 0) return { totalMins: 0, isOvernight: false };
  if (raw > 0) return { totalMins: raw, isOvernight: false };
  return { totalMins: raw + 24 * 60, isOvernight: true };
}

interface FormState { staffId: string; locationId: string; roleId: string; dateStr: string; startTime: string; endTime: string; }

function detectChanges(form: FormState, existing: ShiftEntity | undefined, isEdit: boolean): boolean {
  if (!isEdit || !existing) return true;
  return (
    form.staffId !== existing.larkUserId ||
    form.locationId !== existing.locationId ||
    form.roleId !== existing.roleId ||
    form.dateStr !== dateStrFromVN(existing.scheduleInTime) ||
    form.startTime !== timeStrFromVN(existing.scheduleInTime) ||
    form.endTime !== timeStrFromVN(existing.scheduleOutTime)
  );
}

export interface AddCtx {
  staffId: string;
  dateStr: string;  // YYYY-MM-DD, '' = no pre-selection
  editShiftId?: string;
}

function dateStrFromVN(utcMs: number): string {
  return new Date(utcMs + VN_OFFSET_MS).toISOString().split('T')[0];
}
function timeStrFromVN(utcMs: number): string {
  const d = new Date(utcMs + VN_OFFSET_MS);
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}
function makeVNTime(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [H, M] = timeStr.split(':').map(Number);
  return Date.UTC(y, m - 1, d, H, M) - VN_OFFSET_MS;
}

interface Props {
  ctx: AddCtx;
  weekDays: WeekDay[];
  activeStore: string;
  mgrStores: string[];
  onClose: () => void;
  onSave: (data: Omit<ShiftEntity, 'jobId'>, editShiftId?: string) => void;
  onDelete?: (editShiftId: string) => void;
  getShift: (id: string) => ShiftEntity | undefined;
}

function fmtTotal(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
}

function field(label: string, children: React.ReactNode) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7E8E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function getInitRoleId(existing: ShiftEntity | undefined, initStaffId: string): string {
  return existing?.roleId ?? (initStaffId
    ? (STAFF.find(s => s.larkUserId === initStaffId)?.roleIds?.[0] ?? '')
    : '');
}

function getInitForm(
  ctx: AddCtx,
  existing: ShiftEntity | undefined,
  weekDays: WeekDay[],
  activeStore: string,
  mgrStores: string[],
  isAll: boolean,
): FormState {
  const initLocId = existing?.locationId ?? (isAll ? (mgrStores[0] ?? '') : activeStore);
  const defaultDate = existing
    ? dateStrFromVN(existing.scheduleInTime)
    : (ctx.dateStr || (weekDays[0]?.full ?? ''));
  const initStaffId = existing?.larkUserId ?? ctx.staffId ?? '';
  return {
    staffId: initStaffId,
    locationId: initLocId,
    roleId: getInitRoleId(existing, initStaffId),
    dateStr: defaultDate,
    startTime: existing ? timeStrFromVN(existing.scheduleInTime) : '07:00',
    endTime: existing ? timeStrFromVN(existing.scheduleOutTime) : '14:00',
  };
}

function submitShift(
  form: FormState,
  editShiftId: string | undefined,
  t: (k: string) => string,
  onSave: (data: Omit<ShiftEntity, 'jobId'>, editShiftId?: string) => void,
  onClose: () => void,
): void {
  const scheduleInTime = makeVNTime(form.dateStr, form.startTime);
  let scheduleOutTime = makeVNTime(form.dateStr, form.endTime);
  if (scheduleOutTime <= scheduleInTime) scheduleOutTime += 86400000;
  onSave({
    larkUserId: form.staffId,
    locationId: form.locationId,
    locationName: locById(form.locationId).name,
    roleId: form.roleId,
    scheduleInTime,
    scheduleOutTime,
    scheduleTotal: scheduleOutTime - scheduleInTime,
    actualInTime: null,
    actualOutTime: null,
    shiftLabel: t('manager.schedule.form.shiftLabel'),
    tag: roleById(form.roleId)?.name ?? form.roleId,
    status: 'upcoming',
  }, editShiftId);
  onClose();
}

export function AddShiftDrawer({ ctx, weekDays, activeStore, mgrStores, onClose, onSave, onDelete, getShift }: Props) {
  const { t } = useTranslation('manager');
  const isEdit = ctx.editShiftId !== undefined;
  const existing = isEdit ? getShift(ctx.editShiftId!) : undefined;
  const isFuture = existing ? existing.scheduleInTime > Date.now() : false;
  const isAll = activeStore === 'all';
  const [form, setForm] = useState<FormState>(() => getInitForm(ctx, existing, weekDays, activeStore, mgrStores, isAll));

  const locId = isAll ? form.locationId : activeStore;
  const staffAtLoc = STAFF.filter(s => s.floater || s.locationIds.includes(locId));
  const selectedStaff = STAFF.find(s => s.larkUserId === form.staffId);
  const roleOptions = (selectedStaff?.roleIds ?? []).map(id => roleById(id)).filter(Boolean) as NonNullable<ReturnType<typeof roleById>>[];

  const { totalMins, isOvernight } = calcShiftDuration(form.startTime, form.endTime);

  const hasChanges = detectChanges(form, existing, isEdit);

  const canSave = !!(form.staffId && form.roleId && totalMins > 0 && hasChanges);

  const handleSubmit = () => submitShift(form, ctx.editShiftId, t, onSave, onClose);

  const inputCls: React.CSSProperties = {
    width: '100%', padding: '9px 11px', fontSize: 13,
    border: '1px solid rgba(200,212,220,0.45)',
    borderRadius: 8, color: '#1E2D3D',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.38)', zIndex: 400, animation: 'backdropFadeIn 200ms ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, zIndex: 401, display: 'flex', flexDirection: 'column', animation: 'drawerSlideIn 240ms cubic-bezier(0.32,0,0.2,1)', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '16px 0 0 16px', boxShadow: '-12px 0 48px rgba(0,0,0,0.16)' }}>

        {/* Header — dark glass */}
        <div style={{ flexShrink: 0, background: 'linear-gradient(145deg, rgba(30,45,61,0.92) 0%, rgba(0,90,78,0.88) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '22px 20px 20px', borderRadius: '16px 0 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,180,160,0.2)', border: '1px solid rgba(0,180,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.calendar size={16} stroke="#7FDED4" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
                  {isEdit ? t('manager.schedule.form.title.edit') : t('manager.schedule.form.title.add')}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', paddingLeft: 42 }}>
                {isEdit ? t('manager.schedule.form.sub.edit') : t('manager.schedule.form.sub.add')}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: 6, color: 'rgba(255,255,255,0.6)', borderRadius: 8, display: 'flex', flexShrink: 0 }}>
              <Icons.x size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, background: '#f7f9fa' }}>
          <FormSection>
            {field(t('manager.schedule.form.template'),
              <select
                value={SHIFT_TEMPLATES.find(tmpl => tmpl.defaultStartTime === form.startTime && tmpl.defaultEndTime === form.endTime)?.id ?? ''}
                onChange={e => {
                  const tmpl = SHIFT_TEMPLATES.find(tmpl => tmpl.id === e.target.value);
                  if (tmpl) setForm(f => ({ ...f, startTime: tmpl.defaultStartTime, endTime: tmpl.defaultEndTime }));
                }}
                style={inputCls}
              >
                <option value="">{t('manager.schedule.form.templatePlaceholder')}</option>
                {SHIFT_TEMPLATES.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.label}  {tmpl.defaultStartTime}–{tmpl.defaultEndTime}</option>
                ))}
              </select>
            )}
          </FormSection>

          <FormSection>
            {isAll ? (
              field(t('manager.schedule.form.location'),
                <select
                  value={form.locationId}
                  onChange={e => setForm(f => ({ ...f, locationId: e.target.value, staffId: '', roleId: '' }))}
                  style={inputCls}
                >
                  {mgrStores.map(id => {
                    const l = locById(id);
                    if (!l) return null;
                    return <option key={l.locationId} value={l.locationId}>{l.name}</option>;
                  })}
                </select>
              )
            ) : (
              field(t('manager.schedule.form.location'),
                <div style={{ ...inputCls, background: 'rgba(247,249,250,0.9)', color: '#6B7E8E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: locById(activeStore)?.style?.color ?? '#6B7E8E', flexShrink: 0 }} />
                  {locById(activeStore).name}
                </div>
              )
            )}
            {field(t('manager.schedule.form.staff'),
              <select
                value={form.staffId}
                onChange={e => {
                  const s = STAFF.find(x => x.larkUserId === e.target.value);
                  const firstRole = s?.roleIds?.[0] ?? '';
                  setForm(f => ({ ...f, staffId: e.target.value, roleId: firstRole }));
                }}
                style={inputCls}
              >
                <option value="">{t('manager.schedule.form.staffPlaceholder')}</option>
                {staffAtLoc.map(s => <option key={s.larkUserId} value={s.larkUserId}>{s.name}</option>)}
              </select>
            )}
            {field(t('manager.schedule.form.role'),
              <select
                value={form.roleId}
                onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
                style={{ ...inputCls, ...(!form.staffId ? { color: '#9BAAB5', background: 'rgba(247,249,250,0.9)' } : {}) }}
                disabled={!form.staffId}
              >
                {!form.staffId
                  ? <option value="">{t('manager.schedule.form.rolePlaceholder')}</option>
                  : roleOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                }
              </select>
            )}
          </FormSection>

          <FormSection>
            {field(t('manager.schedule.form.date'),
              <select value={form.dateStr} onChange={e => setForm(f => ({ ...f, dateStr: e.target.value }))} style={inputCls}>
                {weekDays.map(d => (
                  <option key={d.full} value={d.full}>
                    {d.abbr} · {fmtShort(d.full)}{d.full === TODAY_FULL ? ` ${t('manager.schedule.form.dateToday')}` : ''}
                  </option>
                ))}
              </select>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {field(t('manager.schedule.form.startTime'),
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputCls} />
              )}
              {field(t('manager.schedule.form.endTime'),
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputCls} />
              )}
            </div>
            {field(t('manager.schedule.form.totalHours'),
              <div style={{ ...inputCls, background: 'rgba(247,249,250,0.9)', color: totalMins > 0 ? '#1E2D3D' : '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                {totalMins > 0 ? (
                  <>
                    {fmtTotal(totalMins)}
                    {isOvernight && <span style={{ fontSize: 11, fontWeight: 600, color: '#B45309', background: '#FEF3C7', padding: '2px 7px', borderRadius: 4 }}>{t('manager.schedule.form.overnight')}</span>}
                  </>
                ) : t('manager.schedule.form.timeError')}
              </div>
            )}
          </FormSection>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(200,212,220,0.3)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, background: 'rgba(247,249,250,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          {isEdit && isFuture && onDelete && (
            <button
              onClick={() => { onDelete(ctx.editShiftId!); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#EF4444', marginRight: 'auto' }}>
              <Icons.trash size={14} /> {t('manager.schedule.form.delete')}
            </button>
          )}
          <button onClick={onClose}
            style={{ flex: 1, padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(200,212,220,0.5)', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7E8E' }}>
            {t('manager.schedule.form.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={!canSave}
            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: canSave ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, color: canSave ? '#fff' : '#9BAAB5', background: canSave ? '#00B4A0' : 'rgba(200,212,220,0.3)', boxShadow: canSave ? '0 2px 8px rgba(0,180,160,0.3)' : 'none', transition: 'all 150ms' }}>
            <Icons.check size={14} /> {isEdit ? t('manager.schedule.form.save') : t('manager.schedule.form.add')}
          </button>
        </div>
      </div>
    </>
  );
}

function FormSection({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  );
}
