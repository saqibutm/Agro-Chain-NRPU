// Supabase client — single instance shared across the app.
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const SUPABASE_URL = extra.supabaseUrl || "";
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
