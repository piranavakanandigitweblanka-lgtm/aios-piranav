# INP Investigation Report — Mobile Performance
**Date:** 2026-06-17
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__17JUN2026-1015am`
**Role:** Senior Shopify Performance Engineer — Read-Only Investigation
**Metric:** INP (Interaction to Next Paint) — Chrome Core Web Vital
**Scope:** JS files by page type, third-party scripts, app embeds, event listeners, long tasks, render-blocking JS

---

## Summary

INP measures how long the browser takes to respond visually after a user interaction (tap, click, key press). On mobile, the main thread is slower — any JS work on the interaction path that exceeds ~200ms causes a poor INP score. This theme has **7 confirmed INP risk factors**, ranging from critical (eval in scroll path) to moderate (unconditional 5s third-party fallback).

---

## JS Loading Strategy — Per Page Type

| Page | Scripts Loaded | Method |
|---|---|---|
| All pages | `swiper-bundle.min.js`, `easydlg.min.js`, `fslightbox.min.js`, `theme.min.js` | `defer` ✓ |
| All pages (conditional) | `animations.js` | `defer` ✓ (if setting enabled) |
| Product | `drift.min.js`, `main-product.min.js`, `glightbox.min.js` | `defer` ✓ |
| Collection | `collection.min.js` | `defer` ✓ |
| Blog | `masonry.min.js` | `defer` ✓ |
| All pages | `gsf-conversion-pixels.liquid` → inline `<script>` in `<head>` | **No defer/async** ✗ |
| All pages | TikTok Pixel (`analytics.tiktok.com`) | Interaction-deferred + 5s fallback |
| All pages | Microsoft Clarity (`clarity.ms`) | Interaction-deferred + 5s fallback |
| Homepage | Section tracker (22 sections) | Inline in `third-party-scripts.js` |

**Theme JS loading is well-structured** — all theme scripts use `defer`. The problem lies in the execution patterns AFTER load.

---

## Findings Table

| # | Finding | File | Impact | Evidence | Recommendation |
|---|---|---|---|---|---|
| 1 | `eval()` called inside scroll handler on every scroll event | `assets/theme.js:5,3422` | **CRITICAL** | `BlsOptimize()` at line 5 executes `eval(el.innerHTML)` and is called by `stickyFunction()` at line 3422, which is registered as a raw scroll listener — `eval` forces JS re-parse on every scroll | Remove `eval()` from `BlsOptimize()`. Pass a function reference or use `JSON.parse()` / attribute data instead. Move call out of scroll path. |
| 2 | 4 scroll handlers with no debounce or throttle | `assets/theme.js:627,982,3400,3414` | **HIGH** | Raw `window.addEventListener("scroll", () => {...})` at lines 627 (backToTop + mobileStickyBar), 982 (back-to-top visibility), 3400 (transparent header), 3414 (sticky header — calls `stickyFunction()` which contains `eval`) | Wrap all scroll handlers with a `requestAnimationFrame` guard or `debounce(fn, 16)`. The sticky header handler at 3414 is highest priority due to `eval` chain. |
| 3 | Resize handler with no debounce | `assets/theme.js:3507` | **MEDIUM** | `window.addEventListener("resize", function() { _this.addCssSubMenu(); }, true)` — fires on every pixel of resize, recalculates submenu CSS | Debounce with `setTimeout(fn, 150)` — standard resize debounce pattern |
| 4 | Render-blocking inline `<script>` in `<head>` on all pages | `snippets/gsf-conversion-pixels.liquid` | **HIGH** | 33-line inline `<script>` with no `defer` or `async`, rendered at line 88 of `layout/theme.liquid`. Blocks HTML parsing on product, cart, home, collection, search, and page templates. Script builds `gsf_conversion_data` object using Liquid data. | Move to end of `<body>`, or wrap in `DOMContentLoaded`, or add a `<script type="application/json">` for the data and reference it from an external deferred script. |
| 5 | Body-level `scroll + click + mousemove + keydown` listeners for popup (fires on first user action) | `assets/theme.js:1478-1484` | **HIGH** | `addMultipleListeners(document.querySelector("body"), ["scroll","click","mousemove","keydown"], () => { setAction(); })` — registers 4 simultaneous global listeners; `setAction()` triggers popup logic with `setTimeout`. Every tap on mobile fires this handler. | Use `{ once: true }` option on each listener so they remove themselves after the first trigger. Currently they remain registered indefinitely. |
| 6 | TikTok Pixel injected on first interaction — no `{ once: true }` guard + unconditional 5s fallback | `assets/third-party-scripts.js:27-44,147` | **MEDIUM** | Triggers on `['mouseover','keydown','touchstart','scroll']`. On mobile the first `touchstart` fires it before any tap completes. The 5s `setTimeout(loadThirdPartyScripts, 5000)` loads scripts unconditionally even on bounce sessions. External script from `analytics.tiktok.com` added via `document.createElement('script')` — network latency on first interaction delays paint. | Add `{ once: true }` to event listeners (already partially done for some). Increase fallback from 5s to 8-10s or make it conditional on `visibilityState !== "hidden"`. Consider `requestIdleCallback` for injection. |
| 7 | 22 `IntersectionObserver` instances + 22 click listeners + `fetch()` to external URL on homepage | `assets/third-party-scripts.js:131-134` | **MEDIUM** | Each of 22 homepage sections gets `addEventListener('click', () => fetch('https://script.google.com/...'))` — `fetch()` blocks the event response callback. On mobile tap, the fetch queues on the main thread and can delay the next paint. | Move `fetch()` into a `setTimeout(..., 0)` or use `navigator.sendBeacon()` which is fire-and-forget and does not block INP. |

---

## Third-Party Scripts Inventory

| Script | Source | Load Trigger | Pages |
|---|---|---|---|
| TikTok Pixel (`CQOSBMRC77U65T3JCO2G`) | `analytics.tiktok.com/i18n/pixel/events.js` | First user interaction OR 5s timeout | All |
| Microsoft Clarity (`ld9y8d60j4`) | `clarity.ms` | First user interaction OR 5s timeout | All |
| GSF Conversion Pixels | Inline Liquid `<script>` | Render-blocking in `<head>` | Product, Cart, Home, Collection, Search, Page |
| Homepage Section Tracker | Inline in `third-party-scripts.js` | Page load (IntersectionObserver) | Homepage only |
| Facebook Pixel | Preconnected (`connect.facebook.net`, `facebook.com`) | Via `content_for_header` app embeds | All (via Shopify app) |
| Klaviyo | Preconnected (`static.klaviyo.com`) | Via `content_for_header` app embeds | All (via Shopify app) |

---

## App Embeds (`content_for_header`)

`layout/theme.liquid:88` renders `content_for_header` which loads all Shopify app embeds. The store has preconnects for:
- `connect.facebook.net` — Facebook Pixel (likely via Shopify Facebook channel or app)
- `static.klaviyo.com` — Klaviyo email/SMS (app embed)

These are Shopify-controlled. Their injection timing is managed by Shopify's app embed system. No direct control available in theme code — manage via Shopify App Store preferences.

---

## Event Listener Count Summary (`assets/theme.js`)

| Listener Type | Count | Key Concern |
|---|---|---|
| `scroll` | 4+ raw listeners | No debounce; one chains to `eval()` |
| `resize` | 1 | No debounce |
| `click` (global `document`) | 3 | Lines 1824, 3769, 998 |
| `click + scroll + mousemove + keydown` (body) | 4 simultaneous | Popup trigger, no `once` |
| `keyup/keydown` (global) | 3 | Lines 3797-3799 |

Total raw DOM event listeners in `theme.js` estimated: **730 total `addEventListener` or `on*` patterns** (confirmed via grep).

---

## INP Priority Fix Order

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P1 | Remove `eval()` from `BlsOptimize()` — break it out of scroll path | Medium | Eliminates JS re-parse on every scroll — biggest single INP gain |
| P2 | Debounce all 4 scroll handlers (wrap with `requestAnimationFrame` or 16ms debounce) | Low | Reduces main thread blocking frequency |
| P3 | Add `defer` or move `gsf-conversion-pixels.liquid` inline script out of `<head>` | Low | Eliminates render-block on page load (improves FCP + INP first interaction) |
| P4 | Add `{ once: true }` to body popup listeners (scroll/click/mousemove/keydown) | Low | Stops 4 persistent global listeners from firing on every user interaction |
| P5 | Replace `fetch()` in click handlers with `navigator.sendBeacon()` | Low | Fire-and-forget — does not hold up INP paint |
| P6 | Debounce resize handler at line 3507 | Low | Prevents reflow cascade on resize |
| P7 | Extend third-party script fallback from 5s to 8-10s | Low | Reduces chance of third-party script injection overlapping with first user interaction |

---

## Files Reviewed (Read-Only)

| File | Status |
|---|---|
| `layout/theme.liquid` | ✓ Read |
| `snippets/scripts-tag.liquid` | ✓ Read |
| `assets/third-party-scripts.js` | ✓ Read |
| `assets/theme.js` | ✓ Grep (730 event listener patterns identified) |
| `snippets/gsf-conversion-pixels.liquid` | ✓ Read |
| `snippets/content-bottom.liquid` | ✓ Read (window.routes etc setup — necessary, not a risk) |
| `assets/collection.min.js` | ✓ Identified (10KB minified, defer-loaded — low risk) |
| `assets/main-product.min.js` | ✓ Identified (46KB minified, defer-loaded, product page only) |
| `snippets/before-you-leave.liquid` | ✓ Read (popup rendered conditionally — JS trigger via body listeners in theme.js) |
| `snippets/lc-preview-popup.liquid` | ✓ Confirmed exists — static display:none popup, no external scripts |

---

## Risk Summary

**GREEN** (good):
- All theme JS files use `defer` — no additional render blocking from theme scripts
- Third-party pixel scripts are interaction-deferred (not inline/synchronous)
- `collection.min.js` and `main-product.min.js` are page-specific (not global)

**RED** (fix required):
- `eval()` in scroll handler path — active on every scroll, every page
- 4 raw unthrottled scroll handlers — active on every page
- Render-blocking inline `<script>` in `<head>` — active on all major page types

**AMBER** (improve):
- Body-level persistent popup listeners (4 types, no `once`)
- `fetch()` in click handlers blocking INP
- 5s unconditional third-party script fallback
- Resize handler without debounce

---

## CAPABILITY LOG
- What was built: INP root cause investigation for Shopify store
- Reusable: Yes
- If yes, where it applies: Any Shopify theme with theme.js scroll handler patterns, GSF app, TikTok/Clarity interaction-deferred loading
- Pattern names: `inp-eval-in-scroll-path`, `inp-unthrottled-scroll-handlers`, `inp-render-blocking-head-script`, `inp-fetch-in-click-handler`
