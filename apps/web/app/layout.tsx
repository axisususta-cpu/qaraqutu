import "./globals.css";
import React from "react";
import { webBuildMeta } from "./build-meta";
import { ThemeProvider } from "../lib/ThemeContext";
import { LanguageProvider } from "../lib/LanguageContext";
import { ConditionalSiteHeader } from "./components/ConditionalSiteHeader";
import { ConditionalSiteFooter } from "./components/ConditionalSiteFooter";

const SITE_TITLE_TR = "QARAQUTU — Doğrulayıcı-öncelikli tanık protokolü";
const SITE_DESC_TR =
  "Araç, İHA ve Robot için uyuşmazlık düzeyinde olay paketleri: doğrulayıcı-öncelikli tanık protokolü, sınırlı inceleme yüzeyi ve izlenebilir belge düzenlemesi.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://qaraqutu-web.vercel.app"),
  title: SITE_TITLE_TR,
  description: SITE_DESC_TR,
  icons: {
    icon: "/brand/logo-icon-square-light.svg",
    apple: "/brand/logo-icon-square-light.svg",
  },
  openGraph: {
    title: SITE_TITLE_TR,
    description: SITE_DESC_TR,
    type: "website",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "QARAQUTU" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_TR,
    description: SITE_DESC_TR,
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
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('qaraqutu-theme');var m=t==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',m)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('qaraqutu-lang');var n=l==='en'?'en':'tr';document.documentElement.setAttribute('data-lang',n);document.documentElement.lang=n}catch(e){document.documentElement.setAttribute('data-lang','tr');document.documentElement.lang='tr'}})()`,
          }}
        />
        {gitCommitSha !== "unknown" ? <meta name="vercel:git-commit-sha" content={gitCommitSha} /> : null}
      </head>
      <body style={{ margin: 0, background: "var(--bg)", color: "var(--text)", fontFamily: SANS }}>
        <ThemeProvider>
        <LanguageProvider>
          <ConditionalSiteHeader />
          {children}
          <ConditionalSiteFooter />
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
