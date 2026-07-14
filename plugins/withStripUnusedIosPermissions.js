// expo-camera and expo-location (this SDK's versions) always populate
// NSMicrophoneUsageDescription / NSLocationAlways(AndWhenInUse)UsageDescription
// with a generic fallback string, even when their own permission options are
// left unset or passed `false` — both plugins do
// `options.permission || existingValue || DEFAULT_TEXT`, and `false` is
// falsy, so it just falls through to DEFAULT_TEXT instead of removing the
// key. AgroChain never records audio/video and never requests background
// ("Always") location, so declaring these strings is an unused-permission
// smell that App Review flags. Config plugins wrap outside-in — the plugin
// listed *first* in app.json's `plugins` array ends up as the innermost
// wrapper and therefore runs *last* — so this must be registered before
// expo-camera and expo-location for its deletions to stick.
const { withInfoPlist } = require("expo/config-plugins");

const UNUSED_IOS_PERMISSION_KEYS = [
  "NSMicrophoneUsageDescription",
  "NSLocationAlwaysAndWhenInUseUsageDescription",
  "NSLocationAlwaysUsageDescription",
];

module.exports = function withStripUnusedIosPermissions(config) {
  return withInfoPlist(config, (config) => {
    for (const key of UNUSED_IOS_PERMISSION_KEYS) {
      delete config.modResults[key];
    }
    return config;
  });
};
