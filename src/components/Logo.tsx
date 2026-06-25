import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "h-12 w-12", showText = true }: LogoProps) {
  return (
    <div className={`inline-block select-none ${className}`} id="brand-logo-container">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White background and blue squircle border matching the photo */}
        <rect
          x="18"
          y="18"
          width="364"
          height="364"
          rx="75"
          fill="#FFFFFF"
          stroke="#003580"
          strokeWidth="16"
        />

        {/* --- STYLIZED RED BULL HEAD --- */}
        {/* Beautiful symmetrical bull head with horns and ears matching the image */}
        <g id="bull-head" fill="#DC2626">
          {/* Main Head Base */}
          <path d="M165 110 C165 85, 235 85, 235 110 C235 132, 165 132, 165 110 Z" />
          <path d="M161 106 L175 160 L225 160 L239 106 Z" />
          <path d="M175 158 L200 190 L225 158 Z" />
          {/* Horns curving upwards and outwards */}
          <path d="M168 116 C140 100, 115 70, 132 50 C138 45, 148 55, 148 65 C148 85, 160 100, 172 108 Z" />
          <path d="M232 116 C260 100, 285 70, 268 50 C262 45, 252 55, 252 65 C252 85, 240 100, 228 108 Z" />
          {/* Snout Details */}
          <path d="M190 180 Q200 184 210 180 L200 188 Z" fill="#FFFFFF" opacity="0.4" />
        </g>

        {/* --- STYLIZED LETTERS b & d --- */}
        {/* Stylized lowercase b (Red) */}
        <g id="letter-b">
          {/* Bowl and stem of 'b' in solid red */}
          <path
            d="M 124 150 
               L 124 250 
               A 42 42 0 0 0 208 250 
               A 42 42 0 0 0 124 150 Z"
            fill="#DC2626"
            fillRule="evenodd"
          />
          {/* Pure white inner cutout for the letter 'b' bowl */}
          <circle cx="166" cy="208" r="22" fill="#FFFFFF" />
        </g>

        {/* Stylized lowercase d (Dark Blue) */}
        <g id="letter-d">
          {/* Bowl and stem of 'd' in solid dark blue */}
          <path
            d="M 276 150 
               L 276 250 
               A 42 42 0 0 1 192 250 
               A 42 42 0 0 1 276 150 Z"
            fill="#003580"
            fillRule="evenodd"
          />
          {/* Pure white inner cutout for the letter 'd' bowl */}
          <circle cx="234" cy="208" r="22" fill="#FFFFFF" />
        </g>

        {/* --- BRAND TYPOGRAPHY --- */}
        {showText && (
          <>
            {/* "BEREKET ET" - Sized and colored precisely */}
            <text
              x="200"
              y="320"
              fill="#DC2626"
              fontSize="34"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="1"
            >
              BEREKET ET
            </text>

            {/* "DÜNYASI" - Sized and colored precisely */}
            <text
              x="200"
              y="360"
              fill="#003580"
              fontSize="36"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="2"
            >
              DÜNYASI
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
