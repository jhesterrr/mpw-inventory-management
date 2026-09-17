import React from 'react';
import { Search, Sparkles, Command } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import CartBadge from './CartBadge';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

export default function HeaderBar() {
  const { currentUser, searchTerm, setSearchTerm, activePage } = useAppStore(s => ({
    currentUser: s.currentUser,
    searchTerm: s.searchTerm,
    setSearchTerm: s.setSearchTerm,
    activePage: s.activePage,
  }));

  const firstName = currentUser?.name?.split(' ')[0] ?? 'User';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 backdrop-blur-xl border-b transition-all duration-300',
        'bg-white/80 dark:bg-[#141519]/85',
        'border-[#EFECE6] dark:border-white/10',
        'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.4)]',
      )}
    >
      <div className="flex items-center gap-3 px-4 md:px-7 py-3 md:py-4 h-[72px] max-w-[1600px] mx-auto w-full">
        {/* Left: User Welcome & Telemetry greeting */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold truncate tracking-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-primary via-royal-highlight to-[#D4AF37] dark:from-[#F5DEB3] dark:via-[#D4AF37] dark:to-rose-300">
                {firstName}
              </span>
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-royal-primary/10 dark:bg-white/10 text-royal-primary dark:text-[#E8D499] border border-royal-primary/20 dark:border-white/10">
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              Enterprise Mode
            </span>
          </div>
          <p className="hidden sm:block text-xs text-muted truncate font-medium mt-0.5">
            Real-time telemetry, automated requisitions, and audit-ready tracking.
          </p>
        </div>

        {/* Center: Global Quick-Search with shortcut prompt */}
        <div className="hidden lg:flex items-center relative max-w-md w-full mx-3 group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-royal-primary dark:group-focus-within:text-[#D4AF37] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Quick search items, SKUs, or requisitions..."
            className={cn(
              'w-full h-11 pl-11 pr-12 rounded-2xl text-xs font-medium transition-all outline-none',
              'bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]',
              'border border-black/5 dark:border-white/10',
              'focus:bg-white dark:focus:bg-[#1A1C22] focus:border-royal-primary/40 dark:focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-royal-primary/20 dark:focus:ring-[#D4AF37]/20',
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-mono text-muted select-none pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="lg:hidden">
            <button
              type="button"
              className="w-10 h-10 rounded-xl border surface surface-border flex items-center justify-center hover:border-royal-primary/40 text-muted hover:text-[var(--text)] transition-colors"
              aria-label="Search"
              onClick={() => {
                const input = document.getElementById('mobile-search-focus');
                input?.focus();
              }}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          <CartBadge />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
