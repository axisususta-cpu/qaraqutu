"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoPrimary } from "./LogoPrimary";
import { FooterDoctrine } from "./FooterDoctrine";
import { FooterBottomRow } from "./FooterBottomRow";
import { useLanguage } from "../../lib/LanguageContext";

const MONO = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace";

/**
 * Doctrine strip + build footer omitted on verifier; inspection station uses its own doctrine surfaces.
 */
export function ConditionalSiteFooter() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/verifier")) return null;
  const { lang } = useLanguage();
  const links = [
    { href: "/", label: lang === "tr" ? "Ana Sayfa" : "Home" },
    { href: "/verifier", label: lang === "tr" ? "Doğrulayıcı" : "Verifier" },
    { href: "/docs", label: lang === "tr" ? "Belgeler" : "Docs" },
    { href: "/access", label: lang === "tr" ? "Erişim" : "Access" },
  ];

  return (
    <>
      <FooterDoctrine />
      <footer
        style={{
          padding: "2.75rem 2rem 1.5rem",
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.45)",
          borderTop: "1px solid #1a1a18",
          background: "#141518",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <LogoPrimary href="/" height={26} variant="onDarkSurface" />
              <div style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.15rem" }}>
                {lang === "tr" ? "Kurumsal tanık protokolü" : "Institutional witness protocol"}
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", lineHeight: 2 }}>
                <div>{lang === "tr" ? "Kayıtlı ≠ Türetilmiş" : "Recorded ≠ Derived"}</div>
                <div>{lang === "tr" ? "İz ≠ Nihai Gerçek" : "Trace ≠ Final Truth"}</div>
                <div>{lang === "tr" ? "Düzenleme ≠ Suçlama" : "Issuance ≠ Blame"}</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.7rem" }}>
                {lang === "tr" ? "Yüzeyler" : "Surfaces"}
              </div>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "0.82rem",
                    padding: "0.18rem 0",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.7rem" }}>
                {lang === "tr" ? "Protokol" : "Protocol"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                {lang === "tr"
                  ? "Tek olay, tek omurga, role bağlı inceleme kabukları. QARAQUTU doğrulayıcı-öncelikli kurumsal tanık protokolüdür."
                  : "One incident, one spine, role-bounded review shells. QARAQUTU is a verifier-first institutional witness protocol."}
              </div>
            </div>
          </div>
          <FooterBottomRow />
        </div>
      </footer>
    </>
  );
}
