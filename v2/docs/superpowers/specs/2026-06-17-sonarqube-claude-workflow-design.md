# SonarQube → Claude Auto-Fix Workflow

**Date:** 2026-06-17
**Status:** Approved

---

## Overview

Automated pipeline that runs on every push: SonarQube scans the codebase, Claude creates GitHub Issues for each finding, then fixes each new issue in an isolated git worktree and opens a Draft PR for human review.

---

## Architecture & Data Flow

```
Push to GitHub
     │
     ▼
┌─────────────────────────────────────────────────┐
│  GitHub Actions (self-hosted runner)             │
│                                                 │
│  Job 1: sonar-scan                              │
│    sonar-scanner ──► SonarQube Server (private) │
│    poll api/ce/task until SUCCESS               │
│    query api/issues/search ──► sonar-issues.json│
│    upload artifact                              │
│                                                 │
│  Job 2: track-issues (needs: sonar-scan)        │
│    claude-code-action                           │
│      read sonar-issues.json                     │
│      per finding: search GitHub Issues by       │
│        fingerprint comment in body              │
│      → new finding: create issue               │
│      → existing finding: add "still present"   │
│        comment                                  │
│      → resolved finding: close issue           │
│      output: new-issues.json                   │
│                                                 │
│  Job 3: fix-issues (needs: track-issues)        │
│    claude-code-action                           │
│      read new-issues.json                       │
│      per issue:                                 │
│        git worktree add fix/sonar-<N>           │
│        fix code                                 │
│        git commit + push                        │
│        gh pr create --draft                     │
│        git worktree remove                      │
└─────────────────────────────────────────────────┘
     │
     ▼
User reviews each Draft PR → converts to ready → merges
```

---

## GitHub Actions Workflow

**File:** `.github/workflows/sonar-claude.yml`

**Trigger:** `push` to any branch.

### Job 1 — `sonar-scan`

| Step | Action |
|------|--------|
| Checkout code | `actions/checkout@v4` with `fetch-depth: 0` |
| Run sonar-scanner | `sonar-scanner` CLI with project properties |
| Poll CE task | Script polls `api/ce/task?id=<taskId>` until `status=SUCCESS` or timeout (10 min) |
| Fetch issues | `GET api/issues/search?projectKeys=<key>&resolved=false&ps=500` → `sonar-issues.json` |
| Upload artifact | `actions/upload-artifact` |

Environment variables required in runner:
- `SONAR_HOST_URL` — internal URL of SonarQube server
- `SONAR_TOKEN` — SonarQube user token (stored in GitHub Secrets)

### Job 2 — `track-issues`

Runs `anthropics/claude-code-action` with a prompt that:
1. Downloads `sonar-issues.json` artifact
2. Lists all open GitHub Issues with label `sonarqube`
3. For each SonarQube finding, extracts the fingerprint (`rule::component::line`)
4. Matches against `<!-- sonar-fingerprint: ... -->` hidden comments in existing issue bodies
5. Creates new issue if no match; adds comment if match found; closes issue if finding resolved

Output: writes `new-issues.json` (array of `{ number, rule, component, line, message }`) to workspace.

### Job 3 — `fix-issues`

Runs `anthropics/claude-code-action` with a prompt that:
1. Reads `new-issues.json`
2. For each entry, loops:
   - `git worktree add ../worktrees/fix-<N> -b fix/sonar-<N>`
   - Reads issue details (file, line, rule, message)
   - Applies fix in the worktree
   - `git -C ../worktrees/fix-<N> commit -m "fix: [SonarQube] <short-title> (#<N>)"`
   - `git push origin fix/sonar-<N>`
   - `gh pr create --draft --title "..." --body "..."`
   - `git worktree remove ../worktrees/fix-<N>`
3. All issues handled in a single action invocation (Claude loops internally)

Required secrets:
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN` (auto-provided by Actions)

---

## GitHub Issue Format

### New Issue

```
Title:  [SonarQube] <rule name> — <file>:<line>
Labels: sonarqube, <bug | vulnerability | code-smell>

Body:
| Field    | Value                                      |
|----------|--------------------------------------------|
| Rule     | squid:S3776                                |
| Severity | MAJOR                                      |
| Type     | CODE_SMELL                                 |
| File     | src/features/auth/auth.service.ts          |
| Line     | 42                                         |
| Message  | Cognitive Complexity of 18 exceeds 15      |
| Link     | http://<sonar-host>/project/issues?...     |

<!-- sonar-fingerprint: squid:S3776::src/features/auth/auth.service.ts::42 -->
```

### Existing Issue — Finding Still Present

```
⚠️ Still present in SonarQube analysis on 2026-06-17 (run #<workflow-run-id>)
```

### Existing Issue — Finding Resolved

```
✅ Resolved in SonarQube as of 2026-06-17. Closing.
```
Issue is then closed via GitHub API.

---

## Branch & PR Convention

| Field | Format |
|-------|--------|
| Branch | `fix/sonar-<issue-number>` |
| Commit | `fix: [SonarQube] <short title> (#<N>)` |
| PR title | `fix: [SonarQube] <issue title> (#<N>)` |
| PR state | **Draft** |

**PR body template:**

```markdown
## SonarQube Fix

Closes #<N>

**Rule:** <rule-id>
**File:** <component>:<line>
**Message:** <message>

## Changes

<Claude describes fix in 1–3 sentences>

---
🤖 Auto-fixed by Claude via SonarQube workflow
```

---

## Deduplication Strategy

Fingerprint format: `<rule>::<component>::<line>`

Stored as a hidden HTML comment in the issue body. On each workflow run, Claude:
1. Fetches all GitHub Issues with label `sonarqube` (open + closed)
2. Extracts fingerprints from body comments
3. Matches against current SonarQube findings
4. Never creates a duplicate issue for the same fingerprint

If a previously closed issue's fingerprint reappears in a new analysis, Claude reopens it and adds a comment rather than creating a new one.

---

## Files to Create

```
.github/
  workflows/
    sonar-claude.yml          # main workflow (3 jobs)
  scripts/
    poll-sonar-task.sh        # polls CE task until SUCCESS
    fetch-sonar-issues.sh     # queries SonarQube API → sonar-issues.json
  prompts/
    track-issues.md           # Claude prompt for Job 2
    fix-issues.md             # Claude prompt for Job 3
```

---

## Constraints & Assumptions

- Self-hosted GitHub Actions runner is on same network as SonarQube server
- `SONAR_TOKEN` has at least "Browse" permission on the project
- `sonar-project.properties` exists at repo root (already present)
- `gh` CLI is available on the runner
- `git` worktree support is available (git >= 2.5)
- SonarQube version >= 7.9 (for `api/issues/search` with fingerprint support)
- Claude fixes issues one at a time sequentially within a single action invocation
- Draft PRs are never auto-merged — human review is always required
