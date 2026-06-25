# duplicate-risk/ — Duplicate Truth Risk Register

---

## What This Is

This folder tracks all known and potential duplicate truth risks inside piranav's Mini-AIOS workspace. A duplicate truth risk exists whenever two or more files could become the authoritative source for the same fact, rule, or evidence — causing inconsistency when one is updated and the other is not.

---

## Why This Exists

Duplicate truth is the most common failure mode in multi-session, multi-agent workflows:
- A fix report is copied into two folders
- A workflow doc is renamed instead of updated, leaving the old copy active
- A daily log format is defined in two places, drifting apart over time

This register makes duplicate risk visible and trackable so that Varmen can review and authorise cleanup before it compounds.

---

## Business / Operational Question Supported

> "Is there exactly one authoritative source for each fact, rule, and evidence item — and can I verify that without reading every file?"

---

## Confirmed Duplicate Risks (Found During 2026-06-25 Discovery Scan)

These duplicates exist OUTSIDE `piranav_aios` and are NOT cleaned up in this build. Cleanup requires Varmen approval and a separate commit.

| # | Duplicate File A | Duplicate File B | Overlap | Risk Level | Status | Recommendation |
|---|---|---|---|---|---|---|
| DR-001 | `Desktop/Website technical - piranav/2026-06-15/2026-06-15 - Copy.md` | `Desktop/Website technical - piranav/2026-06-15/2026-06-15.md` | Identical daily log | HIGH | OPEN — not cleaned | Delete `- Copy.md` in next cleanup commit |
| DR-002 | `Desktop/Website technical - piranav/2026-06-15/ledsone-seo-strategy-audit-2026-06-15 - Copy.md` | `Desktop/Website technical - piranav/2026-06-15/ledsone-seo-strategy-audit-2026-06-15.md` | Identical SEO audit | HIGH | OPEN — not cleaned | Delete `- Copy.md` in next cleanup commit |
| DR-003 | `Desktop/Website technical - piranav/2026-06-18/Shopify_CLI_Theme_Workflow.md` | `Desktop/Website technical - piranav/2026-06-18/shopify-cli-theme-workflow.md` | Identical Shopify CLI workflow doc (different filename case) | HIGH | OPEN — not cleaned | Keep `shopify-cli-theme-workflow.md` (lowercase, consistent naming); delete `Shopify_CLI_Theme_Workflow.md` |

---

## Potential Future Duplicate Risks

These risks do NOT exist yet but will arise if the wrong approach is taken when linking pre-existing evidence.

| # | Risk Description | Trigger Condition | Risk Level | Prevention Rule |
|---|---|---|---|---|
| DR-004 | Desktop evidence files copied into `evidence/` folder | Back-linking session creates copies instead of references | HIGH | Always add a path reference to `evidence/README.md` index — never copy the file itself |
| DR-005 | Closure fields duplicated in both daily log (Desktop) and `closure/README.md` | Future sessions write closure in two places | MEDIUM | `closure/README.md` is the single closure authority from 2026-06-25 onwards; Desktop daily logs are narrative, not the closure record |
| DR-006 | Workflow doc created inside `piranav_aios/prompts/` that duplicates the Shopify CLI doc in Desktop | New prompt template replicates existing workflow content | MEDIUM | Before creating any prompt template, search for existing content first (per START_HERE.md Step 1) |
| DR-007 | Two handover notes exist for the same session — one in chat, one as a file | Handover note is written as chat text AND saved as a file | LOW | Save as file only; do not rely on chat history as a handover record |

---

## Duplicate Prevention Rules

1. **Search before creating.** Before writing any file, check whether equivalent content exists in: `piranav_aios/`, `Desktop/Website technical - piranav/`, and `Downloads/uk 2026.06.09/`.
2. **Reference, do not copy.** For pre-existing evidence in Desktop, add a path reference to `evidence/README.md` — do not copy the file into `piranav_aios`.
3. **One closure record.** `closure/README.md` is the single source of truth for session closure from 2026-06-25. Desktop daily logs remain narrative session records, not the closure authority.
4. **One workflow doc.** If a workflow is updated, update the single authoritative file — do not create a new version alongside the old one. If the old file must be replaced, log the replacement in `handover/README.md` and delete the old file in the same commit.
5. **Report new duplicates here.** If a new duplicate risk is found during any session, add it to this register before ending the session.

---

## Cleanup Authorisation Requirement

Cleaning confirmed duplicates (DR-001, DR-002, DR-003) requires:
1. Written approval from Varmen
2. An out-of-scope approval record in `handover/README.md` (these files are outside `piranav_aios`)
3. A single git commit that removes all three duplicates together, with a clear commit message

**Do not clean individually across multiple commits — this makes the audit trail harder to follow.**

---

## Duplicate Risk Register Update Rules

| Event | Action Required |
|---|---|
| New duplicate found during session | Add row to Confirmed table immediately |
| Duplicate cleaned (with approval) | Move row from Confirmed to Resolved table below |
| New potential risk identified | Add row to Potential Future Risks table |

---

## Resolved Duplicate Risks

| # | Was | Cleaned In Commit | Date |
|---|---|---|---|
| _(none yet)_ | — | — | — |

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — identified DR-001, DR-002, DR-003 from `git ls-files` output
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

ACTIVE — 3 confirmed duplicate risks open (DR-001, DR-002, DR-003). Cleanup pending Varmen approval and out-of-scope authorisation.

---

## Pass / Fail Rule

Duplicate risk PASSES if: all known duplicates are in this register, and no new duplicate was introduced in the current session.
Duplicate risk FAILS if: a session introduces a new duplicate without logging it here, or if confirmed duplicates are cleaned without a corresponding out-of-scope approval in `handover/README.md`.

---

## Next Step

1. Varmen to review DR-001, DR-002, DR-003 and confirm cleanup approval
2. Once approved, add out-of-scope approval record in `handover/README.md`
3. Execute cleanup in a single commit

---

## Known Limits

- This register only covers duplicates known as of 2026-06-25 discovery
- Duplicates that exist inside `Downloads/uk 2026.06.09/` (theme snapshot) have not been audited — theme files are not in scope for this register
