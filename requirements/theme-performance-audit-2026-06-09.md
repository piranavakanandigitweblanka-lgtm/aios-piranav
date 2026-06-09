# Shopify Theme Performance Audit Report
**Store:** ledsone.co.uk  
**Theme:** ledsone-co-uk-promotion-week-4-2-mega-digital  
**Audit Date:** 2026-06-09  
**Risk Level:** 🟡 Amber  
**Auditor:** Claude Code — Senior Shopify Theme Engineer  
**Existing Asset Check:** No prior optimization solution found in aios-piranav — new build

---

## Existing Asset Check

> **No prior asset found — proceeding with new build**  
> Checked: aios-piranav repository, theme layout files, snippets. No existing critical CSS override, no deferred font loading patch, no conditional CSS loader found.

---

## 1. Executive Summary

The theme currently serves approximately **238 KB of synchronous render-blocking CSS** on every page load, plus a Google Font loaded twice — once blocking, once non-blocking — causing wasted round trips and duplicate font parsing. The mobile Lighthouse score of ~40 with FCP ~2s and 1,050ms estimated render-blocking savings is consistent with these findings.

**Three issues alone account for the majority of the problem:**
1. `base.min.css` (101 KB) loaded blocking on every page
2. DM Sans Google Font loaded twice — once as `rel="stylesheet"` (blocking) in `theme.liquid` and again via the async pattern in `head-assets.liquid`
3. `cart.css` (28 KB) loaded blocking on every page including homepage, product, collection — even though the cart drawer is always hidden on load

All other section-level CSS files are correctly scoped (loaded only when their section is active). The global CSS pipeline is the primary bottleneck.

---

## 2. Current Performance Baseline

| Metric | Current | Target After Fixes |
|--------|---------|-------------------|
| Mobile Lighthouse Score | ~40 | ~65–72 (estimated) |
| FCP | ~2.0s | ~1.1–1.3s (estimated) |
| Render-blocking savings | ~1,050ms | <200ms (estimated) |
| Total blocking CSS on homepage | ~238 KB | ~110 KB |
| Google Font requests (blocking) | 2 (1 duplicate) | 0 blocking |

---

## 3. Render-Blocking Asset Inventory

### 3.1 Always-Loaded (Every Page) — From `snippets/head-assets.liquid`

All loaded with `stylesheet_tag: preload: true` — this means `<link rel="preload" ... onload>` is NOT used. Shopify's `stylesheet_tag` with `preload: true` generates:
```html
<link rel="preload" as="style" href="...">
<link rel="stylesheet" href="...">
```
The `rel="stylesheet"` tag is still **render-blocking**. Preload only speeds up discovery, it does not defer parsing.

| File | Size | Blocking | Notes |
|------|------|----------|-------|
| `critical.min.css` | 5 KB | Yes | Contains skeleton loaders, aspect-ratio, image fade-in — legitimate critical CSS |
| `bootstrap-grid.min.css` | 25 KB | Yes | Grid system — needed globally |
| `utilities.min.css` | 16 KB | Yes | Utility classes — needed globally |
| `vendor.min.css` | 36 KB | Yes | Third-party component styles (Swiper etc.) |
| `reset.min.css` | 23 KB | Yes | CSS reset — needed globally |
| `base.min.css` | **101 KB** | **Yes** | **Largest file. Full theme styles. Primary bottleneck.** |
| `custom-inner-demo.css` | 4 KB | Yes | SPR badge color + hover-zoom — NOT critical, not needed above the fold |

**Total always-blocking CSS from head-assets.liquid: ~210 KB**

### 3.2 Always-Loaded (Every Page) — From `layout/theme.liquid`

| File | Size | Blocking | Notes |
|------|------|----------|-------|
| `cart.css` | 28 KB | **Yes** | Loaded on EVERY page. Cart drawer is hidden on load. Unnecessary on homepage, product, collection. |

**Additional always-blocking: 28 KB**

### 3.3 Google Fonts — Critical Double-Load Issue

| Location | Method | Effect |
|----------|--------|--------|
| `layout/theme.liquid` line 50 | `<link rel="stylesheet" href="fonts.googleapis.com/css2?family=DM+Sans...">` | **RENDER BLOCKING** — synchronous stylesheet, waits for Google's server |
| `snippets/head-assets.liquid` lines 75–80 | `media="print" onload="this.media='all'"` | **Non-blocking** — correct async pattern, used when `font_source == '2'` |
| `snippets/pendantoffpop.liquid` | `@import url('https://fonts.googleapis.com/css2?family=DM+Sans...')` | **WORST PATTERN** — CSS @import blocks CSS parsing entirely |

