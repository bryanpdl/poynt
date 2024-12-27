'use client';
import { useState } from 'react';
import { User, LogOut, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/navigation';

interface UserAvatarProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function UserAvatar({ isMuted, onToggleMute }: UserAvatarProps) {
  const { userData } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed top-4 sm:top-8 right-4 sm:right-8 flex items-center gap-2 sm:gap-4">
      <button
        onClick={onToggleMute}
        className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors h-[36px] w-[36px] sm:h-[52px] sm:w-[52px] flex items-center justify-center"
      >
        {isMuted ? 
          <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" /> : 
          <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />
        }
      </button>

      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors h-[36px] w-[36px] sm:h-[52px] sm:w-[52px] flex items-center justify-center"
        >
          <User className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-1 sm:mt-2 w-44 sm:w-48 bg-[#242424] rounded-lg shadow-lg py-1 border border-white/10">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-white/10">
              <div className="font-bold text-xs sm:text-base truncate">
                {userData?.displayName || 'Anonymous'}
              </div>
              <div className="text-[10px] sm:text-sm text-white/50 truncate">
                {userData?.email}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left flex items-center gap-1.5 sm:gap-2 hover:bg-white/5 transition-colors text-red-400 text-xs sm:text-base"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 