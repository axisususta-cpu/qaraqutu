"use client";

import type { ReactNode } from "react";

const MONO = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace";

export function FooterBottomRow({ extraRight }: { extraRight?: ReactNode }) {
  const yearNode = (
    <span style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.32)" }}>© 2026</span>
  );

  return (
    <div style={{ marginTop: "2rem", paddingTop: "1.1rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <span style={{ fontFamily: MONO, fontSize: "0.56rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.32)" }}>QARAQUTU by AxisUS</span>
      <a
        href="https://www.behance.net/sekare"
        target="_blank"
        rel="noreferrer noopener"
        style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.38)", textDecoration: "none", letterSpacing: "0.06em" }}
      >
        idemitus by Serhat Kadir KARATAŞ
      </a>
      {extraRight ? (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", minWidth: 0 }}>
          {yearNode}
          {extraRight}
        </div>
      ) : yearNode}
    </div>
  );
}