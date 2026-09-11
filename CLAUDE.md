# ALTIVA website — instructions for Claude

## File structure (always use this)

The site is split into separate files. Keep it that way.

```
altiva.html        → HTML content only (markup, text, JSON-LD structured data)
css/styles.css     → all styles
js/main.js         → all JavaScript
assets/            → images
```

- **Styles go in `css/styles.css`.** Do not add `<style>` blocks to `altiva.html`. Prefer classes in the stylesheet over new inline `style=""` attributes.
- **JavaScript goes in `js/main.js`.** Do not add inline `<script>` blocks or `onclick=`-style handlers to `altiva.html`. The file is loaded at the end of `<body>` (`<script src="js/main.js"></script>`), so the DOM is ready when it runs.
- **Exceptions that stay inside `altiva.html`:** the `application/ld+json` structured data, and the Google Analytics (gtag) snippet when it is activated.
- **Image paths inside the CSS are relative to `css/`**, so they use `../assets/...` (e.g. `url("../assets/hero.jpg")`). Paths in the HTML use `assets/...`.
- This split replaces the older "single HTML file with embedded CSS" setup described in the `altiva-web-designer` skill. Follow this file for structure; follow the skill for everything else (design, responsive, accessibility, SEO, performance).
- No frameworks or build step: plain HTML, CSS and vanilla JS.

## Deploying

What goes online: `altiva.html` (as `index.html`), `css/`, `js/`, `assets/`, `robots.txt` and `sitemap.xml`. `build.sh` controls this.
`altiva-backup-single-file.html` (old single-file backup), `CLAUDE.md`, `wrangler.jsonc` and `build.sh` never go online.

Hosting: Cloudflare Worker `altiva` (static assets only). Domain: https://www.altivaspecialitycoffee.com/ (www is the main address; the root domain redirects to www).

Auto-deploy: the site is in a private GitHub repo connected to the `altiva` Worker (Settings → Builds). Every commit to `main` publishes the site:
- Cloudflare build command: `sh build.sh`. It copies `altiva.html` to `dist/index.html` and adds `css/`, `js/`, `assets/` (without `LEEME-fotografia.txt`), `robots.txt` and `sitemap.xml`. Only `dist/` goes online.
- Deploy command: `npx wrangler deploy`, using `wrangler.jsonc` (the Worker name must stay `altiva`; both hostnames are declared as custom domains).
- To deploy: double-click `Deploy Altiva.command` in this folder (Claude can do it through Finder with computer use). It uses the GitHub CLI already signed in on the Mac (installed in `~/.local/bin/gh`, account jennisanta-pixel) to commit every change and push to `jennisanta-pixel/altiva-website` `main`. The result is written to `deploy-last-run.log` (last lines `== DONE` or `== FAILED`). Never commit `dist/`. Update `lastmod` in `sitemap.xml` when the content changes.
- Always propose to push to github when done with a task
- A new file that should go online must also be added to `build.sh`.
- `altiva-upload-cloudflare/` and `altiva-upload-cloudflare.zip` are the old manual-upload copies. Don't use them now that GitHub deploys the site.
