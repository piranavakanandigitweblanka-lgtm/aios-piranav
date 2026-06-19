# Electricalsone Theme Layout Audit
**Date:** 2026-06-19
**Theme:** `theme_export__electricalsone-co-uk-back-up-of-electricalsone-2-0__18JUN2026-0512am`
**Scope:** Homepage · Collection Page · Product Page
**Type:** Read-only assessment — no code modified
**Benchmarks:** lampspares.co.uk (hanging parts page) · yesss.co.uk (EV charger product page)

---

## HOMEPAGE

### Current Section Structure

| # | Section Type | Status | Purpose |
|---|---|---|---|
| 1 | `custom-liquid` — promo image + Shop Now | **DISABLED** | Weekly promotion banner |
| 2 | `slideshow` — single slide | **DISABLED** | Hero slideshow |
| 3 | `category-navigation` — 8 pill tabs | **DISABLED** | Quick-nav by category |
| 4 | AI hero block — search + trust badges | **ACTIVE** | Hero with search bar |
| 5 | `just-for-you` — 12-product carousel | **ACTIVE** | "Just For You" products |
| 6 | `product-collection-showcase` — 2 cards | **ACTIVE** | Cable + Lamp Shades highlight |
| 7 | `custom-liquid` — stats (2M+, 10K+ SKUs) | **DISABLED** | Social proof numbers |
| 8 | `category-grid` — 11 icon categories | **ACTIVE** | Browse by category |
| 9 | `custom-liquid` — component flow explainer | **ACTIVE** | Educational content |
| 10 | `selective-collection-grid` — LED Bulbs (5 products) | **ACTIVE** | Featured products |
| 11–22 | 12 further sections | **ALL DISABLED** | Various collection grids, builders, tabs |

**File:** `templates/index.json`
**Active section count:** 6 of 22

---

### UX Weaknesses — Homepage

**1. No strong hero above the fold**
The AI-generated hero is a plain white text block with a search bar and badge chips. There is no lifestyle photography, no headline, no emotional hook. First-time visitors see a generic utility block with no brand identity. Lampspares.co.uk opens with a clear category-led visual layout that immediately shows product types and trust signals together.

**2. Stats section disabled — major missed opportunity**
The "2M+ Components Supplied / 10,000+ SKUs / Same Day Dispatch / Trade Accounts Welcome" block is coded and configured but DISABLED. These are the exact proof points a B2B buyer needs to choose Electricalsone over a competitor. This should be in the top 3 sections.

**3. Category navigation disabled**
The 8-pill tab navigation (All, Ceiling Roses, Cables, Holders, etc.) is built and ready but disabled. Without it, new visitors must scroll through a large category grid to find their category. Lampspares surfaces category links immediately below the hero.

**4. "Just For You" carousel logic is generic**
It pulls from the `buy-all-lighting-components-online` collection — every visitor sees the same 12 products regardless of browsing history. On a store with 10,000+ SKUs this is a conversion miss. True personalisation or at minimum a "Popular Right Now" label would convert better.

**5. Product Collection Showcase only 2 active cards**
2 of 4 collection cards are disabled (one had US shipping copy, one had bulk discount copy). Only Cable and Lamp Shades are visible. The section feels half-finished. Yesss.co.uk uses a clear category card grid with consistent formatting.

**6. Educational "How Components Work Together" is buried**
This content (Power Source → Cable → Holder → Fixing → Shade) is genuinely valuable for trade buyers building lighting kits. It is placed after the category grid — position 9 of 10. It should be closer to the top, alongside the hero, to help buyers understand the product ecosystem before they scroll.

**7. 16 disabled sections create confusion**
The template has 22 sections, 16 of which are disabled. This creates theme-editor confusion, makes performance harder to audit, and risks accidental reactivation. Disabled sections with stale content (US shipping copy, old collection references) should be removed.

---

### Conversion Weaknesses — Homepage

