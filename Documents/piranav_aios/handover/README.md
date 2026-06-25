# handover/ — Handover and Out-of-Scope Approval Records

---

## What This Is

This folder holds two types of records:
1. **Handover notes** — summaries written at the end of a session so the next session (human or Claude Code) can pick up safely without context loss
2. **Out-of-scope approval records** — written approvals from Varmen that authorise piranav to act outside `piranav_aios` for a specific, bounded purpose

---

## Why This Exists

Without handover notes:
- The next session re-derives context already established, wasting time and risking drift
- In-progress work is forgotten or restarted incorrectly

Without out-of-scope approval records:
- There is no audit trail for why a file outside `piranav_aios` was modified
- The boundary rule cannot be enforced retroactively
- Coordinator review has no basis to evaluate the action

---

## Business / Operational Question Supported

> "Can the next session start safely without losing context, and is every out-of-scope action fully authorised and documented?"

---

## Handover Index

| Date | Session Summary | Blocking Issues | Next Action | File |
|---|---|---|---|---|
| 2026-06-25 | AIOS-STARTER-001 — Mini-AIOS starter structure created. piranav_aios was empty; 9 starter files created. No production changes. Git status clean. Not committed. | Remote repo name mismatch (`aios-piranav` vs `piranav_aios`) unresolved. Pre-existing Desktop evidence not yet linked. 3 duplicate files not yet cleaned. | Varmen to confirm canonical repo name. Then run evidence-linking session. | _(inline — no separate file needed for this entry)_ |

---

## Handover Note Format

Each handover file must be named:
`handover/YYYY-MM-DD-handover.md`

And must follow this structure:

```markdown
# Handover Note — [Date]

## Session Summary
One paragraph: what was done, what files were changed, what was NOT done.

## Completed Tasks
- [Task ID]: [one-line summary] — PASS/FAIL

## In-Progress (Not Closed)
- [Task ID]: [what remains] — status, next step

## Blocking Issues
- [Description of blocker] — who needs to resolve it

## State at Handover
- Git status: [clean / untracked only / staged files]
- Committed: YES / NO
- Pushed: YES / NO

## Next Session Must
1. [First action]
2. [Second action]

## Handed Over By
piranav / Claude Code — [date]

## Received By
[Next session holder, or PENDING]
```

---

## Out-of-Scope Approval Record Format

Any action outside `C:\Users\PC\Documents\piranav_aios` requires a record here BEFORE the action is taken.

```markdown
# Out-of-Scope Approval — [Date] — [Brief Description]

## Requested Action
What piranav wants to do outside the assigned subfolder.

## Files / Paths Affected
Exact paths that will be touched.

## Reason
Why this is necessary.

## Approved By
Varmen (record the exact instruction received)

## Date of Approval
YYYY-MM-DD

## Scope Limit
The exact boundary of this approval — what is NOT covered.

## Executed By
piranav / Claude Code — [date]

## Outcome
What was actually done. Did it match the approval scope?
```

---

## Active Out-of-Scope Approvals

| Date | Action | Approved By | Scope | Status |
|---|---|---|---|---|
| _(none)_ | — | — | — | — |

---

## Expired / Completed Out-of-Scope Approvals

| Date | Action | Scope | Outcome |
|---|---|---|---|
| _(none)_ | — | — | — |

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — identified handover need from empty piranav_aios and existing Desktop work
- Varmen coordinator instruction for Mini-AIOS build

---

## Owner / Reviewer

| Role | Name |
|---|---|
| Assigned Staff | piranav |
| Coordinator / Reviewer | Varmen |
| Last Updated | 2026-06-25 |

---

## Status

STARTER — folder and index created. First handover entry is the 2026-06-25 starter build. No out-of-scope approvals active.

---

## Pass / Fail Rule

Handover PASSES if: every session ends with a handover entry (inline or file), and every action outside `piranav_aios` has a prior written approval record here.
Handover FAILS if: a session ends with no handover entry, or a file outside `piranav_aios` was changed without a corresponding approval record.

---

## Next Step

1. Varmen to respond to remote repo name question (see README.md)
2. When responding, also confirm approach for Desktop evidence back-linking — add approval record here if approved
3. First proper session handover file to be created at end of next working session

---

## Known Limits

- This file currently contains one inline handover entry (the starter build) — no separate handover files exist yet
- Out-of-scope approval mechanism depends on Varmen being reachable — if Varmen is unavailable, the action must wait
