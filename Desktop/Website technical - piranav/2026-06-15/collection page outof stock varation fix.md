# Collection Availability Fix Report

## The Problem
On your collection pages, some products were displaying a **"Sold Out"** badge and hiding the **"Add to Cart"** button, even when secondary variants (like alternative colors or sizes) still had active inventory available for purchase. 

This was causing a misleading user experience that likely deterred customers from clicking into products and purchasing available items.

## The Root Cause
The issue originated from how the theme manually calculated the `sold_out` status for products displayed on the collection grid. 

In both the grid view (`snippets/product-item.liquid`) and list view (`snippets/product-list-item.liquid`), the custom Liquid code contained logic that was restricting the inventory check to **only the first variant** or **only variants matching the first color**.

**Flawed Logic Snippet Example:**
```liquid
if product.options_with_values.size < 2
  for variant in product.variants limit: 1
    assign product_avail = variant.available
```

Because of the `limit: 1` filter and similar `where` queries isolating the first color, if the first variant happened to be out of stock, the entire product card was flagged as `sold_out = true`. The script completely ignored the stock status of the 2nd, 3rd, or 4th variants.

## The Applied Fix

We neutralized the flawed logic by appending a robust, native inventory check immediately before the card's labels and buttons are rendered. 

### What We Changed
Instead of manually calculating availability based on restricted loops, we overrode the `sold_out` and `pre_order` variables using Shopify's highly reliable `product.available` property. `product.available` natively checks if *any* variant of a product is in stock.

**New Logic:**
```liquid
if product.available == false
  assign sold_out = true
  assign pre_order = false
else
  assign sold_out = false
  // Followed by logic to sum total positive inventory to properly flag pre-orders
endif
```

### Files Modified:
1. `snippets/product-item.liquid`
2. `snippets/product-list-item.liquid`

## The Result
1. **Accurate Badges**: The "Sold Out" badge will now only appear if every single variant of the product is out of stock.
2. **Active Buttons**: The "Add to Cart" / "Choose Options" button will remain active and visible as long as at least one variant is available to purchase.
3. **No Lost Sales**: Customers will no longer be incorrectly deterred from clicking into products that actually have available sizes/colors.
