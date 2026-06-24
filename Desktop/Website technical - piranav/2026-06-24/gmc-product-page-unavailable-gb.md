# Task Summary
**Issue:** Google Merchant Center — Product Page Unavailable / Not Serving in GB
**Date:** 2026-06-24
**Store:** ledsone.co.uk
**Product URL:** https://ledsone.co.uk/products/lampshade-cage-retro-modern-industrial-ceiling-light-pendant-lamp

---

## What Was The Problem?

Google Merchant Center reported two errors for this product:
- **"Product page unavailable"** — GMC crawler could not access the product page
- **"Not serving in GB"** — product was excluded from Google Shopping ads in the United Kingdom

**Business impact:** The product was not appearing in Google Shopping results for GB customers, resulting in zero paid impressions and lost revenue for this SKU. Any other products sharing the same root cause would also be affected.

---

## Business Question

Why was Merchant Center rejecting the product despite the page loading correctly for human visitors?

---

## Systems Investigated

- Shopify Admin (product visibility, sales channels)
- Shopify Markets (GB market availability, price lists, publishing)
- Google Merchant Center (product status, feed diagnostics, crawler settings)
- Google Search Console (indexing status, structured data, URL inspection)
- Product URL Accessibility (direct browser test, structured data validators)
- Sales Channels (Google & YouTube channel, availability toggles)

---

## Investigation Evidence

| Check | Result | Status |
|-------|--------|--------|
| Product URL loads in browser | Page opens normally, full product detail visible | ✅ Pass |
| URL Inspection — Google Search Console | URL is on Google, last crawled successfully | ✅ Pass |
| Indexing status | Page indexed | ✅ Pass |
| HTTPS / SSL certificate | Valid, no mixed content warnings | ✅ Pass |
| Product structured data (`schema.org/Product`) | Valid — no errors in Rich Results Test | ✅ Pass |
| Merchant listing structured data | Valid | ✅ Pass |
| Breadcrumb structured data | Valid | ✅ Pass |
| Review snippet structured data | Valid | ✅ Pass |
| Shopify Markets — GB market enabled | GB market active in Shopify Markets | ✅ Pass |
| Product published to GB market | Product visible in GB market catalogue | ✅ Pass |
| Shopify Sales Channel — Google & YouTube | Channel connected and active | ✅ Pass |
| Product enabled on Google & YouTube channel | **Product was excluded from Google sales channel** | 🔴 Fail |
| GMC feed — product status | Disapproved: "Product page unavailable" | 🔴 Fail |
| Googlebot crawler access (`robots.txt`) | `/products/` path not blocked | ✅ Pass |
| Password protection (Shopify storefront) | No password page — store publicly accessible | ✅ Pass |

---

## Root Cause

The product was **not enabled on the Google & YouTube sales channel** in Shopify Admin.

Although the product page was publicly accessible and indexed by Google Search Console, the Google & YouTube channel in Shopify has a separate per-product availability toggle. This product had been deselected (or never enabled) from the channel — meaning Shopify never included it in the Google Merchant Center product feed.

When GMC attempted to crawl the product URL from its feed, the URL either returned no feed data or the product was marked unavailable in the feed submission, which GMC surfaces as "Product page unavailable / not serving in GB."

This is a Shopify-side feed exclusion, not a crawlability or indexing issue — explaining why the URL loaded fine in a browser and passed all Search Console checks.

---

## Fix Applied

1. Opened **Shopify Admin → Products → [Lampshade Cage Retro Modern Industrial...]**
2. In the right-hand panel under **Sales channels and apps**, located the **Google & YouTube** channel
3. Toggled the product to **Available** on the Google & YouTube channel
4. Saved the product
5. In **Google Merchant Center → Products → All products**, located the product and triggered a **Request re-crawl / re-fetch**

No theme files, Liquid code, or structured data were modified.

---

## Validation After Fix

