import "./globals.css";
import React from "react";
import Link from "next/link";
import { webBuildMeta } from "./build-meta";

export const metadata = {
  title: "QARAQUTU",
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
                gap: 2,
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: MONO,
                }}
                title={`${webBuildMeta.app} @ ${shortSha} · ${webBuildMeta.buildTime}`}
              >
                QARAQUTU
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: UI.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Witness · Verifier · Trace · Issuance
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
              <Link
                href="/"
                style={{
                  color: UI.textSoft,
                  textDecoration: "none",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 999,
                }}
              >
                Landing
              </Link>
              <Link
                href="/verifier"
                style={{
                  color: UI.text,
                  textDecoration: "none",
                  fontWeight: 600,
                  padding: "0.25rem 0.8rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.accent}`,
                  background: UI.accentSoft,
                  fontFamily: MONO,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Verifier
              </Link>
              <Link
                href="/verifier/golden"
                style={{
                  color: UI.textMuted,
                  textDecoration: "none",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.borderSoft}`,
                  fontSize: "0.78rem",
                }}
              >
                Golden (internal)
              </Link>
              <Link
                href="/console"
                style={{
                  color: UI.textMuted,
                  textDecoration: "none",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.borderSoft}`,
                  fontSize: "0.78rem",
                }}
              >
                Console shell
              </Link>
              <Link
                href="/docs"
                style={{
                  color: UI.textSoft,
                  textDecoration: "none",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 999,
                }}
              >
                Docs
              </Link>
              <Link
                href="/admin"
                style={{
                  color: UI.textSoft,
                  textDecoration: "none",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.borderSoft}`,
                  fontSize: "0.78rem",
                }}
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer
          style={{
            padding: "0.45rem 2rem 0.7rem",
            fontSize: "0.68rem",
            color: UI.textMuted,
            textAlign: "right",
            letterSpacing: "0.04em",
            borderTop: `1px solid ${UI.borderSoft}`,
            marginTop: "0.5rem",
          }}
        >
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

