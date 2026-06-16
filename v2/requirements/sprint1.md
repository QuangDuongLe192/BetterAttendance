# Better Attendance — MVP Requirements Specification

**Tagline:** *"No more timesheets. Just show up and get paid."*

**Target segment:** F&B / Retail (Vietnam-first)
**Document version:** 1.0
**Date:** 8 May 2026
**Status:** Draft for review

---

## 1. Document Information

### 1.1 Purpose

- Translate the Better Attendance product brief into a structured, reviewable requirements document.
- Separate **what the product must do** (Functional Requirements) from **how well it must do it** (Non-Functional Requirements).
- Make every requirement testable through explicit **Acceptance Criteria** keyed by ID.

### 1.2 Scope of the MVP

- **In scope:** Front-line staff attendance experience, shift scheduling and multi-location management, automatic attendance via Wi-Fi and geo validation, manager and finance dashboards/reports, roles and permissions, basic admin setup.
- **Out of scope (deferred to post-MVP):** Items the source brief flags as "Later" — see Section 7.

### 1.3 How to read this document

- **Section 3** lists Functional Requirements (FR) grouped by module, each with a stable ID (e.g., `FR-1.1`).
- **Section 4** lists Non-Functional Requirements (NFR), each with its own ID (e.g., `NFR-USE-1`).
- **Section 5** lists Acceptance Criteria (AC), keyed to the FR ID it verifies (e.g., `AC-1.1`).
- IDs are stable; cross-reference rather than rewriting.

---

## 2. Product Overview

### 2.1 Problem statement

- Front-line workers in F&B and retail are paid by the hour but lose time and money to manual timesheets.
- Managers lack real-time staffing visibility and cannot easily detect lateness, absence, or overtime as it happens.
- Finance teams cannot reliably project labor cost or reconcile actuals to schedule without manual aggregation.

### 2.2 Value proposition

- **For staff:** No timesheets. Open the app, see today's shift, clock in with one tap (or fully automatic over store Wi-Fi). See expected pay for the period.
- **For managers:** Live view of who is present, late, absent, or in overtime. Schedule across multiple locations without conflicts.
- **For finance:** Projected vs. actual labor cost per location, exportable to CSV/Excel for payroll.

### 2.3 Stakeholders and primary users

- **Frontline staff** — read schedule, clock in/out, view expected earnings.
- **Store manager** — schedule shifts, configure local rules, monitor real-time attendance, approve overtime.
- **Regional manager** — view multi-location summaries (post-MVP).
- **Finance user** — view labor cost reports, export to payroll/accounting.
- **System admin** — define roles, rates, locations, holidays, and global rules; review audit log.

### 2.4 Platform and locale

- **Primary surface:** Lark sidebar app for managers/finance; mobile experience for staff.
- **Notifications:** Lark Bot (auto clock-in confirmations, overtime pending approval, daily shift summary).
- **Language:** Vietnamese-first UI for MVP.
- **Currency:** Vietnamese Dong (VND).

---

## 3. Functional Requirements

> **Convention:** "The system shall…" Each FR has an ID. Acceptance Criteria for each FR are listed in **Section 5** under the matching ID.

### 3.1 Module 1 — Frontline Staff Attendance Experience

- **FR-1.1 View today's shift** — The system shall display, on the staff home screen, all shift(s) assigned to the logged-in user for the current calendar day, showing start/end time, location name, and role.
- **FR-1.2 View weekly schedule** — The system shall display the logged-in user's schedule for the current week with date, location, and shift time, and shall support navigation to previous and next weeks.
- **FR-1.3 Manual clock in / clock out** — The system shall allow staff to clock in and clock out via a single button on today's shift screen, contingent on the location validation rules being satisfied.
- **FR-1.4 Expected earnings for current pay period** — The system shall display, on a staff-facing screen, total approved hours and expected gross earnings (in VND) for the configured pay period, computed per role × hours × rate.

### 3.2 Module 2 — Shift Scheduling & Multi-Location Management

