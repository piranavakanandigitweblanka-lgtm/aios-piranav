# prompts/ — Claude Prompt Templates

---

## What This Is

This folder holds reusable Claude Code prompt templates for recurring tasks inside piranav's Mini-AIOS workspace. Each template is a structured prompt that produces consistent, evidence-backed, queryable output.

---

## Why This Exists

Without standard prompts:
- Each session reinvents the task format
- Output quality is inconsistent
- Evidence format varies, making it unqueryable
- Duplicate truth is more likely (same task prompted differently produces parallel outputs)

Standard prompts ensure every session produces output in the same format, with the same evidence fields, ready for Varmen review.

---

## Business / Operational Question Supported

> "Can any authorised person re-run a past task type and get output in the same format, with the same evidence fields, without re-designing the prompt?"

---

## Prompt Index

| Prompt File | Task Type | Status |
|---|---|---|
| _(none yet — templates to be added)_ | — | PENDING |

---

## Template Format

Every prompt file in this folder must follow this structure:

```
# Prompt: [Task Type Name]

## Purpose
One sentence explaining what this prompt is for.

## When to Use
Conditions under which this prompt applies.

## Pre-conditions
What must exist before running this prompt (e.g., a specific file, a git state).

## Prompt Text
---
[Exact prompt text to paste into Claude Code]
---

## Expected Output
- List of files Claude Code should produce
- Evidence type(s) that must be included in output

## Post-run Checklist
- [ ] Evidence saved as file
- [ ] Evidence index updated in evidence/README.md
- [ ] Closure entry written in closure/README.md
- [ ] Git status checked

## Owner / Reviewer
| Role | Name |
|---|---|
| Assigned Staff | piranav |
| Coordinator / Reviewer | Varmen |
| Last Updated | YYYY-MM-DD |
```

---

## Recurring Task Types (Templates To Be Created)

| Task Type | Priority | Prompt File Needed |
|---|---|---|
| Shopify Liquid fix — read, change, evidence | HIGH | `prompts/liquid-fix.md` |
| Daily closure entry | HIGH | `prompts/daily-closure.md` |
| Discovery scan — new asset | MEDIUM | `prompts/discovery-scan.md` |
| Validation check — post-fix | MEDIUM | `prompts/validation-check.md` |
| Duplicate risk check | MEDIUM | `prompts/duplicate-risk-check.md` |
| Evidence back-link (Desktop → piranav_aios) | LOW | `prompts/evidence-backlink.md` |

These templates will be created in future authorised sessions.

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — identified recurring task types from existing session logs
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

STARTER — folder and index created. No templates exist yet. Templates to be built in future sessions.

---

## Pass / Fail Rule

Prompts PASS review if: a template exists for every recurring task type piranav performs, and every template includes the expected output fields and post-run checklist.
Prompts FAIL review if: a recurring task was run without an existing template AND no template was created as a result.

---

## Next Step

Create `prompts/daily-closure.md` and `prompts/liquid-fix.md` as first priority templates in the next build session.

---

## Known Limits

- No templates exist yet — this folder is a placeholder until the first template session runs
- Templates must be reviewed by Varmen before use in production sessions
