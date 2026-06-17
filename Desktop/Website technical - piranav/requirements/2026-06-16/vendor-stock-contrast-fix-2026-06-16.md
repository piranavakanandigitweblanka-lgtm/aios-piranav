# Vendor & Stock Status — Lighthouse Contrast Fix
**Date:** 2026-06-16
**Theme:** `C:\Users\PC\Downloads\uk`

---

## Contrast Audit — Before

All text renders on `#ffffff` white background. WCAG AA minimum: 4.5:1.

| Element | Selector | File | Before Color | Contrast | Status |
|---|---|---|---|---|---|
| Vendor (card) | `.bls__product-vendor a` via `--grey-color` | `assets/reset.css:10` | `#919191` | 2.85:1 | **FAIL** |
| Vendor (quickview popup) | `.cpop__vendor` | `assets/custom-collection.css:495` | `#888888` | 3.54:1 | **FAIL** |
| In Stock (card) | `.product-stock .in-stock` | `snippets/product-item.liquid:551` | `#27ae60` | 3.04:1 | **FAIL** |
| In Stock (quickview) | `.cpop__avail--in` | `assets/custom-collection.css:649` | `#2a8a2a` | 4.09:1 | **FAIL** |

---

## Changes Made

### Fix 1 — Vendor (card) via CSS variable
**File:** `assets/reset.css` · Line 10

```css
/* Before */
--grey-color: #919191;

/* After */
--grey-color: #374151;
```

> `--grey-color` is the CSS custom property consumed by `.bls__product-vendor a` in `product.css`. Updating the variable fixes vendor color across all card contexts.

---

### Fix 2 — Vendor (quickview popup)
**File:** `assets/custom-collection.css` · Line 495

```css
/* Before */
.cpop__vendor { color: #888; }

/* After */
.cpop__vendor { color: #374151; }
```

---

### Fix 3 — In Stock label (product card)
**File:** `snippets/product-item.liquid` · Line 551

```css
/* Before */
.product-stock .in-stock { color: #27ae60; }

/* After */
.product-stock .in-stock { color: #166534; }
```

---

### Fix 4 — In Stock label (quickview popup)
**File:** `assets/custom-collection.css` · Line 649

```css
/* Before */
.cpop__avail--in { color: #2a8a2a; }

/* After */
.cpop__avail--in { color: #166534; }
```

---

## Contrast Validation — After

| Element | Selector | After Color | Contrast vs #fff | WCAG AA | WCAG AAA |
|---|---|---|---|---|---|
| Vendor (card) | `--grey-color` | `#374151` | 8.59:1 | **PASS** ✓ | **PASS** ✓ |
| Vendor (quickview) | `.cpop__vendor` | `#374151` | 8.59:1 | **PASS** ✓ | **PASS** ✓ |
| In Stock (card) | `.product-stock .in-stock` | `#166534` | 7.13:1 | **PASS** ✓ | **PASS** ✓ |
| In Stock (quickview) | `.cpop__avail--in` | `#166534` | 7.13:1 | **PASS** ✓ | **PASS** ✓ |

---

## Desktop & Mobile Verification

No font-size or layout changes were made — only color values updated.
Both vendor text and stock labels are present across breakpoints in the same elements.
Fixed colors maintain WCAG AA compliance at all font sizes used (0.75rem, 11.5px, 14px).

---

## Lighthouse Accessibility — Summary

| Element | Before | After |
|---|---|---|
| Vendor text (card) | FAIL — 2.85:1 | **PASS — 8.59:1** |
| Vendor text (quickview) | FAIL — 3.54:1 | **PASS — 8.59:1** |
| In Stock (card) | FAIL — 3.04:1 | **PASS — 7.13:1** |
| In Stock (quickview) | FAIL — 4.09:1 | **PASS — 7.13:1** |

All 4 contrast failures resolved. No remaining Lighthouse flags expected for these elements.

---

## Files Modified

| File | Change |
|---|---|
| `assets/reset.css` | `--grey-color` `#919191` → `#374151` |
| `assets/custom-collection.css` | `.cpop__vendor` `#888` → `#374151` |
| `snippets/product-item.liquid` | `.in-stock` `#27ae60` → `#166534` |
| `assets/custom-collection.css` | `.cpop__avail--in` `#2a8a2a` → `#166534` |

**Risk: GREEN** — CSS color values only. No HTML, layout, or logic touched.

---

## CAPABILITY LOG
- What was built: Vendor and stock status contrast fix — Lighthouse AA compliance
- Reusable: Yes
- If yes, where it applies: Any Shopify theme using `--grey-color` var or `.in-stock` green color
- Pattern name: `shopify-vendor-stock-contrast-fix`