- **FR-2.1 Weekly schedule view (single location)** — The system shall provide managers a weekly calendar/grid view of shifts for a selected location.
- **FR-2.2 Create, edit, delete shifts** — The system shall let a manager assign a shift (staff, date, start time, end time, role, location), edit any of those fields, or delete the shift.
- **FR-2.3 Conflict prevention** — The system shall block any shift creation or edit that would cause the same staff member to have overlapping time ranges, **including across different locations**.
- **FR-2.4 Multi-location assignment in a day** — The system shall allow assigning the same staff member to shifts at multiple locations on the same day, provided times do not overlap.
- **FR-2.5 Ad-hoc shift relocation** — The system shall allow a manager to change the location of a shift; the system shall re-evaluate Wi-Fi and geo validation against the new location and the staff app shall reflect the new schedule.

### 3.3 Module 3 — Automatic Attendance via Wi-Fi & Geo Validation

- **FR-3.1 Configure allowed Wi-Fi and geofence per location** — The system shall let admins (or delegated managers) configure, per location, one or more Wi-Fi identifiers (SSID/BSSID), an optional geofence (latitude, longitude, radius), and the validation mode: `Wi-Fi only`, `Geo only`, or `Wi-Fi + Geo (both required)`.
- **FR-3.2 Disable manual clock-in when out of range** — The system shall disable the staff "Clock in" control when the device fails the configured Wi-Fi/geo check, and shall display a clear message (in Vietnamese) explaining which requirement is failing.
- **FR-3.3 Optional automatic clock-in via Wi-Fi** — The system shall, when enabled per location, automatically create a clock-in record when a scheduled staff member's device connects to an allowed Wi-Fi within the shift window, and shall confirm the event to the staff member.
- **FR-3.4 Automatic clock-out with overtime tracking** — The system shall, when enabled per location, automatically clock the staff member out when they leave the allowed Wi-Fi/geo, set clock-out to the last presence timestamp, and flag any time worked beyond scheduled end as `Overtime — pending approval` for manager review.
- **FR-3.5 Manual fallback** — When automatic clock-in/out fails (lost connection, app not running, etc.), the system shall fall back to manual clock-in (if rules permit) or flag the record as `Needs manager review`.

### 3.4 Module 4 — Manager & Finance Dashboards & Reports

- **FR-4.1 Real-time attendance dashboard (today, single location)** — The system shall display, for a selected location and date (default: today), the live counts and a per-staff list of On-time, Late, Absent, and Overtime statuses, including scheduled time, actual in/out, and current status.
- **FR-4.2 Weekly attendance report (per location)** — The system shall produce, for a selected location and week, a per-staff report of days worked, total scheduled hours, total actual hours, total overtime hours, late count, and absence count.
- **FR-4.3 Projected vs. actual labor cost** — The system shall compute and display, per location and aggregated, projected labor cost (scheduled hours × applicable rate) and actual labor cost (approved hours × applicable rate) for a selected day or week, with absolute and percentage variance.
- **FR-4.4 Export reports to CSV/Excel** — The system shall let users export weekly attendance and labor-cost reports to CSV (Excel optional) including staff identifier, role, date, location, scheduled hours, actual hours, overtime hours, applicable rate, and total cost per row.

### 3.5 Module 5 — Roles, Permissions & Basic Admin Setup

- **FR-5.1 Define roles and hourly rates** — The system shall let admins create and edit roles (e.g., Waiter, Cashier, Supervisor) and set a base hourly rate per role; rates shall feed earnings and labor-cost calculations.
- **FR-5.2 Assign multiple roles and locations to a user** — The system shall let admins assign one or more roles and one or more authorized locations to each user, and mark a user as "Store manager" of one or more locations.
- **FR-5.3 Delegated role assignment for managers (limited)** — The system shall let admins enable, per location, a "delegated role assignment" capability that allows the local manager to assign existing roles to staff at that location but **not** to create roles or change pay rates.
- **FR-5.4 Audit log** — The system shall record an audit log entry for every manual modification of attendance, every role assignment/change, and every Wi-Fi/geo/location configuration change, capturing actor, timestamp, target, and before/after values.

### 3.6 Cross-cutting functional behaviour

- **FR-X.1 Pay-period configuration** — The system shall support a globally configurable pay period for MVP (e.g., monthly, or 1–15 / 16–end), which drives the staff "Expected earnings" view.
- **FR-X.2 Multi-role rate handling** — When a staff member works hours under more than one role within a period, the system shall compute earnings and cost as the sum of hours-by-role × rate-by-role.
- **FR-X.3 Lark integration** — The system shall surface scheduling and dashboard screens inside Lark and shall send key notifications (auto clock-in confirmation, overtime pending approval, daily shift summary) via the Lark Bot.

