"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/admin";
  }
  return next;
}

function mapError(error: string | null): string {
  if (!error) return "";
  if (error.includes("invalid_password")) return "Parola yanlış.";
  if (error.includes("owner_admin_required")) return "Sahip yönetici oturumu gerekli.";
  if (error.includes("session_missing_or_expired")) return "Sahip yönetici oturum süresi doldu.";
  if (error.includes("not_configured")) return "Sahip yönetici parolası üretim ortamında yapılandırılmamış.";
  return "Sahip yönetici girişi doğrulanamadı.";
}

function AdminLoginPageInner() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = useMemo(() => safeNext(searchParams?.get("next") ?? "/admin"), [searchParams]);
  const queryError = searchParams?.get("error");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(mapError(json.error ?? `http_${response.status}`));
        return;
      }

      window.location.href = next;
    } catch {
      setError("Sahip yönetici girişi doğrulanamadı.");
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
        fontFamily: SANS,
        display: "grid",
        placeItems: "center",
        padding: "1.6rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "min(460px, 100%)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--panel)",
          padding: "1.1rem",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
          SAHIP YONETICI KAPISI
        </div>
        <h1 style={{ margin: 0, marginBottom: "0.45rem", fontSize: "1.1rem" }}>Admin erişimi kilitli</h1>
        <p style={{ margin: 0, marginBottom: "0.75rem", fontSize: "0.82rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
          Bu yüzey yalnız sahip yönetici parolası ile açılır. Normal kullanıcı oturumu veya geçici kullanıcı parolası burada geçerli değildir.
        </p>

        <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
          Sahip yönetici parolası
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--panel-card)",
            color: "var(--text)",
            padding: "0.62rem 0.7rem",
            fontFamily: MONO,
          }}
        />

        {(error || queryError) ? (
          <div
            style={{
              marginTop: "0.75rem",
              borderRadius: 10,
              border: "1px solid var(--error)",
              background: "var(--error-soft)",
              padding: "0.55rem 0.7rem",
              fontSize: "0.8rem",
            }}
          >
            {error ?? mapError(queryError)}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "0.85rem",
            width: "100%",
            borderRadius: 10,
            border: "1px solid var(--accent)",
            background: "var(--accent-soft)",
            color: "var(--text)",
            padding: "0.6rem 0.75rem",
            fontSize: "0.86rem",
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Doğrulanıyor..." : "Sahip yönetici girişi"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPageInner />
    </Suspense>
  );
}
