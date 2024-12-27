import React, { useState } from 'react';
import soundManager from '../utils/sounds';

interface BettingModalProps {
  maxBet: number;
  onPlaceBet: (amount: number) => void;
  onCancel: () => void;
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export default function BettingModal({ maxBet, onPlaceBet, onCancel }: BettingModalProps) {
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isPlacing, setIsPlacing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlacing) return;

    const amount = parseFloat(betAmount);
    if (amount > 0 && amount <= maxBet) {
      setIsPlacing(true);
      soundManager.play('placeBet');
      setTimeout(() => {
        onPlaceBet(amount);
      }, 100);
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (amount <= maxBet) {
      soundManager.play('buttonClick');
      setBetAmount(amount.toFixed(2));
    }
  };

  const handleCancel = () => {
    soundManager.play('buttonClick');
    onCancel();
  };

  const handleMultiplier = (multiplier: number) => {
    const currentAmount = parseFloat(betAmount);
    if (isNaN(currentAmount)) return;
    
    soundManager.play('buttonClick');
    const newAmount = Math.min(Math.max(currentAmount * multiplier, 1), maxBet);
    setBetAmount(newAmount.toFixed(2));
  };

  const handleMaxBet = () => {
    soundManager.play('buttonClick');
    setBetAmount(maxBet.toFixed(2));
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    // Don't update if empty (to allow clearing the input) or if it's a valid number
    if (value === '' || !isNaN(numericValue)) {
      // Ensure we don't exceed maxBet
      if (numericValue > maxBet) {
        setBetAmount(maxBet.toFixed(2));
      } else if (value.includes('.') && value.split('.')[1]?.length > 2) {
        // If there are more than 2 decimal places, fix to 2
        setBetAmount(numericValue.toFixed(2));
      } else {
        setBetAmount(value);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-50">
      <div className="bg-[#161616] p-8 rounded-lg w-full max-w-md animate-scale-in">
        <h2 className="text-3xl font-black mb-6 text-center">Place Your Bet</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Bet Amount</label>
            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={handleBetAmountChange}
                min="1"
                max={maxBet}
                step="0.01"
                disabled={isPlacing}
                className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-xl font-bold
                  focus:outline-none focus:border-white/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMultiplier(0.5)}
                  disabled={isPlacing}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 
                    transition-colors text-sm font-bold
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={() => handleMultiplier(2)}
                  disabled={isPlacing}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 
                    transition-colors text-sm font-bold
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  2×
                </button>
                <button
                  type="button"
                  onClick={handleMaxBet}
                  disabled={isPlacing}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 
                    transition-colors text-sm font-bold
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                disabled={amount > maxBet || isPlacing}
                className={`
                  px-4 py-2 rounded-lg font-bold
                  transition-all duration-200
                  ${amount > maxBet || isPlacing
                    ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-white/20'
                  }
                `}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPlacing}
              className="flex-1 px-6 py-3 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPlacing}
              className="flex-1 px-6 py-3 rounded-lg font-bold bg-green-500 hover:bg-green-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacing ? 'Starting...' : 'Place Bet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 