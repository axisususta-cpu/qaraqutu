import Link from "next/link";
import { THEME } from "../../lib/theme";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = { ...THEME };

function safeNext(next: string | null): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  // Avoid protocol-relative or path traversal tricks.
  if (next.startsWith("//")) return "/";
  return next;
}

export default async function RestrictedPage({
  searchParams,
}: {
  searchParams: Promise<{ surface?: string; next?: string }>;
}) {
  const p = await searchParams;
  const surface = (p?.surface ?? "protected").toString();
  const next = safeNext(p?.next ?? null);

  const surfaceLabel: Record<string, string> = {
    admin: "Admin diagnostics workbench",
    console: "Console controlled shell preparation",
    golden: "Golden internal reference view",
    "admin-diagnostics": "Admin diagnostics API",
    "artifact-issuance": "Artifact issuance",
    "artifact-download": "Artifact download",
    protected: "Protected surface",
  };

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
            Restricted surface
          </div>
          <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.55rem" }}>
            Authorized access required
          </h1>
          <p style={{ fontSize: "0.86rem", color: UI.textSoft, margin: 0, lineHeight: 1.65, maxWidth: 720 }}>
            This area is intentionally bounded. It supports internal review and controlled issuance workflows and is not a
            general public product surface.
          </p>
        </div>

        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1.05rem 1.1rem",
            marginTop: "1.05rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "baseline" }}>
            <div style={{ fontFamily: MONO, fontSize: "0.78rem", color: UI.textMuted }}>
              Surface
            </div>
            <div style={{ fontSize: "0.86rem", color: UI.text }}>
              {surfaceLabel[surface] ?? surfaceLabel.protected}
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
                border: `1px solid ${UI.accent}`,
                background: UI.accentSoft,
                color: UI.text,
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Request access
            </Link>
            <Link
              href="/"
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
              Return to landing
            </Link>
          </div>

          <p style={{ marginTop: "0.9rem", marginBottom: 0, fontSize: "0.78rem", color: UI.textMuted, lineHeight: 1.6 }}>
            Note: “restricted” means protected and access-controlled, not “missing” or “broken”. If you believe you
            should have access, use the access gate and re-enter with authorized credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

