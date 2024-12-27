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
    <div className="fixed top-8 right-8 flex items-center gap-4">
      <button
        onClick={onToggleMute}
        className="p-2 hover:bg-white/10 rounded-full transition-colors h-[52px] w-[52px] flex items-center justify-center"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors h-[52px] w-[52px] flex items-center justify-center"
        >
          <User className="w-6 h-6" />
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-[#242424] rounded-lg shadow-lg py-1 border border-white/10">
            <div className="px-4 py-2 border-b border-white/10">
              <div className="font-bold truncate">
                {userData?.displayName || 'Anonymous'}
              </div>
              <div className="text-sm text-white/50 truncate">
                {userData?.email}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-white/5 transition-colors text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 