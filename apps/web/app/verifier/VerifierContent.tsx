"use client";

import { useEffect, useState } from "react";
import type {
  CanonicalEvent,
  CreateExportRequest,
  RecordedEvidenceItem,
  DerivedEvidenceItem,
  ExportArtifactResponse,
  ExportFormat,
  VerificationState,
  VerificationRunResponse,
  VerificationTranscriptEntry,
} from "contracts";
import { getCanonicalCases, getCanonicalCaseByEventId, evaluateGoldenAcceptance } from "../../lib/canonical-spine";
import type { ArtifactProfileCode } from "../../lib/artifact-profiles";
import {
  getArtifactProfile,
  getArtifactProfilesForDomain,
} from "../../lib/artifact-profiles";
import { UstaPDemoTrigger } from "./UstaPDemoTrigger";

const DEFAULT_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;

const UI = {
  bg: "#020617",
  panel: "#0B1120",
  panelRaised: "#0F172A",
  panelSoft: "rgba(15, 23, 42, 0.78)",
  panelCard: "#0D1526",
  surface: "#111827",
  border: "#1E293B",
  borderMuted: "#111827",
  borderStrong: "#334155",
  borderSubtle: "rgba(148, 163, 184, 0.1)",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textSoft: "#CBD5E1",
  textDim: "#64748B",
  accent: "#C2410C",
  accentSoft: "rgba(194, 65, 12, 0.12)",
  accentBorder: "#9A3412",
  accentGlow: "rgba(194, 65, 12, 0.06)",
  success: "#34D399",
  successSoft: "rgba(52, 211, 153, 0.10)",
  successBorder: "rgba(52, 211, 153, 0.28)",
  warning: "#FBBF24",
  warningSoft: "rgba(251, 191, 36, 0.10)",
  warningBorder: "rgba(251, 191, 36, 0.28)",
  error: "#F87171",
  errorSoft: "rgba(248, 113, 113, 0.10)",
  errorBorder: "rgba(248, 113, 113, 0.28)",
  radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  sectionGap: "1.75rem",
  panelPad: "1.15rem 1.35rem",
} as const;

type TranscriptStep = VerificationTranscriptEntry;

interface IssuanceRecord {
  format: ExportFormat;
  meta: ExportArtifactResponse;
}

// Phase 1 mock data scaffolding for future workstation wiring.
type MockSystemId = "vehicle" | "drone" | "robot";

const MOCK_SYSTEMS: { id: MockSystemId; label: string }[] = [
  { id: "vehicle", label: "Vehicle" },
  { id: "drone", label: "Drone" },
  { id: "robot", label: "Robot" },
];

/** Scenario options derived from canonical case registry. */
function getScenariosBySystem(system: MockSystemId): string[] {
  const cases = getCanonicalCases(system);
  const set = new Set(cases.map((c) => c.scenarioFrame));
  return Array.from(set);
}

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

/** Map canonical case to EventCard for spine display. */
function caseToEventCard(c: { eventId: string; scenarioFrame: string; summary: string; occurredAt: string; verificationState: string; bundleId: string; manifestId: string; artifactIssuance: { available: boolean } }): EventCard {
  const severity = c.verificationState === "FAIL" ? "high" : c.verificationState === "PASS" ? "low" : "medium";
  const outputs = c.artifactIssuance.available ? ["Claims artifact", "Legal artifact", "Trace"] : ["Demo context"];
  return {
    eventId: c.eventId,
    title: c.scenarioFrame,
    summary: c.summary,
    timestamp: c.occurredAt,
    severity,
    state: c.verificationState,
    availableOutputs: outputs,
    bundleId: c.bundleId,
    manifestId: c.manifestId,
  };
}

// Case-density: optional per-case review intent and next step (from canonical-spine).
type CaseSummaryOverride = {
  reviewWhyEn?: string;
  reviewWhyTr?: string;
  nextStepEn?: string;
  nextStepTr?: string;
} | null;

