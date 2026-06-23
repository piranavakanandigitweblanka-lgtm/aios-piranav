# Hero Section Verification Report

**Date:** 2026-06-22
**File audited:** `blocks/ai_gen_block_f74df67.liquid`
**Theme:** electricalsone

---

## File Location

**Exact path:** `blocks/ai_gen_block_f74df67.liquid`

---

## Section Type

This is a **theme block** — stored in `blocks/`, not `sections/`, `snippets/`, or as an app block.

In Shopify OS2, the `blocks/` folder holds standalone theme blocks that can be placed inside sections whose schema declares `"blocks": [{"type": "@app"}, {"type": "@theme"}]` or lists specific block types. This block has `"tag": null` in its schema, which is valid for theme blocks.

---

## Shopify Compatibility
**PASS with warnings**

| Item | Status | Detail |
|---|---|---|
| `block.settings` | ✅ VALID | Correct for a theme block |
| `section.settings` | N/A | Not applicable — this is a block, not a section |
| `block.shopify_attributes` | ✅ VALID | Correct on the root element (line 165) |
| `block.id` | ✅ VALID | Used to derive unique `ai_gen_id` |
| Custom element name | ✅ VALID | `ai-hero-section-{id}` contains a hyphen — meets spec |
| JS class name | ✅ VALID | `AiHeroSection{id}` is a valid identifier |
| Schema `"tag": null` | ✅ VALID | Correct for blocks |
| Schema `"presets"` | ✅ VALID | Allows block to be added from the theme editor |

---

## Liquid Validation
**PASS**

| Check | Status | Detail |
|---|---|---|
| Liquid syntax | ✅ PASS | No unclosed tags, no missing `endif/endfor` |
| Invalid objects | ✅ PASS | All objects (`block`, `block.settings`, `block.id`) are valid |
| Filter chain | ✅ PASS | `block.id \| replace: '_', '' \| downcase` is valid |
| Font object access | ✅ PASS | `block.settings.heading_font.family`, `.fallback_families`, `.weight` are valid font_picker properties |
| `inline_richtext` output in H1 | ✅ PASS | HTML tags from inline_richtext render correctly inside `<h1>` |
| Deprecated syntax | ✅ PASS | No deprecated Liquid or filter usage found |

---

## Schema Validation
**FAIL — one wrong type**

| Setting ID | Type Used | Verdict | Detail |
|---|---|---|---|
| `max_width`, `padding_top/bottom` | `range` | ✅ | Valid |
| `background_color`, all color fields | `color` | ✅ | Valid |
| `title` | `inline_richtext` | ✅ | Acceptable for heading display |
| `heading_font` | `font_picker` | ✅ | Valid, loads Google Font via Shopify CDN |
| **`search_placeholder`** | **`inline_richtext`** | ❌ **WRONG** | This value is placed directly into an HTML `placeholder` attribute. `inline_richtext` can output `<em>`, `<strong>`, `<a>` tags — those render as raw HTML entities inside the attribute. Must be `type: "text"`. |
| `button_text` | `inline_richtext` | ⚠️ WARN | Works inside `<button>` inner HTML, but `type: "text"` is more appropriate |
| `badge_1_text` through `badge_4_text` | `inline_richtext` | ⚠️ WARN | Rendered inside `<span>` — works, but `type: "text"` is more appropriate for single-line badge labels |
| All defaults | ✅ | Valid | All `default` values match their types |

---

## Search Function Validation
**PASS with gap**

| Check | Status | Detail |
|---|---|---|
| `action="/search"` | ✅ PASS | Correct Shopify search endpoint |
| `name="q"` | ✅ PASS | Correct required parameter name |
| `method="get"` | ✅ PASS | Required for Shopify search |
| Empty search prevention | ✅ PASS | `handleSubmit` calls `event.preventDefault()` if `input.value.trim()` is empty (line 252–256) |
| Predictive search integration | ⚠️ GAP | Theme has a full predictive search at `sections/predictive-search.liquid` and `header.liquid` wires it up with `header-search-bar.js`. This hero block's search form is a plain `<form>` — no predictive dropdown. Users typing in this bar get no suggestions. |

---

## Accessibility Review

| Check | Status | Detail |
|---|---|---|
| `role="search"` on form | ✅ PASS | Line 176 |
| `aria-label="Search"` on input | ✅ PASS | Line 183 |
| Search button visible text | ✅ PASS | `{{ block.settings.button_text }}` provides visible label |
| **Search input focus outline** | ❌ **FAIL** | Line 76–78: `.ai-hero-search-input:focus { outline: none; }` — removes all focus visibility. Fails WCAG 2.4.7 (Focus Visible, Level AA) |
| **Search button focus outline** | ❌ **FAIL** | Line 100–102: `.ai-hero-search-button:focus { outline: none; }` — same violation |
| Badge SVG icons | ⚠️ WARN | SVG checkmark paths have no `aria-hidden="true"`. Screen readers may attempt to read the empty SVG, producing noise |
| H1 on every page this block is placed | ⚠️ WARN | See SEO section |
| Keyboard accessibility | ✅ PASS | Form submits on Enter, button triggers submit — standard HTML behaviour |

---

## Mobile Review

