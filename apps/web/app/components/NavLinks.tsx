"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.8)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.10)",
  activeBg: "rgba(26, 45, 74, 0.35)",
} as const;

const ROUTES: { href: string; label: string; verifierPrimary?: boolean }[] = [
  { href: "/", label: "Landing" },
  { href: "/verifier", label: "Verifier", verifierPrimary: true },
  { href: "/verifier/golden", label: "Golden (internal)" },
  { href: "/console", label: "Console (restricted)" },
  { href: "/docs", label: "Docs" },
  { href: "/admin", label: "Admin (restricted)" },
];

export function NavLinks() {
  const pathname = usePathname() ?? "";

  return (
    <>
      {ROUTES.map(({ href, label, verifierPrimary }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : href === "/verifier"
            ? pathname === "/verifier"
            : pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        const isVerifierActive = href === "/verifier" && pathname === "/verifier";

        return (
          <Link
            key={href}
            href={href}
            style={{
              color: isVerifierActive ? UI.text : isActive ? UI.textSoft : UI.textMuted,
              textDecoration: "none",
              padding: "0.2rem 0.5rem",
              borderRadius: 999,
              border:
                isVerifierActive
                  ? `1px solid ${UI.accent}`
                  : isActive
                  ? `1px solid ${UI.border}`
                  : `1px solid ${UI.borderSoft}`,
              background: isVerifierActive ? UI.accentSoft : isActive ? UI.activeBg : "transparent",
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
