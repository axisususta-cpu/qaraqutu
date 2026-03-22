"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND, BRAND_PATHS } from "../../lib/brand";
import { useTheme } from "../../lib/ThemeContext";

interface LogoPrimaryProps {
  href?: string;
  height?: number;
  className?: string;
  /** Orange wordmark on near-black surfaces (e.g. landing header) regardless of theme. */
  variant?: "default" | "onDarkSurface";
}

export function LogoPrimary({ href = "/", height = 28, className, variant = "default" }: LogoPrimaryProps) {
  const { mode } = useTheme();
  // light surface → logo-primary-light (black ink); dark surface → logo-primary-dark (orange)
  const src =
    variant === "onDarkSurface"
      ? BRAND_PATHS.primaryDark
      : mode === "dark"
        ? BRAND_PATHS.primaryDark
        : BRAND_PATHS.primaryLight;

  const img = (
    <Image
      src={src}
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
