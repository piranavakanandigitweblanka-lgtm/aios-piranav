# Abat-Jour Promo Banner — CONFIG Addition
**Date:** 2026-06-18
**Theme:** `theme_export__ledsone-fr-mega-store-1-0__15JUN2026-0226pm`
**Store:** ledsone.fr (French store)
**File Modified:** `snippets/pk-discount-banner.liquid`

---

## Objective

Add `abat-jour` collection to the existing promo banner CONFIG so products in that collection display the discount banner with code `ABAT10` when quantity ≥ 2.

---

## Pre-Change Verification

| Check | Result |
|---|---|
| File located | `snippets/pk-discount-banner.liquid` — ledsone.fr theme |
| CONFIG object found at line | 98 |
| Existing entries | `lumiere-daraignee`, `applique-murale`, `lampes-suspendues` |
| `abat-jour` already present | No — clear to proceed |
| `ABAT10` already present | No — clear to proceed |

---

## Change Made

**Before (lines 98–102):**
```js
var CONFIG = {
    'lumiere-daraignee':  { label: '2 suspensions araignée', code: 'SPIDER10' },
    'applique-murale':    { label: '2 appliques murales',    code: 'LUMIÈRE10' },
    'lampes-suspendues':  { label: '2 lampes suspendues',    code: 'PLIGHT10' }
  };
```

**After (lines 98–103):**
```js
var CONFIG = {
    'lumiere-daraignee':  { label: '2 suspensions araignée', code: 'SPIDER10' },
    'applique-murale':    { label: '2 appliques murales',    code: 'LUMIÈRE10' },
    'lampes-suspendues':  { label: '2 lampes suspendues',    code: 'PLIGHT10' },
    'abat-jour':          { label: '2 abat-jour',            code: 'ABAT10'   }
  };
```

---

## Validation

| Check | Result |
|---|---|
| JS object syntax valid | ✓ PASS — trailing comma on line 101, no trailing comma on last entry |
| Duplicate handles | ✓ PASS — `abat-jour` appears exactly once |
| Collection match logic | ✓ PASS — `productCollections.forEach` checks `c.handle` against CONFIG keys |
| Quantity unlock | ✓ PASS — hardcoded `qty >= 2` applies to all CONFIG entries including `abat-jour` |
| Existing entries untouched | ✓ PASS — no other lines changed |

---

## Collection Details

| Item | Value |
|---|---|
| Collection URL | https://ledsone.fr/collections/abat-jour |
| Collection Handle | `abat-jour` |
| Discount Code | `ABAT10` |
| Banner Label | `2 abat-jour` |
| Unlock Quantity | ≥ 2 |

---

## Risk Assessment

**GREEN** — Additive change only. One new key added to an existing JS object. No styling, logic, or existing entry was modified.

---

## CAPABILITY LOG
- What was built: Promo banner CONFIG extension for new collection
- Reusable: Yes
- If yes, where it applies: Any new collection needing a quantity-unlock discount banner on ledsone.fr product pages
- Pattern name: `promo-banner-config-add-collection`
