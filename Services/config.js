// Central API configuration.
//
// Resolution order for the backend URL:
//   1. Production builds  -> expo.extra.apiBaseUrl from app.json (set this to your
//      public HTTPS backend before `eas build --profile production`).
//   2. Development        -> local gateway (org/serverOrg1.js on :8081).
//                            Android emulators reach the host via 10.0.2.2.
//
// This guarantees a published app never silently points at "localhost".
import { Platform } from "react-native";
import Constants from "expo-constants";

const extra =
  Constants?.expoConfig?.extra ??
  Constants?.manifest?.extra ?? // fallback for older runtimes
  {};

// Local dev gateway.
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const DEV_URL = `http://${DEV_HOST}:8081`;

// In production use the configured URL; in dev default to the local gateway.
// `extra.apiBaseUrl` can also override the dev default if you set it.
export const API_BASE_URL = __DEV__
  ? (extra.apiBaseUrl || DEV_URL)
  : (extra.apiBaseUrl || "");

// True when a real production URL has been configured (not localhost).
export const IS_BACKEND_CONFIGURED =
  !!extra.apiBaseUrl &&
  !/localhost|10\.0\.2\.2|REPLACE_WITH/i.test(extra.apiBaseUrl);

// DEMO_MODE: when no real backend is configured, screens render the bundled
// Pakistan-specific demo dataset (Services/demoData.js) so all features are
// demonstrable without a running Fabric network. Set a real apiBaseUrl to
// switch to live data automatically. Can be forced via extra.demoMode.
export const DEMO_MODE =
  extra.demoMode === true || extra.demoMode === false
    ? extra.demoMode
    : !IS_BACKEND_CONFIGURED;

// Fallback wallet identity for read-only queries when no user is signed in.
export const DEFAULT_USERNAME = extra.defaultUsername || "appUser";

// Network request timeout (ms).
export const REQUEST_TIMEOUT = 15000;
