"use client";

import type { SectorScenario } from "../../../lib/sector-demo-scenarios";
import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";
import { getInstitutionalRole } from "../../../lib/institutional-roles";

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
    .map((c) => {
      const family = DOCUMENT_FAMILY_MAP.find((d) => d.code === c);
      return isTr ? (family?.labelTr ?? c) : (family?.labelEn ?? c);
    })
    .join(", ");

  const roleLabels = scenario.roleShellAlignment
    .map((id) => {
      const role = getInstitutionalRole(id);
      return isTr ? (role?.labelTr ?? id) : (role?.labelEn ?? id);
    })
    .join(", ");

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1rem 1.2rem",
        background: "var(--panel)",
        marginBottom: "1rem",
        borderLeft: `4px solid ${"var(--accent)"}`,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.35rem",
          fontFamily: MONO,
        }}
      >
        {sectorLabel}
      </div>
      <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.6rem", fontWeight: 600 }}>{scenarioTitle}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem" }}>
        <div>
          <span style={{ color: "var(--text-muted)", fontFamily: MONO, fontSize: "0.7rem" }}>{isTr ? "Olay" : "Incident"}</span>
          <p style={{ margin: "0.2rem 0 0", color: "var(--text-soft)", lineHeight: 1.5 }}>{incident}</p>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", fontFamily: MONO, fontSize: "0.7rem" }}>{isTr ? "Kurumsal risk" : "Institutional risk"}</span>
          <p style={{ margin: "0.2rem 0 0", color: "var(--text-soft)", lineHeight: 1.5 }}>{risk}</p>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", fontFamily: MONO, fontSize: "0.7rem" }}>{isTr ? "QARAQUTU yanıtı" : "QARAQUTU response"}</span>
          <p style={{ margin: "0.2rem 0 0", color: "var(--text)", lineHeight: 1.5 }}>{response}</p>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.35rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: 4,
              background: "var(--accent-soft)",
              fontSize: "0.7rem",
              fontFamily: MONO,
              color: "var(--text)",
            }}
          >
            {isTr ? "Belge: " : "Doc: "}{familyLabels}
          </span>
          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: 4,
              border: "1px solid var(--border)",
              fontSize: "0.7rem",
              fontFamily: MONO,
              color: "var(--text-soft)",
            }}
          >
            {isTr ? "Rol: " : "Role: "}{roleLabels}
          </span>
        </div>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
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

