# Predictive Search Mismatch — Fix Report
**Date:** 2026-06-24  
**Session:** Piranav  
**Risk Level:** 🟢 Green  
**Verdict:** ✅ PASS — Safe to deploy

---

## Fixes Applied

### Fix 1 — Added `body` to Predictive API fields + increased limit
**File:** `assets/theme.js` — line 3953

**Before:**
```js
&resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku&...&resources[limit]=6
```

**After:**
```js
&resources[options][fields]=title,body,tag,vendor,product_type,variants.title,variants.sku&...&resources[limit]=10
```

- `body` added — products matched by description now appear in predictive dropdown
- `limit` raised 6 → 10 — more candidates fetched, reduces chance of all being filtered

---

### Fix 2 — Removed `product.available` hard filter
**File:** `sections/search-predictive-list.liquid` — both result loops

**Before:**
```liquid
{%- if product.available -%}
  {%- render 'product-popular-list-item' ... -%}
  {%- assign displayed_count = displayed_count | plus: 1 -%}
{%- endif -%}
```

**After:**
```liquid
{%- render 'product-popular-list-item' ... -%}
{%- assign displayed_count = displayed_count | plus: 1 -%}
```

- OOS products no longer silently dropped
- API already handles ordering via `unavailable_products=last` — OOS products appear at the bottom, not the top

---

## Files Modified
| File | Change |
|------|--------|
| `assets/theme.js` | Added `body` to fields, limit 6 → 10 |
| `sections/search-predictive-list.liquid` | Removed `product.available` filter from both loops |

## Files NOT Modified
- `snippets/product-popular-list-item.liquid` — no change needed
- `sections/search-predictive-grid.liquid` — grid mode unaffected

---

CAPABILITY LOG  
- What was built: Predictive search 0-result fix  
- Reusable: Yes  
- If yes, where it applies: Any store using Shopify predictive search with narrow field list  
- Pattern name: `predictive-search-body-field-fix`
