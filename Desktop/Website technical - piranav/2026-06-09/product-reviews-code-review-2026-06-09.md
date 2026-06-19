# Product Reviews Section — Technical Review Report

**File:** `sections/product-reviews.liquid`
**Theme:** `ledsone-co-uk-promotion-week-4-2-mega-digital`
**Review Date:** 2026-06-09
**Reviewer:** Senior Shopify Theme Engineer
**Source of Truth:** Actual file contents. No assumptions.

---

## 1. Executive Summary

The file implements a custom product review system with three declared features: Amazon Reviews Toggle, Order Verification API, and Review Access Control. Of these three, **Feature 1 (Amazon Reviews Toggle) is fully implemented**. **Feature 2 (Order Verification API) is not implemented at all** — no verification endpoint, no verification step, no blocking logic exists in the code. **Feature 3 (Review Access Control) is partially implemented but contains a critical dead-code branch** that renders a "verified buyers only" message that can never be reached under current logic.

Additional findings include: one orphaned schema setting (`show_photos`) that has no effect; an XSS vulnerability in the client-side `addReviewToUI` function via unsanitised `innerHTML`; a hardcoded external API URL; a debug comment left in production code; and O(n²) Liquid loops in the rating breakdown.

---

## 2. Verified Changes

### 2.1 Schema Settings (4 settings)

| ID | Type | Label | Default | Status |
|----|------|-------|---------|--------|
| `heading` | text | Section Heading | "Customer Reviews" | Active, used |
| `show_photos` | checkbox | Allow Photo Uploads | true | **Orphaned — never referenced** |
| `show_amazon_reviews` | checkbox | Show Amazon Reviews | true | Active, used |
| `require_purchase` | checkbox | Require login to leave review | false | Active, used — label is misleading |

### 2.2 Amazon Reviews Data Pipeline

- Metafield source: `product.metafields.custom.amazon_reviews`
- Parsed via the same two-step fallback used for product reviews (`.value` check → `parse_json` fallback)
- Assigned to `amazon_reviews` variable
- Raw value exposed on DOM root as `data-ar-meta-value="{{ product.metafields.custom.amazon_reviews.value | json }}"`

### 2.3 Amazon Reviews Rendering

- Rendered inside `{%- if section.settings.show_amazon_reviews and amazon_reviews.size > 0 -%}`
- Section class: `.amazon-reviews-section`
- Each review renders: avatar (first letter of `customer_name`), author name, hardcoded "✓ Verified Purchase" badge, star rating, optional title, body text, date, optional "View on Amazon →" link, optional images
- Images use `loading="lazy"`, `width="100"`, `height="100"` attributes
- Star rating renders using `{%- for i in (1..review.star_rating) -%}` — only filled stars, no cap enforced in Liquid

### 2.4 Review Access Control Logic

```
can_review = true
IF require_purchase setting is true:
    can_review = false
    IF customer object exists (logged in):
        can_review = true
```

When `can_review = false`, the template shows a locked state. Inside that locked state, a `{% if customer %}` check exists for two message variants. See Section 5.2 for the critical defect.

### 2.5 Review Form

Fields present:
- Star rating (interactive, hidden input `rating`)
- Name (required text)
- Email or Phone (required text, `type="text"`, not `type="email"`)
- Review text (required textarea)
- "Would you recommend this product?" toggle checkbox
- Photo upload (multiple, max 5 enforced client-side only)

Verification note present on email/phone field:
> "Note: Your email or phone number may be verified before your review is shown."

This is **cosmetic only** — no verification logic exists in the file.

### 2.6 API Submission

Single endpoint:
```
POST https://listings.vintageinterior.co.uk/api/get-meta-from-shopify
Content-Type: application/json
```

Payload structure confirmed in code:
```json
{
  "rating": "<int>",
  "name": "<string>",
  "email": "<string>",
  "review": "<string>",
  "recommends": "<bool>",
  "images": ["<base64 strings>"],
  "date": "<ISO string>",
  "id": "review_<timestamp>",
  "productId": "<string>",
  "meta": "<productReviewsMeta window global>",
  "productMetafields": "<all metafields object>",
  "updatedReviews": ["<merged array>"],
  "metafieldNamespace": "custom",
  "metafieldKey": "product_reviews"
}
```

Response handling: checks `result.success` boolean. On success: adds review to UI, updates count, updates average, resets form. On failure or network error: shows error message. Loading state applied and removed in `finally` block.

