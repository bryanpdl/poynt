"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Heart, Volume2, VolumeX, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { FaHandPointRight, FaGamepad, FaTrophy } from "react-icons/fa";
import soundManager from "./utils/sounds";
import WalletDisplay from "./components/WalletDisplay";
import MultiplierDisplay from "./components/MultiplierDisplay";
import BettingModal from "./components/BettingModal";
import CashoutButton from "./components/CashoutButton";
import Navigation from './components/Navigation';
import SignInModal from './components/SignInModal';
import { useUser } from './contexts/UserContext';
import { updateUserStats, updateUserWallet, createUserDocument, updateUsername } from './utils/firebase';
import UserAvatar from './components/UserAvatar';

const WIN_MESSAGES = [
  "Nice!",
  "Good guess...",
  "Clever move!",
  "You got it!",
  "Impressive!"
];

const LOSS_MESSAGES = [
  "Oops!",
  "Read your mind!",
  "Got you!",
  "Think different!",
  "Too predictable!"
];

const DirectionIcon = ({ direction }: { direction: string }) => {
  const icons = {
    right: ArrowRight,
    left: ArrowLeft,
    up: ArrowUp,
    down: ArrowDown,
  };
  
  const Icon = icons[direction as keyof typeof icons];
  return <Icon className="w-12 h-12 sm:w-16 sm:h-16 stroke-[3]" />;
};

const InstructionCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="bg-white/5 p-6 rounded-xl flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
      <Icon className="w-8 h-8 text-white/80" />
      <div>
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const { user, userData, setUserData } = useUser();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Show sign in modal if no user is authenticated
  useEffect(() => {
    if (!user && !showSignInModal) {
      setShowSignInModal(true);
    }
  }, [user, showSignInModal]);

  // Fetch user data when user changes
  useEffect(() => {
    if (user && !userData) {
      createUserDocument(user).then((data) => {
        setUserData(data);
        // Show sign in modal again if username is empty
        if (!data.username) {
          setIsNewUser(true);
          setShowSignInModal(true);
        }
      });
    }
  }, [user, userData, setUserData]);

  const handleUsernameSubmit = async (username: string) => {
    if (!user) return;
    
    await updateUsername(user.uid, username);
    // Update local user data with the new username
    if (userData) {
      setUserData({
        ...userData,
        username
      });
    }
    setIsNewUser(false);
    setShowSignInModal(false);
  };

  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [newLife, setNewLife] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Betting State - use userData.wallet instead of local state
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  // Add new state for cashout success
  const [showCashoutSuccess, setShowCashoutSuccess] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState<number>(0);

  // Add state for tracking repeated moves
  const [lastMoves, setLastMoves] = useState<string[]>([]);
  const [isPatternDetected, setIsPatternDetected] = useState(false);

  // Add new state for cashout loading
  const [isCashingOut, setIsCashingOut] = useState(false);

  // Add new state for frozen timer
  const [frozenTimeLeft, setFrozenTimeLeft] = useState<number | null>(null);

  const directions = ["left", "right", "up", "down"];

  // Calculate timer duration based on score
  const getTimerDuration = (currentScore: number) => {
    const baseTime = 15;
    const reduction = Math.floor(currentScore / 5); // Reduce time every 5 rounds
    return Math.max(baseTime - reduction, 5); // Minimum 5 seconds
  };

  // Start a new timer
  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    
    const duration = getTimerDuration(score);
    setTimeLeft(duration);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 0) {
          clearInterval(interval);
          // Time's up - Game Over
          setLives(0); // Set lives to 0 to trigger game over
          playSound('loss');
          setLastResult('loss');
          setResultMessage("Time's up!");
          setShowResult(true);
          setPlayerChoice(null);
          return 0;
        }
        return prev - 0.1; // Update every 100ms for smooth animation
      });
    }, 100);
    
    setTimerInterval(interval);
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Start new timer when round starts
  useEffect(() => {
    if (gameStarted && !isRevealing && lives > 0 && timeLeft === null) {
      startTimer();
    }
  }, [gameStarted, isRevealing, lives, timeLeft]);

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setShowResult(false);
        setPlayerChoice(null);
        setNewLife(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  const checkForPowerUp = (newScore: number) => {
    // Award extra life every 10 rounds
    if (newScore > 0 && newScore % 10 === 0) {
      setLives(prev => Math.min(prev + 1, 3));
      setNewLife(true);
      return true;
    }
    return false;
  };

  const getRandomMessage = (isWin: boolean) => {
    const messages = isWin ? WIN_MESSAGES : LOSS_MESSAGES;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const playSound = (name: 'buttonClick' | 'arrowSelect' | 'win' | 'loss' | 'extraLife' | 'cashoutSuccess') => {
    soundManager.play(name);
  };

  const handleDirectionClick = (direction: string) => {
    if (isRevealing || timeLeft === 0) return;
    
    // Clear current timer
    if (timerInterval) clearInterval(timerInterval);
    
    playSound('arrowSelect');
    setPlayerChoice(direction);
    setIsRevealing(true);
    setShowResult(false);
    setNewLife(false);

    // Update move history
    const newMoves = [...lastMoves, direction].slice(-3);
    setLastMoves(newMoves);
    
    // Check for pattern (3 same moves in a row)
    const isRepeating = newMoves.length === 3 && newMoves.every(move => move === direction);
    if (isRepeating) {
      setIsPatternDetected(true);
    } else if (newMoves[newMoves.length - 1] !== newMoves[newMoves.length - 2]) {
      // Reset pattern detection when player changes direction
      setIsPatternDetected(false);
    }
    
    // Determine computer's move
    let randomDirection;
    if (isPatternDetected) {
      // When pattern is detected, 60% chance to match player's move
      randomDirection = Math.random() < 0.6 ? direction : directions[Math.floor(Math.random() * directions.length)];
    } else {
      randomDirection = directions[Math.floor(Math.random() * directions.length)];
    }
    
    setTimeout(() => {
      setComputerChoice(randomDirection);
      
      const isLoss = direction === randomDirection;
      if (isLoss) {
        playSound('loss');
        if (lives <= 1) {
          // If this was the last life, game over
          setLives(0);
        } else {
          setLives((prev) => prev - 1);
        }
        setLastResult('loss');
        setResultMessage(getRandomMessage(false));
      } else {
        const newScore = score + 1;
        setScore(newScore);
        setLastResult('win');
        const gotPowerUp = checkForPowerUp(newScore);
        if (gotPowerUp) {
          playSound('extraLife');
          setResultMessage("Extra Life! 🎉");
        } else {
          playSound('win');
          setResultMessage(getRandomMessage(true));
        }
      }
      
      setShowResult(true);
      setIsRevealing(false);
      setTimeLeft(null); // Reset timer for next round
    }, 500);
  };

  // Calculate current multiplier based on score
  const getCurrentMultiplier = (currentScore: number) => {
    // Calculate how many 10-round increments have been completed
    const incrementLevel = Math.floor(currentScore / 10);
    // Base increment is 0.15, add 0.10 for each completed 10-round increment
    const currentIncrement = 0.15 + (incrementLevel * 0.10);
    // Start at 0.15x and add the current increment for each round
    return 0.15 + (currentScore * currentIncrement);
  };

  // Calculate potential win based on current bet and multiplier
  const getPotentialWin = () => {
    if (!currentBet) return 0;
    return currentBet * getCurrentMultiplier(score);
  };

  const handlePlaceBet = (amount: number) => {
    if (!user || !userData) return;

    setUserData({
      ...userData,
      wallet: userData.wallet - amount
    });
    setCurrentBet(amount);
    setShowBettingModal(false);
    setIsGameActive(true);
    setGameStarted(true);
    setLives(3);
    setScore(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setLastMoves([]);
    setIsPatternDetected(false);
    if (timerInterval) clearInterval(timerInterval);
    setTimeLeft(null);
    setFrozenTimeLeft(null); // Reset frozen timer
  };

  const handleCashout = async () => {
    if (!user || !userData || isCashingOut) return;

    // Set loading state
    setIsCashingOut(true);

    // Store the final time value and clear the timer
    setFrozenTimeLeft(timeLeft);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setTimeLeft(null);
    }

    try {
      const winAmount = getPotentialWin();
      const newBalance = userData.wallet + winAmount;
      
      setUserData({
        ...userData,
        wallet: newBalance
      });
      
      // Update user stats with win
      await updateUserStats(
        user.uid,
        score,
        getCurrentMultiplier(score),
        winAmount,
        false // Indicate this was a win
      );

      setCashedOutAmount(winAmount);
      setShowCashoutSuccess(true);
      playSound('cashoutSuccess');
    } catch (error) {
      console.error('Error cashing out:', error);
    } finally {
      setIsCashingOut(false);
    }
  };

  const handleDeposit = (amount: number) => {
    if (!user || !userData) return;
    
    setUserData({
      ...userData,
      wallet: userData.wallet + amount
    });
    playSound('cashoutSuccess');
  };

  // Handle returning home after cashout
  const handleCashoutComplete = () => {
    setCurrentBet(null);
    setIsGameActive(false);
    setGameStarted(false);
    setLives(3);
    setScore(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimeLeft(null);
    setShowCashoutSuccess(false);
  };

  // Modify startGame to handle betting flow
  const startGame = () => {
    if (!isGameActive) {
      setShowBettingModal(true);
      return;
    }
  };

  // Modify game over handling
  useEffect(() => {
    if (lives === 0 && isGameActive) {
      // Update user stats for lost games
      if (user && userData) {
        updateUserStats(
          user.uid,
          score,
          getCurrentMultiplier(score),
          0, // No win amount for losses
          true // Indicate this was a loss
        );
      }
      setIsGameActive(false);
    }
  }, [lives, isGameActive, user, userData, score]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMute(newMuted);
  };

  const INSTRUCTION_CARDS = [
    {
      icon: FaHandPointRight,
      title: "Choose Your Direction",
      description: "Click an arrow to point in that direction"
    },
    {
      icon: FaGamepad,
      title: "Watch the Computer",
      description: "The computer will randomly choose a direction"
    },
    {
      icon: Heart,
      title: "Keep Your Lives",
      description: "You lose a life if you match the computer's direction"
    },
    {
      icon: Coins,
      title: "Betting System",
      description: "Place bets and win more as your streak grows. Starting at 0.15×, multiplier increases every round"
    },
    {
      icon: FaTrophy,
      title: "Score Points",
      description: "Survive as many rounds as you can to get a high score"
    }
  ];

  const [currentCard, setCurrentCard] = useState(0);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % INSTRUCTION_CARDS.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + INSTRUCTION_CARDS.length) % INSTRUCTION_CARDS.length);
  };

  // Update wallet in Firebase when it changes
  useEffect(() => {
    if (user && userData) {
      updateUserWallet(user.uid, userData.wallet);
    }
  }, [user, userData?.wallet]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex flex-col items-center justify-center p-4 sm:p-8">
        <Navigation visible={true} />

        {showSignInModal && (
          <SignInModal 
            onSignIn={() => setShowSignInModal(false)}
            isNewUser={isNewUser}
            onUsernameSubmit={handleUsernameSubmit}
          />
        )}

        {showBettingModal && userData && (
          <BettingModal
            maxBet={userData.wallet}
            onPlaceBet={handlePlaceBet}
            onCancel={() => setShowBettingModal(false)}
          />
        )}

        <UserAvatar isMuted={isMuted} onToggleMute={toggleMute} />

        <div className="fixed top-4 sm:top-8 left-4 sm:left-8">
          <WalletDisplay 
            balance={userData?.wallet ?? 0}
            onDeposit={handleDeposit}
          />
        </div>

        <div className="max-w-2xl w-full space-y-8 sm:space-y-12 text-center">
          {/* Title */}
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight">
            Poynt
          </h1>

          {/* Instructions */}
          <div className="space-y-4 sm:space-y-6">
            <p className="text-lg sm:text-xl">Don't point in the same direction as the computer!</p>
            <div className="relative">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <div key={currentCard} className="animate-slide-in">
                    <InstructionCard
                      icon={INSTRUCTION_CARDS[currentCard].icon}
                      title={INSTRUCTION_CARDS[currentCard].title}
                      description={INSTRUCTION_CARDS[currentCard].description}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Arrows - Desktop */}
              <div className="hidden sm:block">
                <button
                  onClick={prevCard}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12
                    p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextCard}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12
                    p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Controls - Mobile */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={prevCard}
                  className="sm:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Pagination Dots */}
                <div className="flex gap-2">
                  {INSTRUCTION_CARDS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCard(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentCard === index ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextCard}
                  className="sm:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={() => {
              startGame();
              playSound('buttonClick');
            }}
            className="
              w-36 h-36 sm:w-48 sm:h-48
              mx-auto
              rounded-full
              bg-white text-[#161616]
              text-2xl sm:text-3xl font-black
              transition-all duration-200
              hover:scale-105 hover:shadow-lg hover:shadow-white/20
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#161616]
            "
          >
            PLAY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col items-center p-4 sm:p-8">
      <Navigation visible={!isGameActive} />

      <UserAvatar isMuted={isMuted} onToggleMute={toggleMute} />

      <div className="fixed top-4 sm:top-8 left-4 sm:left-8">
        <WalletDisplay 
          balance={userData?.wallet ?? 0}
          currentBet={currentBet ?? undefined}
          potentialWin={currentBet ? getPotentialWin() : undefined}
          onDeposit={handleDeposit}
        />
      </div>

      {/* Header Section */}
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 sm:mb-8 mt-10 sm:mt-8">Poynt</h1>

      {/* Game Stats */}
      <div className="flex gap-3 sm:gap-8 mb-3 sm:mb-4">
        <div className="flex items-center text-lg sm:text-2xl gap-1.5 sm:gap-2">
          <span>Lives:</span>
          <div className="flex gap-0.5 sm:gap-1">
            {[...Array(lives)].map((_, i) => (
              <Heart 
                key={i} 
                className={`
                  w-5 h-5 sm:w-8 sm:h-8 fill-current animate-heart
                  ${newLife && i === lives - 1 ? 'animate-pop' : ''}
                `}
                strokeWidth={0}
              />
            ))}
          </div>
        </div>
        <div className="text-lg sm:text-2xl">
          <span>Score: {score.toLocaleString()}</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full max-w-md h-1.5 sm:h-2 bg-white/20 rounded-full mb-3 sm:mb-4 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-100 rounded-full"
          style={{ 
            width: `${frozenTimeLeft !== null ? (frozenTimeLeft / getTimerDuration(score)) * 100 : timeLeft === null ? 100 : (timeLeft / getTimerDuration(score)) * 100}%`,
            backgroundColor: timeLeft !== null && timeLeft <= 3 ? '#ef4444' : timeLeft !== null && timeLeft <= 5 ? '#eab308' : '#ffffff'
          }}
        />
      </div>

      {/* Result Message */}
      <div className="h-6 sm:h-8 flex items-center justify-center mb-1 sm:mb-4">
        {showResult && (
          <div
            className={`
              text-xl sm:text-2xl font-bold whitespace-nowrap
              animate-quick-bounce
              ${lastResult === 'win' ? 'text-green-500' : 'text-red-500'}
            `}
          >
            {resultMessage}
          </div>
        )}
      </div>

      {/* Main Game Container */}
      <div className="relative w-full max-w-4xl flex flex-col sm:flex-row justify-center">
        {/* Multiplier (Mobile: Above game area, Desktop: Left side) */}
        <MultiplierDisplay 
          multiplier={getCurrentMultiplier(score)}
          isActive={!isRevealing && lives > 0}
        />

        {/* Centered Game Area */}
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          {/* Computer's Choice Display */}
          <div 
            className={`
              h-28 w-28 sm:h-36 sm:w-36
              flex items-center justify-center 
              text-4xl border-4 border-white rounded-xl
              transition-all duration-500
              ${isRevealing ? 'scale-110 border-yellow-400 shadow-lg shadow-yellow-400/20' : ''}
              ${showResult ? lastResult === 'win' ? 'border-green-500' : 'border-red-500' : ''}
            `}
          >
            {computerChoice ? (
              <div className={`
                transition-all duration-300
                ${isRevealing ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}
              `}>
                <DirectionIcon direction={computerChoice} />
              </div>
            ) : (
              <span className={`
                transition-opacity duration-300 text-5xl
                ${isRevealing ? 'opacity-0' : 'opacity-100'}
              `}>
                ?
              </span>
            )}
          </div>

          {/* Player's Choice Buttons */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {directions.map((direction) => (
              <button
                key={direction}
                onClick={() => handleDirectionClick(direction)}
                disabled={isRevealing}
                className={`
                  h-28 w-28 sm:h-36 sm:w-36
                  border-4 border-white rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  ${isRevealing ? 'opacity-50 cursor-not-allowed' : ''}
                  ${playerChoice === direction 
                    ? 'bg-white text-[#161616] scale-95' 
                    : 'hover:bg-white/10 hover:scale-105'
                  }
                  ${showResult && playerChoice === direction 
                    ? lastResult === 'win' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-red-500 bg-red-500/10' 
                    : ''
                  }
                `}
              >
                <DirectionIcon direction={direction} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cashout Button */}
      {isGameActive && (
        <div className="mt-6 sm:mt-8 w-full max-w-[324px]">
          <CashoutButton
            onCashout={handleCashout}
            amount={getPotentialWin()}
            disabled={isRevealing}
            isLoading={isCashingOut}
          />
        </div>
      )}

      {/* Game Over State */}
      {lives === 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center animate-fade-in">
          <div className="bg-[#161616] p-8 rounded-lg text-center animate-scale-in">
            <h2 className="text-3xl font-black mb-4">Game Over!</h2>
            <p className="text-xl mb-2">You survived {score.toLocaleString()} rounds</p>
            {currentBet !== null && currentBet > 0 && (
              <p className="text-red-500 text-lg mb-6">Lost bet: ${currentBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            )}
            <button
              onClick={() => {
                setGameStarted(false);
                setCurrentBet(null);
                playSound('buttonClick');
              }}
              className="bg-white text-[#161616] px-8 py-3 rounded-lg text-lg font-bold hover:bg-white/90 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      )}

      {/* Cashout Success State */}
      {showCashoutSuccess && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center animate-fade-in">
          <div className="bg-[#161616] p-8 rounded-lg text-center animate-scale-in">
            <h2 className="text-3xl font-black mb-4">Cashed Out!</h2>
            <p className="text-xl mb-2">You survived {score.toLocaleString()} rounds</p>
            <p className="text-green-500 text-2xl font-bold mb-6">
              Won: ${cashedOutAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <button
              onClick={handleCashoutComplete}
              className="bg-white text-[#161616] px-8 py-3 rounded-lg text-lg font-bold hover:bg-white/90 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
