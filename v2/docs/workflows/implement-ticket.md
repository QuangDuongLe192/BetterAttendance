# Ticket Implementation Workflow

> Use this workflow when picking up any sprint board task to implement.
> For bugs / failures, use `debug.md` instead.
> Jira config (states, transitions, fields) → `docs/Jira.md`.
> Available agents → `agents/code_agent.md`, `agents/qa_agent.md`.

---

## The 4-Step Flow

Every ticket goes through these steps in order. No skipping, no reordering.

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1 — PICK TASK                                         │
│                                                             │
│  • Transition SD ticket → SELECTED FOR DEVELOPMENT          │
│  • This is the very first action, before reading anything   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 2 — ANALYSE TICKET                                    │
│                                                             │
│  • Read the full Jira ticket description via MCP            │
│  • Identify task type and FR/AC references                  │
│  • Choose the right agent:                                  │
│                                                             │
│    code_agent → scaffold, implementation, bug fix           │
│    qa_agent   → writing tests (RED), QA, verification       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 3 — IMPLEMENT                                         │
│                                                             │
│  • Transition SD ticket → IN PROGRESS                       │
│  • Read the full agent file (code_agent.md / qa_agent.md)   │
│  • Dispatch agent with complete task context:               │
│    - Task ID and description                                │
│    - FR/AC references from spec                             │
│    - Relevant files and constraints                         │
│  • Agent implements → verifies → self-reviews               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  STEP 4 — WRAP UP                                           │
│                                                             │
│  • Transition SD ticket → REVIEW                            │
│  • Create log: docs/superpowers/sprint1/logs/<TASK-ID>.md   │
│  • Update board.md row → 👁 REVIEW                          │
│                                                             │
│  → Human reviews, commits, sets DONE in Jira               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 2 — Agent Selection

| Task type | Agent | When |
|-----------|-------|------|
| Scaffold / setup | `code_agent` | New project structure, configs, CI |
| Implementation (GREEN) | `code_agent` | Domain, application, infra, API, FE |
| Tests (RED / TDD) | `qa_agent` | Writing failing tests before implementation |
| QA / verification | `qa_agent` | Running all tests, smoke test, DoD checks |
| Bug fix | `code_agent` | Fixing a broken implementation |

> Always read the full agent file before dispatching — the agent file contains mandatory rules and output format.

---

## Step 4 — Log File Template

Path: `docs/superpowers/sprint1/logs/<TASK-ID>.md`

```markdown
# Log: <TASK-ID> — <Task Title>

**Date:** YYYY-MM-DD
**Agent:** code_agent | qa_agent | Manual
**Status:** ✅ DONE | 👁 REVIEW
**Commit:** `<hash>` or _pending_
**Jira:** [SD-N](https://candylio-trial-823.atlassian.net/browse/SD-N)

---

## Prerequisites Check

- [x] <prerequisite task ID> — ✅ DONE

---

## Steps Completed

- [x] Step 1: ...
- [x] Step 2: ...

---

## Commands Run & Output

### <Step description>
\`\`\`
<command and output>
\`\`\`

---

## Files Created / Modified

| Action | File |
|--------|------|
| Created | `path/to/file` |
| Modified | `path/to/file` |
| Deleted | `path/to/file` |

---

## Test Results

\`\`\`
<test output summary>
\`\`\`

---

## Issues Encountered

None. _or: describe issue + resolution._

---

## Acceptance Criteria Result

- [x] <AC item> — **PASS**
- [ ] <AC item> — **FAIL** (reason)

---

## Suggested Git Commit

\`\`\`bash
git add <files>
git commit -m "<type>(<scope>): <description> [<TASK-ID>]"
\`\`\`

---

## Next Task

**→ Unblocks:** <task IDs and titles>
```

---

## Example: BA-S1-T07 (Domain + Application GREEN)

| Step | Action |
|------|--------|
| 1 — Pick | Transition `SD-8` → **SELECTED FOR DEVELOPMENT** |
| 2 — Analyse | Task type = implementation GREEN → select **code_agent** |
| 3 — Implement | Transition `SD-8` → **IN PROGRESS** → dispatch code_agent with full spec context |
| 4 — Wrap up | Transition `SD-8` → **REVIEW** → create `logs/BA-S1-T07.md` → update board |
| Human | Commits code, sets `SD-8` → **DONE** in Jira |
