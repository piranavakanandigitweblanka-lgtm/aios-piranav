# Breadcrumb Collection Path — Investigation Report
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__15JUN2026-1154am`
**Date:** 2026-06-16 | **Discovery only — no changes made**

---

## Audit Table

| File | Logic Found | Risk | Recommended Fix |
|---|---|---|---|
| `snippets/breadcrumbs.liquid` | On product pages: uses `collection.url` if collection context exists. If NOT, falls back to `product.collections[5]` → `[4]` → `[3]` → `[2]` — hardcoded index selection, never `[0]` or `[1]` | **CRITICAL** — Arbitrary index picks a random collection. Products with fewer than 3 collections show NO breadcrumb collection at all | Replace index logic with `product.url | within: collection` or a named priority collection metafield |
| `snippets/breadcrumbs.liquid` | `collection.url` context (lines 15–18) only available when user navigates FROM a collection. Direct URL / search / external link = no `collection` context | **HIGH** — Breadcrumb collection disappears on direct product page visits | Use `product.url | within: collection` to preserve context |
| `sections/breadcrumb.liquid` | Schema JSON-LD uses `collection` (line 31) — same context dependency as snippet. Falls back to no collection node (lines 40–47) if no context | **HIGH** — BreadcrumbList schema loses collection node on direct visits; Google sees inconsistent structured data | Mirror fix from snippet into schema block |
| `snippets/product-item.liquid` | Product links use `current_variant.url | default: product.url` (lines 226, 426) — no `within: collection` | **MEDIUM** — Products clicked from collection grid lose collection context, breaking breadcrumb on destination page | Change to `product.url | within: collection` |
| `snippets/product-list-item.liquid` | All 3 product links use bare `product.url` (lines 94, 137, 190) — no `within: collection` | **MEDIUM** — Collection context lost on click | Change to `product.url | within: collection` |
| `snippets/lookbook-card.liquid` | Uses bare `product.url` (lines 53, 93) | **LOW** — Inconsistent | Change to `product.url | within: collection` |
| `snippets/custom-product-card.liquid` | All 4 links use `product.url | within: collection` (lines 3, 35, 188, 293) ✓ | **PASS** | No change needed |
| `snippets/halloween-product-card.liquid` | All 3 links use `product.url | within: collection` ✓ | **PASS** | No change needed |
| `snippets/product-popular-list-item.liquid` | All 3 links use `product.url | within: collection` ✓ | **PASS** | No change needed |

---

## Root Cause — Detailed Evidence

### Issue 1 — Hardcoded Index Fallback (CRITICAL)
**File:** `snippets/breadcrumbs.liquid` · Lines 22–46

```liquid
{% if product.collections.size > 5 %}
  {% assign collection = product.collections[5] %}
{% elsif product.collections.size > 4 %}
  {% assign collection = product.collections[4] %}
{% elsif product.collections.size > 3 %}
  {% assign collection = product.collections[3] %}
{% elsif product.collections.size > 2 %}
  {% assign collection = product.collections[2] %}
{% endif %}
```

**What this does:** When no collection context exists, it picks collection index `[5]`, `[4]`, `[3]`, or `[2]` based on how many collections the product belongs to. `product.collections` order in Shopify is **not guaranteed** — it returns collections in an arbitrary internal order. This means the breadcrumb can show any random collection (e.g. `vintage-lighting` instead of `pendant-lights`).

**Worst case:** A product in only 1 or 2 collections shows **no collection breadcrumb at all**.

---

### Issue 2 — Collection Context Only Available via Navigation
**File:** `snippets/breadcrumbs.liquid` · Lines 15–18

```liquid
{%- if collection.url -%}
  {{ collection.title | link_to: collection.url }}
```

`collection` is only populated by Shopify when a user arrives at a product page **via a collection URL** (e.g. `/collections/pendant-lights/products/xyz`). If they arrive via direct URL, search, external link, or Google — `collection` is nil and the broken fallback fires.

---

### Issue 3 — Product Cards Not Passing Collection Context
**Files:** `snippets/product-item.liquid` (lines 226, 426), `snippets/product-list-item.liquid` (lines 94, 137, 190)

```liquid
<!-- product-item.liquid — WRONG -->
href="{{ current_variant.url | default: product.url }}"

<!-- product-list-item.liquid — WRONG -->
href="{{ product.url }}"

<!-- custom-product-card.liquid — CORRECT ✓ -->
href="{{ product.url | within: collection }}"
```

When `product-item.liquid` or `product-list-item.liquid` renders on a collection page, the link goes to `/products/xyz` instead of `/collections/pendant-lights/products/xyz`. Collection context is never passed, so even browsing users hit the fallback.

---

## Priority Fix Order

| Priority | File | Lines | Change |
|---|---|---|---|
| 1 — CRITICAL | `snippets/breadcrumbs.liquid` | 22–46 | Replace hardcoded index fallback with priority-based logic or metafield |
| 2 — HIGH | `snippets/product-item.liquid` | 226, 426 | `product.url` → `product.url | within: collection` |
| 3 — HIGH | `snippets/product-list-item.liquid` | 94, 137, 190 | `product.url` → `product.url | within: collection` |
| 4 — MEDIUM | `sections/breadcrumb.liquid` | 31–47 | Add consistent collection fallback to JSON-LD schema block |

---

**Status: PASS** — Exact breadcrumb source identified across all relevant files with file paths, line numbers, and code evidence.
