# Search Page Input Missing — Fix Report
**Date:** 2026-06-24
**Store:** ledsone.co.uk
**Risk:** 🟡 Amber — search page only, no other pages affected

---

## Problem

The Search page (`/search`) showed the heading **"Search our store"** but the search input box was completely invisible to the customer. Users could not type a new search query on the search results page.

---

## Investigation (Read-Only)

| Check | Result |
|-------|--------|
| Section assigned in `templates/search.json` | `main-search` ✅ |
| Search form present in active Liquid code | **NO** ❌ |
| CSS hiding the input | Not applicable — form not rendered at all |
| Section schema setting hiding the box | Not applicable |

---

## Root Cause

The entire original search section — including the search form — was **wrapped inside a `{%comment%}…{%endcomment%}` block** by Kuberan on 04/03/2026 during the infinity scroll rewrite.

The new replacement code (lines 150–418) rendered:
- ✅ Heading
- ✅ Product grid
- ✅ Infinite scroll JS
- ❌ **No search form** — it was never moved from the commented block into the new active code

The form existed in the file at lines 23–48 but was unreachable inside the comment wrapper.

---

## Fix Applied

**File changed:** `sections/main-search.liquid`

Restored the search form into the active code block, immediately after the heading inside `<section class="page-heading">`.

**Two improvements over the original:**
1. Added `value="{{ search.terms | escape }}"` to the input — pre-fills the user's query when arriving from predictive search
2. Added `aria-label` to both the input and submit button for accessibility

**Nothing else changed.** No CSS, no JS, no other files.

---

## Before vs After

| | Before | After |
|--|--------|-------|
| Heading shows | ✅ | ✅ |
| Search input visible | ❌ | ✅ |
| Query pre-filled from predictive search | ❌ | ✅ |
| aria-label on input | ❌ | ✅ |

---

## Testing Checklist
- [ ] Visit `/search` — input box is visible below the heading
- [ ] Type a query and submit — results load correctly
- [ ] Arrive from predictive search — query is pre-filled in the box
- [ ] Infinite scroll still works on results page
- [ ] No console errors
- [ ] Header search unchanged
- [ ] Predictive dropdown unchanged
- [ ] Collection pages unchanged

---

## Files Changed
| File | Change |
|------|--------|
| `sections/main-search.liquid` | Search form restored into active code block |

---

## CAPABILITY LOG
- What was built: Fix for search input missing after infinity scroll rewrite
- Reusable: Yes
- If yes, where it applies: Any store where a section rewrite accidentally leaves the search form in a comment block
- Pattern name: `search-form-comment-block-recovery`
