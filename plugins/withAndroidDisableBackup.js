// expo prebuild's base Android template defaults android:allowBackup to
// true with no dataExtractionRules/fullBackupContent restriction. The
// Supabase session token is safe either way (Services/secureStorage.js
// encrypts it via Android Keystore, WHEN_UNLOCKED_THIS_DEVICE_ONLY, so a
// restored copy is unusable on another device) -- but the offline sync
// queue (Services/SyncQueue.js: queued GPS-tagged custody transfers not yet
// synced) and cached data (Services/cache.js) sit in plain AsyncStorage,
// which adb backup / cloud auto-backup would include by default. Simplest
// fix: turn backup off entirely rather than hand-write granular include/
// exclude rules for a marginal per-field benefit.
const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withAndroidDisableBackup(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application) {
      application.$["android:allowBackup"] = "false";
    }
    return config;
  });
};
