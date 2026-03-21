"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { THEME } from "../../lib/theme";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

const ROUTES: { href: string; label: string; verifierPrimary?: boolean; protected?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/verifier", label: "Verifier", verifierPrimary: true },
  { href: "/verifier/golden", label: "Golden (internal)", protected: true },
  { href: "/console", label: "Console (protected)", protected: true },
  { href: "/docs", label: "Docs" },
  { href: "/admin", label: "Admin (protected)", protected: true },
];

export function NavLinks() {
  const pathname = usePathname() ?? "";

  return (
    <>
      {ROUTES.map(({ href, label, verifierPrimary, protected: isProtected }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : href === "/verifier"
            ? pathname === "/verifier"
            : pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        const isVerifierActive = href === "/verifier" && pathname === "/verifier";
        const linkHref = isProtected ? `/access?next=${encodeURIComponent(href)}` : href;

        return (
          <Link
            key={href}
            href={linkHref}
            style={{
              color: isVerifierActive ? THEME.accent : isActive ? THEME.text : THEME.textMuted,
              textDecoration: "none",
              padding: "0.2rem 0.5rem",
              borderRadius: 999,
              border:
                isVerifierActive
                  ? `1px solid ${THEME.accent}`
                  : isActive
                  ? `1px solid ${THEME.border}`
                  : `1px solid ${THEME.borderSoft}`,
              background: isVerifierActive ? THEME.accentSoft : isActive ? THEME.activeBg : "transparent",
              fontSize: href === "/verifier/golden" || href === "/console" || href === "/admin" ? "0.78rem" : "0.8rem",
              fontWeight: isVerifierActive ? 600 : isActive ? 500 : 400,
              fontFamily: isVerifierActive ? MONO : undefined,
              letterSpacing: isVerifierActive ? "0.08em" : undefined,
              textTransform: isVerifierActive ? "uppercase" : undefined,
            }}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
