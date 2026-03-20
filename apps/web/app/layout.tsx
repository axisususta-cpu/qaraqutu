import "./globals.css";
import React from "react";
import { webBuildMeta } from "./build-meta";
import { NavLinks } from "./components/NavLinks";
import { LogoPrimary } from "./components/LogoPrimary";
import { BRAND } from "../lib/brand";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://qaraqutu-web.vercel.app"),
  title: "QARAQUTU",
  description: BRAND.description,
  icons: {
    icon: "/brand/logo-icon.svg",
    apple: "/brand/logo-icon.svg",
  },
  openGraph: {
    title: "QARAQUTU",
    description: BRAND.description,
    type: "website",
    images: [{ url: "/brand/og-image.svg", width: 1200, height: 630, alt: "QARAQUTU" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QARAQUTU",
    description: BRAND.description,
  },
  manifest: "/manifest.json",
};

// Match verifier typography and surface tokens (local copy, no shared import).
const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  headerBg: "#050b16",
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.8)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.10)",
} as const;

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
      <body style={{ margin: 0, background: UI.bg, color: UI.text, fontFamily: SANS }}>
        <header
          style={{
            background: UI.headerBg,
            color: UI.text,
            borderBottom: `1px solid ${UI.border}`,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0.75rem 2rem",
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
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              <LogoPrimary href="/" height={26} />
              <div
                style={{
                  fontSize: "0.7rem",
                  color: UI.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
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
            padding: "0.6rem 2rem 0.8rem",
            fontSize: "0.68rem",
            color: UI.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            letterSpacing: "0.04em",
            borderTop: `1px solid ${UI.borderSoft}`,
            marginTop: "0.5rem",
          }}
        >
          <LogoPrimary href="/" height={20} />
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

