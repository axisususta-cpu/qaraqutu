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

export interface PolicyOverrideRecord {
  enabled_export_profiles?: string[];
  enabled_visibility_classes?: string[];
  redaction_enabled?: boolean;
}

export interface PolicyTraceLayer<T> {
  layer: "tenant_default" | "role_override" | "user_override" | "profile_default";
  source_key: string;
  value: T;
  applied: boolean;
}

export interface PolicyTraceField<T> {
  final_value: T;
  resolved_from: "tenant_default" | "role_override" | "user_override" | "profile_default";
  layers: Array<PolicyTraceLayer<T>>;
}

export interface PolicyDecisionTrace {
  trusted_role: string;
  trusted_subject: string | null;
  requested_export_profile: ExportProfileCode;
  export_profiles: PolicyTraceField<string[]>;
  actor_visibility_classes: PolicyTraceField<string[]>;
  effective_visibility_classes: PolicyTraceField<string[]>;
  redaction_enabled: PolicyTraceField<boolean>;
}

export interface ArtifactRedactionEntry {
  action: "remove_item" | "remove_reference";
  layer: "recorded_evidence" | "derived_evidence";
  field: "recorded_evidence" | "derived_evidence" | "derivedFrom" | "sourceDependencies";
  target_path: string;
  visibility_class: string;
  export_profile: ExportProfileCode;
  policy_scope: "profile" | "tenant" | "profile_and_tenant";
  removed_count?: number;
}

export interface ArtifactRedactionRecord {
  applied: boolean;
  basis: string | null;
  export_profile: ExportProfileCode;
  enabled_visibility_classes: string[];
  tenant_visibility_classes: string[] | null;
  entries: ArtifactRedactionEntry[];
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
  redaction_record?: ArtifactRedactionRecord | null;
  policy_trace?: PolicyDecisionTrace | null;
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
  policy_trace?: PolicyDecisionTrace;
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

export type DoctrineEvidenceLayer = "recorded" | "derived";

export interface DoctrineViolation {
  layer: DoctrineEvidenceLayer;
  index: number;
  field: string;
  reason: string;
}

const RECORDED_REQUIRED_FIELDS = [
  "recordId",
  "sourceType",
  "sourceId",
  "capturedAt",
  "contentType",
  "hash",
  "sizeOrLength",
  "recordedFlag",
  "derivationNote",
  "originConfidence",
  "displayLabel",
  "machineLabel",
] as const;

const DERIVED_REQUIRED_FIELDS = [
  "derivedId",
  "derivedType",
  "derivedFrom",
  "generatedAt",
  "method",
  "confidence",
  "recordedFlag",
  "derivationNote",
  "displayLabel",
  "machineLabel",
  "humanSummary",
  "sourceDependencies",
] as const;

const RECORDED_FORBIDDEN_FIELDS = [
  "derivedId",
  "derivedType",
  "derivedFrom",
  "generatedAt",
  "method",
  "confidence",
  "humanSummary",
  "humanSummaryTr",
  "sourceDependencies",
] as const;

const DERIVED_FORBIDDEN_FIELDS = [
  "recordId",
  "sourceType",
  "sourceId",
  "capturedAt",
  "contentType",
  "hash",
  "sizeOrLength",
  "originConfidence",
  "storageRef",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => isNonEmptyString(entry));
}

function pushViolation(
  violations: DoctrineViolation[],
  layer: DoctrineEvidenceLayer,
  index: number,
  field: string,
  reason: string
) {
  violations.push({ layer, index, field, reason });
}

function validateOptionalString(
  item: Record<string, unknown>,
  field: string,
  layer: DoctrineEvidenceLayer,
  index: number,
  violations: DoctrineViolation[]
) {
  if (item[field] !== undefined && !isNonEmptyString(item[field])) {
    pushViolation(violations, layer, index, field, "must be a non-empty string when provided");
  }
}

