// The `fmt` C++ library bundled by RCT-Folly (via react-native's Pods) uses
// FMT_STRING(...) compile-time checks that rely on C++20 consteval. Xcode
// 26.4+'s Clang enforces stricter consteval rules that this older fmt
// version (11.0.2, pulled in by React Native < 0.83.9 / Expo SDK < 56)
// doesn't satisfy, so `pod install` succeeds but the actual Xcode build
// fails compiling ios/Pods/fmt/include/fmt/format-inl.h. Not fixed upstream
// until Expo SDK 56 -- until then, the standard workaround is compiling
// just the fmt/RCT-Folly pods against C++17 (consteval doesn't exist pre-
// C++20, so the problematic code path is skipped and fmt falls back to its
// runtime-checked format string path instead).
const { withPodfile } = require("expo/config-plugins");

const POST_INSTALL_HOOK_MARKER = "react_native_post_install(";

const FIX_SNIPPET = `
    # --- withFmtConstevalFix: work around Xcode 26.4+ / fmt 11.0.2 consteval
    #     incompatibility (see plugins/withFmtConstevalFix.js) ---
    installer.pods_project.targets.each do |target|
      if ['fmt', 'RCT-Folly'].include?(target.name)
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
        end
      end
    end
`;

module.exports = function withFmtConstevalFix(config) {
  return withPodfile(config, (config) => {
    if (config.modResults.contents.includes("withFmtConstevalFix")) {
      return config;
    }
    const markerIndex = config.modResults.contents.indexOf(POST_INSTALL_HOOK_MARKER);
    if (markerIndex === -1) {
      throw new Error("withFmtConstevalFix: could not find react_native_post_install( in the generated Podfile");
    }
    const insertAt = config.modResults.contents.indexOf(")\n", markerIndex) + 2;
    config.modResults.contents =
      config.modResults.contents.slice(0, insertAt) +
      FIX_SNIPPET +
      config.modResults.contents.slice(insertAt);
    return config;
  });
};
