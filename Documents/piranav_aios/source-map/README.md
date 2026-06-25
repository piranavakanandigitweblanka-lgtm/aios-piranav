# source-map/ — Source File Locations and Data Mapping

---

## What This Is

This folder maps every production source file that piranav's work touches to its location, purpose, and git tracking status. It also records where each data source (Shopify store, theme, config) lives and how to access it.

---

## Why This Exists

Without a source map:
- A new session cannot find the correct file to edit without re-deriving it
- Two sessions may edit different copies of the same file
- Evidence paths in reports cannot be verified without knowing the canonical file location

The source map is the single place to look up "where does this file live?"

---

## Business / Operational Question Supported

> "For any task, can I find the exact production file path, its git tracking status, and where its evidence lives — without searching the whole repo?"

---

## Git Repository Map

| Repo | Local Root | Remote | Branch | Notes |
|---|---|---|---|---|
| Parent home repo | `C:\Users\PC` | `https://github.com/piranavakanandigitweblanka-lgtm/aios-piranav.git` (remote name: `aios`) | `master` | Tracks all piranav work — Desktop session files and Downloads theme snapshot |
| piranav_aios subfolder | `C:\Users\PC\Documents\piranav_aios` | _(inherits from parent — no standalone remote yet)_ | `master` | This AIOS workspace; empty until starter build 2026-06-25 |
| Expected AIOS repo (per assignment) | _(not yet cloned as standalone)_ | `https://github.com/piranavakanandigitweblanka-lgtm/piranav_aios` | _(unknown — awaiting Varmen confirmation)_ | Name mismatch with actual remote — to be resolved |

---

## Theme Source Map

