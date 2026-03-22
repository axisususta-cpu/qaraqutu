"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "./NavLinks";
import { LogoPrimary } from "./LogoPrimary";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { BrandTagline } from "./BrandTagline";
import { NavInternalLinks } from "./NavInternalLinks";

/**
 * Full site header hidden on verifier routes so the inspection chassis owns vertical chrome.
 */
export function ConditionalSiteHeader() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/verifier")) return null;

  return (
    <header
      style={{
        background: "var(--header-bg)",
        color: "var(--text)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0.85rem 2rem",
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
          <LogoPrimary href="/" height={36} />
          <BrandTagline />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.35rem",
          }}
        >
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              gap: "0.75rem",
              fontSize: "0.8rem",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <NavLinks />
            <LanguageToggle />
            <ThemeToggle />
          </nav>
          <NavInternalLinks />
        </div>
      </div>
    </header>
  );
}