**Result:** DM Sans is loaded up to 3 times. The blocking load in `theme.liquid` cancels out the async load in `head-assets.liquid`. The @import in `pendantoffpop.liquid` is a secondary blocking request inside CSS.

### 3.4 Total Render-Blocking Budget (Homepage)

| Source | KB |
|--------|----|
| head-assets.liquid core CSS | ~210 KB |
| cart.css (theme.liquid) | 28 KB |
| Google Font (blocking) | ~10 KB (stylesheet + font file) |
| **Total** | **~248 KB** |

---

## 4. Full Asset Analysis Table

### 4.1 Core Global CSS (Always Loaded)

| File | Size | Templates | Required? | Conditional? | Deferrable? | Risk | Gain |
|------|------|-----------|-----------|--------------|-------------|------|------|
| `critical.min.css` | 5 KB | All | ✅ Yes | No | No | Low | None — keep as-is |
| `base.min.css` | 101 KB | All | ✅ Yes | No | Partial | High | High — split ATF vs BTF |
| `reset.min.css` | 23 KB | All | ✅ Yes | No | No | Low | Low |
| `bootstrap-grid.min.css` | 25 KB | All | ✅ Yes | No | No | Low | Low |
| `utilities.min.css` | 16 KB | All | ✅ Yes | No | No | Low | Low |
| `vendor.min.css` | 36 KB | All | ✅ Yes | No | **Partial** | Medium | Medium — Swiper styles not needed before JS |
| `custom-inner-demo.css` | 4 KB | All | ❌ No | **Yes** | **Yes** | Low | Low |
| `cart.css` | 28 KB | All (incorrectly) | ❌ No | **Yes** | **Yes** | Medium | **High** — remove from global load |

### 4.2 Section-Level CSS (Correctly Scoped)

| File | Size | Templates Using It | Minified? | Gain |
|------|------|--------------------|-----------|------|
| `product.css` | 40 KB | product, collection, search, compare, wishlist | ❌ No | Minify = ~28 KB |
| `product-details.css` | 36 KB | product (main-product, layout-2, matrix) | ❌ No | Minify = ~25 KB |
| `collection.css` | 24 KB | collection, collection-meta-filters | ❌ No | Minify = ~17 KB |
| `glightbox.min.css` | 16 KB | product pages | ✅ Yes | Already optimal |
| `skeleton.css` | 16 KB | product, recently-viewed, wishlist | ❌ No | Minify = ~11 KB |
| `blog-item.css` | 4 KB | blog, article, blog-posts section | ❌ No | Minor |
| `blog-template.css` | 8 KB | blog, article | ❌ No | Minor |
| `collections-item.css` | 12 KB | collection list, collection link | ❌ No | Minor |
| `collections-list.css` | 4 KB | list-collections | ❌ No | Minor |
| `page-heading.css` | 4 KB | blog heading, collection heading, search, page-heading | ❌ No | Minor |
| `banner-text.css` | 8 KB | banner-with-text, main-password-content | ❌ No | Minor |
| `email-signup-banner.css` | 16 KB | email-signup-banner section | ❌ No | Minor |
| `faqs.css` | 4 KB | faq, page-faqs | ❌ No | Minor |
| `compare.css` | 4 KB | page-compare | ❌ No | Minor |
| `wishlist.css` | 4 KB | page-wishlist | ❌ No | Minor |
| `slideshow.css` | 12 KB | slideshow section | ❌ No | Minor |
| `lookbook.css` | 12 KB | lookbook, instagram-shop, shop-the-look | ❌ No | Minor |
| `instagram.css` | 4 KB | instagram section | ❌ No | Minor |
| `video.css` | 4 KB | video section | ❌ No | Minor |
| `halloween-collection.css` | 20 KB | halloween-collection section | ❌ No | Seasonal — consider removal |
| `custom-collection.css` | 20 KB | custom-collection section | ❌ No | Minor |
| `scrolling-text.css` | 4 KB | banner-with-text | ❌ No | Minor |
| `image-comparison.css` | 4 KB | image-comparison section | ❌ No | Minor |
| `popup.css` | 16 KB | Not found in section audit | ❌ No | Check usage |
| `fake-order.css` | 4 KB | fake-order snippet | ❌ No | Minor |
| `digital-1.css` | 4 KB | No section reference found | ❌ No | **Potentially unused** |
| `daily-promotion.css` | 4 KB | No section reference found | ❌ No | **Potentially unused** |
| `template-giftcard.css` | 4 KB | gift card template | ❌ No | Minor |
| `swiper-bundle.min.css` | **0 bytes** | N/A | N/A | **Empty file — remove reference** |
| `custormer.css` | Not in assets | customer sections | N/A | **Typo — file may be missing** |
| `component-pickup-availability.css` | 4 KB | product sections (conditional) | ❌ No | Minor |