### 2.7 Metafield Extraction Architecture

A self-executing function at section load extracts and stores metafields from multiple namespaces into `window[productMetafields_${sectionId}]`:

| Namespace | Keys extracted |
|-----------|----------------|
| `custom` | `product_reviews`, `amazon_reviews`, `external_affiliate`, `faq`, `additional_information` |
| `bls` | `product_grouped`, `short_description`, `countdown_timer`, `bought_together` |
| `judgeme` | `badge`, `widget` |
| `mczr` | `isCustomizable`, `startingPointId` |
| `spr` | `reviews` |
| `related_items` | (full namespace) |

All of this is sent to the review submission API — even when entirely irrelevant to a review submission.

### 2.8 Client-Side Review Parsing (JS)

Three-tier fallback for reading existing reviews:
1. Direct Liquid injection: `const liquidReviews = {{ reviews | json }};`
2. DOM attribute: `container.getAttribute('data-product-reviews-meta')`
3. Falls back to empty array

### 2.9 JavaScript Functions Confirmed

| Function | Purpose |
|----------|---------|
| `addReviewToUI(review)` | Inserts a new review card to the DOM |
| `updateAverageRating(reviews)` | Recalculates and re-renders stats block |
| `showMessage(message, type)` | Displays success/error message, auto-hides after 5s |
| Star rating event listeners | Click to set rating, toggle `.active` class |
| Photo upload listener | FileReader preview, max 5 |
| Form submit handler | Async, loading state, fetch, error handling |

---

## 3. Undocumented Changes

1. **`show_photos` schema setting exists but is dead code.** The photo upload UI is always rendered regardless of this setting.
2. **Metafield extraction script exports data for 6 namespaces** beyond product reviews (bls, judgeme, mczr, spr, related_items). All sent to external API.
3. **`data-product-reviews-meta` attribute** on the section root exposes the full raw metafield value as JSON in the DOM.
4. **`data-pr-meta-value` and `data-ar-meta-value` attributes** also on the root element.
5. **Debug comment left in production code:** `{%- comment -%} Debug: reviews.size = {{ reviews.size }}, reviews type = {{ reviews | json }} {%- endcomment -%}`
6. **Hardcoded external API domain** `listings.vintageinterior.co.uk` — no configuration point.
7. **Amazon reviews hardcode "✓ Verified Purchase"** for every review, regardless of actual data.
8. **Login prompt heading reads "Join the conversation"** — departs from any "purchase required" framing.
9. **`purchase-required-modern` CSS** defined inside a conditional `{% else %}` block — unusual inline scoping pattern.

---

## 4. Missing or Incomplete Implementations

### 4.1 Feature 2 — Order Verification API: NOT IMPLEMENTED

No evidence of any of the following in the file:
- A verification endpoint call separate from the submission endpoint
- An order number input field
- A "Verify Purchase" step before the review form
- `localStorage` or `sessionStorage` for verification status
- A verified/unverified state toggle on the form or submit button
- Any fetch/XHR to an order lookup or verification route
- Conditional form unlock based on verification result

The only reference to verification is a static text note. **This feature is entirely absent.**

### 4.2 `show_photos` Setting: NOT WIRED UP

The schema setting exists with `default: true` but is never evaluated in Liquid or JS. Photo upload always renders.

### 4.3 Amazon Star Rating: No Empty Stars

`{%- for i in (1..review.star_rating) -%}` renders only filled stars. No empty stars for remaining slots. Inconsistent with product review star rendering.

### 4.4 Amazon Star Rating: No Cap on `star_rating`

If metafield value is corrupt (e.g. `6`, `null`), the Liquid loop produces too many stars or an error. No guard exists.

---

## 5. Feature Validation Results

### Feature 1 — Amazon Reviews Toggle

**Status: PASSED**

- Schema setting present: `show_amazon_reviews` checkbox, default `true` ✓
- Conditional: `{%- if section.settings.show_amazon_reviews and amazon_reviews.size > 0 -%}` ✓
- Theme Editor: Standard schema checkbox, fully compatible ✓
- Edge case (empty data): guarded by `amazon_reviews.size > 0` ✓
- Edge case (setting off): section suppressed ✓
- Full CSS ruleset defined ✓

Notes: "Verified Purchase" badge hardcoded; empty stars not rendered; no star_rating cap in Liquid.

---

