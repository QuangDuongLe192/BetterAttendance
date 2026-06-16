# DEVELOPMENT.md — Better Attendance

> Engineering rules for this project. Pair with `CLAUDE.md` (product/domain context) and `Better_Attendance_MVP_Requirements.md` (FR/NFR/AC). Where this file conflicts with a hard rule in `CLAUDE.md` § 4, the hard rule wins.

## 0. Guiding principles

- **Wrong pay is a P0.** Anything that touches hours, rates, overtime, or earnings is held to a higher bar than the rest of the codebase — more tests, more review, more paranoia.
- **Boring is good.** Prefer well-known patterns over clever ones. We have 2 weeks for MVP and a domain (payroll-adjacent) where surprises hurt.
- **Reversible > irreversible.** Feature flags over hard launches. Soft delete over hard delete. Append-only over mutate-in-place for anything audit-relevant.
- **Server is the source of truth.** Never trust the client for time, identity, location validation result, rate, or permission.

---

## 1. Repository & code structure

- One repo for backend + Lark sidebar UI; mobile app may live in a separate repo. Confirm before adding code.
- Each module from the spec (Staff, Scheduling, Wi-Fi/Geo, Reports, Admin) gets its own folder/package. Cross-module access goes through a public interface, not deep imports.
- Domain logic (pay, overtime, conflict detection) lives in pure functions/modules with no I/O. I/O wrappers are separate.
- No `utils.js` / `helpers.py` dumping grounds. If a helper has no clear home, that's a design smell — name the concept first.

## 2. Git workflow

- **Branches:** `master` is always deployable. Feature branches are `feat/<module>-<short-desc>`, fixes are `fix/<short-desc>`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). Reference the FR ID in the body when applicable.
  - Example: `feat(scheduling): block cross-location overlap [FR-2.3]`
- **PRs:** small and focused. If a PR touches more than 2 modules, justify it in the description.
- **No force-push to `master`.** Force-push to your own feature branch is fine.
- **Squash on merge.** The PR title becomes the commit title — write it for someone reading `git log` in 6 months.

## 3. Code review

- Every PR needs at least one approval. PRs touching pay, overtime, permissions, or the audit log need **two**.
- Reviewer must run the code locally if the PR claims to fix a bug. "LGTM" without verification is not a review.
- The author writes the PR description. It includes: what changed, why, FR ID(s), how it was tested, and any known follow-ups.
- If the PR adds a "Later"-scope feature (see `CLAUDE.md` § 6), reject and reopen as a scope discussion.

## 4. Testing

- **Unit tests are mandatory for:** pay calculation, overtime computation, shift conflict detection, Wi-Fi/geo validation, permission checks. These are the highest-risk modules and untested code in them is a defect.
- **Integration tests are mandatory for:** auto clock-in, auto clock-out, auto-capture failure paths (which must produce `Needs manager review`, never silent drops).
- **E2E happy paths:** staff opens app → clocks in → clocks out → sees hours. Manager creates a shift that conflicts → save is blocked.
- **Property-based / table-driven tests** for pay and overtime: at minimum, parameterize over single role, multi-role, with and without overtime, across pay-period boundaries.
- **Never test against production data.** Fixtures use synthetic Vietnamese names and synthetic phone numbers.
- A bug fix lands with a regression test that fails before the fix and passes after. No exceptions.
- CI must run all of unit + integration on every PR. Merge is blocked on failure.

## 5. Time, dates, and timezones

This domain lives or dies on time handling. Read this section twice.

- **Store all timestamps in UTC.** Always. In whatever the chosen backend's standard timestamp type is.
- **Display in `Asia/Ho_Chi_Minh`** (UTC+7, no DST). Never compute durations using local-time arithmetic — convert to UTC first.
- **Use the platform's well-trodden datetime library**, not strings. `Date.parse("...")` is banned for business logic.
- **Shift "date" is a date, not a timestamp.** A shift on 8 May is on 8 May regardless of where the server runs.
- **Overnight shifts exist** (e.g., 22:00–02:00). Conflict detection and hours computation must handle the day boundary correctly — write the test for it.
- **Server clock is authoritative for clock-in/out timestamps.** The mobile client may suggest, but the server records its own time at receipt.
- **Clock skew between mobile and server** must be tolerated within a small window (e.g., ±2 minutes). Beyond that, log it.

## 6. Money, rates, and calculations

