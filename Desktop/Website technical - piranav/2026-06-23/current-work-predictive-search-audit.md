# Current Work — Predictive Search Audit: Keyword → Intent Upgrade

**Date:** 2026-06-23
**Theme:** ledsone.co.uk — promotion-week-4-2-mega-digital
**Files Audited:**
- `sections/search-predictive-grid.liquid`
- `sections/search-predictive-list.liquid`
- `snippets/product-popular-list-item.liquid`
- `assets/predictive-search-redesign.css`
**Status:** Assessment only — no code modified
**Risk Level:** 🟢 Green (read-only audit)

---

## Business Goal

Users should find relevant products when searching naturally, including question-format queries:
- What pendant light is best for a kitchen island?
- Red pendant light for dining room
- Wall light for hallway
- Lampshade for E27 bulb

---

## 1. Current Architecture

### Search Mode — Dual-Path

Both `search-predictive-grid.liquid` and `search-predictive-list.liquid` use identical mode-switching logic:

```liquid
if predictive_search_type == 'search_suggest'
  assign predictive_type = predictive_search    ← Shopify Predictive Search API (/search/suggest)
else
  assign predictive_type = search               ← Standard search object (/search)
```

Mode is controlled by `settings.predictive_search_type`. Both paths render results via `product-popular-list-item.liquid` and share the same "Show all" URL.

### The Critical URL — Defines Exactly What Is Searched

```
/search?type=product
  &options[fields]=title,vendor,product_type,variants.title,variants.sku
  &options[unavailable_products]={{ settings.unavailable_pr }}
  &options[prefix]=last
  &q={{ key_terms }}
```

Every field **not listed** in `options[fields]` is ignored by Shopify's search engine.

### Theme-Level Variant Display Matching

`product-popular-list-item.liquid` (lines 3–24) scans variant titles and options client-side and surfaces the variant whose name most closely matches the search term. This is a **display enhancement only** — it does not affect which products are returned or how they are ranked.

### product_type: Prefix Parsing

Both sections detect and parse `product_type:` prefixed queries (e.g. `product_type:pendant AND kitchen`). This is a manual workaround for category-scoped search. It only activates if the query was constructed with that prefix — no automation.

### CSS

`predictive-search-redesign.css` is purely presentational. No search logic impact.

---

## 2. Audit — Six Questions Answered

### Q1 — Current Search Source

| Mode | API | Trigger |
|------|-----|---------|
| `search_suggest` | Shopify Predictive Search API (`/search/suggest`) | AJAX, fires as user types |
| Default | Shopify standard `search` object | Full-page search |

Both modes are **keyword matching only**. Neither has any intent, NLP, or semantic understanding.

---

### Q2 — Are Product Descriptions Searched?

**No.**

`body_html` is not in `options[fields]`.

| Field | Currently Searched? |
|-------|-------------------|
| `title` | ✅ Yes |
| `vendor` | ✅ Yes |
| `product_type` | ✅ Yes |
| `variants.title` | ✅ Yes |
| `variants.sku` | ✅ Yes |
| `body_html` (description) | ❌ Missing from fields |
| `tag` | ❌ Missing from fields |

**Additional limitation:** Even if `body_html` were added to the "Show all" URL, the Predictive Search API (`/search/suggest`) does not support `body_html` as a searchable field. Descriptions can only be searched on full `/search` results pages — not in the live-as-you-type dropdown.

---

### Q3 — Can Metafields Be Included?

**No — not via Shopify's native search APIs.**

Shopify's Storefront Search and Predictive Search APIs do not index metafields. There is no `options[fields]=metafields.custom.search_keywords` parameter. Metafields are invisible to the search engine entirely.

**One workaround exists:** populate product tags programmatically from metafield values — those tags then become searchable once `tag` is added to `options[fields]`.

---

### Q4 — Do Tags Influence Ranking?

**Not currently — but they can be enabled.**

`tag` is absent from `options[fields]`. Adding it would allow tags like `room-kitchen`, `room-hallway`, `style-industrial`, `bulb-e27` to be matched against search queries.

Note: Shopify does not use tags for **ranking weight** — a tag match is treated equally to a title word match. However, tags greatly expand what a product can be found for.

**Real impact example:**
- Query: `"wall light for hallway"`
- Without tags: only matches if "hallway" is literally in the title
- With tag `room-hallway`: matches any product tagged for that room, regardless of title wording

---

### Q5 — Does Variant Data Influence Ranking?

**Partially — in display only.**

Shopify's search already indexes `variants.title` and `variants.sku` (both in `options[fields]`). A query for "black" or "E27" will surface products that have those variants — this is working correctly.

The theme's `product-popular-list-item.liquid` adds display-layer variant matching on top — it shows the matching variant's image and URL. This improves UX but does not change ranking.

**What variant data cannot do:** Variant option values cannot be ranked higher or lower against each other. All variant matches are treated equally by Shopify's engine.

---

### Q6 — Can Custom Keyword Metafields Be Used?

**Not via Shopify search — but indirectly via a tag sync pattern.**

There is no mechanism to search a metafield like `product.metafields.seo.search_keywords` directly.

**Practical workaround:**
1. Create metafield `custom.search_synonyms` (e.g. `"kitchen island, over-table, dining pendant"`)
2. Sync those values into product tags via Shopify Flow, Apps Script, or CSV bulk edit
3. Add `tag` to `options[fields]`
4. Tags are now searchable

This is manual/semi-automated — it does not provide semantic search, but meaningfully extends keyword coverage for specific intent phrases.

