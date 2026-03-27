import { createHash } from "crypto";
import type {
  ArtifactDocumentFamily,
  ArtifactIntegrityFailureCode,
  ArtifactPackageRecord,
  DerivedEvidenceItem,
  PolicyDecisionTrace,
  ArtifactRedactionRecord,
  ArtifactReverificationResponse,
  ExportFormat,
  ExportProfileCode,
  RecordedEvidenceItem,
  VerificationTranscriptEntry,
} from "../../contracts";

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashOf(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function getDocumentFamilies(profile: ExportProfileCode, eventClass: string): {
  primary: ArtifactDocumentFamily;
  linked: ArtifactDocumentFamily[];
} {
  const lower = eventClass.toLowerCase();
  const linked: ArtifactDocumentFamily[] = ["pass_incident_review_summary"];
  if (profile === "claims") {
    linked.unshift("pass_verification_summary");
    linked.unshift("pass_witness_summary");
  } else {
    linked.unshift("pass_witness_summary");
    linked.unshift("pass_verification_summary");
  }
  if (lower.includes("limited")) {
    linked.push("pass_limitation_annex");
  }
  if (lower.includes("vehicle")) {
    linked.push("pass_vehicle_incident_report");
  }
  return {
    primary: profile === "claims" ? "pass_witness_summary" : "pass_verification_summary",
    linked,
  };
}

function getPageCount(format: ExportFormat, eventClass: string): number {
  if (format === "json") return 1;
  return eventClass.toLowerCase().includes("limited") ? 3 : 2;
}

export function buildArtifactPackage(input: {
  exportId: string;
  receiptId: string;
  schemaVersion: string;
  buildVersion: string;
  profile: ExportProfileCode;
  format: ExportFormat;
  eventClass: string;
  eventId: string;
  bundleId: string;
  manifestId: string;
  issuedAt: string;
  summary: string;
  verificationState: string;
  purpose: string;
  recordedEvidence: ReadonlyArray<RecordedEvidenceItem>;
  derivedEvidence: ReadonlyArray<DerivedEvidenceItem>;
  redactionRecord?: ArtifactRedactionRecord | null;
  policyTrace?: PolicyDecisionTrace | null;
}): {
  documentFamily: ArtifactDocumentFamily;
  linkedDocumentFamilies: ArtifactDocumentFamily[];
  artifactPackage: ArtifactPackageRecord;
} {
  const { primary, linked } = getDocumentFamilies(input.profile, input.eventClass);
  const pageCount = getPageCount(input.format, input.eventClass);
  const jsonSummary = {
    event_id: input.eventId,
    bundle_id: input.bundleId,
    manifest_id: input.manifestId,
    export_id: input.exportId,
    receipt_id: input.receiptId,
    verification_state: input.verificationState,
    export_profile: input.profile,
    export_purpose: input.purpose,
    recorded_evidence_count: input.recordedEvidence.length,
    derived_evidence_count: input.derivedEvidence.length,
    redaction_record: input.redactionRecord ?? null,
    policy_trace: input.policyTrace ?? null,
    summary: input.summary,
    document_family: primary,
  };
  const canonicalPayloadHash = hashOf(jsonSummary);
  const visibleText = [
    primary,
    input.eventId,
    input.bundleId,
    input.manifestId,
    input.summary,
    `recorded:${input.recordedEvidence.length}`,
    `derived:${input.derivedEvidence.length}`,
    `redaction:${input.redactionRecord?.entries.length ?? 0}`,
    `policy:${input.policyTrace?.export_profiles.resolved_from ?? "tenant_default"}`,
    `verification:${input.verificationState}`,
  ].join("\n");
  const visibleTextHash = hashOf(visibleText);
  const manifest = {
    manifest_hash: "",
    page_count: pageCount,
    visible_text_hash: visibleTextHash,
    canonical_payload_hash: canonicalPayloadHash,
    file_hash: "",
  };
  const manifestHash = hashOf({
    event_id: input.eventId,
    bundle_id: input.bundleId,
    manifest_id: input.manifestId,
    page_count: pageCount,
    canonical_payload_hash: canonicalPayloadHash,
    visible_text_hash: visibleTextHash,
    document_family: primary,
  });
  const fileHash = hashOf({
    export_id: input.exportId,
    format: input.format,
    manifest_hash: manifestHash,
    canonical_payload_hash: canonicalPayloadHash,
    purpose: input.purpose,
  });
  const keyId = `qaraqutu/${input.schemaVersion}`;
  const signature = hashOf({ key_id: keyId, manifest_hash: manifestHash, build_version: input.buildVersion });
  manifest.manifest_hash = manifestHash;
  manifest.file_hash = fileHash;

  return {
    documentFamily: primary,
    linkedDocumentFamilies: linked,
    artifactPackage: {
      document_id: `DOC-${input.exportId}`,
      event_id: input.eventId,
      issued_at: input.issuedAt,
      issuer_version: input.buildVersion,
      artifact_type: `${input.profile}_${input.format}`,
      page_count: pageCount,
      canonical_payload_hash: canonicalPayloadHash,
      file_hash: fileHash,
      manifest_hash: manifestHash,
      signature,
      key_id: keyId,
      document_family: primary,
      manifest,
      json_summary: jsonSummary,
      seal_metadata: {
        issuer_version: input.buildVersion,
        key_id: keyId,
        signature,
        seal_locator: `seal://${input.exportId}`,
      },
      visible_text: visibleText,
      redaction_record: input.redactionRecord ?? null,
      policy_trace: input.policyTrace ?? null,
    },
  };
}

function failTypeForChecks(checks: Array<{ id: string; pass: boolean }>): ArtifactIntegrityFailureCode | undefined {
  const firstFailure = checks.find((check) => !check.pass)?.id;
  if (!firstFailure) return undefined;
  if (["visible_text", "file_hash"].includes(firstFailure)) return "TAMPER_DETECTED";
  if (["manifest_hash", "page_count"].includes(firstFailure)) return "INTEGRITY_BREACH";
  if (["signature", "seal_metadata"].includes(firstFailure)) return "CHAIN_MISMATCH";
  return "ARTIFACT_INVALID";
}

export function reverifyArtifactPackage(input: {
  exportId: string;
  expected: ArtifactPackageRecord;
  submitted: ArtifactPackageRecord;
}): ArtifactReverificationResponse {
  const checks: Array<{
    id: string;
    label: string;
    pass: boolean;
    failNote: string;
    passNote: string;
  }> = [
    {
      id: "canonical_issue_record",
      label: "Canonical issue record located",
      pass: input.expected.document_id.length > 0,
      failNote: "Original issue record is missing for this export.",
      passNote: "Original issue record is present for this export.",
    },
    {
      id: "file_hash",
      label: "File hash matches",
      pass: input.submitted.file_hash === input.expected.file_hash,
      failNote: "Returning copy file hash differs from the issued artifact package.",
      passNote: "Returning copy file hash matches the issued artifact package.",
    },
    {
      id: "manifest_hash",
      label: "Manifest matches",
      pass: input.submitted.manifest_hash === input.expected.manifest_hash,
      failNote: "Returning copy manifest hash diverges from the canonical issue record.",
      passNote: "Returning copy manifest hash matches the canonical issue record.",
    },
    {
      id: "signature",
      label: "Signature verifies",
      pass:
        input.submitted.signature === input.expected.signature &&
        input.submitted.key_id === input.expected.key_id,
      failNote: "Signature or key identifier does not match the issued package.",
      passNote: "Signature and key identifier match the issued package.",
    },
    {
      id: "page_count",
      label: "Page count unchanged",
      pass: input.submitted.page_count === input.expected.page_count,
      failNote: "Page count changed after issuance.",
      passNote: "Page count matches the issued package.",
    },
    {
      id: "visible_text",
      label: "Visible text unchanged",
      pass: input.submitted.visible_text === input.expected.visible_text,
      failNote: "Visible text/content differs from the issued package.",
      passNote: "Visible text/content matches the issued package.",
    },
    {
      id: "seal_metadata",
      label: "Seal metadata matches",
      pass: stableJson(input.submitted.seal_metadata) === stableJson(input.expected.seal_metadata),
      failNote: "Seal metadata diverges from the issued package.",
      passNote: "Seal metadata matches the issued package.",
    },
  ];

  const transcriptSummary: VerificationTranscriptEntry[] = checks.map((check, index) => ({
    step: index + 1,
    check: check.label,
    result: check.pass ? "PASS" : "FAIL",
    note: check.pass ? check.passNote : check.failNote,
  }));
  const failureType = failTypeForChecks(checks);

  return {
    export_id: input.exportId,
    event_id: input.expected.event_id,
    verification_state: failureType ? "FAIL" : "PASS",
    failure_type: failureType,
    transcript_summary: transcriptSummary,
    artifact_package: input.expected,
  };
}