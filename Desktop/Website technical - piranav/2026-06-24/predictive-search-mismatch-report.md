# Predictive Search Mismatch — Root Cause Report
**Date:** 2026-06-24  
**Session:** Piranav  
**Risk Level:** 🟢 Green (investigation only — no code modified)

---

## Problem
- **Search term:** `outside sensor wall light`
- **Predictive dropdown:** 0 results
- **Search page:** 911 results

---

## Root Cause — TWO compounding issues

---

### Issue 1 (PRIMARY) — Predictive API fields are too narrow

**File:** `assets/theme.js`  
**Line:** 3951–3953

```js
&resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku
```

The Shopify Predictive Search API **only searches the fields you declare**. The query `"outside sensor wall light"` matches products via **description / body_html** — but `body` is not in the fields list.

The full search page (`/search`) searches across **all fields including body_html**, which is why 911 results appear there.

| Source | Fields searched |
|---|---|
| Predictive API (`/search/suggest`) | `title, tag, vendor, product_type, variants.title, variants.sku` only |
| Full search page (`/search`) | All fields including `body_html` / description |

**Recommended fix:** Add `body` to the fields parameter in `theme.js` line 3953:
```js
&resources[options][fields]=title,body,tag,vendor,product_type,variants.title,variants.sku
```

---

### Issue 2 (SECONDARY) — `product.available` filter silently hides results

**File:** `sections/search-predictive-list.liquid`  
(both `search_suggest` and fallback loop blocks)

```liquid
{%- if product.available -%}
  {%- render 'product-popular-list-item' ... -%}
{%- endif -%}
```

Even if the API returns products, **any out-of-stock product is silently skipped**. `displayed_count` only increments for available products, so if all 6 API results are out of stock, the dropdown shows 0 results — even though `results_count > 0` is true and the "Items" heading already rendered.

The full search page pushes OOS products to the end (`unavailable_products=last`) but does not remove them.

---

### Issue 3 (CONTRIBUTING) — `resources[limit]=6` caps the API response

**File:** `assets/theme.js`  
**Line:** 3953

```js
&resources[limit]=6
```

The API returns a maximum of 6 products. Combined with the availability filter (Issue 2), if any of those 6 are out-of-stock they are dropped — leaving fewer or zero visible results.

---

## Full Flow Trace

```
User types "outside sensor wall light"
  → theme.js BlsSearchShopify.getSearchResults()
  → Fetch /search/suggest?q=...
      &resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku
      &resources[limit]=6
  → Shopify API: searches ONLY declared fields → 0 matches returned
  → results_count = 0
  → search-predictive-list.liquid renders "no results" block
  → Dropdown shows: 0 results

Meanwhile on /search page:
  → Searches ALL fields including body_html
  → 911 matches found
  → Page renders 911 results
```

---

## Risk Assessment

| Fix | Risk | Notes |
|---|---|---|
| Add `body` to fields in `theme.js` line 3953 | 🟢 Green | One-line JS change, no Liquid touched, no layout impact |
| Remove `product.available` filter in `search-predictive-list.liquid` | 🟡 Amber | Would show OOS products — use `unavailable_products=last` sort instead of hard hide |
| Increase `resources[limit]` from 6 to 10 | 🟢 Green | Reduces chance of all 6 being OOS, minor performance cost |

**Priority fix: add `body` to fields in `theme.js` — resolves the primary 0-result cause.**

---

## Files Investigated (read-only)
- `assets/theme.js` — lines 3937–3980 (`getSearchResults` function)
- `sections/search-predictive-list.liquid` — availability filter + results loop
- `sections/search-predictive-grid.liquid` — same pattern confirmed
- `snippets/product-popular-list-item.liquid` — rendering only (no filtering)

---

CAPABILITY LOG  
- What was built: Predictive search 0-result mismatch investigation  
- Reusable: Yes  
- If yes, where it applies: Any store where predictive shows fewer results than full search page  
- Pattern name: `predictive-search-fields-mismatch`
