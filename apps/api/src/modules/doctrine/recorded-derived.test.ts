import test from "node:test";
import assert from "node:assert/strict";
import {
  isDoctrineValidationError,
  normalizeDoctrineEvidencePair,
} from "./recorded-derived";

const validRecorded = {
  recordId: "REC-1",
  sourceType: "telemetry_trace",
  sourceId: "SRC-1",
  capturedAt: "2026-03-27T12:00:00.000Z",
  contentType: "application/json",
  hash: "hash-1",
  sizeOrLength: 128,
  recordedFlag: true as const,
  derivationNote: null,
  originConfidence: 0.98,
  displayLabel: "Recorded telemetry",
  machineLabel: "telemetry",
};

const validDerived = {
  derivedId: "DER-1",
  derivedType: "timeline_synthesis",
  derivedFrom: ["REC-1"],
  generatedAt: "2026-03-27T12:01:00.000Z",
  method: "timeline_v1",
  confidence: 0.87,
  recordedFlag: false as const,
  derivationNote: "Derived from recorded telemetry.",
  displayLabel: "Timeline synthesis",
  machineLabel: "timeline_synthesis",
  humanSummary: "Summarizes the telemetry into a bounded sequence.",
  sourceDependencies: ["REC-1"],
};

test("rejects mixed recorded payloads", () => {
  assert.throws(
    () =>
      normalizeDoctrineEvidencePair({
        source: "test:mixed_recorded",
        recordedEvidence: [
          {
            ...validRecorded,
            derivedId: "DER-MIXED",
            derivedFrom: ["REC-1"],
          },
        ],
        derivedEvidence: [validDerived],
      }),
    (error) => {
      assert.ok(isDoctrineValidationError(error));
      assert.equal(error.code, "DOCTRINE_RECORDED_DERIVED_SEPARATION_VIOLATION");
      assert.equal(error.source, "test:mixed_recorded");
      assert.ok(error.violations.some((violation) => violation.layer === "recorded" && violation.field === "derivedId"));
      return true;
    }
  );
});

test("accepts valid separated payloads", () => {
  const result = normalizeDoctrineEvidencePair({
    source: "test:valid_layers",
    recordedEvidence: [validRecorded],
    derivedEvidence: [validDerived],
  });

  assert.equal(result.recordedEvidence.length, 1);
  assert.equal(result.derivedEvidence.length, 1);
  assert.equal(result.recordedEvidence[0].recordedFlag, true);
  assert.equal(result.recordedEvidence[0].recordId, "REC-1");
  assert.equal(result.derivedEvidence[0].recordedFlag, false);
  assert.deepEqual(result.derivedEvidence[0].derivedFrom, ["REC-1"]);
});