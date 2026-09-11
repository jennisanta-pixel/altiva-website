---
name: wrangler
description: Run Cloudflare Wrangler CLI commands against the ALTIVA site (Worker `altiva`, static assets from dist/). Use for deploying, previewing locally (wrangler dev), tailing live logs, listing/rolling back versions, checking what is live, managing secrets, or any `wrangler ...` / `npx wrangler ...` command. Also use when a deploy failed and you need to inspect it from the command line.
---

# Wrangler CLI — ALTIVA

The site is a Cloudflare **Worker named `altiva`** serving static assets from `dist/`.
Config: [wrangler.jsonc](../../../wrangler.jsonc). Build: [build.sh](../../../build.sh).

## Before anything: is wrangler runnable?

Wrangler needs Node. **Node is not installed on this Mac** — `node`, `npm` and `npx` are
all missing. Check first, don't assume:

```sh
command -v node npx || echo "Node missing"
```

If Node is missing, either:

- **Prefer the normal path** — no Node needed. Double-click `Deploy Altiva.command`
  (or run it). It pushes to `jennisanta-pixel/altiva-website` `main` and Cloudflare
  builds and publishes automatically. This is how the site is meant to ship.
- **Or install Node** only if a real wrangler command is needed:
  `brew install node` (Homebrew isn't installed either — see https://brew.sh) or a
  package from https://nodejs.org. Then `npx wrangler@latest ...` works; there is no
  `package.json` here, so always call it through `npx`, never a bare `wrangler`.

Never add `node_modules/` or a `package.json` to this repo just to run wrangler —
`npx wrangler@latest` fetches it on demand.

## Golden rules for this project

1. **Always build before deploying.** `wrangler deploy` uploads `./dist` exactly as it
   finds it. A stale or missing `dist/` publishes stale or empty content.
   ```sh
   sh build.sh && npx wrangler@latest deploy
   ```
2. **The Worker name must stay `altiva`.** Renaming it in `wrangler.jsonc` creates a
   *second* Worker and the custom domains stop resolving to the right one.
3. **Never commit `dist/`.** It's in `.gitignore`; keep it there.
4. **Don't deploy by hand when git will do it.** A manual `wrangler deploy` publishes
   whatever is on this Mac, which can be ahead of or behind `main`. Use it for
   emergencies and rollbacks; use `Deploy Altiva.command` for normal changes.
5. **Update `lastmod` in `sitemap.xml`** whenever page content changes.
6. `.claude/` is not copied by `build.sh`, so this skill never goes online.

## Commands

All commands run from the project root.

### Preview locally
```sh
sh build.sh && npx wrangler@latest dev
```
Serves `dist/` at http://localhost:8787 with the real Workers runtime. `--remote` runs
it on Cloudflare's edge instead of locally. Ctrl-C to stop.
For a plain static preview without Node, `python3 -m http.server -d dist 8000` is enough.

### Deploy
```sh
sh build.sh && npx wrangler@latest deploy
```
Add `--dry-run` first to see what would be uploaded without publishing.

### See what is live
```sh
npx wrangler@latest deployments list          # recent deployments, newest first
npx wrangler@latest versions list             # every uploaded version + ids
```

### Roll back
```sh
npx wrangler@latest rollback [<version-id>]
```
With no id it rolls back to the previous version and asks for confirmation.
**Ask the user before rolling back** — it changes what the public site serves.

### Live logs
```sh
npx wrangler@latest tail --format pretty
```
Streams requests and errors from the live Worker. Ctrl-C to stop.
Useful filters: `--status error`, `--search "404"`.

### Auth
```sh
npx wrangler@latest whoami        # which Cloudflare account is signed in
npx wrangler@latest login         # opens a browser to authorize
```
The Cloudflare build machine authorizes itself; `login` is only for this Mac.

### Secrets (not used today)
```sh
npx wrangler@latest secret list
npx wrangler@latest secret put <NAME>
```
Secrets live in Cloudflare, never in the repo. Local equivalents go in `.dev.vars`,
which is gitignored. The current site is static and needs none.

## Cloudflare-side settings (for reference)

Set in the dashboard under the `altiva` Worker → Settings → Builds:

- Build command: `sh build.sh`
- Deploy command: `npx wrangler deploy`
- Both `www.altivaspecialitycoffee.com` and `altivaspecialitycoffee.com` are declared as
  custom domains in `wrangler.jsonc`; www is the main address.

## When a deploy fails

1. Check `deploy-last-run.log` — last line is `== DONE` or `== FAILED`. A failure there
   is a git/GitHub problem, not a Cloudflare one.
2. If git pushed fine but the site didn't change, the Cloudflare build failed: check the
   Worker's Builds tab in the dashboard, or reproduce locally with
   `sh build.sh && npx wrangler@latest deploy --dry-run`.
3. `sh build.sh` prints a file count — currently **52 files**. Noticeably fewer means
   assets are missing from `dist/`.
