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
  // Fixed SSR/CSR initial value so the first client render matches the server (avoids hydration mismatch).
  // Inline script in layout + this effect apply saved language right after hydration.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("qaraqutu-lang");
      const domLang = document.documentElement.getAttribute("data-lang");
      const next: Lang =
        stored === "tr" || stored === "en"
          ? stored
          : domLang === "tr"
            ? "tr"
            : "en";
      setLangState(next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("qaraqutu-lang", lang);
    } catch {
      /* ignore */
    }
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
