import type {
  ArtifactDocumentFamily,
  ExportProfileCode,
  PolicyDecisionTrace,
  PolicyOverrideRecord,
  PolicyTraceField,
  PolicyTraceLayer,
} from "../../contracts";
import type { TrustedRoleId } from "../../security";

const ALL_VISIBILITY_CLASSES = [
  "claims_review",
  "legal_review",
  "technical_review",
  "restricted_internal",
];

const DEFAULT_ROLE_OVERRIDES: Record<TrustedRoleId, PolicyOverrideRecord> = {
  insurance: {
    enabled_export_profiles: ["claims"],
    enabled_visibility_classes: ["claims_review"],
  },
  police: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
  adjudication: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
  operator: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "technical_review"],
  },
  expert: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
  manufacturer: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
  software: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
  engineering: {
    enabled_export_profiles: ["legal"],
    enabled_visibility_classes: ["claims_review", "legal_review", "technical_review"],
  },
};

const PROFILE_VISIBILITY_DEFAULTS: Record<ExportProfileCode, string[]> = {
  claims: ["claims_review"],
  legal: ["claims_review", "legal_review", "technical_review"],
};

const OPERATOR_MATRIX_BLOCKING_FAMILIES = new Set<ArtifactDocumentFamily>(["pass_limitation_annex"]);

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const normalized = value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeOverrideRecord(value: unknown): PolicyOverrideRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const normalized: PolicyOverrideRecord = {};

  if (record.enabled_export_profiles !== undefined) {
    normalized.enabled_export_profiles = normalizeStringArray(record.enabled_export_profiles, []);
  }
  if (record.enabled_visibility_classes !== undefined) {
    normalized.enabled_visibility_classes = normalizeStringArray(record.enabled_visibility_classes, []);
  }
  if (record.redaction_enabled !== undefined) {
    normalized.redaction_enabled = normalizeBoolean(record.redaction_enabled, false);
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizeOverrideMap(value: unknown): Record<string, PolicyOverrideRecord> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const map: Record<string, PolicyOverrideRecord> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizeOverrideRecord(raw);
    if (normalized) {
      map[key] = normalized;
    }
  }

  return map;
}

function createFieldTrace<T>(initial: T, layer: PolicyTraceLayer<T>): PolicyTraceField<T> {
  return {
    final_value: initial,
    resolved_from: layer.layer,
    layers: [layer],
  };
}

function applyOverride<T>(
  trace: PolicyTraceField<T>,
  overrideValue: T | undefined,
  layer: PolicyTraceLayer<T>["layer"],
  sourceKey: string
): PolicyTraceField<T> {
  if (overrideValue === undefined) {
    trace.layers.push({ layer, source_key: sourceKey, value: trace.final_value, applied: false });
    return trace;
  }

  trace.final_value = overrideValue;
  trace.resolved_from = layer;
  trace.layers.push({ layer, source_key: sourceKey, value: overrideValue, applied: true });
  return trace;
}

