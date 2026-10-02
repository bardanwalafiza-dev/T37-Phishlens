import React from 'react';

interface PhishLensLogoProps {
  className?: string;
  size?: number;
}

export const PhishLensLogo: React.FC<PhishLensLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Crimson Lens Gradient Ring */}
        <linearGradient id="lensRing" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e11d48" />
          <stop offset="0.5" stopColor="#dc2626" />
          <stop offset="1" stopColor="#991b1b" />
        </linearGradient>

        {/* Optical Glass Glow */}
        <radialGradient id="glassGlow" cx="19" cy="19" r="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#fff1f2" />
          <stop offset="1" stopColor="#ffe4e6" />
        </radialGradient>

        {/* Handle Gradient */}
        <linearGradient id="handleGrad" x1="28" y1="28" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e11d48" />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
      </defs>

      {/* Magnifying Lens Handle with Grip Details */}
      <path
        d="M30 30L42 42"
        stroke="url(#handleGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 34L40 40"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Outer Lens Crimson Ring with Shadow */}
      <circle
        cx="19"
        cy="19"
        r="15.5"
        fill="url(#glassGlow)"
        stroke="url(#lensRing)"
        strokeWidth="3.5"
      />

      {/* QR Code Matrix Embedded Inside the Lens Glass */}
      <g fill="#be123c">
        {/* Top-Left QR Finder Pattern */}
        <rect x="9" y="9" width="7" height="7" rx="1.5" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <rect x="11" y="11" width="3" height="3" rx="0.5" fill="#e11d48" />

        {/* Top-Right QR Finder Pattern */}
        <rect x="22" y="9" width="7" height="7" rx="1.5" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <rect x="24" y="11" width="3" height="3" rx="0.5" fill="#e11d48" />

        {/* Bottom-Left QR Finder Pattern */}
        <rect x="9" y="22" width="7" height="7" rx="1.5" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <rect x="11" y="24" width="3" height="3" rx="0.5" fill="#e11d48" />

        {/* Center & Accent QR Data Bits */}
        <rect x="18" y="10" width="2" height="2" rx="0.5" />
        <rect x="18" y="14" width="2" height="2" rx="0.5" />
        <rect x="10" y="18" width="2" height="2" rx="0.5" />
        <rect x="14" y="18" width="2" height="2" rx="0.5" />
        <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#991b1b" />
        <rect x="23" y="18" width="2" height="2" rx="0.5" />
        <rect x="26" y="18" width="2" height="2" rx="0.5" />
        <rect x="18" y="23" width="2" height="2" rx="0.5" />
        <rect x="22" y="23" width="2" height="2" rx="0.5" />
        <rect x="25" y="25" width="3" height="3" rx="0.5" />
      </g>

      {/* Lens Reflection / Glass Specular Arc */}
      <path
        d="M9 13C10.5 8.5 15 5.5 19.5 5.5"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};
