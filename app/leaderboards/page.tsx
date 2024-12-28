'use client';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Navigation from '../components/Navigation';
import WalletDisplay from '../components/WalletDisplay';
import UserAvatar from '../components/UserAvatar';
import { useUser } from '../contexts/UserContext';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  stats: {
    highestScore: number;
    highestMultiplier: number;
    totalGamesPlayed: number;
    totalWinnings: number;
  };
}

export default function Leaderboards() {
  const { userData, user, setUserData, isInitializing } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('stats.highestScore', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      
      const entries: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          username: data.username || 'Anonymous',
          stats: data.stats
        });
      });
      
      setLeaderboardData(entries);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitializing && user) {
      fetchLeaderboard();
    }
  }, [user, isInitializing]);

  const handleDeposit = (amount: number) => {
    if (!user || !userData) return;
    
    setUserData({
      ...userData,
      wallet: userData.wallet + amount
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <Navigation visible={true} />
      
      <div className="fixed top-8 left-8">
        <WalletDisplay 
          balance={userData?.wallet ?? 0}
          onDeposit={handleDeposit}
        />
      </div>

      <UserAvatar isMuted={isMuted} onToggleMute={toggleMute} />

      <div className="max-w-6xl mx-auto px-4 py-32">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8" />
          <h1 className="text-4xl font-black">Leaderboard</h1>
        </div>
        
        <div className="bg-white/5 rounded-xl p-6">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-white/50">
                Loading leaderboard...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-400">
                {error}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-4 font-bold">Rank</th>
                    <th className="pb-4 font-bold">Player</th>
                    <th className="pb-4 font-bold text-right">Highest Score</th>
                    <th className="pb-4 font-bold text-right">Games Played</th>
                    <th className="pb-4 font-bold text-right">Best Multiplier</th>
                    <th className="pb-4 font-bold text-right">Total Winnings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-4 font-bold">
                        {index === 0 ? (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Medal className="w-5 h-5" />
                            <span>1st</span>
                          </div>
                        ) : index === 1 ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Medal className="w-5 h-5" />
                            <span>2nd</span>
                          </div>
                        ) : index === 2 ? (
                          <div className="flex items-center gap-2 text-amber-700">
                            <Medal className="w-5 h-5" />
                            <span>3rd</span>
                          </div>
                        ) : (
                          `#${index + 1}`
                        )}
                      </td>
                      <td className="py-4">{entry.username}</td>
                      <td className="py-4 text-right">{entry.stats.highestScore.toLocaleString()}</td>
                      <td className="py-4 text-right">{entry.stats.totalGamesPlayed.toLocaleString()}</td>
                      <td className="py-4 text-right">{entry.stats.highestMultiplier.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×</td>
                      <td className="py-4 text-right text-green-500">${entry.stats.totalWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {leaderboardData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/50">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 