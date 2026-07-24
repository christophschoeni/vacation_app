// Regenerates .expo/types/router.d.ts — the typed-routes contract — WITHOUT a
// running dev server.
//
// Why this exists: `.expo/` is gitignored and Expo Router only rewrites
// router.d.ts while `expo start` is running. So `tsc` run on its own (in a
// pre-commit hook, in CI, or after a fresh clone) would check navigation
// against a stale or missing route list — the source of "the link works
// sometimes". Running this first makes `typecheck` deterministic.
//
// It calls the same `regenerateDeclarations` entry point the dev server uses
// (expo-router/build/typed-routes), pointed at the app/ directory.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(projectRoot, 'app');
const typesDir = path.join(projectRoot, '.expo', 'types');

// Expo Router reads the app root from this env var when run outside Metro.
process.env.EXPO_ROUTER_APP_ROOT = appRoot;

const typedRoutes = require('expo-router/build/typed-routes');

if (typeof typedRoutes.regenerateDeclarations !== 'function') {
  console.error('[gen-route-types] expo-router typed-routes API not found; skipping.');
  process.exit(0);
}

try {
  // SDK 52+ takes a plugin-options argument; older builds take none.
  if ('version' in typedRoutes && typedRoutes.version >= 52) {
    typedRoutes.regenerateDeclarations(typesDir, {});
  } else {
    typedRoutes.regenerateDeclarations(typesDir);
  }
  console.log('[gen-route-types] .expo/types/router.d.ts regenerated.');
} catch (err) {
  console.error('[gen-route-types] failed:', err.message);
  process.exit(1);
}
