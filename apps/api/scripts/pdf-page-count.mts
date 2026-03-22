import { createRequire } from "node:module";
import { renderClaimsPdf } from "../src/modules/documents/claims-pack.js";
import { renderLegalPdf } from "../src/modules/documents/legal-pack.js";
import type { CanonicalEvent } from "../src/contracts.js";
import type { DocumentIdentity } from "../src/modules/documents/types.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (b: Buffer) => Promise<{ numpages: number }>;

function bufferFromDoc(doc: ReturnType<typeof renderClaimsPdf>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

const now = new Date().toISOString();
const identity: DocumentIdentity = {
  eventId: "QEV-COMPACT",
  bundleId: "QBN-COMPACT",
  manifestId: "QMF-COMPACT",
  exportId: "QEX-COMPACT",
  receiptId: "QRC-COMPACT",
  verificationState: "PASS",
  generatedAt: now,
  exportProfile: "claims",
  exportPurpose: "page_count_fixture",
  schemaVersion: "v1",
  tenantId: "t1",
  transcriptId: "QTR-C",
  verificationRunId: "QVR-C",
};

const shortEvent: CanonicalEvent = {
  eventId: identity.eventId,
  bundleId: identity.bundleId,
  manifestId: identity.manifestId,
  eventClass: "demo",
  scenarioKey: "Short scenario",
  occurredAt: now,
  summary: "Brief incident summary for pagination test.",
  verificationState: "PASS",
  recordedEvidence: [
    {
      recordId: "r1",
      sourceType: "cam",
      sourceId: "s1",
      capturedAt: now,
      contentType: "image/jpeg",
      hash: "h1",
      sizeOrLength: 100,
      recordedFlag: true,
      derivationNote: null,
      originConfidence: 1,
      displayLabel: "Camera A",
      machineLabel: "m1",
    },
  ],
  derivedEvidence: [
    {
      derivedId: "d1",
      derivedType: "summary",
      derivedFrom: ["r1"],
      generatedAt: now,
      method: "m",
      confidence: 0.9,
      recordedFlag: false,
      derivationNote: "Synthetic",
      displayLabel: "Timeline",
      machineLabel: "m2",
      humanSummary: "Short derived line.",
      sourceDependencies: ["r1"],
    },
  ],
  verificationTrace: [
    { step: 0, check: "Linkage", result: "PASS", note: "OK" },
    { step: 1, check: "Separation", result: "PASS", note: "OK" },
  ],
  unknownDisputed: [],
};

async function main() {
  const claimsBuf = await bufferFromDoc(renderClaimsPdf(identity, shortEvent));
  const claimsPages = (await pdfParse(claimsBuf)).numpages;

  const legalId: DocumentIdentity = { ...identity, exportProfile: "legal", exportPurpose: "page_count_legal" };
  const legalBuf = await bufferFromDoc(renderLegalPdf(legalId, shortEvent));
  const legalPages = (await pdfParse(legalBuf)).numpages;

  console.log(JSON.stringify({ claimsPages, legalPages, claimsBytes: claimsBuf.length, legalBytes: legalBuf.length }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