---

## 4. Non-Functional Requirements

### 4.1 Usability

- **NFR-USE-1** Staff-facing screens must be operable with one-tap interactions appropriate for non-technical front-line workers (e.g., a single "Clock in" button on the home screen).
- **NFR-USE-2** When an action is blocked by a rule (e.g., out of Wi-Fi/geo range), the UI must state **which** requirement failed (Wi-Fi vs. Location) rather than a generic error.
- **NFR-USE-3** Status indicators (clocked-in time, total hours worked, expected earnings) must be visible without navigating away from the home screen.
- **NFR-USE-4** "No shift today" and other empty states must be explicit, not blank screens.

### 4.2 Localization

- **NFR-LOC-1** All staff- and manager-facing copy must be available in Vietnamese for MVP; the architecture must allow adding English (and other locales) post-MVP without code changes to UI strings.
- **NFR-LOC-2** All monetary values must be formatted as VND with locale-appropriate separators.
- **NFR-LOC-3** Date and time displays must follow Vietnam locale conventions (24-hour time, DD/MM/YYYY).

### 4.3 Performance & responsiveness

- **NFR-PERF-1** The real-time attendance dashboard (FR-4.1) must reflect a clock-in/out event within a short delay (target: ≤ 30 seconds end-to-end) without manual refresh.
- **NFR-PERF-2** Automatic clock-in upon Wi-Fi association (FR-3.3) must be created within a short delay of the device joining the allowed network (target: ≤ 60 seconds), within the scheduled shift window.
- **NFR-PERF-3** Re-evaluation of Wi-Fi/geo state on the staff device must update the clock-in button availability without requiring an app restart (per the source brief).
- **NFR-PERF-4** Weekly schedule and weekly report views must render quickly enough for managers to use during a live shift change (target: ≤ 2 seconds for typical single-location data).

### 4.4 Reliability & data integrity

- **NFR-REL-1** Loss of network or app backgrounding must not silently drop a clock-in/out event; failed automatic events must be flagged as "Needs manager review" rather than discarded.
- **NFR-REL-2** Manual clock-in must remain available as a fallback when automatic capture is enabled but fails, except at locations explicitly configured as "Automatic only" (post-MVP).
- **NFR-REL-3** Overtime computation must be deterministic and auditable: from scheduled end time and clock-out time, given the rate rules in effect at the time of work.
- **NFR-REL-4** Pay computation must be reproducible — running the same period with the same approved hours and rates must always yield the same total.

### 4.5 Security & access control

- **NFR-SEC-1** Access must be enforced by role: staff see only their own schedule and earnings; managers see only their assigned locations; finance/admin scope is defined explicitly.
- **NFR-SEC-2** Delegated role assignment (FR-5.3) must not allow a manager to create new roles or modify pay rates under any path in the UI or API.
- **NFR-SEC-3** Biometric confirmation (post-MVP, see Section 7) must use the OS-native authenticator (Face ID, fingerprint, or platform equivalent); the app must never store biometric data itself.
- **NFR-SEC-4** Wi-Fi identifiers, geofences, rates, and role assignments must only be modifiable by users with the correct permission, and every change must be captured in the audit log (FR-5.4).
- **NFR-SEC-5** Personally identifiable information and pay data must be transmitted over encrypted channels (HTTPS/TLS) and protected at rest in the backend store.

### 4.6 Auditability

- **NFR-AUD-1** The audit log must be immutable from the application UI — admins can read and filter entries but cannot edit or delete them.
- **NFR-AUD-2** The audit log must support filtering by actor, target user, date range, and event type, and must retain entries for the duration required by Vietnamese labor record-keeping practice (to be confirmed; default: 24 months).

### 4.7 Configurability

- **NFR-CFG-1** Validation mode per location (Wi-Fi only / Geo only / both) must be configurable without a code release.
- **NFR-CFG-2** Auto clock-in and auto clock-out toggles must be independently configurable per location.
- **NFR-CFG-3** Late-arrival grace period and absence threshold must be configurable globally (and ideally per location) to drive dashboard categorization in FR-4.1.
- **NFR-CFG-4** Pay-period definition must be configurable globally; for MVP a single configuration is acceptable.

