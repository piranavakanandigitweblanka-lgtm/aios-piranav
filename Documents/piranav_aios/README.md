# piranav — Mini-AIOS Workspace

---

## Identity

| Field | Value |
|---|---|
| Staff / Team Name | piranav |
| Assigned Subfolder | `C:\Users\PC\Documents\piranav_aios` |
| Parent Domain | Website Tec team |
| Coordinator | Varmen |
| GitHub Repository (as stated by assignment) | https://github.com/piranavakanandigitweblanka-lgtm/piranav_aios |
| Git Remote (actual, found during discovery) | https://github.com/piranavakanandigitweblanka-lgtm/aios-piranav.git |
| Git Root (actual local) | `C:\Users\PC` (parent home directory) |
| Current Branch | master |
| Build Date | 2026-06-25 |
| Status | STARTER — structure created, evidence linking pending |

---

## What This Is

This is the designated Mini-AIOS workspace for piranav. It holds documentation, evidence indexes, prompts, validation records, handover notes, closure logs, source maps, and duplicate-risk controls for all work piranav performs under the Website Tec team.

This folder does NOT hold live production code. Production Liquid/CSS/JS theme files are tracked under `C:\Users\PC\Downloads\uk 2026.06.09\` in the parent repository. Daily work evidence is currently tracked under `C:\Users\PC\Desktop\Website technical - piranav\` (see Discovery Note below).

---

## Why This Exists

Without a structured workspace:
- Evidence cannot be queried across sessions
- Boundaries are not enforced
- Duplicate truth builds up silently
- Coordinator review has no single place to check

This folder establishes the minimum queryable, evidence-backed, safe workspace.

---

## Boundary Rule

**Work only inside `C:\Users\PC\Documents\piranav_aios` unless Varmen has given written approval to operate elsewhere.**

Any exception must be documented in `handover/README.md` before the out-of-scope action is taken.

---

## Folder Structure

```
piranav_aios/
├── README.md               ← This file. Identity, boundary, overview.
├── START_HERE.md           ← Workflow protocol every session must follow.
├── evidence/
│   └── README.md           ← Evidence types, rules, and index format.
├── prompts/
│   └── README.md           ← Claude prompt templates for recurring tasks.
├── validation/
│   └── README.md           ← Validation report format and index.
├── handover/
│   └── README.md           ← Handover and out-of-scope approval records.
├── duplicate-risk/
│   └── README.md           ← Duplicate truth risks identified and tracked.
├── source-map/
│   └── README.md           ← Source file locations and data mapping.
└── closure/
    └── README.md           ← Daily closure log format and active records.
```

---

## Discovery Note — Existing Evidence Location

During the 2026-06-25 discovery scan, existing piranav work evidence was found at:

```
C:\Users\PC\Desktop\Website technical - piranav\
  2026-06-09\   2026-06-12\   2026-06-15\   2026-06-16\
  2026-06-17\   2026-06-18\   2026-06-19\   2026-06-22\
  2026-06-23\   2026-06-24\
```

This evidence is tracked in the parent git repo (`C:\Users\PC`) under the remote `aios-piranav`.

**This evidence has NOT been copied or moved into `piranav_aios` as part of this build.** Copying without approval would create duplicate truth. Indexing and linking will be performed in a separate authorised session after Varmen confirms the approach.

---

## Duplicate Cleanup Note

Three confirmed duplicate files were found outside `piranav_aios` during discovery:
- `Desktop/Website technical - piranav/2026-06-15/2026-06-15 - Copy.md`
- `Desktop/Website technical - piranav/2026-06-15/ledsone-seo-strategy-audit-2026-06-15 - Copy.md`
- `Desktop/Website technical - piranav/2026-06-18/Shopify_CLI_Theme_Workflow.md` (duplicate of `shopify-cli-theme-workflow.md`)

**Duplicate cleanup is NOT performed in this build.** See `duplicate-risk/README.md`.

---

## Owner / Reviewer

| Role | Name |
|---|---|
| Assigned Staff | piranav |
| Coordinator / Reviewer | Varmen |
| Parent Domain | Website Tec team |

---

## Pass / Fail Rule

This workspace PASSES review if:
- All work is evidenced (git commit, file path, or validation report)
- All closure entries have a PASS/FAIL result
- No duplicate truth is introduced
- Nothing outside this folder is changed without written approval

This workspace FAILS review if:
- Evidence is missing for any completed task
- A file outside `piranav_aios` is modified without approval
- A closure entry is left blank or has no result

---

## Next Step

1. Varmen to confirm: is `piranav_aios` or `aios-piranav` the canonical GitHub repo name?
2. Run first evidence-indexing session to link existing `Desktop/Website technical - piranav/` daily logs into `evidence/` and `closure/`
3. Remove confirmed duplicate files in a single clean-up commit (requires Varmen approval)

---

## Known Limits

- This starter contains no live evidence yet — evidence index is empty pending the linking session
- The git root is at `C:\Users\PC`, not inside this folder — commits from this folder will be in the parent home-level repo
- Remote repo name mismatch (assignment says `piranav_aios`, actual remote is `aios-piranav`) is unresolved