| Weakness | Impact |
|---|---|
| No delivery/dispatch USP visible above fold | Trade buyers bounce if they can't quickly confirm next-day or same-day availability |
| Stats section disabled | No social proof — "2M+ components" is a trust anchor, not there |
| No promotional banner active | Weekly promotion exists as a section but is disabled — missed revenue |
| "Just For You" not personalized | Low click-through — visitors don't recognise the selection as relevant |
| No clear trade account CTA | B2B audience has no path to trade pricing from the homepage |

---

### Suggested Improvements — Homepage

| Priority | Change | Complexity |
|---|---|---|
| P1 | Enable stats block (2M+, 10K+ SKUs, Same Day, Trade) — move to position 2 | Low — enable existing section |
| P2 | Enable category navigation pills — move to position 3 | Low — enable existing section |
| P3 | Enable and update weekly promotion banner — position 1 | Low — update image/link, enable |
| P4 | Add a hero image/slideshow with headline and CTA above AI search block | Medium — new content + section config |
| P5 | Replace "Just For You" with "Best Sellers" or "New Arrivals" collection | Low — change collection handle |
| P6 | Move component flow explainer to position after category grid | Low — reorder sections |
| P7 | Add a Trade Account CTA strip above footer | Medium — new section |
| P8 | Remove or archive 16 disabled sections | Low — cleanup |

---

## COLLECTION PAGE

### Current Section Structure

| # | Section Type | Status | Purpose |
|---|---|---|---|
| 1 | `breadcrumbs` | **DISABLED** | Navigation trail |
| 2 | `collection-list` | **DISABLED** | Sub-collection links |
| 3 | `main-collection-banner` | **DISABLED** | Collection title + image header |
| 4 | `main-collection-product-grid` | **DISABLED** | Full grid with filters + sorting |
| 5 | `featured-promotion-two` | **DISABLED** | Trust icons (shipping, returns, payment) |
| 6 | `main-collection-show` | **DISABLED** | Alt product grid (AI-built) |
| 7 | AI-generated collection grid block | **ACTIVE** | Primary product grid |
| 8 | `custom-liquid` — collection description | **ACTIVE** | SEO description output |
| 9 | `custom-liquid` — FAQ schema render | **ACTIVE** | FAQ structured data |

**File:** `templates/collection.json`
**Active section count:** 3 of 9

---

### UX Weaknesses — Collection Page

**1. No collection banner or title header**
The main-collection-banner is disabled. When a user lands on any collection page there is no visible collection title, no description above the grid, no category image. Lampspares.co.uk shows a clear category header with the category name, short description, and sub-category links.

**2. No breadcrumbs**
Breadcrumbs are disabled. Users navigating from homepage → category grid → collection have no orientation trail. On a store with 11+ category types this is a navigation problem.

**3. No active filters or sorting**
The `main-collection-product-grid` (with filtering and sorting built in) is disabled. The AI-generated replacement grid has no filter sidebar. Buyers searching for a specific cable type, fitting, or IP rating within a collection have no way to narrow results. Lampspares.co.uk has prominent faceted filtering — essential for a trade/electrician audience.

**4. No sub-collection navigation**
The `collection-list` section is disabled. Buyers see all products at once with no way to drill into sub-types.

**5. Trust icons not shown on collection pages**
The `featured-promotion-two` (shipping / returns / payment icons) is disabled.

**6. Collection description below grid**
The description renders at the bottom of the page after the product grid. For SEO and buyer orientation it should appear above the grid.

---

### Conversion Weaknesses — Collection Page

| Weakness | Impact |
|---|---|
| No active filtering | Trade buyers with specific technical requirements cannot filter — they leave |
| No breadcrumbs | Disorientation leads to back-navigation instead of clicking through |
| No collection header | No context for what the collection contains — hurts SEO and orientation |
| No dispatch/trust signal | Trade buyers need to see "In Stock" and "Same Day Dispatch" on collection pages |
| Description below grid | SEO content not seen by buyers; collection pages rank poorly |

---

### Suggested Improvements — Collection Page

