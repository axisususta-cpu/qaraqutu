"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const INTERNAL: { href: string; msgKey: keyof typeof MSG.en }[] = [
  { href: "/verifier/golden", msgKey: "navGolden" },
  { href: "/console", msgKey: "navConsole" },
  { href: "/admin", msgKey: "navAdmin" },
];

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function NavInternalLinks() {
  const pathname = usePathname() ?? "";
  const { lang } = useLanguage();
  const m = MSG[lang];

  return (
    <nav
      aria-label={lang === "tr" ? "Sistem içi bağlantılar" : "Internal surfaces"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.35rem 0.65rem",
        alignItems: "center",
        justifyContent: "flex-end",
        fontSize: "0.66rem",
        maxWidth: 520,
      }}
    >
      <span style={{ fontFamily: MONO, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>
        {m.navInternalStrip}
      </span>
      {INTERNAL.map(({ href, msgKey }) => {
        const label = m[msgKey] as string;
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        const linkHref = `/access?next=${encodeURIComponent(href)}`;
        return (
          <Link
            key={href}
            href={linkHref}
            style={{
              color: isActive ? "var(--text-soft)" : "var(--text-dim)",
              textDecoration: "none",
              padding: "0.12rem 0.4rem",
              borderRadius: 4,
              border: "1px solid var(--border-muted)",
              background: "var(--panel-card)",
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
