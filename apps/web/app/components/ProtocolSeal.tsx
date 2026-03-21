"use client";

import Image from "next/image";
import { BRAND_PATHS } from "../../lib/brand";
import { useTheme } from "../../lib/ThemeContext";

interface ProtocolSealProps {
  size?: number;
  label?: string;
  className?: string;
}

/** Seal/protocol badge — report seal, artifact badge, PDF cover, verification stamp. Trust mark, not primary logo. */
export function ProtocolSeal({ size = 40, label, className }: ProtocolSealProps) {
  const { mode } = useTheme();
  // light surface → seal-light (black/orange/gray on white); dark surface → seal-dark (white/black on dark)
  const src = mode === "dark" ? BRAND_PATHS.sealDark : BRAND_PATHS.sealLight;

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
        src={src}
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
            color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
