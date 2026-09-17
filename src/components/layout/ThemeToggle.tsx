import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore(s => ({ theme: s.theme, toggleTheme: s.toggleTheme }));
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative inline-flex h-8 w-14 min-w-[56px] min-h-[32px] items-center rounded-full border transition-colors',
        'surface-border',
        isDark ? 'bg-crimson-primary/20' : 'bg-royal-primary/10',
      )}
    >
      <span
        className={cn(
          'absolute flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md transition-all top-1',
          isDark ? 'left-7 bg-crimson-primary text-white' : 'left-1 bg-royal-primary text-white',
        )}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
}
