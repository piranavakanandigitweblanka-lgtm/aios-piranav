# LEDsone — AI Lighting Advisor
# Standalone Question-Based Product Search System
# Technical Design Document

**Date:** 2026-06-23
**Role:** Senior Shopify Search Engineer
**Status:** Design only — zero code written or modified
**Risk Level:** 🟢 Green (new standalone feature, no existing files touched)

---

## 1. Architecture Design

### 1.1 System Philosophy

The AI Lighting Advisor is a **completely isolated feature** that lives alongside — never inside — the existing predictive search. It:

- Introduces its own trigger, modal, JS engine, and CSS
- Makes its own API calls to Shopify's Predictive Search JSON endpoint
- Renders its own product cards client-side
- Shares zero code with `BlsSearchShopify` or any existing search logic
- Can be removed by deleting 4 files and one `{% section %}` tag — nothing else breaks

---

### 1.2 API Strategy — Why JSON, Not Section Rendering

The existing search uses `section_id` to fetch pre-rendered HTML from Shopify. The AI Advisor uses a different approach: the **Predictive Search JSON API**.

```
Existing search:
  fetch(/search/suggest?q=...&section_id=search-predictive-list)
  → Shopify renders liquid section → returns HTML → inject into DOM

AI Advisor:
  fetch(/search/suggest?q=...&resources[type]=product&resources[limit]=10)
  → Shopify returns raw JSON product data → JS renders custom cards
```

**Why JSON is better for this feature:**

| Concern | Section HTML approach | JSON approach |
|---------|----------------------|---------------|
| UI control | Limited to Liquid template | Full JS freedom |
| Client-side sorting | Impossible | Sort by availability, price, relevance |
| Variant matching | Server-side only | JS can match any variant option |
| Score-based ranking | No | JS can assign intent match scores |
| Zero-result fallback | Requires second server request | Handled entirely in JS |
| Custom card layout | Requires new Liquid section | Pure JS render |

**Confirmed available:** `window.routes.predictive_search_url` is set globally in `snippets/content-bottom.liquid` (line 30). No Liquid variable injection needed in the new section.

---

### 1.3 Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│  sections/ai-search-assistant.liquid                                │
│  ─────────────────────────────────────────────────────────────────  │
│  • Widget trigger button (floating or inline)                       │
│  • Modal shell (header, search input, suggestions, results area)    │
│  • Schema settings (feature toggle, example queries, colours)       │
│  • Loads ai-search-assistant.css + ai-search-assistant.js           │
│                                                                     │
│  snippets/ai-search-results.liquid                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  • Renders "popular products" initial state (before any search)     │
│  • Uses a merchant-selected collection for seed products            │
│  • Server-rendered only — no JS dependency                          │
│                                                                     │
│  assets/ai-search-assistant.js                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  • Self-contained IIFE — window.LedsoneAdvisor                      │
│  • Intent engine (stop words, room dict, synonym dict)              │
│  • Query transformer                                                │
│  • Shopify JSON API caller                                          │
│  • Availability sorter                                              │
│  • Variant matcher                                                  │
│  • Result scorer and ranker                                         │
│  • DOM renderer (product cards)                                     │
│  • Analytics logger                                                 │
│                                                                     │
│  assets/ai-search-assistant.css                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  • Modal styles                                                     │
│  • Product card styles                                              │
│  • Thinking animation                                               │
│  • Mobile responsive                                                │
│  • Namespaced under .leds-advisor — zero CSS conflicts              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 1.4 Data Flow Architecture

