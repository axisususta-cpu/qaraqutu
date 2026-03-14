"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  CanonicalEvent,
  RecordedEvidenceItem,
  DerivedEvidenceItem,
  VerificationState,
} from "contracts";
import { UstaPDemoTrigger } from "./UstaPDemoTrigger";

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

// Unified event card shape (Vehicle from API, Drone/Robot from mock).
interface EventCard {
  eventId: string;
  title: string;
  summary: string;
  timestamp: string;
  severity: string;
  state: string;
  availableOutputs: string[];
  bundleId?: string;
  manifestId?: string;
}

// Mock events for Drone (Phase 2).
const MOCK_DRONE_EVENTS: EventCard[] = [
  {
    eventId: "drone-mission-001",
    title: "Mission Anomaly — Altitude Deviation",
    summary: "UAV deviated from planned altitude band during waypoint transit.",
    timestamp: "2025-03-12T14:22:00Z",
    severity: "medium",
    state: "under_review",
    availableOutputs: ["Mission log", "Telemetry export"],
    bundleId: "bundle-drone-001",
    manifestId: "manifest-drone-001",
  },
  {
    eventId: "drone-handoff-002",
    title: "Operator Handoff Dispute",
    summary: "Discrepancy between primary and secondary operator handoff logs.",
    timestamp: "2025-03-11T09:15:00Z",
    severity: "high",
    state: "pending",
    availableOutputs: ["Handoff transcript", "Control log"],
    bundleId: "bundle-drone-002",
    manifestId: "manifest-drone-002",
  },
];

// Mock events for Robot (Phase 2).
const MOCK_ROBOT_EVENTS: EventCard[] = [
  {
    eventId: "robot-safety-001",
    title: "Safety Stop Event — Workcell 3",
    summary: "Emergency stop triggered by proximity sensor during cycle.",
    timestamp: "2025-03-13T11:08:00Z",
    severity: "high",
    state: "under_review",
    availableOutputs: ["Safety log", "Cycle trace"],
    bundleId: "bundle-robot-001",
    manifestId: "manifest-robot-001",
  },
  {
    eventId: "robot-proximity-002",
    title: "Human Proximity Incident",
    summary: "Operator entered restricted zone; safeguard recorded.",
    timestamp: "2025-03-12T16:45:00Z",
    severity: "medium",
    state: "verified",
    availableOutputs: ["Proximity log", "Compliance report"],
    bundleId: "bundle-robot-002",
    manifestId: "manifest-robot-002",
  },
];

// Incident summary content: what, why, state, next (Vehicle derived or mock).
function getIncidentSummary(
  system: MockSystemId,
  eventCard: EventCard | null,
  verificationState: VerificationState | null,
  language: "en" | "tr"
): { what: string; why: string; state: string; next: string } {
  if (!eventCard) {
    return {
      what: language === "tr" ? "Henüz olay seçilmedi." : "No event selected.",
      why: "",
      state: "",
      next: language === "tr" ? "Bir olay seçin." : "Select an event.",
    };
  }
  if (system === "vehicle" && verificationState) {
    return {
      what: eventCard.summary,
      why:
        language === "tr"
          ? "Paket bütünlüğü ve manifest bağlantısı doğrulaması için incelemeye alındı."
          : "Under review for bundle integrity and manifest linkage verification.",
      state: verificationState,
      next:
        verificationState === "UNVERIFIED" || verificationState === "UNKNOWN"
          ? language === "tr"
            ? "Doğrulamayı çalıştırın veya dışa aktarım oluşturun."
            : "Run verification or create an export."
          : language === "tr"
          ? "Kayıt özetini inceleyin veya dışa aktarım oluşturun."
          : "Review transcript summary or create an export.",
    };
  }
  if (system === "vehicle") {
    return {
      what: eventCard.summary,
      why:
        language === "tr"
          ? "Paket doğrulaması için incelemeye alındı."
          : "Under review for event package verification.",
      state: eventCard.state,
      next:
        language === "tr"
          ? "Olayı doğrula ile paket doğrulamasını başlatın."
          : "Start package verification with Verify Event Package.",
    };
  }
  // Drone / Robot mock summaries.
  const mock: Record<MockSystemId, { what: string; why: string; state: string; next: string }> = {
    drone: {
      what: eventCard.summary,
      why:
        language === "tr"
          ? "Görev anomalisi ve operatör el değişimi kayıtlarının doğrulanması için."
          : "Under review for mission anomaly and operator handoff record verification.",
      state: eventCard.state,
      next:
        language === "tr"
          ? "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir."
          : "Demo context only in current release.",
    },
    robot: {
      what: eventCard.summary,
      why:
        language === "tr"
          ? "Güvenlik durdurma ve uyumluluk kayıtlarının incelenmesi için."
          : "Under review for safety stop and compliance record assessment.",
      state: eventCard.state,
      next:
        language === "tr"
          ? "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir."
          : "Demo context only in current release.",
    },
    vehicle: { what: "", why: "", state: "", next: "" },
  };
  return mock[system];
}

// Phase 3: display shapes for Evidence Layers (right-side block).
interface RecordedEvidenceRow {
  source: string;
  timestamp: string;
  description: string;
  referenceId: string;
  status: string;
}

