export type VerificationState = "PASS" | "FAIL" | "UNVERIFIED";
export type ExportProfileCode = "claims" | "legal";
export type ExportFormat = "json" | "pdf";

export type ArtifactDocumentFamily =
  | "pass_witness_summary"
  | "pass_verification_summary"
  | "pass_incident_review_summary"
  | "pass_limitation_annex"
  | "pass_vehicle_incident_report"
  | "integrity_failure_notice"
  | "tamper_detected_notice"
  | "chain_breach_notice"
  | "artifact_invalidity_notice";

export type ArtifactIntegrityFailureCode =
  | "TAMPER_DETECTED"
  | "INTEGRITY_BREACH"
  | "CHAIN_MISMATCH"
  | "ARTIFACT_INVALID";

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

export interface ArtifactSealMetadata {
  issuer_version: string;
  key_id: string;
  signature: string;
  seal_locator: string;
}

export interface ArtifactManifestRecord {
  manifest_hash: string;
  page_count: number;
  visible_text_hash: string;
  canonical_payload_hash: string;
  file_hash: string;
}

export interface ArtifactPackageRecord {
  document_id: string;
  event_id: string;
  issued_at: string;
  issuer_version: string;
  artifact_type: string;
  page_count: number;
  canonical_payload_hash: string;
  file_hash: string;
  manifest_hash: string;
  signature: string;
  key_id: string;
  document_family: ArtifactDocumentFamily;
  manifest: ArtifactManifestRecord;
  json_summary: Record<string, unknown>;
  seal_metadata: ArtifactSealMetadata;
  visible_text: string;
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
  document_family?: ArtifactDocumentFamily;
  linked_document_families?: ArtifactDocumentFamily[];
  artifact_package?: ArtifactPackageRecord;
}

export interface ArtifactReverificationRequest {
  artifact_package: ArtifactPackageRecord;
}

export interface ArtifactReverificationResponse {
  export_id: string;
  event_id: string;
  verification_state: "PASS" | "FAIL";
  failure_type?: ArtifactIntegrityFailureCode;
  transcript_summary: VerificationTranscriptEntry[];
  artifact_package: ArtifactPackageRecord;
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
  displayLabelTr?: string;
  machineLabel: string;
  visibility_class?: string;
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
  visibility_class?: string;
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

export type CanonicalSystemId = "vehicle" | "drone" | "robot";
export type IncidentPhase = "t0" | "t1" | "t2" | "t3";
export type PhaseVerificationPosture = "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
export type ArtifactReadiness = "ready" | "bounded" | "limited" | "not_ready";

export interface IncidentPhaseVerificationSummary {
  posture: PhaseVerificationPosture;
  recordedPosture: PhaseVerificationPosture;
  derivedPosture: PhaseVerificationPosture;
  unknownDisputedPosture: PhaseVerificationPosture;
  tracePosture: PhaseVerificationPosture;
  artifactReadiness: ArtifactReadiness;
  note?: string;
  noteTr?: string;
}

export interface IncidentPhaseSpec {
  phase: IncidentPhase;
  labelTr: string;
  labelEn: string;
  descriptionTr: string;
  descriptionEn: string;
  recordedLayerHint: string;
  derivedLayerHint: string;
  traceMarker: string;
  verification: IncidentPhaseVerificationSummary;
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

export interface ArtifactProfileVisibility {
  profileCode: string;
  enabled: boolean;
  apiBacked: boolean;
  reasonTr: string;
  reasonEn: string;
}

export interface CaseReverificationMode {
  enabled: boolean;
  mode: "tampered_copy";
  source_artifact_state: "PASS";
  target_failure: ArtifactIntegrityFailureCode;
  tamper_targets: string[];
  source_document_family: ArtifactDocumentFamily;
}

export interface CanonicalCase {
  id: string;
  caseId: string;
  vertical: CanonicalSystemId;
  system: CanonicalSystemId;
  title: string;
  titleTr?: string;
  titleEn?: string;
  incidentClass: string;
  scenarioFrame: string;
  eventId: string;
  bundleId: string;
  manifestId: string;
  occurredAt: string;
  summary: string;
  summaryTr?: string;
  verificationState: VerificationState;
  recordedEvidenceSummary: string;
  derivedAssessmentSummary: string;
  limitations: string[];
  limitationsTr?: string[];
  recordedEvidence: RecordedEvidenceItem[];
  derivedAssessment: DerivedEvidenceItem[];
  unknownDisputed: string[];
  unknownDisputedTr?: string[];
  verificationTrace: VerificationTraceStep[];
  artifactIssuance: {
    available: boolean;
    apiBacked?: boolean;
    documentFamilies?: ArtifactDocumentFamily[];
  };
  reverification?: CaseReverificationMode;
  whyInevitable: string;
  demoNoticeTr?: string;
  demoNoticeEn?: string;
  reviewWhyEn?: string;
  reviewWhyTr?: string;
  nextStepEn?: string;
  nextStepTr?: string;
  axisusStates?: AxisusState[];
  artifactProfiles?: ArtifactProfileVisibility[];
  incidentSpine?: IncidentSpine;
}

export * from "./demo-matrix";