function intersectVisibility(actorVisibility: string[], profileVisibility: string[]): string[] {
  const actor = new Set(actorVisibility);
  return profileVisibility.filter((value) => actor.has(value));
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function resolveRoleOverride(input: {
  trustedRole: TrustedRoleId;
  requestedExportProfile: ExportProfileCode;
  linkedDocumentFamilies?: ArtifactDocumentFamily[];
  roleOverrides: Record<string, PolicyOverrideRecord>;
}): {
  roleOverride: PolicyOverrideRecord | null;
  sourceKey: string;
} {
  const baseOverride = input.roleOverrides[input.trustedRole] ?? null;
  if (input.trustedRole !== "operator") {
    return {
      roleOverride: baseOverride,
      sourceKey: input.trustedRole,
    };
  }

  const linkedFamilies = input.linkedDocumentFamilies ?? [];
  const operatorMatrixAllowed =
    input.requestedExportProfile === "legal" &&
    linkedFamilies.length > 0 &&
    !linkedFamilies.some((family) => OPERATOR_MATRIX_BLOCKING_FAMILIES.has(family));

  if (!operatorMatrixAllowed) {
    return {
      roleOverride: baseOverride,
      sourceKey: input.trustedRole,
    };
  }

  return {
    roleOverride: {
      ...baseOverride,
      enabled_visibility_classes: dedupeStrings([
        ...(baseOverride?.enabled_visibility_classes ?? []),
        "legal_review",
      ]),
    },
    sourceKey: "operator_successful_matrix:no_limitation_annex",
  };
}

export function evaluatePolicy(input: {
  tenantPolicy: any | null;
  trustedRole: TrustedRoleId;
  trustedSubject: string | null;
  requestedExportProfile: ExportProfileCode;
  linkedDocumentFamilies?: ArtifactDocumentFamily[];
}): {
  enabledExportProfiles: string[];
  actorVisibilityClasses: string[];
  effectiveVisibilityClasses: string[];
  redactionEnabled: boolean;
  policyTrace: PolicyDecisionTrace;
} {
  const tenantDefaultProfiles = normalizeStringArray(
    input.tenantPolicy?.enabledExportProfiles,
    ["claims", "legal"]
  );
  const tenantDefaultVisibility = normalizeStringArray(
    input.tenantPolicy?.enabledVisibilityClasses,
    ALL_VISIBILITY_CLASSES
  );
  const tenantDefaultRedaction = normalizeBoolean(input.tenantPolicy?.redactionEnabled, true);

  const roleOverrides = {
    ...DEFAULT_ROLE_OVERRIDES,
    ...normalizeOverrideMap(input.tenantPolicy?.roleOverrides),
  };
  const userOverrides = normalizeOverrideMap(input.tenantPolicy?.userOverrides);
  const { roleOverride, sourceKey: roleOverrideSourceKey } = resolveRoleOverride({
    trustedRole: input.trustedRole,
    requestedExportProfile: input.requestedExportProfile,
    linkedDocumentFamilies: input.linkedDocumentFamilies,
    roleOverrides,
  });
  const userOverride = input.trustedSubject ? userOverrides[input.trustedSubject] ?? null : null;

  const exportProfiles = applyOverride(
    createFieldTrace<string[]>(tenantDefaultProfiles, {
      layer: "tenant_default",
      source_key: "tenant_default",
      value: tenantDefaultProfiles,
      applied: true,
    }),
    roleOverride?.enabled_export_profiles,
    "role_override",
    roleOverrideSourceKey
  );
  applyOverride(exportProfiles, userOverride?.enabled_export_profiles, "user_override", input.trustedSubject ?? "none");

  const actorVisibility = applyOverride(
    createFieldTrace<string[]>(tenantDefaultVisibility, {
      layer: "tenant_default",
      source_key: "tenant_default",
      value: tenantDefaultVisibility,
      applied: true,
    }),
    roleOverride?.enabled_visibility_classes,
    "role_override",
    roleOverrideSourceKey
  );
  applyOverride(actorVisibility, userOverride?.enabled_visibility_classes, "user_override", input.trustedSubject ?? "none");

  const redactionEnabled = applyOverride(
    createFieldTrace<boolean>(tenantDefaultRedaction, {
      layer: "tenant_default",
      source_key: "tenant_default",
      value: tenantDefaultRedaction,
      applied: true,
    }),
    roleOverride?.redaction_enabled,
    "role_override",
    roleOverrideSourceKey
  );
  applyOverride(redactionEnabled, userOverride?.redaction_enabled, "user_override", input.trustedSubject ?? "none");

  const profileVisibility = PROFILE_VISIBILITY_DEFAULTS[input.requestedExportProfile] ?? PROFILE_VISIBILITY_DEFAULTS.claims;
  const effectiveVisibility = intersectVisibility(actorVisibility.final_value, profileVisibility);

  const effectiveVisibilityTrace: PolicyTraceField<string[]> = {
    final_value: effectiveVisibility,
    resolved_from: actorVisibility.resolved_from,
    layers: [
      {
        layer: "profile_default",
        source_key: input.requestedExportProfile,
        value: profileVisibility,
        applied: true,
      },
      ...actorVisibility.layers,
    ],
  };

  return {
    enabledExportProfiles: exportProfiles.final_value,
    actorVisibilityClasses: actorVisibility.final_value,
    effectiveVisibilityClasses: effectiveVisibility,
    redactionEnabled: redactionEnabled.final_value,
    policyTrace: {
      trusted_role: input.trustedRole,
      trusted_subject: input.trustedSubject,
      requested_export_profile: input.requestedExportProfile,
      export_profiles: exportProfiles,
      actor_visibility_classes: actorVisibility,
      effective_visibility_classes: effectiveVisibilityTrace,
      redaction_enabled: redactionEnabled,
    },
  };
}