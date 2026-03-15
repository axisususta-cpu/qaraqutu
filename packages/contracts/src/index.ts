export type VerificationState = "PASS" | "FAIL" | "UNKNOWN" | "UNVERIFIED";

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
  machineLabel: string;
  humanSummary: string;
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

export interface VerificationTraceStep {
  step: number;
  check: string;
  result: string;
  note: string;
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
  verificationState: VerificationState;
  /** Doctrine: Recorded Evidence (never collapse with derived). */
  recordedEvidence: RecordedEvidenceItem[];
  /** Doctrine: Derived Assessment (never collapse with recorded). */
  derivedAssessment: DerivedEvidenceItem[];
  /** Doctrine: Unknown / Disputed */
  unknownDisputed: string[];
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
  /** AXISUS State Pack v1: case-aware boundary states (optional). */
  axisusStates?: AxisusState[];
}

