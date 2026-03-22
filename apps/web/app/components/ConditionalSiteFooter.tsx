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
          padding: "0.75rem 2rem 1.1rem",
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.6rem",
          letterSpacing: "0.05em",
          borderTop: "1px solid #1a1a18",
          background: "#070706",
        }}
      >
        <LogoPrimary href="/" height={20} variant="onDarkSurface" />
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
