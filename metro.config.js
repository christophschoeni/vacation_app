const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Configure SQL files as assets for Drizzle migrations
config.resolver.assetExts.push('sql');

module.exports = config;