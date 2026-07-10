// App-wide authentication state with a persisted session.
// Uses Supabase Auth. Credentials use the pattern phone@agrochain.local so
// users only ever type their mobile number — no email address is required.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { secureSessionStorage } from "./secureStorage";
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
        const raw = await secureSessionStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Keep app session in sync with Supabase auth state.
  // If the Supabase JWT expires and refresh fails, clear the local session so
  // the user is redirected to sign-in rather than hitting silent 401 errors.
  useEffect(() => {
    if (DEMO_MODE) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
          await secureSessionStorage.removeItem(SESSION_KEY);
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (phone, password, role = "farmer") => {
    let sessionPhone = phone.trim();
    let sessionRole = role;

    if (DEMO_MODE) {
      // No Supabase project configured — accept any credentials for demo.
      sessionPhone = sessionPhone || "demo";
    } else {
      const email = `${sessionPhone}@agrochain.local`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      // Prefer role from profiles table over what was selected on sign-in.
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", data.user.id)
        .single();
      sessionPhone = profile?.username || sessionPhone;
      sessionRole  = profile?.role     || role;
    }

    const session = { username: sessionPhone, role: sessionRole };
    await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  // Adopt an already-authenticated Supabase session, e.g. right after
  // supabase.auth.signUp() when email confirmation is disabled. Skips the
  // signInWithPassword round trip that signIn() would otherwise pay for.
  const adoptSession = useCallback(async (userId, fallbackPhone, fallbackRole = "farmer") => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", userId)
      .single();

    const session = {
      username: profile?.username || fallbackPhone,
      role:     profile?.role     || fallbackRole,
    };
    await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    if (!DEMO_MODE) await supabase.auth.signOut().catch(() => {});
    await secureSessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, adoptSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