```
MERCHANT SETUP
  ↓
  sections/ai-search-assistant.liquid schema settings:
    - Feature enabled/disabled toggle
    - Widget position (floating bottom-right / inline section)
    - Accent colour
    - Example query chips (4 configurable)
    - Seed collection (for initial popular products)
    - Max results to show (4–12)


RUNTIME — USER OPENS ADVISOR
  ↓
  User clicks trigger button
  ↓
  Modal opens (CSS transition)
  ↓
  snippets/ai-search-results.liquid pre-renders
  seed collection products as "popular picks"
  (server-side, available on page load — instant)


RUNTIME — USER TYPES QUERY
  ↓
  input[type="text"] #leds-advisor-input
  ↓
  input event → debounced 400ms (slightly longer than header search
  300ms to avoid conflict and double API calls)
  ↓
  LedsoneAdvisor.processQuery(rawInput)
    ├─ Step 1: normalise (lowercase, trim, collapse whitespace)
    ├─ Step 2: detect multi-word phrases (before splitting)
    ├─ Step 3: strip stop words
    ├─ Step 4: intent dictionary lookup
    ├─ Step 5: inject intent terms
    └─ Step 6: build final query string (max 5 tokens)
  ↓
  LedsoneAdvisor.fetchProducts(transformedQuery, originalQuery)
    ├─ Primary fetch:  /search/suggest.json?q=TRANSFORMED_QUERY
    │    resources[type]=product
    │    resources[limit]=10
    │    resources[options][fields]=title,tag,vendor,product_type,
    │                               variants.title,variants.sku,body_html
    │    resources[options][prefix]=last
    │    resources[options][unavailable_products]=last
    │
    └─ Fallback fetch (if primary returns 0 results):
         /search/suggest.json?q=STRIPPED_QUERY (stop words removed only, no intent)
         ↓ if still 0 results:
         /search/suggest.json?q=FIRST_MEANINGFUL_TOKEN (single broadest term)
  ↓
  LedsoneAdvisor.processResults(products, originalQuery, transformedQuery)
    ├─ Score each product (see scoring model)
    ├─ Sort: available first, then by score descending
    ├─ Variant match: find best matching variant per product
    └─ Slice to maxResults setting
  ↓
  LedsoneAdvisor.render(scoredProducts)
    ├─ Clear results container
    ├─ Show "Searching for: [transformed term]" label
    ├─ Render N product cards
    └─ Render "View all results →" link (to /search page)
```

---

## 2. File Structure

### 2.1 File Inventory

```
NEW FILES (4 total):

sections/
  ai-search-assistant.liquid        ← Section: widget shell + schema

snippets/
  ai-search-results.liquid          ← Snippet: initial popular products

assets/
  ai-search-assistant.js            ← JS: intent engine + API + renderer
  ai-search-assistant.css           ← CSS: all visual styles
```

**Files modified:** ZERO
**Files deleted:** ZERO

---

### 2.2 sections/ai-search-assistant.liquid — Content Breakdown