| Priority | Change | Complexity |
|---|---|---|
| P1 | Enable breadcrumbs | Low — enable existing section |
| P2 | Enable main-collection-banner | Low — enable existing section |
| P3 | Enable main-collection-product-grid with filtering | Low — enable, disable AI block |
| P4 | Move collection description above product grid | Low — reorder sections |
| P5 | Add stock/dispatch badge strip below banner | Medium — new section or metafield |
| P6 | Enable collection-list sub-collection tiles | Low — enable + configure |

---

## PRODUCT PAGE

### Current Section Structure

| # | Section Type | Status | Purpose |
|---|---|---|---|
| 1 | `breadcrumbs` | **DISABLED** | Navigation trail |
| 2 | `category-navigation` | **DISABLED** | Category pill nav |
| 3 | `trust-badge` — PayPal, Google Pay, Shop Pay | **ACTIVE** | Payment trust icons |
| 4 | `custom-liquid` — spacer div | **ACTIVE** | Layout spacer only |
| 5 | `main-product` | **ACTIVE** | Core product section |
| → | · Announcement metafield text | **ACTIVE** | Custom message from metafield |
| → | · Title, Rating, Price | **ACTIVE** | Core product info |
| → | · Inventory indicator | **ACTIVE** | Stock level bar |
| → | · Variant picker + Buy buttons | **ACTIVE** | Purchase actions |
| → | · Collapsibles: Delivery / Shipping / Discounts | **ACTIVE** | Info accordions |
| → | · Countdown, Upsell, Reviews (all 3) | **DISABLED** | Inactive features |
| 6 | JudgeMe apps section | **DISABLED** | Full review section |
| 7 | `featured-collection` — People Also Bought | **DISABLED** | Cross-sell carousel |
| 8 | `recently_viewed_product` | **DISABLED** | Recently viewed |
| 9 | FAQ schema render | **ACTIVE** | Structured data |
| 10 | AI recommendations — "You may also like" | **ACTIVE** | Recommendations carousel |
| 11 | `product-recommendations` | **DISABLED** | Shopify native recommendations |
| 12 | `product-details-tabs` | **ACTIVE** | Tabbed content |
| → | · Description tab | **DISABLED** | Product description |
| → | · Reviews tab | **DISABLED** | JudgeMe reviews |
| → | · Shipping & Return tab | **ACTIVE** | Generic copy |
| → | · Return Policy tab | **ACTIVE** | Links to return-policy page |
| → | · FAQs tab | **DISABLED** | FAQ render |
| 13 | Compare Products | **ACTIVE** | Comparison widget |
| 14 | JudgeMe reviews (section-level) | **ACTIVE** | Full review widget |

**File:** `templates/product.json`

---

### UX Weaknesses — Product Page

**1. Description tab is DISABLED**
The product description tab is disabled — buyers see nothing when clicking "Description". This is the most critical failure. Trade buyers need specification data (cable type, IP rating, material, dimensions) to make purchasing decisions. Yesss.co.uk shows full technical spec tables prominently on every product page.

**2. Reviews buried**
Four separate review blocks exist; the tab and panel blocks are disabled. Only the section-level JudgeMe at the bottom is active — most buyers never scroll that far.

**3. No cross-sell active**
"People Also Bought" is disabled. For a components store where buyers need matching accessories (cable + holder + ceiling rose), cross-selling is a significant AOV lever.

**4. Hardcoded discount codes**
The Discounts collapsible contains hardcoded codes (`b2bes100@`, `CUS_OFFER_15`) with no expiry logic — visible to all visitors including non-trade.

**5. Metafield typo**
`product.metafields.custom.announcement_messsage_` (triple-s typo) — silent fail if key is queried elsewhere.

**6. Spacer section**
`custom_liquid_EDUXAj` is just `<div style="margin-bottom: 20px;"></div>` — a full section slot wasted on a spacing hack.

---

### Conversion Weaknesses — Product Page

