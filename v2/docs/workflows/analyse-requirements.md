# Analyse Requirements Workflow

> Use this workflow when turning a set of requirements (Jira epic, FR list, or raw description) into a ready-to-execute spec + plan.
> For picking up an already-planned task, use `implement-ticket.md` instead.
> For bugs, use `debug.md`.

---

## Output Contract

This workflow always produces **two files** before any implementation begins:

| Output | Path | Purpose |
|--------|------|---------|
| Spec | `docs/superpowers/specs/YYYY-MM-DD-<topic>.md` | What to build and why — test cases, FE spec, BE spec, API contract |
| Implementation plan | `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` | Ordered vertical-slice tasks with dependency tree |

And **Jira tickets** for every task in the plan.

---

## The 6-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1 — GATHER INPUT                                       │
│                                                             │
│  • Read the Jira epic / story via MCP                       │
│  • Read the referenced FR/AC IDs from the requirements doc  │
│  • Read CLAUDE.md §6 — confirm scope is MVP only            │
│  • Read existing spec/plan files — don't duplicate work     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 2 — ANALYSE                                           │
│                                                             │
│  • Map every FR to exactly one user story                   │
│  • For each user story: list inputs, outputs, edge cases    │
│  • Flag any FR that is out of MVP scope (§6 post-MVP list)  │
│  • Identify shared data models across stories               │
│  • Identify API endpoints required                          │
│  • Surface ambiguity: ask once with options, then continue  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 3 — WRITE DESIGN SPEC                                 │
│                                                             │
│  Path: docs/superpowers/specs/YYYY-MM-DD-<topic>.md  │
│                                                             │
│  Sections (in order):                                       │
│   1. Context & scope                                        │
│   2. Data model (entities, DB schema, migrations)           │
│   3. API contract (endpoints, request/response DTOs, errors)│
│   4. Test cases per FR/AC (table-driven)                    │
│   5. Frontend spec (components, hooks, types, i18n keys)    │
│   6. Backend spec (Domain → Application → Infra → API)      │
│   7. AOT checklist (AppJsonContext types, no-reflection)     │
│   8. Definition of Done                                     │
│                                                             │
│  Rules:                                                     │
│   • Reference FR/AC IDs throughout — never invent new IDs  │
│   • All VND amounts as integers, never float                │
│   • All user-facing strings have a vi.json key             │
│   • All timestamps as UTC in DB, ISO 8601 +07:00 on wire   │
│   • Every error maps to { code, messageKey }               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 4 — DECOMPOSE INTO VERTICAL SLICES                    │
│                                                             │
│  One slice = one user story = one Jira task                 │
│                                                             │
│  Each slice MUST contain ALL of these layers:               │
│   🔴 Tests RED  — failing FE component tests                │
│                 — failing BE unit + integration tests       │
│   🟢 FE GREEN   — types, API client, hooks, components, page│
│   🟢 BE GREEN   — domain, application, infra, API endpoint  │
│                                                             │
│  Execution order WITHIN each slice (non-negotiable):        │
│   1. Write FE component tests (Vitest + RTL + MSW) — RED   │
│   2. Write BE unit tests (xUnit + NSubstitute) — RED       │
│   3. Write BE integration tests (WebApplicationFactory) RED │
│   4. Implement FE (types → hooks → components → page) GREEN │
│   5. Implement BE (Domain → Application → Infra → API) GREEN│
│   6. Run full test suite — all must pass before DONE        │
│                                                             │
│  Scaffold and seed tasks are allowed as PREREQUISITES only  │
│  (no partial slices — never FE-only or BE-only tasks)       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 5 — BUILD DEPENDENCY TREE                             │
│                                                             │
│  For every slice task, explicitly list:                     │
│   • Blocks: tasks that CANNOT start until this one is DONE  │
│   • Blocked by: tasks that must be DONE before this starts  │
│                                                             │
│  Dependency rules:                                          │
│   • Scaffold (BE + FE) → all slice tasks (always)          │
│   • Seed data → any slice that queries real data            │
│   • Slice A blocks Slice B if B's FE or BE reads data      │
│     produced by A (e.g., ClockIn result shown in EarningsCard)│
│   • Domain model slice → any slice that imports its types   │
│                                                             │
│  Validation check — before writing the plan:               │
│   [ ] No circular dependencies                              │
│   [ ] Every slice has a path to completion (not orphaned)   │
│   [ ] Parallel groups are correctly identified              │
│   [ ] QA smoke test is always last                          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 6 — WRITE PLAN + CREATE JIRA TICKETS                  │
│                                                             │
│  Path: docs/superpowers/plans/YYYY-MM-DD-<topic>.md         │
│                                                             │
│  Plan structure:                                            │
│   • Header: goal, architecture, tech stack, spec link       │
│   • File map (BE + FE files this plan will create/modify)   │
│   • Dependency tree diagram (ASCII)                         │
│   • One section per slice task (see Task Template below)    │
│                                                             │
│  For each task: create a Jira SD ticket via MCP             │
│   • Type: Story (slice) or Task (scaffold/seed/QA)          │
│   • Link to the Epic                                        │
│   • Description: FR/AC refs + acceptance criteria           │
│                                                             │
│  Update board.md with every new task row                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3 — Design Spec Template

