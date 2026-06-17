## Task: Fix SonarQube Issues via Git Worktrees

Read the file `new-issues.json` in the current directory. It is a JSON array.

If the array is empty, do nothing and stop.

For **each issue** in the array, complete all 7 steps below **in full** before moving to the next issue.

---

### Step 1 — Create a git worktree

```bash
git worktree add ../worktrees/fix-{number} -b fix/sonar-{number}
```

### Step 2 — Understand the problem

Read the file at `../worktrees/fix-{number}/{component}`.
Focus on line `{line}`: the SonarQube rule `{rule}` reports: `{message}`.

### Step 3 — Fix the code

Edit only `../worktrees/fix-{number}/{component}`.
Apply the minimal change that resolves the rule violation at line `{line}`.
Do not modify unrelated code. Do not add comments explaining the change.

**If you cannot confidently fix the issue without risking a regression:**
- Skip it
- Log to stdout: `SKIPPED #{number}: {one-sentence reason}`
- Run: `git worktree remove ../worktrees/fix-{number} --force`
- Move to the next issue

### Step 4 — Commit

```bash
git -C ../worktrees/fix-{number} add --all
git -C ../worktrees/fix-{number} commit -m "fix: [SonarQube] {short_description} (#{number})"
```

`{short_description}` = 5–8 words describing what you changed.

### Step 5 — Push

```bash
git push origin fix/sonar-{number}
```

### Step 6 — Create Draft PR

```bash
gh pr create \
  --title "fix: [SonarQube] {issue_title} (#{number})" \
  --body $'## SonarQube Fix\n\nCloses #{number}\n\n**Rule:** {rule}\n**File:** {component}:{line}\n**Message:** {message}\n\n## Changes\n\n{2-3 sentence description of the fix}\n\n---\n🤖 Auto-fixed by Claude via SonarQube workflow' \
  --draft \
  --head "fix/sonar-{number}" \
  --base main
```

### Step 7 — Remove the worktree

```bash
git worktree remove ../worktrees/fix-{number}
```

---

**Rules:**
- Complete all 7 steps for one issue before starting the next
- Never commit files outside `../worktrees/fix-{number}/`
- `{issue_title}` = the GitHub Issue title (without the `[SonarQube]` prefix and file/line suffix — just the rule name portion)
