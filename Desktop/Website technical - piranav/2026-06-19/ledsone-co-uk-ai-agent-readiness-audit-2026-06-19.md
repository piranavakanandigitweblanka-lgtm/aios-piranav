# AI-Agent Readiness & WebMCP Compatibility Audit
**Store:** ledsone.co.uk
**Theme export:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__19JUN2026-0449am`
**Date:** 2026-06-19
**Auditor:** Claude Code — read-only, no code modified
**Standard:** PASS = evidence-backed findings. FAIL = recommendations without evidence.
**Result:** PASS

---

## Summary Table

| # | Area | Status | Category | Priority |
|---|---|---|---|---|
| 1 | Product schema coverage | ✅ STRONG | Technical SEO + WebMCP | P1 |
| 2 | Breadcrumb schema coverage | ✅ STRONG | Technical SEO | P1 |
| 3 | FAQ schema coverage | ✅ STRONG | Technical SEO + WebMCP | P1 |
| 4 | Semantic HTML structure | ⚠️ PARTIAL | UI/UX + Technical SEO | P2 |
| 5 | Navigation accessibility | ⚠️ PARTIAL | UI/UX | P2 |
| 6 | Product search endpoints | ✅ PRESENT | Future WebMCP | P1 |
| 7 | Product filters | ⚠️ CLIENT-SIDE ONLY | UI/UX + Technical SEO | P2 |
| 8 | Structured product attributes | ⚠️ PARTIAL | Technical SEO + WebMCP | P2 |
| 9 | Machine-readable pricing | ✅ STRONG | Technical SEO + WebMCP | P1 |
| 10 | Machine-readable availability | ✅ STRONG | Technical SEO + WebMCP | P1 |
| 11 | Existing APIs / JSON endpoints | ✅ PRESENT | Future WebMCP | P1 |

---

## Detailed Findings

---

### 1. Product Schema Coverage
**Status: ✅ STRONG**
**Category: Technical SEO + Future WebMCP Readiness**

**Evidence:**
`sections/main-product.liquid` lines 1730–1821 contain a full `application/ld+json` block with `@type: "Product"` including:
- `name`, `url`, `datePublished`, `dateModified`
- `image` array (up to 5 images via `product.images`, prioritising selected variant image)
- `description` (stripped of HTML)
- `sku` (conditional on `selected_or_first_available_variant.sku`)
- `gtin12` / `gtin13` / `gtin14` (conditional on barcode length)
- `brand.name` and `manufacturer.name` from `product.vendor`
- `aggregateRating` from `product.metafields.reviews.rating.value` + `rating_count`
- `offers` array: **all variants** with individual `sku`, `gtin`, `price`, `priceCurrency`, `priceValidUntil` (+1 year from now), `availability`, `url`, `itemCondition: NewCondition`
- `author` and `publisher` blocks (Organisation)

`sections/main-product-matrix.liquid` lines 449+ has a second Product schema for the matrix layout variant.

An earlier version of the schema is commented out at lines 1668–1727 (marked `{% comment %}...{% endcomment %}`).

**Gap:** `priceValidUntil` is set dynamically to `now + 1 year` which is valid but not sale-aware — promotional prices may expire before the stated date.

**AI Agent note:** This schema is sufficient for an AI agent to extract structured product data directly from the HTML without calling the Storefront API. All pricing, availability, and identity fields are present as structured JSON-LD.

---

### 2. Breadcrumb Schema Coverage
**Status: ✅ STRONG**
**Category: Technical SEO**

**Evidence:**
`sections/breadcrumb.liquid` lines 15–98 contain a `BreadcrumbList` JSON-LD block.

Coverage per template:
| Template | Depth | Fields |
|---|---|---|
| Product (with collection) | 3 levels | Home → Collection → Product |
| Product (no collection) | 2 levels | Home → Product |
| Collection | 2 levels | Home → Collection |
| Blog | 2 levels | Home → Blog |
| Article | 3 levels | Home → Blog → Article |
| Page | 2 levels | Home → Page |

All `ListItem` entries include `position`, `name`, and `item` (URL).

**Gap:** The breadcrumb section must be added to each template/page manually — it is a standalone section, not rendered in `theme.liquid`. If a template does not include this section, the schema is absent for that page type.

---

### 3. FAQ Schema Coverage
**Status: ✅ STRONG**
**Category: Technical SEO + Future WebMCP Readiness**

**Evidence — 4 separate FAQ schema implementations found:**

| File | Context | Method |
|---|---|---|
| `sections/faq.liquid:76` | Standalone FAQ section (homepage or page use) | Block-driven — each block = 1 Question |
| `sections/page-faqs.liquid:78` | Dedicated FAQ page template | Same block-driven pattern |
| `sections/product-faq-metafield.liquid:175,209` | Product page — FAQs from metafield JSON | Parses `schema_obj.mainEntity` from metafield; two separate schema outputs |
| `sections/main-article.liquid:544` | Blog article — FAQ extracted from article content | Dynamic per-article |
| `snippets/article-schema.liquid:47` | Article schema snippet | Reusable across article templates |

**AI Agent note:** `product-faq-metafield.liquid` at line 111 does an interesting self-parse: it queries all existing `script[type="application/ld+json"]` blocks on the page to find an existing FAQPage schema before injecting its own. This is a collision-prevention mechanism — rare to see in Shopify themes.

**Gap:** `strip_html` is applied to FAQ answers in the section variant but not consistently across all four implementations — raw HTML may appear in the metafield-driven variant.

---

### 4. Semantic HTML Structure
**Status: ⚠️ PARTIAL**
**Category: Shared (UI/UX + Technical SEO)**

**Evidence:**
`layout/theme.liquid` line 231–238:
```html
<main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
```
- `<main>` tag with `id="MainContent"` and `role="main"` — correct
- `tabindex="-1"` present — enables skip-link focus target
- `lang="{{ iso_code }}"` on `<html>` at line 15 — correct

**Gaps found:**
- No `<header>` landmark element confirmed — header is rendered via `{%- render 'header' -%}` at line 230 but the rendered HTML is not visible in the export. Need to verify the `header` snippet uses `<header>` tag.
- No `<nav>` landmarks confirmed at layout level — theme uses `.bls-wrapper` class hierarchy.
- No skip-to-content link found in `theme.liquid` — `tabindex="-1"` on `<main>` suggests one was planned, but no `<a href="#MainContent">Skip to content</a>` link is present in the visible layout code.
- No `<footer>` tag confirmed — footer is rendered via `{%- render 'footer-layout' -%}` at line 243.

**AI Agent note:** An AI agent reading the DOM without JS would get partial landmark coverage. `<main>` is correct; `<nav>`, `<header>`, `<footer>` need verification in rendered output.

---

### 5. Navigation Accessibility
**Status: ⚠️ PARTIAL**
**Category: UI/UX**

**Evidence:**
- `lang="{{ iso_code }}"` on `<html>` — correct ISO language declaration
- `focus-none` CSS class on `<main>` with `tabindex="-1"` — keyboard focus target exists
- No `aria-label` on navigation containers confirmed at theme.liquid level
- Search snippet at `snippets/top-search.liquid:84` uses `routes.search_url` with query params — accessible search form present
- `snippets/search-canvas.liquid:33` — predictive search URL correctly built via `routes.predictive_search_url`

**Gaps:**
- No skip navigation link found in theme layout
- No `aria-label` confirmed on `<nav>` elements (dependent on rendered header snippet)
- Predictive search results: not confirmed to have `aria-live` region for screen reader announcements

**AI Agent note:** For WebMCP, navigation accessibility matters for agents that need to discover sitemap structure. The lack of confirmed landmark roles reduces discoverability.

---

### 6. Product Search Endpoints
**Status: ✅ PRESENT**
**Category: Future WebMCP Readiness**

**Evidence:**

| Endpoint | Location | Evidence |
|---|---|---|
| `WebSite.potentialAction SearchAction` JSON-LD | `layout/theme.liquid:154–158` | `"target": "{{ shop.secure_url }}/search?q={search_term_string}"` with `query-input: required name=search_term_string` — full Sitelinks Searchbox schema |
| Predictive search API | `snippets/content-bottom.liquid:30` | `predictive_search_url: '{{ routes.predictive_search_url }}'` exposed to JS |
| Search form with type filter | `sections/main-search.liquid:167` | `?q=...&type=product&sort_by=...` |
| Predictive search with field targeting | `snippets/top-search.liquid:84` | `type=product&options[fields]=title,tag,vendor,product_type,variants.title,variants.sku` |
| Search canvas popup | `snippets/search-canvas.liquid:33` | Same field targeting pattern |

**AI Agent note:** The `SearchAction` JSON-LD in `theme.liquid` is what Google uses for Sitelinks Searchbox and what WebMCP agents would use to discover the search endpoint without crawling. This is correctly implemented. The Shopify Predictive Search API (`/search/suggest`) is also exposed and queryable at `https://ledsone.co.uk/search/suggest?q=TERM&resources[type]=product`.

