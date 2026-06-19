# blueskytechco.woff — Unused Font Preload Fix
**Date:** 2026-06-16
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__16JUN2026-0705am`
**Lighthouse Warning:** "The resource was preloaded using link preload but not used within a few seconds from the window's load event"

---

## Files Inspected

| File | Relevance |
|---|---|
| `layout/theme.liquid` | Contains the preload tag (line 222) |
| `assets/vendor.css` | Contains the `@font-face` declaration (lines 470–481) |
| `assets/define-custom-font.css` | Secondary `@font-face` (ttf only) |
| `assets/reset.css` | Defines `--font-icon: "blueskytechco"` CSS variable |
| `assets/base.css` | Consumes font via `--font-icon` variable (4 locations) |
| `assets/collection.css` | Consumes font (3 locations) |
| `assets/product.css`, `product-details.css`, `popup.css`, `wishlist.css`, `instagram.css` | All consume font |

---

## Font Preload Inventory

| Font | Preload File | Preload Line | Preload URL | @font-face URL | Match? |
|---|---|---|---|---|---|
| `blueskytechco` | `layout/theme.liquid` | 222 | `blueskytechco.woff` (bare) | `blueskytechco.woff?s9sn20` (versioned) | **NO — mismatch** |
| Body font | `snippets/head-assets.liquid` | 22 | `{{ fnt_body_sp | font_url }}` | Shopify font API | SAFE |
| Heading font | `snippets/head-assets.liquid` | 25 | `{{ fnt_headings_sp | font_url }}` | Shopify font API | SAFE |
| Menu font | `snippets/head-assets.liquid` | 28 | `{{ fnt_menu_sp | font_url }}` | Shopify font API | SAFE |

---

## Root Cause

### URL Mismatch

**Preload tag (theme.liquid:222):**
```html
<link rel="preload" href="{{ 'blueskytechco.woff' | asset_url }}" as="font" type="font/woff" crossorigin>
```
Resolves to: `cdn.shopify.com/.../blueskytechco.woff`

**@font-face declaration (vendor.css:475):**
```css
url('blueskytechco.woff?s9sn20') format('woff')
```
Resolves to: `cdn.shopify.com/.../blueskytechco.woff?s9sn20`

The browser treats these as **two distinct URLs**. The preloaded resource (`/blueskytechco.woff`) is never consumed — the browser downloads the versioned URL (`/blueskytechco.woff?s9sn20`) via the `@font-face` rule instead. Lighthouse flags the bare preload as unused.

### Font Is Not Above-the-Fold Critical

`blueskytechco` is a **custom icon font** — it renders UI icons via CSS classes (`[class^="icon-"]`). It is:
- Not body text
- Not heading text
- Not visible in the first paint without user interaction (icons appear in buttons, hover states, menus)

Icon fonts do not need preloading. The font loads correctly through `vendor.css` without any preload.

### @font-face Has No woff2

The `@font-face` in `vendor.css` declares: `.eot`, `.ttf`, `.woff`, `.svg` — **no `.woff2`**. Modern browsers (Chrome, Firefox, Safari) prefer `.woff2` and may not even load `.woff` at all. Preloading `.woff` is therefore doubly ineffective on modern browsers.

---

## Is the Font Actually Used?

**Yes** — `blueskytechco` is actively used across the theme:

| File | Usage |
|---|---|
| `assets/reset.css` | `--font-icon: "blueskytechco"` (CSS variable definition) |
| `assets/base.css` | 4 selectors consuming `--font-icon` |
| `assets/collection.css` | 3 selectors |
| `assets/product.css` | 1 selector |
| `assets/product-details.css` | 1 selector |
| `assets/popup.css` | 1 selector |
| `assets/wishlist.css` | 1 selector |
| `assets/instagram.css` | 1 selector |
| `assets/vendor.css` | Icon class definitions |

The font is used — but it loads correctly via `vendor.css` `@font-face`. The preload is the problem, not the font.

---

## Duplicate Font Loading Check

`vendor.css` and `define-custom-font.css` both declare `@font-face` for `blueskytechco`:

- `vendor.css:470` — full stack: `.eot`, `.ttf`, `.woff`, `.svg`
- `define-custom-font.css:69` — `.ttf` only

Both declare the same family name. The browser deduplicates by family name so this is redundant but not harmful. No action required unless CSS bundle size is a concern.

---

## Fix Applied

**File:** `layout/theme.liquid` · Line 222

**Before:**
```html
<link rel="preload" href="{{ 'blueskytechco.woff' | asset_url }}" as="font" type="font/woff" crossorigin>
```

**After:**
```html
<!-- blueskytechco.woff preload removed: @font-face loads versioned URL (woff?s9sn20) — bare preload URL never matched, causing Lighthouse unused-preload warning -->
```

---

## Full Font Preload Audit Result

| Font | File | Preloaded | Used | Above Fold | Recommendation |
|---|---|---|---|---|---|
| `blueskytechco.woff` | `layout/theme.liquid:222` | Yes | No (URL mismatch) | No (icon font) | **REMOVED** ✓ |
| Body font (woff2) | `snippets/head-assets.liquid:22` | Yes | Yes | Yes | Keep |
| Heading font (woff2) | `snippets/head-assets.liquid:25` | Yes | Yes | Yes | Keep |
| Menu font (woff2) | `snippets/head-assets.liquid:28` | Yes | Yes | Yes | Keep |

---

## Risk Assessment

**GREEN** — One `<link>` tag removed. The font continues to load via `vendor.css` `@font-face` exactly as before. No visual change. No icon will disappear. The only effect is eliminating the wasted preload network request.

---

## Optional Future Improvement (Not Applied)

If icon font preloading is desired in future, the correct approach would be:
1. Add `.woff2` format to the `@font-face` in `vendor.css`
2. Preload the `.woff2` using the same versioned URL pattern as the `@font-face` src
3. Use `crossorigin="anonymous"` (not bare `crossorigin`)

---

## CAPABILITY LOG
- What was built: Unused font preload investigation and removal
- Reusable: Yes
- If yes, where it applies: Any Shopify theme with preload URL not matching @font-face src URL
- Pattern name: `shopify-font-preload-url-mismatch-fix`
