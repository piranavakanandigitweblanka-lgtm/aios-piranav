# LEDsone — Question-to-Search Intent Layer
# Technical Design & Implementation Roadmap

**Date:** 2026-06-23
**Role:** Senior Shopify Search Engineer
**Status:** Design only — no code modified
**Risk Level:** 🟡 Amber (new JS asset touches live search input)

---

## Phase 1 — Architecture Report

### 1.1 Search Engine Stack

| Layer | Component | Location |
|-------|-----------|----------|
| Search controller (JS) | `BlsSearchShopify` object | `assets/theme.js` lines 3738–4041 |
| Predictive results (dropdown) | `sections/search-predictive-list.liquid` | Rendered server-side via section fetch |
| Predictive results (popup/grid) | `sections/search-predictive-grid.liquid` | Rendered server-side via section fetch |
| Result item template | `snippets/product-popular-list-item.liquid` | Variant-aware display snippet |
| Search form (popup layout) | `snippets/search-popup.liquid` | Contains `#search_mini_form`, `input[type="search"]` |
| Search form (canvas/sidebar) | `snippets/top-search.liquid` | Second form instance, same structure |
| Styles | `assets/predictive-search-redesign.css` | Presentation only |

---

### 1.2 Search Flow Diagram

```
USER TYPES IN SEARCH BOX
         │
         ▼
input[type="search"] (name="q")
  inside form#search_mini_form  ←── Hidden fields:
  class="search search-modal__form"    options[fields] = title,vendor,product_type,variants.title
                                       options[prefix] = last
                                       options[unavailable_products] = {{ settings.unavailable_pr }}
         │
         ▼ (input event, debounced 300ms)
BlsSearchShopify.onChange()
  → BlsSearchShopify.getQuery()
    → document.querySelector('input[type="search"]').value.trim()
         │
         ▼ raw string
BlsSearchShopify.getSearchResults(searchTerm)
         │
         ├─── if .predictive_search_suggest present
         │         ▼
         │    fetch(/search/suggest
         │          ?q=ENCODED_TERM
         │          &resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku
         │          &resources[options][prefix]=last
         │          &resources[options][unavailable_products]=last
         │          &resources[type]=product
         │          &resources[limit]=6
         │          &section_id=search-predictive-grid OR search-predictive-list)
         │
         └─── else (standard search mode)
                   ▼
              fetch(/search
                    ?q=ENCODED_TERM
                    &options[prefix]=last
                    &options[unavailable_products]=last
                    &type=product
                    &limit=6
                    &section_id=search-predictive-grid OR search-predictive-list)
         │
         ▼ server renders section HTML
BlsSearchShopify.renderSearchResults(html)
  → injects into [data-predictive-search]
  → adds class "results" to #predictive-search
         │
         ▼
product-popular-list-item.liquid renders each result
  → client-side variant matching on search_terms
  → shows matched variant image + URL


ON FORM SUBMIT (Enter key or Search button):
         │
         ▼
BlsSearchShopify.onFormSubmit(event)
  → if no query or aria-selected result → preventDefault()
  → otherwise → GET /search?q=INPUT_VALUE&type=product
                            &options[fields]=title,vendor,product_type,variants.title
                            &options[prefix]=last
                            &options[unavailable_products]=...
```

---

### 1.3 Event Listeners — Full Map

| Event | Target | Handler | File | Line |
|-------|--------|---------|------|------|
| `input` (debounced 300ms) | `input[type="search"]` | `onChange()` → `getSearchResults()` | theme.js | 3795–3800 |
| `focus` | `input[type="search"]` | `onFocus()` → `getSearchResults()` | theme.js | 3801 |
| `focusout` | `document` | `onFocusOut()` → `close()` | theme.js | 3802 |
| `keyup` | `document` | `onKeyup()` → ArrowUp/Down/Enter nav | theme.js | 3803 |
| `keydown` | `document` | `onKeydown()` → prevent default on arrows | theme.js | 3804 |
| `submit` | `form.search` | `onFormSubmit()` | theme.js | 3794 |
| `click` | `.select_cat [data-name="product_type"] li` | category filter → `onChange()` | theme.js | 3806–3826 |
| `click` | `.top-search-toggle` | open/close search panel | theme.js | 3746–3761 |
| `click` | `.mini_search_header .button-close` | close search panel | theme.js | 3763–3769 |
| `click` | `document` | close if outside predictive results | search-predictive-list.liquid | line 138 |

---

### 1.4 Confirmed Injection Points