### Feature 2 — Order Verification API

**Status: FAILED**

No verification endpoint, no verification step, no order number field, no verification state management, no blocking logic found anywhere in the file. Feature is entirely absent. Only a cosmetic static note exists on the email field.

---

### Feature 3 — Review Access Control

**Status: PARTIAL — critical dead-code defect**

What works:
- `require_purchase` schema setting present ✓
- Login check logic structurally correct ✓
- Login prompt with `{{ routes.account_login_url }}` renders for guests ✓

Critical defect:

Inside the locked state `{% else %}` block:
```liquid
{% if customer %}
  <h4>Only verified buyers can review</h4>
{% else %}
  <h4>Join the conversation</h4>
  <a href="{{ routes.account_login_url }}">Log In or Sign Up</a>
{% endif %}
```

This `{% if customer %}` branch is **unreachable**. The access control logic already sets `can_review = true` for any logged-in customer. When `can_review = false`, the customer is always a guest. The "Only verified buyers" message will never display.

Schema label mismatch: setting named `require_purchase` but logic only checks login, not purchase history.

---

## 6. Security Review

| Issue | Severity | Detail |
|-------|----------|--------|
| XSS via `innerHTML` in `addReviewToUI` | **HIGH** | `review.name`, `review.review`, `review.body`, `review.title`, `review.reply` inserted unsanitised |
| Script injection via Liquid JSON injection | **MEDIUM** | `{{ reviews \| json }}` inline in `<script>` tag — test for `</script>` in data |
| Hardcoded external API endpoint | **MEDIUM** | `listings.vintageinterior.co.uk` — compromise exfiltrates all review payloads + metafields + customer email |
| Excessive data in API payload | **MEDIUM** | All 6 metafield namespaces + customer email sent — violates data minimisation |
| Client-side review array manipulation | **MEDIUM** | `existingReviews` assembled in browser; user can tamper before POST |
| No rate limiting / CAPTCHA | **MEDIUM** | Review spam is unmitigated |
| Base64 image payload — no size limit | **LOW** | 5 large images = multi-MB POST request |
| DOM attribute data exposure | **LOW** | Raw metafield JSON visible in page source |

---

## 7. Performance Review

| Issue | Severity | Detail |
|-------|----------|--------|
| O(n²) Liquid loop — rating breakdown | Medium | 5 outer × n inner iterations at render time |
| Inline CSS (~400+ lines) | Medium | Not cached as external asset; re-sent on every page load |
| Inline JavaScript (~250+ lines) | Medium | Not cached as external asset |
| All 6 metafield namespaces extracted and serialised | Low | Extra Liquid processing for data irrelevant to reviews |
| Base64 image transmission | Low | ~33% size overhead vs binary; no pre-upload size check |
| Amazon images: `loading="lazy"` + `width`/`height` | Good ✓ | Correct — avoids layout shift, defers off-screen loads |
| CSS transitions on GPU properties only | Good ✓ | `opacity`, `transform`, `width` — no layout-reflow transitions |

---

## 8. Shopify Best Practices Review

### Compliant

- Schema `presets` defined
- `{{ routes.account_login_url }}` used (not hardcoded path)
- `| json` filter for metafield output
- `| escape` for string metafields in JS context
- Section ID namespacing on all element IDs
- `rel="noopener noreferrer"` on external link

### Non-Compliant

| Item | Recommendation |
|------|----------------|
| All CSS inline | Move to `assets/product-reviews.css` |
| All JS inline | Move to `assets/product-reviews.js` |
| `show_photos` setting unused | Wire up or remove from schema |
| `require_purchase` ID vs. label mismatch | Rename to `require_login` or implement purchase check |
| Debug comment in production | Remove |
| Hardcoded external URL | Add as `text` schema setting |
| `purchase-required-modern` CSS in conditional block | Move to main style block |
| Excessive DOM attribute exposure | Minimise to what JS actually requires |

---

## 9. Risk Register

