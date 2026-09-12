import React from 'react';

interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function BrandWordmark({ size = 'md', className = '' }: BrandWordmarkProps) {
  // Dimension & typography configurations per breakpoint
  const config = {
    sm: {
      fontSize: '32px',
      strokeWidth: '4.5px',
      tracking: '-0.015em',
      letterGap: '0.8px',
      shadowDy: '4.5px',
      shadowDx: '2.2px',
    },
    md: {
      fontSize: 'clamp(42px, 5.8vw, 56px)',
      strokeWidth: '5.5px',
      tracking: '-0.018em',
      letterGap: '1.2px',
      shadowDy: '5.5px',
      shadowDx: '2.5px',
    },
    lg: {
      fontSize: 'clamp(52px, 7.5vw, 76px)',
      strokeWidth: '6.8px',
      tracking: '-0.018em',
      letterGap: '1.8px',
      shadowDy: '7px',
      shadowDx: '3px',
    },
    xl: {
      fontSize: 'clamp(68px, 10vw, 100px)',
      strokeWidth: '8.5px',
      tracking: '-0.02em',
      letterGap: '2.5px',
      shadowDy: '9px',
      shadowDx: '3.5px',
    },
  };

  const current = config[size];

  // Specific color palette from prompt
  const MAROON_BLACK = '#2B0A14'; // Thick dark maroon-black outline & solid molded shadow
  const IVORY_CREAM = '#FAF3E6';  // Cream / ivory fill

  // Subtle hand-placed organic bounce & micro-tilts (letters sit snug and occasionally graze)
  const letters = [
    { char: 'p', dy: 0, rot: -0.6 },
    { char: 'h', dy: -0.8, rot: 0.4 },
    { char: 'a', dy: 0.6, rot: -0.5 },
    { char: 'r', dy: -0.5, rot: 0.6 },
    { char: 'm', dy: 0.3, rot: -0.3 },
    { char: 'a', dy: 0.7, rot: 0.5 },
    { char: 'c', dy: -0.6, rot: -0.6 },
    { char: 'o', dy: 0.4, rot: 0.4 },
    { char: 'n', dy: -0.3, rot: -0.4 },
  ];

  return (
    <div
      className={`inline-flex items-center justify-center select-none transform transition-transform duration-200 hover:scale-[1.015] hover:-translate-y-[1px] ${className}`}
      style={{
        filter: 'drop-shadow(0 2px 2px rgba(43, 10, 20, 0.15))',
      }}
    >
      <div
        className="flex items-center lowercase font-black select-none"
        style={{
          fontFamily: '"Fredoka", "Baloo 2", "Bagel Fat One", cursive, sans-serif',
          fontWeight: 800,
          fontSize: current.fontSize,
          letterSpacing: current.tracking,
          lineHeight: 1,
        }}
      >
        {letters.map((item, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              marginRight: idx < letters.length - 1 ? current.letterGap : '0px',
              transform: `translateY(${item.dy}px) rotate(${item.rot}deg)`,
              color: IVORY_CREAM,
              WebkitTextStroke: `${current.strokeWidth} ${MAROON_BLACK}`,
              paintOrder: 'stroke fill',
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
              // Solid unblurred molded plastic / clay 3D extrusion down-right
              textShadow: `
                1px 1px 0 ${MAROON_BLACK},
                1.5px 2px 0 ${MAROON_BLACK},
                2px 3px 0 ${MAROON_BLACK},
                ${current.shadowDx} ${current.shadowDy} 0 ${MAROON_BLACK}
              `,
            }}
          >
            {item.char}
          </span>
        ))}
      </div>
    </div>
  );
}
