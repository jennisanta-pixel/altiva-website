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
# 404 page: Cloudflare serves it for any missing address, at any depth, so its links must be absolute.
sed -E -e 's#href="altiva.html#href="/#g' \
    -e 's#href="(story|coffees|origin|supply|contact)\.html#href="/\1#g' \
    -e 's#href="css/#href="/css/#g' -e 's#src="js/#src="/js/#g' \
    404.html > dist/404.html
cp -R css js assets dist/
cp robots.txt sitemap.xml dist/
rm -f dist/assets/LEEME-fotografia.txt
find dist -name '.DS_Store' -delete
echo "Built dist/ with $(find dist -type f | wc -l | tr -d ' ') files"
