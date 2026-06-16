# Debug Workflow

> Use this workflow when investigating a bug, a failing test, or any unexpected behaviour.
> For implementing a ticket, use `implement-ticket.md` instead.

---

## When to Use This Workflow

- A test is failing and the cause is not immediately obvious
- A feature behaves differently from the spec (FR/AC mismatch)
- An error appears at runtime with no clear origin
- A Jira Bug ticket is picked up

---

## The 5-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1 — REPRODUCE                                         │
│                                                             │
│  • Run the failing test or reproduce the error exactly      │
│  • Record the full error message and stack trace            │
│  • Confirm reproduction is consistent (not flaky)           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 2 — LOCATE                                            │
│                                                             │
│  • Identify the layer where the failure originates:         │
│    Domain → Application → Infrastructure → API → Frontend  │
│  • Read relevant files; do not guess from memory            │
│  • Cross-reference the FR/AC the code is supposed to meet   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 3 — DIAGNOSE                                          │
│                                                             │
│  • State the root cause clearly in one sentence             │
│  • Confirm it is a code defect (not a test defect or        │
│    environment issue) before writing any fix                │
│  • If a test is wrong: fix the test, not the code           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 4 — FIX                                               │
│                                                             │
│  • Apply the minimal change that resolves the root cause    │
│  • Do not refactor or improve surrounding code              │
│  • Re-run the failing test — it must now pass               │
│  • Run the full test suite — no regressions                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 5 — DOCUMENT                                          │
│                                                             │
│  • If this came from a Jira Bug ticket:                     │
│    - Transition ticket → REVIEW                             │
│    - Create log file in docs/superpowers/sprint1/logs/      │
│    - Update board.md                                        │
│  • Note the root cause in the log's "Issues Encountered"    │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Root Cause Categories

| Category | Signal | Where to look |
|----------|--------|---------------|
| Wrong business logic | Test case fails with wrong value | Domain layer, EarningsCalculator, handlers |
| Missing null check | NullReferenceException | Entity factories, repository returns |
| Timezone mismatch | Off-by-one date/hour errors | IDateTimeProvider, dayjs config, UTC vs +07:00 |
| AOT incompatibility | Trim warning or runtime crash | AppJsonContext, Mapperly, reflection usage |
| State mismatch (FE) | UI shows wrong clock status | clockStore, React Query stale cache |
| API contract drift | 422 / unexpected field | Backend DTO vs frontend type (attendance.types.ts) |
| MSW handler gap | `onUnhandledRequest: 'error'` fails | tests/mocks/handlers.ts |

---

## Rules

- **Reproduce first** — never write a fix for a bug you haven't seen yourself
- **One fix per bug** — do not bundle unrelated changes
- **Tests must pass after fix** — full suite, not just the target test
- **No DONE** — if this came from a Jira Bug, human sets DONE after review