```
[SCHEMA]
  Settings group: Widget
    - enable_advisor (checkbox, default true)
    - widget_position (select: floating-right, floating-left, inline)
    - max_results (range: 4–12, default 6)
    - accent_color (color, default #1a1a2e)

  Settings group: Search Suggestions (Example Chips)
    - suggestion_1 (text, default: "Pendant light for kitchen island")
    - suggestion_2 (text, default: "Wall light for hallway")
    - suggestion_3 (text, default: "Lampshade for E27 bulb")
    - suggestion_4 (text, default: "Industrial ceiling light")

  Settings group: Initial Products
    - seed_collection (collection picker)
    - seed_heading (text, default: "Popular Lighting")

  Presets:
    name: "AI Lighting Advisor"

[HTML]
  ─ Trigger Button
    <button class="leds-advisor__trigger" id="leds-advisor-trigger"
            aria-label="Ask our AI Lighting Advisor"
            aria-expanded="false"
            aria-controls="leds-advisor-modal">
      [SVG lightbulb icon]
      <span>Ask our Lighting Advisor</span>
    </button>

  ─ Modal Overlay
    <div class="leds-advisor__overlay" id="leds-advisor-overlay" aria-hidden="true">
    </div>

  ─ Modal Panel
    <div class="leds-advisor__modal" id="leds-advisor-modal"
         role="dialog"
         aria-modal="true"
         aria-label="AI Lighting Advisor">

      ─ Header
        <div class="leds-advisor__header">
          [SVG icon] AI Lighting Advisor
          <button class="leds-advisor__close" aria-label="Close">✕</button>
        </div>

      ─ Search Input
        <div class="leds-advisor__search-bar">
          <input type="text"
                 id="leds-advisor-input"
                 placeholder="Describe what you need..."
                 maxlength="200"
                 autocomplete="off"
                 autocorrect="off"
                 spellcheck="false">
          <button class="leds-advisor__search-btn" aria-label="Search">→</button>
        </div>

      ─ Suggestion Chips (populated from schema)
        <div class="leds-advisor__suggestions">
          <span class="leds-advisor__suggestions-label">Try asking:</span>
          <div class="leds-advisor__chips">
            {%- for i in (1..4) -%}
              {%- assign chip_key = 'suggestion_' | append: i -%}
              {%- assign chip_text = section.settings[chip_key] -%}
              {%- if chip_text != blank -%}
                <button class="leds-advisor__chip"
                        data-query="{{ chip_text | escape }}">
                  {{ chip_text | escape }}
                </button>
              {%- endif -%}
            {%- endfor -%}
          </div>
        </div>

      ─ Status / Thinking Indicator
        <div class="leds-advisor__status" id="leds-advisor-status"
             aria-live="polite" hidden>
        </div>

      ─ Results Container
        <div class="leds-advisor__results" id="leds-advisor-results">
          {%- render 'ai-search-results',
              collection: collections[section.settings.seed_collection],
              heading: section.settings.seed_heading,
              limit: section.settings.max_results -%}
        </div>

      ─ View All Link
        <div class="leds-advisor__footer" id="leds-advisor-footer" hidden>
          <a class="leds-advisor__view-all"
             href="/search"
             id="leds-advisor-view-all">
            View all results →
          </a>
        </div>

    </div><!-- /modal -->

[DATA ATTRIBUTES — passed to JS from Liquid]
  <div id="leds-advisor-config"
       data-max-results="{{ section.settings.max_results }}"
       data-accent="{{ section.settings.accent_color }}"
       data-search-url="{{ routes.search_url }}"
       data-predictive-url="{{ routes.predictive_search_url }}"
       hidden>
  </div>

[ASSET LOADING]
  {{ 'ai-search-assistant.css' | asset_url | stylesheet_tag }}
  <script src="{{ 'ai-search-assistant.js' | asset_url }}" defer></script>
```

---

### 2.3 snippets/ai-search-results.liquid — Content Breakdown

Renders the "initial state" product grid (popular/featured products shown before any query is typed). Server-rendered — no JS dependency.

```
Parameters accepted:
  collection  → Shopify collection object
  heading     → string
  limit       → integer (4–12)

Output:
  ─ If collection exists and has products:
    <div class="leds-advisor__initial-state">
      <p class="leds-advisor__section-heading">{{ heading }}</p>
      <div class="leds-advisor__grid">
        {%- for product in collection.products limit: limit -%}
          <a href="{{ product.url }}" class="leds-advisor__card">
            <div class="leds-advisor__card-img">
              <img src="{{ product.featured_image | image_url: width: 200 }}"
                   alt="{{ product.title | escape }}"
                   width="200" height="200"
                   loading="lazy">
            </div>
            <div class="leds-advisor__card-body">
              <p class="leds-advisor__card-title">{{ product.title }}</p>
              <p class="leds-advisor__card-price">
                {{ product.price_min | money }}
              </p>
              {%- unless product.available -%}
                <span class="leds-advisor__card-oos">Out of stock</span>
              {%- endunless -%}
            </div>
          </a>
        {%- endfor -%}
      </div>
    </div>

  ─ If no collection or empty:
    [Empty — JS renders a neutral placeholder message]
```

---

### 2.4 assets/ai-search-assistant.js — Module Breakdown

Self-contained IIFE wrapping `window.LedsoneAdvisor`. No dependencies on jQuery, theme.js, or BlsSearchShopify.