- **Never use floating-point for money or hours billed.** Use integers (minor units / minutes) or a decimal type. `0.1 + 0.2` is not a joke in payroll.
- **Hours are stored in minutes.** Display as `HH:MM` or decimal hours, but the stored unit is the minute.
- **Rates are stored in VND per hour as integers.** Compute earnings as `(minutes_worked × rate_vnd_per_hour) / 60`, with documented rounding rules.
- **Rounding:** define and document one rounding policy (likely `round half to even` at the final step). Never round mid-calculation.
- **Pay computation must be a pure function** of (approved entries, role-rate map, period definition). Same inputs, same output, every time. This is a `CLAUDE.md` § 4 hard rule.
- **All rate / pay logic has a "show your work" mode** — a function or test helper that returns the per-line-item breakdown, not just the total. Auditors will ask.

## 7. Database & migrations

- **All schema changes go through versioned migrations.** No hand-edits in any environment.
- **Migrations are forward-only in production.** Write a follow-up migration to undo, don't roll back.
- **Multi-location data isolation:** every domain table that holds shifts, attendance, rates, or staff assignments has a `location_id` (or equivalent) and queries are filtered on it by default. Audit any query that selects across locations.
- **Soft-delete shifts and attendance records** (a `deleted_at` column or equivalent). Do not hard-delete — managers and auditors will need history.
- **The audit log table is append-only at the database level.** Application user has `INSERT` and `SELECT`, not `UPDATE` or `DELETE`. Enforce in DB grants, not just in code.
- **All queries use parameterized statements.** String concatenation into SQL is a CR-blocker.
- **Indexes follow query patterns, not hopes.** Add an index because you measured a slow query, and add the slow-query log line to the migration's PR description.

## 8. API design

- **Authentication on every endpoint** except a documented allowlist. Default-deny.
- **Authorization is checked in the handler, not in the UI.** Server enforces "this manager can only schedule for their locations."
- **Idempotency for state-changing endpoints** that can plausibly be retried (clock-in, clock-out, create-shift). Use an idempotency key from the client.
- **Validate inputs at the boundary.** Reject malformed/out-of-range data before it reaches domain logic.
- **Errors return a stable error code + a Vietnamese-ready message key**, not a free-text string. The client renders the message; the server names the cause.
- **No PII in URLs.** Names, phone numbers, IDs that resolve to a person → request body or headers, not query strings.
- **Time fields in API responses are ISO 8601 with timezone offset** (e.g., `2026-05-08T09:00:00+07:00`). No "epoch ms with implicit timezone."

## 9. Security & permissions

- **Role-based access control is centralized.** One module decides "can this user do X to this resource." Handlers call into it; they don't reimplement it.
- **Delegated managers cannot create roles or change rates.** Enforce in the permission module, not just by hiding the UI button (`CLAUDE.md` § 4, `NFR-SEC-2`).
- **Secrets** (API keys, DB credentials, Lark tokens) live in the secrets manager, not in `.env` files committed to git. Pre-commit hooks scan for accidental leaks.
- **All traffic over TLS.** Local dev is the only exception, and only on `localhost`.
- **Dependencies are scanned** for known CVEs in CI; criticals block merge.
- **No `eval`, no dynamic code construction** from user input. Ever.
- **Rate-limit auth-sensitive endpoints** (login, role changes, rate edits) at the gateway.
- **Mobile apps verify the server's TLS certificate normally** — no certificate-pinning hacks unless we've decided to invest in the rotation story.

## 10. Logging, audit, and observability

- **Three signals, kept separate:** application logs (debugging), audit log (who changed what), metrics (how the system is performing). Don't conflate them.
- **Audit log entries** capture: actor user ID, target resource, event type, before/after values where applicable, timestamp (UTC), source IP. Required for: manual attendance edits, role changes, rate changes, location/Wi-Fi/geo config changes (`FR-5.4`).
- **Application logs never contain:** raw passwords, raw biometric data, full payment data. Phone numbers and names are redacted in non-production environments.
- **Structured logging** (JSON) at INFO and above. Free-text DEBUG is fine locally.
- **Every auto-capture failure increments a metric** with location and reason as labels. Operations should see systemic Wi-Fi issues before staff complain (`NFR-OPS-1`).
- **Tracing or request IDs** propagated end-to-end so a "why didn't I get clocked in?" question is answerable from a log query.

## 11. Error handling & resilience

