"use client";


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
  /** Near-black section surfaces. */
  tone?: "default" | "dark";
}

/**
 * Section header grammar — badge → heading → subtitle.
 * Reference-approved pattern. Use sparingly to preserve emphasis.
 */
export function SectionHeader({ badge, heading, accentWord, subtitle, tone = "default" }: SectionHeaderProps) {
  const dark = tone === "dark";
  const headingContent =
    accentWord && heading.includes(accentWord) ? (
      <>
        {heading.split(accentWord)[0]}
        <span style={{ color: "var(--accent)" }}>{accentWord}</span>
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
            background: dark ? "rgba(212,86,26,0.12)" : "var(--chip-bg)",
            border: dark ? "1px solid rgba(212,86,26,0.35)" : `1px solid ${"var(--chip-border)"}`,
            color: dark ? "var(--accent)" : "var(--chip-text)",
            fontSize: "0.72rem",
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
          fontSize: dark ? "1.15rem" : "1.08rem",
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.28,
          color: dark ? "rgba(255,255,255,0.94)" : "var(--text)",
        }}
      >
        {headingContent}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "0.88rem",
            color: dark ? "rgba(255,255,255,0.55)" : "var(--text-soft)",
            lineHeight: 1.58,
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

