"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
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
import { BrandSignatureBand } from "../components/BrandSignatureBand";
import { FooterBottomRow } from "../components/FooterBottomRow";
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
const MONO = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
const SANS = "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// UI now uses CSS custom properties; verifier chassis uses minimal radius
const UI = {
  radius: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8, pill: 999 },
  sectionGap: "0.88rem",
} as const;
const INNER_TILE_RADIUS = 2;
const INNER_TILE_PAD = "0.38rem 0.5rem";
const INNER_TILE_PAD_COMPACT = "0.3rem 0.44rem";

const CH = { spinePx: 220, topNavPx: 44 } as const;
const PX = {
  headerPadX: 16,
  headerGap: 16,
  navSectionPad: "12px 14px 8px",
  navRowPad: "8px 14px",
  incidentPad: "10px 16px",
  rolePad: "8px 16px",
  tabPadX: 16,
  phasePadX: 16,
  rightBlockPad: "12px 14px",
  evidencePad: "10px 12px",
} as const;
const VERIFIER_SURFACE_VARS = {
  "--bg": "#0e0f11",
  "--header-bg": "#161820",
  "--panel": "#161820",
  "--panel-raised": "#1c1e24",
  "--panel-card": "#1c1e24",
  "--surface": "#1c1e24",
  "--surface2": "#22252e",
  "--surface3": "#2a2d38",
  "--text": "#e8e6e0",
  "--text-primary": "#e8e6e0",
  "--text-soft": "#8a8880",
  "--text-secondary": "#8a8880",
  "--text-muted": "#4a4c52",
  "--text-dim": "#4a4c52",
  "--border": "rgba(255,255,255,0.07)",
  "--border-soft": "rgba(255,255,255,0.07)",
  "--border-muted": "rgba(255,255,255,0.07)",
  "--border-strong": "rgba(255,255,255,0.12)",
  "--accent": "#e8650a",
  "--accent-soft": "rgba(232,101,10,0.15)",
  "--accent-border": "rgba(232,101,10,0.3)",
  "--warning": "#c07a10",
  "--orange-glow": "rgba(232,101,10,0.08)",
} as CSSProperties;

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

const SOURCE_CHANNELS: {
  id: SourceId;
  tr: string;
  en: string;
  badgeTr: string;
  badgeEn: string;
  infoTr: string;
  infoEn: string;
}[] = [
  {
    id: "demo_archive",
    tr: "Demo Arşivi",
    en: "Demo Archive",
    badgeTr: "Canlı kanal",
    badgeEn: "Live channel",
    infoTr: "Yerel inceleme turunda etkin kaynak. Demo cihaz evreni ve olay paketleri bu kanaldan yönetilir.",
    infoEn: "Active source for local review. Demo device universe and event packages are managed from this channel.",
  },
  {
    id: "connected_device",
    tr: "Bağlı Cihazlar",
    en: "Connected Devices",
    badgeTr: "Pilot kanal",
    badgeEn: "Pilot channel",
    infoTr:
      "Bu kanal pilot kurulumlarda kurumsal cihaza bağlanır. Aktif cihazlar burada görünür. Pilot başlatmak için erişim gerekir.",
    infoEn:
      "This channel binds to institutional devices during pilot deployments. Active devices appear here. Pilot start requires access.",
  },
  {
    id: "uploaded_package",
    tr: "Yüklenen Dosya Paketi",
    en: "Uploaded File Package",
    badgeTr: "Kurumsal entegrasyon",
    badgeEn: "Institutional integration",
    infoTr:
      "Bu kanal dışarıdan sağlanan olay paketlerini içeri alır; log, telemetri, medya, manifest, operatör notu, önceki belge ve zincir kayıtlarını okuyabilir.",
    infoEn:
      "This channel ingests externally provided event packages and can read logs, telemetry, media, manifests, operator notes, prior documents, and chain records.",
  },
];

const DEMO_DEVICES_BY_SYSTEM: Record<MockSystemId, string[]> = {
  vehicle: ["Demo Araç A", "Demo Araç B"],
  drone: ["Demo Drone A"],
  robot: ["Demo Robot A"],
};

const SYSTEM_LABELS: Record<MockSystemId, { tr: string; en: string }> = {
  vehicle: { tr: "Araç", en: "Vehicle" },
  drone: { tr: "Drone", en: "Drone" },
  robot: { tr: "Robot", en: "Robot" },
};

const PROFESSIONAL_SCENARIO_LABELS_TR: Record<string, string> = {
  "Sinyal ve yol geçiş ihlali": "Sinyal Geçiş Uyum İncelemesi",
  "Temas ve yaya güvenliği": "Yaya Temas Güvenlik İncelemesi",
  "Yön ve sinyal uyumu": "Yön-Sinyal Tutarlılık İncelemesi",
  "Hat koridoru ihlali": "Hat Koridoru Emniyet İncelemesi",
  "Saha sınırı ihlali": "Saha Sınırı Geçiş İncelemesi",
  "Uçuş stabilitesi": "Uçuş Stabilite İncelemesi",
  "Hassas yönlendirme sapması": "Hassas Yönlendirme Sapma İncelemesi",
  "Kamusal stabilite olayı": "Kamusal Stabilite Olay İncelemesi",
  "Rota engel çarpması": "Rota Engel Temas İncelemesi",
};

const PROFESSIONAL_SCENARIO_LABELS_EN: Record<string, string> = {
  "Sinyal ve yol geçiş ihlali": "Signal Crossing Compliance Review",
  "Temas ve yaya güvenliği": "Pedestrian Contact Safety Review",
  "Yön ve sinyal uyumu": "Direction-Signal Consistency Review",
  "Hat koridoru ihlali": "Line Corridor Safety Review",
  "Saha sınırı ihlali": "Boundary Intrusion Review",
  "Uçuş stabilitesi": "Flight Stability Review",
  "Hassas yönlendirme sapması": "Precision Guidance Drift Review",
  "Kamusal stabilite olayı": "Public Stability Incident Review",
  "Rota engel çarpması": "Route Obstacle Contact Review",
};

type RoleLensId =
  | "insurance"
  | "police"
  | "adjudication"
  | "expert"
  | "manufacturer"
  | "software"
  | "engineering";

