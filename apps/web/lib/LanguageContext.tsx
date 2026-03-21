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
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("qaraqutu-lang");
    if (stored === "tr" || stored === "en") return stored;
    const domLang = document.documentElement.getAttribute("data-lang");
    return domLang === "tr" ? "tr" : "en";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
    localStorage.setItem("qaraqutu-lang", lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.lang = next;
    localStorage.setItem("qaraqutu-lang", next);
    setLangState(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
