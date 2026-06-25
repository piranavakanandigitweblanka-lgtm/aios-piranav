# evidence/ — Evidence Rules and Index

---

## What This Is

This folder defines the accepted evidence types for all work performed inside piranav's Mini-AIOS workspace and holds the evidence index linking sessions to their proof.

---

## Why This Exists

Evidence makes work queryable. Without it:
- A coordinator cannot verify what changed and why
- A future session cannot safely extend or revert prior work
- Audit trails are missing if a production issue arises

Every completed task must have at least one accepted evidence item before it is marked PASS in `closure/README.md`.

---

## Business / Operational Question Supported

> "Can I prove, from the repo, exactly what changed, when, by whom, and why — and can I query it later?"

---

## Accepted Evidence Types

All evidence must be one of the following:

| # | Evidence Type | Description | Example |
|---|---|---|---|
| 1 | Git commit hash | A commit in the parent repo (`C:\Users\PC`) that records the change | `1bbcd79` |
| 2 | GitHub path | A URL or relative path to a file at a specific commit on the GitHub remote | `Desktop/Website technical - piranav/2026-06-24/predictive-search-fix-report.md` |
| 3 | Validation report | A `.md` file inside `validation/` that records a pass/fail check result | `validation/2026-06-25-predictive-search-validation.md` |
| 4 | Claude output saved as file | Any `.md` file Claude Code generated during a session, saved inside `piranav_aios/` or the approved scope path before session end | `evidence/2026-06-25-search-fix-output.md` |
| 5 | Screenshot path | An absolute or relative path to a saved screenshot file, with a description of what it shows | `C:\Users\PC\Desktop\screenshots\2026-06-25-search-result.png` |
| 6 | Evidence markdown | A standalone `.md` file inside `evidence/` documenting the finding, file changed, before/after state, and test result | `evidence/2026-06-25-hero-section-fix.md` |
| 7 | Source file path | The absolute path to the production file that was changed, combined with a git commit hash or diff reference | `Downloads/uk 2026.06.09/sections/main-search.liquid` @ commit `1bbcd79` |

---

## Evidence Rules

1. **Every task must have at least one evidence item before closure.**
2. **Evidence must be saved as a file before the session ends** — memory or chat output alone is not evidence.
3. **Evidence type 4 (Claude output)** must be a `.md` file written to disk, not a message left in the chat.
4. **Evidence type 5 (screenshot)** must include a file path that resolves on this machine — a description of what the screenshot shows, and the date taken.
5. **Do not create duplicate evidence files.** If a fix report already exists in `Desktop/Website technical - piranav/`, do not copy it into `evidence/` — record the path reference instead.
6. **Evidence index entries must be added to this file** under the Evidence Index section below.

---

## Evidence Index

> This index links session tasks to their evidence items.
> Add one row per completed task. Do not leave rows blank.

| Date | Task / Requirement ID | Evidence Type | Evidence Path / Commit | Status |
|---|---|---|---|---|
| 2026-06-25 | AIOS-STARTER-001 — Mini-AIOS starter build | Evidence markdown | `piranav_aios/README.md`, `START_HERE.md`, folder READMEs | PASS — files created, git status clean |

---

## Pre-Existing Evidence (Outside piranav_aios — Discovery Finding)

The following evidence exists in the parent repo but has NOT been copied here.
These are reference pointers only. Do not duplicate this content.

| Date Folder | Path in Parent Repo | Content Type |
|---|---|---|
| 2026-06-09 | `Desktop/Website technical - piranav/2026-06-09/` | Daily log, product review, theme audit |
| 2026-06-12 | `Desktop/Website technical - piranav/2026-06-12/` | Daily log, FAQ schema fix, promo widget |
| 2026-06-15 | `Desktop/Website technical - piranav/2026-06-15/` | Daily log, breadcrumb audit, SEO audit, collection fix |
| 2026-06-16 | `Desktop/Website technical - piranav/2026-06-16/` | Daily log, 7 accessibility fix reports |
| 2026-06-17 | `Desktop/Website technical - piranav/2026-06-17/` | Daily log, megamenu fix, INP investigation |
| 2026-06-18 | `Desktop/Website technical - piranav/2026-06-18/` | Daily log, promo banner fix, Shopify CLI workflow doc |
| 2026-06-19 | `Desktop/Website technical - piranav/2026-06-19/` | Daily log, layout audit, featured products fix, AI readiness audit |
| 2026-06-22 | `Desktop/Website technical - piranav/2026-06-22/` | Daily log, hero section fix, search grid fix, implementation plan |
| 2026-06-23 | `Desktop/Website technical - piranav/2026-06-23/` | Daily log, search intent design, AI advisor design, SEO improvements |
| 2026-06-24 | `Desktop/Website technical - piranav/2026-06-24/` | Daily log, predictive search fix, 404 redesign, GMC fix, search input fix |

Linking these into the Evidence Index above requires a separate authorised session (Varmen approval required).

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — file inventory of `Desktop/Website technical - piranav/`
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

ACTIVE — evidence rules apply from 2026-06-25. Index is seeded with starter build entry. Full backfill pending.

---

## Pass / Fail Rule

Evidence PASSES if: at least one accepted evidence type exists for every closed task, and the index row is complete.
Evidence FAILS if: a closure entry exists with no matching evidence item in this index.

---

## Next Step

1. Varmen to confirm back-linking approach for pre-existing evidence
2. Run evidence-linking session to populate the index table with 2026-06-09 through 2026-06-24 entries

---

## Known Limits

- Pre-existing evidence from before 2026-06-25 has not been indexed here yet
- Screenshot evidence depends on files existing on this local machine — paths may not resolve on another machine
- Git commit hashes reference the parent repo at `C:\Users\PC`, not a standalone `piranav_aios` repo
