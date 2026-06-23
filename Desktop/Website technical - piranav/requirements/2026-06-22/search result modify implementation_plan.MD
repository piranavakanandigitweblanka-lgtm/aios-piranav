# Predictive Search Results UI Redesign

## Goal Description

Redesign the Shopify Predictive Search Results UI to deliver a modern 2026 ecommerce experience typical of premium lighting retailers. The focus is strictly on the visual presentation and layout of the search results dropdown, without altering the underlying search API logic, trigger mechanisms, or relying on external libraries.

## Current Architecture & Audit Findings

The initial request suggested auditing `snippets/predictive-search.liquid`, `assets/component-predictive-search.css`, and `assets/predictive-search.js` (common in Dawn-based themes). However, upon auditing the provided theme (`theme_export__ledsone...`), the architecture differs:

*   **Results Container:** Rendered dynamically via `sections/search-predictive-list.liquid` (and `search-predictive-grid.liquid`).
*   **Result Item:** Rendered via `snippets/product-popular-list-item.liquid`.
*   **Search Wrappers:** Found in `snippets/top-search.liquid`, `snippets/search-popup.liquid`, and `snippets/search-canvas.liquid`.
*   **JS Logic:** Housed within the main `assets/theme.js` (which handles the API requests and DOM injection).

### UI Weaknesses in Current Design

1.  **Layout:** Currently a standard, single-column vertical list. It lacks the modern dual-column approach that separates search suggestions from product results.
2.  **Typography & Spacing:** Relies on utility classes (e.g., `mb-15`, `pb-15`) with basic typography. It does not feel "premium".
3.  **Product Visibility & Consistency:** Items do not have enforced equal heights, and the image-to-text ratio can feel unbalanced.
4.  **Interaction Design:** Lacks sophisticated hover states, micro-animations, and distinct keyboard focus indicators required for strict WCAG compliance.
5.  **Stock Status:** Not currently visible on the predictive search result items.

## Proposed Changes

> [!IMPORTANT]
> The JS logic that fetches predictive search data will **not** be modified. We will only alter the Liquid structure that formats the response and the CSS that styles it.

### `sections/search-predictive-list.liquid`

*   **Action:** Modify the Liquid template to output a dual-column layout.
*   **Structure:**
    *   **Left Column (30%):** Introduce sections for "Related searches", "Suggested keywords", and "Popular search terms" (utilizing `predictive_search.resources.queries` and `predictive_search.resources.collections` if available, or static fallback terms).
    *   **Right Column (70%):** Display the product results grid/list.
    *   **Bottom:** Sticky or fixed "View all results" button spanning the bottom of the dropdown.

### `snippets/product-popular-list-item.liquid`

*   **Action:** Redesign the individual product result card.
*   **Structure:**
    *   Ensure image remains on the left, product details on the right.
    *   Add stock status rendering (e.g., "In Stock", "Low Stock", "Out of Stock" based on `product.available` and inventory quantities).
    *   Standardize image aspect ratios and enforce equal item heights.

### `assets/base.css` (or new `predictive-search-redesign.css`)

*   **Action:** Add all custom styling for the new layout.
*   **Desktop:** Implement CSS Grid (`grid-template-columns: 3fr 7fr`) for the dropdown.
*   **Aesthetics:** Add subtle glassmorphism effects (backdrop-filter), refined box-shadows, and curated typography.
*   **Interactions:** Add smooth `transition: all 0.3s ease` for hover states (e.g., slight background highlight on items).

---

## Mobile Recommendations

1.  **Layout:** Revert to a single, full-width column layout (`grid-template-columns: 1fr`).
2.  **Order:** Place "Suggested Keywords" at the top as a horizontally scrollable row of chips/pills to save vertical space.
3.  **Touch Targets:** Enforce a minimum hit area of `44px x 44px` for all clickable elements (products, links, view all button) to improve mobile usability.
4.  **Spacing:** Optimize padding to maximize product visibility without feeling cluttered.

## Accessibility (WCAG) Recommendations

1.  **Focus States:** Implement clear `:focus-visible` styles (`outline: 2px solid var(--primary-color); outline-offset: 2px;`) for keyboard navigation.
2.  **Color Contrast:** Ensure all text, particularly secondary text like stock status and prices, meets the WCAG AA minimum contrast ratio of 4.5:1 against the background.
3.  **Semantic HTML & ARIA:** Ensure the results container uses `role="listbox"` and items use `role="option"`. Add `aria-selected` toggles where appropriate.

## User Review Required

> [!WARNING]
> Please confirm if you would like me to proceed with implementing these Liquid and CSS changes in the theme files.
