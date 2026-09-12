import React from 'react';

interface DividerProps {
  className?: string;
  variant?: 'pink-stepped' | 'burgundy-stepped' | 'gold-stepped';
}

export default function SectionDivider({ className = '', variant = 'pink-stepped' }: DividerProps) {
  if (variant === 'burgundy-stepped') {
    return (
      <div className={`w-full py-4 relative overflow-hidden ${className}`}>
        <div className="h-4 bg-[#8F1230] border-y-2 border-[#351027] w-full" />
        <div className="h-2 bg-[#F52F4F] w-full" />
        <div className="h-1.5 bg-[#FECB66] w-full" />
      </div>
    );
  }

  if (variant === 'gold-stepped') {
    return (
      <div className={`w-full py-4 relative overflow-hidden ${className}`}>
        <div className="h-3.5 bg-[#FECB66] border-y-2 border-[#351027] w-full" />
        <div className="h-2 bg-[#FF6F89] w-full" />
      </div>
    );
  }

  // Default: pink-stepped
  return (
    <div className={`w-full py-6 relative overflow-hidden ${className}`}>
      <div className="h-3.5 bg-[#F52F4F] border-y-2 border-[#351027] w-full" />
      <div className="h-2 bg-[#FFA3B5] w-full" />
      <div className="h-1.5 bg-[#351027] w-full" />
    </div>
  );
}
