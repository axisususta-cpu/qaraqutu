"use client";

import { THEME } from "../../../lib/theme";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export interface SectionHeaderProps {
  /** Small badge label — protocol-grade, uppercase. */
  badge?: string;
  /** Main heading text. */
  heading: string;
  /** Optional word to accent within heading. */
  accentWord?: string;
  /** Restrained subtitle. */
  subtitle?: string;
}

/**
 * Section header grammar — badge → heading → subtitle.
 * Reference-approved pattern. Use sparingly to preserve emphasis.
 */
export function SectionHeader({ badge, heading, accentWord, subtitle }: SectionHeaderProps) {
  const headingContent =
    accentWord && heading.includes(accentWord) ? (
      <>
        {heading.split(accentWord)[0]}
        <span style={{ color: THEME.accent }}>{accentWord}</span>
        {heading.split(accentWord)[1]}
      </>
    ) : (
      heading
    );

  return (
    <div style={{ marginBottom: "1rem" }}>
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.25rem 0.6rem",
            borderRadius: 999,
            marginBottom: "0.5rem",
            background: THEME.chipBg,
            border: `1px solid ${THEME.chipBorder}`,
            color: THEME.chipText,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: MONO,
          }}
        >
          {badge}
        </div>
      )}
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.3,
          color: THEME.text,
        }}
      >
        {headingContent}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "0.85rem",
            color: THEME.textSoft,
            lineHeight: 1.55,
            marginTop: "0.4rem",
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
