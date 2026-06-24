## Task: Fix SonarQube Issues

> **Quy tắc thực thi:**
> - Hoàn thành từng Phase theo thứ tự. KHÔNG bỏ qua bất kỳ Phase nào.
> - Sau mỗi Phase, log ra `✅ Phase {N} complete` trước khi tiếp tục.
> - Nếu một bước thất bại, log lỗi và thử lại — KHÔNG nhảy sang Phase tiếp theo.
> - KHÔNG dừng cho đến khi Done Checklist ở cuối được tick hết.

This workflow supports three modes. Read the invocation to determine which mode to use:

| Mode | When to use | Example invocation |
|------|-------------|-------------------|
| **batch** | Fix all issues in `sonar-issues.json`, one commit per file | "fix sonar issues" |
| **file** | Fix all issues in one specific file | "fix sonar issues in Overview.tsx" |
| **rule** | Fix all issues of one rule type across all files | "fix sonar S6770 issues" |

---

### Phase 1 — Download Issues File

**Step 1.1** — Check for uncommitted changes, then pull latest main:
```bash
git status --porcelain
```

Nếu output **không rỗng** (có file đang sửa dở): log `ERROR: Uncommitted changes detected. Commit or stash your changes before running this workflow.` và **dừng lại** — không tiếp tục.

Nếu output rỗng (working tree sạch): tiếp tục pull:
```bash
git fetch origin && git reset --hard origin/main
```

**Step 1.2** — Remove stale file if present:
```bash
if (Test-Path sonar-issues.json) { Remove-Item sonar-issues.json }
```

**Step 1.3** — Get the latest successful Build workflow run ID:
```bash
gh run list --workflow=build.yml --status=success --limit=1 --json databaseId --jq '.[0].databaseId'
```
Store as `{run_id}`.

**Step 1.4** — Download the artifact:
```bash
gh run download {run_id} --name sonar-issues --dir .
```

**Step 1.5** — Read `sonar-issues.json`. Structure: `{ "issues": [...], "total": N }`

If `total` is 0 or `issues` is empty: log `No issues found.` and stop.

---

### Phase 2 — Build Working List

Read all issues and group them. The grouping depends on mode:

**batch mode** — group all issues by file, then by rule within each file. Sort files by total issue count descending:

```
NewLocationWizard.tsx (45)   S6770×7  S6759×16  S3358×8  ...
MgrSchedule.tsx      (25)   S6770×3  S6759×3   S7735×1  ...
Overview.tsx         (21)   S6770×6  S6759×6   S4325×2  ...
...
```

**file mode** — filter to only issues whose `component` matches the target filename. Group by rule within that file.

**rule mode** — filter to only issues whose `rule` matches the target rule ID. Group by file within that rule.

Print the working list before starting so the user can see the scope.

**Field reference:**
- `key` — unique SonarQube issue key
- `rule` — rule ID, e.g. `typescript:S4325`
- `component` — `ProjectKey:path/to/file.ts` → strip everything up to and including the first `:` to get the file path
- `line` — line number of the violation
- `message` — violation description
- `severity` — BLOCKER / CRITICAL / MAJOR / MINOR / INFO
- `type` — BUG / VULNERABILITY / CODE_SMELL

---

### Phase 3 — Fix Issues

#### batch / file mode — process one file at a time

For each file in the working list, complete Steps A–C, then commit **once** for the whole file.

**Step A — Check skills file**

> **Lưu ý:** `.github/prompts/refactor-sonar-skills.md` là file **local-only** (gitignored). Không commit, không stage file này — chỉ đọc và ghi trực tiếp trên máy local.

Read `.github/prompts/refactor-sonar-skills.md`. For each rule that will be fixed in this file, check for `## Rule: {rule}`.

- **Found** → note the fix pattern.
- **Not found** → research the fix; document it in Step B after fixing.

---

**Step B — Fix all issues in the file**

Read `../worktrees/sonar-{date}/{file_path}`.

Fix every flagged issue in the file, working rule by rule (complete one rule before moving to the next). Within each rule, fix issues in line-number order.

- Apply the minimal change that resolves each violation.
- Do not modify unrelated code.
- Do not add explanatory comments.

**If a specific issue cannot be confidently fixed without risking a regression:**
Log: `SKIPPED {key} ({rule} L{line}): {one-sentence reason}` and continue with the next issue.

After fixing all issues in the file, update `.github/prompts/refactor-sonar-skills.md` for any rules not already documented. **Không stage/commit file này** — nó là local-only.

