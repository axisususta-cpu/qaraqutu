import React from "react";

interface LogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function QaraqutuLogo({ size = 48, animated = false, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glow filter */}
      <defs>
        <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>

      {/* Box bottom face */}
      <path
        d="M8 28 L24 36 L40 28 L24 20 Z"
        fill="#111111"
        stroke="#F97316"
        strokeWidth="0.5"
        opacity="0.9"
      />
      {/* Box left face */}
      <path
        d="M8 14 L8 28 L24 36 L24 22 Z"
        fill="#1a1a1a"
        stroke="#F97316"
        strokeWidth="0.5"
      />
      {/* Box right face */}
      <path
        d="M40 14 L40 28 L24 36 L24 22 Z"
        fill="#0d0d0d"
        stroke="#F97316"
        strokeWidth="0.5"
      />
      {/* Box top face */}
      <path
        d="M8 14 L24 6 L40 14 L24 22 Z"
        fill="url(#boxGrad)"
        filter="url(#orangeGlow)"
      />

      {/* Q letter highlight */}
      <path
        d="M20 13 A5 5 0 1 0 20 21"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line x1="24" y1="20" x2="27" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />

      {/* Orange edge lines */}
      <line x1="24" y1="6" x2="24" y2="22" stroke="#F97316" strokeWidth="1" opacity="0.6" />
      <line x1="8" y1="14" x2="8" y2="28" stroke="#F97316" strokeWidth="1" opacity="0.4" />
      <line x1="40" y1="14" x2="40" y2="28" stroke="#F97316" strokeWidth="1" opacity="0.4" />

      {/* Corner dots */}
      <circle cx="8" cy="14" r="1.5" fill="#F97316" />
      <circle cx="40" cy="14" r="1.5" fill="#F97316" />
      <circle cx="24" cy="6" r="2" fill="#F97316" />
      <circle cx="24" cy="36" r="1.5" fill="#F97316" opacity="0.6" />
    </svg>
  );
}

export function LogoFull({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <QaraqutuLogo size={40} />
      <div className="flex flex-col leading-none">
        <span
          className="tracking-widest uppercase"
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: dark ? "#ffffff" : "#0a0a0a",
          }}
        >
          QARA<span style={{ color: "#F97316" }}>QUTU</span>
        </span>
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 400,
            letterSpacing: "0.3em",
            color: "#F97316",
            textTransform: "uppercase",
          }}
        >
          Verify · Authenticate
        </span>
      </div>
    </div>
  );
}
