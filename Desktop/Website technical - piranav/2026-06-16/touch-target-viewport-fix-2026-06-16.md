# Touch Target & Viewport Zoom — Lighthouse Accessibility Fix
**Date:** 2026-06-16
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__16JUN2026-0705am`
**Lighthouse Issues Addressed:**
- "Touch targets do not have sufficient size or spacing"
- "Zooming and scaling are disabled" (viewport meta restriction)

---

## Viewport Zoom Restriction Fix

### Full-Theme Viewport Audit

| File | Line | Viewport Content | Issue? |
|---|---|---|---|
| `layout/theme.liquid` | 19 | `width=device-width,initial-scale=1` | PASS ✓ |
| `layout/theme.liquid` | 93 | `{% comment %}...user-scalable=no...{% endcomment %}` | Already commented out — PASS ✓ |
| `layout/password.liquid` | 6 | `width=device-width,initial-scale=1` | PASS ✓ |
| `templates/gift_card.liquid` | 20 | `width=device-width,initial-scale=1,maximum-scale=1` | **FAIL — FIXED** |

### Fix Applied

**File:** `templates/gift_card.liquid` · Line 20

**Before:**
```html
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
```

**After:**
```html
<meta name="viewport" content="width=device-width,initial-scale=1">
```

**Why `maximum-scale=1` fails:** WCAG 1.4.4 (Resize Text) requires users can zoom text to 200% without loss of content. `maximum-scale=1` caps zoom at 1× on iOS Safari — pinch-to-zoom is completely blocked. Lighthouse flags this as a critical accessibility failure.

---

## Touch Target Fix — Swiper Pagination Bullets

### Touch Target Audit

| File | Lines | Bullet Size | Issue? |
|---|---|---|---|
| `assets/base.css` | 4203–4231 | 44×44px (transparent wrapper + `::before` visual) | PASS ✓ |
| `sections/piranav-promo.liquid` | 302–316 | 10×10px bare | **FAIL — FIXED** |
| `sections/piranav-promo.liquid` | 1147–1161 | 10×10px bare (identical to above) | **FAIL — FIXED** |

### Root Cause

`piranav-promo.liquid` declared `.swiper-pagination-bullet` with `width: 10px; height: 10px` directly. This overrides the accessible 44×44px implementation already present in `assets/base.css`. The bare 10px bullet is smaller than the WCAG 2.5.5 minimum of 44×44px — users on mobile struggle to tap small dots precisely.

### Fix Applied (both instances — lines 302 and 1147)

**Before:**
```css
.swiper-pagination-bullet {
  width: 10px;
  height: 10px;
  background: #ddd;
  opacity: 0.8;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.swiper-pagination-bullet-active {
  background: #0b1a39;
  opacity: 1;
  width: 24px;
}
```

**After:**
```css
.swiper-pagination-bullet {
  width: 44px !important;
  height: 44px !important;
  background: transparent !important;
  opacity: 1;
  border-radius: 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.swiper-pagination-bullet::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background: #ddd;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.swiper-pagination-bullet-active::before {
  background: #0b1a39;
  opacity: 1;
  width: 24px;
}
```

**Pattern explained:** The bullet element itself becomes an invisible 44×44px touch zone. The `::before` pseudo-element renders the visible dot (10px default → 24px pill when active) centered inside the touch zone. Visual appearance is identical to before; tap area expands to WCAG minimum.

### Why `!important` is needed

`base.css` already sets `width: 44px !important` on `.swiper-pagination-bullet`. The piranav-promo inline `<style>` block loads after `base.css` in the cascade, so without `!important` the local 10px would still win. Using `!important` matches the established pattern in `base.css`.

---

## Files Modified

| File | Change |
|---|---|
| `templates/gift_card.liquid` · line 20 | Removed `maximum-scale=1` from viewport meta |
| `sections/piranav-promo.liquid` · lines 302–316 | Replaced bare 10px bullet with 44px touch target + `::before` visual |
| `sections/piranav-promo.liquid` · lines 1147–1161 | Same fix — identical second instance |

**Files NOT modified (already passing):**
- `layout/theme.liquid` — viewport already correct
- `layout/password.liquid` — viewport already correct
- `assets/base.css` — already has correct 44px touch target

---

## Risk Assessment

**GREEN** — No layout changes, no logic changes, no color changes.
- Gift card page: viewport change only re-enables pinch-to-zoom — no visual impact
- Swiper bullets: visual dot size unchanged (10px/24px pill); only the invisible tap zone enlarged

---

## CAPABILITY LOG
- What was built: Viewport zoom fix + Swiper touch target expansion for Lighthouse Accessibility
- Reusable: Yes
- If yes, where it applies: Any Shopify theme with `maximum-scale` viewport restriction or small Swiper pagination bullets
- Pattern name: `lighthouse-touch-target-viewport-fix`
