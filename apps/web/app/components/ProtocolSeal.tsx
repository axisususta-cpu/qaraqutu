"use client";

import Image from "next/image";
import { BRAND_PATHS } from "../../lib/brand";

interface ProtocolSealProps {
  /** Size in px. Default 40. */
  size?: number;
  /** Optional label below seal (e.g. "Verified", "Protocol"). */
  label?: string;
  className?: string;
}

/** Seal/protocol badge — report seal, artifact badge, PDF cover, verification stamp. Trust mark, not primary logo. */
export function ProtocolSeal({ size = 40, label, className }: ProtocolSealProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
      role="img"
      aria-label="QARAQUTU protocol seal"
    >
      <Image
        src={BRAND_PATHS.seal}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
      {label ? (
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7a95b8",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
