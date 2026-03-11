import type { CanonicalEvent, VerificationState } from "contracts";
import type PDFDocument from "pdfkit";

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
}

export interface LayoutContext {
  doc: PDFDocument;
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

