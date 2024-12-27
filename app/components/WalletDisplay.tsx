'use client';
import { ChevronDown, ChevronUp, Coins } from 'lucide-react';
import { useState } from 'react';
import soundManager from '../utils/sounds';

interface WalletDisplayProps {
  balance: number;
  currentBet?: number;
  potentialWin?: number;
  onDeposit?: (amount: number) => void;
}

const DEPOSIT_AMOUNTS = [100, 250, 500, 1000];

export default function WalletDisplay({ 
  balance, 
  currentBet, 
  potentialWin,
  onDeposit 
}: WalletDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeposit = (amount: number) => {
    soundManager.play('buttonClick');
    onDeposit?.(amount);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/5 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 hover:bg-white/10 transition-colors text-xs sm:text-base"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          <div className="font-bold">${balance.toFixed(2)}</div>
          {currentBet !== undefined && (
            <div className="text-[10px] sm:text-sm text-white/50">
              (-${currentBet.toFixed(2)})
            </div>
          )}
          {potentialWin !== undefined && (
            <div className="text-[10px] sm:text-sm text-green-500">
              (+${potentialWin.toFixed(2)})
            </div>
          )}
        </div>
        {onDeposit && (
          <div className="ml-0.5 sm:ml-2">
            {isOpen ? (
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            )}
          </div>
        )}
      </button>

      {/* Deposit Dropdown */}
      {isOpen && onDeposit && (
        <div className="absolute top-full left-0 mt-1 sm:mt-2 w-full bg-[#161616] border border-white/10 rounded-lg overflow-hidden shadow-xl animate-fade-in z-50">
          <div className="p-1.5 sm:p-2 border-b border-white/10">
            <div className="text-[10px] sm:text-sm text-gray-400">Quick Deposit</div>
          </div>
          <div className="p-0.5 sm:p-2 space-y-0.5">
            {DEPOSIT_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => handleDeposit(amount)}
                className="w-full px-2 sm:px-4 py-1 sm:py-2 text-left hover:bg-white/5 rounded transition-colors text-[10px] sm:text-sm"
              >
                ${amount.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 