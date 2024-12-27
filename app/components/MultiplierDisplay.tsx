import React from 'react';

interface MultiplierDisplayProps {
  multiplier: number;
  isActive?: boolean;
}

export default function MultiplierDisplay({ multiplier, isActive = true }: MultiplierDisplayProps) {
  return (
    <div className={`
      flex flex-col items-center gap-1
      transition-opacity duration-300
      ${isActive ? 'opacity-100' : 'opacity-50'}
      sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2
      relative mb-4 sm:mb-0
    `}>
      <div className="text-sm sm:text-base text-gray-400">Multiplier</div>
      <div className="text-2xl sm:text-3xl font-black">
        {multiplier.toFixed(2)}×
      </div>
    </div>
  );
} 