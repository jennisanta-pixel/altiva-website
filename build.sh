#!/bin/sh
# Builds the public site into dist/ for Cloudflare.
# Only the files listed here go online.
set -e
rm -rf dist
mkdir -p dist
cp altiva.html dist/index.html
# Inner pages. Online the home page is index.html (served at /), so point home links there.
for p in story origin coffees supply contact; do
  cp "$p.html" "dist/$p.html"
  sed -i.bak 's#href="altiva.html#href="/#g' "dist/$p.html" && rm -f "dist/$p.html.bak"
done
cp -R css js assets dist/
cp robots.txt sitemap.xml dist/
rm -f dist/assets/LEEME-fotografia.txt
find dist -name '.DS_Store' -delete
echo "Built dist/ with $(find dist -type f | wc -l | tr -d ' ') files"