```
window.LedsoneAdvisor = (function() {

  ─ CONFIG
    Reads from #leds-advisor-config data attributes:
      maxResults, accentColor, searchUrl, predictiveUrl

  ─ INTENT ENGINE
    STOP_WORDS array (35 words — see Phase 2 design)
    ROOM_INTENT object (10 room mappings)
    PRODUCT_SYNONYMS object (19 synonym mappings)

  ─ PUBLIC METHODS
    init()                          → called on DOMContentLoaded
    open()                          → opens modal
    close()                         → closes modal
    processQuery(rawInput)          → full transformation pipeline
    fetchProducts(query, fallbacks) → API calls with fallback chain
    processResults(products, query) → score + sort + variant match
    render(scoredProducts, meta)    → DOM rendering

  ─ PRIVATE METHODS
    _normalise(str)                 → lowercase, trim, collapse whitespace
    _detectPhrases(str)             → find multi-word room phrases
    _stripStopWords(tokens)         → remove stop words
    _applyIntentDict(tokens, phrases) → room intent expansion
    _scoreProduct(product, tokens)  → relevance scoring
    _matchVariant(product, tokens)  → find best variant
    _formatPrice(cents)             → "£19.99" from Shopify price integer
    _buildViewAllUrl(query)         → /search?q=...&type=product&options[fields]=...
    _debounce(fn, ms)               → standard debounce utility
    _log(original, transformed)     → analytics logging

})();
```

---

### 2.5 assets/ai-search-assistant.css — Structural Breakdown

```
Namespace: .leds-advisor__*   (prevents all conflicts with existing styles)

Sections:
  1. CSS custom properties (accent colour from schema)
  2. Trigger button (floating position: fixed bottom-right OR inline)
  3. Modal overlay (backdrop, fade in/out)
  4. Modal panel (slide-up animation, max-width 720px)
  5. Header (title, close button)
  6. Search bar (input + submit button)
  7. Suggestion chips (horizontal scroll on mobile)
  8. Status / thinking indicator (animated dots)
  9. Results grid (responsive: 2 cols mobile, 3 cols desktop)
  10. Product card (image, title, price, stock badge, variant label)
  11. "View all" footer link
  12. Empty / zero-result state
  13. Mobile overrides (≤767px)
  14. Reduced motion support (@media prefers-reduced-motion)
  15. Focus management (visible focus rings for keyboard nav)
```

---

## 3. Search Flow — Step by Step

### 3.1 Full Query Pipeline

```
RAW INPUT: "What pendant light is best for a kitchen island?"

STEP 1 — NORMALISE
  lowercase:     "what pendant light is best for a kitchen island?"
  strip punct:   "what pendant light is best for a kitchen island"
  collapse ws:   "what pendant light is best for a kitchen island"

STEP 2 — PHRASE DETECTION (longest match first)
  scan for room phrases:
    "kitchen island" → DETECTED (length 2)
    token marked as: ["what","pendant","light","is","best","for","a",
                       [PHRASE:kitchen island]]

STEP 3 — STOP WORD REMOVAL
  remove from non-phrase tokens:
    "what"   → REMOVE (question starter)
    "is"     → REMOVE (modal verb)
    "best"   → REMOVE (qualifier)
    "for"    → REMOVE (preposition)
    "a"      → REMOVE (article)
  remaining:  ["pendant", "light", [PHRASE:kitchen island]]

STEP 4 — INTENT DICTIONARY LOOKUP
  [PHRASE:kitchen island] → {
    inject_terms: ["pendant", "hanging"],
    product_type: "pendant-light",
    tags: ["room-kitchen", "use-island"]
  }
  "pendant" already in token list → skip inject (no duplication)

STEP 5 — TOKEN ASSEMBLY
  tokens: ["pendant", "light", "kitchen", "island"]
  count: 4 ← within 5-token safety limit

STEP 6 — FINAL QUERY
  output: "pendant light kitchen island"

API CALL:
  /search/suggest?q=pendant+light+kitchen+island
    &resources[type]=product
    &resources[limit]=10
    &resources[options][fields]=title,tag,vendor,product_type,
                                 variants.title,variants.sku
    &resources[options][prefix]=last
    &resources[options][unavailable_products]=last
```

---

### 3.2 Fallback Chain

```
PRIMARY:  query = "pendant light kitchen island"
  → API returns 3 products → sufficient (threshold: ≥ 2) → proceed

  → API returns 0 products → trigger FALLBACK 1

FALLBACK 1:  query = "pendant light kitchen" (remove last token)
  → API returns 0 products → trigger FALLBACK 2

FALLBACK 2:  query = "pendant" (broadest product term from original)
  → API returns N products → render with message:
     "We couldn't find exact matches. Showing results for: pendant"

FALLBACK 3 (last resort):  query = original raw input (verbatim)
  → Shopify does its own best-effort match
  → if 0 results → show zero-results state with:
     - "No products found for [query]"
     - 3 suggested example queries
     - Link to browse all products
```

