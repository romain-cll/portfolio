#!/usr/bin/env bash
# Renders the favicon, Apple touch icon and default share image into public/.
# Needs Google Chrome. Run from anywhere: scripts/brand/render.sh
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
public="$here/../../public"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

shot() { # <html> <query> <width,height> <out.png>
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$work/profile" \
    --allow-file-access-from-files --default-background-color=00000000 \
    --force-device-scale-factor=1 --window-size="$3" \
    --screenshot="$4" "file://$here/$1$2" >/dev/null 2>&1
}

shot icon.html '' 512,512 "$work/icon.png"
# Chrome won't make a window smaller than ~500 px: render large, then scale down
shot icon.html '?square' 540,540 "$work/apple.png"
sips -z 180 180 "$work/apple.png" --out "$public/apple-touch-icon.png" >/dev/null
shot og.html '' 1200,630 "$public/og.png"
sips -z 32 32 "$work/icon.png" --out "$work/icon-32.png" >/dev/null
cp "$work/icon-32.png" "$public/favicon-32.png"
sips -s format ico "$work/icon-32.png" --out "$public/favicon.ico" >/dev/null
echo "Rendered into $public"
