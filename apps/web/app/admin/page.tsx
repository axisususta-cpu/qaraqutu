import { headers } from "next/headers";
import { CANONICAL_CASES, getCanonicalCases } from "../../lib/canonical-spine";
import { AdminPageHeader, AdminPageChips } from "./AdminPageHeader";

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
  email_delivery_mode: "provider" | "allowlist_preview_only" | "unconfigured";
  acceptance_preview_enabled: boolean;
  acceptance_preview_allowlist_count: number;
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
    const res = await fetch(`${base}/api/diagnostics`, { next: { revalidate: 10 } });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `HTTP ${res.status}` };
    return data as Diagnostics;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to load diagnostics" };
  }
}

async function getAccessDiagnostics(): Promise<AccessDiagnostics | { error: string }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? headersList.get("x-forwarded-host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${host}`;
    const res = await fetch(`${base}/api/diagnostics/access`, { next: { revalidate: 10 } });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `HTTP ${res.status}` };
    return data as AccessDiagnostics;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to load access diagnostics" };
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
            Diagnostics only — not an operations dashboard.
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
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>System status summary</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.45rem",
              }}
            >
              High-level, bounded view of the current verifier environment — not a live traffic or business usage panel.
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
                  <span style={{ color: "var(--text-muted)" }}>Environment:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.environment}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Dataset:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.dataset_version}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Schema:</span>{" "}
                  <span style={{ fontFamily: MONO }}>{diagnostics.schema_version}</span>
                </li>
                <li>
                  <span style={{ color: "var(--text-muted)" }}>Build:</span>{" "}
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
                  Verifier pipeline
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: 0, lineHeight: 1.5 }}>
                  Recent verifier runs and issuance paths are tracked for integrity. This view reports spine health, not
                  business throughput.
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
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Protected surface boundary</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
                margin: 0,
                marginBottom: "0.45rem",
              }}
            >
              Admin, console and golden surfaces are intentionally access-controlled. This section documents boundary
              intent — it does not expose gate internals.
            </p>
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
              <li>
                <strong>Admin</strong>: diagnostics workbench only — no generic operations dashboard, no business metrics.
              </li>
              <li>
                <strong>Console</strong>: reserved protocol shell — not activated as a public product surface.
              </li>
              <li>
                <strong>Golden</strong>: internal verifier acceptance view — surfaced under protected access only.
              </li>
              <li>
                <strong>Access boundary</strong>: protected routes require authorized access; unauthorized requests see a
                bounded restricted state.
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
          <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Recent access trace</h2>
          {"error" in accessDiagnostics ? (
            <p style={{ fontSize: "0.8rem", color: "var(--error)", margin: 0 }}>{accessDiagnostics.error}</p>
          ) : (
            <>
              <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0, marginBottom: "0.55rem" }}>
                Delivery mode: <strong>{accessDiagnostics.email_delivery_mode}</strong>. Acceptance preview is {accessDiagnostics.acceptance_preview_enabled ? "enabled" : "disabled"}; allowlist count: {accessDiagnostics.acceptance_preview_allowlist_count}.
              </p>
              {accessDiagnostics.recent_access.length ? (
                <ul style={{ fontSize: "0.8rem", paddingLeft: "1.1rem", margin: 0, lineHeight: 1.6 }}>
                  {accessDiagnostics.recent_access.map((entry) => (
                    <li key={`${entry.created_at}-${entry.session_id ?? entry.result}`}>
                      <strong>{entry.result}</strong> — next: {entry.requested_next ?? "—"} — email: {entry.email ?? "—"} — role: {entry.role} — session: {entry.session_id ?? "—"} — {entry.created_at}
                      {entry.reason ? ` — reason: ${entry.reason}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No access trace yet.</p>
              )}
            </>
          )}
        </section>

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
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Canonical spine</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
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
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.95rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>AXISUS state summary</h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-soft)",
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
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "0.9rem 1.05rem 1.05rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.5rem" }}>Export profiles</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0 }}>
              {diagnostics.supported_export_profiles?.length
                ? `Supported: ${diagnostics.supported_export_profiles.join(", ")}`
                : "Supported: claims, legal"}
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
              Recent export activity (issuance)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No export activity yet.</p>
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
              Recent verification activity (trace / runs)
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No verification activity yet.</p>
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
                        color: "var(--text-muted)",
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No verification runs yet.</p>
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No smoke runs yet.</p>
            )}
            {diagnostics.smoke_history_summary ? (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.65rem", lineHeight: 1.55 }}>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  Retained runs: {diagnostics.smoke_history_summary.total_runs} / checks: {diagnostics.smoke_history_summary.total_checks}
                </p>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  Oldest: {diagnostics.smoke_history_summary.oldest_started_at ?? "—"}
                </p>
                <p style={{ margin: 0, marginBottom: "0.15rem" }}>
                  Filter route: {diagnostics.smoke_history_summary.query_route}
                </p>
                <p style={{ margin: 0 }}>
                  Check types: {diagnostics.smoke_history_summary.available_check_categories.join(", ") || "—"}
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                No tenant policy record surfaced in diagnostics.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

