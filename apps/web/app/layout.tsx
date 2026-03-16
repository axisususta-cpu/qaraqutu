import "./globals.css";
import React from "react";
import Link from "next/link";
import { webBuildMeta } from "./build-meta";

export const metadata = {
  title: "QARAQUTU",
};

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
      <body style={{ margin: 0 }}>
        <header
          style={{
            background: "#020617",
            color: "#E5E7EB",
            borderBottom: "1px solid #111827",
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              padding: "0.75rem 2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
              title={`${webBuildMeta.app} @ ${shortSha} · ${webBuildMeta.buildTime}`}
            >
              QARAQUTU
            </div>
            <nav
              style={{
                display: "flex",
                gap: "1.25rem",
                fontSize: "0.8rem",
              }}
            >
              <Link href="/" style={{ color: "#E5E7EB", textDecoration: "none" }}>
                Landing
              </Link>
              <Link href="/verifier" style={{ color: "#E5E7EB", textDecoration: "none", fontWeight: 600 }}>
                Verifier
              </Link>
              <Link href="/verifier/golden" style={{ color: "#94A3B8", textDecoration: "none" }}>
                Golden
              </Link>
              <Link href="/console" style={{ color: "#94A3B8", textDecoration: "none" }}>
                Console
              </Link>
              <Link href="/docs" style={{ color: "#E5E7EB", textDecoration: "none" }}>
                Docs
              </Link>
              <Link href="/admin" style={{ color: "#E5E7EB", textDecoration: "none" }}>
                Admin
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer
          style={{
            padding: "0.45rem 1rem 0.7rem",
            fontSize: "0.68rem",
            color: "#64748B",
            textAlign: "right",
            letterSpacing: "0.03em",
          }}
        >
          <span title={`${webBuildMeta.app} @ ${gitCommitSha} · ${webBuildMeta.buildTime}`}>
            {webBuildMeta.app} @ {shortSha} · {webBuildMeta.buildTime}
          </span>
        </footer>
      </body>
    </html>
  );
}

