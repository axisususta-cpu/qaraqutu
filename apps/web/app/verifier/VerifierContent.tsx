"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
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
import { LogoPrimary } from "../components/LogoPrimary";
import { ReconstructionViewport } from "../components/verifier/ReconstructionViewport";
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

// UI now uses CSS custom properties; verifier chassis uses minimal radius
const UI = {
  radius: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2, pill: 999 },
  sectionGap: "1.1rem",
} as const;

const CH = { spinePx: 260, topNavPx: 48 } as const;

type TranscriptStep = VerificationTranscriptEntry;

interface IssuanceRecord {
  format: ExportFormat;
  meta: ExportArtifactResponse;
  localPreview?: boolean;
  previewReason?: string;
}

// Phase 1 mock data scaffolding for future workstation wiring.
type MockSystemId = "vehicle" | "drone" | "robot";
type SourceId = "demo_archive" | "connected_device" | "uploaded_package";

const MOCK_SYSTEMS: { id: MockSystemId; label: string }[] = [
  { id: "vehicle", label: "Vehicle Pack" },
  { id: "drone", label: "Drone Pack" },
  { id: "robot", label: "Robot Pack" },
];

type DemoPackageDef = {
  packageKey: string;
  system: MockSystemId;
  scenarioClass: string;
  title: string;
  summaryTr: string;
  opContextTr: string;
  riskBand: "DUSUK" | "ORTA" | "YUKSEK";
  sceneIdentityTr: string;
  canonicalIndex: number;
};

const DEMO_PACKAGES: DemoPackageDef[] = [
  {
    packageKey: "veh-school-stop-bypass",
    system: "vehicle",
    scenarioClass: "Sinyal ve yol geçiş ihlali",
    title: "School-Zone Stop-Signal Bypass",
    summaryTr: "Okul bölgesi stop çizgisinde sinyal/işaret ihlali paterni gözlendi.",
    opContextTr: "Kentsel şerit, yaya önceliği, düşük hız geçişi.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Şerit · dur çizgisi · kritik geçiş anı",
    canonicalIndex: 0,
  },
  {
    packageKey: "veh-child-crossing-contact",
    system: "vehicle",
    scenarioClass: "Temas ve yaya güvenliği",
    title: "Urban Child-Crossing Contact",
    summaryTr: "Kentsel çocuk geçişinde temas anı ve reaksiyon penceresi incelenir.",
    opContextTr: "Kavşak yaklaşımı, frenleme sırası ve yön değişimi.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Kavşak · temas lokusu · reaksiyon penceresi",
    canonicalIndex: 1,
  },
  {
    packageKey: "veh-signal-direction-pattern",
    system: "vehicle",
    scenarioClass: "Yön ve sinyal uyumu",
    title: "Signal / Direction Violation Pattern",
    summaryTr: "Sinyal kullanım düzeni ile yön değişimi arasında ihlal paterni aranır.",
    opContextTr: "Yol koridoru, manevra ve denetim izi eşleştirmesi.",
    riskBand: "ORTA",
    sceneIdentityTr: "Koridor · yön sapması · sinyal-zaman hizası",
    canonicalIndex: 0,
  },
  {
    packageKey: "drone-wireline-contact",
    system: "drone",
    scenarioClass: "Hat koridoru ihlali",
    title: "Wire-Line Corridor Contact",
    summaryTr: "İletim hattı koridorunda temas riski ve rota sapması incelenir.",
    opContextTr: "Koridor takibi, irtifa bandı ve bağlantı kalitesi.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Koridor · irtifa · hat yakınlığı",
    canonicalIndex: 0,
  },
  {
    packageKey: "drone-airspace-intrusion",
    system: "drone",
    scenarioClass: "Saha sınırı ihlali",
    title: "Protected Airspace Intrusion",
    summaryTr: "Korunan hava sahasına giriş ve sınır ihlali zinciri değerlendirilir.",
    opContextTr: "Görev planı, coğrafi sınır ve operatör devri.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Sınır poligonu · ihlal vektörü · dönüş hattı",
    canonicalIndex: 1,
  },
  {
    packageKey: "drone-uncontrolled-descent",
    system: "drone",
    scenarioClass: "Uçuş stabilitesi",
    title: "Uncontrolled Test-Flight Descent",
    summaryTr: "Test uçuşunda kontrolsüz alçalma ve bağlantı kaybı penceresi incelenir.",
    opContextTr: "Rüzgar etkisi, komut gecikmesi ve failsafe geçişi.",
    riskBand: "ORTA",
    sceneIdentityTr: "İrtifa düşüşü · link-loss · fail-safe tetikleme",
    canonicalIndex: 0,
  },
  {
    packageKey: "robot-surgical-drift",
    system: "robot",
    scenarioClass: "Hassas yönlendirme sapması",
    title: "Surgical Guidance Drift",
    summaryTr: "Hassas yönlendirme görevinde izlenen hat ve gerçek hareket sapması gözlenir.",
    opContextTr: "Sınır bölgede operatör gözetimi ve hareket zarfı kontrolü.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Çalışma zarfı · sapma eğrisi · güvenlik sınırı",
    canonicalIndex: 0,
  },
  {
    packageKey: "robot-public-collapse",
    system: "robot",
    scenarioClass: "Kamusal stabilite olayı",
    title: "Public Stability Collapse",
    summaryTr: "Kamusal bölgede stabilite kaybı ve güvenlik durdurma gecikmesi incelenir.",
    opContextTr: "İnsan yakınlığı, hız limiti ve operatör devralma penceresi.",
    riskBand: "YUKSEK",
    sceneIdentityTr: "Kamusal bölge · denge kaybı · durdurma zinciri",
    canonicalIndex: 1,
  },
  {
    packageKey: "robot-route-barrier-strike",
    system: "robot",
    scenarioClass: "Rota engel çarpması",
    title: "Route-Following Barrier Strike",
    summaryTr: "Rota takip modunda engel bariyere temas paterni incelenir.",
    opContextTr: "Hareket sınırı, çevresel algı ve emniyet durdurma eşiği.",
    riskBand: "ORTA",
    sceneIdentityTr: "Rota çizgisi · bariyer temas noktası · güvenlik zarfı",
    canonicalIndex: 1,
  },
];

function getScenarioClassesBySystem(system: MockSystemId): string[] {
  const set = new Set(DEMO_PACKAGES.filter((p) => p.system === system).map((p) => p.scenarioClass));
  return Array.from(set);
}

function resolveInitialSystem(eventId?: string): MockSystemId {
  if (!eventId) return "vehicle";
  const c = getCanonicalCaseByEventId(eventId);
  return (c?.system as MockSystemId) ?? "vehicle";
}

// Unified event card shape (Vehicle from API, Drone/Robot from mock).
interface EventCard {
  eventId: string;
  title: string;
  summary: string;
  identity?: string;
  timestamp: string;
  severity: string;
  state: string;
  availableOutputs: string[];
  bundleId?: string;
  manifestId?: string;
}

