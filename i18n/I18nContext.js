// Lightweight i18n provider: language state, t() lookup, RTL handling, and
// persistence. No external i18n dependency required.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "./translations";

const LANG_KEY = "@agrochain/language";
const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(LANG_KEY);
      if (saved) {
        setLanguage(saved);
        I18nManager.allowRTL(saved === "ur");
      }
      setReady(true);
    })();
  }, []);

  const changeLanguage = useCallback(async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
    // RTL takes full effect after an app reload; allowRTL primes the layout.
    I18nManager.allowRTL(lang === "ur");
  }, []);

  // Translate a key; falls back to English, then the raw key.
  const t = useCallback(
    (key) => translations[language]?.[key] ?? translations.en[key] ?? key,
    [language]
  );

  const isRTL = language === "ur";

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, isRTL, ready }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
};