interface DerivedEvidenceRow {
  type: string;
  basisReferences: string;
  explanation: string;
  confidence: string;
  profileRelevance: string;
}

function toRecordedRows(items: RecordedEvidenceItem[]): RecordedEvidenceRow[] {
  return items.map((r) => ({
    source: r.displayLabel || `${r.sourceType} / ${r.sourceId}`,
    timestamp: r.capturedAt,
    description: r.displayLabel || r.machineLabel,
    referenceId: r.recordId,
    status: r.originConfidence >= 0.9 ? "verified" : "recorded",
  }));
}

function toDerivedRows(items: DerivedEvidenceItem[]): DerivedEvidenceRow[] {
  return items.map((d) => ({
    type: d.derivedType || d.displayLabel,
    basisReferences: (d.derivedFrom || d.sourceDependencies || []).join(", ") || "—",
    explanation: d.humanSummary || d.derivationNote || "—",
    confidence: String(Math.round((d.confidence ?? 0) * 100) + "%"),
    profileRelevance: (d as { visibility_class?: string }).visibility_class ?? "claims_review",
  }));
}

// Phase 3: Verification Transcript step row (procedural).
interface TranscriptStepRow {
  label: string;
  status: string;
  time?: string;
  note?: string;
}

const CANONICAL_STEP_LABELS: { key: string; en: string; tr: string }[] = [
  { key: "manifest_loaded", en: "Manifest loaded", tr: "Manifest yüklendi" },
  { key: "evidence_inventory_validated", en: "Evidence inventory validated", tr: "Delil envanteri doğrulandı" },
  { key: "checksum_verified", en: "Checksum verified", tr: "Sağlama toplamı doğrulandı" },
  { key: "policy_rule_checked", en: "Policy rule checked", tr: "Politika kuralı kontrol edildi" },
  { key: "chain_linkage_confirmed", en: "Chain linkage confirmed", tr: "Zincir bağlantısı onaylandı" },
  { key: "verification_complete", en: "Verification complete", tr: "Doğrulama tamamlandı" },
];

function buildTranscriptStepRows(
  system: MockSystemId,
  transcript: TranscriptStep[] | null,
  verificationState: VerificationState | null,
  language: "en" | "tr"
): TranscriptStepRow[] {
  const canonicalLabels = CANONICAL_STEP_LABELS.map((s) => (language === "tr" ? s.tr : s.en));
  if (system === "vehicle" && transcript && transcript.length > 0) {
    return transcript.map((step) => ({
      label: step.check,
      status: step.result,
      time: undefined,
      note: step.note || undefined,
    }));
  }
  if (system === "vehicle" && verificationState) {
    return canonicalLabels.map((label, i) => ({
      label,
      status: i < canonicalLabels.length - 1 ? "OK" : verificationState,
      time: undefined,
      note: undefined,
    }));
  }
  if (system === "vehicle") {
    return canonicalLabels.map((label) => ({
      label,
      status: "pending",
      time: undefined,
      note: language === "tr" ? "Doğrulama çalıştırılmadı." : "Verification not run.",
    }));
  }
  return canonicalLabels.map((label, i) => ({
    label,
    status: i < canonicalLabels.length - 1 ? "OK" : "demo",
    time: undefined,
    note: language === "tr" ? "Demo bağlamı." : "Demo context.",
  }));
}

// Mock evidence for Drone/Robot (Phase 3).
function getMockRecordedRows(eventId: string, language: "en" | "tr"): RecordedEvidenceRow[] {
  const en = [
    { source: "UAV telemetry stream", timestamp: "2025-03-12T14:22:00Z", description: "Mission telemetry capture", referenceId: "rec-" + eventId + "-1", status: "recorded" },
    { source: "Operator handoff log", timestamp: "2025-03-12T14:21:58Z", description: "Handoff event log", referenceId: "rec-" + eventId + "-2", status: "recorded" },
  ];
  const tr = [
    { source: "İHA telemetri akışı", timestamp: "2025-03-12T14:22:00Z", description: "Görev telemetri kaydı", referenceId: "rec-" + eventId + "-1", status: "kayıtlı" },
    { source: "Operatör el değişim günlüğü", timestamp: "2025-03-12T14:21:58Z", description: "El değişim olay günlüğü", referenceId: "rec-" + eventId + "-2", status: "kayıtlı" },
  ];
  return language === "tr" ? tr : en;
}