````markdown
# <Topic> — Design Spec

**Sprint:** N
**Date:** YYYY-MM-DD
**FR/AC covered:** FR-X.1 – FR-X.N · AC-X.1 – AC-X.N
**Execution order:** Scaffold → Seed → [Vertical Slices in dependency order]
**Stack:** .NET 10 Clean Architecture · React 18 + TypeScript (FSD)
**Locale:** Vietnamese-first · VND · Asia/Ho_Chi_Minh (UTC+7)

---

## 1. Context & Scope

### 1.1 What this delivers
| FR | Title | AC | In scope? |

### 1.2 What this does NOT include (post-MVP)

### 1.3 Prerequisites (must exist before slices run)

---

## 2. Data Model

### 2.1 Entities (Domain layer)
<!-- C# sealed class skeletons -->

### 2.2 DB Schema
<!-- Table definitions with column types and constraints -->

### 2.3 Key constraints & rules

---

## 3. API Contract

### 3.1 Endpoint map
| Method | Path | Command/Query | Auth |

### 3.2 Request / Response DTOs (TypeScript + C# side-by-side)

### 3.3 Error codes
| Code | messageKey | HTTP status |

---

## 4. Test Cases

> Table-driven. Agents map these to xUnit [Theory] and Vitest test.each().

### 4.1 AC-X.1 — <Title> (FR-X.1)

**Unit: <ServiceName>.<MethodName>**
| # | Input | Expected output |

**Component: `<<ComponentName> />`**
| # | State | Expected UI |

**Integration: <METHOD> <path>**
| # | Scenario | Expected HTTP |

<!-- Repeat per AC -->

---

## 5. Frontend Spec

### 5.1 Routing
### 5.2 FSD folder structure
### 5.3 API layer pattern (attendance.api.ts)
### 5.4 TypeScript types (attendance.types.ts)
### 5.5 Zustand store (if UI state needed)
### 5.6 React Query hook pattern
### 5.7 Component pattern (Radix UI + Tailwind v4)
### 5.8 Vietnamese i18n strings (vi.json additions)
### 5.9 Date / currency formatting rules
### 5.10 Empty states

---

## 6. Backend Spec

### 6.1 Domain layer (no dependencies)
### 6.2 Application layer (commands + queries + handlers + interfaces)
### 6.3 Infrastructure layer (EF entities + repos + migrations + mappers)
### 6.4 API layer (endpoints + AppJsonContext + auth + validation)

---

## 7. AOT Checklist

- [ ] All response types registered in AppJsonContext
- [ ] No reflection (no GetType, Activator, AutoMapper)
- [ ] No MediatR — Mediator v3 only
- [ ] No Newtonsoft.Json — System.Text.Json only
- [ ] EF Core compiled models regenerated after DbContext change
- [ ] Frontend TypeScript types match backend DTOs 1:1

---

## 8. Definition of Done

- [ ] All test cases T<N>.x.x pass
- [ ] All user-facing strings in vi.json
- [ ] Currency: `280.000 ₫` (vi-VN locale)
- [ ] Dates: `DD/MM/YYYY HH:mm` (Asia/Ho_Chi_Minh)
- [ ] Errors: `{ code, messageKey }` — no raw prose
- [ ] Nothing from post-MVP list quietly included
````

---

## Step 6 — Plan Task Template (per vertical slice)

Each task section in the plan file follows this structure:

````markdown
## Task <N> — <Slice Title> [<TASK-ID>]