// Incident summary content: what, why, state, next (case-driven when selectedCase provides override).
function getIncidentSummary(
  system: MockSystemId,
  eventCard: EventCard | null,
  verificationState: VerificationState | null,
  language: "en" | "tr",
  selectedCase?: CaseSummaryOverride
): { what: string; why: string; state: string; next: string } {
  if (!eventCard) {
    return {
      what: language === "tr" ? "Henüz olay seçilmedi." : "No event selected.",
      why: "",
      state: "",
      next: language === "tr" ? "Bir olay seçin." : "Select an event.",
    };
  }
  const whyFromCase = language === "tr" ? selectedCase?.reviewWhyTr : selectedCase?.reviewWhyEn;
  const nextFromCase = language === "tr" ? selectedCase?.nextStepTr : selectedCase?.nextStepEn;

  if (system === "vehicle" && verificationState) {
    return {
      what: eventCard.summary,
      why:
        whyFromCase ??
        (language === "tr"
          ? "Paket bütünlüğü ve manifest bağlantısı doğrulaması için incelemeye alındı."
          : "Under review for bundle integrity and manifest linkage verification."),
      state: verificationState,
      next:
        nextFromCase ??
        (verificationState === "UNVERIFIED" || verificationState === "UNKNOWN"
          ? language === "tr"
            ? "Doğrulamayı çalıştırın veya kontrollü artifact başlatın."
            : "Run verification or start controlled artifact."
          : language === "tr"
          ? "İz özetini inceleyin veya artifact issuance başlatın."
          : "Review trace summary or start artifact issuance."),
    };
  }
  if (system === "vehicle") {
    return {
      what: eventCard.summary,
      why:
        whyFromCase ??
        (language === "tr"
          ? "Paket doğrulaması için incelemeye alındı."
          : "Under review for event package verification."),
      state: eventCard.state,
      next:
        nextFromCase ??
        (language === "tr"
          ? "Olayı doğrula ile paket doğrulamasını başlatın."
          : "Start package verification with Verify Event Package."),
    };
  }
  // Drone / Robot: case-driven why/next when present, else system fallback.
  const droneWhy =
    whyFromCase ??
    (language === "tr"
      ? "Görev anomalisi ve operatör el değişimi kayıtlarının doğrulanması için."
      : "Under review for mission anomaly and operator handoff record verification.");
  const robotWhy =
    whyFromCase ??
    (language === "tr"
      ? "Güvenlik durdurma ve uyumluluk kayıtlarının incelenmesi için."
      : "Under review for safety stop and compliance record assessment.");
  const demoNext =
    nextFromCase ??
    (language === "tr"
      ? "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir."
      : "Demo context only in current release.");
  const mock: Record<MockSystemId, { what: string; why: string; state: string; next: string }> = {
    drone: { what: eventCard.summary, why: droneWhy, state: eventCard.state, next: demoNext },
    robot: { what: eventCard.summary, why: robotWhy, state: eventCard.state, next: demoNext },
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

// Phase 3: Verification Trace step row (procedural).
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

function getVisibleUnknownItems(
  caseId: string | undefined,
  items: string[] | undefined,
  language: "en" | "tr"
): string[] {
  if (language === "tr") return items ?? [];

  if (caseId === "golden-robot-public") {
    return [
      "Whether context loss in the public encounter crossed the escalation threshold for supervisor review.",
      "Whether the operator handoff captured enough context to support a bounded follow-up artifact.",
    ];
  }

  if (caseId === "golden-robot-safety") {
    return [
      "Whether the proximity-trigger threshold matched the configured protective-stop policy at the moment of interruption.",
      "Whether restart authority should remain withheld until a human review closes the stop-cycle uncertainty.",
    ];
  }

  return items ?? [];
}

function getReviewTone(state: string | null) {
  if (state === "PASS") {
    return {
      borderColor: UI.success,
      background: UI.successSoft,
      color: UI.success,
    };
  }

  if (state === "FAIL") {
    return {
      borderColor: UI.error,
      background: UI.errorSoft,
      color: UI.error,
    };
  }

  if (state === "UNKNOWN") {
    return {
      borderColor: UI.warning,
      background: UI.warningSoft,
      color: UI.warning,
    };
  }

  return {
    borderColor: UI.borderStrong,
    background: "rgba(148, 163, 184, 0.08)",
    color: UI.textSoft,
  };
}

export function VerifierContent({ initialEventId }: { initialEventId?: string }) {
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
  const [lastIssuedArtifact, setLastIssuedArtifact] = useState<IssuanceRecord | null>(null);
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
      const vehicleCases = getCanonicalCases("vehicle");
      const requestedId = initialEventId ?? null;
      const fromCanonical =
        requestedId && vehicleCases.some((c) => c.eventId === requestedId)
          ? requestedId
          : vehicleCases[0]?.eventId ?? null;
      const match =
        requestedId && items.find((ev) => ev.eventId === requestedId);
      const effectiveId =
        match ? match.eventId : fromCanonical ?? items[0]?.eventId ?? null;
      if (effectiveId) {
        setSelectedId(effectiveId);
        setSelectedEventId(effectiveId);
      }
    }
    load();
  }, [initialEventId]);

  // When system changes: reset scenario and event; for vehicle use canonical spine first.
  useEffect(() => {
    setSelectedScenario(null);
    setSelectedEventId(null);
    if (selectedSystem === "vehicle") {
      const cases = getCanonicalCases("vehicle");
      const requestedId = initialEventId ?? null;
      const inSpine =
        requestedId && cases.some((c) => c.eventId === requestedId);
      const effectiveId = inSpine ? requestedId! : cases[0]?.eventId ?? null;
      if (effectiveId) {
        setSelectedId(effectiveId);
        setSelectedEventId(effectiveId);
      } else setSelectedId(null);
    } else {
      const cases = getCanonicalCases(selectedSystem);
      const first = cases[0]?.eventId ?? null;
      if (first) setSelectedEventId(first);
      setSelectedId(null);
    }
  }, [selectedSystem, initialEventId]);

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

  // Canonical spine: one registry for all verticals.
  const displayEvents: EventCard[] = getCanonicalCases(selectedSystem).map(caseToEventCard);

  const selectedEventCard =
    displayEvents.find((e) => e.eventId === selectedEventId) ?? null;

  const selectedCase = selectedEventId ? getCanonicalCaseByEventId(selectedEventId) : null;

  // When user selects an event from cards: set selectedEventId; for Vehicle also set selectedId for API.
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    if (selectedSystem === "vehicle") setSelectedId(eventId);
  };

  const selected = events.find((e) => e.eventId === selectedId) ?? null;
  const isVehicle = selectedSystem === "vehicle";
  const bundleAnchorId =
    isVehicle
      ? identity?.bundle_id ?? selected?.bundleId ?? selectedEventCard?.bundleId ?? "—"
      : selectedEventCard?.bundleId ?? "—";
  const manifestAnchorId =
    isVehicle
      ? identity?.manifest_id ?? selected?.manifestId ?? selectedEventCard?.manifestId ?? "—"
      : selectedEventCard?.manifestId ?? "—";
  const visibleRecorded =
    selectedCase?.recordedEvidence?.length
      ? toRecordedRows(selectedCase.recordedEvidence).map((row, index) => {
          if (selectedCase.caseId === "golden-drone-linkloss" && index === 0) {
            return {
              ...row,
              source: "Telemetry window",
              description:
                "BVLOS segment telemetry window preserved on the canonical bundle; the recorded layer remains raw and separate from any recovery reading.",
            };
          }
          if (selectedCase.caseId === "golden-drone-mission" && index === 0) {
            return {
              ...row,
              source: "Waypoint transit telemetry",
              description:
                "Altitude-band and track telemetry captured as a raw mission object; significance stays in derived review, not in this recorded layer.",
            };
          }
          return row;
        })
      : [];
  const visibleUnknownItems = getVisibleUnknownItems(
    selectedCase?.caseId,
    selectedCase?.unknownDisputed,
    language
  );
  const traceStepRows =
    isVehicle && transcript?.length
      ? transcript.map((s) => ({
          label: s.check,
          status: s.result,
          time: undefined as string | undefined,
          note: s.note || undefined,
        }))
      : selectedCase?.verificationTrace?.length
      ? selectedCase.verificationTrace.map((s) => ({
          label: s.check,
          status: s.result,
          time: undefined as string | undefined,
          note:
            s.result === "demo" && !isVehicle
              ? language === "tr"
                ? `${s.note} Canlı receipt/export hattı bu dikey için bağlı değildir.`
                : `${s.note} No live receipt/export path is connected for this vertical.`
              : s.note || undefined,
        }))
      : buildTranscriptStepRows(selectedSystem, transcript, verificationState, language);
  const hasConnectedIssuanceProfile =
    !!selectedCase?.artifactProfiles?.some((ap) => ap.enabled && ap.apiBacked);
  const selectedProfileMeta = getArtifactProfile(exportProfile);
  const selectedProfileLabel = selectedProfileMeta
    ? language === "tr"
      ? selectedProfileMeta.labelTr
      : selectedProfileMeta.labelEn
    : exportProfile;
  const visibleReviewState = verificationState ?? selectedEventCard?.state ?? null;
  const reviewTone = getReviewTone(visibleReviewState);

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
      const json = (await res.json().catch(() => ({}))) as
        | Partial<VerificationRunResponse>
        | { error?: string; message?: string };
      if (!res.ok) {
        const errorPayload = json as { error?: string; message?: string };
        setVerificationError(errorPayload.error || errorPayload.message || `HTTP ${res.status}`);
        return;
      }
      const successPayload = json as Partial<VerificationRunResponse>;
      setVerificationState(successPayload.verification_state as VerificationState);
      setTranscript(successPayload.transcript_summary ?? null);
      setIdentity({
        event_id: successPayload.event_id ?? selectedId,
        bundle_id: successPayload.bundle_id ?? "—",
        manifest_id: successPayload.manifest_id ?? "—",
      });
      if (successPayload.verification_run_id) setVerificationRunId(successPayload.verification_run_id);
      if (successPayload.transcript_id) setTranscriptId(successPayload.transcript_id);
      setVerificationJustCompleted(true);
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function runExport(format: ExportFormat) {
    if (!selectedId || exportLoading) return;
    setSelectedFormat(format);
    setExportLoading(format);
    setExportError(null);
    setIssuanceState("pending");
    setLastIssuedArtifact(null);

    try {
      const requestBody: CreateExportRequest = {
        profile: exportProfile,
        format,
        purpose: selectedPurpose,
      };
      const res = await fetch(`${API_BASE}/v1/events/${selectedId}/exports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const json = (await res.json().catch(() => ({}))) as
        | Partial<ExportArtifactResponse>
        | { error?: string };
      const errorPayload = json as { error?: string };
      const successPayload = json as Partial<ExportArtifactResponse>;

      if (
        !res.ok ||
        !successPayload.download_url ||
        !successPayload.export_id ||
        !successPayload.receipt_id ||
        !successPayload.bundle_id ||
        !successPayload.manifest_id
      ) {
        setIssuanceState("error");
        setExportError(errorPayload.error ?? `Export failed (HTTP ${res.status})`);
        return;
      }

      const meta = successPayload as ExportArtifactResponse;
      setIssuanceState("success");
      setLastIssuedArtifact({ format, meta });
      setIdentity({
        event_id: meta.event_id,
        bundle_id: meta.bundle_id,
        manifest_id: meta.manifest_id,
      });

      if (typeof window !== "undefined") {
        const href = `${API_BASE}${meta.download_url}`;
        window.open(href, "_blank");
      }
    } catch (e) {
      setIssuanceState("error");
      setExportError("Export failed");
    } finally {
      setExportLoading(null);
    }
  }

  async function runExportJson() {
    await runExport("json");
  }

  async function runExportPdf() {
    await runExport("pdf");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: UI.bg,
        color: UI.text,
        padding: "1.5rem 2.5rem 3rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* ── Page header ── */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
            padding: "1.25rem 1.5rem",
            borderRadius: UI.radius.lg,
            border: `1px solid ${UI.border}`,
            background: `linear-gradient(135deg, ${UI.panelRaised} 0%, ${UI.panel} 100%)`,
            boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 24px 48px rgba(2, 6, 23, 0.35)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: UI.accent,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textMuted,
                  fontWeight: 600,
                }}
              >
                QARAQUTU Verifier
              </span>
            </div>
            <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              {language === "tr" ? "Olay Paketi Doğrulaması" : "Event Package Verification"}
            </h1>
            <p style={{ fontSize: "0.82rem", color: UI.textDim, margin: "0.4rem 0 0", lineHeight: 1.5, maxWidth: 660 }}>
              {language === "tr"
                ? "Sınırlı değerlendirme. Sorumluluk veya kusur tespiti yapmaz."
                : "Bounded assessment. Does not make liability or guilt determinations."}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              fontSize: "0.72rem",
              padding: "0.2rem",
              borderRadius: UI.radius.pill,
              border: `1px solid ${UI.borderMuted}`,
              background: UI.bg,
              flexShrink: 0,
            }}
          >
            {(["en", "tr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                style={{
                  padding: "0.3rem 0.75rem",
                  minWidth: 44,
                  borderRadius: UI.radius.pill,
                  border: language === l ? `1px solid ${UI.textSoft}` : `1px solid transparent`,
                  background: language === l ? UI.surface : "transparent",
                  color: language === l ? UI.text : UI.textMuted,
                  cursor: "pointer",
                  fontWeight: language === l ? 700 : 500,
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s ease",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ── Layout: sidebar + main ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
              padding: "1rem 1rem 1.25rem",
              border: `1px solid ${UI.border}`,
              borderRadius: UI.radius.lg,
              background: `linear-gradient(180deg, ${UI.panelRaised} 0%, ${UI.panel} 100%)`,
              boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 16px 40px rgba(2, 6, 23, 0.3)",
            }}
            aria-label={language === "tr" ? "Komut omurgası — seçimler sağ inceleme alanını günceller" : "Command spine — selections update the right-side review area"}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: UI.textDim,
                marginBottom: "0.65rem",
                fontWeight: 600,
                paddingBottom: "0.5rem",
                borderBottom: `1px solid ${UI.borderMuted}`,
              }}
            >
              {language === "tr" ? "Komut Omurgası" : "Command Spine"}
            </div>
            <div
              style={{
                padding: "0.65rem 0.75rem",
                marginBottom: "0.85rem",
                background: UI.accentSoft,
                border: `1px solid rgba(154, 52, 18, 0.35)`,
                borderRadius: UI.radius.sm,
              }}
              role="status"
              aria-live="polite"
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: UI.text,
                }}
              >
                {language === "tr"
                  ? "1. Sistem → 2. Senaryo → 3. Olay"
                  : "1. System → 2. Scenario → 3. Event"}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  marginTop: "0.3rem",
                  color: UI.textMuted,
                  lineHeight: 1.45,
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
                label: language === "tr" ? "Sistem" : "System",
                group: "select" as const,
              },
              {
                id: "scenario",
                step: 2,
                label: language === "tr" ? "Senaryo" : "Scenario",
                group: "select" as const,
              },
              {
                id: "event",
                step: 3,
                label: language === "tr" ? "Olay" : "Event",
                group: "select" as const,
              },
              {
                id: "summary",
                step: null,
                label: language === "tr" ? "Olay Özeti" : "Incident Summary",
                group: "review" as const,
              },
              {
                id: "evidence",
                step: null,
                label: language === "tr" ? "Delil Katmanları" : "Evidence Layers",
                group: "review" as const,
              },
              {
                id: "unknownDisputed",
                step: null,
                label: language === "tr" ? "Bilinmeyen / Tartışmalı" : "Unknown / Disputed",
                group: "review" as const,
              },
              {
                id: "transcript",
                step: null,
                label: language === "tr" ? "Doğrulama İzi" : "Verification Trace",
                group: "review" as const,
              },
              {
                id: "issuance",
                step: null,
                label: language === "tr" ? "Belge Üretimi" : "Artifact Issuance",
                group: "review" as const,
              },
              {
                id: "whyInevitable",
                step: null,
                label: language === "tr" ? "Neden QARAQUTU kaçınılmaz" : "Why QARAQUTU is inevitable",
                group: "review" as const,
              },
            ].map((section, idx, arr) => {
              const isActive = activeSpineSection === section.id;
              const isStep = section.step != null;
              const prevGroup = idx > 0 ? arr[idx - 1].group : null;
              const showDivider = section.group === "review" && prevGroup === "select";
              return (
                <div key={section.id}>
                  {showDivider && (
                    <div style={{ height: 1, background: UI.borderMuted, margin: "0.5rem 0 0.65rem" }} />
                  )}
                  <div
                    style={{
                      marginBottom: "0.3rem",
                      borderRadius: UI.radius.sm,
                      border: isActive
                        ? `1px solid ${UI.borderStrong}`
                        : `1px solid ${UI.borderMuted}`,
                      background: isActive ? UI.bg : "transparent",
                      borderLeft: isStep ? `2px solid ${isActive ? UI.accent : UI.borderStrong}` : undefined,
                      transition: "all 0.12s ease",
                    }}
                  >
                  <button
                    type="button"
                    onClick={() => setActiveSpineSection(section.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.5rem 0.65rem",
                      background: "transparent",
                      border: "none",
                      color: isActive ? UI.text : UI.textSoft,
                      fontSize: isStep ? "0.78rem" : "0.74rem",
                      fontWeight: isActive ? 600 : isStep ? 500 : 400,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "color 0.12s ease",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {section.step != null && (
                        <span style={{ color: UI.textDim, marginRight: "0.35rem", fontSize: "0.68rem", fontWeight: 700 }}>
                          {section.step}.
                        </span>
                      )}
                      {section.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: isActive ? UI.textMuted : UI.textDim,
                        fontWeight: 700,
                      }}
                    >
                      {isActive ? "−" : "+"}
                    </span>
                  </button>
                  {isActive && (
                    <div
                      style={{
                        padding: "0.5rem 0.65rem 0.65rem",
                        borderTop: `1px solid ${UI.borderMuted}`,
                        fontSize: "0.74rem",
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
                          {(getScenariosBySystem(selectedSystem)).map((name) => (
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
                            gap: "0.6rem",
                            maxHeight: 440,
                            overflowY: "auto",
                            paddingRight: "2px",
                          }}
                        >
                          {displayEvents.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "0.75rem" }}>
                              {language === "tr"
                                ? "Olay bulunamadı."
                                : "No events available."}
                            </p>
                          ) : (
                            displayEvents.map((ev) => {
                              const isSelected = selectedEventId === ev.eventId;
                              const stateColor = ev.state === "PASS" ? UI.success : ev.state === "FAIL" ? UI.error : ev.state === "UNKNOWN" ? UI.warning : UI.textDim;
                              return (
                              <button
                                key={ev.eventId}
                                type="button"
                                onClick={() => handleSelectEvent(ev.eventId)}
                                style={{
                                  padding: "0.6rem 0.7rem",
                                  textAlign: "left",
                                  borderRadius: UI.radius.sm,
                                  border: isSelected
                                    ? `1px solid ${UI.accentBorder}`
                                    : `1px solid ${UI.borderMuted}`,
                                  borderLeft: isSelected
                                    ? `3px solid ${UI.accent}`
                                    : `3px solid transparent`,
                                  background: isSelected
                                    ? UI.panelCard
                                    : UI.bg,
                                  color: UI.text,
                                  cursor: "pointer",
                                  fontSize: "0.72rem",
                                  lineHeight: 1.4,
                                  transition: "all 0.12s ease",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "0.71rem",
                                      fontFamily: "monospace",
                                      color: isSelected ? UI.text : UI.textSoft,
                                      letterSpacing: "0.01em",
                                    }}
                                  >
                                    {ev.eventId}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "0.58rem",
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: UI.radius.pill,
                                      background: `${stateColor}18`,
                                      color: stateColor,
                                      fontWeight: 700,
                                      letterSpacing: "0.04em",
                                      textTransform: "uppercase",
                                      border: `1px solid ${stateColor}30`,
                                    }}
                                  >
                                    {ev.state}
                                  </span>
                                </div>
                                <div style={{ color: isSelected ? UI.textSoft : UI.textMuted, fontSize: "0.7rem", marginBottom: "0.15rem" }}>
                                  {ev.title}
                                </div>
                                <div
                                  style={{
                                    color: UI.textDim,
                                    fontSize: "0.66rem",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {ev.summary.slice(0, 55)}
                                  {ev.summary.length > 55 ? "…" : ""}
                                </div>
                              </button>
                              );
                            })
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
                      {section.id === "unknownDisputed" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Bilinmeyen veya taraflar arasında tartışmalı noktalar sağdaki panelde listelenir."
                            : "Unknown or disputed items between parties are listed in the panel on the right."}
                        </p>
                      )}
                      {section.id === "transcript" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "İnceleme adımları ve sonuçları sağdaki Doğrulama İzi bloğunda gösterilir; nihai hüküm değildir."
                            : "Examination steps and outcomes are shown in the Verification Trace block on the right; not a final determination."}
                        </p>
                      )}
                      {section.id === "issuance" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Çıktı profili, biçim ve belge üretimi sağdaki Belge Üretimi panelinde yönetilir."
                            : "Output profile, format, and artifact issuance are managed in the Artifact Issuance panel on the right."}
                        </p>
                      )}
                      {section.id === "whyInevitable" && (
                        <p style={{ margin: 0 }}>
                          {language === "tr"
                            ? "Neden QARAQUTU kaçınılmaz: sağdaki blokta bu olay bağlamında açıklanır."
                            : "Why QARAQUTU is inevitable: explained in context of this case in the block on the right."}
                        </p>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </aside>

          <main style={{ minWidth: 0 }}>
            {/* 0) Demo scenario notice */}
            {selectedCase && (
              <section style={{ marginBottom: UI.sectionGap }} aria-label={language === "tr" ? "Demo senaryosu bildirimi" : "Demo scenario notice"}>
                <div
                  style={{
                    borderRadius: UI.radius.sm,
                    padding: "0.65rem 0.9rem",
                    fontSize: "0.72rem",
                    background: UI.panelRaised,
                    border: `1px solid ${UI.borderMuted}`,
                    color: UI.textMuted,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.3rem", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.62rem", color: UI.textDim }}>
                    {language === "tr" ? "Demo senaryosu" : "Demo scenario"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem 0.75rem", lineHeight: 1.55, color: UI.textMuted }}>
                    <span>{language === "tr" ? "Demo senaryo" : "Demo scenario"}</span>
                    <span>·</span>
                    <span>{language === "tr" ? "Kamuya açık olay sınıfı" : "Public incident class"}</span>
                    <span>·</span>
                    <span>{language === "tr" ? "Anonimize akış" : "Anonymized flow"}</span>
                    <span>·</span>
                    <span>{language === "tr" ? "Nihai hüküm değildir" : "Not a final determination"}</span>
                  </div>
                  {(selectedCase.demoNoticeTr || selectedCase.demoNoticeEn) && (
                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.68rem", color: UI.textDim }}>
                      {language === "tr" ? selectedCase.demoNoticeTr : selectedCase.demoNoticeEn}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* 1) Review Stage header */}
            <section style={{ marginBottom: UI.sectionGap }} aria-labelledby="stage-heading">
              <div
                style={{
                  border: `1px solid ${UI.border}`,
                  borderRadius: UI.radius.lg,
                  padding: "1.25rem 1.5rem",
                  background: `linear-gradient(135deg, ${UI.panelRaised} 0%, ${UI.panel} 100%)`,
                  borderLeft: `4px solid ${reviewTone.borderColor}`,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px rgba(2, 6, 23, 0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      id="stage-heading"
                      style={{
                        fontSize: "0.62rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: UI.textDim,
                        fontWeight: 700,
                        marginBottom: "0.4rem",
                      }}
                    >
                      {language === "tr" ? "İnceleme Sahnesi" : "Review Stage"}
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                      {selectedCase?.scenarioFrame ??
                        selectedScenario ??
                        (language === "tr" ? "Senaryo seçilmedi" : "No scenario selected")}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.3rem 0.65rem",
                      borderRadius: UI.radius.pill,
                      border: `1px solid ${reviewTone.borderColor}`,
                      background: reviewTone.background,
                      color: reviewTone.color,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {visibleReviewState ?? "—"}
                  </div>
                </div>
                {selectedEventCard && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem",
                      marginTop: "0.85rem",
                      paddingTop: "0.75rem",
                      borderTop: `1px solid ${UI.borderMuted}`,
                    }}
                  >
                    {[
                      selectedSystem,
                      `Event: ${selectedEventCard.eventId}`,
                      ...(selectedCase?.incidentClass ? [selectedCase.incidentClass] : []),
                    ].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: UI.radius.pill,
                          background: UI.borderSubtle,
                          border: `1px solid ${UI.borderMuted}`,
                          color: UI.textMuted,
                          fontSize: "0.66rem",
                          fontWeight: 500,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 2) Incident stage */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: `1px solid ${UI.borderMuted}`,
                  borderRadius: UI.radius.md,
                  padding: "1rem 1.25rem",
                  fontSize: "0.8rem",
                  background: UI.panelCard,
                }}
              >
                {selectedCase ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: UI.textDim, fontWeight: 600 }}>
                          {language === "tr" ? "Olay Sınıfı" : "Incident Class"}
                        </span>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, marginTop: "0.15rem" }}>{selectedCase.incidentClass}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: UI.textDim, fontWeight: 600 }}>
                          {language === "tr" ? "Senaryo Çerçevesi" : "Scenario Frame"}
                        </span>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, marginTop: "0.15rem" }}>{selectedCase.scenarioFrame}</div>
                      </div>
                    </div>
                    <p style={{ margin: "0.45rem 0 0", fontSize: "0.76rem", color: UI.textMuted, lineHeight: 1.5 }}>
                      {selectedSystem === "vehicle"
                        ? language === "tr"
                          ? "Olay paketi doğrulaması için seçili olayın bütünlüğü ve manifest bağlantısı incelenir."
                          : "Bundle integrity and manifest linkage for the selected event are under verification."
                        : selectedSystem === "drone"
                        ? language === "tr"
                          ? "Görev rotası / anomali / el değişimi bağlamı. Demo: gerçek doğrulama mevcut sürümde devre dışı."
                          : "Mission route / anomaly / handoff context. Demo: live verification disabled in current release."
                        : language === "tr"
                        ? "İş hücresi / yakınlık / güvenlik durdurma bağlamı. Demo: gerçek doğrulama mevcut sürümde devre dışı."
                        : "Workcell / proximity / safety-stop context. Demo: live verification disabled in current release."}
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: UI.textMuted }}>
                    {language === "tr"
                      ? "Sol omurgadan sistem, senaryo ve olay seçin."
                      : "Select system, scenario, and event in the left spine."}
                  </p>
                )}
              </div>
            </section>

            {/* 3) Identity chain */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                }}
              >
                {language === "tr" ? "Kimlik Zinciri" : "Identity Chain"}
              </div>
              <div
                style={{
                  border: `1px solid ${UI.borderMuted}`,
                  borderRadius: UI.radius.sm,
                  padding: "0.75rem 1rem",
                  fontSize: "0.74rem",
                  background: UI.panelCard,
                  fontFamily: "monospace",
                }}
              >
                {selectedEventCard ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "0.5rem 1.25rem",
                    }}
                  >
                    {[
                      { label: "Event ID", value: selectedEventCard.eventId },
                      { label: "Bundle ID", value: isVehicle && identity ? identity.bundle_id : selectedEventCard.bundleId ?? "—" },
                      { label: "Manifest ID", value: isVehicle && identity ? identity.manifest_id : selectedEventCard.manifestId ?? "—" },
                      ...(isVehicle && transcriptId ? [{ label: "Trace ID", value: transcriptId }] : []),
                      ...(isVehicle && verificationRunId ? [{ label: "Run ID", value: verificationRunId }] : []),
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: UI.textDim, fontWeight: 600, fontFamily: "inherit", marginBottom: "0.12rem" }}>
                          {item.label}
                        </div>
                        <div style={{ color: UI.textSoft, fontSize: "0.72rem", wordBreak: "break-all" }}>{item.value}</div>
                      </div>
                    ))}
                    {!isVehicle && (
                      <div style={{ color: UI.textDim, fontFamily: "sans-serif", fontSize: "0.72rem" }}>
                        {language === "tr" ? "Demo bağlamı; canlı zincir yok." : "Demo context; no live chain."}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: UI.textMuted, fontFamily: "sans-serif" }}>
                    {language === "tr"
                      ? "Olay seçilmedi."
                      : "No event selected."}
                  </p>
                )}
              </div>
            </section>

            {/* 4) Incident Summary — primary reference panel */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                }}
              >
                {language === "tr" ? "Olay Özeti" : "Incident Summary"}
              </div>
              <div
                style={{
                  border: `1px solid ${UI.border}`,
                  borderRadius: UI.radius.md,
                  padding: "1.15rem 1.35rem",
                  background: `linear-gradient(180deg, ${UI.panelRaised} 0%, ${UI.panelCard} 100%)`,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 4px 16px rgba(2, 6, 23, 0.15)",
                  borderLeft: `3px solid ${UI.accent}`,
                }}
              >
                {selectedEventCard ? (
                  (() => {
                    const sum = getIncidentSummary(
                      selectedSystem,
                      selectedEventCard,
                      verificationState,
                      language,
                      selectedCase ?? undefined
                    );
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 1.5rem" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: UI.textDim, marginBottom: "0.3rem", fontWeight: 600 }}>
                            {language === "tr" ? "Ne oldu" : "What happened"}
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.88rem", fontWeight: 500, color: UI.text }}>{sum.what}</p>
                        </div>
                        {sum.why && (
                          <div>
                            <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: UI.textDim, marginBottom: "0.25rem", fontWeight: 600 }}>
                              {language === "tr" ? "Neden incelemede" : "Why under review"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.8rem", color: UI.textSoft }}>{sum.why}</p>
                          </div>
                        )}
                        {sum.state && (
                          <div>
                            <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: UI.textDim, marginBottom: "0.25rem", fontWeight: 600 }}>
                              {language === "tr" ? "İnceleme durumu" : "Review state"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.8rem", color: UI.textSoft, fontWeight: 600 }}>{sum.state}</p>
                          </div>
                        )}
                        {sum.next && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: UI.textDim, marginBottom: "0.25rem", fontWeight: 600 }}>
                              {language === "tr" ? "Güvenli sonraki adım" : "Safe next step"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.8rem", color: UI.textMuted }}>{sum.next}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.82rem" }}>
                    {language === "tr"
                      ? "Olay özeti için sol omurgadan bir olay seçin."
                      : "Select an event for incident summary."}
                  </p>
                )}
              </div>
            </section>

            {/* ── Doctrine Spine ── */}
            <div
              style={{
                borderLeft: `3px solid ${UI.accentBorder}`,
                paddingLeft: "1.5rem",
                marginLeft: "0.15rem",
              }}
            >
              <div style={{
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: UI.accent,
                marginBottom: "1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ width: 16, height: 1, background: UI.accentBorder, display: "inline-block" }} />
                {language === "tr" ? "Doctrine Omurgası" : "Doctrine Spine"}
              </div>
            {/* 5) Evidence Layers */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                }}
              >
                {language === "tr" ? "Delil Katmanları" : "Evidence Layers"}
              </div>
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.65rem",
                  background: UI.surface,
                  border: `1px solid ${UI.borderMuted}`,
                  borderRadius: UI.radius.sm,
                  fontSize: "0.74rem",
                  lineHeight: 1.45,
                  fontWeight: 500,
                  color: UI.textMuted,
                }}
              >
                {language === "tr"
                  ? "Kayıtlı = ham kayıt katmanı. Türetilmiş = kayıtlıdan türetilen ikinci katman. Karıştırılmaz."
                  : "Recorded = raw record layer. Derived = second layer from recorded. Not blended."}
              </div>
              {selectedEventCard ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* A. Recorded Evidence */}
                  <div
                    style={{
                      border: `1px solid ${UI.border}`,
                      borderRadius: UI.radius.md,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.6rem 1rem",
                        background: UI.panelRaised,
                        borderBottom: `1px solid ${UI.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: UI.success, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: UI.textSoft }}>
                        {language === "tr" ? "Kaydedilmiş Delil" : "Recorded Evidence"}
                      </span>
                    </div>
                    <div style={{ padding: "1rem 1.15rem" }}>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.76rem", color: UI.textMuted, lineHeight: 1.5 }}>
                        {language === "tr"
                          ? `Ham kayıt katmanı — manifest ${manifestAnchorId} altında kaynak nesneler.`
                          : `Raw record layer — source objects under manifest ${manifestAnchorId}.`}
                      </p>
                      {(() => {
                        if (visibleRecorded.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.78rem", color: UI.textDim }}>
                              {language === "tr" ? "Kayıtlı delil yok." : "No recorded evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {visibleRecorded.map((r, i) => (
                              <div key={i} style={{ padding: "0.6rem 0.75rem", background: UI.bg, borderRadius: UI.radius.sm, border: `1px solid ${UI.borderMuted}` }}>
                                <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>{r.source}</div>
                                <div style={{ fontSize: "0.76rem", color: UI.textSoft, lineHeight: 1.5, marginBottom: "0.35rem" }}>{r.description}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 0.6rem", fontSize: "0.68rem", color: UI.textDim }}>
                                  <span>{language === "tr" ? "Zaman" : "Timestamp"}: {r.timestamp}</span>
                                  <span>{language === "tr" ? "Ref" : "Ref"}: {r.referenceId}</span>
                                  <span
                                    style={{
                                      padding: "0.05rem 0.3rem",
                                      borderRadius: UI.radius.pill,
                                      background: r.status === "verified" ? UI.successSoft : UI.borderSubtle,
                                      color: r.status === "verified" ? UI.success : UI.textMuted,
                                      fontWeight: 600,
                                      fontSize: "0.62rem",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.04em",
                                    }}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* B. Derived Evidence */}
                  <div
                    style={{
                      border: `1px solid ${UI.border}`,
                      borderRadius: UI.radius.md,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.6rem 1rem",
                        background: UI.panelRaised,
                        borderBottom: `1px solid ${UI.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: UI.warning, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: UI.textSoft }}>
                        {language === "tr" ? "Türetilmiş Değerlendirme" : "Derived Assessment"}
                      </span>
                    </div>
                    <div style={{ padding: "1rem 1.15rem" }}>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.76rem", color: UI.textMuted, lineHeight: 1.5 }}>
                        {language === "tr"
                          ? "İkinci katman. Kayıtlıdan türetilir; kayıtlının yerine geçmez."
                          : "Second layer derived from recorded; does not replace it."}
                      </p>
                      {(() => {
                        const derived =
                          selectedCase?.derivedAssessment?.length
                            ? toDerivedRows(selectedCase.derivedAssessment)
                            : [];
                        if (derived.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.78rem", color: UI.textDim }}>
                              {language === "tr" ? "Türetilmiş delil yok." : "No derived evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {derived.map((d, i) => (
                              <div key={i} style={{ padding: "0.6rem 0.75rem", background: UI.bg, borderRadius: UI.radius.sm, border: `1px solid ${UI.borderMuted}` }}>
                                <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>{d.type}</div>
                                <div style={{ fontSize: "0.76rem", color: UI.textSoft, lineHeight: 1.5, marginBottom: "0.35rem" }}>{d.explanation}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 0.6rem", fontSize: "0.68rem", color: UI.textDim }}>
                                  <span>{language === "tr" ? "Referanslar" : "Basis"}: {d.basisReferences}</span>
                                  <span>{language === "tr" ? "Güven" : "Confidence"}: {d.confidence}</span>
                                  <span>{language === "tr" ? "Profil" : "Profile"}: {d.profileRelevance}</span>
                                </div>
                              </div>
                            ))}
                          </div>
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

            {/* 5b) Unknown / Disputed */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                }}
              >
                {language === "tr" ? "Bilinmeyen / Tartışmalı" : "Unknown / Disputed"}
              </div>
              <div
                style={{
                  border: `1px solid ${UI.border}`,
                  borderRadius: UI.radius.md,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    background: UI.panelRaised,
                    borderBottom: `1px solid ${UI.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: UI.error, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: UI.textSoft }}>
                      {language === "tr" ? "Dürüstlük katmanı" : "Honesty layer"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: UI.textDim, marginLeft: "0.5rem" }}>
                      {language === "tr" ? "— İnsan incelemesi gerekir" : "— Requires human review"}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "1rem 1.15rem", fontSize: "0.8rem" }}>
                  {selectedEventCard ? (
                    <>
                      {verificationState === "UNKNOWN" && (
                        <div
                          style={{
                            marginBottom: "0.85rem",
                            padding: "0.55rem 0.75rem",
                            borderLeft: `3px solid ${UI.warning}`,
                            background: UI.warningSoft,
                            borderRadius: UI.radius.sm,
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "0.78rem", marginBottom: "0.15rem", color: UI.warning }}>
                            {language === "tr" ? "Doğrulama durumu: Bilinmeyen" : "Verification state: Unknown"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: UI.textMuted }}>
                            {language === "tr" ? "İnsan incelemesi gerekir." : "Requires human review."}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {visibleUnknownItems.length ? (
                          visibleUnknownItems.map((item, i) => (
                            <div key={i} style={{ padding: "0.5rem 0.65rem", background: UI.bg, borderRadius: UI.radius.sm, border: `1px solid ${UI.borderMuted}` }}>
                              <div style={{ fontSize: "0.78rem", lineHeight: 1.5, color: UI.textSoft }}>{item}</div>
                              <div style={{ fontSize: "0.66rem", color: UI.textDim, marginTop: "0.2rem", fontWeight: 500 }}>
                                {language === "tr" ? "İnsan incelemesi gerekir" : "Requires human review"}
                              </div>
                            </div>
                          ))
                        ) : verificationState === "UNKNOWN" ? (
                          <div style={{ fontSize: "0.78rem", color: UI.textMuted }}>
                            {language === "tr"
                              ? "Bu çalıştırma için doğrulama sonucu belirsiz; insan incelemesi gerekir."
                              : "Verification outcome unknown for this run; requires human review."}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.78rem", color: UI.textMuted }}>
                            {language === "tr"
                              ? "Bu vaka için kayıtlı çözülmemiş veya tartışmalı madde yok."
                              : "No unresolved or disputed items for this case."}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p style={{ margin: 0, color: UI.textMuted }}>
                      {language === "tr"
                        ? "Sol omurgadan bir olay seçin."
                        : "Select an event in the left spine."}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 6) Verification Trace */}
            <section style={{ marginBottom: UI.sectionGap }} aria-labelledby="verification-trace-heading">
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                }}
                id="verification-trace-heading"
              >
                {language === "tr" ? "Doğrulama İzi" : "Verification Trace"}
              </div>
              <div
                style={{
                  border: `1px solid ${UI.border}`,
                  borderRadius: UI.radius.md,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    background: UI.panelRaised,
                    borderBottom: `1px solid ${UI.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: "#60A5FA", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: UI.textSoft }}>
                      {language === "tr" ? "İnceleme izi" : "Inspection trace"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: UI.textDim, marginLeft: "0.5rem" }}>
                      {language === "tr" ? "— Nihai hüküm değildir" : "— Not a final determination"}
                    </span>
                  </div>
                </div>
                {selectedEventCard ? (
                  (() => {
                    const normalizeResult = (r: string) => {
                      if (r === "OK" || r === "PASS") return { text: r, honesty: "pass" as const };
                      if (r === "UNKNOWN" || r === "unresolved") return { text: r, honesty: "unresolved" as const };
                      if (r === "FAIL" || r === "partial") return { text: r, honesty: "partial" as const };
                      return { text: r, honesty: "pass" as const };
                    };
                    return (
                      <>
                        <div
                          style={{
                            padding: "0.55rem 1rem",
                            borderBottom: `1px solid ${UI.border}`,
                            fontSize: "0.72rem",
                            color: UI.textMuted,
                            background: UI.panelCard,
                            lineHeight: 1.5,
                            fontFamily: "monospace",
                          }}
                        >
                          {language === "tr"
                            ? `Manifest ${manifestAnchorId} → Trace ${isVehicle ? transcriptId ?? "hazırlanmadı" : "demo"} → ${hasConnectedIssuanceProfile ? "bounded issuance" : "path not connected"}`
                            : `Manifest ${manifestAnchorId} → Trace ${isVehicle ? transcriptId ?? "pending" : "demo"} → ${hasConnectedIssuanceProfile ? "bounded issuance" : "path not connected"}`}
                        </div>
                        <div style={{ margin: 0, padding: 0 }}>
                          {traceStepRows.map((row, i) => {
                            const { text, honesty } = normalizeResult(row.status);
                            const stateLabel = honesty === "pass" ? (language === "tr" ? "geçti" : "pass") : honesty === "unresolved" ? (language === "tr" ? "çözülmedi" : "unresolved") : (language === "tr" ? "kısmi" : "partial");
                            const stepColor = honesty === "unresolved" ? UI.warning : honesty === "partial" ? "#F59E0B" : UI.success;
                            return (
                              <div
                                key={i}
                                style={{
                                  padding: "0.65rem 1rem",
                                  borderBottom: i < traceStepRows.length - 1 ? `1px solid ${UI.borderMuted}` : "none",
                                  fontSize: "0.8rem",
                                  display: "grid",
                                  gridTemplateColumns: "1fr auto",
                                  gap: "0.25rem 0.75rem",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 600 }}>{row.label}</span>
                                  {row.note && (
                                    <div style={{ fontSize: "0.72rem", color: UI.textDim, marginTop: "0.15rem" }}>
                                      {row.note}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontSize: "0.74rem", color: UI.textMuted }}>{text}</span>
                                  <span
                                    style={{
                                      fontSize: "0.6rem",
                                      padding: "0.12rem 0.4rem",
                                      borderRadius: UI.radius.pill,
                                      background: `${stepColor}18`,
                                      color: stepColor,
                                      fontWeight: 700,
                                      letterSpacing: "0.04em",
                                      textTransform: "uppercase",
                                      border: `1px solid ${stepColor}30`,
                                    }}
                                  >
                                    {stateLabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div
                          style={{
                            padding: "0.55rem 1rem",
                            borderTop: `1px solid ${UI.border}`,
                            fontSize: "0.72rem",
                            color: UI.textDim,
                            background: UI.panel,
                            lineHeight: 1.5,
                          }}
                        >
                          {language === "tr"
                            ? "Bu iz manifeste bağlıdır; unknown/disputed maddeleri aşmaz; nihai hüküm değildir."
                            : "This trace stays manifest-bound; does not outrank unknown/disputed items; not a final determination."}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", opacity: 0.9 }}>
                    <p style={{ margin: 0 }}>
                      {language === "tr"
                        ? "Doğrulama izi için sol omurgadan bir olay seçin."
                        : "Select an event in the left spine to view the verification trace."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            </div>
            {/* End doctrine spine (Evidence → Unknown → Trace). Issuance follows after secondary blocks. */}

            {/* Review Assistant — reserved */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: `1px solid ${UI.borderMuted}`,
                  borderRadius: UI.radius.sm,
                  padding: "0.55rem 0.85rem",
                  fontSize: "0.72rem",
                  color: UI.textDim,
                  background: UI.panel,
                }}
              >
                <span style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginRight: "0.5rem" }}>
                  {language === "tr" ? "İnceleme Asistanı" : "Review Assistant"}
                </span>
                {language === "tr"
                  ? "Ayrılmış katman. Mevcut sürümde aktif değildir."
                  : "Reserved layer. Not active in current release."}
              </div>
            </section>

            {/* 7) Verification / export flow */}
            <section style={{ marginBottom: UI.sectionGap }}>
              {selectedEventCard && (
                <div style={{ fontSize: "0.76rem", color: UI.textMuted, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{language === "tr" ? "Seçili:" : "Selected:"}</span>
                  <span style={{ fontWeight: 700, color: UI.textSoft, fontFamily: "monospace", fontSize: "0.74rem" }}>{selectedEventCard.eventId}</span>
                  <span style={{ color: UI.textDim }}>— {selectedEventCard.title}</span>
                </div>
              )}
              {selectedCase && (() => {
                const gate = evaluateGoldenAcceptance(selectedCase);
                return (
                  <div style={{ fontSize: "0.68rem", color: UI.textDim, marginBottom: "0.5rem" }}>
                    {language === "tr" ? "Golden kabul:" : "Golden acceptance:"} {gate.passed}/{gate.total}
                  </div>
                );
              })()}
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
                    {displayEvents.map((ev) => (
                      <option key={ev.eventId} value={ev.eventId}>
                        {ev.title} — {ev.eventId}
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
                    : "Demo context only in this release. Verification and controlled issuance are available for the Vehicle system."}
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
                marginTop: "1rem",
              }}
            >
              <h2 style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", opacity: 0.75, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {language === "tr"
                  ? "Doğrulama sonucu (bu çalıştırma)"
                  : "Verification result (this run)"}
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
                    : "No verification has been run yet. Select an event and start verification to see its current state and verification trace summary."}
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
                            ? "İz ID:"
                            : "Trace ID:"}{" "}
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
                      ? "İz özeti (bu çalıştırma)"
                      : "Trace summary (this run)"}
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

            {/* AXISUS — boundary protocol; secondary to doctrine spine */}
            {selectedCase?.axisusStates?.length ? (
              <section style={{ marginTop: "1rem" }} aria-label="AXISUS">
                <div
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                    marginBottom: "0.3rem",
                  }}
                >
                  AXISUS
                </div>
                <div
                  style={{
                    border: "1px solid #374151",
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "#111827",
                  }}
                >
                  {selectedCase.axisusStates.map((s, idx) => (
                    <div
                      key={s.id}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderBottom:
                          idx < selectedCase.axisusStates!.length - 1 ? "1px solid #1F2937" : "none",
                        fontSize: "0.78rem",
                        opacity: 0.92,
                        borderLeft:
                          s.severity === "handoff"
                            ? "3px solid #4B5563"
                            : s.severity === "limit"
                            ? "3px solid #374151"
                            : "3px solid #1F2937",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                        {language === "tr" ? s.labelTr : s.labelEn}
                      </div>
                      <div style={{ marginBottom: s.nextStepTr || s.nextStepEn ? "0.25rem" : 0 }}>
                        {language === "tr" ? s.reasonTr : s.reasonEn}
                      </div>
                      {(s.nextStepTr || s.nextStepEn) && (
                        <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>
                          {language === "tr" ? s.nextStepTr : s.nextStepEn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 8) Artifact Issuance */}
            <div style={{ borderLeft: `3px solid ${UI.accentBorder}`, paddingLeft: "1.5rem", marginLeft: "0.15rem", marginTop: "0.5rem" }}>
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.accent,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: 16, height: 1, background: UI.accentBorder, display: "inline-block" }} />
                {language === "tr" ? "Belge Üretimi" : "Artifact Issuance"}
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: UI.textDim,
                  marginBottom: "0.65rem",
                  lineHeight: 1.5,
                }}
              >
                {language === "tr"
                  ? "Üretim doğrulama izine ve açık belirsizliklere bağlıdır; onların üzerine yazmaz."
                  : "Issuance is conditioned on the trace and open unknowns; it does not override them."}
              </p>
              {!selectedCase ? (
                <div style={{ border: "1px solid #111827", borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.8rem", opacity: 0.85 }}>
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Belge üretimi için sol omurgadan bir olay seçin."
                      : "Select an event in the left spine for artifact issuance."}
                  </p>
                </div>
              ) : selectedCase.artifactProfiles && selectedCase.artifactProfiles.length > 0 ? (
                <div style={{ border: "1px solid #1F2937", borderRadius: 6, padding: "1rem", background: "#020617" }}>
                  <p style={{ fontSize: "0.72rem", opacity: 0.75, marginBottom: "0.75rem" }}>
                    {language === "tr"
                      ? "Bu çıktı nihai hukukî veya olgusal hüküm değildir. Issuance kullanılabilirliği, gerçeklik iddiası anlamına gelmez."
                      : "This output is not a final legal or factual determination. Issuance availability does not imply a truth claim."}
                  </p>
                  <div
                    style={{
                      marginBottom: "0.85rem",
                      padding: "0.65rem 0.75rem",
                      border: "1px solid #111827",
                      borderRadius: 6,
                      background: "rgba(15, 23, 42, 0.55)",
                      fontSize: "0.76rem",
                      lineHeight: 1.5,
                      opacity: 0.94,
                    }}
                  >
                    <div>
                      {language === "tr"
                        ? `Amaç bağı: ${selectedProfileMeta ? selectedProfileMeta.purposeShortTr : "Seçili profile göre sınırlı issuance."}`
                        : `Purpose bound: ${selectedProfileMeta ? selectedProfileMeta.purposeShortEn : "Issuance remains bounded to the selected profile."}`}
                    </div>
                    <div>
                      {language === "tr"
                        ? `Manifest bağı: ${manifestAnchorId} · İz bağı: ${isVehicle ? transcriptId ?? "hazırlanmadı" : "demo review chain"}`
                        : `Manifest anchor: ${manifestAnchorId} · Trace anchor: ${isVehicle ? transcriptId ?? "pending" : "demo review chain"}`}
                    </div>
                    <div>
                      {language === "tr"
                        ? hasConnectedIssuanceProfile
                          ? "Receipt/export hattı yalnızca bağlı profiller için açılır; issuance trace ve unknown/disputed üstüne yazmaz."
                          : "Receipt/export hattı bu vaka için kasıtlı olarak kapalıdır; sebep, API destekli issuance yolunun bağlı olmamasıdır."
                        : hasConnectedIssuanceProfile
                        ? "The receipt/export path opens only for connected profiles; issuance does not override the trace or unknown/disputed items."
                        : "The receipt/export path is intentionally withheld for this case because no API-backed issuance path is connected."}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedCase.artifactProfiles.map((ap) => {
                      const meta = getArtifactProfile(ap.profileCode as ArtifactProfileCode);
                      const label = meta ? (language === "tr" ? meta.labelTr : meta.labelEn) : ap.profileCode;
                      const purpose = meta ? (language === "tr" ? meta.purposeShortTr : meta.purposeShortEn) : "";
                      let statusText: string;
                      if (ap.enabled && ap.apiBacked) {
                        statusText =
                          language === "tr"
                            ? "Bu vaka için amaç-bağlı issuance mümkündür; artifact mevcut manifest ve trace zincirine bağlı kalır."
                            : "Purpose-bound issuance is available for this case; any artifact remains tied to the current manifest and trace chain.";
                      } else if (ap.enabled && !ap.apiBacked) {
                        statusText =
                          language === "tr"
                            ? "Bu profil vaka için anlamlıdır; ancak API destekli receipt/export hattı bağlı olmadığı için issuance şu anda sınırlıdır."
                            : "This profile is meaningful for the case, but issuance is currently withheld because no API-backed receipt/export path is connected.";
                      } else {
                        statusText =
                          language === "tr"
                            ? `Rol/amaç sınırı: ${ap.reasonTr}`
                            : `Role/purpose limit: ${ap.reasonEn}`;
                      }
                      return (
                        <div
                          key={ap.profileCode}
                          style={{
                            borderLeft: "2px solid #374151",
                            padding: "0.5rem 0.6rem",
                            background: "rgba(15, 23, 42, 0.4)",
                            borderRadius: 4,
                            fontSize: "0.8rem",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{label}</div>
                          {purpose ? <div style={{ opacity: 0.88, marginBottom: "0.25rem", fontSize: "0.78rem" }}>{purpose}</div> : null}
                          <div style={{ fontSize: "0.75rem", opacity: 0.82 }}>{statusText}</div>
                        </div>
                      );
                    })}
                  </div>
                  {isVehicle && selected && selectedCase.artifactProfiles.some((ap) => ap.enabled && ap.apiBacked && (ap.profileCode === "claims" || ap.profileCode === "legal")) ? (
                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #111827" }}>
                      <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ opacity: 0.8 }}>{language === "tr" ? "Issuance profili:" : "Issuance profile:"}</span>
                        {selectedCase.artifactProfiles.some((ap) => ap.profileCode === "claims" && ap.enabled && ap.apiBacked) && (
                          <button
                            type="button"
                            onClick={() => setExportProfile("claims")}
                            disabled={!!exportLoading}
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: 999,
                              border: exportProfile === "claims" ? `1px solid ${UI.accentBorder}` : "1px solid #374151",
                              background: exportProfile === "claims" ? UI.accentSoft : "#020617",
                              color: "#E5E7EB",
                              cursor: exportLoading ? "not-allowed" : "pointer",
                              opacity: exportLoading ? 0.6 : 1,
                              fontWeight: exportProfile === "claims" ? 700 : 500,
                            }}
                          >
                            {language === "tr" ? "Hasar / Claim" : "Claims"}
                          </button>
                        )}
                        {selectedCase.artifactProfiles.some((ap) => ap.profileCode === "legal" && ap.enabled && ap.apiBacked) && (
                          <button
                            type="button"
                            onClick={() => setExportProfile("legal")}
                            disabled={!!exportLoading}
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: 999,
                              border: exportProfile === "legal" ? `1px solid ${UI.accentBorder}` : "1px solid #374151",
                              background: exportProfile === "legal" ? UI.accentSoft : "#020617",
                              color: "#E5E7EB",
                              cursor: exportLoading ? "not-allowed" : "pointer",
                              opacity: exportLoading ? 0.6 : 1,
                              fontWeight: exportProfile === "legal" ? 700 : 500,
                            }}
                          >
                            {language === "tr" ? "Hukukî inceleme" : "Legal"}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={runExportJson}
                          disabled={!selectedId || !!exportLoading}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.55rem 0.95rem",
                            borderRadius: 8,
                            border: "1px solid #374151",
                            background: UI.panel,
                            color: "#E5E7EB",
                            cursor: !selectedId || exportLoading ? "not-allowed" : "pointer",
                            opacity: !selectedId || exportLoading ? 0.6 : 1,
                            minWidth: 176,
                            fontWeight: 600,
                          }}
                        >
                          {exportLoading === "json"
                            ? language === "tr" ? "Hazırlanıyor…" : "Preparing…"
                            : language === "tr" ? "Bounded Issuance — JSON" : "Issue bounded JSON"}
                        </button>
                        <button
                          type="button"
                          onClick={runExportPdf}
                          disabled={!selectedId || !!exportLoading}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.55rem 0.95rem",
                            borderRadius: 8,
                            border: "1px solid #374151",
                            background: UI.panel,
                            color: "#E5E7EB",
                            cursor: !selectedId || exportLoading ? "not-allowed" : "pointer",
                            opacity: !selectedId || exportLoading ? 0.6 : 1,
                            minWidth: 176,
                            fontWeight: 600,
                          }}
                        >
                          {exportLoading === "pdf"
                            ? language === "tr" ? "Hazırlanıyor…" : "Preparing…"
                            : language === "tr" ? "Bounded Issuance — PDF" : "Issue bounded PDF"}
                        </button>
                      </div>
                      {(identity?.bundle_id ?? selected?.bundleId) && (
                        <div style={{ fontSize: "0.72rem", color: UI.textMuted, marginTop: "0.65rem", lineHeight: 1.5 }}>
                          Bundle ID: {identity?.bundle_id ?? selected?.bundleId} · Manifest ID: {identity?.manifest_id ?? selected?.manifestId ?? "—"} · {language === "tr" ? "Trace" : "Trace"}: {transcriptId ?? (language === "tr" ? "hazırlanmadı" : "pending")}
                        </div>
                      )}
                      {issuanceState !== "idle" && (
                        <div
                          style={{
                            marginTop: "0.85rem",
                            padding: "0.8rem 0.9rem",
                            borderRadius: 10,
                            border:
                              issuanceState === "success"
                                ? `1px solid ${UI.success}`
                                : issuanceState === "error"
                                ? `1px solid ${UI.error}`
                                : `1px solid ${UI.borderStrong}`,
                            background:
                              issuanceState === "success"
                                ? UI.successSoft
                                : issuanceState === "error"
                                ? UI.errorSoft
                                : "rgba(148, 163, 184, 0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              marginBottom: "0.3rem",
                              color:
                                issuanceState === "success"
                                  ? UI.success
                                  : issuanceState === "error"
                                  ? UI.error
                                  : UI.textSoft,
                            }}
                          >
                            {issuanceState === "success"
                              ? language === "tr"
                                ? "Bounded issuance hazır"
                                : "Bounded issuance ready"
                              : issuanceState === "error"
                              ? language === "tr"
                                ? "Issuance tamamlanamadı"
                                : "Issuance could not complete"
                              : language === "tr"
                              ? "Issuance hazırlanıyor"
                              : "Issuance in progress"}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.78rem",
                              color: UI.textSoft,
                              lineHeight: 1.5,
                            }}
                          >
                            {issuanceState === "success"
                              ? language === "tr"
                                ? `Seçili ${selectedProfileLabel} profili için artifact zincire bağlı olarak üretildi. Kimlik ve purpose alanları aşağıda görünür.`
                                : `The selected ${selectedProfileLabel} artifact was issued while staying bound to the chain. Identity and purpose fields are visible below.`
                              : issuanceState === "error"
                              ? language === "tr"
                                ? "Receipt/export hattı bu denemede kullanıcıya dönük bir sonuç üretemedi."
                                : "The receipt/export path did not produce a user-facing result for this attempt."
                              : language === "tr"
                              ? `Seçili ${selectedProfileLabel} profili için ${selectedFormat?.toUpperCase() ?? "artifact"} hazırlanıyor.`
                              : `Preparing ${selectedFormat?.toUpperCase() ?? "artifact"} for the selected ${selectedProfileLabel} profile.`}
                          </p>
                          {lastIssuedArtifact && (
                            <div
                              style={{
                                marginTop: "0.7rem",
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: "0.6rem 0.85rem",
                              }}
                            >
                              {[
                                {
                                  label: language === "tr" ? "Profile" : "Profile",
                                  value: lastIssuedArtifact.meta.export_profile,
                                },
                                {
                                  label: language === "tr" ? "Format" : "Format",
                                  value: lastIssuedArtifact.format,
                                },
                                {
                                  label: language === "tr" ? "Export ID" : "Export ID",
                                  value: lastIssuedArtifact.meta.export_id,
                                },
                                {
                                  label: language === "tr" ? "Receipt ID" : "Receipt ID",
                                  value: lastIssuedArtifact.meta.receipt_id,
                                },
                                {
                                  label: language === "tr" ? "Purpose" : "Purpose",
                                  value: lastIssuedArtifact.meta.export_purpose,
                                },
                              ].map((item) => (
                                <div key={item.label} style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: "0.68rem",
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                      color: UI.textMuted,
                                      marginBottom: "0.18rem",
                                    }}
                                  >
                                    {item.label}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      lineHeight: 1.45,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {exportError && (
                            <p style={{ fontSize: "0.8rem", margin: "0.65rem 0 0", color: UI.error }}>
                              {exportError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : selectedCase?.artifactIssuance?.available && selectedCase?.artifactIssuance?.apiBacked && selected ? (
                <div style={{ border: "1px solid #1F2937", borderRadius: 6, padding: "1rem", background: "#020617" }}>
                  <p style={{ fontSize: "0.72rem", opacity: 0.75, marginBottom: "0.5rem" }}>
                    {language === "tr" ? "Bu çıktı nihai hukukî veya olgusal hüküm değildir." : "This output is not a final legal or factual determination."}
                  </p>
                  <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    <span style={{ opacity: 0.7 }}>{language === "tr" ? "Artifact profili" : "Artifact profile"}: </span>
                    <strong>{language === "tr" ? (getArtifactProfile(exportProfile)?.labelTr ?? exportProfile) : (getArtifactProfile(exportProfile)?.labelEn ?? exportProfile)}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                      {language === "tr" ? "Hasar / Claim" : "Claims"}
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
                      {language === "tr" ? "Hukukî inceleme" : "Legal"}
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
                      {exportLoading === "json" ? (language === "tr" ? "Hazırlanıyor…" : "Preparing…") : language === "tr" ? "Issuance — JSON" : "Issue as JSON"}
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
                      {exportLoading === "pdf" ? (language === "tr" ? "Hazırlanıyor…" : "Preparing…") : language === "tr" ? "Issuance — PDF" : "Issue as PDF"}
                    </button>
                  </div>
                  {exportError && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "#fca5a5" }}>{exportError}</p>}
                </div>
              ) : (
                <div style={{ border: "1px solid #111827", borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.8rem", opacity: 0.85 }}>
                  {!isVehicle ? (
                    <div>
                      <p style={{ margin: "0 0 0.5rem" }}>
                        {language === "tr"
                          ? "Aynı olay omurgasından, rol ve amaça göre kontrollü issuance. Bu dikey için issuance kasıtlı olarak sınırlıdır; çünkü API destekli receipt/export hattı henüz bağlı değildir."
                          : "Controlled issuance from the same event spine, by role and purpose. Issuance is intentionally constrained for this vertical because the API-backed receipt/export path is not yet connected."}
                      </p>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.78rem", opacity: 0.88, lineHeight: 1.45 }}>
                        {language === "tr"
                          ? `Manifest bağı ${manifestAnchorId} üzerinde kalır; trace review-chain olarak görünür, issuance onun üstüne yazmaz.`
                          : `The panel remains anchored to manifest ${manifestAnchorId}; the trace stays a review-chain object, and issuance does not outrank it.`}
                      </p>
                      <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                        {language === "tr" ? "Bu dikeyde kullanılacak artifact profilleri:" : "Artifact profiles for this vertical:"}
                        <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
                          {getArtifactProfilesForDomain(selectedSystem).slice(0, 5).map((p) => (
                            <li key={p.code}>
                              {language === "tr" ? p.ctaTr : p.ctaEn} — {language === "tr" ? p.purposeShortTr : p.purposeShortEn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : !selected ? (
                    <p style={{ margin: 0 }}>
                      {language === "tr" ? "Belge üretimi için araç olayının API ile eşleşmesi gerekir." : "Vehicle event must match API for artifact issuance."}
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {language === "tr" ? "Belge üretimi için sol omurgadan bir araç olayı seçin." : "Select a vehicle event in the left spine for artifact issuance."}
                    </p>
                  )}
                </div>
              )}
            </section>
            </div>

            {/* 9) Why QARAQUTU is inevitable */}
            <section style={{ marginTop: UI.sectionGap, marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: UI.textDim,
                  marginBottom: "0.4rem",
                  fontWeight: 700,
                }}
              >
                {language === "tr" ? "Neden QARAQUTU kaçınılmaz" : "Why QARAQUTU is inevitable"}
              </div>
              <div
                style={{
                  border: `1px solid ${UI.border}`,
                  borderRadius: UI.radius.md,
                  padding: "1rem 1.25rem",
                  fontSize: "0.82rem",
                  lineHeight: 1.55,
                  background: UI.panelCard,
                  color: UI.textSoft,
                }}
              >
                {selectedEventCard ? (
                  <p style={{ margin: 0 }}>
                    {selectedCase?.whyInevitable ??
                      (language === "tr"
                        ? "Olay tabanlı doğrulanabilir kayıt, türetilmiş değerlendirme ve doğrulama izi olmadan yük, sigorta ve uyumluluk tartışmaları belirsiz kalır. QARAQUTU, tek bir ürün olarak Vehicle / Drone / Robot olaylarını aynı çerçevede ele alarak kanıt bütünlüğü ve izlenebilirliği sağlar; bu nedenle bu olay bağlamında kaçınılmazdır."
                        : "Without event-bound verifiable record, derived assessment, and verification trace, liability, insurance, and compliance disputes remain unresolved. QARAQUTU addresses Vehicle, Drone, and Robot events in one product and one framework, providing evidence integrity and traceability—hence inevitable in the context of this case.")}
                  </p>
                ) : (
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Sol omurgadan bir olay seçin."
                      : "Select an event in the left spine."}
                  </p>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
      <UstaPDemoTrigger
        language={language}
        defaultScenario="togg"
        selectedDomain={selectedSystem}
        hasCase={!!selectedCase}
      />
    </div>
  );
}

