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
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed top-4 sm:top-8 right-4 sm:right-8 flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" />
        ) : (
          <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />
        )}
      </button>

      {/* User Avatar */}
      {userData && (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <User className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-lg shadow-xl animate-fade-in">
              <div className="p-3 border-b border-white/10">
                <div className="text-sm font-medium">{userData.username || 'Anonymous'}</div>
                <div className="text-xs text-gray-400">{userData.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 p-3 text-sm text-left hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 