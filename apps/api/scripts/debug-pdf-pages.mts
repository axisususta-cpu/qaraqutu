import PDFDocument from "pdfkit";
const orig = PDFDocument.prototype.addPage;
let n = 0;
PDFDocument.prototype.addPage = function (...args: unknown[]) {
  n++;
  console.log("addPage call", n, new Error().stack?.split("\n").slice(2, 5).join(" | "));
  return (orig as any).apply(this, args);
};

const { renderClaimsPdf } = await import("../src/modules/documents/claims-pack.js");
const { randomUUID } = await import("node:crypto");

const now = new Date().toISOString();
const identity = {
  eventId: "QEV-C",
  bundleId: "QBN-C",
  manifestId: "QMF-C",
  exportId: "QEX-C",
  receiptId: "QRC-C",
  verificationState: "PASS" as const,
  generatedAt: now,
  exportProfile: "claims",
  exportPurpose: "p",
  schemaVersion: "v1",
  tenantId: "t",
  transcriptId: "QTR",
  verificationRunId: "QVR",
};
const e = {
  eventId: identity.eventId,
  bundleId: identity.bundleId,
  manifestId: identity.manifestId,
  eventClass: "d",
  scenarioKey: "s",
  occurredAt: now,
  summary: "Brief.",
  verificationState: "PASS" as const,
  recordedEvidence: [
    {
      recordId: "r1",
      sourceType: "c",
      sourceId: "s1",
      capturedAt: now,
      contentType: "image/jpeg",
      hash: "h",
      sizeOrLength: 1,
      recordedFlag: true as const,
      derivationNote: null,
      originConfidence: 1,
      displayLabel: "Cam",
      machineLabel: "m",
    },
  ],
  derivedEvidence: [
    {
      derivedId: "d1",
      derivedType: "x",
      derivedFrom: ["r1"],
      generatedAt: now,
      method: "m",
      confidence: 1,
      recordedFlag: false as const,
      derivationNote: "n",
      displayLabel: "Der",
      machineLabel: "m",
      humanSummary: "h",
      sourceDependencies: [] as string[],
    },
  ],
  verificationTrace: [
    { step: 0, check: "a", result: "PASS", note: "n" },
    { step: 1, check: "b", result: "PASS", note: "n" },
  ],
  unknownDisputed: [] as string[],
};

const doc = renderClaimsPdf(identity as any, e as any);
doc.on("data", () => {});
await new Promise<void>((res, rej) => {
  doc.on("end", res);
  doc.on("error", rej);
  doc.end();
});
console.log("total addPage hooks (excludes initial):", n);