### 4.8 Compatibility & integration

- **NFR-CMP-1** The product must run as a Lark sidebar app for manager/finance flows and integrate with the Lark Bot for notifications.
- **NFR-CMP-2** The staff mobile experience must support modern iOS and Android versions in common use among Vietnamese front-line workers.
- **NFR-CMP-3** Wi-Fi detection must work with the Wi-Fi APIs available on supported mobile OS versions; if SSID is not reliably accessible on a given OS version, BSSID or a fallback method must be used.
- **NFR-CMP-4** CSV exports (FR-4.4) must open cleanly in Microsoft Excel, Google Sheets, and common Vietnamese payroll tools.

### 4.9 Scalability

- **NFR-SCA-1** The data model and APIs must support a chain with many locations and a single user assigned to multiple locations and multiple roles, without per-tenant code changes.
- **NFR-SCA-2** Reporting queries must scale to a full week of activity across all locations of a typical chain without degrading manager-facing latency targets (NFR-PERF-4).

### 4.10 Maintainability & operability

- **NFR-OPS-1** Failures in automatic capture must be observable to the operations team (logging/metrics) so that systemic issues can be detected before staff or managers report them.
- **NFR-OPS-2** Configuration data (rates, roles, locations, Wi-Fi/geo, holidays) must be inspectable and exportable for support and recovery.

### 4.11 Privacy

- **NFR-PRV-1** Geo and Wi-Fi presence data must only be used for attendance validation and must not be used for continuous tracking outside of shift windows.
- **NFR-PRV-2** Staff must be informed (in app, in Vietnamese) what data is collected and why, in line with applicable Vietnamese data-protection practice.

---

## 5. Acceptance Criteria

> Each AC is keyed to its Functional Requirement. The wording deliberately mirrors the source brief so test cases map 1:1.

### 5.1 Module 1 — Frontline Staff

#### AC-1.1 (verifies FR-1.1 — View today's shift)
- On opening the app, the user sees a "Today's shift" section.
- If the user has multiple shifts today, all are listed with start/end time, location name, and role.
- If the user has no shift today, a clear "No shift today" message is shown instead.

#### AC-1.2 (verifies FR-1.2 — View weekly schedule)
- The week view (7-day list or calendar) shows date, location(s), and shift time(s) for each day.
- The user can navigate to the previous and next weeks.

#### AC-1.3 (verifies FR-1.3 — Manual clock in / out)
- The "Clock in" button is shown on today's shift screen when the user has not yet clocked in **and** location validation passes.
- After successful clock-in, the screen shows "Clocked in at [time]" and a "Clock out" button.
- On clock-out, the screen shows "Clocked out at [time]" and total hours worked.
- If the action fails (e.g., lost connection), a clear error is displayed and no partial state is persisted.

#### AC-1.4 (verifies FR-1.4 — Expected earnings)
- A pay period is defined (configurable globally for MVP, e.g., monthly or 1–15 / 16–end).
- The screen shows total approved hours worked in the current period.
- The screen shows expected gross earnings = approved hours × rate, in VND.
- When the user works under multiple roles, earnings are computed as the sum of hours per role × rate per role.

### 5.2 Module 2 — Scheduling

#### AC-2.1 (verifies FR-2.1 — Weekly schedule view)
- A manager can select a location (defaulting to a primary location when they manage several).
- The week view shows days as columns and staff/shift blocks with name, role, and start/end time.

#### AC-2.2 (verifies FR-2.2 — Create/edit/delete shifts)
- The manager can create a shift specifying staff, date, start time, end time, role, and location.
- The manager can edit any field on an existing shift.
- The manager can delete a shift.
- A configured minimum shift length (if any) is validated on save.

#### AC-2.3 (verifies FR-2.3 — Conflict prevention)
- Saving a shift that overlaps in time with another shift for the same staff is blocked with a clear error.
- The block applies whether the overlapping shifts are at the same or different locations.

#### AC-2.4 (verifies FR-2.4 — Multi-location in a day)
- A staff member can be assigned to shifts at different locations on the same day if there is no time overlap.
- The weekly view clearly shows which shifts belong to which location, and supports filtering by location.

