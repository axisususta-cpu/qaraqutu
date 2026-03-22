"use client";

import type { Lang } from "../../../lib/i18n/messages";
import { MSG } from "../../../lib/i18n/messages";

export function VerticalsDiagram({ lang }: { lang: Lang }) {
  const m = MSG[lang];
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1.15rem 1.35rem",
        background: "var(--panel)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.85rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {m.homeVerticalsDiagramTitle}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.9rem",
        }}
      >
        {[
          { id: "vehicle", label: lang === "tr" ? "Araç" : "Vehicle", trace: "Event → Bundle → Manifest" },
          { id: "drone", label: "Drone", trace: "Mission → Telemetry → Link" },
          { id: "robot", label: lang === "tr" ? "Robot" : "Robot", trace: "Interaction → Safety → Handoff" },
        ].map((v) => (
          <div
            key={v.id}
            style={{
              border: "1px solid var(--border-soft)",
              borderRadius: 6,
              padding: "0.65rem 0.85rem",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "0.25rem",
              }}
            >
              {v.label}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {v.trace}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
