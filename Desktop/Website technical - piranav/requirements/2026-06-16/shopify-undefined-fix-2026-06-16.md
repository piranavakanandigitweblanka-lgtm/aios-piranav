# Shopify is not defined — Lighthouse Fix
**Date:** 2026-06-16
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__16JUN2026-0705am`

---

## Global Search Results — All `Shopify.` References

| File | Line | Pattern | Safe? |
|---|---|---|---|
| `layout/theme.liquid` | 78 | `if (Shopify.designMode)` | **UNSAFE** — fixed |
| `layout/password.liquid` | 27 | `if (Shopify.designMode)` | **UNSAFE** — fixed |
| `templates/gift_card.liquid` | 40 | `if (Shopify.designMode)` | **UNSAFE** — fixed |
| `sections/ss-counter.liquid` | 366 | `if (Shopify.designMode)` | **UNSAFE** — fixed |
| `snippets/cart-script.mczr.liquid` | 440 | `!!window.Shopify.currency?.rate` | **UNSAFE** — fixed |
| `sections/custom-collection.liquid` | 208–209 | `window.Shopify && window.Shopify.formatMoney` | SAFE — already guarded |
| `layout/theme.liquid` | 266 | `typeof Shopify !== 'undefined' && Shopify.PaymentButton` | SAFE — already guarded |
| `layout/theme.liquid` | 274, 276, 279 | Inside guarded block | SAFE — inside typeof guard |
| `sections/product-image-switch-grid.liquid` | 1274 | `window.Shopify && window.Shopify.theme` | SAFE — already guarded |
| `sections/main-addresses.liquid` | 188, 347, 372 | `Shopify.CustomerAddress` (definition + inline onclick) | SAFE — defined in same script block, runs on customer account pages only |

---

## Fixes Applied

### Fix 1 — `layout/theme.liquid` · Line 78
**Before:**
```js
if (Shopify.designMode) {
  document.documentElement.classList.add('shopify-design-mode');
}
```
**After:**
```js
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.documentElement.classList.add('shopify-design-mode');
}
```

---

### Fix 2 — `layout/password.liquid` · Line 27
**Before:**
```js
if (Shopify.designMode) {
  document.documentElement.classList.add('shopify-design-mode');
}
```
**After:**
```js
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.documentElement.classList.add('shopify-design-mode');
}
```

---

### Fix 3 — `templates/gift_card.liquid` · Line 40
**Before:**
```js
if (Shopify.designMode) {
    document.documentElement.classList.add('shopify-design-mode');
}
```
**After:**
```js
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.documentElement.classList.add('shopify-design-mode');
}
```

---

### Fix 4 — `sections/ss-counter.liquid` · Line 366
**Before:**
```js
if (Shopify.designMode) {
   document.addEventListener('shopify:section:unload', initCounter);
   document.addEventListener('shopify:section:load', initCounter);
}
```
**After:**
```js
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
   document.addEventListener('shopify:section:unload', initCounter);
   document.addEventListener('shopify:section:load', initCounter);
}
```

---

### Fix 5 — `snippets/cart-script.mczr.liquid` · Line 440
**Before:**
```js
const currencyRate = !!window.Shopify.currency?.rate ? Number(window.Shopify.currency?.rate) : 1;
```
**After:**
```js
const currencyRate = (window.Shopify && window.Shopify.currency?.rate) ? Number(window.Shopify.currency?.rate) : 1;
```
> `!!window.Shopify.currency?.rate` throws if `window.Shopify` is undefined — optional chaining (`?.`) only protects `.currency.rate`, not the top-level `window.Shopify` access.

---

## Runtime Safety Verification

| Scenario | Before fix | After fix |
|---|---|---|
| Lighthouse audit (Shopify object absent) | `ReferenceError: Shopify is not defined` | No error — guard short-circuits |
| Storefront (Shopify object present) | Works | Works — guard passes through |
| Theme editor (designMode = true) | Works | Works — guard passes through |
| Gift card page (standalone) | `ReferenceError` | No error |
| Password page | `ReferenceError` | No error |
| Cart with currency conversion | `TypeError` if Shopify absent | Defaults to rate `1` |

---

## Files Modified

| File | Lines Changed |
|---|---|
| `layout/theme.liquid` | 78 |
| `layout/password.liquid` | 27 |
| `templates/gift_card.liquid` | 40 |
| `sections/ss-counter.liquid` | 366 |
| `snippets/cart-script.mczr.liquid` | 440 |

**Risk: GREEN** — Guards added only. No logic, functionality, or output changed. Behaviour in Shopify storefront/editor is identical to before.

---

## CAPABILITY LOG
- What was built: Guard fix for `Shopify is not defined` ReferenceError across theme
- Reusable: Yes
- If yes, where it applies: Any Shopify theme with bare `Shopify.designMode` references
- Pattern name: `shopify-undefined-guard-fix`
