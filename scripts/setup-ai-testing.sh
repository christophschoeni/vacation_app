#!/usr/bin/env bash
# One-time setup so Claude Code can drive the iOS simulator: tap, type, read
# the UI tree and screenshot — not just deep-link + screenshot.
#
# Run this once, interactively, on the Mac. It is NOT run by CI or the app.
#
# What it installs:
#   - idb-companion + fb-idb : Facebook's iOS Development Bridge, which provides
#                              the actual tap / text / describe-ui primitives the
#                              simulator's own `xcrun simctl` lacks.
#   - ios-simulator-mcp      : an MCP server that exposes those primitives to
#                              Claude Code as tools (ui_tap, ui_type, ui_swipe,
#                              ui_describe_all, screenshot, launch_app).
set -euo pipefail

echo "==> Installing idb-companion (Homebrew)…"
brew tap facebook/fb
brew install idb-companion

echo "==> Installing fb-idb (Python CLI)…"
if command -v pipx >/dev/null 2>&1; then
  pipx install fb-idb
else
  echo "    pipx not found; installing via pip3 --user"
  pip3 install --user fb-idb
fi

echo "==> Registering the ios-simulator MCP server with Claude Code…"
claude mcp add ios-simulator npx ios-simulator-mcp

cat <<'DONE'

==> Done.

Verify it works:
  idb list-targets            # should list your booted simulator
  claude mcp list             # should show "ios-simulator"

Then, inside Claude Code, the click-loop is:
  1. boot + launch the app         (npm run ios, or xcrun simctl launch …)
  2. deep-link to a screen         (see .maestro/ or the ai-screen-testing skill)
  3. ui_describe_all               (labels + coordinates of every element)
  4. ui_tap / ui_type              (drive the screen)
  5. screenshot + Read             (verify visually)

See the ai-screen-testing skill for the full route/deep-link reference.
DONE
