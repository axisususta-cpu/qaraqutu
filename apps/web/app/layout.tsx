import "./globals.css";
import React from "react";
import { webBuildMeta } from "./build-meta";
import { NavLinks } from "./components/NavLinks";
import { LogoPrimary } from "./components/LogoPrimary";
import { BRAND } from "../lib/brand";
import { THEME } from "../lib/theme";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://qaraqutu-web.vercel.app"),
  title: "QARAQUTU — Verifier-first witness protocol",
  description: BRAND.description,
  icons: {
    icon: "/brand/logo-icon-square.png",
    apple: "/brand/logo-icon-square.png",
  },
  openGraph: {
    title: "QARAQUTU — Verifier-first witness protocol",
    description: BRAND.description,
    type: "website",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "QARAQUTU" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QARAQUTU — Verifier-first witness protocol",
    description: BRAND.description,
  },
  manifest: "/manifest.json",
};

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gitCommitSha = webBuildMeta.commitSha;
  const shortSha = gitCommitSha === "unknown" ? "unknown" : gitCommitSha.slice(0, 7);
  return (
    <html lang="en">
      <head>
        {gitCommitSha !== "unknown" ? <meta name="vercel:git-commit-sha" content={gitCommitSha} /> : null}
      </head>
      <body style={{ margin: 0, background: THEME.bg, color: THEME.text, fontFamily: SANS }}>
        <header
          style={{
            background: THEME.headerBg,
            color: THEME.text,
            borderBottom: `1px solid ${THEME.border}`,
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
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <LogoPrimary href="/" height={28} />
              <div
                style={{
                  fontSize: "0.68rem",
                  color: THEME.textMuted,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: MONO,
                }}
              >
                {BRAND.tagline}
              </div>
            </div>
            <nav
              aria-label="Primary"
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.8rem",
                alignItems: "center",
              }}
            >
              <NavLinks />
            </nav>
          </div>
        </header>
        {children}
        <footer
          style={{
            padding: "0.7rem 2rem 0.9rem",
            fontSize: "0.66rem",
            color: THEME.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.6rem",
            letterSpacing: "0.05em",
            borderTop: `1px solid ${THEME.borderSoft}`,
            marginTop: "0.5rem",
            background: THEME.panel,
          }}
        >
          <LogoPrimary href="/" height={18} />
          <span
            style={{ fontFamily: MONO }}
            title={`${webBuildMeta.app} @ ${gitCommitSha} · ${webBuildMeta.buildTime}`}
          >
            {webBuildMeta.app} @ {shortSha} · {webBuildMeta.buildTime}
          </span>
        </footer>
      </body>
    </html>
  );
}

