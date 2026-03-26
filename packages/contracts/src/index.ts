export type VerificationState = "PASS" | "FAIL" | "UNKNOWN" | "UNVERIFIED";
export type ExportProfileCode = "claims" | "legal";
export type ExportFormat = "json" | "pdf";

export interface VerificationTranscriptEntry {
  step: number;
  check: string;
  result: string;
  note: string;
}

export interface VerificationRunResponse {
  verification_run_id: string;
  transcript_id: string | null;
  event_id: string;
  bundle_id: string;
  manifest_id: string;
  verification_state: VerificationState;
  transcript_summary: VerificationTranscriptEntry[];
  created_at?: string;
}

export interface CreateExportRequest {
  profile: ExportProfileCode;
  format: ExportFormat;
  purpose: string;
  outputTitle?: string;
}

export interface ExportArtifactResponse {
  export_id: string;
  receipt_id: string;
  event_id: string;
  bundle_id: string;
  manifest_id: string;
  verification_state: VerificationState;
  export_profile: ExportProfileCode;
  export_purpose: string;
  schema_version: string;
  download_url: string;
}

export interface RecordedEvidenceItem {
  recordId: string;
  sourceType: string;
  sourceId: string;
  capturedAt: string;
  contentType: string;
  hash: string;
  sizeOrLength: number;
  recordedFlag: true;
  derivationNote: null;
  originConfidence: number;
  storageRef?: string;
  displayLabel: string;
  /** Optional Turkish surface label (verifier demo enrichment). */
  displayLabelTr?: string;
  machineLabel: string;
}

export interface DerivedEvidenceItem {
  derivedId: string;
  derivedType: string;
  derivedFrom: string[];
  generatedAt: string;
  method: string;
  confidence: number;
  recordedFlag: false;
  derivationNote: string;
  displayLabel: string;
  displayLabelTr?: string;
  machineLabel: string;
  humanSummary: string;
  humanSummaryTr?: string;
  sourceDependencies: string[];
}

export interface CanonicalEvent {
  eventId: string;
  bundleId: string;
  manifestId: string;
  vehicleVin?: string;
  fleetId?: string;
  policyOrClaimRef?: string;
  incidentLocation?: string;
  eventClass: string;
  scenarioKey: string;
  occurredAt: string;
  verificationState: VerificationState;
  summary: string;
  recordedEvidence: RecordedEvidenceItem[];
  derivedEvidence: DerivedEvidenceItem[];
}

/** Canonical spine: one case shape for all verticals (Vehicle / Drone / Robot). */
export type CanonicalSystemId = "vehicle" | "drone" | "robot";

export type IncidentPhase = "t0" | "t1" | "t2" | "t3";

export interface IncidentPhaseSpec {
  phase: IncidentPhase;
  labelTr: string;
  labelEn: string;
  descriptionTr: string;
  descriptionEn: string;
  recordedLayerHint: string;
  derivedLayerHint: string;
  traceMarker: string;
}

export interface IncidentSpine {
  systemType: CanonicalSystemId;
  incidentId: string;
  scenarioTitle: string;
  incidentSummary: string;
  riskLabel: "DUSUK" | "ORTA" | "YUKSEK";
  uncertaintyState: "low" | "medium" | "high";
  spatialVocabulary: {
    generic: string;
    vehicle?: string;
    drone?: string;
    robot?: string;
  };
  phases: IncidentPhaseSpec[];
}

export interface VerificationTraceStep {
  step: number;
  check: string;
  result: string;
  note: string;
  checkTr?: string;
  noteTr?: string;
}

/** AXISUS State Pack v1: case-aware boundary protocol state. */
export interface AxisusState {
  id: string;
  labelTr: string;
  labelEn: string;
  severity: "observe" | "review" | "limit" | "handoff";
  reasonTr: string;
  reasonEn: string;
  handoffRequired: boolean;
  nextStepTr?: string;
  nextStepEn?: string;
}

/** Artifact Issuance Discipline Pack v1: per-case, per-profile visibility. */
export interface ArtifactProfileVisibility {
  profileCode: string;
  enabled: boolean;
  apiBacked: boolean;
  reasonTr: string;
  reasonEn: string;
}

export interface CanonicalCase {
  caseId: string;
  system: CanonicalSystemId;
  /** Doctrine: Incident Class */
  incidentClass: string;
  /** Doctrine: Scenario Frame */
  scenarioFrame: string;
  eventId: string;
  bundleId: string;
  manifestId: string;
  occurredAt: string;
  summary: string;
  /** Turkish incident summary for verifier-first demo surface. */
  summaryTr?: string;
  verificationState: VerificationState;
  /** Doctrine: Recorded Evidence (never collapse with derived). */
  recordedEvidence: RecordedEvidenceItem[];
  /** Doctrine: Derived Assessment (never collapse with recorded). */
  derivedAssessment: DerivedEvidenceItem[];
  /** Doctrine: Unknown / Disputed */
  unknownDisputed: string[];
  unknownDisputedTr?: string[];
  /** Doctrine: Verification Trace */
  verificationTrace: VerificationTraceStep[];
  /** Doctrine: Artifact Issuance (available for vehicle when API-backed). */
  artifactIssuance: { available: boolean; apiBacked?: boolean };
  /** Doctrine: Why QARAQUTU is inevitable */
  whyInevitable: string;
  /** Case Registry v1: demo framing (optional; fallback to generic). */
  demoNoticeTr?: string;
  demoNoticeEn?: string;
  /** Case Registry v1: display title (optional; fallback to scenarioFrame). */
  titleTr?: string;
  titleEn?: string;
  /** Case-density: why this event is under review (optional; fallback to system-based). */
  reviewWhyEn?: string;
  reviewWhyTr?: string;
  /** Case-density: suggested next step for reviewer (optional; fallback to system-based). */
  nextStepEn?: string;
  nextStepTr?: string;
  /** AXISUS State Pack v1: case-aware boundary states (optional). */
  axisusStates?: AxisusState[];
  /** Artifact Issuance Discipline Pack v1: case-aware profile visibility (optional). */
  artifactProfiles?: ArtifactProfileVisibility[];
  /** Connected Incident Spine (phase-driven forensic reconstruction model). */
  incidentSpine?: IncidentSpine;
}

