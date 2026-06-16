# SETUP.md — Better Attendance

> **Mandatory before any coding work.** No exceptions.

---

## The rule

> **Every team member must connect Claude Code CLI to the Atlassian MCP server before opening a code change for this project.**
>
> *No Atlassian MCP, no code.*

This is not optional, and it is not "nice to have." It is the prerequisite that makes the rest of the workflow work:

- **Every story references an `FR-x.y`** (`CLAUDE.md` § 2). Validating that requires reading the ticket.

If you sit down to code and Atlassian MCP is not connected, **stop and run setup first**. Don't work around it; you will produce a ticket-less PR and waste reviewer time.

---

## Prerequisites

- **Claude Code CLI installed.** Install via npm:
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
  Verify:
  ```bash
  claude --version
  ```
- **An Atlassian account** with access to the `BA` Jira project. If you can't see `BA-1` in the Jira web UI, fix that first — MCP cannot grant access you don't have.
- **A modern terminal** (any recent macOS Terminal, iTerm2, or Linux/WSL shell).

> The canonical command reference for Claude Code is the official docs. If a command below does not match what your CLI version accepts, **trust the docs, not this file**, and please open a PR to update it:
> - Claude Code overview: https://docs.claude.com/en/docs/claude-code/overview
> - Claude Code docs map: https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md

---

## Setup — one-time per machine

### 1. Add the Atlassian MCP server to Claude Code

The Atlassian MCP server is a **remote** MCP server hosted by Atlassian at:

```
https://mcp.atlassian.com/v1/mcp
```

Add it to Claude Code as a user-scoped server (so it's available across all your projects, not just this repo):

```bash
claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp
```

> If your Claude Code version uses a different transport flag or subcommand, check `claude mcp --help` and the docs map above. The shape — name, transport, URL — is the same.

### 2. Authenticate (OAuth flow)

The first time you invoke a tool from the Atlassian MCP server, Claude Code will trigger an OAuth handshake in your browser. Complete the flow with the Atlassian account that has access to the `BA` Jira project.

If the OAuth window doesn't open, run:

```bash
claude mcp list
```

…then trigger any Atlassian tool to force the auth prompt.

### 3. Confirm the server is registered

```bash
claude mcp list
```

You should see `atlassian` in the output with status `connected` (or equivalent). If it says `error` or `unauthenticated`, redo step 2 before proceeding.

---

## Verification — required before your first commit each day

Before you start working on a ticket, verify the connection works **for that ticket** — not just "MCP is up."

In a Claude Code session at the project root, ask the agent to read the ticket you're about to work on. For example:

> "Read `BA-142` from Jira and summarize its acceptance criteria."

The agent should:

1. Call the Atlassian MCP tool to fetch `BA-142`.
2. Return the ticket's title, status, description, and the `FR-x.y` IDs it references.

If the agent says any of the following, **stop and fix setup before coding**:

- "I don't have access to Jira."
- "The Atlassian MCP server is not connected."
- "I couldn't find ticket DP-142." *(when you know it exists)*
- The agent invents content for the ticket without calling a tool. *(Look for the tool-call in the output, not just the answer.)*

---

## What "good" looks like in a session

A correct working session starts like this:

1. **Pull the ticket.** Agent calls Atlassian MCP, returns ticket detail.
2. **Pull the requirement.** Agent reads the relevant FR/AC section from the spec (`md.read_section` on the requirements doc, or local file read).
3. **Plan.** Agent states the change plan, files affected, test approach. You approve.
4. **Edit.** Agent reads each file before editing, shows diffs.
5. **Test.** Agent runs the relevant tests.
6. **Open PR.** PR title includes the ticket key (`[DP-142] ...`).
7. **Transition the ticket.** Agent uses Atlassian MCP to move the ticket to `In Review`.
---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `claude mcp add` is unrecognized | Old Claude Code version | `npm update -g @anthropic-ai/claude-code` |
| OAuth window never opens | Browser blocking the popup, or the auth URL went to a different default browser | Copy the URL from terminal output and open it manually |
| `claude mcp list` shows `unauthenticated` | OAuth was completed against the wrong Atlassian account | Run `claude mcp remove atlassian`, repeat setup with the correct account |
| Agent can authenticate but can't see `DP-x` tickets | Your Atlassian account lacks project access | Get added to the `DP` project in Jira; MCP cannot fix permissions |
| Agent answers about a ticket without calling a tool | MCP not actually connected, or agent hallucinating | Re-run verification; if it persists, restart Claude Code |

If you're stuck for more than ~15 minutes, **don't keep trying** — post in the team channel with the exact output of `claude mcp list` and the error. Saving the next person from the same dead-end is part of setup.

---

## Where this is enforced

- **`CLAUDE.md`** (Section 3 — Tech stack) lists Atlassian MCP as a required local tool.
- **PR template** rejects PRs without a `DP-` ticket key in the title. The only way to get the right ticket key is to actually read the ticket — and the only way the agent reads tickets is through this MCP connection.
- **Code review.** A reviewer who sees a PR description that looks fabricated (no ticket detail, no FR reference, no acceptance-criteria checkbox) sends it back. "Ran the agent without MCP" is not an accepted excuse.

---

## Onboarding checklist (new team member, day one)

- [ ] Claude Code CLI installed (`claude --version` works).
- [ ] Atlassian account has access to the `DP` Jira project (I can see `DP-1` in the Jira web UI).
- [ ] `claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp` succeeded.
- [ ] OAuth completed against my work Atlassian account.
- [ ] `claude mcp list` shows `atlassian` as connected.
- [ ] Verified by asking Claude Code to read `DP-1`; it returned real ticket content.
- [ ] Read `CLAUDE.md`, `DEVELOPMENT.md` in that order.

When all boxes are ticked, you're cleared to pick up your first ticket.