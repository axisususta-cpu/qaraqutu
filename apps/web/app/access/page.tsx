"use client";

import { useMemo, useState } from "react";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  panel: "#0a1628",
  border: "#1a2d4a",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.10)",
  error: "#F87171",
  errorSoft: "rgba(248, 113, 113, 0.10)",
} as const;

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
  const [token, setToken] = useState("");
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
        body: JSON.stringify({ token, next }),
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
        background: UI.bg,
        color: UI.text,
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
              color: UI.textMuted,
              marginBottom: "0.35rem",
            }}
          >
            Access gate
          </div>
          <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.55rem" }}>
            Protected access
          </h1>
          <p style={{ fontSize: "0.86rem", color: UI.textSoft, margin: 0, lineHeight: 1.65, maxWidth: 720 }}>
            QARAQUTU’s admin, console, and issuance surfaces are intentionally bounded. Enter an authorized access token to
            continue.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            borderRadius: 12,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1.05rem 1.1rem",
          }}
        >
          <label style={{ display: "block", fontSize: "0.78rem", color: UI.textMuted, marginBottom: "0.35rem" }}>
            Access token
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
              border: `1px solid ${UI.border}`,
              background: "rgba(0,0,0,0.25)",
              color: UI.text,
              outline: "none",
              fontFamily: MONO,
              fontSize: "0.84rem",
            }}
            placeholder="Authorized token"
          />

          {error ? (
            <div
              style={{
                marginTop: "0.75rem",
                borderRadius: 10,
                border: `1px solid ${UI.error}`,
                background: UI.errorSoft,
                padding: "0.55rem 0.7rem",
                fontSize: "0.82rem",
                color: UI.text,
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
                border: `1px solid ${UI.accent}`,
                background: UI.accentSoft,
                color: UI.text,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {submitting ? "Submitting…" : "Continue"}
            </button>
            <a
              href={next}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Back
            </a>
          </div>

          <p style={{ marginTop: "0.9rem", marginBottom: 0, fontSize: "0.78rem", color: UI.textMuted, lineHeight: 1.6 }}>
            This gate is a minimal protection layer for the current acceptance slice. Full tenant IAM / RBAC is a later
            sprint.
          </p>
        </form>
      </div>
    </div>
  );
}

