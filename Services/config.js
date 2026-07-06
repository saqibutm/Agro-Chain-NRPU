// Central configuration.
// DEMO_MODE is on when no Supabase project is configured (no supabaseUrl in
// app.json extra). In demo mode all screens show the bundled Pakistan dataset
// and sign-in accepts any credentials without hitting Supabase.
import Constants from "expo-constants";

const extra =
  Constants?.expoConfig?.extra ??
  Constants?.manifest?.extra ??
  {};

export const IS_BACKEND_CONFIGURED =
  !!extra.supabaseUrl &&
  !/REPLACE_WITH/i.test(extra.supabaseUrl);

export const DEMO_MODE =
  extra.demoMode === true  ? true  :
  extra.demoMode === false ? false :
  !IS_BACKEND_CONFIGURED;

// Fallback wallet identity for read-only queries when no user is signed in.
export const DEFAULT_USERNAME = extra.defaultUsername || "appUser";

// Network request timeout (ms) — kept for any direct fetch calls.
export const REQUEST_TIMEOUT = 15000;
