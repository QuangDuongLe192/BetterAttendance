# Jira SD — Configuration Reference

> Jira-specific rules only: project config, states, transitions, ticket fields.
> For the full ticket implementation workflow, see `docs/WORKFLOW.md`.
> Claude must read this file before creating or transitioning any ticket.

---

## 1. Project

| Field | Value |
|-------|-------|
| **Project key** | `SD` |
| **Workflow** | Software Simplified Workflow for Project SD |
| **Work types** | Story, Bug, Epic, Task, Sub-task |
| **Cloud ID** | `3bb5a7fd-276a-4884-8b04-ec76c77bf86f` |

---

## 2. Workflow States

```
BACKLOG → SELECTED FOR DEVELOPMENT → IN PROGRESS → REVIEW → DONE
```

All transitions are open ("Any" → target state).

| State | Transition ID |
|-------|--------------|
| Backlog | `11` |
| Selected for Development | `21` |
| In Progress | `31` |
| Review | `2` |
| Done | `41` — **human-only, Claude never calls this** |

---

## 3. State Mapping — Local Board → Jira SD

| Local board status | SD Jira state |
|--------------------|--------------|
| 🔲 TODO | `BACKLOG` |
| Task picked by Claude | `SELECTED FOR DEVELOPMENT` |
| 🔄 IN PROGRESS | `IN PROGRESS` |
| Work done / PR ready | `REVIEW` |
| ✅ DONE | `DONE` — **human-only** |

---

## 4. Work Type Mapping

| Local task type | SD work type |
|----------------|-------------|
| `Task` (scaffold / setup) | Task |
| `Task — TDD Red` / `Task — TDD Green` | Story |
| `Task — QA` | Bug |
| Sprint / Epic grouping | Epic |
| Sub-item of a task | Sub-task |

---

## 5. Ticket Creation — Required Fields

When creating a new SD ticket:

1. **Summary** — `<TASK-ID> · <title>`, e.g. `BA-S1-T07 · Domain + Application GREEN`
2. **Work type** — from § 4 mapping
3. **Description** — FR/AC references + task description:
   ```
   FR: FR-1.4
   AC: AC-1.4

   <task description>
   ```
4. **Parent** — Sprint Epic key (e.g. `SD-1`)
5. **After creation** — record the returned SD key in `board.md`

---

## 6. Enforcement Rules

- **Always call Atlassian MCP** — never simulate or fabricate ticket operations.
- **Check for duplicates** — search SD before creating. If ticket exists, transition it.
- **MCP unavailable** — stop and fix (`SETUP.md` § Verification) before proceeding.
- **No backdating** — do not create tickets for completed tasks unless explicitly asked.
- **DONE is human-only** — Claude never sets DONE. If a human sets DONE and work resumes, Claude may transition back to IN PROGRESS only when explicitly instructed.