#### AC-2.5 (verifies FR-2.5 — Ad-hoc shift relocation)
- From schedule view or shift detail, the manager can change a shift's location field.
- Wi-Fi/geo validation for that shift is automatically re-pointed to the new location's configuration.
- The staff member's app shows the updated location and time without requiring re-login.

### 5.3 Module 3 — Automatic Attendance

#### AC-3.1 (verifies FR-3.1 — Configure Wi-Fi/geo)
- For each location, an admin (or delegated manager) can configure one or more Wi-Fi identifiers.
- For each location, an admin can optionally define a geofence (lat, lng, radius in meters).
- For each location, the validation mode is one of: Wi-Fi only, Geo only, Wi-Fi + Geo (both required).

#### AC-3.2 (verifies FR-3.2 — Disable clock-in out of range)
- When the device is not in the allowed Wi-Fi/geo for the scheduled location, the "Clock in" button is disabled (greyed out).
- A clear Vietnamese-language message explains the condition (e.g., *"Bạn cần kết nối Wi-Fi cửa hàng hoặc có mặt tại địa điểm làm việc để chấm công."*).
- The message indicates which requirement is failing (Wi-Fi and/or Location).
- Once the requirement is satisfied, the button becomes active **without** an app restart.

#### AC-3.3 (verifies FR-3.3 — Auto clock-in via Wi-Fi)
- A per-location toggle "Enable automatic clock-in via Wi-Fi" exists.
- When enabled, a staff member with a scheduled shift who connects to the allowed Wi-Fi within the shift window is automatically clocked in.
- The staff member sees a confirmation in the app and (optionally) receives a push/Lark notification.
- If automatic clock-in fails, the staff member can still clock in manually if the location rules permit.

#### AC-3.4 (verifies FR-3.4 — Auto clock-out with overtime)
- A per-location toggle "Enable automatic clock-out via Wi-Fi" exists.
- When the staff member leaves the allowed Wi-Fi/geo after being clocked in, clock-out time is set to the last time they were observed on Wi-Fi/geo.
- Time worked beyond the scheduled end time is flagged as "Overtime (pending approval)".
- The manager is notified and/or has a clear surface to review and approve overtime.
- If automatic clock-out fails, the record is flagged as "Needs manager review".

#### AC-3.5 (verifies FR-3.5 — Manual fallback)
- When auto-capture fails, manual clock-in remains usable subject to location rules.
- Records that could not be captured automatically are visibly flagged for manager review.

### 5.4 Module 4 — Dashboards & Reports

#### AC-4.1 (verifies FR-4.1 — Real-time dashboard)
- For a selected location and date (default: today), the dashboard shows:
  - **On-time:** clocked in within the configured grace period.
  - **Late:** clocked in after the grace period.
  - **Absent:** has a shift but no clock-in past a configurable threshold.
  - **Overtime:** currently working past scheduled end.
- Summary counts are visible for each category.
- A staff-level table shows scheduled time, actual in/out, and status.

#### AC-4.2 (verifies FR-4.2 — Weekly report)
- For a selected location and week, a per-staff report shows: days worked, total scheduled hours, total actual hours, total overtime hours, count of late arrivals, count of absences.

#### AC-4.3 (verifies FR-4.3 — Projected vs. actual cost)
- For a selected day or week:
  - **Projected cost** = scheduled shifts × applicable rate (including holiday/overtime rules where present).
  - **Actual cost** = approved attendance hours × applicable rate.
  - **Variance** = actual − projected, shown both as absolute value and as a percentage.
- The view is available per location and aggregated across all locations.

#### AC-4.4 (verifies FR-4.4 — CSV/Excel export)
- From any weekly attendance or cost report, the user can trigger "Export CSV" (Excel optional).
- Each row of the export contains: staff identifier, role, date, location, scheduled hours, actual hours, overtime hours, applicable rate, total cost.

### 5.5 Module 5 — Roles, Permissions & Admin

#### AC-5.1 (verifies FR-5.1 — Roles and rates)
- An admin can create and edit roles (e.g., Waiter, Cashier, Supervisor).
- An admin can set a base hourly rate per role.
- Rates feed both staff-facing expected earnings and projected/actual labor cost reports.