**Jira:** [SD-N](https://candylio-trial-823.atlassian.net/browse/SD-N)
**FR/AC:** FR-X.Y, AC-X.Y
**Blocked by:** Task N-1 (or "none")
**Blocks:** Task N+1

---

### Step 1 — Write Tests RED

**FE tests** (`fe-staff/src/features/<feature>/components/<Component>.test.tsx`)
- [ ] Test T<N>.x for `<Component>`: <description>
- [ ] Test T<N>.x for `<Component>`: <description>

**BE unit tests** (`be/tests/BetterAttendance.Domain.Tests/<path>`)
- [ ] Test T<N>.x for `<Class>.<Method>`: <description>

**BE unit tests** (`be/tests/BetterAttendance.Application.Tests/<path>`)
- [ ] Test T<N>.x for `<Handler>`: <description>

**BE integration tests** (`be/tests/BetterAttendance.Integration.Tests/<path>`)
- [ ] Test T<N>.x for `<METHOD> <path>`: <description>

Run and confirm RED before proceeding:
```bash
cd fe-staff && npx vitest run --reporter=verbose
cd be && dotnet test
```

---

### Step 2 — Implement Frontend GREEN

- [ ] `src/features/<feature>/types/<feature>.types.ts` — add/update types
- [ ] `src/features/<feature>/api/<feature>.api.ts` — add typed fetch method
- [ ] `src/features/<feature>/hooks/use<Feature>.ts` — React Query hook
- [ ] `src/features/<feature>/components/<Component>.tsx` — implement component
- [ ] `src/pages/<Page>.tsx` — wire component into page
- [ ] `src/shared/i18n/vi.json` — add missing i18n keys
- [ ] Run FE tests: `npx vitest run` — must be GREEN

---

### Step 3 — Implement Backend GREEN

- [ ] `be/src/BetterAttendance.Domain/<path>` — entity / value object / domain service
- [ ] `be/src/BetterAttendance.Application/<path>` — command/query + handler + DTOs
- [ ] `be/src/BetterAttendance.Infrastructure/<path>` — EF entity + repo + migration
- [ ] `be/src/BetterAttendance.Api/<path>` — endpoint + AppJsonContext types
- [ ] Run BE tests: `dotnet test` — must be GREEN

---

### Step 4 — Integration Pass

- [ ] DI registration wired (`AddApplication`, `AddInfrastructure`)
- [ ] `dotnet build` — 0 errors, 0 warnings
- [ ] `tsc --noEmit` — 0 errors
- [ ] Run full suite: all tests GREEN
````

---

## Step 5 — Dependency Tree Rules

### What counts as a dependency

| Situation | Rule |
|-----------|------|
| Slice B renders data created by Slice A | B is blocked by A |
| Slice B imports a domain type from Slice A | B is blocked by A |
| Slice B uses an API endpoint defined in Slice A | B is blocked by A |
| Slice B and Slice A share only the scaffold | No dependency between them — can run in parallel |
| Multiple slices depend on Seed data | All blocked by Seed, not by each other |

### Dependency diagram format

```
[Scaffold BE] ──┐
[Scaffold FE] ──┤
[Seed Data]  ───┤
                ▼
     [Slice A: <Feature>] ──┐
     [Slice B: <Feature>] ──┤  (parallel — no shared data)
                            ▼
              [Slice C: <Feature>]  (needs A's data)
                            │
                            ▼
                   [QA + Smoke Test]  (always last)
```

### Validation checklist (MUST pass before writing plan)

- [ ] No cycle: Slice A blocks B blocks A
- [ ] No orphan: every slice is reachable from start and reaches the end
- [ ] Parallel groups confirmed: only slices with no shared data dependency run together
- [ ] QA task is the terminal node — nothing runs after it

---

## Output Checklist

Before finishing this workflow, verify:

- [ ] Spec file written to `docs/superpowers/specs/YYYY-MM-DD-<topic>.md`
- [ ] Plan file written to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
- [ ] Every plan task has a Jira SD ticket (created via MCP)
- [ ] Board (`docs/superpowers/sprint<N>/board.md`) updated with all new task rows
- [ ] Both files committed to git
- [ ] No post-MVP feature quietly included in any slice
- [ ] All test cases reference FR/AC IDs (not invented IDs)

---

## Agent Selection for Each Slice Task

Once the plan is ready, each slice is implemented using `implement-ticket.md`. Agent selection per step within the slice:

| Step | Work type | Agent |
|------|-----------|-------|
| Write Tests RED | Writing failing tests | `qa_agent` |
| Implement FE + BE GREEN | Making tests pass | `code_agent` |

> Read `implement-ticket.md` before dispatching — the 4-step flow applies to each slice task independently.

---

## Example: 2-Story Feature

### Requirements input
- FR-2.1: Manager views staff attendance for today
- FR-2.2: Manager approves overtime

### Analysis output (Step 2)
- Story A: "View today's attendance dashboard" (FR-2.1)
- Story B: "Approve overtime" (FR-2.2) — depends on Story A's attendance data being visible

### Dependency tree
```
[Scaffold (if not done)] ──┐
[Seed: staff + shifts]  ───┤
                           ▼
        [Slice A: Today's Attendance Dashboard]
                           │
                           ▼
        [Slice B: Approve Overtime]
                           │
                           ▼
              [QA + Smoke Test]
```

### Slice A tasks within the plan
1. Write RED: `AttendanceDashboard.test.tsx` + `GetTodayAttendanceHandlerTests.cs`
2. FE GREEN: `AttendanceDashboard.tsx` + `useAttendanceDashboard.ts` + `attendance-manager.api.ts`
3. BE GREEN: `GetTodayAttendance` query + handler + `GET /manager/attendance/today` endpoint
4. Integration pass: all tests GREEN

### Slice B tasks within the plan
1. Write RED: `ApproveOvertimeButton.test.tsx` + `ApproveOvertimeHandlerTests.cs`
2. FE GREEN: `ApproveOvertimeButton.tsx` (reads data from Slice A's dashboard data)
3. BE GREEN: `ApproveOvertimeCommand` + handler + `POST /manager/attendance/{id}/approve-overtime`
4. Integration pass: all tests GREEN