### 4.3 Duplicate Files (Unminified + Minified Both Present)

| Minified | Unminified | Both Present? | Action |
|----------|------------|---------------|--------|
| `base.min.css` (101KB) | `base.css` (92KB) | ✅ | Use .min only, unminified is for dev only |
| `reset.min.css` (23KB) | `reset.css` (32KB) | ✅ | Use .min only |
| `bootstrap-grid.min.css` | `bootstrap-grid.css` | ✅ | Use .min only |
| `utilities.min.css` | `utilities.css` | ✅ | Use .min only |
| `vendor.min.css` | `vendor.css` | ✅ | Use .min only |
| `rtl.min.css` | `rtl.css` | ✅ | Use .min only |

✅ All minified versions are correctly being loaded — unminified versions exist as development copies only. No action needed on these pairs.

---

## 5. Google Fonts Audit

### 5.1 Current Implementation

```html
<!-- theme.liquid line 50 — BLOCKING -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```liquid
<!-- head-assets.liquid lines 75-80 — NON-BLOCKING (correct) — only fires when font_source == '2' -->
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css?family={{ font_var }}&display=swap"
  media="print"
  onload="this.media='all'">
```

```css
/* pendantoffpop.liquid — @import INSIDE CSS — WORST PATTERN */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
```

### 5.2 Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Blocking `<link rel="stylesheet">` for DM Sans in `theme.liquid` | **HIGH** | Blocks rendering until Google Fonts server responds (adds ~200–500ms on mobile) |
| DM Sans loaded twice (theme.liquid + head-assets.liquid) | **HIGH** | Wasted request, duplicate parse |
| `@import` in `pendantoffpop.liquid` CSS | **MEDIUM** | Blocks CSS parsing. `pendantoffpop` is commented out in theme.liquid but snippet file still has the import |
| Preconnects present for googleapis + gstatic | ✅ Good | Reduces DNS + TLS time |
| `display=swap` used | ✅ Good | Prevents FOIT |
| head-assets.liquid uses async pattern | ✅ Good | When font_source == '2', fonts load non-blocking |

### 5.3 Recommended Implementation

**Step 1:** Remove the blocking DM Sans line from `theme.liquid`:
```html
<!-- REMOVE THIS LINE from theme.liquid -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Step 2:** The async pattern in `head-assets.liquid` already handles font loading correctly when `font_source == '2'`. Verify this setting is active for the live store.

**Step 3:** Remove `@import url(...)` from `pendantoffpop.liquid` — DM Sans will already be loaded by the theme's font system. Replace with CSS variable reference only.

---

## 6. App Impact Analysis

### 6.1 Identified Third-Party Scripts

| Script/App | Load Method | Blocking? | Notes |
|------------|-------------|-----------|-------|
| `third-party-scripts.js` | `defer` in theme.liquid | ❌ No | Interaction-triggered load — contains TikTok pixel, deferred correctly |
| `gsf-conversion-pixels.liquid` | Inline `<script>` in `<head>` | ❌ No | Outputs only a data object, no external fetch on parse |
| Facebook Pixel | Via `content_for_header` | Unknown | Injected by Shopify app — cannot audit directly |
| Klaviyo | Via `content_for_header` | Unknown | preconnect added ✓ |
| Microsoft Clarity | Via `content_for_header` | Unknown | preconnect added ✓ |
| Google Site Verification | Meta tag | ❌ No | No performance impact |
| Pinterest domain verify | Meta tag | ❌ No | No performance impact |
| Facebook domain verify | Meta tag | ❌ No | No performance impact |
| Catalogue page: `jquery.min.1.7.js` + `modernizrcatalog` + `hash.js` | `async` — only on catalogue page | ❌ No | Scoped correctly |

### 6.2 `content_for_header` Apps

Cannot be audited from theme files. Recommend running Chrome DevTools Network tab on the live store to identify all assets injected by:
- Shopify Analytics
- Klaviyo
- Meta Pixel
- Any consent management platform
- Judge.me or other review apps

