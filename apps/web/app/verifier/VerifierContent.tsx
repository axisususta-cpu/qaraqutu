"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/LanguageContext";
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
import { InstitutionalGuidanceStrip } from "../components/institutional/InstitutionalGuidanceStrip";
import { SectorVerifierStrip } from "../components/sector/SectorVerifierStrip";
import { DocumentShell } from "../components/documents/DocumentShell";
import { DocumentSection } from "../components/documents/DocumentSection";
import { DocumentMetadataBlock } from "../components/documents/DocumentMetadataBlock";
import { MSG } from "../../lib/i18n/messages";
import type { InstitutionAudienceId } from "../../lib/report-authority";
import {
  DEFAULT_AUDIENCE_BY_PROFILE,
  INSTITUTION_AUDIENCES,
  resolveIssuanceDocumentFamilies,
  documentFamilyLabel,
  sectorIncidentReportLabel,
} from "../../lib/report-authority";
import { getInstitutionFraming, institutionAudienceLabel } from "../../lib/report-authority-framing";

const DEFAULT_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;

// ── Design language: light theme, institutional review station ──────────────
const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// UI now uses CSS custom properties; only structural constants kept here
const UI = {
  radius: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },
  sectionGap: "1.75rem",
} as const;

type TranscriptStep = VerificationTranscriptEntry;

interface IssuanceRecord {
  format: ExportFormat;
  meta: ExportArtifactResponse;
  localPreview?: boolean;
  previewReason?: string;
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
      borderColor: "var(--success)",
      background: "var(--success-soft)",
      color: "var(--success)",
    };
  }

  if (state === "FAIL") {
    return {
      borderColor: "var(--error)",
      background: "var(--error-soft)",
      color: "var(--error)",
    };
  }

  if (state === "UNKNOWN") {
    return {
      borderColor: "var(--warning)",
      background: "var(--warning-soft)",
      color: "var(--warning)",
    };
  }

  return {
    borderColor: "var(--border-strong)",
    background: "var(--panel-card)",
    color: "var(--text-soft)",
  };
}

