#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

printf '%s
' "======================================" "FNAF-Three Production Smoke Test" "======================================"

if [[ ! -d "$DIST_DIR" ]]; then
  printf '❌ Error: dist directory not found. Run "npm run build" first.
'
  exit 1
fi
printf '✓ dist directory exists
'

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  printf '❌ Error: index.html not found in dist
'
  exit 1
fi
printf '✓ index.html exists
'

if ! grep -q 'type="module"' "$DIST_DIR/index.html"; then
  printf '❌ Error: index.html does not contain module script tag
'
  exit 1
fi
printf '✓ index.html contains module script
'

if [[ ! -d "$DIST_DIR/assets" ]]; then
  printf '❌ Error: assets directory not found
'
  exit 1
fi
printf '✓ assets directory exists
'

JS_FILES=$(find "$DIST_DIR/assets" -maxdepth 1 -name '*.js' | wc -l | tr -d ' ')
if [[ $JS_FILES -lt 1 ]]; then
  printf '❌ Error: no JavaScript files found in assets
'
  exit 1
fi
printf '✓ Found %d JavaScript file(s)
' "$JS_FILES"

INDEX_SIZE=$(stat -f%z "$DIST_DIR/index.html" 2>/dev/null || stat -c%s "$DIST_DIR/index.html" 2>/dev/null)
printf '✓ index.html size: %s bytes
' "$INDEX_SIZE"

TOTAL_JS_SIZE=0
while IFS= read -r file; do
  SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  TOTAL_JS_SIZE=$((TOTAL_JS_SIZE + SIZE))
done < <(find "$DIST_DIR/assets" -maxdepth 1 -name '*.js' -print)
printf '✓ Total JavaScript size: %d KB
' $((TOTAL_JS_SIZE / 1024))

if compgen -G "$DIST_DIR/assets/three-*.js" >/dev/null; then
  printf '✓ Three.js chunk found (code splitting active)
'
else
  printf '⚠️  Warning: Three.js chunk not found (code splitting may not be working)
'
fi

GZ_FILES=$(find "$DIST_DIR" -name '*.gz' | wc -l | tr -d ' ')
BR_FILES=$(find "$DIST_DIR" -name '*.br' | wc -l | tr -d ' ')

if [[ $GZ_FILES -gt 0 ]]; then
  printf '✓ Found %d gzip compressed file(s)
' "$GZ_FILES"
else
  printf '⚠️  Warning: No gzip compressed files found
'
fi

if [[ $BR_FILES -gt 0 ]]; then
  printf '✓ Found %d brotli compressed file(s)
' "$BR_FILES"
else
  printf '⚠️  Warning: No brotli compressed files found
'
fi

printf '%s
' "======================================" "Manual Testing Checklist" "======================================"
printf '%s
' "Run 'npm run preview' and verify:" "  [ ] Application loads without errors" "  [ ] Three.js scene renders correctly" "  [ ] Camera switching works (0-4 keys)" "  [ ] Door toggles work (Q, E keys)" "  [ ] HUD displays correctly" "  [ ] Power system functions" "  [ ] Game state transitions (win/lose)" "  [ ] Restart works (R key)"
printf '%s
' "Mobile/Touch Testing (use browser dev tools):" "  [ ] Touch controls are responsive" "  [ ] Audio unlocks on first interaction" "  [ ] Performance is acceptable on mobile" "  [ ] Layout works in portrait/landscape"
printf '✅ Automated checks passed!
'
