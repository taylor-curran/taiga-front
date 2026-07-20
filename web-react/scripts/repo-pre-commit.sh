#!/usr/bin/env bash
# Composite hook: React port checks when web-react/ changes, legacy SCSS lint when app styles change.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

STAGED="$(git diff --cached --name-only || true)"

if echo "$STAGED" | grep -qE '^web-react/'; then
  (cd web-react && npm run lint && npm run test:unit)
fi

if echo "$STAGED" | grep -qE '^(app/.*\.scss|gulpfile\.js)'; then
  if command -v nvm >/dev/null 2>&1; then
    # shellcheck source=/dev/null
    [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use 16.19.1 >/dev/null 2>&1 || true
  fi
  npx gulp scss-lint --fail
fi