function validateRecordedEvidenceItem(item: unknown, index: number, violations: DoctrineViolation[]): RecordedEvidenceItem | null {
  if (!isRecord(item)) {
    pushViolation(violations, "recorded", index, "item", "must be an object");
    return null;
  }

  for (const field of RECORDED_REQUIRED_FIELDS) {
    if (!(field in item)) {
      pushViolation(violations, "recorded", index, field, "is required");
    }
  }

  for (const field of RECORDED_FORBIDDEN_FIELDS) {
    if (item[field] !== undefined) {
      pushViolation(violations, "recorded", index, field, "belongs to the derived layer and must not appear in recorded evidence");
    }
  }

  if (!isNonEmptyString(item.recordId)) pushViolation(violations, "recorded", index, "recordId", "must be a non-empty string");
  if (!isNonEmptyString(item.sourceType)) pushViolation(violations, "recorded", index, "sourceType", "must be a non-empty string");
  if (!isNonEmptyString(item.sourceId)) pushViolation(violations, "recorded", index, "sourceId", "must be a non-empty string");
  if (!isNonEmptyString(item.capturedAt)) pushViolation(violations, "recorded", index, "capturedAt", "must be a non-empty string");
  if (!isNonEmptyString(item.contentType)) pushViolation(violations, "recorded", index, "contentType", "must be a non-empty string");
  if (!isNonEmptyString(item.hash)) pushViolation(violations, "recorded", index, "hash", "must be a non-empty string");
  if (!isFiniteNumber(item.sizeOrLength)) pushViolation(violations, "recorded", index, "sizeOrLength", "must be a finite number");
  if (item.recordedFlag !== true) pushViolation(violations, "recorded", index, "recordedFlag", "must be true for recorded evidence");
  if (item.derivationNote !== null) pushViolation(violations, "recorded", index, "derivationNote", "must be null for recorded evidence");
  if (!isFiniteNumber(item.originConfidence)) pushViolation(violations, "recorded", index, "originConfidence", "must be a finite number");
  if (!isNonEmptyString(item.displayLabel)) pushViolation(violations, "recorded", index, "displayLabel", "must be a non-empty string");
  if (!isNonEmptyString(item.machineLabel)) pushViolation(violations, "recorded", index, "machineLabel", "must be a non-empty string");

  validateOptionalString(item, "storageRef", "recorded", index, violations);
  validateOptionalString(item, "displayLabelTr", "recorded", index, violations);
  validateOptionalString(item, "visibility_class", "recorded", index, violations);

  if (violations.some((violation) => violation.layer === "recorded" && violation.index === index)) {
    return null;
  }

  const recordId = item.recordId as string;
  const sourceType = item.sourceType as string;
  const sourceId = item.sourceId as string;
  const capturedAt = item.capturedAt as string;
  const contentType = item.contentType as string;
  const hash = item.hash as string;
  const sizeOrLength = item.sizeOrLength as number;
  const originConfidence = item.originConfidence as number;
  const displayLabel = item.displayLabel as string;
  const machineLabel = item.machineLabel as string;

  return {
    recordId,
    sourceType,
    sourceId,
    capturedAt,
    contentType,
    hash,
    sizeOrLength,
    recordedFlag: true,
    derivationNote: null,
    originConfidence,
    storageRef: item.storageRef as string | undefined,
    displayLabel,
    displayLabelTr: item.displayLabelTr as string | undefined,
    machineLabel,
    visibility_class: item.visibility_class as string | undefined,
  };
}

