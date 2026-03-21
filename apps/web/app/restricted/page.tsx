"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function safeNext(next: string | null): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

const SURFACE_LABELS_EN: Record<string, string> = {
  admin: "Admin diagnostics workbench",
  console: "Console controlled shell preparation",
  golden: "Golden internal reference view",
  "admin-diagnostics": "Admin diagnostics API",
  "artifact-issuance": "Artifact issuance",
  "artifact-download": "Artifact download",
  protected: "Protected surface",
};
const SURFACE_LABELS_TR: Record<string, string> = {
  admin: "Admin tanılama tezgahı",
  console: "Konsol kontrollü kabuk hazırlığı",
  golden: "Golden dahili referans görünümü",
  "admin-diagnostics": "Admin tanılama API",
  "artifact-issuance": "Belge düzenlemesi",
  "artifact-download": "Belge indirme",
  protected: "Korumalı yüzey",
};

function RestrictedPageInner() {
  const params = useSearchParams();
  const { lang } = useLanguage();
  const m = MSG[lang];
  const surface = params?.get("surface") ?? "protected";
  const next = safeNext(params?.get("next") ?? null);
  const surfaceLabels = lang === "tr" ? SURFACE_LABELS_TR : SURFACE_LABELS_EN;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "2.2rem 2rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.74rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "0.35rem",
            }}
          >
            {m.restrictedLabel}
          </div>
          <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.55rem" }}>
            {m.restrictedTitle}
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-soft)", margin: 0, lineHeight: 1.65, maxWidth: 720 }}>
            {m.restrictedBody}
          </p>
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.05rem 1.1rem",
            marginTop: "1.05rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "baseline" }}>
            <div style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {lang === "tr" ? "Yüzey" : "Surface"}
            </div>
            <div style={{ fontSize: "0.86rem", color: "var(--text)" }}>
              {surfaceLabels[surface] ?? surfaceLabels.protected}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem", flexWrap: "wrap" }}>
            <Link
              href={`/access?next=${encodeURIComponent(next)}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: "1px solid var(--accent)",
                background: "var(--accent-soft)",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {m.restrictedRequestAccess}
            </Link>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: "1px solid var(--border)",
                color: "var(--text-soft)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              {m.restrictedReturn}
            </Link>
          </div>

          <p style={{ marginTop: "0.9rem", marginBottom: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {m.restrictedNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RestrictedPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "50vh",
            padding: "2.2rem 2rem",
            fontFamily: SANS,
            color: "var(--text-muted)",
          }}
        >
          Loading…
        </div>
      }
    >
      <RestrictedPageInner />
    </Suspense>
  );
}
