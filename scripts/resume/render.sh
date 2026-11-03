#!/usr/bin/env bash
# Prints resume.html to public/resume-romain-caille.pdf, one US Letter page.
# Needs Google Chrome and `bun install` (fonts come from node_modules).
# Run from anywhere: scripts/resume/render.sh
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
out="$here/../../public/resume-romain-caille.pdf"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# The time budget lets the fonts load before printing
"$chrome" --headless=new --disable-gpu --user-data-dir="$work/profile" \
  --allow-file-access-from-files --no-pdf-header-footer --virtual-time-budget=5000 \
  --print-to-pdf="$work/resume.pdf" "file://$here/resume.html" >/dev/null 2>&1

pages=$(grep -aoE '/Type ?/Page([^s]|$)' "$work/resume.pdf" | wc -l | tr -d ' ')
if [ "$pages" != 1 ]; then
  echo "The resume runs to $pages pages, not 1: shorten it" >&2
  exit 1
fi
if ! grep -aq 'Geist' "$work/resume.pdf"; then
  echo "Geist is not embedded: run bun install" >&2
  exit 1
fi
cp "$work/resume.pdf" "$out"
echo "Rendered $out"
