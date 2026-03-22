"use client";

import { usePathname } from "next/navigation";
import { LogoPrimary } from "./LogoPrimary";
import { webBuildMeta } from "../build-meta";
import { FooterDoctrine } from "./FooterDoctrine";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

/**
 * Doctrine strip + build footer omitted on verifier; inspection station uses its own doctrine surfaces.
 */
export function ConditionalSiteFooter() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/verifier")) return null;

  const gitCommitSha = webBuildMeta.commitSha;
  const shortSha = gitCommitSha === "unknown" ? "unknown" : gitCommitSha.slice(0, 7);

  return (
    <>
      <FooterDoctrine />
      <footer
        style={{
          padding: "0.55rem 2rem 0.85rem",
          fontSize: "0.66rem",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.6rem",
          letterSpacing: "0.05em",
          borderTop: "1px solid var(--border-soft)",
          background: "var(--panel)",
        }}
      >
        <LogoPrimary href="/" height={18} />
        <span
          style={{ fontFamily: MONO }}
          title={`${webBuildMeta.app} @ ${gitCommitSha} · ${webBuildMeta.buildTime}`}
        >
          {webBuildMeta.app} @ {shortSha} · {webBuildMeta.buildTime}
        </span>
      </footer>
    </>
  );
}
