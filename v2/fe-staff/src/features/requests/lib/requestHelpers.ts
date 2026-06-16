import type { RequestDto, StatusFilter } from '../types';

export type RequestType = 'leave' | 'late' | 'early';

export const REQUEST_TYPES: { type: RequestType; colorClass: string; accentColor: string }[] = [
  { type: 'leave', colorClass: 'cd-setting__icon--blue',   accentColor: 'var(--c-info, #3b82f6)' },
  { type: 'late',  colorClass: 'cd-setting__icon--orange', accentColor: 'var(--c-warning)' },
  { type: 'early', colorClass: 'cd-setting__icon--green',  accentColor: 'var(--c-success)' },
];

export function groupByMonth(reqs: RequestDto[], lang: string): { label: string; items: RequestDto[] }[] {
  const map = new Map<string, RequestDto[]>();
  for (const r of reqs) {
    const d = new Date(r.startDate + 'T00:00:00');
    const key = d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

export function getStatusCounts(data: { pages: { counts: Record<StatusFilter, number> }[] } | undefined): Record<StatusFilter, number> {
  return data?.pages[0]?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 };
}
