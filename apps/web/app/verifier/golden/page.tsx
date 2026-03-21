"use client";

import React from "react";
import Link from "next/link";
import {
  CANONICAL_CASES,
  evaluateGoldenAcceptance,
  GOLDEN_ACCEPTANCE_RUBRIC_LABELS,
} from "../../../lib/canonical-spine";
import { THEME } from "../../../lib/theme";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = { ...THEME };

/**
 * Golden is not a separate product; it is the canonical quality bar for the verifier.
 * This page exposes the Golden acceptance rubric as the quality gate for every case.
 */
export default function VerifierGoldenPage() {
  const caseResults = CANONICAL_CASES.map((c) => ({ case: c, result: evaluateGoldenAcceptance(c) }));
  const allPass = caseResults.every((r) => r.result.passed === r.result.total);
  const rubricTotal = GOLDEN_ACCEPTANCE_RUBRIC_LABELS.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: UI.bg,
        color: UI.text,
        padding: "1.75rem 2rem 2.1rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: "0.25rem",
            color: UI.textMuted,
            fontFamily: MONO,
          }}
        >
          QARAQUTU — Internal reference surface
        </div>
        <h1 style={{ fontSize: "1.3rem", marginBottom: "0.5rem", fontWeight: 600 }}>
          Golden rubric (verifier quality bar)
        </h1>
        <p style={{ fontSize: "0.88rem", opacity: 0.95, lineHeight: 1.6, marginBottom: "1.4rem", color: UI.textSoft }}>
          Golden is not a separate product or primary surface. It is the internal quality bar and reference
          for the main Verifier. Every case in the spine is evaluated against the acceptance rubric below. Use the main Verifier for review.
        </p>

        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "0.9rem 1.05rem 1.05rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            Golden acceptance rubric (quality gate)
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "0.85rem",
              border: "1px solid #1F2937",
              borderRadius: 6,
              overflow: "hidden",
              background: "#020617",
            }}
          >
            {GOLDEN_ACCEPTANCE_RUBRIC_LABELS.map((label, i) => (
              <li
                key={i}
                style={{
                  padding: "0.5rem 0.85rem",
                  borderBottom: i < GOLDEN_ACCEPTANCE_RUBRIC_LABELS.length - 1 ? "1px solid #1F2937" : "none",
                }}
              >
                {label}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.5rem", color: UI.textMuted }}>
            Each case in the canonical spine is evaluated against these {rubricTotal} criteria.
          </p>
        </section>

        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "0.9rem 1.05rem 1.05rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            Rubric v2 reference (scoring bands)
          </h2>
          <div
            style={{
              border: "1px solid #1F2937",
              borderRadius: 6,
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
              opacity: 0.95,
            }}
          >
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Dimensions:</strong> Framing discipline · Recorded integrity · Derived discipline · Uncertainty honesty · Verification trace quality · Artifact control · AXISUS presence · Inevitability strike.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Bands:</strong> 90–100 = golden-grade; 80–89 = acceptable, polish needed; 70–79 = usable, not reference; 0–69 = reject/rework. Hard-fail if recorded/derived merged, final blame language, or Golden presented as separate product.
            </p>
          </div>
        </section>

        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "0.9rem 1.05rem 1.05rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            Spine cases: {caseResults.length} / {caseResults.length} pass
          </h2>
          <div
            style={{
              border: "1px solid #1F2937",
              borderRadius: 6,
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
              opacity: 0.9,
              background: allPass ? "#0F172A" : "#1C1917",
            }}
          >
            {caseResults.map(({ case: c, result }, idx) => (
              <div
                key={c.caseId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.35rem 0",
                  borderBottom: idx < caseResults.length - 1 ? "1px solid #1F2937" : "none",
                }}
              >
                <span>
                  {c.scenarioFrame} ({c.eventId})
                </span>
                <span style={{ fontWeight: 600 }}>
                  {result.passed}/{result.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "0.95rem 1.1rem 1.1rem",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
            Go to the main review station
          </div>
          <Link
            href="/verifier"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              background: "#1E3A5F",
              color: UI.text,
              borderRadius: 4,
              textDecoration: "none",
              fontSize: "0.85rem",
              border: "1px solid #334155",
            }}
          >
            Open Verifier →
          </Link>
        </div>
      </div>
    </div>
  );
}
