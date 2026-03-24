"use client";

import { LogoPrimary } from "./LogoPrimary";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

interface BrandSignatureBandProps {
  mode?: "surface" | "document";
  label?: string;
}

export function BrandSignatureBand({ mode = "surface", label }: BrandSignatureBandProps) {
  const compact = mode === "document";
  return (
    <div
      aria-label="QARAQUTU signature band"
      style={{
        borderTop: "1px solid #2b2b2b",
        background: "linear-gradient(180deg, #171717 0%, #111111 100%)",
        minHeight: compact ? 34 : 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.65rem",
        padding: compact ? "0.3rem 0.75rem" : "0.38rem 0.95rem",
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: compact ? "0.54rem" : "0.58rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(236,234,230,0.45)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label ?? "Muhurlenmis dogrulayici cikti"}
      </span>
      <span style={{ display: "inline-flex", opacity: compact ? 0.74 : 0.8, flexShrink: 0 }}>
        <LogoPrimary href={undefined} height={compact ? 13 : 15} variant="onDarkSurface" />
      </span>
    </div>
  );
}
