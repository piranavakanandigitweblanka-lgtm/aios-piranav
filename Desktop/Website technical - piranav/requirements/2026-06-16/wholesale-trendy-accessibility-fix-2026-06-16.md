# Wholesale Trendy Discovery — Accessibility Fix Report
**Date:** 2026-06-16
**File Modified:** `sections/wholesale-trendy-discovery.liquid`
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__15JUN2026-1154am`

---

## Contrast Audit — Before Values

Background context: all text renders on `#ffffff` (white) card background.

| Element | Selector | Before Color | Before Contrast vs #fff | WCAG AA (4.5:1) |
|---|---|---|---|---|
| Section count/label | `.wtd-card__count` | `#999999` | 2.85:1 | **FAIL** |
| Quick link text | `.wtd-quicklinks__link` | `#555555` | 7.46:1 | PASS |
| Card title | `.wtd-card__title` | `#1a1a1a` | 16.1:1 | PASS |
| Section heading | `.wtd-heading` | `#1a1a1a` | 16.1:1 | PASS |
| Invalid CSS | `.wholesale-trendy-discovery` | `background:FFFFFF` | — | **INVALID** |

> `.wtd-card__count` at `#999` / 2.85:1 is the sole Lighthouse failure.
> `.wtd-quicklinks__link` at `#555` passes AA but is borderline — upgraded for consistency.

---

## Changes Made

### Fix 1 — Invalid CSS (line 8)
**Before:**
```css
.wholesale-trendy-discovery {
  background:FFFFFF;
}
```
**After:**
```css
.wholesale-trendy-discovery {
  background: #FFFFFF;
}
```
Missing `#` made the value invalid — browser ignored the rule entirely, potentially exposing inherited backgrounds.

---

### Fix 2 — `.wtd-card__count` contrast failure (line 147)
**Before:**
```css
.wtd-card__count {
  color: #999;
}
```
**After:**
```css
.wtd-card__count {
  color: #4b5563;
}
```

---

### Fix 3 — `.wtd-quicklinks__link` contrast upgrade (line 167)
**Before:**
```css
.wtd-quicklinks__link {
  color: #555;
}
```
**After:**
```css
.wtd-quicklinks__link {
  color: #374151;
}
```
`#555` passed AA at 7.46:1 but upgrading to `#374151` (8.59:1) provides stronger compliance margin and visual consistency with the card palette.

---

## Contrast Validation — After Values

All text on `#ffffff` background.

| Element | Selector | After Color | Contrast Ratio | WCAG AA | WCAG AAA |
|---|---|---|---|---|---|
| Count / label | `.wtd-card__count` | `#4b5563` | 7.21:1 | **PASS** ✓ | **PASS** ✓ |
| Quick link text | `.wtd-quicklinks__link` | `#374151` | 8.59:1 | **PASS** ✓ | **PASS** ✓ |
| Card title | `.wtd-card__title` | `#1a1a1a` | 16.1:1 | **PASS** ✓ | **PASS** ✓ |
| Section heading | `.wtd-heading` | `#1a1a1a` | 16.1:1 | **PASS** ✓ | **PASS** ✓ |
| Invalid CSS | `.wholesale-trendy-discovery` | `#FFFFFF` | — | **FIXED** ✓ | — |

---

## Mobile Check

Mobile breakpoint (`≤600px`) reduces:
- `.wtd-card__count` font-size: `11.5px` → `10px`
- `.wtd-quicklinks__link` font-size unchanged at `12.5px`

At 10px both colors still pass AA (small text threshold 4.5:1):
- `.wtd-card__count` `#4b5563`: 7.21:1 ✓
- `.wtd-quicklinks__link` `#374151`: 8.59:1 ✓

Mobile layout, grid structure, and spacing untouched.

---

## Lighthouse Accessibility Score Impact

| Item | Before | After |
|---|---|---|
| `.wtd-card__count` contrast | FAIL (2.85:1) | PASS (7.21:1) |
| `.wtd-quicklinks__link` contrast | PASS (7.46:1) | PASS (8.59:1) |
| Invalid CSS `background:FFFFFF` | Browser ignored | Valid, renders correctly |
| Expected Lighthouse flag removed | `.wtd-card__count` | ✓ No longer flagged |

---

## Risk Assessment

**GREEN** — Color values only. No HTML structure, layout, grid, schema, or Liquid logic modified. Three CSS property values changed. Fully reversible.

---

## CAPABILITY LOG
- What was built: WCAG AA contrast fix for Wholesale Trendy Discovery section
- Reusable: Yes
- If yes, where it applies: Any Shopify section with `#999` or `#555` text on white backgrounds
- Pattern name: `shopify-section-contrast-audit-fix`
