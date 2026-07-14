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
      } catch {
        // Corrupt/unparsable session (e.g. stale plaintext data left over
        // from before secure storage was added) — drop it and fall through
        // to the sign-in screen instead of hanging or crashing.
        await secureSessionStorage.removeItem(SESSION_KEY);
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
          // This fires on every fresh launch with no session yet, so
          // removeItem() is often clearing a key that was never set —
          // don't let that (or any other storage hiccup) become an
          // unhandled promise rejection.
          try {
            await secureSessionStorage.removeItem(SESSION_KEY);
          } catch {
            // Best-effort cleanup — nothing more useful to do here.
          }
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (phone, password, role = "farmer") => {
    let sessionPhone = phone.trim();
    let sessionRole = role;
    let sessionUserId = null;
    let avatarUrl = null;

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
        .select("username, role, avatar_url")
        .eq("id", data.user.id)
        .single();
      sessionPhone  = profile?.username   || sessionPhone;
      sessionRole   = profile?.role       || role;
      sessionUserId = data.user.id;
      avatarUrl     = profile?.avatar_url || null;
    }

    const session = { username: sessionPhone, role: sessionRole, userId: sessionUserId, avatarUrl };
    // Supabase has already authenticated this user by this point — local
    // session caching is a convenience (skip sign-in next launch), not a
    // precondition. Never let it block a successful login.
    await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch((err) => {
      console.warn("signIn: could not persist local session:", err.message);
    });
    setUser(session);
    return session;
  }, []);

  // Adopt an already-authenticated Supabase session, e.g. right after
  // supabase.auth.signUp() when email confirmation is disabled. Skips the
  // signInWithPassword round trip that signIn() would otherwise pay for.
  const adoptSession = useCallback(async (userId, fallbackPhone, fallbackRole = "farmer") => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role, avatar_url")
      .eq("id", userId)
      .single();

    const session = {
      username:  profile?.username   || fallbackPhone,
      role:      profile?.role       || fallbackRole,
      userId,
      avatarUrl: profile?.avatar_url || null,
    };
    await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch((err) => {
      console.warn("adoptSession: could not persist local session:", err.message);
    });
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    if (!DEMO_MODE) await supabase.auth.signOut().catch(() => {});
    await secureSessionStorage.removeItem(SESSION_KEY).catch(() => {});
    setUser(null);
  }, []);

  // Uploads a locally-picked photo (from expo-image-picker) as the user's
  // avatar and persists it. Writes go through the update_own_avatar RPC
  // rather than a direct table update — see supabase/schema.sql for why
  // (a general "update own profile" policy would let a user rewrite their
  // own `role` column).
  const updateAvatar = useCallback(async (localUri) => {
    if (DEMO_MODE) {
      const session = { ...user, avatarUrl: localUri };
      await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch(() => {});
      setUser(session);
      return session;
    }

    if (!user?.userId) throw new Error("Not signed in.");

    const response = await fetch(localUri);
    const blob = await response.blob();
    const path = `${user.userId}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust: the storage path is fixed (upsert overwrites in place), so
    // without this the Image component and any CDN cache would keep showing
    // the previous photo under the same URL.
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: rpcError } = await supabase.rpc("update_own_avatar", { new_avatar_url: avatarUrl });
    if (rpcError) throw new Error(rpcError.message);

    const session = { ...user, avatarUrl };
    await secureSessionStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch((err) => {
      console.warn("updateAvatar: could not persist local session:", err.message);
    });
    setUser(session);
    return session;
  }, [user]);

  // Permanently deletes the signed-in user's account (Apple Guideline
  // 5.1.1(v) requires in-app deletion for apps that support in-app sign-up).
  // The actual delete runs server-side in the "delete-account" Edge Function
  // — the service role privileges it needs can't live in the app.
  const deleteAccount = useCallback(async () => {
    if (DEMO_MODE) {
      await secureSessionStorage.removeItem(SESSION_KEY).catch(() => {});
      setUser(null);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not signed in.");

    const { error } = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw new Error(error.message || "Could not delete account.");

    await supabase.auth.signOut().catch(() => {});
    await secureSessionStorage.removeItem(SESSION_KEY).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, deleteAccount, adoptSession, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