const ROLE_LENSES: {
  id: RoleLensId;
  tr: string;
  en: string;
  insightTr: string;
  insightEn: string;
  primaryOutputTr: string;
  primaryOutputEn: string;
  exportProfile: "claims" | "legal";
}[] = [
  {
    id: "police",
    tr: "Polis",
    en: "Police",
    insightTr: "Olay yeri, zaman çizgisi ve kaza tutanağı öncelikli.",
    insightEn: "Incident scene, timeline, and accident report prioritized.",
    primaryOutputTr: "Kaza Tutanağı",
    primaryOutputEn: "Accident Report",
    exportProfile: "legal",
  },
  {
    id: "insurance",
    tr: "Sigorta",
    en: "Insurance",
    insightTr: "Hasar akışı, teminat incelemesi ve belge zinciri öncelikli.",
    insightEn: "Claims flow, coverage review, and document chain prioritized.",
    primaryOutputTr: "Hasar / Sigorta Belgesi",
    primaryOutputEn: "Claims / Insurance Document",
    exportProfile: "claims",
  },
  {
    id: "adjudication",
    tr: "Muhakeme",
    en: "Adjudication",
    insightTr: "Delil zinciri, inceleme izi ve açık hususlar öncelikli.",
    insightEn: "Evidence chain, review trace, and open issues prioritized.",
    primaryOutputTr: "Hukuk / Muhakeme Belgesi",
    primaryOutputEn: "Legal / Adjudication Document",
    exportProfile: "legal",
  },
  {
    id: "expert",
    tr: "Bilirkişi",
    en: "Expert",
    insightTr: "Teknik bulgu zinciri, karşılaştırma notları ve açık hususlar öne alınır.",
    insightEn: "Technical finding chain, comparison notes, and open issues are prioritized.",
    primaryOutputTr: "Teknik İnceleme Belgesi",
    primaryOutputEn: "Technical Inspection Document",
    exportProfile: "legal",
  },
  {
    id: "manufacturer",
    tr: "Üretici",
    en: "Manufacturer",
    insightTr: "Sistem davranışı, emniyet sınırı ve olay-tepki ilişkisi öne alınır.",
    insightEn: "System behavior, safety envelope, and event-response relation are prioritized.",
    primaryOutputTr: "Üretim İnceleme Belgesi",
    primaryOutputEn: "Manufacturing Inspection Document",
    exportProfile: "legal",
  },
  {
    id: "software",
    tr: "Yazılım",
    en: "Software",
    insightTr: "Telemetri, sürüm izi ve karar akışı okumaları öne alınır.",
    insightEn: "Telemetry, version trail, and decision-flow readings are prioritized.",
    primaryOutputTr: "Yazılım İnceleme Belgesi",
    primaryOutputEn: "Software Inspection Document",
    exportProfile: "legal",
  },
  {
    id: "engineering",
    tr: "Mühendislik",
    en: "Engineering",
    insightTr: "Sensör/aktüasyon bağı, model tepkisi ve teknik sınır notları öne alınır.",
    insightEn: "Sensor/actuation linkage, model response, and technical boundary notes are prioritized.",
    primaryOutputTr: "Mühendislik İnceleme Belgesi",
    primaryOutputEn: "Engineering Inspection Document",
    exportProfile: "legal",
  },
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

function phaseUiLabel(
  phase: "t0" | "t1" | "t2" | "t3",
  language: "en" | "tr"
): string {
  if (language === "tr") {
    if (phase === "t0") return "T0 / Olay Öncesi";
    if (phase === "t1") return "T1 / Yaklaşım";
    if (phase === "t2") return "T2 / Kritik An";
    return "T3 / Olay Sonrası";
  }
  if (phase === "t0") return "T0 / Pre-Event";
  if (phase === "t1") return "T1 / Approach";
  if (phase === "t2") return "T2 / Critical Moment";
  return "T3 / Post-Event";
}

function phasePostureLabel(value: string | undefined, language: "en" | "tr") {
  if (!value) return language === "tr" ? "Doğrulanmadı" : "Unverified";
  if (language === "tr") {
    if (value === "UNVERIFIED") return "Doğrulanmadı";
    if (value === "SUPPORTED") return "Destekleniyor";
    if (value === "CONTESTED") return "Çekişmeli";
    if (value === "INSUFFICIENT") return "Yetersiz";
    if (value === "RESTRICTED") return "Kısıtlı";
    if (value === "ready") return "Hazır";
    if (value === "bounded") return "Sınırlı Hazır";
    if (value === "limited") return "Sınırlı";
    if (value === "not_ready") return "Hazır Değil";
  }
  if (value === "ready") return "Ready";
  if (value === "bounded") return "Bounded";
  if (value === "limited") return "Limited";
  if (value === "not_ready") return "Not Ready";
  return value;
}

export function VerifierContent({ initialEventId }: { initialEventId?: string }) {
  const { lang: language, setLang: setLanguage } = useLanguage();
  const [selectedSource, setSelectedSource] = useState<SourceId>("demo_archive");
  const [activeSourcePanel, setActiveSourcePanel] = useState<SourceId>("demo_archive");
  const [selectedSystem, setSelectedSystem] = useState<MockSystemId>(() => resolveInitialSystem(initialEventId));
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRoleLens, setSelectedRoleLens] = useState<RoleLensId>("insurance");
  const [selectedPhase, setSelectedPhase] = useState<"t0" | "t1" | "t2" | "t3">("t2");
  const [expandedUniverse, setExpandedUniverse] = useState<MockSystemId>(selectedSystem);
  const [activeSpineSection, setActiveSpineSection] = useState<string>("");
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
  const exportProfile = ROLE_LENSES.find((role) => role.id === selectedRoleLens)?.exportProfile ?? "claims";
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
  const [accessGateConfigured, setAccessGateConfigured] = useState<boolean | null>(null);
  const [issuanceAudience, setIssuanceAudience] = useState<InstitutionAudienceId>(
    DEFAULT_AUDIENCE_BY_PROFILE.claims
  );
  const [lastIssuedAtIso, setLastIssuedAtIso] = useState<string | null>(null);

  useEffect(() => {
    setIssuanceAudience(DEFAULT_AUDIENCE_BY_PROFILE[exportProfile]);
  }, [exportProfile]);

  useEffect(() => {
    setExpandedUniverse(selectedSystem);
  }, [selectedSystem]);

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
  const selectedPhaseSpec = selectedCase?.incidentSpine?.phases?.find((phase) => phase.phase === selectedPhase) ?? null;
  const selectedPackage = displayEvents.find((e) => e.eventId === selectedEventId) ?? null;

  useEffect(() => {
    if (initialEventId || selectedSource !== "demo_archive" || selectedScenario) return;
    const firstScenario = DEMO_PACKAGES.find((pkg) => pkg.system === selectedSystem)?.scenarioClass ?? null;
    if (firstScenario) setSelectedScenario(firstScenario);
  }, [initialEventId, selectedScenario, selectedSource, selectedSystem]);

  useEffect(() => {
    if (initialEventId || selectedSource !== "demo_archive" || !selectedScenario || displayEvents.length === 0) return;
    if (selectedEventId && displayEvents.some((eventCard) => eventCard.eventId === selectedEventId)) return;
    handleSelectEvent(displayEvents[0].eventId);
  }, [displayEvents, initialEventId, selectedEventId, selectedScenario, selectedSource]);

  useEffect(() => {
    if (selectedCase?.incidentSpine?.phases?.length) {
      const phaseOptions = selectedCase.incidentSpine.phases.map((p) => p.phase);
      if (phaseOptions.includes(selectedPhase)) return;
      setSelectedPhase(selectedCase.incidentSpine.phases[0].phase);
    } else {
      setSelectedPhase("t2");
    }
  }, [selectedCase, selectedPhase]);
  const packageSummaryMain =
    selectedPackage?.summary.split(language === "tr" ? " Bağlam:" : " Context:")[0] ??
    null;
  const packageOperationalContext =
    selectedPackage?.summary.split(language === "tr" ? " Bağlam:" : " Context:")[1]?.trim() ??
    null;

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
  const visibleDerived = selectedCase?.derivedAssessment?.length
    ? toDerivedRows(selectedCase.derivedAssessment, language)
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
  /**
   * issuedArtifact: only reflects an artifact explicitly produced by user action
   * (runExport / runVerification). No silent auto-construction.
   */
  const issuedArtifact: IssuanceRecord | null = lastIssuedArtifact;

  const msg = MSG[language];
  const selectedRoleLensMeta =
    ROLE_LENSES.find((role) => role.id === selectedRoleLens) ?? ROLE_LENSES[0];
  const roleSignals: Record<RoleLensId, string[]> = {
    insurance: [selectedRoleLensMeta.primaryOutputTr, "Teminat bağı", "Hasar zinciri", "Kapsam ayracı"],
    police: [selectedRoleLensMeta.primaryOutputTr, "Zaman çizgisi", "Sahne tutarlılığı"],
    adjudication: [selectedRoleLensMeta.primaryOutputTr, "Kayıt/türetilmiş ayrımı", "İz bağı", "Açık hususlar"],
    expert: [selectedRoleLensMeta.primaryOutputTr, "Teknik bağlam", "Bulgu karşılaştırma", "Belirsizlik notu"],
    manufacturer: [selectedRoleLensMeta.primaryOutputTr, "Sistem davranışı", "Güvenlik zarfı", "Tepki penceresi"],
    software: [selectedRoleLensMeta.primaryOutputTr, "Telemetri izi", "Sürüm etkisi", "Karar akış izi"],
    engineering: [selectedRoleLensMeta.primaryOutputTr, "Sensör/aktüatör bağı", "Mekansal vektör", "Sınır koşulları"],
  };

  const evidenceRecordedBandItems = (
    visibleRecorded.length > 0
      ? visibleRecorded.map((item) => `${item.source} · ${item.referenceId}`)
      : [
          language === "tr"
            ? `Paket kimliği · ${selectedEventCard?.eventId ?? "DEMO-PACKAGE-PENDING"}`
            : `Package identity · ${selectedEventCard?.eventId ?? "DEMO-PACKAGE-PENDING"}`,
          language === "tr"
            ? `Bağ kimliği · ${bundleAnchorId}`
            : `Bundle link · ${bundleAnchorId}`,
          language === "tr"
            ? `Manifest · ${manifestAnchorId}`
            : `Manifest · ${manifestAnchorId}`,
          language === "tr"
            ? `Kaynak durum · ${selectedSource}`
            : `Source status · ${selectedSource}`,
        ]
  ).slice(0, 4);

  const evidenceDerivedBandItems = (
    visibleDerived.length > 0
      ? visibleDerived.map((item) => `${item.type} · ${item.confidence}`)
      : [
          language === "tr"
            ? `Faz okuması · ${selectedPhaseSpec ? phaseUiLabel(selectedPhaseSpec.phase, language) : phaseUiLabel(selectedPhase, language)}`
            : `Phase reading · ${selectedPhaseSpec ? phaseUiLabel(selectedPhaseSpec.phase, language) : phaseUiLabel(selectedPhase, language)}`,
          language === "tr"
            ? `Duruş · ${selectedPhaseSpec ? phasePostureLabel(selectedPhaseSpec.verification.posture, language) : "Bekliyor"}`
            : `Posture · ${selectedPhaseSpec ? phasePostureLabel(selectedPhaseSpec.verification.posture, language) : "Pending"}`,
          language === "tr"
            ? `Rol etkisi · ${selectedRoleLensMeta.tr}`
            : `Role impact · ${selectedRoleLensMeta.en}`,
          language === "tr"
            ? `Belge ailesi · ${selectedProfileLabel}`
            : `Document family · ${selectedProfileLabel}`,
        ]
  ).slice(0, 4);

  const evidenceUnknownBandItems = (
    visibleUnknownItems.length > 0
      ? visibleUnknownItems
      : [
          language === "tr"
            ? "Açık husus · insan gözden geçirme bekleniyor"
            : "Open issue · awaiting human review",
          language === "tr"
            ? "İtiraz penceresi · doğrulama izi ile birlikte"
            : "Dispute window · paired with verification trace",
          language === "tr"
            ? "Sınır notu · kayıtlı ve türetilmiş ayrımı korunur"
            : "Boundary note · recorded/derived separation preserved",
          language === "tr"
            ? "Nihai hüküm yok · protokol yüzeyi"
            : "No final verdict · protocol surface",
        ]
  ).slice(0, 4);

  function professionalScenarioLabel(name: string) {
    if (language === "tr") return PROFESSIONAL_SCENARIO_LABELS_TR[name] ?? name;
    return PROFESSIONAL_SCENARIO_LABELS_EN[name] ?? name;
  }

  function issuanceFamilyLabel(profile: string, role?: RoleLensId) {
    if (role) {
      const roleMeta = ROLE_LENSES.find((r) => r.id === role);
      if (roleMeta) {
        return language === "tr" ? roleMeta.primaryOutputTr : roleMeta.primaryOutputEn;
      }
    }

    if (language === "tr") {
      if (profile === "claims") return "Hasar / Sigorta Belgesi";
      if (profile === "legal") return "Hukuk / Muhakeme Belgesi";
      if (profile === "technical") return "Teknik İnceleme Belgesi";
    }
    if (profile === "claims") return "Claims / Insurance Dossier";
    if (profile === "legal") return "Legal / Adjudication Dossier";
    if (profile === "technical") return "Technical Inspection Dossier";
    return profile;
  }

  function renderIssuanceDocumentBody(meta: ExportArtifactResponse, role: RoleLensId) {
    const commonSections = (
      <>
        <DocumentSection variant="authority" title={language === "tr" ? "Olay Kimliği ve Kapsam" : "Event Identity and Scope"}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {language === "tr"
              ? "Belge, olay kimliği, zaman bağlamı, cihaz/sistem çevresi ve kaynak kayıt özetiyle dosyalanabilir bir inceleme çerçevesi sunar."
              : "This document provides a file-ready review frame with event identity, temporal context, device/system context, and source-record summary."}
          </p>
        </DocumentSection>
        <DocumentSection variant="authority" title={language === "tr" ? "Kaynak Kayıt Özeti ve Uzman Okumaları" : "Source Record Summary and Expert Readings"}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {language === "tr"
              ? "Kayıtlı materyal, uzman okumalarıyla aynılaştırılmaz; iki katman ayrı gösterilir ve yorum alanı açık bırakılır."
              : "Recorded material is not conflated with expert readings; both layers stay explicit and interpretation remains bounded."}
          </p>
        </DocumentSection>
      </>
    );

    const profileSpecific = (() => {
      // Role-specific primary document sections
      const primaryDocumentSection = (
        <DocumentSection variant="authority" title={language === "tr" ? selectedRoleLensMeta.primaryOutputTr : selectedRoleLensMeta.primaryOutputEn}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6, fontWeight: 600 }}>
            {role === "police" && language === "tr"
              ? "Polis için birincil belge: Olay yeri, zaman çizgisi ve ilk tespitler detaylandırılır. İşin içinden çıkılamıyorsa ilk resmi kayıt burada başlar."
              : role === "police" && language === "en"
              ? "Primary document for police: Incident scene, timeline, and initial findings are detailed. If things are unclear, the first official record starts here."
              : role === "insurance" && language === "tr"
              ? "Sigorta için birincil belge: Hasar akışı, teminat incelemesi ve olay zinciri öne çıkarılır."
              : role === "insurance" && language === "en"
              ? "Primary document for insurance: Claims flow, coverage review, and incident chain are prioritized."
              : role === "adjudication" && language === "tr"
              ? "Muhakeme için birincil belge: Delil zinciri, inceleme izi ve açık hususlar üçüncü seviye okumada öne çıkarılır."
              : role === "adjudication" && language === "en"
              ? "Primary document for adjudication: Evidence chain, review trace, and open issues are prioritized in third-level reading."
              : language === "tr"
              ? `${selectedRoleLensMeta.primaryOutputTr} rolüne özel birincil inceleme belgesi.`
              : `Primary inspection document specific to ${selectedRoleLensMeta.primaryOutputEn} role.`}
          </p>
        </DocumentSection>
      );

      if (meta.export_profile === "claims") {
        return (
          <>
            {primaryDocumentSection}
            <DocumentSection variant="authority" title={language === "tr" ? "Hasar Akışı ve Belge Ekleri" : "Claims Flow and Filing Attachments"}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {language === "tr"
                  ? "Tarafsız olay kronolojisi, hasar/teminat incelemesine yardımcı olacak şekilde öne alınır; belge ekleri referans zinciriyle belirtilir."
                  : "Neutral chronology is prioritized for claims/coverage review, with filing attachments linked to the reference chain."}
              </p>
            </DocumentSection>
          </>
        );
      } else if (meta.export_profile === "legal") {
        return (
          <>
            {primaryDocumentSection}
            <DocumentSection variant="authority" title={language === "tr" ? "Kronoloji, Delil Zinciri ve Açık Hususlar" : "Chronology, Evidence Chain, and Open Issues"}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {language === "tr"
                  ? "Muhakeme dosyası için olay sırası, inceleme izi ve açık hususlar birlikte görünür; yorum alanı korunur."
                  : "For adjudication files, event sequence, review trace, and open issues are shown together while interpretation space is preserved."}
              </p>
            </DocumentSection>
          </>
        );
      } else {
        return (
          <>
            {primaryDocumentSection}
            <DocumentSection variant="authority" title={language === "tr" ? "Sistem Davranışı ve Teknik Okuma" : "System Behavior and Technical Reading"}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {language === "tr"
                  ? "Telemetri özeti, olay anı teknik okuma ve geliştirme/doğrulama notları teknik inceleme ekibi için öne alınır."
                  : "Telemetry summary, moment-level technical reading, and development/validation notes are prioritized for technical teams."}
              </p>
            </DocumentSection>
          </>
        );
      }
    })();

    return (
      <>
        {commonSections}
        {profileSpecific}
        <DocumentMetadataBlock
          variant="authority"
          label={language === "tr" ? "İnceleme İzi ve Düzenleme Notu" : "Review Trace and Issuance Note"}
          note={
            language === "tr"
              ? "Doktrin: kayıtlı ≠ türetilmiş; iz ≠ nihai gerçek; düzenleme ≠ sorumluluk."
              : "Doctrine: recorded ≠ derived; trace ≠ final truth; issuance ≠ blame."
          }
        >
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem", lineHeight: 1.55 }}>
            <li>{language === "tr" ? "Hüküm vermez. Şahitlik eder." : "It does not issue verdicts; it testifies."}</li>
            <li>
              {language === "tr"
                ? "Bu belge, kayıtlı materyal ile uzman okumalarını aynılaştırmaz."
                : "This document does not collapse recorded material and expert readings."}
            </li>
            <li>
              {language === "tr"
                ? "Bu belge, nihai kusur/hüküm kararı üretmez."
                : "This document does not produce final fault or adjudication outcomes."}
            </li>
          </ul>
        </DocumentMetadataBlock>
      </>
    );
  }

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
      const selectedRoleLensMeta = ROLE_LENSES.find((r) => r.id === selectedRoleLens);
      const requestBody: CreateExportRequest = {
        profile: exportProfile,
        format,
        purpose: selectedPurpose,
        outputTitle: language === "tr" ? selectedRoleLensMeta?.primaryOutputTr : selectedRoleLensMeta?.primaryOutputEn,
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
        const rawError = errorPayload.error ?? `Export failed (HTTP ${res.status})`;
        if (rawError === "ACCESS_GATE_NOT_CONFIGURED") {
          setAccessGateConfigured(false);
          setExportError(
            language === "tr"
              ? "Erişim kapısı yapılandırılmamış — belge üretimi için QARAQUTU_ACCESS_TOKEN ortam değişkeni gerekli."
              : "Access gate not configured — QARAQUTU_ACCESS_TOKEN environment variable required for document issuance."
          );
        } else {
          setExportError(rawError);
        }
        return;
      }

      const meta = successPayload as ExportArtifactResponse;
      if (isLocalPreview && successPayload.preview_reason === "access_gate_not_configured") {
        setAccessGateConfigured(false);
      }
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
    { id: "recorded", label: "Kaynak Kayıtlar" },
    { id: "derived", label: "Uzman Okumaları" },
    {
      id: "unknownDisputed",
      label: "Açık Hususlar",
    },
    { id: "transcript", label: "İnceleme İzi" },
    { id: "issuance", label: "Belgeleme" },
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

  /** Export availability — truthful reflection of backend reachability */
  type ExportAvailability = "export_ready" | "preview_only" | "access_required" | "backend_unavailable";
  const exportAvailability: ExportAvailability =
    accessGateConfigured === false
      ? "access_required"
      : hasConnectedApiIssuanceProfile
      ? "export_ready"
      : canUseLocalPreviewFallbackArtifact
      ? "preview_only"
      : "backend_unavailable";
  const canExport = exportAvailability === "export_ready";
  const exportDisabledReason: string | null =
    exportAvailability === "access_required"
      ? language === "tr"
        ? "Erişim kapısı yapılandırılmamış — QARAQUTU_ACCESS_TOKEN gerekli"
        : "Access gate not configured — QARAQUTU_ACCESS_TOKEN required"
      : exportAvailability === "backend_unavailable"
      ? language === "tr"
        ? "API bağlantısı yok"
        : "No API connection"
      : exportAvailability === "preview_only"
      ? language === "tr"
        ? "Yalnızca önizleme — backend bağlantısı yok"
        : "Preview only — no backend connection"
      : null;

  const workstationLive = Boolean(selectedEventCard);

  return (
    <div
      style={{
        ...VERIFIER_SURFACE_VARS,
        height: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: SANS,
        fontSize: "12px",
        lineHeight: 1.4,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        display: "grid",
        gridTemplateRows: `${CH.topNavPx}px 1fr 28px`,
        gridTemplateColumns: `${CH.spinePx}px 1fr`,
        gridTemplateAreas: `"hdr hdr" "nav main" "foot foot"`,
        /* bottom bar row added for brand attribution strip */
        overflow: "hidden",
      }}
    >
      <header
        style={{
          gridArea: "hdr",
          zIndex: 40,
          height: CH.topNavPx,
          borderBottom: "1px solid var(--border-strong)",
          background: "#161820",
          display: "flex",
          alignItems: "center",
          gap: `${PX.headerGap}px`,
          padding: `0 ${PX.headerPadX}px`,
        }}
      >
        <Link
          href="/"
          aria-label={language === "tr" ? "QARAQUTU ana sayfaya git" : "Go to QARAQUTU home"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <LogoPrimary height={22} variant="onDarkSurface" />
          <span
            style={{
              fontFamily: MONO,
              fontSize: "10px",
              color: "var(--text-secondary)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {language === "tr" ? "İnceleme İstasyonu" : "Inspection Station"}
          </span>
        </Link>
        <span style={{ width: 1, height: 20, background: "var(--border-strong)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: "11px", color: "var(--text-secondary)", flexShrink: 0 }}>PKT:</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "11px",
              color: "var(--text-primary)",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {selectedEventCard?.eventId ?? "DEMO-PACKAGE-PENDING"} · {selectedEventCard?.title ?? (language === "tr" ? "Paket seçimi bekleniyor" : "Package selection pending")}
          </span>
          <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", padding: "2px 6px", border: "1px solid rgba(122,173,232,0.4)", color: "#7aade8", background: "rgba(122,173,232,0.08)", textTransform: "uppercase" }}>{selectedSystem}</span>
          <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", padding: "2px 6px", border: "1px solid rgba(232,101,10,0.4)", color: "var(--accent)", background: "var(--accent-soft)", textTransform: "uppercase" }}>{selectedPackage?.severity === "high" ? (language === "tr" ? "RİSK: YÜKSEK" : "RISK: HIGH") : selectedPackage?.severity === "medium" ? (language === "tr" ? "RİSK: ORTA" : "RISK: MEDIUM") : (language === "tr" ? "RİSK: DÜŞÜK" : "RISK: LOW")}</span>
          <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", padding: "2px 6px", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", textTransform: "uppercase" }}>{displayedReviewState}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: workstationLive ? "#5fc87a" : "var(--text-dim)",
              padding: "1px 5px",
              border: `1px solid ${workstationLive ? "rgba(95,200,122,0.4)" : "var(--border)"}`,
              background: workstationLive ? "rgba(95,200,122,0.08)" : "var(--panel)",
              borderRadius: 0,
              whiteSpace: "nowrap",
            }}
          >
            {workstationLive ? (language === "tr" ? "İstasyon Aktif" : "Station Active") : (language === "tr" ? "İstasyon Hazır" : "Station Ready")}
          </span>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 0,
              border: "1px solid var(--border-strong)",
              overflow: "hidden",
            }}
            role="group"
            aria-label="Language"
          >
            {(["tr", "en", "lt"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  if (l === "tr" || l === "en") setLanguage(l);
                }}
                style={{
                  fontSize: "9px",
                  padding: "3px 7px",
                  background: language === l ? "var(--accent-soft)" : "transparent",
                  color: language === l ? "var(--accent)" : "var(--text-muted)",
                  border: "none",
                  cursor: l === "lt" ? "default" : "pointer",
                  fontFamily: MONO,
                  fontWeight: language === l ? 700 : 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: l === "lt" ? 0.65 : 1,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div
        className="verifier-chassis-grid"
        style={{
          position: "relative",
          zIndex: 0,
          gridArea: "nav",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          borderRight: "1px solid var(--border)",
          background: "#161820",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
          <aside
            style={{
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
            aria-label={language === "tr" ? "Komut omurgası" : "Command spine"}
          >
            {/* Sidebar header — canonical nav-section */}
            <div
              style={{
                padding: "12px 14px 8px",
                fontFamily: MONO,
                fontSize: "9px",
                color: "var(--text-dim)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {language === "tr" ? "Komut Omurgası" : "Command Spine"}
            </div>

            {/* Workflow hint — canonical nav-item row */}
            <div
              style={{
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid var(--border)",
              }}
              role="status"
              aria-live="polite"
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-dim)", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  lineHeight: 1.4,
                }}
              >
                {language === "tr"
                  ? "1 Kaynak → 2 Aile → 3 Sınıf → 4 Paket"
                  : "1 Source → 2 Family → 3 Class → 4 Package"}
              </span>
            </div>

            <div
              style={{
                overflow: "visible",
                flex: 1,
              }}
            >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                padding: "12px 14px 8px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {language === "tr" ? "Seçim" : "Select"}
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
                label: language === "tr" ? "Cihaz Ailesi" : "Device Family",
              },
              {
                id: "scenario",
                step: 3,
                label: language === "tr" ? "Olay Sınıfı" : "Incident Class",
              },
              {
                id: "event",
                step: 4,
                label: language === "tr" ? "Olay Paketi" : "Event Package",
              },
            ].map((section) => {
              const isActive = activeSpineSection === section.id;
              return (
                <div key={section.id}>
                  <div
                    style={{
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      background: isActive ? "var(--accent-soft)" : "transparent",
                      borderLeft: isActive
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                      transition: "background 0.15s",
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setActiveSpineSection((prev) => (prev === section.id ? "" : section.id));
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveSpineSection((prev) => (prev === section.id ? "" : section.id)); } }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "var(--accent)" : "var(--text-dim)", flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "10px",
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                        flex: 1,
                      }}
                    >
                      {section.step} {section.label}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: "9px",
                        color: "var(--text-dim)",
                      }}
                    >
                      ›
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ borderBottom: "1px solid var(--border)" }}>
                      {section.id === "source" &&
                        SOURCE_CHANNELS.map((src) => {
                          const isSelected = selectedSource === src.id;
                          return (
                            <div
                              key={src.id}
                              onClick={() => { setActiveSourcePanel(src.id); setSelectedSource(src.id); }}
                              style={{
                                padding: "6px 14px 6px 22px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                                borderBottom: "1px solid var(--border)",
                                borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                                background: isSelected ? "rgba(232,101,10,0.10)" : "transparent",
                                transition: "background 0.12s",
                              }}
                            >
                              <span style={{ fontFamily: MONO, fontSize: "10px", color: isSelected ? "var(--accent)" : "var(--text-muted)", flex: 1 }}>
                                {language === "tr" ? src.tr : src.en}
                              </span>
                              <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)" }}>
                                {language === "tr" ? src.badgeTr : src.badgeEn}
                              </span>
                            </div>
                          );
                        })
                      }
                      {section.id === "family" &&
                        MOCK_SYSTEMS.map((sys) => {
                          const isSel = selectedSystem === sys.id;
                          return (
                            <div
                              key={sys.id}
                              onClick={() => { setSelectedSystem(sys.id); setExpandedUniverse(sys.id); }}
                              style={{
                                padding: "6px 14px 6px 22px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                                borderBottom: "1px solid var(--border)",
                                borderLeft: isSel ? "2px solid var(--accent)" : "2px solid transparent",
                                background: isSel ? "rgba(232,101,10,0.10)" : "transparent",
                                transition: "background 0.12s",
                              }}
                            >
                              <span style={{ fontFamily: MONO, fontSize: "10px", color: isSel ? "var(--accent)" : "var(--text-muted)", flex: 1 }}>
                                {language === "tr" ? `${SYSTEM_LABELS[sys.id].tr}` : `${SYSTEM_LABELS[sys.id].en}`}
                              </span>
                              <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)" }}>
                                {DEMO_DEVICES_BY_SYSTEM[sys.id].length} {language === "tr" ? "varlık" : "assets"}
                              </span>
                            </div>
                          );
                        })
                      }
                      {section.id === "scenario" &&
                        getScenarioClassesBySystem(selectedSystem).map((name) => {
                          const isSel = selectedScenario === name;
                          return (
                            <div
                              key={name}
                              onClick={() => handleScenarioChange(name)}
                              style={{
                                padding: "6px 14px 6px 22px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                                borderBottom: "1px solid var(--border)",
                                borderLeft: isSel ? "2px solid var(--accent)" : "2px solid transparent",
                                background: isSel ? "rgba(232,101,10,0.10)" : "transparent",
                                transition: "background 0.12s",
                              }}
                            >
                              <span style={{ fontFamily: MONO, fontSize: "10px", color: isSel ? "var(--accent)" : "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {professionalScenarioLabel(name)}
                              </span>
                              <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", flexShrink: 0 }}>›</span>
                            </div>
                          );
                        })
                      }
                      {section.id === "event" && (
                        <div style={{ maxHeight: 320, overflowY: "auto" }}>
                          {displayEvents.length === 0 ? (
                            <div style={{ padding: "6px 14px 6px 22px", fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)" }}>
                              {selectedScenario ? msg.verifierEmptyEventCatalog : msg.verifierPickScenarioFirst}
                            </div>
                          ) : (
                            displayEvents.map((ev) => {
                              const isEvSel = selectedEventId === ev.eventId;
                              const protocolLabel = displayProtocolState(ev.state);
                              return (
                                <div
                                  key={ev.eventId}
                                  onClick={() => handleSelectEvent(ev.eventId)}
                                  style={{
                                    padding: "6px 14px 6px 22px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid var(--border)",
                                    borderLeft: isEvSel ? "2px solid var(--accent)" : "2px solid transparent",
                                    background: isEvSel ? "rgba(232,101,10,0.10)" : "transparent",
                                    transition: "background 0.12s",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontFamily: MONO, fontSize: "10px", color: isEvSel ? "var(--accent)" : "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {ev.eventId}
                                    </span>
                                    <span style={{ ...protocolStatePillStyle(protocolLabel), fontSize: "8px", padding: "1px 4px", flexShrink: 0 }}>
                                      {protocolLabel}
                                    </span>
                                  </div>
                                  <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {ev.title}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>{/* end scroll region */}

            <div
              style={{
                fontFamily: MONO,
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                padding: "12px 14px 8px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {language === "tr" ? "İnceleme İşlemleri" : "Review Operations"}
            </div>

            <div
              style={{
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "auto",
                borderTop: "1px solid var(--border)",
              }}
              aria-label={language === "tr" ? "Eylem alanı" : "Action area"}
            >
                <button
                  type="button"
                  onClick={runVerification}
                  disabled={!isPackageSelected || loading}
                  style={{
                    fontFamily: MONO,
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    padding: "8px 12px",
                    border: "none",
                    background: loading ? "var(--panel-card)" : "var(--accent)",
                    color: loading ? "var(--text-muted)" : "#0e0f11",
                    cursor: loading ? "wait" : !isPackageSelected ? "not-allowed" : "pointer",
                    opacity: !isPackageSelected ? 0.55 : 1,
                    fontWeight: 600,
                    width: "100%",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {loading
                    ? language === "tr"
                      ? "DOĞRULANIYOR…"
                      : "VERIFYING…"
                    : !isPackageSelected
                    ? language === "tr"
                      ? "PAKET SEÇ"
                      : "SELECT PACKAGE"
                    : language === "tr"
                    ? "İNCELEMEYİ BAŞLAT"
                    : "START REVIEW"}
                </button>
                  <button
                    type="button"
                    onClick={canExport ? runExportJson : undefined}
                    disabled={!canExport || !isVerificationReady || !!exportLoading}
                    title={exportDisabledReason ?? undefined}
                    style={{
                      fontFamily: MONO,
                      fontSize: "10px",
                      padding: "6px 12px",
                      border: "1px solid var(--border-strong)",
                      background: "transparent",
                      color: !canExport || !isVerificationReady ? "var(--text-dim)" : "var(--text-secondary)",
                      cursor: !canExport || !isVerificationReady || exportLoading ? "not-allowed" : "pointer",
                      opacity: !canExport || !isVerificationReady || exportLoading ? 0.55 : 1,
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {exportLoading === "json"
                      ? "JSON…"
                      : !canExport
                      ? exportAvailability === "access_required"
                        ? language === "tr" ? "Rapor — erişim gerekli" : "Report — access required"
                        : exportAvailability === "preview_only"
                        ? language === "tr" ? "Rapor — yalnızca önizleme" : "Report — preview only"
                        : language === "tr" ? "Rapor — API bağlantısı yok" : "Report — no API"
                      : language === "tr"
                      ? "Delile Dayalı Rapor"
                      : "Evidence-Based Report"}
                  </button>
                  <button
                    type="button"
                    onClick={canExport ? runExportPdf : undefined}
                    disabled={!canExport || !isVerificationReady || !!exportLoading}
                    title={exportDisabledReason ?? undefined}
                    style={{
                      fontFamily: MONO,
                      fontSize: "10px",
                      padding: "6px 12px",
                      border: "1px solid var(--border-strong)",
                      background: "transparent",
                      color: !canExport || !isVerificationReady ? "var(--text-dim)" : "var(--text-secondary)",
                      cursor: !canExport || !isVerificationReady || exportLoading ? "not-allowed" : "pointer",
                      opacity: !canExport || !isVerificationReady || exportLoading ? 0.55 : 1,
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {exportLoading === "pdf"
                      ? "PDF…"
                      : !canExport
                      ? exportAvailability === "access_required"
                        ? language === "tr" ? "Belge — erişim gerekli" : "Document — access required"
                        : exportAvailability === "preview_only"
                        ? language === "tr" ? "Belge — yalnızca önizleme" : "Document — preview only"
                        : language === "tr" ? "Belge — API bağlantısı yok" : "Document — no API"
                      : language === "tr"
                      ? "Delile Dayalı Belge"
                      : "Evidence-Based Document"}
                  </button>
                <button
                  type="button"
                  onClick={resetVerificationRun}
                  disabled={resetRunDisabled}
                  style={{
                    fontFamily: MONO,
                    fontSize: "9px",
                    padding: "6px 12px",
                    border: "1px solid var(--border-strong)",
                    background: "transparent",
                    color: "var(--text-dim)",
                    cursor: resetRunDisabled ? "not-allowed" : "pointer",
                    opacity: resetRunDisabled ? 0.45 : 1,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  + {language === "tr" ? "Yeni İnceleme" : "New Review"}
                </button>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  marginTop: "4px",
                  lineHeight: 1.6,
                  paddingTop: "4px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                {msg.verifierActionBarDoctrineTrace}
              </div>
              {exportError ? (
                <p style={{ margin: "4px 0 0", fontFamily: MONO, fontSize: "9px", color: "var(--error)", lineHeight: 1.35 }}>
                  {exportError}
                </p>
              ) : null}
            </div>
          </aside>
        </div>{/* /verifier-chassis-grid */}

          <main
            style={{
              position: "relative",
              zIndex: 1,
              minWidth: 0,
              gridArea: "main",
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "var(--bg)" }}>

              <div
                style={{
                  background: "#1c1e24",
                  borderBottom: "1px solid var(--border-strong)",
                  padding: PX.incidentPad,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "1px",
                }}
              >
                {[
                  { label: language === "tr" ? "BAĞLAM" : "CONTEXT", value: packageSummaryMain ?? selectedPackage?.summary ?? (language === "tr" ? "Demo arşivi yerel paket seçimi" : "Demo archive local package selection") },
                  { label: language === "tr" ? "OPERASYON" : "OPERATION", value: selectedPackage?.title ?? (language === "tr" ? "İnceleme paketi hazırlanıyor" : "Inspection package preparing") },
                  { label: language === "tr" ? "ZAMAN / FAZ" : "TIMING / PHASE", value: selectedPhaseSpec ? phaseUiLabel(selectedPhaseSpec.phase, language) : phaseUiLabel(selectedPhase, language) },
                  { label: language === "tr" ? "SAHNE KİMLİĞİ" : "SCENE IDENTITY", value: packageOperationalContext ?? selectedPackage?.identity ?? (language === "tr" ? "Kayıtlı/türetilmiş ayrımı bekleniyor" : "Recorded/derived split pending") },
                ].map((cell, index) => (
                  <div key={cell.label} style={{ padding: "0 14px", borderRight: index < 3 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>{cell.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-primary)", lineHeight: 1.3 }}>{cell.value}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#161820",
                  borderBottom: "1px solid var(--border)",
                  padding: PX.rolePad,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginRight: "4px" }}>
                  {language === "tr" ? "ROL MERCEĞİ" : "ROLE LENS"}
                </span>
                {ROLE_LENSES.map((role) => {
                  const selected = selectedRoleLens === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleLens(role.id)}
                      style={{
                        fontFamily: MONO,
                        fontSize: "9px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 10px",
                        border: selected ? "1px solid var(--accent-border)" : "1px solid var(--border-strong)",
                        background: selected ? "var(--accent-soft)" : "transparent",
                        color: selected ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {language === "tr" ? role.tr : role.en}
                    </button>
                  );
                })}
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  {language === "tr" ? selectedRoleLensMeta.insightTr : selectedRoleLensMeta.insightEn}
                </span>
              </div>

              <nav
                aria-label={language === "tr" ? "İnceleme sekmeleri" : "Inspection tabs"}
                style={{ background: "#1c1e24", borderBottom: "1px solid var(--border-strong)", display: "flex", gap: 0, padding: `0 ${PX.tabPadX}px`, flexWrap: "wrap" }}
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
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        padding: "10px 14px",
                        color: on ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer",
                        borderBottom: on ? "2px solid var(--accent)" : "2px solid transparent",
                        textTransform: "uppercase",
                        background: "transparent",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div style={{ flex: "1 1 0", minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", overflow: "hidden" }}>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, borderRight: "1px solid var(--border)", overflow: "hidden" }}>
                  <div style={{ background: "#1c1e24", borderBottom: "1px solid var(--border-strong)", display: "flex", alignItems: "center", padding: `0 ${PX.phasePadX}px`, gap: 0, flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginRight: "12px" }}>
                      {language === "tr" ? "FAZ" : "PHASE"}
                    </span>
                    {(selectedCase?.incidentSpine?.phases ?? [
                      { phase: "t0" as const },
                      { phase: "t1" as const },
                      { phase: "t2" as const },
                      { phase: "t3" as const },
                    ]).map((phase, index) => {
                      const active = selectedPhase === phase.phase;
                      return (
                        <div key={phase.phase} style={{ display: "flex", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPhase(phase.phase)}
                            style={{
                              fontFamily: MONO,
                              fontSize: "10px",
                              padding: "9px 16px",
                              cursor: "pointer",
                              color: active ? "var(--accent)" : "var(--text-secondary)",
                              border: "none",
                              background: active ? "var(--orange-glow)" : "transparent",
                              borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            {phaseUiLabel(phase.phase, language)}
                          </button>
                          {index < 3 ? <div style={{ width: 1, height: 16, background: "var(--border-strong)" }} /> : null}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ flex: "1 1 0", minHeight: 0, position: "relative", overflow: "hidden", background: "#0a0b0e" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", background: "linear-gradient(to bottom, rgba(10,11,14,0.9), rgba(10,11,14,0))" }}>
                      <span style={{ fontFamily: MONO, fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        {language === "tr" ? "Mühürlü Yeniden Oluşturma Görünümü" : "Sealed Reconstruction Viewport"}
                      </span>
                      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: "9px", color: "var(--text-secondary)", letterSpacing: "0.12em" }}>
                        {selectedPhaseSpec ? phaseUiLabel(selectedPhaseSpec.phase, language) : phaseUiLabel(selectedPhase, language)}
                      </span>
                    </div>

                    <ReconstructionViewport
                      language={language}
                      system={selectedSystem}
                      incidentClass={selectedEventCard != null ? selectedCase?.incidentClass ?? null : null}
                      eventId={selectedEventCard != null ? selectedEventCard.eventId ?? selectedId : null}
                      title={selectedEventCard?.title ?? null}
                      verificationState={visibleReviewState}
                      role={selectedRoleLens}
                      incidentPhase={selectedPhase}
                      incidentSpine={selectedCase?.incidentSpine ?? null}
                    />
                  </div>

                  {/* ── scrubber-bar (canonical geometry element) ── */}
                  <div style={{ background: "var(--surface2, #1c1e24)", borderTop: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>00:00:00</span>
                    <div style={{ flex: 1, position: "relative", height: "24px", display: "flex", alignItems: "center" }}>
                      <div style={{ width: "100%", height: "2px", background: "var(--surface3, #2b2b2b)", position: "relative", borderRadius: "1px" }}>
                        <div style={{ height: "100%", width: "55%", background: "var(--accent)", borderRadius: "1px" }} />
                        {[0, 25, 50, 75].map((pct, i) => {
                          const isCurrent = i === 2;
                          return (
                            <div key={pct} style={{ position: "absolute", top: "-8px", left: `${pct}%`, width: "1px", height: "18px", background: isCurrent ? "var(--accent)" : "var(--border2, #3a3a3a)" }}>
                              <span style={{ position: "absolute", top: "-18px", fontFamily: MONO, fontSize: "8px", color: isCurrent ? "var(--accent)" : "var(--text-muted)", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                                {["T\u2080", "T\u2081", "T\u2082", "T\u2083"][i]}
                              </span>
                            </div>
                          );
                        })}
                        <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%, -50%)", width: "10px", height: "10px", background: "var(--accent)", borderRadius: "50%" }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>00:04:32</span>
                  </div>

                  <div style={{ height: "140px", flexShrink: 0, borderTop: "1px solid var(--border-strong)", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", background: "#161820" }}>
                    {[
                      { title: language === "tr" ? "KAYITLI" : "RECORDED", items: evidenceRecordedBandItems },
                      { title: language === "tr" ? "TÜRETİLMİŞ" : "DERIVED", items: evidenceDerivedBandItems },
                      { title: language === "tr" ? "AÇIK / ÇEKİŞMELİ" : "UNKNOWN / DISPUTED", items: evidenceUnknownBandItems },
                    ].map((panel, index) => (
                      <div key={panel.title} style={{ padding: PX.evidencePad, borderRight: index < 2 ? "1px solid var(--border)" : "none", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                          <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.15em", color: "var(--text-dim)", textTransform: "uppercase" }}>{panel.title}</span>
                          <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)" }}>{panel.items.length}</span>
                        </div>
                        {panel.items.length > 0 ? panel.items.map((item, itemIndex) => (
                          <div key={`${panel.title}-${itemIndex}`} style={{ display: "flex", alignItems: "flex-start", gap: "6px", padding: "3px 0", borderBottom: itemIndex < panel.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <span style={{ width: 3, height: 14, marginTop: 1, background: "var(--accent)", opacity: 0.75, flexShrink: 0 }} />
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: 1.4, flex: 1 }}>{item}</span>
                            <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", flexShrink: 0 }}>{itemIndex + 1}</span>
                          </div>
                        )) : (
                          <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.4 }}>
                            {language === "tr" ? "Katman verisi görünür olduğunda burada sabitlenir." : "Layer data will pin here when visible."}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <aside style={{ display: "flex", flexDirection: "column", overflowY: "auto", background: "#161820", borderLeft: "1px solid var(--border)", boxShadow: "none" }}>
                  <div style={{ padding: PX.rightBlockPad, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                      <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.15em", color: "var(--text-dim)", textTransform: "uppercase" }}>
                        {language === "tr" ? "DOĞRULAMA İZİ" : "TRACE"}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em" }}>{traceStepRows.length}</span>
                    </div>
                    {traceStepRows.slice(0, 7).map((row, index) => (
                      <div key={`${row.label}-${index}`} style={{ display: "flex", gap: "8px", padding: "5px 0", borderBottom: index < Math.min(traceStepRows.length, 7) - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--accent)", width: 22, flexShrink: 0, paddingTop: 1 }}>{index + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "10px", color: "var(--text-primary)", marginBottom: 2 }}>{row.label}</div>
                          <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.35 }}>{row.note ?? row.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: PX.rightBlockPad, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.15em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "8px" }}>
                      {language === "tr" ? "HAZIRLIK / DURUM" : "READINESS / STATUS"}
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 2 }}>{language === "tr" ? "FAZ DURUŞU" : "PHASE POSTURE"}</div>
                        <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 600 }}>{selectedPhaseSpec ? phasePostureLabel(selectedPhaseSpec.verification.posture, language) : (language === "tr" ? "Bekliyor" : "Pending")}</div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.35, marginTop: 2 }}>{selectedPhaseSpec ? (language === "tr" ? selectedPhaseSpec.verification.noteTr ?? selectedPhaseSpec.verification.note : selectedPhaseSpec.verification.note) : (language === "tr" ? "Demo faz yapısı görünür kılındı." : "Demo phase structure is now visible.")}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 2 }}>{language === "tr" ? "BELGE HAZIRLIĞI" : "ARTIFACT READINESS"}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-primary)", fontWeight: 600 }}>{selectedPhaseSpec ? phasePostureLabel(selectedPhaseSpec.verification.artifactReadiness, language) : (language === "tr" ? "Bekliyor" : "Pending")}</div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.35, marginTop: 2 }}>{selectedProfileLabel}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 2 }}>{language === "tr" ? "KİMLİK BAĞI" : "IDENTITY LINK"}</div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-primary)", lineHeight: 1.5 }}>{bundleAnchorId}</div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", marginTop: 2 }}>{manifestAnchorId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={canExport ? runExportPdf : undefined}
                        disabled={!canExport || !isVerificationReady || !!exportLoading}
                        title={exportDisabledReason ?? undefined}
                        style={{
                          fontFamily: MONO,
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          padding: "8px 12px",
                          border: canExport ? "1px solid var(--accent-border)" : "1px solid var(--border-strong)",
                          background: canExport ? "var(--accent-soft)" : "transparent",
                          color: canExport ? "var(--accent)" : "var(--text-dim)",
                          cursor: !canExport || !isVerificationReady || exportLoading ? "not-allowed" : "pointer",
                          opacity: !canExport || !isVerificationReady || exportLoading ? 0.55 : 1,
                          width: "100%",
                          textAlign: "center",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          display: activeReviewTab === "scene" ? "none" : "block",
                        }}
                      >
                        {exportLoading === "pdf" ? "PDF..." : !canExport
                          ? language === "tr" ? "Belge — bağlantı yok" : "Artifact — no connection"
                          : language === "tr" ? "Belgeyi Çıkar" : "Issue Artifact"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: activeReviewTab === "scene" ? "none" : "block", padding: PX.rightBlockPad, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.14em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.45rem" }}>
                      {language === "tr" ? "İŞLEMLER" : "ACTIONS"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <button
                        type="button"
                        onClick={runVerification}
                        disabled={!isPackageSelected || loading}
                        style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.08em", padding: "0.52rem 0.65rem", border: loading ? "1px solid var(--border-strong)" : "1px solid var(--accent)", background: loading ? "var(--panel-card)" : "linear-gradient(180deg, rgba(255,102,0,0.22), rgba(255,102,0,0.11))", color: "var(--text)", cursor: loading ? "wait" : !isPackageSelected ? "not-allowed" : "pointer", opacity: !isPackageSelected ? 0.55 : 1, fontWeight: 700, width: "100%", textAlign: "center", textTransform: "uppercase" }}
                      >
                        {loading ? (language === "tr" ? "DOĞRULANIYOR" : "VERIFYING") : (language === "tr" ? "İNCELEMEYİ BAŞLAT" : "START REVIEW")}
                      </button>
                      <button
                        type="button"
                        onClick={canExport ? runExportPdf : undefined}
                        disabled={!canExport || !isVerificationReady || !!exportLoading}
                        title={exportDisabledReason ?? undefined}
                        style={{ fontFamily: MONO, fontSize: "0.64rem", letterSpacing: "0.06em", padding: "0.48rem 0.65rem", border: "1px solid var(--border)", background: "var(--panel-card)", color: canExport ? "var(--text)" : "var(--text-dim)", cursor: !canExport || !isVerificationReady || exportLoading ? "not-allowed" : "pointer", opacity: !canExport || !isVerificationReady || exportLoading ? 0.55 : 1, width: "100%", textAlign: "center", textTransform: "uppercase" }}
                      >
                        {exportLoading === "pdf" ? "PDF…" : !canExport
                          ? exportAvailability === "access_required"
                            ? language === "tr" ? "BELGE — ERİŞİM GEREKLİ" : "DOCUMENT — ACCESS REQUIRED"
                            : exportAvailability === "preview_only"
                            ? language === "tr" ? "BELGE — ÖNİZLEME" : "DOCUMENT — PREVIEW"
                            : language === "tr" ? "BELGE — API YOK" : "DOCUMENT — NO API"
                          : language === "tr" ? "BELGE ÜRET" : "ISSUE DOCUMENT"}
                      </button>
                      <button
                        type="button"
                        onClick={resetVerificationRun}
                        disabled={resetRunDisabled}
                        style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.06em", padding: "0.44rem 0.65rem", border: "1px solid var(--border-strong)", background: "var(--panel)", color: "var(--text-muted)", cursor: resetRunDisabled ? "not-allowed" : "pointer", opacity: resetRunDisabled ? 0.45 : 1, width: "100%", textAlign: "center", textTransform: "uppercase" }}
                      >
                        {language === "tr" ? "YENİ İNCELEME" : "NEW REVIEW"}
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: PX.rightBlockPad, display: activeReviewTab === "scene" ? "none" : "block" }}>
                    <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.15em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "8px" }}>
                      {language === "tr" ? "DOKTRİN NOTU" : "DOCTRINE"}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.8 }}>
                      <div>{language === "tr" ? "KAYITLI ≠ TÜRETİLMİŞ" : "RECORDED ≠ DERIVED"}</div>
                      <div>{language === "tr" ? "TÜRETİLMİŞ ≠ KARAR" : "DERIVED ≠ DECISION"}</div>
                      <div>{language === "tr" ? "İZ ≠ NİHAİ GERÇEK" : "TRACE ≠ FINAL TRUTH"}</div>
                    </div>
                    {verificationError ? <div style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "var(--error)", lineHeight: 1.35 }}>{verificationError}</div> : null}
                    {exportError ? <div style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "var(--error)", lineHeight: 1.35 }}>{exportError}</div> : null}
                  </div>
                </aside>
              </div>

              <div style={{ display: activeReviewTab === "scene" ? "none" : "block", padding: "0.42rem 0.82rem 0.9rem", background: "var(--panel)" }}>

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
                borderRadius: INNER_TILE_RADIUS,
              }}
            >
            {activeReviewTab === "scene" && (
            <>
            {!selectedEventCard ? (
              <section
                style={{
                  marginBottom: UI.sectionGap,
                  borderRadius: INNER_TILE_RADIUS,
                  border: `1px solid var(--border-strong)`,
                  background: "var(--panel)",
                  padding: "0.68rem 0.76rem",
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
                                padding: INNER_TILE_PAD,
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
                              padding: INNER_TILE_PAD,
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
                        <div style={{ padding: INNER_TILE_PAD, borderBottom: "1px solid var(--border)", background: "var(--panel-card)" }}>
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
                          <div style={{ padding: INNER_TILE_PAD, borderBottom: "1px solid var(--border)", background: "var(--panel)" }}>
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
                          <div style={{ padding: INNER_TILE_PAD, borderRight: "1px solid var(--border)", background: "var(--panel-card)" }}>
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
                            <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.5, color: "var(--text-muted)" }}>
                              {(language === "tr" ? selectedRoleLensMeta.insightTr : selectedRoleLensMeta.insightEn) +
                                (language === "tr"
                                  ? " Kayıtlı ve uzman okuması katmanları birleştirilmez."
                                  : " Recorded and expert-reading layers are not merged.")}
                            </p>
                          </div>
                          <div style={{ padding: INNER_TILE_PAD, background: "var(--panel)" }}>
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
                      borderRadius: INNER_TILE_RADIUS,
                      overflow: "hidden",
                      borderLeft: "2px solid var(--success)",
                      background: "var(--panel)",
                    }}
                  >
                    <div
                      style={{
                        padding: INNER_TILE_PAD_COMPACT,
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
                            borderRadius: INNER_TILE_RADIUS,
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
                    <div style={{ padding: INNER_TILE_PAD }}>
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
                              <div key={i} style={{ borderRadius: INNER_TILE_RADIUS, border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div style={{ padding: "0.3rem 0.46rem", background: "var(--panel-raised)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
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
                                <div style={{ padding: "0.3rem 0.46rem", background: "var(--bg)" }}>
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
                      borderRadius: INNER_TILE_RADIUS,
                      overflow: "hidden",
                      borderLeft: "2px solid var(--warning)",
                      background: "var(--panel)",
                    }}
                  >
                    <div
                      style={{
                        padding: INNER_TILE_PAD_COMPACT,
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
                            borderRadius: INNER_TILE_RADIUS,
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
                    <div style={{ padding: INNER_TILE_PAD }}>
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
                              <div key={i} style={{ borderRadius: INNER_TILE_RADIUS, border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div style={{ padding: "0.3rem 0.46rem", background: "var(--panel-raised)", borderBottom: "1px solid var(--border)" }}>
                                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-soft)" }}>{d.type}</span>
                                </div>
                                <div style={{ padding: "0.3rem 0.46rem", background: "var(--bg)" }}>
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
                  borderRadius: INNER_TILE_RADIUS,
                  overflow: "hidden",
                  background: "var(--panel)",
                }}
              >
                <div
                  style={{
                    padding: INNER_TILE_PAD_COMPACT,
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
                <div style={{ padding: INNER_TILE_PAD, background: "var(--panel)", fontSize: "0.9rem" }}>
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
                            <div key={i} style={{ borderRadius: INNER_TILE_RADIUS, border: "1px solid var(--border-strong)", overflow: "hidden" }}>
                              <div
                                style={{
                                  padding: "0.3rem 0.46rem",
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
                                    borderRadius: INNER_TILE_RADIUS,
                                    padding: "0.06rem 0.28rem",
                                  }}
                                >
                                  OPEN
                                </span>
                              </div>
                              <div style={{ padding: "0.36rem 0.46rem", background: "var(--bg)" }}>
                                <div style={{ fontSize: "0.86rem", lineHeight: 1.5, color: "var(--text-soft)" }}>{item}</div>
                              </div>
                              <div style={{ padding: "0.22rem 0.46rem", background: "var(--panel)", borderTop: "1px solid var(--border)" }}>
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
                  borderRadius: INNER_TILE_RADIUS,
                  overflow: "hidden",
                  background: "var(--panel)",
                }}
              >
                <div
                  style={{
                    padding: INNER_TILE_PAD_COMPACT,
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
                      borderRadius: INNER_TILE_RADIUS,
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
                        {selectedCase.artifactProfiles.some((ap) => ap.profileCode === selectedRoleLensMeta.exportProfile && ap.enabled && ap.apiBacked) && (
                          <button
                            type="button"
                            disabled={!!exportLoading}
                            style={{
                              fontSize: "0.92rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: 999,
                              border: exportProfile === selectedRoleLensMeta.exportProfile ? `1px solid ${"var(--accent-border)"}` : "1px solid var(--border)",
                              background: exportProfile === selectedRoleLensMeta.exportProfile ? "var(--accent-soft)" : "var(--panel)",
                              color: "var(--text)",
                              cursor: exportLoading ? "not-allowed" : "pointer",
                              opacity: exportLoading ? 0.6 : 1,
                              fontWeight: exportProfile === selectedRoleLensMeta.exportProfile ? 700 : 500,
                            }}
                          >
                            {language === "tr" ? selectedRoleLensMeta.primaryOutputTr : selectedRoleLensMeta.primaryOutputEn}
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "0.5rem 0 0.35rem", lineHeight: 1.5 }}>
                        {language === "tr"
                          ? "Kontrollü belge düzenleme: çıktı, manifest ve inceleme izi ile sınırlıdır; suçlama veya nihai hüküm değildir."
                          : "Controlled issuance: artifact remains bound to manifest and trace; not a blame or final verdict."}
                      </p>
                      {!hasConnectedApiIssuanceProfile ? (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                        {exportAvailability === "backend_unavailable" ? (
                          <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>
                            {language === "tr"
                              ? "Belge üretimi için API bağlantısı gereklidir. Şu anda backend erişimi yok."
                              : "API connection required for artifact issuance. Backend currently unreachable."}
                          </p>
                        ) : (
                        <>
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
                            : language === "tr" ? "Önizleme — JSON" : "Preview — JSON"}
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
                            : language === "tr" ? "Önizleme — PDF" : "Preview — PDF"}
                        </button>
                        </>
                        )}
                      </div>
                      ) : (
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "0.45rem", marginBottom: 0 }}>
                          {language === "tr"
                            ? "Belge üretimi JSON/PDF hattı sol şeritteki inceleme işlemlerinden yürütülür."
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
                                      documentType={issuanceFamilyLabel(meta.export_profile, selectedRoleLens) || documentFamilyLabel(primary, language)}
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
                                      {renderIssuanceDocumentBody(meta, selectedRoleLens)}
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
                      disabled={!!exportLoading}
                      style={{
                        fontSize: "0.92rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border: exportProfile === selectedRoleLensMeta.exportProfile ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: exportProfile === selectedRoleLensMeta.exportProfile ? "var(--accent-soft)" : "var(--panel)",
                        color: "var(--text)",
                        cursor: exportLoading ? "not-allowed" : "pointer",
                        opacity: exportLoading ? 0.6 : 1,
                        fontWeight: exportProfile === selectedRoleLensMeta.exportProfile ? 600 : 400,
                      }}
                    >
                      {language === "tr" ? selectedRoleLensMeta.primaryOutputTr : selectedRoleLensMeta.primaryOutputEn}
                    </button>
                  </div>
                  {!hasConnectedApiIssuanceProfile ? (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {exportAvailability === "backend_unavailable" ? (
                      <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>
                        {language === "tr"
                          ? "Belge üretimi için API bağlantısı gereklidir."
                          : "API connection required for artifact issuance."}
                      </p>
                    ) : (
                    <>
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
                      {exportLoading === "json" ? (language === "tr" ? "Hazırlanıyor…" : "Preparing…") : language === "tr" ? "Önizleme — JSON" : "Preview — JSON"}
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
                      {exportLoading === "pdf" ? (language === "tr" ? "Hazırlanıyor…" : "Preparing…") : language === "tr" ? "Önizleme — PDF" : "Preview — PDF"}
                    </button>
                    </>
                    )}
                  </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "0.45rem", marginBottom: 0 }}>
                      {language === "tr"
                        ? "Belge üretimi JSON/PDF hattı sol şeritteki inceleme işlemlerinden yürütülür."
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
                          documentType={issuanceFamilyLabel(meta.export_profile, selectedRoleLens) || documentFamilyLabel(primary, language)}
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
                          {renderIssuanceDocumentBody(meta, selectedRoleLens)}
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
                          documentType={issuanceFamilyLabel(meta.export_profile, selectedRoleLens) || documentFamilyLabel(primary, language)}
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
                          {renderIssuanceDocumentBody(meta, selectedRoleLens)}
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
            </div>
          </main>
      <div style={{ display: "none" }}><BrandSignatureBand mode="surface" label="Qaraqutu sahiplilik imzasi" /></div>
      <footer
        style={{
          gridArea: "foot",
          padding: "0 16px",
          background: "#0c0d10",
          overflow: "hidden",
        }}
      >
        <FooterBottomRow
          extraRight={(
            <img
              src="/brand/logo_qaraqutu.svg"
              alt="QARAQUTU verifier bottom bar logo"
              aria-label="QARAQUTU verifier bottom bar logo"
              style={{ height: 14, width: "auto", opacity: 0.5, display: "block", flexShrink: 0 }}
            />
          )}
        />
      </footer>
    </div>
  );
}


