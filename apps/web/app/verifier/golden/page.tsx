"use client";

import React from "react";
import Link from "next/link";
import { UstaPDemoTrigger } from "../UstaPDemoTrigger";

/**
 * Golden is not a separate product; it is the canonical quality bar for the verifier.
 * This page is a doctrine-consistent support surface: reference and entry to the main verifier.
 */
export default function VerifierGoldenPage() {
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
          verifier is measured. Use the verifier for event selection, evidence layers, verification
          trace, and artifact issuance.
        </p>
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
