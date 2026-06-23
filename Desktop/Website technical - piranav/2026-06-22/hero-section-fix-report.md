# Hero Section Fix Report

**Date:** 2026-06-22
**File Updated:** `blocks/ai_gen_block_f74df67.liquid`
**Block Type:** Theme Block (OS2)
**Action:** Fix only — no design, content, or branding changes

---

## File Updated

`C:\Users\PC\Desktop\shopify\electricalsone\blocks\ai_gen_block_f74df67.liquid`

Block type confirmed as **Theme Block** before editing.
All `block.settings` references retained. No section-level conversion performed.

---

## Issues Fixed

| Issue | Fix Applied |
|---|---|
| `search_placeholder` schema type `inline_richtext` | Changed to `"type": "text"` — prevents HTML tags rendering inside `placeholder=""` attribute |
| `button_text` schema type `inline_richtext` | Changed to `"type": "text"` — button labels should be plain text |
| `badge_1_text` through `badge_4_text` schema type `inline_richtext` | Changed all 4 to `"type": "text"` — badge labels should be plain text |
| Search input focus outline removed (`outline: none`) | Replaced with `outline: 2px solid {{ block.settings.button_bg_color }}; outline-offset: -2px` — uses theme's button colour for consistency |
| Search button focus outline removed (`outline: none`) | Replaced with `outline: 2px solid #ffffff; outline-offset: -2px` — white outline visible against the blue button background |
| `<h1>` rendered on every page regardless of template | Wrapped in `{% if template == 'index' %}<h1>{% else %}<h2>{% endif %}` — H1 on homepage only, H2 on all other templates |
| Badge SVG icons missing `aria-hidden` | Added `aria-hidden="true" focusable="false"` to all 4 badge SVGs — hides decorative icons from screen readers |
| Custom element (`<ai-hero-section-...>`) with class-based JS for a 3-line task | Replaced with `<div>` wrapper + simple IIFE event listener — removes 20 lines of custom element overhead |

---

## Code Changes

### 1. Search input focus — CSS (line ~76)
```css
/* BEFORE */
.ai-hero-search-input-{{ ai_gen_id }}:focus {
  outline: none;
}

/* AFTER */
.ai-hero-search-input-{{ ai_gen_id }}:focus {
  outline: 2px solid {{ block.settings.button_bg_color }};
  outline-offset: -2px;
}
```

### 2. Search button focus — CSS (line ~100)
```css
/* BEFORE */
.ai-hero-search-button-{{ ai_gen_id }}:focus {
  outline: none;
}

/* AFTER */
.ai-hero-search-button-{{ ai_gen_id }}:focus {
  outline: 2px solid #ffffff;
  outline-offset: -2px;
}
```

### 3. H1 SEO guard — Liquid (line ~167)
```liquid
<!-- BEFORE -->
{% if block.settings.title != blank %}
  <h1 class="ai-hero-title-{{ ai_gen_id }}">{{ block.settings.title }}</h1>
{% endif %}

<!-- AFTER -->
{% if block.settings.title != blank %}
  {% if template == 'index' %}
    <h1 class="ai-hero-title-{{ ai_gen_id }}">{{ block.settings.title }}</h1>
  {% else %}
    <h2 class="ai-hero-title-{{ ai_gen_id }}">{{ block.settings.title }}</h2>
  {% endif %}
{% endif %}
```

### 4. Badge SVG aria-hidden — HTML (all 4 badges)
```html
<!-- BEFORE -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">

<!-- AFTER -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
```

### 5. Custom element → div — HTML (line ~165 and ~236)
```html
<!-- BEFORE -->
<ai-hero-section-{{ ai_gen_id }} class="ai-hero-section-{{ ai_gen_id }}" {{ block.shopify_attributes }}>
...
</ai-hero-section-{{ ai_gen_id }}>

<!-- AFTER -->
<div class="ai-hero-section-{{ ai_gen_id }}" {{ block.shopify_attributes }}>
...
</div>
```

