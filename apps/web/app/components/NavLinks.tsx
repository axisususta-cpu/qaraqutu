"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

const ROUTES: { href: string; msgKey: keyof typeof MSG.en; verifierPrimary?: boolean }[] = [
  { href: "/", msgKey: "navHome" },
  { href: "/verifier", msgKey: "navVerifier", verifierPrimary: true },
  { href: "/docs", msgKey: "navDocs" },
];

export function NavLinks({ surface = "default" }: { surface?: "default" | "darkBar" }) {
  const pathname = usePathname() ?? "";
  const { lang } = useLanguage();
  const m = MSG[lang];

  return (
    <>
      {ROUTES.map(({ href, msgKey, verifierPrimary }) => {
        const label = m[msgKey] as string;
        const isActive =
          href === "/"
            ? pathname === "/"
            : href === "/verifier"
            ? pathname === "/verifier"
            : pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        const isVerifierActive = href === "/verifier" && pathname === "/verifier";
        const linkHref = href;

        const dark = surface === "darkBar";
        const muted = dark ? "rgba(255,255,255,0.5)" : "var(--text-muted)";
        const text = dark ? "rgba(255,255,255,0.88)" : "var(--text)";
        const borderSoft = dark ? "rgba(255,255,255,0.12)" : "var(--border-soft)";
        const borderHi = dark ? "rgba(255,255,255,0.22)" : "var(--border)";
        const activeBg = dark ? "rgba(212,86,26,0.12)" : "var(--active-bg)";
        return (
          <Link
            key={href}
            href={linkHref}
            style={{
              color: isVerifierActive ? "var(--accent)" : isActive ? text : muted,
              textDecoration: "none",
              padding: "0.2rem 0.5rem",
              borderRadius: 999,
              border: isVerifierActive
                ? "1px solid var(--accent-border)"
                : isActive
                ? `1px solid ${borderHi}`
                : `1px solid ${borderSoft}`,
              background: isVerifierActive ? "var(--accent-soft)" : isActive ? activeBg : "transparent",
              fontSize: "0.72rem",
              fontWeight: isVerifierActive ? 600 : isActive ? 500 : 400,
              fontFamily: dark || isVerifierActive ? MONO : undefined,
              letterSpacing: isVerifierActive ? "0.08em" : dark ? "0.05em" : undefined,
              textTransform: isVerifierActive ? "uppercase" : dark ? "uppercase" : "none",
            }}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
