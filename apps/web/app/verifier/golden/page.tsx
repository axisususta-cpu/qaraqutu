"use client";

import React from "react";
import Link from "next/link";
import { UstaPDemoTrigger } from "../UstaPDemoTrigger";
import {
  CANONICAL_CASES,
  evaluateGoldenAcceptance,
  GOLDEN_ACCEPTANCE_RUBRIC_LABELS,
} from "../../../lib/canonical-spine";

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
        background: "#020617",
        color: "#E5E7EB",
        padding: "1.5rem 2rem",
      }}
    >
      <UstaPDemoTrigger defaultScenario="unitree" language="tr" emphasizeForDemo />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: "0.25rem",
          }}
        >
          QARAQUTU — Golden
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 600 }}>
          Verifier quality bar
        </h1>
        <p style={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Golden is not a separate product. It is the canonical quality bar against which the main
          verifier is measured. Every case must satisfy the acceptance rubric below.
        </p>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            Golden acceptance rubric (quality gate)
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "0.85rem",
              opacity: 0.9,
              border: "1px solid #1F2937",
              borderRadius: 6,
              overflow: "hidden",
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
          <p style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: "0.5rem" }}>
            Each case in the canonical spine is evaluated against these {rubricTotal} criteria.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
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
            border: "1px solid #1F2937",
            borderRadius: 6,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            opacity: 0.9,
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
              color: "#E5E7EB",
              borderRadius: 4,
              textDecoration: "none",
              fontSize: "0.85rem",
              border: "1px solid #334155",
            }}
          >
            Open Verifier →
          </Link>
        </div>
        <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>
          Usta P (controlled narrative witness guide) is available in the top-right
          guidance.
        </p>
      </div>
    </div>
  );
}
