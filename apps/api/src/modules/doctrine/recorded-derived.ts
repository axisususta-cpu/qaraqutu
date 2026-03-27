import {
  isDoctrineValidationError,
  normalizeEvidenceLayers,
  type DoctrineValidationError,
} from "contracts";
import type { DerivedEvidenceItem, RecordedEvidenceItem } from "../../contracts";

export interface DoctrineEvidencePair {
  recordedEvidence: RecordedEvidenceItem[];
  derivedEvidence: DerivedEvidenceItem[];
}

export function normalizeDoctrineEvidencePair(input: {
  recordedEvidence: unknown;
  derivedEvidence: unknown;
  source: string;
}): DoctrineEvidencePair {
  const normalized = normalizeEvidenceLayers(input);
  return {
    recordedEvidence: normalized.recordedEvidence as RecordedEvidenceItem[],
    derivedEvidence: normalized.derivedEvidence as DerivedEvidenceItem[],
  };
}

export { isDoctrineValidationError };
export type { DoctrineValidationError };