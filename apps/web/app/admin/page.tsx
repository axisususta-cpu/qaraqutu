import { headers } from "next/headers";
import { AdminPageHeader, AdminPageChips } from "./AdminPageHeader";
import { AccessIssuancePanel } from "./AccessIssuancePanel";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface Diagnostics {
  environment: string;
  dataset_version: string;
  schema_version: string;
  build_version: string;
  supported_export_profiles?: string[];
  recent_exports?: Array<{
    export_id: string;
    profile: string;
    format: string;
    event_id: string | null;
    receipt_id: string | null;
    created_at: string;
  }>;
  recent_verifications?: Array<{
    verification_run_id: string;
    event_id: string | null;
    verification_state: string;
    transcript_id: string | null;
    created_at: string;
  }>;
  latest_verification_run?: {
    verification_run_id: string;
    event_id: string | null;
    verification_state: string;
    transcript_id: string | null;
    created_at: string;
    transcript_summary: Array<{ step: number; check: string; result: string; note: string }>;
  } | null;
  latest_smoke_run?: {
    smoke_run_id: string;
    overall_result: string;
    started_at: string;
    finished_at: string | null;
    environment: string;
    dataset_version: string;
    build_version: string;
    schema_version: string;
    checks?: Array<{ check_name: string; category: string; result: string }>;
  } | null;
  smoke_history_summary?: {
    total_runs: number;
    total_checks: number;
    oldest_started_at: string | null;
    latest_started_at: string | null;
    available_check_names: string[];
    available_check_categories: string[];
    query_route: string;
  };
  tenant_policy?: {
    tenant_id: string;
    enabled_export_profiles: string[];
    enabled_visibility_classes: string[];
    redaction_enabled: boolean;
  } | null;
  error?: string;
}

interface AccessDiagnostics {
  email_delivery_mode: "provider" | "allowlist_preview_only" | "unconfigured" | "manual_temporary_owner_issued";
  pending_request_count?: number;
  active_credential_count?: number;
  recent_access: Array<{
    email: string | null;
    role: string;
    requested_next: string | null;
    result: string;
    reason: string | null;
    session_id: string | null;
    created_at: string;
    expires_at: string | null;
    verified_at: string | null;
  }>;
  error?: string;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("tr-TR");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function compactModeLabel(mode: AccessDiagnostics["email_delivery_mode"]): string {
  if (mode === "manual_temporary_owner_issued") return "owner onaylı geçici erişim";
  if (mode === "provider") return "sağlayıcı";
  if (mode === "allowlist_preview_only") return "allowlist önizleme";
  return "yapılandırılmamış";
}

function accessEventTitle(result: string): string {
  if (result === "requested") return "Talep alındı";
  if (result === "approved") return "Onaylandı";
  if (result === "signed_in") return "Geçici giriş yapıldı";
  if (result === "expired") return "Süre doldu";
  if (result === "denied" || result === "rejected") return "Reddedildi";
  return "İşlem kaydedildi";
}

async function getDiagnostics(): Promise<Diagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;

    const res = await fetch(`${base}/api/diagnostics`, {
      headers: { cookie: headersList.get("cookie") ?? "" },
      next: { revalidate: 10 },
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data?.message ?? `HTTP ${res.status}` };
    }

    return data as Diagnostics;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tanı verileri yüklenemedi" };
  }
}

async function getAccessDiagnostics(): Promise<AccessDiagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;

    const res = await fetch(`${base}/api/diagnostics/access`, {
      headers: { cookie: headersList.get("cookie") ?? "" },
      next: { revalidate: 10 },
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data?.message ?? `HTTP ${res.status}` };
    }

    return data as AccessDiagnostics;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erişim tanıları yüklenemedi" };
  }
}

