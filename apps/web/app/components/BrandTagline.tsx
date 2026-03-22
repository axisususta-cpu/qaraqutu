"use client";

import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function BrandTagline() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  return (
    <div
      style={{
        fontSize: "0.68rem",
        color: "var(--text-muted)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontFamily: MONO,
      }}
    >
      {m.tagline}
    </div>
  );
}
