# 404 Page Redesign — LEDsone
**Date:** 2026-06-24
**Store:** ledsone.co.uk
**Risk:** 🟡 Amber — 404 page only, no other pages affected

---

## Objective
Modernise the Shopify 404 page with a premium light theme, lighting-themed visual, and clear user recovery options.

---

## Files Changed
| File | Type | Change |
|------|------|--------|
| `sections/page-404.liquid` | Section | Full rewrite — light premium UI |
| `snippets/icon-404.liquid` | Snippet | New burnt bulb SVG with CSS animation |
| `templates/404.json` | Template | Cleaned — removed unused custom-html block |

**Files NOT changed:** header, footer, product pages, collection pages, search logic, global theme.

---

## Design — Light Premium Theme

### Colour System
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#fafaf8` | Page background |
| Heading | `#1a1a1a` | H1 |
| Body text | `#666` | Sub-heading |
| Accent gold | `#d4a017` | Hover, focus, border highlights |
| Primary CTA bg | `#1a1a1a` | "Back to Home" button |
| Secondary CTA | `#fff` + `#e0e0e0` border | "Search Products" button |
| Pill bg | `#fdf6e3` | Error 404 eyebrow badge |

### Layout
- Centred single-column, max-width 600px
- Mobile-first, no horizontal scroll
- All CTAs stack full-width on mobile (≤480px)

---

## Broken Bulb Visual — `icon-404.liquid`

### What makes it clearly "broken"
| Signal | Implementation |
|--------|----------------|
| Blackened glass | Dark burnt radial gradient `#2e2218` → `#1a1208` |
| Diagonal crack | SVG path with branch line across glass |
| Snapped filament | Two halves drooping apart with visible gap |
| Glowing break point | Orange dot `#ff8c00` + white core at snap |
| Rising smoke wisps | 3 animated ellipses floating up (2.8s loop) |
| Spark animation | 4 sparks pop from break point |
| Red X mark | Subtle `rgba(255,100,60,0.55)` ✕ on glass |
| Glass glint | White shine streak — confirms it's glass |

### Animation — pure CSS only
- `smoke-rise` — 3 staggered smoke wisps float upward
- `spark-pop` — 4 sparks burst from filament break
- `glow-breathe` — soft amber glow pulses behind bulb
- No JS, no external assets, no LCP impact

---

## Page Elements

### Eyebrow badge
- "Error 404" pill with pulsing gold dot
- `background: #fdf6e3` | `border: 1px solid #f0dfa0`

### Heading
`This light has gone out`

### Sub-heading
`The page you're looking for isn't available, but we can help you find the right lighting.`

### CTAs
| Button | Destination |
|--------|-------------|
| ← Back to Home (primary) | `{{ routes.root_url }}` |
| Search Products (secondary) | `/search?type=product` |

### Search box
- Native Shopify search route `{{ routes.search_url }}`
- `type=product` hidden input
- Gold border glow on focus
- `aria-label` on input and submit button

### Category shortcuts
| Label | URL |
|-------|-----|
| Pendant Lights | `/collections/pendant-lights` |
| Wall Lights | `/collections/wall-lights` |
| Light Bulbs | `/collections/light-bulbs` |
| Lamp Holders | `/collections/lamp-holders` |
| Outdoor Lights | `/collections/outdoor-lights` |

---

## Accessibility
- `<h1>` is the first heading on page, linked via `aria-labelledby`
- Bulb SVG wrapped in `aria-hidden="true"` — screen readers skip it
- All interactive elements have visible focus ring (`#d4a017` gold)
- Search form has `role="search"` and `aria-label`
- Category nav has `aria-label="Category shortcuts"`

---

## Testing Checklist
- [ ] Visit any bad URL — 404 page renders correctly
- [ ] Bulb is visually dark/broken (not a glowing working bulb)
- [ ] Smoke and spark animation plays
- [ ] "Back to Home" → goes to homepage
- [ ] "Search Products" → goes to `/search?type=product`
- [ ] Search box submits with `q=` and `type=product`
- [ ] 5 category links go to correct collection URLs
- [ ] No horizontal scroll on 375px mobile
- [ ] CTA buttons stack full-width on mobile
- [ ] Focus ring visible on all buttons, links, input
- [ ] No console errors in DevTools
- [ ] No external JS or CSS loaded
- [ ] Header and footer unchanged

---

## CAPABILITY LOG
- What was built: Premium light-theme 404 page with broken bulb animation
- Reusable: Yes
- If yes, where it applies: electricalsone.co.uk, any LEDsone group store
- Pattern name: `ledsone-404-light-premium-2026`
