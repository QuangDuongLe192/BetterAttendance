# SonarQube→Claude Auto-Fix Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing GitHub Actions pipeline so that after every SonarQube scan, Claude automatically creates GitHub Issues for each finding and opens a Draft PR fixing each new issue in an isolated git worktree.

**Architecture:** The existing `build` job gains two steps: a PowerShell script that waits for the SonarQube CE task to complete, queries the issues API, and uploads `sonar-issues.json` as an artifact. A new `track-issues` job downloads that artifact, runs `claude-code-action` to create/update GitHub Issues, and outputs `new-issues.json`. A third `fix-issues` job runs `claude-code-action` to loop through new issues — creating one git worktree per issue, committing a fix, pushing the branch, and opening a Draft PR.

**Tech Stack:** GitHub Actions (`windows-latest`), PowerShell, `anthropics/claude-code-action@beta`, `gh` CLI, SonarQube REST API (`/api/ce/task`, `/api/issues/search`), git worktrees.

## Global Constraints

- Runner: `windows-latest` (GitHub-hosted) — use `shell: pwsh` for PowerShell, `shell: bash` for bash
- `SONAR_HOST_URL` is an ngrok URL stored in GitHub Secrets — must be updated manually when ngrok restarts
- `SONAR_TOKEN` and `SONAR_HOST_URL` secrets already exist; `ANTHROPIC_API_KEY` must be added before the workflow runs
- `actions/checkout` must stay pinned to `34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1` (matches existing build.yml)
- Existing `build` job must not change behavior — only append new steps at the end
- Branch naming: `fix/sonar-<issue-number>`
- All PRs: Draft state, base branch `main`
- Labels `sonarqube`, `code-smell`, `vulnerability` must be created in the repo before the workflow runs

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.github/scripts/fetch-sonar-issues.ps1` | Create | Poll CE task; query SonarQube API; write `sonar-issues.json` |
| `.github/prompts/track-issues.md` | Create | Claude prompt: read `sonar-issues.json`, create/update GitHub Issues, write `new-issues.json` |
| `.github/prompts/fix-issues.md` | Create | Claude prompt: read `new-issues.json`, fix each issue in a git worktree, open Draft PR |
| `.github/workflows/build.yml` | Modify | Append 2 steps to `build` job; add `track-issues` and `fix-issues` jobs |

All files are in the **repo root** (not `v2/`) — that is where the existing `.github/` directory lives.

---

### Task 1: PowerShell script — fetch SonarQube issues after scan

**Files:**
- Create: `.github/scripts/fetch-sonar-issues.ps1`

**Interfaces:**
- Reads: `.scannerwork/report-task.txt` (written by `sonarqube-scan-action`, contains `ceTaskId=...`)
- Reads: `sonar-project.properties` (contains `sonar.projectKey=...`)
- Env vars: `SONAR_HOST_URL`, `SONAR_TOKEN`
- Produces: `sonar-issues.json` in working directory (consumed by `track-issues` job)

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p .github/scripts
```

- [ ] **Step 2: Write fetch-sonar-issues.ps1**

Create `.github/scripts/fetch-sonar-issues.ps1`:

