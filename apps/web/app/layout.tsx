import "./globals.css";
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "QARAQUTU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
              <Link href="/console" style={{ color: "#E5E7EB", textDecoration: "none" }}>
                Console
              </Link>
              <Link href="/verifier" style={{ color: "#E5E7EB", textDecoration: "none" }}>
                Verifier
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
      </body>
    </html>
  );
}

