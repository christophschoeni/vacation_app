const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure SQL files as assets for Drizzle migrations
config.resolver.assetExts.push('sql');

module.exports = config;