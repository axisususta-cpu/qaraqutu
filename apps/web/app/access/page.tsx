"use client";

import { Suspense, useMemo, useState } from "react";
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

function AccessPageInner() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const m = MSG[lang];
  const [requestEmail, setRequestEmail] = useState("");
  const [nameOrOrg, setNameOrOrg] = useState("");
  const [requestedSurface, setRequestedSurface] = useState("");
  const [optionalReason, setOptionalReason] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [requestInfo, setRequestInfo] = useState<string | null>(null);

  const next = useMemo(() => safeNext(searchParams?.get("next") ?? null), [searchParams]);
  const queryError = searchParams?.get("error");
  const requestedSurfaceValue = requestedSurface || (next === "/" ? "/verifier" : next);

  function mapRequestError(raw: string | undefined): string {
    if (!raw) {
      return lang === "tr" ? "Erişim talebi alınamadı" : "Access request failed";
    }

    if (raw.includes("rate_limited")) {
      return lang === "tr"
        ? "Çok fazla erişim talebi gönderildi. Kısa süre sonra tekrar deneyin."
        : "Too many access requests were submitted. Try again shortly.";
    }

    if (raw.includes("invalid_name_or_org")) {
      return lang === "tr"
        ? "Ad veya kurum alanı geçersiz."
        : "Name or organization is invalid.";
    }

    return raw;
  }

  function mapLoginError(raw: string | undefined): string {
    if (!raw) {
      return lang === "tr" ? "Geçici erişim doğrulanamadı" : "Temporary access sign-in failed";
    }

    if (raw.includes("access_expired") || raw.includes("temporary_login_expired")) {
      return lang === "tr" ? "Geçici erişim süresi doldu. Yeni onay gerekir." : "Temporary access expired. A new approval is required.";
    }

    if (raw.includes("pending") || raw.includes("missing_credential")) {
      return lang === "tr" ? "Talep henüz onaylanmadı. İnceleme bekleniyor." : "Your request is still pending review.";
    }

    if (raw.includes("denied")) {
      return lang === "tr" ? "Erişim talebi reddedildi." : "Access request was denied.";
    }

    if (raw.includes("rate_limited")) {
      return lang === "tr" ? "Çok fazla giriş denemesi. Kısa süre sonra tekrar deneyin." : "Too many sign-in attempts. Try again shortly.";
    }

    if (raw.includes("invalid_credentials") || raw.includes("invalid_password")) {
      return lang === "tr" ? "Geçici parola geçersiz." : "Temporary password is invalid.";
    }

    return raw;
  }

  async function onRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestError(null);
    setRequestInfo(null);
    try {
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: requestEmail,
          name_or_org: nameOrOrg,
          requested_surface: requestedSurfaceValue,
          optional_reason: optionalReason,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        mode?: string;
      };

      if (!res.ok) {
        setRequestError(mapRequestError(json?.reason ?? json?.error ?? `Access request failed (HTTP ${res.status})`));
        return;
      }

      setRequestInfo(
        lang === "tr"
          ? "Talep alındı. İnceleme bekleniyor. Onay gelirse geçici erişim bilgisi owner/admin tarafından verilir."
          : "Request received and pending review. If approved, temporary access is issued by the owner/admin."
      );
    } catch {
      setRequestError(lang === "tr" ? "Erişim talebi alınamadı" : "Access request failed");
    } finally {
      setRequestSubmitting(false);
    }
  }

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: temporaryPassword,
          next: requestedSurfaceValue,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        redirect_to?: string;
      };

      if (!res.ok) {
        setLoginError(mapLoginError(json?.reason ?? json?.error ?? `Access sign-in failed (HTTP ${res.status})`));
        return;
      }

      window.location.href = typeof json.redirect_to === "string" ? json.redirect_to : requestedSurfaceValue;
    } catch {
      setLoginError(lang === "tr" ? "Geçici erişim doğrulanamadı" : "Temporary access sign-in failed");
    } finally {
      setLoginSubmitting(false);
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
              ? "Bu acil fallback akışında erişim talebi bırakılır ve owner/admin onayı sonrası 20 dakikalık geçici parola verilir. Bu nihai auth yönü değildir."
              : "This emergency fallback accepts an access request and, after owner/admin approval, issues a 20-minute temporary password. This is not the final auth direction."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.95fr)", gap: "1rem" }}>
          <form
            onSubmit={onRequestSubmit}
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "1.05rem 1.1rem",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.55rem" }}>
              {lang === "tr" ? "Access request" : "Access request"}
            </div>
            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "E-posta" : "Email"}
            </label>
            <input
              type="email"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              inputMode="email"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: SANS, fontSize: "0.84rem" }}
              placeholder={lang === "tr" ? "ornek@kurum.com" : "name@institution.com"}
            />

            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.8rem", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "Ad veya kurum" : "Name or organization"}
            </label>
            <input
              type="text"
              value={nameOrOrg}
              onChange={(e) => setNameOrOrg(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: SANS, fontSize: "0.84rem" }}
              placeholder={lang === "tr" ? "Kurum, ekip veya kişi adı" : "Institution, team, or person name"}
            />

            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.8rem", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "İstenen yüzey" : "Requested surface"}
            </label>
            <input
              type="text"
              value={requestedSurfaceValue}
              onChange={(e) => setRequestedSurface(e.target.value)}
              spellCheck={false}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: MONO, fontSize: "0.82rem" }}
              placeholder="/verifier"
            />

            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.8rem", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "Opsiyonel gerekçe" : "Optional reason"}
            </label>
            <textarea
              value={optionalReason}
              onChange={(e) => setOptionalReason(e.target.value)}
              rows={4}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: SANS, fontSize: "0.84rem", resize: "vertical" }}
              placeholder={lang === "tr" ? "İsteğe bağlı bağlam, olay veya görev notu" : "Optional context, incident, or duty note"}
            />

            {requestError ? (
              <div style={{ marginTop: "0.75rem", borderRadius: 10, border: "1px solid var(--error)", background: "var(--error-soft)", padding: "0.55rem 0.7rem", fontSize: "0.82rem", color: "var(--text)" }} role="status" aria-live="polite">
                {requestError}
              </div>
            ) : null}

            {!requestError && (requestInfo || queryError) ? (
              <div style={{ marginTop: "0.75rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.55rem 0.7rem", fontSize: "0.82rem", color: "var(--text)" }} role="status" aria-live="polite">
                {queryError
                  ? lang === "tr"
                    ? `Erişim durumu: ${queryError}`
                    : `Access status: ${queryError}`
                  : requestInfo}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem", flexWrap: "wrap" }}>
              <button type="submit" disabled={requestSubmitting} style={{ cursor: requestSubmitting ? "not-allowed" : "pointer", padding: "0.55rem 0.8rem", borderRadius: 10, border: "1px solid var(--accent)", background: "var(--accent-soft)", color: "var(--text)", fontSize: "0.85rem", fontWeight: 600 }}>
                {requestSubmitting ? "..." : lang === "tr" ? "Talebi Bırak" : "Submit Request"}
              </button>
              <a href={next} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.55rem 0.8rem", borderRadius: 10, border: "1px solid var(--border)", color: "var(--text-soft)", textDecoration: "none", fontSize: "0.85rem" }}>
                {m.accessBack}
              </a>
            </div>
          </form>

          <form
            onSubmit={onLoginSubmit}
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "1.05rem 1.1rem",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.55rem" }}>
              {lang === "tr" ? "Temporary sign-in" : "Temporary sign-in"}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: "0 0 0.7rem", lineHeight: 1.55 }}>
              {lang === "tr"
                ? "Owner/admin onayı sonrası verilen geçici parola burada yalnız bir kez kullanılabilir."
                : "Use the owner/admin-issued temporary password here. The credential is single-use and short-lived."}
            </p>

            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "E-posta" : "Email"}
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              inputMode="email"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: SANS, fontSize: "0.84rem" }}
              placeholder={lang === "tr" ? "ornek@kurum.com" : "name@institution.com"}
            />

            <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.8rem", marginBottom: "0.35rem" }}>
              {lang === "tr" ? "Geçici parola" : "Temporary password"}
            </label>
            <input
              type="password"
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              autoComplete="current-password"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.7rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-card)", color: "var(--text)", outline: "none", fontFamily: MONO, fontSize: "0.84rem" }}
              placeholder={lang === "tr" ? "Admin tarafından verilen geçici parola" : "Temporary password issued by admin"}
            />

            {loginError ? (
              <div style={{ marginTop: "0.75rem", borderRadius: 10, border: "1px solid var(--error)", background: "var(--error-soft)", padding: "0.55rem 0.7rem", fontSize: "0.82rem", color: "var(--text)" }} role="status" aria-live="polite">
                {loginError}
              </div>
            ) : null}

            <button type="submit" disabled={loginSubmitting} style={{ cursor: loginSubmitting ? "not-allowed" : "pointer", width: "100%", marginTop: "0.95rem", padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid var(--accent)", background: "var(--accent-soft)", color: "var(--text)", fontSize: "0.85rem", fontWeight: 600 }}>
              {loginSubmitting ? "..." : lang === "tr" ? "Geçici Erişimle Giriş" : "Sign In With Temporary Access"}
            </button>

            <p style={{ marginTop: "0.9rem", marginBottom: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {lang === "tr"
                ? "Geçici erişim 20 dakika sonra düşer. Süre dolunca protected yüzey yeniden owner/admin onayı ister."
                : "Temporary access drops after 20 minutes. When it expires, protected surfaces require a new owner/admin approval."}
            </p>
          </form>
        </div>
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



