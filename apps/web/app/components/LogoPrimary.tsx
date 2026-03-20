"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND, BRAND_PATHS } from "../../lib/brand";

interface LogoPrimaryProps {
  /** Link target; omit for non-link usage (e.g. footer). */
  href?: string;
  /** Height in px. Default 28. */
  height?: number;
  className?: string;
}

export function LogoPrimary({ href = "/", height = 28, className }: LogoPrimaryProps) {
  const img = (
    <Image
      src={BRAND_PATHS.primaryLogo}
      alt={BRAND.name}
      width={Math.round(height * 5.625)}
      height={height}
      priority
      style={{ height, width: "auto" }}
      className={className}
    />
  );

  if (href) {
    return (
      <Link href={href} style={{ display: "inline-flex", alignItems: "center" }} aria-label={`${BRAND.name} home`}>
        {img}
      </Link>
    );
  }
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{img}</span>;
}
