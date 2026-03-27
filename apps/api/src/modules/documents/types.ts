import type { ArtifactRedactionRecord, CanonicalEvent, PolicyDecisionTrace, VerificationState } from "../../contracts";
import PDFDocument from "pdfkit";

export interface DocumentIdentity {
  eventId: string;
  bundleId: string;
  manifestId: string;
  exportId: string;
  receiptId: string | null;
  verificationState: VerificationState;
  generatedAt: string;
  exportProfile: string;
  exportPurpose: string;
  schemaVersion: string;
  tenantId?: string;
  outputTitle?: string;
  redactionApplied?: boolean;
  redactedItemCount?: number;
  redactionBasis?: string | null;
  redactionRecord?: ArtifactRedactionRecord | null;
  policyTrace?: PolicyDecisionTrace | null;
  /** Latest verification transcript id when linked at export time. */
  transcriptId?: string | null;
  /** Latest verification run id when linked at export time. */
  verificationRunId?: string | null;
}

export interface LayoutContext {
  doc: InstanceType<typeof PDFDocument>;
  identity: DocumentIdentity;
  event: CanonicalEvent & {
    vehicleVin?: string;
    fleetId?: string;
    policyOrClaimRef?: string;
    incidentLocation?: string;
    eventClass: string;
    scenarioKey: string;
    occurredAt: string;
  };
}

