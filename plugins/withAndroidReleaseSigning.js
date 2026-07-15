// Wires release signing into android/app/build.gradle from a keystore kept
// outside the generated android/ tree (release.keystore + keystore.properties
// at the repo root, both gitignored -- see STORE.md SS1) so it's not lost on
// `expo prebuild --clean`, which regenerates this file from scratch. This
// used to be a hand-edit directly to build.gradle, which is exactly what
// broke the first time --clean actually got used (for the SDK 52 upgrade).
const { withAppBuildGradle } = require("expo/config-plugins");

const LOADER_SNIPPET = `
// Release signing credentials, kept outside the generated android/ tree (see
// /keystore.properties, gitignored) so they survive \`expo prebuild --clean\`,
// which regenerates this file from scratch. See plugins/withAndroidReleaseSigning.js.
def keystorePropertiesFile = rootProject.file("../keystore.properties")
def keystoreProperties = new Properties()
def hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {`;

const RELEASE_SIGNING_CONFIG_SNIPPET = `
        if (hasReleaseKeystore) {
            release {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`;

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes("withAndroidReleaseSigning")) {
      return config;
    }

    if (!contents.includes("\nandroid {")) {
      throw new Error("withAndroidReleaseSigning: could not find 'android {' in app/build.gradle");
    }
    contents = contents.replace("\nandroid {", LOADER_SNIPPET);

    // signingConfigs { debug { ... } } -> add a release {} block right after
    // debug's closing brace, anchored on debug's known content (not generic
    // brace-position scanning -- debug's closing "}" is indented 8 spaces,
    // matching a bare "\n    }" would instead land on signingConfigs' own
    // 4-space-indented closing brace and put the release block outside it).
    const debugBlockAnchor = "keyPassword 'android'\n        }";
    if (!contents.includes(debugBlockAnchor)) {
      throw new Error("withAndroidReleaseSigning: could not find end of signingConfigs.debug block");
    }
    contents = contents.replace(debugBlockAnchor, debugBlockAnchor + RELEASE_SIGNING_CONFIG_SNIPPET);

    // buildTypes { release { signingConfig signingConfigs.debug ... } } ->
    // use the release config when available. Anchored on the comment right
    // above it, since "signingConfig signingConfigs.debug" also appears
    // verbatim in buildTypes.debug (which must stay untouched).
    const releaseAnchor = "// see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug";
    if (!contents.includes(releaseAnchor)) {
      throw new Error("withAndroidReleaseSigning: could not find the release buildType's signingConfig line");
    }
    contents = contents.replace(
      releaseAnchor,
      "// see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig hasReleaseKeystore ? signingConfigs.release : signingConfigs.debug"
    );

    config.modResults.contents = contents;
    return config;
  });
};
