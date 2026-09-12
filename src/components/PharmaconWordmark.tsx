import React from 'react';
import BrandWordmark from './BrandWordmark';

interface PharmaconWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PharmaconWordmark({ size = 'md', className = '' }: PharmaconWordmarkProps) {
  return <BrandWordmark size={size} className={className} />;
}
