# Search Results Product Grid — Fix Report

**Date:** 2026-06-22
**Store:** LEDsone / Electricalsone
**Status:** Implementation complete + post-deploy fix applied
**Risk level:** AMBER (search page only — no changes to product-card.liquid or collection pages)

---

## Files Changed

| File | Change Type |
|---|---|
| `snippets/search-product-card.liquid` | NEW — clean card snippet for search results |
| `assets/product-card.css` | APPENDED — all srp- namespaced styles at bottom |
| `sections/main-search.liquid` | MODIFIED — grid shell, schema default, aria-labels |

**Not modified:** `snippets/product-card.liquid`, `assets/template-collection.css`

---

## Changes Made

### 1. New snippet: `snippets/search-product-card.liquid`

Purpose: Clean, accessible card rendered exclusively on the search results page.

**Card structure (top to bottom):**
```
article.srp-card
  a.srp-card__media-link (aria-hidden, tabindex=-1)
    div.srp-card__media (aspect-ratio: 1/1)
      img (srcset 200/400/600w, lazy, alt fallback to product title)
      span.srp-card__badge (sale badge, always visible)
  div.srp-card__body
    h3.srp-card__title (2-line clamp)
      a (title link, keyboard accessible)
    div.srp-card__footer (margin-top: auto)
      div.srp-card__price (sale price + strikethrough compare)
      div.srp-card__stock (In Stock / Out of Stock)
      product-form > button.srp-card__atc (always visible ATC)
      — OR —
      a.srp-card__atc--options (Select options, links to PDP)
```

**Accessibility features:**
- `article` with `aria-label="{{ product.title }}"` — announces product name to screen readers
- ATC button `aria-label` includes product title: `"Add to cart: [Product Name]"`
- Image `alt` falls back to `product.title` if image alt is blank
- Media link hidden from AT (`aria-hidden="true"`) — title `<a>` is the primary link
- `focus-visible` outline on title link and ATC button

### 2. `assets/product-card.css` — appended (lines 516+)

New CSS block: `/* SEARCH RESULTS PRODUCT GRID (SRP) */`

| Rule | Purpose |
|---|---|
| `.srp-grid` | CSS Grid: 2 col → 3 col → 4 col (mobile-first) |
| `.grid-col-N .srp-grid` | Column switcher override (desktop only) |
| `.srp-grid .mb-30` | Suppresses legacy margin-bottom on article/page cards inside grid |
| `.srp-card__media { aspect-ratio: 1/1 }` | Fixed image ratio — eliminates CLS |
| `.srp-card__title { -webkit-line-clamp: 2 }` | 2-line clamp + min-height — rows stay aligned |
| `.srp-card__footer { margin-top: auto }` | Footer always pinned to card bottom |
| `.srp-card__atc` | Always-visible solid button (not hover-only) |
| `.srp-card__atc:disabled` | Greyed-out state for sold-out products |
| `.srp-card__atc--options` | Ghost-button variant for multi-variant products |
| `.srp-card__stock--in / --out` | Green/grey stock indicators |

### 3. `sections/main-search.liquid` — 5 targeted edits

| Line (before edit) | Change |
|---|---|
| 523 | `.row.row-cols-lg-*` → `div.srp-grid` |
| 525 | `div.col` → `div.srp-grid__item` |
| 527-542 | `render 'product-card'` (13 params) → `render 'search-product-card'` (1 param) |
| 444 | `aria-label="Product column button"` → `"View 2 columns"` |
| 446 | `aria-label="Product column button"` → `"View 3 columns"` |
| 448 | `aria-label="Product column button"` → `"View 4 columns"` |
| 629 | Schema `"default": "3"` → `"default": "4"` |

---

## Issues Resolved vs Assessment

| Assessment Issue | Status |
|---|---|
| Grid uses Bootstrap flex rows, not CSS Grid | ✅ Fixed — replaced with CSS Grid |
| Default desktop columns = 3, not 4 | ✅ Fixed — schema default now "4" |
| No `aspect-ratio` on image container | ✅ Fixed — `aspect-ratio: 1/1` on `.srp-card__media` |
| Title has no 2-line clamp | ✅ Fixed — `-webkit-line-clamp: 2` + `min-height` |
| No `margin-top: auto` on footer | ✅ Fixed |
| ATC hidden behind hover overlay | ✅ Fixed — always-visible solid button |
| Product title disappears on hover | ✅ Fixed — no `.product__card:hover` rules in new snippet |
| No stock status on card | ✅ Fixed — `product.available` check in snippet |
| ATC has no product-specific aria-label | ✅ Fixed — includes `product.title` in label |
| Hover-only ATC unreachable by keyboard | ✅ Fixed |
| Column switcher buttons share identical aria-label | ✅ Fixed — "View 2/3/4 columns" |
| Image alt may be blank | ✅ Fixed — `| default: product.title` fallback |
| Sale badge hidden at <479px | ✅ Not carried into new snippet — badge always renders |
| ~960 hidden DOM nodes (list-view content) | ✅ Not carried into new snippet — no hidden list-view DOM |

