"use client";

import { useEffect, useState } from "react";

/** Same-origin proxy so production browser is not blocked by cross-origin API. */
const DIAGNOSTICS_URL = "/api/diagnostics";

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
}

export default function AdminPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(DIAGNOSTICS_URL);
        const json = await res.json();
        if (res.ok) setDiagnostics(json);
        else setDiagnostics(null);
      } catch {
        setDiagnostics(null);
      }
    }
    load();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#E5E7EB",
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
          System Diagnostics
        </h1>
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Environment
          </h2>
          {diagnostics ? (
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
              <li>Environment: {diagnostics.environment}</li>
              <li>Dataset version: {diagnostics.dataset_version}</li>
              <li>Schema version: {diagnostics.schema_version}</li>
              <li>Build version: {diagnostics.build_version}</li>
            </ul>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>Loading…</p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Export Profiles
          </h2>
          <p style={{ fontSize: "0.8rem" }}>
            {diagnostics?.supported_export_profiles?.length
              ? `Supported: ${diagnostics.supported_export_profiles.join(", ")}`
              : "Supported: claims, legal"}
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Last Smoke Result
          </h2>
          {diagnostics?.latest_smoke_run ? (
            <div style={{ fontSize: "0.8rem" }}>
              <p>
                <strong>{diagnostics.latest_smoke_run.smoke_run_id}</strong> —{" "}
                {diagnostics.latest_smoke_run.overall_result} — started{" "}
                {diagnostics.latest_smoke_run.started_at} — finished{" "}
                {diagnostics.latest_smoke_run.finished_at ?? "—"}
              </p>
              <p style={{ marginTop: "0.25rem" }}>
                Env: {diagnostics.latest_smoke_run.environment} — dataset:{" "}
                {diagnostics.latest_smoke_run.dataset_version} — schema:{" "}
                {diagnostics.latest_smoke_run.schema_version} — build:{" "}
                {diagnostics.latest_smoke_run.build_version}
              </p>
              {diagnostics.latest_smoke_run.checks?.length ? (
                <ul style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                  {diagnostics.latest_smoke_run.checks.map((c, idx) => (
                    <li key={idx}>
                      {c.check_name} ({c.category}) — {c.result}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No smoke runs have been recorded yet.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Recent Export Activity
          </h2>
          {diagnostics?.recent_exports?.length ? (
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem", margin: 0 }}>
              {diagnostics.recent_exports.slice(0, 10).map((e) => (
                <li key={e.export_id} style={{ marginBottom: "0.25rem" }}>
                  <strong>{e.export_id}</strong> — {e.profile} / {e.format} — event: {e.event_id ?? "—"} — receipt: {e.receipt_id ?? "—"} — {e.created_at}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No export activity yet.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Recent Verification Activity
          </h2>
          {diagnostics?.recent_verifications?.length ? (
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem", margin: 0 }}>
              {diagnostics.recent_verifications.slice(0, 10).map((r) => (
                <li key={r.verification_run_id} style={{ marginBottom: "0.25rem" }}>
                  <strong>{r.verification_run_id}</strong> — event: {r.event_id ?? "—"} — {r.verification_state} — transcript: {r.transcript_id ?? "—"} — {r.created_at}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No verification activity yet.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Latest Verification Run Summary
          </h2>
          {diagnostics?.latest_verification_run ? (
            <div style={{ fontSize: "0.8rem" }}>
              <p>
                <strong>{diagnostics.latest_verification_run.verification_run_id}</strong> — event: {diagnostics.latest_verification_run.event_id ?? "—"} — {diagnostics.latest_verification_run.verification_state} — {diagnostics.latest_verification_run.created_at}
              </p>
              {diagnostics.latest_verification_run.transcript_summary?.length ? (
                <ul style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                  {diagnostics.latest_verification_run.transcript_summary.map((s, i) => (
                    <li key={i}>{s.check} — {s.result}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No verification runs yet.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Recent Smoke Runs
          </h2>
          {diagnostics?.recent_smoke_runs?.length ? (
            <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem", margin: 0 }}>
              {diagnostics.recent_smoke_runs.map((r) => (
                <li key={r.smoke_run_id} style={{ marginBottom: "0.25rem" }}>
                  <strong>{r.smoke_run_id}</strong> — {r.overall_result} —{" "}
                  {r.started_at}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No smoke runs yet.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Tenant Policy
          </h2>
          {diagnostics?.tenant_policy ? (
            <div style={{ fontSize: "0.8rem" }}>
              <p>Tenant: {diagnostics.tenant_policy.tenant_id}</p>
              <p>
                Enabled export profiles:{" "}
                {diagnostics.tenant_policy.enabled_export_profiles.join(", ")}
              </p>
              <p>
                Enabled visibility classes:{" "}
                {diagnostics.tenant_policy.enabled_visibility_classes.join(
                  ", "
                )}
              </p>
              <p>
                Redaction:{" "}
                {diagnostics.tenant_policy.redaction_enabled
                  ? "enabled"
                  : "disabled"}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No tenant policy record surfaced in diagnostics.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

