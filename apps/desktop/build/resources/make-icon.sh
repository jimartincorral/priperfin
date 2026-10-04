#!/usr/bin/env bash
# Regenerates icon.png (1024x1024). electron-builder derives the .ico and .icns
# from it at package time, so this is the only icon asset we keep.
# Requires ImageMagick.
set -euo pipefail
cd "$(dirname "$0")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

convert -size 1024x1024 xc: \
  -sparse-color barycentric '0,0 #22B583  1023,0 #15906A  0,1023 #15906A  1023,1023 #0C5F49' \
  -alpha off "$tmp/bg.png"

convert -size 1024x1024 xc:black -fill white \
  -draw 'roundrectangle 0,0 1023,1023 228,228' -alpha off "$tmp/mask.png"

convert "$tmp/bg.png" "$tmp/mask.png" -compose CopyOpacity -composite "$tmp/base.png"

convert "$tmp/base.png" \
  -fill none -stroke '#FFFFFF' -strokewidth 46 \
  -draw "stroke-opacity 0.5 stroke-linecap round stroke-linejoin round polyline 268,420 430,300 586,376 800,196" \
  -stroke none -fill '#FFFFFF' \
  -draw 'roundrectangle 236,604 344,788 30,30' \
  -draw 'roundrectangle 392,500 500,788 30,30' \
  -draw 'roundrectangle 548,396 656,788 30,30' \
  -draw 'roundrectangle 704,268 812,788 30,30' \
  -depth 8 -strip PNG32:icon.png

echo "Wrote $(pwd)/icon.png"
