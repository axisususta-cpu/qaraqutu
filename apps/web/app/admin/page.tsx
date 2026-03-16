import { headers } from "next/headers";
import { CANONICAL_CASES, getCanonicalCases } from "../../lib/canonical-spine";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  panel: "#0a1628",
  border: "#1a2d4a",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

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
  tenant_policy?: {
    tenant_id: string;
    enabled_export_profiles: string[];
    enabled_visibility_classes: string[];
    redaction_enabled: boolean;
  } | null;
  error?: string;
}

async function getDiagnostics(): Promise<Diagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/diagnostics`, { next: { revalidate: 10 } });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `HTTP ${res.status}` };
    return data as Diagnostics;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to load diagnostics" };
  }
}

export default async function AdminPage() {
  const diagnostics = await getDiagnostics();

  if ("error" in diagnostics) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: UI.bg,
          color: UI.text,
          padding: "1.75rem 2rem",
          fontFamily: SANS,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>System diagnostics</h1>
          <p style={{ fontSize: "0.85rem", color: "#fca5a5", marginBottom: "0.8rem" }}>
            Diagnostics only — not an operations dashboard.
          </p>
          <div
            style={{
              borderRadius: 10,
              border: "1px solid rgba(127,29,29,0.6)",
              background: "rgba(127,29,29,0.16)",
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
            }}
          >
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>Diagnostics error</strong>
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
        background: UI.bg,
        color: UI.text,
        padding: "1.75rem 2rem 2.1rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.7rem" }}>
        <header>
          <h1 style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>System diagnostics</h1>
          <p
            style={{
              fontSize: "0.84rem",
              color: UI.textSoft,
              margin: 0,
              marginBottom: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            Diagnostics only — not an operations dashboard. Verifier spine activity (verification runs, trace, issuance)
            and environment state are surfaced here for support and operations.
          </p>
        </header>

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
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.95rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Canonical spine</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: UI.textSoft,
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Single product spine: witness → verification → issuance. Verifier reads from this registry.
            </p>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>Total cases: {CANONICAL_CASES.length}</li>
              <li>Vehicle: {getCanonicalCases("vehicle").length}</li>
              <li>Drone: {getCanonicalCases("drone").length}</li>
              <li>Robot: {getCanonicalCases("robot").length}</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.95rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>AXISUS state summary</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: UI.textSoft,
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Case-aware boundary states across spine (AXISUS State Pack v1).
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
                Handoff:{" "}
                {
                  CANONICAL_CASES.flatMap((c) => c.axisusStates ?? []).filter(
                    (s) => s.severity === "handoff",
                  ).length
                }
              </li>
            </ul>
          </div>
        </section>

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
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Environment</h2>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>Environment: {diagnostics.environment}</li>
              <li>Dataset version: {diagnostics.dataset_version}</li>
              <li>Schema version: {diagnostics.schema_version}</li>
              <li>Build version: {diagnostics.build_version}</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Export profiles</h2>
            <p style={{ fontSize: "0.8rem", color: UI.textSoft, margin: 0 }}>
              {diagnostics.supported_export_profiles?.length
                ? `Supported: ${diagnostics.supported_export_profiles.join(", ")}`
                : "Supported: claims, legal"}
            </p>
          </div>
        </section>

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
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>
              Recent export activity (issuance)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: UI.textMuted,
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Controlled artifact issuance from the verifier. Issuance is tracked separately from blame.
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
                    <strong>{e.export_id}</strong> — {e.profile} / {e.format} — event:{" "}
                    {e.event_id ?? "—"} — receipt: {e.receipt_id ?? "—"} — {e.created_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: UI.textMuted, margin: 0 }}>No export activity yet.</p>
            )}
          </div>

          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>
              Recent verification activity (trace / runs)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: UI.textMuted,
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Verification trace and run history from the verifier spine.
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
                    <strong>{r.verification_run_id}</strong> — event: {r.event_id ?? "—"} —{" "}
                    {r.verification_state} — trace id: {r.transcript_id ?? "—"} — {r.created_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.8rem", color: UI.textMuted, margin: 0 }}>No verification activity yet.</p>
            )}
          </div>
        </section>

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
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Latest verification run</h2>
            {diagnostics.latest_verification_run ? (
              <div style={{ fontSize: "0.8rem" }}>
                <p style={{ margin: 0, marginBottom: "0.25rem" }}>
                  <strong>{diagnostics.latest_verification_run.verification_run_id}</strong> — event:{" "}
                  {diagnostics.latest_verification_run.event_id ?? "—"} —{" "}
                  {diagnostics.latest_verification_run.verification_state} —{" "}
                  {diagnostics.latest_verification_run.created_at}
                </p>
                {diagnostics.latest_verification_run.transcript_summary?.length ? (
                  <>
                    <p
                      style={{
                        fontSize: "0.76rem",
                        color: UI.textMuted,
                        marginTop: "0.45rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Trace summary:
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
              <p style={{ fontSize: "0.8rem", color: UI.textMuted, margin: 0 }}>No verification runs yet.</p>
            )}
          </div>

          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Recent smoke runs</h2>
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
              <p style={{ fontSize: "0.8rem", color: UI.textMuted, margin: 0 }}>No smoke runs yet.</p>
            )}
          </div>
        </section>

        <section>
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Tenant policy</h2>
            {diagnostics.tenant_policy ? (
              <div style={{ fontSize: "0.8rem" }}>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Tenant: {diagnostics.tenant_policy.tenant_id}
                </p>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Enabled export profiles:{" "}
                  {diagnostics.tenant_policy.enabled_export_profiles.join(", ")}
                </p>
                <p style={{ margin: 0, marginBottom: "0.2rem" }}>
                  Enabled visibility classes:{" "}
                  {diagnostics.tenant_policy.enabled_visibility_classes.join(", ")}
                </p>
                <p style={{ margin: 0 }}>
                  Redaction: {diagnostics.tenant_policy.redaction_enabled ? "enabled" : "disabled"}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: UI.textMuted, margin: 0 }}>
                No tenant policy record surfaced in diagnostics.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
