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

