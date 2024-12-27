import React from 'react';

interface CashoutButtonProps {
  onCashout: () => void;
  amount: number;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function CashoutButton({ onCashout, amount, disabled, isLoading }: CashoutButtonProps) {
  return (
    <button
      onClick={onCashout}
      disabled={disabled || isLoading}
      className={`
        group
        relative
        w-full max-w-md
        px-6 py-4
        rounded-xl
        font-bold text-xl
        transition-all duration-300
        ${disabled || isLoading
          ? 'bg-white/5 text-white/20 cursor-not-allowed' 
          : 'bg-green-500 hover:bg-green-600 hover:scale-105'
        }
      `}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm opacity-80">
          {isLoading ? 'Cashing Out...' : 'Cash Out'}
        </span>
        <span className="text-2xl font-black">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </button>
  );
} 