```powershell
param(
    [string]$SonarHostUrl    = $env:SONAR_HOST_URL,
    [string]$SonarToken      = $env:SONAR_TOKEN,
    [int]$TimeoutMinutes     = 10
)

# Read project key from sonar-project.properties
$projectKey = (Get-Content "sonar-project.properties" |
    Where-Object { $_ -match "^sonar\.projectKey=" } |
    Select-Object -First 1) -replace "^sonar\.projectKey=", ""

if (-not $projectKey) {
    Write-Error "sonar.projectKey not found in sonar-project.properties"
    exit 1
}

# Read CE task ID written by sonarqube-scan-action
$ceTaskId = (Get-Content ".scannerwork/report-task.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_ -match "^ceTaskId=" } |
    Select-Object -First 1) -replace "^ceTaskId=", ""

if (-not $ceTaskId) {
    Write-Error "ceTaskId not found in .scannerwork/report-task.txt"
    exit 1
}

Write-Host "Polling CE task: $ceTaskId"

$headers  = @{ Authorization = "Bearer $SonarToken" }
$deadline = (Get-Date).AddMinutes($TimeoutMinutes)

do {
    $task   = Invoke-RestMethod -Uri "$SonarHostUrl/api/ce/task?id=$ceTaskId" -Headers $headers
    $status = $task.task.status
    Write-Host "  status: $status"

    if ($status -eq "FAILED")    { Write-Error "CE task FAILED";    exit 1 }
    if ($status -eq "CANCELLED") { Write-Error "CE task CANCELLED"; exit 1 }
    if ($status -ne "SUCCESS")   { Start-Sleep -Seconds 5 }
} while ($status -ne "SUCCESS" -and (Get-Date) -lt $deadline)

if ($status -ne "SUCCESS") {
    Write-Error "Timed out waiting for CE task after $TimeoutMinutes minutes"
    exit 1
}

Write-Host "Analysis complete. Fetching issues for project: $projectKey"

$url      = "$SonarHostUrl/api/issues/search?projectKeys=$projectKey&resolved=false&ps=500"
$response = Invoke-RestMethod -Uri $url -Headers $headers
$response | ConvertTo-Json -Depth 10 | Set-Content "sonar-issues.json" -Encoding UTF8

Write-Host "Saved $($response.total) issues to sonar-issues.json"
```

- [ ] **Step 3: Verify PowerShell syntax**

```powershell
$errors = $null
$null = [System.Management.Automation.Language.Parser]::ParseFile(
    (Resolve-Path ".github/scripts/fetch-sonar-issues.ps1").Path,
    [ref]$null, [ref]$errors
)
if ($errors) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }
Write-Host "Syntax OK"
```

Expected output: `Syntax OK`

- [ ] **Step 4: Commit**

```bash
git add .github/scripts/fetch-sonar-issues.ps1
git commit -m "feat: add PowerShell script to poll CE task and fetch SonarQube issues"
```

---

### Task 2: Claude prompt — track-issues

**Files:**
- Create: `.github/prompts/track-issues.md`

**Interfaces:**
- Consumes: `sonar-issues.json` (on disk in Actions workspace, shape: `{ issues: [{rule, component, line, message, severity, type}] }`)
- Reads: GitHub Issues with label `sonarqube` (via `gh` CLI)
- Writes: GitHub Issues (create, comment, reopen, close)
- Produces: `new-issues.json` (shape: `[{number, rule, component, line, message, type}]`)

- [ ] **Step 1: Create the prompts directory**

```bash
mkdir -p .github/prompts
```

- [ ] **Step 2: Write track-issues.md**

Create `.github/prompts/track-issues.md`:

```markdown
## Task: Sync SonarQube findings to GitHub Issues

Read the file `sonar-issues.json` in the current directory. It is a JSON object with an `issues` array — each element has `rule`, `component`, `line`, `message`, `severity`, and `type` fields.

### Fingerprint

For each finding, compute a fingerprint string:
```
{rule}::{component}::{line}
```
Example: `squid:S3776::src/features/auth/auth.service.ts::42`

### Match against existing GitHub Issues

Fetch all GitHub Issues in this repository that have the label `sonarqube` (include both open and closed). Each such issue stores its fingerprint as a hidden HTML comment in the body:
```
<!-- sonar-fingerprint: {fingerprint} -->
```

For each finding in `sonar-issues.json`, determine which case applies:

---

**Case A — No existing issue matches the fingerprint (new finding):**

Create a new GitHub Issue with:
- Title: `[SonarQube] {rule} — {component}:{line}`
- Labels: `sonarqube` AND exactly one of:
  - `bug` if `type == "BUG"`
  - `vulnerability` if `type == "VULNERABILITY"`
  - `code-smell` if `type == "CODE_SMELL"`
- Body:
```
| Field    | Value |
|----------|-------|
| Rule     | {rule} |
| Severity | {severity} |
| Type     | {type} |
| File     | {component} |
| Line     | {line} |
| Message  | {message} |

