// API layer — today returns mock data; replace internals with fetch() when backend is ready.
// Components should import exclusively from this file, never from mock/ or types/ directly.

export type { FinPeriod, FinHistory, FinLoc, PayrollItem, PayrollRawEntry, PayrollEntry, FinSummary, FinByLoc } from './Finance/finance';

export {
  FIN_PERIOD, FIN_HISTORY, FIN_LOCS, PAYROLL_RAW_DATA,
  computePayroll, computeSummary, computeByLoc,
  fmtM, fmtVND,
} from '../mock/finance';
