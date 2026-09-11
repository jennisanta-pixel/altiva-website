#!/bin/sh
# Builds the public site into dist/ for Cloudflare.
# Only the files listed here go online.
set -e
rm -rf dist
mkdir -p dist
cp altiva.html dist/index.html
cp -R css js assets dist/
cp robots.txt sitemap.xml dist/
rm -f dist/assets/LEEME-fotografia.txt
find dist -name '.DS_Store' -delete
echo "Built dist/ with $(find dist -type f | wc -l | tr -d ' ') files"
