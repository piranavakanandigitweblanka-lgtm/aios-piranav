# Shopify CLI Theme Development Workflow
**Date:** 2026-06-18
**Scope:** Windows + Shopify CLI + VS Code + Claude Code

---

## 1. Environment

| Tool | Purpose |
|---|---|
| Windows 11 | Development OS |
| Shopify CLI | Theme pull / push / local preview |
| VS Code | Code editor |
| Claude Code | AI-assisted development (snippets, fixes, audits) |
| Git | Version control and rollback |

---

## 2. Authentication

```bash
# Login to Shopify account
shopify auth login

# Verify connected store
shopify theme list --store STORE.myshopify.com
```

- Browser opens for OAuth login
- Select the correct Partner account
- Store access is scoped per command via `--store` flag
- Re-run `shopify auth login` if session expires

---

## 3. Theme Workflow

### Step 1 — Pull Theme
```bash
shopify theme pull --store STORE.myshopify.com
```
Downloads the selected theme to your local directory. Always pull before starting work to ensure you have the latest version.

### Step 2 — Local Development
- Edit files in VS Code
- Use Claude Code for fixes, audits, and snippet generation
- Never edit the Live Theme directly — work on a Development Theme

### Step 3 — Local Preview
```bash
shopify theme dev --store STORE.myshopify.com
```
- Starts a local development server
- Live-reloads on file save
- Opens a preview URL (Shopify-hosted, not localhost)
- Test all changes here before pushing

### Step 4 — Push Changes
```bash
shopify theme push --store STORE.myshopify.com
```
- Pushes local changes to the selected theme on Shopify
- Confirm you are pushing to Development Theme, not Live Theme
- Run `shopify theme list` first to verify target theme ID

---

## 4. Recommended Commands

```bash
# Authenticate
shopify auth login

# List all themes (find theme ID)
shopify theme list --store STORE.myshopify.com

# Pull theme files locally
shopify theme pull --store STORE.myshopify.com

# Start local dev server
shopify theme dev --store STORE.myshopify.com

# Push changes back to Shopify
shopify theme push --store STORE.myshopify.com

# Push to a specific theme by ID (safer)
shopify theme push --store STORE.myshopify.com --theme THEME_ID

# Pull a specific theme by ID
shopify theme pull --store STORE.myshopify.com --theme THEME_ID
```

---

## 5. Development Flow

```
Shopify Store
     ↓
shopify theme pull       ← get latest theme files
     ↓
VS Code + Claude Code    ← edit, fix, audit
     ↓
shopify theme dev        ← preview locally
     ↓
Testing                  ← verify on preview URL
     ↓
Git commit               ← save checkpoint before push
     ↓
shopify theme push       ← deploy to Development Theme
     ↓
QA on Shopify admin      ← final check before promoting to Live
```

---

## 6. Best Practices

- **Never edit the Live Theme directly** — always use a Development Theme
- **Run `shopify theme list` before every push** — confirm the correct theme ID
- **Git commit before major changes** — always have a rollback point
- **Test locally with `theme dev` before every push**
- **Keep a backup theme export** — download via Shopify Admin → Online Store → Themes → Actions → Download
- **One change at a time** — small, isolated pushes are easier to roll back
- **Use `--theme THEME_ID` flag** — avoids accidentally pushing to wrong theme

---

## 7. Common Troubleshooting

| Problem | Fix |
|---|---|
| Authentication expired | Run `shopify auth login` again |
| Wrong store selected | Add `--store STORE.myshopify.com` explicitly to every command |
| Theme push fails | Check file syntax errors locally first; run `shopify theme dev` to catch errors |
| Preview not updating | Hard refresh browser (Ctrl+Shift+R); check `theme dev` terminal for errors |
| `shopify` command not found | Reinstall Shopify CLI: `npm install -g @shopify/cli @shopify/theme` |
| Permission denied on push | Confirm your Shopify account has Theme access on that store |

---

## 8. Store Reference (ledsone)

| Store | URL | Handle |
|---|---|---|
| UK | ledsone.myshopify.com | `ledsone-co-uk` |
| FR | ledsone-fr.myshopify.com | `ledsone-fr` |

> Replace `STORE.myshopify.com` with the correct store handle in all commands above.
