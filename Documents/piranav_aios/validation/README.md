# validation/ — Validation Reports

---

## What This Is

This folder holds per-task validation reports that record whether a completed change produced the expected result. Each report is a structured `.md` file with a PASS or FAIL verdict.

---

## Why This Exists

A task being "done" is not the same as a task being validated. Validation records:
- What the expected outcome was
- What was actually observed
- Whether the result matches
- Whether the fix introduced any regressions

Without validation reports, evidence only proves a change was made — not that the change worked.

---

## Business / Operational Question Supported

> "Did the change produce the expected result, and can Varmen verify that without re-running the task themselves?"

---

## Validation Report Index

| Date | Task / Requirement ID | Report File | Result |
|---|---|---|---|
| 2026-06-25 | AIOS-STARTER-001 — Mini-AIOS starter build | _(inline — no code change to validate)_ | PASS — files created as specified, git status clean |

---

## Validation Report Format

Each validation report file must be named:
`validation/YYYY-MM-DD-[short-task-slug].md`

And must follow this structure:

```markdown
# Validation Report — [Task Name]

## Date
YYYY-MM-DD

## Requirement / Task ID
[ID from closure/README.md]

## What Was Expected
Description of the expected outcome.

## What Was Observed
Description of what actually happened after the change.

## Test Method
How the result was verified (e.g., browser check, git diff, Shopify preview, Claude Code read).

## Evidence
- Evidence type: [git commit / file path / screenshot / etc.]
- Evidence path: [path or hash]

## Regressions Checked
List any related areas checked for unintended side effects.

## Result
PASS / FAIL

## Reviewer
Varmen

## Notes
Any caveats, monitoring requirements, or follow-up needed.
```

---

## Validation Rules

1. A validation report is required for any task that changes a production file (Liquid, CSS, JS, JSON config).
2. A validation report is NOT required for documentation-only changes (e.g., this starter build) — a closure PASS is sufficient.
3. Validation reports must be linked in the Evidence Index (`evidence/README.md`) before a task is closed.
4. If a validation result is FAIL, the task must NOT be marked PASS in `closure/README.md`. Open a follow-up task instead.

---

## Pre-Existing Validation Evidence (Outside piranav_aios — Discovery Finding)

The following fix and audit reports in the parent repo serve as informal validation records. They have NOT been copied here.

| Date | File | Validates |
|---|---|---|
| 2026-06-24 | `Desktop/.../predictive-search-fix-report.md` | Predictive search availability fix |
| 2026-06-24 | `Desktop/.../predictive-search-mismatch-report.md` | Search result count mismatch |
| 2026-06-24 | `Desktop/.../search-input-missing-fix.md` | Search input restoration |
| 2026-06-24 | `Desktop/.../404-page-redesign.md` | 404 page redesign |
| 2026-06-22 | `Desktop/.../hero-section-verification-report.md` | Hero section fix |
| 2026-06-22 | `Desktop/.../search-grid-fix-report.md` | Search grid fix |
| 2026-06-16 | `Desktop/.../vendor-stock-contrast-fix-2026-06-16.md` | Accessibility contrast fix |

Formal linking of these into this folder's index requires a separate authorised session.

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — identified existing fix/validation reports in Desktop path
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

STARTER — folder and index created. No formal validation reports exist yet inside this folder. Back-linking of pre-existing reports pending Varmen approval.

---

## Pass / Fail Rule

Validation PASSES if: every production file change has a corresponding validation report with a PASS result linked in `evidence/README.md`.
Validation FAILS if: a production change is closed in `closure/README.md` with no validation report, or if the validation result is FAIL and a follow-up task has not been opened.

---

## Next Step

1. For all future production changes, create a validation report here before closing the task
2. In a future authorised session, back-link the 2026-06-24 and earlier fix reports into this index

---

## Known Limits

- This folder contains no live validation reports yet
- Pre-existing reports in Desktop path are informal — they lack the structured format defined above
- Validation by browser check requires the Shopify CLI preview to be active, which is not always available during a session
