# Search Results Product Grid — Assessment & Implementation Plan

**Date:** 2026-06-22
**Store:** LEDsone / Electricalsone
**Status:** Assessment only — no code changed

---

## Files Audited

| File | Role |
|---|---|
| `sections/main-search.liquid` | Search page wrapper, grid shell, column logic, CSS assets |
| `snippets/product-card.liquid` | Individual card HTML structure and Liquid logic |
| `assets/product-card.css` | Card styles, action buttons, hover states |
| `assets/template-collection.css` | Grid layout, filter bar, facets, column breakpoints |

---

## UI/UX Weaknesses Found

### A — Grid Architecture (HIGH)

| Issue | Evidence | Impact |
|---|---|---|
| Grid uses Bootstrap flex rows, not CSS Grid | `row row-cols-lg-4 row-cols-md-3 row-cols-2` — main-search.liquid:523 | Cannot guarantee equal card heights; CLS risk |
| Default desktop columns set to 3, not 4 | Schema `"default": "3"` — main-search.liquid:629 | Wrong out of the box |
| Column count duplicated across two systems | `grid-col-*` in template-collection.css + `row-cols-*` in liquid | Redundant, hard to maintain |
| `grid-col-5` exists in CSS but not in schema | Dead CSS | Unnecessary bytes |

### B — Card Height Consistency (HIGH)

| Issue | Evidence | Impact |
|---|---|---|
| Image height is `adapt` with no fixed ratio | product-card.css:39 — `height: 100%` | Cards at different heights destroy row alignment |
| No `aspect-ratio` on image container | product-card.css — no aspect-ratio rule | CLS when images load at different ratios |
| Title has no 2-line clamp | product-card.css:82 — no `-webkit-line-clamp` | Long titles push price/button to different Y positions |
| No `margin-top: auto` on footer section | product-card.liquid:135–274 | Price and button at inconsistent vertical positions |

### C — Add to Cart Button (CRITICAL)

| Issue | Evidence | Impact |
|---|---|---|
| ATC button hidden behind hover overlay | `.product__cart--wrapper { opacity: 0; visibility: hidden }` — product-card.css:474 | **No Add to Cart on mobile/touch** |
| Product title disappears on hover | `.product__card:hover .product__card__title { opacity: 0 }` — product-card.css:490 | Users lose product context |
| ATC has no background or solid styling | product-card.css:448 — `background: none; border: none` | Invisible against grey background on hover |
| HTML order: ATC coded before title | product-card.liquid:142 vs 170 | Wrong semantic order for screen readers |

### D — Missing Elements (MEDIUM)

| Issue | Evidence | Impact |
|---|---|---|
| No stock status on card | Not passed in search render call — main-search.liquid:529 | No In/Out of Stock indicator |
| `inventory_status` bar enabled but not passed | product-card.liquid:259 — not called in search | Dead code in DOM |

### E — Performance (MEDIUM)

| Issue | Evidence | Impact |
|---|---|---|
| ~120 lines duplicate CSS | Rules in both main-search.liquid inline style and template-collection.css | Extra CSS payload |
| Large inline SVG in hidden list view | product-card.liquid:226–233 | 60+ extra DOM nodes per card |
| `product__list_view_content` always renders hidden | product-card.liquid:201–257 | ~960 hidden DOM nodes at 16 cards per page |

### F — Accessibility (MEDIUM)

| Issue | Evidence | Impact |
|---|---|---|
| ATC button has no product-specific aria-label | product-card.liquid:149 | Screen readers say "Add to cart" with no product context |
| Hover-only ATC unreachable by keyboard | product-card.css:474 | WCAG 2.1 Level A failure |
| Column switcher buttons share identical aria-label | main-search.liquid:444–448 | Indistinct for screen readers |
| Image alt may be blank | product-card.liquid via product-card-media | No alt fallback |

### G — Mobile (MEDIUM)

| Issue | Evidence | Impact |
|---|---|---|
| ATC completely invisible on mobile | Hover overlay never triggers on touch | Can't add to cart from search results |
| Badge hidden at < 479px | `span.sale__text { display: none }` — product-card.css:153 | Removes conversion signal on smallest screens |
| Title at 1.6rem on mobile in 2-column grid | product-card.css:100 | Readability issue |

---

## Proposed Card Structure

```
.search-product-card
  .search-product-card__media        ← aspect-ratio: 1/1 box
    img                              ← lazy, srcset, alt fallback
    .search-product-card__badge      ← absolute, always visible
  .search-product-card__body         ← flex-grow
    h3.search-product-card__title    ← 2-line clamp, fixed min-height
    .search-product-card__footer     ← margin-top: auto
      .search-product-card__price
      .search-product-card__stock    ← In/Out of Stock
      button.search-product-card__atc ← always visible, solid
```

---

## Grid CSS Plan

```css
/* Mobile-first */
.search-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .search-product-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}
@media (min-width: 990px) {
  .search-product-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
}
```

---

## Key CSS Fixes

| Rule | Change |
|---|---|
| `.search-product-card__media` | Add `aspect-ratio: 1/1` |
| `.search-product-card__title` | Add `-webkit-line-clamp: 2` + `min-height` |
| `.search-product-card__footer` | Add `margin-top: auto` |
| `.product__cart--wrapper` | Remove hover overlay entirely |
| `.product__card:hover .product__card__title` | Remove opacity:0 rule |
| `.search-product-card__atc` | Solid background, always visible, full-width |
| `span.sale__text` | Remove display:none at <479px |

---

## Estimated Conversion Impact

| Area | Change | Estimated Lift |
|---|---|---|
| Mobile ATC | Hidden → always visible | +15–25% mobile add-to-cart |
| Card consistency | CSS Grid + aspect-ratio + line-clamp | +10–15% perceived quality |
| Stock status | Not shown → always shown | Fewer wasted PDP clicks |
| 4-col desktop | More products visible above fold | Higher discovery rate |
| Sale badge | Hidden on mobile → always visible | Maintains promotional conversion |
| Accessibility | Keyboard-accessible ATC | Broader audience coverage |

---

## Implementation Scope

| Component | Action | File |
|---|---|---|
| Grid shell | Replace Bootstrap row/col with CSS Grid | sections/main-search.liquid |
| Schema default | Change `product_column` default to `"4"` | sections/main-search.liquid |
| Card HTML order | Reorder: image → title → price → stock → ATC | snippets/product-card.liquid |
| ATC button | Remove hover overlay; static full-width button | product-card.liquid + product-card.css |
| Image ratio | `aspect-ratio: 1/1` on media wrapper | assets/product-card.css |
| Title clamp | `-webkit-line-clamp: 2` + fixed min-height | assets/product-card.css |
| Stock status | `product.available` check in card body | snippets/product-card.liquid |
| Sale badge mobile | Remove hide rule at <479px | assets/product-card.css |
| ATC aria-label | Include product title in label | snippets/product-card.liquid |
| Column switcher labels | Descriptive aria-label per button | sections/main-search.liquid |
| Duplicate CSS | Remove inline style rules that duplicate template-collection.css | sections/main-search.liquid |

---

## Capability Log

- **What was built:** Full UI/UX audit of search results product grid
- **Reusable:** Yes — same audit applies to `main-collection-product-grid.liquid`
- **Pattern name:** `search-grid-2026-audit`
