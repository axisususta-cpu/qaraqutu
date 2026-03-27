import type { CanonicalCase, CanonicalSystemId } from "contracts";
import { DEMO_CASE_MATRIX } from "contracts";

export const CANONICAL_CASES: CanonicalCase[] = DEMO_CASE_MATRIX;

export function getCanonicalCases(system?: CanonicalSystemId): CanonicalCase[] {
  if (system) {
    return CANONICAL_CASES.filter((caseItem) => caseItem.system === system);
  }

  return CANONICAL_CASES;
}

export function getCanonicalCaseByEventId(eventId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((caseItem) => caseItem.eventId === eventId) ?? null;
}

export function getCanonicalCaseById(caseId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((caseItem) => caseItem.caseId === caseId || caseItem.id === caseId) ?? null;
}

export interface GoldenRubricCriterion {
  id: string;
  label: string;
  pass: boolean;
}

export interface GoldenAcceptanceResult {
  passed: number;
  total: number;
  criteria: GoldenRubricCriterion[];
}

const GOLDEN_ACCEPTANCE_CRITERIA: Array<{ id: string; label: string; check: (caseItem: CanonicalCase) => boolean }> = [
  { id: "id", label: "Case ID", check: (caseItem) => !!caseItem.id?.trim() },
  { id: "vertical", label: "Vertical", check: (caseItem) => !!caseItem.vertical?.trim() },
  { id: "title", label: "Title", check: (caseItem) => !!caseItem.title?.trim() },
  { id: "incident_class", label: "Incident Class", check: (caseItem) => !!caseItem.incidentClass?.trim() },
  { id: "scenario_frame", label: "Scenario Frame", check: (caseItem) => !!caseItem.scenarioFrame?.trim() },
  { id: "recorded_summary", label: "Recorded Evidence Summary", check: (caseItem) => !!caseItem.recordedEvidenceSummary?.trim() },
  { id: "derived_summary", label: "Derived Assessment Summary", check: (caseItem) => !!caseItem.derivedAssessmentSummary?.trim() },
  { id: "limitations", label: "Limitations", check: (caseItem) => Array.isArray(caseItem.limitations) },
  { id: "issuance", label: "Artifact Issuance", check: (caseItem) => typeof caseItem.artifactIssuance?.available === "boolean" },
  { id: "reverification", label: "Re-Verification Metadata", check: (caseItem) => caseItem.reverification == null || caseItem.reverification.enabled === true },
  { id: "trace", label: "Verification Trace", check: (caseItem) => Array.isArray(caseItem.verificationTrace) && caseItem.verificationTrace.length > 0 },
];

export function evaluateGoldenAcceptance(caseItem: CanonicalCase): GoldenAcceptanceResult {
  const criteria = GOLDEN_ACCEPTANCE_CRITERIA.map(({ id, label, check }) => ({
    id,
    label,
    pass: check(caseItem),
  }));
  const passed = criteria.filter((criterion) => criterion.pass).length;

  return { passed, total: criteria.length, criteria };
}

export const GOLDEN_ACCEPTANCE_RUBRIC_LABELS = GOLDEN_ACCEPTANCE_CRITERIA.map((criterion) => criterion.label);