function getMockDerivedRows(eventId: string, language: "en" | "tr"): DerivedEvidenceRow[] {
  const en = [
    { type: "timeline_synthesis", basisReferences: "rec-" + eventId + "-1, rec-" + eventId + "-2", explanation: "Mission timeline derived from telemetry and handoff log.", confidence: "88%", profileRelevance: "claims_review" },
  ];
  const tr = [
    { type: "zaman çizelgesi sentezi", basisReferences: "rec-" + eventId + "-1, rec-" + eventId + "-2", explanation: "Telemetri ve el değişim günlüğünden türetilen görev zaman çizelgesi.", confidence: "%88", profileRelevance: "claims_review" },
  ];
  return language === "tr" ? tr : en;
}

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
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationJustCompleted, setVerificationJustCompleted] = useState(false);
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

  // When system changes: reset scenario and event; for vehicle sync selectedId from events.
  useEffect(() => {
    setSelectedScenario(null);
    setSelectedEventId(null);
    if (selectedSystem === "vehicle" && events.length) {
      const requestedId = searchParams.get("eventId");
      const match =
        requestedId && events.find((ev) => ev.eventId === requestedId);
      const effectiveId = match ? match.eventId : events[0].eventId;
      setSelectedId(effectiveId);
      setSelectedEventId(effectiveId);
    } else if (selectedSystem !== "vehicle") {
      setSelectedId(null);
    }
  }, [selectedSystem]);

  useEffect(() => {
    if (!verificationJustCompleted) return;
    const t = setTimeout(() => setVerificationJustCompleted(false), 2500);
    return () => clearTimeout(t);
  }, [verificationJustCompleted]);

  // When scenario changes: reset selected event.
  const handleScenarioChange = (scenario: string | null) => {
    setSelectedScenario(scenario);
    setSelectedEventId(null);
    if (selectedSystem === "vehicle") setSelectedId(null);
  };

  // Display events: Vehicle = API mapped to EventCard, Drone/Robot = mock.
  const displayEvents: EventCard[] =
    selectedSystem === "vehicle"
      ? events.map((ev) => ({
          eventId: ev.eventId,
          title: ev.scenarioKey,
          summary: ev.summary,
          timestamp: ev.occurredAt,
          severity: ev.verificationState === "FAIL" ? "high" : ev.verificationState === "PASS" ? "low" : "medium",
          state: ev.verificationState,
          availableOutputs: ["Claims JSON", "Legal PDF", "Transcript"],
          bundleId: ev.bundleId,
          manifestId: ev.manifestId,
        }))
      : selectedSystem === "drone"
      ? MOCK_DRONE_EVENTS
      : MOCK_ROBOT_EVENTS;

  const selectedEventCard =
    displayEvents.find((e) => e.eventId === selectedEventId) ?? null;

  // When user selects an event from cards: set selectedEventId; for Vehicle also set selectedId for API.
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    if (selectedSystem === "vehicle") setSelectedId(eventId);
  };

  const selected = events.find((e) => e.eventId === selectedId) ?? null;
  const isVehicle = selectedSystem === "vehicle";

  async function runVerification() {
    if (!selectedId) return;
    setLoading(true);
    setVerificationError(null);
    setVerificationState(null);
    setTranscript(null);
    setIdentity(null);
    setVerificationRunId(null);
    setTranscriptId(null);

    try {
      const res = await fetch(`${API_BASE}/v1/events/${selectedId}/verify`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVerificationError(json?.message || `HTTP ${res.status}`);
        return;
      }
      setVerificationState(json.verification_state as VerificationState);
      setTranscript(json.transcript_summary ?? null);
      setIdentity({
        event_id: json.event_id,
        bundle_id: json.bundle_id,
        manifest_id: json.manifest_id,
      });
      if (json.verification_run_id) setVerificationRunId(json.verification_run_id);
      if (json.transcript_id) setTranscriptId(json.transcript_id);
      setVerificationJustCompleted(true);
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
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
              {language === "tr" ? "Olay Paketi Doğrulaması" : "Event Package Verification"}
            </h1>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.25rem" }}>
              {language === "tr"
                ? "Seçili olay paketinin sınırlı değerlendirmesidir. Sorumluluk veya kusur tespiti yapmaz."
                : "A bounded assessment of the referenced event package. It does not make liability or guilt determinations."}
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

        {/* CORE UX: Left command spine drives the right-side review area. Selections in the spine (system, scenario, event) update stage, summary, chain, and review context. */}
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
            aria-label={language === "tr" ? "Komut omurgası — seçimler sağ inceleme alanını günceller" : "Command spine — selections update the right-side review area"}
          >
            <div
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
                marginBottom: "0.35rem",
              }}
            >
              {language === "tr" ? "Komut Omurgası" : "Command Spine"}
            </div>
            <div
              style={{
                padding: "0.5rem 0.6rem",
                marginBottom: "0.5rem",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid #1E3A5F",
                borderRadius: 4,
                borderLeft: "3px solid #3B82F6",
              }}
              role="status"
              aria-live="polite"
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#E5E7EB",
                  opacity: 1,
                }}
              >
                {language === "tr"
                  ? "1. Sistem seç → 2. Senaryo seç → 3. Olay seç"
                  : "1. Select system → 2. Select scenario → 3. Select event"}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  opacity: 0.85,
                  marginTop: "0.2rem",
                  color: "#94A3B8",
                }}
              >
                {language === "tr"
                  ? "Sol taraftan sırayla seçin."
                  : "Select in order from the left."}
              </div>
            </div>
            {[
              {
                id: "system",
                step: 1,
                label:
                  language === "tr"
                    ? "Sistem"
                    : "System",
              },
              {
                id: "scenario",
                step: 2,
                label:
                  language === "tr"
                    ? "Senaryo"
                    : "Scenario",
              },
              {
                id: "event",
                step: 3,
                label:
                  language === "tr"
                    ? "Olay"
                    : "Event",
              },
              {
                id: "summary",
                step: null,
                label:
                  language === "tr"
                    ? "Olay Özeti"
                    : "Incident Summary",
              },
              {
                id: "evidence",
                step: null,
                label:
                  language === "tr"
                    ? "Delil Katmanları"
                    : "Evidence Layers",
              },
              {
                id: "transcript",
                step: null,
                label:
                  language === "tr"
                    ? "Doğrulama Kaydı"
                    : "Verification Transcript",
              },
              {
                id: "issuance",
                step: null,
                label:
                  language === "tr"
                    ? "Belge Üretimi"
                    : "Artifact Issuance",
              },
            ].map((section) => {
              const isActive = activeSpineSection === section.id;
              const isStep = section.step != null;
              return (
                <div
                  key={section.id}
                  style={{
                    marginBottom: "0.5rem",
                    borderRadius: 4,
                    border: isActive
                      ? "1px solid #4B5563"
                      : isStep
                      ? "1px solid #1E3A5F"
                      : "1px solid #111827",
                    background: isActive ? "#020617" : isStep ? "rgba(15, 23, 42, 0.35)" : "transparent",
                    borderLeft: isStep ? "2px solid #374151" : undefined,
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
                    <span>
                      {section.step != null ? `${section.step}. ` : ""}
                      {section.label}
                    </span>
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
                      {section.id === "system" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {MOCK_SYSTEMS.map((sys) => (
                            <button
                              key={sys.id}
                              type="button"
                              onClick={() => {
                                setSelectedSystem(sys.id);
                              }}
                              style={{
                                padding: "0.35rem 0.5rem",
                                textAlign: "left",
                                borderRadius: 4,
                                border:
                                  selectedSystem === sys.id
                                    ? "1px solid #E5E7EB"
                                    : "1px solid #374151",
                                background:
                                  selectedSystem === sys.id ? "#111827" : "transparent",
                                color: "#E5E7EB",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              {sys.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {section.id === "scenario" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {(MOCK_SCENARIOS_BY_SYSTEM[selectedSystem] ?? []).map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() =>
                                handleScenarioChange(
                                  selectedScenario === name ? null : name
                                )
                              }
                              style={{
                                padding: "0.35rem 0.5rem",
                                textAlign: "left",
                                borderRadius: 4,
                                border:
                                  selectedScenario === name
                                    ? "1px solid #E5E7EB"
                                    : "1px solid #374151",
                                background:
                                  selectedScenario === name ? "#111827" : "transparent",
                                color: "#E5E7EB",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                      {section.id === "event" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            maxHeight: 320,
                            overflowY: "auto",
                          }}
                        >
                          {displayEvents.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "0.75rem" }}>
                              {language === "tr"
                                ? "Olay bulunamadı."
                                : "No events available."}
                            </p>
                          ) : (
                            displayEvents.map((ev) => (
                              <button
                                key={ev.eventId}
                                type="button"
                                onClick={() => handleSelectEvent(ev.eventId)}
                                style={{
                                  padding: "0.55rem 0.7rem",
                                  textAlign: "left",
                                  borderRadius: 4,
                                  border:
                                    selectedEventId === ev.eventId
                                      ? "1px solid #4B5563"
                                      : "1px solid #111827",
                                  background:
                                    selectedEventId === ev.eventId
                                      ? "#0F172A"
                                      : "#020617",
                                  color: "#E5E7EB",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                  lineHeight: 1.35,
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    marginBottom: "0.3rem",
                                    fontSize: "0.78rem",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {ev.eventId}
                                </div>
                                <div style={{ opacity: 0.92, marginBottom: "0.25rem" }}>{ev.title}</div>
                                <div
                                  style={{
                                    opacity: 0.82,
                                    fontSize: "0.7rem",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {ev.summary.slice(0, 60)}
                                  {ev.summary.length > 60 ? "…" : ""}
                                </div>
                                <div
                                  style={{
                                    marginTop: "0.35rem",
                                    fontSize: "0.65rem",
                                    opacity: 0.65,
                                  }}
                                >
                                  {ev.timestamp} · {ev.severity} · {ev.state}
                                </div>
                                {ev.availableOutputs.length > 0 && (
                                  <div
                                    style={{
                                      marginTop: "0.2rem",
                                      fontSize: "0.65rem",
                                      opacity: 0.6,
                                    }}
                                  >
                                    {language === "tr" ? "Çıktılar:" : "Outputs:"}{" "}
                                    {ev.availableOutputs.join(", ")}
                                  </div>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      {section.id === "summary" && (
                        <div>
                          {selectedEventCard ? (
                            (() => {
                              const sum = getIncidentSummary(
                                selectedSystem,
                                selectedEventCard,
                                verificationState,
                                language
                              );
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  <div>
                                    <span
                                      style={{
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        opacity: 0.7,
                                      }}
                                    >
                                      {language === "tr" ? "Ne oldu" : "What happened"}
                                    </span>
                                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem" }}>
                                      {sum.what}
                                    </p>
                                  </div>
                                  {sum.why && (
                                    <div>
                                      <span
                                        style={{
                                          textTransform: "uppercase",
                                          letterSpacing: "0.05em",
                                          opacity: 0.7,
                                        }}
                                      >
                                        {language === "tr"
                                          ? "Neden incelemede"
                                          : "Why under review"}
                                      </span>
                                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem" }}>
                                        {sum.why}
                                      </p>
                                    </div>
                                  )}
                                  {sum.state && (
                                    <div>
                                      <span
                                        style={{
                                          textTransform: "uppercase",
                                          letterSpacing: "0.05em",
                                          opacity: 0.7,
                                        }}
                                      >
                                        {language === "tr" ? "İnceleme durumu" : "Review state"}
                                      </span>
                                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem" }}>
                                        {sum.state}
                                      </p>
                                    </div>
                                  )}
                                  {sum.next && (
                                    <div>
                                      <span
                                        style={{
                                          textTransform: "uppercase",
                                          letterSpacing: "0.05em",
                                          opacity: 0.7,
                                        }}
                                      >
                                        {language === "tr" ? "Güvenli sonraki adım" : "Safe next step"}
                                      </span>
                                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem" }}>
                                        {sum.next}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <p style={{ margin: 0 }}>
                              {language === "tr"
                                ? "Olay özeti için bir olay seçin."
                                : "Select an event for incident summary."}
                            </p>
                          )}
                        </div>
                      )}
                      {section.id === "evidence" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Kayıtlı delil ve türetilmiş değerlendirme sağdaki Delil Katmanları bloğunda gösterilir."
                            : "Recorded evidence and derived evidence are shown in the Evidence Layers block on the right."}
                        </p>
                      )}
                      {section.id === "transcript" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Doğrulama adımları sağdaki Doğrulama Kaydı bloğunda gösterilir."
                            : "Verification steps are shown in the Verification Transcript block on the right."}
                        </p>
                      )}
                      {section.id === "issuance" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Çıktı profili, biçim ve belge üretimi sağdaki Belge Üretimi panelinde yönetilir."
                            : "Output profile, format, and artifact issuance are managed in the Artifact Issuance panel on the right."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          <main style={{ flex: 1 }}>
            {/* Right-side structure (driven by left spine): 1) Stage header 2) Incident stage 3) Identity chain 4) Incident summary 5) Verification / export. Future: Review Assistant panel can be added after incident summary without breaking layout. */}
            {/* 1) Stage header — driven by spine system/scenario/event */}
            <section style={{ marginBottom: "0.5rem" }} aria-labelledby="stage-heading">
              <h2 id="stage-heading" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.25rem", fontWeight: 600 }}>
                {language === "tr" ? "İnceleme Sahnesi" : "Review Stage"}
                {selectedEventCard && (
                  <span style={{ marginLeft: "0.5rem", fontWeight: "normal", textTransform: "none" }}>
                    — {selectedSystem} · {selectedScenario ?? (language === "tr" ? "Senaryo yok" : "No scenario")} · {selectedEventCard.eventId}
                  </span>
                )}
              </h2>
            </section>

            {/* 2) Incident stage — context from spine selection */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  border: "1px solid #111827",
                  borderRadius: 6,
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  opacity: 0.85,
                }}
              >
                {selectedEventCard ? (
                  selectedSystem === "vehicle" ? (
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Kara yolu / aktör / çarpışma veya yakın kaçış bağlamı. Olay paketi doğrulaması için seçili olayın bütünlüğü ve manifest bağlantısı incelenir."
                        : "Road / actor / collision or near-miss context. Bundle integrity and manifest linkage for the selected event are under verification."}
                    </p>
                  ) : selectedSystem === "drone" ? (
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Görev rotası / anomali / el değişimi bağlamı. Demo: gerçek doğrulama mevcut sürümde devre dışı."
                        : "Mission route / anomaly / handoff context. Demo: live verification disabled in current release."}
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "İş hücresi / yakınlık / güvenlik durdurma bağlamı. Demo: gerçek doğrulama mevcut sürümde devre dışı."
                        : "Workcell / proximity / safety-stop context. Demo: live verification disabled in current release."}
                    </p>
                  )
                ) : (
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Sol omurgadan sistem, senaryo ve olay seçin; sahne burada güncellenecektir."
                      : "Select system, scenario, and event in the left spine; the stage will update here."}
                  </p>
                )}
              </div>
            </section>

            {/* 3) Identity chain — driven by selected event */}
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
                {selectedEventCard ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem 1.25rem",
                    }}
                  >
                    <span>Event ID: {selectedEventCard.eventId}</span>
                    <span>Bundle ID: {isVehicle && identity ? identity.bundle_id : selectedEventCard.bundleId ?? "—"}</span>
                    <span>Manifest ID: {isVehicle && identity ? identity.manifest_id : selectedEventCard.manifestId ?? "—"}</span>
                    {isVehicle && transcriptId && <span>Transcript ID: {transcriptId}</span>}
                    {isVehicle && verificationRunId && <span>Verification Run ID: {verificationRunId}</span>}
                    {!isVehicle && (
                      <span style={{ opacity: 0.7 }}>
                        {language === "tr" ? "Demo bağlamı; canlı zincir yok." : "Demo context; no live chain."}
                      </span>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Olay seçilmedi. Sol omurgada Event bölümünden bir olay seçin."
                      : "No event selected. Select an event in the Event section in the left spine."}
                  </p>
                )}
              </div>
            </section>

            {/* 4) Incident summary — real panel driven by selected event */}
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
                {language === "tr" ? "Olay Özeti" : "Incident Summary"}
              </div>
              <div
                style={{
                  border: "1px solid #1F2937",
                  borderRadius: 6,
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  opacity: 0.9,
                }}
              >
                {selectedEventCard ? (
                  (() => {
                    const sum = getIncidentSummary(
                      selectedSystem,
                      selectedEventCard,
                      verificationState,
                      language
                    );
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", letterSpacing: "0.05em", opacity: 0.7, marginBottom: "0.25rem" }}>
                            {language === "tr" ? "Ne oldu" : "What happened"}
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.45 }}>{sum.what}</p>
                        </div>
                        {sum.why && (
                          <div>
                            <div style={{ fontSize: "0.7rem", letterSpacing: "0.05em", opacity: 0.7, marginBottom: "0.25rem" }}>
                              {language === "tr" ? "Neden incelemede" : "Why this event is under review"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.45 }}>{sum.why}</p>
                          </div>
                        )}
                        {sum.state && (
                          <div>
                            <div style={{ fontSize: "0.7rem", letterSpacing: "0.05em", opacity: 0.7, marginBottom: "0.25rem" }}>
                              {language === "tr" ? "Mevcut inceleme durumu" : "Current review state"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.45 }}>{sum.state}</p>
                          </div>
                        )}
                        {sum.next && (
                          <div>
                            <div style={{ fontSize: "0.7rem", letterSpacing: "0.05em", opacity: 0.7, marginBottom: "0.25rem" }}>
                              {language === "tr" ? "Güvenli sonraki adım" : "Safe next step"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.45 }}>{sum.next}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Olay özeti için sol omurgada Event bölümünden bir olay seçin."
                      : "Select an event in the Event section in the left spine for incident summary."}
                  </p>
                )}
              </div>
            </section>

            {/* 5) Evidence Layers — Recorded + Derived (Phase 3) */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                {language === "tr" ? "Delil Katmanları" : "Evidence Layers"}
              </div>
              {selectedEventCard ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* A. Recorded Evidence */}
                  <div
                    style={{
                      border: "1px solid #1F2937",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        background: "#0F172A",
                        borderBottom: "1px solid #1F2937",
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        opacity: 0.92,
                        fontWeight: 600,
                      }}
                    >
                      {language === "tr" ? "Kaydedilmiş Delil" : "Recorded Evidence"}
                    </div>
                    <div style={{ padding: "0.75rem 1rem" }}>
                      {(() => {
                        const recorded =
                          isVehicle && selected?.recordedEvidence?.length
                            ? toRecordedRows(selected.recordedEvidence)
                            : getMockRecordedRows(selectedEventCard.eventId, language);
                        if (recorded.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>
                              {language === "tr" ? "Kayıtlı delil yok." : "No recorded evidence."}
                            </p>
                          );
                        }
                        return (
                          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem" }}>
                            {recorded.map((r, i) => (
                              <li key={i} style={{ marginBottom: "0.5rem" }}>
                                <strong>{r.source}</strong> — {r.description}
                                <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.2rem" }}>
                                  {language === "tr" ? "Zaman" : "Timestamp"}: {r.timestamp} · {language === "tr" ? "Referans" : "Reference"}: {r.referenceId} · {language === "tr" ? "Durum" : "Status"}: {r.status}
                                </div>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                  {/* B. Derived Evidence */}
                  <div
                    style={{
                      border: "1px solid #1F2937",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        background: "#0F172A",
                        borderBottom: "1px solid #1F2937",
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        opacity: 0.92,
                        fontWeight: 600,
                      }}
                    >
                      {language === "tr" ? "Türetilmiş Değerlendirme" : "Derived Evidence"}
                    </div>
                    <div style={{ padding: "0.75rem 1rem" }}>
                      {(() => {
                        const derived =
                          isVehicle && selected?.derivedEvidence?.length
                            ? toDerivedRows(selected.derivedEvidence)
                            : getMockDerivedRows(selectedEventCard.eventId, language);
                        if (derived.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>
                              {language === "tr" ? "Türetilmiş delil yok." : "No derived evidence."}
                            </p>
                          );
                        }
                        return (
                          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem" }}>
                            {derived.map((d, i) => (
                              <li key={i} style={{ marginBottom: "0.5rem" }}>
                                <strong>{d.type}</strong> — {d.explanation}
                                <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.2rem" }}>
                                  {language === "tr" ? "Temel referanslar" : "Basis references"}: {d.basisReferences} · {language === "tr" ? "Güven" : "Confidence"}: {d.confidence} · {language === "tr" ? "Profil uygunluğu" : "Profile relevance"}: {d.profileRelevance}
                                </div>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
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
                      ? "Delil katmanları için sol omurgadan bir olay seçin."
                      : "Select an event in the left spine to view evidence layers."}
                  </p>
                </div>
              )}
            </section>

            {/* 6) Verification Transcript — step-based block (Phase 3) */}
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
                {language === "tr" ? "Doğrulama Kaydı" : "Verification Transcript"}
              </div>
              <div
                style={{
                  border: "1px solid #111827",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {selectedEventCard ? (
                  (() => {
                    const stepRows = buildTranscriptStepRows(
                      selectedSystem,
                      transcript,
                      verificationState,
                      language
                    );
                    return (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {stepRows.map((row, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "0.5rem 0.85rem",
                          borderBottom: i < stepRows.length - 1 ? "1px solid #111827" : "none",
                          fontSize: "0.8rem",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.6rem 1.25rem",
                          alignItems: "baseline",
                          lineHeight: 1.4,
                        }}
                      >
                        <span style={{ fontWeight: 600, minWidth: "12rem" }}>{row.label}</span>
                        <span style={{ opacity: 0.9 }}>{row.status}</span>
                        {row.time && <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{row.time}</span>}
                        {row.note && <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>{row.note}</span>}
                      </li>
                    ))}
                  </ul>
                    );
                  })()
                ) : (
                  <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", opacity: 0.85 }}>
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Doğrulama kaydı için sol omurgadan bir olay seçin."
                        : "Select an event in the left spine to view the verification transcript."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 6b) Review Assistant — reserved slot (Phase 4). Not active in current release. */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                  marginBottom: "0.35rem",
                }}
              >
                {language === "tr" ? "İnceleme Asistanı" : "Review Assistant"}
              </div>
              <div
                style={{
                  border: "1px solid #1F2937",
                  borderRadius: 6,
                  padding: "0.6rem 0.85rem",
                  fontSize: "0.78rem",
                  opacity: 0.75,
                  background: "#0B1120",
                }}
              >
                <p style={{ margin: 0 }}>
                  {language === "tr"
                    ? "Ayrılmış kontrollü yardımcı katman. Mevcut sürümde aktif değildir."
                    : "Reserved controlled assistance layer. Not active in current release."}
                </p>
              </div>
            </section>

            {/* 7) Verification / export flow — Vehicle: real API; Drone/Robot: demo note. Primary event selection is via spine event cards; dropdown is fallback only. */}
            <section style={{ marginBottom: "1.5rem" }}>
              {selectedEventCard && (
                <div style={{ fontSize: "0.8rem", opacity: 0.85, marginBottom: "0.5rem" }}>
                  {language === "tr" ? "Seçili olay:" : "Selected event:"}{" "}
                  <strong>{selectedEventCard.eventId}</strong> — {selectedEventCard.title}
                </div>
              )}
              <p style={{ fontSize: "0.8rem", opacity: 0.8, marginBottom: "0.5rem" }}>
                {language === "tr"
                  ? "Olay seçimi sol omurgadaki Event bölümündeki kartlardan yapılır. Araç için aşağıdaki açılır menü yedek olarak kullanılabilir."
                  : "Event selection is made via the event cards in the Event section in the left spine. Fallback dropdown below (Vehicle only)."}
              </p>
              {isVehicle && (
                <>
                  <div style={{ fontSize: "0.7rem", opacity: 0.65, marginBottom: "0.25rem" }}>
                    {language === "tr" ? "Yedek: açılır menü ile olay seçimi" : "Fallback: select event by dropdown"}
                  </div>
                  <select
                    value={selectedId ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedId(v);
                      setSelectedEventId(v);
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={runVerification}
                        disabled={!selectedId || loading}
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.5rem 1rem",
                          borderRadius: 4,
                          border: loading ? "1px solid #4B5563" : "1px solid #374151",
                          background: loading ? "#1E3A5F" : "#0B1120",
                          color: "#E5E7EB",
                          cursor: loading ? "wait" : "pointer",
                          opacity: !selectedId ? 0.6 : 1,
                          transition: "background 0.2s ease, border-color 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        {loading && (
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              border: "2px solid #94A3B8",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                        )}
                        {loading
                          ? language === "tr"
                            ? "Doğrulanıyor…"
                            : "Verifying…"
                          : language === "tr"
                          ? "Olayı Doğrula"
                          : "Verify Event Package"}
                      </button>
                      {loading && (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#94A3B8",
                            fontWeight: 500,
                          }}
                        >
                          {language === "tr" ? "Paket ve zincir kontrol ediliyor…" : "Checking bundle and chain…"}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.75rem",
                        opacity: 0.9,
                      }}
                    >
                      {loading && (language === "tr" ? "İşleniyor — sonuç aşağıda güncellenecek." : "Processing — result will update below.")}
                      {!loading && verificationError && (language === "tr" ? "Hata: " : "Error: ")}
                      {!loading && verificationError && <strong style={{ color: "#F87171" }}>{verificationError}</strong>}
                      {!loading && !verificationError && verificationState && (language === "tr" ? "Durum: " : "Status: ")}
                      {!loading && !verificationError && verificationState && <strong>{verificationState}</strong>}
                      {!loading && !verificationError && !verificationState && selectedId && (language === "tr" ? "Doğrulama bekleniyor." : "Verification pending.")}
                    </div>
                  </div>
                </>
              )}
              {!isVehicle && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #374151",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                    opacity: 0.9,
                    background: "#0F172A",
                  }}
                >
                  {language === "tr"
                    ? "Mevcut sürümde yalnızca demo bağlamı. Doğrulama ve dışa aktarım yalnızca Araç sistemi için geçerlidir."
                    : "Demo context only in this release. Verification and export are available for the Vehicle system."}
                </div>
              )}
            </section>

            {isVehicle && (
            <section
              style={{
                border: loading ? "1px solid #1E3A5F" : undefined,
                borderRadius: 6,
                padding: loading ? "0.75rem 1rem" : undefined,
                background: loading ? "rgba(30, 58, 95, 0.15)" : undefined,
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                {language === "tr"
                  ? "Doğrulama Sonucu"
                  : "Verification Result"}
              </h2>
              {loading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0",
                    fontSize: "0.85rem",
                    color: "#94A3B8",
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid #94A3B8",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  {language === "tr"
                    ? "Doğrulama çalışıyor — sonuç burada görünecek."
                    : "Verification in progress — result will appear here."}
                </div>
              )}
              {!loading && !verificationState && !transcript && (
                <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {language === "tr"
                    ? "Henüz bir doğrulama çalıştırılmadı. Bir olay seçin ve doğrulamayı başlatın."
                    : "No verification has been run yet. Select an event and start verification to see its current state and a concise transcript summary."}
                </p>
              )}

              {verificationState && identity && (
                <div
                  style={{
                    border: verificationJustCompleted ? "1px solid #34D399" : "1px solid #1F2937",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    transition: "border-color 0.3s ease",
                    boxShadow: verificationJustCompleted ? "0 0 0 1px rgba(52, 211, 153, 0.2)" : undefined,
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
            )}

            {/* 8) Artifact Issuance — coherent panel (Phase 3). Vehicle: real export; Drone/Robot: demo note. */}
            <section style={{ marginTop: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: "0.5rem",
                }}
              >
                {language === "tr" ? "Belge Üretimi" : "Artifact Issuance"}
              </div>
              {isVehicle && selected ? (
                <div
                  style={{
                    border: "1px solid #1F2937",
                    borderRadius: 6,
                    padding: "1rem",
                    background: "#020617",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "0.5rem 1.5rem",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      fontSize: "0.8rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Çıktı Profili" : "Output Profile"}: </span>
                      <strong>{exportProfile === "claims" ? "Claims" : "Legal"}</strong>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Biçim" : "Format"}: </span>
                      JSON / PDF
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Amaç" : "Purpose"}: </span>
                      {selectedPurpose}
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Üretim Durumu" : "Issuance Status"}: </span>
                      <strong>
                        {exportLoading ? (language === "tr" ? "işleniyor" : "pending") : exportError ? (language === "tr" ? "hata" : "error") : language === "tr" ? "hazır" : "idle"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>Bundle ID: </span>
                      {identity?.bundle_id ?? selected.bundleId ?? (language === "tr" ? "Doğrulama sonrası görünür." : "Visible after verification.")}
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>Manifest ID: </span>
                      {identity?.manifest_id ?? selected.manifestId ?? (language === "tr" ? "Doğrulama sonrası görünür." : "Visible after verification.")}
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Makbuz ID" : "Receipt ID"}: </span>
                      <span style={{ opacity: 0.85 }}>
                        {language === "tr" ? "Henüz üretilmedi." : "Not issued yet."}
                      </span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>{language === "tr" ? "Dışa Aktarım ID" : "Export ID"}: </span>
                      <span style={{ opacity: 0.85 }}>
                        {language === "tr" ? "Dışa aktarma sonrası atanır." : "Assigned after export."}
                      </span>
                    </div>
                  </div>
                  <div style={{ pointerEvents: exportLoading ? "none" : "auto" }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        marginBottom: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ opacity: 0.8 }}>{language === "tr" ? "Çıktı Profili:" : "Output Profile:"}</span>
                      <button
                        type="button"
                        onClick={() => setExportProfile("claims")}
                        disabled={!!exportLoading}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.25rem 0.6rem",
                          borderRadius: 4,
                          border: exportProfile === "claims" ? "1px solid #E5E7EB" : "1px solid #374151",
                          background: exportProfile === "claims" ? "#111827" : "#020617",
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
                          border: exportProfile === "legal" ? "1px solid #E5E7EB" : "1px solid #374151",
                          background: exportProfile === "legal" ? "#111827" : "#020617",
                          color: "#E5E7EB",
                          cursor: exportLoading ? "not-allowed" : "pointer",
                          opacity: exportLoading ? 0.6 : 1,
                        }}
                      >
                        Legal
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
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
                          cursor: !selectedId || exportLoading ? "not-allowed" : "pointer",
                          opacity: !selectedId || exportLoading ? 0.6 : 1,
                        }}
                      >
                        {exportLoading === "json"
                          ? language === "tr" ? "Dışa aktarılıyor…" : "Exporting…"
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
                          cursor: !selectedId || exportLoading ? "not-allowed" : "pointer",
                          opacity: !selectedId || exportLoading ? 0.6 : 1,
                        }}
                      >
                        {exportLoading === "pdf"
                          ? language === "tr" ? "Dışa aktarılıyor…" : "Exporting…"
                          : "Export PDF"}
                      </button>
                    </div>
                  </div>
                  {exportError && (
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "#fca5a5" }}>
                      {exportError}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid #111827",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    fontSize: "0.8rem",
                    opacity: 0.85,
                  }}
                >
                  {!isVehicle ? (
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Mevcut sürümde yalnızca demo bağlamı. Belge üretimi yalnızca Araç sistemi için geçerlidir."
                        : "Demo context only in this release. Artifact issuance is available for the Vehicle system."}
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Belge üretimi için sol omurgadan bir araç olayı seçin."
                        : "Select a vehicle event in the left spine for artifact issuance."}
                    </p>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
      <UstaPDemoTrigger language={language} defaultScenario="togg" />
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

