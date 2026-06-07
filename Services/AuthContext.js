// App-wide authentication state with a persisted session.
// Credentials are verified by the backend against the Fabric CA (see /api/login);
// only the username is kept on the device — never the password.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as apiLogin } from "./api";

const SESSION_KEY = "@agrochain/session";
const AuthContext = createContext(null);

// ⚠️ TEMPORARY — DEV-ONLY SCREENSHOT BYPASS. Set back to false (or remove this
// block) before committing/releasing. Only active in development (`__DEV__`).
// When true, the app opens straight into the authenticated screens (which render
// their sample/placeholder data) so screenshots can be captured without a backend.
const DEV_SCREENSHOT_BYPASS = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username }
  const [loading, setLoading] = useState(true); // restoring persisted session

  // Restore any saved session on launch.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        } else if (__DEV__ && DEV_SCREENSHOT_BYPASS) {
          setUser({ username: "demo", demo: true }); // dev screenshot session
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Verify credentials with the backend, then persist the session.
  const signIn = useCallback(async (username, password) => {
    const res = await apiLogin(username.trim(), password); // throws on failure
    const session = { username: res.username || username.trim() };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
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