There are **three points** where a query preprocessor can intercept cleanly:

**Injection Point 1 — Predictive fetch (PRIMARY)**
`theme.js` line 3950–3958: `searchTerm` is passed directly into the fetch URL.
Replacing `searchTerm` with `LedsoneIntentLayer.transform(searchTerm)` intercepts both fetch paths.

```javascript
// Current (theme.js ~line 3951)
var search_url = `...?q=${encodeURIComponent(searchTerm)}&...`

// With intent layer
var processedTerm = window.LedsoneIntentLayer
  ? window.LedsoneIntentLayer.transform(searchTerm)
  : searchTerm;
var search_url = `...?q=${encodeURIComponent(processedTerm)}&...`
```

**Injection Point 2 — Form submit (SECONDARY)**
`theme.js` line 3850: `onFormSubmit` handler. A pre-submit interceptor transforms the input value before the GET request is sent.

**Injection Point 3 — Input value override (DISPLAY)**
When the user presses Enter, the raw query is visible in the input. The intent layer can optionally update the visible input value with the transformed term (good for UX transparency: user sees what they actually searched for).

---

### 1.5 Critical Discrepancy Found

The AJAX predictive search and the form submission use **different field sets**:

| Path | Fields Searched |
|------|----------------|
| AJAX (`/search/suggest`) | `title, tag, vendor, product_type, variants.title, variants.sku` |
| Form submission (`/search`) | `title, vendor, product_type, variants.title` ← **missing tag + variants.sku** |

Tags and SKUs are only searched in the live dropdown, not on the full results page. This creates an inconsistency where a user finds a product in the dropdown but cannot find it by pressing Enter.

**This must be fixed alongside the intent layer implementation** by updating the hidden `options[fields]` input in both `search-popup.liquid` and `top-search.liquid`.

---

## Phase 2 — Intent Processing Design

### 2.1 Stop Word List

These words are removed before the query is sent to Shopify. They carry no product-matching value.

```
QUESTION STARTERS:    what, which, who, where, how
MODAL VERBS:          is, are, can, could, would, will, should
ARTICLES:             a, an, the
PREPOSITIONS:         for, in, on, to, at, by, with, of, from, into
QUALIFIERS:           best, good, great, suitable, perfect, ideal, nice, any
PERSONAL:             i, my, me, we, our, us
FILLER:               need, want, looking, recommend, suggest, find, get, buy, some
CONJUNCTIONS:         and, or, but, so
```

**Rule:** Strip stop words only when the resulting query has ≥ 2 meaningful terms remaining. If stripping leaves 0 or 1 word, return the original query unchanged — avoid producing an over-broad single-word search.

---

### 2.2 Intent Dictionary — Full Structure

The intent dictionary is a JSON object with two sections: `rooms` (location-based intent) and `products` (synonym/category mapping).

#### Room Intent Dictionary

```json
{
  "rooms": {
    "kitchen island": {
      "inject_terms":  ["pendant", "hanging"],
      "product_type":  "pendant-light",
      "tags":          ["room-kitchen", "use-island", "use-over-table"]
    },
    "kitchen": {
      "inject_terms":  ["pendant", "ceiling"],
      "product_type":  "pendant-light",
      "tags":          ["room-kitchen"]
    },
    "hallway": {
      "inject_terms":  ["wall", "flush"],
      "product_type":  "wall-light",
      "tags":          ["room-hallway"]
    },
    "dining room": {
      "inject_terms":  ["pendant", "chandelier"],
      "product_type":  "pendant-light",
      "tags":          ["room-dining"]
    },
    "bedroom": {
      "inject_terms":  ["bedside", "wall"],
      "product_type":  "wall-light",
      "tags":          ["room-bedroom"]
    },
    "living room": {
      "inject_terms":  ["floor", "table", "ceiling"],
      "product_type":  "ceiling-light",
      "tags":          ["room-living"]
    },
    "bathroom": {
      "inject_terms":  ["wall", "mirror"],
      "product_type":  "wall-light",
      "tags":          ["room-bathroom", "ip44"]
    },
    "office": {
      "inject_terms":  ["desk", "table", "floor"],
      "product_type":  "table-lamp",
      "tags":          ["room-office"]
    },
    "restaurant": {
      "inject_terms":  ["pendant", "industrial", "vintage"],
      "tags":          ["use-commercial", "room-restaurant"]
    },
    "garden": {
      "inject_terms":  ["outdoor", "wall"],
      "tags":          ["outdoor", "ip65"]
    }
  }
}
```