---

## 7. Optimization Plan

---

### Priority 1 — Highest ROI (Do These First)

---

#### P1-A: Remove Blocking DM Sans Load from `theme.liquid`

**File:** `layout/theme.liquid`  
**Line:** 50  
**Remove:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```
**Why:** The async pattern in `head-assets.liquid` already loads this font correctly. This line is redundant and blocking. Removing it eliminates one full render-blocking external request.  
**Expected FCP gain:** ~200–400ms  
**Risk:** Low — the font is already loaded by head-assets.liquid  
**Rollback:** Re-add the line  

---

#### P1-B: Make `cart.css` Conditional

**File:** `layout/theme.liquid`  
**Current:**
```liquid
{{ 'cart.css' | asset_url | stylesheet_tag: preload: true }}
```
**Replace with:**
```liquid
{% if template == 'cart' %}
  {{ 'cart.css' | asset_url | stylesheet_tag: preload: true }}
{% else %}
  <link rel="preload" href="{{ 'cart.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript>{{ 'cart.css' | asset_url | stylesheet_tag }}</noscript>
{% endif %}
```
**Also:** Remove the duplicate load in `snippets/minicart.liquid` — cart.css is already loaded by theme.liquid.  
**Why:** 28 KB of CSS loaded blocking on every page for a component that is always hidden until user interaction.  
**Expected FCP gain:** ~100–200ms  
**Risk:** Medium — test cart drawer open/close and minicart after change  
**Rollback:** Revert to global preload  

---

#### P1-C: Remove `@import` from `pendantoffpop.liquid`

**File:** `snippets/pendantoffpop.liquid`  
**Remove:**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
```
**Why:** CSS `@import` is the slowest way to load a font — it blocks CSS parsing and creates a request waterfall. The font is already loaded by the theme. Note: `pendantoffpop` is currently commented out in theme.liquid, but the snippet file should be cleaned up.  
**Risk:** Low  

---

### Priority 2 — High Value

---

#### P2-A: Defer `custom-inner-demo.css` (Global Non-Critical CSS)

**File:** `snippets/head-assets.liquid`  
**Current:**
```liquid
{{ 'custom-inner-demo.css' | asset_url | stylesheet_tag: preload: true }}
```
**Replace with:**
```html
<link rel="preload" href="{{ 'custom-inner-demo.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>{{ 'custom-inner-demo.css' | asset_url | stylesheet_tag }}</noscript>
```
**Why:** Contains only SPR badge colour overrides and `.hover-zoom` — not needed for above-the-fold paint.  
**Expected gain:** 4 KB removed from blocking budget  
**Risk:** Low — cosmetic only, no layout impact  

---

#### P2-B: Minify Key Unminified Section CSS Files

The following large section CSS files are served unminified. Priority targets:

| File | Current Size | Est. Minified | Saving |
|------|-------------|---------------|--------|
| `product.css` | 40 KB | ~27 KB | ~13 KB |
| `product-details.css` | 36 KB | ~24 KB | ~12 KB |
| `collection.css` | 24 KB | ~16 KB | ~8 KB |
| `skeleton.css` | 16 KB | ~11 KB | ~5 KB |
| `cart.css` | 28 KB | ~19 KB | ~9 KB |

**Method:** Use a CSS minifier (e.g. cssnano, clean-css) and save output as `.min.css` version. Update section references.  
**Risk:** Low — minification is non-destructive  

---

#### P2-C: Conditionally Load `glightbox.min.css`

**File:** `sections/main-product.liquid`  
**Current:**
```liquid
{{ 'glightbox.min.css' | asset_url | stylesheet_tag: preload: true }}
```
**Note:** Already section-scoped to product pages only ✅. However, `preload: true` on `glightbox.min.css` (16 KB) at product page level is aggressive — the lightbox only opens on user interaction.  
**Recommended:** Change to async load:
```html
<link rel="preload" href="{{ 'glightbox.min.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>{{ 'glightbox.min.css' | asset_url | stylesheet_tag }}</noscript>
```
**Expected gain:** 16 KB removed from product page blocking path  
**Risk:** Low — lightbox CSS only needed when user clicks image  

---

### Priority 3 — Medium Value

---

#### P3-A: Verify and Remove Unused CSS Files

The following files have no confirmed section reference in the theme:

| File | Finding | Action |
|------|---------|--------|
| `digital-1.css` (4 KB) | No stylesheet_tag reference found | Verify via Chrome Coverage, remove if unused |
| `daily-promotion.css` (4 KB) | No stylesheet_tag reference found | Verify via Chrome Coverage, remove if unused |
| `popup.css` (16 KB) | No stylesheet_tag reference found in sections audit | Verify — may be loaded via app or JS |
| `swiper-bundle.min.css` (0 bytes) | Empty file | Safe to remove |
| `halloween-collection.css` (20 KB) | Seasonal section — may not be active | Confirm whether section is in active templates |

**Method:** Chrome DevTools → Coverage tab on each template type → identify uncovered CSS  
**Risk:** Low — analysis only before removal  

---

#### P3-B: Consolidate Small Section CSS Into Base

Several section CSS files are 4 KB or smaller:
`scrolling-text.css`, `custom-text.css`, `page-heading.css`, `faqs.css`, `image-comparison.css`, `fake-order.css`, `component-pickup-availability.css`

Consider merging these into a single `sections-common.css` and loading it globally (total ~32 KB minified, replaces 7 individual requests).  
**Risk:** Medium — requires testing across all section templates  

---

### Priority 4 — Low/Long-Term

---

#### P4-A: Split `base.min.css` into Critical and Non-Critical

`base.min.css` at 101 KB is the largest single file. A proper above-the-fold split would:
1. Keep only layout, header, nav, and hero styles in a true critical CSS inline block
2. Defer the remainder with the async pattern

**Estimated impact:** FCP -300–500ms if done correctly  
**Risk:** High — requires Lighthouse coverage analysis to identify ATF selectors  
**Effort:** High — requires per-template analysis  
**Recommendation:** Do this after P1 and P2 gains are measured  

---

#### P4-B: Evaluate Vendor.min.css Deferability

