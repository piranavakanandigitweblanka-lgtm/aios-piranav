# Shopify MCP Re-authorization Fix
**Date:** 2026-06-22  
**Session:** Piranav

---

## Full Session Logs (Raw)

```
• Let me check the low stock products on your Shopify store.

• Let me query low stock products using GraphQL.

  Called Shopify (ctrl+o to expand)

• The Shopify connection has expired and needs re-authorization. Please reconnect your Shopify store:

  1. Open Claude Code settings / MCP configuration
  2. Re-authenticate the Shopify MCP server

  Alternatively, you can run this from the terminal to check low stock via Shopify CLI:

  shopify auth login

  Or if you'd prefer, share your store URL and I can help you run the inventory 
  query a different way once the connection is restored.

* Brewed for 17s

> reconnect shopify and try again
```

---

## Problem
Shopify MCP connection expired while trying to query low stock products via GraphQL.  
Error: "The Shopify connection has expired and needs re-authorization."

## What Was Done
Identified the cause and documented the fix steps for Shopify MCP token expiry.

## Fix Options (in order of preference)

### Option 1 — Re-authorize via Claude Code Settings
1. Press **Ctrl+,** in Claude Code (or go to Settings)
2. Find **MCP Servers** → locate the Shopify MCP entry
3. Click **Reconnect** or **Re-authenticate**
4. Complete the OAuth flow in the browser that opens

### Option 2 — Re-auth via Terminal
```bash
shopify auth login
```
Refreshes Shopify CLI credentials used by the MCP server.

### Option 3 — Restart the MCP Server
1. Claude Code Settings → MCP configuration
2. Disable the Shopify MCP server → save
3. Re-enable it → save
4. Server restarts and re-authenticates

## Root Cause
Shopify OAuth tokens expire after a period of inactivity. Re-authenticating once restores the connection.

## Status
Fix documented. Re-authentication to be completed by Piranav manually.

---

CAPABILITY LOG  
- What was built: Shopify MCP reconnect troubleshooting guide  
- Reusable: Yes  
- If yes, where it applies: Any session where Shopify MCP token expires  
- Pattern name: shopify-mcp-token-expiry-fix
