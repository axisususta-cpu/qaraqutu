import { headers } from "next/headers";
import { CANONICAL_CASES, getCanonicalCases } from "../../lib/canonical-spine";
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
    redaction_applied?: boolean;
    redacted_item_count?: number;
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
  recent_smoke_runs?: Array<{
    smoke_run_id: string;
    overall_result: string;
    started_at: string;
    finished_at: string | null;
    environment: string;
    dataset_version: string;
    build_version: string;
    schema_version: string;
  }>;
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
  acceptance_preview_enabled: boolean;
  acceptance_preview_allowlist_count: number;
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
}

async function getDiagnostics(): Promise<Diagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/diagnostics`, {
      headers: {
        cookie: headersList.get("cookie") ?? "",
      },
      next: { revalidate: 10 },
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `HTTP ${res.status}` };
    return data as Diagnostics;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tanı verileri yüklenemedi" };
  }
}

async function getAccessDiagnostics(): Promise<AccessDiagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/diagnostics/access`, {
      headers: {
        cookie: headersList.get("cookie") ?? "",
      },
      next: { revalidate: 10 },
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `HTTP ${res.status}` };
    return data as AccessDiagnostics;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erişim tanıları yüklenemedi" };
  }
}

export default async function AdminPage() {
  const diagnostics = await getDiagnostics();
  const accessDiagnostics = await getAccessDiagnostics();

  if ("error" in diagnostics) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          padding: "1.75rem 2rem",
          fontFamily: SANS,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AdminPageHeader />
          <p style={{ fontSize: "0.85rem", color: "var(--error)", marginBottom: "0.8rem" }}>
            Bu yüzey yalnız tanı amaçlıdır; operasyon paneli değildir.
          </p>
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${"var(--error-border)"}`,
              background: "var(--error-soft)",
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
            }}
          >
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>Tanı hatası</strong>
            <span style={{ fontFamily: MONO }}>{diagnostics.error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "1.75rem 2rem 2.1rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.7rem" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          <div>
          <AdminPageHeader />
          </div>
          <AdminPageChips />
        </header>

        {/* Top-level status spine: environment + verifier + access boundary */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.6fr)",
            gap: "1.2rem",
          }}
        >
          {/* System status summary */}
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Sistem durumu özeti</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.45rem",
              }}
            >
              Mevcut verifier ortamının üst düzey ve sınırlandırılmış görünümü; canlı trafik veya iş kullanım paneli değildir.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.2fr)",
                gap: "0.6rem",
                fontSize: "0.8rem",
              }}
            >
              <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.6 }}>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Ortam:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.environment}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Veri kümesi:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.dataset_version}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Şema:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.schema_version}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Derleme:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.build_version}</span>
                </li>
              </ul>
              <div
                style={{
                  borderRadius: 8,
                  border: `1px dashed ${"var(--border)"}`,
                  padding: "0.55rem 0.7rem",
                  background: "var(--panel-raised)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.25rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                  }}
                >
                  Verifier hattı
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
                  Son verifier çalışmaları ve yetkilendirme yolları bütünlük için izlenir. Bu görünüm omurga sağlığını
                  raporlar; iş hacmini raporlamaz.
                </p>
              </div>
            </div>
          </div>

          {/* Protected boundary + surface state */}
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Korumalı yüzey sınırı</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.45rem",
              }}
            >
              Admin, console ve golden yüzeyleri bilinçli olarak erişim denetimindedir. Bu bölüm sınır niyetini
              açıklar; geçit iç ayrıntılarını açmaz.
            </p>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>
                <strong>Admin</strong>: yalnız tanı çalışma yüzeyi; genel operasyon paneli veya iş metriği içermez.
              </li>
              <li>
                <strong>Console</strong>: ayrılmış protokol kabuğu; herkese açık ürün yüzeyi olarak etkin değildir.
              </li>
              <li>
                <strong>Golden</strong>: iç verifier kabul görünümü; yalnız korumalı erişim altında açılır.
              </li>
              <li>
                <strong>Erişim sınırı</strong>: korumalı rotalar yetkili erişim ister; yetkisiz istekler sınırlandırılmış
                erişim reddi durumu görür.
              </li>
            </ul>
          </div>
        </section>

        <section
          style={{
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "0.95rem 1.05rem 1.05rem",
          }}
        >
          <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Son erişim izi</h2>
          {"error" in accessDiagnostics ? (
            <p style={{ fontSize: "0.8rem", color: "var(--error)", margin: 0 }}>{accessDiagnostics.error}</p>
          ) : (
            <>
              <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0, marginBottom: "0.55rem" }}>
                Erişim modu: <strong>{accessDiagnostics.email_delivery_mode}</strong>. Bekleyen talep: {accessDiagnostics.pending_request_count ?? 0}. Aktif geçici kimlik bilgisi: {accessDiagnostics.active_credential_count ?? 0}.
              </p>
              {accessDiagnostics.recent_access.length ? (
                <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
                  {accessDiagnostics.recent_access.map((entry) => (
                    <li key={`${entry.created_at}-${entry.session_id ?? entry.result}`}>
                      <strong>{entry.result}</strong> — hedef: {entry.requested_next ?? "—"} — e-posta: {entry.email ?? "—"} — rol: {entry.role} — oturum: {entry.session_id ?? "—"} — {entry.created_at}
                      {entry.reason ? ` — neden: ${entry.reason}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Henüz erişim izi yok.</p>
              )}
            </>
          )}
        </section>

        <AccessIssuancePanel />

        {/* Canonical and AXISUS overview */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1.5fr)",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.95rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Kanonik omurga</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Tek ürün omurgası: witness → verification → issuance. Verifier bu kaynaktan okur.
            </p>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>Toplam vaka: {CANONICAL_CASES.length}</li>
              <li>Araç: {getCanonicalCases("vehicle").length}</li>
              <li>Drone: {getCanonicalCases("drone").length}</li>
              <li>Robot: {getCanonicalCases("robot").length}</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.95rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>AXISUS durum özeti</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Omurga genelinde vaka odaklı sınır durumları (AXISUS State Pack v1).
            </p>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>
                Observe:{" "}
                {
                  CANONICAL_CASES.flatMap((c) => c.axisusStates ?? []).filter(
                    (s) => s.severity === "observe",
                  ).length
                }
              </li>
              <li>
                Review:{" "}
                {
                  CANONICAL_CASES.flatMap((c) => c.axisusStates ?? []).filter(
                    (s) => s.severity === "review",
                  ).length
                }
              </li>
              <li>
                Limit:{" "}
                {
                  CANONICAL_CASES.flatMap((c) => c.axisusStates ?? []).filter(
                    (s) => s.severity === "limit",
                  ).length
                }
              </li>
              <li>
                Devir:{" "}
                {
                  CANONICAL_CASES.flatMap((c) => c.axisusStates ?? []).filter(
                    (s) => s.severity === "handoff",
                  ).length
                }
              </li>
            </ul>
          </div>
        </section>

        {/* Environment + export profile capability */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1.7fr)",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Ortam</h2>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>Ortam: {diagnostics.environment}</li>
              <li>Veri kümesi sürümü: {diagnostics.dataset_version}</li>
              <li>Şema sürümü: {diagnostics.schema_version}</li>
              <li>Derleme sürümü: {diagnostics.build_version}</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Dışa aktarma profilleri</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0 }}>
              {diagnostics.supported_export_profiles?.length
                ? `Desteklenen: ${diagnostics.supported_export_profiles.join(", ")}`
                : "Desteklenen: claims, legal"}
            </p>
          </div>
        </section>

        {/* Issuance and verifier activity */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1.5fr)",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>
              Son dışa aktarma etkinliği (issuance)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Verifier üzerinden kontrollü artifact issuance yapılır. Issuance, kusur atamasından ayrı izlenir.
            </p>
            {diagnostics.recent_exports?.length ? (
              <ul
                style={{
                  fontSize: "0.8rem",
                  paddingLeft: "1.1rem",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {diagnostics.recent_exports.slice(0, 10).map((e) => (
                  <li key={e.export_id} style={{ marginBottom: "0.2rem" }}>
                    <strong>{e.export_id}</strong> — {e.profile} / {e.format} — olay:{" "}
                    {e.event_id ?? "—"} — makbuz: {e.receipt_id ?? "—"} — {e.created_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Henüz dışa aktarma etkinliği yok.</p>
            )}
          </div>

          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>
              Son doğrulama etkinliği (trace / çalıştırmalar)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Verifier omurgasından gelen doğrulama izi ve çalıştırma geçmişi.
            </p>
            {diagnostics.recent_verifications?.length ? (
              <ul
                style={{
                  fontSize: "0.8rem",
                  paddingLeft: "1.1rem",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {diagnostics.recent_verifications.slice(0, 10).map((r) => (
                  <li key={r.verification_run_id} style={{ marginBottom: "0.2rem" }}>
                    <strong>{r.verification_run_id}</strong> — olay: {r.event_id ?? "—"} —{" "}
                    {r.verification_state} — trace kimliği: {r.transcript_id ?? "—"} — {r.created_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Henüz doğrulama etkinliği yok.</p>
            )}
          </div>
        </section>

        {/* Verification trace + smoke runs */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1.5fr)",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Son doğrulama çalıştırması</h2>
            {diagnostics.latest_verification_run ? (
              <div style={{ fontSize: "0.8rem" }}>
                <p style={{ margin: 0, marginBottom: "0.25rem" }}>
                  <strong>{diagnostics.latest_verification_run.verification_run_id}</strong> — olay:{" "}
                  {diagnostics.latest_verification_run.event_id ?? "—"} —{" "}
                  {diagnostics.latest_verification_run.verification_state} —{" "}
                  {diagnostics.latest_verification_run.created_at}
                </p>
                {diagnostics.latest_verification_run.transcript_summary?.length ? (
                  <>
                    <p
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--text-muted)",
                        marginTop: "0.45rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      İz özeti:
                    </p>
                    <ul
                      style={{
                        paddingLeft: "1.1rem",
                        marginTop: 0,
                        marginBottom: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {diagnostics.latest_verification_run.transcript_summary.map((s, i) => (
                        <li key={i}>
                          {s.check} — {s.result}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Henüz doğrulama çalıştırması yok.</p>
            )}
          </div>

          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Son smoke çalıştırmaları</h2>
            {diagnostics.recent_smoke_runs?.length ? (
              <ul
                style={{
                  fontSize: "0.8rem",
                  paddingLeft: "1.1rem",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {diagnostics.recent_smoke_runs.map((r) => (
                  <li key={r.smoke_run_id} style={{ marginBottom: "0.2rem" }}>
                    <strong>{r.smoke_run_id}</strong> — {r.overall_result} — {r.started_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Henüz smoke çalıştırması yok.</p>
            )}
            {diagnostics.smoke_history_summary ? (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.65rem", lineHeight: 1.55 }}>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  Saklanan çalıştırma: {diagnostics.smoke_history_summary.total_runs} / kontrol: {diagnostics.smoke_history_summary.total_checks}
                </p>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  En eski: {diagnostics.smoke_history_summary.oldest_started_at ?? "—"}
                </p>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  Filtre rotası: {diagnostics.smoke_history_summary.query_route}
                </p>
                <p style={{ margin: 0 }}>
                  Kontrol türleri: {diagnostics.smoke_history_summary.available_check_categories.join(", ") || "—"}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* Tenant policy / issuance policy snapshot */}
        <section>
          <div
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Tenant politikası</h2>
            {diagnostics.tenant_policy ? (
              <div style={{ fontSize: "0.8rem" }}>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Tenant: {diagnostics.tenant_policy.tenant_id}
                </p>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Etkin dışa aktarma profilleri:{" "}
                  {diagnostics.tenant_policy.enabled_export_profiles.join(", ")}
                </p>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Etkin görünürlük sınıfları:{" "}
                  {diagnostics.tenant_policy.enabled_visibility_classes.join(", ")}
                </p>
                <p style={{ margin: 0 }}>
                  Redaksiyon: {diagnostics.tenant_policy.redaction_enabled ? "etkin" : "kapalı"}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Tanı verilerinde tenant politikası kaydı bulunamadı.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