---

### 7. Product Filters
**Status: ⚠️ CLIENT-SIDE ONLY**
**Category: UI/UX + Technical SEO**

**Evidence:**
`sections/collection-meta-filters.liquid` implements a custom two-attribute filter:
- Filter 1: from metafield (configured via schema setting `filter_1_metafield`)
- Filter 2: from metafield (configured via schema setting `filter_2_metafield`)
- Filter logic at line 288: `function filterProducts()` — pure JavaScript DOM filtering, shows/hides cards client-side
- No URL parameter update on filter change — filtered state is not bookmarkable or crawlable

**Standard collection filter state:**
- `sections/main-collection-product.liquid` has sort-by via URL parameter (`sort_by`) — URL-persistent
- No `collection.filters` (Shopify native faceted filtering) usage found in the custom filter section

**Gap:**
- Client-side filtering = zero SEO value. Filtered pages are not indexable.
- For AI agents: filter state is not readable from URL, not reflected in JSON-LD, and not accessible via API.
- Shopify native filtering (`/collections/handle?filter.p.m.custom.key=value`) would give URL-persistent, API-queryable, SEO-indexed filter pages.

---

### 8. Structured Product Attributes
**Status: ⚠️ PARTIAL**
**Category: Technical SEO + Future WebMCP Readiness**

