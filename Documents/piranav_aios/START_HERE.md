# START HERE — piranav Mini-AIOS Session Protocol

**Read this at the start of every session. Do not skip.**

---

## What This Is

This document defines the mandatory workflow for every Claude Code session inside piranav's Mini-AIOS workspace. It covers roles, session order, evidence requirements, duplicate prevention, and closure rules.

---

## Why This Exists

Without a consistent session protocol:
- Work gets done but cannot be queried later
- Evidence is created in the wrong place
- Duplicate truth builds silently across sessions
- Coordinator cannot verify what happened

This document prevents all of that.

---

## Business / Operational Question Supported

> "Did piranav's session produce queryable, evidence-backed, coordinator-reviewable output that can be safely handed over or audited?"

---

## Role Split

### GPT is the brain
- GPT (the coordinator-facing LLM) designs tasks, reviews outputs, approves scope changes, and confirms evidence quality
- GPT does NOT execute file writes, run git commands, or make production changes
- All GPT decisions that affect scope or evidence must be logged in `handover/README.md`

### Claude Code is the worker
- Claude Code reads, writes, and queries files inside `C:\Users\PC\Documents\piranav_aios`
- Claude Code runs git commands (read-only: status, log, diff; write: only when explicitly instructed to commit)
- Claude Code does NOT make decisions — it executes approved instructions
- Claude Code does NOT change files outside `piranav_aios` without written approval logged in `handover/README.md`

---

## Session Order — Follow Every Time

### Step 1 — Search existing assets first
Before creating any file, check whether it already exists:
- Search inside `piranav_aios/` first
- Check `evidence/README.md` index
- Check `source-map/README.md`
- If an existing file can be extended, extend it — do not create a parallel copy

**If you skip this step, you risk duplicate truth.**

### Step 2 — Confirm scope
- Confirm the task is inside piranav's assigned boundary
- If the task requires touching files outside `piranav_aios`, stop and log in `handover/README.md` — wait for Varmen approval before proceeding

### Step 3 — Evidence first
- Do not mark a task complete until evidence exists
- Accepted evidence types: see `evidence/README.md`
- Every completed task must have at least one evidence item before closure

### Step 4 — Do the work
- Follow the approved task
- Write output files inside `piranav_aios/` or the approved scope area
- Save any Claude-generated output as a `.md` file before the session ends

### Step 5 — Duplicate truth prevention check
Before saving any file, ask:
- Does a file with this content already exist anywhere in the repo?
- Would saving this file create two sources of truth for the same fact?
- If YES to either: extend or link the existing file — do not create a new one

Confirmed duplicate risks are logged in `duplicate-risk/README.md`.

### Step 6 — Daily closure
Every session must end with a closure entry in `closure/README.md`.
A session is NOT complete until closure is written.

Required closure fields (see `closure/README.md`):
- Requirement ID
- Asset path
- Evidence path
- GitHub path / commit (if changed)
- Queryability result YES/NO
- Blockers
- Next step
- PASS / FAIL

**A session with no closure entry is a FAIL.**

### Step 7 — Git status check
Run `git status` before ending every session. Confirm:
- No unintended files are staged
- No files outside `piranav_aios` were modified

Do NOT commit unless Varmen has explicitly instructed a commit in this session.

---

## Unknown Developer Readiness

If a new developer, agent, or Claude session starts without this context:

1. Read `README.md` first — identity, boundary, and discovery notes
2. Read this file (`START_HERE.md`) second — workflow protocol
3. Read `source-map/README.md` — where existing evidence lives
4. Read `closure/README.md` — what has already been closed
5. Read `duplicate-risk/README.md` — what duplicate risks are known
6. Do NOT start writing files until steps 1–5 are complete
7. If in doubt, stop and ask Varmen before proceeding

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan result (AMBER — empty piranav_aios, existing evidence on Desktop)
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

ACTIVE — this protocol applies from 2026-06-25 onwards

---

## Pass / Fail Rule

A session PASSES if all 7 steps are followed and closure is written.
A session FAILS if:
- Evidence is missing at closure
- Files outside `piranav_aios` were changed without approval
- Duplicate truth was created
- Closure was not written

---

## Next Step

On next session: run Step 1 (existing asset search) before doing anything else.

---

## Known Limits

- This protocol assumes GPT review is available at session start and end
- If GPT is unavailable, piranav must still complete closure and flag GPT-review as PENDING in the closure entry
- This file covers session workflow only — for evidence format rules see `evidence/README.md`