---

### 3.3 Scoring Model

After the API returns products, JavaScript applies a relevance score to re-rank results before rendering.

```
Base score: 0 for every product

+10  exact phrase match in product title
 +5  single query token found in product title
 +4  token found in product type
 +3  token found in product tags
 +2  token found in variant title
 +1  token found in vendor name
 +0  only found in body_html (broad match — no score boost)

Availability bonus:
+20  product.available == true  (ensures in-stock always ranks above OOS)

Variant match bonus:
 +3  a specific variant matches a query token (colour, bulb type, size)
     (also triggers variant-specific image and URL display)

Final sort: descending by total score, then available first (as tiebreaker)
```

---

## 4. Query Transformation Examples

| User Input | After Normalise | After Stop Word Removal | After Intent Dict | Final Query |
|-----------|----------------|------------------------|-------------------|-------------|
| `What pendant light is best for a kitchen island?` | `what pendant light is best for a kitchen island` | `pendant light [kitchen island]` | kitchen island → inject "pendant" (exists) | `pendant light kitchen island` |
| `Which wall light is suitable for a hallway?` | `which wall light is suitable for a hallway` | `wall light [hallway]` | hallway → inject "wall" (exists) | `wall light hallway` |
| `I need a red pendant light for my dining room` | `i need a red pendant light for my dining room` | `red pendant light [dining room]` | dining room → inject "pendant" (exists) | `red pendant light dining room` |
| `Lampshade for E27 bulb` | `lampshade for e27 bulb` | `lampshade e27 bulb` | no room match | `lampshade e27 bulb` |
| `Industrial ceiling light` | `industrial ceiling light` | `industrial ceiling light` (no stop words) | no room match | `industrial ceiling light` |
| `What is a ceiling rose?` | `what is a ceiling rose` | `ceiling rose` | no room match | `ceiling rose` |
| `Best lights for above a dining table` | `best lights for above a dining table` | `lights [dining] table` | dining → inject "pendant" | `pendant lights dining table` |
| `Can you recommend something for my bedroom` | `can you recommend something for my bedroom` | `[bedroom]` → only 1 token after strip → SAFETY FALLBACK | return stripped only | `bedroom` |
| `E27 black vintage pendant` | `e27 black vintage pendant` | `e27 black vintage pendant` | no room match | `e27 black vintage pendant` |
| `Looking for outdoor wall light for garden` | `looking for outdoor wall light for garden` | `outdoor wall light [garden]` | garden → inject "outdoor" (exists) | `outdoor wall light garden` |
| `Flush ceiling light for low ceiling bedroom` | `flush ceiling light for low ceiling bedroom` | `flush ceiling light [bedroom]` | bedroom → inject "bedside wall" → "ceiling" already present | `flush ceiling light bedroom` |
| `What` | `what` | `` → empty after strip → SAFETY FALLBACK | return original | `what` (send to Shopify as-is) |

---

## 5. UI Wireframe

### 5.1 Trigger Button (Floating State)

```
                            ┌─────────────────────────────┐
                            │  💡 Ask our Lighting Advisor │
                            └─────────────────────────────┘
                                                      ↑
                                         fixed: bottom-right corner
```

---

### 5.2 Modal — Initial State (Before Search)

```
┌───────────────────────────────────────────────────────────────┐
│  💡  AI Lighting Advisor                          [✕ Close]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Describe what you're looking for...              [→] │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  Try asking:                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────┐   │
│  │ Pendant light for kitchen   │  │ Wall light for        │   │
│  │ island                      │  │ hallway               │   │
│  └─────────────────────────────┘  └──────────────────────┘   │
│  ┌─────────────────────────────┐  ┌──────────────────────┐   │
│  │ Lampshade for E27 bulb      │  │ Industrial ceiling    │   │
│  │                             │  │ light                 │   │
│  └─────────────────────────────┘  └──────────────────────┘   │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│  Popular Lighting                                             │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  [img]   │  │  [img]   │  │  [img]   │  │  [img]   │     │
│  │          │  │          │  │          │  │          │     │
│  │ Product  │  │ Product  │  │ Product  │  │ Product  │     │
│  │  Title   │  │  Title   │  │  Title   │  │  Title   │     │
│  │  £19.99  │  │  £24.99  │  │  £29.99  │  │  £34.99  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘
```