#### Product Synonym Dictionary

```json
{
  "products": {
    "ceiling rose":    { "synonyms": ["lamp holder", "pendant holder", "ceiling fitting"] },
    "lampshade":       { "synonyms": ["shade", "lamp shade", "light shade"] },
    "lamp shade":      { "synonyms": ["shade", "lampshade", "light shade"] },
    "bulb holder":     { "synonyms": ["lamp holder", "pendant holder", "e27 holder"] },
    "pendant":         { "synonyms": ["hanging light", "hanging lamp", "drop light"] },
    "industrial":      { "synonyms": ["vintage", "cage", "steampunk", "retro"] },
    "vintage":         { "synonyms": ["industrial", "retro", "filament", "edison"] },
    "led bulb":        { "synonyms": ["filament bulb", "energy saving bulb"] },
    "dimmer":          { "synonyms": ["dimmable", "dim switch"] },
    "wall light":      { "synonyms": ["wall sconce", "wall lamp", "wall fitting"] },
    "sconce":          { "synonyms": ["wall light", "wall lamp"] },
    "flush mount":     { "synonyms": ["ceiling light", "flush ceiling light", "close ceiling"] },
    "chandelier":      { "synonyms": ["crystal light", "multi-arm pendant", "ceiling chandelier"] },
    "spider light":    { "synonyms": ["multi-pendant", "cluster pendant", "sputnik"] },
    "fabric cable":    { "synonyms": ["textile cable", "twisted cable", "braided cable"] },
    "conduit":         { "synonyms": ["pipe light", "conduit lighting", "industrial pipe"] },
    "e27":             { "synonyms": ["e27 bulb", "es fitting", "standard fitting", "screw fitting"] },
    "e14":             { "synonyms": ["ses fitting", "small screw", "small e14"] },
    "gu10":            { "synonyms": ["spotlight bulb", "downlight bulb", "track bulb"] }
  }
}
```

---

### 2.3 Query Transformation Logic — Step by Step

```
INPUT:  raw user query string
OUTPUT: optimised Shopify search query string

STEP 1 — Normalise
  → lowercase
  → trim whitespace
  → collapse multiple spaces to single space

STEP 2 — Phrase detection (before word splitting)
  → scan for multi-word room phrases FIRST (longest match wins)
  → "kitchen island" detected before "kitchen" or "island" alone
  → "dining room" detected before "dining" or "room" alone
  → mark detected phrase as a single token

STEP 3 — Stop word removal
  → split remaining (non-phrase) tokens by space
  → remove each token if it exists in the stop word list
  → if remaining tokens < 2 → return original normalised query (safety fallback)

STEP 4 — Room intent expansion
  → for each detected room phrase:
    → look up intent dictionary
    → if intent found:
      → if no product type word already in query → prepend inject_terms[0]
      → keep room phrase in query (it maps to tags in Shopify)

STEP 5 — Synonym expansion
  → for each remaining token:
    → check if token exists in product synonym dictionary
    → if match: keep original term (synonyms are handled at tag/description level
       via product data enrichment, not by expanding the query itself)

STEP 6 — Rebuild query
  → join all tokens with space
  → max 5 tokens (trim excess — Shopify AND-joins all terms; too many = zero results)
  → return final string

STEP 7 — Safety checks
  → if final string is empty → return original query
  → if final string identical to input → no transformation needed
  → log transformation for analytics (original vs transformed)
```

---

### 2.4 Query Transformation Examples

| User Query | After Stop Word Removal | After Intent Expansion | Final Query Sent to Shopify |
|-----------|------------------------|----------------------|----------------------------|
| `What pendant light is best for a kitchen island?` | `pendant light kitchen island` | kitchen island → inject "pendant" (already present) | `pendant light kitchen island` |
| `Which wall light is suitable for a hallway?` | `wall light hallway` | hallway → inject "wall" (already present) | `wall light hallway` |
| `I need a red pendant light for my dining room` | `red pendant light dining room` | dining room → inject "pendant" (already present) | `red pendant dining room` |
| `What is a ceiling rose?` | `ceiling rose` | no room match | `ceiling rose` |
| `Lampshade for E27 bulb` | `lampshade E27 bulb` | no room match | `lampshade E27 bulb` |
| `Best industrial pendant for restaurant` | `industrial pendant restaurant` | restaurant → inject "pendant" (already present) + "industrial" | `industrial pendant restaurant` |
| `Can you recommend a ceiling light for a bedroom?` | `ceiling light bedroom` | bedroom → inject "bedside wall" | `wall ceiling light bedroom` → trim to `ceiling light bedroom` (product type already present) |
| `Looking for something for my hallway` | `hallway` → only 1 token → SAFETY FALLBACK | return original: `looking for something for my hallway` | `hallway` (after normalise only, no stop word strip since < 2 remaining) |
| `Red` | single token | no transformation | `red` (unchanged) |
| `E27 pendant black vintage` | `E27 pendant black vintage` | no room match | `E27 pendant black vintage` |