| Component | Local Path | Git Tracked | Shopify Store | Notes |
|---|---|---|---|---|
| Full theme snapshot (UK) | `C:\Users\PC\Downloads\uk 2026.06.09\` | YES — in parent repo | `ledsone.myshopify.com` | Updated 2026-06-25 with predictive search fix, search input, 404 redesign |
| Predictive search grid | `Downloads/uk 2026.06.09/sections/search-predictive-grid.liquid` | YES | ledsone | Fixed 2026-06-24: removed `product.available` filter |
| Predictive search list | `Downloads/uk 2026.06.09/sections/search-predictive-list.liquid` | YES | ledsone | Same fix as grid — 2026-06-24 |
| Main search section | `Downloads/uk 2026.06.09/sections/main-search.liquid` | YES | ledsone | Search input restored 2026-06-24 |
| 404 page section | `Downloads/uk 2026.06.09/sections/page-404.liquid` | YES | ledsone | Full redesign 2026-06-24 |
| 404 icon snippet | `Downloads/uk 2026.06.09/snippets/icon-404.liquid` | YES | ledsone | New burnt bulb SVG — 2026-06-24 |
| 404 template | `Downloads/uk 2026.06.09/templates/404.json` | YES | ledsone | Cleaned 2026-06-24 |
| Theme JS | `Downloads/uk 2026.06.09/assets/theme.js` | YES | ledsone | Updated 2026-06-25 |
| Predictive search CSS | `Downloads/uk 2026.06.09/assets/predictive-search-redesign.css` | YES | ledsone | New file added 2026-06-25 |
| Promo widget (FR) | `Downloads/uk 2026.06.09/sections/piranav-promo.liquid` | YES | ledsone | Promo banner work 2026-06-18 |

---

## Evidence / Session File Map

| Session Date | Evidence Path | Content | Git Tracked |
|---|---|---|---|
| 2026-06-09 | `Desktop/Website technical - piranav/2026-06-09/` | Daily log, product review, theme audit | YES |
| 2026-06-12 | `Desktop/Website technical - piranav/2026-06-12/` | Daily log, FAQ schema fix, promo widget redesign | YES |
| 2026-06-15 | `Desktop/Website technical - piranav/2026-06-15/` | Daily log, breadcrumb audit, SEO audit, collection fix | YES |
| 2026-06-16 | `Desktop/Website technical - piranav/2026-06-16/` | Daily log, 7 Lighthouse accessibility fix reports | YES |
| 2026-06-17 | `Desktop/Website technical - piranav/2026-06-17/` | Daily log, megamenu aria-label fix, INP investigation | YES |
| 2026-06-18 | `Desktop/Website technical - piranav/2026-06-18/` | Daily log, promo banner fix, layout audit, Shopify CLI workflow doc (×2 — duplicate DR-003) | YES |
| 2026-06-19 | `Desktop/Website technical - piranav/2026-06-19/` | Daily log, layout audit, featured products fix, metafield bulk update, AI readiness audit | YES |
| 2026-06-22 | `Desktop/Website technical - piranav/2026-06-22/` | Daily log, hero section fix, search grid fix, search grid assessment plan, implementation plan | YES |
| 2026-06-23 | `Desktop/Website technical - piranav/2026-06-23/` | Daily log, search intent technical design, AI advisor design, SEO improvements, predictive search audit | YES |
| 2026-06-24 | `Desktop/Website technical - piranav/2026-06-24/` | Daily log, predictive search fix, 404 redesign, GMC fix, search input fix, product ID audit | YES |
| 2026-06-25 | `C:\Users\PC\Documents\piranav_aios\` | AIOS starter build (this file and 8 others) | NO — pending commit decision |

---

## Shopify Store Map

| Store | Myshopify Domain | CLI Command | Notes |
|---|---|---|---|
| LEDsone (UK) | `ledsone.myshopify.com` | `shopify theme pull --store ledsone.myshopify.com` | Primary store for piranav's work |
| Electricalsone | _(confirm with Varmen)_ | _(confirm)_ | Referenced in 2026-06-18 and 2026-06-19 session logs |
| Blueskytechco | _(confirm with Varmen)_ | _(confirm)_ | Referenced in 2026-06-16 accessibility fix |
| Wholesale Trendy | _(confirm with Varmen)_ | _(confirm)_ | Referenced in 2026-06-16 accessibility fix |

---

## Data Source Map

| Data Source | Access Method | Auth Required | Notes |
|---|---|---|---|
| Shopify Admin — LEDsone | Shopify MCP / `shopify auth login` | YES — stored per machine | Used for GraphQL queries, product/order management |
| Google Merchant Center | GMC web UI | YES | Referenced in 2026-06-24 GMC fix |
| Google Search Console | GSC web UI | YES | Referenced in SEO audit work |
| GitHub remote | `git push aios master` | YES — SSH/HTTPS auth | Remote: `aios-piranav` |

---

## Source / Evidence Used to Build This File

- 2026-06-25 discovery scan — `git ls-files` output, latest commit detail, remote inspection
- Varmen coordinator instruction for Mini-AIOS build

---

## Owner / Reviewer

| Role | Name |
|---|---|
| Assigned Staff | piranav |
| Coordinator / Reviewer | Varmen |
| Last Updated | 2026-06-25 |

---

## Status

STARTER — populated from 2026-06-25 discovery. Shopify store map has gaps (Electricalsone, Blueskytechco, Wholesale Trendy domains need confirmation).

---

## Pass / Fail Rule

Source map PASSES if: every production file referenced in a closure entry has a corresponding row in this file, with its git tracking status and store confirmed.
Source map FAILS if: a task evidence path cannot be resolved using this map.

---

## Next Step

1. Confirm missing Shopify store domains with Varmen
2. Add rows for any new production files touched in future sessions before closing those tasks

---

## Known Limits

- Store domains for Electricalsone, Blueskytechco, and Wholesale Trendy are not confirmed — do not use these store names in production commands without verifying
- This map reflects state as of 2026-06-25 — theme files may have been pushed to Shopify after the snapshot was taken
