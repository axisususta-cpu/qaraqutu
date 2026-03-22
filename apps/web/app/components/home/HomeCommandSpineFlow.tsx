"use client";

import { Fragment } from "react";
import type { Lang } from "../../../lib/i18n/messages";
import { MSG } from "../../../lib/i18n/messages";
import { SectionHeader } from "../ui/SectionHeader";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const NODE_KEYS = [
  { label: "homeFlowNodeSystem" as const, blurb: "homeFlowNodeSystemBlurb" as const },
  { label: "homeFlowNodeScenario" as const, blurb: "homeFlowNodeScenarioBlurb" as const },
  { label: "homeFlowNodeEvent" as const, blurb: "homeFlowNodeEventBlurb" as const },
  { label: "homeFlowNodeInspection" as const, blurb: "homeFlowNodeInspectionBlurb" as const },
];

export function HomeCommandSpineFlow({ lang }: { lang: Lang }) {
  const m = MSG[lang];
  return (
    <section
      style={{
        borderRadius: 12,
        border: "1px solid var(--border-strong)",
        background: "var(--panel-raised)",
        padding: "1.25rem 1.35rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <SectionHeader badge={m.homeFlowBandBadge} heading={m.homeFlowBandTitle} />
      <p
        style={{
          margin: "0 0 1.1rem",
          fontSize: "0.88rem",
          lineHeight: 1.55,
          color: "var(--text-soft)",
          maxWidth: 900,
          fontFamily: SANS,
        }}
      >
        {m.homeFlowBandLead}
      </p>
      <div
        className="home-command-spine-flow"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: "0.5rem 0.35rem",
        }}
      >
        {NODE_KEYS.map((node, i) => (
          <Fragment key={node.label}>
            <div
              style={{
                flex: "1 1 148px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--panel)",
                padding: "0.75rem 0.85rem",
                minWidth: 0,
                borderTop: i === NODE_KEYS.length - 1 ? "3px solid var(--accent)" : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  marginBottom: "0.4rem",
                  letterSpacing: "0.06em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "0.35rem",
                  letterSpacing: "0.02em",
                }}
              >
                {m[node.label]}
              </div>
              <p style={{ margin: 0, fontSize: "0.74rem", lineHeight: 1.45, color: "var(--text-muted)", fontFamily: SANS }}>
                {m[node.blurb]}
              </p>
            </div>
            {i < NODE_KEYS.length - 1 ? (
              <div
                className="home-command-spine-arrow"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontFamily: MONO,
                  fontSize: "1rem",
                  fontWeight: 600,
                  flex: "0 0 auto",
                  alignSelf: "center",
                  padding: "0 0.2rem",
                }}
                aria-hidden
              >
                →
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
