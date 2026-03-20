"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND, BRAND_PATHS } from "../../lib/brand";

interface LogoIconProps {
  href?: string;
  size?: number;
  className?: string;
}

/** Compact square/icon mark — favicon, app icon, small avatar, utility. */
export function LogoIcon({ href = "/", size = 24, className }: LogoIconProps) {
  const img = (
    <Image
      src={BRAND_PATHS.iconMark}
      alt={BRAND.name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={className}
    />
  );

  if (href) {
    return (
      <Link href={href} style={{ display: "inline-flex" }} aria-label={`${BRAND.name} home`}>
        {img}
      </Link>
    );
  }
  return <span style={{ display: "inline-flex" }}>{img}</span>;
}