---

### 5.3 Modal — Thinking State

```
┌───────────────────────────────────────────────────────────────┐
│  💡  AI Lighting Advisor                          [✕ Close]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  What pendant light is best for a kitchen island? [→] │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ● ● ●  Finding the best matches...                          │
│         Searching for: pendant light kitchen island           │
│                                                               │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                        (skeleton cards)                       │
└───────────────────────────────────────────────────────────────┘
```

---

### 5.4 Modal — Results State

```
┌───────────────────────────────────────────────────────────────┐
│  💡  AI Lighting Advisor                          [✕ Close]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  What pendant light is best for a kitchen island? [→] │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  6 results for "pendant light kitchen island"                 │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │   [product img]  │  │   [product img]  │  │ [prod img] │  │
│  │                  │  │                  │  │            │  │
│  │ Industrial 3-Way │  │ Vintage Cage     │  │ Modern     │  │
│  │ Pendant Light    │  │ Pendant, Black   │  │ Cluster    │  │
│  │                  │  │                  │  │ Pendant    │  │
│  │ £34.99           │  │ £28.99           │  │ £49.99     │  │
│  │ ● In Stock       │  │ ● In Stock       │  │ ● In Stock │  │
│  │ [Variant: Black] │  │                  │  │            │  │
│  └──────────────────┘  └──────────────────┘  └────────────┘  │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │   [product img]  │  │   [product img]  │  │ [prod img] │  │
│  │ Hemp Rope        │  │ Retro Filament   │  │ Copper     │  │
│  │ Pendant          │  │ Pendant Holder   │  │ Pendant    │  │
│  │ £22.99           │  │ £14.99           │  │ £39.99     │  │
│  │ ● In Stock       │  │ ● In Stock       │  │ ○ Low Stock│  │
│  └──────────────────┘  └──────────────────┘  └────────────┘  │
│                                                               │
│              [ View all 24 results for this search → ]        │
└───────────────────────────────────────────────────────────────┘
```

---

### 5.5 Modal — Zero Results State

```
┌───────────────────────────────────────────────────────────────┐
│  💡  AI Lighting Advisor                          [✕ Close]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  purple flashing strobe disco ball                [→] │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ○  No lighting products found for that search.              │
│                                                               │
│  Try one of these instead:                                    │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐            │
│  │ Pendant lights      │  │ Wall lights          │            │
│  └─────────────────────┘  └─────────────────────┘            │
│  ┌─────────────────────┐                                      │
│  │ Industrial lighting │                                      │
│  └─────────────────────┘                                      │
│                                                               │
│              [ Browse all products → ]                        │
└───────────────────────────────────────────────────────────────┘
```

---

### 5.6 Mobile Layout (≤ 767px)

```
┌──────────────────────────────────┐
│  💡 AI Lighting Advisor  [✕]     │
├──────────────────────────────────┤
│ ┌────────────────────────────┐   │
│ │  Describe what you need [→]│   │
│ └────────────────────────────┘   │
│                                  │
│ ← Pendant for kitchen │ Wall ... →│
│          (horizontally scrollable chips)
├──────────────────────────────────┤
│ 6 results for "pendant kitchen"  │
│                                  │
│ ┌────────────┐  ┌────────────┐   │
│ │  [img]     │  │  [img]     │   │
│ │ Product 1  │  │ Product 2  │   │
│ │ £34.99     │  │ £28.99     │   │
│ │ ● In Stock │  │ ● In Stock │   │
│ └────────────┘  └────────────┘   │
│ ┌────────────┐  ┌────────────┐   │
│ │  [img]     │  │  [img]     │   │
│ │ Product 3  │  │ Product 4  │   │
│ │ £22.99     │  │ £14.99     │   │
│ └────────────┘  └────────────┘   │
│                                  │
│      [ View all results → ]      │
└──────────────────────────────────┘
```

---

## 6. Performance Assessment

### 6.1 Asset Load Impact

