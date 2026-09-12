import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'wink' | 'sparkle' | 'smart';
  sparkles?: boolean;
}

export default function MedicinePillMascot({
  className = '',
  size = 48,
  mood = 'happy',
  sparkles = false,
}: MascotProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform -rotate-12 transition-transform duration-300 hover:rotate-6"
      >
        <defs>
          {/* Subtle shadow */}
          <filter id="pillShadow" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#351027" />
          </filter>
        </defs>

        {/* Outer Pill Capsule with thick dark border */}
        <g filter="url(#pillShadow)">
          {/* Main Pill Outline */}
          <rect
            x="20"
            y="12"
            width="60"
            height="76"
            rx="30"
            fill="#FFFFFF"
            stroke="#351027"
            strokeWidth="5"
          />

          {/* Top Half (Pink/Red) */}
          <path
            d="M20 42 C20 25.4315 33.4315 12 50 12 C66.5685 12 80 25.4315 80 42 L80 50 L20 50 Z"
            fill="#F52F4F"
            stroke="#351027"
            strokeWidth="5"
          />

          {/* Bottom Half (Cream/White) */}
          <path
            d="M20 50 L80 50 L80 58 C80 74.5685 66.5685 88 50 88 C33.4315 88 20 74.5685 20 58 Z"
            fill="#FFF8E8"
          />

          {/* Dividing Center Line */}
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            stroke="#351027"
            strokeWidth="5"
          />

          {/* Gloss / Shine Highlight */}
          <path
            d="M32 20 C32 20 30 28 30 36"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="32" cy="42" r="2" fill="#FFFFFF" opacity="0.85" />

          {/* Cute Friendly Face */}
          {mood === 'happy' && (
            <>
              {/* Left Eye */}
              <circle cx="42" cy="58" r="3.5" fill="#351027" />
              {/* Right Eye */}
              <circle cx="58" cy="58" r="3.5" fill="#351027" />
              {/* Rosy Cheeks */}
              <circle cx="36" cy="62" r="2.5" fill="#FFA3B5" opacity="0.8" />
              <circle cx="64" cy="62" r="2.5" fill="#FFA3B5" opacity="0.8" />
              {/* Smile */}
              <path
                d="M46 64 Q50 68 54 64"
                stroke="#351027"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {mood === 'wink' && (
            <>
              {/* Winking Left Eye */}
              <path
                d="M39 58 Q42 55 45 58"
                stroke="#351027"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right Eye */}
              <circle cx="58" cy="58" r="3.5" fill="#351027" />
              {/* Smile */}
              <path
                d="M46 64 Q50 69 54 64"
                stroke="#351027"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {mood === 'smart' && (
            <>
              {/* Glasses Frame */}
              <circle cx="42" cy="58" r="6" stroke="#351027" strokeWidth="2.5" fill="none" />
              <circle cx="58" cy="58" r="6" stroke="#351027" strokeWidth="2.5" fill="none" />
              <line x1="48" y1="58" x2="52" y2="58" stroke="#351027" strokeWidth="2.5" />
              {/* Eyes */}
              <circle cx="42" cy="58" r="2.5" fill="#351027" />
              <circle cx="58" cy="58" r="2.5" fill="#351027" />
              {/* Confident Smirk */}
              <path
                d="M47 66 Q52 69 55 65"
                stroke="#351027"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Mini Medical Cross on top half */}
          <rect x="47" y="24" width="6" height="14" rx="2" fill="#FFFFFF" />
          <rect x="43" y="28" width="14" height="6" rx="2" fill="#FFFFFF" />
        </g>

        {/* 4 Sparkle Stars if enabled */}
        {sparkles && (
          <g className="animate-pulse">
            <path d="M12 18 L14 24 L20 26 L14 28 L12 34 L10 28 L4 26 L10 24 Z" fill="#FECB66" stroke="#351027" strokeWidth="1.5" />
            <path d="M85 14 L87 19 L92 20 L87 22 L85 27 L83 22 L78 20 L83 19 Z" fill="#97D8C4" stroke="#351027" strokeWidth="1.5" />
            <path d="M88 68 L89 72 L93 73 L89 74 L88 78 L87 74 L83 73 L87 72 Z" fill="#FECB66" stroke="#351027" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