| Validation Item | Result |
|-----------------|--------|
| Product visible in Google & YouTube channel | ✅ Enabled |
| Product appears in Shopify → Google channel product list | ✅ Confirmed |
| GMC product feed — product status updated | ✅ Pending re-crawl (propagation 24–72 hrs) |
| GMC "Product page unavailable" error cleared | ⏳ Awaiting GMC re-crawl confirmation |
| Product serving in GB | ⏳ Awaiting approval after re-crawl |

---

## Final Outcome

The product was excluded from the Google & YouTube sales channel in Shopify, which prevented it from being included in the GMC product feed. Enabling the product on the channel reintroduces it to the feed. GMC will re-crawl and re-validate the product within 24–72 hours, after which the "not serving in GB" status should clear and the product will resume serving in Google Shopping for GB.

---

## Files Changed

| Item | Type | Change |
|------|------|--------|
| Shopify product — Google & YouTube channel | Sales channel setting | Toggled from unavailable → available |
| Google Merchant Center | Feed action | Re-fetch / re-crawl requested |

No Liquid files, theme files, CSS, or JS were modified.

---

## Evidence Location

| Evidence | Location |
|----------|----------|
| Product URL | https://ledsone.co.uk/products/lampshade-cage-retro-modern-industrial-ceiling-light-pendant-lamp |
| Google Search Console URL Inspection | GSC → URL Inspection → paste product URL |
| GMC product status before fix | Google Merchant Center → Products → All products → filter by disapproved |
| GMC product status after fix | Google Merchant Center → Products → All products → monitor for approval |
| Shopify sales channel setting | Shopify Admin → Products → [product] → Sales channels panel |

---

## Reviewer

Technical Reviewer: Piranav
Session Date: 2026-06-24

---

## Status

**COMPLETED** ✅ (fix applied — GMC re-crawl pending)

---

## Pass / Fail Rule

**PASS criteria:**
- ✅ Product page accessible to all visitors and crawlers
- ✅ Product enabled on Google & YouTube sales channel
- ⏳ Merchant Center accepts product (pending re-crawl)
- ⏳ Product serves correctly in GB (pending re-crawl)

**FAIL criteria:**
- ❌ Merchant Center continues reporting "Product Page Unavailable" after 72 hours → escalate to GMC support

---

## Known Limitations

- GMC re-crawl propagation takes 24–72 hours — status cannot be confirmed immediately
- If other products were excluded from the Google & YouTube channel by the same issue, they will need to be individually re-enabled or bulk-updated via the channel settings
- If the root cause was an accidental bulk-deselection (e.g. during a Shopify import or bulk edit), additional products may be affected — run a channel availability audit

---

## Next Step

1. **Check in 48 hours** — confirm GMC product status has changed from "Disapproved" to "Active"
2. **Audit all products** — in Shopify → Google & YouTube channel, filter for products not enabled and cross-reference with GMC disapproval list
3. **Set up GMC email alerts** — enable automatic notifications for new disapproved products in Merchant Center → Settings → Notifications
4. **Document any bulk-affected products** — if more than 5 products share this issue, run a bulk-enable via Shopify channel settings

---

## Queryability Test

Using only this document, can a new developer understand:

1. **What happened?** ✅ — GMC reported product unavailable / not serving in GB
2. **Why it happened?** ✅ — Product was not enabled on the Google & YouTube sales channel in Shopify
3. **What was checked?** ✅ — 14 investigation checks documented with pass/fail status
4. **What was fixed?** ✅ — Sales channel toggle enabled + GMC re-crawl requested
5. **What evidence exists?** ✅ — Product URL, GSC inspection, GMC product status, Shopify channel setting
6. **What systems were involved?** ✅ — Shopify Admin, Shopify Markets, Google & YouTube channel, GMC, GSC
7. **What should happen next?** ✅ — Monitor GMC in 48hrs, audit other products, set up alerts

**Result: PASS**
