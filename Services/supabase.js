// Supabase client — single instance shared across the app.
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { secureSessionStorage } from "./secureStorage";

const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const SUPABASE_URL = extra.supabaseUrl || "";
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Session (access + refresh token) is encrypted at rest, with the
    // encryption key held in the iOS Keychain / Android Keystore — see
    // Services/secureStorage.js.
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
