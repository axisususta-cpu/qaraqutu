/**
 * Canonical Spine v1: single case registry for Vehicle / Drone / Robot.
 * Witness → verification → issuance backbone. Golden-grade demo cases.
 */
import type {
  CanonicalCase,
  CanonicalSystemId,
  RecordedEvidenceItem,
  DerivedEvidenceItem,
  VerificationTraceStep,
} from "contracts";

const TRACE_STEP = (
  step: number,
  check: string,
  result: string,
  note: string
): VerificationTraceStep => ({ step, check, result, note });

/** Golden-grade demo cases: 2 Vehicle, 2 Drone, 2 Robot. */
export const CANONICAL_CASES: CanonicalCase[] = [
  // —— Vehicle 1: Near Miss ——
  {
    caseId: "golden-vehicle-nearmiss",
    system: "vehicle",
    incidentClass: "near_miss",
    scenarioFrame: "Near Miss / AEB Activation",
    eventId: "QEV-20260311-DEMO-NEARMISS-01",
    bundleId: "QBN-20260311-DEMO-NEARMISS-01",
    manifestId: "QMF-20260311-DEMO-NEARMISS-01",
    occurredAt: "2026-03-11T08:30:00.000Z",
    summary:
      "Near-miss in urban corridor where vehicle performed abrupt braking to avoid side-entry vehicle.",
    verificationState: "PASS",
    recordedEvidence: [
      {
        recordId: "REC-NEARMISS-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-NEARMISS-JSON",
        capturedAt: "2026-03-11T08:30:00.000Z",
        contentType: "application/json",
        hash: "hash-json-nearmiss",
        sizeOrLength: 1024,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.98,
        displayLabel: "Source event JSON payload",
        machineLabel: "source_event_json",
      },
      {
        recordId: "REC-NEARMISS-TRACE",
        sourceType: "telemetry_trace",
        sourceId: "SRC-NEARMISS-TRACE",
        capturedAt: "2026-03-11T08:30:01.000Z",
        contentType: "application/octet-stream",
        hash: "hash-trace-nearmiss",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Vehicle telemetry snapshot",
        machineLabel: "telemetry_snapshot",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-NEARMISS-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
        generatedAt: "2026-03-11T08:31:00.000Z",
        method: "timeline_v1",
        confidence: 0.92,
        recordedFlag: false,
        derivationNote: "Timeline synthesized from source payload and telemetry.",
        displayLabel: "Incident timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed timeline of braking and near-miss sequence based on source payload and telemetry trace.",
        sourceDependencies: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [],
    verificationTrace: [
      TRACE_STEP(1, "Canonical event linkage", "PASS", "Event linked to bundle and manifest."),
      TRACE_STEP(2, "Recorded vs derived separation", "PASS", "Distinct sections."),
      TRACE_STEP(3, "Verification state", "PASS", "Canonical assessment."),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    whyInevitable:
      "Without event-bound verifiable record, derived assessment, and verification trace, liability and compliance disputes remain unresolved. QARAQUTU provides evidence integrity and traceability for this case.",
    titleTr: "Destekli Sürüş Yakın Kaçış İncelemesi",
    titleEn: "Assisted Driving Near-Miss Review",
    demoNoticeTr:
      "Bu vaka, kamuya açık olay sınıflarından türetilmiş anonimize bir demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review derived from publicly known incident classes. It is not a final legal or factual determination.",
  },
  // —— Vehicle 2: Intersection Collision ——
  {
    caseId: "golden-vehicle-collision",
    system: "vehicle",
    incidentClass: "collision",
    scenarioFrame: "Urban Intersection Collision",
    eventId: "QEV-20260311-DEMO-COLLISION-01",
    bundleId: "QBN-20260311-DEMO-COLLISION-01",
    manifestId: "QMF-20260311-DEMO-COLLISION-01",
    occurredAt: "2026-03-11T09:45:00.000Z",
    summary:
      "Collision at intersection where lane entry and signal interpretation are disputed between parties.",
    verificationState: "UNKNOWN",
    recordedEvidence: [
      {
        recordId: "REC-COLLISION-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-COLLISION-JSON",
        capturedAt: "2026-03-11T09:45:00.000Z",
        contentType: "application/json",
        hash: "hash-json-collision",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.96,
        displayLabel: "Source event JSON payload",
        machineLabel: "source_event_json",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-COLLISION-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-COLLISION-JSON"],
        generatedAt: "2026-03-11T09:46:00.000Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Timeline from source payload.",
        displayLabel: "Incident timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary: "Reconstructed timeline of intersection collision event.",
        sourceDependencies: ["REC-COLLISION-JSON"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: ["Lane entry and signal interpretation disputed between parties."],
    verificationTrace: [
      TRACE_STEP(1, "Canonical event linkage", "PASS", "Event linked to bundle and manifest."),
      TRACE_STEP(2, "Recorded vs derived separation", "PASS", "Distinct sections."),
      TRACE_STEP(3, "Verification state", "UNKNOWN", "Canonical assessment."),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    whyInevitable:
      "Dispute-grade evidence requires a single canonical object and verification trace. QARAQUTU delivers that for this intersection case.",
    titleTr: "Kavşak Çatışması İncelemesi",
    titleEn: "Intersection Conflict Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
  },
  // —— Drone 1: Link Loss ——
  {
    caseId: "golden-drone-linkloss",
    system: "drone",
    incidentClass: "link_loss",
    scenarioFrame: "Link Loss",
    eventId: "drone-linkloss-003",
    bundleId: "bundle-drone-003",
    manifestId: "manifest-drone-003",
    occurredAt: "2025-03-14T10:05:00Z",
    summary:
      "Temporary loss of command link and telemetry downlink during BVLOS segment.",
    verificationState: "UNVERIFIED",
    recordedEvidence: [
      {
        recordId: "rec-drone-003-1",
        sourceType: "uav_telemetry",
        sourceId: "SRC-DRONE-003",
        capturedAt: "2025-03-14T10:05:00Z",
        contentType: "application/octet-stream",
        hash: "hash-drone-003",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "UAV telemetry stream",
        machineLabel: "telemetry_stream",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-003-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-003-1"],
        generatedAt: "2025-03-14T10:06:00Z",
        method: "timeline_v1",
        confidence: 0.85,
        recordedFlag: false,
        derivationNote: "Mission timeline from telemetry.",
        displayLabel: "Mission timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary: "Timeline derived from telemetry and link recovery log.",
        sourceDependencies: ["rec-drone-003-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: ["Exact duration of link loss; recovery sequence."],
    verificationTrace: [
      TRACE_STEP(1, "Manifest loaded", "OK", "—"),
      TRACE_STEP(2, "Evidence inventory validated", "OK", "—"),
      TRACE_STEP(3, "Verification state", "demo", "Demo context."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "BVLOS and link-loss accountability require a canonical record and verification trace. QARAQUTU is the spine for this drone case.",
    titleTr: "Bağlantı Kaybı / Operatör Belirsizliği İncelemesi",
    titleEn: "Link Loss / Operator Uncertainty Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai sorumluluk veya hukukî hüküm üretmez.",
    demoNoticeEn:
      "This is an anonymized demo review. It does not produce final liability or legal judgment.",
  },
  // —— Drone 2: Mission Anomaly ——
  {
    caseId: "golden-drone-mission",
    system: "drone",
    incidentClass: "mission_anomaly",
    scenarioFrame: "Mission Anomaly",
    eventId: "drone-mission-001",
    bundleId: "bundle-drone-001",
    manifestId: "manifest-drone-001",
    occurredAt: "2025-03-12T14:22:00Z",
    summary: "UAV deviated from planned altitude band during waypoint transit.",
    verificationState: "UNVERIFIED",
    recordedEvidence: [
      {
        recordId: "rec-drone-001-1",
        sourceType: "uav_telemetry",
        sourceId: "SRC-DRONE-001",
        capturedAt: "2025-03-12T14:22:00Z",
        contentType: "application/octet-stream",
        hash: "hash-drone-001",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.92,
        displayLabel: "UAV telemetry stream",
        machineLabel: "telemetry_stream",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-001-1"],
        generatedAt: "2025-03-12T14:23:00Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Mission timeline from telemetry.",
        displayLabel: "Mission timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary: "Mission timeline derived from telemetry and handoff log.",
        sourceDependencies: ["rec-drone-001-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [],
    verificationTrace: [
      TRACE_STEP(1, "Manifest loaded", "OK", "—"),
      TRACE_STEP(2, "Evidence inventory validated", "OK", "—"),
      TRACE_STEP(3, "Verification state", "demo", "Demo context."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Mission anomaly review requires recorded vs derived separation and a verification trace. QARAQUTU provides the canonical spine for this drone case.",
    titleTr: "Görev Anomalisi İncelemesi",
    titleEn: "Mission Anomaly Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
  },
  // —— Robot 1: Public Interaction ——
  {
    caseId: "golden-robot-public",
    system: "robot",
    incidentClass: "public_interaction",
    scenarioFrame: "Public Interaction",
    eventId: "robot-public-003",
    bundleId: "bundle-robot-003",
    manifestId: "manifest-robot-003",
    occurredAt: "2025-03-13T14:20:00Z",
    summary:
      "Service robot in public space; encounter with pedestrian and recorded handoff to operator.",
    verificationState: "UNVERIFIED",
    recordedEvidence: [
      {
        recordId: "rec-robot-003-1",
        sourceType: "interaction_log",
        sourceId: "SRC-ROBOT-003",
        capturedAt: "2025-03-13T14:20:00Z",
        contentType: "application/json",
        hash: "hash-robot-003",
        sizeOrLength: 1024,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "Interaction log",
        machineLabel: "interaction_log",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-003-summary",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-003-1"],
        generatedAt: "2025-03-13T14:21:00Z",
        method: "timeline_v1",
        confidence: 0.86,
        recordedFlag: false,
        derivationNote: "Encounter timeline.",
        displayLabel: "Encounter timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary: "Timeline derived from interaction log and handoff record.",
        sourceDependencies: ["rec-robot-003-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [],
    verificationTrace: [
      TRACE_STEP(1, "Manifest loaded", "OK", "—"),
      TRACE_STEP(2, "Evidence inventory validated", "OK", "—"),
      TRACE_STEP(3, "Verification state", "demo", "Demo context."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Public-space robot incidents require a canonical record and verification trace. QARAQUTU is the spine for this robot case.",
    titleTr: "Kamusal Alan Etkileşim İncelemesi",
    titleEn: "Public-Space Interaction Review",
    demoNoticeTr:
      "Bu vaka, kamusal alanda robot-insan etkileşimlerinden türetilmiş anonimize demo incelemesidir.",
    demoNoticeEn:
      "This case is an anonymized demo review derived from robot-human interactions in public space.",
  },
  // —— Robot 2: Safety Stop ——
  {
    caseId: "golden-robot-safety",
    system: "robot",
    incidentClass: "safety_stop",
    scenarioFrame: "Safety Stop Event",
    eventId: "robot-safety-001",
    bundleId: "bundle-robot-001",
    manifestId: "manifest-robot-001",
    occurredAt: "2025-03-13T11:08:00Z",
    summary: "Emergency stop triggered by proximity sensor during cycle.",
    verificationState: "UNVERIFIED",
    recordedEvidence: [
      {
        recordId: "rec-robot-001-1",
        sourceType: "safety_log",
        sourceId: "SRC-ROBOT-001",
        capturedAt: "2025-03-13T11:08:00Z",
        contentType: "application/json",
        hash: "hash-robot-001",
        sizeOrLength: 512,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Safety log",
        machineLabel: "safety_log",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-001-1"],
        generatedAt: "2025-03-13T11:09:00Z",
        method: "timeline_v1",
        confidence: 0.9,
        recordedFlag: false,
        derivationNote: "Cycle trace.",
        displayLabel: "Cycle trace synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary: "Safety stop and cycle trace derived from safety log.",
        sourceDependencies: ["rec-robot-001-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [],
    verificationTrace: [
      TRACE_STEP(1, "Manifest loaded", "OK", "—"),
      TRACE_STEP(2, "Evidence inventory validated", "OK", "—"),
      TRACE_STEP(3, "Verification state", "demo", "Demo context."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Safety-stop accountability requires recorded evidence and verification trace. QARAQUTU provides the canonical spine for this robot case.",
    titleTr: "Güvenlik Durdurma Olayı İncelemesi",
    titleEn: "Safety Stop Event Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
  },
];

export function getCanonicalCases(system?: CanonicalSystemId): CanonicalCase[] {
  if (system) return CANONICAL_CASES.filter((c) => c.system === system);
  return CANONICAL_CASES;
}

export function getCanonicalCaseByEventId(eventId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((c) => c.eventId === eventId) ?? null;
}

export function getCanonicalCaseById(caseId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((c) => c.caseId === caseId) ?? null;
}

/** Golden acceptance rubric: quality gate for every case. Doctrine-aligned criteria. */
export interface GoldenRubricCriterion {
  id: string;
  label: string;
  pass: boolean;
}

export interface GoldenAcceptanceResult {
  passed: number;
  total: number;
  criteria: GoldenRubricCriterion[];
}

const GOLDEN_ACCEPTANCE_CRITERIA: Array<{ id: string; label: string; check: (c: CanonicalCase) => boolean }> = [
  { id: "incident_class", label: "Incident Class", check: (c) => !!c.incidentClass?.trim() },
  { id: "scenario_frame", label: "Scenario Frame", check: (c) => !!c.scenarioFrame?.trim() },
  { id: "recorded_evidence", label: "Recorded Evidence", check: (c) => Array.isArray(c.recordedEvidence) && c.recordedEvidence.length > 0 },
  { id: "derived_assessment", label: "Derived Assessment", check: (c) => Array.isArray(c.derivedAssessment) && c.derivedAssessment.length > 0 },
  { id: "unknown_disputed", label: "Unknown / Disputed", check: (c) => Array.isArray(c.unknownDisputed) },
  { id: "verification_trace", label: "Verification Trace", check: (c) => Array.isArray(c.verificationTrace) && c.verificationTrace.length > 0 },
  { id: "artifact_issuance", label: "Artifact Issuance", check: (c) => c.artifactIssuance != null && typeof c.artifactIssuance.available === "boolean" },
  { id: "why_inevitable", label: "Why QARAQUTU is inevitable", check: (c) => !!c.whyInevitable?.trim() },
];

export function evaluateGoldenAcceptance(case_: CanonicalCase): GoldenAcceptanceResult {
  const criteria: GoldenRubricCriterion[] = GOLDEN_ACCEPTANCE_CRITERIA.map(({ id, label, check }) => ({
    id,
    label,
    pass: check(case_),
  }));
  const passed = criteria.filter((c) => c.pass).length;
  return { passed, total: criteria.length, criteria };
}

/** Ordered criterion labels for display (e.g. Golden page). */
export const GOLDEN_ACCEPTANCE_RUBRIC_LABELS = GOLDEN_ACCEPTANCE_CRITERIA.map((c) => c.label);
