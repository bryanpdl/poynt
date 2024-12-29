'use client';
import { ChevronDown, ChevronUp, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import soundManager from '../utils/sounds';
import { useUser } from '../contexts/UserContext';
import { updateLastTopUp } from '../utils/firebase';

interface WalletDisplayProps {
  balance: number;
  currentBet?: number;
  potentialWin?: number;
}

const TOP_UP_AMOUNT = 10000;
const COOLDOWN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default function WalletDisplay({ 
  balance, 
  currentBet, 
  potentialWin,
}: WalletDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { user, userData, setUserData } = useUser();

  // Calculate time left in cooldown
  useEffect(() => {
    if (!userData?.lastTopUp) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const lastTopUpDate = userData.lastTopUp;
      if (!lastTopUpDate) return;
      
      const lastTopUpTime = new Date(lastTopUpDate).getTime();
      const timeSinceLastTopUp = now - lastTopUpTime;
      
      if (timeSinceLastTopUp < COOLDOWN_DURATION) {
        setTimeLeft(COOLDOWN_DURATION - timeSinceLastTopUp);
      } else {
        setTimeLeft(null);
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userData?.lastTopUp]);

  const handleTopUp = async () => {
    if (!user || !userData || timeLeft !== null) return;

    soundManager.play('buttonClick');
    
    try {
      // Update in Firebase first
      await updateLastTopUp(user.uid);
      
      // Then update local state with the exact same timestamp
      const now = new Date();
      setUserData({
        ...userData,
        wallet: userData.wallet + TOP_UP_AMOUNT,
        lastTopUp: now
      });
      
      // Close dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Error claiming top-up:', error);
    }
  };

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/5 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 hover:bg-white/10 transition-colors text-xs sm:text-base"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          <div className="font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          {currentBet !== undefined && (
            <div className="text-[10px] sm:text-sm text-white/50">
              (-${currentBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </div>
          )}
          {potentialWin !== undefined && (
            <div className="text-[10px] sm:text-sm text-green-500">
              (+${potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </div>
          )}
        </div>
        <div className="ml-0.5 sm:ml-2">
          {isOpen ? (
            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Top Up Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 sm:mt-2 w-full bg-[#161616] border border-white/10 rounded-lg overflow-hidden shadow-xl animate-fade-in z-50">
          <div className="p-1.5 sm:p-2 border-b border-white/10">
            <div className="text-[10px] sm:text-sm text-gray-400">Free Top Up</div>
          </div>
          <div className="p-2">
            <button
              onClick={handleTopUp}
              disabled={timeLeft !== null}
              className={`
                w-full px-4 py-2 rounded
                text-sm font-medium
                transition-colors
                ${timeLeft === null
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white/5 text-white/50 cursor-not-allowed'
                }
              `}
            >
              {timeLeft === null ? (
                `Claim $${TOP_UP_AMOUNT.toLocaleString()}`
              ) : (
                `Available in ${formatTimeLeft(timeLeft)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 