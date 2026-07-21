/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'FerienBudgetWidget',
  displayName: 'Ferien Budget',
  // Mirrored from the app so both sides address the same shared container.
  // Defined once in app.json; a mismatch here fails silently as an empty
  // widget rather than as a build error.
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
  colors: {
    $accent: '#007AFF',
    $widgetBackground: '#0B1C2E',
  },
  // WidgetKit's minimum, and comfortably below the app's own target.
  deploymentTarget: '17.0',
});
