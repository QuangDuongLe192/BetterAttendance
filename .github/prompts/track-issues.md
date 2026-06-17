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
- **Capture the issue number:** Use `gh issue create --json number --jq '.number'` flags to capture the returned issue number for writing to `new-issues.json`.
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