/** Map canonical case to EventCard for spine display. */
function caseToEventCard(
  c: {
    eventId: string;
    scenarioFrame: string;
    summary: string;
    summaryTr?: string;
    occurredAt: string;
    verificationState: string;
    bundleId: string;
    manifestId: string;
    artifactIssuance: { available: boolean };
  },
  lang: "en" | "tr"
): EventCard {
  const severity = c.verificationState === "FAIL" ? "high" : c.verificationState === "PASS" ? "low" : "medium";
  const outputs = c.artifactIssuance.available ? ["Claims artifact", "Legal artifact", "Trace"] : ["Demo context"];
  const summary = lang === "tr" && c.summaryTr ? c.summaryTr : c.summary;
  return {
    eventId: c.eventId,
    title: c.scenarioFrame,
    summary,
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
  const whyFromCase = undefined;
  const nextFromCase = undefined;

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
            ? "Doğrulamayı çalıştırın veya kontrollü belge çıktısı başlatın."
            : "Run verification or start controlled artifact."
          : language === "tr"
          ? "İz özetini inceleyin veya sınırlı belge düzenlemesi başlatın."
          : "Review trace summary or start bounded artifact issuance."),
    };
  }
  if ((system === "drone" || system === "robot") && verificationState) {
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
    return {
      what: eventCard.summary,
      why: system === "drone" ? droneWhy : robotWhy,
      state: verificationState,
      next:
        nextFromCase ??
        (verificationState === "UNVERIFIED" || verificationState === "UNKNOWN"
          ? language === "tr"
            ? "Doğrulamayı çalıştırın veya kontrollü belge çıktısı başlatın."
            : "Run verification or start controlled artifact."
          : language === "tr"
          ? "İz özetini inceleyin veya sınırlı belge düzenlemesi başlatın."
          : "Review trace summary or start bounded artifact issuance."),
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

function toRecordedRows(items: RecordedEvidenceItem[], lang: "en" | "tr"): RecordedEvidenceRow[] {
  return items.map((r) => {
    const label =
      lang === "tr" && r.displayLabelTr
        ? r.displayLabelTr
        : r.displayLabel || `${r.sourceType} / ${r.sourceId}`;
    return {
      source: label,
      timestamp: r.capturedAt,
      description: label,
      referenceId: r.recordId,
      status: r.originConfidence >= 0.9 ? "verified" : "recorded",
    };
  });
}

function toDerivedRows(items: DerivedEvidenceItem[], lang: "en" | "tr"): DerivedEvidenceRow[] {
  return items.map((d) => ({
    type:
      lang === "tr" && d.displayLabelTr
        ? d.displayLabelTr
        : d.derivedType || d.displayLabel,
    basisReferences: (d.derivedFrom || d.sourceDependencies || []).join(", ") || "—",
    explanation:
      lang === "tr" && d.humanSummaryTr
        ? d.humanSummaryTr
        : d.humanSummary || d.derivationNote || "—",
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
  _system: MockSystemId,
  transcript: TranscriptStep[] | null,
  verificationState: VerificationState | null,
  language: "en" | "tr"
): TranscriptStepRow[] {
  const canonicalLabels = CANONICAL_STEP_LABELS.map((s) => (language === "tr" ? s.tr : s.en));
  if (transcript && transcript.length > 0) {
    return transcript.map((step) => ({
      label: step.check,
      status: step.result,
      time: undefined,
      note: step.note || undefined,
    }));
  }
  if (verificationState) {
    return canonicalLabels.map((label, i) => ({
      label,
      status: i < canonicalLabels.length - 1 ? "OK" : verificationState,
      time: undefined,
      note: undefined,
    }));
  }
  return canonicalLabels.map((label) => ({
    label,
    status: "pending",
    time: undefined,
    note: language === "tr" ? "Doğrulama çalıştırılmadı." : "Verification not run.",
  }));
}

function getVisibleUnknownItems(
  caseId: string | undefined,
  items: string[] | undefined,
  itemsTr: string[] | undefined,
  language: "en" | "tr"
): string[] {
  if (language === "tr") return itemsTr?.length ? itemsTr : items ?? [];

  return items ?? [];
}

/** User-facing protocol state: API may emit UNVERIFIED; surface shows UNREVIEWED. */
function displayProtocolState(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "UNREVIEWED";
  if (raw === "UNVERIFIED") return "UNREVIEWED";
  return raw;
}

function protocolStatePillStyle(label: string): CSSProperties {
  const key = label.toUpperCase();
  const base: CSSProperties = {
    fontFamily: MONO,
    fontSize: "0.76rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "0.28rem 0.55rem",
    borderRadius: 2,
    border: "1px solid",
    display: "inline-block",
    minWidth: "5.5rem",
    textAlign: "center",
    lineHeight: 1.2,
  };
  if (key === "PASS") {
    return {
      ...base,
      borderColor: "var(--success)",
      background: "var(--success-soft)",
      color: "var(--success)",
    };
  }
  if (key === "FAIL") {
    return {
      ...base,
      borderColor: "var(--error)",
      background: "var(--error-soft)",
      color: "var(--error)",
    };
  }
  if (key === "UNKNOWN") {
    return {
      ...base,
      borderColor: "var(--warning)",
      background: "var(--warning-soft)",
      color: "var(--warning)",
    };
  }
  if (key === "DISPUTED") {
    return {
      ...base,
      borderColor: "#b45309",
      background: "rgba(180, 83, 9, 0.12)",
      color: "#9a3412",
    };
  }
  return {
    ...base,
    borderColor: "var(--border-strong)",
    background: "var(--panel-raised)",
    color: "var(--text-muted)",
  };
}

export function VerifierContent({ initialEventId }: { initialEventId?: string }) {
  const { lang: language, setLang: setLanguage } = useLanguage();
  const { mode, toggle: toggleTheme } = useTheme();
  const [selectedSource, setSelectedSource] = useState<SourceId>("demo_archive");
  const [selectedSystem, setSelectedSystem] = useState<MockSystemId>(() => resolveInitialSystem(initialEventId));
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeSpineSection, setActiveSpineSection] = useState<string>("source");
  type ReviewTabId = "scene" | "recorded" | "derived" | "unknownDisputed" | "transcript" | "issuance";
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTabId>("scene");
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

  /** New event selection must not inherit verify/export identity from a previous package. */
  useEffect(() => {
    setVerificationState(null);
    setTranscript(null);
    setIdentity(null);
    setVerificationRunId(null);
    setTranscriptId(null);
    setVerificationError(null);
    setVerificationJustCompleted(false);
    setLastIssuedArtifact(null);
    setIssuanceState("idle");
    setExportError(null);
    setLastIssuedAtIso(null);
  }, [selectedEventId]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/v1/events`);
      const json = await res.json();
      const items: CanonicalEvent[] = json.items ?? [];
      setEvents(items);
      const requestedId = initialEventId ?? null;
      if (!requestedId) return;
      const match = items.find((ev) => ev.eventId === requestedId);
      if (match) {
        setSelectedId(match.eventId);
        setSelectedEventId(match.eventId);
        const canon = getCanonicalCaseByEventId(match.eventId);
        if (canon) {
          setSelectedSource("demo_archive");
          setSelectedSystem(canon.system as MockSystemId);
          const pkg = DEMO_PACKAGES.find((p) => p.system === (canon.system as MockSystemId) && getCanonicalCases(canon.system as MockSystemId)[p.canonicalIndex]?.eventId === match.eventId);
          setSelectedScenario(pkg?.scenarioClass ?? null);
        }
      }
    }
    load();
  }, [initialEventId]);

  // When source/family changes: reset scenario and event; only Demo Archive is active in this local pass.
  useEffect(() => {
    setSelectedScenario(null);
    setSelectedEventId(null);
    setSelectedId(null);
    if (selectedSource !== "demo_archive") {
      return;
    }
  }, [selectedSource, selectedSystem]);

  useEffect(() => {
    if (!verificationJustCompleted) return;
    const t = setTimeout(() => setVerificationJustCompleted(false), 2500);
    return () => clearTimeout(t);
  }, [verificationJustCompleted]);

  const handleScenarioChange = (scenario: string) => {
    setSelectedScenario(scenario);
    setSelectedEventId(null);
    setSelectedId(null);
  };

  // Demo packages visible for selected scenario class; each package binds to a canonical case identity.
  const displayEvents: EventCard[] = (selectedScenario
    ? DEMO_PACKAGES.filter((p) => p.system === selectedSystem && p.scenarioClass === selectedScenario)
    : []
  ).map((p) => {
    const base = getCanonicalCases(selectedSystem)[p.canonicalIndex] ?? getCanonicalCases(selectedSystem)[0];
    const mapped = caseToEventCard(base, language);
    return {
      ...mapped,
      eventId: base.eventId,
      title: p.title,
      summary: `${p.summaryTr} ${language === "tr" ? "Bağlam" : "Context"}: ${p.opContextTr}`,
      identity: p.sceneIdentityTr,
      severity: p.riskBand === "YUKSEK" ? "high" : p.riskBand === "ORTA" ? "medium" : "low",
    };
  });

  const selectedEventCard =
    displayEvents.find((e) => e.eventId === selectedEventId) ?? null;

  const selectedCase = selectedEventId ? getCanonicalCaseByEventId(selectedEventId) : null;
  const selectedPackage = displayEvents.find((e) => e.eventId === selectedEventId) ?? null;

  // When user selects an event from cards: set selectedEventId; for Vehicle also set selectedId for API.
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedId(eventId);
  };

  const selected = events.find((e) => e.eventId === selectedId) ?? null;
  const verifyIdentityMatchesSelection = Boolean(
    identity && selectedEventId && identity.event_id === selectedEventId
  );
  const bundleAnchorId = verifyIdentityMatchesSelection
    ? identity!.bundle_id
    : (selected?.bundleId ?? selectedEventCard?.bundleId ?? "—");
  const manifestAnchorId = verifyIdentityMatchesSelection
    ? identity!.manifest_id
    : (selected?.manifestId ?? selectedEventCard?.manifestId ?? "—");
  const visibleRecorded = selectedCase?.recordedEvidence?.length
    ? toRecordedRows(selectedCase.recordedEvidence, language)
    : [];
  const visibleUnknownItems = getVisibleUnknownItems(
    selectedCase?.caseId,
    selectedCase?.unknownDisputed,
    selectedCase?.unknownDisputedTr,
    language
  );
  const traceStepRows =
    transcript?.length
      ? transcript.map((s) => ({
          label: s.check,
          status: s.result,
          time: undefined as string | undefined,
          note: s.note || undefined,
        }))
      : selectedCase?.verificationTrace?.length
      ? selectedCase.verificationTrace.map((s) => ({
          label: language === "tr" && s.checkTr ? s.checkTr : s.check,
          status: s.result,
          time: undefined as string | undefined,
          note: (language === "tr" && s.noteTr ? s.noteTr : s.note) || undefined,
        }))
      : buildTranscriptStepRows(selectedSystem, transcript, verificationState, language);
  const hasConnectedIssuanceProfile =
    !!selectedCase?.artifactProfiles?.some((ap) => ap.enabled && ap.apiBacked);
  /** API-backed claims/legal issuance when the selected event exists in the live events catalog. */
  const hasConnectedApiIssuanceProfile =
    !!selected &&
    !!selectedCase?.artifactProfiles?.some(
      (ap) =>
        ap.enabled &&
        ap.apiBacked &&
        (ap.profileCode === "claims" || ap.profileCode === "legal")
    );
  const selectedProfileMeta = getArtifactProfile(exportProfile);
  const selectedProfileLabel = selectedProfileMeta
    ? language === "tr"
      ? selectedProfileMeta.labelTr
      : selectedProfileMeta.labelEn
    : exportProfile;
  const visibleReviewState = verificationState ?? selectedEventCard?.state ?? null;
  const displayedReviewState = displayProtocolState(visibleReviewState);
  const canUseLocalPreviewFallbackArtifact =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const issuedArtifact: IssuanceRecord | null =
    lastIssuedArtifact ??
    (canUseLocalPreviewFallbackArtifact &&
    verificationState === "UNVERIFIED" &&
    (transcript?.some((s) => s.check === "local_preview_fallback") ||
      identity?.manifest_id?.includes("LOCAL-PREVIEW"))
      ? {
          format: "pdf",
          localPreview: true,
          previewReason: "upstream_unreachable",
          meta: {
            export_id: `LOCAL-PREVIEW-${(selectedId ?? "EVENT").replace(/[^A-Z0-9-]/gi, "").slice(0, 24)}`,
            receipt_id: `LPR-${(selectedId ?? "EVENT").slice(-8).toUpperCase()}`,
            event_id: identity?.event_id ?? selectedId ?? "LOCAL-PREVIEW-EVENT",
            bundle_id: identity?.bundle_id ?? "LOCAL-PREVIEW-BUNDLE",
            manifest_id: identity?.manifest_id ?? "LOCAL-PREVIEW-MANIFEST",
            verification_state: "UNVERIFIED",
            export_profile: exportProfile,
            export_purpose: selectedPurpose,
            schema_version: "preview.local.v1",
            download_url: "#local-preview",
          },
        }
      : null);

  const msg = MSG[language];

  function selectReviewTab(tabId: ReviewTabId) {
    setActiveReviewTab(tabId);
  }

  function resetVerificationRun() {
    setVerificationState(null);
    setTranscript(null);
    setIdentity(null);
    setVerificationRunId(null);
    setTranscriptId(null);
    setVerificationError(null);
    setVerificationJustCompleted(false);
    setLastIssuedArtifact(null);
    setIssuanceState("idle");
    setExportError(null);
    setLastIssuedAtIso(null);
  }

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
        | (Partial<VerificationRunResponse> & { local_preview?: boolean; preview_reason?: string })
        | { error?: string; message?: string };
      if (!res.ok) {
        const errorPayload = json as { error?: string; message?: string };
        setVerificationError(errorPayload.error || errorPayload.message || `HTTP ${res.status}`);
        return;
      }
      const successPayload = json as Partial<VerificationRunResponse>;
      const verificationLocalPreview =
        (json as { local_preview?: boolean }).local_preview === true;
      const localPreviewReason = (json as { preview_reason?: string }).preview_reason;
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

      if (verificationLocalPreview && process.env.NODE_ENV !== "production") {
        const nowIso = new Date().toISOString();
        setIssuanceState("success");
        setSelectedFormat("pdf");
        setLastIssuedAtIso(nowIso);
        setLastIssuedArtifact({
          format: "pdf",
          localPreview: true,
          previewReason: localPreviewReason ?? "upstream_unreachable",
          meta: {
            export_id: `LOCAL-PREVIEW-${(selectedId ?? "EVENT").replace(/[^A-Z0-9-]/gi, "").slice(0, 24)}`,
            receipt_id: `LPR-${Date.now().toString(36).toUpperCase()}`,
            event_id: successPayload.event_id ?? selectedId ?? "LOCAL-PREVIEW-EVENT",
            bundle_id: successPayload.bundle_id ?? "LOCAL-PREVIEW-BUNDLE",
            manifest_id: successPayload.manifest_id ?? "LOCAL-PREVIEW-MANIFEST",
            verification_state:
              (successPayload.verification_state as VerificationState | undefined) ?? "UNVERIFIED",
            export_profile: exportProfile,
            export_purpose: selectedPurpose,
            schema_version: "preview.local.v1",
            download_url: "#local-preview",
          },
        });
      }
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

  const reviewTabs: { id: string; label: string }[] = [
    { id: "scene", label: "Sahne" },
    { id: "recorded", label: "Kayıtlı" },
    { id: "derived", label: "Türetilmiş" },
    {
      id: "unknownDisputed",
      label: "Belirsiz / Tartışmalı",
    },
    { id: "transcript", label: "İz" },
    { id: "issuance", label: "Artefakt" },
  ];

  const canResetVerificationRun =
    verificationState != null ||
    (transcript != null && transcript.length > 0) ||
    identity != null ||
    lastIssuedArtifact != null ||
    !!exportError ||
    issuanceState !== "idle" ||
    !!verificationError;
  const resetRunDisabled =
    !canResetVerificationRun || loading || !!exportLoading;
  const isPackageSelected = Boolean(selectedId);
  const isVerificationReady = Boolean(verificationState || verifyIdentityMatchesSelection);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: SANS,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: CH.topNavPx,
          borderBottom: "1px solid var(--border-strong)",
          background: "var(--header-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0 0.65rem 0 0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0, flex: "1 1 auto" }}>
          <LogoPrimary href="/" height={22} />
          <span style={{ color: "var(--border-strong)", fontFamily: MONO, fontSize: "0.72rem", flexShrink: 0 }}>·</span>
          <Link
            href="/verifier"
            style={{
              fontFamily: MONO,
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {msg.verifierInspection}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.66rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-dim)",
              padding: "0.18rem 0.4rem",
              border: "1px solid var(--border)",
              background: "var(--panel)",
              borderRadius: 2,
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={hasConnectedApiIssuanceProfile ? `${selectedSystem.toUpperCase()} · ${selectedProfileLabel}` : selectedSystem.toUpperCase()}
          >
            {hasConnectedApiIssuanceProfile
              ? `${selectedSystem.toUpperCase()} · ${selectedProfileLabel}`
              : selectedSystem.toUpperCase()}
          </span>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 2,
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
            role="group"
            aria-label="Language"
          >
            {(["tr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                style={{
                  padding: "0.15rem 0.42rem",
                  background: language === l ? "var(--accent-soft)" : "transparent",
                  color: language === l ? "var(--accent)" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: MONO,
                  fontSize: "0.68rem",
                  fontWeight: language === l ? 700 : 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Light theme" : "Dark theme"}
            style={{
              padding: "0.15rem 0.42rem",
              borderRadius: 2,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: MONO,
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {mode === "dark" ? "LT" : "DK"}
          </button>
        </div>
      </header>

      <div
        className="verifier-chassis-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `${CH.spinePx}px minmax(0, 1fr)`,
          alignItems: "stretch",
          minHeight: `calc(100vh - ${CH.topNavPx}px)`,
        }}
      >
          <aside
            style={{
              position: "sticky",
              top: CH.topNavPx,
              alignSelf: "start",
              maxHeight: `calc(100vh - ${CH.topNavPx}px)`,
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--border-strong)",
              borderBottom: "1px solid var(--border)",
              background: "var(--panel-raised)",
              overflowX: "hidden",
            }}
            aria-label={language === "tr" ? "Komut omurgası" : "Command spine"}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "0.5rem 0.65rem",
                borderBottom: "1px solid var(--border-strong)",
                background: "var(--panel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.74rem",
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
                  fontSize: "0.72rem",
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
                margin: "0.45rem 0.5rem",
                padding: "0.35rem 0.5rem",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--accent)",
                borderRadius: 2,
              }}
              role="status"
              aria-live="polite"
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  lineHeight: 1.35,
                }}
              >
                {language === "tr"
                  ? "1 KAYNAK → 2 AİLE → 3 SINIF → 4 PAKET"
                  : "1 SOURCE → 2 FAMILY → 3 CLASS → 4 PACKAGE"}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
            <div style={{ padding: "0 0.5rem 0.65rem" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.72rem",
                letterSpacing: "0.16em",
                color: "var(--text-dim)",
                fontWeight: 700,
                margin: "0 0.15rem 0.4rem",
              }}
            >
              {language === "tr" ? "SEÇİM" : "SELECT"}
            </div>
            {[
              {
                id: "source",
                step: 1,
                label: language === "tr" ? "Kaynak" : "Source",
              },
              {
                id: "family",
                step: 2,
                label: language === "tr" ? "Cihaz ailesi" : "Device family",
              },
              {
                id: "scenario",
                step: 3,
                label: language === "tr" ? "Olay sınıfı" : "Incident class",
              },
              {
                id: "event",
                step: 4,
                label: language === "tr" ? "Olay paketi" : "Event package",
              },
            ].map((section) => {
              const isActive = activeSpineSection === section.id;
              const isStep = section.step != null;
              return (
                <div key={section.id}>
                  <div
                    style={{
                      marginBottom: "0.15rem",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: isActive ? "var(--accent-border)" : "var(--border)",
                      background: isActive ? "var(--surface)" : "transparent",
                      borderLeft: isActive
                        ? "3px solid var(--accent)"
                        : isStep
                        ? "2px solid var(--border-muted)"
                        : "2px solid transparent",
                    }}
                  >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpineSection((prev) => (prev === section.id ? "" : section.id));
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.45rem 0.6rem",
                      background: "transparent",
                      border: "none",
                      color: isActive ? "var(--text)" : "var(--text-muted)",
                      fontSize: "0.875rem",
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
                        <span style={{ fontFamily: MONO, fontSize: "0.74rem", color: isActive ? "var(--accent)" : "var(--text-dim)", fontWeight: 700, flexShrink: 0 }}>
                          {section.step}
                        </span>
                      )}
                      {section.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.74rem",
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
                        fontSize: "0.86rem",
                      }}
                    >
                      {section.id === "source" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {[
                            { id: "demo_archive" as const, tr: "Demo Arşivi", en: "Demo Archive", active: true },
                            { id: "connected_device" as const, tr: "Bağlı Cihaz", en: "Connected Device", active: false },
                            { id: "uploaded_package" as const, tr: "Yüklenen Paket", en: "Uploaded Package", active: false },
                          ].map((src) => (
                            <button
                              key={src.id}
                              type="button"
                              onClick={() => {
                                if (!src.active) return;
                                setSelectedSource(src.id);
                              }}
                              style={{
                                padding: "0.35rem 0.5rem",
                                textAlign: "left",
                                borderRadius: 4,
                                border: selectedSource === src.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                                background: selectedSource === src.id ? "var(--accent-soft)" : "transparent",
                                color: src.active ? "var(--text)" : "var(--text-dim)",
                                cursor: src.active ? "pointer" : "not-allowed",
                                fontSize: "0.9rem",
                                opacity: src.active ? 1 : 0.7,
                              }}
                            >
                              {language === "tr" ? src.tr : src.en}
                              {!src.active ? ` · ${language === "tr" ? "Sınırlı" : "Bounded"}` : ""}
                            </button>
                          ))}
                        </div>
                      )}
                      {section.id === "family" && (
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
                                fontSize: "0.92rem",
                              }}
                            >
                              {language === "tr"
                                ? sys.id === "vehicle"
                                  ? "Vehicle Pack"
                                  : sys.id === "drone"
                                  ? "Drone Pack"
                                  : "Robot Pack"
                                : sys.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {section.id === "scenario" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {getScenarioClassesBySystem(selectedSystem).map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handleScenarioChange(name)}
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
                                fontSize: "0.875rem",
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
                            <div
                              role="status"
                              style={{
                                margin: 0,
                                padding: "0.55rem 0.65rem",
                                borderRadius: UI.radius.xs,
                                border: `1px dashed ${"var(--border-strong)"}`,
                                background: "var(--panel-card)",
                              }}
                            >
                              <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {selectedScenario ? msg.verifierEmptyEventCatalog : msg.verifierPickScenarioFirst}
                              </p>
                            </div>
                          ) : (
                            displayEvents.map((ev) => {
                              const isSelected = selectedEventId === ev.eventId;
                              const protocolLabel = displayProtocolState(ev.state);
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
                                    padding: "0.36rem 0.52rem 0.28rem",
                                    borderBottom: `1px solid ${isSelected ? "var(--border)" : "var(--border-muted)"}`,
                                    background: isSelected ? "var(--panel-raised)" : "var(--panel)",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.76rem",
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
                                      ...protocolStatePillStyle(protocolLabel),
                                      flexShrink: 0,
                                      marginLeft: "0.32rem",
                                      minWidth: "4.6rem",
                                      padding: "0.2rem 0.38rem",
                                      fontSize: "0.68rem",
                                    }}
                                  >
                                    {protocolLabel}
                                  </span>
                                </div>
                                {/* card row 2: title + summary */}
                                <div style={{ padding: "0.3rem 0.52rem 0.34rem" }}>
                                  <div style={{ fontSize: "0.82rem", color: isSelected ? "var(--text-soft)" : "var(--text-muted)", fontWeight: isSelected ? 600 : 500, marginBottom: 0, lineHeight: 1.3 }}>
                                    {ev.title}
                                  </div>
                                </div>
                              </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
            </div>{/* end inner padding div */}
            </div>{/* end scroll region */}

            <div
              style={{
                flexShrink: 0,
                borderTop: "1px solid var(--border-strong)",
                padding: "0.5rem 0.55rem calc(0.55rem + env(safe-area-inset-bottom, 0px))",
                background: "var(--panel)",
              }}
              aria-label={language === "tr" ? "Eylem alanı" : "Action area"}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.68rem",
                  letterSpacing: "0.14em",
                  color: "var(--text-dim)",
                  fontWeight: 700,
                  marginBottom: "0.45rem",
                  textTransform: "uppercase",
                }}
              >
                {language === "tr" ? "Eylem hiyerarşisi" : "Action hierarchy"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <button
                  type="button"
                  onClick={runVerification}
                  disabled={!isPackageSelected || loading}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                    padding: "0.42rem 0.55rem",
                    borderRadius: UI.radius.xs,
                    border: loading ? "1px solid var(--border-strong)" : "1px solid var(--accent)",
                    background: loading ? "var(--panel-card)" : "var(--accent-soft)",
                    color: "var(--text)",
                    cursor: loading ? "wait" : !isPackageSelected ? "not-allowed" : "pointer",
                    opacity: !isPackageSelected ? 0.55 : 1,
                    fontWeight: 700,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {loading
                    ? language === "tr"
                      ? "DOĞRULANIYOR…"
                      : "VERIFYING…"
                    : !isPackageSelected
                    ? language === "tr"
                      ? "Demo olayı aç / Paket seç"
                      : "Open demo event / Select package"
                    : language === "tr"
                    ? "OLAYI DOĞRULA"
                    : "VERIFY PACKAGE"}
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
                  <button
                    type="button"
                    onClick={runExportJson}
                    disabled={!isVerificationReady || !!exportLoading}
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.74rem",
                      padding: "0.38rem 0.5rem",
                      borderRadius: UI.radius.xs,
                      border: "1px solid var(--border)",
                      background: "var(--panel-card)",
                      color: "var(--text)",
                      cursor: !isVerificationReady || exportLoading ? "not-allowed" : "pointer",
                      opacity: !isVerificationReady || exportLoading ? 0.55 : 1,
                      fontWeight: 600,
                      width: "100%",
                    }}
                  >
                    {exportLoading === "json"
                      ? language === "tr"
                        ? "JSON…"
                        : "JSON…"
                      : language === "tr"
                      ? "JSON dışa aktar"
                      : "Export JSON"}
                  </button>
                  <button
                    type="button"
                    onClick={runExportPdf}
                    disabled={!isVerificationReady || !!exportLoading}
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.74rem",
                      padding: "0.38rem 0.5rem",
                      borderRadius: UI.radius.xs,
                      border: "1px solid var(--border)",
                      background: "var(--panel-card)",
                      color: "var(--text)",
                      cursor: !isVerificationReady || exportLoading ? "not-allowed" : "pointer",
                      opacity: !isVerificationReady || exportLoading ? 0.55 : 1,
                      fontWeight: 600,
                      width: "100%",
                    }}
                  >
                    {exportLoading === "pdf"
                      ? language === "tr"
                        ? "PDF…"
                        : "PDF…"
                      : language === "tr"
                      ? "PDF dışa aktar"
                      : "Export PDF"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={resetVerificationRun}
                  disabled={resetRunDisabled}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.72rem",
                    letterSpacing: "0.04em",
                    padding: "0.36rem 0.5rem",
                    borderRadius: UI.radius.xs,
                    border: "1px solid var(--border-strong)",
                    background: "var(--panel-raised)",
                    color: "var(--text-muted)",
                    cursor: resetRunDisabled ? "not-allowed" : "pointer",
                    opacity: resetRunDisabled ? 0.45 : 1,
                    fontWeight: 600,
                    width: "100%",
                  }}
                >
                  {msg.verifierActionBarReset}
                </button>
              </div>
              <p
                style={{
                  margin: "0.45rem 0 0",
                  fontFamily: MONO,
                  fontSize: "0.58rem",
                  letterSpacing: "0.03em",
                  color: "var(--text-dim)",
                  lineHeight: 1.25,
                  opacity: 0.62,
                }}
              >
                {msg.verifierActionBarDoctrineTrace} · {msg.verifierActionBarDoctrineIssuance}
              </p>
              {exportError ? (
                <p style={{ margin: "0.35rem 0 0", fontFamily: MONO, fontSize: "0.7rem", color: "var(--error)", lineHeight: 1.35 }}>
                  {exportError}
                </p>
              ) : null}
            </div>
          </aside>

          <main
            style={{
              minWidth: 0,
              borderLeft: "1px solid var(--border-muted)",
              background: "var(--bg)",
              maxHeight: `calc(100vh - ${CH.topNavPx}px)`,
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "0.5rem 0.85rem 1.5rem" }}>
            <div
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--panel)",
                borderTop: "2px solid var(--accent-border)",
                padding: "0.45rem 0.55rem 0.5rem",
                marginBottom: "0.45rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: "0.45rem 0.75rem",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem", minWidth: 0, flex: "1 1 220px" }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.62rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      fontWeight: 700,
                    }}
                  >
                    {language === "tr" ? "PAKET KİMLİĞİ" : "PACKAGE IDENTITY"}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--text-soft)",
                      letterSpacing: "0.03em",
                      maxWidth: "100%",
                      wordBreak: "break-all",
                      lineHeight: 1.25,
                    }}
                    title={selectedEventCard?.eventId ?? ""}
                  >
                    {selectedEventCard?.eventId ?? "—"}
                  </span>
                  {selectedEventCard ? (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.62rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "0.14rem 0.38rem",
                        border: "1px solid var(--border)",
                        borderRadius: 2,
                        color: "var(--text-dim)",
                        background: "var(--panel-card)",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                      title={language === "tr" ? "Tanıtım / demo protokol verisi" : "Demo protocol data"}
                    >
                      {language === "tr" ? "DEMO OLAY" : "DEMO EVENT"}
                    </span>
                  ) : null}
                </div>
                <span
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    flex: "2 1 280px",
                    minWidth: 0,
                    lineHeight: 1.28,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedEventCard?.title ??
                    (language === "tr" ? "Paket seçilmedi" : "No package selected")}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.68rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "0.22rem 0.5rem",
                      border: "1px solid var(--border-strong)",
                      borderRadius: 2,
                      color: "var(--text-soft)",
                      background: "var(--panel-raised)",
                      fontWeight: 700,
                    }}
                  >
                    {selectedSystem}
                  </span>
                  {selectedPackage ? (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.62rem",
                        letterSpacing: "0.11em",
                        textTransform: "uppercase",
                        padding: "0.2rem 0.45rem",
                        border: "1px solid var(--accent-border)",
                        borderRadius: 2,
                        color: "var(--accent)",
                        background: "var(--accent-soft)",
                        fontWeight: 700,
                      }}
                    >
                      {selectedPackage.severity === "high"
                        ? language === "tr"
                          ? "RİSK: YÜKSEK"
                          : "RISK: HIGH"
                        : selectedPackage.severity === "medium"
                          ? language === "tr"
                            ? "RİSK: ORTA"
                            : "RISK: MEDIUM"
                          : language === "tr"
                            ? "RİSK: DÜŞÜK"
                            : "RISK: LOW"}
                    </span>
                  ) : null}
                  {visibleReviewState != null ? (
                    <span style={protocolStatePillStyle(displayedReviewState)}>{displayedReviewState}</span>
                  ) : (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.68rem",
                        letterSpacing: "0.1em",
                        color: "var(--text-dim)",
                        padding: "0.22rem 0.5rem",
                        border: "1px dashed var(--border-strong)",
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      {language === "tr" ? "DURUM —" : "STATE —"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedPackage ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "0.4rem",
                  padding: "0.1rem 0 0.45rem",
                }}
              >
                <div style={{ border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.4rem 0.55rem" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", marginBottom: "0.15rem", letterSpacing: "0.1em" }}>BAĞLAM</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.45 }}>{selectedPackage.summary}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.4rem 0.55rem" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", marginBottom: "0.15rem", letterSpacing: "0.1em" }}>OPERASYON</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.45 }}>{selectedPackage.title}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.4rem 0.55rem" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", marginBottom: "0.15rem", letterSpacing: "0.1em" }}>KRİTİK AN</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.45 }}>
                    {language === "tr" ? "Doğrulama öncesi ayrım: kayıtlı/türetilmiş + iz zinciri" : "Pre-verify split: recorded/derived + trace chain"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--border)", background: "var(--panel-card)", padding: "0.4rem 0.55rem" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", marginBottom: "0.15rem", letterSpacing: "0.1em" }}>
                    {language === "tr" ? "SAHNE KİMLİĞİ" : "SCENE IDENTITY"}
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.45 }}>
                    {selectedPackage.identity}
                  </div>
                </div>
              </div>
            ) : null}
            <nav
              aria-label={language === "tr" ? "İnceleme sekmeleri" : "Inspection tabs"}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.25rem",
                alignItems: "center",
                paddingBottom: "0.45rem",
                marginBottom: "0.35rem",
                borderBottom: "1px solid var(--border-muted)",
              }}
            >
              {reviewTabs.map((tab) => {
                const on = activeReviewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectReviewTab(tab.id as ReviewTabId)}
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.3rem 0.55rem",
                      borderRadius: 2,
                      border: `1px solid ${on ? "var(--accent-border)" : "var(--border)"}`,
                      background: on ? "var(--accent-soft)" : "var(--panel)",
                      color: on ? "var(--text)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {activeReviewTab === "scene" && (
              <div
                style={{
                  marginLeft: "-0.85rem",
                  marginRight: "-0.85rem",
                  width: "calc(100% + 1.7rem)",
                  marginBottom: "0.35rem",
                }}
              >
                <ReconstructionViewport
                  language={language}
                  system={selectedSystem}
                  incidentClass={selectedEventCard != null ? selectedCase?.incidentClass ?? null : null}
                  eventId={selectedEventCard != null ? selectedEventCard.eventId ?? selectedId : null}
                  title={selectedEventCard?.title ?? null}
                  verificationState={visibleReviewState}
                />
              </div>
            )}

            <div
              id="verifier-inspection-detail-deck"
              style={{
                marginTop: "0.15rem",
                paddingTop: "0.45rem",
                paddingBottom: "0.25rem",
                borderTop: "2px solid var(--border-strong)",
                background: "var(--panel-raised)",
                scrollMarginTop: "0.75rem",
                minHeight: "12rem",
              }}
            >
            {activeReviewTab === "scene" && (
            <>
            {!selectedEventCard ? (
              <section
                style={{
                  marginBottom: UI.sectionGap,
                  borderRadius: 2,
                  border: `1px solid var(--border-strong)`,
                  background: "var(--panel)",
                  padding: "0.7rem 0.8rem",
                }}
                aria-live="polite"
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    color: "var(--accent)",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                  }}
                >
                  {msg.verifierWaitingSelectionTitle}
                </div>
                <p style={{ margin: 0, fontSize: "0.86rem", lineHeight: 1.5, color: "var(--text-soft)" }}>
                  {msg.verifierWaitingSelectionBody}
                </p>
              </section>
            ) : null}

            {/* 0) Demo scenario notice */}
            {selectedCase && (
              <section style={{ marginBottom: UI.sectionGap, display: "none" }} aria-label={language === "tr" ? "Demo senaryosu bildirimi" : "Demo scenario notice"}>
                <div
                  style={{
                    borderRadius: UI.radius.xs,
                    padding: "0.5rem 0.85rem",
                    fontSize: "0.92rem",
                    background: "var(--panel-card)",
                    border: `1px solid ${"var(--border-muted)"}`,
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem 1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, flexShrink: 0 }}>
                    {language === "tr" ? "DEMO" : "DEMO"}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0 0.6rem", color: "var(--text-dim)" }}>
                    <span>{msg.verifierDemoLabel}</span>
                  </div>
                  {(selectedCase.demoNoticeTr || selectedCase.demoNoticeEn) && (
                    <span style={{ color: "var(--text-dim)" }}>
                      {language === "tr" ? selectedCase.demoNoticeTr : selectedCase.demoNoticeEn}
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* Identity chain */}
            <section id="verifier-panel-identity" style={{ marginBottom: UI.sectionGap, display: "none" }}>
              <div
                style={{
                  border: "1px solid var(--border-strong)",
                  borderRadius: 2,
                  background: "var(--panel)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.38rem 0.65rem",
                    borderBottom: "1px solid var(--border-strong)",
                    background: "var(--panel-raised)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      fontWeight: 700,
                    }}
                  >
                    {msg.verifierIdentityChain}
                  </span>
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
                      { key: "bundle_id", value: bundleAnchorId },
                      { key: "manifest_id", value: manifestAnchorId },
                      ...(transcriptId ? [{ key: "trace_id", value: transcriptId }] : []),
                      ...(verificationRunId ? [{ key: "run_id", value: verificationRunId }] : []),
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
                        <div style={{ fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "lowercase", color: "var(--text-dim)", marginBottom: "0.15rem" }}>
                          {item.key}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: "0.92rem", color: "var(--text-soft)", fontWeight: 600, wordBreak: "break-all" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "0.75rem 0.85rem", fontSize: "0.9rem", color: "var(--text-dim)" }}>
                    {language === "tr" ? "Olay seçilmedi." : "No event selected."}
                  </div>
                )}
              </div>
            </section>

            {/* Incident summary — tab anchor */}
            <section id="verifier-panel-summary" style={{ marginBottom: UI.sectionGap, display: "none" }}>
              <div
                style={{
                  border: "1px solid var(--border-strong)",
                  borderRadius: 2,
                  borderTop: "2px solid var(--accent)",
                  background: "var(--panel)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.4rem 0.65rem",
                    borderBottom: "1px solid var(--border-strong)",
                    background: "var(--panel-raised)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      fontWeight: 700,
                    }}
                  >
                    {msg.verifierIncidentSummary}
                  </span>
                </div>
                {selectedEventCard ? (
                  (() => {
                    const sum = getIncidentSummary(
                      selectedSystem,
                      selectedEventCard,
                      verificationState,
                      language,
                      selectedCase ?? undefined
                    );
                    const grid4 = [
                      {
                        k: msg.verifierIncidentClass,
                        v: selectedCase?.incidentClass ?? "—",
                      },
                      {
                        k: msg.verifierScenarioFrame,
                        v: selectedCase?.scenarioFrame ?? selectedScenario ?? "—",
                      },
                      {
                        k: msg.verifierReviewState,
                        v: sum.state || displayedReviewState,
                      },
                      {
                        k: language === "tr" ? "DİKEY" : "VERTICAL",
                        v: selectedSystem.toUpperCase(),
                      },
                    ];
                    return (
                      <div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 0,
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {grid4.map((cell, i) => (
                            <div
                              key={cell.k}
                              style={{
                                padding: "0.45rem 0.6rem",
                                borderRight: i % 2 === 0 ? "1px solid var(--border)" : undefined,
                                borderBottom: i < 2 ? "1px solid var(--border)" : undefined,
                                background: i % 2 === 0 ? "var(--panel)" : "var(--panel-card)",
                              }}
                            >
                              <div
                                style={{
                                  fontFamily: MONO,
                                  fontSize: "0.66rem",
                                  letterSpacing: "0.1em",
                                  color: "var(--text-dim)",
                                  marginBottom: "0.2rem",
                                  fontWeight: 700,
                                }}
                              >
                                {cell.k}
                              </div>
                              <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-soft)", lineHeight: 1.35 }}>
                                {cell.v}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedCase ? (
                          <div
                            style={{
                              padding: "0.5rem 0.65rem",
                              borderBottom: "1px solid var(--border)",
                              background: "var(--panel)",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: "0.66rem",
                                letterSpacing: "0.1em",
                                color: "var(--text-dim)",
                                marginBottom: "0.25rem",
                                fontWeight: 700,
                              }}
                            >
                              {msg.verifierCaseContext}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-muted)", fontFamily: MONO, lineHeight: 1.45 }}>
                              {selectedSystem} · {selectedEventCard.title}
                            </p>
                          </div>
                        ) : null}
                        <div style={{ padding: "0.55rem 0.65rem", borderBottom: "1px solid var(--border)", background: "var(--panel-card)" }}>
                          <div
                            style={{
                              fontFamily: MONO,
                              fontSize: "0.66rem",
                              letterSpacing: "0.1em",
                              color: "var(--text-dim)",
                              marginBottom: "0.3rem",
                              fontWeight: 700,
                            }}
                          >
                            {msg.verifierWhatHappened}
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "0.95rem", fontWeight: 500, color: "var(--text)" }}>{sum.what}</p>
                        </div>
                        {sum.why ? (
                          <div style={{ padding: "0.55rem 0.65rem", borderBottom: "1px solid var(--border)", background: "var(--panel)" }}>
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: "0.66rem",
                                letterSpacing: "0.1em",
                                color: "var(--text-dim)",
                                marginBottom: "0.3rem",
                                fontWeight: 700,
                              }}
                            >
                              {msg.verifierWhyUnderReview}
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.88rem", color: "var(--text-soft)" }}>{sum.why}</p>
                          </div>
                        ) : null}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 0,
                            borderBottom: sum.next ? "1px solid var(--border)" : undefined,
                          }}
                        >
                          <div style={{ padding: "0.5rem 0.65rem", borderRight: "1px solid var(--border)", background: "var(--panel-card)" }}>
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: "0.66rem",
                                letterSpacing: "0.1em",
                                color: "var(--text-dim)",
                                marginBottom: "0.25rem",
                                fontWeight: 700,
                              }}
                            >
                              {msg.verifierRoleContextLabel}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.5, color: "var(--text-muted)" }}>{msg.verifierRoleContextBody}</p>
                          </div>
                          <div style={{ padding: "0.5rem 0.65rem", background: "var(--panel)" }}>
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: "0.66rem",
                                letterSpacing: "0.1em",
                                color: "var(--text-dim)",
                                marginBottom: "0.25rem",
                                fontWeight: 700,
                              }}
                            >
                              {msg.verifierSafeNextStep}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.5, color: "var(--text-muted)" }}>{sum.next || "—"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ padding: "0.75rem 0.65rem", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {msg.verifierEmptySummaryPanel}
                  </div>
                )}
              </div>
            </section>
            </>
            )}

            {(activeReviewTab === "recorded" || activeReviewTab === "derived") && (
            <>
            {/* Evidence layers */}
            <section id="verifier-panel-evidence" style={{ marginBottom: UI.sectionGap }}>
              {selectedEventCard ? (
                <div className="verifier-evidence-split" style={{ gridTemplateColumns: "1fr" }}>
                  {/* A. Recorded Evidence */}
                  {activeReviewTab === "recorded" && (
                  <div
                    style={{
                      border: "1px solid var(--border-strong)",
                      borderRadius: 2,
                      overflow: "hidden",
                      borderLeft: "2px solid var(--success)",
                      background: "var(--panel)",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.38rem 0.55rem",
                        background: "var(--panel-raised)",
                        borderBottom: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)" }}>
                          {msg.verifierRecorded}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: "0.66rem",
                            padding: "0.08rem 0.32rem",
                            border: "1px solid var(--success-border)",
                            borderRadius: 2,
                            color: "var(--success)",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                          }}
                        >
                          RAW
                        </span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--text-dim)" }}>{msg.verifierRawLayer}</span>
                    </div>
                    <div style={{ padding: "0.55rem 0.6rem" }}>
                      <p style={{ margin: "0 0 0.65rem", fontFamily: MONO, fontSize: "0.76rem", color: "var(--text-dim)", lineHeight: 1.55 }}>
                        {msg.verifierEvidenceRecordedCaption}
                      </p>
                      <p style={{ margin: "0 0 0.65rem", fontFamily: MONO, fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        manifest:{manifestAnchorId}
                      </p>
                      {(() => {
                        if (visibleRecorded.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-dim)" }}>
                              {language === "tr" ? "Kayıtlı delil yok." : "No recorded evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
                            {visibleRecorded.map((r, i) => (
                              <div key={i} style={{ borderRadius: 2, border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div style={{ padding: "0.28rem 0.45rem", background: "var(--panel-raised)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
                                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-soft)" }}>{r.source}</span>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.74rem",
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
                                <div style={{ padding: "0.28rem 0.45rem", background: "var(--bg)" }}>
                                  <div style={{ fontSize: "0.8125rem", color: "var(--text-soft)", lineHeight: 1.45, marginBottom: "0.2rem" }}>{r.description}</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15rem 0.55rem", fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-dim)" }}>
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
                  )}
                  {/* B. Derived Evidence */}
                  {activeReviewTab === "derived" && (
                  <div
                    style={{
                      border: "1px solid var(--border-strong)",
                      borderRadius: 2,
                      overflow: "hidden",
                      borderLeft: "2px solid var(--warning)",
                      background: "var(--panel)",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.38rem 0.55rem",
                        background: "var(--panel-raised)",
                        borderBottom: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)" }}>
                          {msg.verifierDerived}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: "0.66rem",
                            padding: "0.08rem 0.32rem",
                            border: "1px solid var(--warning-border)",
                            borderRadius: 2,
                            color: "var(--warning)",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                          }}
                        >
                          DRV
                        </span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--text-dim)" }}>{msg.verifierSecondLayer}</span>
                    </div>
                    <div style={{ padding: "0.55rem 0.6rem" }}>
                      <p style={{ margin: "0 0 0.65rem", fontFamily: MONO, fontSize: "0.76rem", color: "var(--text-dim)", lineHeight: 1.55 }}>
                        {msg.verifierEvidenceDerivedCaption}
                      </p>
                      {(() => {
                        const derived =
                          selectedCase?.derivedAssessment?.length
                            ? toDerivedRows(selectedCase.derivedAssessment, language)
                            : [];
                        if (derived.length === 0) {
                          return (
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-dim)" }}>
                              {language === "tr" ? "Türetilmiş delil yok." : "No derived evidence."}
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
                            {derived.map((d, i) => (
                              <div key={i} style={{ borderRadius: 2, border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div style={{ padding: "0.28rem 0.45rem", background: "var(--panel-raised)", borderBottom: "1px solid var(--border)" }}>
                                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-soft)" }}>{d.type}</span>
                                </div>
                                <div style={{ padding: "0.28rem 0.45rem", background: "var(--bg)" }}>
                                  <div style={{ fontSize: "0.8125rem", color: "var(--text-soft)", lineHeight: 1.45, marginBottom: "0.2rem" }}>{d.explanation}</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15rem 0.55rem", fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-dim)" }}>
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
                  )}
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: UI.radius.md,
                    padding: "0.85rem 1rem",
                    fontSize: "0.92rem",
                    background: "var(--panel)",
                    color: "var(--text-soft)",
                    lineHeight: 1.55,
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.verifierSelectEvent}</p>
                </div>
              )}
            </section>
            </>
            )}

            {activeReviewTab === "unknownDisputed" && (
            <>
            {/* Unknown / disputed */}
            <section id="verifier-panel-unknownDisputed" style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: "1px solid var(--border-strong)",
                  borderLeft: "2px solid var(--warning)",
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "var(--panel)",
                }}
              >
                <div
                  style={{
                    padding: "0.38rem 0.55rem",
                    background: "var(--panel-raised)",
                    borderBottom: "1px solid var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)" }}>
                    {msg.verifierUnknownDisputed}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--warning)", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {msg.verifierHumanReview}
                  </span>
                </div>
                <div style={{ padding: "0.55rem 0.6rem", background: "var(--panel)", fontSize: "0.9rem" }}>
                  <p style={{ margin: "0 0 0.55rem", fontSize: "0.92rem", lineHeight: 1.5, color: "var(--text-muted)", fontFamily: SANS }}>
                    {msg.verifierUnknownIntro}
                  </p>
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
                          <div style={{ marginBottom: "0.35rem" }}>
                            <span style={protocolStatePillStyle("UNKNOWN")}>UNKNOWN</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{msg.verifierHumanReviewTag}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {visibleUnknownItems.length ? (
                          visibleUnknownItems.map((item, i) => (
                            <div key={i} style={{ borderRadius: 2, border: "1px solid var(--border-strong)", overflow: "hidden" }}>
                              <div
                                style={{
                                  padding: "0.28rem 0.45rem",
                                  background: "var(--panel-raised)",
                                  borderBottom: "1px solid var(--border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "0.4rem",
                                }}
                              >
                                <span style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.1em", color: "var(--text-dim)", fontWeight: 700 }}>
                                  {language === "tr" ? `KALEM ${i + 1}` : `ITEM ${i + 1}`}
                                </span>
                                <span
                                  style={{
                                    fontFamily: MONO,
                                    fontSize: "0.66rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    color: "var(--warning)",
                                    border: "1px solid var(--warning-border)",
                                    borderRadius: 2,
                                    padding: "0.06rem 0.28rem",
                                  }}
                                >
                                  OPEN
                                </span>
                              </div>
                              <div style={{ padding: "0.35rem 0.45rem", background: "var(--bg)" }}>
                                <div style={{ fontSize: "0.86rem", lineHeight: 1.5, color: "var(--text-soft)" }}>{item}</div>
                              </div>
                              <div style={{ padding: "0.22rem 0.45rem", background: "var(--panel)", borderTop: "1px solid var(--border)" }}>
                                <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.04em" }}>
                                  {msg.verifierHumanReviewTag}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : verificationState === "UNKNOWN" ? (
                          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                            {language === "tr"
                              ? "Bu çalıştırma için doğrulama sonucu belirsiz; insan incelemesi gerekir."
                              : "Verification outcome unknown for this run; requires human review."}
                          </div>
                        ) : (
                          <div style={{ fontFamily: MONO, fontSize: "0.92rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                            {language === "tr"
                              ? "Bu vaka için çözülmemiş madde yok; iz ve issuance insan incelemesi gerektiğinde buna koşullu kalır."
                              : "No unresolved items for this case; trace and issuance remain conditioned on human review where applicable."}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                      {msg.verifierEmptyUnknownPanel}
                    </div>
                  )}
                </div>
              </div>
            </section>
            </>
            )}

            {activeReviewTab === "transcript" && (
            <>
            {/* Verification trace */}
            <section id="verifier-panel-transcript" style={{ marginBottom: UI.sectionGap }} aria-labelledby="verification-trace-heading">
              <div
                style={{
                  border: "1px solid var(--border-strong)",
                  borderLeft: "2px solid var(--blue)",
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "var(--panel)",
                }}
              >
                <div
                  style={{
                    padding: "0.38rem 0.55rem",
                    background: "var(--panel-raised)",
                    borderBottom: "1px solid var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span id="verification-trace-heading" style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)" }}>
                    {msg.verifierVerificationTraceHeader}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      padding: "0.12rem 0.38rem",
                      borderRadius: 2,
                      border: "1px solid var(--border)",
                      background: "var(--panel)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {msg.verifierTraceRibbonNotDetermination}
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
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 0,
                            borderBottom: "1px solid var(--border-strong)",
                            background: "var(--panel)",
                          }}
                        >
                          {(
                            [
                              { k: "MANIFEST", v: String(manifestAnchorId).slice(0, 28) + (String(manifestAnchorId).length > 28 ? "…" : "") },
                              {
                                k: "TRACE_ID",
                                v: transcriptId ?? (language === "tr" ? "beklemede" : "pending"),
                              },
                              {
                                k: "RUN_ID",
                                v: verificationRunId ?? "—",
                              },
                              {
                                k: language === "tr" ? "ISSUANCE" : "ISSUANCE",
                                v: hasConnectedIssuanceProfile
                                  ? language === "tr"
                                    ? "profil hazır"
                                    : "profile ready"
                                  : language === "tr"
                                  ? "bağlı değil"
                                  : "not connected",
                              },
                            ] as { k: string; v: string }[]
                          ).map((cell, idx) => (
                            <div
                              key={cell.k}
                              style={{
                                padding: "0.35rem 0.5rem",
                                borderRight: idx % 2 === 0 ? "1px solid var(--border)" : undefined,
                                borderBottom: idx < 2 ? "1px solid var(--border)" : undefined,
                                background: idx % 2 === 0 ? "var(--panel)" : "var(--panel-card)",
                              }}
                            >
                              <div
                                style={{
                                  fontFamily: MONO,
                                  fontSize: "0.64rem",
                                  letterSpacing: "0.12em",
                                  color: "var(--text-dim)",
                                  marginBottom: "0.12rem",
                                  fontWeight: 700,
                                }}
                              >
                                {cell.k}
                              </div>
                              <div style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--text-soft)", wordBreak: "break-all" }}>{cell.v}</div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            padding: "0.35rem 0.55rem",
                            borderBottom: "1px solid var(--border-strong)",
                            fontSize: "0.88rem",
                            color: "var(--text-muted)",
                            background: "var(--panel-raised)",
                            lineHeight: 1.45,
                          }}
                        >
                          {msg.verifierTracePanelNote}
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
                                  padding: "0.38rem 0.55rem",
                                  borderBottom: i < traceStepRows.length - 1 ? "1px solid var(--border)" : "none",
                                  display: "grid",
                                  gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr) auto",
                                  gap: "0.35rem 0.65rem",
                                  alignItems: "start",
                                  background: i % 2 === 0 ? "var(--panel)" : "var(--panel-card)",
                                }}
                              >
                                <div style={{ fontFamily: MONO, fontSize: "0.74rem", fontWeight: 600, color: "var(--text-soft)", lineHeight: 1.35 }}>
                                  {row.label}
                                </div>
                                <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-dim)", lineHeight: 1.35 }}>
                                  {row.note ?? "—"}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", justifySelf: "end" }}>
                                  <span style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-muted)" }}>{text}</span>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: "0.66rem",
                                      padding: "0.08rem 0.32rem",
                                      borderRadius: 2,
                                      background: stepBg,
                                      color: stepColor,
                                      fontWeight: 700,
                                      letterSpacing: "0.06em",
                                      textTransform: "uppercase",
                                      border: `1px solid ${stepColor}40`,
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
                            fontFamily: SANS,
                            fontSize: "0.92rem",
                            color: "var(--text-muted)",
                            background: "var(--panel-card)",
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.verifierTraceFooterNote}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                    {msg.verifierEmptyTracePanel}
                  </div>
                )}
              </div>
            </section>

            {/* Review Assistant — reserved */}
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  border: `1px solid ${"var(--border-muted)"}`,
                  borderRadius: UI.radius.xs,
                  padding: "0.55rem 0.85rem",
                  background: "var(--panel-card)",
                  fontFamily: SANS,
                  fontSize: "0.84rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {msg.verifierReviewAssistantInactive}
              </div>
            </section>

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
              <h2 style={{ fontSize: "0.92rem", fontWeight: 600, marginBottom: "0.4rem", opacity: 0.75, letterSpacing: "0.05em", textTransform: "uppercase" }}>
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
                    fontSize: "0.95rem",
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
                <p style={{ fontSize: "0.92rem", opacity: 0.8 }}>
                  {language === "tr"
                    ? "Henüz bir doğrulama çalıştırılmadı. Bir olay seçin ve doğrulamayı başlatın."
                    : "No verification has been run yet. Select an event and start verification to see its current state and verification trace summary."}
                </p>
              )}

              {verificationState && identity && verifyIdentityMatchesSelection && (
                <div
                  style={{
                    border: verificationJustCompleted ? "1px solid var(--success)" : "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.875rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    {language === "tr"
                      ? "Doğrulama Durumu"
                      : "Verification State"}
                  </div>
                  <div style={{ marginTop: "0.35rem" }}>
                    <span style={protocolStatePillStyle(displayProtocolState(verificationState))}>
                      {displayProtocolState(verificationState)}
                    </span>
                  </div>
                  {(verificationRunId || transcriptId) && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.92rem",
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
                    style={{ marginTop: "0.5rem", fontSize: "0.92rem" }}
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
                      fontSize: "0.875rem",
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
                    style={{ fontSize: "0.92rem", paddingLeft: "1rem" }}
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
            </>
            )}

            {activeReviewTab === "issuance" && (
            <>
            {/* 7) Verification / export flow */}
            <section style={{ marginBottom: UI.sectionGap }}>
              {selectedEventCard && (
                <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span>{language === "tr" ? "Seçili:" : "Selected:"}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-soft)", fontFamily: "monospace", fontSize: "0.8rem" }}>{selectedEventCard.eventId}</span>
                  <span style={{ color: "var(--text-dim)" }}>— {selectedEventCard.title}</span>
                </div>
              )}
              {selectedCase && (() => {
                const gate = evaluateGoldenAcceptance(selectedCase);
                return (
                  <div style={{ fontSize: "0.84rem", color: "var(--text-dim)", marginBottom: "0.35rem" }}>
                    {language === "tr" ? "Golden kabul:" : "Golden acceptance:"} {gate.passed}/{gate.total}
                  </div>
                );
              })()}
              <>
                  <div style={{ marginTop: "0.45rem" }}>
                    <p style={{ margin: "0 0 0.35rem", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                      {language === "tr"
                        ? "Dışa aktarım eylemleri soldaki omurgada doğrulama durumuna bağlı açılır."
                        : "Export actions in the left spine open only when verification state is ready."}
                    </p>
                    <div
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.82rem",
                        opacity: 0.86,
                      }}
                    >
                      {loading && (language === "tr" ? "İşleniyor — sonuç aşağıda güncellenecek." : "Processing — result will update below.")}
                      {!loading && verificationError && (language === "tr" ? "Hata: " : "Error: ")}
                      {!loading && verificationError && <strong style={{ color: "var(--error)" }}>{verificationError}</strong>}
                      {!loading && !verificationError && verificationState && (language === "tr" ? "Durum: " : "Status: ")}
                      {!loading && !verificationError && verificationState && (
                        <strong>{displayProtocolState(verificationState)}</strong>
                      )}
                      {!loading && !verificationError && !verificationState && selectedId && (language === "tr" ? "Doğrulama bekleniyor." : "Verification pending.")}
                    </div>
                  </div>
              </>
            </section>

            {/* AXISUS — boundary protocol; secondary to doctrine spine */}
            {selectedCase?.axisusStates?.length ? (
              <section style={{ marginTop: "0.6rem", display: "none" }} aria-label="AXISUS">
                <div
                  style={{
                    fontSize: "0.92rem",
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
                        fontSize: "0.9rem",
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
                        <div style={{ fontSize: "0.84rem", opacity: 0.85 }}>
                          {language === "tr" ? s.nextStepTr : s.nextStepEn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Artifact issuance */}
            <div id="verifier-panel-issuance" style={{ marginTop: "0.35rem" }}>
            <section style={{ marginBottom: UI.sectionGap }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  color: "var(--accent)",
                  marginBottom: "0.65rem",
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                {msg.verifierArtifactIssuanceHeader}
              </div>
              <div style={{ marginBottom: "0.6rem", fontFamily: MONO, fontSize: "0.7rem", color: "var(--text-dim)", opacity: 0.88 }}>
                {language === "tr"
                  ? "Artefakt yüzeyi yalnızca doğrulama hazır olduğunda aktifleşir."
                  : "Artifact surface activates only when verification is ready."}
              </div>
              {!selectedCase ? (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: UI.radius.md,
                    padding: "0.85rem 1rem",
                    fontSize: "0.92rem",
                    background: "var(--panel)",
                    color: "var(--text-soft)",
                    lineHeight: 1.55,
                  }}
                >
                  <p style={{ margin: 0, marginBottom: "0.35rem" }}>
                    {language === "tr"
                      ? "Belge üretimi için sol şeritten sistem → senaryo → olay ile bir paket seçin."
                      : "Select a package via system → scenario → event in the left spine for artifact issuance."}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    {language === "tr"
                      ? "Issuance rol ve iz ile sınırlıdır; bilinmeyen/çekişmeli alanın veya nihai hükmün yerini almaz."
                      : "Issuance is role- and trace-bound; it does not override unknown/disputed or produce a final ruling."}
                  </p>
                </div>
              ) : selectedCase.artifactProfiles && selectedCase.artifactProfiles.length > 0 ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "1rem", background: "var(--panel-raised)" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.55rem" }}>
                    {language === "tr"
                      ? "Bu çıktı nihai hukukî veya olgusal hüküm değildir. Issuance kullanılabilirliği, gerçeklik iddiası anlamına gelmez."
                      : "This output is not a final legal or factual determination. Issuance availability does not imply a truth claim."}
                  </p>
                    <div
                      style={{
                        marginBottom: "0.6rem",
                        padding: "0.5rem 0.62rem",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        background: "var(--panel-card)",
                        fontSize: "0.82rem",
                        lineHeight: 1.4,
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
                        ? `Manifest bağı: ${manifestAnchorId} · İz bağı: ${transcriptId ?? "hazırlanmadı"}`
                        : `Manifest anchor: ${manifestAnchorId} · Trace anchor: ${transcriptId ?? "pending"}`}
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
                    <div style={{ marginBottom: "0.5rem", fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)", opacity: 0.85 }}>
                      {language === "tr"
                        ? "İz bağlı · rol sınırlı · hüküm değil"
                        : "Trace-bound · role-bounded · not a verdict"}
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
                            fontSize: "0.92rem",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{label}</div>
                          {purpose ? <div style={{ opacity: 0.88, marginBottom: "0.25rem", fontSize: "0.9rem" }}>{purpose}</div> : null}
                          <div style={{ fontSize: "0.875rem", opacity: 0.82 }}>{statusText}</div>
                        </div>
                      );
                    })}
                  </div>
                  {hasConnectedApiIssuanceProfile ? (
                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "0.92rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ opacity: 0.8 }}>{language === "tr" ? "Issuance profili:" : "Issuance profile:"}</span>
                        {selectedCase.artifactProfiles.some((ap) => ap.profileCode === "claims" && ap.enabled && ap.apiBacked) && (
                          <button
                            type="button"
                            onClick={() => setExportProfile("claims")}
                            disabled={!!exportLoading}
                            style={{
                              fontSize: "0.92rem",
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
                              fontSize: "0.92rem",
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
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "0.5rem 0 0.35rem", lineHeight: 1.5 }}>
                        {language === "tr"
                          ? "Kontrollü issuance: artifact manifest ve iz ile sınırlı kalır; suçlama veya nihai hüküm değildir."
                          : "Controlled issuance: artifact remains bound to manifest and trace; not a blame or final verdict."}
                      </p>
                      {!hasConnectedApiIssuanceProfile ? (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={runExportJson}
                          disabled={!selectedId || !!exportLoading}
                          style={{
                            fontSize: "0.95rem",
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
                            : language === "tr" ? "Sınırlı Belge Düzenleme — JSON" : "Issue bounded JSON"}
                        </button>
                        <button
                          type="button"
                          onClick={runExportPdf}
                          disabled={!selectedId || !!exportLoading}
                          style={{
                            fontSize: "0.95rem",
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
                            : language === "tr" ? "Sınırlı Belge Düzenleme — PDF" : "Issue bounded PDF"}
                        </button>
                      </div>
                      ) : (
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "0.45rem", marginBottom: 0 }}>
                          {language === "tr"
                            ? "Sınırlı JSON/PDF düzenlemesi sol şeritteki eylem alanından."
                            : "Bounded JSON/PDF issuance from the left spine action area."}
                        </p>
                      )}
                      {selectedEventCard && (
                        <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.65rem", lineHeight: 1.5 }}>
                          {language === "tr" ? "Paket ID" : "Bundle ID"}: {bundleAnchorId} · {language === "tr" ? "Manifest ID" : "Manifest ID"}: {manifestAnchorId} · {language === "tr" ? "İz" : "Trace"}: {transcriptId ?? (language === "tr" ? "hazırlanmadı" : "pending")}
                        </div>
                      )}
                      {(issuanceState !== "idle" || !!issuedArtifact) && (
                        <div
                          style={{
                            marginTop: "0.85rem",
                            padding: "0.8rem 0.9rem",
                            borderRadius: 10,
                            border:
                              (issuanceState === "success" || (issuanceState === "idle" && !!issuedArtifact))
                                ? "1px solid var(--success)"
                                : issuanceState === "error"
                                ? "1px solid var(--error)"
                                : "1px solid var(--border-strong)",
                            background:
                              (issuanceState === "success" || (issuanceState === "idle" && !!issuedArtifact))
                                ? "var(--success-soft)"
                                : issuanceState === "error"
                                ? "var(--error-soft)"
                                : "rgba(148, 163, 184, 0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              marginBottom: "0.3rem",
                              color:
                                (issuanceState === "success" || (issuanceState === "idle" && !!issuedArtifact))
                                  ? "var(--success)"
                                  : issuanceState === "error"
                                  ? "var(--error)"
                                  : "var(--text-soft)",
                            }}
                          >
                            {(issuanceState === "success" || (issuanceState === "idle" && !!issuedArtifact))
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
                              fontSize: "0.9rem",
                              color: "var(--text-soft)",
                              lineHeight: 1.5,
                            }}
                          >
                            {(issuanceState === "success" || (issuanceState === "idle" && !!issuedArtifact))
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
                          {issuedArtifact?.localPreview ? (
                            <p
                              style={{
                                margin: "0.45rem 0 0",
                                fontSize: "0.86rem",
                                color: "var(--warning)",
                                lineHeight: 1.55,
                              }}
                            >
                              {language === "tr"
                                ? `Yerel önizleme fallback aktif (${issuedArtifact.previewReason ?? "backend_unreachable"}). Bu çıktı görsel kabul içindir; backend doğrulaması iddiası taşımaz.`
                                : `Local preview fallback active (${issuedArtifact.previewReason ?? "backend_unreachable"}). This output is for visual acceptance only and does not claim backend verification.`}
                            </p>
                          ) : null}
                          {issuedArtifact && (
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
                                  label: language === "tr" ? "Profil" : "Profile",
                                  value: issuedArtifact.meta.export_profile,
                                },
                                {
                                  label: language === "tr" ? "Biçim" : "Format",
                                  value: issuedArtifact.format,
                                },
                                {
                                  label: language === "tr" ? "Dışa Aktarım ID" : "Export ID",
                                  value: issuedArtifact.meta.export_id,
                                },
                                {
                                  label: language === "tr" ? "Makbuz ID" : "Receipt ID",
                                  value: issuedArtifact.meta.receipt_id,
                                },
                                {
                                  label: language === "tr" ? "Amaç" : "Purpose",
                                  value: issuedArtifact.meta.export_purpose,
                                },
                              ].map((item) => (
                                <div key={item.label} style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: "0.92rem",
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
                                      fontSize: "0.92rem",
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
                          {issuedArtifact
                            ? (() => {
                                const m = MSG[language];
                                const meta = issuedArtifact.meta;
                                const { primary } = resolveIssuanceDocumentFamilies(
                                  meta.export_profile,
                                  selectedSystem
                                );
                                const framing = getInstitutionFraming(issuanceAudience, language);
                                const traceDisplay =
                                  transcriptId ??
                                  (language === "tr"
                                    ? "henüz doğrulama izi yok"
                                    : "no verification trace yet");
                                return (
                                  <div style={{ marginTop: "1.25rem" }}>
                                    <div
                                      style={{
                                        fontSize: "0.84rem",
                                        fontWeight: 600,
                                        marginBottom: "0.45rem",
                                        fontFamily: MONO,
                                      }}
                                    >
                                      {m.verifierIssuancePreviewTitle}
                                    </div>
                                    {issuedArtifact.localPreview ? (
                                      <p
                                        style={{
                                          margin: "0 0 0.55rem",
                                          fontSize: "0.84rem",
                                          color: "var(--warning)",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {language === "tr"
                                          ? "Yerel önizleme modu: Bu belge görsel kabul için render edilir; nihai backend doğrulaması iddiası taşımaz."
                                          : "Local preview mode: this document is rendered for visual acceptance and does not claim final backend verification."}
                                      </p>
                                    ) : null}
                                    <label
                                      style={{
                                        display: "block",
                                        fontSize: "0.92rem",
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
                                        fontSize: "0.9rem",
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
                                            fontSize: "0.92rem",
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
                                            fontSize: "0.9rem",
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
                            <p style={{ fontSize: "0.92rem", margin: "0.65rem 0 0", color: "var(--error)" }}>
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
                  <p style={{ fontSize: "0.84rem", opacity: 0.75, marginBottom: "0.5rem" }}>
                    {language === "tr" ? "Bu çıktı nihai hukukî veya olgusal hüküm değildir." : "This output is not a final legal or factual determination."}
                  </p>
                  <div style={{ fontSize: "0.92rem", marginBottom: "0.5rem" }}>
                    <span style={{ opacity: 0.7 }}>{language === "tr" ? "Artifact profili" : "Artifact profile"}: </span>
                    <strong>{language === "tr" ? (getArtifactProfile(exportProfile)?.labelTr ?? exportProfile) : (getArtifactProfile(exportProfile)?.labelEn ?? exportProfile)}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setExportProfile("claims")}
                      disabled={!!exportLoading}
                      style={{
                        fontSize: "0.92rem",
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
                        fontSize: "0.92rem",
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
                  {!hasConnectedApiIssuanceProfile ? (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={runExportJson}
                      disabled={!selectedId || !!exportLoading}
                      style={{
                        fontSize: "0.95rem",
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
                        fontSize: "0.95rem",
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
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "0.45rem", marginBottom: 0 }}>
                      {language === "tr"
                        ? "Sınırlı JSON/PDF düzenlemesi sol şeritteki eylem alanından."
                        : "Bounded JSON/PDF issuance from the left spine action area."}
                    </p>
                  )}
                  {exportError && <p style={{ fontSize: "0.92rem", marginTop: "0.5rem", color: "var(--error)" }}>{exportError}</p>}
                  {issuedArtifact ? (() => {
                    const m = MSG[language];
                    const meta = issuedArtifact.meta;
                    const { primary } = resolveIssuanceDocumentFamilies(meta.export_profile, selectedSystem);
                    const framing = getInstitutionFraming(issuanceAudience, language);
                    const traceDisplay =
                      transcriptId ??
                      (language === "tr"
                        ? "henüz doğrulama izi yok"
                        : "no verification trace yet");
                    return (
                      <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.45rem", fontFamily: MONO }}>
                          {m.verifierIssuancePreviewTitle}
                        </div>
                        {issuedArtifact.localPreview ? (
                          <p style={{ margin: "0 0 0.55rem", fontSize: "0.84rem", color: "var(--warning)", lineHeight: 1.5 }}>
                            {language === "tr"
                              ? "Yerel önizleme modu: Bu belge görsel kabul için render edilir; nihai backend doğrulaması iddiası taşımaz."
                              : "Local preview mode: this document is rendered for visual acceptance and does not claim final backend verification."}
                          </p>
                        ) : null}
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
                            title={language === "tr" ? "Düzenleme özeti" : "Issuance summary"}
                          >
                            <p style={{ margin: "0 0 0.5rem", fontSize: "0.92rem", lineHeight: 1.6 }}>
                              {language === "tr"
                                ? "Bu yüzey, seçilen profil ve muhatap çerçevesiyle protokole bağlı kimlik alanlarını gösterir. Kayıtlı ve türetilmiş kanıt katmanları birleştirilmez."
                                : "This surface shows protocol-bound identity fields for the selected profile and recipient framing. Recorded and derived evidence layers are not merged."}
                            </p>
                          </DocumentSection>
                        </DocumentShell>
                      </div>
                    );
                  })() : null}
                </div>
              ) : (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.92rem", color: "var(--text-muted)" }}>
                  <p style={{ margin: "0 0 0.5rem" }}>
                    {language === "tr"
                      ? "Kontrollü JSON/PDF çıktıları, canlı olay kataloğundaki (API) kimlik ve tenant politikasına bağlıdır; trace ve unknown/disputed üstüne yazılmaz."
                      : "Controlled JSON/PDF outputs are bound to the live event catalog (API) identity and tenant policy; they do not override the trace or unknown/disputed items."}
                  </p>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", opacity: 0.88, lineHeight: 1.45 }}>
                    {language === "tr"
                      ? `Manifest bağı ${manifestAnchorId} üzerinde kalır.`
                      : `Panel remains anchored to manifest ${manifestAnchorId}.`}
                  </p>
                  {!selected ? (
                    <p style={{ margin: "0 0 0.5rem" }}>
                      {language === "tr"
                        ? "Belge üretimi için olayın API ile eşleşmesi ve sol omurgadan seçilmiş olması gerekir."
                        : "For artifact issuance, the event must match the API and be selected from the spine."}
                    </p>
                  ) : null}
                  <div style={{ fontSize: "0.92rem", opacity: 0.9 }}>
                    {language === "tr" ? "Bu dikey için artifact profilleri:" : "Artifact profiles for this vertical:"}
                    <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
                      {getArtifactProfilesForDomain(selectedSystem).slice(0, 5).map((p) => (
                        <li key={p.code}>
                          {language === "tr" ? p.ctaTr : p.ctaEn} — {language === "tr" ? p.purposeShortTr : p.purposeShortEn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {issuedArtifact && !hasConnectedApiIssuanceProfile
                ? (() => {
                    const m = MSG[language];
                    const meta = issuedArtifact.meta;
                    const { primary } = resolveIssuanceDocumentFamilies(meta.export_profile, selectedSystem);
                    const framing = getInstitutionFraming(issuanceAudience, language);
                    const traceDisplay =
                      transcriptId ??
                      (language === "tr"
                        ? "henüz doğrulama izi yok"
                        : "no verification trace yet");
                    return (
                      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.9rem" }}>
                        <div style={{ fontSize: "0.84rem", fontWeight: 600, marginBottom: "0.45rem", fontFamily: MONO }}>
                          {m.verifierIssuancePreviewTitle}
                        </div>
                        {issuedArtifact.localPreview ? (
                          <p style={{ margin: "0 0 0.55rem", fontSize: "0.84rem", color: "var(--warning)", lineHeight: 1.5 }}>
                            {language === "tr"
                              ? "Yerel önizleme modu: Bu belge görsel kabul için render edilir; nihai backend doğrulaması iddiası taşımaz."
                              : "Local preview mode: this document is rendered for visual acceptance and does not claim final backend verification."}
                          </p>
                        ) : null}
                        <label style={{ display: "block", fontSize: "0.92rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                          {m.verifierAudienceSelect}
                        </label>
                        <select
                          value={issuanceAudience}
                          onChange={(e) => setIssuanceAudience(e.target.value as InstitutionAudienceId)}
                          style={{
                            fontSize: "0.9rem",
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
                          <DocumentSection variant="authority" title={language === "tr" ? "Düzenleme özeti" : "Issuance summary"}>
                            <p style={{ margin: "0 0 0.5rem", fontSize: "0.92rem", lineHeight: 1.6 }}>
                              {language === "tr"
                                ? "Bu yüzey, seçilen profil ve muhatap çerçevesiyle protokole bağlı kimlik alanlarını gösterir. Kayıtlı ve türetilmiş kanıt katmanları birleştirilmez."
                                : "This surface shows protocol-bound identity fields for the selected profile and recipient framing. Recorded and derived evidence layers are not merged."}
                            </p>
                          </DocumentSection>
                          <DocumentMetadataBlock
                            variant="authority"
                            label={language === "tr" ? "Katman ayrımı" : "Layer separation"}
                            note={
                              language === "tr"
                                ? "Doktrin: kayıtlı ≠ türetilmiş; iz ≠ nihai gerçek; düzenleme ≠ sorumluluk."
                                : "Doctrine: recorded ≠ derived; trace ≠ final truth; issuance ≠ blame."
                            }
                          >
                            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem", lineHeight: 1.55 }}>
                              <li>{language === "tr" ? "Kusur veya suç isnadı dili kullanılmaz." : "No fault or criminal-attribution language is used."}</li>
                              <li>{language === "tr" ? "Çıktı, bounded issuance kurallarına tabidir." : "Output remains subject to bounded issuance rules."}</li>
                            </ul>
                          </DocumentMetadataBlock>
                        </DocumentShell>
                      </div>
                    );
                  })()
                : null}
            </section>
            </div>
            </>
            )}
            </div>
            </div>
          </main>
      </div>
    </div>
  );
}


