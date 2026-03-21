"use client";

import { getAllSectorScenarios } from "../../../lib/sector-demo-scenarios";
import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";

const MONO = "'JetBrains Mono', 'Fira Code', monospace";

/**
 * Sector Demo Scenarios — compact cards for Home.
 * Institutional, protocol-grade. One glance: why each sector needs QARAQUTU.
 */
export function SectorScenarioCards() {
  const scenarios = getAllSectorScenarios();

  return (
    <div
      className="home-sector-scenarios-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.75rem",
      }}
    >
      {scenarios.map((s) => {
        const primaryFamily = s.preferredDocumentFamily[0];
        const familyMeta = DOCUMENT_FAMILY_MAP.find((d) => d.code === primaryFamily);
        const familyLabel = familyMeta?.labelEn ?? primaryFamily;

        return (
          <div
            key={s.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.75rem 0.9rem",
              background: "var(--panel)",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "0.35rem",
                fontFamily: MONO,
              }}
            >
              {s.sectorLabelEn}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "0.4rem",
              }}
            >
              {s.scenarioTitleEn}
            </div>
            <p
              style={{
                fontSize: "0.74rem",
                color: "var(--text-soft)",
                lineHeight: 1.45,
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              {s.whyItMattersEn}
            </p>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                fontFamily: MONO,
              }}
            >
              → {familyLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

