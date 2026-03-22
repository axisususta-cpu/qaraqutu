"use client";

import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function BrandTagline({ surface = "default" }: { surface?: "default" | "darkBar" }) {
  const { lang } = useLanguage();
  const m = MSG[lang];
  const bar = surface === "darkBar";
  return (
    <div
      style={{
        fontSize: "0.68rem",
        color: bar ? "rgba(255,255,255,0.45)" : "var(--text-muted)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontFamily: MONO,
      }}
    >
      {m.tagline}
    </div>
  );
}
