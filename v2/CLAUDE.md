# CLAUDE.md — Better Attendance

> Project-level guidance for Claude (and Claude Code). Read this first; it overrides general assumptions.

## 1. What this project is

**Better Attendance** is an attendance, scheduling, and labor-cost product for front-line teams in F&B and retail in **Vietnam**.

- **Tagline:** *"No more timesheets. Just show up and get paid."*
- **For staff:** see today's shift, clock in/out with one tap, or be clocked in automatically over store Wi-Fi. See expected pay for the period.
- **For managers:** real-time view of who is present, late, absent, or in overtime; schedule across multiple locations without conflicts.
- **For finance:** projected vs. actual labor cost per location, exportable to CSV/Excel for payroll.
- **Primary surfaces:** Lark sidebar app (manager/finance) + mobile (staff) + Lark Bot (notifications).

## 2. Project status

- **Phase:** requirements & early design. There is no production codebase yet.
- **Source of truth for behavior:** `Better_Attendance_MVP_Requirements.md` (FR / NFR / AC sections). Refer to requirements by ID — `FR-1.1`, `NFR-SEC-2`, `AC-3.4`. **Do not invent new IDs without updating the spec.**
- **Build window for MVP:** 2 weeks. Scope discipline matters more than feature breadth.
- **Required local setup:** Atlassian MCP must be connected to your Claude Code CLI before any ticket-bound work begins. See `SETUP.md`. **No MCP, no code.**

## 3. Tech stack & required local setup

### 3.1 Required local setup — mandatory before coding

> Read `SETUP.md` and complete it before opening any PR. This section names *what* must be connected; `SETUP.md` is *how*.

- **Atlassian MCP for Claude Code CLI** — every team member must have the Atlassian MCP server (`https://mcp.atlassian.com/v1/mcp`) connected to their Claude Code CLI **before** opening a code change for this project.
  - Why: tickets are the source of truth (`WORKFLOW.md` § 6) and every Story references an `FR-x.y`. Without MCP, the agent cannot read tickets, validate requirement IDs, or transition status — it can only guess, and guessing produces ticket-less PRs and fabricated AC.
  - Verification: in a session, ask Claude Code to read a real ticket (e.g., `BA-1`). It must call the Atlassian MCP tool and return real content. If it answers without a tool call, MCP is not actually wired up — stop and fix it before doing any work.
  - Enforcement: this is gated at Definition of Ready (`WORKFLOW.md` § 1.4) and Definition of Done (`WORKFLOW.md` § 16). It is also a hard rule (§ 4 below).

### 3.2 Build targets

> To be confirmed. Update this section when stack decisions are made; do not assume.

- **Backend:** _TBD_
- **Web (Lark sidebar):** _TBD_
- **Mobile (staff app):** _TBD_
- **Database:** _TBD_
- **Auth:** _TBD_ (Lark SSO is likely)
- **Notifications:** Lark Bot

If asked to write code before § 3.2 is filled in, **ask which stack to use** rather than guessing.

## 4. Hard rules — never break these without explicit approval

These map to non-negotiable requirements in the spec. Violating one is a defect, not a tradeoff.

- **Atlassian MCP is connected before any ticket-bound work.** Tickets are the source of truth; the agent cannot validate FR/AC IDs, transition tickets, or read acceptance criteria without MCP. If MCP is not connected in the current session, stop and run setup (`SETUP.md` § "Verification") — do not proceed by guessing what the ticket says.
- **Vietnamese-first UI.** All staff- and manager-facing strings ship in Vietnamese for MVP. Architecture must allow other locales without code changes to UI strings (`NFR-LOC-1`). No hard-coded English in user-facing copy.
- **Currency is VND, always.** Display with locale-appropriate separators. No USD, no implicit conversions (`NFR-LOC-2`).
- **No overlapping shifts for the same staff, ever.** Across locations included (`FR-2.3`). This is the canonical scheduling invariant — server-side validation, not just UI.
- **Never silently drop a clock-in/out event.** Failed automatic capture is flagged `Needs manager review`, not discarded (`NFR-REL-1`, `FR-3.5`).
- **Manual clock-in stays available as a fallback** when auto-capture is enabled but fails — except at locations explicitly configured as "Automatic only" (which is post-MVP anyway) (`NFR-REL-2`).
- **Delegated managers cannot create roles or change pay rates.** Through any UI or API path (`FR-5.3`, `NFR-SEC-2`). This is a security boundary, not a UX preference.
- **Audit log is append-only from the application.** No edit, no delete from the UI (`NFR-AUD-1`). Every change to attendance times, roles, rates, or location config writes an audit entry (`FR-5.4`).
- **Pay computation is deterministic and reproducible.** Same approved hours + same rates + same period = same total, every time (`NFR-REL-3`, `NFR-REL-4`).
- **Geo and Wi-Fi data is for attendance only.** Not continuous tracking outside shift windows (`NFR-PRV-1`).
- **All PII and pay data over TLS, encrypted at rest** (`NFR-SEC-5`).

## 5. Domain glossary (short form)

Full definitions are in the requirements doc § 8. Quick reference:

- **Shift** — scheduled work block: staff + role + location + time range.
- **Clock in / Clock out** — recorded start/end timestamps of a working session.
- **Geofence** — circle defined by lat, lng, radius (meters) around a store.
- **SSID / BSSID** — Wi-Fi identifiers used to validate physical presence at a store.
- **Grace period** — interval after scheduled start within which a clock-in still counts as on-time.
- **Overtime** — time worked past scheduled shift end. **Always flagged "pending approval"** until a manager approves it.
- **Pay period** — recurring earnings window. MVP supports a single global config (e.g., monthly, or 1–15 / 16–end).
- **Validation mode** — per-location: `Wi-Fi only` | `Geo only` | `Wi-Fi + Geo (both required)`.
- **Delegated permission** — manager capability narrower than admin (e.g., assign existing roles only).

## 6. MVP scope — keep it tight

### In scope (MVP)
Modules 1–5 in the spec: staff attendance experience, scheduling & multi-location, Wi-Fi/geo validation, dashboards & reports, roles & admin.

### Out of scope (post-MVP) — do not slip these in
- Biometric confirmation on clock in/out (Story 1.5).
- Shift templates (Story 2.5).
- Copy previous week's schedule (Story 2.6).
- Fully automatic mode with no manual buttons (Story 3.5).
- Multi-location overview dashboard for regional managers (Story 4.5).
- Holiday overtime configuration (Story 5.5).

If a request seems to require one of these, **flag it and ask** before implementing. Don't quietly ship a "small version."

## 7. How to handle ambiguity

- **Behavior questions:** check the spec by ID first. If the spec is silent, ask. Do not invent business rules — especially around pay, overtime, or permissions.
- **Vietnamese copy:** for net-new strings, propose Vietnamese (with a literal English gloss in a comment) and flag for native-speaker review. Don't ship machine-translated copy as final.
- **Rate / pay logic:** if a calculation isn't fully specified, surface the gap rather than guessing. Wrong pay numbers are a high-trust failure.
- **Scope creep:** if a "small addition" pulls in a "Later" item from § 6, name it and stop.

## 8. Conventions for changing requirements

- The requirements doc is the source of truth. If the product changes, **update the doc first**, then implement.
- When adding an FR, also add the matching AC and consider whether any NFR is implicated.
- Keep IDs stable. If a requirement is removed, mark it deprecated rather than renumbering — references in commits, tickets, and tests rely on stable IDs.
- Cross-reference the FR ID in commit messages and PR descriptions (e.g., `feat(scheduling): block cross-location overlap [FR-2.3]`).

## 9. Notification & UX defaults (until specified otherwise)

- **Confirmations:** auto clock-in success → in-app confirmation + Lark Bot push.
- **Manager alerts:** overtime pending approval, auto-capture failure flagged for review.
- **Daily summary (Lark Bot):** something like *"Hôm nay bạn làm ca 10:00–14:00 tại Cửa hàng A."*
- **Out-of-range messaging:** must say *which* check failed (Wi-Fi vs. Location), not a generic error (`NFR-USE-2`).
- **Empty states:** explicit copy ("No shift today" / "Không có ca làm hôm nay"), never blank screens.

## 10. Testing posture (placeholders — fill in once stack lands)

- **Unit tests:** required for pay/overtime/conflict-detection logic. These are the highest-risk modules.
- **Integration tests:** auto clock-in / auto clock-out flows, including failure paths that produce `Needs manager review`.
- **E2E:** at minimum, the staff happy path (open app → clock in → clock out → see hours) and the manager schedule-conflict path.
- **Test data:** never use real staff PII in fixtures.

Commands and CI integration: _TBD when stack is decided._

## 11. Working with Claude on this project — quick rules

- **Reading a ticket means calling Atlassian MCP, not guessing from a key.** If the Atlassian MCP tool isn't available in the current session, say so and stop — don't fabricate ticket content, don't invent FR IDs, don't infer acceptance criteria. Run `SETUP.md` § "Verification" and try again.
- **Every code change starts from a ticket.** First action of a coding session: fetch the ticket via Atlassian MCP, then read the FR/AC section it references in the requirements doc, then plan.
- **Status transitions are real, not housekeeping.** Move tickets through Jira (via MCP) only when the corresponding action actually happened (PR opened, merged, deployed). Do not "tidy up" statuses.
- Default to **Vietnamese** for any user-facing copy you generate; pair with an English gloss in code comments or PR notes.
- Default to **VND** for any monetary example or test fixture.
- Reference requirements by ID. If an ID doesn't exist for what you're doing, that's a signal to update the spec, not to skip the reference.
- When in doubt about a business rule, **ask once with options** rather than guessing across multiple turns.
- Don't reformat the requirements doc casually — its IDs are load-bearing.

## 12. Jira SD Workflow

Jira config (project key, states, transition IDs, ticket fields, enforcement rules) → **`docs/Jira.md`**.

**Read `docs/Jira.md` in full at the start of any session that involves creating or transitioning Jira tickets.**

## 13. Workflows

All step-by-step processes live in **`docs/workflows/`**. Read `docs/workflows/README.md` to find the right workflow for the task.

| Workflow | File | When |
|----------|------|------|
| Analyse requirements | `docs/workflows/analyse-requirements.md` | Turning requirements into spec + plan |
| Implement a ticket | `docs/workflows/implement-ticket.md` | Picking up any sprint board task |
| Debug | `docs/workflows/debug.md` | Bug, failing test, unexpected behaviour |

**Read the relevant workflow file before starting any work of that type.**