"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "./NavLinks";
import { LogoPrimary } from "./LogoPrimary";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { BrandTagline } from "./BrandTagline";

/**
 * Full site header hidden on verifier routes so the inspection chassis owns vertical chrome.
 */
export function ConditionalSiteHeader() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/verifier")) return null;

  const isHome = pathname === "/" || pathname === "";
  const bar = isHome ? "darkBar" : "default";

  return (
    <header
      style={{
        background: isHome ? "#0a0a0a" : "var(--header-bg)",
        color: isHome ? "#eceae6" : "var(--text)",
        borderBottom: isHome ? "1px solid #1a1a18" : "1px solid var(--border-soft)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: isHome ? "0.65rem 2rem" : "0.85rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            alignItems: "flex-start",
          }}
        >
          <LogoPrimary href="/" height={isHome ? 40 : 36} variant={isHome ? "onDarkSurface" : "default"} />
          <BrandTagline surface={bar === "darkBar" ? "darkBar" : "default"} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: "0.55rem",
          }}
        >
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              gap: "0.65rem",
              fontSize: "0.8rem",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <NavLinks surface={bar === "darkBar" ? "darkBar" : "default"} />
            <LanguageToggle surface={bar === "darkBar" ? "darkBar" : "default"} />
            <ThemeToggle surface={bar === "darkBar" ? "darkBar" : "default"} />
          </nav>
        </div>
      </div>
    </header>
  );
}
