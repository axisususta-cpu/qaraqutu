"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Lang } from "./i18n/messages";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("qaraqutu-lang") as Lang | null;
    if (stored === "tr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem("qaraqutu-lang", next);
    setLangState(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
