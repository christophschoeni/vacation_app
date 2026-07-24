const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo (pnpm): the app lives in apps/mobile but dependencies are hoisted
// and symlinked from the workspace root. Metro must watch the whole workspace
// and resolve modules from both the app's and the root's node_modules.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the full monorepo so changes in shared packages are picked up.
config.watchFolders = [workspaceRoot];

// Resolve dependencies from the app first, then the hoisted root store.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm uses symlinked, non-hierarchical node_modules; disable the classic
// walk-up lookup so Metro trusts nodeModulesPaths instead.
config.resolver.disableHierarchicalLookup = true;

// Configure SQL files as assets for Drizzle migrations.
config.resolver.assetExts.push('sql');

module.exports = config;