| Check | Status | Detail |
|---|---|---|
| Breakpoint | ✅ | `@media screen and (max-width: 768px)` applied |
| Search form layout | ✅ | Switches to `flex-direction: column` — input stacks above button |
| Input width | ✅ | `width: 100%` on mobile |
| Button width | ✅ | `width: 100%` on mobile — full-width tap target |
| Trust badge wrapping | ✅ | `flex-wrap: wrap` + gap reduced to `16px` — badges will reflow cleanly |
| Title scaling | ✅ | `title_size * 0.65` → at default 48px, mobile = ~31px. Acceptable |
| Overflow risk | ✅ None | No explicit overflow hidden on wrapper; `max-width` constrains safely |
| Search width constraint on small screens | ✅ | `max-width: 700px` doesn't overflow — viewport width limits it naturally |

---

## SEO Review

| Check | Status | Detail |
|---|---|---|
| H1 present | ✅ | Block renders `<h1>` — correct for homepage use |
| H1 on non-homepage pages | ❌ **RISK** | This block has no page-type guard. If placed on a collection page, product page, or any template that already has an `<h1>`, there will be **two H1s** on the page. Google's guidance strongly prefers one H1 per page |
| H1 content | ⚠️ | Defaults to "Professional Lighting Components" — merchant must update if used on multiple templates |
| Structured data | N/A | Not relevant for a hero block |

---

## Performance Review

| Check | Status | Detail |
|---|---|---|
| CSS delivery | ✅ | Inline `{% style %}` — no extra HTTP request |
| CSS uniqueness | ✅ | All classes namespaced with `ai_gen_id` — no conflicts with theme CSS |
| JS size | ✅ | ~20 lines — negligible weight |
| Custom element necessity | ⚠️ | Defining a full custom element class just to prevent empty form submit is overengineered. A 3-line event listener would suffice |
| Font loading | ⚠️ | `font_picker` default `poppins_n5` — verify theme global font settings to avoid loading Poppins twice |
| No lazy loading needed | ✅ | Above-the-fold content, no images to lazy load |
| JavaScript conflicts | ✅ | IIFE wrapping `(function() { ... })()` prevents global scope pollution |

---

## Issues Found

| Severity | Issue | Evidence | Recommendation |
|---|---|---|---|
| 🔴 High | `search_placeholder` schema type is `inline_richtext` | Schema line ~396; used in HTML `placeholder=""` attribute | Change to `"type": "text"` |
| 🔴 High | Focus outline removed on search input | CSS line 76–78: `outline: none` on `:focus` | Replace with visible focus ring |
| 🔴 High | Focus outline removed on search button | CSS line 100–102: `outline: none` on `:focus` | Replace with visible focus ring |
| 🟡 Medium | `<h1>` has no page-type guard | Line 168 | Wrap in `{% if template == 'index' %}` or change to `<h2>` for non-homepage use |
| 🟡 Medium | No predictive search integration | Hero form is plain `<form>` — no AJAX suggestions | Wire to existing `predictive-search.liquid` or accept plain-form behaviour |
| 🟡 Medium | Badge SVG icons missing `aria-hidden` | Lines 194–229 (all 4 badge SVGs) | Add `aria-hidden="true"` to each SVG |
| 🟢 Low | `button_text` and badge texts use `inline_richtext` | Schema lines ~488, 525–546 | Change to `"type": "text"` |
| 🟢 Low | Custom element unnecessary for form guard | JS lines 240–261 | Optional: replace with a simple event listener |
| 🟢 Low | Possible duplicate font load | `font_picker` default `poppins_n5` | Verify theme global font settings |

---

## Required Fixes

1. **Change `search_placeholder` schema type from `inline_richtext` to `text`** — only setting where value lands in an HTML attribute. `inline_richtext` will corrupt the attribute with raw HTML tags.

2. **Restore focus visibility on search input and button** — Remove `outline: none` from both `:focus` rules and replace with a visible focus style. WCAG 2.4.7 Level AA requirement.

3. **Guard the `<h1>` tag** — Add `{% if template == 'index' %}...<h1>...{% else %}...<h2>...{% endif %}` to prevent duplicate H1 on non-homepage templates.

---

## Optional Improvements

- Add `aria-hidden="true"` to all 4 badge SVGs
- Change `button_text` and badge schema types from `inline_richtext` to `text`
- Wire the search input to the existing `predictive-search.liquid` for inline suggestions
- Replace the custom element with a plain event listener for minimal JS footprint

---

## Final Verdict

> **AMBER — Works but improvements required before production**

The block renders correctly, search submits to the right endpoint, trust badges display, and no Liquid syntax errors exist. The file structure is architecturally valid as a theme block.

**However**, two WCAG accessibility failures (removed focus outlines) and one schema bug (`inline_richtext` on a placeholder attribute) must be fixed before this is production-safe. The H1 risk is a real SEO concern on non-homepage placements.

Fix the 3 required items and this block is safe to deploy.

---

## Capability Log

- **What was built:** Verification audit of AI-generated hero section theme block
- **Reusable:** Yes
- **Where it applies:** Any AI-generated block in `blocks/ai_gen_block_*.liquid` across this theme or similar OS2 themes
- **Pattern name:** `theme-block-verification-audit`