| Risk | Severity | Impact | Recommendation |
|------|----------|--------|----------------|
| XSS via `innerHTML` in `addReviewToUI` | **HIGH** | Malicious review executes JS in browser | Replace with DOM node creation or sanitise input |
| Dead "verified buyers" message — unreachable | **MEDIUM** | Merchant believes purchase check is active; it is not | Fix logic or remove dead branch |
| Feature 2 entirely absent | **MEDIUM** | System is login-only gate, not purchase-verified gate | Implement or formally descope |
| Client-side review array manipulation | **MEDIUM** | User can overwrite reviews before POST | Server-side integrity validation required |
| Hardcoded external API URL | **MEDIUM** | Domain change or compromise requires code edit | Externalise to schema setting or secure proxy |
| Excessive data in API payload | **MEDIUM** | PII + internal product data to third party | Strip to review-relevant fields only |
| No rate limiting / bot protection | **MEDIUM** | Review spam | Add CAPTCHA or server-side rate limiting |
| `show_photos` setting has no effect | **LOW** | Merchant UX confusion | Wire up or remove |
| O(n²) Liquid loop | **LOW** | Slow render at high review count | Single-pass count calculation |
| Base64 image payload size | **LOW** | Very large POST possible | Client-side file size validation |
| Amazon star_rating no cap | **LOW** | Corrupt data renders excess stars | Add `\| at_most: 5` guard |
| Debug comment in production | **LOW** | Reveals internal data shape | Remove |

---

## 10. Updated Technical Change Log

```
PRODUCT REVIEWS SECTION — TECHNICAL CHANGE LOG
File: sections/product-reviews.liquid
Theme: ledsone-co-uk-promotion-week-4-2-mega-digital
Last Reviewed: 2026-06-09

[IMPLEMENTED] Feature 1 — Amazon Reviews Toggle
  - Schema: show_amazon_reviews checkbox, default true
  - Source: product.metafields.custom.amazon_reviews
  - Render condition: setting enabled AND amazon_reviews.size > 0
  - Renders: avatar, author, hardcoded verified badge, stars (filled only),
    title, body, date, optional Amazon link, optional lazy-loaded images
  - Full .amazon-review-* CSS ruleset defined

[PARTIAL / DEFECTIVE] Feature 3 — Review Access Control
  - Schema: require_purchase checkbox, default false
    Label: "Require login to leave review"
  - Logic: login check only — no purchase history validation
  - Guest + locked: "Join the conversation" + login button shown ✓
  - Logged-in + locked: UNREACHABLE — dead code branch
    ("Only verified buyers" message never displayed)
  - ACTION REQUIRED: Fix dead branch or remove misleading message

[NOT IMPLEMENTED] Feature 2 — Order Verification API
  - No verification endpoint, no order field, no verification step
  - Cosmetic note only on email field
  - ACTION REQUIRED: Implement or formally descope

[PRESENT] Review Submission API
  - Endpoint: POST https://listings.vintageinterior.co.uk/api/get-meta-from-shopify
  - Payload: review data + all 6 metafield namespaces + merged review array
  - Response: { success: boolean }
  - Loading: overlay + button spinner, removed in finally block
  - On success: UI updated, form reset, count/average recalculated
  - On failure: error message shown, auto-hides after 5s

[DEFECT] show_photos schema setting orphaned
  - Exists (default: true) but never evaluated — photos always shown

[DEFECT — HIGH] XSS in addReviewToUI
  - innerHTML with unsanitised: name, review/body, title, reply, reply_date
```

---

## 11. Rollback Notes

1. **Duplicate theme active:** Re-activate the previous theme in Shopify Admin → Online Store → Themes. No code changes required.
2. **If live theme was edited:** Use Shopify's built-in file version history on `sections/product-reviews.liquid`.
3. **Metafield data is unaffected** by theme rollback — reviews already written persist.
4. **External API is unaffected** by theme rollback.
5. **Targeted rollback targets:**
   - Remove Amazon Reviews: delete `show_amazon_reviews` schema setting + metafield extraction + render block
   - Remove access control: delete `require_purchase` conditional wrapping the form
   - Remove verification note: delete `<p>` note from email field group

---

## 12. Self-Verification Checklist

| Item | Status |
|------|--------|
| All features reviewed (Feature 1, 2, 3) | ✓ |
| All schema settings reviewed | ✓ |
| All JavaScript functions reviewed | ✓ |
| All Liquid logic reviewed | ✓ |
| All CSS reviewed | ✓ |
| Documented features validated against actual code | ✓ |
| Undocumented changes identified | ✓ |
| Missing implementations identified | ✓ |
| Security review completed | ✓ |
| Performance review completed | ✓ |
| Shopify best-practice review completed | ✓ |
| Risk register produced | ✓ |
| All findings evidence-based | ✓ |
| No assumptions presented as facts | ✓ |
