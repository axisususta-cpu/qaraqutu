"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ThemeMode } from "./theme";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggle: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = localStorage.getItem("qaraqutu-theme") as ThemeMode | null;
    const resolved: ThemeMode = stored === "dark" ? "dark" : "light";
    setMode(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("qaraqutu-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