---

## 3. Search Limitations Summary

| Limitation | Impact | Fixable via Native Shopify? |
|-----------|--------|---------------------------|
| Descriptions not searched (results page) | Misses use-case language in descriptions | ✅ Add `body_html` to fields URL |
| Descriptions not searched (predictive dropdown) | Dropdown misses intent phrases | ❌ API limitation — not possible |
| Tags not searched | Misses room/use/style intent signals | ✅ Add `tag` to fields |
| Metafields not searchable | Cannot use structured data for search | ❌ Requires tag sync workaround |
| No synonym handling | "Ceiling rose" ≠ "lamp holder" | ❌ No |
| No intent / NLP | "What light is best for X" won't parse intent | ❌ No |
| No ranking boost | Cannot prioritise bestsellers or featured items | ❌ Shopify controls ranking |
| Natural language queries | Stop words stripped but full-sentence queries fail | ❌ No |

---

## 4. Recommendations

### Option A — Improve Shopify Native Search with Tags + Descriptions

**Changes required:**

1. Add `body_html` and `tag` to `options[fields]` in both section files:
   ```
   options[fields]=title,vendor,product_type,variants.title,variants.sku,body_html,tag
   ```
2. Audit and enrich product descriptions to include room names, use cases, and compatibility language
3. Create a tag taxonomy: `room-kitchen`, `room-hallway`, `room-dining`, `style-industrial`, `bulb-e27`, `fit-pendant`, `use-island-light`
4. Apply tags across the catalogue via bulk edit or CSV

**Limitation:** Predictive dropdown still won't search descriptions — improvement only applies to full results page.

**Complexity:** Low — 1–2 days
**Performance:** No impact — server-side, no extra API calls
**Business value:** High — resolves "Wall light for hallway", "Lampshade for E27 bulb", "Red pendant for dining room"

---

### Option B — Theme-Level Intent Preprocessing

A lightweight JavaScript layer intercepts the search query before it is sent to Shopify and rewrites it to improve matching.

**Example logic:**
```
Query: "What pendant light is best for a kitchen island?"
→ Strip stop words: "what", "is", "best", "for", "a"
→ Extract: "pendant light", "kitchen island"
→ Rewrite: "pendant kitchen"
→ Optionally inject: product_type:pendant AND kitchen
```

The theme already has partial infrastructure — the `product_type:` prefix parser (lines 17–28 in both sections) — which can be extended.

**Intent keyword map (maintained in theme or JS asset):**
```json
{
  "kitchen island": ["pendant", "hanging", "over-table"],
  "reading light":  ["wall", "adjustable", "arm"],
  "hallway":        ["wall", "flush", "ceiling"]
}
```

**Complexity:** Medium — 3–5 days
**Performance:** Minimal — JS runs client-side pre-fetch, adds ~10ms
**Business value:** Medium — improves natural language and question queries; requires ongoing maintenance of intent maps

---

### Option C — Custom Search Index (Third-Party)

Replaces Shopify's search API with a dedicated provider that crawls the catalogue, builds its own index, and returns semantically ranked results.

| Provider | Strengths | Est. Cost |
|----------|-----------|-----------|
| Boost Commerce Search | Native Shopify app, metafield indexing, synonyms, merchandising | ~£79/mo |
| SearchPie | Lightweight, fast to deploy | ~£19/mo |
| Klevu | Full NLP, AI ranking, query understanding | £200+/mo |
| Algolia | Most powerful, API-first, full metafield indexing | £100+/mo usage-based |

**Unlocks:**
- Metafields indexed and searchable
- Synonym dictionaries ("ceiling rose" = "lamp holder")
- Natural language queries parsed
- Merchandising rules (pin bestsellers, suppress discontinued)
- Analytics on zero-result queries

**Complexity:** High — 1–2 weeks integration + ongoing curation
**Performance:** Slight improvement on large catalogues
**Business value:** Highest — only justified if zero-result rate is confirmed significant

---

## 5. Recommended Implementation Path

### Phase 1 — Immediate (Option A, 1–2 days)
- Add `body_html` + `tag` to `options[fields]` in both section files
- Create tag taxonomy for rooms, styles, bulb types, use cases
- Bulk-tag top 50–100 products
- Enrich product descriptions with natural language use-case phrases

**Resolves:** "Wall light for hallway", "Lampshade for E27 bulb", "Red pendant light for dining room"

### Phase 2 — Short-term (Option B, 3–5 days)
- Build client-side query preprocessor with intent keyword maps
- Extend the existing `product_type:` prefix logic already in the theme

**Resolves:** "What pendant light is best for a kitchen island?"

### Phase 3 — If zero-result rate warrants it (Option C)
- Pull zero-result query data from Shopify Analytics or GA4 site search tracking
- If >15% of searches return zero results, evaluate Boost Commerce as the lowest-disruption option

---

## 6. Performance Impact

| Change | Page Speed Impact | TTFB Impact |
|--------|------------------|-------------|
| Add `body_html` + `tag` to fields | None | +5–15ms (larger index scan, server-side) |
| Client-side query preprocessor (Option B) | None | <5ms (JS only, pre-request) |
| Third-party search (Option C) | Possible improvement | Provider-dependent |

---

## CAPABILITY LOG

- **What was built:** Full architecture audit of Shopify predictive search — field coverage, API limitations, and three-tier upgrade path
- **Reusable:** Yes
- **Where it applies:** Any Shopify store using native search that needs to improve natural language / intent matching
- **Pattern name:** `shopify-search-intent-upgrade-audit`