**Token limit rule in action:**
`"I need a warm white pendant light for above my kitchen dining table"` →
After stop words: `warm white pendant light kitchen dining table` (7 tokens) →
Priority: product tokens first, then room tokens → keep: `pendant light kitchen dining` (4 tokens max)

---

## Phase 3 — Implementation Plan

### Option A — Client-Side Query Preprocessing (Standalone JS Asset)

**What it is:** A new file `assets/ledsone-intent-search.js` that loads after `theme.js` and monkey-patches the `BlsSearchShopify.getSearchResults` method to intercept the `searchTerm` before it reaches the Shopify fetch.

**Architecture:**

```
ledsone-intent-search.js loads
  → defines window.LedsoneIntentLayer = { transform(query) }
  → wraps BlsSearchShopify.getSearchResults()
  → on each call: runs transform() on the raw term
  → passes transformed term to original getSearchResults()
  → also intercepts form submit to transform input value
```

**Files created:**
- `assets/ledsone-intent-search.js` (new)

**Files modified:**
- `layout/theme.liquid` — add `<script>` tag to load the new asset after theme.js

**Pros:**
- Zero changes to `theme.js` — no risk of breaking existing search
- Fully reversible — remove the script tag and nothing changes
- Independently updatable without touching the theme
- Intent dictionary is editable in isolation

**Cons:**
- Monkey-patching relies on `BlsSearchShopify` being a global object (it is — confirmed in theme.js)
- Loads as a second JS file (async — ~5ms delay on first load)

**Complexity:** Low — 1–2 days  
**Performance:** <5ms per query (all client-side, no network calls)  
**Maintenance:** Edit the JS asset dictionary — no theme deployment needed  
**UX Benefit:** High — transparent to user, works for both predictive dropdown and form submission

---

### Option B — Predictive Search Enhancement (Modify theme.js)

**What it is:** Embed the intent logic directly into `theme.js` inside the `getSearchResults` method.

**Architecture:**

```javascript
// Modified getSearchResults in theme.js
getSearchResults: function (searchTerm) {
  var processedTerm = this.processIntent(searchTerm); // ← added
  // ... rest of fetch logic uses processedTerm ...
}

// Added method
processIntent: function(term) {
  // stop word removal + intent dictionary lookup
}
```

**Files modified:**
- `assets/theme.js` — add `processIntent()` method + modify `getSearchResults()`
- `assets/theme.min.js` — must be regenerated/updated in sync

**Pros:**
- Single file, no monkey-patching
- Tightly integrated — no timing issues

**Cons:**
- Modifies the core theme JS — any future theme update overwrites this
- `theme.min.js` must be kept in sync manually
- Higher risk to existing search functionality
- Harder to test in isolation

**Complexity:** Medium (due to theme.min.js sync risk)  
**Performance:** Identical to Option A  
**Maintenance:** High — every theme.js update requires re-merging  
**UX Benefit:** Same as Option A

---

### Option C — Combined Approach (RECOMMENDED)

**What it is:** Option A (standalone JS) + field improvements in Liquid + tag taxonomy in Shopify admin.

**Full stack:**

```
Layer 1 — JS (ledsone-intent-search.js)
  → stop word removal
  → intent dictionary
  → query transformation
  → intercepts both predictive fetch and form submit

Layer 2 — Liquid field fix
  → add body_html + tag to options[fields] in search-popup.liquid + top-search.liquid
  → fix form/AJAX field discrepancy

Layer 3 — Product data (Shopify admin)
  → tag taxonomy applied to products: room-kitchen, room-hallway, bulb-e27, style-industrial
  → product descriptions enriched with natural use-case language
```

**Why combined:**
- The JS layer handles question → keyword transformation (covers conversational queries)
- The field fix ensures the form submission matches the dropdown
- The product data enrichment means the transformed keywords actually FIND products
- Each layer is independent — Layer 3 has value even without Layers 1 and 2

