"use client";

import type { Lang } from "../../../lib/i18n/messages";
import { MSG } from "../../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function HomeRoleInstitutionGrid({ lang }: { lang: Lang }) {
  const m = MSG[lang];
  const tiles = [
    { title: m.homeRoleInsuranceTitle, body: m.homeRoleInsuranceBody },
    { title: m.homeRoleLegalTitle, body: m.homeRoleLegalBody },
    { title: m.homeRoleMuniTitle, body: m.homeRoleMuniBody },
    { title: m.homeRoleFieldTitle, body: m.homeRoleFieldBody },
    { title: m.homeRoleTechnicalTitle, body: m.homeRoleTechnicalBody },
    { title: m.homeRoleOversightTitle, body: m.homeRoleOversightBody },
  ];
  return (
    <div>
      <p
        style={{
          margin: "0 0 1rem",
          fontSize: "0.84rem",
          lineHeight: 1.55,
          color: "var(--text-soft)",
          maxWidth: 820,
        }}
      >
        {m.homeRoleGridSubtitle}
      </p>
      <div
        className="home-role-institution-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.75rem",
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.title}
            style={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-card)",
              padding: "0.75rem 0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>
              {t.title}
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.5, color: "var(--text-soft)", fontFamily: SANS }}>
              {t.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