#### AC-5.2 (verifies FR-5.2 — Assign roles and locations)
- An admin can assign one or more roles to a user (e.g., Waiter + Shift Manager).
- An admin can assign one or more authorized locations to a user.
- An admin can mark a user as "Store manager" for one or more locations, granting scheduling and reporting rights at those locations.
- A single user can simultaneously be a frontline staff member and a manager (of themselves and/or others).

#### AC-5.3 (verifies FR-5.3 — Delegated role assignment)
- Admins can enable "delegated role assignment" per location.
- A manager at such a location can assign existing roles to staff in their location.
- A manager **cannot** create new roles and **cannot** change pay rates through this delegated path.
- All changes are recorded in the audit log with actor and timestamp.

#### AC-5.4 (verifies FR-5.4 — Audit log)
- The system records audit entries for: manual modification of attendance times, role assignments and changes, and Wi-Fi/geo/location configuration changes.
- The audit log is viewable by admins with filters for actor, date range, and event type.

### 5.6 Cross-cutting

#### AC-X.1 (verifies FR-X.1 — Pay-period configuration)
- A pay-period definition exists at the global level (MVP).
- The staff "Expected earnings" view uses the active pay period to bound included hours.

#### AC-X.2 (verifies FR-X.2 — Multi-role rate)
- When a staff member works under more than one role in a period, their earnings and the labor-cost line items are computed per role and summed.

#### AC-X.3 (verifies FR-X.3 — Lark integration)
- Manager and finance flows are accessible inside Lark.
- The Lark Bot delivers, at minimum: auto clock-in confirmation, overtime-pending-approval notification, and a daily shift summary (e.g., *"Hôm nay bạn làm ca 10:00–14:00 tại Cửa hàng A"*).

---

## 6. Assumptions, Dependencies, and Constraints

### 6.1 Assumptions

- Staff carry a personal smartphone capable of running the app and connecting to store Wi-Fi.
- Each store has a stable, identifiable Wi-Fi network whose SSID/BSSID can be enumerated by the OS.
- Hourly rates are linear within the MVP scope; complex shift differentials (night, weekend) are post-MVP unless covered by simple holiday multipliers.
- A single pay-period definition is acceptable across the organization for MVP.

### 6.2 Dependencies

- Lark platform availability for sidebar app and Bot APIs.
- Mobile OS Wi-Fi/geo APIs that expose the data needed for validation.
- A clock source consistent across server and devices for accurate timestamps.

### 6.3 Constraints

- 2-week MVP build window — items in Section 7 are deliberately deferred.
- Vietnamese-only UI for MVP.
- VND-only earnings/cost calculations for MVP.

---

## 7. Out of Scope for MVP (Post-MVP Backlog)

These items appear as "Later" stories in the source brief and are explicitly **not** part of MVP delivery:

- **Story 1.5 — Biometric confirmation for clock in/out** (Face ID, fingerprint, etc., toggleable per organization/location).
- **Story 2.5 — Shift templates** (e.g., 10–14, 17–22) reusable while creating shifts.
- **Story 2.6 — Copy previous week's schedule** to the new week with conflict flagging.
- **Story 3.5 — Fully automatic mode** at certain locations (no manual clock buttons; staff cannot edit times).
- **Story 4.5 — Multi-location overview dashboard** for regional managers / finance.
- **Story 5.5 — Holiday overtime configuration** (define holidays and overtime multipliers, apply to earnings and cost).

---

## 8. Glossary

- **Shift** — A scheduled block of work for a specific staff member, role, location, and time range.
- **Clock in / Clock out** — The recorded start and end timestamps of a working session.
- **Geofence** — A circular geographic region defined by latitude, longitude, and radius, used to validate physical presence.
- **SSID / BSSID** — Wi-Fi network identifiers used to validate that a device is on the store network.
- **Grace period** — The interval after scheduled start within which a clock-in counts as on-time rather than late.
- **Overtime** — Time worked beyond a scheduled shift's end time, flagged for manager approval.
- **Pay period** — The recurring window over which earnings are aggregated for staff (e.g., monthly, or 1–15 / 16–end).
- **Delegated permission** — A capability granted by a system admin to a store manager that is intentionally narrower than full admin (e.g., assign existing roles, but not create roles or change rates).
- **Audit log** — An append-only record of changes to sensitive data (attendance edits, roles, rates, location config).