---

## What Was NOT Changed

| Item | Reason |
|---|---|
| `snippets/product-card.liquid` | Shared across all collection/product pages — no changes to avoid regression |
| `assets/template-collection.css` | Grid framework is independent — not needed |
| Duplicate inline CSS in `main-search.liquid` | Low risk/low reward — deferred to future cleanup task |
| Column switcher JS (`offcanvas-filter-active.js`) | The `.grid-col-*` ancestor class mechanism is unchanged — JS still adds these classes, CSS Grid responds to them |

---

## Column Switcher Compatibility

The existing JS adds `.grid-col-2/3/4` to an ancestor element of the grid. The new CSS responds to this:

```css
@media (min-width: 990px) {
  .grid-col-2 .srp-grid { grid-template-columns: repeat(2, 1fr); }
  .grid-col-3 .srp-grid { grid-template-columns: repeat(3, 1fr); }
  .grid-col-4 .srp-grid { grid-template-columns: repeat(4, 1fr); }
}
```

The old Bootstrap `row-cols-lg-*` classes on the grid container were not used by any other CSS in the new snippet — removing them has no side effect.

---

## Validation Results

| Test | Result | Notes |
|---|---|---|
| Liquid syntax | ✅ PASS | No unclosed tags. Standard Shopify objects only (`product.*`, `variant.*`) |
| ATC form | ✅ PASS | `action="/cart/add"`, `name="id"`, `data-type="add-to-cart-form"` — matches theme's product-form.js expectations |
| Multi-variant fallback | ✅ PASS | `product.has_only_default_variant` check — routes to `/products/[handle]` for products with options |
| `product-form` custom element | ✅ PASS | Already defined in theme (used by existing product-card.liquid) |
| Image filter | ✅ PASS | `image_url: width:` is the current non-deprecated Shopify image filter |
| CSS Grid browser support | ✅ PASS | Chrome 57+, Firefox 52+, Safari 10.1+ — full support |
| `aspect-ratio` support | ✅ PASS | Chrome 88+, Firefox 89+, Safari 15+ — >97% global coverage |
| `-webkit-line-clamp` | ✅ PASS | Universal modern browser support |
| Mobile ATC | ✅ PASS | Always-visible — no hover dependency |
| WCAG ATC keyboard | ✅ PASS | `focus-visible` outline on button; not disabled for in-stock products |

---

## Estimated Impact

| Area | Before | After |
|---|---|---|
| Mobile Add to Cart | Hidden (hover only) | Always visible — solid button |
| Desktop default columns | 3 | 4 |
| Card height consistency | Variable (no ratio, no clamp) | Equal (aspect-ratio + line-clamp + margin-top auto) |
| ATC accessibility | No product context in label | "Add to cart: [Product Name]" |
| Column switcher labels | All "Product column button" | "View 2/3/4 columns" |
| Stock visibility | Not shown | In/Out of Stock on every card |
| DOM per card (old hidden list view) | ~60 extra nodes | 0 |

---

## Post-Deploy Fix (same session)

### Issue: `Translation missing: en.products.product.choose_options`

**Root cause:** The snippet used `'products.product.choose_options' | t` for the multi-variant button. This key does not exist in `locales/en.default.json`.

**Discovery:** Theme locale has `select_options` (value: `"+ Quick shop"`) but not `choose_options`.

**Fix applied:** `snippets/search-product-card.liquid` — both occurrences replaced:

```liquid
/* BEFORE */
{{ 'products.product.choose_options' | t }}

/* AFTER */
{{ 'products.product.select_options' | t }}
```

`replace_all: true` — updated the `aria-label` and the button text in one pass.

**Behaviour clarification:** ATC button showing on some products and not others is **correct by design** — single-variant products (`has_only_default_variant: true`) go straight to cart; multi-variant products link to the PDP so the customer can select their variant first.

---

## Capability Log

- **What was built:** Full search results product grid redesign — new snippet + CSS + section edits
- **Namespace:** `srp-` (Search Results Page) — safe to reuse on other search implementations
- **Pattern reuse:** The `srp-card` and `srp-grid` pattern can be ported to a custom search results section with zero conflict against the main collection grid
- **Pattern name:** `srp-grid-2026`
