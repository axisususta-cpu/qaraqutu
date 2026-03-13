"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CanonicalEvent, VerificationState } from "contracts";

const DEFAULT_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;

interface TranscriptStep {
  step: number;
  check: string;
  result: string;
  note: string;
}

// Phase 1 mock data scaffolding for future workstation wiring.
type MockSystemId = "vehicle" | "drone" | "robot";

const MOCK_SYSTEMS: { id: MockSystemId; label: string }[] = [
  { id: "vehicle", label: "Vehicle" },
  { id: "drone", label: "Drone" },
  { id: "robot", label: "Robot" },
];

const MOCK_SCENARIOS_BY_SYSTEM: Record<MockSystemId, string[]> = {
  vehicle: [
    "Urban Intersection Collision",
    "Near Miss / AEB Activation",
    "Lane Merge Conflict",
    "Fleet Incident Review",
  ],
  drone: [
    "Mission Anomaly",
    "Operator Handoff Dispute",
    "Route Deviation",
    "Post-Mission Review",
  ],
  robot: [
    "Safety Stop Event",
    "Human Proximity Incident",
    "Operational Deviation",
    "Compliance Review",
  ],
};

const MOCK_INCIDENT_SUMMARIES: Record<string, { what: string; why: string; state: string; next: string }> =
  {};

const MOCK_RECORDED_EVIDENCE: Record<
  string,
  { source: string; timestamp: string; description: string; referenceId: string; status: string }[]
> = {};

const MOCK_DERIVED_EVIDENCE: Record<
  string,
  { type: string; basis: string; explanation: string; confidence: string; profileRelevance: string }[]
> = {};

const MOCK_TRANSCRIPT_STEPS: Record<
  string,
  TranscriptStep[]
> = {};

const MOCK_ISSUANCE_RESULTS: Record<
  string,
  {
    profile: "claims" | "legal";
    format: "json" | "pdf";
    purpose: string;
    status: string;
    bundleId: string;
    manifestId: string;
    receiptId: string;
    exportId: string;
  }
> = {};

