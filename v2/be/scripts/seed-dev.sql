-- be/scripts/seed-dev.sql
-- BA-S1-T03 · Dev seed for Slice 1 (Staff Attendance Experience)
--
-- Target: PostgreSQL. Schema from spec §5.3
-- (docs/superpowers/specs/2026-05-08-slice-1-staff-attendance.md).
--
-- Run after 0001_InitialSchema migration lands (T08, SD-9). Required by
-- integration tests (T1.3.13–T1.3.16) and the T10 smoke test.
--
-- Idempotent: safe to re-run. Top-level rows use ON CONFLICT DO NOTHING.
-- The "today's shift" row is upserted per-day via a composite key on
-- (user_id, date, start_time_utc).
--
-- ⚠️ DEV ONLY. Do not run against production. Production data lives in
-- the real onboarding flow.
--
-- Fixed UUIDs below are stable across runs so the Sprint-1 FE mock
-- authStore (user-001) can hard-code 00000000-0000-0000-0000-000000000001
-- as its `userId` until Lark SSO lands in Sprint 2.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- Locations
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO locations (id, name)
VALUES ('00000000-0000-0000-0000-000000000201', 'Cửa hàng A')          -- Store A
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Roles · hourly_rate_vnd is integer VND/hour (no decimals — NFR-LOC-2)
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO roles (id, name, hourly_rate_vnd)
VALUES ('00000000-0000-0000-0000-000000000101', 'Nhân viên phục vụ', 35000)   -- Waiter @ 35,000 VND/h
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO users (id, name, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Nguyễn Văn An', '0901234567')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Joins: user ↔ role, user ↔ location
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO user_roles (user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000101')
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_locations (user_id, location_id)
VALUES ('00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000201')
ON CONFLICT (user_id, location_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Pay period config (global, MONTHLY, anchored to day 1)
--   type column is smallint per §5.3. Enum mapping owned by T08:
--     0 = MONTHLY · 1 = BIWEEKLY · 2 = WEEKLY  (placeholder — T08 to confirm)
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO pay_period_configs (id, type, start_day)
VALUES ('00000000-0000-0000-0000-000000000301', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Today's shift · 09:00–17:00 Asia/Ho_Chi_Minh (UTC+7)
--   date         = today in Vietnam local time
--   start_time_utc / end_time_utc = timestamptz (spec §5.3)
--   `AT TIME ZONE 'Asia/Ho_Chi_Minh'` interprets the wall-clock value
--   as Vietnam local and returns the equivalent UTC instant.
-- ─────────────────────────────────────────────────────────────────────────
WITH today_local AS (
    SELECT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS d
)
INSERT INTO shifts (
    id, user_id, role_id, location_id, date,
    start_time_utc, end_time_utc, deleted_at
)
SELECT
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    d,
    (d + TIME '09:00') AT TIME ZONE 'Asia/Ho_Chi_Minh',
    (d + TIME '17:00') AT TIME ZONE 'Asia/Ho_Chi_Minh',
    NULL
FROM today_local
ON CONFLICT (id) DO UPDATE SET
    date           = EXCLUDED.date,
    start_time_utc = EXCLUDED.start_time_utc,
    end_time_utc   = EXCLUDED.end_time_utc,
    deleted_at     = NULL;

COMMIT;
