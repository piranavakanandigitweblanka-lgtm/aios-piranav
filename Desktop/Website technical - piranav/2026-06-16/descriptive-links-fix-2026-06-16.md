# Links Do Not Have Descriptive Text — Lighthouse Accessibility Fix
**Date:** 2026-06-16
**Theme:** `theme_export__ledsone-co-uk-promotion-week-4-2-mega-digital__16JUN2026-0705am`
**Lighthouse Issue:** "Links do not have descriptive text"

---

## Full Theme Audit — All `article.url` Link Occurrences

| File | Line | Link Content | Lighthouse Status | Action |
|---|---|---|---|---|
| `snippets/article-card.liquid` | 28 | Image only (alt may be empty) | **FAIL** | Fixed — `aria-hidden` |
| `snippets/article-card.liquid` | 45 | `{{ article.title }}` | PASS ✓ | No change |
| `snippets/article-card.liquid` | 78 | `{{ 'blog_post.read_more' \| t }}` → "READ MORE" | **FAIL** | Fixed — `aria-label` |
| `snippets/article-card-portfolio.liquid` | 16 | Image only (alt may be empty) | **FAIL** | Fixed — `aria-hidden` |
| `snippets/article-card-portfolio.liquid` | 33 | `{{ article.title }}` | PASS ✓ | No change |
| `snippets/blog-sidebar.liquid` | 40 | Image only (alt may be empty) | **FAIL** | Fixed — `aria-hidden` |
| `snippets/blog-sidebar.liquid` | 49 | `{{ article.title }}` | PASS ✓ | No change |
| `sections/main-article.liquid` | 200 | Previous Post label + article title (inside) | PASS ✓ | No change |
| `sections/main-article.liquid` | 210 | Next Post label + article title (inside) | PASS ✓ | No change |
| `sections/blog-posts.liquid` | 174 | Skeleton preview (editor only, `for i in 1..n`, no article object) | Skipped | Editor-only, never in production crawl |

---

## Root Cause Analysis

### Problem 1 — Generic "READ MORE" text (`article-card.liquid:78`)

The link visible text comes from a Shopify translation key:

```liquid
{{- 'blog_post.read_more' | t -}}
```

In English this renders as "Read More" or "READ MORE". Lighthouse flags generic link text because screen readers announce each link in isolation — "READ MORE" gives zero context about the destination article.

### Problem 2 — Image-only links with potentially empty alt text

`responsive-image.liquid` renders: `alt="{{ image.alt | escape }}"`

For article images, `article.image.alt` is whatever the merchant types in Shopify Admin → Blog Posts → image alt field. If left blank (common), the `<img>` gets `alt=""` (empty), making it decorative. An `<a>` containing only a decorative image has **no accessible name** — Lighthouse flags this.

Each affected file also has a title link (`{{ article.title }}`) pointing to the **same URL**. This makes the image link a duplicate link — it adds noise for screen reader users who hear the same destination announced twice.

---

## Fixes Applied

### Fix 1 — `snippets/article-card.liquid` · Line 78 — "READ MORE" button

**Before:**
```html
<a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="{{ article.url }}">
  {{- 'blog_post.read_more' | t -}}
</a>
```

**After:**
```html
<a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="{{ article.url }}" aria-label="Read more about {{ article.title }}" title="Read more about {{ article.title }}">
  {{- 'blog_post.read_more' | t -}}
</a>
```

Screen reader now announces: _"Read more about How to Choose the Right LED Lights for Your Home, link"_
Visual UI unchanged — "READ MORE" text still visible.

---

### Fix 2 — `snippets/article-card.liquid` · Line 28 — Duplicate image link

**Before:**
```html
<a href="{{ article.url }}">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

**After:**
```html
<a href="{{ article.url }}" aria-hidden="true" tabindex="-1">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

`aria-hidden="true"` — screen readers skip this link entirely (title link at line 45 already describes the destination).
`tabindex="-1"` — keyboard users also skip it (no duplicate Tab stop).
Visual UI unchanged — image is still visible and clickable by mouse.

---

### Fix 3 — `snippets/article-card-portfolio.liquid` · Line 16 — Duplicate image link

**Before:**
```html
<a href="{{ article.url }}">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

**After:**
```html
<a href="{{ article.url }}" aria-hidden="true" tabindex="-1">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

Same pattern — title link at line 33 covers the same destination.

---

### Fix 4 — `snippets/blog-sidebar.liquid` · Line 40 — Duplicate image link

**Before:**
```html
<a href="{{ article.url }}">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

**After:**
```html
<a href="{{ article.url }}" aria-hidden="true" tabindex="-1">
  {% render 'responsive-image', image: article.image, ... %}
</a>
```

Same pattern — title link at line 49 covers the same destination.

---

## Why `aria-hidden` Instead of `aria-label` for Image Links

Two approaches exist for duplicate image links:

| Approach | Result |
|---|---|
| `aria-label="{{ article.title }}"` on image link | Screen reader announces same article twice: title link + image link |
| `aria-hidden="true" tabindex="-1"` on image link | Screen reader announces article once (via title link only) |

`aria-hidden` is preferred — it eliminates duplicate navigation noise for screen reader users. WCAG 2.4.4 (Link Purpose) is satisfied by the remaining visible title link. Lighthouse only requires that all non-hidden links have descriptive text, so hidden links are excluded from the check.

---

## Files NOT Modified (Confirmed Passing or Out of Scope)

| File | Reason skipped |
|---|---|
| `sections/blog-posts.liquid:174` | Editor skeleton only — `for i in (1..num_post)` loop, no `article` object, never runs in production |
| `sections/main-article.liquid:200/210` | Previous/Next article links contain translated labels + `blog.previous_article.title` text inside |
| `sections/breadcrumb.liquid:86` | Inside JSON-LD `<script>` block, not an HTML `<a>` tag |
| `sections/main-article.liquid:507` | Inside JSON-LD `<script>` block |
| `snippets/article-schema.liquid:8` | Inside JSON-LD `<script>` block |

---

## Files Modified

| File | Line | Change |
|---|---|---|
| `snippets/article-card.liquid` | 28 | Added `aria-hidden="true" tabindex="-1"` to image link |
| `snippets/article-card.liquid` | 78 | Added `aria-label` and `title` to READ MORE link |
| `snippets/article-card-portfolio.liquid` | 16 | Added `aria-hidden="true" tabindex="-1"` to image link |
| `snippets/blog-sidebar.liquid` | 40 | Added `aria-hidden="true" tabindex="-1"` to image link |

**Risk: GREEN** — No visual change. No layout change. `aria-hidden` and `aria-label` are additive attributes — they affect screen reader output only.

---

## CAPABILITY LOG
- What was built: Descriptive link accessibility fix for Lighthouse "Links do not have descriptive text" warning
- Reusable: Yes
- If yes, where it applies: Any Shopify theme with article card snippets using image links + generic "Read More" buttons
- Pattern name: `lighthouse-descriptive-links-fix`