| Asset | Size (estimated) | Load strategy | Impact |
|-------|-----------------|---------------|--------|
| `ai-search-assistant.css` | ~8–12 KB | `<link>` in section (print→all lazy load) | 0ms — only loaded when section is on page |
| `ai-search-assistant.js` | ~14–18 KB | `defer` attribute | 0ms render-blocking; executes after parse |
| `ai-search-results.liquid` | ~1–3 KB HTML | Server-rendered inline | Part of section render; no extra request |

**Total page weight increase:** ~25–30 KB (CSS + JS combined, unminified estimate)
**After minification:** ~12–15 KB gzipped
**Render-blocking risk:** Zero — both assets are deferred or lazy-loaded

---

### 6.2 Runtime Performance

| Operation | Cost | Notes |
|-----------|------|-------|
| `processQuery()` execution | < 1ms | String operations only, no I/O |
| `fetchProducts()` API call | 80–200ms | Shopify Predictive Search JSON; cached by browser on repeated queries |
| Fallback fetch (if triggered) | +100–200ms | Only on zero-result queries |
| `processResults()` scoring | < 2ms | Loops over max 10 products |
| `render()` DOM injection | < 5ms | Inserts 6–12 card elements |
| **Total perceived latency** | **~150–300ms** | Within "instant" perception threshold (<400ms) |

**Debounce:** 400ms on input event prevents API calls on every keystroke. A user typing a natural sentence will only trigger one API call at the end of their typing.

---

### 6.3 Conflict Risk with Existing Search

| Risk | Assessment |
|------|-----------|
| CSS collision | None — all classes namespaced `.leds-advisor__*` |
| JS collision | None — IIFE wrapped, `window.LedsoneAdvisor` is the only global |
| `BlsSearchShopify` interaction | None — no shared state, no shared DOM elements |
| `input[type="search"]` conflict | None — Advisor uses `input[type="text"]` with `id="leds-advisor-input"` |
| API rate limit | Low — Shopify Predictive Search has a generous rate limit; debounce prevents spam |
| Z-index conflict | Low — modal uses `z-index: 9999`; document review recommended |
| `window.routes` dependency | ✅ Safe — confirmed globally available via `content-bottom.liquid` |

---

### 6.4 SEO Impact

The AI Advisor modal is rendered as `aria-hidden="true"` and `display: none` until opened. Search engines do not index hidden modal content. No SEO impact.

Product links inside the modal, when open, are standard `<a href>` elements — crawlable, but the modal is not a primary navigation path and will not influence crawl budget.

---

## 7. Implementation Roadmap

### Phase 1 — Foundation (Day 1–2)
**Risk: 🟢 Green**

1. Create `assets/ai-search-assistant.css` — modal shell, trigger, basic card layout
2. Create `sections/ai-search-assistant.liquid` — HTML structure + full schema
3. Create `snippets/ai-search-results.liquid` — initial products (server-rendered)
4. Add section to homepage (dev theme only) — confirm HTML renders correctly
5. Confirm `window.routes.predictive_search_url` is accessible in browser console

**Evidence:** Section appears on dev theme homepage. Modal opens and closes. Popular products display. Zero JS logic yet.

---

### Phase 2 — Search Engine Core (Day 3–4)
**Risk: 🟢 Green**

1. Create `assets/ai-search-assistant.js` — skeleton IIFE
2. Implement: `_normalise`, `_detectPhrases`, `_stripStopWords`
3. Implement: stop word list + room intent dictionary + synonym dictionary
4. Implement: `processQuery()` pipeline
5. Console-test all 12 example queries from this document

**Evidence:** Open browser console on dev theme. Run `LedsoneAdvisor.processQuery("What pendant light is best for a kitchen island?")` — confirm output is `"pendant light kitchen island"` for all 12 test cases.

---

### Phase 3 — API Integration (Day 4–5)
**Risk: 🟡 Amber (first live API calls)**

1. Implement: `fetchProducts()` — primary fetch to `/search/suggest.json`
2. Implement: fallback chain (stripped → single token → verbatim)
3. Implement: `processResults()` — scoring model + availability sort + variant match
4. Implement: `render()` — DOM card injection

