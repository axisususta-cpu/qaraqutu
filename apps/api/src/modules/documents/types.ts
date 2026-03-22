import type { CanonicalEvent, VerificationState } from "../../contracts";
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
  redactionApplied?: boolean;
  redactedItemCount?: number;
  redactionBasis?: string | null;
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

