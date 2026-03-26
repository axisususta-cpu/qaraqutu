"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "./NavLinks";
import { LogoPrimary } from "./LogoPrimary";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { BrandTagline } from "./BrandTagline";
import { useLanguage } from "../../lib/LanguageContext";

/**
 * Full site header hidden on verifier routes so the inspection chassis owns vertical chrome.
 */
export function ConditionalSiteHeader() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/verifier")) return null;

  const isHome = pathname === "/" || pathname === "";
  const bar = isHome ? "darkBar" : "default";
  const { lang } = useLanguage();

  return (
    <header
      style={{
        position: isHome ? "fixed" : "relative",
        top: 0,
        left: 0,
        right: 0,
        zIndex: isHome ? 60 : 10,
        background: isHome ? "rgba(12,13,15,0.92)" : "var(--header-bg)",
        color: isHome ? "#eceae6" : "var(--text)",
        borderBottom: isHome ? "1px solid rgba(255,255,255,0.13)" : "1px solid var(--border-soft)",
        backdropFilter: isHome ? "blur(12px)" : undefined,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          height: isHome ? 56 : "auto",
          padding: isHome ? "0 2rem" : "0.85rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <LogoPrimary href="/" height={isHome ? 20 : 36} variant={isHome ? "onDarkSurface" : "default"} />
          {isHome ? (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                fontSize: "0.56rem",
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
                paddingLeft: 12,
                whiteSpace: "nowrap",
              }}
            >
              {lang === "tr" ? "Tanık · Doğrulayıcı · İz · Belgeleme" : "Witness · Verifier · Trace · Documentation"}
            </span>
          ) : (
            <BrandTagline surface={bar === "darkBar" ? "darkBar" : "default"} />
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isHome ? "row" : "column",
            alignItems: "flex-end",
            gap: isHome ? "0.45rem" : "0.55rem",
            marginLeft: "auto",
          }}
        >
          {isHome ? null : null}
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              gap: isHome ? "0.18rem" : "0.65rem",
              fontSize: "0.8rem",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {isHome ? (
              <>
                {[
                  { href: "/#how", label: lang === "tr" ? "Nasıl Çalışır" : "How It Works" },
                  { href: "/#domain", label: lang === "tr" ? "Alanlar" : "Domains" },
                  { href: "/#roles", label: lang === "tr" ? "Roller" : "Roles" },
                  { href: "/#doctrine", label: lang === "tr" ? "Doktrin" : "Doctrine" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0.375rem 0.75rem",
                      color: "rgba(255,255,255,0.56)",
                      textDecoration: "none",
                      border: "1px solid transparent",
                    }}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="/#cta"
                  style={{
                    fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0.375rem 0.75rem",
                    color: "var(--accent)",
                    textDecoration: "none",
                    border: "1px solid rgba(255,102,0,0.4)",
                    background: "rgba(255,102,0,0.14)",
                  }}
                  aria-label={lang === "tr" ? "Doğrulayıcıyı aç" : "Open verifier"}
                >
                  {lang === "tr" ? "Doğrulayıcıyı Aç" : "Open Verifier"}
                </a>
              </>
            ) : (
              <NavLinks surface={bar === "darkBar" ? "darkBar" : "default"} />
            )}
            <LanguageToggle surface={bar === "darkBar" ? "darkBar" : "default"} />
            {isHome ? null : <ThemeToggle surface={bar === "darkBar" ? "darkBar" : "default"} />}
          </nav>
        </div>
      </div>
    </header>
  );
}
