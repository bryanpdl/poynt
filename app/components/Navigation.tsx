'use client';
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
    <nav className="fixed top-4 sm:top-8 left-[140px] sm:left-[220px] flex items-center gap-3 sm:gap-6 text-sm sm:text-base">
      <Link
        href="/"
        className={`
          px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors
          ${pathname === '/' ? 'bg-white/10' : 'hover:bg-white/5'}
        `}
      >
        Play
      </Link>
      <Link
        href="/leaderboards"
        className={`
          px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2
          ${pathname === '/leaderboards' ? 'bg-white/10' : 'hover:bg-white/5'}
        `}
      >
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
        Stats
      </Link>
    </nav>
  );
} 