<!-- sonar-fingerprint: {rule}::{component}::{line} -->
```

---

**Case B — An open issue already has a matching fingerprint:**

Add this comment to the existing issue:
```
⚠️ Still present in SonarQube analysis on {TODAY} (workflow run #{GITHUB_RUN_ID})
```

---

**Case C — A closed issue has a matching fingerprint (finding reappeared):**

Reopen the issue and add this comment:
```
🔄 Reopened — finding reappeared in SonarQube analysis on {TODAY}
```

---

**Case D — An open issue has the label `sonarqube` but its fingerprint does NOT appear in `sonar-issues.json` (finding was resolved):**

Add this comment:
```
✅ Resolved in SonarQube as of {TODAY}. Closing.
```
Then close the issue.

---

### After processing all findings:

Write a file `new-issues.json` to the current directory. It must be a JSON array containing one object per issue you **created** in Case A:

```json
[
  {
    "number": 42,
    "rule": "squid:S3776",
    "component": "src/features/auth/auth.service.ts",
    "line": 42,
    "message": "Cognitive Complexity of 18 exceeds 15",
    "type": "CODE_SMELL"
  }
]
```

If no new issues were created, write: `[]`

Substitute `{TODAY}` with today's date in `YYYY-MM-DD` format.
Substitute `{GITHUB_RUN_ID}` with the value of the `GITHUB_RUN_ID` environment variable.
```

- [ ] **Step 3: Commit**

```bash
git add .github/prompts/track-issues.md
git commit -m "feat: add Claude prompt for syncing SonarQube findings to GitHub Issues"
```

---

### Task 3: Claude prompt — fix-issues

**Files:**
- Create: `.github/prompts/fix-issues.md`

**Interfaces:**
- Consumes: `new-issues.json` (shape: `[{number, rule, component, line, message, type}]`)
- Produces: one branch `fix/sonar-{number}` per issue, one Draft PR per issue

- [ ] **Step 1: Write fix-issues.md**

Create `.github/prompts/fix-issues.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .github/prompts/fix-issues.md
git commit -m "feat: add Claude prompt for fixing SonarQube issues in git worktrees"
```

---

### Task 4: Create required GitHub labels

The labels `sonarqube`, `code-smell`, and `vulnerability` must exist before Job 2 runs. (`bug` already exists in every GitHub repo by default.)

**Files:** none — GitHub API only.

- [ ] **Step 1: Create labels**

Run locally (requires `gh auth login`):

```bash
gh label create sonarqube    --color "0075ca" --description "Tracked from SonarQube analysis" --repo QuangDuongLe192/BetterAttendance
gh label create code-smell   --color "e4e669" --description "SonarQube code smell"            --repo QuangDuongLe192/BetterAttendance
gh label create vulnerability --color "d93f0b" --description "SonarQube vulnerability"         --repo QuangDuongLe192/BetterAttendance
```

If a label already exists, the command exits with an error — that's fine, skip it.

- [ ] **Step 2: Verify**

```bash
gh label list --repo QuangDuongLe192/BetterAttendance | grep -E "sonarqube|code-smell|vulnerability|bug"
```

Expected: all 4 labels appear in the output.

---

### Task 5: Extend build.yml — add script steps and new jobs

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- `build` job produces: `sonar-issues` artifact (contains `sonar-issues.json`)
- `track-issues` job consumes: `sonar-issues` artifact; produces: `new-issues` artifact + job output `has-new-issues`
- `fix-issues` job consumes: `new-issues` artifact; runs only when `has-new-issues == 'true'`

- [ ] **Step 1: Add ANTHROPIC_API_KEY secret to GitHub**

Manual step — do this in the browser:
1. Open `https://github.com/QuangDuongLe192/BetterAttendance/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `ANTHROPIC_API_KEY`, Value: your Anthropic API key from `https://console.anthropic.com/`

- [ ] **Step 2: Append two steps to the existing `build` job**

In `.github/workflows/build.yml`, after the `SonarSource/sonarqube-scan-action` step (and before the commented-out quality gate block), add:

```yaml
      - name: Fetch SonarQube issues
        shell: pwsh
        run: .github/scripts/fetch-sonar-issues.ps1
        env:
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Upload sonar-issues artifact
        uses: actions/upload-artifact@v4
        with:
          name: sonar-issues
          path: sonar-issues.json
```

- [ ] **Step 3: Add track-issues job**

After the closing of the `build` job, add:

```yaml
  track-issues:
    name: Track SonarQube Issues
    needs: build
    runs-on: windows-latest
    permissions:
      issues: write
      contents: read
    outputs:
      has-new-issues: ${{ steps.check.outputs.has-new-issues }}

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1

      - name: Download sonar-issues artifact
        uses: actions/download-artifact@v4
        with:
          name: sonar-issues
          path: .

      - name: Load track-issues prompt
        shell: bash
        run: |
          {
            echo 'TRACK_PROMPT<<__EOF__'
            cat .github/prompts/track-issues.md
            echo '__EOF__'
          } >> "$GITHUB_ENV"

      - name: Claude — create/update GitHub Issues
        uses: anthropics/claude-code-action@beta
        with:
          prompt: ${{ env.TRACK_PROMPT }}
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_RUN_ID: ${{ github.run_id }}

      - name: Check for new issues
        id: check
        shell: bash
        run: |
          [ -f "new-issues.json" ] || echo "[]" > new-issues.json
          count=$(python3 -c "import json; print(len(json.load(open('new-issues.json'))))")
          if [ "$count" -gt 0 ]; then
            echo "has-new-issues=true" >> "$GITHUB_OUTPUT"
          else
            echo "has-new-issues=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload new-issues artifact
        uses: actions/upload-artifact@v4
        with:
          name: new-issues
          path: new-issues.json
```

- [ ] **Step 4: Add fix-issues job**

Immediately after the `track-issues` job, add:

```yaml
  fix-issues:
    name: Fix SonarQube Issues
    needs: track-issues
    if: needs.track-issues.outputs.has-new-issues == 'true'
    runs-on: windows-latest
    permissions:
      issues: write
      pull-requests: write
      contents: write

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
        with:
          fetch-depth: 0

      - name: Configure git identity
        shell: bash
        run: |
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git config user.name "github-actions[bot]"

      - name: Download new-issues artifact
        uses: actions/download-artifact@v4
        with:
          name: new-issues
          path: .

      - name: Load fix-issues prompt
        shell: bash
        run: |
          {
            echo 'FIX_PROMPT<<__EOF__'
            cat .github/prompts/fix-issues.md
            echo '__EOF__'
          } >> "$GITHUB_ENV"

      - name: Claude — fix issues in worktrees
        uses: anthropics/claude-code-action@beta
        with:
          prompt: ${{ env.FIX_PROMPT }}
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 5: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/build.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/build.yml
git commit -m "feat: extend build workflow with SonarQube issue tracking and auto-fix jobs"
```

---

### Task 6: Smoke test — end-to-end verification

**Files:** none — verification only.

- [ ] **Step 1: Ensure ngrok is running and secret is current**

```bash
gh secret list --repo QuangDuongLe192/BetterAttendance | grep SONAR_HOST_URL
```

If ngrok was restarted since the secret was last set, update it:
```bash
gh secret set SONAR_HOST_URL --body "https://<new-ngrok-url>" --repo QuangDuongLe192/BetterAttendance
```

- [ ] **Step 2: Push to trigger the workflow**

```bash
git push origin main
```

- [ ] **Step 3: Watch the run**

```bash
gh run watch --repo QuangDuongLe192/BetterAttendance
```

Expected sequence: `build` ✓ → `track-issues` ✓ → (if findings exist) `fix-issues` ✓

- [ ] **Step 4: Verify GitHub Issues were created**

```bash
gh issue list --label sonarqube --repo QuangDuongLe192/BetterAttendance
```

Expected: one issue per open SonarQube finding, each body containing `<!-- sonar-fingerprint: ... -->`.

- [ ] **Step 5: Verify Draft PRs were created**

```bash
gh pr list --draft --repo QuangDuongLe192/BetterAttendance
```

Expected: one Draft PR per newly created issue, title starts with `fix: [SonarQube]`, body contains `Closes #<N>`.

- [ ] **Step 6: Re-push without changes and verify deduplication**

```bash
git commit --allow-empty -m "chore: trigger workflow for dedup test" && git push origin main
```

Then after the run completes:
```bash
gh issue list --label sonarqube --repo QuangDuongLe192/BetterAttendance
```

Expected: no new issues created. Existing issues have a new `⚠️ Still present` comment. No new Draft PRs.
