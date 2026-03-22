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

export function NavLinks() {
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

        return (
          <Link
            key={href}
            href={linkHref}
            style={{
              color: isVerifierActive ? "var(--accent)" : isActive ? "var(--text)" : "var(--text-muted)",
              textDecoration: "none",
              padding: "0.2rem 0.5rem",
              borderRadius: 999,
              border: isVerifierActive
                ? "1px solid var(--accent-border)"
                : isActive
                ? "1px solid var(--border)"
                : "1px solid var(--border-soft)",
              background: isVerifierActive ? "var(--accent-soft)" : isActive ? "var(--active-bg)" : "transparent",
              fontSize: "0.8rem",
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