function validateDerivedEvidenceItem(item: unknown, index: number, violations: DoctrineViolation[]): DerivedEvidenceItem | null {
  if (!isRecord(item)) {
    pushViolation(violations, "derived", index, "item", "must be an object");
    return null;
  }

  for (const field of DERIVED_REQUIRED_FIELDS) {
    if (!(field in item)) {
      pushViolation(violations, "derived", index, field, "is required");
    }
  }

  for (const field of DERIVED_FORBIDDEN_FIELDS) {
    if (item[field] !== undefined) {
      pushViolation(violations, "derived", index, field, "belongs to the recorded layer and must not appear in derived evidence");
    }
  }

  if (!isNonEmptyString(item.derivedId)) pushViolation(violations, "derived", index, "derivedId", "must be a non-empty string");
  if (!isNonEmptyString(item.derivedType)) pushViolation(violations, "derived", index, "derivedType", "must be a non-empty string");
  if (!isStringArray(item.derivedFrom)) pushViolation(violations, "derived", index, "derivedFrom", "must be an array of non-empty strings");
  if (!isNonEmptyString(item.generatedAt)) pushViolation(violations, "derived", index, "generatedAt", "must be a non-empty string");
  if (!isNonEmptyString(item.method)) pushViolation(violations, "derived", index, "method", "must be a non-empty string");
  if (!isFiniteNumber(item.confidence)) pushViolation(violations, "derived", index, "confidence", "must be a finite number");
  if (item.recordedFlag !== false) pushViolation(violations, "derived", index, "recordedFlag", "must be false for derived evidence");
  if (!isNonEmptyString(item.derivationNote)) pushViolation(violations, "derived", index, "derivationNote", "must be a non-empty string for derived evidence");
  if (!isNonEmptyString(item.displayLabel)) pushViolation(violations, "derived", index, "displayLabel", "must be a non-empty string");
  if (!isNonEmptyString(item.machineLabel)) pushViolation(violations, "derived", index, "machineLabel", "must be a non-empty string");
  if (!isNonEmptyString(item.humanSummary)) pushViolation(violations, "derived", index, "humanSummary", "must be a non-empty string");
  if (!isStringArray(item.sourceDependencies)) pushViolation(violations, "derived", index, "sourceDependencies", "must be an array of non-empty strings");

  validateOptionalString(item, "displayLabelTr", "derived", index, violations);
  validateOptionalString(item, "humanSummaryTr", "derived", index, violations);
  validateOptionalString(item, "visibility_class", "derived", index, violations);

  if (violations.some((violation) => violation.layer === "derived" && violation.index === index)) {
    return null;
  }

  const derivedId = item.derivedId as string;
  const derivedType = item.derivedType as string;
  const derivedFrom = [...(item.derivedFrom as string[])];
  const generatedAt = item.generatedAt as string;
  const method = item.method as string;
  const confidence = item.confidence as number;
  const derivationNote = item.derivationNote as string;
  const displayLabel = item.displayLabel as string;
  const machineLabel = item.machineLabel as string;
  const humanSummary = item.humanSummary as string;
  const sourceDependencies = [...(item.sourceDependencies as string[])];

  return {
    derivedId,
    derivedType,
    derivedFrom,
    generatedAt,
    method,
    confidence,
    recordedFlag: false,
    derivationNote,
    displayLabel,
    displayLabelTr: item.displayLabelTr as string | undefined,
    machineLabel,
    humanSummary,
    humanSummaryTr: item.humanSummaryTr as string | undefined,
    sourceDependencies,
    visibility_class: item.visibility_class as string | undefined,
  };
}

export class DoctrineValidationError extends Error {
  readonly code = "DOCTRINE_RECORDED_DERIVED_SEPARATION_VIOLATION";
  readonly source: string;
  readonly violations: DoctrineViolation[];

  constructor(source: string, violations: DoctrineViolation[]) {
    super("Recorded and derived evidence layers must remain separated.");
    this.name = "DoctrineValidationError";
    this.source = source;
    this.violations = violations;
  }
}

export function isDoctrineValidationError(error: unknown): error is DoctrineValidationError {
  return error instanceof DoctrineValidationError || (
    !!error &&
    typeof error === "object" &&
    (error as { code?: unknown }).code === "DOCTRINE_RECORDED_DERIVED_SEPARATION_VIOLATION" &&
    Array.isArray((error as { violations?: unknown[] }).violations)
  );
}

export function normalizeEvidenceLayers(input: {
  recordedEvidence: unknown;
  derivedEvidence: unknown;
  source?: string;
}): {
  recordedEvidence: RecordedEvidenceItem[];
  derivedEvidence: DerivedEvidenceItem[];
} {
  const source = input.source ?? "unknown";
  const violations: DoctrineViolation[] = [];
  const recordedSource = Array.isArray(input.recordedEvidence) ? input.recordedEvidence : [];
  const derivedSource = Array.isArray(input.derivedEvidence) ? input.derivedEvidence : [];

  if (input.recordedEvidence != null && !Array.isArray(input.recordedEvidence)) {
    pushViolation(violations, "recorded", -1, "recordedEvidence", "must be an array");
  }
  if (input.derivedEvidence != null && !Array.isArray(input.derivedEvidence)) {
    pushViolation(violations, "derived", -1, "derivedEvidence", "must be an array");
  }

  const recordedEvidence = recordedSource
    .map((item, index) => validateRecordedEvidenceItem(item, index, violations))
    .filter((item): item is RecordedEvidenceItem => item !== null);
  const derivedEvidence = derivedSource
    .map((item, index) => validateDerivedEvidenceItem(item, index, violations))
    .filter((item): item is DerivedEvidenceItem => item !== null);

  if (violations.length > 0) {
    throw new DoctrineValidationError(source, violations);
  }

  return {
    recordedEvidence,
    derivedEvidence,
  };
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