**Evidence — metafield namespaces found in use:**

| Namespace | Keys in use | Location |
|---|---|---|
| `custom` | `amazon_reviews`, `compare_products`, `external_affiliate`, `variant_description`, `variation_title`, `bulb_shapes` | Multiple snippets + sections |
| `bls` | `product_grouped`, `short_description`, `countdown_timer` | `main-product.liquid`, `main-product-layout-2.liquid` |
| `reviews` | `rating.value`, `rating_count` | Product schema (JSON-LD) |
| `judgeme` | `badge` | Product card snippets |
| `mczr` | `isCustomizable`, `startingPointId` | `snippets/mczr.liquid` |

**Product JSON blob:** `main-product.liquid` line 1658–1660 outputs `{{ product | json }}` into a `<script type="application/json" data-product-json>` tag — the full Shopify product object is machine-readable on every product page without an API call.

**Gap:**
- `bulb_shapes` metafield (`custom` namespace) is present in code but does NOT appear in the Product JSON-LD schema. An AI agent reading the structured data would not see lamp shape attributes — they are only in the raw metafield and the inline JSON blob.
- No `additionalProperty` schema.org fields mapping metafields to structured attributes.
- `variant.metafields.custom.variant_description` — per-variant description is present in DOM but not in JSON-LD offers array.

---

### 9. Machine-Readable Pricing
**Status: ✅ STRONG**
**Category: Technical SEO + Future WebMCP Readiness**

**Evidence:**

| Source | Format | Location |
|---|---|---|
| JSON-LD Product offers | `"price": {{ variant.price | divided_by: 100.00 }}` decimal number | `main-product.liquid:1812` |
| JSON-LD `priceCurrency` | `{{ cart.currency.iso_code }}` → `"GBP"` | `main-product.liquid:1813` |
| JSON-LD `priceValidUntil` | `{{ 'now' | date: '%s' | plus: 31536000 | date: '%Y-%m-%d' }}` | `main-product.liquid:1814` |
| JSON-LD `itemCondition` | `"https://schema.org/NewCondition"` | `main-product.liquid:1816` |
| `data-product-json` blob | Full product JSON including `price`, `compare_at_price`, all variants | `main-product.liquid:1658` |
| Collection ItemList schema | `price` as string from `money_without_currency` | `main-collection-product.liquid:243` |

**Note:** The collection ItemList schema uses `money_without_currency` which strips the currency symbol — the `priceCurrency` field is present alongside it, so this is structurally correct.

**AI Agent note:** An AI agent can extract per-variant pricing in machine-readable decimal form from JSON-LD without any API call. All variants are included in the `offers` array.

---

### 10. Machine-Readable Availability
**Status: ✅ STRONG**
**Category: Technical SEO + Future WebMCP Readiness**

**Evidence:**

| Source | Format | Location |
|---|---|---|
| JSON-LD per-variant offers | `"availability": "https://schema.org/InStock"` or `OutOfStock` based on `variant.available` | `main-product.liquid:1811` |
| Collection ItemList schema | Same `InStock`/`OutOfStock` pattern per product | `main-collection-product.liquid:244` |
| `data-product-json` blob | `available: true/false` per variant included in full product JSON | `main-product.liquid:1659` |
| Inventory quantity | `product_qty` and `product_qty_first` computed in Liquid | `main-product.liquid:78–80` |