**Complexity:** Medium — 3–5 days total  
**Performance:** <5ms JS + no backend change + better tag indexing  
**Maintenance:** Low — each layer is independently maintainable  
**UX Benefit:** Highest achievable without third-party search

---

### Option Comparison Table

| Criterion | Option A (Standalone JS) | Option B (Modify theme.js) | Option C (Combined) |
|-----------|--------------------------|---------------------------|---------------------|
| Complexity | Low | Medium | Medium |
| Theme update safety | ✅ Safe | ❌ Overwritten on theme update | ✅ Safe |
| Performance impact | <5ms | <5ms | <5ms |
| Covers dropdown | ✅ | ✅ | ✅ |
| Covers form submit | ✅ | ✅ | ✅ |
| Covers zero-result fallback | ❌ | ❌ | ✅ (via tags) |
| Maintenance effort | Low | High | Low–Medium |
| UX benefit | High | High | Highest |
| Rollback ease | Immediate (remove script tag) | Medium (revert JS edit) | Per-layer rollback |
| **Recommendation** | | | **✅ Preferred** |

---

## Phase 4 — Inventory Awareness

### 4.1 Current Behaviour

Both fetch paths already pass `unavailable_products=last` (or `unavailable_products={{ settings.unavailable_pr }}`):

```
/search/suggest?...&resources[options][unavailable_products]=last
/search?...&options[unavailable_products]=last
```

`unavailable_products=last` instructs Shopify to push out-of-stock products to the end of results. This is already configured correctly.

### 4.2 What "Available" Means in This Theme

`search-predictive-list.liquid` (lines 117–131) adds a second filter layer on top of Shopify's ordering:

```liquid
{%- if product.available -%}
  {%- render 'product-popular-list-item' ... -%}
{%- endif -%}
```

Only `product.available == true` products are rendered in the dropdown. Out-of-stock products returned by Shopify are silently skipped. This is the correct behaviour.

**Risk:** If fewer than 4 available products match the query, the dropdown shows fewer results than expected (rather than showing OOS products as fallback). This is intentional and correct for LEDsone.

### 4.3 Variant Preference

`product-popular-list-item.liquid` already implements variant-preference matching:

```liquid
for variant in product.variants
  if variant_title_down contains search_terms_down
    assign matched_variant = variant
    break
  endif
endfor
```

When a search term matches a specific variant (e.g. "black" or "E27"), that variant's image and URL are shown directly. This is working and should be preserved.

### 4.4 Intent Layer + Stock Awareness Integration

The intent layer must **not** interfere with inventory filtering. It only transforms the query string sent to Shopify — it does not touch the result rendering. The existing `product.available` filter in the section templates continues to operate independently.

**One enhancement to consider (Phase 2):** If the intent-transformed query returns 0 results, fall back to the raw stripped query (without intent expansion) before showing "no results". This prevents the intent layer from inadvertently creating more zero-result states.

Fallback logic:
```
transform("What pendant for my hallway?")
→ "pendant hallway" → fetch → 0 results?
  → fallback: fetch "pendant" → show results
  → show subtle message: "Showing results for: pendant"
```

---

## Deliverable 5 — Implementation Plan

### Phase 1 — Foundation (Day 1)
**Risk: 🟢 Green**

1. Fix field discrepancy: add `tag,variants.sku,body_html` to `options[fields]` in `search-popup.liquid` and `top-search.liquid`
2. Verify the fix doesn't break existing search on dev theme
3. Create tag taxonomy document (room tags, style tags, bulb tags)

**Files:** `snippets/search-popup.liquid`, `snippets/top-search.liquid`
**Evidence:** Test "hallway" and "E27" queries on dev theme — confirm tag-based results appear

---

### Phase 2 — Intent Layer JS (Day 2–3)
**Risk: 🟡 Amber**

1. Create `assets/ledsone-intent-search.js`
   - Stop word list
   - Room intent dictionary (10 rooms)
   - Product synonym dictionary (15 entries)
   - `transform(query)` function
   - Monkey-patch of `BlsSearchShopify.getSearchResults`
   - Form submit interceptor
   - Analytics logging (`window.LedsoneSearchLog` array)

2. Add script tag to `layout/theme.liquid` after theme.js

3. Test all example queries in dev theme:
   - "What pendant light is best for a kitchen island?"
   - "Which wall light is suitable for a hallway?"
   - "I need a red pendant light for my dining room"
   - "Lampshade for E27 bulb"

