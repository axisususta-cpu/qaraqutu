"use client";

import { useMemo, useState } from "react";
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

export default function AccessPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const { lang } = useLanguage();
  const m = MSG[lang];
  const [token, setToken] = useState("");
  const [role, setRole] = useState<TrustedRoleId>("adjudication");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = useMemo(() => safeNext(searchParams?.next ?? null), [searchParams?.next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, next, role }),
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      setError(json?.message ?? json?.error ?? `Access denied (HTTP ${res.status})`);
    } catch {
      setError("Access request failed");
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
            {m.accessBody}
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
            {m.accessTokenLabel}
          </label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.6rem 0.7rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-card)",
              color: "var(--text)",
              outline: "none",
              fontFamily: MONO,
              fontSize: "0.84rem",
            }}
            placeholder={m.accessTokenPlaceholder}
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
              {submitting ? "..." : m.accessSubmit}
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
            {m.accessNote}
          </p>
        </form>
      </div>
    </div>
  );
}



