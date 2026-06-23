import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar, Skeleton, SkeletonCard, ErrorBanner } from '../../../components/UI';
import { Icons } from '../../../components/Icons';
const Plus = Icons.plus;
const Send = Icons.send;
const Download = Icons.download;
import { ChevronRight, CalendarDays } from 'lucide-react';
import { TODAY_ROSTER } from '../../../services/manager';
import { roleById, locById, STAFF, LOCATIONS } from '../../../services/setup';
import { useAuth } from '../../../stores/AuthContext';
import { type AddCtx, AddShiftDrawer } from './Components/AddShiftForm';
import { BASE_WEEK, TODAY_FULL, fmtShort, getWeek, weekRangeLabel } from '../Roster/Components/weekUtils';
import type { ShiftEntity } from '../../../services/Job/job';
import { VN_OFFSET_MS } from '../../../services/Job/job';

const locColor = (locId: string) => locById(locId)?.style?.color ?? '#6B7E8E';

function dateStrFromVN(utcMs: number): string {
  return new Date(utcMs + VN_OFFSET_MS).toISOString().split('T')[0];
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 16px rgba(30,45,61,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const makeSeed = (): ShiftEntity[] => {
  const seeds = [...TODAY_ROSTER];
  let id = 100;
  const mockDraft = (staff: string, store: string, role: string, dayIdx: number, startH: number, endH: number) => {
    const base = new Date(BASE_WEEK[dayIdx].full + "T00:00:00Z").getTime() - VN_OFFSET_MS;
    const sIn = base + startH * 3600000;
    const sOut = base + endH * 3600000;
    seeds.push({
      jobId: `draft-${id++}`,
      larkUserId: staff,
      locationId: store,
      locationName: locById(store).name,
      roleId: role,
      scheduleInTime: sIn,
      scheduleOutTime: sOut,
      scheduleTotal: sOut - sIn,
      actualInTime: null,
      actualOutTime: null,
      shiftLabel: 'Ca làm việc',
      tag: role,
      status: 'upcoming'
    });
  };
  mockDraft('lark_user_001', 'L1', 'R1', 0, 7, 14);
  mockDraft('lark_user_001', 'L1', 'R1', 2, 7, 14);
  mockDraft('lark_user_002', 'L1', 'R3', 0, 6, 12);
  mockDraft('lark_user_002', 'L1', 'R3', 3, 6, 12);
  mockDraft('lark_user_006', 'L1', 'R1', 1, 14, 22);
  mockDraft('lark_user_010', 'L1', 'R3', 1, 8, 16);
  mockDraft('lark_user_012', 'L1', 'R2', 4, 7, 14);
  mockDraft('lark_user_004', 'L2', 'R4', 0, 8, 17);
  mockDraft('lark_user_004', 'L2', 'R4', 2, 8, 17);
  mockDraft('lark_user_010', 'L2', 'R3', 1, 8, 16);
  mockDraft('lark_user_001', 'L2', 'R1', 3, 7, 14);
  mockDraft('lark_user_007', 'L3', 'R4', 0, 9, 17);
  mockDraft('lark_user_012', 'L3', 'R2', 1, 7, 14);
  mockDraft('lark_user_007', 'L3', 'R4', 3, 9, 17);
  mockDraft('lark_user_006', 'L4', 'R1', 0, 7, 14);
  mockDraft('lark_user_006', 'L4', 'R1', 2, 7, 14);
  return seeds;
};
const SEED_SHIFTS: ShiftEntity[] = makeSeed();

interface Props { activeStore: string; isLoading?: boolean; error?: string | null; }

export function MgrSchedule({ activeStore, isLoading, error }: Props) {
  const { t } = useTranslation('manager');
  const { user } = useAuth();
  const isAdmin = user?.access.some(a => a.type === 'ADMIN') ?? false;
  const mgrStores = isAdmin
    ? LOCATIONS.map(l => l.locationId)
    : [...new Set((user?.access ?? []).filter(a => a.type === 'MANAGER' && a.locationId).map(a => a.locationId as string))];

  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addCtx, setAddCtx] = useState<AddCtx>({ staffId: '', dateStr: '' });
  const [localShifts, setLocalShifts] = useState<ShiftEntity[]>(SEED_SHIFTS);
  const [pendingCount, setPending] = useState(0);
  const nextId = useRef(200);
  const [detailShift, setDetailShift] = useState<ShiftEntity | null>(null);
  const [detailPos, setDetailPos] = useState({ x: 0, y: 0 });

  const weekDays = getWeek(weekOffset);
  const DAYS = weekDays.map(d => `${d.abbr}\n${fmtShort(d.full)}`);
  const weekLabel = weekRangeLabel(weekDays);

  if (isLoading) return <MgrScheduleSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  const openAdd = (staffId: string, dateStr: string) => { setAddCtx({ staffId, dateStr }); setAddOpen(true); };
  const openEdit = (jobId: string) => {
    const sh = localShifts.find(s => s.jobId === jobId);
    if (!sh) return;
    setAddCtx({ staffId: sh.larkUserId, dateStr: dateStrFromVN(sh.scheduleInTime), editShiftId: jobId });
    setAddOpen(true);
  };
  const openDetail = (sh: ShiftEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.right + 8 + 276 > window.innerWidth ? rect.left - 284 : rect.right + 8;
    const y = Math.min(rect.top, window.innerHeight - 320);
    setDetailPos({ x, y });
    setDetailShift(sh);
  };

  const handleSave = (data: Omit<ShiftEntity, 'jobId'>, editJobId?: string) => {
    if (editJobId !== undefined) {
      setLocalShifts(prev => prev.map(s => s.jobId === editJobId ? { ...data, jobId: editJobId } : s));
      toast.success(t('manager.schedule.toast.updated'));
    } else {
      setLocalShifts(prev => [...prev, { ...data, jobId: `draft-${nextId.current++}` }]);
      toast.success(t('manager.schedule.toast.added', { name: STAFF.find(s => s.larkUserId === data.larkUserId)?.name ?? data.larkUserId }));
    }
    setPending(n => n + 1);
  };

  const handleDelete = (jobId: string) => {
    const sh = localShifts.find(s => s.jobId === jobId);
    const staffName = STAFF.find(s => s.larkUserId === sh?.larkUserId)?.name;
    setLocalShifts(prev => prev.filter(s => s.jobId !== jobId));
    setPending(n => Math.max(0, n - 1));
    toast.info(t('manager.schedule.toast.deleted', { name: staffName ?? t('manager.staff.title') }));
  };

  const handlePublish = () => {
    const locationId = activeStore === 'all' ? null : activeStore;
    console.log('[Publish] POST /api/shifts/publish', { weekStart: BASE_WEEK[0].full, locationId });
    setPending(0);
    toast.success(t('manager.schedule.toast.published', { week: weekLabel }));
  };

  const shiftsAtStore = activeStore === 'all' ? localShifts : localShifts.filter(s => s.locationId === activeStore);
  const staffIdsWithShifts = new Set(shiftsAtStore.map(s => s.larkUserId));
  const staffInStore = STAFF.filter(s =>
    activeStore === 'all' ? true : staffIdsWithShifts.has(s.larkUserId) || s.locationIds.includes(activeStore) || s.floater
  );
  const shifts = localShifts.filter(s =>
    staffInStore.some(st => st.larkUserId === s.larkUserId) &&
    (activeStore === 'all' || s.locationId === activeStore)
  );
  const weekDayStrs = new Set(weekDays.map(d => d.full));
  const staffWithShifts = staffInStore.filter(s =>
    shifts.some(sh => sh.larkUserId === s.larkUserId && weekDayStrs.has(dateStrFromVN(sh.scheduleInTime)))
  );
  const legendStores = [...new Set(shifts.map(s => s.locationId))].sort();

  return (
    <>
      <div style={{ margin: '-36px -40px -80px', padding: '36px 40px 80px', background: 'linear-gradient(150deg, #d4f0ec 0%, #e6f8f6 30%, #f7f9fa 60%, #daf2ef 85%, #e6f8f6 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'fadeUp 350ms ease both' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,160,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,45,61,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#00B4A0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{t('manager.schedule.eyebrow')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeStore === 'all' ? (
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', margin: 0 }}>{t('manager.schedule.titleAll')}</h1>
            ) : (
              <>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E2D3D', margin: 0 }}>{t('manager.schedule.titleBranch')}</h1>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#00B4A0', margin: 0 }}>{locById(activeStore)?.name ?? activeStore}</h1>
              </>
            )}
          </div>
        </div>

        {/* Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {/* Week nav pill */}
          <div style={{ position: 'relative' }}>
            <div style={{ ...glass, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 8px', borderRadius: 15, userSelect: 'none' }}>
              <button onClick={() => setWeekOffset(o => o - 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={13} strokeWidth={1.75} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button onClick={() => setPickerOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}>
                <CalendarDays size={13} strokeWidth={1.75} color="#9BAAB5" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D', whiteSpace: 'nowrap' }}>{weekLabel}</span>
                {weekOffset === 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#00B4A0', background: 'rgba(0,180,160,0.10)', padding: '1px 8px', borderRadius: 999 }}>{t('manager.schedule.thisWeek')}</span>
                )}
              </button>
              <button onClick={() => setWeekOffset(o => o + 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#6B7E8E', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={13} strokeWidth={1.75} />
              </button>
            </div>
            {pickerOpen && (
              <WeekPicker
                weekOffset={weekOffset}
                onChange={o => { setWeekOffset(o); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>


          <div style={{ flex: 1 }} />

          <button onClick={() => openAdd('', weekDays[0].full)}
            style={{ ...glass, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3A4F63', border: '1px solid rgba(200,212,220,0.4)' }}>
            <Plus size={14} stroke="#6B7E8E" /> {t('manager.schedule.addShift')}
          </button>

          <button onClick={handlePublish} disabled={pendingCount === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: pendingCount > 0 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, color: pendingCount > 0 ? '#fff' : '#9BAAB5', background: pendingCount > 0 ? '#00B4A0' : 'rgba(200,212,220,0.3)', boxShadow: pendingCount > 0 ? '0 2px 8px rgba(0,180,160,0.25)' : 'none', transition: 'all 150ms' }}>
            <Send size={14} />
            {pendingCount > 0 ? t('manager.schedule.publishCount', { count: pendingCount }) : t('manager.schedule.publish')}
          </button>

          <button style={{ ...glass, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3A4F63', border: '1px solid rgba(200,212,220,0.4)' }}>
            <Download size={14} stroke="#6B7E8E" /> {t('manager.schedule.export')}
          </button>
        </div>
          {legendStores.length > 0 && (
            <div style={{ ...glass, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '7px 14px', borderRadius: 15, marginBottom:12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9BAAB5', textTransform: 'uppercase', letterSpacing: 0.8 }}>{t('manager.schedule.branchLegend')}</span>
              {legendStores.map(id => {
                const color = locColor(id);
                return (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                    {locById(id)?.name ?? id}
                  </span>
                );
              })}
            </div>
          )}

        {/* Table */}
        <div style={{ ...glass, borderRadius: 14, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(7, 1fr)', borderBottom: '1px solid rgba(200,212,220,0.3)', background: 'rgba(247,249,250,0.97)', minWidth: 900, position: 'sticky', top: 0, zIndex: 2 }}>
            <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#6B7E8E', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', left: 0, background: 'rgba(247,249,250,0.97)', zIndex: 3 }}>{t('manager.schedule.col.staff')}</div>
            {DAYS.map((d, i) => {
              const isToday = weekDays[i].full === TODAY_FULL;
              return (
                <div key={i} style={{ padding: '10px 8px', borderLeft: '1px solid rgba(200,212,220,0.25)', textAlign: 'center', background: isToday ? 'rgba(0,180,160,0.04)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#00B4A0' : '#6B7E8E', textTransform: 'uppercase' }}>{d.split('\n')[0]}</div>
                    <div style={{ fontSize: 11, color: isToday ? '#00B4A0' : '#9BAAB5' }}>{d.split('\n')[1]}</div>
                  </div>
                  {isToday && <div style={{ width: 4, height: 4, borderRadius: 999, background: '#00B4A0', margin: '2px auto 0' }} />}
                </div>
              );
            })}
          </div>

          {staffWithShifts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 80, minWidth: 900 }}>
              <div style={{ width: 180, flexShrink: 0, background: 'rgba(247,249,250,0.5)', borderRight: '1px solid rgba(200,212,220,0.2)' }} />
              <button onClick={() => openAdd('', weekDays[0].full)}
                style={{ flex: 1, background: 'transparent', border: '1px dashed rgba(200,212,220,0.5)', borderRadius: 8, cursor: 'pointer', color: '#9BAAB5', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, transition: 'all 100ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,160,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,180,160,0.3)'; e.currentTarget.style.color = '#6B7E8E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,212,220,0.5)'; e.currentTarget.style.color = '#9BAAB5'; }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                <span>{t('manager.schedule.empty')}</span>
              </button>
            </div>
          ) : staffWithShifts.map((staff, si) => {
            const staffShifts = shifts.filter(s => s.larkUserId === staff.larkUserId);
            return (
              <div key={staff.larkUserId}
                style={{ display: 'grid', gridTemplateColumns: '180px repeat(7, 1fr)', borderTop: si > 0 ? '1px solid rgba(200,212,220,0.2)' : 'none', minHeight: 52, minWidth: 900, transition: 'background 100ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,160,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(247,249,250,0.95)', borderRight: '1px solid rgba(200,212,220,0.2)', position: 'sticky', left: 0, zIndex: 1 }}>
                  <Avatar name={staff.name} src={staff.avatar} size={22} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E2D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
                    {staff.name.split(' ').slice(-2).join(' ')}
                  </div>
                </div>
                {DAYS.map((_, di) => {
                  const dayShifts = staffShifts.filter(s => dateStrFromVN(s.scheduleInTime) === weekDays[di].full);
                  const isToday = weekDays[di].full === TODAY_FULL;
                  return (
                    <div key={di} style={{ borderLeft: '1px solid rgba(200,212,220,0.2)', padding: '6px 5px', background: isToday ? 'rgba(0,180,160,0.015)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {dayShifts.map(sh => {
                        const role = roleById(sh.roleId);
                        const shColor = locColor(sh.locationId);
                        const dIn = new Date(sh.scheduleInTime + VN_OFFSET_MS);
                        const dOut = new Date(sh.scheduleOutTime + VN_OFFSET_MS);
                        const startStr = `${dIn.getUTCHours().toString().padStart(2, '0')}:${dIn.getUTCMinutes().toString().padStart(2, '0')}`;
                        const endStr = `${dOut.getUTCHours().toString().padStart(2, '0')}:${dOut.getUTCMinutes().toString().padStart(2, '0')}`;
                        return (
                          <button key={sh.jobId} onClick={(e) => openDetail(sh, e)} title={t('manager.schedule.detail.viewDetail')}
                            style={{ background: `${shColor}14`, borderLeft: `2.5px solid ${shColor}`, borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'opacity 100ms' }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: shColor }}>{role?.name ?? sh.roleId}</div>
                            <div style={{ fontSize: 9, color: shColor, opacity: 0.8 }}>{startStr}–{endStr}</div>
                          </button>
                        );
                      })}
                      <button onClick={() => openAdd(staff.larkUserId, weekDays[di].full)}
                        style={{ width: '100%', height: dayShifts.length === 0 ? 36 : 20, background: 'transparent', border: '1px dashed rgba(200,212,220,0.45)', borderRadius: 4, cursor: 'pointer', fontSize: dayShifts.length === 0 ? 16 : 12, color: '#C8D4DC', lineHeight: 1, flexShrink: 0, transition: 'all 80ms' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,180,160,0.35)'; e.currentTarget.style.color = '#00B4A0'; e.currentTarget.style.background = 'rgba(0,180,160,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,212,220,0.45)'; e.currentTarget.style.color = '#C8D4DC'; e.currentTarget.style.background = 'transparent'; }}>
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

      </div>
      {addOpen && (
        <AddShiftDrawer
          ctx={addCtx}
          weekDays={weekDays}
          activeStore={activeStore}
          mgrStores={mgrStores}
          onClose={() => setAddOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          getShift={(id) => localShifts.find(s => s.jobId === id)}
        />
      )}
      {detailShift && (
        <ShiftDetailPopover
          shift={detailShift}
          pos={detailPos}
          onClose={() => setDetailShift(null)}
          onEdit={() => { setDetailShift(null); openEdit(detailShift.jobId); }}
        />
      )}
    </>
  );
}

// ─── WeekPicker ──────────────────────────────────────────────────────────────

function getMondayOf(d: Date): Date {
  const r = new Date(d);
  const dow = r.getDay();
  r.setDate(r.getDate() + (dow === 0 ? -6 : 1 - dow));
  r.setHours(0, 0, 0, 0);
  return r;
}

function weekOffsetOf(date: Date): number {
  const mon = getMondayOf(date);
  const base = getMondayOf(new Date());
  return Math.round((mon.getTime() - base.getTime()) / (7 * 86400000));
}

function buildCalRows(year: number, month: number): Date[][] {
  const last = new Date(year, month + 1, 0);
  const cur = getMondayOf(new Date(year, month, 1));
  const rows: Date[][] = [];
  while (cur <= last) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) { row.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    rows.push(row);
  }
  return rows;
}

const VI_MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW_HDR = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function WeekPicker({ weekOffset, onChange, onClose }: {
  weekOffset: number;
  onChange: (offset: number) => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation('manager');
  const MONTHS = i18n.language === 'en' ? EN_MONTHS : VI_MONTHS;
  const selMonday = getMondayOf((() => { const d = new Date(); d.setDate(d.getDate() + weekOffset * 7); return d; })());
  const [calYear, setCalYear] = useState(selMonday.getFullYear());
  const [calMonth, setCalMonth] = useState(selMonday.getMonth());
  const [hoverOff, setHoverOff] = useState<number | null>(null);

  const rows = buildCalRows(calYear, calMonth);
  const todayStr = TODAY_FULL;

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(200,212,220,0.35)', borderRadius: 14, boxShadow: '0 12px 32px rgba(30,45,61,0.14)', padding: 16, minWidth: 268 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
            <ChevronRight size={14} strokeWidth={1.75} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D' }}>{MONTHS[calMonth]} {calYear}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6B7E8E', display: 'flex' }}>
            <ChevronRight size={14} strokeWidth={1.75} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DOW_HDR.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9BAAB5', paddingBottom: 5, letterSpacing: '0.04em' }}>{d}</div>
          ))}
        </div>

        {rows.map((row, ri) => {
          const rowOffset = weekOffsetOf(row[0]);
          const isSelected = rowOffset === weekOffset;
          const isHover = rowOffset === hoverOff;
          return (
            <div key={ri}
              onClick={() => onChange(rowOffset)}
              onMouseEnter={() => setHoverOff(rowOffset)}
              onMouseLeave={() => setHoverOff(null)}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderRadius: 7, background: isSelected ? '#1E2D3D' : isHover ? 'rgba(0,180,160,0.07)' : 'transparent', cursor: 'pointer', marginBottom: 2 }}>
              {row.map((date, di) => {
                const inMonth = date.getMonth() === calMonth;
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const isToday = dateKey === todayStr;
                return (
                  <div key={di} style={{ textAlign: 'center', padding: '6px 2px', fontSize: 12, fontWeight: isToday ? 700 : 400, color: isSelected ? '#fff' : isToday ? '#00B4A0' : inMonth ? '#3A4F63' : '#C8D4DC', position: 'relative' }}>
                    {date.getDate()}
                    {isToday && !isSelected && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: 999, background: '#00B4A0', display: 'block' }} />}
                  </div>
                );
              })}
            </div>
          );
        })}

        {weekOffset !== 0 && (
          <button onClick={() => onChange(0)}
            style={{ width: '100%', marginTop: 10, padding: '7px', borderRadius: 8, border: '1px solid rgba(0,180,160,0.3)', background: 'rgba(0,180,160,0.06)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#00897B' }}>
            {t('manager.schedule.weekpicker.goToThisWeek')}
          </button>
        )}
      </div>
    </>
  );
}

function ShiftDetailPopover({ shift, pos, onClose, onEdit }: {
  shift: ShiftEntity;
  pos: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation('manager');
  const STATUS_META: Record<ShiftEntity['status'], { label: string; color: string; bg: string }> = {
    in:        { label: t('manager.schedule.status.in'),        color: '#00897B', bg: 'rgba(0,180,160,0.10)' },
    completed: { label: t('manager.schedule.status.completed'), color: '#00897B', bg: 'rgba(0,180,160,0.10)' },
    late:      { label: t('manager.schedule.status.late'),      color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
    absent:    { label: t('manager.schedule.status.absent'),    color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
    upcoming:  { label: t('manager.schedule.status.upcoming'),  color: '#6B7E8E', bg: 'rgba(200,212,220,0.25)' },
    overtime:  { label: t('manager.schedule.status.overtime'),  color: '#4F46E5', bg: 'rgba(99,102,241,0.10)' },
  };
  const role = roleById(shift.roleId);
  const loc = locById(shift.locationId);
  const staff = STAFF.find(s => s.larkUserId === shift.larkUserId);
  const shColor = locColor(shift.locationId);
  const meta = STATUS_META[shift.status];

  const fmtTime = (ms: number) => {
    const d = new Date(ms + VN_OFFSET_MS);
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  const totalActualMs = shift.actualInTime && shift.actualOutTime ? shift.actualOutTime - shift.actualInTime : null;
  const totalStr = totalActualMs
    ? `${Math.floor(totalActualMs / 3600000)}g ${Math.round((totalActualMs % 3600000) / 60000)}p`
    : null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }} />
      <div style={{ position: 'fixed', left: pos.x, top: pos.y, width: 268, zIndex: 501, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(200,212,220,0.35)', borderRadius: 12, boxShadow: '0 8px 32px rgba(30,45,61,0.14)', overflow: 'hidden', animation: 'popIn 150ms ease' }}>
        <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(-4px); } to { opacity:1; transform:none; } }`}</style>

        {/* Header */}
        <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(200,212,220,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: shColor, background: `${shColor}18`, padding: '2px 8px', borderRadius: 999 }}>{role?.name ?? shift.roleId}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, background: meta.bg, padding: '2px 8px', borderRadius: 999 }}>{meta.label}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BAAB5', padding: '2px 4px', borderRadius: 4, fontSize: 14, lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1E2D3D' }}>{staff?.name ?? shift.larkUserId}</div>
            <div style={{ fontSize: 11, color: '#6B7E8E', marginTop: 1 }}>{loc?.name ?? shift.locationId}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 2 }}>
            {[
              { label: t('manager.schedule.detail.scheduled.in'), val: fmtTime(shift.scheduleInTime), color: '#1E2D3D' },
              { label: t('manager.schedule.detail.scheduled.out'), val: fmtTime(shift.scheduleOutTime), color: '#1E2D3D' },
              { label: t('manager.schedule.detail.actual.in'), val: shift.actualInTime ? fmtTime(shift.actualInTime) : '—', color: shift.actualInTime ? '#00B4A0' : '#C8D4DC' },
              { label: t('manager.schedule.detail.actual.out'), val: shift.actualOutTime ? fmtTime(shift.actualOutTime) : (shift.status === 'in' ? t('manager.schedule.detail.working') : '—'), color: shift.actualOutTime ? '#3A4F63' : shift.status === 'in' ? '#00B4A0' : '#C8D4DC' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'rgba(247,249,250,0.8)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#9BAAB5', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,180,160,0.06)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7E8E' }}>{t('manager.schedule.detail.totalHours')}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: totalStr ? '#00897B' : '#C8D4DC' }}>
              {totalStr ?? (shift.status === 'in' ? t('manager.schedule.detail.calculating') : '—')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(200,212,220,0.15)', display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid rgba(200,212,220,0.4)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6B7E8E' }}>{t('manager.schedule.detail.close')}</button>
          <button onClick={onEdit} style={{ flex: 2, padding: '7px', borderRadius: 8, border: 'none', background: '#1E2D3D', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>{t('manager.schedule.detail.edit')}</button>
        </div>
      </div>
    </>
  );
}

function MgrScheduleSkeleton() {
  return (
    <div>
      <Skeleton h={32} w={280} style={{ marginBottom: 24 }} />
      <SkeletonCard lines={2} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );
}