**Files:** `assets/ledsone-intent-search.js` (new), `layout/theme.liquid`
**Evidence:** Console log showing `[LedsoneIntentLayer] "what pendant light is best for a kitchen island" → "pendant light kitchen island"` for each test query

---

### Phase 3 — Product Data Enrichment (Day 3–5)
**Risk: 🟢 Green**

1. Bulk-apply room tags to top 100 products:
   - Format: `room-kitchen`, `room-hallway`, `room-dining`, `room-bedroom`, `room-bathroom`
2. Apply style tags: `style-industrial`, `style-vintage`, `style-modern`, `style-minimalist`
3. Apply bulb tags: `bulb-e27`, `bulb-e14`, `bulb-gu10`, `bulb-b22`
4. Enrich product descriptions for top 20 highest-traffic products with room/use language

**Files:** Shopify admin (product tags — no theme files)
**Evidence:** Search "hallway" on dev theme — products with `room-hallway` tag appear in results

---

### Phase 4 — Zero-Result Fallback (Day 5)
**Risk: 🟢 Green**

1. Add fallback logic to intent layer:
   - If transformed query returns 0 results → retry with stripped-only query (no intent expansion)
   - If retry also 0 → return original query
2. Optional: surface "Showing results for: [transformed term]" message in results UI

**Files:** `assets/ledsone-intent-search.js`, `sections/search-predictive-list.liquid`

---

## Deliverable 6 — Performance Impact Assessment

| Component | Impact | Detail |
|-----------|--------|--------|
| `ledsone-intent-search.js` load | +5–10ms first load | Cached after first load — async |
| `transform()` execution | <1ms per query | Pure string operations, no I/O |
| Debounce (existing) | 300ms | Already in place — buffers rapid typing |
| Tag indexing (Shopify) | +5–15ms TTFB | Shopify server-side index scan is slightly larger |
| `body_html` field addition | +10–20ms TTFB | Full-text scan of descriptions — heavier |
| Zero-result fallback retry | +300ms if triggered | Additional fetch only on zero-result queries |
| Overall user-perceived impact | Negligible | All processing before fetch, within debounce window |

**Recommendation on `body_html`:** Add to the form submission (full results page) only. Do NOT add to the predictive AJAX fetch — description scanning significantly increases response time on the live-as-you-type dropdown where speed is critical.

---

## Deliverable 7 — Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Monkey-patch breaks if theme.js restructures `BlsSearchShopify` | Low | High | Check `window.BlsSearchShopify` exists before patching; log warning if not |
| Intent transformation creates zero-result queries | Medium | Medium | Fallback chain: transformed → stripped → original |
| Stop word removal leaves < 2 tokens | Medium | Low | Safety check: if < 2 tokens, return original query unchanged |
| Tag taxonomy applied inconsistently to products | Medium | Medium | Document canonical tag list; use bulk edit for consistency |
| `body_html` in predictive fetch causes slow dropdown | High (if added) | High | Never add `body_html` to `/search/suggest` path |
| `theme.min.js` diverges from `theme.js` | Low | Low | Intent layer is in separate file — never touches `.min.js` |
| Over-expansion creates irrelevant results | Low | Medium | Intent dictionary only injects terms already relevant to the product type; test each mapping |
| Two script files load in wrong order | Low | High | Use `defer` attribute; check `window.BlsSearchShopify` before patching |

---

## Summary

| Deliverable | Status |
|-------------|--------|
| Architecture Report | ✅ Complete |
| Search Flow Diagram | ✅ Complete |
| Intent Dictionary Design | ✅ Complete (10 rooms, 19 product synonyms) |
| Query Transformation Examples | ✅ Complete (9 examples) |
| Implementation Plan | ✅ Complete (4 phases, 5 days) |
| Performance Impact Assessment | ✅ Complete |
| Risk Assessment | ✅ Complete |

**Recommended approach:** Option C (Combined) — standalone JS asset + field fix + product tags
**Total estimated effort:** 4–5 days
**New files:** 1 (`assets/ledsone-intent-search.js`)
**Modified files:** 3 (`snippets/search-popup.liquid`, `snippets/top-search.liquid`, `layout/theme.liquid`)
**Zero changes to:** `theme.js`, `theme.min.js`, any section files

---

## CAPABILITY LOG

- **What was built:** Full technical design for a client-side Question-to-Search Intent Layer on top of Shopify native search
- **Reusable:** Yes
- **Where it applies:** Any Shopify store using `BlsSearchShopify` (Blum theme framework) or similar theme-level predictive search controller
- **Pattern name:** `shopify-intent-layer-standalone-js`
