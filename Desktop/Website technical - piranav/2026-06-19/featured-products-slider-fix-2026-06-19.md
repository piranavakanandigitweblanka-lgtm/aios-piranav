# Featured Products Slider — Card Height & Title Clamp Fix
**Date:** 2026-06-19
**File modified:** `sections/featured-products-slider.liquid`
**Theme:** `theme_export__electricalsone-co-uk-back-up-of-electricalsone-2-0__18JUN2026-0512am`
**Local file:** `C:\Users\PC\Downloads\featured-products-slider.liquid`

---

## Changes Made

| Property | Before | After | Reason |
|---|---|---|---|
| `.fps-product-card` padding | `16px` | `10px` | Reduce overall card height |
| `.fps-product-card` gap | `15px` | `10px` | Tighten image-to-info spacing |
| Mobile card padding | `12px` | `8px` | Consistent compact look on mobile |
| `.fps-product-title` margin-bottom | `6px` | `4px` | Reduce vertical spacing below title |
| `.fps-product-title` max-height | none | `calc(13px * 1.4 * 2)` | Hard cap at exactly 2 lines |
| `.fps-product-title` min-height | none | `0` | Prevents flex from stretching past clamp |
| `.fps-sku` margin-bottom | `12px` | `6px` | Reduce gap between SKU and price |
| `.fps-price-wrapper` margin-bottom | `14px` | `8px` | Reduce gap between price and ATC button |
| `.fps-card-info` min-height | none | `0` | Enables `-webkit-line-clamp` to fire correctly inside flex column |
| `.fps-card-info` min-width | none | `0` | Prevents flex overflow on narrow cards |

---

## Why Title Clamp Was Not Working

`.fps-product-title` already had `-webkit-line-clamp: 2` but the card grew taller than expected because:
- `.fps-card-info` (the flex column parent) had no `min-height: 0` — flex children default to `min-height: auto`, which prevents `overflow: hidden` from clipping content
- No `max-height` fallback — without it, some browsers ignore `line-clamp` in certain flex contexts

Both are now fixed.

---

## How to Deploy

1. Open Shopify Admin → Online Store → Themes → Edit code
2. Navigate to `sections/featured-products-slider.liquid`
3. Replace with the updated file from `C:\Users\PC\Downloads\featured-products-slider.liquid`
4. Save — no theme editor settings need to change

---

## Risk
GREEN — CSS-only changes, no Liquid logic touched, no schema changes, no JS changes.
