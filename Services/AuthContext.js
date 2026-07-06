// App-wide authentication state with a persisted session.
// Uses Supabase Auth. Credentials use the pattern username@agrochain.local
// so users only ever type a short username, not an email address.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { DEMO_MODE } from "./config";

const SESSION_KEY = "@agrochain/session";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(true);

  // Restore persisted session on launch.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (username, password, role = "farmer") => {
    let sessionUsername = username.trim();
    let sessionRole = role;

    if (DEMO_MODE) {
      // No Supabase project configured — accept any credentials for demo.
      sessionUsername = sessionUsername || "demo";
    } else {
      const email = `${sessionUsername.toLowerCase()}@agrochain.local`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      // Prefer role from profiles table over what was selected on sign-in.
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", data.user.id)
        .single();
      sessionUsername = profile?.username || sessionUsername;
      sessionRole     = profile?.role     || role;
    }

    const session = { username: sessionUsername, role: sessionRole };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    if (!DEMO_MODE) await supabase.auth.signOut().catch(() => {});
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
