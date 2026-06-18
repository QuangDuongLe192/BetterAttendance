## Task: Fix SonarQube Issues via Git Worktrees

Read the file `new-issues.json` in the current directory. It is a JSON array.

If the array is empty, do nothing and stop.

For **each issue** in the array, complete all 9 steps below **in full** before moving to the next issue.

---

### Step 1 — Mark issue as In Progress

```bash
gh issue edit {number} --add-label "in-progress"
gh issue comment {number} --body "🔧 Fix in progress..."
```

Then update the GitHub Project status to **In progress** via GraphQL:

```graphql
# 1. Get the project item ID for this issue
query {
  repository(owner: "QuangDuongLe192", name: "BetterAttendance") {
    issue(number: {number}) {
      projectItems(first: 5) { nodes { id } }
    }
  }
}

# 2. Update status field
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwHODRzg-84Bayhv"
    itemId: "{item_id}"
    fieldId: "PVTSSF_lAHODRzg-84BayhvzhVnkWs"
    value: { singleSelectOptionId: "47fc9ee4" }   # "In progress"
  }) { projectV2Item { id } }
}
```

### Step 2 — Create a git worktree

```bash
git worktree add ../worktrees/fix-{number} -b fix/sonar-{number}
```

### Step 3 — Understand the problem

Read the file at `../worktrees/fix-{number}/{component}`.
Focus on line `{line}`: the SonarQube rule `{rule}` reports: `{message}`.

### Step 4 — Fix the code

Edit only `../worktrees/fix-{number}/{component}`.
Apply the minimal change that resolves the rule violation at line `{line}`.
Do not modify unrelated code. Do not add comments explaining the change.

**If you cannot confidently fix the issue without risking a regression:**
- Log to stdout: `SKIPPED #{number}: {one-sentence reason}`
- Run: `git worktree remove ../worktrees/fix-{number} --force`
- Remove the `in-progress` label: `gh issue edit {number} --remove-label "in-progress"`
- Move to the next issue

### Step 5 — Commit

```bash
git -C ../worktrees/fix-{number} add --all
git -C ../worktrees/fix-{number} commit -m "fix: [SonarQube] {short_description} (#{number})"
```

`{short_description}` = 5–8 words describing what you changed.

### Step 6 — Push

```bash
git push origin fix/sonar-{number}
```

### Step 7 — Create Draft PR

```bash
gh pr create \
  --title "fix: [SonarQube] {rule} (#{number})" \
  --body $'## SonarQube Fix\n\nCloses #{number}\n\n**Rule:** {rule}\n**File:** {component}:{line}\n**Message:** {message}\n\n## Changes\n\n{2-3 sentence description of the fix}\n\n---\n🤖 Auto-fixed by Claude via SonarQube workflow' \
  --draft \
  --head "fix/sonar-{number}" \
  --base main \
  --json number --jq '.number'
```

Store the output as `{pr_number}` for use in Step 8.

### Step 8 — Mark issue as In Review

After the PR is created, capture the PR number from the output of Step 7, then run:

```bash
gh issue edit {number} --add-label "in-review" --remove-label "in-progress"
gh issue comment {number} --body "🔍 Ready for review — PR #{pr_number}"
```

Then update the GitHub Project status to **In review** via GraphQL (reuse `{item_id}` from Step 1):

```graphql
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwHODRzg-84Bayhv"
    itemId: "{item_id}"
    fieldId: "PVTSSF_lAHODRzg-84BayhvzhVnkWs"
    value: { singleSelectOptionId: "df73e18b" }   # "In review"
  }) { projectV2Item { id } }
}
```

### Step 9 — Remove the worktree

```bash
git worktree remove ../worktrees/fix-{number}
```

---

**Rules:**
- Complete all 9 steps for one issue before starting the next
- Never commit files outside `../worktrees/fix-{number}/`
- `{rule}` = the SonarQube rule identifier (e.g., `squid:S3776`)
- `{pr_number}` = PR number returned by `gh pr create` in Step 7 (capture with `--json number --jq '.number'`)
- `{item_id}` = project item node ID fetched in Step 1; reuse it in Step 8

**GitHub Project field reference (Project #1 — QuangDuongLe192):**

| Field | ID |
|-------|----|
| Status | `PVTSSF_lAHODRzg-84BayhvzhVnkWs` |

| Status option | ID |
|---------------|----|
| Backlog | `f75ad846` |
| Ready | `61e4505c` |
| In progress | `47fc9ee4` |
| In review | `df73e18b` |
| Done | `98236657` |
