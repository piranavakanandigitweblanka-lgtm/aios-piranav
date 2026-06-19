# Links Must Have Discernible Text — Lighthouse Accessibility Fix
**Date:** 2026-06-17
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__16JUN2026-0705am`
**Lighthouse Issue:** "Links must have discernible text" (Agentic Browsing — Accessibility tree is not well-formed)
**Failing Element:** `<a class="d-block text-transform menu-banner-loaded" href="/collections/2core-round" data-image-banner="..." data-width="253" data-height="338">`
**Result:** PASS ✓ — Agentic Browsing audit confirmed passing after fix

---

## Root Cause

Both failing links are in `snippets/menu-splits.liquid`. They use a JavaScript background image pattern — the `<a>` element is empty; the image is injected at runtime via `data-image-banner` attribute. No `<img>` tag inside means no alt text source, no visible text, no accessible name → Lighthouse flags both links.

---

## Files Modified

| File | Block | Lines | Fix |
|---|---|---|---|
| `snippets/menu-splits.liquid` | `when 'banner'` | Banner image link | Added `aria-label` + `alt` |
| `snippets/menu-splits.liquid` | `when 'collection'` | Collection image link | Added `aria-label` + `alt` |

---

## Fix 1 — Banner Block (`when 'banner'`) — Image link

**Before:**
```html
<a
  href="{{ block_st.banner_link }}"
  {%- if block_st.open_link != blank -%}
    target="_blank"
  {%- endif -%}
  class="menu-banner-loaded"
  data-image-banner="{{ image | image_url }}"
  data-width="{{ image.width }}"
  data-height="{{ image.height }}"
>
</a>
```

**After:**
```html
<a
  href="{{ block_st.banner_link }}"
  {%- if block_st.open_link != blank -%}
    target="_blank"
  {%- endif -%}
  class="menu-banner-loaded"
  data-image-banner="{{ image | image_url }}"
  data-width="{{ image.width }}"
  data-height="{{ image.height }}"
  aria-label="Browse {{ block_st.title | default: 'collection' }} collection"
  alt="{{ block_st.title | default: 'collection' }}"
>
</a>
```

**Label source:** `block_st.title` — the banner block's title setting (e.g. "2-Core Round Cable"). Falls back to `'collection'` if blank.

---

## Fix 2 — Collection Block (`when 'collection'`) — Image link ← Primary Lighthouse failing element

**Before:**
```html
<a
  class="d-block text-transform menu-banner-loaded"
  href="{{ collection_link }}"
  {%- if block_st.open_link != blank -%}
    target="_blank"
  {%- endif -%}
  {%- if image_col != blank -%}
    data-image-banner="{{ image_col | image_url }}"
    data-width="{{ image_col.width }}"
    data-height="{{ image_col.height }}"
  {%- endif -%}
>
```

**After:**
```html
<a
  class="d-block text-transform menu-banner-loaded"
  href="{{ collection_link }}"
  aria-label="Browse {{ collection_name }} collection"
  alt="{{ collection_name }}"
  {%- if block_st.open_link != blank -%}
    target="_blank"
  {%- endif -%}
  {%- if image_col != blank -%}
    data-image-banner="{{ image_col | image_url }}"
    data-width="{{ image_col.width }}"
    data-height="{{ image_col.height }}"
  {%- endif -%}
>
```

**Label source:** `collection_name` (= `collection.title`) — the actual Shopify collection title, e.g. "2-Core Round Cable". Screen readers now announce: _"Browse 2-Core Round Cable collection, link"_.

---

## Audit Result

| Check | Result |
|---|---|
| Screen reader announces destination | ✓ — `aria-label` provides full context |
| Visual UI unchanged | ✓ — `aria-label` and `alt` are non-visual attributes |
| Lighthouse "Links must have discernible text" | ✓ PASS |
| Agentic Browsing score | Improved — confirmed by user |

---

## Risk Assessment

**GREEN** — `aria-label` and `alt` are additive attributes. No HTML structure, CSS, or JS logic changed. The background image injection via `data-image-banner` continues to work exactly as before.

---

## CAPABILITY LOG
- What was built: Megamenu image link accessible name fix for Lighthouse "Links must have discernible text"
- Reusable: Yes
- If yes, where it applies: Any Shopify megamenu using JS-injected background image links (`data-image-banner` pattern)
- Pattern name: `lighthouse-menu-banner-aria-label-fix`
