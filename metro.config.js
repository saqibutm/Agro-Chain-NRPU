// Standard Expo Metro configuration.
// Required for web bundling so `react-native` resolves to `react-native-web`
// and the `web` platform is included in the resolver.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-maps is native-only and breaks web bundling. On web, redirect it
// to a lightweight stub so the rest of the app can run in the browser.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
    };
  }
  if (platform === 'web' && moduleName === 'react-native-svg') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'web-stubs/react-native-svg.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
