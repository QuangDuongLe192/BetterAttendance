## Task: Fix SonarQube Issues

### Phase 1 — Download Issues File

**Step 1.1** — Check if `sonar-issues.json` exists in the project root:
```bash
if (Test-Path sonar-issues.json) { Remove-Item sonar-issues.json }
```

**Step 1.2** — Get the latest successful run ID of the Build workflow:
```bash
gh run list --workflow=build.yml --status=success --limit=1 --json databaseId --jq '.[0].databaseId'
```
Store as `{run_id}`.

**Step 1.3** — Download the artifact:
```bash
gh run download {run_id} --name sonar-issues --dir .
```

**Step 1.4** — Read `sonar-issues.json`. Structure: `{ "issues": [...], "total": N }`

If `total` is 0 or `issues` is empty: log `No issues found.` and stop.

---

### Phase 2 — Create Worktree

Determine today's date in `YYYY-MM-DD` format. Store as `{date}`.

```bash
git worktree add ../worktrees/sonar-{date} -b refactor/sonar-{date}
```

If branch `refactor/sonar-{date}` already exists: log `Branch already exists for today. Remove it first or use a different date.` and stop.

---

### Phase 3 — Fix Each Issue (Sequential)

Process one issue at a time in the **same worktree** `../worktrees/sonar-{date}`. Complete Steps A–D for issue N before starting issue N+1.

**Field reference:**
- `key` — unique SonarQube issue key
- `rule` — rule ID, e.g. `typescript:S4325`
- `component` — `ProjectKey:path/to/file.ts` → strip everything up to and including the first `:` to get the file path
- `line` — line number of the violation
- `message` — violation description
- `severity` — BLOCKER / CRITICAL / MAJOR / MINOR / INFO
- `type` — BUG / VULNERABILITY / CODE_SMELL

---

#### Step A — Check skills file

Read `.github/prompts/refactor-sonar-skills.md`. Search for `## Rule: {rule}`.

- **Found** → Note the fix pattern for use in Step B.
- **Not found** → Research the fix, then document it in Step C after fixing.

---

#### Step B — Fix the code

Read `../worktrees/sonar-{date}/{file_path}` (strip `ProjectKey:` prefix from `component`).

Focus on line `{line}`. Rule `{rule}` reports: `{message}`.

Edit **only** `../worktrees/sonar-{date}/{file_path}`. Apply the minimal change that resolves the violation.
- Do not modify unrelated code.
- Do not add explanatory comments.

**If you cannot confidently fix without risking a regression:**
Log: `SKIPPED {key} ({rule}): {one-sentence reason}`
Move to next issue.

---

#### Step C — Update skills file

Open `.github/prompts/refactor-sonar-skills.md`.

**If rule was NOT already in the file**, append a new section:

```markdown
## Rule: {rule}

**What:** {one sentence — what does this rule check for?}
**Why:** {one sentence — why is this a problem?}
**Fix pattern:** {concise description of how to fix violations of this rule}

**Before:**
```{language}
{minimal code snippet showing the violation}
```

**After:**
```{language}
{minimal code snippet showing the fix}
```
```

**If rule WAS already in the file** → only update if you found a nuance not previously captured.

---

#### Step D — Commit

```bash
git -C ../worktrees/sonar-{date} add --all
git -C ../worktrees/sonar-{date} commit -m "fix: [SonarQube] {rule} — {5-8 word description}"
```

One commit per issue. Move to the next issue.

---

### Phase 4 — Push, PR, and Project Task

After all issues are processed:

**Step 4.1** — Push the branch:
```bash
git push origin refactor/sonar-{date}
```

**Step 4.2** — Build the PR body. List every fixed issue (skip SKIPPEDs):

```
## SonarQube Fixes — {date}

| Rule | File | Line | Message |
|------|------|------|---------|
| {rule} | {file_path} | {line} | {message} |
...

## Skipped
{list any skipped issues with reason, or "None"}

---
🤖 Fixed by Claude · fix patterns in `.github/prompts/refactor-sonar-skills.md`
```

**Step 4.3** — Create Draft PR:
```bash
gh pr create \
  --title "refactor: [SonarQube] {N} fixes — {date}" \
  --body "{body from Step 4.2}" \
  --draft \
  --head "refactor/sonar-{date}" \
  --base main
```

Capture the PR's node ID:
```bash
gh pr view refactor/sonar-{date} --json id --jq '.id'
```
Store as `{pr_node_id}`.

**Step 4.4** — Add PR to GitHub Project:
```bash
gh api graphql -f query='mutation {
  addProjectV2ItemById(input: {
    projectId: "PVT_kwHODRzg-84Bayhv"
    contentId: "{pr_node_id}"
  }) { item { id } }
}'
```
Store `item.id` as `{item_id}`.

**Step 4.5** — Set status to **In Review**:
```bash
gh api graphql -f query='mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwHODRzg-84Bayhv"
    itemId: "{item_id}"
    fieldId: "PVTSSF_lAHODRzg-84BayhvzhVnkWs"
    value: { singleSelectOptionId: "df73e18b" }
  }) { projectV2Item { id } }
}'
```

---

### Phase 5 — Cleanup

```bash
git worktree remove ../worktrees/sonar-{date}
```

---

### Reference — GitHub Project Fields

| Field | ID |
|-------|----|
| Project | `PVT_kwHODRzg-84Bayhv` |
| Status field | `PVTSSF_lAHODRzg-84BayhvzhVnkWs` |

| Status | Option ID |
|--------|-----------|
| Backlog | `f75ad846` |
| Ready | `61e4505c` |
| In progress | `47fc9ee4` |
| In review | `df73e18b` |
| Done | `98236657` |
