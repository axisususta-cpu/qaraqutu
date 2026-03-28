"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";
import { TRUSTED_ROLES, type TrustedRoleId } from "../../lib/trusted-access";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function safeNext(next: string | null): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

function AccessPageInner() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const m = MSG[lang];
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TrustedRoleId>("adjudication");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const next = useMemo(() => safeNext(searchParams?.get("next") ?? null), [searchParams]);
  const queryError = searchParams?.get("error");

  function mapAccessError(raw: string | undefined): string {
    if (!raw) {
      return lang === "tr" ? "Erişim isteği gönderilemedi" : "Access request failed";
    }

    if (raw.includes("email_provider_not_configured")) {
      return lang === "tr"
        ? "E-posta teslim sağlayıcısı production ortamında yapılandırılmadığı için doğrulama linki gönderilemiyor."
        : "Verification email cannot be delivered because the production email provider is not configured.";
    }

    if (raw.includes("email_provider_error_")) {
      return lang === "tr"
        ? "E-posta sağlayıcısı teslim isteğini reddetti. Lütfen daha sonra tekrar deneyin."
        : "Email provider rejected the delivery request. Please try again later.";
    }

    return raw;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);
    setPreviewLink(null);
    try {
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next, role }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        mode?: string;
        verify_url?: string;
      };

      if (!res.ok) {
        setError(mapAccessError(json?.reason ?? json?.error ?? `Access request failed (HTTP ${res.status})`));
        return;
      }

      if (json.mode === "dev_preview" && json.verify_url) {
        setInfo(lang === "tr" ? "Geliştirme kipinde e-posta sağlayıcısı yok; doğrulama linki üretildi." : "Email provider is not configured in development mode; verification link generated.");
        setPreviewLink(json.verify_url);
        return;
      }

      if (json.mode === "acceptance_preview" && json.verify_url) {
        setInfo(
          lang === "tr"
            ? "Kabul önizleme linki yalnız izinli acceptance e-posta adresleri için görünür kılındı."
            : "Acceptance preview link is visible only for approved acceptance email addresses."
        );
        setPreviewLink(json.verify_url);
        return;
      }

      setInfo(lang === "tr" ? "Doğrulama linki e-posta adresinize gönderildi." : "Verification link was sent to your email address.");
    } catch {
      setError(lang === "tr" ? "Erişim isteği gönderilemedi" : "Access request failed");
    } finally {
      setSubmitting(false);
    }
  }

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
            {m.accessGateLabel}
          </div>
          <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.55rem" }}>
            {m.accessTitle}
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-soft)", margin: 0, lineHeight: 1.65, maxWidth: 720 }}>
            {lang === "tr"
              ? "Korumalı yüzeylere erişim doğrulanmış e-posta oturumu ile verilir. E-posta adresinizi girin; tek kullanımlık kısa ömürlü doğrulama linki gönderilir."
              : "Protected surfaces require verified email access. Enter your email address to receive a one-time, short-lived verification link."}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.05rem 1.1rem",
          }}
        >
          <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            {lang === "tr" ? "E-posta adresi" : "Email address"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.6rem 0.7rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-card)",
              color: "var(--text)",
              outline: "none",
              fontFamily: SANS,
              fontSize: "0.84rem",
            }}
            placeholder={lang === "tr" ? "ornek@kurum.com" : "name@institution.com"}
          />

          <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.8rem", marginBottom: "0.35rem" }}>
            {lang === "tr" ? "Rol bağlamı" : "Role context"}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TrustedRoleId)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.6rem 0.7rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-card)",
              color: "var(--text)",
              outline: "none",
              fontFamily: SANS,
              fontSize: "0.84rem",
            }}
          >
            {TRUSTED_ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {lang === "tr" ? item.tr : item.en}
              </option>
            ))}
          </select>

          {error ? (
            <div
              style={{
                marginTop: "0.75rem",
                borderRadius: 10,
                border: "1px solid var(--error)",
                background: "var(--error-soft)",
                padding: "0.55rem 0.7rem",
                fontSize: "0.82rem",
                color: "var(--text)",
              }}
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          {!error && (info || queryError) ? (
            <div
              style={{
                marginTop: "0.75rem",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--panel-card)",
                padding: "0.55rem 0.7rem",
                fontSize: "0.82rem",
                color: "var(--text)",
              }}
              role="status"
              aria-live="polite"
            >
              {queryError
                ? lang === "tr"
                  ? `Doğrulama başarısız: ${queryError}`
                  : `Verification failed: ${queryError}`
                : info}
            </div>
          ) : null}

          {previewLink ? (
            <a
              href={previewLink}
              style={{
                display: "inline-flex",
                marginTop: "0.75rem",
                color: "var(--accent)",
                textDecoration: "underline",
                fontSize: "0.82rem",
                wordBreak: "break-all",
              }}
            >
              {info?.includes("Kabul") || info?.includes("Acceptance")
                ? lang === "tr"
                  ? "Acceptance doğrulama linkini aç"
                  : "Open acceptance verification link"
                : lang === "tr"
                ? "Geliştirme doğrulama linkini aç"
                : "Open development verification link"}
            </a>
          ) : null}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                cursor: submitting ? "not-allowed" : "pointer",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: "1px solid var(--accent)",
                background: "var(--accent-soft)",
                color: "var(--text)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {submitting ? "..." : lang === "tr" ? "Doğrulama Linki Gönder" : "Send Verification Link"}
            </button>
            <a
              href={next}
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
              {m.accessBack}
            </a>
          </div>

          <p style={{ marginTop: "0.9rem", marginBottom: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {lang === "tr"
              ? "Oturum doğrulaması 20 dakika boyunca geçerlidir. Süre dolunca korumalı yüzeyler tekrar erişim ister."
              : "Session verification is valid for 20 minutes. After expiry, protected surfaces require access again."}
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={null}>
      <AccessPageInner />
    </Suspense>
  );
}



