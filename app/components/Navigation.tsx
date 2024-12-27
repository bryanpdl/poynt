import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy } from 'lucide-react';

interface NavigationProps {
  visible?: boolean;
}

export default function Navigation({ visible = true }: NavigationProps) {
  const pathname = usePathname();

  if (!visible) return null;

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center h-[52px] px-4 sm:px-0">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link 
          href="/"
          className={`text-base sm:text-lg font-bold transition-colors ${
            pathname === '/' ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Play
        </Link>
        <Link 
          href="/leaderboards"
          className={`flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-bold transition-colors ${
            pathname === '/leaderboards' ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Leaderboards</span>
          <span className="xs:hidden">Stats</span>
        </Link>
      </div>
    </nav>
  );
} 