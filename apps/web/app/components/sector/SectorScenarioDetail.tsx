"use client";

import type { SectorScenario } from "../../../lib/sector-demo-scenarios";
import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";
import { getInstitutionalRole } from "../../../lib/institutional-roles";
import { THEME } from "../../../lib/theme";

const UI = THEME;
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

/**
 * Sector Scenario Detail — full expansion for Docs.
 * Scenario, risk, response, role shell, document family, doctrine-safe output.
 */
export function SectorScenarioDetail({ scenario, lang = "en" }: { scenario: SectorScenario; lang?: "en" | "tr" }) {
  const isTr = lang === "tr";

  const sectorLabel = isTr ? scenario.sectorLabelTr : scenario.sectorLabelEn;
  const scenarioTitle = isTr ? scenario.scenarioTitleTr : scenario.scenarioTitleEn;
  const incident = isTr ? scenario.incidentDescriptionTr : scenario.incidentDescriptionEn;
  const risk = isTr ? scenario.institutionalRiskTr : scenario.institutionalRiskEn;
  const response = isTr ? scenario.qaraqutuResponseTr : scenario.qaraqutuResponseEn;
  const whyInevitable = isTr ? scenario.whyInevitableTr : scenario.whyInevitableEn;

  const familyLabels = scenario.preferredDocumentFamily
    .map((c) => DOCUMENT_FAMILY_MAP.find((d) => d.code === c)?.labelEn ?? c)
    .join(", ");

  const roleLabels = scenario.roleShellAlignment
    .map((id) => getInstitutionalRole(id)?.labelEn ?? id)
    .join(", ");

  return (
    <div
      style={{
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        padding: "1rem 1.2rem",
        background: UI.panel,
        marginBottom: "1rem",
        borderLeft: `4px solid ${UI.accent}`,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: UI.textMuted,
          marginBottom: "0.35rem",
          fontFamily: MONO,
        }}
      >
        {sectorLabel}
      </div>
      <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.6rem", fontWeight: 600 }}>{scenarioTitle}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem" }}>
        <div>
          <span style={{ color: UI.textMuted, fontFamily: MONO, fontSize: "0.7rem" }}>Incident</span>
          <p style={{ margin: "0.2rem 0 0", color: UI.textSoft, lineHeight: 1.5 }}>{incident}</p>
        </div>
        <div>
          <span style={{ color: UI.textMuted, fontFamily: MONO, fontSize: "0.7rem" }}>Institutional risk</span>
          <p style={{ margin: "0.2rem 0 0", color: UI.textSoft, lineHeight: 1.5 }}>{risk}</p>
        </div>
        <div>
          <span style={{ color: UI.textMuted, fontFamily: MONO, fontSize: "0.7rem" }}>QARAQUTU response</span>
          <p style={{ margin: "0.2rem 0 0", color: UI.text, lineHeight: 1.5 }}>{response}</p>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.35rem",
            paddingTop: "0.5rem",
            borderTop: `1px solid ${UI.borderSoft}`,
          }}
        >
          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: 4,
              background: UI.accentSoft,
              fontSize: "0.7rem",
              fontFamily: MONO,
              color: UI.text,
            }}
          >
            Doc: {familyLabels}
          </span>
          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: 4,
              border: `1px solid ${UI.border}`,
              fontSize: "0.7rem",
              fontFamily: MONO,
              color: UI.textSoft,
            }}
          >
            Role: {roleLabels}
          </span>
        </div>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.75rem",
            color: UI.textMuted,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {whyInevitable}
        </p>
      </div>
    </div>
  );
}
