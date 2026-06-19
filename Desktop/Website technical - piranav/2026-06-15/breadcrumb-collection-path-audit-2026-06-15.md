# Breadcrumb Incorrect Collection Path — Root Cause Audit
**Theme:** ledsone-co-uk-promotion-week-4-2-mega-digital (15 Jun 2026)
**Date:** 2026-06-15
**Status:** ROOT CAUSE IDENTIFIED — PASS

---

## Audit Table

| File | Logic Found | Risk | Recommended Fix |
|---|---|---|---|
| `snippets/breadcrumbs.liquid` L15 | Uses `collection.url` (URL context) as primary source — correct when user navigates via collection | LOW — works correctly when accessed via collection URL | Keep as-is |
| `snippets/breadcrumbs.liquid` L22–46 | **FALLBACK BUG:** picks `product.collections[5]`, `[4]`, `[3]`, or `[2]` by array index when no collection context exists | **CRITICAL** — Shopify returns `product.collections` in alphabetical handle order; index-based selection is arbitrary and non-deterministic | Replace with `product.collections.first` or a primary collection metafield |
| `snippets/breadcrumbs.liquid` L22 | No fallback for `product.collections.size <= 2` — breadcrumb silently drops the collection segment entirely | HIGH — products in 1–2 collections show no collection in breadcrumb | Include `elsif product.collections.size > 0` case |
| `sections/breadcrumb.liquid` L27–47 | Schema `BreadcrumbList` uses `collection` URL context only — no fallback | MEDIUM — schema breadcrumb drops collection for direct product URLs, mismatching visual breadcrumb | Mirror the same fallback fix applied to the snippet |
| `snippets/custom-product-card.liquid` L3, L35, L188, L293 | Uses `product.url \| within: collection` — **correct** | None — maintains collection context in product links | No change needed |
| `snippets/halloween-product-card.liquid` L3, L44, L85 | Uses `product.url \| within: collection` — **correct** | None | No change needed |
| `snippets/product-popular-list-item.liquid` L10, L25, L38 | Uses `product.url \| within: collection` — **correct** | None | No change needed |

---

## Root Cause — Detailed Explanation

### How breadcrumb collection is determined

**Step 1 — URL Context Check (`snippets/breadcrumbs.liquid` line 15):**
```liquid
{%- if collection.url -%}
  {{ collection.title | link_to: collection.url }}
```
When a user navigates to a product **via a collection page**, Shopify sets the `collection` object in context. This works correctly — the breadcrumb shows the collection they came from.

**Step 2 — Fallback: Array Index Selection (lines 22–46) ← THE BUG**
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
When there is **no collection context** (direct URL, Google search result, shared link), this fallback fires.

**Why this produces wrong results:**
- `product.collections` is returned by Shopify in **alphabetical order by collection handle**
- `product.collections[5]` does not mean "the 6th most important collection" — it means "the 6th collection alphabetically"
- A product in 6 collections will always show the 6th alphabetical collection, regardless of relevance
- A product in exactly 2 collections shows **no collection at all** (no matching condition)
- A product in 1 collection shows **no collection at all**

**Example of the bug in practice:**
A pendant light product belongs to: `accessories`, `all-products`, `new-arrivals`, `pendant-lights`, `trending`, `vintage-lighting`
- Sorted alphabetically: index [0]=accessories, [1]=all-products, [2]=new-arrivals, [3]=pendant-lights, [4]=trending, [5]=vintage-lighting
- Size is 6, so `product.collections[5]` = `vintage-lighting`
- Breadcrumb shows: **Home / Vintage Lighting / [Product]** — WRONG
- Should show: **Home / Pendant Lights / [Product]**

---

### Whether `product.url | within: collection` is used

**In breadcrumb files: NO.**
The breadcrumb snippet uses `collection.url` directly — not the `within:` filter.

**In product card snippets: YES — correctly.**
`custom-product-card.liquid`, `halloween-product-card.liquid`, and `product-popular-list-item.liquid` all use `product.url | within: collection`, which correctly appends the collection path to the product URL when a collection context exists. This is what **sets** the collection context when a user clicks from a collection page.

**The disconnect:** Product cards correctly pass collection context via `within: collection`, but when a user arrives via a direct URL (not a product card), there is no collection context, and the fallback index logic fires.

---

## Schema Mismatch

`sections/breadcrumb.liquid` schema (lines 27–47) only uses the `collection` URL context and has **no fallback**:
```liquid
{%- if collection -%}
  "name": {{ collection.title | json }},
  "item": "{{ shop.url }}{{ collection.url }}"
```
This means:
- **Visual breadcrumb** shows a collection (via index fallback) — potentially wrong one
- **Schema BreadcrumbList** shows no collection — just Home → Product
- **Visual and schema are inconsistent** — a structured data integrity issue

---

## Recommended Fix

### Fix 1 — `snippets/breadcrumbs.liquid` (replace lines 20–48)

**Replace:**
```liquid
{% else %}
  <!-- puvii added to show collection in breadcumbs -->
  {% if product.collections.size > 5 %}
    {% assign collection = product.collections[5] %}
    ...
  {% elsif product.collections.size > 2 %}
    {% assign collection = product.collections[2] %}
    ...
  {% endif %}
{%- endif -%}
```

**With:**
```liquid
{% else %}
  {% if product.collections.size > 0 %}
    {% assign collection = product.collections.first %}
    <li class="bls__breadcrumb-item d-inline">
      {{ collection.title | link_to: collection.url }}
      <span aria-hidden="true" class="bls__breadcrumb-separator pr-4">/</span>
    </li>
  {% endif %}
{%- endif -%}
```

> **Note:** `product.collections.first` returns the first collection alphabetically. For a more controlled result, set a `custom.primary_collection` metafield on each product and use that instead.

### Fix 2 — `sections/breadcrumb.liquid` schema (lines 40–47)

Add the same fallback to the schema so visual and structured data stay in sync:
```liquid
{%- else -%}
  {% if product.collections.size > 0 %}
    {% assign fallback_collection = product.collections.first %}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ fallback_collection.title | json }},
      "item": "{{ shop.url }}{{ fallback_collection.url }}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": {{ product.title | json }},
      "item": "{{ shop.url }}{{ product.url }}"
    }
  {%- else -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ product.title | json }},
      "item": "{{ shop.url }}{{ product.url }}"
    }
  {%- endif -%}
{%- endif -%}
```

---

## Evidence Summary

| Evidence | Location |
|---|---|
| Index-based fallback bug | `snippets/breadcrumbs.liquid` lines 22–46 |
| No fallback for ≤2 collections | `snippets/breadcrumbs.liquid` line 22 (`> 2` condition misses size 1 and 2) |
| Schema has no fallback | `sections/breadcrumb.liquid` lines 40–47 |
| Visual/schema mismatch | `sections/breadcrumb.liquid` renders `breadcrumbs` snippet + separate schema block |
| `within: collection` used correctly | `snippets/custom-product-card.liquid` L3, L35, L188, L293 |
| `within: collection` used correctly | `snippets/halloween-product-card.liquid` L3, L44, L85 |
| `within: collection` used correctly | `snippets/product-popular-list-item.liquid` L10, L25, L38 |

---

## CAPABILITY LOG
- What was built: Breadcrumb collection path root cause audit for Shopify theme
- Reusable: Yes
- If yes, where it applies: Any Shopify theme using `product.collections` array index fallback for breadcrumbs
- Pattern name: `breadcrumb-collection-fallback-index-bug`