export default async function AdminPage() {
  const diagnostics = await getDiagnostics();
  const accessDiagnostics = await getAccessDiagnostics();

  if ("error" in diagnostics) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "1.75rem 2rem", fontFamily: SANS }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <AdminPageHeader />
          <p style={{ fontSize: "0.85rem", color: "var(--error)", marginBottom: "0.8rem" }}>Tanı verisi yüklenemedi.</p>
          <div style={{ borderRadius: 10, border: "1px solid var(--error-border)", background: "var(--error-soft)", padding: "0.75rem 1rem", fontSize: "0.8rem" }}>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>Sistem hatası</strong>
            <span style={{ fontFamily: MONO }}>{diagnostics.error}</span>
          </div>
        </div>
      </div>
    );
  }

  const hasAccessError = "error" in accessDiagnostics;
  const recentAccess = hasAccessError ? [] : accessDiagnostics.recent_access.slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "1.55rem 2rem 2rem", fontFamily: SANS }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <header style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--panel)", padding: "1rem 1.15rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <AdminPageHeader />
          <AdminPageChips />
        </header>

        <AccessIssuancePanel />

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: "1rem" }}>
          <div style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel)", padding: "0.95rem 1.05rem 1.05rem" }}>
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.35rem" }}>Son işlemler</h2>
            {hasAccessError ? (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--error)" }}>{accessDiagnostics.error}</p>
            ) : (
              <>
                <p style={{ margin: 0, marginBottom: "0.65rem", fontSize: "0.8rem", color: "var(--text-soft)" }}>
                  Kısa audit özeti: {compactModeLabel(accessDiagnostics.email_delivery_mode)} · bekleyen talep {accessDiagnostics.pending_request_count ?? 0} · aktif geçici erişim {accessDiagnostics.active_credential_count ?? 0}
                </p>
                {recentAccess.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {recentAccess.map((entry) => (
                      <div key={`${entry.created_at}-${entry.session_id ?? entry.result}`} style={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.55rem 0.65rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.65rem" }}>
                          <strong style={{ fontSize: "0.8rem" }}>{accessEventTitle(entry.result)}</strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: MONO }}>{formatDate(entry.created_at)}</span>
                        </div>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "var(--text-soft)", lineHeight: 1.5 }}>
                          {entry.email ?? "e-posta yok"} · hedef {entry.requested_next ?? "-"} · rol {entry.role}
                          {entry.expires_at ? ` · geçerlilik ${formatDate(entry.expires_at)}` : ""}
                          {entry.reason ? ` · ${truncate(entry.reason, 72)}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Henüz audit kaydı yok.</p>
                )}
              </>
            )}
          </div>

          <div style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel)", padding: "0.95rem 1.05rem 1.05rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "0.96rem", margin: 0 }}>Call Center / Abonelikler</h2>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-soft)", lineHeight: 1.55 }}>
              Planlanan kontrol ünitesi işaretidir. Bu sürümde operasyon modülü açılmaz; yalnız gelecekteki yönü görünür kılar.
            </p>
            <button
              type="button"
              disabled
              style={{ width: "fit-content", borderRadius: 9, border: "1px dashed var(--border)", background: "var(--panel-card)", color: "var(--text-muted)", padding: "0.42rem 0.7rem", fontSize: "0.78rem", cursor: "not-allowed" }}
            >
              Yakında · Planlanan kontrol ünitesi
            </button>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              CRM, çağrı merkezi ve abonelik işlevi bu passta eklenmemiştir.
            </p>
          </div>
        </section>

        <section style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel)", padding: "0.95rem 1.05rem 1.05rem" }}>
          <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.35rem" }}>Teknik tanı</h2>
          <p style={{ margin: 0, marginBottom: "0.65rem", fontSize: "0.8rem", color: "var(--text-soft)", lineHeight: 1.5 }}>
            Smoke, export, tenant policy ve verification activity ayrıntıları bu bölümde üçüncü öncelik olarak tutulur.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Sistem ve tenant politikası</summary>
              <div style={{ marginTop: "0.45rem", fontSize: "0.79rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>Ortam: <strong style={{ fontFamily: MONO }}>{diagnostics.environment}</strong></p>
                <p style={{ margin: 0 }}>Veri kümesi: <strong style={{ fontFamily: MONO }}>{diagnostics.dataset_version}</strong></p>
                <p style={{ margin: 0 }}>Şema: <strong style={{ fontFamily: MONO }}>{diagnostics.schema_version}</strong></p>
                <p style={{ margin: 0 }}>Derleme: <strong style={{ fontFamily: MONO }}>{diagnostics.build_version}</strong></p>
                <p style={{ margin: 0 }}>Dışa aktarma profilleri: {diagnostics.supported_export_profiles?.join(", ") || "claims, legal"}</p>
                <p style={{ margin: 0 }}>
                  Tenant politikası: {diagnostics.tenant_policy
                    ? `${diagnostics.tenant_policy.tenant_id} · redaksiyon ${diagnostics.tenant_policy.redaction_enabled ? "etkin" : "kapalı"}`
                    : "kayıt yok"}
                </p>
              </div>
            </details>

            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Verification activity</summary>
              <div style={{ marginTop: "0.45rem", fontSize: "0.79rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                {diagnostics.recent_verifications?.length ? (
                  <ul style={{ margin: 0, paddingLeft: "1.05rem" }}>
                    {diagnostics.recent_verifications.slice(0, 6).map((item) => (
                      <li key={item.verification_run_id}>
                        {truncate(item.verification_run_id, 20)} · {item.verification_state} · {formatDate(item.created_at)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0 }}>Kayıt yok.</p>
                )}
              </div>
            </details>

            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Export activity</summary>
              <div style={{ marginTop: "0.45rem", fontSize: "0.79rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                {diagnostics.recent_exports?.length ? (
                  <ul style={{ margin: 0, paddingLeft: "1.05rem" }}>
                    {diagnostics.recent_exports.slice(0, 6).map((item) => (
                      <li key={item.export_id}>
                        {truncate(item.export_id, 18)} · {item.profile}/{item.format} · {formatDate(item.created_at)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0 }}>Kayıt yok.</p>
                )}
              </div>
            </details>

            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Smoke ve doğrulama özeti</summary>
              <div style={{ marginTop: "0.45rem", fontSize: "0.79rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>
                  Son smoke sonucu: {diagnostics.latest_smoke_run ? `${diagnostics.latest_smoke_run.overall_result} · ${formatDate(diagnostics.latest_smoke_run.started_at)}` : "kayıt yok"}
                </p>
                <p style={{ margin: 0 }}>
                  Son doğrulama çalıştırması: {diagnostics.latest_verification_run ? `${diagnostics.latest_verification_run.verification_state} · ${formatDate(diagnostics.latest_verification_run.created_at)}` : "kayıt yok"}
                </p>
                <p style={{ margin: 0 }}>
                  Smoke geçmişi: {diagnostics.smoke_history_summary
                    ? `${diagnostics.smoke_history_summary.total_runs} çalıştırma / ${diagnostics.smoke_history_summary.total_checks} kontrol`
                    : "kayıt yok"}
                </p>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
