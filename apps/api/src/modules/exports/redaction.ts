import type {
  ArtifactRedactionEntry,
  ArtifactRedactionRecord,
  DerivedEvidenceItem,
  ExportProfileCode,
  RecordedEvidenceItem,
} from "../../contracts";

type EvidenceItem = RecordedEvidenceItem | DerivedEvidenceItem;

function policyScope(allowedByProfile: boolean, allowedByTenant: boolean): ArtifactRedactionEntry["policy_scope"] {
  if (!allowedByProfile && !allowedByTenant) return "profile_and_tenant";
  if (!allowedByProfile) return "profile";
  return "tenant";
}

export function decideVisibility(item: any, fallback: string): string {
  return typeof item?.visibility_class === "string" ? item.visibility_class : fallback;
}

function cloneRecorded(item: RecordedEvidenceItem, visibilityClass: string): RecordedEvidenceItem {
  return {
    ...item,
    visibility_class: visibilityClass,
  };
}

function cloneDerived(item: DerivedEvidenceItem, visibilityClass: string): DerivedEvidenceItem {
  return {
    ...item,
    visibility_class: visibilityClass,
    derivedFrom: Array.isArray(item.derivedFrom) ? [...item.derivedFrom] : [],
    sourceDependencies: Array.isArray(item.sourceDependencies) ? [...item.sourceDependencies] : [],
  };
}

export function applyEvidenceRedaction(input: {
  recordedEvidence: ReadonlyArray<RecordedEvidenceItem>;
  derivedEvidence: ReadonlyArray<DerivedEvidenceItem>;
  exportProfile: ExportProfileCode;
  allowedVisibilityClasses: Set<string>;
  tenantVisibilityClasses: Set<string> | null;
}): {
  filteredRecorded: RecordedEvidenceItem[];
  filteredDerived: DerivedEvidenceItem[];
  redactionRecord: ArtifactRedactionRecord;
  redactionApplied: boolean;
  redactedItemCount: number;
  redactionBasis: string | null;
} {
  const entries: ArtifactRedactionEntry[] = [];
  const excludedById = new Map<string, { visibilityClass: string }>();
  const filteredRecorded: RecordedEvidenceItem[] = [];
  const filteredDerived: DerivedEvidenceItem[] = [];

  for (const item of input.recordedEvidence) {
    const visibilityClass = decideVisibility(item, "claims_review");
    const allowedByProfile = input.allowedVisibilityClasses.has(visibilityClass);
    const allowedByTenant = input.tenantVisibilityClasses ? input.tenantVisibilityClasses.has(visibilityClass) : true;

    if (allowedByProfile && allowedByTenant) {
      filteredRecorded.push(cloneRecorded(item, visibilityClass));
      continue;
    }

    if (item.recordId) {
      excludedById.set(item.recordId, { visibilityClass });
    }
    entries.push({
      action: "remove_item",
      layer: "recorded_evidence",
      field: "recorded_evidence",
      target_path: "recorded_evidence",
      visibility_class: visibilityClass,
      export_profile: input.exportProfile,
      policy_scope: policyScope(allowedByProfile, allowedByTenant),
      removed_count: 1,
    });
  }

  for (const item of input.derivedEvidence) {
    const visibilityClass = decideVisibility(item, "legal_review");
    const allowedByProfile = input.allowedVisibilityClasses.has(visibilityClass);
    const allowedByTenant = input.tenantVisibilityClasses ? input.tenantVisibilityClasses.has(visibilityClass) : true;

    if (allowedByProfile && allowedByTenant) {
      filteredDerived.push(cloneDerived(item, visibilityClass));
      continue;
    }

    if (item.derivedId) {
      excludedById.set(item.derivedId, { visibilityClass });
    }
    entries.push({
      action: "remove_item",
      layer: "derived_evidence",
      field: "derived_evidence",
      target_path: "derived_evidence",
      visibility_class: visibilityClass,
      export_profile: input.exportProfile,
      policy_scope: policyScope(allowedByProfile, allowedByTenant),
      removed_count: 1,
    });
  }

  for (const item of filteredDerived) {
    const fields: Array<"derivedFrom" | "sourceDependencies"> = ["derivedFrom", "sourceDependencies"];

    for (const field of fields) {
      const values = Array.isArray(item[field]) ? item[field] : [];
      const removedReferenceIds = values.filter((value) => excludedById.has(value));
      if (removedReferenceIds.length === 0) {
        continue;
      }

      item[field] = values.filter((value) => !excludedById.has(value));
      const visibilityClasses = Array.from(
        new Set(removedReferenceIds.map((value) => excludedById.get(value)?.visibilityClass).filter(Boolean))
      );
      entries.push({
        action: "remove_reference",
        layer: "derived_evidence",
        field,
        target_path: `derived_evidence.${field}`,
        visibility_class: visibilityClasses[0] ?? "restricted_internal",
        export_profile: input.exportProfile,
        policy_scope: "profile",
        removed_count: removedReferenceIds.length,
      });
    }
  }

  const redactionApplied = entries.length > 0;
  const redactionBasis = redactionApplied ? "visibility_policy" : null;
  return {
    filteredRecorded,
    filteredDerived,
    redactionRecord: {
      applied: redactionApplied,
      basis: redactionBasis,
      export_profile: input.exportProfile,
      enabled_visibility_classes: Array.from(input.allowedVisibilityClasses),
      tenant_visibility_classes: input.tenantVisibilityClasses ? Array.from(input.tenantVisibilityClasses) : null,
      entries,
    },
    redactionApplied,
    redactedItemCount: entries.length,
    redactionBasis,
  };
}