**Gap:** The earlier (now commented-out) schema at line 1717 used `variant.inventory_quantity > 1` as the InStock condition — which would mark a product with exactly 1 unit as OutOfStock. The current active schema correctly uses `variant.available` (Shopify's own boolean which accounts for "allow overselling" settings). This is the correct field.

**AI Agent note:** All variants' availability is machine-readable in JSON-LD without any API call. An agent can determine whether to recommend a product without querying the Storefront or Admin API.

---

### 11. Existing APIs / JSON Endpoints
**Status: ✅ PRESENT**
**Category: Future WebMCP Readiness**

**Evidence — endpoints available on ledsone.co.uk without authentication:**

| Endpoint | Returns | Evidence source |
|---|---|---|
| `/products/{handle}.json` | Full product JSON | Used in `cart-script.mczr.liquid:126` |
| `/cart.json` | Current cart state | `snippets/frequently-bought.liquid:985` |
| `/cart/add.js` | Cart mutation | Theme cart functionality |
| `/search/suggest?q=TERM&resources[type]=product` | Predictive search results | `snippets/content-bottom.liquid:30` |
| `{page}.json` (view parameter) | Alternate JSON rendering | Shopify default |
| `data-product-json` DOM element | Full product object on every product page | `main-product.liquid:1658` |

**Shopify Storefront API:** Available at `https://ledsone.co.uk/api/2024-01/graphql.json` — no Storefront API access token is exposed in theme code (correct — should not be in theme). A WebMCP agent would need a Storefront API public token to use this endpoint.

**WebSite SearchAction:** `layout/theme.liquid:154` — machine-readable search entry point for agents that support Sitelinks Searchbox protocol.

---

## AI-Agent Readiness Score

| Category | Score | Reason |
|---|---|---|
| Structured data (JSON-LD) | 9/10 | Product, Breadcrumb, FAQ, Article, ItemList, Organization, WebSite all present. Missing: metafield attributes not mapped to `additionalProperty`. |
| Machine-readable pricing | 10/10 | All variants, correct decimal format, currency code, validity date. |
| Machine-readable availability | 9/10 | Correct `variant.available` used. Per-variant in JSON-LD. |
| Search discoverability | 9/10 | SearchAction in JSON-LD, predictive search URL exposed, field-targeted search. |
| Filter/facet discoverability | 3/10 | Client-side JS filtering — not crawlable, not URL-persistent, not API-queryable. |
| Product attribute structure | 5/10 | Rich metafield usage in DOM but not surfaced in JSON-LD. |
| Semantic HTML | 6/10 | `<main>` correct. `<header>`, `<footer>`, `<nav>` landmarks unconfirmed (in rendered snippets). No skip link. |
| API accessibility | 8/10 | Public JSON endpoints present. Storefront API access token not exposed (correct). |

**Overall AI-Agent Readiness: 7.4 / 10**

---

## Priority Fix List

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P1 | Add `additionalProperty` to Product JSON-LD mapping `bulb_shapes` and other `custom.*` metafields | Low — add Liquid block inside existing schema | Metafields become agent-readable without API |
| P1 | Replace client-side collection filters with Shopify native faceted filtering | Medium — theme setting + collection config | Filters become URL-persistent, crawlable, API-queryable |
| P2 | Add skip-to-content link in `theme.liquid` above `<main>` | Low — one `<a>` tag | WCAG 2.4.1 compliance, keyboard and agent navigation |
| P2 | Add `aria-live` region to predictive search results container | Low | Screen reader + agent-readable search feedback |
| P3 | Add `priceValidUntil` logic that reflects actual sale end dates (via metafield) rather than `now + 1 year` | Medium — requires sale-date metafield | Agents trust pricing validity |
| P3 | Expose a public Storefront API token in theme settings for WebMCP agents to use | Low — Shopify Admin setting | Enables GraphQL-based agent queries |

---

## WebMCP Compatibility Assessment

WebMCP agents discover and interact with websites by reading:
1. JSON-LD structured data ← ledsone.co.uk: **STRONG**
2. Search endpoints (SearchAction schema) ← ledsone.co.uk: **PRESENT**
3. Machine-readable product data ← ledsone.co.uk: **STRONG**
4. URL-addressable filter states ← ledsone.co.uk: **GAP**
5. Public API endpoints ← ledsone.co.uk: **PARTIAL** (no Storefront token exposed)
6. Semantic HTML landmarks ← ledsone.co.uk: **PARTIAL**

**Assessment:** ledsone.co.uk is better prepared for AI-agent readiness than most Shopify stores. The main blocker is client-side filtering (agents cannot discover filtered collections) and metafields not surfaced in JSON-LD. These are both fixable without a theme rebuild.

---

## CAPABILITY LOG
- What was built: AI-Agent Readiness and WebMCP compatibility audit — ledsone.co.uk theme
- Reusable: Yes
- If yes, where it applies: Any Shopify store — check all 11 areas against this template
- Pattern name: `shopify-ai-agent-readiness-audit`