export function VerifierContent({ initialEventId }: { initialEventId?: string }) {
  const { lang: language, setLang: setLanguage } = useLanguage();
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
  const [issuanceAudience, setIssuanceAudience] = useState<InstitutionAudienceId>(
    DEFAULT_AUDIENCE_BY_PROFILE.claims
  );
  const [lastIssuedAtIso, setLastIssuedAtIso] = useState<string | null>(null);

  useEffect(() => {
    setIssuanceAudience(DEFAULT_AUDIENCE_BY_PROFILE[exportProfile]);
  }, [exportProfile]);

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
      const res = await fetch(`/api/events/${selectedId}/verify`, {
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
      const res = await fetch(`/api/events/${selectedId}/exports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const json = (await res.json().catch(() => ({}))) as
        | (Partial<ExportArtifactResponse> & { local_preview?: boolean; preview_reason?: string })
        | { error?: string };
      const errorPayload = json as { error?: string };
      const successPayload = json as Partial<ExportArtifactResponse> & {
        local_preview?: boolean;
        preview_reason?: string;
      };
      const isLocalPreview = successPayload.local_preview === true;

      if (
        !res.ok ||
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
      setLastIssuedAtIso(new Date().toISOString());
      setLastIssuedArtifact({
        format,
        meta,
        localPreview: isLocalPreview,
        previewReason: successPayload.preview_reason,
      });
      setIdentity({
        event_id: meta.event_id,
        bundle_id: meta.bundle_id,
        manifest_id: meta.manifest_id,
      });

      if (typeof window !== "undefined" && !isLocalPreview) {
        const href = `/api/exports/${meta.export_id}/download`;
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
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: SANS,
      }}
    >
      {/* ── Topbar ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 2.5rem",
            height: "3.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Product ID */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: `0 0 6px ${"var(--accent)"}60`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                QARAQUTU
              </span>
            </div>
            <div
              style={{
                width: 1,
                height: 16,
                background: "var(--border)",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                fontWeight: 600,
              }}
            >
              {language === "tr" ? "Doğrulama İstasyonu" : "Verification Station"}
            </span>
          </div>
          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Selected event indicator */}
            {selectedEventCard && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: UI.radius.xs,
                  border: "1px solid var(--border)",
                  background: "var(--panel-card)",
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "var(--text-dim)" }}>EVT</span>
                <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  {selectedEventCard.eventId}
                </span>
              </div>
            )}
            {/* Language switcher */}
            <div
              style={{
                display: "flex",
                gap: "0.15rem",
                padding: "0.15rem",
                borderRadius: UI.radius.xs,
                border: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              {(["en", "tr"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  style={{
                    padding: "0.2rem 0.55rem",
                    borderRadius: UI.radius.xs,
                    border: "none",
                    background: language === l ? "var(--surface)" : "transparent",
                    color: language === l ? "var(--text)" : "var(--text-dim)",
                    cursor: "pointer",
                    fontWeight: language === l ? 700 : 400,
                    fontSize: "0.65rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontFamily: MONO,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InstitutionalGuidanceStrip />
      <SectorVerifierStrip />

      {/* ── Page title area ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--panel)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "1.35rem 2.5rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.2rem 0.55rem",
              borderRadius: 999,
              marginBottom: "0.5rem",
              background: "var(--chip-bg)",
              border: `1px solid ${"var(--chip-border)"}`,
              color: "var(--chip-text)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: MONO,
            }}
          >
            {language === "tr" ? "İnceleme İstasyonu" : "Inspection Station"}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "var(--text)",
              lineHeight: 1.3,
            }}
          >
            {language === "tr" ? "Olay Paketi Doğrulaması" : "Event Package Verification"}
          </h1>
          <p
            style={{
              margin: "0.3rem 0 0",
              fontSize: "0.78rem",
              color: "var(--text-dim)",
              lineHeight: 1.5,
            }}
          >
            {language === "tr"
              ? "Seçili olay paketinin sınırlı değerlendirmesi. Sorumluluk veya kusur tespiti yapmaz."
              : "Bounded assessment of the selected event package. Does not make liability or guilt determinations."}
          </p>
          <div
            style={{
              marginTop: "0.65rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.35rem",
              fontSize: "0.7rem",
            }}
          >
            {[
              language === "tr" ? "Sıra: 1) Sistem 2) Senaryo 3) Olay" : "Order: 1) System 2) Scenario 3) Event",
              language === "tr" ? "Katman: Recorded ayrı, Derived ayrı" : "Layering: Recorded separate, Derived separate",
              language === "tr"
                ? "Bilinmeyen/Tartışmalı ve Trace issuance üstüne yazılmaz"
                : "Unknown/Disputed and Trace are not overridden by issuance",
            ].map((item) => (
              <span
                key={item}
                style={{
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.pill,
                  padding: "0.14rem 0.5rem",
                  color: "var(--text-muted)",
                  background: "var(--panel-card)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.45rem 0.6rem",
              borderRadius: UI.radius.xs,
              border: `1px solid ${"var(--border-muted)"}`,
              background: "var(--panel-card)",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.4rem",
              fontSize: "0.72rem",
            }}
          >
            <div>
              <div style={{ fontFamily: MONO, color: "var(--text-dim)", fontSize: "0.58rem", letterSpacing: "0.08em" }}>
                {language === "tr" ? "SEÇİLİ SİSTEM" : "SELECTED SYSTEM"}
              </div>
              <div style={{ color: "var(--text-soft)", fontWeight: 600 }}>{selectedSystem.toUpperCase()}</div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, color: "var(--text-dim)", fontSize: "0.58rem", letterSpacing: "0.08em" }}>
                {language === "tr" ? "SEÇİLİ SENARYO" : "SELECTED SCENARIO"}
              </div>
              <div style={{ color: "var(--text-soft)", fontWeight: 600 }}>
                {selectedCase?.scenarioFrame ??
                  selectedScenario ??
                  (language === "tr" ? "Seçilmedi" : "Not selected")}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, color: "var(--text-dim)", fontSize: "0.58rem", letterSpacing: "0.08em" }}>
                {language === "tr" ? "SEÇİLİ OLAY" : "SELECTED EVENT"}
              </div>
              <div style={{ color: "var(--text-soft)", fontWeight: 600 }}>
                {selectedEventCard?.eventId ?? (language === "tr" ? "Seçilmedi" : "Not selected")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.75rem 2.5rem 3rem" }}>

        {/* ── Layout: sidebar + main ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "290px 1fr",
            gap: "1.75rem",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: UI.radius.lg,
              background: "var(--panel)",
              overflow: "hidden",
            }}
            aria-label={language === "tr" ? "Komut omurgası" : "Command spine"}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--border)",
                background: "var(--panel-raised)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {language === "tr" ? "Komut Omurgası" : "Command Spine"}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.6rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.04em",
                }}
              >
                {language === "tr" ? "1→2→3" : "1→2→3"}
              </span>
            </div>

            {/* Workflow hint */}
            <div
              style={{
                margin: "0.65rem 0.75rem",
                padding: "0.5rem 0.65rem",
                background: "var(--accent-soft)",
                border: `1px solid ${"var(--accent-border)"}40`,
                borderLeft: "2px solid var(--accent)",
                borderRadius: UI.radius.xs,
              }}
              role="status"
              aria-live="polite"
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>
                {language === "tr"
                  ? "1. Sistem → 2. Senaryo → 3. Olay"
                  : "1. System → 2. Scenario → 3. Event"}
              </div>
            </div>

            <div style={{ padding: "0 0.75rem 0.75rem" }}>
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
                    <div style={{ height: 1, background: "var(--border)", margin: "0.5rem 0" }} />
                  )}
                  <div
                    style={{
                      marginBottom: "0.2rem",
                      borderRadius: UI.radius.xs,
                      border: isActive ? "1px solid var(--border-strong)" : `1px solid transparent`,
                      background: isActive ? "var(--surface)" : "transparent",
                      borderLeft: isActive
                        ? "3px solid var(--accent)"
                        : isStep
                        ? `3px solid ${"var(--border)"}`
                        : `3px solid transparent`,
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
                      color: isActive ? "var(--text)" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: isActive ? 600 : 400,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontFamily: SANS,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      {section.step != null && (
                        <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: isActive ? "var(--accent)" : "var(--text-dim)", fontWeight: 700, flexShrink: 0 }}>
                          {section.step}
                        </span>
                      )}
                      {section.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.55rem",
                        color: "var(--text-dim)",
                        fontWeight: 700,
                        fontFamily: MONO,
                        flexShrink: 0,
                      }}
                    >
                      {isActive ? "▾" : "▸"}
                    </span>
                  </button>
                  {isActive && (
                    <div
                      style={{
                        padding: "0.5rem 0.65rem 0.65rem",
                        borderTop: `1px solid ${"var(--border-muted)"}`,
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
                                    ? "1px solid var(--accent)"
                                    : "1px solid var(--border)",
                                background:
                                  selectedSystem === sys.id ? "var(--accent-soft)" : "transparent",
                                color: "var(--text)",
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
                                    ? "1px solid var(--accent)"
                                    : "1px solid var(--border)",
                                background:
                                  selectedScenario === name ? "var(--accent-soft)" : "transparent",
                                color: "var(--text)",
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
                              const stateColor =
                                ev.state === "PASS" ? "var(--success)" :
                                ev.state === "FAIL" ? "var(--error)" :
                                ev.state === "UNKNOWN" ? "var(--warning)" : "var(--text-dim)";
                              const stateBg =
                                ev.state === "PASS" ? "var(--success-soft)" :
                                ev.state === "FAIL" ? "var(--error-soft)" :
                                ev.state === "UNKNOWN" ? "var(--warning-soft)" : `${"var(--text-dim)"}10`;
                              return (
                              <button
                                key={ev.eventId}
                                type="button"
                                onClick={() => handleSelectEvent(ev.eventId)}
                                style={{
                                  padding: 0,
                                  textAlign: "left",
                                  borderRadius: UI.radius.xs,
                                  border: isSelected
                                    ? "1px solid var(--border-strong)"
                                    : `1px solid ${"var(--border-muted)"}`,
                                  borderLeft: `3px solid ${isSelected ? "var(--accent)" : "var(--border-muted)"}`,
                                  background: isSelected ? "var(--surface)" : "var(--panel-card)",
                                  color: "var(--text)",
                                  cursor: "pointer",
                                  width: "100%",
                                  display: "block",
                                  overflow: "hidden",
                                }}
                              >
                                {/* card row 1: ID + state */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.45rem 0.6rem 0.3rem",
                                    borderBottom: `1px solid ${isSelected ? "var(--border)" : "var(--border-muted)"}`,
                                    background: isSelected ? "var(--panel-raised)" : "var(--panel)",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: isSelected ? "var(--text)" : "var(--text-muted)",
                                      letterSpacing: "0.02em",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    {ev.eventId}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.55rem",
                                      padding: "0.1rem 0.35rem",
                                      borderRadius: UI.radius.xs,
                                      background: stateBg,
                                      color: stateColor,
                                      fontWeight: 700,
                                      letterSpacing: "0.06em",
                                      textTransform: "uppercase",
                                      border: `1px solid ${stateColor}25`,
                                      flexShrink: 0,
                                      marginLeft: "0.4rem",
                                    }}
                                  >
                                    {ev.state}
                                  </span>
                                </div>
                                {/* card row 2: title + summary */}
                                <div style={{ padding: "0.35rem 0.6rem 0.45rem" }}>
                                  <div style={{ fontSize: "0.72rem", color: isSelected ? "var(--text-soft)" : "var(--text-muted)", fontWeight: isSelected ? 500 : 400, marginBottom: "0.15rem", lineHeight: 1.35 }}>
                                    {ev.title}
                                  </div>
                                  <div style={{ fontFamily: SANS, fontSize: "0.65rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
                                    {ev.summary.slice(0, 52)}{ev.summary.length > 52 ? "…" : ""}
                                  </div>
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
            </div>{/* end inner padding div */}
          </aside>

          <main style={{ minWidth: 0 }}>
            {/* 0) Demo scenario notice */}
            {selectedCase && (
              <section style={{ marginBottom: UI.sectionGap }} aria-label={language === "tr" ? "Demo senaryosu bildirimi" : "Demo scenario notice"}>
                <div
                  style={{
                    borderRadius: UI.radius.xs,
                    padding: "0.5rem 0.85rem",
                    fontSize: "0.68rem",
                    background: "var(--panel-card)",
                    border: `1px solid ${"var(--border-muted)"}`,
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem 1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, flexShrink: 0 }}>
                    {language === "tr" ? "DEMO" : "DEMO"}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0 0.6rem", color: "var(--text-dim)" }}>
                    {[
                      language === "tr" ? "Demo senaryo" : "Demo scenario",
                      language === "tr" ? "Kamuya açık" : "Public class",
                      language === "tr" ? "Anonimize" : "Anonymized",
                      language === "tr" ? "Nihai hüküm değildir" : "Not a final determination",
                    ].map((item, i, arr) => (
                      <span key={i}>{item}{i < arr.length - 1 ? <span style={{ margin: "0 0.25rem", color: "var(--text-dim)" }}> ·</span> : null}</span>
                    ))}
                  </div>
                  {(selectedCase.demoNoticeTr || selectedCase.demoNoticeEn) && (
                    <span style={{ color: "var(--text-dim)" }}>
                      {language === "tr" ? selectedCase.demoNoticeTr : selectedCase.demoNoticeEn}
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* 1) Review Stage */}
            <section style={{ marginBottom: UI.sectionGap }} aria-labelledby="stage-heading">
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: UI.radius.md,
                  borderLeft: `3px solid ${reviewTone.borderColor}`,
                  background: "var(--panel)",
                  overflow: "hidden",
                }}
              >
                {/* Stage header row */}
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderBottom: `1px solid ${"var(--border-muted)"}`,
                    background: "var(--panel-raised)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <span
                    id="stage-heading"
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.62rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      fontWeight: 600,
                    }}
                  >
                    {language === "tr" ? "review_stage" : "review_stage"}
                  </span>
                  {/* State badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: reviewTone.borderColor,
                        boxShadow: `0 0 5px ${reviewTone.borderColor}60`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: reviewTone.color,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {visibleReviewState ?? "UNREVIEWED"}
                    </span>
                  </div>
                </div>
                {/* Stage body */}
                <div style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: "0.6rem" }}>
                    {selectedCase?.scenarioFrame ??
                      selectedScenario ??
                      (language === "tr" ? "Senaryo seçilmedi" : "No scenario selected")}
                  </div>
                  {selectedEventCard && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {[
                        { label: "SYS", value: selectedSystem.toUpperCase() },
                        { label: "EVT", value: selectedEventCard.eventId },
                        ...(selectedCase?.incidentClass ? [{ label: "CLASS", value: selectedCase.incidentClass }] : []),
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: UI.radius.xs,
                            background: "var(--panel-card)",
                            border: `1px solid ${"var(--border-muted)"}`,
                          }}
                        >
                          <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "var(--text-dim)", letterSpacing: "0.08em" }}>{label}</span>
                          <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2) Incident stage */}
            {selectedCase && (
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.sm,
                  background: "var(--panel-card)",
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <div style={{ padding: "0.7rem 1rem", borderRight: `1px solid ${"var(--border-muted)"}` }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>
                    {language === "tr" ? "incident_class" : "incident_class"}
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-soft)" }}>{selectedCase.incidentClass}</div>
                </div>
                <div style={{ padding: "0.7rem 1rem" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>
                    {language === "tr" ? "scenario_frame" : "scenario_frame"}
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-soft)" }}>{selectedCase.scenarioFrame}</div>
                </div>
              </div>
            </section>
            )}

            {/* 3) Identity chain */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.sm,
                  background: "var(--panel-card)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderBottom: `1px solid ${"var(--border-muted)"}`,
                    background: "var(--panel)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600 }}>
                    {language === "tr" ? "identity_chain" : "identity_chain"}
                  </span>
                  {!isVehicle && (
                    <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "var(--text-dim)", marginLeft: "auto" }}>demo</span>
                  )}
                </div>
                {selectedEventCard ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0,
                    }}
                  >
                    {[
                      { key: "event_id", value: selectedEventCard.eventId },
                      { key: "bundle_id", value: isVehicle && identity ? identity.bundle_id : selectedEventCard.bundleId ?? "—" },
                      { key: "manifest_id", value: isVehicle && identity ? identity.manifest_id : selectedEventCard.manifestId ?? "—" },
                      ...(isVehicle && transcriptId ? [{ key: "trace_id", value: transcriptId }] : []),
                      ...(isVehicle && verificationRunId ? [{ key: "run_id", value: verificationRunId }] : []),
                    ].map((item, i) => (
                      <div
                        key={item.key}
                        style={{
                          padding: "0.55rem 0.85rem",
                          borderRight: i % 3 < 2 ? `1px solid ${"var(--border-muted)"}` : "none",
                          borderBottom: `1px solid ${"var(--border-muted)"}`,
                          minWidth: 0,
                          flex: "1 1 33%",
                        }}
                      >
                        <div style={{ fontFamily: MONO, fontSize: "0.56rem", letterSpacing: "0.08em", textTransform: "lowercase", color: "var(--text-dim)", marginBottom: "0.15rem" }}>
                          {item.key}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--text-soft)", fontWeight: 600, wordBreak: "break-all" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "0.75rem 0.85rem", fontSize: "0.78rem", color: "var(--text-dim)" }}>
                    {language === "tr" ? "Olay seçilmedi." : "No event selected."}
                  </div>
                )}
              </div>
            </section>

            {/* 4) Incident Summary — primary reference panel */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: UI.radius.md,
                  borderLeft: "3px solid var(--accent)",
                  background: "var(--panel)",
                  overflow: "hidden",
                }}
              >
                {/* Panel header */}
                <div
                  style={{
                    padding: "0.55rem 1.15rem",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--panel-raised)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ width: 3, height: 12, borderRadius: 1, background: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600 }}>
                    {language === "tr" ? "incident_summary" : "incident_summary"}
                  </span>
                </div>
                {/* Panel body */}
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
                      <div>
                        {/* Case context — system + scenario frame */}
                        {selectedCase && (
                          <div style={{ padding: "0.6rem 1.15rem", borderBottom: `1px solid ${"var(--border-muted)"}`, background: "var(--panel-card)" }}>
                            <div style={{ fontFamily: MONO, fontSize: "0.54rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>
                              {language === "tr" ? "vaka_bağlamı" : "case_context"}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: MONO }}>
                              {selectedSystem} · {selectedEventCard.title}
                            </p>
                          </div>
                        )}
                        {/* What happened — full width primary */}
                        <div style={{ padding: "1rem 1.15rem", borderBottom: `1px solid ${"var(--border-muted)"}` }}>
                          <div style={{ fontFamily: MONO, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.4rem" }}>
                            {language === "tr" ? "what_happened" : "what_happened"}
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "0.9rem", fontWeight: 500, color: "var(--text)" }}>{sum.what}</p>
                        </div>
                        {/* Why + state in 2 columns */}
                        {(sum.why || sum.state) && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${"var(--border-muted)"}` }}>
                            {sum.why && (
                              <div style={{ padding: "0.75rem 1.15rem", borderRight: `1px solid ${"var(--border-muted)"}` }}>
                                <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.3rem" }}>
                                  {language === "tr" ? "why_under_review" : "why_under_review"}
                                </div>
                                <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.78rem", color: "var(--text-soft)" }}>{sum.why}</p>
                              </div>
                            )}
                            {sum.state && (
                              <div style={{ padding: "0.75rem 1.15rem" }}>
                                <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.3rem" }}>
                                  {language === "tr" ? "review_state" : "review_state"}
                                </div>
                                <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.82rem", color: "var(--text-soft)", fontWeight: 700, fontFamily: MONO }}>{sum.state}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Safe next step */}
                        {sum.next && (
                          <div style={{ padding: "0.65rem 1.15rem", background: "var(--panel-card)" }}>
                            <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>
                              {language === "tr" ? "safe_next_step" : "safe_next_step"}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.76rem", color: "var(--text-muted)" }}>{sum.next}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ padding: "1rem 1.15rem", color: "var(--text-dim)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    {language === "tr"
                      ? "Olay özeti için sol omurgadan bir olay seçin. Seçim yapıldığında vaka bağlamı, ne oldu, neden incelemede ve güvenli sonraki adım gösterilir."
                      : "Select an event in the left spine for incident summary. Once selected, case context, what happened, why under review, and safe next step are shown."}
                  </div>
                )}
              </div>
            </section>

            {/* ── Doctrine Spine ── */}
            <div
              style={{
                borderLeft: `2px solid ${"var(--accent-border)"}`,
                paddingLeft: "1.25rem",
                marginLeft: "0.1rem",
              }}
            >
              <div style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "1.25rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: 0.85,
              }}>
                {language === "tr" ? "// doctrine_spine" : "// doctrine_spine"}
              </div>
            {/* 5) Evidence Layers */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  padding: "0.45rem 0.8rem",
                  marginBottom: "0.75rem",
                  background: "var(--panel-card)",
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.xs,
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  lineHeight: 1.55,
                  color: "var(--text-dim)",
                }}
              >
                {language === "tr"
                  ? "// recorded: ham kayıt katmanı | derived: ikinci katman | karıştırılmaz"
                  : "// recorded: raw layer | derived: second layer | not blended"}
              </div>
              {selectedEventCard ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* A. Recorded Evidence */}
                  <div
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: UI.radius.md,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.55rem 1rem",
                        background: "var(--panel-raised)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.6rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--success)", flexShrink: 0 }} />
                        <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)" }}>
                          {language === "tr" ? "recorded_evidence" : "recorded_evidence"}
                        </span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: "var(--text-dim)" }}>
                        {language === "tr" ? "ham_katman" : "raw_layer"}
                      </span>
                    </div>
                    <div style={{ padding: "0.85rem 1rem" }}>
                      <p style={{ margin: "0 0 0.65rem", fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", lineHeight: 1.55 }}>
                        {language === "tr"
                          ? `manifest: ${manifestAnchorId}`
                          : `manifest: ${manifestAnchorId}`}
                      </p>
                      {(() => {
                        if (visibleRecorded.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-dim)" }}>
                              {language === "tr" ? "Kayıtlı delil yok." : "No recorded evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {visibleRecorded.map((r, i) => (
                              <div key={i} style={{ borderRadius: UI.radius.xs, border: `1px solid ${"var(--border-muted)"}`, overflow: "hidden" }}>
                                <div style={{ padding: "0.4rem 0.65rem", background: "var(--panel-raised)", borderBottom: `1px solid ${"var(--border-muted)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                  <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-soft)" }}>{r.source}</span>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.55rem",
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: UI.radius.xs,
                                      background: r.status === "verified" ? "var(--success-soft)" : "var(--border-subtle)",
                                      color: r.status === "verified" ? "var(--success)" : "var(--text-muted)",
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                      border: `1px solid ${r.status === "verified" ? "var(--success-border)" : "var(--border-muted)"}`,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                                <div style={{ padding: "0.4rem 0.65rem", background: "var(--bg)" }}>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-soft)", lineHeight: 1.5, marginBottom: "0.3rem" }}>{r.description}</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem 0.75rem", fontFamily: MONO, fontSize: "0.6rem", color: "var(--text-dim)" }}>
                                    <span>ts:{r.timestamp}</span>
                                    <span>ref:{r.referenceId}</span>
                                  </div>
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
                      border: "1px solid var(--border)",
                      borderRadius: UI.radius.md,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.55rem 1rem",
                        background: "var(--panel-raised)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.6rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--warning)", flexShrink: 0 }} />
                        <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)" }}>
                          {language === "tr" ? "derived_assessment" : "derived_assessment"}
                        </span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: "var(--text-dim)" }}>
                        {language === "tr" ? "ikinci_katman" : "second_layer"}
                      </span>
                    </div>
                    <div style={{ padding: "0.85rem 1rem" }}>
                      <p style={{ margin: "0 0 0.65rem", fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", lineHeight: 1.55 }}>
                        {language === "tr"
                          ? "// kayıtlıdan türetilir; yerini almaz; nihai hüküm değildir"
                          : "// derived from recorded; does not replace it; not a determination"}
                      </p>
                      {(() => {
                        const derived =
                          selectedCase?.derivedAssessment?.length
                            ? toDerivedRows(selectedCase.derivedAssessment)
                            : [];
                        if (derived.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-dim)" }}>
                              {language === "tr" ? "Türetilmiş delil yok." : "No derived evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {derived.map((d, i) => (
                              <div key={i} style={{ borderRadius: UI.radius.xs, border: `1px solid ${"var(--border-muted)"}`, overflow: "hidden" }}>
                                <div style={{ padding: "0.4rem 0.65rem", background: "var(--panel-raised)", borderBottom: `1px solid ${"var(--border-muted)"}` }}>
                                  <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-soft)" }}>{d.type}</span>
                                </div>
                                <div style={{ padding: "0.4rem 0.65rem", background: "var(--bg)" }}>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-soft)", lineHeight: 1.5, marginBottom: "0.3rem" }}>{d.explanation}</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem 0.75rem", fontFamily: MONO, fontSize: "0.6rem", color: "var(--text-dim)" }}>
                                    <span>basis:{d.basisReferences}</span>
                                    <span>conf:{d.confidence}</span>
                                    <span>profile:{d.profileRelevance}</span>
                                  </div>
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
                    border: "1px solid var(--border)",
                    borderRadius: UI.radius.md,
                    padding: "0.85rem 1rem",
                    fontSize: "0.8rem",
                    background: "var(--panel)",
                    color: "var(--text-soft)",
                    lineHeight: 1.55,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    {language === "tr"
                      ? "Kayıtlı ve türetilmiş delil katmanları için sol omurgadan bir olay seçin. Katmanlar karıştırılmaz; doğrulama izi ve issuance buna bağlıdır."
                      : "Select an event in the left spine to view recorded and derived evidence layers. Layers are not blended; verification trace and issuance depend on them."}
                  </p>
                </div>
              )}
            </section>

            {/* 5b) Unknown / Disputed */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${"var(--error)"}`,
                  borderRadius: UI.radius.md,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.55rem 1rem",
                    background: "var(--panel-raised)",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--error)", flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)" }}>
                      {language === "tr" ? "unknown_disputed" : "unknown_disputed"}
                    </span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: "var(--text-dim)" }}>
                    {language === "tr" ? "insan_incelemesi" : "human_review_required"}
                  </span>
                </div>
                <div style={{ padding: "0.85rem 1rem", background: "var(--panel)", fontSize: "0.8rem" }}>
                  {selectedEventCard ? (
                    <>
                      {verificationState === "UNKNOWN" && (
                        <div
                          style={{
                            marginBottom: "0.75rem",
                            padding: "0.5rem 0.7rem",
                            borderLeft: `2px solid ${"var(--warning)"}`,
                            background: "var(--warning-soft)",
                            borderRadius: UI.radius.xs,
                          }}
                        >
                          <div style={{ fontFamily: MONO, fontSize: "0.65rem", fontWeight: 700, color: "var(--warning)", marginBottom: "0.15rem" }}>
                            state: UNKNOWN
                          </div>
                          <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                            {language === "tr" ? "İnsan incelemesi gerekir." : "Requires human review."}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {visibleUnknownItems.length ? (
                          visibleUnknownItems.map((item, i) => (
                            <div key={i} style={{ borderRadius: UI.radius.xs, border: `1px solid ${"var(--border-muted)"}`, overflow: "hidden" }}>
                              <div style={{ padding: "0.45rem 0.65rem", background: "var(--bg)" }}>
                                <div style={{ fontSize: "0.78rem", lineHeight: 1.55, color: "var(--text-soft)" }}>{item}</div>
                              </div>
                              <div style={{ padding: "0.25rem 0.65rem", background: "var(--panel-card)", borderTop: `1px solid ${"var(--border-muted)"}` }}>
                                <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: "var(--text-dim)" }}>
                                  {language === "tr" ? "requires: human_review" : "requires: human_review"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : verificationState === "UNKNOWN" ? (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {language === "tr"
                              ? "Bu çalıştırma için doğrulama sonucu belirsiz; insan incelemesi gerekir."
                              : "Verification outcome unknown for this run; requires human review."}
                          </div>
                        ) : (
                          <div style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                            {language === "tr"
                              ? "Bu vaka için çözülmemiş madde yok; iz ve issuance insan incelemesi gerektiğinde buna koşullu kalır."
                              : "No unresolved items for this case; trace and issuance remain conditioned on human review where applicable."}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                      {language === "tr"
                        ? "Bilinmeyen / çekişmeli alanı için sol omurgadan bir olay seçin."
                        : "Select an event in the left spine for unknown / disputed items."}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 6) Verification Trace */}
            <section style={{ marginBottom: UI.sectionGap }} aria-labelledby="verification-trace-heading">
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${"var(--blue)"}`,
                  borderRadius: UI.radius.md,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.55rem 1rem",
                    background: "var(--panel-raised)",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--blue)", flexShrink: 0 }} />
                    <span id="verification-trace-heading" style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)" }}>
                      {language === "tr" ? "verification_trace" : "verification_trace"}
                    </span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: "var(--text-dim)" }}>
                    {language === "tr" ? "nihai_hüküm_değildir" : "not_a_determination"}
                  </span>
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
                        {/* Protocol chain */}
                        <div
                          style={{
                            padding: "0.45rem 1rem",
                            borderBottom: `1px solid ${"var(--border-muted)"}`,
                            fontFamily: MONO,
                            fontSize: "0.62rem",
                            color: "var(--text-dim)",
                            background: "var(--panel-card)",
                            lineHeight: 1.6,
                          }}
                        >
                          {`manifest:${manifestAnchorId} → trace:${isVehicle ? transcriptId ?? "pending" : "demo"} → ${hasConnectedIssuanceProfile ? "bounded_issuance:available" : "issuance:not_connected"}`}
                        </div>
                        <div
                          style={{
                            padding: "0.35rem 1rem",
                            borderBottom: `1px solid ${"var(--border-muted)"}`,
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            background: "var(--panel)",
                            lineHeight: 1.5,
                          }}
                        >
                          {language === "tr"
                            ? "Vaka bağlı inceleme adımları; sonuç gerçek veya hüküm değildir."
                            : "Case-bound examination steps; outcome is not truth or verdict."}
                        </div>
                        {/* Trace step rows */}
                        <div style={{ background: "var(--panel)" }}>
                          {traceStepRows.map((row, i) => {
                            const { text, honesty } = normalizeResult(row.status);
                            const stateLabel = honesty === "pass" ? "pass" : honesty === "unresolved" ? "unresolved" : "partial";
                            const stepColor = honesty === "unresolved" ? "var(--warning)" : honesty === "partial" ? "#F59E0B" : "var(--success)";
                            const stepBg = honesty === "unresolved" ? "var(--warning-soft)" : honesty === "partial" ? "rgba(245, 158, 11, 0.08)" : "var(--success-soft)";
                            return (
                              <div
                                key={i}
                                style={{
                                  padding: "0.55rem 1rem",
                                  borderBottom: i < traceStepRows.length - 1 ? `1px solid ${"var(--border-muted)"}` : "none",
                                  display: "grid",
                                  gridTemplateColumns: "1fr auto",
                                  gap: "0.25rem 1rem",
                                  alignItems: "center",
                                  background: i % 2 === 0 ? "var(--panel)" : "var(--panel-card)",
                                }}
                              >
                                <div>
                                  <div style={{ fontFamily: SANS, fontSize: "0.78rem", fontWeight: 500, color: "var(--text-soft)" }}>{row.label}</div>
                                  {row.note && (
                                    <div style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>
                                      {row.note}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "var(--text-muted)" }}>{text}</span>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.55rem",
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: UI.radius.xs,
                                      background: stepBg,
                                      color: stepColor,
                                      fontWeight: 700,
                                      letterSpacing: "0.06em",
                                      textTransform: "uppercase",
                                      border: `1px solid ${stepColor}25`,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {stateLabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Doctrine footer */}
                        <div
                          style={{
                            padding: "0.45rem 1rem",
                            borderTop: `1px solid ${"var(--border-muted)"}`,
                            fontFamily: MONO,
                            fontSize: "0.6rem",
                            color: "var(--text-dim)",
                            background: "var(--panel-card)",
                            lineHeight: 1.5,
                          }}
                        >
                          {language === "tr"
                            ? "// manifest_bound | unknown/disputed üstünde değil | nihai_hüküm_değildir"
                            : "// manifest_bound | does_not_outrank_unknown | not_a_determination"}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div style={{ padding: "0.75rem 1rem", fontFamily: MONO, fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                    {language === "tr"
                      ? "Doğrulama izi için sol omurgadan bir olay seçin. İz, kayıtlı ve türetilmiş zincirle bağlıdır; nihai hüküm değildir."
                      : "Select an event in the left spine for verification trace. Trace is bound to recorded and derived chain; not a determination."}
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
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.xs,
                  padding: "0.4rem 0.85rem",
                  background: "var(--panel-card)",
                  fontFamily: MONO,
                  fontSize: "0.62rem",
                  color: "var(--text-dim)",
                }}
              >
                {`// review_assistant: reserved | not_active_in_current_release`}
              </div>
            </section>

            {/* 7) Verification / export flow */}
            <section style={{ marginBottom: UI.sectionGap }}>
              {selectedEventCard && (
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{language === "tr" ? "Seçili:" : "Selected:"}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-soft)", fontFamily: "monospace", fontSize: "0.74rem" }}>{selectedEventCard.eventId}</span>
                  <span style={{ color: "var(--text-dim)" }}>— {selectedEventCard.title}</span>
                </div>
              )}
              {selectedCase && (() => {
                const gate = evaluateGoldenAcceptance(selectedCase);
                return (
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
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
                      background: "var(--panel)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
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
                          border: loading ? "1px solid var(--border-strong)" : "1px solid var(--accent)",
                          background: loading ? "var(--panel-card)" : "var(--accent-soft)",
                          color: "var(--text)",
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
                              border: `2px solid ${"var(--text-muted)"}`,
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
                            color: "var(--text-muted)",
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
                      {!loading && verificationError && <strong style={{ color: "var(--error)" }}>{verificationError}</strong>}
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
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                    background: "var(--panel-raised)",
                    color: "var(--text-soft)",
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
                border: loading ? "1px solid var(--accent)" : undefined,
                borderRadius: 6,
                padding: loading ? "0.75rem 1rem" : undefined,
                background: loading ? "var(--accent-soft)" : undefined,
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
                    color: "var(--text-muted)",
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: `2px solid ${"var(--text-muted)"}`,
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
                    border: verificationJustCompleted ? "1px solid var(--success)" : "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    transition: "border-color 0.3s ease",
                    boxShadow: verificationJustCompleted ? `0 0 0 1px ${"var(--success-border)"}` : undefined,
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
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "var(--panel-raised)",
                  }}
                >
                  {selectedCase.axisusStates.map((s, idx) => (
                    <div
                      key={s.id}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderBottom:
                          idx < selectedCase.axisusStates!.length - 1 ? "1px solid var(--border-soft)" : "none",
                        fontSize: "0.78rem",
                        color: "var(--text)",
                        borderLeft:
                          s.severity === "handoff"
                            ? `3px solid ${"var(--border-strong)"}`
                            : s.severity === "limit"
                            ? `3px solid ${"var(--border)"}`
                            : "3px solid var(--accent)",
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
            <div style={{ borderLeft: `2px solid ${"var(--accent-border)"}`, paddingLeft: "1.25rem", marginLeft: "0.1rem", marginTop: "0.5rem" }}>
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: "var(--accent)",
                  marginBottom: "0.65rem",
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                {language === "tr" ? "// artifact_issuance" : "// artifact_issuance"}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.62rem",
                  color: "var(--text-dim)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.6,
                  padding: "0.4rem 0.75rem",
                  background: "var(--panel-card)",
                  borderRadius: UI.radius.xs,
                  border: `1px solid ${"var(--border-muted)"}`,
                }}
              >
                {language === "tr"
                  ? "// conditioned_on: trace + open_unknowns | does_not_override"
                  : "// conditioned_on: trace + open_unknowns | does_not_override"}
              </div>
              {!selectedCase ? (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: UI.radius.md,
                    padding: "0.85rem 1rem",
                    fontSize: "0.8rem",
                    background: "var(--panel)",
                    color: "var(--text-soft)",
                    lineHeight: 1.55,
                  }}
                >
                  <p style={{ margin: 0, marginBottom: "0.35rem" }}>
                    {language === "tr"
                      ? "Belge üretimi için sol omurgadan bir olay seçin."
                      : "Select an event in the left spine for artifact issuance."}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {language === "tr"
                      ? "Issuance rol ve iz ile sınırlıdır; bilinmeyen/çekişmeli alanın veya nihai hükmün yerini almaz."
                      : "Issuance is role- and trace-bound; it does not override unknown/disputed or produce a final ruling."}
                  </p>
                </div>
              ) : selectedCase.artifactProfiles && selectedCase.artifactProfiles.length > 0 ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "1rem", background: "var(--panel-raised)" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    {language === "tr"
                      ? "Bu çıktı nihai hukukî veya olgusal hüküm değildir. Issuance kullanılabilirliği, gerçeklik iddiası anlamına gelmez."
                      : "This output is not a final legal or factual determination. Issuance availability does not imply a truth claim."}
                  </p>
                    <div
                      style={{
                        marginBottom: "0.85rem",
                        padding: "0.65rem 0.75rem",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        background: "var(--panel-card)",
                        fontSize: "0.76rem",
                        lineHeight: 1.5,
                        color: "var(--text)",
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
                    <div
                      style={{
                        marginBottom: "0.75rem",
                        padding: "0.4rem 0.75rem",
                        fontFamily: MONO,
                        fontSize: "0.6rem",
                        letterSpacing: "0.08em",
                        color: "var(--text-dim)",
                        background: "var(--panel-card)",
                        borderRadius: UI.radius.xs,
                        border: `1px solid ${"var(--border-muted)"}`,
                        lineHeight: 1.5,
                      }}
                    >
                      {language === "tr"
                        ? "Trace’e bağlı artifact · Rol sınırlı çıktı · Nihai hüküm değildir."
                        : "Trace-linked artifact · Role-bound output · Not a determination."}
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
                            borderLeft: `2px solid ${"var(--border)"}`,
                            padding: "0.5rem 0.6rem",
                            background: "var(--panel-card)",
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
                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
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
                              border: exportProfile === "claims" ? `1px solid ${"var(--accent-border)"}` : "1px solid var(--border)",
                              background: exportProfile === "claims" ? "var(--accent-soft)" : "var(--panel)",
                              color: "var(--text)",
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
                              border: exportProfile === "legal" ? `1px solid ${"var(--accent-border)"}` : "1px solid var(--border)",
                              background: exportProfile === "legal" ? "var(--accent-soft)" : "var(--panel)",
                              color: "var(--text)",
                              cursor: exportLoading ? "not-allowed" : "pointer",
                              opacity: exportLoading ? 0.6 : 1,
                              fontWeight: exportProfile === "legal" ? 700 : 500,
                            }}
                          >
                            {language === "tr" ? "Hukukî inceleme" : "Legal"}
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.5rem 0 0.35rem", lineHeight: 1.5 }}>
                        {language === "tr"
                          ? "Kontrollü issuance: artifact manifest ve iz ile sınırlı kalır; suçlama veya nihai hüküm değildir."
                          : "Controlled issuance: artifact remains bound to manifest and trace; not a blame or final verdict."}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={runExportJson}
                          disabled={!selectedId || !!exportLoading}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.55rem 0.95rem",
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            background: "var(--panel)",
                            color: "var(--text)",
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
                            border: "1px solid var(--border)",
                            background: "var(--panel)",
                            color: "var(--text)",
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
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.65rem", lineHeight: 1.5 }}>
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
                                ? "1px solid var(--success)"
                                : issuanceState === "error"
                                ? "1px solid var(--error)"
                                : "1px solid var(--border-strong)",
                            background:
                              issuanceState === "success"
                                ? "var(--success-soft)"
                                : issuanceState === "error"
                                ? "var(--error-soft)"
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
                                  ? "var(--success)"
                                  : issuanceState === "error"
                                  ? "var(--error)"
                                  : "var(--text-soft)",
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
                              color: "var(--text-soft)",
                              lineHeight: 1.5,
                            }}
                          >
                            {issuanceState === "success"
                              ? language === "tr"
                                ? `Seçili ${selectedProfileLabel} profili için artifact zincire bağlı olarak üretildi. Kimlik ve purpose alanları aşağıda görünür. Artifact doğrulama izi ve manifeste bağlıdır; bilinmeyen/çekişmeli alanın yerini almaz.`
                                : `The selected ${selectedProfileLabel} artifact was issued while staying bound to the chain. Identity and purpose fields are visible below. Artifact is bound to the verification trace and manifest; it does not replace or outrank unknown/disputed items.`
                              : issuanceState === "error"
                              ? language === "tr"
                                ? "Receipt/export hattı bu denemede kullanıcıya dönük bir sonuç üretemedi."
                                : "The receipt/export path did not produce a user-facing result for this attempt."
                              : language === "tr"
                              ? `Seçili ${selectedProfileLabel} profili için ${selectedFormat?.toUpperCase() ?? "artifact"} hazırlanıyor.`
                              : `Preparing ${selectedFormat?.toUpperCase() ?? "artifact"} for the selected ${selectedProfileLabel} profile.`}
                          </p>
                          {lastIssuedArtifact?.localPreview ? (
                            <p
                              style={{
                                margin: "0.45rem 0 0",
                                fontSize: "0.74rem",
                                color: "var(--warning)",
                                lineHeight: 1.55,
                              }}
                            >
                              {language === "tr"
                                ? `Yerel önizleme fallback aktif (${lastIssuedArtifact.previewReason ?? "backend_unreachable"}). Bu çıktı görsel kabul içindir; backend doğrulaması iddiası taşımaz.`
                                : `Local preview fallback active (${lastIssuedArtifact.previewReason ?? "backend_unreachable"}). This output is for visual acceptance only and does not claim backend verification.`}
                            </p>
                          ) : null}
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
                                      color: "var(--text-muted)",
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
                          {lastIssuedArtifact && issuanceState === "success"
                            ? (() => {
                                const m = MSG[language];
                                const meta = lastIssuedArtifact.meta;
                                const { primary } = resolveIssuanceDocumentFamilies(
                                  meta.export_profile,
                                  selectedSystem
                                );
                                const framing = getInstitutionFraming(issuanceAudience, language);
                                const traceDisplay =
                                  isVehicle && transcriptId
                                    ? transcriptId
                                    : language === "tr"
                                      ? "demo · bağlı iz yok"
                                      : "demo · no live trace id";
                                return (
                                  <div style={{ marginTop: "1.25rem" }}>
                                    <div
                                      style={{
                                        fontSize: "0.72rem",
                                        fontWeight: 600,
                                        marginBottom: "0.45rem",
                                        fontFamily: MONO,
                                      }}
                                    >
                                      {m.verifierIssuancePreviewTitle}
                                    </div>
                                    <label
                                      style={{
                                        display: "block",
                                        fontSize: "0.68rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "0.25rem",
                                      }}
                                    >
                                      {m.verifierAudienceSelect}
                                    </label>
                                    <select
                                      value={issuanceAudience}
                                      onChange={(e) =>
                                        setIssuanceAudience(e.target.value as InstitutionAudienceId)
                                      }
                                      style={{
                                        fontSize: "0.78rem",
                                        padding: "0.35rem 0.5rem",
                                        marginBottom: "1rem",
                                        borderRadius: 6,
                                        border: "1px solid var(--border)",
                                        background: "var(--panel)",
                                        color: "var(--text)",
                                        fontFamily: MONO,
                                        maxWidth: "100%",
                                      }}
                                    >
                                      {INSTITUTION_AUDIENCES.map((id) => (
                                        <option key={id} value={id}>
                                          {institutionAudienceLabel(id, language)}
                                        </option>
                                      ))}
                                    </select>
                                    <DocumentShell
                                      documentType={documentFamilyLabel(primary, language)}
                                      documentId={`QEV-${meta.export_id}`}
                                      eventId={meta.event_id}
                                      bundleId={meta.bundle_id}
                                      manifestId={meta.manifest_id}
                                      manifestRef={meta.manifest_id}
                                      version={meta.schema_version}
                                      generatedAt={lastIssuedAtIso?.slice(0, 10) ?? undefined}
                                      verifiedAt={lastIssuedAtIso ?? undefined}
                                      verificationState={meta.verification_state}
                                      receiptId={meta.receipt_id}
                                      traceRef={traceDisplay}
                                      exportPurpose={meta.export_purpose}
                                      exportProfile={meta.export_profile}
                                      audienceLabel={institutionAudienceLabel(issuanceAudience, language)}
                                      sectorContextLine={sectorIncidentReportLabel(selectedSystem, language)}
                                      institutionHeadingTone={framing.headingTone}
                                      institutionSubtitle={framing.subtitle}
                                      institutionSummary={framing.summaryWording}
                                      institutionMetadataEmphasis={framing.metadataEmphasis}
                                      institutionOutputFraming={framing.outputFraming}
                                    >
                                      <DocumentSection
                                        variant="authority"
                                        title={
                                          language === "tr"
                                            ? "Düzenleme özeti"
                                            : "Issuance summary"
                                        }
                                      >
                                        <p
                                          style={{
                                            margin: "0 0 0.5rem",
                                            fontSize: "0.8rem",
                                            lineHeight: 1.6,
                                          }}
                                        >
                                          {language === "tr"
                                            ? "Bu yüzey, seçilen profil ve muhatap çerçevesiyle protokole bağlı kimlik alanlarını gösterir. Kayıtlı ve türetilmiş kanıt katmanları birleştirilmez."
                                            : "This surface shows protocol-bound identity fields for the selected profile and recipient framing. Recorded and derived evidence layers are not merged."}
                                        </p>
                                      </DocumentSection>
                                      <DocumentMetadataBlock
                                        variant="authority"
                                        label={
                                          language === "tr" ? "Katman ayrımı" : "Layer separation"
                                        }
                                        note={
                                          language === "tr"
                                            ? "Doktrin: kayıtlı ≠ türetilmiş; iz ≠ nihai gerçek; düzenleme ≠ sorumluluk."
                                            : "Doctrine: recorded ≠ derived; trace ≠ final truth; issuance ≠ blame."
                                        }
                                      >
                                        <ul
                                          style={{
                                            margin: 0,
                                            paddingLeft: "1.1rem",
                                            fontSize: "0.78rem",
                                            lineHeight: 1.55,
                                          }}
                                        >
                                          <li>
                                            {language === "tr"
                                              ? "Kusur veya suç isnadı dili kullanılmaz."
                                              : "No fault or criminal-attribution language is used."}
                                          </li>
                                          <li>
                                            {language === "tr"
                                              ? "Çıktı, bounded issuance kurallarına tabidir."
                                              : "Output remains subject to bounded issuance rules."}
                                          </li>
                                        </ul>
                                      </DocumentMetadataBlock>
                                    </DocumentShell>
                                  </div>
                                );
                              })()
                            : null}
                          {exportError && (
                            <p style={{ fontSize: "0.8rem", margin: "0.65rem 0 0", color: "var(--error)" }}>
                              {exportError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : selectedCase?.artifactIssuance?.available && selectedCase?.artifactIssuance?.apiBacked && selected ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "1rem", background: "var(--panel-raised)" }}>
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
                        border: exportProfile === "claims" ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: exportProfile === "claims" ? "var(--accent-soft)" : "var(--panel)",
                        color: "var(--text)",
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
                        border: exportProfile === "legal" ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: exportProfile === "legal" ? "var(--accent-soft)" : "var(--panel)",
                        color: "var(--text)",
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
                        border: "1px solid var(--border)",
                        background: "var(--panel)",
                        color: "var(--text)",
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
                        border: "1px solid var(--border)",
                        background: "var(--panel)",
                        color: "var(--text)",
                        cursor: !selectedId || exportLoading ? "not-allowed" : "pointer",
                        opacity: !selectedId || exportLoading ? 0.6 : 1,
                      }}
                    >
                      {exportLoading === "pdf" ? (language === "tr" ? "Hazırlanıyor…" : "Preparing…") : language === "tr" ? "Issuance — PDF" : "Issue as PDF"}
                    </button>
                  </div>
                  {exportError && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--error)" }}>{exportError}</p>}
                </div>
              ) : (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
                  border: "1px solid var(--border)",
                  borderRadius: UI.radius.md,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "0.5rem 1rem", background: "var(--panel-raised)", borderBottom: `1px solid ${"var(--border-muted)"}` }}>
                  <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--text-dim)", fontWeight: 600 }}>
                    {language === "tr" ? "// why_qaraqutu_is_inevitable" : "// why_qaraqutu_is_inevitable"}
                  </span>
                </div>
              <div
                style={{
                  padding: "1rem 1.15rem",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  background: "var(--panel)",
                  color: "var(--text-soft)",
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
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>
                    {language === "tr"
                      ? "Sol omurgadan bir olay seçin."
                      : "Select an event in the left spine."}
                  </p>
                )}
              </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}


