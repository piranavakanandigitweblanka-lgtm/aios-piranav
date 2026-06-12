# FAQ Schema Fix Summary — 2026-06-12

## File Modified
`config.liquid`

---

## Problem
TinyIMG detected **two FAQPage schemas** on product URLs.

When `faq_source == 'product'`, the schema was rendered **twice**:
- Once unconditionally on line 9
- Again inside the `if faq_source == 'product'` branch

This caused duplicate structured data signals, risking Google ignoring the FAQ schema entirely.

---

## Root Cause

```liquid
{% if faq_source != nil %}
  {{ product.metafields.custom.faq_schema }}   ← unconditional, always fires
  {% if faq_source == 'product' %}
    {{ product.metafields.custom.faq_schema }} ← fires again on product pages
  {% else %}
    {{ collection.metafields.custom.faq_schema }}
  {% endif %}
```

---

## Fix Applied

Removed the unconditional output. Schema now renders exactly once via the conditional branch.

```liquid
{% if faq_source != nil %}
  {% if faq_source == 'product' %}
    {{ product.metafields.custom.faq_schema }}
  {% else %}
    {{ collection.metafields.custom.faq_schema }}
  {% endif %}
```

---

## Priority Logic
| Priority | Source | Condition |
|---|---|---|
| 1 | Product FAQ metafield | `product.metafields.custom.faq_schema` is not blank |
| 2 | Collection FAQ metafield | `collection.metafields.custom.faq_schema` is not blank |
| 3 | No schema | Neither metafield set |

Product and collection are **never output simultaneously**.

---

## Validation Checklist
- [ ] Deploy `config.liquid` to Shopify theme
- [ ] View page source → search `"@type":"FAQPage"` → confirm exactly **one** result
- [ ] Validate via TinyIMG
- [ ] Validate via Google Rich Results Test
- [ ] Validate via Schema Validator

---

## Impact
- No change to Product, Breadcrumb, or Organization schema
- No JS changes — FAQ UI rendering logic untouched
- Single authoritative FAQPage schema per URL