- **Exceptions for exceptional cases, returns for expected ones.** "User out of geofence" is an expected outcome, not an exception. "Database unreachable" is an exception.
- **Fail loud in development, fail safe in production.** Production errors are logged and surfaced through Vietnamese-translated UI messages, never raw stack traces.
- **Network or app failure on the staff device must not silently drop a clock event.** Either the event lands on the server, or the UI shows the user it didn't (`NFR-REL-1`, `FR-3.5`).
- **Retries** on the mobile client for clock-in/out: exponential backoff, capped, with idempotency keys (see § 8).
- **Background sync** for attendance events that occurred while offline. Document the merge rule when both client and server have a record.
- **Time-bounded operations** (e.g., a manager dashboard query) have a server-side timeout. They return a partial result + warning rather than hanging.

## 12. Localization & user-facing strings

- **No hard-coded user-facing strings in code.** All strings live in a localization file keyed by stable IDs (`error.clock_in.out_of_range`, not "you are out of range").
- **Vietnamese is the source language** for MVP. English glosses go in code comments next to the key, for engineers who don't read Vietnamese.
- **Date, time, currency formatting** uses the platform's locale APIs configured to `vi-VN`. No manual `.toLocaleString()` with hard-coded options scattered around.
- **Plurals and number formatting** go through the i18n library. Don't `if (n === 1)` your way through grammar.
- **Out-of-range messages name the failing check** (Wi-Fi vs. Location), per `NFR-USE-2`. The localization file has separate keys for each cause.

## 13. Performance

- **Performance budgets, per `NFR-PERF`:**
  - Real-time dashboard reflects an event ≤ 30 seconds end-to-end.
  - Auto clock-in via Wi-Fi recorded ≤ 60 seconds after association.
  - Weekly schedule and report views render ≤ 2 seconds for typical single-location data.
- **No N+1 queries** in any list/dashboard endpoint. Code review checks for this; logging in dev surfaces it.
- **Pagination is mandatory** for any list that can grow with location count, staff count, or time range.
- **Heavy reports run async** if they can't comfortably hit the budget — return a job ID, deliver via Lark or in-app inbox.
- **Profile before optimizing.** "I think this is slow" is not a reason to refactor.

## 14. Dependencies

- **New dependencies require a one-line justification in the PR.** "Why this, why not the standard library."
- **Pin versions** (lockfiles committed). Floating ranges are not allowed in production builds.
- **Avoid abandoned packages.** Last release > 2 years ago is a yellow flag; combined with low maintainer activity, it's a no.
- **License check:** GPL-family dependencies require sign-off given this is a commercial product.

## 15. Documentation

- **The requirements doc is canonical for behavior.** Code comments don't redefine requirements; they reference the FR/AC ID.
- **Public functions have a one-line docstring** describing the contract, not the implementation.
- **README in each module** explains: what it owns, what it depends on, how to run its tests.
- **Migration PRs include a one-paragraph note** in the description explaining the change and any backfill steps.
- **Architecture decisions are written down.** A short ADR (Architecture Decision Record) lives in `docs/adr/` for choices like database engine, mobile framework, time-zone strategy, idempotency-key scheme. Future-you will thank present-you.

## 16. Definition of Done

A change is *done* when **all** of the following hold:

- The code is merged to `master`.
- The matching FR/AC ID is referenced in the commit/PR.
- Unit tests cover the new logic; integration tests cover any new failure path.
- All required reviews are green (two reviews for pay/permissions/audit).
- User-facing strings are in the locale file (Vietnamese + English gloss in comment).
- Audit log entries are emitted for any newly tracked change type.
- The performance budget for any affected view is still met.
- Documentation (README, ADR if needed, requirements doc if behavior changed) is updated in the same PR.
- A manual smoke test was run by the author against the relevant happy path.
- Nothing in `CLAUDE.md` § 4 (hard rules) was relaxed without an explicit, approved exception.

---

## Quick reference — what to triple-check before merging

1. Did I touch pay, overtime, permissions, or the audit log? → two reviewers, extra tests.
2. Did I touch time/timezone logic? → write the overnight-shift test.
3. Did I add a user-facing string? → it's in the locale file, not the code.
4. Did I add a query? → it filters by `location_id` where applicable, and it's parameterized.
5. Did I add an endpoint? → auth on, idempotency considered, errors are coded not free-text.
6. Did I quietly add a "Later" feature? → stop, raise it.