function VerifierContent() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const [selectedSystem, setSelectedSystem] = useState<MockSystemId>("vehicle");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeSpineSection, setActiveSpineSection] = useState<string>("system");
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verificationState, setVerificationState] =
    useState<VerificationState | null>(null);
  const [transcript, setTranscript] = useState<TranscriptStep[] | null>(null);
  const [identity, setIdentity] = useState<{
    event_id: string;
    bundle_id: string;
    manifest_id: string;
  } | null>(null);
  const [verificationRunId, setVerificationRunId] = useState<string | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportProfile, setExportProfile] = useState<"claims" | "legal">(
    "claims"
  );
  const [selectedFormat, setSelectedFormat] = useState<"json" | "pdf" | null>(
    null
  );
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    "verifier_ui_manual_export"
  );
  const [issuanceState, setIssuanceState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [exportLoading, setExportLoading] = useState<"json" | "pdf" | null>(
    null
  );
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/v1/events`);
      const json = await res.json();
      const items: CanonicalEvent[] = json.items ?? [];
      setEvents(items);
      if (items.length) {
        const requestedId = searchParams.get("eventId");
        const match =
          requestedId && items.find((ev) => ev.eventId === requestedId);
        const effectiveId = match ? match.eventId : items[0].eventId;
        setSelectedId(effectiveId);
        setSelectedEventId(effectiveId);
      }
    }
    load();
  }, [searchParams]);

  const selected = events.find((e) => e.eventId === selectedId) ?? null;

  async function runVerification() {
    if (!selectedId) return;
    setLoading(true);
    setVerificationState(null);
    setTranscript(null);
    setIdentity(null);
    setVerificationRunId(null);
    setTranscriptId(null);

    const res = await fetch(`${API_BASE}/v1/events/${selectedId}/verify`, {
      method: "POST",
    });
    const json = await res.json();
    setVerificationState(json.verification_state as VerificationState);
    setTranscript(json.transcript_summary ?? null);
    setIdentity({
      event_id: json.event_id,
      bundle_id: json.bundle_id,
      manifest_id: json.manifest_id,
    });
    if (json.verification_run_id) setVerificationRunId(json.verification_run_id);
    if (json.transcript_id) setTranscriptId(json.transcript_id);
    setLoading(false);
  }

  async function runExportJson() {
    if (!selectedId || exportLoading) return;
    setExportLoading("json");
    setExportError(null);

    try {
      const res = await fetch(
        `${API_BASE}/v1/events/${selectedId}/exports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: exportProfile,
            format: "json",
            purpose: "verifier_ui_manual_export",
          }),
        }
      );
      const json = await res.json();

      if (!res.ok || !json.download_url) {
        setExportError(json.error ?? "Export failed");
      } else if (typeof window !== "undefined") {
        const href = `${API_BASE}${json.download_url}`;
        window.open(href, "_blank");
      }
    } catch (e) {
      setExportError("Export failed");
    } finally {
      setExportLoading(null);
    }
  }

  async function runExportPdf() {
    if (!selectedId || exportLoading) return;
    setExportLoading("pdf");
    setExportError(null);

    try {
      const res = await fetch(
        `${API_BASE}/v1/events/${selectedId}/exports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: exportProfile,
            format: "pdf",
            purpose: "verifier_ui_manual_export",
          }),
        }
      );
      const json = await res.json();

      if (!res.ok || !json.download_url) {
        setExportError(json.error ?? "Export failed");
      } else if (typeof window !== "undefined") {
        const href = `${API_BASE}${json.download_url}`;
        window.open(href, "_blank");
      }
    } catch (e) {
      setExportError("Export failed");
    } finally {
      setExportLoading(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#E5E7EB",
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              Verifier
            </div>
            <h1 style={{ fontSize: "1.4rem", margin: 0 }}>
              Event Package Verification
            </h1>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.25rem" }}>
              Verification is a bounded assessment of the referenced event
              package. It does not make liability or guilt determinations.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              fontSize: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: 4,
                border: language === "en" ? "1px solid #E5E7EB" : "1px solid #374151",
                background: language === "en" ? "#111827" : "#020617",
                color: "#E5E7EB",
                cursor: "pointer",
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("tr")}
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: 4,
                border: language === "tr" ? "1px solid #E5E7EB" : "1px solid #374151",
                background: language === "tr" ? "#111827" : "#020617",
                color: "#E5E7EB",
                cursor: "pointer",
              }}
            >
              TR
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.5rem",
          }}
        >
          <aside
            style={{
              width: 280,
              borderRight: "1px solid #111827",
              paddingRight: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
                marginBottom: "0.5rem",
              }}
            >
              {language === "tr" ? "Komut Omurgası" : "Command Spine"}
            </div>
            {[
              {
                id: "system",
                label:
                  language === "tr"
                    ? "Sistem"
                    : "System",
              },
              {
                id: "scenario",
                label:
                  language === "tr"
                    ? "Senaryo"
                    : "Scenario",
              },
              {
                id: "event",
                label:
                  language === "tr"
                    ? "Olay"
                    : "Event",
              },
              {
                id: "summary",
                label:
                  language === "tr"
                    ? "Olay Özeti"
                    : "Incident Summary",
              },
              {
                id: "evidence",
                label:
                  language === "tr"
                    ? "Delil Katmanları"
                    : "Evidence Layers",
              },
              {
                id: "transcript",
                label:
                  language === "tr"
                    ? "Doğrulama Kaydı"
                    : "Verification Transcript",
              },
              {
                id: "issuance",
                label:
                  language === "tr"
                    ? "Belge Üretimi"
                    : "Artifact Issuance",
              },
            ].map((section) => {
              const isActive = activeSpineSection === section.id;
              return (
                <div
                  key={section.id}
                  style={{
                    marginBottom: "0.5rem",
                    borderRadius: 4,
                    border: isActive
                      ? "1px solid #4B5563"
                      : "1px solid #111827",
                    background: isActive ? "#020617" : "transparent",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSpineSection(section.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.45rem 0.6rem",
                      background: "transparent",
                      border: "none",
                      color: "#E5E7EB",
                      fontSize: "0.8rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span>{section.label}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.65,
                      }}
                    >
                      {isActive ? "−" : "+"}
                    </span>
                  </button>
                  {isActive && (
                    <div
                      style={{
                        padding: "0.4rem 0.6rem 0.6rem",
                        borderTop: "1px solid #111827",
                        fontSize: "0.75rem",
                        opacity: 0.8,
                      }}
                    >
                      {/* Phase 1: placeholder copy, will be wired in Phase 2 */}
                      <p style={{ margin: 0 }}>
                        {section.id === "system" &&
                          (language === "tr"
                            ? "Sistem seçimini burada yöneteceksiniz."
                            : "System selection will be managed here.")}
                        {section.id === "scenario" &&
                          (language === "tr"
                            ? "Senaryo seçimi ve bağlam bu bölümde organize edilecek."
                            : "Scenario selection and context will be organized here.")}
                        {section.id === "event" &&
                          (language === "tr"
                            ? "Olay kartları ve kimlik zinciri bu bölümde yönlendirilecek."
                            : "Event cards and identity chain will be driven from here.")}
                        {section.id === "summary" &&
                          (language === "tr"
                            ? "Olay özeti ve inceleme amacı burada sunulacak."
                            : "Incident summary and review intent will be surfaced here.")}
                        {section.id === "evidence" &&
                          (language === "tr"
                            ? "Kayıtlı ve türetilmiş delil katmanları burada ayrıştırılacak."
                            : "Recorded and derived evidence layers will be separated here.")}
                        {section.id === "transcript" &&
                          (language === "tr"
                            ? "Doğrulama adımları ve kayıt özeti bu bölümde gösterilecek."
                            : "Verification steps and transcript summary will be shown here.")}
                        {section.id === "issuance" &&
                          (language === "tr"
                            ? "Belge üretimi ve zincir kimlikleri bu panelden yönetilecek."
                            : "Artifact issuance and chain identifiers will be managed from this panel.")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          <main style={{ flex: 1 }}>
            {/* Stage header placeholder */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: "0.25rem",
                }}
              >
                {language === "tr" ? "İnceleme Sahnesi" : "Review Stage"}
              </div>
              <div
                style={{
                  border: "1px solid #111827",
                  borderRadius: 6,
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  opacity: 0.85,
                }}
              >
                <p style={{ margin: 0 }}>
                  {language === "tr"
                    ? "Seçili olay için sahne ve özet burada gösterilecektir."
                    : "Stage and summary for the selected event will be presented here."}
                </p>
              </div>
            </section>

            {/* Identity chain strip placeholder */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: "0.25rem",
                }}
              >
                {language === "tr" ? "Kimlik Zinciri" : "Identity Chain"}
              </div>
              <div
                style={{
                  border: "1px solid #111827",
                  borderRadius: 6,
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.75rem",
                  opacity: 0.85,
                }}
              >
                {identity ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem 1.25rem",
                    }}
                  >
                    <span>Event: {identity.event_id}</span>
                    <span>Bundle: {identity.bundle_id}</span>
                    <span>Manifest: {identity.manifest_id}</span>
                    {verificationRunId && <span>Run: {verificationRunId}</span>}
                    {transcriptId && <span>Transcript: {transcriptId}</span>}
                  </div>
                ) : (
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Henüz olay seçilmedi."
                      : "No event has been selected yet."}
                  </p>
                )}
              </div>
            </section>

            {/* Existing functional verifier workflow */}
            <section style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                {language === "tr" ? "Olay Seçimi" : "Select Event"}
              </h2>
              <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                {language === "tr"
                  ? "Tohumlanmış olaylardan birini seçerek paket doğrulamasını başlatın."
                  : "Choose a seeded event to verify its bundle and manifest linkage."}
              </p>
              <select
                value={selectedId ?? ""}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setSelectedEventId(e.target.value);
                }}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.6rem",
                  background: "#020617",
                  color: "#E5E7EB",
                  border: "1px solid #374151",
                  borderRadius: 4,
                  fontSize: "0.85rem",
                }}
              >
                {events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.scenarioKey} — {ev.eventId}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: "0.75rem" }}>
                <button
                  type="button"
                  onClick={runVerification}
                  disabled={!selectedId || loading}
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: 4,
                    border: "1px solid #374151",
                    background: "#0B1120",
                    color: "#E5E7EB",
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading
                    ? language === "tr"
                      ? "Doğrulanıyor…"
                      : "Verifying…"
                    : language === "tr"
                    ? "Olayı Doğrula"
                    : "Verify Event Package"}
                </button>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                {language === "tr"
                  ? "Doğrulama Sonucu"
                  : "Verification Result"}
              </h2>
              {!verificationState && !transcript && (
                <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {language === "tr"
                    ? "Henüz bir doğrulama çalıştırılmadı. Bir olay seçin ve doğrulamayı başlatın."
                    : "No verification has been run yet. Select an event and start verification to see its current state and a concise transcript summary."}
                </p>
              )}

              {verificationState && identity && (
                <div
                  style={{
                    border: "1px solid #1F2937",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    {language === "tr"
                      ? "Doğrulama Durumu"
                      : "Verification State"}
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {verificationState}
                  </div>
                  {(verificationRunId || transcriptId) && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.8rem",
                        opacity: 0.9,
                      }}
                    >
                      {verificationRunId && (
                        <div>
                          {language === "tr"
                            ? "Doğrulama çalıştırma ID:"
                            : "Verification run ID:"}{" "}
                          {verificationRunId}
                        </div>
                      )}
                      {transcriptId && (
                        <div>
                          {language === "tr"
                            ? "Kayıt ID:"
                            : "Transcript ID:"}{" "}
                          {transcriptId}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
                  >
                    <div>Event ID: {identity.event_id}</div>
                    <div>Bundle ID: {identity.bundle_id}</div>
                    <div>Manifest ID: {identity.manifest_id}</div>
                  </div>
                </div>
              )}

              {transcript && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {language === "tr"
                      ? "Kayıt Özeti"
                      : "Transcript Summary"}
                  </div>
                  <ul
                    style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}
                  >
                    {transcript.map((step) => (
                      <li key={step.step}>
                        <strong>{step.check}</strong> — {step.result} —{" "}
                        {step.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {selected && (
              <section style={{ marginTop: "1.5rem" }}>
                <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  Exports
                </h2>
                <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {language === "tr"
                    ? "Seçili olay için tek seferlik dışa aktarımlar oluşturun."
                    : "Create one-off exports for the currently selected event."}
                </p>
                <div
                  style={{
                    pointerEvents: exportLoading ? "none" : "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      marginBottom: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      {language === "tr" ? "Profil:" : "Profile:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExportProfile("claims")}
                      disabled={!!exportLoading}
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border:
                          exportProfile === "claims"
                            ? "1px solid #E5E7EB"
                            : "1px solid #374151",
                        background:
                          exportProfile === "claims"
                            ? "#111827"
                            : "#020617",
                        color: "#E5E7EB",
                        cursor: exportLoading ? "not-allowed" : "pointer",
                        opacity: exportLoading ? 0.6 : 1,
                      }}
                    >
                      Claims
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportProfile("legal")}
                      disabled={!!exportLoading}
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border:
                          exportProfile === "legal"
                            ? "1px solid #E5E7EB"
                            : "1px solid #374151",
                        background:
                          exportProfile === "legal"
                            ? "#111827"
                            : "#020617",
                        color: "#E5E7EB",
                        cursor: exportLoading ? "not-allowed" : "pointer",
                        opacity: exportLoading ? 0.6 : 1,
                      }}
                    >
                      Legal
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={runExportJson}
                      disabled={!selectedId || !!exportLoading}
                      style={{
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.8rem",
                        borderRadius: 4,
                        border: "1px solid #374151",
                        background: "#0B1120",
                        color: "#E5E7EB",
                        cursor:
                          !selectedId || exportLoading
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          !selectedId || exportLoading ? 0.6 : 1,
                      }}
                    >
                      {exportLoading === "json"
                        ? language === "tr"
                          ? "Dışa aktarılıyor…"
                          : "Exporting…"
                        : "Export JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={runExportPdf}
                      disabled={!selectedId || !!exportLoading}
                      style={{
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.8rem",
                        borderRadius: 4,
                        border: "1px solid #374151",
                        background: "#0B1120",
                        color: "#E5E7EB",
                        cursor:
                          !selectedId || exportLoading
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          !selectedId || exportLoading ? 0.6 : 1,
                      }}
                    >
                      {exportLoading === "pdf"
                        ? language === "tr"
                          ? "Dışa aktarılıyor…"
                          : "Exporting…"
                        : "Export PDF"}
                    </button>
                  </div>
                </div>
                {exportError && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      color: "#fca5a5",
                    }}
                  >
                    {exportError}
                  </p>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function VerifierPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#E5E7EB",
            padding: "1.5rem 2rem",
          }}
        >
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>Loading…</p>
          </div>
        </div>
      }
    >
      <VerifierContent />
    </Suspense>
  );
}