**Evidence:** Type "pendant kitchen island" into Advisor input. Network tab shows fetch to `/search/suggest`. Results appear in modal. All in-stock products shown before out-of-stock. Variant label shows on cards where relevant.

---

### Phase 4 — UX Polish (Day 5–6)
**Risk: 🟢 Green**

1. Thinking animation (CSS animated dots + skeleton cards)
2. Zero-results state with suggested queries
3. "View all results" link construction (correct fields + query)
4. Suggestion chip click → populate input + trigger search
5. Keyboard navigation (Tab through chips, Enter to search, Escape to close)
6. Focus management (focus input on open, return focus to trigger on close)
7. Mobile responsiveness (horizontal chip scroll, 2-column grid)

**Evidence:** Test all keyboard interactions. Test on iPhone Safari (smallest viewport). Test with screen reader (VoiceOver).

---

### Phase 5 — Analytics & Observability (Day 6–7)
**Risk: 🟢 Green**

1. Implement `_log()`:
   ```
   window.LedsoneSearchLog = window.LedsoneSearchLog || [];
   window.LedsoneSearchLog.push({
     ts: Date.now(),
     original: rawQuery,
     transformed: finalQuery,
     results: count,
     fallback: fallbackLevel  // 0=primary, 1=stripped, 2=single token, 3=verbatim
   });
   ```
2. On zero-result: fire GA4 event `search_no_results` with query
3. On product click: fire GA4 event `select_item` with product data

**Evidence:** Open browser console after 3 searches. `window.LedsoneSearchLog` array shows correct entries. GA4 DebugView shows events firing.

---

### Phase 6 — Product Data Enrichment (Ongoing)
**Risk: 🟢 Green**

This phase has no code. It is Shopify admin work that amplifies the JS system.

1. Apply room tags to top 100 products: `room-kitchen`, `room-hallway`, `room-dining`, `room-bedroom`, `room-bathroom`, `room-office`
2. Apply style tags: `style-industrial`, `style-vintage`, `style-modern`
3. Apply bulb compatibility tags: `bulb-e27`, `bulb-e14`, `bulb-gu10`
4. Enrich descriptions of top 20 products with natural room/use language

**Evidence:** Search "hallway" → products tagged `room-hallway` appear in top 3 results.

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `window.routes` not available when JS executes | Low | High | Read from `#leds-advisor-config` data attributes as fallback |
| `/search/suggest.json` rate limit hit | Very Low | Medium | Debounce 400ms; min query length 3 chars before fetching |
| Zero results due to over-transformation | Medium | Medium | 3-tier fallback chain always finds results |
| Modal z-index conflict with header/megamenu | Low | Low | Set to 10000; document existing z-index hierarchy before implementing |
| JS error breaks page if Advisor fails | Low | High | Entire IIFE wrapped in try/catch; errors logged but never thrown to page |
| Intent dictionary becomes stale | Medium | Low | Dictionary is in a named constant block — easy to update independently |
| Product tag taxonomy inconsistently applied | Medium | Medium | Maintain master tag list document; bulk apply via CSV |
| Section added to page but not configured | Low | Low | Schema defaults produce valid initial state |

---

## 9. Summary

| Deliverable | Status |
|-------------|--------|
| Architecture Design | ✅ Complete |
| File Structure (4 files) | ✅ Complete |
| Search Flow Diagram | ✅ Complete |
| Query Transformation Examples (12) | ✅ Complete |
| UI Wireframe (5 states) | ✅ Complete |
| Performance Assessment | ✅ Complete |
| Implementation Roadmap (6 phases) | ✅ Complete |
| Risk Assessment | ✅ Complete |

**New files: 4**
**Modified files: 0**
**Existing search touched: 0**
**Third-party dependencies: 0**
**Estimated build time: 6–7 days**
**Estimated ongoing maintenance: Low (dictionary updates only)**

---

## CAPABILITY LOG

- **What was built:** Complete standalone technical design for an AI Lighting Advisor search widget — isolated from existing search, JSON API-driven, client-side intent processing, 5-state UI, 6-phase build roadmap
- **Reusable:** Yes
- **Where it applies:** Any Shopify store wanting a parallel intent-based search layer without modifying existing search infrastructure
- **Pattern name:** `shopify-standalone-intent-advisor-widget`