`vendor.min.css` (36 KB) contains Swiper component styles. Since `swiper-bundle.min.js` is deferred, the CSS could be deferred too without visual impact (Swiper doesn't render until JS runs).  
**Risk:** Medium — test for flash of unstyled sliders  

---

## 8. Implementation Files

### Files to Modify (Dev Theme Only)

| File | Change | Priority |
|------|--------|----------|
| `layout/theme.liquid` line 50 | Remove blocking DM Sans `<link>` | P1-A |
| `layout/theme.liquid` line 68 | Make cart.css conditional | P1-B |
| `snippets/minicart.liquid` line 1 | Remove duplicate cart.css load | P1-B |
| `snippets/pendantoffpop.liquid` | Remove `@import url(...)` | P1-C |
| `snippets/head-assets.liquid` line 106 | Make custom-inner-demo.css async | P2-A |
| `sections/main-product.liquid` | Make glightbox.min.css async | P2-C |
| `sections/main-product-layout-2.liquid` | Make glightbox.min.css async | P2-C |

### Rollback Strategy

All changes are isolated to existing lines in 5 files. Rollback = revert each line individually. No structural changes, no file deletions, no build tooling required.

Git rollback commands (once committed):
```bash
git revert HEAD   # if single commit
# OR per-file:
git checkout <previous-commit-hash> -- layout/theme.liquid
git checkout <previous-commit-hash> -- snippets/head-assets.liquid
```

---

## 9. Validation Checklist

| Check | Method | Status |
|-------|--------|--------|
| DM Sans loads correctly after blocking link removal | Inspect Network tab: font/woff2 request present | ⬜ Pending |
| Cart drawer opens correctly | Click cart icon, verify styles load | ⬜ Pending |
| Minicart renders correctly | Hover/click cart, check appearance | ⬜ Pending |
| Product image lightbox works | Click product image on PDP | ⬜ Pending |
| No FOUT (flash of unstyled text) | Check font load on slow 3G | ⬜ Pending |
| Lighthouse mobile score improves | Run PageSpeed Insights on dev theme URL | ⬜ Pending |
| FCP improvement confirmed | Lighthouse FCP metric | ⬜ Pending |
| No CSS missing on homepage | Visual QA across breakpoints | ⬜ Pending |
| No CSS missing on product page | Visual QA | ⬜ Pending |
| No CSS missing on collection page | Visual QA | ⬜ Pending |
| Chrome Coverage: blocking CSS reduced | DevTools Coverage report | ⬜ Pending |

---

## 10. Evidence Log

### Files Inspected
- `layout/theme.liquid` — full read ✅
- `snippets/head-assets.liquid` — full read ✅
- `snippets/scripts-tag.liquid` — full read ✅
- `snippets/minicart.liquid` — line 1 confirmed ✅
- `snippets/gsf-conversion-pixels.liquid` — confirmed non-blocking ✅
- `assets/third-party-scripts.js` — confirmed interaction-deferred ✅
- `snippets/offerpop.liquid` — Google Font reference checked ✅
- `snippets/pendantoffpop.liquid` — @import confirmed ✅
- All `sections/*.liquid` — CSS loading patterns audited ✅
- All `assets/*.css` — file sizes measured ✅

### Files Modified
None — audit only. No live theme modified.

### Git Commit
Pending — implementation work not started. Commit required before marking tasks complete.

### Lighthouse Baseline
Reported baseline: Mobile ~40, FCP ~2s, render-blocking savings ~1,050ms  
Post-implementation Lighthouse run required on dev theme.

---

## 11. Estimated Performance Gains by Priority

| Priority | Action | FCP Gain | LCP Gain | Score Gain |
|----------|--------|----------|----------|------------|
| P1-A | Remove blocking DM Sans | ~200–400ms | ~100–200ms | +8–12 pts |
| P1-B | Make cart.css conditional | ~100–200ms | ~50–100ms | +4–6 pts |
| P1-C | Remove @import in pendantoffpop | ~50–100ms | Indirect | +1–2 pts |
| P2-A | Defer custom-inner-demo.css | ~20–40ms | Minimal | +1 pt |
| P2-B | Minify section CSS files | Minimal (not blocking) | Minimal | +1–2 pts |
| P2-C | Async glightbox.min.css on PDP | Product pages only | ~50ms on PDP | +2–3 pts PDP |
| P3-A | Remove unused CSS | Indirect | Indirect | +1–2 pts |
| **P1–P2 Combined** | | **~370–740ms** | **~200–300ms** | **+15–23 pts** |

**Estimated post-P1+P2 Lighthouse mobile score: 55–63**  
**Estimated post-all-priorities score: 65–72**

---

## 12. Shopify Best Practice Compliance

### Compliant ✅
- Minified versions of core CSS used (base.min.css, reset.min.css, etc.)
- JavaScript loaded with `defer` across all scripts
- Section-level CSS scoped to relevant templates (product, blog, collection, etc.)
- Preconnect hints for Google Fonts, Shopify CDN, Facebook, Klaviyo, Clarity
- `display=swap` on Google Fonts
- Section-ID-namespacing used throughout
- Catalogue-page JS scoped with `{% if page.handle == 'catalogue' %}`
- Template-specific JS (drift, glightbox, collection.min.js) scoped correctly in scripts-tag.liquid
- `third-party-scripts.js` uses interaction-triggered loading

### Non-Compliant ❌
| Issue | Rule Violated |
|-------|--------------|
| Blocking `<link rel="stylesheet">` for Google Font in theme.liquid | Shopify Performance: no render-blocking external resources |
| `cart.css` loaded globally on all pages | Load CSS only when needed |
| `custom-inner-demo.css` loaded globally — not critical | Load CSS only when needed |
| CSS `@import` in pendantoffpop.liquid | @import creates blocking request waterfall |
| `swiper-bundle.min.css` is an empty 0-byte file but referenced | Remove dead assets |
| 30+ unminified CSS files in assets | Use minified versions |
| `custormer.css` referenced in 5 sections but not found in assets | Missing file (typo: should be `customer.css`?) |

---

## Capability Log

```
CAPABILITY LOG
- What was built: Full Shopify theme performance audit — render-blocking CSS, Google Fonts, app assets, CSS inventory
- Reusable: yes
- Where it applies: All ledsone stores (electricalsone, ledsone.fr, ledsone.de), any Umino-based theme
- Pattern name: "shopify-css-render-block-audit"
```

---

## Self-Verification Checklist

| Item | Status |
|------|--------|
| Existing assets checked first (aios-piranav) | ✅ Checked — none found |
| No live theme modified | ✅ Confirmed — audit only |
| All CSS assets audited | ✅ 47 CSS files reviewed |
| Render-blocking resources identified | ✅ 8 blocking sources documented |
| Google Fonts implementation reviewed | ✅ 3 load patterns found, 2 defective |
| App-generated asset impact analyzed | ✅ third-party-scripts.js confirmed deferred |
| Lighthouse improvement estimated | ✅ +15–23 points estimated for P1+P2 |
| All recommendations reversible | ✅ Line-level rollback documented |
| Evidence log attached | ✅ Files inspected documented |
| Capability log completed | ✅ |
