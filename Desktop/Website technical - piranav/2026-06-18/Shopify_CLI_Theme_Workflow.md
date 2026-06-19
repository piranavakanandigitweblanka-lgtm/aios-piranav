# Shopify CLI Theme Workflow Guide

> End-to-end reference for pulling, editing, and pushing Shopify themes — LEDsone Technical Reference

---

## Overview

Shopify CLI for themes provides a local development workflow: pull a theme from your store, edit it locally, preview changes live, then push back.

---

## Step 1 — Install / Update Shopify CLI

```bash
npm install -g @shopify/cli@latest
```

Verify:

```bash
shopify version
```

If `shopify: command not found`, your global npm bin is missing from PATH — fix PATH or reinstall via Shopify's platform-specific docs.

---

## Step 2 — Authenticate

```bash
shopify auth login
```

Opens a browser login flow. Auth is stored per machine; subsequent commands reuse it.

---

## Step 3 — Pull the Theme

```bash
mkdir ledsone-theme
cd ledsone-theme
shopify theme pull --store ledsone.myshopify.com
```

Omitting `--theme` shows a selection list. Common flags:

| Flag | Description |
|------|-------------|
| `--live` | Pull the currently published live theme |
| `--theme <id>` | Pull a specific theme by numeric ID |
| `shopify theme list --store ...` | List all themes with their IDs |

---

## Step 4 — Edit Locally

```bash
code .
```

Pulled directory structure: `layout/`, `sections/`, `snippets/`, `assets/`, `templates/`, `config/`.

---

## Step 5 — Live Preview (Recommended)

```bash
shopify theme dev --store ledsone.myshopify.com
```

This will:
- Upload a temporary development theme (separate from live)
- Print a preview URL and theme editor URL
- Hot-reload CSS and section changes on save

> **Note:** `theme dev` creates an unpublished development copy. Changes do not affect the live theme until you explicitly push.

---

## Step 6 — Push Changes

```bash
shopify theme push --store ledsone.myshopify.com
```

CLI prompts to select which remote theme to overwrite, uploads files, and prints editor + preview links.

### Useful Push Flags

| Flag | Description |
|------|-------------|
| `--unpublished` | Create a new copy instead of overwriting |
| `--only "sections/*.liquid"` | Push only matching files |
| `--strict` | Run Theme Check, fail on errors |

---

## Full Command Sequence

```bash
# 1. Auth (once per machine)
shopify auth login

# 2. Pull theme
mkdir ledsone-theme && cd ledsone-theme
shopify theme pull --store ledsone.myshopify.com

# 3. Develop with live preview
shopify theme dev --store ledsone.myshopify.com

# 4. Push when done
shopify theme push --store ledsone.myshopify.com
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `shopify: command not found` | `npm install -g @shopify/cli@latest` and verify npm global bin is on PATH |
| Auth / not logged in errors | Run `shopify auth login` again |
| Wrong store being targeted | Always pass `--store <store-url>` explicitly |
| Accidentally overwrote live theme | Admin → Online Store → Themes → Actions → Download. Use `--unpublished` going forward |