| Weakness | Impact |
|---|---|
| Description tab disabled | No spec data visible — technical buyers bounce |
| No cross-sell active | Lost AOV — buyers building a kit need matching parts |
| Reviews buried below fold | Social proof not seen at point of purchase decision |
| Hardcoded discount codes | Non-targeted, expiry risk, visible to all visitors |
| No breadcrumbs | Navigation friction |
| FAQs tab disabled | Pre-purchase questions unanswered |

---

### Suggested Improvements — Product Page

| Priority | Change | Complexity |
|---|---|---|
| P1 | Enable Description tab in product-details-tabs | Low — enable block |
| P2 | Enable Reviews tab (or move JudgeMe to in-panel) | Low — enable block |
| P3 | Enable "People Also Bought" cross-sell carousel | Low — enable section |
| P4 | Enable breadcrumbs | Low — enable section |
| P5 | Enable FAQs tab | Low — enable block |
| P6 | Fix metafield typo + add blank guard | Low |
| P7 | Replace hardcoded discount codes with metafield-driven values | Medium |
| P8 | Remove spacer custom-liquid — use CSS padding instead | Low |
| P9 | Consolidate review widgets — keep section-level JudgeMe only | Low |

---

## Cross-Page Summary

| Issue | Homepage | Collection | Product |
|---|---|---|---|
| Breadcrumbs missing | — | ✗ | ✗ |
| No trust/dispatch signal | ✗ | ✗ | Partial |
| Key sections disabled | ✗ | ✗ | ✗ |
| Social proof weak | ✗ | — | ✗ |
| SEO content position wrong | Partial | ✗ | ✗ |

### Top 5 Fixes (By Conversion Impact — Zero New Code Required)

| Rank | Fix | Pages | Time |
|---|---|---|---|
| 1 | Enable product Description tab | Product | 5 min |
| 2 | Enable collection banner + breadcrumbs | Collection, Product | 10 min |
| 3 | Enable homepage stats block (2M+, 10K+ SKUs) | Homepage | 5 min |
| 4 | Enable collection filtering (main-collection-product-grid) | Collection | 10 min |
| 5 | Enable cross-sell + Reviews on product page | Product | 10 min |

---

## Benchmark Comparison

### vs lampspares.co.uk
| Feature | Lampspares | Electricalsone | Gap |
|---|---|---|---|
| Category header with image | ✓ | ✗ disabled | Enable main-collection-banner |
| Faceted filtering | ✓ | ✗ disabled | Enable product grid with filters |
| Sub-category navigation | ✓ | ✗ disabled | Enable collection-list |
| Breadcrumbs | ✓ | ✗ | Enable breadcrumbs |
| Stock/dispatch on collection | ✓ | ✗ | Add badge strip |

### vs yesss.co.uk
| Feature | YESSS | Electricalsone | Gap |
|---|---|---|---|
| Technical spec table | ✓ | ✗ disabled | Enable description tab |
| Reviews in product panel | ✓ | ✗ disabled | Enable JudgeMe in-panel |
| Frequently bought together | ✓ | ✗ disabled | Enable cross-sell section |
| Clear dispatch cut-off | ✓ | Vague collapsible | Add dynamic dispatch messaging |
| Breadcrumbs | ✓ | ✗ | Enable breadcrumbs |

---

## Risk Register

| Risk | Severity | Notes |
|---|---|---|
| Metafield typo `announcement_messsage_` | Medium | Silent fail — verify in Shopify Admin metafields |
| Hardcoded discount codes | Medium | Expiry unmanaged, visible to all visitors |
| 16 disabled homepage sections | Low | Stale content risk if accidentally re-enabled |
| JudgeMe in 4 locations | Low | Potential double-render — consolidate to 1 |

---

## CAPABILITY LOG
- What was built: Full layout audit — homepage, collection page, product page
- Reusable: Yes
- If yes, where it applies: Any Shopify store audit against competitor benchmarks
- Pattern name: `shopify-layout-audit-three-page`
