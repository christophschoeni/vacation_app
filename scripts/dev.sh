#!/usr/bin/env bash
#
# One command to bring up the whole stack for local development:
#   1. Postgres 18 + pgvector (docker compose), waited on until healthy
#   2. Django: auto-apply migrations, then run the API server
#   3. Expo Metro bundler for the mobile app
#
# Usage (from repo root or anywhere):
#   ./scripts/dev.sh                 # start everything
#   ./scripts/dev.sh --clear         # same, but clear the Metro/Expo cache first
#   ./scripts/dev.sh --clear-all     # nuke Metro + watchman + Expo caches, then start
#   ./scripts/dev.sh --backend-only  # only Postgres + Django (no Metro)
#   ./scripts/dev.sh --mobile-only   # only Metro (assumes backend already up)
#
# Ctrl-C stops the API and Metro cleanly. Postgres is left running (it's cheap
# and shared); stop it with:  pnpm db:down
set -euo pipefail

# --- resolve repo root regardless of where the script is called from ---------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$ROOT/apps/api"
MOBILE_DIR="$ROOT/apps/mobile"
COMPOSE="$ROOT/infra/docker-compose.yml"
DB_CONTAINER="vacation_db"

CLEAR_CACHE=false
CLEAR_ALL=false
RUN_BACKEND=true
RUN_MOBILE=true

for arg in "$@"; do
  case "$arg" in
    --clear)        CLEAR_CACHE=true ;;
    --clear-all)    CLEAR_CACHE=true; CLEAR_ALL=true ;;
    --backend-only) RUN_MOBILE=false ;;
    --mobile-only)  RUN_BACKEND=false ;;
    -h|--help)      grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $arg (try --help)"; exit 1 ;;
  esac
done

log()  { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# --- preconditions -----------------------------------------------------------
require() { command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not installed"; }
require docker
$RUN_BACKEND && require uv
$RUN_MOBILE  && require pnpm

# --- child process cleanup ---------------------------------------------------
PIDS=()
cleanup() {
  log "Shutting down (Postgres stays up — 'pnpm db:down' to stop it)…"
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# --- 0. Pre-flight: clear stale processes from a previous run ----------------
# A leftover Metro/API from an earlier session holds ports 8081/8000 and makes
# the new one fail to bind (silently). We only touch processes belonging to THIS
# repo — other projects (e.g. on :8060) are never affected. Ports are matched to
# this repo's own working dir before killing, so a foreign server on 8000/8081
# is left alone and reported instead.
kill_repo_procs() {
  # $1 = pgrep pattern (must include the repo path so it's scoped to us)
  local pattern="$1"
  local pids
  pids="$(pgrep -f "$pattern" 2>/dev/null || true)"
  [ -n "$pids" ] && kill $pids 2>/dev/null || true
}

free_repo_port() {
  # $1 = port, $2 = human name. Kill the listener only if it's ours (cwd under
  # this repo); otherwise warn and let the later bind fail loudly.
  local port="$1" name="$2" pid
  pid="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
  [ -z "$pid" ] && return 0
  local cwd
  cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1 || true)"
  if [[ "$cwd" == "$ROOT"* ]]; then
    warn "Freeing stale $name on port $port (leftover from a previous run)…"
    kill "$pid" 2>/dev/null || true
    sleep 1
  else
    warn "Port $port is used by another process (not this repo: ${cwd:-unknown}); leaving it alone"
  fi
}

log "Pre-flight: clearing stale processes from a previous run…"
kill_repo_procs "$ROOT/node_modules/.bin/expo"
kill_repo_procs "$ROOT/apps/mobile.*expo start"
kill_repo_procs "$ROOT/apps/api/.venv/bin/python.*manage.py runserver"
$RUN_MOBILE  && free_repo_port 8081 "Metro"
$RUN_BACKEND && free_repo_port 8000 "API"

# --- 1. Postgres -------------------------------------------------------------
if $RUN_BACKEND; then
  log "Starting Postgres 18 + pgvector…"
  docker compose -f "$COMPOSE" up -d

  log "Waiting for Postgres to be healthy…"
  for i in $(seq 1 30); do
    if docker exec "$DB_CONTAINER" pg_isready -U vacation -d vacation >/dev/null 2>&1; then
      ok "Postgres is ready"
      break
    fi
    [ "$i" -eq 30 ] && die "Postgres did not become ready in time"
    sleep 1
  done

  # --- 2. Django: env + migrations ------------------------------------------
  cd "$API_DIR"
  if [ ! -f .env ]; then
    warn ".env missing — copying from .env.example"
    cp .env.example .env
  fi
  log "Installing backend deps (uv sync)…"
  uv sync --quiet
  log "Applying Django migrations…"
  uv run --no-sync python manage.py migrate --noinput
  ok "Database is migrated"
fi

# --- 3. start the servers ----------------------------------------------------
if $RUN_BACKEND; then
  log "Starting Django API on http://127.0.0.1:8000 …"
  ( cd "$API_DIR" && uv run --no-sync python manage.py runserver 127.0.0.1:8000 ) &
  PIDS+=("$!")
fi

if $RUN_MOBILE; then
  if $CLEAR_ALL; then
    log "Clearing ALL caches (Metro + watchman + Expo)…"
    watchman watch-del-all 2>/dev/null || true
    rm -rf "$MOBILE_DIR/.expo" "${TMPDIR:-/tmp}/metro-"* "${TMPDIR:-/tmp}/haste-map-"* 2>/dev/null || true
  fi
  EXPO_ARGS=""
  $CLEAR_CACHE && EXPO_ARGS="--clear"
  log "Starting Expo Metro bundler${EXPO_ARGS:+ (cache cleared)}…"
  ( cd "$MOBILE_DIR" && pnpm exec expo start $EXPO_ARGS ) &
  PIDS+=("$!")
fi

ok "Stack is up. Press Ctrl-C to stop."
wait