---

**Step C — Commit (once per file)**

```bash
git -C ../worktrees/sonar-{date} add {file_path}
git -C ../worktrees/sonar-{date} commit -m "fix: [SonarQube] {file_basename} — {rule1} {rule2} ... {rule_N}"
```

The commit message lists every rule fixed in this file. Move to the next file.

---

#### rule mode — process one rule across all files

**Step A** — Check `.github/prompts/refactor-sonar-skills.md` for `## Rule: {rule}` once before starting.

**Step B** — Fix all violations of that rule in every affected file, one file at a time.

**Step C** — Commit **once** for the entire rule (all files together):
```bash
git -C ../worktrees/sonar-{date} add --all
git -C ../worktrees/sonar-{date} commit -m "fix: [SonarQube] {rule} — {5-8 word description}"
```

Update the skills file if the rule was not already documented. **Không stage/commit file này** — nó là local-only.

---

### Phase 4 — Push, PR, and Project Task

After all files/rules are processed:

**Step 4.1** — Push the branch:
```bash
git push origin refactor/sonar-{date}
```

**Step 4.2** — Wait for CI and verify fixes:

```bash
# Chờ build hoàn thành trên branch (timeout 10 phút)
gh run watch $(gh run list --workflow=build.yml --branch=refactor/sonar-{date} --limit=1 --json databaseId --jq '.[0].databaseId')
```

Download sonar-issues từ build đó:
```bash
gh run download $(gh run list --workflow=build.yml --branch=refactor/sonar-{date} --limit=1 --json databaseId --jq '.[0].databaseId') --name sonar-issues --dir .sonar-verify
```

Kiểm tra: đọc `.sonar-verify/sonar-issues.json`, lọc theo các file đã fix trong Phase 3. Với mỗi issue đã fix, kiểm tra xem key đó còn tồn tại không.

- **Không còn** → tiếp tục tạo PR
- **Vẫn còn** → log `VERIFY FAILED {key} ({rule} L{line}): still present after fix`, quay lại Phase 3 để fix lại, rồi commit thêm và lặp lại Step 4.1–4.2

Xóa thư mục tạm sau khi verify:
```bash
Remove-Item -Recurse -Force .sonar-verify
```

**Step 4.3** — Build the PR body. Group changes by rule across all fixed files:

```
## SonarQube Fixes — {date}

### Summary
{1-2 sentences describing the overall theme of fixes in this batch}

---

### Changes

#### {rule} — {human-readable rule name}
> {one sentence: what this rule checks and why it matters}

| File | Lines | What was changed |
|------|-------|-----------------|
| {file_path} | {L10, L34, L89} | {concise description} |

---

{repeat for each distinct rule}

### Skipped
{list any skipped issues with reason, or "None"}

---
🤖 Fixed by Claude · fix patterns in `.github/prompts/refactor-sonar-skills.md`
```

**Step 4.4** — Create Draft PR:
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

**Step 4.5** — Add PR to GitHub Project:

Read `{project_id}` from the Reference table below, then run:
```bash
gh api graphql -f query='mutation {
  addProjectV2ItemById(input: {
    projectId: "{project_id}"
    contentId: "{pr_node_id}"
  }) { item { id } }
}'
```
Store `item.id` as `{item_id}`.

**Step 4.6** — Set status to **In Review**:

Read `{project_id}`, `{status_field_id}`, and `{option_id: In review}` from the Reference table below, then run:
```bash
gh api graphql -f query='mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "{project_id}"
    itemId: "{item_id}"
    fieldId: "{status_field_id}"
    value: { singleSelectOptionId: "{option_id: In review}" }
  }) { projectV2Item { id } }
}'
```

---

### Phase 5 — Cleanup

```bash
git worktree remove ../worktrees/sonar-{date}
```

---

### Done Checklist

Trước khi dừng, xác nhận từng mục:
- [ ] Phase 1: `sonar-issues.json` đã download, có ít nhất 1 issue
- [ ] Phase 2: working list đã in ra màn hình
- [ ] Phase 3: tất cả file đã fix và commit
- [ ] Phase 4.1: branch đã push lên remote
- [ ] Phase 4.2: CI build trên branch đã pass, verify không còn issue nào trong danh sách đã fix
- [ ] Phase 4.4: Draft PR đã tạo
- [ ] Phase 4.5: PR đã add vào GitHub Project
- [ ] Phase 4.6: Status đã set thành **In Review**
- [ ] Phase 5: worktree đã remove

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