### 6. JavaScript — replaced custom element class with simple listener
```js
// BEFORE (24 lines)
(function() {
  class AiHeroSection{{ ai_gen_id }} extends HTMLElement {
    constructor() { super(); }
    connectedCallback() {
      this.form = this.querySelector('.ai-hero-search-form-{{ ai_gen_id }}');
      if (this.form) {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
      }
    }
    handleSubmit(event) {
      const input = this.form.querySelector('.ai-hero-search-input-{{ ai_gen_id }}');
      if (!input.value.trim()) { event.preventDefault(); }
    }
  }
  customElements.define('ai-hero-section-{{ ai_gen_id }}', AiHeroSection{{ ai_gen_id }});
})();

// AFTER (8 lines)
(function() {
  var form = document.querySelector('.ai-hero-search-form-{{ ai_gen_id }}');
  if (form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('.ai-hero-search-input-{{ ai_gen_id }}');
      if (input && !input.value.trim()) { event.preventDefault(); }
    });
  }
})();
```

### 7. Schema type changes — JSON
```json
// search_placeholder: inline_richtext → text
// button_text: inline_richtext → text
// badge_1_text through badge_4_text: inline_richtext → text (4 fields)
// Total: 6 schema fields corrected
// title and subtext left as inline_richtext (legitimate richtext headings)
```

---

## Validation Results

| Test | Result | Notes |
|---|---|---|
| Shopify Compatibility | ✅ PASS | `block.settings`, `block.shopify_attributes`, `block.id` all valid. `block.shopify_attributes` retained on root `<div>` |
| Liquid Validation | ✅ PASS | No syntax errors. `template == 'index'` is valid Shopify Liquid |
| Schema Validation | ✅ PASS | All 6 corrected fields now use valid `text` type. `title` and `subtext` retain `inline_richtext` (valid use) |
| Mobile Validation | ✅ PASS | No mobile layout changes needed. `flex-direction: column` stack, `width: 100%` on input/button, `flex-wrap: wrap` on badges — all unchanged and working |
| Accessibility Validation | ✅ PASS | Focus ring restored on input and button. All 4 badge SVGs now `aria-hidden="true" focusable="false"`. `role="search"` and `aria-label="Search"` unchanged |
| SEO Validation | ✅ PASS | `<h1>` renders only on `template == 'index'` (homepage). All other pages get `<h2>`. Eliminates duplicate H1 risk |
| Performance Validation | ✅ PASS | Custom element class removed. No `customElements.define` call. JS reduced from 24 lines to 8 lines. Zero new dependencies |

---

## Remaining Risks

| Risk | Level | Detail |
|---|---|---|
| Predictive search not integrated | 🟡 LOW | The hero search bar submits a plain form to `/search?q=`. The theme's existing predictive search (in `sections/predictive-search.liquid` + `header-search-bar.js`) is not wired to this input. This was a pre-existing gap, not introduced by these fixes. Requires separate task to implement. |
| Font duplicate load | 🟢 VERY LOW | `font_picker` default `poppins_n5` may duplicate a global theme font load. Not blocking. |

---

## Capability Log

- **What was built:** Applied 8 targeted fixes to the AI-generated hero theme block
- **Reusable:** Yes
- **Where it applies:** Any `blocks/ai_gen_block_*.liquid` file with the same patterns (custom element wrappers, inline_richtext on placeholder attributes, missing focus rings, decorative SVGs without aria-hidden)
- **Pattern name:** `ai-block-remediation-standard`

---

## Final Verdict

> ✅ **PASS — Safe to deploy**

All 3 required fixes from the verification report are resolved. Both optional improvements are applied. The block is now WCAG 2.4.7 compliant (focus visible), SEO-safe on all page templates, schema-correct, and ships lighter JavaScript. No design, branding, or content was changed.
